"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ChevronRight, RefreshCw } from "lucide-react"

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
  const badgeClassName = `text-xs ${
    budgetCategory === "Essential"
      ? "border-orange-400 bg-orange-50 text-orange-700"
      : budgetCategory === "Complete"
        ? "border-primary/50 bg-primary/10 text-primary"
        : "border-purple-400 bg-purple-50 text-purple-700"
  }`

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Budget Tracker</h2>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className={`font-medium ${isUpdating ? 'text-red-600' : 'text-green-600'}`}>
            {isUpdating ? 'Updating...' : 'Live Control'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-primary">£{safeDisplayValues.totalSpent}</span>
            <span className="text-gray-600"> of £{tempBudget}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">£{safeDisplayValues.remaining}</div>
            <div className="text-sm text-gray-500">remaining</div>
          </div>
        </div>
        
        <Progress 
          value={safeDisplayValues.budgetPercentage} 
          className="h-2" 
        />
        <div className="text-sm text-gray-500 text-right">{safeDisplayValues.budgetPercentage}% used</div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Adjust Budget</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">£{tempBudget}</span>
              <Badge variant="outline" className={badgeClassName}>
                {budgetCategory} Party
              </Badge>
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
            className="w-full [&>span:first-child]:h-3 [&>span:first-child>span]:h-3 [&>span:first-child>span]:bg-[#FF6E4C]"
            disabled={isUpdating} // Disable during updates
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>£300</span>
            <span>£1000+</span>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-xs font-medium text-gray-700 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center justify-center">
              <RefreshCw className={`w-3 h-3 mr-2 text-primary ${isUpdating ? "animate-spin" : ""}`} />
              {isUpdating ? 'Updating suppliers...' : 'Suppliers update as you adjust'}
            </span>
          </div>
        </div>
        
        <div className="text-center border-t border-gray-100 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="text-gray-600 hover:text-primary"
          >
            {showAdvancedControls ? "Hide" : "Show"} Advanced Options
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAdvancedControls ? "rotate-90" : ""}`} />
          </Button>
        </div>
        
        {showAdvancedControls && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Quick Presets</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[400, 600, 800].map((presetValue) => (
                    <button
                      key={presetValue}
                      className={`p-2.5 rounded-lg border text-center transition-all text-sm ${
                        tempBudget === presetValue
                          ? "border-primary bg-primary/10 text-primary shadow-md font-semibold"
                          : "border-gray-300 hover:border-gray-400 text-gray-700"
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isUpdating && setTempBudget(presetValue)}
                      disabled={isUpdating}
                    >
                      <div>{getBudgetCategory(presetValue)}</div>
                      <div className="text-xs">£{presetValue}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}