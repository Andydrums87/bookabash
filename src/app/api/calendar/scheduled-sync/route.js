// app/api/calendar/scheduled-sync/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request) {
  console.log('🕒 Scheduled calendar sync started:', new Date().toISOString())
  
  try {
    // Find all suppliers with Google Calendar connected
    const { data: suppliers, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_primary', true)
    
    if (fetchError) {
      console.error('Error fetching suppliers:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Filter for suppliers with Google Calendar enabled
    const connectedSuppliers = suppliers?.filter(s => 
      s.data?.googleCalendarSync?.connected && 
      s.data?.googleCalendarSync?.enabled &&
      s.data?.googleCalendarSync?.accessToken
    ) || []
    
    console.log(`Found ${connectedSuppliers.length} suppliers with Google Calendar connected`)
    
    let successCount = 0
    let errorCount = 0
    
    // Sync each connected supplier
    for (const supplier of connectedSuppliers) {
      try {
        console.log(`🔄 Syncing: ${supplier.data.name}`)
        
        await syncSupplierCalendar(supplier)
        
        console.log(`✅ Sync completed: ${supplier.data.name}`)
        successCount++
        
      } catch (syncError) {
        console.error(`❌ Sync failed for ${supplier.data.name}:`, syncError.message)
        errorCount++
      }
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      totalSuppliers: connectedSuppliers.length,
      successful: successCount,
      errors: errorCount
    }
    
    console.log('🎉 Scheduled sync completed:', result)
    
    return NextResponse.json({ 
      success: true, 
      ...result
    })
    
  } catch (error) {
    console.error('❌ Scheduled sync failed:', error)
    return NextResponse.json({ 
      error: 'Scheduled sync failed', 
      details: error.message 
    }, { status: 500 })
  }
}

async function syncSupplierCalendar(supplier) {
  const googleSync = supplier.data.googleCalendarSync
  
  if (!googleSync?.accessToken) {
    throw new Error('No access token available')
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
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime'
  })
  
  const events = response.data.items || []
  console.log(`Found ${events.length} calendar events for ${supplier.data.name}`)
  
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
      lastScheduledSync: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  }
  
  const { error: updateError } = await supabase
    .from('suppliers')
    .update({ data: updatedData })
    .eq('id', supplier.id)
  
  if (updateError) {
    throw new Error(`Database update failed: ${updateError.message}`)
  }
  
  console.log(`📅 ${blockedDates.length} dates blocked for ${supplier.data.name}`)
}

// Allow POST requests for manual triggering
export async function POST(request) {
  return GET(request)
}