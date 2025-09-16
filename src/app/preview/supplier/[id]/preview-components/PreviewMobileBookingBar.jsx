// app/preview/supplier/[id]/preview-components/PreviewMobileBookingBar.js
"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Plus, Calendar, Clock, Users, MapPin } from "lucide-react"

export default function PreviewMobileBookingBar({ 
  selectedPackage,
  supplier,
  onAddToPlan,
  addToPlanButtonState,
  selectedDate,
  currentMonth,
  setSelectedDate,
  setCurrentMonth,
  hasValidPartyPlan,
  isFromDashboard,
  partyDate,
  onSaveForLater,
  showAddonModal,
  setShowAddonModal,
  onAddonConfirm,
  isAddingToPlan,
  hasEnquiriesPending,
  onShowPendingEnquiryModal,
  pendingCount,
  isReplacementMode,
  replacementSupplierName,
  onReturnToReplacement,
  packages,
  openCakeModal,
  showCakeModal,
  isCakeSupplier,
  databasePartyData,
  userType,
  enableSmartPricing,
  showWeekendPricing
}) {
  
  const formatDate = (date) => {
    if (!date) return "Select Date"
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
      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
        <div className="p-4">
          {/* Party info summary */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedDate || partyDate?.())}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{databasePartyData?.guestCount || '12'} guests</span>
                </div>
              </div>
            </div>
            
            {selectedPackage && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedPackage.name}</p>
                  <p className="text-lg font-bold text-[#FF6B35]">
                    £{selectedPackage.price}
                    {selectedPackage.priceUnit && (
                      <span className="text-sm font-normal text-gray-600 ml-1">
                        {selectedPackage.priceUnit}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 relative overflow-hidden"
              disabled={true} // Always disabled in preview
            >
              <div className="absolute inset-0 bg-gray-100 opacity-50" />
              <Phone className="w-5 h-5 mr-2" />
              Call
            </Button>
            
            <Button
              size="lg"
              className="flex-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white relative overflow-hidden"
              disabled={true} // Always disabled in preview
            >
              <div className="absolute inset-0 bg-gray-400 opacity-30" />
              <Plus className="w-5 h-5 mr-2" />
              {addToPlanButtonState.text}
            </Button>
          </div>
          
          {/* Preview indicator */}
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Preview Mode - All interactions disabled
            </span>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the fixed bar */}
      <div className="h-32 md:hidden" />
    </>
  )
}