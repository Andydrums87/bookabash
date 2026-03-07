"use client"

import { useEffect, useRef, useCallback } from 'react'
import { trackDashboardEngagement } from '@/utils/partyTracking'

/**
 * Hook to track meaningful engagement on the dashboard
 * Tracks: scroll depth, sections viewed, time to first interaction
 */
export function useDashboardEngagement(isEnabled = true) {
  const sectionsViewed = useRef(new Set())
  const maxScrollDepth = useRef(0)
  const firstInteractionTime = useRef(null)
  const pageLoadTime = useRef(Date.now())
  const interactionCount = useRef(0)
  const lastSyncTime = useRef(0)
  const hasTrackedInitial = useRef(false)

  // Define sections to track (these should match data-section attributes in dashboard)
  const TRACKABLE_SECTIONS = [
    'party-header',
    'supplier-grid',
    'venue-section',
    'entertainment-section',
    'cake-section',
    'catering-section',
    'decorations-section',
    'activities-section',
    'party-bags-section',
    'addons-section',
    'budget-controls',
    'countdown-widget',
    'refer-friend',
    'book-cta'
  ]

  // Track first interaction
  const recordInteraction = useCallback(() => {
    if (!firstInteractionTime.current) {
      firstInteractionTime.current = Date.now() - pageLoadTime.current
    }
    interactionCount.current += 1
  }, [])

  // Sync engagement data to backend (debounced)
  const syncEngagement = useCallback(() => {
    const now = Date.now()
    // Don't sync more than once every 5 seconds
    if (now - lastSyncTime.current < 5000) return
    lastSyncTime.current = now

    const engagementData = {
      maxScrollDepth: maxScrollDepth.current,
      sectionsViewed: Array.from(sectionsViewed.current),
      firstInteractionMs: firstInteractionTime.current,
      interactionCount: interactionCount.current
    }

    // Only sync if there's meaningful data
    if (engagementData.sectionsViewed.length > 0 || engagementData.maxScrollDepth > 10) {
      trackDashboardEngagement(engagementData)
    }
  }, [])

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return

    // Track scroll depth and sections in view
    const handleScroll = () => {
      // Calculate scroll depth as percentage
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0

      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent
      }

      // Check which sections are in viewport
      TRACKABLE_SECTIONS.forEach(sectionId => {
        const element = document.querySelector(`[data-section="${sectionId}"]`)
        if (element) {
          const rect = element.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0
          if (isVisible) {
            sectionsViewed.current.add(sectionId)
          }
        }
      })

      // Record as interaction if this is first scroll
      recordInteraction()
    }

    // Track clicks as interactions
    const handleClick = () => {
      recordInteraction()
    }

    // Debounced scroll handler
    let scrollTimeout
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 100)
    }

    // Add listeners
    window.addEventListener('scroll', debouncedScroll, { passive: true })
    window.addEventListener('click', handleClick)

    // Initial check for sections already in view
    setTimeout(handleScroll, 500)

    // Sync on page visibility change (user leaving)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncEngagement()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Sync before unload
    const handleBeforeUnload = () => {
      syncEngagement()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Periodic sync every 30 seconds if active
    const syncInterval = setInterval(() => {
      if (interactionCount.current > 0 && !hasTrackedInitial.current) {
        syncEngagement()
        hasTrackedInitial.current = true
      }
    }, 30000)

    return () => {
      clearTimeout(scrollTimeout)
      clearInterval(syncInterval)
      window.removeEventListener('scroll', debouncedScroll)
      window.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Final sync on unmount
      syncEngagement()
    }
  }, [isEnabled, recordInteraction, syncEngagement])

  return {
    sectionsViewed: sectionsViewed.current,
    maxScrollDepth: maxScrollDepth.current,
    interactionCount: interactionCount.current
  }
}
