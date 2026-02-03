// Admin API route for CRM - Party Tracking Sessions
// GET: List all sessions with stats and funnel data

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Admin emails that can access this endpoint
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export async function GET(request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const days = searchParams.get('days') || '30'
    const search = searchParams.get('search') || ''
    const hasEmail = searchParams.get('hasEmail') || 'all'

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Build date filter
    let dateFilter = null
    if (days !== 'all') {
      const daysNum = parseInt(days, 10)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysNum)
      dateFilter = cutoffDate.toISOString()
    }

    // Build sessions query
    let sessionsQuery = supabaseAdmin
      .from('party_tracking')
      .select('*')
      .order('last_activity', { ascending: false, nullsFirst: false })
      .limit(200)

    if (dateFilter) {
      sessionsQuery = sessionsQuery.gte('started_at', dateFilter)
    }

    if (status !== 'all') {
      sessionsQuery = sessionsQuery.eq('status', status)
    }

    if (hasEmail === 'yes') {
      sessionsQuery = sessionsQuery.not('email', 'is', null)
    }

    if (search) {
      sessionsQuery = sessionsQuery.ilike('email', `%${search}%`)
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Process sessions - use dedicated columns (new system)
    // These columns are populated directly by partyTracking.js
    const processedSessions = (sessions || []).map(session => {
      const timeline = Array.isArray(session.action_timeline) ? session.action_timeline : []

      // Count actions from timeline
      const actionCount = timeline.length
      const hasReachedReviewBook = timeline.some(a => a.action === 'review_book_started')
      const hasReachedPaymentPage = timeline.some(a => a.action === 'payment_page_started')
      const hasReachedCheckout = timeline.some(a => a.action === 'checkout_started')
      const hasPaid = timeline.some(a => a.action === 'payment_completed')

      // Check for post-booking activity (after payment)
      const postBookingActions = ['supplier_added_post_booking', 'einvite_created', 'einvite_shared',
                                   'guest_added', 'rsvp_received', 'gift_registry_created',
                                   'gift_item_added', 'gift_contribution']
      const hasPostBookingActivity = timeline.some(a => postBookingActions.includes(a.action))

      // Post-booking status values (set by partyTracking.js)
      const postBookingStatuses = ['adding_suppliers', 'creating_invites', 'sharing_invites',
                                    'managing_guests', 'receiving_rsvps', 'setting_up_registry',
                                    'adding_gifts', 'receiving_contributions', 'engaged']

      // Derive status from timeline (most reliable) - more granular checkout stages
      let derivedStatus = session.status || 'browsing'

      // If status is a post-booking status, keep it (shows current engagement)
      if (postBookingStatuses.includes(session.status)) {
        derivedStatus = session.status
      } else if (hasPaid || hasPostBookingActivity) {
        // If they paid but status isn't a post-booking status, show as 'paid'
        derivedStatus = 'paid'
      } else if (session.status === 'payment_page' || hasReachedPaymentPage) {
        derivedStatus = 'payment_page'
      } else if (session.status === 'review_book' || hasReachedReviewBook) {
        derivedStatus = 'review_book'
      } else if (session.current_step === 'checkout_started' || hasReachedCheckout) {
        derivedStatus = 'checkout'
      } else if (session.current_step === 'payment_completed') {
        derivedStatus = 'paid'
      }
      if (session.status === 'abandoned') {
        derivedStatus = 'abandoned'
      }

      // Use dedicated columns directly - these are now populated by getCompletePartyData()
      // Fallback to timeline only for legacy sessions that don't have columns populated
      let supplierCount = session.supplier_count || 0
      let totalCost = session.estimated_value || 0

      // Simple fallback for supplier count if column is empty
      if (!supplierCount && timeline.length > 0) {
        supplierCount = timeline.filter(a => a.action === 'supplier_added').length -
                        timeline.filter(a => a.action === 'supplier_removed').length
        if (supplierCount < 0) supplierCount = 0
      }

      // Count post-booking engagement actions
      const postBookingEngagement = {
        suppliers_added: timeline.filter(a => a.action === 'supplier_added_post_booking').length,
        einvites_created: timeline.filter(a => a.action === 'einvite_created').length,
        einvites_shared: timeline.filter(a => a.action === 'einvite_shared').length,
        guests_added: timeline.filter(a => a.action === 'guest_added').length,
        rsvps_received: timeline.filter(a => a.action === 'rsvp_received').length,
        gift_registry: timeline.some(a => a.action === 'gift_registry_created'),
        gift_items: timeline.filter(a => a.action === 'gift_item_added').length
      }
      const hasEngagement = hasPostBookingActivity

      return {
        id: session.id,
        session_id: session.session_id,
        email: session.email,
        current_step: session.current_step,
        status: derivedStatus,
        raw_status: session.status,
        started_at: session.started_at,
        last_activity: session.last_activity,
        device_info: session.device_info,
        referrer: session.referrer,
        action_count: actionCount,
        supplier_count: supplierCount,
        has_reached_checkout: hasReachedCheckout,
        has_paid: hasPaid,
        has_engagement: hasEngagement,
        post_booking_engagement: postBookingEngagement,
        total_cost: totalCost,
        party_theme: session.party_theme || null,
        party_date: session.party_date || null,
        party_location: session.party_location || null,
        guest_count: session.guest_count || null
      }
    })

    // Get stats for all sessions in date range (regardless of filters)
    let statsQuery = supabaseAdmin
      .from('party_tracking')
      .select('status, email, action_timeline')

    if (dateFilter) {
      statsQuery = statsQuery.gte('started_at', dateFilter)
    }

    const { data: allSessions } = await statsQuery

    const stats = {
      total: 0,
      browsing: 0,
      review_book: 0,
      payment_page: 0,
      checkout: 0,
      paid: 0,
      engaged: 0, // Post-booking engagement (invites, guests, registry)
      abandoned: 0,
      with_email: 0,
      conversion_rate: 0
    }

    const funnel = {
      started: 0,
      added_suppliers: 0,
      reached_review_book: 0,
      reached_payment_page: 0,
      completed: 0
    }

    // Post-booking status values
    const engagedStatuses = ['adding_suppliers', 'creating_invites', 'sharing_invites',
                             'managing_guests', 'receiving_rsvps', 'setting_up_registry',
                             'adding_gifts', 'receiving_contributions', 'engaged']

    allSessions?.forEach(session => {
      stats.total++

      const timeline = Array.isArray(session.action_timeline) ? session.action_timeline : []
      const hasPaid = timeline.some(a => a.action === 'payment_completed')
      const hasReachedPaymentPage = timeline.some(a => a.action === 'payment_page_started')
      const hasReachedReviewBook = timeline.some(a => a.action === 'review_book_started')
      const hasReachedCheckout = timeline.some(a => a.action === 'checkout_started')
      const hasPostBookingActivity = timeline.some(a =>
        ['supplier_added_post_booking', 'einvite_created', 'einvite_shared',
         'guest_added', 'rsvp_received', 'gift_registry_created',
         'gift_item_added', 'gift_contribution'].includes(a.action)
      )

      // Derive status from timeline (more accurate than status field which can be overwritten)
      let derivedStatus = session.status || 'browsing'

      // Check if it's a post-booking engaged status
      if (engagedStatuses.includes(session.status) || hasPostBookingActivity) {
        derivedStatus = 'engaged'
      } else if (hasPaid) {
        derivedStatus = 'paid'
      } else if (session.status === 'payment_page' || hasReachedPaymentPage) {
        derivedStatus = 'payment_page'
      } else if (session.status === 'review_book' || hasReachedReviewBook) {
        derivedStatus = 'review_book'
      } else if (hasReachedCheckout) {
        derivedStatus = 'checkout'
      }
      // Keep abandoned if explicitly set
      if (session.status === 'abandoned') {
        derivedStatus = 'abandoned'
      }

      // Status counts using derived status
      if (derivedStatus === 'browsing') stats.browsing++
      else if (derivedStatus === 'review_book') stats.review_book++
      else if (derivedStatus === 'payment_page') stats.payment_page++
      else if (derivedStatus === 'checkout') stats.checkout++
      else if (derivedStatus === 'paid') stats.paid++
      else if (derivedStatus === 'engaged') stats.engaged++
      else if (derivedStatus === 'abandoned') stats.abandoned++

      if (session.email) stats.with_email++

      // Funnel counts
      funnel.started++

      if (timeline.some(a => a.action === 'supplier_added')) {
        funnel.added_suppliers++
      }
      if (hasReachedReviewBook || hasReachedCheckout) {
        funnel.reached_review_book++
      }
      if (hasReachedPaymentPage) {
        funnel.reached_payment_page++
      }
      if (hasPaid) {
        funnel.completed++
      }
    })

    // Calculate conversion rate
    if (stats.total > 0) {
      stats.conversion_rate = Math.round((stats.paid / stats.total) * 100)
    }

    // ============ TRAFFIC STATS ============
    // Get page view stats for the same date range
    let trafficQuery = supabaseAdmin
      .from('page_views')
      .select('visitor_id, page_path, referrer_domain, device_type, is_new_visitor, created_at')

    if (dateFilter) {
      trafficQuery = trafficQuery.gte('created_at', dateFilter)
    }

    const { data: pageViews } = await trafficQuery

    const traffic = {
      total_views: 0,
      unique_visitors: 0,
      new_visitors: 0,
      returning_visitors: 0,
      top_pages: [],
      top_referrers: [],
      devices: { desktop: 0, mobile: 0, tablet: 0 }
    }

    if (pageViews && pageViews.length > 0) {
      traffic.total_views = pageViews.length

      // Unique visitors
      const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id))
      traffic.unique_visitors = uniqueVisitors.size

      // New vs returning
      const newVisitorIds = new Set()
      pageViews.forEach(pv => {
        if (pv.is_new_visitor) newVisitorIds.add(pv.visitor_id)
      })
      traffic.new_visitors = newVisitorIds.size
      traffic.returning_visitors = traffic.unique_visitors - traffic.new_visitors

      // Top pages
      const pageCounts = {}
      pageViews.forEach(pv => {
        pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1
      })
      traffic.top_pages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count }))

      // Top referrers (excluding nulls)
      const referrerCounts = {}
      pageViews.forEach(pv => {
        if (pv.referrer_domain) {
          referrerCounts[pv.referrer_domain] = (referrerCounts[pv.referrer_domain] || 0) + 1
        }
      })
      traffic.top_referrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([domain, count]) => ({ domain, count }))

      // Device breakdown
      pageViews.forEach(pv => {
        if (pv.device_type === 'desktop') traffic.devices.desktop++
        else if (pv.device_type === 'mobile') traffic.devices.mobile++
        else if (pv.device_type === 'tablet') traffic.devices.tablet++
      })
    }

    // Calculate visitor to session conversion
    const visitorToSessionRate = traffic.unique_visitors > 0
      ? Math.round((stats.total / traffic.unique_visitors) * 100)
      : 0

    return NextResponse.json({
      sessions: processedSessions,
      stats,
      funnel,
      traffic: {
        ...traffic,
        visitor_to_session_rate: visitorToSessionRate
      }
    })

  } catch (error) {
    console.error('Error in admin CRM sessions GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
