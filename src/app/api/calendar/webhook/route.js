// Add this to your webhook endpoint to log attempts to database
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  const timestamp = new Date().toISOString()
  
  try {
    // Get headers
    const headers = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    // Log to database (create a webhook_logs table)
    await supabase
      .from('webhook_logs') // You'll need to create this table
      .insert({
        timestamp,
        headers: JSON.stringify(headers),
        resource_state: headers['x-goog-resource-state'],
        channel_id: headers['x-goog-channel-id'],
        success: true
      })
    
    console.log('🚨 Webhook logged to database:', timestamp)
    
    return NextResponse.json({ success: true, timestamp })
    
  } catch (error) {
    console.error('❌ Webhook error:', error)
    
    // Still log the failure
    try {
      await supabase
        .from('webhook_logs')
        .insert({
          timestamp,
          error: error.message,
          success: false
        })
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }
    
    return NextResponse.json({ success: true, error: error.message })
  }
}