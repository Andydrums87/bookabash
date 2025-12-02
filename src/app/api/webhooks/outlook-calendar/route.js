// app/api/webhooks/outlook-calendar/route.js
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const WEBHOOK_SECRET = process.env.OUTLOOK_WEBHOOK_SECRET || "your-random-secret-string"

async function refreshOutlookToken(refreshToken, supplierId) {
  const tokenResponse = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    }
  )

  if (!tokenResponse.ok) {
    throw new Error("Token refresh failed")
  }

  const tokens = await tokenResponse.json()

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("data")
    .eq("id", supplierId)
    .single()

  const updatedData = {
    ...supplier.data,
    outlookTokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    },
  }

  await supabase
    .from("suppliers")
    .update({ data: updatedData })
    .eq("id", supplierId)

  return tokens.access_token
}

async function syncOutlookCalendar(primarySupplier, allUserSuppliers) {
  try {
    const { outlookTokens, outlookCalendarSync } = primarySupplier.data

    if (!outlookTokens?.accessToken) {
      throw new Error("No Outlook access token")
    }

    let accessToken = outlookTokens.accessToken
    if (new Date(outlookTokens.expiresAt) < new Date()) {
      console.log('Refreshing Outlook token...')
      accessToken = await refreshOutlookToken(outlookTokens.refreshToken, primarySupplier.id)
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 365)

    const eventsUrl = new URL("https://graph.microsoft.com/v1.0/me/calendarview")
    eventsUrl.searchParams.append("startDateTime", startDate.toISOString())
    eventsUrl.searchParams.append("endDateTime", endDate.toISOString())
    eventsUrl.searchParams.append("$select", "subject,start,end,showAs,isAllDay")
    eventsUrl.searchParams.append("$top", "250")

    console.log('Fetching current Outlook calendar events...')
    
    const response = await fetch(eventsUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Outlook events")
    }

    const data = await response.json()
    const events = data.value || []

    console.log(`Found ${events.length} Outlook events`)

    const busyEvents = events.filter(
      event => event.showAs === "busy" || event.showAs === "oof" || event.isAllDay
    )

    console.log(`${busyEvents.length} busy events to block`)

    const blockedDates = []
    busyEvents.forEach((event) => {
      if (event.isAllDay) {
        const date = event.start.dateTime.split('T')[0]
        blockedDates.push({
          date,
          timeSlots: ['morning', 'afternoon'],
          source: 'outlook-calendar',
          eventTitle: event.subject || 'Calendar Event'
        })
      } else {
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
            source: 'outlook-calendar',
            eventTitle: event.subject || 'Calendar Event'
          })
        }
      }
    })

    console.log(`Converted to ${blockedDates.length} blocked date entries`)

    // Update ALL suppliers (primary and themed)
    for (const supplier of allUserSuppliers) {
      try {
        const isPrimary = supplier.id === primarySupplier.id
        
        // Keep manual blocks, REPLACE all outlook-calendar blocks
        const currentUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = currentUnavailable.filter(item => 
          item.source !== 'outlook-calendar'
        )
        const allBlocked = [...manualBlocks, ...blockedDates]
        
        const updatedData = {
          ...supplier.data,
          unavailableDates: allBlocked,
          busyDates: blockedDates,
          outlookCalendarSync: {
            ...supplier.data.outlookCalendarSync,
            lastSync: new Date().toISOString(),
            syncedEvents: busyEvents.map(e => ({ id: e.id, title: e.subject }))
          },
          updatedAt: new Date().toISOString()
        }
        
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({ data: updatedData })
          .eq('id', supplier.id)
        
        if (updateError) {
          console.error(`Failed to update ${isPrimary ? 'primary' : 'themed'} supplier:`, updateError)
        } else {
          console.log(`✅ Updated ${isPrimary ? 'primary' : 'themed'} supplier: ${supplier.data.name} with ${allBlocked.length} unavailable dates`)
        }
        
      } catch (supplierError) {
        console.error(`Error updating supplier ${supplier.data?.name}:`, supplierError)
      }
    }

    console.log(`Outlook sync completed for ${allUserSuppliers.length} suppliers`)
  } catch (error) {
    console.error('Outlook sync failed:', error)
  }
}

export async function POST(request) {
  try {
    // CRITICAL: Check for validation token FIRST (Microsoft's initial validation)
    const url = new URL(request.url)
    const validationToken = url.searchParams.get('validationToken')
    
    if (validationToken) {
      console.log('Outlook webhook validation request received')
      // Must return plain text with exact token
      return new NextResponse(validationToken, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        }
      })
    }

    // Handle actual webhook notifications
    const body = await request.text()
    const notification = JSON.parse(body)
    
    console.log('Outlook webhook notification received:', notification)

    // Verify clientState matches our secret
    if (notification.value?.[0]?.clientState !== WEBHOOK_SECRET) {
      console.error('Invalid clientState')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process each change notification
    for (const change of notification.value || []) {
      const { subscriptionId } = change

      console.log(`Processing change for subscription: ${subscriptionId}`)

      // Use JSONB query to find supplier directly by subscriptionId (indexed lookup)
      const { data: primarySupplier, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .filter('data->outlookCalendarSync->>subscriptionId', 'eq', subscriptionId)
        .maybeSingle()

      if (fetchError) {
        console.error('Database error:', fetchError.message)
        continue
      }

      if (!primarySupplier) {
        console.log('No supplier found for subscription:', subscriptionId)
        continue
      }

      console.log('Found primary supplier:', primarySupplier.data.name)

      // Fetch only suppliers for this user (not all suppliers)
      const { data: userSuppliers } = await supabase
        .from('suppliers')
        .select('*')
        .eq('auth_user_id', primarySupplier.auth_user_id)

      console.log(`Found ${userSuppliers?.length || 1} total suppliers for this user`)

      await syncOutlookCalendar(primarySupplier, userSuppliers || [primarySupplier])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Outlook webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

export async function GET(request) {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'outlook-webhook',
    timestamp: new Date().toISOString()
  })
}