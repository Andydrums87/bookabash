// app/api/calendar/webhook/route.js
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request) {
  console.log('🔔 === WEBHOOK REQUEST START ===')
  console.log('🔔 Request URL:', request.url)
  console.log('🔔 Request method:', request.method)
  try {
    const headers = Object.fromEntries(request.headers.entries())
    const resourceState = headers['x-goog-resource-state']
    const channelId = headers['x-goog-channel-id']
    
    console.log('Google Calendar webhook received:', { resourceState, channelId, timestamp: new Date().toISOString() })
       
    console.log('📋 All webhook headers:', JSON.stringify(headers, null, 2))
    console.log('📋 Resource state:', resourceState)
    console.log('📋 Channel ID:', channelId)
    // Initial sync confirmation - MUST return 200 with no body
    if (resourceState === 'sync') {
      console.log('✅ SYNC verification detected - returning 200 immediately')
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }
    
    // Find supplier with this webhook channel
    if (!channelId) {
      console.log('⚠️ No channel ID - returning 200')
      return new NextResponse(null, { status: 200 })
    }
    
    console.log('🔍 === STARTING DATABASE QUERY ===')
    console.log('🔑 supabaseAdmin type:', typeof supabaseAdmin)
    console.log('🔑 supabaseAdmin defined:', !!supabaseAdmin)
    console.log('🔑 Environment check:')
    console.log('  - NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('  - SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('  - Service key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0)
    
    // Get ALL suppliers, then find the one with this webhook
    const { data: allSuppliers, error: fetchError } = await supabaseAdmin  // ✅ FIXED
    console.log('📊 Executing query: SELECT * FROM suppliers')
      .from('suppliers')
      .select('*')
    

      console.log('📊 === DATABASE RESPONSE ===')
      console.log('📊 Suppliers found:', allSuppliers?.length || 0)
      console.log('📊 Has error:', !!fetchError)

    if (fetchError) {
      console.error('❌ DATABASE ERROR DETAILS:')
      console.error('  - Message:', fetchError.message)
      console.error('  - Code:', fetchError.code)
      console.error('  - Details:', fetchError.details)
      console.error('  - Hint:', fetchError.hint)
      console.error('  - Full error:', JSON.stringify(fetchError, null, 2))
      // Still return 200 to prevent Google from retrying
      return new NextResponse(null, { status: 200 })
    }

    if (!allSuppliers || allSuppliers.length === 0) {
      console.log('⚠️ Query succeeded but returned no suppliers')
      return new NextResponse(null, { status: 200 })
    }
    
    console.log('✅ Successfully fetched suppliers')
    console.log('🔍 Searching for channelId:', channelId)
    console.log('📋 Available suppliers and their channelIds:')
    allSuppliers.forEach((s, index) => {
      console.log(`  ${index + 1}. ${s.data?.name || 'Unknown'} - channelId: ${s.data?.googleCalendarSync?.webhookChannelId || 'none'}`)
    })
    
    // Find the primary supplier with this webhook channel
    const primarySupplier = allSuppliers?.find(s => 
      s.data?.googleCalendarSync?.webhookChannelId === channelId
    )
    
    if (!primarySupplier) {
      console.log('No primary supplier found for webhook channel:', channelId)
      return new NextResponse(null, { status: 200 })
    }
    console.log('✅ Processing webhook for supplier:', primarySupplier.data.name)
    console.log('Found primary supplier:', primarySupplier.data.name)
    
    // Get all suppliers for this user (primary + themed)
    const userSuppliers = allSuppliers.filter(s => 
      s.auth_user_id === primarySupplier.auth_user_id
    )
    
    console.log(`Found ${userSuppliers.length} total suppliers (primary + themed) for this user`)
    
    // Trigger automatic sync for all suppliers
    await triggerAutomaticSync(primarySupplier, userSuppliers)
    
    return new NextResponse(null, { status: 200 })
    
  } catch (error) {
    console.error('💥 === WEBHOOK EXCEPTION ===')
    console.error('💥 Error type:', error.constructor.name)
    console.error('💥 Error message:', error.message)
    console.error('💥 Error stack:', error.stack)
    // Always return 200 to prevent Google from retrying
    return new NextResponse(null, { status: 200 })
  }
}

async function triggerAutomaticSync(primarySupplier, allUserSuppliers) {
  try {
    const googleSync = primarySupplier.data.googleCalendarSync
    
    if (!googleSync?.accessToken) {
      console.error('No access token for automatic sync')
      return
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: googleSync.accessToken,
      refresh_token: googleSync.refreshToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Fetch CURRENT events from next 1 year
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
    console.log('Fetching current calendar state for sync...')
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    const events = response.data.items || []
    console.log(`Found ${events.length} current calendar events`)
    
    // Convert ONLY current events to blocked dates
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
    
    console.log(`Converted to ${blockedDates.length} blocked date entries`)
    
    // Update ALL suppliers (primary and themed)
    for (const supplier of allUserSuppliers) {
      try {
        const isPrimary = supplier.id === primarySupplier.id
        
        // Keep manual blocks, REPLACE all google-calendar blocks
        const currentUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = currentUnavailable.filter(item => 
          item.source !== 'google-calendar'
        )
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
        
        const { error: updateError } = await supabaseAdmin
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
    message: 'Google Calendar webhook endpoint is running',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}