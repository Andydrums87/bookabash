"use client"
import { useState, useEffect, useMemo } from "react"
import { CheckCircle, Circle, MapPin, Sparkles, Cake, Palette, Gift, PartyPopper, Activity } from "lucide-react"

export default function PartyBuilderLoader({ isVisible, theme, childName, progress, partyDetails }) {
  const [completedItems, setCompletedItems] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  // Determine what's being built based on budget and guest count
  const checklistItems = useMemo(() => {
    const budget = partyDetails?.budget || 500
    const guestCount = parseInt(partyDetails?.guestCount || 0)
    const isLargeParty = guestCount >= 30

    const items = []

    // Always included
    items.push({ icon: MapPin, label: "Finding the perfect venue", color: "text-blue-500" })
    items.push({ icon: Sparkles, label: "Booking amazing entertainment", color: "text-purple-500" })
    items.push({ icon: Cake, label: "Choosing the perfect cake", color: "text-orange-500" })

    // Budget > 700: Add decorations, activities, party bags
    if (budget > 700) {
      items.push({ icon: Palette, label: "Adding beautiful decorations", color: "text-pink-500" })
      items.push({ icon: Activity, label: "Planning fun activities", color: "text-green-500" })
      items.push({ icon: Gift, label: "Preparing party bags", color: "text-teal-500" })

      // Large party (30+ guests): Add soft play
      if (isLargeParty) {
        items.push({ icon: Activity, label: "Setting up soft play", color: "text-indigo-500" })
      }
    }

    // Final item
    items.push({ icon: PartyPopper, label: "Your party is ready!", color: "text-primary-500" })

    return items
  }, [partyDetails?.budget, partyDetails?.guestCount])

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

    const totalDuration = 5000 // Total time for all items
    const itemDuration = totalDuration / checklistItems.length

    const interval = setInterval(() => {
      setCompletedItems((prev) => {
        if (prev < checklistItems.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, itemDuration)

    // Show final confetti when all items complete
    const confettiTimeout = setTimeout(() => {
      setCompletedItems(checklistItems.length)
      setShowConfetti(true)
    }, totalDuration)

    return () => {
      clearInterval(interval)
      clearTimeout(confettiTimeout)
    }
  }, [isVisible, checklistItems.length])

  // Get theme image - same as LocalStoragePartyHeader
  const getThemeImage = () => {
    if (!theme) return null
    const themeImages = {
      princess: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296152/iStock-1433142692_ukadz6.jpg",
      superhero: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296218/iStock-1150984736_evfnwn.jpg",
      dinosaur: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761295969/iStock-1126856615_wg9qil.jpg",
      unicorn: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296364/iStock-1202380918_flcyof.jpg",
      science: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380880/iStock-1603218889_xq4kqi.jpg",
      spiderman: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761209443/iStock-1165735224_ayrkw1.jpg",
      "taylor-swift": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380937/iStock-2201784646_cdvevq.jpg",
      cars: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380995/iStock-2176668301_cstncj.jpg",
      pirate: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296485/iStock-1283573104_bzl4zs.jpg",
      jungle: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296596/iStock-2221104953_mhafl2.jpg",
      football: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381299/iStock-488844390_wmv5zq.jpg",
      space: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761296848/iStock-1474868329_hxmo8u.jpg",
      mermaid: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297169/iStock-1434335578_h3dzbb.jpg",
      underwater: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1761297237/iStock-1061608412_thapyw.jpg"
    }
    return themeImages[theme.toLowerCase()] || null
  }

  const themeImage = getThemeImage()

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Theme Background Image */}
      {themeImage && (
        <div className="absolute inset-0">
          <img
            src={themeImage}
            alt={theme}
            className="w-full h-full object-cover"
          />
          {/* Lighter overlay for stronger image visibility */}
          <div className="absolute inset-0 bg-white/70"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Building Your Party!
          </h1>
          <p className="text-base text-gray-700 font-medium">
            Curating supplier recommendations for you
          </p>
        </div>

        {/* Animated Checklist */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-100 p-6 space-y-3">
          {checklistItems.map((item, index) => {
            const isCompleted = index < completedItems
            const isCurrent = index === completedItems
            const Icon = item.icon

            return (
              <div
                key={index}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isCompleted || isCurrent ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4'
                }`}
              >
                {/* Icon */}
                <div className={`relative flex-shrink-0 ${isCompleted ? 'animate-check-bounce' : ''}`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-[hsl(var(--primary-500))] fill-current" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-all ${
                    isCompleted ? 'text-gray-500 line-through' : isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </p>
                </div>

                {/* Loading spinner for current item */}
                {isCurrent && !isCompleted && (
                  <div className="flex-shrink-0 w-5 h-5 border-2 border-[hsl(var(--primary-500))] border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Confetti animation when complete */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

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

        @keyframes check-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-check-bounce {
          animation: check-bounce 0.5s ease-out;
        }

        .animate-confetti {
          animation: confetti forwards;
        }
      `}</style>
    </div>
  )
}