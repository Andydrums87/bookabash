// API route for generating invoice PDF
// GET: Generate and return PDF for an invoice

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { renderToBuffer } from '@react-pdf/renderer'
import InvoiceTemplate from '@/components/pdf/InvoiceTemplate'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Fetch invoice with related data
    const { data: invoice, error: fetchError } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        suppliers (
          id,
          business_name,
          data
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Enrich booking_details with supplier name if not present
    const enrichedInvoice = {
      ...invoice,
      booking_details: {
        ...invoice.booking_details,
        supplier: {
          ...invoice.booking_details?.supplier,
          name: invoice.booking_details?.supplier?.name || invoice.suppliers?.business_name || 'Supplier'
        }
      }
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InvoiceTemplate invoice={enrichedInvoice} />
    )

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
