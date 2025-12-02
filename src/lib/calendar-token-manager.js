// /src/lib/calendar-token-manager.js

import { createClient } from '@supabase/supabase-js'
/**
 * Get a valid Outlook Calendar access token, refreshing if necessary
 */
export async function getValidGoogleToken(supplierId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  
    // Get supplier's Google calendar data
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', supplierId)
      .single()
  
    if (error || !supplier?.data?.googleCalendarSync) {
      throw new Error('Google Calendar not connected')
    }
  
    let googleSync = supplier.data.googleCalendarSync
  
    // If this is a themed supplier with inherited connection, get the primary supplier's token
    if (googleSync.inherited && googleSync.primarySupplierId) {
      console.log('📎 Using inherited connection from primary supplier')
      
      const { data: primarySupplier, error: primaryError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', googleSync.primarySupplierId)
        .single()
  
      if (primaryError || !primarySupplier?.data?.googleCalendarSync) {
        throw new Error('Primary supplier Google Calendar not found')
      }
  
      googleSync = primarySupplier.data.googleCalendarSync
    }
  
    // Check if token is expired (with 5 minute buffer)
    const tokenExpiry = new Date(googleSync.tokenExpiry)
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
  
    // If token is still valid, return it
    if (tokenExpiry > fiveMinutesFromNow) {
      console.log('✅ Google token is still valid')
      return {
        accessToken: googleSync.accessToken,
        calendarId: googleSync.calendarId || 'primary'
      }
    }
  
    // Token is expired or about to expire - refresh it
    console.log('🔄 Google token expired, refreshing...')
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: googleSync.refreshToken,
        grant_type: 'refresh_token'
      })
    })
  
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Failed to refresh Google token:', error)
      throw new Error('Failed to refresh Google Calendar token. Please reconnect your calendar.')
    }
  
    const tokens = await response.json()
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000)
  
    // Update the token in the PRIMARY supplier's database record
    const primarySupplierId = googleSync.inherited ? googleSync.primarySupplierId : supplierId
    
    const { data: primarySupplier } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', primarySupplierId)
      .single()
  
    const updatedGoogleSync = {
      ...primarySupplier.data.googleCalendarSync,
      accessToken: tokens.access_token,
      tokenExpiry: newExpiry.toISOString(),
      lastSync: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('suppliers')
      .update({
        data: {
          ...primarySupplier.data,
          googleCalendarSync: updatedGoogleSync
        }
      })
      .eq('id', primarySupplierId)

    if (updateError) {
      console.error('❌ Failed to save refreshed Google token:', updateError)
      throw new Error('Failed to save refreshed token to database')
    }

    console.log('✅ Google token refreshed successfully')
  
    return {
      accessToken: tokens.access_token,
      calendarId: googleSync.calendarId || 'primary'
    }
  }

  /**
 * Get a valid Outlook Calendar access token, refreshing if necessary
 */
export async function getValidOutlookToken(supplierId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  
    // Get supplier's Outlook calendar data
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', supplierId)
      .single()
  
    if (error || !supplier?.data?.outlookCalendarSync) {
      throw new Error('Outlook Calendar not connected')
    }
  
    let outlookSync = supplier.data.outlookCalendarSync
  
    // If this is a themed supplier with inherited connection, get the primary supplier's token
    if (outlookSync.inherited && outlookSync.primarySupplierId) {
      console.log('📎 Using inherited Outlook connection from primary supplier')
      
      const { data: primarySupplier, error: primaryError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', outlookSync.primarySupplierId)
        .single()
  
      if (primaryError || !primarySupplier?.data?.outlookCalendarSync) {
        throw new Error('Primary supplier Outlook Calendar not found')
      }
  
      outlookSync = primarySupplier.data.outlookCalendarSync
    }
  
    // Check if token is expired (with 5 minute buffer)
    const tokenExpiry = new Date(outlookSync.tokenExpiry || outlookSync.expiresAt)
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
  
    // If token is still valid, return it
    if (tokenExpiry > fiveMinutesFromNow) {
      console.log('✅ Outlook token is still valid')
      return {
        accessToken: outlookSync.accessToken
      }
    }
  
    // Token is expired or about to expire - refresh it
    console.log('🔄 Outlook token expired, refreshing...')
    
    const response = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET,
          refresh_token: outlookSync.refreshToken,
          grant_type: 'refresh_token',
          scope: 'Calendars.ReadWrite User.Read offline_access'
        })
      }
    )
  
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Failed to refresh Outlook token:', error)
      throw new Error('Failed to refresh Outlook Calendar token. Please reconnect your calendar.')
    }
  
    const tokens = await response.json()
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000)
  
    // Update the token in the PRIMARY supplier's database record
    const primarySupplierId = outlookSync.inherited ? outlookSync.primarySupplierId : supplierId
    
    const { data: primarySupplier } = await supabase
      .from('suppliers')
      .select('data')
      .eq('id', primarySupplierId)
      .single()
  
    const updatedOutlookSync = {
      ...primarySupplier.data.outlookCalendarSync,
      accessToken: tokens.access_token,
      tokenExpiry: newExpiry.toISOString(),
      expiresAt: newExpiry.toISOString(),
      lastSync: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('suppliers')
      .update({
        data: {
          ...primarySupplier.data,
          outlookCalendarSync: updatedOutlookSync
        }
      })
      .eq('id', primarySupplierId)

    if (updateError) {
      console.error('❌ Failed to save refreshed Outlook token:', updateError)
      throw new Error('Failed to save refreshed token to database')
    }

    console.log('✅ Outlook token refreshed successfully')
  
    return {
      accessToken: tokens.access_token
    }
  }