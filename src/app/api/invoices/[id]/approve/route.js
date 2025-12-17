// API route for approving an invoice
// POST: Approve invoice

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
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
        error: `Cannot approve invoice with status "${invoice.status}". Only pending invoices can be approved.`
      }, { status: 400 })
    }

    // Update invoice to approved
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error approving invoice:', updateError)
      return NextResponse.json({ error: 'Failed to approve invoice' }, { status: 500 })
    }

    console.log(`✅ Invoice ${updatedInvoice.invoice_number} approved by supplier ${invoice.supplier_id}`)

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice approved successfully'
    })

  } catch (error) {
    console.error('Error in approve invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
