// app/preview/supplier/[id]/preview-components/PreviewMobileBookingBar.js
"use client"

import { Button } from "@/components/ui/button"
import { Phone, Plus, Calendar, Users } from "lucide-react"

export default function PreviewMobileBookingBar({ 
  selectedPackage,
  supplier,
  selectedDate,
  databasePartyData
}) {
  
  const formatDate = (date) => {
    if (!date) return "Sat, 15 Feb" // Mock date for preview
    if (typeof date === 'string') {
      const dateObj = new Date(date)
      return dateObj.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      })
    }
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <>
      {/* Mobile sticky bottom bar - compact version */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="px-4 pt-0 pb-3">
          {/* Package info - inline and compact */}
          <div className="flex items-center justify-between mb-3">
          
          </div>
          
          {/* Package name and price - single line */}
          {selectedPackage && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{selectedPackage.name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{databasePartyData?.guestCount || '12'} guests</span>
              </div>
            </div>
                <p className="text-lg font-bold text-[#FF6B35]">
                  £{selectedPackage.price}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons - compact two-button layout */}
          <div className="flex">
            {/* <Button
              variant="outline"
              size="lg"
              className="flex-1 relative overflow-hidden"
              disabled={true}
            >
              <div className="absolute inset-0 bg-gray-100 opacity-50" />
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
             */}
            <Button
              size="lg"
              className="flex-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white relative overflow-hidden"
              disabled={true}
            >
              <div className="absolute inset-0 bg-gray-400 opacity-30" />
              <Plus className="w-4 h-4 mr-2" />
              Add to Party Plan
            </Button>
          </div>
          
      
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the fixed bar */}
      <div className="h-28 md:hidden" />
    </>
  )
}