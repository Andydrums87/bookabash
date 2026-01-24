// src/app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Helper function to get supplier contact details
async function getSupplierContactDetails(supplierId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .select('id, data')
      .eq('id', supplierId)
      .single()

    if (error) {
      console.error('Error fetching supplier details:', error)
      return null
    }

    // Extract email, phone and name from suppliers.data JSONB field
    const supplierData = data.data || {}
    return {
      email: supplierData.owner?.email || supplierData.email,
      phone: supplierData.owner?.phone || supplierData.phone,
      name: supplierData.owner?.name || supplierData.name
    }
  } catch (error) {
    console.error('Error in getSupplierContactDetails:', error)
    return null
  }
}

// Helper function to calculate supplier earnings (after platform fee)
function calculateSupplierEarning(totalPrice) {
  const platformFee = 0.15 // 15% platform fee
  return Math.round(totalPrice * (1 - platformFee) * 100) / 100
}

// Main payment processing function (idempotent, uses transaction via RPC)
async function processPaymentSuccess(paymentIntent) {
  console.log('🚀 STARTING processPaymentSuccess function')
  console.log('💰 Payment Intent ID:', paymentIntent.id)
  console.log('💵 Amount:', paymentIntent.amount / 100, 'GBP')

  const partyId = paymentIntent.metadata.party_id

  console.log('🔍 Payment Intent Metadata:', paymentIntent.metadata)

  if (!partyId || partyId === 'unknown') {
    console.error('❌ Invalid party_id:', partyId)
    throw new Error('Invalid party_id in payment intent metadata')
  }

  console.log(`🔄 Processing payment for party ${partyId}`)

  // Step 1: Get party details including enquiries (needed for RPC params and emails)
  const { data: party, error: partyError } = await supabaseAdmin
    .from('parties')
    .select('*, enquiries(*)')
    .eq('id', partyId)
    .single()

  if (partyError) {
    throw new Error(`Failed to fetch party with enquiries: ${partyError.message}`)
  }

  // Step 2: Get user details for emails
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', party.user_id)
    .single()

  if (userError) {
    console.warn('Failed to fetch user details:', userError)
  }

  // Step 3: Calculate totals
  const totalAmount = paymentIntent.amount / 100 // Convert from pence to pounds
  const remainingBalance = parseFloat(paymentIntent.metadata.remaining_balance || '0')

  // Step 4: Prepare enquiries data for RPC
  let enquiriesToCreate = []
  let enquiryIdsToUpdate = []
  let enquiries = party.enquiries || []

  if (enquiries.length === 0) {
    // No existing enquiries - prepare to create from party plan
    const partyPlan = party.party_plan || {}
    console.log('📦 Party plan categories:', Object.keys(partyPlan))

    for (const [category, supplier] of Object.entries(partyPlan)) {
      if (!supplier || typeof supplier !== 'object' || ['addons', 'einvites'].includes(category)) {
        continue
      }

      if (!supplier.id || supplier.id === 'null' || supplier.id === null) {
        console.warn(`⚠️  Skipping ${category} - no valid supplier ID`)
        continue
      }

      console.log(`✅ Adding enquiry for ${category} - supplier ${supplier.id}`)
      console.log(`📦 Supplier data for ${category}:`, JSON.stringify({
        packageId: supplier.packageId,
        packageDataId: supplier.packageData?.id,
        packageDataName: supplier.packageData?.name,
        hasCakeCustomization: !!supplier.packageData?.cakeCustomization,
        cakeCustomization: supplier.packageData?.cakeCustomization
      }, null, 2))

      // Build addon_details with cake customization if present
      const addonDetailsObj = {}
      if (supplier.packageData?.cakeCustomization) {
        addonDetailsObj.cakeCustomization = supplier.packageData.cakeCustomization
        console.log(`🎂 Including cake customization for ${category}`)
      }

      const enquiryData = {
        supplier_id: supplier.id,
        supplier_category: category,
        message: 'BOOKING CONFIRMED - Customer has completed FULL payment',
        quoted_price: supplier.price || 0,
        package_id: supplier.packageId || supplier.packageData?.id || supplier.packageData?.name || null,
        addon_details: Object.keys(addonDetailsObj).length > 0 ? addonDetailsObj : null
      }
      console.log(`📋 Enquiry data for ${category}:`, JSON.stringify(enquiryData, null, 2))
      enquiriesToCreate.push(enquiryData)
    }

    console.log(`📝 Prepared ${enquiriesToCreate.length} enquiries to create`)
  } else {
    // Existing enquiries - collect IDs to update (excluding e-invites)
    enquiryIdsToUpdate = enquiries
      .filter(e => e.supplier_category !== 'einvites')
      .map(e => e.id)

    console.log(`📝 Found ${enquiryIdsToUpdate.length} enquiries to update`)
  }

  // Step 5: Execute atomic transaction via RPC
  console.log('🔄 Executing atomic payment processing transaction...')

  const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('process_payment_success', {
    p_party_id: partyId,
    p_payment_intent_id: paymentIntent.id,
    p_total_amount: totalAmount,
    p_remaining_balance: remainingBalance,
    p_enquiries_to_create: enquiriesToCreate,
    p_enquiry_ids_to_update: enquiryIdsToUpdate
  })

  if (rpcError) {
    console.error('❌ Transaction failed:', rpcError)
    throw new Error(`Payment transaction failed: ${rpcError.message}`)
  }

  console.log('✅ Transaction completed:', rpcResult)

  // Check if this was a duplicate
  if (rpcResult.duplicate) {
    console.log(`✅ Payment ${paymentIntent.id} already processed for party ${partyId}. Skipping duplicate.`)
    return { success: true, duplicate: true }
  }

  // Step 6: Fetch the created/updated enquiries for email sending
  const { data: updatedEnquiries, error: fetchEnquiriesError } = await supabaseAdmin
    .from('enquiries')
    .select('*')
    .eq('party_id', partyId)

  if (fetchEnquiriesError) {
    console.warn('Failed to fetch enquiries for emails:', fetchEnquiriesError)
  } else {
    enquiries = updatedEnquiries || []
  }

  // Step 7: Send emails (must await to ensure completion on serverless)
  console.log('📧 Sending emails...')

  try {
    await sendEmailsAsync(enquiries, party, user, totalAmount, paymentIntent.id, paymentIntent.metadata)
    console.log('📧 All emails sent successfully')
  } catch (error) {
    console.error('Error in email sending:', error)
    // Don't throw - payment was successful, just log the email error
  }

  console.log(`✅ Payment processing complete for party ${partyId}`)
  return { success: true, duplicate: false }
}

