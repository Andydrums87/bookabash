// src/app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

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

        // TODO: Update your database here
        // - Mark party as paid
        // - Send confirmation emails
        // - Create enquiries
        // - Update payment status in parties table
        
        // Example:
        // await supabase
        //   .from('parties')
        //   .update({ 
        //     payment_status: 'paid',
        //     payment_intent_id: paymentIntent.id,
        //     paid_at: new Date().toISOString()
        //   })
        //   .eq('id', paymentIntent.metadata.party_id)

        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        const errorMessage = failedPayment.last_payment_error?.message
        console.log('❌ Payment failed:', {
          id: failedPayment.id,
          party_id: failedPayment.metadata.party_id,
          error: errorMessage
        })

        // TODO: Handle failed payment
        // - Send failure notification
        // - Log the failure
        // - Maybe offer retry option

        break

      case 'payment_intent.processing':
        const processingPayment = event.data.object
        console.log('⏳ Payment processing:', {
          id: processingPayment.id,
          party_id: processingPayment.metadata.party_id
        })

        // Klarna payments often go through a processing state
        // You might want to show a "payment processing" status

        break

      case 'payment_intent.requires_action':
        const requiresAction = event.data.object
        console.log('🔐 Payment requires action:', {
          id: requiresAction.id,
          party_id: requiresAction.metadata.party_id,
          next_action: requiresAction.next_action?.type
        })

        // Customer needs to complete additional authentication
        // (e.g., 3D Secure, Klarna redirect)

        break

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object
        console.log('🚫 Payment canceled:', {
          id: canceledPayment.id,
          party_id: canceledPayment.metadata.party_id
        })

        // Handle cancelation
        // - Maybe restore the booking timer
        // - Log the cancelation

        break

      case 'charge.refunded':
        const refund = event.data.object
        console.log('💰 Refund processed:', {
          charge_id: refund.id,
          amount: refund.amount_refunded,
          payment_intent: refund.payment_intent
        })

        // Handle refund
        // - Update party status
        // - Notify customer
        // - Notify suppliers

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