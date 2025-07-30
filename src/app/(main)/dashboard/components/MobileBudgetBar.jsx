"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import BudgetControls from "@/components/budget-controls"

export default function MobileBudgetBar({ 
  totalSpent = 0, 
  tempBudget = 600,
  budgetControlProps = {}
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Main drawer container */}
      <div 
        className={`bg-background border-t border-[hsl(var(--primary-200))] shadow-lg transition-transform duration-300 ease-out ${
          isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-44px)]'
        }`}
        style={{ height: isExpanded ? '70vh' : '44px' }}
      >
        {/* Handle/Tab */}
        <div 
          className="flex items-center justify-between px-4 py-1 cursor-pointer select-none"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-3">
            {/* Visual handle indicator */}
            <div className="w-6 h-1 bg-gray-300 rounded-full" />
            
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p suppressHydrationWarning={true} className="text-sm font-medium">
                £{totalSpent} <span className="text-xs text-muted-foreground">/ £{tempBudget}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
            <div className="px-4 pb-6 overflow-y-auto" style={{ height: 'calc(70vh - 44px)' }}>
            <div className="space-y-4">
              <div className="text-center py-2">
                <h3 className="text-lg font-semibold">Adjust Your Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Drag to collapse or tap outside to close
                </p>
              </div>
              
              <BudgetControls {...budgetControlProps} />
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setIsExpanded(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}