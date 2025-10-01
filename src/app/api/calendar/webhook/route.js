async function triggerAutomaticSync(primarySupplier, allUserSuppliers) {
  try {
    const googleSync = primarySupplier.data.googleCalendarSync
    
    if (!googleSync?.accessToken) {
      console.error('No access token for automatic sync')
      return
    }
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: googleSync.accessToken,
      refresh_token: googleSync.refreshToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Fetch CURRENT events from next 1 year
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    
    console.log('Fetching current calendar state for sync...')
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    const events = response.data.items || []
    console.log(`Found ${events.length} current calendar events`)
    
    // Convert ONLY current events to blocked dates
    // This means deleted events will naturally disappear
    const blockedDates = []
    
    events.forEach((event) => {
      if (!event.start) return
      
      if (event.start.date) {
        blockedDates.push({
          date: event.start.date,
          timeSlots: ['morning', 'afternoon'],
          source: 'google-calendar',
          eventTitle: event.summary || 'Calendar Event'
        })
      } else if (event.start.dateTime) {
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
            source: 'google-calendar',
            eventTitle: event.summary || 'Calendar Event'
          })
        }
      }
    })
    
    console.log(`Converted to ${blockedDates.length} blocked date entries`)
    
    // Update ALL suppliers (primary and themed)
    for (const supplier of allUserSuppliers) {
      try {
        const isPrimary = supplier.id === primarySupplier.id
        
        // KEY CHANGE: Keep manual blocks, REPLACE all google-calendar blocks
        const currentUnavailable = supplier.data.unavailableDates || []
        const manualBlocks = currentUnavailable.filter(item => 
          item.source !== 'google-calendar'
        )
        const allBlocked = [...manualBlocks, ...blockedDates]
        
        const updatedData = {
          ...supplier.data,
          unavailableDates: allBlocked,
          busyDates: blockedDates,
          googleCalendarSync: {
            ...supplier.data.googleCalendarSync,
            lastSync: new Date().toISOString(),
            syncedEvents: events.map(e => ({ id: e.id, title: e.summary })),
            lastAutomaticSync: new Date().toISOString()
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
    
    console.log(`Automatic sync completed for ${allUserSuppliers.length} suppliers`)
    
  } catch (error) {
    console.error('Automatic sync failed:', error)
  }
}