// Send emails asynchronously without blocking webhook response
async function sendEmailsAsync(enquiries, party, user, totalAmount, paymentIntentId, paymentMetadata = {}) {
  // Step 1: Send supplier notification emails
  console.log('📧 Sending supplier notification emails...')

  for (const enquiry of enquiries) {
    if (enquiry.supplier_category === 'einvites') {
      continue // Skip e-invites
    }

    try {
      const supplierDetails = await getSupplierContactDetails(enquiry.supplier_id)

      if (!supplierDetails || !supplierDetails.email) {
        console.warn(`No email found for supplier ${enquiry.supplier_id}`)
        continue
      }

      const paymentType = 'full_payment' // We now take full payment for all suppliers
      const supplierEarning = calculateSupplierEarning(enquiry.quoted_price || 0)

      // Check if this is a cake order for quick status update link
      const isCakeOrder = ['cakes', 'Cakes', 'cake', 'Cake'].includes(enquiry.supplier_category)
      const statusUpdateLink = isCakeOrder && enquiry.status_update_token
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://partysnap.co.uk'}/order-status/${enquiry.status_update_token}`
        : ''

      const emailPayload = {
        supplierEmail: supplierDetails.email,
        supplierName: supplierDetails.name || 'Supplier',
        customerName: user ? `${user.first_name} ${user.last_name}`.trim() : 'Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        childName: party.child_name,
        theme: party.theme,
        partyDate: party.party_date,
        partyLocation: party.location,
        guestCount: party.guest_count,
        serviceType: enquiry.supplier_category,
        depositAmount: enquiry.quoted_price || 0,
        supplierEarning: supplierEarning,
        paymentType: paymentType,
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://partysnap.co.uk'}/suppliers/dashboard`,
        statusUpdateLink: statusUpdateLink,
        isCakeOrder: isCakeOrder
      }

      const emailUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/supplier-notification`
      console.log(`📧 Sending email to ${supplierDetails.name} via ${emailUrl}`)

      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.warn(`Failed to send email to ${supplierDetails.name}: ${emailResponse.status} ${errorText}`)
      } else {
        console.log(`✅ Email sent to ${supplierDetails.name}`)
      }

      // Also send SMS to supplier if they have a phone number
      if (supplierDetails.phone) {
        try {
          const smsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/send-sms-notification`
          const smsPayload = {
            phoneNumber: supplierDetails.phone,
            supplierName: supplierDetails.name || 'Supplier',
            customerName: user ? `${user.first_name} ${user.last_name}`.trim() : 'Customer',
            childName: party.child_name,
            theme: party.theme,
            partyDate: party.party_date,
            depositAmount: enquiry.quoted_price || 0,
            supplierEarning: supplierEarning,
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://partysnap.co.uk'}/suppliers/dashboard`,
            statusUpdateLink: statusUpdateLink,
            isCakeOrder: isCakeOrder
          }

          console.log(`📱 Sending SMS to ${supplierDetails.name} at ${supplierDetails.phone}`)
          const smsResponse = await fetch(smsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(smsPayload)
          })

          if (!smsResponse.ok) {
            const smsError = await smsResponse.text()
            console.warn(`Failed to send SMS to ${supplierDetails.name}: ${smsResponse.status} ${smsError}`)
          } else {
            console.log(`✅ SMS sent to ${supplierDetails.name}`)
          }
        } catch (smsError) {
          console.warn(`Error sending SMS for enquiry ${enquiry.id}:`, smsError.message)
        }
      }
    } catch (emailError) {
      console.warn(`Error sending email for enquiry ${enquiry.id}:`, emailError.message)
    }
  }

  // Step 2: Send customer confirmation email
  try {
    if (user?.email) {
      const partyPlan = party.party_plan || {}
      const services = []
      const addons = []

      // Check if this is a single supplier addition (not full party checkout)
      const isSingleSupplierAddition = paymentMetadata.supplier_type && paymentMetadata.supplier_name

      if (isSingleSupplierAddition) {
        // Only include the supplier that was just added
        console.log(`📧 Single supplier addition: ${paymentMetadata.supplier_name} (${paymentMetadata.supplier_type})`)
        const supplierType = paymentMetadata.supplier_type
        const supplier = partyPlan[supplierType]

        if (supplier && supplier.id) {
          services.push({
            name: supplier.name || paymentMetadata.supplier_name,
            price: supplier.totalPrice || supplier.price || totalAmount,
            category: supplierType
          })
        } else {
          // Fallback to metadata if supplier not found in plan
          services.push({
            name: paymentMetadata.supplier_name,
            price: totalAmount,
            category: supplierType
          })
        }
      } else {
        // Full party checkout - include all suppliers
        for (const [category, supplier] of Object.entries(partyPlan)) {
          if (!supplier || typeof supplier !== 'object') continue

          if (category === 'addons' && Array.isArray(supplier)) {
            addons.push(...supplier)
          } else if (category !== 'einvites' && supplier.id) {
            services.push({
              name: supplier.name || category,
              price: supplier.totalPrice || supplier.price || 0,
              category: category
            })
          }
        }
      }

      const customerEmailPayload = {
        customerEmail: user.email,
        customerName: `${user.first_name} ${user.last_name}`.trim(),
        childName: party.child_name,
        childAge: party.child_age || '5',
        theme: party.theme,
        partyDate: party.party_date,
        partyTime: party.party_time || '14:00',
        location: party.location,
        guestCount: party.guest_count,
        totalPaidToday: totalAmount.toFixed(2),
        remainingBalance: 0,
        paymentIntentId: paymentIntentId,
        paymentMethod: 'Card',
        services: services,
        addons: isSingleSupplierAddition ? [] : addons, // Don't show all addons for single supplier addition
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://partysnap.co.uk'}/dashboard`
      }

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/payment-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerEmailPayload)
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.warn(`Failed to send customer confirmation email: ${emailResponse.status} ${errorText}`)
      } else {
        console.log('✅ Customer confirmation email sent')
      }
    }
  } catch (emailError) {
    console.warn('Error sending customer confirmation:', emailError.message)
  }
}

