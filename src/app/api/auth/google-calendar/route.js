// app/api/auth/google-calendar/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET handler for dashboard (existing users with session)
export async function GET(request) {
  try {
    // Require Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Validate session with Supabase
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const userId = user.id

    console.log('Generating Google Calendar auth URL for user:', userId)

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
    )

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent select_account',
      state: userId
    })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('OAuth URL generation error:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}

// POST handler for wizard onboarding and per-business connections
export async function POST(request) {
  try {
    // Require Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Validate session with Supabase
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { userId, supplierId, perBusinessConnection } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Extract actual userId if using wizard format (wizard-{userId}:supplier:{supplierId})
    let actualUserId = userId
    if (userId.startsWith('wizard-')) {
      const match = userId.match(/^wizard-([^:]+):supplier:/)
      if (match) {
        actualUserId = match[1]
      }
    }

    // Validate actualUserId matches authenticated user
    if (actualUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Generating Google Calendar auth URL for user:', userId)
    if (perBusinessConnection && supplierId) {
      console.log('Per-business connection requested for supplier:', supplierId)
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
    )

    // Encode supplierId in state if this is a per-business connection
    // Format: userId or userId:supplierId for per-business
    const state = perBusinessConnection && supplierId
      ? `${userId}:business:${supplierId}`
      : userId

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        // 'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent select_account',  // Force consent screen for video demo
      state: state  // Pass user ID (and optionally supplierId) through OAuth flow
    })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('OAuth URL generation error:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}