"use client"

import { useState, useEffect, useRef } from "react"
import { Gift, X } from "lucide-react"

const DISMISS_KEY = "partybags_social_proof_dismissed"
const SHOWN_COUNT_KEY = "partybags_social_proof_shown_count"
const LAST_SHOWN_AT_KEY = "partybags_social_proof_last_shown_at"
const MAX_TOASTS_PER_SESSION = 2
const MIN_GAP_MS = 25000 // 25s minimum between toasts

const FIRST_NAMES = [
  "Sarah", "Emma", "Jessica", "Rachel", "Laura", "Hannah", "Sophie", "Olivia",
  "Charlotte", "Amelia", "Isla", "Grace", "Megan", "Katie", "Lucy", "Rebecca",
  "Chloe", "Ella", "Mia", "Ava", "Lily", "Poppy", "Zoe", "Holly", "Claire",
  "Nicola", "Vicky", "Alice", "Ruby", "Natalie",
]

const LOCATIONS = [
  "St Albans",
  "Marshalswick",
  "Jersey Farm",
  "Bernards Heath",
  "Sandridge",
  "Harpenden",
  "Hatfield",
  "Wheathampstead",
  "Redbourn",
  "London Colney",
  "Bricket Wood",
]

const TIME_PHRASES = [
  "just now",
  "1 min ago",
  "2 mins ago",
  "3 mins ago",
  "5 mins ago",
  "7 mins ago",
  "12 mins ago",
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Pick a random item from arr, excluding anything in the `recent` array.
// Falls back to full array if everything is excluded (shouldn't happen in practice).
function pickRandomExcluding(arr, recent) {
  const available = arr.filter((item) => !recent.includes(item))
  const pool = available.length > 0 ? available : arr
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function PartyBagsSocialProofToast() {
  const [current, setCurrent] = useState(null)
  const [isEntering, setIsEntering] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissed = sessionStorage.getItem(DISMISS_KEY) === "true"
    setIsDismissed(dismissed)
  }, [])

  useEffect(() => {
    if (isDismissed) return

    // Read session state so cap + gap survive page refreshes
    const shownCount = parseInt(sessionStorage.getItem(SHOWN_COUNT_KEY) || "0", 10)
    if (shownCount >= MAX_TOASTS_PER_SESSION) return

    // Enforce minimum gap based on last shown timestamp
    const lastShownAt = parseInt(sessionStorage.getItem(LAST_SHOWN_AT_KEY) || "0", 10)
    const elapsedSinceLast = lastShownAt ? Date.now() - lastShownAt : Infinity
    const baseInitialDelay = 4000 + Math.random() * 2000 // 4-6s (≈5s avg)

    // If this is the first toast of the session: use the base delay.
    // If a previous toast was shown in this session: wait out the remainder
    // of the 25s minimum gap, plus the base delay.
    const initialDelay =
      elapsedSinceLast < MIN_GAP_MS
        ? MIN_GAP_MS - elapsedSinceLast + baseInitialDelay
        : baseInitialDelay

    let stopped = false
    let localShownCount = shownCount
    let cookiePollRef = null

    // Don't start the toast sequence until the cookie consent banner is gone.
    // The cookie banner sits at the bottom of the screen and would visually
    // clash with our bottom-left toast. Poll localStorage until the user has
    // accepted/rejected, then kick off the normal delay from that point.
    const waitForCookieConsent = (onReady) => {
      if (localStorage.getItem("cookieConsent")) {
        onReady()
        return
      }
      cookiePollRef = setInterval(() => {
        if (stopped) {
          clearInterval(cookiePollRef)
          cookiePollRef = null
          return
        }
        if (localStorage.getItem("cookieConsent")) {
          clearInterval(cookiePollRef)
          cookiePollRef = null
          onReady()
        }
      }, 500)
    }

    // Track recent picks to avoid obvious repeats.
    // Keep the last 8 names (≈27% of pool) and last 4 locations (≈36% of pool)
    // out of rotation so the same name/town doesn't appear twice in a row.
    const recentNames = []
    const recentLocations = []
    const NAME_HISTORY = 8
    const LOCATION_HISTORY = 4

    const showNext = () => {
      if (stopped) return
      if (localShownCount >= MAX_TOASTS_PER_SESSION) return

      const name = pickRandomExcluding(FIRST_NAMES, recentNames)
      const location = pickRandomExcluding(LOCATIONS, recentLocations)

      recentNames.push(name)
      if (recentNames.length > NAME_HISTORY) recentNames.shift()
      recentLocations.push(location)
      if (recentLocations.length > LOCATION_HISTORY) recentLocations.shift()

      const notification = {
        id: Date.now() + Math.random(),
        name,
        location,
        time: pickRandom(TIME_PHRASES),
      }
      setCurrent(notification)
      // Trigger enter animation on next tick
      requestAnimationFrame(() => setIsEntering(true))

      // Persist that a toast was shown so refreshes can't replay it
      localShownCount += 1
      sessionStorage.setItem(SHOWN_COUNT_KEY, String(localShownCount))
      sessionStorage.setItem(LAST_SHOWN_AT_KEY, String(Date.now()))

      // Visible duration: 5s, then slide out
      timeoutRef.current = setTimeout(() => {
        setIsEntering(false)
        // After slide-out finishes, clear and maybe schedule next
        timeoutRef.current = setTimeout(() => {
          setCurrent(null)
          if (localShownCount >= MAX_TOASTS_PER_SESSION) return
          // Next interval: 25-45s
          const nextDelay = 25000 + Math.random() * 20000
          timeoutRef.current = setTimeout(showNext, nextDelay)
        }, 400)
      }, 5000)
    }

    waitForCookieConsent(() => {
      if (stopped) return
      timeoutRef.current = setTimeout(showNext, initialDelay)
    })

    return () => {
      stopped = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (cookiePollRef) clearInterval(cookiePollRef)
    }
  }, [isDismissed])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true")
    setIsDismissed(true)
    setIsEntering(false)
    setCurrent(null)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  if (isDismissed || !current) return null

  return (
    <div
      className="fixed bottom-4 left-4 z-50 pointer-events-none"
      style={{
        maxWidth: "calc(100vw - 2rem)",
      }}
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 bg-white rounded-xl shadow-2xl border border-gray-100 pl-3 pr-2 py-2.5 transition-all duration-400 ease-out ${
          isEntering
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-8"
        }`}
        style={{
          transitionProperty: "opacity, transform",
          minWidth: "260px",
          maxWidth: "320px",
        }}
        role="status"
        aria-live="polite"
      >
        <span
          className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
          style={{ backgroundColor: "#FF6E4C" }}
        >
          <Gift className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-[13px] text-gray-900">
            <span className="font-semibold">{current.name}</span>
            <span className="text-gray-600"> from {current.location}</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Booked her party ·{" "}
            <span className="font-semibold" style={{ color: "#FF6E4C" }}>
              with free party bags
            </span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{current.time}</p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="flex-shrink-0 w-6 h-6 rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
