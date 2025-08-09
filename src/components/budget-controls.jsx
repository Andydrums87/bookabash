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
  isUpdating,
  showAdvancedControls,
  setShowAdvancedControls,
}) {
  // Add hydration state to prevent SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false)
  const [initialBudget, setInitialBudget] = useState(null)
  const [showBudgetAdjust, setShowBudgetAdjust] = useState(false)
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
    <div className="relative overflow-hidden bg-white shadow-xl rounded-2xl">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-6 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute top-12 right-8 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
        <Sparkles className="absolute top-6 right-12 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
        <Sparkles className="absolute bottom-6 left-8 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
      </div>

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Budget Tracker</h2>
          </div>
    
        </div>

        {/* Budget Display */}
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <PoundSterling className="w-6 h-6 text-gray-900 mb-1" />
            <span className="text-3xl font-bold text-gray-900">{safeDisplayValues.totalSpent}</span>
            <span className="text-gray-600 font-medium">of £{tempBudget}</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-800">£{safeDisplayValues.remaining}</div>
            <div className="text-sm text-gray-600">remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <div className="w-full bg-gray-100 rounded-full h-4 shadow-inner">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${safeDisplayValues.budgetPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">{safeDisplayValues.budgetPercentage}% used</span>
      
          </div>
        </div>

        {/* Expandable Budget Adjustment */}
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
  )
}