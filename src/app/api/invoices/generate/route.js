// API route for manual invoice generation
// POST: Generate invoice for a specific enquiry or all eligible enquiries for a supplier

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const PLATFORM_FEE_RATE = 0.15

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

export async function POST(request) {
  try {
    const body = await request.json()
    const { enquiryId, supplierId, dryRun = false } = body

    if (!enquiryId && !supplierId) {
      return NextResponse.json({
        error: 'Either enquiryId or supplierId is required'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Build query for eligible enquiries
    let query = supabaseAdmin
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

    // Filter by specific enquiry or supplier
    if (enquiryId) {
      query = query.eq('id', enquiryId)
    } else if (supplierId) {
      query = query.eq('supplier_id', supplierId)
    }

    const { data: enquiries, error: enquiriesError } = await query

    if (enquiriesError) {
      console.error('Error fetching enquiries:', enquiriesError)
      return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
    }

    if (!enquiries || enquiries.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible enquiries found',
        criteria: {
          enquiryId,
          supplierId,
          requirements: 'status=accepted, payment_status=fully_paid'
        }
      })
    }

    // Filter out enquiries that already have invoices
    const enquiryIds = enquiries.map(e => e.id)
    const { data: existingInvoices } = await supabaseAdmin
      .from('invoices')
      .select('enquiry_id')
      .in('enquiry_id', enquiryIds)

    const existingEnquiryIds = existingInvoices?.map(i => i.enquiry_id) || []
    const enquiriesToProcess = enquiries.filter(e => !existingEnquiryIds.includes(e.id) && e.parties)

    if (enquiriesToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All eligible enquiries already have invoices',
        existingInvoiceCount: existingEnquiryIds.length
      })
    }

    // Dry run - just show what would be generated
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        wouldGenerate: enquiriesToProcess.length,
        enquiries: enquiriesToProcess.map(e => ({
          enquiryId: e.id,
          supplierId: e.supplier_id,
          supplierName: e.suppliers?.business_name,
          partyDate: e.parties?.party_date,
          childName: e.parties?.child_name,
          category: e.supplier_category,
          grossAmount: e.final_price || e.quoted_price,
          platformFee: Math.round((e.final_price || e.quoted_price) * PLATFORM_FEE_RATE * 100) / 100,
          netAmount: Math.round((e.final_price || e.quoted_price) * (1 - PLATFORM_FEE_RATE) * 100) / 100
        }))
      })
    }

    // Generate invoices
    const results = { success: [], failed: [] }

    for (const enquiry of enquiriesToProcess) {
      try {
        const grossAmount = parseFloat(enquiry.final_price || enquiry.quoted_price || 0)

        if (grossAmount <= 0) {
          results.failed.push({ enquiryId: enquiry.id, error: 'No valid price' })
          continue
        }

        const invoiceNumber = await generateInvoiceNumber(supabaseAdmin)
        const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100
        const netAmount = Math.round((grossAmount - platformFee) * 100) / 100

        const bookingDetails = {
          customer: { partyId: enquiry.party_id },
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

        if (createError) throw createError

        // Send email notification
        let emailSent = false
        let emailTo = null
        try {
          const supplierData = enquiry.suppliers?.data || {}
          const supplierEmail = supplierData.contactInfo?.email || supplierData.owner?.email

          if (supplierEmail) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'https://partysnap.co.uk'
            const emailResponse = await fetch(`${baseUrl}/api/email/supplier-invoice`, {
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
            emailSent = emailResponse.ok
            emailTo = supplierEmail
          }
        } catch (emailErr) {
          console.error('Email error:', emailErr.message)
        }

        results.success.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          enquiryId: enquiry.id,
          supplierName: enquiry.suppliers?.business_name,
          grossAmount,
          platformFee,
          netAmount,
          emailSent,
          emailTo
        })

        console.log(`✅ Created invoice ${invoiceNumber} for ${enquiry.suppliers?.business_name}${emailSent ? ` (email sent to ${emailTo})` : ''}`)

      } catch (err) {
        console.error(`❌ Failed to create invoice for enquiry ${enquiry.id}:`, err)
        results.failed.push({ enquiryId: enquiry.id, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        created: results.success.length,
        failed: results.failed.length
      },
      results
    })

  } catch (error) {
    console.error('Error in manual invoice generation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
