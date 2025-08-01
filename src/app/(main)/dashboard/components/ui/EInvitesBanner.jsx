"use client"

import { Button } from "@/components/ui/button"
import { Mail, Sparkles, ArrowRight, Clock } from "lucide-react"

export default function EInvitesBanner({ hasCreatedInvites = false, isBookingPending = true, onCreateInvites }) {
  // Don't show if invites are already created or booking isn't pending
  if (hasCreatedInvites || !isBookingPending) {
    return null
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-6 w-1 h-1 bg-blue-300 rounded-full opacity-40"></div>
        <div className="absolute top-2 right-8 w-1 h-1 bg-indigo-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-2 left-12 w-1 h-1 bg-purple-300 rounded-full opacity-40"></div>
        <Sparkles className="absolute top-2 right-16 w-2 h-2 text-blue-300 opacity-40" />
        <Sparkles className="absolute bottom-2 right-6 w-2 h-2 text-indigo-300 opacity-50" />
      </div>

      <div className="relative z-10 px-3 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Smaller icon on mobile */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>

          {/* Compact content on mobile */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                Have you made your invites yet?
              </h3>
              <div className="hidden md:flex items-center gap-1 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
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
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <span className="md:hidden">Create</span>
              <span className="hidden md:inline">Create Invites</span>
              <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile timing indicator */}
        <div className="md:hidden mt-2 flex items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span className="font-medium">Perfect timing!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
