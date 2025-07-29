"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronRight, RefreshCw, Target, Sparkles, PoundSterling } from "lucide-react"

export default function BudgetControls({
  totalSpent,
  tempBudget,
  setTempBudget,
  budgetPercentage,
  getBudgetCategory,
  isUpdating,
  showAdvancedControls,
  setShowAdvancedControls,
}) {
  // Add hydration state to prevent SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false)
  const [initialBudget, setInitialBudget] = useState(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    setIsHydrated(true)
    // Only set initial budget once to prevent re-renders
    if (!hasInitialized.current && tempBudget && !initialBudget) {
      setInitialBudget(tempBudget)
      hasInitialized.current = true
    }
  }, [tempBudget, initialBudget])

  // Use safe values during hydration to prevent mismatch
  const safeDisplayValues = {
    totalSpent: isHydrated ? totalSpent : 0,
    budgetPercentage: isHydrated ? budgetPercentage : 0,
    remaining: isHydrated ? Math.max(0, tempBudget - totalSpent) : tempBudget,
  }

  // Memoize expensive calculations
  const budgetCategory = getBudgetCategory(tempBudget)
  const badgeClassName = `text-xs font-semibold border-0 ${
    budgetCategory === "Essential"
      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
      : budgetCategory === "Complete"
        ? "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white"
        : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
  }`

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] shadow-xl rounded-2xl">
      {/* Decorative background elements matching header */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-6 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute top-12 right-8 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
        <div className="absolute top-20 left-1/3 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-60"></div>
        <div className="absolute bottom-12 right-6 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-50"></div>

        {/* Sparkle elements */}
        <Sparkles className="absolute top-6 right-12 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
        <Sparkles className="absolute bottom-6 left-8 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
      </div>

      <div className="p-6 relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Budget Tracker</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-white/50 px-3 py-1 rounded-full border border-[hsl(var(--primary-200))]">
            <div
              className={`w-2 h-2 rounded-full ${isUpdating ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
            ></div>
            <span className={`font-medium ${isUpdating ? "text-amber-600" : "text-emerald-600"}`}>
              {isUpdating ? "Updating..." : "Live Control"}
            </span>
          </div>
        </div>

        {/* Enhanced Budget Display */}
        <div className="space-y-6">
          <div className="flex items-baseline justify-between bg-gradient-to-r from-white to-[hsl(var(--primary-50))] p-4 rounded-xl border border-[hsl(var(--primary-100))]">
            <div className="flex items-baseline gap-2">
              <PoundSterling className="w-6 h-6 text-[hsl(var(--primary-600))] mb-1" />
              <span className="text-3xl font-bold text-[hsl(var(--primary-600))]">{safeDisplayValues.totalSpent}</span>
              <span className="text-gray-600 font-medium">of £{tempBudget}</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-800">£{safeDisplayValues.remaining}</div>
              <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">remaining</div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full h-4 shadow-inner border border-[hsl(var(--primary-200))]">
                <div
                  className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${safeDisplayValues.budgetPercentage}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">{safeDisplayValues.budgetPercentage}% used</span>
              <Badge className={badgeClassName}>{budgetCategory} Party</Badge>
            </div>
          </div>

          {/* Enhanced Budget Adjustment */}
          <div className="bg-gradient-to-br from-white to-[hsl(var(--primary-50))] rounded-xl p-5 border-2 border-[hsl(var(--primary-100))] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold text-gray-800">Adjust Budget</span>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-[hsl(var(--primary-600))]">£{tempBudget}</span>
              </div>
            </div>

            <Slider
              value={[tempBudget]}
              onValueChange={(value) => {
                // Debounce to prevent excessive updates
                const newBudget = value[0]
                setTempBudget(newBudget)
              }}
              max={1000}
              min={300}
              step={50}
              className="w-full [&>span:first-child]:h-4 [&>span:first-child>span]:h-4 [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-[hsl(var(--primary-500))] [&>span:first-child>span]:to-[hsl(var(--primary-600))] [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-[hsl(var(--primary-100))] [&>span:first-child]:to-[hsl(var(--primary-200))] [&>span:first-child]:border [&>span:first-child]:border-[hsl(var(--primary-200))] [&>span:first-child]:shadow-inner"
              disabled={isUpdating} // Disable during updates
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>£300</span>
              <span>£1000+</span>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm font-medium text-gray-700 bg-gradient-to-r from-white to-[hsl(var(--primary-50))] px-4 py-2 rounded-full shadow-sm border border-[hsl(var(--primary-200))] flex items-center justify-center">
                <RefreshCw
                  className={`w-4 h-4 mr-2 text-[hsl(var(--primary-600))] ${isUpdating ? "animate-spin" : ""}`}
                />
                {isUpdating ? "Updating suppliers..." : "Suppliers update as you adjust"}
              </span>
            </div>
          </div>

        

        
        </div>
      </div>
    </div>
  )
}
