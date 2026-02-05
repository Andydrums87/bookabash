"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Baby, UtensilsCrossed, Cake, Gift, Info } from "lucide-react"

/**
 * Shows a recommendation banner for ages 1-2 explaining that
 * pubs/restaurants with catering are recommended instead of
 * blank canvas venues with entertainers.
 */
export default function AgeBasedRecommendationBanner({
  childAge,
  childName,
  onDismiss
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Only show for ages 1-2
  const shouldShow = childAge && (childAge === 1 || childAge === 2)

  useEffect(() => {
    if (!shouldShow) return

    // Check if user has already dismissed this banner
    const dismissedKey = `age_recommendation_dismissed_${childAge}`
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true'

    if (wasDismissed) {
      setIsDismissed(true)
      return
    }

    // Show banner after a short delay for nice animation
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [shouldShow, childAge])

  const handleDismiss = () => {
    setIsVisible(false)
    // Remember dismissal
    const dismissedKey = `age_recommendation_dismissed_${childAge}`
    localStorage.setItem(dismissedKey, 'true')

    setTimeout(() => {
      setIsDismissed(true)
      onDismiss?.()
    }, 300)
  }

  if (!shouldShow || isDismissed) return null

  const firstName = childName?.split(' ')[0] || 'your little one'
  const ageText = childAge === 1 ? '1st' : '2nd'

  return (
    <div
      className={`
        transition-all duration-300 ease-out mb-4
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                PartySnap's Tip for {firstName}'s {ageText} Birthday
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              For little ones turning {childAge}, we recommend a <span className="font-medium text-purple-700">pub or restaurant with catering</span> rather than a blank canvas venue. It's less stressful and the grown-ups can enjoy themselves too!
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/50 rounded-full transition-colors flex-shrink-0"
            aria-label="Dismiss tip"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Recommended items */}
        <div className="px-4 pb-4">
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              What we recommend
            </p>
            <div className="flex flex-wrap gap-2">
              <RecommendationChip icon={UtensilsCrossed} label="Venue with Catering" highlight />
              <RecommendationChip icon={Cake} label="Birthday Cake" />
              <RecommendationChip icon={Gift} label="Party Bags" />
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Entertainers and bouncy castles are better suited for ages 3+. You can always add them if you'd like!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendationChip({ icon: Icon, label, highlight = false }) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
        ${highlight
          ? 'bg-purple-100 text-purple-700 font-medium'
          : 'bg-gray-100 text-gray-700'
        }
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  )
}
