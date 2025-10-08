import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export const useCheckIfNewlyAdded = (supplierType, hasSupplier) => {
  const [isNewlyAdded, setIsNewlyAdded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const scrollToSupplier = searchParams.get('scrollTo')
    const lastAction = searchParams.get('action')
    
    // ✅ Only show animation if supplier exists AND URL params match
    const wasJustAdded = (
      scrollToSupplier === supplierType && 
      lastAction === 'supplier-added' &&
      hasSupplier // ✅ NEW: Only trigger if supplier is present
    )
    
    if (wasJustAdded) {
      setIsNewlyAdded(true)
      
      // Reset after animation duration + buffer
      const resetTimer = setTimeout(() => {
        setIsNewlyAdded(false)
      }, 2000)
      
      return () => clearTimeout(resetTimer)
    }
  }, [searchParams, supplierType, hasSupplier])

  return isNewlyAdded
}