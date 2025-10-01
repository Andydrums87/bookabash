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

    // Convert ONLY current events to blocked dates
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
        
        // KEY CHANGE: Keep manual blocks, REPLACE all outlook-calendar blocks
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