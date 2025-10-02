"use client"

import { useState, useEffect } from "react"
import { X, Cookie, Settings } from "lucide-react"
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
      // Small delay so banner doesn't flash on initial load
      setTimeout(() => setShowBanner(true), 1000)
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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
          {!showSettings ? (
            // Main Banner
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    We use cookies to enhance your browsing experience, analyze site traffic, and provide personalized content. 
                    By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences or reject non-essential cookies.
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Read our <a href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</a> and{" "}
                    <a href="/privacy-policy#cookies" className="text-primary-600 hover:underline">Cookie Policy</a> for more information.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50 font-semibold"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="ghost"
                      className="text-gray-700 hover:bg-gray-100 font-semibold"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Settings Panel
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cookie Preferences</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Always Active</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Required for basic site functionality, security, and payment processing. Cannot be disabled.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors use our site to improve user experience (Google Analytics, Heap).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Used to deliver relevant advertisements and track campaign effectiveness.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}