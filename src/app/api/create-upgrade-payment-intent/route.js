import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const {
      partyId,
      supplierType,
      supplierName,
      amount, // Amount in pence
      originalPrice,
      newPrice,
      changes = []
    } = await request.json()

    // Validate required fields
    if (!partyId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
        { status: 400 }
      )
    }

    console.log('💳 Creating upgrade payment intent:', {
      partyId,
      supplierType,
      supplierName,
      amount,
      originalPrice,
      newPrice
    })

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Already in pence
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        party_id: partyId,
        payment_type: 'booking_upgrade',
        supplier_type: supplierType || '',
        supplier_name: (supplierName || '').substring(0, 100), // Stripe metadata limit
        original_price: originalPrice?.toString() || '0',
        new_price: newPrice?.toString() || '0',
        upgrade_amount: (amount / 100).toString(),
        changes_summary: changes.length > 0
          ? changes.slice(0, 3).map(c => c.type).join(', ').substring(0, 200)
          : 'booking_update'
      },
      description: `Booking upgrade: ${supplierName} (${supplierType}) - £${(amount / 100).toFixed(2)}`,
    })

    console.log('✅ Upgrade payment intent created:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Error creating upgrade payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
