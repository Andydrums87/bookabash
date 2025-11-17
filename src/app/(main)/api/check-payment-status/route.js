// API endpoint to check payment status
// Used by frontend to poll for webhook completion
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const partyId = searchParams.get('party_id')
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!partyId) {
      return NextResponse.json(
        { error: 'party_id is required' },
        { status: 400 }
      )
    }

    // Fetch party payment status
    const { data: party, error } = await supabaseAdmin
      .from('parties')
      .select('payment_status, payment_intent_id, status')
      .eq('id', partyId)
      .single()

    if (error) {
      console.error('Error fetching party:', error)
      return NextResponse.json(
        { error: 'Failed to fetch party status' },
        { status: 500 }
      )
    }

    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      )
    }

    // Check if the payment intent matches (optional verification)
    if (paymentIntentId && party.payment_intent_id !== paymentIntentId) {
      return NextResponse.json({
        status: 'pending',
        payment_status: party.payment_status,
        message: 'Payment intent mismatch - webhook may not have processed yet'
      })
    }

    // Determine if payment processing is complete
    const isComplete = ['partial_paid', 'fully_paid'].includes(party.payment_status)
    const isFailed = ['failed', 'canceled'].includes(party.payment_status)
    const isProcessing = ['pending', 'processing'].includes(party.payment_status)

    return NextResponse.json({
      status: isComplete ? 'complete' : isFailed ? 'failed' : 'processing',
      payment_status: party.payment_status,
      party_status: party.status,
      payment_intent_id: party.payment_intent_id,
      message: isComplete
        ? 'Payment processed successfully'
        : isFailed
          ? 'Payment failed'
          : 'Payment is being processed'
    })

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
