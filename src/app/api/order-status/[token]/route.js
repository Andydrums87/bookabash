// API route for token-based order status updates
// Allows suppliers to update cake order status without logging in

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Valid status transitions (can only progress forward)
const VALID_TRANSITIONS = {
  null: ['confirmed'],
  undefined: ['confirmed'],
  'confirmed': ['preparing'],
  'preparing': ['dispatched'],
  'dispatched': ['delivered'],
  'delivered': [] // Terminal state
}

// GET - Fetch order details by token
export async function GET(request, { params }) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Look up the enquiry by status_update_token
    const { data: enquiry, error: enquiryError } = await supabaseAdmin
      .from('enquiries')
      .select(`
        id,
        order_status,
        tracking_url,
        dispatched_at,
        delivered_at,
        supplier_category,
        quoted_price,
        addon_details,
        party_id,
        supplier_id,
        created_at
      `)
      .eq('status_update_token', token)
      .single()

    if (enquiryError || !enquiry) {
      console.log('❌ Order not found for token:', token)
      return NextResponse.json(
        { success: false, error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Verify it's a cake order
    const isCakeOrder = ['cakes', 'Cakes', 'cake', 'Cake'].includes(enquiry.supplier_category)
    if (!isCakeOrder) {
      return NextResponse.json(
        { success: false, error: 'This link is not valid for this order type' },
        { status: 400 }
      )
    }

    // Get party details (limited info for security)
    const { data: party, error: partyError } = await supabaseAdmin
      .from('parties')
      .select('party_date, party_time, location, child_name')
      .eq('id', enquiry.party_id)
      .single()

    // Get supplier name
    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('suppliers')
      .select('business_name')
      .eq('id', enquiry.supplier_id)
      .single()

    // Extract cake customization from addon_details
    const cakeCustomization = enquiry.addon_details?.cakeCustomization || {}

    return NextResponse.json({
      success: true,
      order: {
        id: enquiry.id,
        status: enquiry.order_status,
        trackingUrl: enquiry.tracking_url,
        dispatchedAt: enquiry.dispatched_at,
        deliveredAt: enquiry.delivered_at,
        price: enquiry.quoted_price,
        createdAt: enquiry.created_at,
        cakeDetails: {
          flavor: cakeCustomization.flavorName,
          dietary: cakeCustomization.dietaryName,
          fulfillment: cakeCustomization.fulfillmentMethod,
          message: cakeCustomization.customMessage
        },
        party: party ? {
          date: party.party_date,
          time: party.party_time,
          location: party.location,
          childName: party.child_name
        } : null,
        supplierName: supplier?.business_name || 'Unknown'
      }
    })

  } catch (error) {
    console.error('❌ Error fetching order by token:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update order status
export async function POST(request, { params }) {
  try {
    const { token } = await params
    const body = await request.json()
    const { status, trackingUrl, courierCode, courierName } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['confirmed', 'preparing', 'dispatched', 'delivered']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get current order with party and supplier info for potential email
    const { data: enquiry, error: enquiryError } = await supabaseAdmin
      .from('enquiries')
      .select('id, order_status, supplier_category, party_id, supplier_id, addon_details, quoted_price')
      .eq('status_update_token', token)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Verify it's a cake order
    const isCakeOrder = ['cakes', 'Cakes', 'cake', 'Cake'].includes(enquiry.supplier_category)
    if (!isCakeOrder) {
      return NextResponse.json(
        { success: false, error: 'This link is not valid for this order type' },
        { status: 400 }
      )
    }

    // Validate status transition
    const currentStatus = enquiry.order_status || null
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from "${currentStatus || 'none'}" to "${status}"` },
        { status: 400 }
      )
    }

    // Build update data
    const updateData = {
      order_status: status,
      updated_at: new Date().toISOString()
    }

    // Add timestamps and courier info for specific statuses
    if (status === 'dispatched') {
      updateData.dispatched_at = new Date().toISOString()
      if (trackingUrl) {
        updateData.tracking_url = trackingUrl
      }
      if (courierCode) {
        updateData.courier_code = courierCode
      }
      if (courierName) {
        updateData.courier_name = courierName
      }
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    // Update the order
    const { data: updatedEnquiry, error: updateError } = await supabaseAdmin
      .from('enquiries')
      .update(updateData)
      .eq('id', enquiry.id)
      .select('id, order_status, tracking_url, courier_code, courier_name, dispatched_at, delivered_at')
      .single()

    if (updateError) {
      console.error('❌ Error updating order status:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    console.log('✅ Order status updated via token:', {
      orderId: enquiry.id,
      newStatus: status
    })

    // Send customer dispatch notification email if status is dispatched
    if (status === 'dispatched') {
      try {
        // Get party and customer info
        const { data: party } = await supabaseAdmin
          .from('parties')
          .select('child_name, party_date, user_id')
          .eq('id', enquiry.party_id)
          .single()

        // Get customer email
        const { data: customer } = await supabaseAdmin
          .from('users')
          .select('email, first_name')
          .eq('id', party?.user_id)
          .single()

        // Get supplier/cake name
        const { data: supplier } = await supabaseAdmin
          .from('suppliers')
          .select('business_name')
          .eq('id', enquiry.supplier_id)
          .single()

        // Extract cake customization
        const cakeCustomization = enquiry.addon_details?.cakeCustomization || {}

        if (customer?.email) {
          // Send customer dispatch email
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          await fetch(`${baseUrl}/api/send-dispatch-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerEmail: customer.email,
              customerName: customer.first_name || 'there',
              childName: party?.child_name || 'your child',
              partyDate: party?.party_date,
              cakeName: supplier?.business_name || 'Your cake',
              trackingUrl: trackingUrl || null,
              courierName: courierName || null,
              cakeCustomization
            })
          })
          console.log('✅ Customer dispatch email sent to:', customer.email)
        }
      } catch (emailError) {
        // Don't fail the status update if email fails
        console.error('⚠️ Failed to send dispatch email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedEnquiry.id,
        status: updatedEnquiry.order_status,
        trackingUrl: updatedEnquiry.tracking_url,
        courierCode: updatedEnquiry.courier_code,
        courierName: updatedEnquiry.courier_name,
        dispatchedAt: updatedEnquiry.dispatched_at,
        deliveredAt: updatedEnquiry.delivered_at
      }
    })

  } catch (error) {
    console.error('❌ Error updating order status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
