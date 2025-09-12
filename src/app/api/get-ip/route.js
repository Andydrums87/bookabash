// src/app/api/get-ip/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Get IP from various headers (handles different deployment scenarios)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
    
    // Determine the most likely real IP
    let ip = 'unknown'
    
    if (cfConnectingIP) {
      ip = cfConnectingIP
    } else if (realIP) {
      ip = realIP
    } else if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      ip = forwarded.split(',')[0].trim()
    }
    
    // For development/localhost, use a placeholder
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      ip = 'localhost'
    }
    
    return NextResponse.json({ 
      ip,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting IP:', error)
    return NextResponse.json({ 
      ip: 'unknown',
      timestamp: new Date().toISOString()
    })
  }
}