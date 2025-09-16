// app/api/auth/google-calendar/callback/route.js
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  console.log('Google Calendar OAuth callback started')
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.log('OAuth error:', error)
    return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=' + error, request.url))
  }

  if (!code) {
    console.log('No authorization code received')
    return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=no_code', request.url))
  }

  try {
    // Exchange authorization code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
    )

    console.log('Exchanging code for tokens')
    const response = await oauth2Client.getToken(code)
    const tokens = response.tokens
    
    console.log('Tokens received successfully')

    // Get user info to determine account type
    oauth2Client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    
    const isWorkspaceAccount = !!userInfo.data.hd
    const workspaceDomain = userInfo.data.hd || null
    
    console.log('Account type:', isWorkspaceAccount ? `Google Workspace (${workspaceDomain})` : 'Personal Gmail')

    // Find all primary suppliers to update
    const { data: allPrimarySuppliers, error: queryError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_primary', true)

    if (queryError || !allPrimarySuppliers?.length) {
      console.log('No primary suppliers found')
      return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=no_suppliers', request.url))
    }

    console.log(`Updating ${allPrimarySuppliers.length} suppliers`)

    let workspaceCount = 0
    let webhookErrors = 0

    // Update all primary suppliers
    for (const supplier of allPrimarySuppliers) {
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
        // New fields for account type detection
        isWorkspaceAccount,
        workspaceDomain,
        userEmail: userInfo.data.email,
        automaticSync: isWorkspaceAccount,
        webhooksEnabled: false
      }

      // Try to set up webhooks for Workspace accounts
      if (isWorkspaceAccount) {
        try {
          console.log('Setting up webhooks for Workspace account:', supplier.data.name)
          
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
          const channelId = `supplier-${supplier.id}-${Date.now()}`
          const webhookUrl = `${process.env.NEXTAUTH_URL}/api/calendar/webhook`
          
          const watchResponse = await calendar.events.watch({
            calendarId: 'primary',
            requestBody: {
              id: channelId,
              type: 'web_hook',
              address: webhookUrl,
              expiration: String(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days
            }
          })
          
          // Add webhook info to sync data
          googleCalendarSync.webhooksEnabled = true
          googleCalendarSync.webhookChannelId = channelId
          googleCalendarSync.webhookResourceId = watchResponse.data.resourceId
          googleCalendarSync.webhookExpiration = watchResponse.data.expiration
          
          console.log('Webhooks enabled for:', supplier.data.name)
          workspaceCount++
          
        } catch (webhookError) {
          console.error('Failed to enable webhooks for:', supplier.data.name, webhookError.message)
          webhookErrors++
          // Continue with manual sync for this supplier
        }
      }

      // Update supplier data
      const updatedData = {
        ...supplier.data,
        googleCalendarSync,
        updatedAt: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ data: updatedData })
        .eq('id', supplier.id)

      if (updateError) {
        console.error('Failed to update supplier:', supplier.data.name, updateError)
      } else {
        console.log('Updated supplier:', supplier.data.name)
      }
    }

    console.log(`Connection completed: ${workspaceCount} automatic, ${allPrimarySuppliers.length - workspaceCount} manual`)
    
    const params = new URLSearchParams({
      calendar_connected: 'true',
      workspace_accounts: workspaceCount.toString(),
      total_accounts: allPrimarySuppliers.length.toString()
    })

    return NextResponse.redirect(new URL(`/suppliers/dashboard?${params}`, request.url))

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/suppliers/dashboard?calendar_error=callback_failed', request.url))
  }
}