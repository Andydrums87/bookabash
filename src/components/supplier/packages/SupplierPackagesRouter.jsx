// SupplierPackagesRouter.jsx
// Enhanced version with venue support, cake suppliers, and smart pricing
"use client"
import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Clock, Users, DollarSign, Calendar, MapPin, AlertTriangle, CheckCircle, Info, ImageIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SupplierPackages from '@/components/supplier/supplier-packages'
import CakeCustomizationModal from './CakeCustomizationModal'

// Inline Packages Component (for soft play, activities)
// Displays inline horizontal cards like party bags - SINGLE SELECT only
const InlinePackages = ({
  supplier,
  packages,
  selectedPackageId,
  setSelectedPackageId,
  onShowNotification,
  isReplacementMode,
  handleAddToPlan,
  getAddToPartyButtonState,
  getSupplierInPartyDetails
}) => {
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [selectedPackageForModal, setSelectedPackageForModal] = useState(null)

  const partyDetails = getSupplierInPartyDetails()
  const selectedPackage = packages.find(p => p.id === selectedPackageId)

  const handleSelectPackage = (pkgId) => {
    // Single select - clicking same package deselects, clicking different selects new one
    if (selectedPackageId === pkgId) {
      setSelectedPackageId(null)
    } else {
      setSelectedPackageId(pkgId)
    }
  }

  const handleAddSelectedToPlan = () => {
    if (!selectedPackageId) {
      onShowNotification?.({
        type: "warning",
        message: "Please select a package"
      })
      return
    }
    handleAddToPlan()
  }

  const buttonState = getAddToPartyButtonState(selectedPackageId)

  return (
    <div className="px-4 md:px-0">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {isReplacementMode ? "Choose Replacement Package" : "Choose a Package"}
      </h2>

      {/* Horizontal scroll cards - same style as party bags */}
      <div className="-mx-4 md:mx-0 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex gap-3 px-4 md:px-0 snap-x snap-mandatory w-max md:w-auto md:flex-wrap md:justify-start">
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id
            const packageImage = pkg.image || pkg.imageUrl || pkg.images?.[0]
            const features = pkg.whatsIncluded || pkg.features || []

            return (
              <div
                key={pkg.id}
                className={`relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                  isSelected
                    ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))] shadow-md"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                {/* Package Image */}
                <div className="relative w-full h-32 sm:h-36">
                  {packageImage ? (
                    <Image
                      src={typeof packageImage === 'object' ? packageImage.src : packageImage}
                      alt={pkg.name}
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {/* Selection checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 bg-white">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                      {pkg.name}
                    </h4>
                    <p className="font-bold text-primary-600 text-base flex-shrink-0">
                      £{(pkg.price || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Duration */}
                  {pkg.duration && (
                    <p className="text-xs text-gray-400 mb-1">{pkg.duration}</p>
                  )}

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                      {pkg.description}
                    </p>
                  )}

                  {/* What's Included button */}
                  {features.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPackageForModal(pkg)
                        setShowPackageModal(true)
                      }}
                      className="flex items-center gap-1 text-xs text-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-600))] font-medium transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>What&apos;s included</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selection Summary & Add to Plan */}
      {selectedPackage && (
        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedPackage.name}</p>
              <p className="text-2xl font-bold text-primary-600">
                £{(selectedPackage.price || 0).toFixed(2)}
              </p>
            </div>
            <Button
              onClick={handleAddSelectedToPlan}
              disabled={buttonState.disabled}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold"
            >
              {partyDetails.inParty ? "Update Package" : "Add to Plan"}
            </Button>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageModal && selectedPackageForModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowPackageModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedPackageForModal.name}</h3>
                <p className="text-sm text-[hsl(var(--primary-600))] font-medium">
                  £{(selectedPackageForModal.price || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowPackageModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">What&apos;s Included</p>
              <div className="space-y-2.5">
                {(selectedPackageForModal.whatsIncluded || selectedPackageForModal.features || []).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm pt-0.5">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowPackageModal(false)}
                className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SupplierPackagesRouter = ({
  supplier,
  packages,
  selectedPackageId,
  setSelectedPackageId,
  handleAddToPlan,
  getAddToPartyButtonState,
  getSupplierInPartyDetails,
  onShowNotification,
  isReplacementMode = false,
  partyDuration,
  selectedDate // For smart pricing and venue availability
}) => {
  
  // State for cake customization modal
  const [showCakeModal, setShowCakeModal] = useState(false)
  const [selectedPackageForCake, setSelectedPackageForCake] = useState(null)
  
  // Enhanced supplier type detection
  const supplierType = useMemo(() => {
  

    // Check for venue supplier
    if (supplier?.category?.toLowerCase().includes('venue') || 
        supplier?.serviceDetails?.venueType ||
        supplier?.serviceDetails?.capacity) {
      console.log('✅ Detected venue supplier');
      return 'venue'
    }

    // Check for cake supplier (existing logic)
    if (supplier?.category?.toLowerCase().includes('catering')) {
      const serviceDetails = supplier?.serviceDetails
      
      if (serviceDetails?.cateringType?.toLowerCase().includes('cake') ||
          serviceDetails?.cateringType?.toLowerCase().includes('baker') ||
          serviceDetails?.cakeSpecialist === true ||
          serviceDetails?.cakeFlavors?.length > 0) {
        console.log('✅ Detected cake supplier');
        return 'cake'
      }
    }
    
    if (supplier?.category?.toLowerCase().includes('cake')) {
      console.log('✅ Detected cake supplier via category');
      return 'cake'
    }
    
    console.log('✅ Standard supplier detected');
    return 'standard'
  }, [supplier])
  
  
  const isVenueSupplier = supplierType === 'venue'
  const isCakeSupplier = supplierType === 'cake'

  // Check if this is a soft play/activities supplier that should show inline card layout
  // Note: These are NOT multi-select - only one package can be selected at a time
  const isSoftPlayOrActivities = supplier?.category?.toLowerCase()?.includes('soft play') ||
    supplier?.category?.toLowerCase()?.includes('activities') ||
    supplier?.serviceType === 'activities'

  // Venue booking calculations
  const venueBookingDetails = useMemo(() => {
    if (!isVenueSupplier) return null
    
    const serviceDetails = supplier?.serviceDetails || {}
    const pricing = serviceDetails.pricing || {}
    const availability = serviceDetails.availability || {}
    
    const minHours = availability.minimumBookingHours || 3
    const setupTime = pricing.setupTime || 30
    const cleanupTime = pricing.cleanupTime || 30
    const hourlyRate = pricing.hourlyRate || 0
    
    // Calculate if it's a weekend
    const isWeekend = selectedDate && [0, 6].includes(new Date(selectedDate).getDay())
    const weekendSurcharge = pricing.weekendSurcharge || 0
    
    let basePrice = hourlyRate * minHours
    if (isWeekend && weekendSurcharge > 0) {
      basePrice = basePrice * (1 + weekendSurcharge / 100)
    }
    
    const additionalFees = (pricing.cleaningFee || 0) + (pricing.securityDeposit || 0)
    const totalVenueTime = minHours + ((setupTime + cleanupTime) / 60)
    
    return {
      hourlyRate,
      minimumHours: minHours,
      setupTime,
      cleanupTime,
      totalVenueTime: Math.ceil(totalVenueTime),
      basePrice: Math.round(basePrice),
      additionalFees,
      totalPrice: Math.round(basePrice + additionalFees),
      isWeekend,
      weekendSurcharge,
      capacity: serviceDetails.capacity || {},
      venueType: serviceDetails.venueType || 'Venue'
    }
  }, [isVenueSupplier, supplier, selectedDate])

  const VenueBookingCard = () => {
    const [selectedDuration, setSelectedDuration] = useState(venueBookingDetails?.minimumHours || 2)
    
    if (!venueBookingDetails) return null
  
    const buttonState = getAddToPartyButtonState()
    const inPartyDetails = getSupplierInPartyDetails()
  
    // Calculate pricing for different durations
    const calculateVenuePrice = (partyHours) => {
      const basePrice = venueBookingDetails.hourlyRate * partyHours
      const weekendMultiplier = venueBookingDetails.isWeekend && venueBookingDetails.weekendSurcharge > 0 
        ? (1 + venueBookingDetails.weekendSurcharge / 100) 
        : 1
      const adjustedPrice = basePrice * weekendMultiplier
      return Math.round(adjustedPrice + venueBookingDetails.additionalFees)
    }
  
    // Package shortcuts for common durations
    const packageShortcuts = [
      {
        id: 'standard',
        name: 'Standard Party',
        partyHours: 2,
        description: '2h party + 1h setup + 1h cleanup',
        totalTime: 4,
        price: calculateVenuePrice(2),
        popular: true
      },
      {
        id: 'extended',
        name: 'Extended Party', 
        partyHours: 3,
        description: '3h party + 1h setup + 1h cleanup',
        totalTime: 5,
        price: calculateVenuePrice(3),
        popular: false
      },
      {
        id: 'celebration',
        name: 'Full Celebration',
        partyHours: 4,
        description: '4h party + 1h setup + 1h cleanup', 
        totalTime: 6,
        price: calculateVenuePrice(4),
        popular: false
      }
    ]
  
    // Calculate current selection pricing
    const currentPrice = calculateVenuePrice(selectedDuration)
    const currentTotalTime = selectedDuration + ((venueBookingDetails.setupTime + venueBookingDetails.cleanupTime) / 60)
  
    return (
      <div className="space-y-6">
        {/* Package Shortcuts */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Options</h3>
            <p className="text-gray-600 text-sm">Choose a common package or customize your booking below</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packageShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  onClick={() => setSelectedDuration(shortcut.partyHours)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                    selectedDuration === shortcut.partyHours
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  {shortcut.popular && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  <div className="font-semibold text-gray-900">{shortcut.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{shortcut.description}</div>
                  <div className="text-lg font-bold text-blue-600 mt-2">£{shortcut.price}</div>
                  <div className="text-xs text-gray-500">Total venue time: {shortcut.totalTime}h</div>
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* Custom Duration Selector */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Duration</h3>
            <p className="text-gray-600 text-sm">Adjust party time to fit your needs</p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Party Duration:</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                  <option key={hours} value={hours}>
                    {hours} hour{hours !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Party time:</span>
                  <span className="font-medium">{selectedDuration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Setup & cleanup:</span>
                  <span className="font-medium">{venueBookingDetails.setupTime + venueBookingDetails.cleanupTime} minutes</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">Total venue time:</span>
                  <span className="text-gray-900">{Math.ceil(currentTotalTime)} hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Main venue booking card */}
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Venue Hire
                </h3>
                <p className="text-gray-600 mt-1">
                  {venueBookingDetails.venueType}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  £{venueBookingDetails.hourlyRate}
                </div>
                <div className="text-sm text-blue-600">per hour</div>
              </div>
            </div>
          </div>
  
          <div className="p-6 space-y-4">
            {/* Capacity info */}
            {venueBookingDetails.capacity.max && (
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4" />
                <span>
                  Up to {venueBookingDetails.capacity.max} guests
                  {venueBookingDetails.capacity.seated && (
                    <span className="text-gray-500"> ({venueBookingDetails.capacity.seated} seated)</span>
                  )}
                </span>
              </div>
            )}
  
            {/* Pricing breakdown for selected duration */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-900">
                <DollarSign className="w-4 h-4" />
                Your Booking
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {selectedDuration} hours × £{venueBookingDetails.hourlyRate}:
                  </span>
                  <span className="font-medium">
                    £{venueBookingDetails.hourlyRate * selectedDuration}
                  </span>
                </div>
                
                {venueBookingDetails.isWeekend && venueBookingDetails.weekendSurcharge > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Weekend surcharge (+{venueBookingDetails.weekendSurcharge}%):</span>
                    <span className="font-medium">
                      +£{Math.round((venueBookingDetails.hourlyRate * selectedDuration) * (venueBookingDetails.weekendSurcharge / 100))}
                    </span>
                  </div>
                )}
                
                {venueBookingDetails.additionalFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional fees:</span>
                    <span className="font-medium">£{venueBookingDetails.additionalFees}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-green-900">
                  <span>Total cost:</span>
                  <span>£{currentPrice}</span>
                </div>
              </div>
            </div>
  
            {/* Weekend notice */}
            {venueBookingDetails.isWeekend && venueBookingDetails.weekendSurcharge > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-orange-800">Weekend booking:</span>
                  <span className="text-orange-700"> {venueBookingDetails.weekendSurcharge}% surcharge applied for weekend bookings.</span>
                </div>
              </div>
            )}
  
            {/* Booking button */}
            <button
              onClick={() => handleVenueBooking(selectedDuration, currentPrice)}
              disabled={buttonState.disabled}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                buttonState.disabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : inPartyDetails
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {buttonState.loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Booking...
                </span>
              ) : (
                `Add to Plan (${selectedDuration}h party + setup)`
              )}
            </button>
  
            {/* Additional info */}
            {isReplacementMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Replacement mode:</span> This will replace your current venue booking.
                </p>
              </div>
            )}
          </div>
        </div>
  
        {/* Venue facilities preview */}
        {supplier?.serviceDetails?.facilities?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Key Facilities</h4>
            <div className="flex flex-wrap gap-2">
              {supplier.serviceDetails.facilities.slice(0, 6).map((facility, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                >
                  {facility}
                </span>
              ))}
              {supplier.serviceDetails.facilities.length > 6 && (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-200">
                  +{supplier.serviceDetails.facilities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Handle venue booking
  const handleVenueBooking = () => {
    console.log('🏛️ Venue booking initiated:', {
      venueName: supplier.name,
      bookingDetails: venueBookingDetails
    })

    // Create venue booking data structure
    const venueBookingData = {
      type: 'venue',
      supplier: supplier,
      bookingDetails: venueBookingDetails,
      selectedDate: selectedDate,
      facilities: supplier?.serviceDetails?.facilities || [],
      policies: supplier?.serviceDetails?.policies || {},
      venueDetails: supplier?.serviceDetails?.venueDetails || {}
    }

    // Use the regular handleAddToPlan but with venue-specific data structure
    handleAddToPlan(true, venueBookingData)

    // Show success notification
    onShowNotification?.({
      type: "success",
      message: `🏛️ ${supplier.name} venue booked for ${venueBookingDetails.minimumHours} hours!`
    })
  }
  
  // Enhanced handleAddToPlan that intercepts for special supplier types
  const enhancedHandleAddToPlan = (...args) => {
    const [skipAddonModal = false, addonData = null] = args
    
    console.log('🚀 HandleAddToPlan called:', {
      supplierType,
      selectedPackageId,
      skipAddonModal,
      hasAddonData: !!addonData,
      args
    })
    
    // Venues are handled separately - they don't use this flow
    if (isVenueSupplier) {
      console.log('🏛️ Venue booking should use handleVenueBooking instead')
      return
    }
    
    // If this is a cake supplier, no addon data provided, and we have a selected package
    if (isCakeSupplier && !addonData && selectedPackageId) {
      const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId)
      if (selectedPackage) {
        console.log('🎂 Intercepting add to plan for cake customization:', {
          packageName: selectedPackage.name,
          packageId: selectedPackage.id,
          deliveryFee: selectedPackage.deliveryFee,
          allPackageKeys: Object.keys(selectedPackage),
          fullPackage: selectedPackage
        })
        setSelectedPackageForCake(selectedPackage)
        setShowCakeModal(true)
        return // Don't proceed with regular add to plan
      }
    }
    
    // For standard suppliers or when addon data is provided, use regular flow
    console.log('➡️ Proceeding with regular handleAddToPlan')
    handleAddToPlan(...args)
  }
  
  // Handle cake customization confirmation
  const handleCakeCustomizationConfirm = (enhancedPackageData) => {
    console.log('🎂 Cake customization confirmed:', {
      packageName: enhancedPackageData.name,
      flavor: enhancedPackageData.cakeCustomization?.flavorName
    })
    
    setShowCakeModal(false)
    setSelectedPackageForCake(null)
    
    // Call the original handleAddToPlan with enhanced package data
    handleAddToPlan(true, { package: enhancedPackageData })
    
    // Show success notification
    onShowNotification?.({
      type: "success",
      message: `🎂 ${enhancedPackageData.name} added to your plan!`
    })
  }
  
  // Handle cake modal close
  const handleCakeModalClose = () => {
    setShowCakeModal(false)
    setSelectedPackageForCake(null)
  }

  

  // Render based on supplier type
  return (
    <>
      {/* Soft play/activities get inline card layout (single select) */}
      {isSoftPlayOrActivities ? (
        <InlinePackages
          supplier={supplier}
          packages={packages}
          selectedPackageId={selectedPackageId}
          setSelectedPackageId={setSelectedPackageId}
          onShowNotification={onShowNotification}
          isReplacementMode={isReplacementMode}
          handleAddToPlan={enhancedHandleAddToPlan}
          getAddToPartyButtonState={getAddToPartyButtonState}
          getSupplierInPartyDetails={getSupplierInPartyDetails}
        />
      ) : (
        <SupplierPackages
          supplier={supplier}
          packages={packages}
          selectedPackageId={selectedPackageId}
          setSelectedPackageId={setSelectedPackageId}
          handleAddToPlan={enhancedHandleAddToPlan}
          getAddToPartyButtonState={getAddToPartyButtonState}
          getSupplierInPartyDetails={getSupplierInPartyDetails}
          onShowNotification={onShowNotification}
          isReplacementMode={isReplacementMode}
          selectedDate={selectedDate}
        />
      )}

      {/* Cake Customization Modal - only shows for cake suppliers */}
      {isCakeSupplier && (
        <CakeCustomizationModal
          isOpen={showCakeModal}
          onClose={handleCakeModalClose}
          supplier={supplier}
          selectedPackage={selectedPackageForCake}
          onConfirm={handleCakeCustomizationConfirm}
        />
      )}
    </>
  )
}

export default SupplierPackagesRouter

// Enhanced helper function to determine supplier type
export const getSupplierType = (supplier) => {
  if (!supplier) return 'standard'
  
  // Check for venue supplier
  if (supplier?.category?.toLowerCase().includes('venue') || 
      supplier?.serviceDetails?.venueType ||
      supplier?.serviceDetails?.capacity) {
    return 'venue'
  }
  
  // Check for cake supplier
  if (supplier?.category?.toLowerCase().includes('cake') || 
      supplier?.category?.toLowerCase().includes('catering') ||
      supplier?.serviceDetails?.cakeSpecialist ||
      supplier?.serviceDetails?.cakeFlavors?.length > 0) {
    return 'cake'
  }
  
  return 'standard'
}

// Venue booking data structure helper
export const createVenueBookingData = (supplier, bookingDetails, selectedDate) => {
  return {
    type: 'venue',
    supplierId: supplier.id,
    supplierName: supplier.name,
    venueType: supplier.serviceDetails?.venueType,
    capacity: supplier.serviceDetails?.capacity,
    hourlyRate: bookingDetails.hourlyRate,
    minimumHours: bookingDetails.minimumHours,
    totalVenueTime: bookingDetails.totalVenueTime,
    basePrice: bookingDetails.basePrice,
    additionalFees: bookingDetails.additionalFees,
    totalPrice: bookingDetails.totalPrice,
    selectedDate: selectedDate,
    setupTime: bookingDetails.setupTime,
    cleanupTime: bookingDetails.cleanupTime,
    isWeekend: bookingDetails.isWeekend,
    weekendSurcharge: bookingDetails.weekendSurcharge,
    facilities: supplier.serviceDetails?.facilities || [],
    policies: supplier.serviceDetails?.policies || {},
    location: supplier.owner?.address,
    venueDetails: supplier.serviceDetails?.venueDetails || {}
  }
}