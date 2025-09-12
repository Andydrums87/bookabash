// Enhanced SupplierPackages component with smart pricing integration
"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, X, Clock, Users, Star, ChevronLeft, ChevronRight, ImageIcon, Calendar } from "lucide-react"
import { calculateFinalPrice, isWeekendDate, getPartyDuration } from '@/utils/unifiedPricing'

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [breakpoint])
  return isMobile
}

const PackageDetailsModal = ({ pkg, isOpen, onClose, showWeekendIndicator }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="relative h-64">
          <Image
            src={pkg.image || pkg.imageUrl || "/placeholder.png"}
            alt={pkg.name}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 rounded-full p-2 shadow-md transition-colors"
          >
            <X size={20} className="text-gray-600 cursor-pointer" />
          </button>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-2xl font-bold text-gray-900">{pkg.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  {pkg.displayPrice || `£${pkg.price}`}
                </span>
                {/* Weekend indicator in modal */}
                {showWeekendIndicator && pkg._smartPricing?.isWeekendRate && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                    Weekend Rate
                  </span>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{pkg.duration}</span>
              </div>
            </div>
           
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* What's Included */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
            <div className="flex flex-wrap gap-2">
              {pkg.features?.map((item, i) => (
                <span key={i} className="bg-primary-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Package Details</h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {pkg.description}
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          {pkg._smartPricing?.isWeekendRate && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Information</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-800">Weekend Premium Applied</span>
                </div>
                <div className="text-sm text-amber-700">
                  <p>Base Price: £{pkg.originalPrice}</p>
                  <p>Weekend Premium: +£{pkg._smartPricing.premiumAmount}</p>
                  <p className="font-semibold">Total: £{pkg.price}</p>
                </div>
              </div>
            </div>
          )}

          {/* Package Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-primary-700 mx-auto mb-2" />
              <div className="text-sm text-primary-700">Duration</div>
              <div className="font-semibold text-primary-700">{pkg.duration}</div>
            </div>
            <div className="bg-primary-500 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-white mx-auto mb-2" />
              <div className="text-sm text-white">Price Type</div>
              <div className="font-semibold text-white capitalize">{pkg.priceType}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced PackageCard with weekend pricing display
const PackageCard = ({
  pkg,
  isSelected,
  onSelect,
  onAddToPlan,
  addToPlanButtonState,
  isInPlan,
  isInPlanPackage,
  onShowNotification,
  isReplacementMode = false,
  isMobileView = false,
  showWeekendIndicator = false
}) => {
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  const features = Array.isArray(pkg.whatsIncluded) ? pkg.whatsIncluded : []
  const visibleCount = isMobileView ? 1 : 2
  const extraCount = Math.max(0, features.length - visibleCount)

  const truncate = (text) => (isMobileView && text.length > 15 ? `${text.slice(0, 12)}…` : text)

  // Enhanced package selection with replacement context storage
  const handlePackageSelection = (packageId) => {
    if (isReplacementMode && packageId) {
      try {
        const selectedPackage = pkg
        const existingContext = sessionStorage.getItem('replacementContext')
        let context = existingContext ? JSON.parse(existingContext) : {}
        
        const enhancedPackageData = {
          id: selectedPackage.id,
          name: selectedPackage.name,
          price: selectedPackage.price,
          originalPrice: selectedPackage.originalPrice,
          duration: selectedPackage.duration || '2 hours',
          features: selectedPackage.features || [],
          description: selectedPackage.description || `${selectedPackage.name} package`,
          totalPrice: selectedPackage.totalPrice || selectedPackage.price,
          basePrice: selectedPackage.basePrice || selectedPackage.originalPrice || selectedPackage.price,
          addonsPriceTotal: selectedPackage.addonsPriceTotal || 0,
          addons: selectedPackage.addons || [],
          selectedAddons: selectedPackage.selectedAddons || [],
          selectedAt: new Date().toISOString(),
          selectionSource: 'package_card_click',
          isReplacementSelection: true,
          // Include smart pricing data
          _smartPricing: selectedPackage._smartPricing
        }
        
        context.selectedPackageId = packageId
        context.selectedPackageData = enhancedPackageData
        context.packageSelectedAt = new Date().toISOString()
        
        sessionStorage.setItem('replacementContext', JSON.stringify(context))
        console.log('💾 Stored package data in replacement context:', enhancedPackageData)
        
      } catch (error) {
        console.error('❌ Error storing package data:', error)
      }
    }
    
    onSelect(packageId)
  }

  // Mobile-specific card styling
  const cardClasses = isMobileView 
    ? `bg-white rounded-2xl p-3 mb-3 flex flex-col text-center shadow-md transition-all duration-300 relative overflow-hidden group min-w-[280px] max-w-[300px] flex-shrink-0 ${
        isInPlanPackage
          ? "ring-2 ring-green-500 cursor-pointer"
          : isSelected
          ? "ring-2 ring-[hsl(var(--primary-500))] cursor-pointer"
          : "cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-gray-200"
      } ${isReplacementMode ? "bg-white" : ""}`
    : `bg-white rounded-3xl p-3 sm:p-4 pt-0 mb-5 flex flex-col text-center shadow-lg transition-all duration-300 relative overflow-hidden group ${
        isInPlanPackage
          ? "ring-2 ring-green-500 scale-[1.02] cursor-pointer"
          : isSelected
          ? "ring-2 ring-[hsl(var(--primary-500))] scale-[1.02] cursor-pointer hover:scale-[1.04] hover:shadow-2xl"
          : "cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-gray-200"
      } ${isReplacementMode ? "bg-white" : ""}`

  return (
    <>
      <div
        className={cardClasses}
        onClick={() => {
          if (isInPlanPackage) {
            onShowNotification?.({
              type: "info",
              message: `${pkg.name} is already in your party plan! You can view details or manage it from your dashboard.`
            })
          } else if (!isSelected) {
            handlePackageSelection(pkg.id)
          }
        }}
        style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Replacement mode indicator */}
        {isReplacementMode && (
          <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            Replacement
          </div>
        )}

       
        {pkg.image || pkg.imageUrl ? (
          <div onClick={(e) => {
            e.stopPropagation()
            setShowModal(true)
          }} className="relative w-full ">
                
            <div
              className="relative w-[90%] h-[280px] mask-image mx-auto"
              style={{
                WebkitMaskImage: 'url("/image.svg")',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskImage: 'url("/image.svg")',
                maskRepeat: 'no-repeat',
                maskSize: 'contain',
                maskPosition: 'center',
              }}
            >
              <Image
                src={pkg.image || pkg.imageUrl || "/placeholder.png"}
                alt={pkg.name || "Package image"}
                fill
                className="object-cover group-hover:brightness-110 transition-all duration-300 "
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Title */}
        <h3 className={`font-bold text-gray-800 truncate mb-1 px-1 group-hover:text-gray-900 transition-colors duration-200 ${
          isMobileView ? 'text-base' : 'text-base sm:text-lg md:text-xl px-2'
        }`}>
          {pkg.name}
        </h3>

        {/* Price + Meta with weekend indicator */}
        <div className="mb-2">
          <div className="flex items-center justify-center gap-2">
            <p className={`font-bold text-primary group-hover:text-primary transition-colors duration-200 ${
              isMobileView ? 'text-lg' : 'text-base sm:text-lg'
            }`}>
              {pkg.displayPrice || `£${pkg.price}`}
            </p>
         
          </div>
          
          <div className="flex items-center justify-center gap-2 text-gray-500 mt-1">
            <span className="text-gray-400 text-xs">{pkg.duration}</span>
          </div>

        </div>

        {/* Buttons with mobile-optimized sizing */}
        {isInPlanPackage ? (
          <div className="mt-auto space-y-1">
            <Button
              className={`w-full rounded-xl font-semibold bg-teal-500 hover:bg-teal-500 text-white cursor-not-allowed ${
                isMobileView ? 'py-2 text-sm' : 'py-2 sm:py-3 text-sm sm:text-base'
              }`}
              disabled
            >
              <CheckCircle className={`mr-1 ${isMobileView ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4 sm:mr-2'}`} />
              In Plan
            </Button>
            <button
              className={`w-full text-gray-600 hover:text-gray-800 transition-colors ${
                isMobileView ? 'py-1 text-xs' : 'py-1 sm:py-2 text-xs sm:text-sm'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        ) : isSelected ? (
          <div className="mt-auto space-y-1">
            {isReplacementMode ? (
              <div className="space-y-2">
                <Button
                  className={`w-full rounded-xl font-semibold bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white ${
                    isMobileView ? 'py-2 text-sm' : 'py-2 sm:py-3 text-sm sm:text-base'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Selected for Review
                </Button>
                <p className={`text-primary-600 font-medium ${isMobileView ? 'text-xs' : 'text-xs'}`}>
                  Return to dashboard to approve
                </p>
              </div>
            ) : (
              <Button
                className={`w-full rounded-xl font-semibold ${addToPlanButtonState.className} ${
                  isMobileView ? 'py-2 text-sm' : 'py-2 sm:py-3 text-sm sm:text-base'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToPlan()
                }}
                disabled={addToPlanButtonState.disabled}
              >
                {addToPlanButtonState.text} 
              </Button>
            )}
            
            <button
              className={`w-full text-gray-600 transition-colors cursor-pointer hover:text-[hsl(var(--primary-700))] ${
                isMobileView ? 'py-1 text-xs' : 'py-1 sm:py-2 text-xs sm:text-sm'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        ) : (
          <div className="mt-auto space-y-1">
            <Button
              variant="default"
              className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold group-hover:bg-[hsl(var(--primary-500))] group-hover:text-white transform group-hover:scale-100 transition-all duration-300 ${
                isMobileView ? 'py-2 text-sm' : 'py-2 sm:py-3 text-sm sm:text-base'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handlePackageSelection(pkg.id)
              }}
            >
              {isReplacementMode ? "Select for Replacement" : "Select Package"}
            </Button>
            <button
              className={`w-full text-gray-600 hover:text-[hsl(var(--primary-500))] transition-colors ${
                isMobileView ? 'py-1 text-xs' : 'py-1 sm:py-2 text-xs sm:text-sm'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setShowModal(true)
              }}
            >
              View Details
            </button>
          </div>
        )}

        {/* Selection indicator */}
        {(isSelected || isInPlanPackage) && (
          <div
            className={`absolute rounded-full shadow-md text-white transform transition-all duration-300 ${
              isInPlanPackage ? "bg-teal-500" : isReplacementMode ? "bg-primary-500" : "bg-primary"
            } ${
              !isInPlanPackage ? "group-hover:scale-110 group-hover:rotate-12" : ""
            } ${
              isMobileView ? 'top-2 right-2 p-1' : 'top-2 sm:top-3 right-2 sm:right-3 p-1 sm:p-1.5'
            }`}
          >
            <CheckCircle size={isMobileView ? 12 : 14} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        )}

        {/* Deselect button */}
        {isSelected && !isInPlanPackage && (
          <button
            className={`absolute bg-gray-500 hover:bg-red-500 text-white rounded-full shadow-md transition-all duration-200 opacity-80 hover:opacity-100 transform hover:scale-110 ${
              isMobileView ? 'top-2 left-2 p-1' : 'top-2 sm:top-3 left-2 sm:left-3 p-1'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(null)
              
              if (isReplacementMode) {
                try {
                  const existingContext = sessionStorage.getItem('replacementContext')
                  if (existingContext) {
                    const context = JSON.parse(existingContext)
                    delete context.selectedPackageId
                    delete context.selectedPackageData
                    delete context.packageSelectedAt
                    sessionStorage.setItem('replacementContext', JSON.stringify(context))
                    console.log('🗑️ Cleared package data from replacement context')
                  }
                } catch (error) {
                  console.error('❌ Error clearing package data:', error)
                }
              }
            }}
            title="Deselect package"
          >
            <X size={isMobileView ? 10 : 12} className="sm:w-[14px] sm:h-[14px]" />
          </button>
        )}
      </div>

      {/* Modal */}
      <PackageDetailsModal 
        pkg={pkg} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        showWeekendIndicator={showWeekendIndicator}
      />
    </>
  )
}

// Horizontal scroll component for mobile
const MobilePackageSlider = ({ children, packagesLength }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef(null)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    checkScrollButtons()
  }, [packagesLength])

  return (
    <div className="relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      )}

      {/* Scrollable container - reduced padding and added top padding for ring border */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pt-2 pl-2 pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={checkScrollButtons}
      >
        {children}
      </div>
    </div>
  )
}

export default function SupplierPackages({
  packages,
  selectedPackageId,
  setSelectedPackageId,
  handleAddToPlan,
  getAddToPartyButtonState,
  getSupplierInPartyDetails,
  onShowNotification,
  isReplacementMode = false,
  supplier,
  selectedDate
}) {
  const isMobile = useIsMobile(768)
  
  // Calculate effective party duration (same logic as mobile booking bar)
  const effectivePartyDuration = useMemo(() => {
    console.log('📦 SupplierPackages: Calculating effective party duration')
    
    // Try to get from localStorage party details first
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (partyDetails) {
        const parsed = JSON.parse(partyDetails)
        if (parsed.duration && parsed.duration > 0) {
          console.log('📦 Using duration from localStorage:', parsed.duration)
          return parsed.duration
        }
        
        // Try to calculate from start/end times if available
        if (parsed.startTime && parsed.endTime) {
          const duration = getPartyDuration(parsed)
          console.log('📦 Calculated duration from times:', duration)
          return duration
        }
      }
    } catch (error) {
      console.warn('Could not get party duration from localStorage:', error)
    }
    
    // Default calculation - use the same as mobile booking bar
    const defaultDuration = getPartyDuration({
      date: selectedDate ? new Date(selectedDate) : null
    })
    
    console.log('📦 Using default duration:', defaultDuration)
    return defaultDuration
  }, [selectedDate])

  if (!packages || packages.length === 0) return null

  const smartPricedPackages = useMemo(() => {
    if (!supplier || !selectedDate) {
      console.log('📦 No supplier or selected date, returning original packages')
      return packages
    }
    
    console.log('📦 Package pricing calculation:', {
      supplierName: supplier.name,
      selectedDate,
      effectivePartyDuration,
      extraHourRate: supplier.extraHourRate || supplier.serviceDetails?.extraHourRate,
      packageCount: packages.length
    })
    
    // Import the lead-based check
    const { isLeadBasedSupplier } = require('@/utils/unifiedPricing')
    const isLeadBased = isLeadBasedSupplier(supplier)
    
    return packages.map(pkg => {
      console.log(`📦 Processing package "${pkg.name}":`, {
        originalPrice: pkg.price,
        isLeadBased,
        duration: effectivePartyDuration
      })
      
      // Skip enhanced pricing for lead-based suppliers
      if (isLeadBased) {
        console.log('📦 Lead-based supplier - no enhanced pricing:', supplier.name, pkg.name)
        return {
          ...pkg,
          originalPrice: pkg.price,
          displayPrice: `£${pkg.price}`,
          _smartPricing: {
            isWeekendRate: false,
            premiumAmount: 0,
            breakdown: null
          }
        }
      }
      
      // FIXED: Include duration in pricing calculation
      const pricing = calculateFinalPrice(
        { 
          ...supplier, 
          price: pkg.price,
          originalPrice: pkg.price 
        }, 
        { 
          date: selectedDate, 
          duration: effectivePartyDuration // Now includes duration!
        }, 
        []
      );
      
      console.log(`📦 Package "${pkg.name}" enhanced pricing:`, {
        originalPrice: pkg.price,
        finalPrice: pricing.finalPrice,
        breakdown: pricing.breakdown,
        weekendPremium: pricing.breakdown.weekend,
        extraHourCost: pricing.breakdown.extraHours,
        calculation: `£${pkg.price} + £${pricing.breakdown.weekend} (weekend) + £${pricing.breakdown.extraHours} (extra ${pricing.details.extraHours}h) = £${pricing.finalPrice}`
      })
      
      // Build breakdown text
      const breakdownParts = []
      if (pricing.breakdown.weekend > 0) {
        breakdownParts.push(`+£${pricing.breakdown.weekend} weekend`)
      }
      if (pricing.breakdown.extraHours > 0) {
        breakdownParts.push(`+£${pricing.breakdown.extraHours} extra ${pricing.details.extraHours}h`)
      }
      
      return {
        ...pkg,
        originalPrice: pkg.price,
        price: pricing.finalPrice,
        displayPrice: `£${pricing.finalPrice}`,
        _smartPricing: {
          isWeekendRate: pricing.breakdown.weekend > 0,
          premiumAmount: pricing.breakdown.weekend,
          extraHourPremium: pricing.breakdown.extraHours,
          breakdown: breakdownParts.length > 0 ? breakdownParts.join(', ') : null,
          hasEnhancedPricing: pricing.finalPrice !== pkg.price,
          details: {
            basePrice: pkg.price,
            weekendCost: pricing.breakdown.weekend,
            extraHourCost: pricing.breakdown.extraHours,
            extraHours: pricing.details.extraHours,
            finalPrice: pricing.finalPrice
          }
        }
      }
    })
  }, [packages, supplier, selectedDate, effectivePartyDuration]) // Add effectivePartyDuration to dependencies

  console.log('📦 Final smartPricedPackages:', smartPricedPackages.map(pkg => ({
    name: pkg.name,
    originalPrice: pkg.originalPrice,
    finalPrice: pkg.price,
    displayPrice: pkg.displayPrice,
    breakdown: pkg._smartPricing?.breakdown
  })))

  // Rest of your component stays exactly the same...
  const partyDetails = getSupplierInPartyDetails()
  const packagesData = smartPricedPackages

  // Sort packages for mobile: put "In Plan" packages first
  const sortedPackagesData = isMobile 
    ? [...packagesData].sort((a, b) => {
        const aIsInPlan = partyDetails.inParty && partyDetails.currentPackage === a.id
        const bIsInPlan = partyDetails.inParty && partyDetails.currentPackage === b.id
        
        if (aIsInPlan && !bIsInPlan) return -1
        if (!aIsInPlan && bIsInPlan) return 1
        
        return 0
      })
    : packagesData

    // In SupplierPackages component
const isVenue = supplier?.serviceType === 'venue' || 
supplier?.category === 'Venues' || 
supplier?.serviceDetails?.venueType;

  return (
    <div className={isMobile ? "px-2" : "px-4 md:px-0"}>
      {/* Header */}
      <h2 className={`font-bold text-gray-900 mb-4 sm:mb-6 ${isMobile ? "text-lg px-2" : "text-xl sm:text-2xl"}`}>
        {isReplacementMode ? "Choose Replacement Package" : "Choose a Package"}
      </h2>
      {isVenue && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <h4 className="font-semibold text-blue-900 mb-2">How Venue Pricing Works</h4>
    <p className="text-blue-800 text-sm">
      All venue bookings include 1 hour setup + party time + 1 hour cleanup. 
      This ensures you have adequate time to prepare and clean up after your celebration.
    </p>
  </div>
)}
      {/* Replacement mode instructions */}
      {isReplacementMode && (
        <div className={`bg-primary-50 border border-[hsl(var(--primary-200))] rounded-xl p-4 mb-6 ${isMobile ? "mx-2" : ""}`}>
          <div className="flex items-center gap-3">
           <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753965530/ChatGPT_Image_Jul_31_2025_01_38_43_PM_ozbvja.png" className="h-10 w-10" alt="" />
            <div>
              <h3 className="font-semibold text-primary-900">Replacement Mode</h3>
              <p className="text-sm text-primary-700">
                Select a package to replace your previous choice. You can review and approve it from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of your existing JSX stays the same */}
      {isMobile ? (
        <MobilePackageSlider packagesLength={sortedPackagesData.length}>
          {sortedPackagesData.map((pkg) => {
            const isInPlanPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id
            const isSelected = pkg.id === selectedPackageId && !isInPlanPackage
            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={isSelected}
                isInPlan={partyDetails.inParty}
                isInPlanPackage={isInPlanPackage}
                onSelect={setSelectedPackageId}
                onAddToPlan={handleAddToPlan}
                addToPlanButtonState={getAddToPartyButtonState(pkg.id)}
                onShowNotification={onShowNotification}
                isReplacementMode={isReplacementMode}
                isMobileView={true}
              />
            )
          })}
        </MobilePackageSlider>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6 md:gap-8">
          {packagesData.map((pkg) => {
            const isInPlanPackage = partyDetails.inParty && partyDetails.currentPackage === pkg.id
            const isSelected = pkg.id === selectedPackageId && !isInPlanPackage
            
            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={isSelected}
                isInPlan={partyDetails.inParty}
                isInPlanPackage={isInPlanPackage}
                onSelect={setSelectedPackageId}
                onAddToPlan={handleAddToPlan}
                addToPlanButtonState={getAddToPartyButtonState(pkg.id)}
                onShowNotification={onShowNotification}
                isReplacementMode={isReplacementMode}
                isMobileView={false}
                partyDuration={partyDetails.duration || 2} // Pass current duration
              />
            )
          })}
        </div>
      )}
    </div>
  )
}