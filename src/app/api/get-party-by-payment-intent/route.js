import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Fetch party by payment_intent_id
    const { data: party, error } = await supabaseAdmin
      .from('parties')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    if (error) {
      console.error('Error fetching party:', error)
      return NextResponse.json(
        { success: false, error: 'Party not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      party
    })

  } catch (error) {
    console.error('Error in get-party-by-payment-intent:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
