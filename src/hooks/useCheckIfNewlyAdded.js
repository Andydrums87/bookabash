import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export const useCheckIfNewlyAdded = (supplierType, hasSupplier) => {
  const [isNewlyAdded, setIsNewlyAdded] = useState(false)
  const searchParams = useSearchParams()
  const hasTriggered = useRef(false)
  const resetTimerRef = useRef(null) // ✅ Persist timeout across renders

  useEffect(() => {
    const scrollToSupplier = searchParams.get('scrollTo')
    const lastAction = searchParams.get('action')
    

    
    const wasJustAdded = (
      scrollToSupplier === supplierType && 
      lastAction === 'supplier-added' &&
      hasSupplier &&
      !hasTriggered.current
    )
    
    if (wasJustAdded) {

      hasTriggered.current = true
      setIsNewlyAdded(true)
      
      // ✅ Clear any existing timer first
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
      
      // ✅ Store timer in ref so it persists
      resetTimerRef.current = setTimeout(() => {

        setIsNewlyAdded(false)
        resetTimerRef.current = null
      }, 2500)
    }
    
    // Reset when supplier is removed
    if (!hasSupplier && hasTriggered.current) {
  
      hasTriggered.current = false
      setIsNewlyAdded(false)
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
    }
  }, [searchParams, supplierType, hasSupplier])

  // ✅ Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {

        clearTimeout(resetTimerRef.current)
      }
    }
  }, [supplierType])

  return isNewlyAdded
}