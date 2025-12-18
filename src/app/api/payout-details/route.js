import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET - Fetch payout details for a supplier
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('supplier_id')

    if (!supplierId) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('payout_details')
      .select('*')
      .eq('supplier_id', supplierId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching payout details:', error)
      return NextResponse.json({ error: 'Failed to fetch payout details' }, { status: 500 })
    }

    return NextResponse.json({ payoutDetails: data || null })
  } catch (error) {
    console.error('Error in GET /api/payout-details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update payout details
export async function POST(request) {
  try {
    const body = await request.json()
    const { supplier_id, supplier_name, bank_name, account_holder_name, sort_code, account_number } = body

    if (!supplier_id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
    }

    if (!account_holder_name || !sort_code || !account_number) {
      return NextResponse.json({ error: 'Account holder name, sort code, and account number are required' }, { status: 400 })
    }

    // Validate sort code (6 digits)
    if (!/^\d{6}$/.test(sort_code)) {
      return NextResponse.json({ error: 'Sort code must be 6 digits' }, { status: 400 })
    }

    // Validate account number (8 digits)
    if (!/^\d{8}$/.test(account_number)) {
      return NextResponse.json({ error: 'Account number must be 8 digits' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Upsert payout details
    const { data, error } = await supabaseAdmin
      .from('payout_details')
      .upsert({
        supplier_id,
        supplier_name: supplier_name || null,
        bank_name: bank_name || null,
        account_holder_name,
        sort_code,
        account_number,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'supplier_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving payout details:', error)
      return NextResponse.json({ error: 'Failed to save payout details' }, { status: 500 })
    }

    return NextResponse.json({ success: true, payoutDetails: data })
  } catch (error) {
    console.error('Error in POST /api/payout-details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
