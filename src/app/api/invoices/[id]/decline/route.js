// API route for declining an invoice
// POST: Decline invoice with optional reason

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Parse body for optional reason
    let reason = null
    try {
      const body = await request.json()
      reason = body.reason || null
    } catch {
      // No body provided, that's okay
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Verify invoice exists
    const { data: invoice, error: fetchError } = await supabaseAdmin
      .from('invoices')
      .select('id, status, supplier_id, invoice_number')
      .eq('id', id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if invoice is in pending status
    if (invoice.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot decline invoice with status "${invoice.status}". Only pending invoices can be declined.`
      }, { status: 400 })
    }

    // Update invoice to declined
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        decline_reason: reason
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error declining invoice:', updateError)
      return NextResponse.json({ error: 'Failed to decline invoice' }, { status: 500 })
    }

    console.log(`❌ Invoice ${updatedInvoice.invoice_number} declined by supplier ${invoice.supplier_id}${reason ? ` - Reason: ${reason}` : ''}`)

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice declined'
    })

  } catch (error) {
    console.error('Error in decline invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
