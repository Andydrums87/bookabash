'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/utils/pageViewTracking'

/**
 * Capture external referrer on first page load
 * This runs immediately when the component mounts (on any page)
 * to ensure we capture the referrer before any navigation
 */
const captureReferrerEarly = () => {
  if (typeof window === 'undefined') return

  // Only capture once - check if we already have a referrer stored
  const alreadyCaptured = localStorage.getItem('tracking_referrer')
  if (alreadyCaptured !== null) return

  const currentReferrer = document.referrer || ''

  // Only store external referrers (not our own domain)
  const isExternal = currentReferrer && !currentReferrer.includes(window.location.hostname)

  if (isExternal) {
    localStorage.setItem('tracking_referrer', currentReferrer)
  } else {
    // Mark as captured but empty (prevents re-checking)
    localStorage.setItem('tracking_referrer', '')
  }
}

/**
 * PageViewTracker component
 * Tracks page views on initial load and route changes
 * Place this in your root layout to track all pages
 */
export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Capture referrer early - runs once on first page load
    captureReferrerEarly()

    // Track page view on mount and route changes
    trackPageView()
  }, [pathname])

  // This component doesn't render anything
  return null
}