export async function POST(request) {
  console.log('🔔 WEBHOOK ENDPOINT HIT - Starting to process request...')

  try {
    const body = await request.text()
    console.log('📥 Request body received, length:', body.length)

    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    console.log('🔑 Stripe signature:', signature ? 'Present' : 'MISSING')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    console.log(`📨 Received webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        const paymentType = paymentIntent.metadata?.payment_type
        const paymentMethodType = paymentIntent.payment_method_types?.[0] || 'unknown'

        console.log('✅ Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          party_id: paymentIntent.metadata.party_id,
          payment_type: paymentType,
          payment_method: paymentIntent.payment_method_types,
          payment_method_type: paymentMethodType,
          is_klarna: paymentMethodType === 'klarna'
        })

        // Skip full processing for booking upgrades - these are just additional payments
        // for existing bookings, not new bookings that need confirmation emails
        if (paymentType === 'booking_upgrade') {
          console.log('💳 Booking upgrade payment - skipping confirmation emails')

          // Just record the payment in the database
          try {
            const partyId = paymentIntent.metadata.party_id
            if (partyId && partyId !== 'unknown') {
              await supabaseAdmin
                .from('payments')
                .insert({
                  party_id: partyId,
                  stripe_payment_intent_id: paymentIntent.id,
                  amount: paymentIntent.amount / 100,
                  currency: 'gbp',
                  status: 'succeeded',
                  payment_type: 'upgrade',
                  metadata: {
                    supplier_type: paymentIntent.metadata.supplier_type,
                    supplier_name: paymentIntent.metadata.supplier_name,
                    upgrade_amount: paymentIntent.metadata.upgrade_amount
                  }
                })

              // Update the party's total_paid amount
              const { data: party } = await supabaseAdmin
                .from('parties')
                .select('total_paid')
                .eq('id', partyId)
                .single()

              if (party) {
                const newTotal = (party.total_paid || 0) + (paymentIntent.amount / 100)
                await supabaseAdmin
                  .from('parties')
                  .update({
                    total_paid: newTotal,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', partyId)
              }

              console.log('✅ Upgrade payment recorded for party:', partyId)
            }
          } catch (upgradeError) {
            console.warn('⚠️ Failed to record upgrade payment:', upgradeError)
          }

          break
        }

        try {
          const result = await processPaymentSuccess(paymentIntent)

          if (result.duplicate) {
            console.log('✅ Duplicate payment webhook handled gracefully')
          } else {
            console.log('✅ Payment processing completed successfully')
          }
        } catch (processingError) {
          console.error('❌ Error processing payment:', processingError)
          console.error('❌ Error stack:', processingError.stack)
          console.error('❌ Payment Intent ID:', paymentIntent.id)
          console.error('❌ Party ID:', paymentIntent.metadata.party_id)

          // Still return 200 to Stripe to prevent retries, but log the error
          // You might want to implement a dead letter queue here for manual review
          return NextResponse.json({
            received: true,
            error: processingError.message
          })
        }

        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        const errorMessage = failedPayment.last_payment_error?.message
        console.log('❌ Payment failed:', {
          id: failedPayment.id,
          party_id: failedPayment.metadata.party_id,
          error: errorMessage
        })

        // Update party to mark payment as failed
        if (failedPayment.metadata.party_id && failedPayment.metadata.party_id !== 'unknown') {
          await supabaseAdmin
            .from('parties')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', failedPayment.metadata.party_id)

          // Log the error for debugging
          console.error('💳 Payment error details:', errorMessage)
        }

        break

      case 'payment_intent.processing':
        const processingPayment = event.data.object
        console.log('⏳ Payment processing:', {
          id: processingPayment.id,
          party_id: processingPayment.metadata.party_id
        })

        // Update party to show processing status (for Klarna, etc.)
        if (processingPayment.metadata.party_id && processingPayment.metadata.party_id !== 'unknown') {
          await supabaseAdmin
            .from('parties')
            .update({
              payment_status: 'processing',
              updated_at: new Date().toISOString()
            })
            .eq('id', processingPayment.metadata.party_id)
        }

        break

      case 'payment_intent.requires_action':
        const requiresAction = event.data.object
        console.log('🔐 Payment requires action:', {
          id: requiresAction.id,
          party_id: requiresAction.metadata.party_id,
          next_action: requiresAction.next_action?.type
        })

        // Customer needs to complete additional authentication
        // Status tracking is handled client-side

        break

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object
        console.log('🚫 Payment canceled:', {
          id: canceledPayment.id,
          party_id: canceledPayment.metadata.party_id
        })

        // Update party to mark payment as canceled
        if (canceledPayment.metadata.party_id && canceledPayment.metadata.party_id !== 'unknown') {
          await supabaseAdmin
            .from('parties')
            .update({
              payment_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('id', canceledPayment.metadata.party_id)
        }

        break

      case 'charge.refunded':
        const refund = event.data.object
        console.log('💰 Refund processed:', {
          charge_id: refund.id,
          amount: refund.amount_refunded,
          payment_intent: refund.payment_intent
        })

        // Find party by payment_intent_id and update status
        const { data: refundedParty } = await supabaseAdmin
          .from('parties')
          .select('id')
          .eq('payment_intent_id', refund.payment_intent)
          .single()

        if (refundedParty) {
          await supabaseAdmin
            .from('parties')
            .update({
              payment_status: 'refunded',
              refund_amount: refund.amount_refunded / 100,
              updated_at: new Date().toISOString()
            })
            .eq('id', refundedParty.id)

          console.log(`✅ Marked party ${refundedParty.id} as refunded`)
        }

        break

      case 'charge.succeeded':
        // Handle charge.succeeded as backup for Klarna/other redirect-based payments
        const charge = event.data.object
        const chargePaymentIntent = charge.payment_intent

        console.log('💳 Charge succeeded (backup handler):', {
          charge_id: charge.id,
          payment_intent: chargePaymentIntent,
          payment_method_details: charge.payment_method_details?.type,
          amount: charge.amount
        })

        // Only process if this is a Klarna payment (as backup)
        if (charge.payment_method_details?.type === 'klarna') {
          console.log('🔄 Klarna charge detected - checking if payment_intent.succeeded was already processed')

          // Check if party was already updated by payment_intent.succeeded
          if (chargePaymentIntent) {
            const { data: existingParty } = await supabaseAdmin
              .from('parties')
              .select('id, payment_status, payment_intent_id')
              .eq('payment_intent_id', chargePaymentIntent)
              .single()

            if (existingParty && existingParty.payment_status !== 'paid') {
              console.log('⚠️ Klarna payment not yet marked as paid - fetching payment intent to process')

              // Fetch the full payment intent to process
              try {
                const fullPaymentIntent = await stripe.paymentIntents.retrieve(chargePaymentIntent)
                if (fullPaymentIntent.status === 'succeeded') {
                  console.log('🔄 Processing Klarna payment via charge.succeeded backup')
                  await processPaymentSuccess(fullPaymentIntent)
                }
              } catch (retrieveError) {
                console.error('❌ Failed to retrieve payment intent for Klarna backup:', retrieveError)
              }
            } else if (existingParty) {
              console.log('✅ Klarna payment already processed via payment_intent.succeeded')
            }
          }
        }

        break

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing, we need the raw body for signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'