// utils/invoiceBackend.js
// Backend utilities for supplier invoice management

import { supabase as supabaseClient } from '@/lib/supabase'

// Dynamic function to get the appropriate Supabase client
function getSupabase() {
  if (typeof window === 'undefined') {
    try {
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      return supabaseAdmin
    } catch (error) {
      console.warn('⚠️ Admin client not available, falling back to regular client:', error.message)
      return supabaseClient
    }
  }
  return supabaseClient
}

const supabase = getSupabase()

// Platform fee percentage
const PLATFORM_FEE_RATE = 0.15

/**
 * Generate a unique invoice number
 * Format: INV-{YEAR}-{SEQUENTIAL}
 */
async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear()

  // Get the highest sequence number for this year
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `INV-${currentYear}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  let nextSeq = 1
  if (!error && data && data.length > 0) {
    const lastNumber = data[0].invoice_number
    const lastSeq = parseInt(lastNumber.split('-')[2], 10)
    nextSeq = lastSeq + 1
  }

  return `INV-${currentYear}-${String(nextSeq).padStart(5, '0')}`
}

/**
 * Calculate invoice amounts from gross price
 */
function calculateInvoiceAmounts(grossAmount) {
  const gross = parseFloat(grossAmount)
  const platformFee = Math.round(gross * PLATFORM_FEE_RATE * 100) / 100
  const netAmount = Math.round((gross - platformFee) * 100) / 100

  return {
    gross_amount: gross,
    platform_fee: platformFee,
    net_amount: netAmount
  }
}

/**
 * Generate an invoice for an enquiry
 * Called after service is delivered
 */
export async function generateInvoice(enquiryId) {
  try {
    // Fetch enquiry with party and supplier details
    const { data: enquiry, error: enquiryError } = await supabase
      .from('enquiries')
      .select(`
        *,
        parties (
          id,
          child_name,
          party_date,
          party_time,
          guest_count,
          location,
          postcode,
          theme,
          full_delivery_address
        ),
        suppliers (
          id,
          business_name,
          data
        )
      `)
      .eq('id', enquiryId)
      .single()

    if (enquiryError) throw enquiryError
    if (!enquiry) throw new Error('Enquiry not found')

    // Check if invoice already exists for this enquiry
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('enquiry_id', enquiryId)
      .single()

    if (existingInvoice) {
      return {
        success: true,
        invoice: existingInvoice,
        message: 'Invoice already exists for this enquiry'
      }
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Calculate amounts
    const finalPrice = enquiry.final_price || enquiry.quoted_price || 0
    const amounts = calculateInvoiceAmounts(finalPrice)

    // Create booking details snapshot
    const bookingDetails = {
      customer: {
        partyId: enquiry.parties?.id
      },
      party: {
        childName: enquiry.parties?.child_name,
        date: enquiry.parties?.party_date,
        time: enquiry.parties?.party_time,
        guestCount: enquiry.parties?.guest_count,
        location: enquiry.parties?.location,
        postcode: enquiry.parties?.postcode,
        theme: enquiry.parties?.theme,
        deliveryAddress: enquiry.parties?.full_delivery_address
      },
      service: {
        category: enquiry.supplier_category,
        addonDetails: enquiry.addon_details
      },
      enquiry: {
        id: enquiry.id,
        status: enquiry.status,
        quotedPrice: enquiry.quoted_price,
        finalPrice: enquiry.final_price
      }
    }

    // Create invoice
    const { data: invoice, error: createError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        party_id: enquiry.party_id,
        supplier_id: enquiry.supplier_id,
        enquiry_id: enquiryId,
        service_date: enquiry.parties?.party_date,
        ...amounts,
        booking_details: bookingDetails,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) throw createError

    return { success: true, invoice }
  } catch (error) {
    console.error('Error generating invoice:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all invoices for a supplier
 */
export async function getSupplierInvoices(supplierId, options = {}) {
  try {
    const { status, limit = 50, offset = 0 } = options

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('invoice_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, invoices: data || [] }
  } catch (error) {
    console.error('Error fetching supplier invoices:', error)
    return { success: false, error: error.message, invoices: [] }
  }
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(invoiceId, supplierId = null) {
  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)

    // If supplierId provided, verify ownership
    if (supplierId) {
      query = query.eq('supplier_id', supplierId)
    }

    const { data, error } = await query.single()

    if (error) throw error
    if (!data) throw new Error('Invoice not found')

    return { success: true, invoice: data }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get invoice by access token (for public link access)
 */
export async function getInvoiceByToken(token) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        suppliers (
          id,
          business_name,
          data
        )
      `)
      .eq('access_token', token)
      .single()

    if (error) throw error
    if (!data) throw new Error('Invoice not found or invalid token')

    return { success: true, invoice: data }
  } catch (error) {
    console.error('Error fetching invoice by token:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Approve an invoice
 */
export async function approveInvoice(invoiceId, supplierId) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .eq('supplier_id', supplierId)
      .eq('status', 'pending') // Only approve pending invoices
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Invoice not found or cannot be approved')

    return { success: true, invoice: data }
  } catch (error) {
    console.error('Error approving invoice:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Decline an invoice
 */
export async function declineInvoice(invoiceId, supplierId, reason = null) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
        decline_reason: reason
      })
      .eq('id', invoiceId)
      .eq('supplier_id', supplierId)
      .eq('status', 'pending') // Only decline pending invoices
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Invoice not found or cannot be declined')

    return { success: true, invoice: data }
  } catch (error) {
    console.error('Error declining invoice:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get invoice statistics for a supplier
 */
export async function getInvoiceStats(supplierId) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('status, net_amount')
      .eq('supplier_id', supplierId)

    if (error) throw error

    const stats = {
      total: data.length,
      pending: 0,
      approved: 0,
      declined: 0,
      paid: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      approvedEarnings: 0
    }

    data.forEach(invoice => {
      stats[invoice.status]++
      const amount = parseFloat(invoice.net_amount) || 0
      stats.totalEarnings += amount

      if (invoice.status === 'pending') {
        stats.pendingEarnings += amount
      } else if (invoice.status === 'approved') {
        stats.approvedEarnings += amount
      }
    })

    // Round to 2 decimal places
    stats.totalEarnings = Math.round(stats.totalEarnings * 100) / 100
    stats.pendingEarnings = Math.round(stats.pendingEarnings * 100) / 100
    stats.approvedEarnings = Math.round(stats.approvedEarnings * 100) / 100

    return { success: true, stats }
  } catch (error) {
    console.error('Error fetching invoice stats:', error)
    return { success: false, error: error.message, stats: null }
  }
}

/**
 * Manually create an invoice (for admin use)
 */
export async function createInvoice(invoiceData) {
  try {
    const { supplierId, partyId, enquiryId, grossAmount, serviceDate, bookingDetails } = invoiceData

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Calculate amounts
    const amounts = calculateInvoiceAmounts(grossAmount)

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        supplier_id: supplierId,
        party_id: partyId,
        enquiry_id: enquiryId,
        service_date: serviceDate,
        ...amounts,
        booking_details: bookingDetails || {},
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, invoice: data }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { success: false, error: error.message }
  }
}
