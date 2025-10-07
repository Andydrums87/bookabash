import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'  // ✅ CHANGE THIS
import { google } from 'googleapis'

export async function GET(request) {
  try {
    console.log('🔄 Starting webhook renewal process...')
    
    // Get all suppliers with active calendar connections
    const { data: suppliers } = await supabaseAdmin 
      .from('suppliers')
      .select('*')
    
    if (!suppliers) {
      return NextResponse.json({ error: 'No suppliers found' }, { status: 404 })
    }

    let googleRenewed = 0
    let outlookRenewed = 0
    const errors = []

    for (const supplier of suppliers) {
      // Renew Google Calendar webhooks
      if (supplier.data?.googleCalendarSync?.webhookChannelId) {
        try {
          const result = await renewGoogleWebhook(supplier)
          if (result.renewed) googleRenewed++
        } catch (error) {
          console.error(`Failed to renew Google webhook for ${supplier.data.name}:`, error)
          errors.push({ supplier: supplier.data.name, type: 'google', error: error.message })
        }
      }

      // Renew Outlook Calendar webhooks
      if (supplier.data?.outlookCalendarSync?.subscriptionId) {
        try {
          const result = await renewOutlookWebhook(supplier)
          if (result.renewed) outlookRenewed++
        } catch (error) {
          console.error(`Failed to renew Outlook webhook for ${supplier.data.name}:`, error)
          errors.push({ supplier: supplier.data.name, type: 'outlook', error: error.message })
        }
      }
    }

    console.log(`✅ Webhook renewal complete: ${googleRenewed} Google, ${outlookRenewed} Outlook`)

    return NextResponse.json({
      success: true,
      googleRenewed,
      outlookRenewed,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Webhook renewal failed:', error)
    return NextResponse.json(
      { error: 'Webhook renewal failed', details: error.message },
      { status: 500 }
    )
  }
}

async function renewGoogleWebhook(supplier) {
  const googleSync = supplier.data.googleCalendarSync
  
  // Check if webhook is expiring within next 5 days
  const expiresAt = new Date(googleSync.webhookExpiresAt)
  const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  
  if (expiresAt > fiveDaysFromNow) {
    console.log(`⏭️  Google webhook for ${supplier.data.name} not expiring soon`)
    return { renewed: false, reason: 'not_expiring' }
  }

  console.log(`🔄 Renewing Google webhook for ${supplier.data.name}...`)

  // Set up OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: googleSync.accessToken,
    refresh_token: googleSync.refreshToken
  })

  // Stop old webhook
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    await calendar.channels.stop({
      requestBody: {
        id: googleSync.webhookChannelId,
        resourceId: googleSync.webhookResourceId
      }
    })
    console.log(`✅ Stopped old Google webhook for ${supplier.data.name}`)
  } catch (stopError) {
    console.log('⚠️  Failed to stop old webhook (might already be expired)')
  }

  // Create new webhook
  const newChannelId = `supplier-${supplier.id}-${Date.now()}`
  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/calendar/webhook`
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const watchResponse = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: newChannelId,
      type: 'web_hook',
      address: webhookUrl,
      expiration: String(Date.now() + (30 * 24 * 60 * 60 * 1000))
    }
  })

  // Update database with new webhook info
  const updatedData = {
    ...supplier.data,
    googleCalendarSync: {
      ...googleSync,
      webhookChannelId: newChannelId,
      webhookResourceId: watchResponse.data.resourceId,
      webhookExpiration: watchResponse.data.expiration,
      webhookExpiresAt: new Date(parseInt(watchResponse.data.expiration)).toISOString(),
      webhookRenewedAt: new Date().toISOString()
    }
  }

  await supabaseAdmin 
    .from('suppliers')
    .update({ data: updatedData })
    .eq('id', supplier.id)

  console.log(`✅ Renewed Google webhook for ${supplier.data.name}`)
  
  return { renewed: true }
}

async function renewOutlookWebhook(supplier) {
  const outlookSync = supplier.data.outlookCalendarSync
  const outlookTokens = supplier.data.outlookTokens
  
  // Check if webhook is expiring within next 2 days
  const expiresAt = new Date(outlookSync.subscriptionExpiry)
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  
  if (expiresAt > twoDaysFromNow) {
    console.log(`⏭️  Outlook webhook for ${supplier.data.name} not expiring soon`)
    return { renewed: false, reason: 'not_expiring' }
  }

  console.log(`🔄 Renewing Outlook webhook for ${supplier.data.name}...`)

  // Check if token needs refresh
  let accessToken = outlookTokens.accessToken
  if (new Date(outlookTokens.expiresAt) < new Date()) {
    console.log('🔄 Refreshing Outlook access token...')
    accessToken = await refreshOutlookToken(supplier)
  }

  // Renew the subscription (PATCH request to extend expiration)
  const newExpirationDateTime = new Date(Date.now() + 4320 * 60 * 1000).toISOString()
  
  const renewResponse = await fetch(
    `https://graph.microsoft.com/v1.0/subscriptions/${outlookSync.subscriptionId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expirationDateTime: newExpirationDateTime
      })
    }
  )

  if (!renewResponse.ok) {
    const errorText = await renewResponse.text()
    throw new Error(`Failed to renew Outlook subscription: ${errorText}`)
  }

  const renewedSubscription = await renewResponse.json()

  // Update database with new expiration
  const updatedData = {
    ...supplier.data,
    outlookCalendarSync: {
      ...outlookSync,
      subscriptionExpiry: renewedSubscription.expirationDateTime,
      subscriptionRenewedAt: new Date().toISOString()
    }
  }


  await supabaseAdmin 
    .from('suppliers')
    .update({ data: updatedData })
    .eq('id', supplier.id)

  console.log(`✅ Renewed Outlook webhook for ${supplier.data.name}`)
  
  return { renewed: true }
}

async function refreshOutlookToken(supplier) {
  const refreshToken = supplier.data.outlookTokens.refreshToken
  
  const tokenResponse = await fetch(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    }
  )

  if (!tokenResponse.ok) {
    throw new Error('Token refresh failed')
  }

  const tokens = await tokenResponse.json()

  // Update tokens in database
  const updatedData = {
    ...supplier.data,
    outlookTokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }
  }

  await supabaseAdmin 
    .from('suppliers')
    .update({ data: updatedData })
    .eq('id', supplier.id)

  return tokens.access_token
}