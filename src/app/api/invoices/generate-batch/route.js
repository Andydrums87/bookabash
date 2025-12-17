// API route for batch invoice generation
// Called every Monday to generate invoices for weekend parties
// Can also be triggered manually with custom date range

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Platform fee rate
const PLATFORM_FEE_RATE = 0.15

/**
 * Send invoice notification email to supplier
 */
async function sendInvoiceEmail(invoice, enquiry, baseUrl) {
  try {
    // Get supplier email from data
    const supplierData = enquiry.suppliers?.data || {}
    const supplierEmail = supplierData.contactInfo?.email || supplierData.owner?.email

    if (!supplierEmail) {
      console.log(`⚠️ No email found for supplier ${enquiry.supplier_id}`)
      return { sent: false, reason: 'No email' }
    }

    const response = await fetch(`${baseUrl}/api/email/supplier-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierEmail,
        supplierName: enquiry.suppliers?.business_name || 'there',
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        childName: enquiry.parties?.child_name,
        partyDate: enquiry.parties?.party_date,
        partyTime: enquiry.parties?.party_time,
        serviceCategory: enquiry.supplier_category,
        grossAmount: invoice.gross_amount,
        platformFee: invoice.platform_fee,
        netAmount: invoice.net_amount,
        invoiceId: invoice.id
      })
    })

    if (response.ok) {
      console.log(`📧 Email sent to ${supplierEmail} for invoice ${invoice.invoice_number}`)
      return { sent: true, email: supplierEmail }
    } else {
      const error = await response.json()
      console.error(`❌ Failed to send email:`, error)
      return { sent: false, reason: error.error }
    }
  } catch (err) {
    console.error(`❌ Email error:`, err.message)
    return { sent: false, reason: err.message }
  }
}

/**
 * Generate invoice number
 */
async function generateInvoiceNumber(supabaseAdmin) {
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

  return `INV-${currentYear}-${String(nextSeq).padStart(5, '0')}`
}

/**
 * Get the date range for "last weekend"
 * If today is Monday, returns Saturday and Sunday of the previous weekend
 */
function getLastWeekendRange() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Calculate days to go back to get to last Saturday
  // If Monday (1), go back 2 days to Saturday
  // If Tuesday (2), go back 3 days, etc.
  let daysToSaturday
  if (dayOfWeek === 0) {
    // Sunday - last Saturday was yesterday
    daysToSaturday = 1
  } else if (dayOfWeek === 1) {
    // Monday - last Saturday was 2 days ago
    daysToSaturday = 2
  } else {
    // Other days - calculate accordingly
    daysToSaturday = dayOfWeek + 1
  }

  const lastSaturday = new Date(today)
  lastSaturday.setDate(today.getDate() - daysToSaturday)
  lastSaturday.setHours(0, 0, 0, 0)

  const lastSunday = new Date(lastSaturday)
  lastSunday.setDate(lastSaturday.getDate() + 1)
  lastSunday.setHours(23, 59, 59, 999)

  return {
    startDate: lastSaturday.toISOString().split('T')[0],
    endDate: lastSunday.toISOString().split('T')[0]
  }
}

// GET - Generate invoices for completed parties
// Query params:
//   - startDate: Optional start date (YYYY-MM-DD)
//   - endDate: Optional end date (YYYY-MM-DD)
//   - dryRun: If 'true', just return what would be generated without creating
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    // Get date range - use provided dates or default to last weekend
    let startDate = searchParams.get('startDate')
    let endDate = searchParams.get('endDate')
    const dryRun = searchParams.get('dryRun') === 'true'

    if (!startDate || !endDate) {
      const weekendRange = getLastWeekendRange()
      startDate = startDate || weekendRange.startDate
      endDate = endDate || weekendRange.endDate
    }

    console.log(`📅 Generating invoices for parties between ${startDate} and ${endDate}`)

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Find all enquiries for parties that:
    // 1. Party date is within the date range
    // 2. Enquiry status is 'accepted'
    // 3. Payment status is 'fully_paid'
    // 4. No invoice exists yet for this enquiry
    const { data: enquiries, error: enquiriesError } = await supabaseAdmin
      .from('enquiries')
      .select(`
        id,
        supplier_id,
        party_id,
        supplier_category,
        quoted_price,
        final_price,
        addon_details,
        status,
        payment_status,
        parties (
          id,
          party_date,
          party_time,
          child_name,
          theme,
          guest_count,
          location,
          postcode,
          full_delivery_address
        ),
        suppliers (
          id,
          business_name,
          data
        )
      `)
      .eq('status', 'accepted')
      .eq('payment_status', 'fully_paid')
      .gte('parties.party_date', startDate)
      .lte('parties.party_date', endDate)
      .not('parties', 'is', null)

    if (enquiriesError) {
      console.error('Error fetching enquiries:', enquiriesError)
      return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
    }

    // Filter out enquiries that already have invoices
    const enquiryIds = enquiries?.map(e => e.id) || []

    let existingInvoiceEnquiryIds = []
    if (enquiryIds.length > 0) {
      const { data: existingInvoices } = await supabaseAdmin
        .from('invoices')
        .select('enquiry_id')
        .in('enquiry_id', enquiryIds)

      existingInvoiceEnquiryIds = existingInvoices?.map(i => i.enquiry_id) || []
    }

    // Filter to only enquiries without invoices
    const enquiriesToProcess = enquiries?.filter(
      e => !existingInvoiceEnquiryIds.includes(e.id) && e.parties
    ) || []

    console.log(`Found ${enquiriesToProcess.length} enquiries needing invoices`)

    if (dryRun) {
      // Just return what would be created
      return NextResponse.json({
        success: true,
        dryRun: true,
        dateRange: { startDate, endDate },
        enquiriesFound: enquiries?.length || 0,
        alreadyHaveInvoices: existingInvoiceEnquiryIds.length,
        wouldGenerate: enquiriesToProcess.length,
        enquiries: enquiriesToProcess.map(e => ({
          enquiryId: e.id,
          supplierId: e.supplier_id,
          supplierName: e.suppliers?.business_name,
          partyDate: e.parties?.party_date,
          childName: e.parties?.child_name,
          category: e.supplier_category,
          amount: e.final_price || e.quoted_price
        }))
      })
    }

    // Generate invoices
    const results = {
      success: [],
      failed: [],
      skipped: []
    }

    for (const enquiry of enquiriesToProcess) {
      try {
        const grossAmount = parseFloat(enquiry.final_price || enquiry.quoted_price || 0)

        if (grossAmount <= 0) {
          results.skipped.push({
            enquiryId: enquiry.id,
            reason: 'No valid price'
          })
          continue
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(supabaseAdmin)

        // Calculate amounts
        const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100
        const netAmount = Math.round((grossAmount - platformFee) * 100) / 100

        // Create booking details snapshot
        const bookingDetails = {
          customer: {
            partyId: enquiry.party_id
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
            quotedPrice: enquiry.quoted_price,
            finalPrice: enquiry.final_price
          },
          supplier: {
            id: enquiry.supplier_id,
            name: enquiry.suppliers?.business_name
          }
        }

        // Create invoice
        const { data: invoice, error: createError } = await supabaseAdmin
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            party_id: enquiry.party_id,
            supplier_id: enquiry.supplier_id,
            enquiry_id: enquiry.id,
            service_date: enquiry.parties?.party_date,
            gross_amount: grossAmount,
            platform_fee: platformFee,
            net_amount: netAmount,
            booking_details: bookingDetails,
            status: 'pending'
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        // Send email notification
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
        const emailResult = await sendInvoiceEmail(invoice, enquiry, baseUrl)

        results.success.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          enquiryId: enquiry.id,
          supplierId: enquiry.supplier_id,
          supplierName: enquiry.suppliers?.business_name,
          netAmount: netAmount,
          emailSent: emailResult.sent,
          emailTo: emailResult.email
        })

        console.log(`✅ Created invoice ${invoiceNumber} for ${enquiry.suppliers?.business_name}${emailResult.sent ? ` (email sent to ${emailResult.email})` : ''}`)

      } catch (err) {
        console.error(`❌ Failed to create invoice for enquiry ${enquiry.id}:`, err)
        results.failed.push({
          enquiryId: enquiry.id,
          error: err.message
        })
      }
    }

    console.log(`📊 Invoice generation complete: ${results.success.length} created, ${results.failed.length} failed, ${results.skipped.length} skipped`)

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate },
      summary: {
        created: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    })

  } catch (error) {
    console.error('Error in batch invoice generation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Same as GET but accepts body params
export async function POST(request) {
  try {
    const body = await request.json()
    const { startDate, endDate, dryRun } = body

    // Build URL with query params and call GET handler logic
    const url = new URL(request.url)
    if (startDate) url.searchParams.set('startDate', startDate)
    if (endDate) url.searchParams.set('endDate', endDate)
    if (dryRun) url.searchParams.set('dryRun', 'true')

    // Create new request with params
    const newRequest = new Request(url, { method: 'GET' })
    return GET(newRequest)

  } catch (error) {
    console.error('Error in batch invoice generation POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
