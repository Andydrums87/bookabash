"use client"

import { useState, useEffect } from "react"
import { Sparkles, CheckCircle } from "lucide-react"

export default function SnappysPresentParty({
  suppliers = {},
  enquiries = [],
  isPaymentComplete = false,
}) {
  const [snappyExpression, setSnappyExpression] = useState("waiting")
  const [animatedProgress, setAnimatedProgress] = useState(0)

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

  const getSnappyMessage = () => {
    if (allConfirmed) {
      return isPaymentComplete ? "Party secured & paid! 🎉" : "All suppliers confirmed! 🎉"
    }
    if (confirmedCount > 0) {
      return `${confirmedCount} supplier${confirmedCount > 1 ? "s" : ""} confirmed`
    }
    return "Waiting for confirmations..."
  }

  // Semi-circular progress arc component (like reference image)
  const SemiCircularProgress = ({ percentage }) => {
    const size = 140
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const halfCircumference = radius * Math.PI
    const strokeDashoffset = halfCircumference - (percentage / 100) * halfCircumference

    return (
      <div className="relative flex flex-col items-center">
        <svg width={size} height={size / 2 + 10} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress arc - orange like reference */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            stroke="#f97316"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Percentage badge */}
        <div className="absolute top-0 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {Math.round(percentage)}%
        </div>
        {/* Center text */}
        <div className="text-center -mt-6">
          <div className="text-2xl font-bold text-gray-900">{confirmedCount}/{totalSuppliers}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      {/* Header with arrow icon */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">Party Progress</h3>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>

      {/* Progress Arc and Supplier List */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <SemiCircularProgress percentage={animatedProgress} />
        </div>

        {/* Supplier checklist */}
        <div className="flex-1 pt-2">
          <div className="space-y-2">
            {supplierStates.map((supplier, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {supplier.status === "accepted" ? (
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={`capitalize ${supplier.status === "accepted" ? "text-gray-900" : "text-gray-400"}`}>
                  {supplier.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status and Payment Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 mb-3">{getSnappyMessage()}</p>

        {allConfirmed && isPaymentComplete && (
          <div className="w-full bg-green-50 border border-green-200 text-green-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Party Secured & Paid
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  )
}