import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI
const WEBHOOK_SECRET = process.env.OUTLOOK_WEBHOOK_SECRET 

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("Outlook auth error:", error)
      return NextResponse.redirect(
        new URL(`/suppliers/availability?error=outlook_auth_failed`, request.url)
      )
    }

    if (!code || !state) {
      console.error("Missing code or state")
      return NextResponse.redirect(
        new URL(`/suppliers/availability?error=missing_params`, request.url)
      )
    }

    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString())
    console.log("Processing Outlook OAuth for user:", userId)

    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          code: code,
          redirect_uri: MICROSOFT_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange failed:", errorData)
      throw new Error("Token exchange failed")
    }

    const tokens = await tokenResponse.json()
    console.log("Tokens received successfully")

    // Get user's primary calendar ID and email
    const calendarResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/calendar",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!calendarResponse.ok) {
      throw new Error("Failed to fetch calendar info")
    }

    const calendar = await calendarResponse.json()
    console.log("Calendar info retrieved:", calendar.id)

    // Check if this is an onboarding flow (no suppliers created yet)
    if (userId === 'onboarding') {
      console.log('Onboarding flow detected - redirecting back to wizard')

      const params = new URLSearchParams({
        calendar_connected: 'true',
        provider: 'outlook',
        onboarding: 'true'
      })

      return NextResponse.redirect(
        new URL(`/suppliers/onboarding/new-supplier?${params.toString()}`, request.url)
      )
    }

    // Get ALL suppliers for this user (primary + themed)
    const { data: allSuppliers, error: fetchError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("auth_user_id", userId)

    if (fetchError || !allSuppliers || allSuppliers.length === 0) {
      console.error("No suppliers found for user:", userId)
      throw new Error("No supplier found for user")
    }

    const primaryBusiness = allSuppliers.find(s => s.is_primary || s.data?.isPrimary) || allSuppliers[0]
    console.log(`Found ${allSuppliers.length} suppliers (primary: ${primaryBusiness.data.name})`)

    // Create webhook subscription for primary business
    let subscriptionId = null
    let subscriptionExpiry = null
    
    try {
      const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/outlook-calendar`
      const expirationDateTime = new Date(Date.now() + 4320 * 60 * 1000).toISOString()
      
      console.log("Creating Outlook webhook subscription...")
      console.log("Webhook URL:", webhookUrl)
      
      const subscriptionResponse = await fetch(
        "https://graph.microsoft.com/v1.0/subscriptions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokens.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            changeType: "created,updated,deleted",
            notificationUrl: webhookUrl,
            resource: "/me/events",
            expirationDateTime: expirationDateTime,
            clientState: WEBHOOK_SECRET,
          }),
        }
      )

      if (subscriptionResponse.ok) {
        const subscription = await subscriptionResponse.json()
        subscriptionId = subscription.id
        subscriptionExpiry = subscription.expirationDateTime
        console.log("Webhook subscription created:", subscriptionId)
      } else {
        const errorText = await subscriptionResponse.text()
        console.error("Failed to create webhook subscription:", errorText)
      }
    } catch (webhookError) {
      console.error("Webhook creation error:", webhookError)
      // Continue without webhook - can still do manual sync
    }

    // Perform initial calendar sync
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 365)

    let initialBlockedDates = []
    
    try {
      const eventsUrl = new URL("https://graph.microsoft.com/v1.0/me/calendarview")
      eventsUrl.searchParams.append("startDateTime", startDate.toISOString())
      eventsUrl.searchParams.append("endDateTime", endDate.toISOString())
      eventsUrl.searchParams.append("$select", "subject,start,end,showAs,isAllDay")
      eventsUrl.searchParams.append("$top", "250")

      console.log("Fetching initial calendar events...")
      const eventsResponse = await fetch(eventsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Prefer: 'outlook.timezone="UTC"',
        },
      })

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        const events = eventsData.value || []
        console.log(`Found ${events.length} calendar events`)

        // Filter busy events and convert to blocked dates
        const busyEvents = events.filter(
          event => event.showAs === "busy" || event.showAs === "oof" || event.isAllDay
        )

        console.log(`${busyEvents.length} busy events to block`)

        busyEvents.forEach((event) => {
          if (event.isAllDay) {
            const date = event.start.dateTime.split('T')[0]
            initialBlockedDates.push({
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
              initialBlockedDates.push({
                date,
                timeSlots,
                source: 'outlook-calendar',
                eventTitle: event.subject || 'Calendar Event'
              })
            }
          }
        })
      }
    } catch (syncError) {
      console.error("Initial calendar sync failed:", syncError)
    }

    // Update ALL suppliers (primary + themed)
    let updateCount = 0
    
    for (const supplier of allSuppliers) {
      try {
        const isPrimary = supplier.id === primaryBusiness.id
        
        // Merge existing manual blocks with calendar blocks
        const existingUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = existingUnavailable.filter(item => item.source !== 'outlook-calendar')
        const allBlocked = [...manualBlocks, ...initialBlockedDates]
        
        let outlookCalendarSync
        if (isPrimary) {
          // Primary gets full connection data
          outlookCalendarSync = {
            connected: true,
            calendarId: calendar.id,
            email: calendar.owner?.address || tokens.preferred_username,
            lastSync: initialBlockedDates.length > 0 ? new Date().toISOString() : null,
            subscriptionId: subscriptionId,
            subscriptionExpiry: subscriptionExpiry,
            webhooksEnabled: !!subscriptionId,
          }
        } else {
          // Themed suppliers get inherited reference
          outlookCalendarSync = {
            inherited: true,
            connectedViaPrimary: true,
            primarySupplierId: primaryBusiness.id,
            connected: true,
            email: calendar.owner?.address || tokens.preferred_username,
            lastSync: initialBlockedDates.length > 0 ? new Date().toISOString() : null,
            webhooksEnabled: !!subscriptionId,
          }
        }
        
        const updatedData = {
          ...supplier.data,
          outlookCalendarSync,
          unavailableDates: allBlocked,
          busyDates: initialBlockedDates,
          outlookTokens: isPrimary ? {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          } : null,
          updatedAt: new Date().toISOString(),
        }

        console.log(`Updating ${isPrimary ? 'primary' : 'themed'} supplier: ${supplier.data?.name}`)
        console.log(`  - Setting ${allBlocked.length} unavailable dates (${initialBlockedDates.length} from calendar)`)

        const { error: updateError } = await supabase
          .from("suppliers")
          .update({ 
            data: updatedData,
            updated_at: new Date().toISOString()
          })
          .eq("id", supplier.id)

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

    console.log("Outlook OAuth completed:", {
      totalSuppliers: allSuppliers.length,
      suppliersUpdated: updateCount,
      webhookCreated: !!subscriptionId,
      eventsSynced: initialBlockedDates.length
    })

    const params = new URLSearchParams({
      calendar_connected: 'true',
      provider: 'outlook',
      webhooks_enabled: subscriptionId ? '1' : '0',
      total_updated: updateCount.toString(),
      events_synced: initialBlockedDates.length.toString()
    })

    // Check if this OAuth flow was initiated from the wizard
    const isWizardFlow = request.headers.get('referer')?.includes('/suppliers/onboarding/new-supplier')

    const redirectUrl = isWizardFlow
      ? `/suppliers/onboarding/new-supplier?${params.toString()}`
      : `/suppliers/availability?${params.toString()}`

    return NextResponse.redirect(
      new URL(redirectUrl, request.url)
    )

  } catch (error) {
    console.error("Outlook callback error:", error)
    return NextResponse.redirect(
      new URL(`/suppliers/availability?error=outlook_connection_failed&details=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}