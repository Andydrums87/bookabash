// ReplacementContextBanner.jsx
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ReplacementContextBanner({ 
  replacementSupplierName, 
  onReturnToReplacement,
  onApproveReplacement,
  className = ""
}) {
  const handleApprove = () => {
    console.log('🐊 Approving replacement from banner')
    
    // Get replacement context from sessionStorage
    const context = sessionStorage.getItem('replacementContext')
    if (context) {
      try {
        const parsedContext = JSON.parse(context)
        
        // Call the approve function if provided
        if (onApproveReplacement && parsedContext.replacementId) {
          onApproveReplacement(parsedContext.replacementId)
        }
        
        // Set flag to restore modal with approved state
        sessionStorage.setItem('shouldRestoreReplacementModal', 'true')
        sessionStorage.setItem('modalShowUpgrade', 'true') // Show the upgrade animation
        
        // Navigate back
        if (onReturnToReplacement) {
          onReturnToReplacement()
        } else {
          window.location.href = '/dashboard'
        }
      } catch (error) {
        console.error('❌ Error parsing replacement context:', error)
      }
    }
  }

  const handleViewDetails = () => {
    // Just set flag to restore modal without approving
    sessionStorage.setItem('shouldRestoreReplacementModal', 'true')
    
    if (onReturnToReplacement) {
      onReturnToReplacement()
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-1000 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          {/* Left: Context Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-lg">🐊</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Reviewing <span className="text-white/90">{replacementSupplierName}</span>
              </h3>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Approve Button - Primary CTA */}
            <button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 shadow-sm text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
            
            {/* Back Button - Secondary */}
            <button
              onClick={handleViewDetails}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-2 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 shadow-sm text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}