"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Sparkles, CheckCircle, FileText, CreditCard, Zap } from "lucide-react"

export default function SnappysPresentParty({
  suppliers = {},
  enquiries = [],
  timeRemaining = 24,
  onPaymentReady,
  showPaymentCTA = false,
  isPaymentComplete = false,
  totalOutstandingCost = 0, // New prop for total outstanding amount
  outstandingSuppliers = [], // New prop for list of suppliers needing payment
}) {
  const [snappyExpression, setSnappyExpression] = useState("waiting")
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [pulsePayment, setPulsePayment] = useState(false)

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

  // Pulse payment button when multiple suppliers need payment
  useEffect(() => {
    if (outstandingSuppliers.length > 1 && showPaymentCTA) {
      setPulsePayment(true)
      const timer = setTimeout(() => setPulsePayment(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [outstandingSuppliers.length, showPaymentCTA])

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

  const getSnappyMessage = () => {
    if (allConfirmed) {
      return isPaymentComplete ? "Party secured & paid! 🎉" : "All suppliers confirmed! 🎉"
    }
    if (confirmedCount > 0) {
      return `${confirmedCount} supplier${confirmedCount > 1 ? "s" : ""} confirmed`
    }
    return "Waiting for confirmations..."
  }

  // New function to get payment button text
  const getPaymentButtonText = () => {
    if (outstandingSuppliers.length > 1) {
      return `Secure All ${outstandingSuppliers.length} Suppliers - £${totalOutstandingCost}`
    }
    return `Secure Your Party - £${totalOutstandingCost}`
  }

  const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
  
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#14b8a6" // teal color
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white text-lg font-bold">
            {confirmedCount}/{totalSuppliers}
          </div>
          <div className="text-white text-xs">
            {Math.round(progressPercentage)}%
          </div>
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

        {/* Enhanced payment section */}
        {allConfirmed && (
          <div className="mt-6">
            {isPaymentComplete ? (
              <div className="w-full bg-teal-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Party Secured & Paid
                <Sparkles className="w-4 h-4" />
              </div>
            ) : showPaymentCTA ? (
              <div className="space-y-3">
                {/* Outstanding suppliers summary */}
                {outstandingSuppliers.length > 1 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-sm text-white/90 mb-2 text-center font-medium">
                      Ready to secure {outstandingSuppliers.length} suppliers:
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {outstandingSuppliers.map((supplier, index) => (
                        <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {supplier}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Main payment button - enhanced for multiple suppliers */}
                <Button
                  onClick={onPaymentReady}
                  className={`w-full h-14 animate-pulse bg-teal-400 text-white hover:bg-teal-500 font-bold text-lg rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200 ${
                    pulsePayment ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {outstandingSuppliers.length > 1 ? (
                      <Zap className="w-6 h-6 text-amber-500" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    <span>{getPaymentButtonText()}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
                
                {/* Payment explanation */}
                <div className="text-center">
                  <p className="text-xs text-white/70">
                    One payment secures all your confirmed suppliers
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}