"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import Lottie from "lottie-react"
import partyAnimation from "@/../../public/animations/#0101J_S_07 (1).json"
import clownJugglingAnimation from "@/../../public/animations/clown-juggling.json"
import mapPinAnimation from "@/../../public/animations/map-pin-location.json"
import shoppingBagAnimation from "@/../../public/animations/shopping-bag.json"
import birthdayConfettiAnimation from "@/../../public/animations/birthday-confetti-balloon.json"
import trampolineAnimation from "@/../../public/animations/trampoline.json"
import { RefreshCw, WifiOff, AlertCircle } from "lucide-react"

export default function PartyBuilderLoader({ isVisible, theme, childName, progress, partyDetails, partyPlan, onRetry, onTimeout }) {
  const [completedItems, setCompletedItems] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showSlowMessage, setShowSlowMessage] = useState(false)
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // Time thresholds (in seconds)
  const SLOW_THRESHOLD = 15  // Show "taking longer" message
  const TIMEOUT_THRESHOLD = 30  // Show timeout/retry option

  // Progressive messages for slow loading
  const slowLoadingMessages = [
    "Still working on it...",
    "Finding the best options for you...",
    "Almost there, just a moment longer...",
    "Your party is worth the wait..."
  ]

  const getSlowMessage = useCallback(() => {
    if (elapsedTime < SLOW_THRESHOLD) return null
    const messageIndex = Math.min(
      Math.floor((elapsedTime - SLOW_THRESHOLD) / 5),
      slowLoadingMessages.length - 1
    )
    return slowLoadingMessages[messageIndex]
  }, [elapsedTime])

  // Handle retry
  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    setShowTimeoutMessage(false)
    setElapsedTime(0)
    setCompletedItems(0)

    if (onRetry) {
      try {
        await onRetry()
      } catch (error) {
        console.error('Retry failed:', error)
        setShowTimeoutMessage(true)
      }
    }

    setIsRetrying(false)
  }, [onRetry])

  // Determine what's being built based on budget and guest count
  const checklistItems = useMemo(() => {
    const budget = partyDetails?.budget || 500
    const guestCount = parseInt(partyDetails?.guestCount || 0)
    const isLargeParty = guestCount >= 30

    const items = []

    // Always included - core items for all budgets
    items.push({
      animation: mapPinAnimation,
      label: "Recommending a great venue",
      type: "venue"
    })
    items.push({
      animation: clownJugglingAnimation,
      label: "Selecting amazing entertainment",
      type: "entertainment"
    })
    items.push({
      animation: partyAnimation,
      label: "Picking the perfect cake",
      type: "cake"
    })
    items.push({
      animation: shoppingBagAnimation,
      label: "Choosing party bags",
      type: "partybags"
    })

    // Budget > 700: Add decorations and activities
    if (budget > 700) {
      items.push({
        animation: birthdayConfettiAnimation,
        label: "Suggesting beautiful decorations",
        type: "decorations"
      })
      items.push({
        animation: trampolineAnimation,
        label: "Finding fun activities",
        type: "activities"
      })
    }

    return items
  }, [partyDetails?.budget, partyDetails?.guestCount, partyPlan])

  // Disable scrolling when loader is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      setCompletedItems(0)
      return
    }

    // ✅ 2.5 seconds per item to enjoy the animations
    const itemDuration = 2500
    let currentItem = 0

    const advanceItem = () => {
      currentItem++
      if (currentItem < checklistItems.length) {
        setCompletedItems(currentItem)
        if (currentItem < checklistItems.length - 1) {
          setTimeout(advanceItem, itemDuration)
        }
      }
    }

    // Start the sequence
    const initialTimeout = setTimeout(advanceItem, itemDuration)

    return () => {
      clearTimeout(initialTimeout)
    }
  }, [isVisible, checklistItems.length])

  // Track elapsed time
  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0)
      setShowSlowMessage(false)
      setShowTimeoutMessage(false)
      return
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1

        // Show slow message after threshold
        if (newTime >= SLOW_THRESHOLD && !showTimeoutMessage) {
          setShowSlowMessage(true)
        }

        // Show timeout after threshold
        if (newTime >= TIMEOUT_THRESHOLD) {
          setShowTimeoutMessage(true)
          if (onTimeout) {
            onTimeout()
          }
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible, showTimeoutMessage, onTimeout])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-50))] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Custom Lottie Animation */}
        <div className="text-center space-y-6">
          {/* Show current item's Lottie Animation - hide during timeout */}
          {!showTimeoutMessage && completedItems >= 0 && completedItems < checklistItems.length && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 md:w-80 md:h-80">
                  <Lottie
                    animationData={checklistItems[completedItems].animation}
                    loop={true}
                    autoplay={true}
                    key={completedItems} // Force re-render when item changes
                  />
                </div>
              </div>

              {/* Current item label */}
              <div className="animate-fade-in-scale">
                <h2 className="text-xl font-bold text-gray-900">
                  {checklistItems[completedItems]?.label}
                </h2>
              </div>
            </>
          )}

          {/* Show "Nearly there..." after last item completes */}
          {completedItems === checklistItems.length && !showTimeoutMessage && (
            <div className="animate-fade-in text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {getSlowMessage() || "Nearly there..."}
              </h2>
              {showSlowMessage && !showTimeoutMessage && (
                <p className="text-sm text-gray-500 mt-2 animate-fade-in">
                  This is taking a bit longer than usual
                </p>
              )}
            </div>
          )}

          {/* Timeout message with retry option */}
          {showTimeoutMessage && (
            <div className="animate-fade-in text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Taking longer than expected
              </h2>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                This might be due to a slow connection. Would you like to try again?
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white rounded-full font-medium transition-all disabled:opacity-70"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Go back home
                </button>
              </div>
            </div>
          )}


          {/* Progress indicator - hide during timeout */}
          {!showTimeoutMessage && (
            <div className="pt-8">
              <div className="flex justify-center gap-2">
                {checklistItems.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index < completedItems
                        ? 'w-8 bg-[hsl(var(--primary-500))]'
                        : index === completedItems
                        ? 'w-12 bg-[hsl(var(--primary-400))]'
                        : 'w-8 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {/* Elapsed time indicator for slow loads */}
              {showSlowMessage && elapsedTime > SLOW_THRESHOLD && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  {elapsedTime}s elapsed
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          75% {
            transform: translateY(-10px) translateX(-10px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(10deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes shimmer-progress {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes pulse-gentle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes cake-tier-pop {
          0% {
            transform: translateY(20px) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(-10px) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes flicker {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-cake-tier-pop {
          animation: cake-tier-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-flicker {
          animation: flicker 0.5s infinite;
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-pop {
          animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-float-slow {
          animation: float-slow 6s infinite ease-in-out;
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.8) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .animate-shimmer-progress {
          animation: shimmer-progress 1s infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 2s infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}