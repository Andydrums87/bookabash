"use client"
import { useState, useEffect, useMemo } from "react"
import Lottie from "lottie-react"
import partyAnimation from "@/../../public/animations/#0101J_S_07 (1).json"
import clownJugglingAnimation from "@/../../public/animations/clown-juggling.json"
import mapPinAnimation from "@/../../public/animations/map-pin-location.json"

export default function PartyBuilderLoader({ isVisible, theme, childName, progress, partyDetails, partyPlan }) {
  const [completedItems, setCompletedItems] = useState(0)

  // Determine what's being built based on budget and guest count
  const checklistItems = useMemo(() => {
    const budget = partyDetails?.budget || 500
    const guestCount = parseInt(partyDetails?.guestCount || 0)
    const isLargeParty = guestCount >= 30

    const items = []

    // Always included - with custom Lottie animations
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

    // Budget > 700: Add decorations, activities, party bags
    if (budget > 700) {
      items.push({
        animation: partyAnimation,
        label: "Suggesting beautiful decorations",
        type: "decorations"
      })
      items.push({
        animation: partyAnimation,
        label: "Finding fun activities",
        type: "activities"
      })
      items.push({
        animation: partyAnimation,
        label: "Choosing party bags",
        type: "partybags"
      })

      // Large party (30+ guests): Add soft play
      if (isLargeParty) {
        items.push({
          animation: partyAnimation,
          label: "Adding soft play options",
          type: "bouncycastle"
        })
      }
    }

    // Final item - use emoji as icon
    items.push({ icon: "🎉", label: "Your party plan is ready!", isSupplier: false })

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
      if (currentItem < checklistItems.length - 1) {
        setCompletedItems(currentItem)
        setTimeout(advanceItem, itemDuration)
      } else if (currentItem === checklistItems.length - 1) {
        // Last item (party ready) - show for less time (1 second)
        setCompletedItems(currentItem)
      }
    }

    // Start the sequence
    const initialTimeout = setTimeout(advanceItem, itemDuration)

    return () => {
      clearTimeout(initialTimeout)
    }
  }, [isVisible, checklistItems.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">
            Building Your Party Plan
          </h1>
        </div>

        {/* Custom Lottie Animation */}
        <div className="text-center space-y-6">
          {/* Show current item's Lottie Animation */}
          {completedItems >= 0 && completedItems < checklistItems.length && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 md:w-80 md:h-80">
                  {checklistItems[completedItems]?.animation ? (
                    <Lottie
                      animationData={checklistItems[completedItems].animation}
                      loop={true}
                      autoplay={true}
                      key={completedItems} // Force re-render when item changes
                    />
                  ) : (
                    // Show emoji for final item
                    <div className="flex items-center justify-center h-full">
                      <div className="w-32 h-32 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-7xl">{checklistItems[completedItems]?.icon}</span>
                      </div>
                    </div>
                  )}
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

          {/* ✅ Show helpful message on final item */}
          {completedItems === checklistItems.length - 1 && (
            <div className="mt-6 space-y-3 animate-fade-in">
              <p className="text-gray-600 text-base font-medium">
                Taking you to your dashboard...
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700">
                  💡 Once in your dashboard, you can <span className="font-semibold">customize</span>, <span className="font-semibold">swap</span>, or <span className="font-semibold">add</span> anything you like!
                </p>
              </div>
            </div>
          )}

          {/* Progress indicator */}
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
          </div>
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