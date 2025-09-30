// app/api/auth/google-calendar/callback/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  console.log('Google Calendar OAuth callback started')
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // User ID passed from initial auth request
  const error = searchParams.get('error')

  // Handle OAuth errors
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
    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
    )

    console.log('Exchanging authorization code for tokens...')
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    console.log('Tokens received successfully')
    console.log('Token expiry:', new Date(tokens.expiry_date))

    // Get user info to determine account type
    let userInfo = null
    let isWorkspaceAccount = false
    let workspaceDomain = null
    let userEmail = 'unknown'

    try {
      console.log('Fetching user information...')
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const userInfoResponse = await oauth2.userinfo.get()
      userInfo = userInfoResponse.data
      
      isWorkspaceAccount = !!userInfo.hd
      workspaceDomain = userInfo.hd || null
      userEmail = userInfo.email || 'unknown'
      
      console.log('User info retrieved:', {
        email: userEmail,
        isWorkspace: isWorkspaceAccount,
        domain: workspaceDomain
      })
      
    } catch (userInfoError) {
      console.error('Failed to get user info:', userInfoError.message)
    }

    console.log('Finding supplier for user ID:', state)
    
    // Get the supplier using the user ID from state parameter
    const { data: suppliers, error: queryError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('auth_user_id', state)
      .eq('is_primary', true)

    if (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=db_error', request.url))
    }

    if (!suppliers?.length) {
      console.log('No primary suppliers found for user:', state)
      return NextResponse.redirect(new URL('/suppliers/availability?calendar_error=no_suppliers', request.url))
    }

    console.log(`Found ${suppliers.length} suppliers to update`)

    let workspaceCount = 0
    let webhookErrors = 0
    let totalUpdated = 0

    // Update all primary suppliers for this user
    for (const supplier of suppliers) {
      try {
        console.log(`Processing supplier: ${supplier.data?.name || supplier.id}`)

        // Prepare base sync configuration
        let googleCalendarSync = {
          enabled: true,
          connected: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expiry_date,
          calendarId: 'primary',
          syncFrequency: 'daily',
          filterMode: 'all-day-events',
          lastSync: null,
          syncedEvents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isWorkspaceAccount,
          workspaceDomain,
          userEmail,
          automaticSync: isWorkspaceAccount,
          webhooksEnabled: false
        }

        // Try to set up webhooks for Workspace accounts
        if (isWorkspaceAccount) {
          console.log(`Setting up webhooks for Workspace account: ${supplier.data?.name}`)
          
          try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            console.log('Testing calendar access...')
            
            const calendarTest = await calendar.calendars.get({ calendarId: 'primary' })
            console.log('Calendar access confirmed:', calendarTest.data.summary)
            
            // Set up webhook
            const channelId = `supplier-${supplier.id}-${Date.now()}`
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
            
            googleCalendarSync.webhooksEnabled = true
            googleCalendarSync.webhookChannelId = channelId
            googleCalendarSync.webhookResourceId = watchResponse.data.resourceId
            googleCalendarSync.webhookExpiration = watchResponse.data.expiration
            googleCalendarSync.webhookCreatedAt = new Date().toISOString()
            googleCalendarSync.webhookExpiresAt = new Date(parseInt(watchResponse.data.expiration)).toISOString()
            
            workspaceCount++
            
          } catch (webhookError) {
            console.error(`Webhook setup failed:`, webhookError.message)
            webhookErrors++
            googleCalendarSync.webhookError = webhookError.message
            googleCalendarSync.webhookErrorAt = new Date().toISOString()
          }
        } else {
          console.log(`Personal Gmail account - manual sync only: ${supplier.data?.name}`)
        }

        // Update supplier in database
        const updatedData = {
          ...supplier.data,
          googleCalendarSync,
          updatedAt: new Date().toISOString()
        }

        console.log('Updating supplier database record...')
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)

        if (updateError) {
          console.error(`Failed to update supplier:`, updateError)
        } else {
          console.log(`Successfully updated supplier: ${supplier.data?.name}`)
          totalUpdated++
        }

      } catch (supplierError) {
        console.error(`Error processing supplier:`, supplierError)
      }
    }

    // Log final results
    console.log('OAuth callback completed:', {
      totalSuppliers: suppliers.length,
      totalUpdated,
      workspaceAccounts: workspaceCount,
      manualAccounts: totalUpdated - workspaceCount,
      webhookErrors
    })
    
    // Build success redirect
    const params = new URLSearchParams({
      calendar_connected: 'true',
      workspace_accounts: workspaceCount.toString(),
      total_accounts: totalUpdated.toString(),
      webhook_errors: webhookErrors.toString()
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