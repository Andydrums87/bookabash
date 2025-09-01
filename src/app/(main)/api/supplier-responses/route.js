// /api/supplier-responses/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      enquiry_id,
      party_id,
      supplier_id,
      customer_id,
      response_type,
      response_message,
      final_price,
      sent_at
    } = body

    // Validate required fields
    if (!enquiry_id || !party_id || !supplier_id || !customer_id || !response_type || !response_message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate response_type
    if (!['accepted', 'declined'].includes(response_type)) {
      return NextResponse.json(
        { error: 'Invalid response type. Must be "accepted" or "declined"' },
        { status: 400 }
      )
    }

    // Insert supplier response into database
    const query = `
      INSERT INTO supplier_responses (
        enquiry_id,
        party_id,
        supplier_id,
        customer_id,
        response_type,
        response_message,
        final_price,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, sent_at
    `

    const values = [
      enquiry_id,
      party_id,
      supplier_id,
      customer_id,
      response_type,
      response_message,
      final_price,
      sent_at || new Date().toISOString()
    ]

    const result = await supabase.query(query, values)
    const savedResponse = result.rows[0]

    // Log success for debugging
    console.log(`Supplier response saved: ${response_type} for enquiry ${enquiry_id}`)

    return NextResponse.json({
      success: true,
      id: savedResponse.id,
      sent_at: savedResponse.sent_at,
      message: 'Supplier response saved successfully'
    })

  } catch (error) {
    console.error('Error saving supplier response:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to save supplier response',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to fetch responses for debugging
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const enquiry_id = searchParams.get('enquiry_id')
    const customer_id = searchParams.get('customer_id')

    if (!enquiry_id && !customer_id) {
      return NextResponse.json(
        { error: 'Must provide either enquiry_id or customer_id' },
        { status: 400 }
      )
    }

    let query = `
      SELECT 
        sr.*,
        s.business_name,
        s.category as supplier_category,
        p.child_name,
        p.theme,
        p.party_date
      FROM supplier_responses sr
      JOIN suppliers s ON sr.supplier_id = s.id
      JOIN parties p ON sr.party_id = p.id
    `
    
    let values = []
    
    if (enquiry_id) {
      query += ' WHERE sr.enquiry_id = $1'
      values = [enquiry_id]
    } else {
      query += ' WHERE sr.customer_id = $1'
      values = [customer_id]
    }
    
    query += ' ORDER BY sr.sent_at DESC'

    const result = await db.query(query, values)

    return NextResponse.json({
      success: true,
      messages: result.rows
    })

  } catch (error) {
    console.error('Error fetching supplier responses:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch supplier responses',
        details: error.message 
      },
      { status: 500 }
    )
  }
}