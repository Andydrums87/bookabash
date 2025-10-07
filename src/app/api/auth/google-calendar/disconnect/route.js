import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('Disconnecting Google Calendar for user:', userId)

    // Get supplier
    const { data: suppliers, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('auth_user_id', user.id) 
      .eq('is_primary', true)

    if (fetchError || !suppliers?.length) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Stop webhooks if they exist
    for (const supplier of suppliers) {
      const googleSync = supplier.data?.googleCalendarSync

      if (googleSync?.webhookChannelId && googleSync?.accessToken) {
        try {
          console.log('Stopping webhook:', googleSync.webhookChannelId)
          
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          )
          
          oauth2Client.setCredentials({
            access_token: googleSync.accessToken,
            refresh_token: googleSync.refreshToken
          })

          const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
          
          await calendar.channels.stop({
            requestBody: {
              id: googleSync.webhookChannelId,
              resourceId: googleSync.webhookResourceId
            }
          })

          console.log('Webhook stopped successfully')
        } catch (webhookError) {
          console.error('Failed to stop webhook (non-fatal):', webhookError.message)
        }
      }

      // Update supplier to remove Google Calendar sync data
      const updatedData = {
        ...supplier.data,
        googleCalendarSync: {
          enabled: false,
          connected: false,
          accessToken: null,
          refreshToken: null,
          lastSync: null,
          syncedEvents: [],
          disconnectedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ data: updatedData })
        .eq('id', supplier.id)

      if (updateError) {
        console.error('Failed to update supplier:', updateError)
        throw new Error('Database update failed')
      }

      console.log('Supplier updated - calendar disconnected')
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ 
      error: 'Failed to disconnect', 
      details: error.message 
    }, { status: 500 })
  }
}