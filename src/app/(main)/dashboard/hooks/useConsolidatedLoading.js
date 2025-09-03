// hooks/useConsolidatedLoading.js - Version that prevents flashing
import { useState, useEffect, useRef } from 'react'

export function useConsolidatedLoading(options = {}) {
  const { 
    minimumDuration = 2000,
    defaultText = "Loading your party...",
    preventFlashing = true // New option to prevent flashing
  } = options

  // Start as true to prevent flash - this assumes we're always loading initially
  const [isLoading, setIsLoading] = useState(true)
  const [loadingText, setLoadingText] = useState(defaultText)
  const loadingTimeoutRef = useRef(null)
  const loadingStepsRef = useRef(new Set())
  const loadingStartTimeRef = useRef(Date.now()) // Start timing immediately
  const hasInitializedRef = useRef(false)

  // Initialize with a default step to prevent gaps
  useEffect(() => {
    if (preventFlashing && !hasInitializedRef.current) {
      loadingStepsRef.current.add('initialization')
      hasInitializedRef.current = true
      
      // Remove initialization step after a brief moment
      setTimeout(() => {
        finishLoading('initialization')
      }, 100)
    }
  }, [preventFlashing])

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
      const loadingDuration = Date.now() - loadingStartTimeRef.current
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