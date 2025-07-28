"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NavigationTracker() {
  const router = useRouter()

  useEffect(() => {
    let navigationStart = 0
    let routeChangeStart = 0

    // Track route changes
    const handleRouteChangeStart = (url) => {
      routeChangeStart = performance.now()
      navigationStart = performance.now()
      console.log(`🚀 Navigation started to: ${url}`)
      
      // Add visual loading indicator
      document.body.classList.add('navigating')
      document.body.style.cursor = 'wait'
    }

    const handleRouteChangeComplete = (url) => {
      const duration = performance.now() - routeChangeStart
      document.body.classList.remove('navigating')
      document.body.style.cursor = 'default'
      
      console.log(`⏱️ Navigation completed: ${url} in ${duration.toFixed(2)}ms`)
      
      if (duration > 3000) {
        console.error(`🚨 VERY SLOW NAVIGATION: ${duration.toFixed(2)}ms`)
        console.log('🔍 Possible causes: Heavy components, data loading, font loading, large bundles')
      } else if (duration > 1500) {
        console.warn(`⚠️ Slow navigation: ${duration.toFixed(2)}ms`)
      } else if (duration > 500) {
        console.log(`📊 Moderate navigation: ${duration.toFixed(2)}ms`)
      } else {
        console.log(`✅ Fast navigation: ${duration.toFixed(2)}ms`)
      }

      // Check memory after navigation
      if (performance.memory) {
        const memUsage = Math.round(performance.memory.usedJSHeapSize / 1048576)
        console.log(`💾 Memory after navigation: ${memUsage}MB`)
        if (memUsage > 150) {
          console.warn('⚠️ High memory usage after navigation')
        }
      }
    }

    const handleRouteChangeError = (err, url) => {
      document.body.classList.remove('navigating')
      document.body.style.cursor = 'default'
      console.error(`❌ Navigation error to ${url}:`, err)
    }

    // For Next.js App Router, we need to listen to different events
    if (typeof window !== 'undefined') {
      // Listen for navigation events
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        handleRouteChangeStart(args[2] || window.location.pathname)
        const result = originalPushState.apply(this, args)
        // Use setTimeout to detect when navigation is complete
        setTimeout(() => {
          handleRouteChangeComplete(window.location.pathname)
        }, 0)
        return result
      }

      history.replaceState = function(...args) {
        handleRouteChangeStart(args[2] || window.location.pathname)
        const result = originalReplaceState.apply(this, args)
        setTimeout(() => {
          handleRouteChangeComplete(window.location.pathname)
        }, 0)
        return result
      }

      // Also listen for popstate (back/forward buttons)
      window.addEventListener('popstate', (e) => {
        handleRouteChangeStart(window.location.pathname)
        setTimeout(() => {
          handleRouteChangeComplete(window.location.pathname)
        }, 0)
      })

      // Cleanup
      return () => {
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [router])

  return null
}

// ✅ ALTERNATIVE: Even more aggressive font optimization
// If you want maximum performance, use system fonts instead:

/*
// Replace Google Fonts with system fonts in globals.css:
:root {
  --font-montserrat: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.font-montserrat {
  font-family: var(--font-montserrat);
}

// This eliminates ALL font loading delays
*/

// ✅ Add this CSS to globals.css for loading indicator:
/*
.navigating {
  pointer-events: none;
}

.navigating::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
  background-size: 200% 100%;
  animation: loading 2s ease-in-out infinite;
  z-index: 9999;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
*/

// ✅ Performance monitoring utility
export const performanceMonitor = {
  measurePageLoad: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now()
        console.log(`📊 Page load time: ${loadTime.toFixed(2)}ms`)
        
        // Measure specific metrics
        const paintTimes = performance.getEntriesByType('paint')
        paintTimes.forEach(({ name, startTime }) => {
          console.log(`🎨 ${name}: ${startTime.toFixed(2)}ms`)
        })
        
        // Check for slow resources
        const resources = performance.getEntriesByType('resource')
        const slowResources = resources.filter(resource => resource.duration > 1000)
        if (slowResources.length > 0) {
          console.warn('🐌 Slow resources detected:', slowResources.map(r => ({
            name: r.name,
            duration: r.duration.toFixed(2) + 'ms'
          })))
        }
      })
    }
  }
}