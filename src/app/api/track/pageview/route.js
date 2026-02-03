// API endpoint for tracking page views
// Accepts POST requests from the client-side tracker

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with anon key (for inserts via RLS policy)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Bot patterns to filter on server side as well
const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
  'pingdom', 'uptimerobot', 'lighthouse', 'headless'
]

function isBot(userAgent) {
  if (!userAgent) return true
  const ua = userAgent.toLowerCase()
  return BOT_PATTERNS.some(pattern => ua.includes(pattern))
}

export async function POST(request) {
  try {
    // Check user agent on server side too
    const userAgent = request.headers.get('user-agent') || ''
    if (isBot(userAgent)) {
      return NextResponse.json({ success: true, skipped: 'bot' })
    }

    // Parse the request body
    let data
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      data = await request.json()
    } else {
      // Handle sendBeacon which might send as text
      const text = await request.text()
      data = JSON.parse(text)
    }

    // Validate required fields
    if (!data.visitor_id || !data.page_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get country from Vercel headers (if available)
    const country = request.headers.get('x-vercel-ip-country') || null

    // Insert into database
    const { error } = await supabase
      .from('page_views')
      .insert({
        visitor_id: data.visitor_id,
        session_id: data.session_id,
        page_path: data.page_path,
        page_title: data.page_title,
        referrer: data.referrer,
        referrer_domain: data.referrer_domain,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        device_type: data.device_type,
        browser: data.browser,
        os: data.os,
        screen_resolution: data.screen_resolution,
        is_new_visitor: data.is_new_visitor,
        country: country,
        party_tracking_session_id: data.party_tracking_session_id
      })

    if (error) {
      console.error('[PageView API] Insert error:', error)
      // Don't return error to client - tracking should fail silently
      return NextResponse.json({ success: true, error: 'logged' })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[PageView API] Error:', error)
    // Always return success - tracking errors shouldn't affect the user
    return NextResponse.json({ success: true, error: 'caught' })
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
