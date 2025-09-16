import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request) {
  try {
    const headers = Object.fromEntries(request.headers.entries())
    const resourceState = headers['x-goog-resource-state']
    const channelId = headers['x-goog-channel-id']
    
    console.log('Calendar webhook received:', { resourceState, channelId })
    
    // Initial sync confirmation - just acknowledge
    if (resourceState === 'sync') {
      console.log('Webhook sync confirmation received')
      return NextResponse.json({ success: true })
    }
    
    // Find supplier with this webhook channel
    if (!channelId) {
      console.log('No channel ID in webhook')
      return NextResponse.json({ success: true })
    }
    
    console.log('Looking for supplier with channel ID:', channelId)
    
    const { data: suppliers, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_primary', true)
    
    if (fetchError) {
      console.error('Error fetching suppliers:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Find supplier with matching webhook channel
    const supplier = suppliers?.find(s => 
      s.data?.googleCalendarSync?.webhookChannelId === channelId
    )
    
    if (!supplier) {
      console.log('No supplier found for webhook channel:', channelId)
      return NextResponse.json({ success: true })
    }
    
    console.log('Triggering automatic sync for:', supplier.data.name)
    
    // Trigger automatic sync
    await triggerAutomaticSync(supplier)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function triggerAutomaticSync(supplier) {
  try {
    const googleSync = supplier.data.googleCalendarSync
    
    if (!googleSync?.accessToken) {
      console.error('No access token for automatic sync')
      return
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
    
    console.log('Fetching calendar events for automatic sync...')
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    const events = response.data.items || []
    console.log(`Found ${events.length} calendar events`)
    
    // Convert events to blocked dates (same logic as manual sync)
    const blockedDates = []
    
    events.forEach((event) => {
      if (!event.start) return
      
      if (event.start.date) {
        blockedDates.push({
          date: event.start.date,
          timeSlots: ['morning', 'afternoon'],
          source: 'google-calendar',
          eventTitle: event.summary || 'Calendar Event'
        })
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
        }
      }
    })
    
    // Update supplier with new blocked dates
    const currentUnavailable = supplier.data.unavailableDates || []
    const manualBlocks = currentUnavailable.filter(item => item.source !== 'google-calendar')
    const allBlocked = [...manualBlocks, ...blockedDates]
    
    const updatedData = {
      ...supplier.data,
      unavailableDates: allBlocked,
      googleCalendarSync: {
        ...googleSync,
        lastSync: new Date().toISOString(),
        syncedEvents: events.map(e => ({ id: e.id, title: e.summary })),
        lastAutomaticSync: new Date().toISOString()
      }
    }
    
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)
    
    if (updateError) {
      console.error('Automatic sync database update failed:', updateError)
    } else {
      console.log(`Automatic sync completed: ${blockedDates.length} dates blocked`)
    }
    
  } catch (error) {
    console.error('Automatic sync failed:', error)
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request) {
  return NextResponse.json({ message: 'Calendar webhook endpoint' })
}