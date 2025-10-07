import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'


async function refreshOutlookToken(refreshToken, supplierId) {
  const tokenResponse = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    }
  )

  if (!tokenResponse.ok) {
    throw new Error("Token refresh failed")
  }

  const tokens = await tokenResponse.json()

  // Update tokens in database
  const { data: supplier } = await supabaseAdmin  // ✅ CHANGE
    .from("suppliers")
    .select("data")
    .eq("id", supplierId)
    .single()

  const updatedData = {
    ...supplier.data,
    outlookTokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    },
  }

  await supabaseAdmin  // ✅ CHANGE
    .from("suppliers")
    .update({ data: updatedData })
    .eq("id", supplierId)

  return tokens.access_token
}

async function syncOutlookCalendar(supplier) {
  console.log('Starting Outlook calendar sync for:', supplier.data.name)
  
  const { outlookTokens, outlookCalendarSync } = supplier.data

  if (!outlookTokens?.accessToken) {
    throw new Error("No Outlook access token")
  }

  // Check if token needs refresh
  let accessToken = outlookTokens.accessToken
  if (new Date(outlookTokens.expiresAt) < new Date()) {
    console.log('Refreshing Outlook token...')
    accessToken = await refreshOutlookToken(outlookTokens.refreshToken, supplier.id)
  }

  // Get events from next 60 days
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 60)

  const eventsUrl = new URL("https://graph.microsoft.com/v1.0/me/calendarview")
  eventsUrl.searchParams.append("startDateTime", startDate.toISOString())
  eventsUrl.searchParams.append("endDateTime", endDate.toISOString())
  eventsUrl.searchParams.append("$select", "subject,start,end,showAs,isAllDay")
  eventsUrl.searchParams.append("$top", "250")

  console.log('Fetching Outlook calendar events...')
  
  const response = await fetch(eventsUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.timezone="UTC"',
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Outlook events")
  }

  const data = await response.json()
  const events = data.value || []

  console.log(`Found ${events.length} Outlook events`)

  // Filter for busy events
  const busyEvents = events.filter(
    event => event.showAs === "busy" || event.showAs === "oof" || event.isAllDay
  )

  console.log(`${busyEvents.length} busy events to block`)

  // Convert to blocked dates
  const blockedDates = []
  busyEvents.forEach((event, index) => {
    console.log(`Event ${index + 1}:`, event.subject, event.start)

    if (event.isAllDay) {
      const date = event.start.dateTime.split('T')[0]
      blockedDates.push({
        date,
        timeSlots: ['morning', 'afternoon'],
        source: 'outlook-calendar',
        eventTitle: event.subject || 'Calendar Event'
      })
      console.log('Added all-day block for:', date)
    } else {
      const startTime = new Date(event.start.dateTime)
      const date = startTime.toISOString().split('T')[0]
      const hour = startTime.getHours()
      
      let timeSlots = []
      if (hour < 13) timeSlots.push('morning')
      if (hour >= 13) timeSlots.push('afternoon')
      
      if (timeSlots.length > 0) {
        blockedDates.push({
          date,
          timeSlots,
          source: 'outlook-calendar',
          eventTitle: event.subject || 'Calendar Event'
        })
        console.log('Added timed block for:', date, timeSlots)
      }
    }
  })

  return {
    blockedDates,
    eventsFound: busyEvents.length,
    lastSync: new Date().toISOString(),
    syncedEvents: busyEvents.map(e => ({ id: e.id, title: e.subject }))
  }
}

