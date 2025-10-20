"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, ChevronUp, RefreshCw, Target, DollarSign, Sparkles, PoundSterling, Settings } from "lucide-react"

export default function BudgetControls({
  totalSpent,
  tempBudget,
  setTempBudget,
  budgetPercentage,
  getBudgetCategory,
  isUpdating
}) {
  // Add hydration state to prevent SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false)
  const [initialBudget, setInitialBudget] = useState(null)
  const [showBudgetAdjust, setShowBudgetAdjust] = useState(false)
  const hasInitialized = useRef(false)

  // Check if over budget
  const isOverBudget = totalSpent > tempBudget
  const overBudgetAmount = Math.max(0, totalSpent - tempBudget)

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
    remaining: isHydrated ? (isOverBudget ? -overBudgetAmount : Math.max(0, tempBudget - totalSpent)) : tempBudget,
  }

  // Cap progress bar at 100% but show actual percentage in text
  const displayPercentage = Math.min(100, safeDisplayValues.budgetPercentage)
  const progressBarColor = isOverBudget 
    ? "bg-red-500" 
    : "bg-teal-500"

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
    <div className="relative overflow-hidden bg-primary-400 shadow-xl rounded-2xl">
      {/* Decorative background elements */}
      <img src="/Union.png" alt="" className="absolute top-[-50px]" />
      <img src="/Union3.png" alt="" className="absolute bottom-0 right-0" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-6 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute top-12 right-8 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
        <Sparkles className="absolute top-6 right-12 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
        <Sparkles className="absolute bottom-6 left-8 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
      </div>

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Total Spend</h2>
          </div>
        </div>

        {/* Total Spend Display */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-baseline gap-2">
            <PoundSterling className="w-8 h-8 text-white mb-1" />
            <span className="text-5xl font-bold text-white">{safeDisplayValues.totalSpent}</span>
          </div>
        </div>

        {/* Optional info text */}
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Your party plan total
          </p>
        </div>

        {/* Hidden budget adjustment section - keeping for future use */}
        <div className="hidden">
          <Button
          onClick={() => setShowBudgetAdjust(!showBudgetAdjust)}
          variant="outline"
          className="w-full flex items-center justify-between bg-white/80 hover:bg-white border-[hsl(var(--primary-200))] text-gray-700 hover:text-gray-900"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Adjust Budget</span>
            <span className="text-[hsl(var(--primary-600))] font-bold">£{tempBudget}</span>
          </div>
          {showBudgetAdjust ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Collapsible Budget Controls */}
        {showBudgetAdjust && (
          <div className="mt-4 pt-4 border-t border-[hsl(var(--primary-200))] space-y-4">
            <Slider
              value={[tempBudget]}
              onValueChange={(value) => {
                const newBudget = value[0]
                setTempBudget(newBudget)
              }}
              max={1000}
              min={300}
              step={50}
              className="w-full [&>span:first-child]:h-4 [&>span:first-child>span]:h-4 [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-[hsl(var(--primary-500))] [&>span:first-child>span]:to-[hsl(var(--primary-600))] [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-[hsl(var(--primary-100))] [&>span:first-child]:to-[hsl(var(--primary-200))] [&>span:first-child]:border [&>span:first-child]:border-[hsl(var(--primary-200))] [&>span:first-child]:shadow-inner"
              disabled={isUpdating}
            />

            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>£300</span>
              <span>£1000+</span>
            </div>
            
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700 bg-white/70 px-4 py-2 rounded-full shadow-sm border border-[hsl(var(--primary-200))] flex items-center justify-center">
                <RefreshCw
                  className={`w-4 h-4 mr-2 text-[hsl(var(--primary-600))] ${isUpdating ? "animate-spin" : ""}`}
                />
                {isUpdating ? "Updating suppliers..." : "Suppliers update as you adjust"}
              </span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}