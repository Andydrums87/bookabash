// components/ReplacementManager.jsx - Updated with mobile modal
import AutoReplacementFlow from "./AutoReplacementFlow"
import MobileAutoReplacementFlow from "./MobileReplacementModal"
import { useEffect, useState } from "react"

export default function ReplacementManager({
  replacements,
  isProcessingRejection,
  onApproveReplacement,
  onViewSupplier,
  onDismiss
}) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])


  if (replacements.length === 0) return null

  return (
    <div className="mb-8">
      {/* Processing indicator */}
      {isProcessingRejection && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-amber-600">
            <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
            <span>Finding alternatives...</span>
          </div>
        </div>
      )}
      

        <MobileAutoReplacementFlow
          replacements={replacements}
          onApproveReplacement={onApproveReplacement}
          onViewSupplier={onViewSupplier}
          onDismiss={onDismiss}
  />
        {/* <AutoReplacementFlow
          replacements={replacements}
          onApproveReplacement={onApproveReplacement}
          onViewSupplier={onViewSupplier}
          onDismiss={onDismiss}
 /> */}
    </div>
  )
}