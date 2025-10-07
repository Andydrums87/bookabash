// app/api/auth/google-calendar/callback/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin' // ✅ CHANGE THIS

export async function GET(request) {
  console.log('Google Calendar OAuth callback started')
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.log('OAuth error:', error)
    return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=' + error, request.url))
  }

  if (!code) {
    console.log('No authorization code received')
    return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=no_code', request.url))
  }

  if (!state) {
    console.log('No user ID in state parameter')
    return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=invalid_state', request.url))
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
    )

    console.log('Exchanging authorization code for tokens...')
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    console.log('Tokens received successfully')

    // Get user info
    let userEmail = 'unknown'
    let userName = 'Unknown User'
    let isWorkspaceAccount = false
    let workspaceDomain = null

    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const userInfoResponse = await oauth2.userinfo.get()
      const userInfo = userInfoResponse.data
      
      isWorkspaceAccount = !!userInfo.hd
      workspaceDomain = userInfo.hd || null
      userEmail = userInfo.email || 'unknown'
      userName = userInfo.name || 'Unknown User'
      
      console.log('User info:', {
        email: userEmail,
        name: userName,
        isWorkspace: isWorkspaceAccount,
        domain: workspaceDomain
      })
      
    } catch (userInfoError) {
      console.error('Failed to get user info:', userInfoError.message)
    }

    console.log('Finding all suppliers for user ID:', state)
    
    // ✅ CHANGE: Use supabaseAdmin instead of supabase
    const { data: allSuppliers, error: queryError } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('auth_user_id', state)

    if (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=db_error', request.url))
    }

    if (!allSuppliers?.length) {
      console.log('No suppliers found for user:', state)
      return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=no_suppliers', request.url))
    }

    // Find the primary supplier to create webhook on
    const primarySupplier = allSuppliers.find(s => s.is_primary || s.data?.isPrimary)
    
    if (!primarySupplier) {
      console.error('No primary supplier found')
      return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=no_primary', request.url))
    }

    console.log(`Found primary supplier: ${primarySupplier.data?.name}`)
    console.log(`Total suppliers to update: ${allSuppliers.length}`)

    // Prepare base calendar sync data for primary
    let primaryGoogleCalendarSync = {
      enabled: true,
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date,
      calendarId: 'primary',
      syncFrequency: 'realtime',
      lastSync: null,
      syncedEvents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isWorkspaceAccount,
      workspaceDomain,
      userEmail,
      userName, // ✅ ADD THIS
      automaticSync: true,
      webhooksEnabled: false
    }

    let webhookCreated = false
    let webhookError = null

    // Try to set up webhook on primary supplier
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      console.log('Testing calendar access...')
      const calendarTest = await calendar.calendars.get({ calendarId: 'primary' })
      console.log('Calendar access confirmed:', calendarTest.data.summary)
      
      const channelId = `supplier-${primarySupplier.id}-${Date.now()}`
      const webhookUrl = `${process.env.NEXTAUTH_URL}/api/calendar/webhook`
      
      console.log('Creating webhook:', { channelId, webhookUrl })
      
      const watchResponse = await calendar.events.watch({
        calendarId: 'primary',
        requestBody: {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          expiration: String(Date.now() + (30 * 24 * 60 * 60 * 1000))
        }
      })
      
      console.log('Webhook created successfully')
      
      primaryGoogleCalendarSync.webhooksEnabled = true
      primaryGoogleCalendarSync.webhookChannelId = channelId
      primaryGoogleCalendarSync.webhookResourceId = watchResponse.data.resourceId
      primaryGoogleCalendarSync.webhookExpiration = watchResponse.data.expiration
      primaryGoogleCalendarSync.webhookCreatedAt = new Date().toISOString()
      primaryGoogleCalendarSync.webhookExpiresAt = new Date(parseInt(watchResponse.data.expiration)).toISOString()
      
      webhookCreated = true
      
    } catch (error) {
      console.error('Webhook setup failed:', error.message)
      webhookError = error.message
      primaryGoogleCalendarSync.webhookError = error.message
      primaryGoogleCalendarSync.webhookErrorAt = new Date().toISOString()
    }

    // Sync calendar immediately after connecting to get initial blocked dates
    let initialBlockedDates = []
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const timeMin = new Date().toISOString()
      const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      
      console.log('Fetching initial calendar events...')
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      })
      
      const events = response.data.items || []
      console.log(`Found ${events.length} initial calendar events`)
      
      // Convert events to blocked dates
      events.forEach((event) => {
        if (!event.start) return
        
        if (event.start.date) {
          initialBlockedDates.push({
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
            initialBlockedDates.push({
              date,
              timeSlots,
              source: 'google-calendar',
              eventTitle: event.summary || 'Calendar Event'
            })
          }
        }
      })
      
      console.log(`Converted to ${initialBlockedDates.length} blocked dates`)
    } catch (syncError) {
      console.error('Initial calendar sync failed:', syncError)
    }

    // Update all suppliers with connection AND initial calendar data
    let updateCount = 0
    
    for (const supplier of allSuppliers) {
      try {
        const isPrimary = supplier.id === primarySupplier.id
        
        // Merge existing manual blocks with new calendar blocks
        const existingUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = existingUnavailable.filter(item => item.source !== 'google-calendar')
        const allBlocked = [...manualBlocks, ...initialBlockedDates]
        
        let googleCalendarSync
        if (isPrimary) {
          // Primary supplier gets full connection data
          googleCalendarSync = {
            ...primaryGoogleCalendarSync,
            lastSync: initialBlockedDates.length > 0 ? new Date().toISOString() : null
          }
        } else {
          // Themed suppliers get inherited connection reference
          googleCalendarSync = {
            inherited: true,
            connectedViaPrimary: true,
            primarySupplierId: primarySupplier.id,
            connected: true,
            webhooksEnabled: primaryGoogleCalendarSync.webhooksEnabled,
            userEmail: userEmail,
            userName: userName, // ✅ ADD THIS
            isWorkspaceAccount,
            lastSync: initialBlockedDates.length > 0 ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          }
        }
        
        const updatedData = {
          ...supplier.data,
          googleCalendarSync,
          unavailableDates: allBlocked,
          busyDates: initialBlockedDates,
          updatedAt: new Date().toISOString()
        }

        console.log(`Updating ${isPrimary ? 'primary' : 'themed'} supplier: ${supplier.data?.name}`)
        console.log(`  - Setting ${allBlocked.length} unavailable dates (${initialBlockedDates.length} from calendar)`)
        
        // ✅ CHANGE: Use supabaseAdmin instead of supabase
        const { error: updateError } = await supabaseAdmin
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)

        if (updateError) {
          console.error(`Failed to update supplier ${supplier.data?.name}:`, updateError)
        } else {
          updateCount++
          console.log(`Successfully updated: ${supplier.data?.name}`)
        }

      } catch (supplierError) {
        console.error(`Error processing supplier ${supplier.data?.name}:`, supplierError)
      }
    }

    console.log('OAuth callback completed:', {
      totalSuppliers: allSuppliers.length,
      suppliersUpdated: updateCount,
      webhookCreated,
      initialEventsSynced: initialBlockedDates.length,
      webhookError: webhookError || 'none'
    })
    
    const params = new URLSearchParams({
      calendar_connected: 'true',
      webhooks_enabled: webhookCreated ? '1' : '0',
      total_updated: updateCount.toString(),
      events_synced: initialBlockedDates.length.toString()
    })

    const redirectUrl = `/suppliers/availability?${params.toString()}`
    console.log('Redirecting to:', redirectUrl)
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))

  } catch (error) {
    console.error('OAuth callback failed:', error.message)
    
    return NextResponse.redirect(
      new URL('/suppliers/availability?calendar_error=callback_failed&details=' + encodeURIComponent(error.message), request.url)
    )
  }
}