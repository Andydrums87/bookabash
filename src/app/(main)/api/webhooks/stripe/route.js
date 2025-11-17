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

    // Extract email and name from suppliers.data JSONB field
    const supplierData = data.data || {}
    return {
      email: supplierData.owner?.email || supplierData.email,
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

// Main payment processing function (idempotent)
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

  // Step 1: Check if this payment has already been processed (idempotency check)
  const { data: existingParty, error: fetchError } = await supabaseAdmin
    .from('parties')
    .select('payment_intent_id, payment_status, status')
    .eq('id', partyId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch party: ${fetchError.message}`)
  }

  // If this payment intent was already processed, skip duplicate processing
  if (existingParty.payment_intent_id === paymentIntent.id && existingParty.payment_status !== 'pending') {
    console.log(`✅ Payment ${paymentIntent.id} already processed for party ${partyId}. Skipping duplicate.`)
    return { success: true, duplicate: true }
  }

  // Step 2: Get party details including enquiries
  const { data: party, error: partyError } = await supabaseAdmin
    .from('parties')
    .select('*, enquiries(*)')
    .eq('id', partyId)
    .single()

  if (partyError) {
    throw new Error(`Failed to fetch party with enquiries: ${partyError.message}`)
  }

  // Step 3: Get user details for emails
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', party.user_id)
    .single()

  if (userError) {
    console.warn('Failed to fetch user details:', userError)
  }

  // Step 4: Parse payment breakdown from metadata
  // Calculate totals
  const totalAmount = paymentIntent.amount / 100 // Convert from pence to pounds
  const remainingBalance = parseFloat(paymentIntent.metadata.remaining_balance || '0')

  // Step 5: Update party status and payment info
  // Only update columns that exist in the parties table
  const newPaymentStatus = remainingBalance > 0 ? 'partial_paid' : 'fully_paid'
  const updateData = {
    status: 'planned', // Change from 'draft' to 'planned'
    payment_status: newPaymentStatus,
    payment_intent_id: paymentIntent.id,
    payment_date: new Date().toISOString(),
    total_paid: totalAmount, // Set total_paid to the amount captured
    deposit_amount: 0, // No deposits - full payment only
    updated_at: new Date().toISOString()
  }

  console.log(`🔄 Updating party ${partyId} with:`, {
    status: updateData.status,
    payment_status: updateData.payment_status,
    payment_intent_id: updateData.payment_intent_id,
    total_paid: updateData.total_paid,
    deposit_amount: updateData.deposit_amount,
    remainingBalance
  })

  const { data: updateResult, error: updatePartyError } = await supabaseAdmin
    .from('parties')
    .update(updateData)
    .eq('id', partyId)
    .select('id, status, payment_status, payment_intent_id, total_paid, deposit_amount')

  if (updatePartyError) {
    console.error(`❌ Failed to update party:`, updatePartyError)
    throw new Error(`Failed to update party: ${updatePartyError.message}`)
  }

  console.log(`✅ Party updated successfully:`, updateResult)

  // Verify the update was applied
  const { data: verifyParty, error: verifyError } = await supabaseAdmin
    .from('parties')
    .select('id, status, payment_status, payment_intent_id, total_paid, deposit_amount')
    .eq('id', partyId)
    .single()

  if (verifyError) {
    console.error(`⚠️  Could not verify party update:`, verifyError)
  } else {
    console.log(`🔍 Verified party data after update:`, verifyParty)

    // Double-check payment_status is correct
    if (verifyParty.payment_status !== 'fully_paid') {
      console.error(`❌ CRITICAL: payment_status is "${verifyParty.payment_status}" but should be "fully_paid"!`)
    } else {
      console.log(`✅ CONFIRMED: payment_status is correctly set to "fully_paid"`)
    }
  }

  // Step 6: Get or create enquiries for this party
  let enquiries = party.enquiries || []

  if (enquiries.length === 0) {
    console.log('📝 No enquiries found, creating them from party plan')

    // Parse party_plan to create enquiries
    const partyPlan = party.party_plan || {}
    const enquiriesToCreate = []

    for (const [category, supplier] of Object.entries(partyPlan)) {
      if (!supplier || typeof supplier !== 'object' || ['addons', 'einvites'].includes(category)) {
        continue
      }

      enquiriesToCreate.push({
        party_id: partyId,
        supplier_id: supplier.id,
        supplier_category: category,
        message: 'BOOKING CONFIRMED - Customer has completed FULL payment',
        status: 'accepted', // Auto-accept
        auto_accepted: true, // ✅ IMPORTANT: Mark as auto-accepted so venue can manually accept later
        payment_status: 'fully_paid', // We now take full payment for all suppliers
        quoted_price: supplier.price || 0,
        created_at: new Date().toISOString()
      })
    }

    if (enquiriesToCreate.length > 0) {
      const { data: newEnquiries, error: enquiryError } = await supabaseAdmin
        .from('enquiries')
        .insert(enquiriesToCreate)
        .select()

      if (enquiryError) {
        throw new Error(`Failed to create enquiries: ${enquiryError.message}`)
      }

      enquiries = newEnquiries
      console.log(`✅ Created ${enquiries.length} enquiries`)
    }
  } else {
    // Update existing enquiries
    console.log(`📝 Updating ${enquiries.length} existing enquiries`)

    for (const enquiry of enquiries) {
      if (enquiry.supplier_category === 'einvites') {
        continue // Skip e-invites
      }

      const { error: updateEnquiryError } = await supabaseAdmin
        .from('enquiries')
        .update({
          status: 'accepted', // Auto-accept
          auto_accepted: true, // ✅ IMPORTANT: Mark as auto-accepted so venue can manually accept later
          payment_status: 'fully_paid', // We now take full payment for all suppliers
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiry.id)

      if (updateEnquiryError) {
        console.warn(`Failed to update enquiry ${enquiry.id}:`, updateEnquiryError)
      }
    }

    console.log(`✅ Updated payment status for all enquiries`)
  }

  // Step 7: Send supplier notification emails
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
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bookabash.com'}/suppliers/dashboard`
      }

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/supplier-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      })

      if (!emailResponse.ok) {
        console.warn(`Failed to send email to ${supplierDetails.name}`)
      } else {
        console.log(`✅ Email sent to ${supplierDetails.name}`)
      }
    } catch (emailError) {
      console.warn(`Error sending email for enquiry ${enquiry.id}:`, emailError.message)
    }
  }

  // Step 8: Send customer confirmation email
  try {
    if (user?.email) {
      const customerEmailPayload = {
        customerEmail: user.email,
        customerName: `${user.first_name} ${user.last_name}`.trim(),
        childName: party.child_name,
        theme: party.theme,
        partyDate: party.party_date,
        totalPaid: totalAmount,
        remainingBalance: 0, // Always 0 now (full payment)
        paymentIntentId: paymentIntent.id, // Add payment intent ID for receipt
        suppliers: enquiries.filter(e => e.supplier_category !== 'einvites').map(e => ({
          category: e.supplier_category,
          price: e.quoted_price
        })),
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bookabash.com'}/dashboard`
      }

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/payment-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerEmailPayload)
      })

      console.log('✅ Customer confirmation email sent')
    }
  } catch (emailError) {
    console.warn('Error sending customer confirmation:', emailError.message)
  }

  console.log(`✅ Payment processing complete for party ${partyId}`)
  return { success: true, duplicate: false }
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
        console.log('✅ Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          party_id: paymentIntent.metadata.party_id,
          payment_method: paymentIntent.payment_method_types
        })

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