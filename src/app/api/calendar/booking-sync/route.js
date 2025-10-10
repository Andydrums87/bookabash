// /src/app/api/calendar/booking-sync/route.js

import { createClient } from '@supabase/supabase-js'
import { 
  createGoogleCalendarEvent, 
  createOutlookCalendarEvent 
} from '@/lib/calendar-write-functions'
import { 
  getValidGoogleToken, 
  getValidOutlookToken 
} from '@/lib/calendar-token-manager'

export async function POST(req) {
  try {
    const { supplierId, enquiryId, eventData } = await req.json()

    console.log('📥 Received booking sync request:', { supplierId, enquiryId })

    if (!supplierId || !enquiryId || !eventData) {
      return Response.json(
        { error: 'Missing required fields: supplierId, enquiryId, or eventData' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Fetch supplier's calendar connections
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', supplierId)
      .single()

    if (supplierError || !supplier) {
      console.error('❌ Supplier not found:', supplierError)
      return Response.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    console.log('✅ Supplier found:', {
      hasGoogle: !!supplier.data?.googleCalendarSync?.connected,
      hasOutlook: !!supplier.data?.outlookCalendarSync?.connected
    })

    const results = []

    // Sync to Google Calendar if connected
    if (supplier.data?.googleCalendarSync?.connected) {
      try {
        console.log('📅 Creating Google Calendar event...')
        
        // Get valid token (will refresh if expired)
        const { accessToken, calendarId } = await getValidGoogleToken(supplierId)
        
        const googleEvent = await createGoogleCalendarEvent({
          accessToken,
          calendarId,
          event: eventData
        })

        // Save Google event ID to enquiry
        await supabase
          .from('enquiries')
          .update({ googleEventId: googleEvent.id })
          .eq('id', enquiryId)

        results.push({ 
          provider: 'google', 
          success: true, 
          eventId: googleEvent.id,
          htmlLink: googleEvent.htmlLink 
        })

        console.log('✅ Google Calendar event created:', googleEvent.id)
      } catch (error) {
        console.error('❌ Google Calendar sync failed:', error)
        results.push({ 
          provider: 'google', 
          success: false, 
          error: error.message 
        })
      }
    } else {
      console.log('⏭️ Google Calendar not connected, skipping')
    }

    // Sync to Outlook Calendar if connected
    if (supplier.data?.outlookCalendarSync?.connected) {
      try {
        console.log('📅 Creating Outlook Calendar event...')
        
        // Get valid token (will refresh if expired)
        const { accessToken } = await getValidOutlookToken(supplierId)
        
        const outlookEvent = await createOutlookCalendarEvent({
          accessToken,
          event: eventData
        })

        // Save Outlook event ID to enquiry
        await supabase
          .from('enquiries')
          .update({ outlookEventId: outlookEvent.id })
          .eq('id', enquiryId)

        results.push({ 
          provider: 'outlook', 
          success: true, 
          eventId: outlookEvent.id,
          webLink: outlookEvent.webLink 
        })

        console.log('✅ Outlook Calendar event created:', outlookEvent.id)
      } catch (error) {
        console.error('❌ Outlook Calendar sync failed:', error)
        results.push({ 
          provider: 'outlook', 
          success: false, 
          error: error.message 
        })
      }
    } else {
      console.log('⏭️ Outlook Calendar not connected, skipping')
    }

    // Check if at least one calendar sync succeeded
    const hasSuccess = results.some(r => r.success)

    if (!hasSuccess && results.length > 0) {
      console.error('❌ All calendar syncs failed:', results)
      return Response.json(
        { 
          error: 'All calendar syncs failed',
          details: results 
        },
        { status: 500 }
      )
    }

    console.log('🎉 Booking sync complete:', results)

    return Response.json({ 
      success: true,
      results,
      message: `Booking synced to ${results.filter(r => r.success).length} calendar(s)`
    })

  } catch (error) {
    console.error('💥 Error syncing booking to calendars:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}