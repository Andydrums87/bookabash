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
    <div className="relative overflow-hidden bg-[hsl(var(--primary-400))] shadow-xl rounded-2xl">
      {/* Decorative background elements */}
      <img src="/Union.png" alt="" className="absolute top-[-50px]" />
      <img src="/Union3.png" alt="" className="absolute bottom-0 right-0" />

      <div className="p-6 relative z-10">
        {/* Total Amount - Compact */}
        <div className="text-center py-4">
          <p className="text-white/70 text-sm mb-2">Party Total</p>
          <p className="text-5xl font-bold text-white">
            £{displayTotal}
          </p>
        </div>

        {/* CTA Button */}
        {onContinueToBook && (
          <button
            onClick={onContinueToBook}
            className="bg-white cursor-pointer w-full py-4 rounded-full hover:bg-[hsl(var(--primary-100))] font-semibold text-gray-900"
          >
            Continue to Book
          </button>
        )}
      </div>
    </div>
  )
}