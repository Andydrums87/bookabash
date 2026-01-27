"use client"

import { useState, useEffect } from "react"

export default function BudgetControls({
  totalSpent,
  onContinueToBook
}) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const displayTotal = isHydrated ? totalSpent : 0

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      {/* Header with arrow icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Party Total</h3>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>

      {/* Total Amount */}
      <div className="text-center py-6">
        <p className="text-4xl font-bold text-gray-900">
          £{displayTotal}
        </p>
      </div>

      {/* CTA Button */}
      {onContinueToBook && (
        <button
          onClick={onContinueToBook}
          className="bg-gray-900 hover:bg-gray-800 cursor-pointer w-full py-3 rounded-xl font-semibold text-white transition-colors"
        >
          Continue to Book
        </button>
      )}
    </div>
  )
}