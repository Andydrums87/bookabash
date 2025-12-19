// Admin API route for marking an invoice as paid
// POST: Mark invoice as paid (after manual bank transfer)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Admin emails that can access this endpoint (from env variable)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export async function POST(request, { params }) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data: { user }, error } = await supabaseAuth.auth.getUser(token)

      if (error || !user || !ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Verify invoice exists and is approved
    const { data: invoice, error: fetchError } = await supabaseAdmin
      .from('invoices')
      .select('id, status, invoice_number, supplier_id, net_amount')
      .eq('id', id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Can only mark approved invoices as paid
    if (invoice.status !== 'approved') {
      return NextResponse.json({
        error: `Cannot mark invoice as paid with status "${invoice.status}". Only approved invoices can be marked as paid.`
      }, { status: 400 })
    }

    // Update invoice to paid
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error marking invoice as paid:', updateError)
      return NextResponse.json({ error: 'Failed to mark invoice as paid' }, { status: 500 })
    }

    console.log(`✅ Invoice ${updatedInvoice.invoice_number} marked as paid - £${invoice.net_amount} to supplier ${invoice.supplier_id}`)

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Invoice marked as paid'
    })

  } catch (error) {
    console.error('Error in mark-paid:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
