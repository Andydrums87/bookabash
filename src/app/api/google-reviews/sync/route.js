// app/api/google-reviews/sync/route.js
// Syncs Google Places API ratings for venue and entertainer suppliers

import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// Use server-side key (no referrer restrictions) with fallback to public key
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request) {
  console.log('Google Reviews sync started:', new Date().toISOString())

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 })
  }

  try {
    const { data: suppliers, error: fetchError } = await supabaseAdmin
      .from('suppliers')
      .select('*')

    if (fetchError) {
      console.error('Error fetching suppliers:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Filter for venues and entertainers with a googlePlaceId
    const eligibleSuppliers = suppliers?.filter(s => {
      const category = (s.data?.category || '').toLowerCase()
      const isVenueOrEntertainer =
        category === 'venues' || category === 'venue' ||
        category === 'entertainment' || category === 'entertainer'
      return isVenueOrEntertainer && s.data?.googlePlaceId
    }) || []

    console.log(`Found ${eligibleSuppliers.length} suppliers with Google Place IDs`)

    let successCount = 0
    let errorCount = 0

    for (const supplier of eligibleSuppliers) {
      try {
        await syncGoogleRating(supplier)
        successCount++
      } catch (syncError) {
        console.error(`Sync failed for ${supplier.data?.name}:`, syncError.message)
        errorCount++
      }
    }

    const result = {
      timestamp: new Date().toISOString(),
      totalSuppliers: eligibleSuppliers.length,
      successful: successCount,
      errors: errorCount,
    }

    console.log('Google Reviews sync completed:', result)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Google Reviews sync failed:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error.message,
    }, { status: 500 })
  }
}

async function syncGoogleRating(supplier) {
  const placeId = supplier.data.googlePlaceId

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'rating,userRatingCount',
      },
    }
  )

  const placeData = await response.json()

  if (!response.ok) {
    const errorMsg = placeData?.error?.message || JSON.stringify(placeData)
    throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorMsg}`)
  }

  const updatedData = {
    ...supplier.data,
    googleRating: placeData.rating || null,
    googleReviewCount: placeData.userRatingCount || 0,
    googleRatingSyncedAt: new Date().toISOString(),
  }

  const { error: updateError } = await supabaseAdmin
    .from('suppliers')
    .update({ data: updatedData })
    .eq('id', supplier.id)

  if (updateError) {
    throw new Error(`Database update failed: ${updateError.message}`)
  }

  console.log(`Updated Google rating for ${supplier.data.name}: ${placeData.rating} (${placeData.userRatingCount} reviews)`)
}

// Allow POST for manual triggering
export async function POST(request) {
  return GET(request)
}
