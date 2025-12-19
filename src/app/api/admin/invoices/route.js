// Admin API route for managing all invoices
// GET: List all invoices with stats for admin dashboard

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Admin emails that can access this endpoint (from env variable)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export async function GET(request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Build invoice query with supplier info including parent reference
    let invoiceQuery = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        suppliers:supplier_id (
          id,
          business_name,
          parent_business_id,
          is_primary,
          data,
          payout_details (
            bank_name,
            account_holder_name,
            sort_code,
            account_number,
            is_verified
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      invoiceQuery = invoiceQuery.eq('status', status)
    }

    const { data: invoices, error: invoiceError } = await invoiceQuery

    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    // Collect parent IDs we need to look up for payout details
    const parentIds = new Set()
    invoices?.forEach(inv => {
      if (inv.suppliers?.parent_business_id && (!inv.suppliers?.payout_details || inv.suppliers.payout_details.length === 0)) {
        parentIds.add(inv.suppliers.parent_business_id)
      }
    })

    // Fetch parent payout details if needed
    let parentPayoutMap = {}
    if (parentIds.size > 0) {
      const { data: parentPayouts } = await supabaseAdmin
        .from('payout_details')
        .select('supplier_id, bank_name, account_holder_name, sort_code, account_number, is_verified')
        .in('supplier_id', Array.from(parentIds))

      parentPayouts?.forEach(p => {
        parentPayoutMap[p.supplier_id] = p
      })
    }

    // Add supplier name and payout details to each invoice
    const invoicesWithNames = (invoices || []).map(inv => {
      const supplierData = inv.suppliers?.data || {}

      // Get payout details - check own first, then parent's
      const payoutDetailsArray = inv.suppliers?.payout_details || []
      let payoutDetails = payoutDetailsArray[0] || null

      // If no own payout details and has parent, use parent's
      if (!payoutDetails && inv.suppliers?.parent_business_id) {
        payoutDetails = parentPayoutMap[inv.suppliers.parent_business_id] || null
      }

      // Get supplier name from multiple sources
      const supplierName = inv.suppliers?.business_name
        || supplierData.businessName
        || supplierData.serviceDetails?.businessName
        || supplierData.name
        || inv.booking_details?.supplier?.name
        || 'Unknown'

      return {
        ...inv,
        supplier_name: supplierName,
        payout_details: payoutDetails,
        supplier_email: supplierData.owner?.email || supplierData.contactInfo?.email || null,
        supplier_phone: supplierData.owner?.phone || supplierData.contactInfo?.phone || null
      }
    })

    // Get all invoices for stats (regardless of filter)
    const { data: allInvoices } = await supabaseAdmin
      .from('invoices')
      .select('status, net_amount')

    const stats = {
      pending: 0,
      approved: 0,
      paid: 0,
      declined: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      paidAmount: 0
    }

    allInvoices?.forEach(inv => {
      const amount = parseFloat(inv.net_amount) || 0
      if (inv.status === 'pending') {
        stats.pending++
        stats.pendingAmount += amount
      } else if (inv.status === 'approved') {
        stats.approved++
        stats.approvedAmount += amount
      } else if (inv.status === 'paid') {
        stats.paid++
        stats.paidAmount += amount
      } else if (inv.status === 'declined') {
        stats.declined++
      }
    })

    // Round amounts
    stats.pendingAmount = Math.round(stats.pendingAmount * 100) / 100
    stats.approvedAmount = Math.round(stats.approvedAmount * 100) / 100
    stats.paidAmount = Math.round(stats.paidAmount * 100) / 100

    return NextResponse.json({
      invoices: invoicesWithNames,
      stats
    })

  } catch (error) {
    console.error('Error in admin invoices GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
