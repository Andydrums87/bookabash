 "use client"

import { Button } from "@/components/ui/button"
import { Loader2, Save, Check, AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"

export function StickyBottomSaveBar({ 
  onSave, 
  onDiscard,
  isLoading = false, 
  hasChanges = false,
  changesSummary = "You have unsaved availability changes",
  saveLabel = "Save Availability Settings",
  loadingLabel = "Saving...",
  successLabel = "Saved!",
  discardLabel = "Discard Changes",
  showSuccess = true,
  className = "",
  ...props 
}) {
  const [showSuccessState, setShowSuccessState] = useState(false)
  const [wasLoading, setWasLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Track loading state changes to show success
  useEffect(() => {
    if (wasLoading && !isLoading && showSuccess) {
      setShowSuccessState(true)
      setTimeout(() => setShowSuccessState(false), 2000)
    }
    setWasLoading(isLoading)
  }, [isLoading, wasLoading, showSuccess])

  // Show/hide the bar based on hasChanges
  useEffect(() => {
    if (hasChanges) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow success animation
      const timer = setTimeout(() => {
        setIsVisible(false)
        setShowSuccessState(false)
      }, showSuccessState ? 2000 : 0)
      return () => clearTimeout(timer)
    }
  }, [hasChanges, showSuccessState])

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 border-t-4 border-red-700 shadow-xl z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${className}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Left side - Status indicator and message */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-red-100 animate-spin flex-shrink-0" />
            ) : showSuccessState ? (
              <Check className="w-4 h-4 text-green-300 flex-shrink-0" />
            ) : (
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse flex-shrink-0 shadow-lg"></div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-white truncate sm:text-clip">
                {isLoading 
                  ? loadingLabel 
                  : showSuccessState 
                    ? successLabel
                    : changesSummary
                }
              </p>
              {!isLoading && !showSuccessState && (
                <p className="text-xs text-red-100 mt-0.5 hidden sm:block">
                  Changes will apply to all your businesses
                </p>
              )}
            </div>
          </div>

          {/* Right side - Action buttons */}
          {!showSuccessState && (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
              {/* Discard button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={onDiscard}
                disabled={isLoading}
                className="flex-1 sm:flex-none h-9 sm:h-10 px-3 sm:px-4 bg-red-100 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm font-medium"
              >
                <X className="w-3 h-3 sm:mr-1.5" />
                <span className="hidden sm:inline">{discardLabel}</span>
                <span className="sm:hidden">Discard</span>
              </Button>

              {/* Save button */}
              <Button 
                onClick={onSave}
                disabled={isLoading}
                size="sm"
                className="flex-1 sm:flex-none h-9 sm:h-10 px-4 sm:px-6 bg-white text-red-600 hover:bg-red-50 border-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-xs sm:text-sm"
                {...props}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:mr-1.5 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Saving</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:mr-1.5" />
                    <span className="hidden sm:inline">{saveLabel}</span>
                    <span className="sm:hidden">Save Settings</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Progress bar during saving */}
        {isLoading && (
          <div className="mt-3">
            <div className="w-full bg-red-400 rounded-full h-1">
              <div className="bg-white h-1 rounded-full animate-pulse transition-all duration-1000" style={{width: '60%'}}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook to track changes for the availability component
export function useAvailabilityChanges(currentData, initialData) {
  const [hasChanges, setHasChanges] = useState(false)
  const [initialState, setInitialState] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Only set initial state once when first provided
  useEffect(() => {
    if (initialData && !isInitialized) {
      setInitialState(initialData)
      setIsInitialized(true)
    }
  }, [initialData, isInitialized])

  useEffect(() => {
    if (!initialState || !isInitialized) return
    
    // Deep comparison to detect changes
    const hasActualChanges = JSON.stringify(currentData) !== JSON.stringify(initialState)
    setHasChanges(hasActualChanges)
  }, [currentData, initialState, isInitialized])

  const resetChanges = (newData) => {
    setInitialState(newData)
    setHasChanges(false)
  }

  return {
    hasChanges,
    resetChanges,
    initialState
  }
}