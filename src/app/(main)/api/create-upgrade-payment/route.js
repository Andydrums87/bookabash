// src/app/api/create-upgrade-payment/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function POST(request) {
  try {
    const {
      amount,
      currency = 'gbp',
      partyId,
      supplierType,
      supplierName,
      paymentType = 'booking_upgrade'
    } = await request.json()

    // Validate amount
    if (!amount || amount < 50) { // Minimum 50 pence
      return NextResponse.json(
        { error: 'Invalid amount. Minimum payment is £0.50' },
        { status: 400 }
      )
    }

    // Create metadata for tracking
    const metadata = {
      party_id: partyId?.toString() || 'unknown',
      payment_type: paymentType,
      supplier_type: supplierType || 'unknown',
      supplier_name: supplierName?.substring(0, 100) || 'Unknown',
      upgrade_amount: (amount / 100).toFixed(2),
    }

    // Create PaymentIntent for the upgrade amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Already in pence
      currency,
      description: `Booking upgrade for ${supplierName || supplierType} - Party ${partyId}`,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log('💳 Upgrade Payment Intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      partyId,
      supplierType,
      supplierName
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    console.error('❌ Stripe upgrade payment error:', error)
    return NextResponse.json(
      {
        error: error.message,
        type: 'stripe_error',
      },
      { status: 500 }
    )
  }
}
