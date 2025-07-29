"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Sparkles } from "lucide-react"

export default function SnappysPresentParty({
  suppliers = {},
  enquiries = [],
  timeRemaining = 24,
  onPaymentReady,
  showPaymentCTA = false,
}) {
  const [snappyExpression, setSnappyExpression] = useState("waiting")

  // Filter out einvites from tracking
  const trackableSuppliers = Object.entries(suppliers).filter(([key, supplier]) => supplier && key !== "einvites")
  const totalSuppliers = trackableSuppliers.length
  const supplierStates = trackableSuppliers.map(([type, supplier]) => {
    const enquiry = enquiries.find((e) => e.supplier_category === type)
    return {
      type,
      name: supplier.name,
      status: enquiry?.status || "pending",
      category: type,
    }
  })

  const confirmedCount = supplierStates.filter((s) => s.status === "accepted").length
  const allConfirmed = confirmedCount === totalSuppliers && totalSuppliers > 0

  // Update Snappy's mood based on progress
  useEffect(() => {
    if (allConfirmed) {
      setSnappyExpression("celebrating")
    } else if (confirmedCount > 0) {
      setSnappyExpression("excited")
    } else {
      setSnappyExpression("waiting")
    }
  }, [confirmedCount, allConfirmed])

  const formatTime = (hours) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const progressPercentage = totalSuppliers > 0 ? (confirmedCount / totalSuppliers) * 100 : 0

  return (
    <div className="relative w-full bg-gradient-to-r from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border border-[hsl(var(--primary-200))] rounded-xl shadow-sm overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-8 w-1 h-1 bg-[hsl(var(--primary-300))] rounded-full opacity-40"></div>
        <div className="absolute top-3 right-12 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-50"></div>
        <Sparkles className="absolute top-2 right-20 w-3 h-3 text-[hsl(var(--primary-300))] opacity-30" />
      </div>

      <div className="relative z-10 px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Snappy - Compact */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-[hsl(var(--primary-50))] border border-[hsl(var(--primary-200))] rounded-lg flex items-center justify-center shadow-sm">
              <img
                src={
                  snappyExpression === "celebrating"
                    ? "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753256660/dwb6vr6lxyj7ubokfeel.png"
                    : snappyExpression === "excited"
                      ? "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291833/ctcf51iyrrhfv6y481dl.jpg"
                      : "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png"
                }
                alt="Snappy"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "block"
                }}
                onLoad={(e) => {
                  e.target.nextSibling.style.display = "none"
                }}
              />
              <div className="text-2xl" style={{ display: "none" }}>
                {snappyExpression === "celebrating" ? "🐊🎉" : snappyExpression === "excited" ? "🐊😊" : "🐊😴"}
              </div>
            </div>
          </div>

          {/* Progress Section - Takes up most space */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">
                {allConfirmed ? "All suppliers confirmed! 🎉" : "Supplier confirmations"}
              </span>
              <span className="text-sm font-medium text-[hsl(var(--primary-700))]">
                {confirmedCount}/{totalSuppliers} confirmed
              </span>
            </div>

            {/* Horizontal Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full h-3 shadow-inner border border-[hsl(var(--primary-200))]">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{
                    width: `${progressPercentage}%`,
                    background: allConfirmed
                      ? "linear-gradient(90deg, hsl(var(--primary-500)), hsl(var(--primary-600)))"
                      : "linear-gradient(90deg, hsl(var(--primary-500)), hsl(var(--primary-600)))",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Status/Time - Compact */}
          <div className="flex-shrink-0 text-right">
            {!allConfirmed && timeRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--primary-700))] bg-white/80 px-3 py-1 rounded-full border border-[hsl(var(--primary-300))] shadow-sm mb-2">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}

            {allConfirmed && showPaymentCTA && (
              <Button
                onClick={onPaymentReady}
                size="sm"
                className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white rounded-lg shadow-sm"
              >
                Secure Party
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            )}

            {!allConfirmed && <div className="text-xs text-gray-600">{Math.round(progressPercentage)}% complete</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
