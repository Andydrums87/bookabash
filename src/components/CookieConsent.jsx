"use client"

import { useState, useEffect } from "react"
import { Cookie, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // 6 second delay so it doesn't compete with page load / ad clicks
      setTimeout(() => setShowBanner(true), 6000)
    } else {
      // Load their existing preferences
      const savedPrefs = localStorage.getItem('cookiePreferences')
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs)
        setPreferences(parsed)
        // Initialize analytics based on saved preferences
        initializeAnalytics(parsed.analytics, parsed.marketing)
      }
    }
  }, [])

  const initializeAnalytics = (analyticsEnabled, marketingEnabled) => {
    if (analyticsEnabled) {
      // Initialize Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        })
      }
      // Initialize Heap Analytics if you have it
      if (typeof window !== 'undefined' && window.heap) {
        window.heap.load(process.env.NEXT_PUBLIC_HEAP_ID)
      }
    }

    if (marketingEnabled) {
      // Initialize marketing cookies
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        })
      }
      // Initialize Meta Pixel
      if (typeof window !== 'undefined') {
        window.fbq?.('consent', 'grant');
        window.fbq?.('track', 'PageView');
      }
    }
  }

  const handleAcceptAll = () => {
    const prefs = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(prefs)
    localStorage.setItem('cookieConsent', 'all')
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs))
    initializeAnalytics(true, true)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const prefs = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(prefs)
    localStorage.setItem('cookieConsent', 'essential')
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs))
    initializeAnalytics(false, false)
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', preferences.analytics || preferences.marketing ? 'custom' : 'essential')
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    initializeAnalytics(preferences.analytics, preferences.marketing)
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  // Settings panel (same on mobile & desktop)
  if (showSettings) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {/* Essential Cookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-gray-900">Essential</h4>
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Always Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Required for basic site functionality and security.</p>
                </div>
                <input type="checkbox" checked={true} disabled className="w-4 h-4 rounded border-gray-300 text-primary-600" />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900">Analytics</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Helps us understand how visitors use the site.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900">Marketing</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Used for relevant ads and campaign tracking.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSavePreferences} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm">
                Save Preferences
              </Button>
              <Button onClick={() => setShowSettings(false)} variant="outline" className="border-gray-300 hover:bg-gray-50 font-semibold text-sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Compact banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-4">
        <Cookie className="w-5 h-5 text-primary-600 flex-shrink-0 hidden md:block" />
        <p className="flex-1 text-xs md:text-sm text-gray-600 leading-snug">
          We use cookies to improve your experience.{" "}
          <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-gray-500 hover:text-gray-700 underline hidden md:block"
          >
            Customize
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600"
            aria-label="Cookie settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <Button
            onClick={handleRejectAll}
            variant="outline"
            className="text-xs px-3 h-8 min-w-[70px] border-gray-300 font-medium"
          >
            Reject
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="text-xs px-3 h-8 min-w-[70px] bg-primary-600 hover:bg-primary-700 text-white font-medium"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
