import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const {
      partyId,
      supplierId,
      supplierType,
      refundAmount, // Amount in pounds (e.g., 15.50)
      reason = 'booking_modification'
    } = await req.json()

    // Validate required fields
    if (!partyId || !refundAmount || refundAmount <= 0) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: partyId and refundAmount'
      }), { status: 400 })
    }

    console.log('💰 Processing refund:', { partyId, supplierId, refundAmount, reason })

    // Get the original payment intent from the party
    const { data: party, error: partyError } = await supabaseAdmin
      .from('parties')
      .select('payment_intent_id, total_paid')
      .eq('id', partyId)
      .single()

    if (partyError || !party) {
      console.error('❌ Party not found:', partyError)
      return new Response(JSON.stringify({
        error: 'Party not found'
      }), { status: 404 })
    }

    if (!party.payment_intent_id) {
      console.error('❌ No payment intent found for party')
      return new Response(JSON.stringify({
        error: 'No payment found to refund'
      }), { status: 400 })
    }

    // Convert refund amount to pence
    const refundAmountPence = Math.round(refundAmount * 100)

    console.log('🔄 Creating Stripe refund:', {
      paymentIntent: party.payment_intent_id,
      amount: refundAmountPence
    })

    // Create the refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: party.payment_intent_id,
      amount: refundAmountPence,
      reason: 'requested_by_customer',
      metadata: {
        party_id: partyId,
        supplier_id: supplierId || 'unknown',
        supplier_type: supplierType || 'unknown',
        refund_reason: reason
      }
    })

    console.log('✅ Stripe refund created:', refund.id)

    // Record the refund in our database
    const { error: refundRecordError } = await supabaseAdmin
      .from('payments')
      .insert({
        party_id: partyId,
        stripe_payment_intent_id: refund.id,
        amount: -refundAmount, // Negative to indicate refund
        currency: 'gbp',
        status: refund.status,
        payment_type: 'refund',
        metadata: {
          original_payment_intent: party.payment_intent_id,
          supplier_id: supplierId,
          supplier_type: supplierType,
          reason: reason
        }
      })

    if (refundRecordError) {
      console.warn('⚠️ Could not record refund in database:', refundRecordError)
      // Don't fail - the Stripe refund already succeeded
    }

    // Update the party's total_paid amount
    const newTotalPaid = (party.total_paid || 0) - refundAmount
    const { error: updateError } = await supabaseAdmin
      .from('parties')
      .update({
        total_paid: newTotalPaid,
        updated_at: new Date().toISOString()
      })
      .eq('id', partyId)

    if (updateError) {
      console.warn('⚠️ Could not update party total_paid:', updateError)
    }

    return new Response(JSON.stringify({
      success: true,
      refundId: refund.id,
      refundStatus: refund.status,
      refundAmount: refundAmount,
      message: `Refund of £${refundAmount.toFixed(2)} processed successfully`
    }), { status: 200 })

  } catch (error) {
    console.error('❌ Refund error:', error)

    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return new Response(JSON.stringify({
        error: error.message || 'Invalid refund request'
      }), { status: 400 })
    }

    return new Response(JSON.stringify({
      error: error.message || 'Failed to process refund'
    }), { status: 500 })
  }
}
