// src/app/api/create-payment-intent/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

console.log(stripeSecretKey)

export async function POST(request) {
  try {
    const { amount, currency, partyDetails, suppliers, addons } = await request.json()

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        party_child_name: partyDetails.childName,
        party_theme: partyDetails.theme,
        party_date: partyDetails.date,
        supplier_count: suppliers.length.toString(),
        addon_count: addons.length.toString()
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}