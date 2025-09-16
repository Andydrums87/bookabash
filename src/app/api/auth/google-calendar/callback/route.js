// app/api/auth/google-calendar/callback/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  console.log('🚀 Google Calendar OAuth callback started')
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.log('❌ OAuth error:', error)
    return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=' + error, request.url))
  }

  if (!code) {
    console.log('❌ No authorization code received')
    return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=no_code', request.url))
  }

  try {
    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
    )

    console.log('🔄 Exchanging authorization code for tokens...')
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    console.log('✅ Tokens received successfully')
    console.log('Token expiry:', new Date(tokens.expiry_date))

    // Get user info to determine account type
    let userInfo = null
    let isWorkspaceAccount = false
    let workspaceDomain = null
    let userEmail = 'unknown'

    try {
      console.log('🔄 Fetching user information...')
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const userInfoResponse = await oauth2.userinfo.get()
      userInfo = userInfoResponse.data
      
      isWorkspaceAccount = !!userInfo.hd
      workspaceDomain = userInfo.hd || null
      userEmail = userInfo.email || 'unknown'
      
      console.log('✅ User info retrieved:', {
        email: userEmail,
        isWorkspace: isWorkspaceAccount,
        domain: workspaceDomain
      })
      
    } catch (userInfoError) {
      console.error('⚠️ Failed to get user info, using fallback detection:', userInfoError.message)
      
      // Fallback: try to detect from token info
      try {
        const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token)
        userEmail = tokenInfo.email || 'unknown'
        isWorkspaceAccount = userEmail.includes('@') && !userEmail.endsWith('@gmail.com')
        workspaceDomain = isWorkspaceAccount ? userEmail.split('@')[1] : null
        
        console.log('✅ Fallback detection:', { userEmail, isWorkspaceAccount, workspaceDomain })
      } catch (fallbackError) {
        console.error('⚠️ Fallback detection also failed:', fallbackError.message)
        // Continue with defaults
      }
    }

    console.log('🔄 Finding specific supplier for testing...')
    const { data: allPrimarySuppliers, error: queryError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', 'fd2a4e94-fb2b-4530-ae03-c73319305877')
    if (queryError) {
      console.error('❌ Database query error:', queryError)
      return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=db_error', request.url))
    }

    if (!allPrimarySuppliers?.length) {
      console.log('❌ No primary suppliers found')
      return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=no_suppliers', request.url))
    }

    console.log(`📋 Found ${allPrimarySuppliers.length} suppliers to update`)

    let workspaceCount = 0
    let webhookErrors = 0
    let totalUpdated = 0

    // Update all primary suppliers
    for (const supplier of allPrimarySuppliers) {
      try {
        console.log(`🔄 Processing supplier: ${supplier.data?.name || supplier.id}`)

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
          // Account type detection
          isWorkspaceAccount,
          workspaceDomain,
          userEmail,
          automaticSync: isWorkspaceAccount,
          webhooksEnabled: false
        }

        // Try to set up webhooks for Workspace accounts
        if (isWorkspaceAccount) {
          console.log(`🔔 Setting up webhooks for Workspace account: ${supplier.data?.name}`)
          
          try {
            // Test calendar access first
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            console.log('🔄 Testing calendar access...')
            
            const calendarTest = await calendar.calendars.get({ calendarId: 'primary' })
            console.log('✅ Calendar access confirmed:', calendarTest.data.summary)
            
            // Set up webhook
            const channelId = `supplier-${supplier.id}-${Date.now()}`
            const webhookUrl = `${process.env.NEXTAUTH_URL}/api/calendar/webhook`
            
            console.log('🔄 Creating webhook:', {
              channelId,
              webhookUrl,
              calendarId: 'primary'
            })
            
            const watchResponse = await calendar.events.watch({
              calendarId: 'primary',
              requestBody: {
                id: channelId,
                type: 'web_hook',
                address: webhookUrl,
                expiration: String(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days
              }
            })
            
            console.log('✅ Webhook created successfully:', {
              channelId: watchResponse.data.id,
              resourceId: watchResponse.data.resourceId,
              expiration: new Date(parseInt(watchResponse.data.expiration)).toISOString()
            })
            
            // Add webhook info to sync data
            googleCalendarSync.webhooksEnabled = true
            googleCalendarSync.webhookChannelId = channelId
            googleCalendarSync.webhookResourceId = watchResponse.data.resourceId
            googleCalendarSync.webhookExpiration = watchResponse.data.expiration
            googleCalendarSync.webhookCreatedAt = new Date().toISOString()
            googleCalendarSync.webhookExpiresAt = new Date(parseInt(watchResponse.data.expiration)).toISOString()
            
            workspaceCount++
            
          } catch (webhookError) {
            console.error(`❌ Webhook setup failed for ${supplier.data?.name}:`, {
              message: webhookError.message,
              code: webhookError.code,
              status: webhookError.status
            })
            
            webhookErrors++
            // Continue with manual sync setup
            googleCalendarSync.webhookError = webhookError.message
            googleCalendarSync.webhookErrorAt = new Date().toISOString()
          }
        } else {
          console.log(`📧 Personal Gmail account - manual sync only: ${supplier.data?.name}`)
        }

        // Update supplier in database
        const updatedData = {
          ...supplier.data,
          googleCalendarSync,
          updatedAt: new Date().toISOString()
        }

        console.log(`💾 Updating supplier database record...`)
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)

        if (updateError) {
          console.error(`❌ Failed to update supplier ${supplier.data?.name}:`, updateError)
        } else {
          console.log(`✅ Successfully updated supplier: ${supplier.data?.name}`)
          totalUpdated++
        }

      } catch (supplierError) {
        console.error(`❌ Error processing supplier ${supplier.data?.name}:`, supplierError)
      }
    }

    // Log final results
    console.log('🎉 OAuth callback completed:', {
      totalSuppliers: allPrimarySuppliers.length,
      totalUpdated,
      workspaceAccounts: workspaceCount,
      manualAccounts: totalUpdated - workspaceCount,
      webhookErrors
    })
    
    // Build success redirect with parameters
    const params = new URLSearchParams({
      calendar_connected: 'true',
      workspace_accounts: workspaceCount.toString(),
      total_accounts: totalUpdated.toString(),
      webhook_errors: webhookErrors.toString()
    })

    const redirectUrl = `/suppliers/dashboard?${params.toString()}`
    console.log('🔄 Redirecting to:', redirectUrl)
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))

  } catch (error) {
    console.error('❌ OAuth callback failed:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    
    return NextResponse.redirect(
      new URL('/suppliers/dashboard?calendar_error=callback_failed&details=' + encodeURIComponent(error.message), request.url)
    )
  }
}