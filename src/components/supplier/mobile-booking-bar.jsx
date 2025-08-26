import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Calendar,
  Star,
  Heart,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Sun,
  Moon
} from "lucide-react";

import { 
  dateToLocalString, 
  stringToLocalDate, 
  getDateStringForComparison,
  parseSupplierDate,
  migrateDateArray,
  isSameDay,
  formatDate
} from '@/utils/dateHelpers';

// Time slot definitions - matching the supplier settings
const TIME_SLOTS = {
  morning: {
    id: 'morning',
    label: 'Morning',
    defaultStart: '09:00',
    defaultEnd: '13:00',
    displayTime: '9am - 1pm',
    icon: Sun
  },
  afternoon: {
    id: 'afternoon', 
    label: 'Afternoon',
    defaultStart: '13:00',
    defaultEnd: '17:00',
    displayTime: '1pm - 5pm',
    icon: Moon
  }
}

const MobileBookingBar = ({ 
  selectedPackage = null, 
  supplier = null,
  onAddToPlan = () => {}, 
  onSaveForLater = () => {},
  addToPlanButtonState = null,
  selectedDate = null,
  currentMonth = new Date(),
  setSelectedDate = () => {},
  setCurrentMonth = () => {},
  selectedTimeSlot = null,
  setSelectedTimeSlot = () => {},
  hasValidPartyPlan = () => false,
  isFromDashboard = false,
  partyDate = null,
  partyTimeSlot = null,
  showAddonModal = false,
  isAddingToPlan = false,
  hasEnquiriesPending = () => false,
  onShowPendingEnquiryModal = () => {},
  pendingCount = 0,
  
  // Replacement mode props
  isReplacementMode = false,
  replacementSupplierName = '',
  onReturnToReplacement = () => {},
  packages = [],
  
  // Cake modal props
  openCakeModal,
  showCakeModal = false,
  isCakeSupplier = false
}) => {

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showingTimeSlots, setShowingTimeSlots] = useState(false);
  const [selectedDateForSlots, setSelectedDateForSlots] = useState(null);
  const hasSetInitialMonth = useRef(false);

  // Set initial month to party date if coming from dashboard
  useEffect(() => {
    if (isFromDashboard && partyDate && !hasSetInitialMonth.current) {
      const partyYear = partyDate.getFullYear()
      const partyMonth = partyDate.getMonth()
      const currentYear = currentMonth.getFullYear()
      const currentMonthIndex = currentMonth.getMonth()
      
      if (partyYear !== currentYear || partyMonth !== currentMonthIndex) {
        setCurrentMonth(new Date(partyYear, partyMonth, 1))
      }
      
      hasSetInitialMonth.current = true
    }
  }, [isFromDashboard, partyDate])

  // FIXED: Migration helper for legacy supplier data with centralized date handling
  const getSupplierWithTimeSlots = (supplierData) => {
    if (!supplierData) return null
    
    if (supplierData.workingHours?.Monday?.timeSlots) {
      return supplierData
    }
    
    const migrated = { ...supplierData }
    
    if (supplierData.workingHours) {
      migrated.workingHours = {}
      Object.entries(supplierData.workingHours).forEach(([day, hours]) => {
        migrated.workingHours[day] = {
          active: hours.active,
          timeSlots: {
            morning: { 
              available: hours.active, 
              startTime: hours.start || "09:00", 
              endTime: "13:00" 
            },
            afternoon: { 
              available: hours.active, 
              startTime: "13:00", 
              endTime: hours.end || "17:00" 
            }
          }
        }
      })
    }
    
    // FIXED: Use centralized date migration
    if (supplierData.unavailableDates && Array.isArray(supplierData.unavailableDates)) {
      migrated.unavailableDates = migrateDateArray(supplierData.unavailableDates)
    }
    
    if (supplierData.busyDates && Array.isArray(supplierData.busyDates)) {
      migrated.busyDates = migrateDateArray(supplierData.busyDates)
    }
    
    return migrated
  }

  const migratedSupplier = useMemo(() => getSupplierWithTimeSlots(supplier), [supplier])

  // FIXED: Check if a specific time slot is available on a date
  const isTimeSlotAvailable = (date, timeSlot) => {
    if (!migratedSupplier || !date || !timeSlot) return false
    
    try {
      const checkDate = parseSupplierDate(date)
      if (!checkDate) return false
      
      const dateString = dateToLocalString(checkDate)
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
      
  
      
      // Check working hours
      const workingDay = migratedSupplier.workingHours?.[dayName]
      if (!workingDay?.active) {

        return false
      }
      
      if (!workingDay.timeSlots?.[timeSlot]?.available) {

        return false
      }
      
      // FIXED: Check unavailable dates with consistent comparison
      const unavailableDate = migratedSupplier.unavailableDates?.find(ud => {
        const udDate = getDateStringForComparison(ud.date || ud)
        const matches = udDate === dateString
        if (matches) {
   
        }
        return matches
      })
      
      if (unavailableDate) {
       
        if (typeof unavailableDate === 'string') {

          return false
        }
        if (unavailableDate.timeSlots?.includes(timeSlot)) {

          return false
        }
        
      }
      
      // FIXED: Check busy dates with consistent comparison
      const busyDate = migratedSupplier.busyDates?.find(bd => {
        const bdDate = getDateStringForComparison(bd.date || bd)
        const matches = bdDate === dateString
        if (matches) {
        
        }
        return matches
      })
      
      if (busyDate) {
  
        if (typeof busyDate === 'string') {

          return false
        }
        if (busyDate.timeSlots?.includes(timeSlot)) {
          
          return false
        }

      }
      
   
      return true
    } catch (error) {
      console.error('❌ MOBILE: Error checking time slot availability:', error)
      return false
    }
  }

  // Get available time slots for a date
  const getAvailableTimeSlots = (date) => {
    return Object.keys(TIME_SLOTS).filter(slot => 
      slot !== 'allday' && isTimeSlotAvailable(date, slot)
    )
  }

  // Helper functions
  const handlePendingEnquiryInfo = () => {
    if (onShowPendingEnquiryModal) {
      onShowPendingEnquiryModal()
    }
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

  // FIXED: Mobile add to plan with proper cake modal opening
  const handleMobileAddToPlan = () => {
    console.log('🎂 Mobile: Checking for cake customization need:', {
      isCakeSupplier,
      selectedPackage: selectedPackage?.name,
      packageType: selectedPackage?.packageType,
      isCustomizable: isCustomizablePackage(selectedPackage),
      hasOpenCakeModal: !!openCakeModal
    })

    if (isCakeSupplier && selectedPackage && openCakeModal) {
      const shouldShowModal = isCustomizablePackage(selectedPackage)
      

      
      if (shouldShowModal) {
    
        setIsModalOpen(false)
        openCakeModal(selectedPackage)
        return
      } else {

      }
    } else if (isCakeSupplier && !openCakeModal) {
      console.warn('🎂 Mobile: isCakeSupplier is true but openCakeModal function not provided')
    }


    onAddToPlan()
  }

  const handleApprove = () => {

    
    if (!selectedPackage) {
      console.error('❌ MOBILE APPROVE: No package selected')
      alert('Please select a package first!')
      return
    }
    
    if (!supplier?.category) {
      console.error('❌ MOBILE APPROVE: No supplier category')
      alert('Supplier category not found. Please refresh and try again.')
      return
    }
    
    try {
      let completePackageData = selectedPackage
      if (packages && packages.length > 0 && selectedPackage.id) {
        const fullPackageData = packages.find(pkg => pkg.id === selectedPackage.id)
        if (fullPackageData) {
          completePackageData = fullPackageData
        }
      }
      
      const enhancedPackageData = {
        id: completePackageData.id,
        name: completePackageData.name,
        price: completePackageData.price,
        duration: completePackageData.duration || '2 hours',
        features: completePackageData.features || completePackageData.whatsIncluded || [],
        description: completePackageData.description || `${completePackageData.name} package`,
        originalPrice: completePackageData.originalPrice || completePackageData.price,
        totalPrice: completePackageData.totalPrice || completePackageData.price,
        basePrice: completePackageData.basePrice || completePackageData.price,
        addonsPriceTotal: completePackageData.addonsPriceTotal || 0,
        addons: completePackageData.addons || [],
        selectedAddons: completePackageData.selectedAddons || [],
        selectedAt: new Date().toISOString(),
        selectionSource: 'mobile_booking_bar_approval',
        approvedFromMobile: true,
        replacementApproval: true
      }
      
      const enhancedSupplierData = {
        id: supplier.id,
        name: supplier.name,
        category: supplier.category,
        description: supplier.description,
        price: completePackageData.price,
        priceFrom: supplier.priceFrom,
        image: supplier.image,
        rating: supplier.rating,
        reviewCount: supplier.reviewCount,
        location: supplier.location,
        phone: supplier.phone,
        email: supplier.email,
        verified: supplier.verified
      }
      
      const currentContext = sessionStorage.getItem('replacementContext')
      let updatedContext = {}
      
      if (currentContext) {
        const parsedContext = JSON.parse(currentContext)
        updatedContext = {
          ...parsedContext,
          selectedPackageId: completePackageData.id,
          selectedPackageData: enhancedPackageData,
          selectedSupplierData: enhancedSupplierData,
          packageSelectedAt: new Date().toISOString(),
          packageApprovedAt: new Date().toISOString(),
          readyForBooking: true,
          shouldRestoreModal: true,
          modalShouldShowUpgrade: true,
          returnUrl: '/dashboard',
          lastViewedAt: new Date().toISOString(),
          approvalSource: 'mobile_booking_bar',
          mobileApproval: {
            timestamp: new Date().toISOString(),
            packageName: enhancedPackageData.name,
            packagePrice: enhancedPackageData.price,
            supplierName: enhancedSupplierData.name,
            supplierCategory: enhancedSupplierData.category,
            approved: true
          }
        }
      } else {
        updatedContext = {
          isReplacement: true,
          selectedPackageId: completePackageData.id,
          selectedPackageData: enhancedPackageData,
          selectedSupplierData: enhancedSupplierData,
          packageSelectedAt: new Date().toISOString(),
          packageApprovedAt: new Date().toISOString(),
          readyForBooking: true,
          shouldRestoreModal: true,
          modalShouldShowUpgrade: true,
          returnUrl: '/dashboard',
          createdAt: new Date().toISOString(),
          createdFrom: 'mobile_booking_bar',
          approvalSource: 'mobile_booking_bar',
          mobileApproval: {
            timestamp: new Date().toISOString(),
            packageName: enhancedPackageData.name,
            packagePrice: enhancedPackageData.price,
            supplierName: enhancedSupplierData.name,
            supplierCategory: enhancedSupplierData.category,
            approved: true
          }
        }
      }
      

      sessionStorage.setItem('replacementContext', JSON.stringify(updatedContext))
      sessionStorage.setItem('shouldRestoreReplacementModal', 'true')
      sessionStorage.setItem('modalShowUpgrade', 'true')
      

      
      setTimeout(() => {
        if (onReturnToReplacement) {

          onReturnToReplacement()
        } else {
  
          window.location.href = '/dashboard'
        }
      }, 200)
      
    } catch (error) {
      console.error('❌ MOBILE APPROVE: Error during approval:', error)
      alert('Error saving package selection. Please try again.')
    }
  }
  
  const handleBackToReplacement = () => {

    window.location.href = '/dashboard'
  }

  // Default package if none provided
  const packageInfo = selectedPackage || {
    name: "Select Package",
    price: 0,
    duration: "Various options",
    description: "Choose a package to continue",
    features: []
  };

  const getPackageFeatures = () => {
    if (selectedPackage?.features) return selectedPackage.features
    if (selectedPackage?.whatsIncluded) return selectedPackage.whatsIncluded
    return []
  }

  // FIXED: Enhanced availability logic with time slots
  const getDateStatus = (date, supplierData) => {
    if (!supplierData) return "unknown"
    
    try {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkDate < today) return "past"
      
      const advanceDays = supplierData.advanceBookingDays || 0
      if (advanceDays > 0) {
        const minBookingDate = new Date(today)
        minBookingDate.setDate(today.getDate() + advanceDays)
        minBookingDate.setHours(0, 0, 0, 0)
        
        if (checkDate < minBookingDate) return "outside-window"
      }
      
      const maxDays = supplierData.maxBookingDays || 365
      const maxBookingDate = new Date(today)
      maxBookingDate.setDate(today.getDate() + maxDays)
      maxBookingDate.setHours(0, 0, 0, 0)
      
      if (checkDate > maxBookingDate) return "outside-window"
      
      const availableSlots = getAvailableTimeSlots(checkDate)
      
      if (availableSlots.length === 0) return "unavailable"
      if (availableSlots.length < 2) return "partially-available"
      
      return "available"
    } catch (error) {
      console.error('Error getting date status:', error)
      return "unknown"
    }
  }

  const partyDateString = useMemo(() => {
    return partyDate ? partyDate.toDateString() : null
  }, [partyDate])

  // FIXED: Use centralized date comparison
  const isPartyDate = (date) => {
    if (!partyDate) return false
    return isSameDay(date, partyDate)
  }

  // FIXED: Party date status with proper time slot checking
  const partyDateStatus = useMemo(() => {
    if (!partyDate || !migratedSupplier) return null
    
    let partyTimeSlotToCheck = partyTimeSlot
    
    if (!partyTimeSlotToCheck) {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          partyTimeSlotToCheck = parsed.timeSlot
          
          if (!partyTimeSlotToCheck && parsed.time) {
            const timeStr = parsed.time.toLowerCase()
       
            
            if (timeStr.includes('am') || 
                timeStr.includes('9') || timeStr.includes('10') || 
                timeStr.includes('11') || timeStr.includes('12')) {
              partyTimeSlotToCheck = 'morning'
            } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                      timeStr.includes('2') || timeStr.includes('3') || 
                      timeStr.includes('4') || timeStr.includes('5')) {
              partyTimeSlotToCheck = 'afternoon'
            }
            
          
          }
        }
      } catch (error) {
        console.log('Could not determine party time slot')
      }
    }
    
    if (partyTimeSlotToCheck) {
      const isSlotAvailable = isTimeSlotAvailable(partyDate, partyTimeSlotToCheck)

      return isSlotAvailable ? 'available' : 'unavailable'
    }
    
    return getDateStatus(partyDate, migratedSupplier)
  }, [partyDate, partyTimeSlot, migratedSupplier])

  // Calendar generation with time slot support
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.getDate() === selectedDate && isCurrentMonth && !isFromDashboard;
      const status = getDateStatus(date, migratedSupplier);
      const isPartyDay = isPartyDate(date);
      const availableSlots = getAvailableTimeSlots(date);
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPartyDay,
        status,
        availableSlots
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getDayStyle = (day) => {
    if (!day.isCurrentMonth) return 'text-gray-400 cursor-not-allowed';
    
    if (day.isPartyDay) {
      const partyDateStatus = day.status
      const baseStyle = 'border-2 border-blue-500 font-bold relative overflow-hidden'
      
      switch (partyDateStatus) {
        case "available":
        case "partially-available":
          return `${baseStyle} bg-blue-100 text-blue-900 shadow-md`
        case "unavailable":
        case "outside-window":
          return `${baseStyle} bg-red-100 text-red-800 line-through`
        case "busy":
          return `${baseStyle} bg-yellow-100 text-yellow-800`
        case "closed":
          return `${baseStyle} bg-gray-200 text-gray-600`
        default:
          return `${baseStyle} bg-blue-100 text-blue-900`
      }
    }
    
    if (day.isSelected) return 'bg-primary-500 text-white border-primary-500';
    
    switch (day.status) {
      case "available":
        return isFromDashboard 
          ? 'bg-green-50 text-green-700 cursor-default border-green-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer border-green-300';
      case "partially-available":
        return isFromDashboard
          ? 'bg-yellow-50 text-yellow-700 cursor-default border-yellow-200'
          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer border-yellow-300';
      case "unavailable":
        return 'bg-red-100 text-red-800 cursor-not-allowed line-through border-red-300';
      case "busy":
        return 'bg-yellow-100 text-yellow-800 cursor-not-allowed border-yellow-300';
      case "closed":
        return 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300';
      case "past":
        return 'text-gray-300 cursor-not-allowed line-through border-gray-200';
      case "outside-window":
        return 'text-gray-400 cursor-not-allowed opacity-70 border-gray-200';
      default:
        return 'text-gray-400 cursor-not-allowed border-gray-200';
    }
  };

  // Handle date click - now considers time slots
  const handleDateClick = (day) => {
    if (day.status !== 'available' && day.status !== 'partially-available') return;
    if (!day.isCurrentMonth || isFromDashboard || day.isPartyDay) return;
    
    const availableSlots = day.availableSlots;
    
    if (availableSlots.length === 0) return;
    
    setSelectedDate(day.day);
    
    if (availableSlots.length === 1) {
      if (setSelectedTimeSlot) {
        setSelectedTimeSlot(availableSlots[0]);
      }
      return;
    }
    
    if (availableSlots.length > 1) {
      setSelectedDateForSlots(day.date);
      setShowingTimeSlots(true);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelection = (timeSlot) => {
    if (setSelectedTimeSlot) {
      setSelectedTimeSlot(timeSlot);
    }
    setShowingTimeSlots(false);
    setSelectedDateForSlots(null);
  };

  // Button logic (for normal mode)
  const getButtonState = () => {
    if (addToPlanButtonState) return addToPlanButtonState;
    
    if (!selectedPackage?.price) {
      return {
        disabled: true,
        className: "bg-gray-300 text-gray-500 cursor-not-allowed",
        text: "Select a Package"
      };
    }
    
    const hasPartyPlan = hasValidPartyPlan()
    
    if (!hasPartyPlan && !selectedDate) {
      return {
        disabled: false,
        className: "bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white transition-colors",
        text: "Pick a Date First",
        requiresDate: true
      };
    }
    
    const buttonText = isCakeSupplier && isCustomizablePackage(selectedPackage)
      ? "🎂 Customize & Add"
      : hasPartyPlan ? "Add to Plan" : "Book This Supplier"
    
    return {
      disabled: false,
      className: "bg-primary-500 hover:bg-primary-600 text-white",
      text: buttonText
    };
  };

  const buttonState = getButtonState();

  const handleMainButtonClick = () => {
    if (!isFromDashboard && (buttonState.requiresDate || !selectedDate)) {
      setIsModalOpen(true);
      return;
    }
    
    setIsModalOpen(false);
    handleMobileAddToPlan();
  };

  const PendingEnquiryIndicator = () => {
    if (!hasEnquiriesPending || !pendingCount) return null
    
    return (
      <button
        onClick={handlePendingEnquiryInfo}
        className="flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-150 text-blue-700 rounded-md text-xs transition-colors"
      >
        <AlertCircle className="w-3 h-3" />
        {pendingCount} pending
      </button>
    )
  }

  const handleAddToPlan = () => {
    if (hasEnquiriesPending && hasEnquiriesPending()) {
      setIsModalOpen(false);
      onShowPendingEnquiryModal();
      return;
    }
    
    setIsModalOpen(false);
    handleMobileAddToPlan();
  };

  const handleSaveForLater = () => {
    const selectedDateObj = selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null;
    
    onSaveForLater({ 
      package: packageInfo, 
      selectedDate: selectedDateObj,
      selectedTimeSlot: selectedTimeSlot,
      timestamp: new Date() 
    });
    setIsModalOpen(false);
  };

  const getSelectedDateDisplay = () => {
    if (!selectedDate) {
      return null;
    }
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSelectedTimeSlotDisplay = () => {
    if (!selectedTimeSlot || !TIME_SLOTS[selectedTimeSlot]) return '';
    return ` (${TIME_SLOTS[selectedTimeSlot].label})`;
  };

  return (
    <>
      {/* Replacement mode banner */}
      {!showAddonModal && !isAddingToPlan && !showCakeModal && isReplacementMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-xs">
                  Reviewing {replacementSupplierName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedPackage ? (
                    `£${selectedPackage.price} • ${selectedPackage.duration || '2 hours'}`
                  ) : (
                    'Select package above'
                  )}
                  <span className="ml-2 text-primary-500 font-medium">
                    • Replacement upgrade
                  </span>
                </p>
              </div>
              <button
                onClick={handleBackToReplacement}
                className="text-xs font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <button
              onClick={selectedPackage ? handleApprove : () => {}}
              disabled={!selectedPackage}
              className={`w-full font-semibold py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                selectedPackage 
                  ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              {selectedPackage ? `Approve ${selectedPackage.name}` : 'Select Package First'}
              <PendingEnquiryIndicator />
            </button>
          </div>
        </div>
      )}

      {/* Normal mode booking bar */}
      {!showAddonModal && !isAddingToPlan && !showCakeModal && !isReplacementMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-xs">
                  {packageInfo.name}
                  {isCakeSupplier && isCustomizablePackage(selectedPackage) && (
                    <span className="ml-1">🎂</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {packageInfo.price ? `£${packageInfo.price}` : 'Select package'} • {packageInfo.duration}
                  {selectedDate && (
                    <span className="ml-2 text-primary-500 font-medium">
                     {getSelectedDateDisplay()}
                    </span>
                  )}
             
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className={`text-xs font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center gap-2 ${
                  selectedDate || (isFromDashboard && partyDate)
                    ? 'bg-gray-100 hover:bg-[hsl(var(--primary-500))] hover:text-white text-primary-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {isFromDashboard ? 'View Calendar' : selectedDate ? 'Change Date' : 'Check Dates'}
              </button>
            </div>
            <button 
  onClick={() => buttonState.requiresDate ? setIsModalOpen(true) : handleMainButtonClick()}
  className={`w-full font-semibold py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${buttonState.className}`}
>
  {buttonState.requiresDate ? (
    <>
      {buttonState.text}
    </>
  ) : (
    <>
      <Plus className="w-5 h-5" />
      {(() => {
        // Get the base button text without any date info
        let baseText = typeof buttonState.text === 'string' ? buttonState.text : 'Add to Plan'
        
        // Remove any existing date info from the button state text
        // This handles cases where the button state already includes dates
        baseText = baseText.replace(/\s*\([^)]*\)\s*/g, '').trim()
        
        // Now add our own date display logic
        let dateDisplay = ''
        
        if (!isFromDashboard && selectedDate) {
          // For manually selected dates
          dateDisplay = ` (${getSelectedDateDisplay()}${getSelectedTimeSlotDisplay()})`
        } else if (isFromDashboard && partyDate) {
          // For party dates from dashboard
          const partyDateDisplay = partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const timeSlotDisplay = partyTimeSlot ? ` ${TIME_SLOTS[partyTimeSlot]?.label}` : ''
          dateDisplay = ` (${partyDateDisplay}${timeSlotDisplay})`
        }
        
        return baseText + dateDisplay
      })()}
    </>
  )}
</button>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isModalOpen && !isReplacementMode && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-3xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {isFromDashboard ? 'Party Date Calendar' : selectedDate ? 'Change Date & Time' : 'Pick Your Party Date & Time'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* Party date status banner */}
                {isFromDashboard && partyDate && partyDateStatus && (
                  <div className={`mb-4 p-3 rounded-lg border-2 ${
                    partyDateStatus === 'available' || partyDateStatus === 'partially-available'
                      ? 'bg-green-50 border-green-200' 
                      : partyDateStatus === 'unavailable' 
                      ? 'bg-red-50 border-red-200'
                      : partyDateStatus === 'busy'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        partyDateStatus === 'available' || partyDateStatus === 'partially-available' ? 'bg-green-200' : 
                        partyDateStatus === 'unavailable' ? 'bg-red-200' :
                        partyDateStatus === 'busy' ? 'bg-yellow-200' :
                        'bg-gray-200'
                      }`}>
                        {(partyDateStatus === 'available' || partyDateStatus === 'partially-available') ? (
                          <Calendar className="w-3 h-3 text-green-700" />
                        ) : (
                          <Info className="w-3 h-3 text-gray-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm mb-1 ${
                          partyDateStatus === 'available' || partyDateStatus === 'partially-available' ? 'text-green-800' :
                          partyDateStatus === 'unavailable' ? 'text-red-800' :
                          partyDateStatus === 'busy' ? 'text-yellow-800' :
                          'text-gray-800'
                        }`}>
                          Your Party Date: {partyDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </h4>
                        <p className={`text-xs mb-2 ${
                          partyDateStatus === 'available' || partyDateStatus === 'partially-available' ? 'text-green-700' :
                          partyDateStatus === 'unavailable' ? 'text-red-700' :
                          partyDateStatus === 'busy' ? 'text-yellow-700' :
                          'text-gray-700'
                        }`}>
                          {partyDateStatus === 'available' && '✅ Available for booking!'}
                          {partyDateStatus === 'partially-available' && '⚠️ Partially available - some time slots open'}
                          {partyDateStatus === 'unavailable' && '❌ Not available on this date'}
                          {partyDateStatus === 'busy' && '⚠️ Already booked on this date'}
                          {partyDateStatus === 'closed' && '🚫 Supplier is closed on this date'}
                          {partyDateStatus === 'past' && '📅 This date has passed'}
                          {partyDateStatus === 'outside-window' && '📋 Outside booking window'}
                        </p>
                        
                        {/* Show available time slots */}
                        {(partyDateStatus === 'available' || partyDateStatus === 'partially-available') && (
                          <div className="flex gap-2 mt-2">
                            {getAvailableTimeSlots(partyDate).map(slot => {
                              const SlotIcon = TIME_SLOTS[slot].icon;
                              return (
                                <div 
                                  key={slot} 
                                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded ${
                                    partyTimeSlot === slot 
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  <SlotIcon className="w-3 h-3" />
                                  {TIME_SLOTS[slot].label}
                                  {partyTimeSlot === slot && ' (Selected)'}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {isFromDashboard && (
                          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Date set in your party plan
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button 
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 p-2 text-xs">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`text-center p-2 rounded-lg text-sm font-medium transition-colors border ${getDayStyle(day)} relative`}
                      disabled={day.status !== 'available' && day.status !== 'partially-available' || !day.isCurrentMonth || isFromDashboard || day.isPartyDay}
                      title={
                        day.isPartyDay 
                          ? `Your Party Date - ${day.status.replace("-", " ")}`
                          : day.availableSlots?.length > 0
                          ? `Available: ${day.availableSlots.map(s => TIME_SLOTS[s].label).join(', ')}`
                          : day.status.replace("-", " ")
                      }
                    >
                      {day.day}
                      {day.isPartyDay && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      )}
                      
                      {/* Time slot indicators */}
                      {!day.isPartyDay && day.availableSlots && day.availableSlots.length > 0 && day.availableSlots.length < 2 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {day.availableSlots.map(slot => {
                            const SlotIcon = TIME_SLOTS[slot].icon;
                            return (
                              <SlotIcon key={slot} className="w-2 h-2 text-current opacity-70" />
                            );
                          })}
                        </div>
                      )}
                      
                      {/* AM/PM text for partially available days */}
                      {!day.isPartyDay && day.status === "partially-available" && day.availableSlots && day.availableSlots.length === 1 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                          {day.availableSlots[0] === 'morning' ? 'AM' : 'PM'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-gray-900 text-sm">Legend:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {isFromDashboard && (
                      <div className="flex items-center gap-2 col-span-2">
                        <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-100 relative">
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-600">Your Party Date</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-gray-600">Fully Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span className="text-gray-600">Partially Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span className="text-gray-600">Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                      <span className="text-gray-600">Day Off</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    • AM/PM indicators show which time slots are available
                    <br />
                    • Click dates to select preferred time slot for your party
                  </p>
                </div>

                {/* Selected Date Display */}
                {!isFromDashboard && selectedDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <span className="font-semibold text-blue-900 text-sm">Selected Date</span>
                        <p className="text-blue-700 text-sm">
                          {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString(
                            "en-US",
                            { weekday: "long", year: "numeric", month: "long", day: "numeric" },
                          )}
                        </p>
                        {selectedTimeSlot && (
                          <div className="flex items-center gap-2 mt-1">
                            {(() => {
                              const SlotIcon = TIME_SLOTS[selectedTimeSlot].icon;
                              return <SlotIcon className="w-4 h-4 text-blue-600" />;
                            })()}
                            <span className="text-blue-600 text-sm font-medium">
                              {TIME_SLOTS[selectedTimeSlot].label} ({TIME_SLOTS[selectedTimeSlot].displayTime})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="space-y-3">
                <button 
                  onClick={handleAddToPlan}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-1 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  disabled={!isFromDashboard && !selectedDate}
                >
                  <Plus className="w-5 h-5" />
                  {isCakeSupplier && isCustomizablePackage(selectedPackage) ? (
                    <>🎂 Customize & Add</>
                  ) : (
                    <>Add to Plan</>
                  )}
                  {' '}
                  {!isFromDashboard && selectedDate && `(${getSelectedDateDisplay()}${getSelectedTimeSlotDisplay()})`}
                  {isFromDashboard && partyDate && `(${partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${partyTimeSlot ? ` ${TIME_SLOTS[partyTimeSlot]?.label}` : ''})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Selection Modal */}
      {showingTimeSlots && selectedDateForSlots && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Choose Your Preferred Time</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDateForSlots.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="space-y-3 mb-6">
              {getAvailableTimeSlots(selectedDateForSlots).map(slot => {
                const SlotIcon = TIME_SLOTS[slot].icon;
                return (
                  <button
                    key={slot}
                    onClick={() => handleTimeSlotSelection(slot)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <SlotIcon className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-medium">{TIME_SLOTS[slot].label}</div>
                        <div className="text-sm text-gray-500">{TIME_SLOTS[slot].displayTime}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowingTimeSlots(false);
                setSelectedDateForSlots(null);
              }}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add bottom padding to page content */}
      <style jsx>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 100px;
          }
        }
      `}</style>
    </>
  );
};

export default MobileBookingBar;