// hooks/useConsolidatedLoading.js
import { useState, useEffect, useRef } from 'react'

export function useConsolidatedLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingText, setLoadingText] = useState("Loading your party...")
  const loadingTimeoutRef = useRef(null)
  const loadingStepsRef = useRef(new Set())

  // Register a loading step
  const startLoading = (stepId, text = "Loading...") => {
    loadingStepsRef.current.add(stepId)
    if (text) setLoadingText(text)
    setIsLoading(true)
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
  }

  // Complete a loading step
  const finishLoading = (stepId) => {
    loadingStepsRef.current.delete(stepId)
    
    // If no more loading steps, finish loading after a brief delay
    if (loadingStepsRef.current.size === 0) {
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 1000) // Small delay to prevent flashing
    }
  }

  // Force finish all loading
  const forceFinishLoading = () => {
    loadingStepsRef.current.clear()
    loadingStartTimeRef.current = null
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    setIsLoading(false)
  }

  // Get current loading status
  const hasActiveSteps = () => loadingStepsRef.current.size > 0

  // Cleanup
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  return {
    isLoading,
    loadingText,
    startLoading,
    finishLoading,
    forceFinishLoading,
    hasActiveSteps
  }
}