// components/ReplacementManager.jsx - Handles replacement UI
import AutoReplacementFlow from "./AutoReplacementFlow"
import Image from "next/image"

export default function ReplacementManager({
  replacements,
  isProcessingRejection,
  onApproveReplacement,
  onViewSupplier,
  onDismiss
}) {
  if (replacements.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
    

        {isProcessingRejection && (
          <div className="flex items-center space-x-2 text-sm text-amber-600">
            <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
            <span>Finding alternatives...</span>
          </div>
        )}
      </div>
      
      <AutoReplacementFlow
        replacements={replacements}
        onApproveReplacement={onApproveReplacement}
        onViewSupplier={onViewSupplier}
        onDismiss={onDismiss}
      />
    </div>
  )
}