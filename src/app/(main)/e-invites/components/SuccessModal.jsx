import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Share, Download, Sparkles, X } from 'lucide-react'

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  saveResult, 
  inviteData, 
  selectedAiOption,
  onRedirectToDashboard 
}) => {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isOpen && countdown === 0) {
      // Auto redirect after countdown
      onRedirectToDashboard()
    }
  }, [isOpen, countdown, onRedirectToDashboard])

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

        <CardContent className="p-6 text-center">
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h2 id="success-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Invitation Saved!
          </h2>
          
          <p id="success-modal-description" className="text-gray-600 mb-6">
            Your AI-generated invitation for <strong>{inviteData.childName}'s</strong> party 
            has been successfully saved to your dashboard.
          </p>

          {/* Preview */}
          {selectedAiOption && (
            <div className="mb-6">
              <div className="relative w-32 h-40 mx-auto rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                <img
                  src={selectedAiOption.imageUrl}
                  alt="Saved Invitation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-primary-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Copy shareable link
                navigator.clipboard.writeText(saveResult.shareableLink)
                alert('Shareable link copied!')
              }}
              className="text-xs"
            >
              <Share className="w-3 h-3 mr-1" />
              Copy Link
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Download functionality
                const link = document.createElement('a')
                link.href = selectedAiOption.imageUrl
                link.download = `${inviteData.childName}-birthday-invite.png`
                link.click()
              }}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>

          {/* Auto-redirect message */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Redirecting to dashboard in <strong>{countdown}</strong> seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Stay Here
            </Button>
            
            <Button
              onClick={onRedirectToDashboard}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Party Details Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Party:</strong> {saveResult.party?.child_name}'s Birthday</p>
              <p><strong>Date:</strong> {inviteData.date} at {inviteData.time}</p>
              <p><strong>Venue:</strong> {inviteData.venue}</p>
              <p><strong>Invite ID:</strong> {saveResult.inviteId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuccessModal