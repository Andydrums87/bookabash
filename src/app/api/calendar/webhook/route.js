// Replace your existing webhook endpoint temporarily with this debug version
// app/api/calendar/webhook/route.js

import { NextResponse } from 'next/server'

export async function POST(request) {

  const timestamp = new Date().toISOString()
  
  console.log('🚨 === WEBHOOK RECEIVED ===', timestamp)
  
  try {
    // Log ALL headers
    const headers = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('📋 All Headers:', JSON.stringify(headers, null, 2))
    
    // Check for Google-specific headers
    const googleHeaders = {
      resourceState: headers['x-goog-resource-state'],
      channelId: headers['x-goog-channel-id'],
      resourceId: headers['x-goog-resource-id'],
      resourceUri: headers['x-goog-resource-uri'],
      channelExpiration: headers['x-goog-channel-expiration'],
      channelToken: headers['x-goog-channel-token'],
      messageNumber: headers['x-goog-message-number']
    }
    console.log('🔔 Google Headers:', JSON.stringify(googleHeaders, null, 2))
    
    // Try to read body (might be empty)
    let body = null
    try {
      const text = await request.text()
      body = text || 'Empty body'
    } catch (e) {
      body = 'Could not read body: ' + e.message
    }
    console.log('📄 Body:', body)
    
    // Log request details
    console.log('🌐 Request Details:', {
      method: request.method,
      url: request.url,
      userAgent: headers['user-agent']
    })
    
    console.log('✅ Webhook logged successfully')
    
    // Always return success to Google
    return NextResponse.json({ 
      success: true, 
      timestamp,
      message: 'Webhook received and logged' 
    })
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    // Still return success to avoid Google retries
    return NextResponse.json({ 
      success: true, 
      error: error.message,
      timestamp 
    })
  }
}

export async function GET(request) {
  console.log('📋 GET request to webhook endpoint:', new Date().toISOString())
  return NextResponse.json({ 
    message: 'Calendar webhook endpoint is running',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}