'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/utils/pageViewTracking'

/**
 * PageViewTracker component
 * Tracks page views on initial load and route changes
 * Place this in your root layout to track all pages
 */
export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view on mount and route changes
    trackPageView()
  }, [pathname])

  // This component doesn't render anything
  return null
}
