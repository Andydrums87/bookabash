"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Sparkles, ArrowRight, Clock, X } from "lucide-react"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function EInvitesBanner({ 
  partyId, 
  isBookingPending = true, 
  onCreateInvites 
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [hasCreatedInvites, setHasCreatedInvites] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check for existing invites when component mounts
  useEffect(() => {
    if (partyId) {
      checkInviteStatus()
    } else {
      setIsChecking(false)
    }
  }, [partyId])

  const checkInviteStatus = async () => {
    try {
      setIsChecking(true)
      const result = await partyDatabaseBackend.getEInvites(partyId)
      
      // Check if invites exist and are created
      const invitesExist = result.success && 
                          result.einvites && 
                          (result.einvites.inviteId || 
                           result.einvites.shareableLink ||
                           result.einvites.status === 'completed')
      
      console.log('📧 EInvitesBanner - Invite status:', {
        partyId,
        resultSuccess: result.success,
        einvites: result.einvites,
        invitesExist
      })
      
      setHasCreatedInvites(invitesExist)
    } catch (error) {
      console.error('📧 EInvitesBanner - Error checking invite status:', error)
      setHasCreatedInvites(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  // Don't show while checking
  if (isChecking) {
    return null
  }

  // Don't show if invites are already created, booking isn't pending, or user has closed it
  if (hasCreatedInvites || !isBookingPending || !isVisible) {
    console.log('📧 EInvitesBanner hidden because:', { 
      hasCreatedInvites, 
      isBookingPending, 
      isVisible 
    })
    return null
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-teal-100 to-teal-200 border border-teal-400 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-20 p-1 rounded-full hover:bg-teal-200/50 transition-colors duration-200 group"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 text-teal-600 group-hover:text-teal-800" />
      </button>

      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-6 w-1 h-1 bg-teal-300 rounded-full opacity-40"></div>
        <div className="absolute top-2 right-8 w-1 h-1 bg-teal-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-2 left-12 w-1 h-1 bg-teal-300 rounded-full opacity-40"></div>
        <Sparkles className="absolute top-2 right-16 w-2 h-2 text-teal-300 opacity-40" />
        <Sparkles className="absolute bottom-2 right-6 w-2 h-2 text-teal-300 opacity-50" />
      </div>

      <div className="relative z-10 px-3 py-3 md:px-6 md:py-4 pr-8 md:pr-10">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Smaller icon on mobile */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>

          {/* Compact content on mobile */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                Have you made your invites yet?
              </h3>
              <div className="hidden md:flex items-center gap-1 text-sm text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Perfect timing!</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-700 line-clamp-2 md:line-clamp-none">
              While we're waiting for supplier confirmations, it's the perfect time to create your party invitations.
              <span className="hidden md:inline"> Get them ready to send once everything is confirmed!</span>
            </p>
          </div>

          {/* Compact CTA on mobile */}
          <div className="flex-shrink-0">
            <Button
              onClick={onCreateInvites}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <span className="md:hidden">Create</span>
              <span className="hidden md:inline">Create Invites</span>
              <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile timing indicator */}
        <div className="md:hidden mt-2 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-teal-600 bg-blue-100 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span className="font-medium">Perfect timing!</span>
          </div>
        </div>
      </div>
    </div>
  )
}