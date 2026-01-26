// app/api/auth/google-calendar/callback/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin' // ✅ CHANGE THIS

export async function GET(request) {
  console.log('🔵 Google Calendar OAuth callback started')
  console.log('🔵 Request URL:', request.url)

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  console.log('🔵 OAuth params:', { code: code?.substring(0, 20) + '...', state, error })

  if (error) {
    console.log('❌ OAuth error:', error)
    return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=' + error, request.url))
  }

  if (!code) {
    console.log('❌ No authorization code received')
    return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=no_code', request.url))
  }

  if (!state) {
    console.log('❌ No user ID in state parameter')
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
    console.log('Granted scopes:', tokens.scope)

    // Check if calendar scope was granted
    const grantedScopes = tokens.scope || ''
    const hasCalendarScope = grantedScopes.includes('https://www.googleapis.com/auth/calendar')

    if (!hasCalendarScope) {
      console.error('❌ Calendar scope not granted. User only granted:', grantedScopes)
      const isWizard = state?.startsWith('wizard-')
      const redirectPath = isWizard ? '/suppliers/onboarding/new-supplier' : '/suppliers/availability'
      return NextResponse.redirect(
        new URL(`${redirectPath}?calendar_error=missing_calendar_scope`, request.url)
      )
    }

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
      
      console.log('User info retrieved successfully')
      
    } catch (userInfoError) {
      console.error('Failed to get user info:', userInfoError.message)
    }

    // Check if this is a wizard flow (state starts with 'wizard-')
    const isWizardFlow = state?.startsWith('wizard-')
    // Check if this is a per-business connection (state contains ':business:')
    const isPerBusinessFlow = state?.includes(':business:')
    // Check if wizard flow includes supplier ID (format: wizard-{userId}:supplier:{supplierId})
    const isWizardWithSupplier = isWizardFlow && state?.includes(':supplier:')

    let actualUserId = state
    let targetSupplierId = null

    if (isWizardWithSupplier) {
      // Format: wizard-{userId}:supplier:{supplierId}
      const withoutPrefix = state.replace('wizard-', '')
      const [userId, , supplierId] = withoutPrefix.split(':supplier:')
      actualUserId = userId
      targetSupplierId = withoutPrefix.split(':supplier:')[1]
      console.log('🔵 Wizard flow with specific supplier:', { userId: actualUserId, supplierId: targetSupplierId })
    } else if (isWizardFlow) {
      actualUserId = state.replace('wizard-', '')
    } else if (isPerBusinessFlow) {
      const [userId, , supplierId] = state.split(':business:')
      actualUserId = userId
      targetSupplierId = state.split(':business:')[1]
      console.log('🔵 Per-business calendar connection detected:', { userId: actualUserId, supplierId: targetSupplierId })
    }

    // Handle per-business calendar connection (connect to a specific business only)
    if (isPerBusinessFlow && targetSupplierId) {
      console.log('🔵 Processing per-business calendar connection for supplier:', targetSupplierId)

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      // Set up webhook for real-time updates
      let webhookData = {
        webhooksEnabled: false
      }

      try {
        console.log('🔵 Setting up webhook for per-business connection...')
        const channelId = `supplier-${targetSupplierId}-${Date.now()}`
        const webhookUrl = `${process.env.NEXTAUTH_URL}/api/calendar/webhook`

        const watchResponse = await calendar.events.watch({
          calendarId: 'primary',
          requestBody: {
            id: channelId,
            type: 'web_hook',
            address: webhookUrl,
            expiration: String(Date.now() + (30 * 24 * 60 * 60 * 1000))
          }
        })

        console.log('🔵 Webhook created successfully for per-business')
        webhookData = {
          webhooksEnabled: true,
          webhookChannelId: channelId,
          webhookResourceId: watchResponse.data.resourceId,
          webhookExpiration: watchResponse.data.expiration,
          webhookCreatedAt: new Date().toISOString(),
          webhookExpiresAt: new Date(parseInt(watchResponse.data.expiration)).toISOString()
        }
      } catch (webhookError) {
        console.error('🔵 Webhook setup failed for per-business:', webhookError.message)
        webhookData.webhookError = webhookError.message
        webhookData.webhookErrorAt = new Date().toISOString()
      }

      // Sync calendar immediately to get initial blocked dates
      let initialBlockedDates = []
      try {
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
        console.log(`🔵 Found ${events.length} calendar events for per-business sync`)

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
      } catch (syncError) {
        console.error('Calendar sync failed for per-business:', syncError)
      }

      // Update only the specific supplier
      const { data: supplier, error: fetchError } = await supabaseAdmin
        .from('suppliers')
        .select('*')
        .eq('id', targetSupplierId)
        .single()

      if (fetchError || !supplier) {
        console.error('Failed to fetch target supplier:', fetchError)
        return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=supplier_not_found', request.url))
      }

      // Merge existing manual blocks with new calendar blocks
      const existingUnavailable = supplier.data?.unavailableDates || []
      const manualBlocks = existingUnavailable.filter(item => item.source !== 'google-calendar')
      const allBlocked = [...manualBlocks, ...initialBlockedDates]

      const updatedData = {
        ...supplier.data,
        googleCalendarSync: {
          enabled: true,
          connected: true,
          inherited: false,  // This is its own connection
          ownConnection: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: Date.now() + (tokens.expires_in * 1000),
          calendarId: 'primary',
          syncFrequency: 'realtime',
          lastSync: initialBlockedDates.length > 0 ? new Date().toISOString() : null,
          syncedEvents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isWorkspaceAccount,
          workspaceDomain,
          userEmail,
          userName,
          automaticSync: true,
          ...webhookData
        },
        unavailableDates: allBlocked,
        busyDates: initialBlockedDates,
        updatedAt: new Date().toISOString()
      }

      const { error: updateError } = await supabaseAdmin
        .from('suppliers')
        .update({ data: updatedData })
        .eq('id', targetSupplierId)

      if (updateError) {
        console.error('Failed to update supplier with calendar:', updateError)
        return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=update_failed', request.url))
      }

      console.log('✅ Per-business calendar connected successfully')

      const params = new URLSearchParams({
        calendar_connected: 'true',
        provider: 'google',
        per_business: 'true',
        events_synced: initialBlockedDates.length.toString()
      })

      return NextResponse.redirect(new URL(`/suppliers/availability?${params.toString()}`, request.url))
    }

    if (isWizardFlow) {
      console.log('🔵 Wizard flow detected - fetching calendar data and updating supplier', actualUserId)
      if (targetSupplierId) {
        console.log('🔵 Target supplier ID from wizard:', targetSupplierId)
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      // Sync calendar immediately to get initial blocked dates
      let initialBlockedDates = []
      try {
        const timeMin = new Date().toISOString()
        const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

        console.log('🔵 Fetching calendar events for onboarding...')
        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime'
        })

        const events = response.data.items || []
        console.log(`🔵 Found ${events.length} calendar events`)

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

        console.log(`🔵 Converted to ${initialBlockedDates.length} blocked dates`)
      } catch (syncError) {
        console.error('🔵 Calendar sync failed for onboarding:', syncError)
      }

      // Update supplier record directly in database
      try {
        let supplier

        // If we have a specific supplier ID from the wizard, use that
        if (targetSupplierId) {
          console.log('🔵 Finding specific supplier by ID:', targetSupplierId)
          const { data: supplierData, error: fetchError } = await supabaseAdmin
            .from('suppliers')
            .select('*')
            .eq('id', targetSupplierId)
            .single()

          if (fetchError || !supplierData) {
            console.error('❌ Supplier not found by ID:', targetSupplierId, fetchError)
            throw new Error('Supplier not found')
          }
          supplier = supplierData
        } else {
          // Fallback: find by user ID (old behavior)
          console.log('🔵 Finding supplier for user ID:', actualUserId)
          const { data: suppliers, error: fetchError } = await supabaseAdmin
            .from('suppliers')
            .select('*')
            .eq('auth_user_id', actualUserId)

          if (fetchError || !suppliers || suppliers.length === 0) {
            console.error('❌ No supplier found for user:', actualUserId, fetchError)
            throw new Error('Supplier not found')
          }
          supplier = suppliers[0]
        }

        console.log('✅ Found supplier:', supplier.id)

        // Set up webhook for real-time updates
        let webhookData = {
          webhooksEnabled: false
        }

        try {
          console.log('🔵 Setting up webhook for wizard flow...')
          const channelId = `supplier-${supplier.id}-${Date.now()}`
          const webhookUrl = `${process.env.NEXTAUTH_URL}/api/calendar/webhook`

          const watchResponse = await calendar.events.watch({
            calendarId: 'primary',
            requestBody: {
              id: channelId,
              type: 'web_hook',
              address: webhookUrl,
              expiration: String(Date.now() + (30 * 24 * 60 * 60 * 1000))
            }
          })

          console.log('🔵 Webhook created successfully for wizard flow')
          webhookData = {
            webhooksEnabled: true,
            webhookChannelId: channelId,
            webhookResourceId: watchResponse.data.resourceId,
            webhookExpiration: watchResponse.data.expiration,
            webhookCreatedAt: new Date().toISOString(),
            webhookExpiresAt: new Date(parseInt(watchResponse.data.expiration)).toISOString()
          }
        } catch (webhookError) {
          console.error('🔵 Webhook setup failed for wizard flow:', webhookError.message)
          webhookData.webhookError = webhookError.message
          webhookData.webhookErrorAt = new Date().toISOString()
        }

        // Update supplier with calendar data
        const updatedData = {
          ...supplier.data,
          unavailableDates: initialBlockedDates,
          busyDates: initialBlockedDates,
          googleCalendarSync: {
            enabled: true,
            connected: true,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: Date.now() + (tokens.expires_in * 1000),
            calendarId: 'primary',
            syncFrequency: 'realtime',
            lastSync: new Date().toISOString(),
            syncedEvents: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isWorkspaceAccount: isWorkspaceAccount,
            workspaceDomain: workspaceDomain,
            userEmail: userEmail,
            userName: userName,
            automaticSync: true,
            ...webhookData
          },
          calendarIntegration: {
            enabled: true,
            provider: 'google',
            connectedAt: new Date().toISOString(),
            eventsSynced: initialBlockedDates.length
          },
          updatedAt: new Date().toISOString()
        }

        const { error: updateError } = await supabaseAdmin
          .from('suppliers')
          .update({
            data: updatedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', supplier.id)

        if (updateError) {
          console.error('❌ Failed to update supplier:', updateError)
          throw updateError
        }

        console.log('✅ Supplier updated with calendar data')
      } catch (dbError) {
        console.error('❌ Database error:', dbError)
        // Continue with redirect even if DB update fails
      }

      const params = new URLSearchParams({
        calendar_connected: 'true',
        provider: 'google',
        events_synced: initialBlockedDates.length.toString()
      })

      const redirectUrl = `/suppliers/onboarding/new-supplier?${params.toString()}`
      console.log('🔵 Redirecting back to wizard')

      return NextResponse.redirect(
        new URL(redirectUrl, request.url)
      )
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

    console.log('Found primary supplier:', primarySupplier.id)
    console.log(`Total suppliers to update: ${allSuppliers.length}`)

    // Prepare base calendar sync data for primary
    let primaryGoogleCalendarSync = {
      enabled: true,
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: Date.now() + (tokens.expires_in * 1000),
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
      await calendar.calendars.get({ calendarId: 'primary' })
      console.log('Calendar access confirmed')
      
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

        console.log(`Updating ${isPrimary ? 'primary' : 'themed'} supplier: ${supplier.id}`)
        console.log(`  - Setting ${allBlocked.length} unavailable dates (${initialBlockedDates.length} from calendar)`)
        
        // ✅ CHANGE: Use supabaseAdmin instead of supabase
        const { error: updateError } = await supabaseAdmin
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)

        if (updateError) {
          console.error(`Failed to update supplier ${supplier.id}:`, updateError)
        } else {
          updateCount++
          console.log(`Successfully updated supplier: ${supplier.id}`)
        }

      } catch (supplierError) {
        console.error(`Error processing supplier ${supplier.id}:`, supplierError)
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
      provider: 'google',
      webhooks_enabled: webhookCreated ? '1' : '0',
      total_updated: updateCount.toString(),
      events_synced: initialBlockedDates.length.toString()
    })

    // Dashboard flow - redirect to availability page
    const redirectUrl = `/suppliers/availability?${params.toString()}`
    console.log('Redirecting to:', redirectUrl)
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))

  } catch (error) {
    console.error('❌ OAuth callback failed:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)

    // If onboarding, redirect back to wizard with error
    const isOnboarding = state === 'onboarding'
    const errorRedirect = isOnboarding
      ? `/suppliers/onboarding/new-supplier?calendar_error=callback_failed&details=${encodeURIComponent(error.message)}`
      : `/suppliers/availability?calendar_error=callback_failed&details=${encodeURIComponent(error.message)}`

    return NextResponse.redirect(
      new URL(errorRedirect, request.url)
    )
  }
}