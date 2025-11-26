// app/api/calendar/webhook/route.js
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

// Create admin client directly in this file
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`\n🔔 === WEBHOOK ${requestId} START ===`)
  console.log('🔔 Timestamp:', new Date().toISOString())
  
  try {
    const headers = Object.fromEntries(request.headers.entries())
    const resourceState = headers['x-goog-resource-state']
    const channelId = headers['x-goog-channel-id']
    
    console.log('📋 Webhook Details:')
    console.log('  - Resource State:', resourceState)
    console.log('  - Channel ID:', channelId)
    
    // Initial sync confirmation
    if (resourceState === 'sync') {
      console.log('✅ SYNC verification - returning 200')
      return new NextResponse(null, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    if (resourceState === 'exists') {
      console.log('🔄 CALENDAR CHANGE DETECTED!')
    }
    
    if (!channelId) {
      console.log('⚠️ No channel ID - returning 200')
      return new NextResponse(null, { status: 200 })
    }
    
    console.log('🔍 Searching database for channel:', channelId)
    
    const supabaseAdmin = getSupabaseAdmin()
    console.log('✅ Supabase admin client created')
    
    const { data: allSuppliers, error: fetchError } = await supabaseAdmin
      .from('suppliers')
      .select('*')

    if (fetchError) {
      console.error('❌ DATABASE ERROR:', fetchError.message)
      return new NextResponse(null, { status: 200 })
    }

    if (!allSuppliers || allSuppliers.length === 0) {
      console.log('⚠️ No suppliers found in database')
      return new NextResponse(null, { status: 200 })
    }
    
    console.log(`📊 Found ${allSuppliers.length} total suppliers`)
    
    const primarySupplier = allSuppliers?.find(s => 
      s.data?.googleCalendarSync?.webhookChannelId === channelId
    )
    
    if (!primarySupplier) {
      console.log('❌ No supplier found with channel:', channelId)
      return new NextResponse(null, { status: 200 })
    }
    
    console.log('✅ Found supplier:', primarySupplier.data.name)

    // Check if this is a per-business calendar connection
    const isPerBusinessCalendar = primarySupplier.data.googleCalendarSync?.ownConnection === true

    let suppliersToSync
    if (isPerBusinessCalendar) {
      // Per-business calendar: only sync this specific supplier
      console.log('📋 Per-business calendar - syncing only this supplier')
      suppliersToSync = [primarySupplier]
    } else {
      // Shared calendar: sync all suppliers for this user (inherited model)
      suppliersToSync = allSuppliers.filter(s =>
        s.auth_user_id === primarySupplier.auth_user_id
      )
      console.log(`📋 Shared calendar - found ${suppliersToSync.length} suppliers for user`)
    }

    console.log('🔄 Starting automatic sync...')

    await triggerAutomaticSync(primarySupplier, suppliersToSync, supabaseAdmin)
    
    console.log('✅ Webhook processing complete')
    console.log(`🔔 === WEBHOOK ${requestId} END (success) ===\n`)
    return new NextResponse(null, { status: 200 })
    
  } catch (error) {
    console.error('💥 WEBHOOK EXCEPTION:', error.message)
    console.error('💥 Stack:', error.stack)
    console.log(`🔔 === WEBHOOK ${requestId} END (error) ===\n`)
    return new NextResponse(null, { status: 200 })
  }
}

async function refreshGoogleToken(supplier, supabaseAdmin) {
  console.log('🔄 Attempting to refresh Google token...')
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    refresh_token: supplier.data.googleCalendarSync.refreshToken
  })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()
    console.log('✅ Token refreshed successfully')
    
    // Update supplier with new tokens
    const updatedData = {
      ...supplier.data,
      googleCalendarSync: {
        ...supplier.data.googleCalendarSync,
        accessToken: credentials.access_token,
        tokenExpiry: credentials.expiry_date,
        tokenRefreshedAt: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)

    return credentials.access_token
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message)
    
    // Mark the connection as broken
    const updatedData = {
      ...supplier.data,
      googleCalendarSync: {
        ...supplier.data.googleCalendarSync,
        connectionError: 'Token refresh failed - user needs to reconnect',
        connectionErrorAt: new Date().toISOString(),
        needsReconnection: true
      }
    }

    await supabaseAdmin
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)

    throw error
  }
}

