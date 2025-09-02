import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export const useCheckIfNewlyAdded = (supplierType) => {
  const [isNewlyAdded, setIsNewlyAdded] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const scrollToSupplier = searchParams.get('scrollTo')
    const lastAction = searchParams.get('action')
    
    // Check if this supplier was just added
    const wasJustAdded = (
      scrollToSupplier === supplierType && 
      lastAction === 'supplier-added'
    )
    
    if (wasJustAdded) {
 
      setIsNewlyAdded(true)
      
      // Reset after animation duration + buffer
      const resetTimer = setTimeout(() => {
        setIsNewlyAdded(false)
      }, 2000)
      
      return () => clearTimeout(resetTimer)
    }
  }, [searchParams, supplierType])

  return isNewlyAdded
}