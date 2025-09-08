import { useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Sparkles, X } from 'lucide-react'

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  saveResult, 
  inviteData, 
  selectedAiOption,
  onRedirectToDashboard 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Card className="max-w-md w-full bg-white shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close success modal"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h2 id="success-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Invitation Created!
          </h2>
          
          <p id="success-modal-description" className="text-gray-600 mb-6">
            Your AI-generated invitation for <strong>{inviteData.childName}'s</strong> birthday party 
            has been successfully saved.
          </p>

          {/* Preview */}
          {selectedAiOption && (
            <div className="mb-6">
              <div className="relative w-40 h-52 mx-auto rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
                <img
                  src={selectedAiOption.imageUrl}
                  alt="Created Invitation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </div>
              </div>
            </div>
          )}

          {/* What's next message */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Ready to share with guests? Manage your invitation to send it out and track RSVPs.
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={onRedirectToDashboard}
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))]"
            size="lg"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Simple party details */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>{inviteData.date} at {inviteData.time} • {inviteData.venue}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuccessModal