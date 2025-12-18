// API route for supplier invoices
// GET: List invoices for authenticated supplier
// POST: Create a new invoice (admin/system use)

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// GET - List invoices for the authenticated supplier
export async function GET(request) {
  try {
    // Get URL params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplier_id')
    const enquiryId = searchParams.get('enquiry_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // If enquiry_id is provided, fetch invoice by enquiry directly
    if (enquiryId) {
      const supabaseAdmin = getSupabaseAdmin()
      if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }

      const { data: invoices, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('enquiry_id', enquiryId)

      if (invoiceError) {
        console.error('Error fetching invoice by enquiry:', invoiceError)
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
      }

      return NextResponse.json({ invoices: invoices || [] })
    }

    // Supplier ID is required - it comes from the authenticated useSupplier hook on client
    if (!supplierId) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Verify supplier exists (basic validation)
    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .select('id, is_primary')
      .eq('id', supplierId)
      .single()

    if (supplierError || !supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Start with the main supplier ID
    const supplierIds = [supplierId]

    // If this is a primary (parent) business, also get child business invoices
    if (supplier.is_primary) {
      const { data: childSuppliers } = await supabaseAdmin
        .from('suppliers')
        .select('id')
        .eq('parent_business_id', supplierId)

      if (childSuppliers && childSuppliers.length > 0) {
        supplierIds.push(...childSuppliers.map(s => s.id))
      }
    }

    // Build invoice query
    let invoiceQuery = supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact' })
      .in('supplier_id', supplierIds)
      .order('invoice_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      invoiceQuery = invoiceQuery.eq('status', status)
    }

    const { data: invoices, error: invoiceError, count } = await invoiceQuery

    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    // Also get stats
    const { data: allInvoices } = await supabaseAdmin
      .from('invoices')
      .select('status, net_amount')
      .in('supplier_id', supplierIds)

    const stats = {
      total: allInvoices?.length || 0,
      pending: 0,
      approved: 0,
      declined: 0,
      paid: 0,
      pendingEarnings: 0,
      approvedEarnings: 0,
      totalEarnings: 0
    }

    allInvoices?.forEach(inv => {
      stats[inv.status]++
      const amount = parseFloat(inv.net_amount) || 0
      stats.totalEarnings += amount
      if (inv.status === 'pending') stats.pendingEarnings += amount
      if (inv.status === 'approved') stats.approvedEarnings += amount
    })

    // Round to 2 decimal places
    stats.totalEarnings = Math.round(stats.totalEarnings * 100) / 100
    stats.pendingEarnings = Math.round(stats.pendingEarnings * 100) / 100
    stats.approvedEarnings = Math.round(stats.approvedEarnings * 100) / 100

    return NextResponse.json({
      invoices: invoices || [],
      total: count || 0,
      stats
    })

  } catch (error) {
    console.error('Error in invoices GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new invoice (for admin/system use)
export async function POST(request) {
  try {
    const body = await request.json()
    const { enquiryId, supplierId, grossAmount, serviceDate, bookingDetails } = body

    if (!supplierId || !grossAmount) {
      return NextResponse.json({ error: 'Missing required fields: supplierId and grossAmount' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Verify supplier exists
    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .select('id')
      .eq('id', supplierId)
      .single()

    if (supplierError || !supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Check if invoice already exists for this enquiry (if enquiryId provided)
    if (enquiryId) {
      const { data: existingInvoice } = await supabaseAdmin
        .from('invoices')
        .select('id, invoice_number')
        .eq('enquiry_id', enquiryId)
        .single()

      if (existingInvoice) {
        return NextResponse.json({
          success: true,
          invoice: existingInvoice,
          message: 'Invoice already exists for this enquiry'
        })
      }
    }

    // Generate invoice number
    const currentYear = new Date().getFullYear()
    const { data: lastInvoice } = await supabaseAdmin
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `INV-${currentYear}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1)

    let nextSeq = 1
    if (lastInvoice && lastInvoice.length > 0) {
      const lastNumber = lastInvoice[0].invoice_number
      const lastSeq = parseInt(lastNumber.split('-')[2], 10)
      nextSeq = lastSeq + 1
    }
    const invoiceNumber = `INV-${currentYear}-${String(nextSeq).padStart(5, '0')}`

    // Calculate amounts
    const gross = parseFloat(grossAmount)
    const platformFee = Math.round(gross * 0.15 * 100) / 100
    const netAmount = Math.round((gross - platformFee) * 100) / 100

    // Create invoice
    const { data: invoice, error: createError } = await supabaseAdmin
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        supplier_id: supplierId,
        enquiry_id: enquiryId || null,
        service_date: serviceDate || null,
        gross_amount: gross,
        platform_fee: platformFee,
        net_amount: netAmount,
        booking_details: bookingDetails || {},
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating invoice:', createError)
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }

    return NextResponse.json({ success: true, invoice })

  } catch (error) {
    console.error('Error in invoices POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
