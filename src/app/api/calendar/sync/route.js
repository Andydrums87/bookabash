import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('Starting calendar sync')
  
  try {
    // Get the supplier ID from the request body if provided
    const body = await request.json().catch(() => ({}))
    const requestedSupplierId = body.supplierId

    console.log('Requested supplier ID:', requestedSupplierId)

    let supplier = null

    if (requestedSupplierId) {
      // Use specific supplier if ID provided
      const { data: specificSupplier, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', requestedSupplierId)
        .single()

      if (!fetchError && specificSupplier) {
        supplier = specificSupplier
        console.log('Using requested supplier:', supplier.data.name)
      }
    }

    if (!supplier) {
      // Fallback: find the most recently updated supplier with Google Calendar
      console.log('Finding most recently updated supplier with Google Calendar')
      
      const { data: connectedSuppliers, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_primary', true)
        .order('updated_at', { ascending: false })

      if (fetchError || !connectedSuppliers) {
        return NextResponse.json({ error: 'Failed to find suppliers' }, { status: 404 })
      }

      // Find supplier with valid Google Calendar connection
      const validSupplier = connectedSuppliers.find(s => {
        const googleSync = s.data?.googleCalendarSync
        return googleSync?.connected && googleSync?.accessToken
      })

      if (!validSupplier) {
        return NextResponse.json({ error: 'No Google Calendar connections found' }, { status: 400 })
      }

      supplier = validSupplier
      console.log('Using most recent supplier:', supplier.data.name)
    }

    const googleSync = supplier.data.googleCalendarSync
    if (!googleSync?.connected || !googleSync?.accessToken) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })
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

    console.log('Fetching calendar events...')
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

    // Update supplier
    const currentUnavailable = supplier.data.unavailableDates || []
    const manualBlocks = currentUnavailable.filter(item => item.source !== 'google-calendar')
    const allBlocked = [...manualBlocks, ...blockedDates]

    const updatedData = {
      ...supplier.data,
      unavailableDates: allBlocked,
      googleCalendarSync: {
        ...googleSync,
        lastSync: new Date().toISOString(),
        syncedEvents: events.map(e => ({ id: e.id, title: e.summary }))
      }
    }

    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)

    if (updateError) throw updateError

    console.log('Sync completed successfully')

    return NextResponse.json({ 
      success: true, 
      blockedDates,
      eventsFound: events.length,
      lastSync: new Date().toISOString(),
      supplierName: supplier.data.name
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed: ' + error.message }, { status: 500 })
  }
}