async function syncGoogleCalendar(supplier) {
  console.log('Starting Google calendar sync for:', supplier.data.name)
  
  const googleSync = supplier.data.googleCalendarSync
  if (!googleSync?.connected || !googleSync?.accessToken) {
    throw new Error('Google Calendar not connected')
  }

  // Set up Google Calendar API
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: googleSync.accessToken,
    refresh_token: googleSync.refreshToken
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  // Fetch events from next 60 days
  const timeMin = new Date().toISOString()
  const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()

  console.log('Fetching Google calendar events...')
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime'
  })

  const events = response.data.items || []
  console.log(`Found ${events.length} Google calendar events`)

  // Convert events to blocked dates
  const blockedDates = []
  
  events.forEach((event, index) => {
    console.log(`Event ${index + 1}:`, event.summary, event.start)

    if (!event.start) return

    if (event.start.date) {
      blockedDates.push({
        date: event.start.date,
        timeSlots: ['morning', 'afternoon'],
        source: 'google-calendar',
        eventTitle: event.summary || 'Calendar Event'
      })
      console.log('Added all-day block for:', event.start.date)
    } else if (event.start.dateTime) {
      const startTime = new Date(event.start.dateTime)
      const date = startTime.toISOString().split('T')[0]
      const hour = startTime.getHours()
      
      let timeSlots = []
      if (hour < 13) timeSlots.push('morning')
      if (hour >= 13) timeSlots.push('afternoon')
      
      if (timeSlots.length > 0) {
        blockedDates.push({
          date,
          timeSlots,
          source: 'google-calendar',
          eventTitle: event.summary || 'Calendar Event'
        })
        console.log('Added timed block for:', date, timeSlots)
      }
    }
  })

  return {
    blockedDates,
    eventsFound: events.length,
    lastSync: new Date().toISOString(),
    syncedEvents: events.map(e => ({ id: e.id, title: e.summary }))
  }
}




export async function POST(request) {
  console.log('Starting calendar sync')
  
  try {
    // Get authenticated user
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabaseClient.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const requestedSupplierId = body.supplierId
    const provider = body.provider || 'google'

    console.log('Requested supplier ID:', requestedSupplierId)
    console.log('Provider:', provider)
    console.log('User ID:', session.user.id)

    let supplier = null

    if (requestedSupplierId) {
      // Use regular supabase with RLS for user-specific query
      const { data: specificSupplier, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', requestedSupplierId)
        .eq('auth_user_id', session.user.id)
        .single()

      if (!fetchError && specificSupplier) {
        supplier = specificSupplier
        console.log('Using requested supplier:', supplier.data.name)
      }
    }

    if (!supplier) {
      console.log('Finding most recently updated supplier with calendar')
      
      // Use regular supabase with RLS for user-specific query
      const { data: connectedSuppliers, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .eq('is_primary', true)
        .order('updated_at', { ascending: false })

      if (fetchError || !connectedSuppliers) {
        return NextResponse.json({ error: 'Failed to find suppliers' }, { status: 404 })
      }

      // Find supplier with valid calendar connection for the requested provider
      const validSupplier = connectedSuppliers.find(s => {
        if (provider === 'outlook') {
          const outlookSync = s.data?.outlookCalendarSync
          return outlookSync?.connected && s.data?.outlookTokens?.accessToken
        } else {
          const googleSync = s.data?.googleCalendarSync
          return googleSync?.connected && googleSync?.accessToken
        }
      })

      if (!validSupplier) {
        return NextResponse.json({ 
          error: `No ${provider} Calendar connections found` 
        }, { status: 400 })
      }

      supplier = validSupplier
      console.log('Using most recent supplier:', supplier.data.name)
    }

    // Sync based on provider
    let syncResult
    if (provider === 'outlook') {
      syncResult = await syncOutlookCalendar(supplier)
    } else {
      syncResult = await syncGoogleCalendar(supplier)
    }

    // Update supplier with synced data
    const currentUnavailable = supplier.data.unavailableDates || []
    const manualBlocks = currentUnavailable.filter(
      item => item.source !== `${provider}-calendar`
    )
    const allBlocked = [...manualBlocks, ...syncResult.blockedDates]

    const syncField = provider === 'outlook' ? 'outlookCalendarSync' : 'googleCalendarSync'
    
    const updatedData = {
      ...supplier.data,
      unavailableDates: allBlocked,
      [syncField]: {
        ...supplier.data[syncField],
        lastSync: syncResult.lastSync,
        syncedEvents: syncResult.syncedEvents
      }
    }

    // ✅ Use supabaseAdmin for the update to bypass RLS
    const { error: updateError } = await supabaseAdmin
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)

    if (updateError) throw updateError

    console.log('Sync completed successfully')

    return NextResponse.json({ 
      success: true, 
      blockedDates: syncResult.blockedDates,
      eventsFound: syncResult.eventsFound,
      lastSync: syncResult.lastSync,
      supplierName: supplier.data.name,
      provider
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ 
      error: 'Sync failed: ' + error.message 
    }, { status: 500 })
  }
}