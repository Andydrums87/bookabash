"use client"

import { useState, useEffect } from "react"
import { Gift, X } from "lucide-react"

const DISMISS_KEY = "partybags_campaign_banner_dismissed"

export default function PartyBagsCampaignBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const dismissed = localStorage.getItem(DISMISS_KEY) === "true"
    if (!dismissed) setIsVisible(true)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="relative w-full text-white" style={{ backgroundColor: "#0F1629" }}>
      <style jsx>{`
        @keyframes partybags-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 110, 76, 0.55);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(255, 110, 76, 0);
          }
        }
        .partybags-pulse {
          animation: partybags-pulse 2s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .partybags-pulse {
            animation: none;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-2.5 flex items-center justify-between gap-3">
        {/* MOBILE: icon + stacked two-line text */}
        <div className="flex sm:hidden items-center gap-3 flex-1 min-w-0">
          <span
            className="partybags-pulse flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#FF6E4C" }}
          >
            <Gift className="w-5 h-5 text-white" strokeWidth={2.5} />
          </span>
          <div className="flex-1 min-w-0 leading-tight">
            <div
              className="text-[9px] font-bold tracking-[0.15em] uppercase"
              style={{ color: "#FF6E4C" }}
            >
              ⚡ Limited Time · Act Now
            </div>
            <div className="text-sm font-extrabold tracking-wide uppercase mt-0.5">
              Free Party Bags<span className="normal-case font-semibold text-white/80"> with every booking</span>
            </div>
            <div className="text-[11px] text-white/75 mt-0.5">
              First 20 bookings ·{" "}
              <span className="font-bold" style={{ color: "#FF6E4C" }}>
                Ends April 30
              </span>
            </div>
          </div>
        </div>

        {/* DESKTOP: pill + single-line */}
        <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
          <span
            className="partybags-pulse inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex-shrink-0"
            style={{ backgroundColor: "#FF6E4C", color: "white" }}
          >
            <Gift className="w-3 h-3" strokeWidth={2.5} />
            Limited time
          </span>
          <p className="text-sm leading-tight truncate">
            <span className="font-semibold">Free party bags with every booking</span>
            <span className="text-white/70"> — first 20 bookings · </span>
            <span className="font-semibold" style={{ color: "#FF6E4C" }}>Ends April 30</span>
          </p>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="flex-shrink-0 w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
