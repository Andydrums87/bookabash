import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { token, userId } = await request.json()

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Missing token or userId' },
        { status: 400 }
      )
    }

    // Find the supplier by claim token
    const { data: supplier, error: findError } = await supabaseAdmin
      .from('suppliers')
      .select('id, claim_token_expires_at')
      .eq('claim_token', token)
      .single()

    if (findError || !supplier) {
      return NextResponse.json(
        { error: 'Invalid or expired claim token' },
        { status: 404 }
      )
    }

    // Check expiry
    if (supplier.claim_token_expires_at && new Date(supplier.claim_token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Claim token has expired' },
        { status: 400 }
      )
    }

    // Update the supplier with new owner
    const { error: updateError } = await supabaseAdmin
      .from('suppliers')
      .update({
        auth_user_id: userId,
        is_primary: true,
        claim_token: null,
        claim_token_expires_at: null,
        pending_owner_email: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supplier.id)

    if (updateError) {
      console.error('Failed to claim supplier:', updateError)
      return NextResponse.json(
        { error: 'Failed to claim venue' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Claim API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
