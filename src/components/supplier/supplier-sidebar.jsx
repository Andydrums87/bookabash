// FIXED: SupplierSidebar with unified pricing system

"use client"

import { Button } from "@/components/ui/button"
import { Heart, CheckCircle } from "lucide-react"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar"
import { useFavorites } from "@/app/(main)/favorites/hooks/useFavoritesHook"
import { useMemo } from 'react'

// UPDATED: Import unified pricing system instead of old helpers
import { 
  calculateFinalPrice, 
  isWeekendDate,
  getPartyDuration
} from '@/utils/unifiedPricing'

export default function SupplierSidebar({
  supplier,
  packages,
  selectedPackageId,
  handleAddToPlan,
  getAddToPartyButtonState,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  credentials,
  isFromDashboard = false,
  partyDate = null,
  partyTimeSlot = null,
  openCakeModal,
  showCakeModal,
  isCakeSupplier = false
}) {

  const { toggleFavorite, isFavorite } = useFavorites()
  const isSupplierFavorite = supplier ? isFavorite(supplier.id) : false

  const handleToggleFavorite = () => {
    if (supplier) {
      toggleFavorite(supplier)
    }
  }

  const selectedPkgDetails = packages?.find((pkg) => pkg.id === selectedPackageId)

  // Add effective party duration calculation (same as mobile booking bar)
  const effectivePartyDuration = useMemo(() => {
    console.log('🔍 Sidebar: Calculating effective party duration')
    
    // Try to get from localStorage party details first
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (partyDetails) {
        const parsed = JSON.parse(partyDetails)
        if (parsed.duration && parsed.duration > 0) {
          console.log('🔍 Sidebar: Using duration from localStorage:', parsed.duration)
          return parsed.duration
        }
        
        // Try to calculate from start/end times if available
        if (parsed.startTime && parsed.endTime) {
          const duration = getPartyDuration(parsed)
          console.log('🔍 Sidebar: Calculated duration from times:', duration)
          return duration
        }
      }
    } catch (error) {
      console.warn('Could not get party duration from localStorage:', error)
    }
    
    // Default calculation
    const defaultDuration = getPartyDuration({
      date: selectedDate ? new Date(currentMonth?.getFullYear(), currentMonth?.getMonth(), selectedDate) : null
    })
    
    console.log('🔍 Sidebar: Using default duration:', defaultDuration)
    return defaultDuration
  }, [selectedDate, currentMonth])

  const calculateSidebarPrice = useMemo(() => {
    if (!selectedPkgDetails || !supplier) {
      return {
        displayPrice: 0,
        formattedPrice: '£0.00',
        hasWeekendPremium: false,
        weekendInfo: null
      }
    }
  
    // Check if this is a lead-based supplier
    const { isLeadBasedSupplier } = require('@/utils/unifiedPricing')
    const isLeadBased = isLeadBasedSupplier(supplier)
    
    console.log('🔍 Sidebar: Pricing calculation start:', {
      supplierName: supplier.name,
      packageName: selectedPkgDetails.name,
      packagePrice: selectedPkgDetails.price,
      isLeadBased,
      effectivePartyDuration
    })
    
    if (isLeadBased) {
      console.log('🔍 Sidebar: Lead-based supplier - calculating total cost:', supplier.name)
      
      // For lead-based suppliers
      const partyDetailsForPricing = {
        date: null, // Date doesn't affect lead-based pricing
        duration: effectivePartyDuration, // Include duration even for lead-based
        guestCount: null // Will be fetched from localStorage
      }
      
      const supplierForPricing = {
        ...supplier,
        price: selectedPkgDetails.price,
        originalPrice: selectedPkgDetails.price
      }
      
      const pricingResult = calculateFinalPrice(supplierForPricing, partyDetailsForPricing, [])
      
      console.log('🔍 Sidebar: Lead-based total calculation:', {
        packagePrice: selectedPkgDetails.price,
        totalPrice: pricingResult.finalPrice,
        guestCount: pricingResult.details.guestCount
      })
      
      return {
        displayPrice: pricingResult.finalPrice,
        formattedPrice: `£${pricingResult.finalPrice.toFixed(2)}`,
        hasWeekendPremium: false,
        weekendInfo: null,
        isLeadBased: true,
        unitPrice: selectedPkgDetails.price,
        guestCount: pricingResult.details.guestCount
      }
    }
  
    // For time-based suppliers, get pricing date
    let pricingDate = null
    if (selectedDate && currentMonth) {
      pricingDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
    } else if (isFromDashboard && partyDate) {
      pricingDate = partyDate
    } else {
      // Try to get from localStorage party details
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          if (parsed.date) {
            pricingDate = new Date(parsed.date)
          }
        }
      } catch (error) {
        console.warn('Could not get party date from localStorage for sidebar pricing')
      }
    }
  
    // UPDATED: Use unified pricing system
    const partyDetailsForPricing = {
      date: pricingDate,
      duration: effectivePartyDuration, // Include duration!
      guestCount: null
    }
  
    const supplierForPricing = {
      ...supplier,
      price: selectedPkgDetails.price,
      originalPrice: selectedPkgDetails.price,
      category: supplier.category,
      weekendPremium: supplier.weekendPremium,
      extraHourRate: supplier.extraHourRate || supplier.serviceDetails?.extraHourRate
    }
  
    console.log('🔍 Sidebar: Calculating pricing for time-based supplier:', {
      supplierName: supplier.name,
      packageName: selectedPkgDetails.name,
      basePrice: selectedPkgDetails.price,
      pricingDate: pricingDate?.toISOString(),
      duration: effectivePartyDuration,
      extraHourRate: supplierForPricing.extraHourRate,
      hasWeekendPremium: !!supplier.weekendPremium,
      isWeekend: pricingDate ? isWeekendDate(pricingDate) : false
    })
  
    // UPDATED: Use unified pricing instead of calculateSupplierTotalPrice
    const pricingResult = calculateFinalPrice(
      supplierForPricing,
      partyDetailsForPricing,
      [] // No addons in sidebar context
    )
  
    console.log('🔍 Sidebar: Unified pricing result:', {
      finalPrice: pricingResult.finalPrice,
      breakdown: pricingResult.breakdown,
      details: pricingResult.details,
      calculation: `£${selectedPkgDetails.price} + £${pricingResult.breakdown.weekend} (weekend) + £${pricingResult.breakdown.extraHours} (extra ${pricingResult.details.extraHours}h) = £${pricingResult.finalPrice}`
    })
  
    const hasWeekendPremium = pricingResult.breakdown.weekend > 0
    const hasExtraHourCost = pricingResult.breakdown.extraHours > 0
    
    const result = {
      displayPrice: pricingResult.finalPrice,
      formattedPrice: `£${pricingResult.finalPrice.toFixed(2)}`,
      hasWeekendPremium: hasWeekendPremium,
      hasExtraHourCost: hasExtraHourCost,
      weekendInfo: hasWeekendPremium ? {
        originalPrice: selectedPkgDetails.price,
        premiumAmount: pricingResult.breakdown.weekend,
        adjustedPrice: pricingResult.basePrice,
        isWeekend: true,
        date: pricingDate
      } : null,
      extraHourInfo: hasExtraHourCost ? {
        extraHours: pricingResult.details.extraHours,
        extraHourCost: pricingResult.breakdown.extraHours,
        extraHourRate: pricingResult.details.extraHourRate
      } : null,
      pricingBreakdown: {
        base: pricingResult.breakdown.base,
        weekend: pricingResult.breakdown.weekend,
        extraHours: pricingResult.breakdown.extraHours,
        total: pricingResult.finalPrice
      }
    }
  
    console.log('🔍 Sidebar: Final pricing result:', result)
    return result
  }, [selectedPkgDetails, supplier, selectedDate, currentMonth, isFromDashboard, partyDate, effectivePartyDuration])

  const addToPlanButtonState = getAddToPartyButtonState(selectedPackageId)

  const handleTimeSlotSelect = (date, timeSlot) => {
    console.log('📅 Sidebar: Time slot selected:', { date, timeSlot })
  }

  const isCustomizablePackage = (packageData) => {
    if (!isCakeSupplier || !packageData) return false
    
    if (packageData?.packageType === 'non-customizable' || packageData?.packageType === 'fixed') {
      return false
    }
    
    return packageData?.packageType === 'customizable' ||
           packageData?.cakeCustomization ||
           packageData?.name?.toLowerCase().includes('custom') ||
           packageData?.features?.some(feature => 
             feature.toLowerCase().includes('custom') || 
             feature.toLowerCase().includes('personalized')
           ) ||
           !packageData?.packageType
  }

  const handleSidebarAddToPlan = () => {
    console.log('🎂 Sidebar: Checking for cake customization need:', {
      isCakeSupplier,
      selectedPackageId,
      selectedPackage: selectedPkgDetails?.name,
      packageType: selectedPkgDetails?.packageType,
      isCustomizable: isCustomizablePackage(selectedPkgDetails),
      hasOpenCakeModal: !!openCakeModal
    })

    if (isCakeSupplier && selectedPkgDetails && openCakeModal) {
      const shouldShowModal = isCustomizablePackage(selectedPkgDetails)
      
      console.log('🎂 Sidebar: Should show modal?', shouldShowModal)
      
      if (shouldShowModal) {
        console.log('🎂 Sidebar: Opening cake modal with package:', selectedPkgDetails.name)
        openCakeModal(selectedPkgDetails)
        return
      } else {
        console.log('🎂 Sidebar: Package marked as non-customizable, proceeding normally')
      }
    } else if (isCakeSupplier && !openCakeModal) {
      console.warn('🎂 Sidebar: isCakeSupplier is true but openCakeModal function not provided')
    }

    console.log('➡️ Sidebar: Proceeding with regular add to plan')
    handleAddToPlan()
  }

  const verificationDocs =
    credentials?.map((cred) => ({ name: cred.title, verified: cred.verified })) ||
    [
      { name: "DBS Certificate", verified: supplier?.serviceDetails?.certifications?.dbsCertificate },
      { name: "Public Liability Insurance", verified: supplier?.serviceDetails?.certifications?.publicLiability },
      { name: "First Aid Certified", verified: supplier?.serviceDetails?.certifications?.firstAid },
      { name: "ID Verified", verified: supplier?.verified },
    ].filter((doc) => doc.verified !== undefined)

  // Enhanced pricing display components
  const WeekendPremiumBadge = ({ weekendInfo }) => {
    if (!weekendInfo) return null
    
    return (
      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full mt-1 inline-flex items-center gap-1">
        <span>🌅</span>
        Weekend +£{weekendInfo.premiumAmount.toFixed(2)}
      </div>
    )
  }

  const ExtraHourBadge = ({ extraHourInfo }) => {
    if (!extraHourInfo) return null
    
    return (
      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1 inline-flex items-center gap-1">
        <span>⏰</span>
        +{extraHourInfo.extraHours}h extra (£{extraHourInfo.extraHourCost})
      </div>
    )
  }

  return (
    <div className="space-y-6 sticky top-8">

      {/* Select Package / Add to Plan Section */}
      {selectedPkgDetails && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-1">Selected Package</h3>
          <p className="text-md text-gray-800 font-semibold mb-1">{selectedPkgDetails.name}</p>
          
          {/* UPDATED: Enhanced price display with breakdown */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg text-primary-600 font-bold">
                {calculateSidebarPrice.formattedPrice}
              </p>
              {(calculateSidebarPrice.hasWeekendPremium || calculateSidebarPrice.hasExtraHourCost) && (
                <span className="text-sm text-gray-500 line-through">
                  £{selectedPkgDetails.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Show breakdown for lead-based suppliers */}
            {calculateSidebarPrice.isLeadBased && calculateSidebarPrice.guestCount && (
              <p className="text-xs text-gray-600 mt-1">
                £{calculateSidebarPrice.unitPrice} × {calculateSidebarPrice.guestCount} guests
              </p>
            )}
            
            {/* Show premium badges */}
            <div className="flex flex-wrap gap-2 mt-1">
              {calculateSidebarPrice.hasWeekendPremium && (
                <WeekendPremiumBadge weekendInfo={calculateSidebarPrice.weekendInfo} />
              )}
              {calculateSidebarPrice.hasExtraHourCost && (
                <ExtraHourBadge extraHourInfo={calculateSidebarPrice.extraHourInfo} />
              )}
            </div>
            
            {/* Show date context */}
            {calculateSidebarPrice.weekendInfo?.date && (
              <p className="text-xs text-gray-500 mt-1">
                Weekend rate for {calculateSidebarPrice.weekendInfo.date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>
          
          <Button
            className={`w-full py-3 text-base ${getAddToPartyButtonState().className}`}
            onClick={handleSidebarAddToPlan}
            disabled={getAddToPartyButtonState().disabled}
          >
            {addToPlanButtonState.text}
          </Button>
        </div>
      )}

      {/* Availability Calendar Section */}
      {supplier && (
        <SupplierAvailabilityCalendar
          supplier={supplier}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTimeSlot={selectedTimeSlot}
          setSelectedTimeSlot={setSelectedTimeSlot}
          onTimeSlotSelect={handleTimeSlotSelect}
          isFromDashboard={isFromDashboard}
          partyDate={partyDate}
          partyTimeSlot={partyTimeSlot}
          readOnly={isFromDashboard}
          showTimeSlotSelection={!isFromDashboard}
        />
      )}

      {/* UPDATED: Enhanced pricing info section */}
      {(calculateSidebarPrice.hasWeekendPremium || calculateSidebarPrice.hasExtraHourCost) && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            🌅 Enhanced Pricing Applied
          </h4>
          <div className="text-sm text-amber-700 space-y-1">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>£{calculateSidebarPrice.pricingBreakdown.base.toFixed(2)}</span>
            </div>
            {calculateSidebarPrice.hasWeekendPremium && (
              <div className="flex justify-between">
                <span>Weekend Premium:</span>
                <span>+£{calculateSidebarPrice.pricingBreakdown.weekend.toFixed(2)}</span>
              </div>
            )}
            {calculateSidebarPrice.hasExtraHourCost && (
              <div className="flex justify-between">
                <span>Extra {calculateSidebarPrice.extraHourInfo?.extraHours}h:</span>
                <span>+£{calculateSidebarPrice.pricingBreakdown.extraHours.toFixed(2)}</span>
              </div>
            )}
            <hr className="border-amber-300" />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>£{calculateSidebarPrice.displayPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Verification Documents Section */}
      {verificationDocs && verificationDocs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Verification documents</h3>
          <ul className="space-y-3">
            {verificationDocs.map((doc) => (
              <li key={doc.name} className="flex items-center">
                <CheckCircle
                  className={`w-5 h-5 mr-3 ${doc.verified ? "text-green-500" : "text-gray-300"}`}
                  fill={doc.verified ? "currentColor" : "none"}
                />
                <span className={`${doc.verified ? "text-gray-700" : "text-gray-400"}`}>{doc.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to Favorites Button */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <Button 
          variant="outline" 
          className={`w-full py-3 text-base transition-all duration-200 ${
            isSupplierFavorite 
              ? 'border-primary-300 bg-pink-50 text-primary-700 hover:bg-[hsl(var(--primary-50))]' 
              : 'border-gray-300 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))]'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart 
            className={`w-5 h-5 mr-2 transition-all duration-200 ${
              isSupplierFavorite 
                ? 'fill-[hsl(var(--primary-500))] text-primary-500' 
                : 'text-gray-500'
            }`} 
          />
          {isSupplierFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </Button>
      </div>
    </div>
  )
}