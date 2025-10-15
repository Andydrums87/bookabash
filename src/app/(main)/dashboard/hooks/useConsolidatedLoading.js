// hooks/useConsolidatedLoading.js - UPDATED VERSION

import { useState, useEffect, useRef } from 'react'

export function useConsolidatedLoading(options = {}) {
  const { 
    minimumDuration = 2000,
    defaultText = "Loading your party...",
    preventFlashing = true, // Keep for backwards compatibility
    initialLoading = true // ✅ NEW: Allow override of initial state
  } = options

  // ✅ Use initialLoading prop instead of always starting with true
  const [isLoading, setIsLoading] = useState(preventFlashing ? initialLoading : false)
  const [loadingText, setLoadingText] = useState(defaultText)
  const loadingTimeoutRef = useRef(null)
  const loadingStepsRef = useRef(new Set())
  const loadingStartTimeRef = useRef(initialLoading ? Date.now() : null)
  const hasInitializedRef = useRef(false)

  // Initialize with a default step to prevent gaps - only if we're actually loading
  useEffect(() => {
    if (preventFlashing && initialLoading && !hasInitializedRef.current) {
      loadingStepsRef.current.add('initialization')
      hasInitializedRef.current = true
      
      setTimeout(() => {
        finishLoading('initialization')
      }, 100)
    }
  }, [preventFlashing, initialLoading])

  const startLoading = (stepId, text = "Loading...") => {
    if (loadingStepsRef.current.size === 0) {
      loadingStartTimeRef.current = Date.now()
    }
    
    loadingStepsRef.current.add(stepId)
    if (text) setLoadingText(text)
    setIsLoading(true)
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
  }

  const finishLoading = (stepId) => {
    loadingStepsRef.current.delete(stepId)
    
    if (loadingStepsRef.current.size === 0) {
      const loadingDuration = Date.now() - (loadingStartTimeRef.current || Date.now())
      const remainingTime = Math.max(0, minimumDuration - loadingDuration)
      
      if (remainingTime > 500) {
        setLoadingText("Almost ready...")
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        loadingStartTimeRef.current = null
      }, remainingTime + 100)
    }
  }

  const forceFinishLoading = () => {
    loadingStepsRef.current.clear()
    loadingStartTimeRef.current = null
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    setIsLoading(false)
  }

  const hasActiveSteps = () => loadingStepsRef.current.size > 0

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