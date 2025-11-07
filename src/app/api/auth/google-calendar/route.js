// app/api/auth/google-calendar/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

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
        // 'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent select_account',  // Force consent screen for video demo
      state: userId  // Pass user ID through OAuth flow
    })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('OAuth URL generation error:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}