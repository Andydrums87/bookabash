// Admin API route for CRM - Single Session Detail
// GET: Get session detail with full timeline

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Admin emails that can access this endpoint
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export async function GET(request, { params }) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data: { user }, error } = await supabaseAuth.auth.getUser(token)

      if (error || !user || !ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Fetch session by ID or session_id
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('party_tracking')
      .select('*')
      .or(`id.eq.${sessionId},session_id.eq.${sessionId}`)
      .single()

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate duration
    let durationMinutes = null
    if (session.started_at && session.last_activity) {
      const start = new Date(session.started_at)
      const last = new Date(session.last_activity)
      durationMinutes = Math.round((last - start) / 1000 / 60)
    }

    // Process timeline with relative times
    const timeline = Array.isArray(session.action_timeline) ? session.action_timeline : []
    const startTime = session.started_at ? new Date(session.started_at) : null

    const processedTimeline = timeline.map((event, index) => {
      const eventTime = event.timestamp ? new Date(event.timestamp) : null

      // Calculate time since start
      let timeSinceStart = null
      if (startTime && eventTime) {
        const diffMs = eventTime - startTime
        const diffMins = Math.floor(diffMs / 1000 / 60)
        const diffSecs = Math.floor((diffMs / 1000) % 60)
        if (diffMins > 0) {
          timeSinceStart = `${diffMins}m ${diffSecs}s`
        } else {
          timeSinceStart = `${diffSecs}s`
        }
      }

      // Calculate time to next event
      let timeToNext = null
      if (index < timeline.length - 1 && eventTime) {
        const nextEvent = timeline[index + 1]
        const nextTime = nextEvent.timestamp ? new Date(nextEvent.timestamp) : null
        if (nextTime) {
          const diffMs = nextTime - eventTime
          const diffMins = Math.floor(diffMs / 1000 / 60)
          const diffSecs = Math.floor((diffMs / 1000) % 60)
          if (diffMins > 0) {
            timeToNext = `${diffMins}m ${diffSecs}s`
          } else {
            timeToNext = `${diffSecs}s`
          }
        }
      }

      return {
        ...event,
        time_since_start: timeSinceStart,
        time_to_next: timeToNext
      }
    })

    // Calculate total actions
    const totalActions = timeline.length

    return NextResponse.json({
      session: {
        id: session.id,
        session_id: session.session_id,
        email: session.email,
        current_step: session.current_step,
        party_data: session.party_data,
        status: session.status || 'browsing',
        started_at: session.started_at,
        last_activity: session.last_activity,
        device_info: session.device_info,
        referrer: session.referrer,
        duration_minutes: durationMinutes,
        total_actions: totalActions
      },
      timeline: processedTimeline
    })

  } catch (error) {
    console.error('Error in admin CRM session detail GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
