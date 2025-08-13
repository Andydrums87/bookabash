"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Sparkles, CheckCircle, FileText } from "lucide-react"

export default function SnappysPresentParty({
  suppliers = {},
  enquiries = [],
  timeRemaining = 24,
  onPaymentReady,
  showPaymentCTA = false,
  isPaymentComplete = false, // New prop
}) {
  const [snappyExpression, setSnappyExpression] = useState("waiting")
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)

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
  const progressPercentage = totalSuppliers > 0 ? (confirmedCount / totalSuppliers) * 100 : 0

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage)
    }, 300)
    return () => clearTimeout(timer)
  }, [progressPercentage])

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

  const getProgressColor = () => {
    return "from-teal-500 to-teal-600"
  }

  const getSnappyMessage = () => {
    if (allConfirmed) {
      return isPaymentComplete ? "Party secured & paid! 🎉" : "All suppliers confirmed! 🎉"
    }
    if (confirmedCount > 0) {
      return `${confirmedCount} supplier${confirmedCount > 1 ? "s" : ""} confirmed`
    }
    return "Waiting for confirmations..."
  }

  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isPaymentComplete ? "#10b981" : "white"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white text-lg font-bold">
            {confirmedCount}/{totalSuppliers}
          </div>
          <div className="text-white/80 text-xs">{Math.round(progressPercentage)}%</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-primary-400 rounded-xl shadow-sm overflow-hidden p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-6 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-6 right-8 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-6 right-6 w-1 h-1 bg-white/30 rounded-full"></div>
      </div>

      <div className="relative z-10 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary-500 p-3 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-3xl font-extrabold">Party Progress</h3>
          {!allConfirmed && timeRemaining > 0 && (
            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)} left</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <CircularProgress percentage={animatedProgress} />
          </div>

          {/* Status message */}
          <div className="flex-1">
            <div className="text-lg font-semibold mb-1">{getSnappyMessage()}</div>
            <div className="text-white/80 text-sm">
              {totalSuppliers > 0 ? (
                <div className="space-y-1">
                  {supplierStates.map((supplier, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {supplier.status === "accepted" ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                      ) : (
                        <div className="w-3 h-3 border border-white/40 rounded-full" />
                      )}
                      <span className="capitalize text-xs">{supplier.category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                "No suppliers to track"
              )}
            </div>
          </div>
        </div>

        {allConfirmed && (
          <div className="mt-6">
            {isPaymentComplete ? (
              <div className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Party Secured & Paid
                <Sparkles className="w-4 h-4" />
              </div>
            ) : showPaymentCTA ? (
              <Button
                onClick={onPaymentReady}
                className="w-full bg-white text-primary-600 hover:bg-white/90 font-semibold py-3 rounded-lg"
              >
                <Sparkles className="mr-2 w-4 h-4" />
                Secure Party
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}