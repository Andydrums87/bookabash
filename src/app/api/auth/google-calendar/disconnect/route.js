// app/api/auth/google-calendar/disconnect/route.js
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { google } from 'googleapis'

export async function POST(request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('Disconnecting Google Calendar for user:', userId)

    // Get all suppliers for this user
    const { data: userSuppliers, error: fetchError } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('auth_user_id', userId)

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
    }

    if (!userSuppliers || userSuppliers.length === 0) {
      console.log('No suppliers found for user')
      return NextResponse.json({ error: 'No suppliers found' }, { status: 404 })
    }

    console.log(`Found ${userSuppliers.length} suppliers to disconnect`)

    // Find the primary supplier with the webhook
    const primarySupplier = userSuppliers.find(s => 
      (s.is_primary || s.data?.isPrimary) && 
      s.data?.googleCalendarSync?.webhookChannelId
    )

    // Stop the webhook if it exists
    if (primarySupplier?.data?.googleCalendarSync?.webhookChannelId) {
      try {
        console.log('Stopping webhook for primary supplier:', primarySupplier.data.name)
        
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        )

        oauth2Client.setCredentials({
          access_token: primarySupplier.data.googleCalendarSync.accessToken,
          refresh_token: primarySupplier.data.googleCalendarSync.refreshToken
        })

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        
        await calendar.channels.stop({
          requestBody: {
            id: primarySupplier.data.googleCalendarSync.webhookChannelId,
            resourceId: primarySupplier.data.googleCalendarSync.webhookResourceId
          }
        })
        
        console.log('✅ Webhook stopped successfully')
      } catch (webhookError) {
        console.log('⚠️ Failed to stop webhook (may already be stopped):', webhookError.message)
        // Continue anyway - we still want to disconnect
      }
    }

    // Update all suppliers to remove Google Calendar connection
    let disconnectCount = 0
    
    for (const supplier of userSuppliers) {
      try {
        // Remove all google-calendar blocked dates
        const currentUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = currentUnavailable.filter(item => 
          item.source !== 'google-calendar'
        )

        const updatedData = {
          ...supplier.data,
          unavailableDates: manualBlocks,
          busyDates: [], // Clear busy dates
          googleCalendarSync: {
            enabled: false,
            connected: false,
            disconnectedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        }

        const { error: updateError } = await supabaseAdmin
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)

        if (updateError) {
          console.error(`Failed to disconnect supplier ${supplier.data.name}:`, updateError)
        } else {
          console.log(`✅ Disconnected: ${supplier.data.name}`)
          disconnectCount++
        }

      } catch (supplierError) {
        console.error(`Error disconnecting supplier ${supplier.data?.name}:`, supplierError)
      }
    }

    console.log(`Disconnected ${disconnectCount} suppliers`)

    return NextResponse.json({ 
      success: true,
      disconnected: disconnectCount,
      message: 'Google Calendar disconnected successfully'
    })

  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ 
      error: 'Disconnect failed: ' + error.message 
    }, { status: 500 })
  }
}