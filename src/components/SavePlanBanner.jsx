"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Loader2, CheckCircle, Gift, Sparkles } from "lucide-react"

export default function SavePlanBanner({
  partyDetails,
  partyPlan,
  totalCost,
  childName,
  onSuccess,
  delayMinutes = 2.5 // Show after 2.5 minutes by default
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")

  // Check if banner should be shown
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem('save_plan_banner_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Check if user has already saved their plan
    const savedEmail = localStorage.getItem('saved_party_email')
    if (savedEmail) {
      setIsDismissed(true)
      return
    }

    // Check if user already has a discount code
    const discountCode = localStorage.getItem('save_plan_discount_code')
    if (discountCode) {
      setIsDismissed(true)
      return
    }

    // Set timer to show banner
    const delayMs = delayMinutes * 60 * 1000
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMinutes])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem('save_plan_banner_dismissed', 'true')
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setErrorMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setErrorMessage("")

    try {
      const sessionId = localStorage.getItem('tracking_session_id')

      const res = await fetch("/api/save-party-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          sessionId,
          partyDetails,
          partyPlan,
          totalCost,
          marketingConsent: false
        })
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        // Store the discount code and email
        localStorage.setItem('saved_party_email', email.toLowerCase().trim())
        if (data.discountCode) {
          localStorage.setItem('save_plan_discount_code', data.discountCode)
        }
        onSuccess?.()

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 5000)
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Save plan error:", error)
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  // Don't render if dismissed or not visible yet
  if (isDismissed || !isVisible) return null

  const displayName = childName || partyDetails?.childName || partyDetails?.firstName || "your child"

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-[#FF7247] to-[#E85A30] rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {status === "success" ? (
            // Success state
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Plan saved! Check your inbox
              </h3>
              <p className="text-white/90 text-sm">
                Your £20 off code is on its way to {email}
              </p>
            </div>
          ) : (
            // Form state
            <div className="p-5 md:p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="hidden sm:flex w-12 h-12 bg-white/20 rounded-full items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">
                      Limited Time
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                    Save your plan and get £20 off
                  </h3>
                  <p className="text-white/80 text-sm mt-1 hidden sm:block">
                    We'll email you {displayName}'s party plan with an exclusive discount code
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === "error") setStatus("idle")
                    }}
                    placeholder="Enter your email"
                    className="pl-10 h-12 bg-white border-0 text-gray-900 placeholder:text-gray-400"
                    disabled={status === "loading"}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold whitespace-nowrap"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save My Plan"
                  )}
                </Button>
              </form>

              {/* Error message */}
              {status === "error" && (
                <p className="text-yellow-200 text-sm mt-2 text-center">{errorMessage}</p>
              )}

              {/* Trust text */}
              <p className="text-white/60 text-xs mt-3 text-center">
                No spam. Just your party plan and discount code.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
