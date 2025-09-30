// app/api/calendar/webhook/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request) {
  try {
    const headers = Object.fromEntries(request.headers.entries())
    const resourceState = headers['x-goog-resource-state']
    const channelId = headers['x-goog-channel-id']
    
    console.log('Calendar webhook received:', { resourceState, channelId, timestamp: new Date().toISOString() })
    
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
    
    // Get ALL suppliers, then find the one with this webhook
    const { data: allSuppliers, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
    
    if (fetchError) {
      console.error('Error fetching suppliers:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Find the primary supplier with this webhook channel
    const primarySupplier = allSuppliers?.find(s => 
      s.data?.googleCalendarSync?.webhookChannelId === channelId
    )
    
    if (!primarySupplier) {
      console.log('No primary supplier found for webhook channel:', channelId)
      return NextResponse.json({ success: true })
    }
    
    console.log('Found primary supplier:', primarySupplier.data.name)
    
    // Get all suppliers for this user (primary + themed)
    const userSuppliers = allSuppliers.filter(s => 
      s.auth_user_id === primarySupplier.auth_user_id
    )
    
    console.log(`Found ${userSuppliers.length} total suppliers (primary + themed) for this user`)
    
    // Trigger automatic sync for all suppliers
    await triggerAutomaticSync(primarySupplier, userSuppliers)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function triggerAutomaticSync(primarySupplier, allUserSuppliers) {
  try {
    const googleSync = primarySupplier.data.googleCalendarSync
    
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
    
    // Fetch events from next 1 year
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
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
    
    // Convert events to blocked dates
    const blockedDates = []
    
    events.forEach((event) => {
      if (!event.start) return
      
      if (event.start.date) {
        // All-day event
        blockedDates.push({
          date: event.start.date,
          timeSlots: ['morning', 'afternoon'],
          source: 'google-calendar',
          eventTitle: event.summary || 'Calendar Event'
        })
      } else if (event.start.dateTime) {
        // Timed event
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
    
    console.log(`Converted to ${blockedDates.length} blocked date entries`)
    
    // Update ALL suppliers (primary and themed) with the same calendar data
    for (const supplier of allUserSuppliers) {
      try {
        const isPrimary = supplier.id === primarySupplier.id
        
        // Merge manual blocks with calendar blocks
        const currentUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = currentUnavailable.filter(item => item.source !== 'google-calendar')
        const allBlocked = [...manualBlocks, ...blockedDates]
        
        const updatedData = {
          ...supplier.data,
          unavailableDates: allBlocked,
          busyDates: blockedDates,
          googleCalendarSync: {
            ...supplier.data.googleCalendarSync,
            lastSync: new Date().toISOString(),
            syncedEvents: events.map(e => ({ id: e.id, title: e.summary })),
            lastAutomaticSync: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        }
        
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)
        
        if (updateError) {
          console.error(`Failed to update ${isPrimary ? 'primary' : 'themed'} supplier:`, updateError)
        } else {
          console.log(`✅ Updated ${isPrimary ? 'primary' : 'themed'} supplier: ${supplier.data.name} with ${allBlocked.length} unavailable dates`)
        }
        
      } catch (supplierError) {
        console.error(`Error updating supplier ${supplier.data?.name}:`, supplierError)
      }
    }
    
    console.log(`Automatic sync completed for ${allUserSuppliers.length} suppliers`)
    
  } catch (error) {
    console.error('Automatic sync failed:', error)
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request) {
  return NextResponse.json({ 
    message: 'Calendar webhook endpoint is running',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}