async function triggerAutomaticSync(primarySupplier, allUserSuppliers, supabaseAdmin) {
  try {
    console.log('🔄 === AUTOMATIC SYNC START ===')
    const googleSync = primarySupplier.data.googleCalendarSync
    
    if (!googleSync?.accessToken && !googleSync?.refreshToken) {
      console.error('❌ No tokens available for automatic sync')
      return
    }
    
    console.log('🔑 Setting up OAuth client...')
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    // Try with existing access token first
    let accessToken = googleSync.accessToken
    
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: googleSync.refreshToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Fetch CURRENT events from next 1 year
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
    console.log('📅 Fetching calendar events...')
    console.log('  - Time range:', timeMin, 'to', timeMax)
    
    let response
    try {
      response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      })
    } catch (apiError) {
      // If we get an auth error, try refreshing the token
      if (apiError.message.includes('invalid_grant') || apiError.message.includes('401')) {
        console.log('🔄 Access token expired, refreshing...')
        accessToken = await refreshGoogleToken(primarySupplier, supabaseAdmin)
        
        // Retry with new token
        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: googleSync.refreshToken
        })
        
        response = await calendar.events.list({
          calendarId: 'primary',
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime'
        })
      } else {
        throw apiError
      }
    }
    
    const events = response.data.items || []
    console.log(`📅 Found ${events.length} calendar events`)
    
    // Convert ONLY current events to blocked dates
    const blockedDates = []
    
    events.forEach((event, index) => {
      if (!event.start) return
      
      if (index < 5) { // Log first 5 events only
        console.log(`  Event ${index + 1}: ${event.summary || 'Untitled'} - ${event.start.date || event.start.dateTime}`)
      }
      
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
    
    console.log(`📊 Converted to ${blockedDates.length} blocked date entries`)
    
    // Update ALL suppliers (primary and themed)
    console.log(`💾 Updating ${allUserSuppliers.length} suppliers...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const supplier of allUserSuppliers) {
      try {
        const isPrimary = supplier.id === primarySupplier.id
        
        console.log(`  Updating ${isPrimary ? 'PRIMARY' : 'THEMED'}: ${supplier.data.name}`)
        
        // Keep manual blocks, REPLACE all google-calendar blocks
        const currentUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = currentUnavailable.filter(item => 
          item.source !== 'google-calendar'
        )
        
        console.log(`    - Manual blocks: ${manualBlocks.length}`)
        console.log(`    - Calendar blocks: ${blockedDates.length}`)
        
        const allBlocked = [...manualBlocks, ...blockedDates]
        
        const updatedData = {
          ...supplier.data,
          unavailableDates: allBlocked,
          busyDates: blockedDates,
          googleCalendarSync: {
            ...supplier.data.googleCalendarSync,
            lastSync: new Date().toISOString(),
            syncedEvents: events.map(e => ({ id: e.id, title: e.summary })),
            lastAutomaticSync: new Date().toISOString(),
            // Clear any error flags on successful sync
            connectionError: null,
            connectionErrorAt: null,
            needsReconnection: false
          },
          updatedAt: new Date().toISOString()
        }
        
        console.log(`    - Total blocked: ${allBlocked.length}`)
        
        const { error: updateError } = await supabaseAdmin
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)
        
        if (updateError) {
          console.error(`    ❌ Update failed:`, updateError.message)
          errorCount++
        } else {
          console.log(`    ✅ Update successful`)
          successCount++
        }
        
      } catch (supplierError) {
        console.error(`    💥 Exception:`, supplierError.message)
        errorCount++
      }
    }
    
    console.log(`✅ Sync complete: ${successCount} success, ${errorCount} errors`)
    console.log('🔄 === AUTOMATIC SYNC END ===')
    
  } catch (error) {
    console.error('❌ Automatic sync failed:', error.message)
    console.error('Stack:', error.stack)
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