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
  ArrowLeft
} from "lucide-react";

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
  hasValidPartyPlan = () => false,
  isFromDashboard = false,
  partyDate = null,
  showAddonModal = false,
  isAddingToPlan = false,
  hasEnquiriesPending = () => false,
  onShowPendingEnquiryModal = () => {},
  pendingCount = 0,
  
  // ✅ Replacement mode props
  isReplacementMode = false,
  replacementSupplierName = '',
  onReturnToReplacement = () => {},
  // ✅ NEW: Add packages prop for complete package data
  packages = []
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use a ref to track if we've already set the initial month
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

  const handleApprove = () => {
    console.log('🐊 MOBILE APPROVE: Starting approval process')
    
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
      // Get complete package data
      let completePackageData = selectedPackage
      if (packages && packages.length > 0 && selectedPackage.id) {
        const fullPackageData = packages.find(pkg => pkg.id === selectedPackage.id)
        if (fullPackageData) {
          completePackageData = fullPackageData
        }
      }
      
      // Create enhanced package data
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
      
      // Create enhanced supplier data
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
      
      // ✅ ENHANCED: Update replacement context with all necessary data
      const currentContext = sessionStorage.getItem('replacementContext')
      let updatedContext = {}
      
      if (currentContext) {
        const parsedContext = JSON.parse(currentContext)
        updatedContext = {
          ...parsedContext,
          // ✅ PACKAGE SELECTION DATA
          selectedPackageId: completePackageData.id,
          selectedPackageData: enhancedPackageData,
          selectedSupplierData: enhancedSupplierData,
          packageSelectedAt: new Date().toISOString(),
          packageApprovedAt: new Date().toISOString(),
          
          // ✅ RESTORATION FLAGS - This is crucial!
          readyForBooking: true,
          shouldRestoreModal: true,
          modalShouldShowUpgrade: true,
          
          // ✅ NAVIGATION DATA
          returnUrl: '/dashboard',
          lastViewedAt: new Date().toISOString(),
          approvalSource: 'mobile_booking_bar',
          
          // ✅ REPLACEMENT APPROVAL DATA
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
        // ✅ CREATE: Complete new context if none exists
        updatedContext = {
          isReplacement: true,
          selectedPackageId: completePackageData.id,
          selectedPackageData: enhancedPackageData,
          selectedSupplierData: enhancedSupplierData,
          packageSelectedAt: new Date().toISOString(),
          packageApprovedAt: new Date().toISOString(),
          
          // ✅ RESTORATION FLAGS
          readyForBooking: true,
          shouldRestoreModal: true,
          modalShouldShowUpgrade: true,
          
          // ✅ NAVIGATION DATA
          returnUrl: '/dashboard',
          createdAt: new Date().toISOString(),
          createdFrom: 'mobile_booking_bar',
          approvalSource: 'mobile_booking_bar',
          
          // ✅ REPLACEMENT APPROVAL DATA
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
      
      console.log('💾 MOBILE APPROVE: Setting comprehensive replacement context:', updatedContext)
      sessionStorage.setItem('replacementContext', JSON.stringify(updatedContext))
      
      // ✅ SET: Restoration flags that the dashboard will check
      sessionStorage.setItem('shouldRestoreReplacementModal', 'true')
      sessionStorage.setItem('modalShowUpgrade', 'true')
      
      console.log('🚀 MOBILE APPROVE: All flags set, navigating to dashboard')
      
      // ✅ NAVIGATE: Back to dashboard with small delay to ensure session storage is saved
      setTimeout(() => {
        if (onReturnToReplacement) {
          console.log('🚀 MOBILE APPROVE: Using onReturnToReplacement callback')
          onReturnToReplacement()
        } else {
          console.log('🚀 MOBILE APPROVE: Using window.location.href fallback')
          window.location.href = '/dashboard'
        }
      }, 200) // Increased delay to ensure session storage is properly saved
      
    } catch (error) {
      console.error('❌ MOBILE APPROVE: Error during approval:', error)
      alert('Error saving package selection. Please try again.')
    }
  }
  
  const handleBackToReplacement = () => {
    console.log('🚀 Mobile: Package approved, forcing page reload to ensure restoration')
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

  // ✅ ENHANCED: Get package features safely
  const getPackageFeatures = () => {
    if (selectedPackage?.features) return selectedPackage.features
    if (selectedPackage?.whatsIncluded) return selectedPackage.whatsIncluded
    return []
  }

  // Availability logic (keeping all existing functions)
  const isDateUnavailable = (date, supplierData) => {
    if (!supplierData?.unavailableDates) return false
    return supplierData.unavailableDates.some(
      (unavailableDate) => new Date(unavailableDate).toDateString() === date.toDateString(),
    )
  }

  const isDateBusy = (date, supplierData) => {
    if (!supplierData?.busyDates) return false
    return supplierData.busyDates.some((busyDate) => new Date(busyDate).toDateString() === date.toDateString())
  }

  const isDayAvailable = (date, supplierData) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    return supplierData?.workingHours?.[dayName]?.active || false
  }

  const getDateStatus = (date, supplierData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return "past"

    const advanceDays = supplierData?.advanceBookingDays || 0
    const maxDays = supplierData?.maxBookingDays || 365
    const minBookingDate = new Date(today)
    minBookingDate.setDate(today.getDate() + advanceDays)

    const maxBookingDate = new Date(today)
    maxBookingDate.setDate(today.getDate() + maxDays)

    if (date < minBookingDate || date > maxBookingDate) return "outside-window"
    if (isDateUnavailable(date, supplierData)) return "unavailable"
    if (isDateBusy(date, supplierData)) return "busy"
    
    if (!supplierData?.workingHours) return "available"
    
    if (!isDayAvailable(date, supplierData)) return "closed"
    return "available"
  }

  const partyDateString = useMemo(() => {
    return partyDate ? partyDate.toDateString() : null
  }, [partyDate])

  const isPartyDate = (date) => {
    if (!partyDateString) return false
    return date.toDateString() === partyDateString
  }

  const partyDateStatus = useMemo(() => {
    return partyDate ? getDateStatus(partyDate, supplier) : null
  }, [partyDate, supplier])

  // Calendar generation (keeping existing logic)
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
      const status = getDateStatus(date, supplier);
      const isPartyDay = isPartyDate(date);
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPartyDay,
        status
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
          return `${baseStyle} bg-blue-100 text-blue-900 shadow-md`
        case "unavailable":
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

  const handleDateClick = (day) => {
    if (day.status !== 'available' || !day.isCurrentMonth || isFromDashboard || day.isPartyDay) return;
    setSelectedDate(day.day);
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
    
    return {
      disabled: false,
      className: "bg-primary-500 hover:bg-primary-600 text-white",
      text: hasPartyPlan ? "Add to Plan" : "Book This Supplier"
    };
  };

  const buttonState = getButtonState();

  const handleMainButtonClick = () => {
    if (hasEnquiriesPending && hasEnquiriesPending()) {
      console.log('🚫 Mobile: Showing pending enquiry modal');
      onShowPendingEnquiryModal();
      return;
    }
    
    if (!isFromDashboard && (buttonState.requiresDate || !selectedDate)) {
      setIsModalOpen(true);
      return;
    }
    
    setIsModalOpen(false);
    onAddToPlan();
  };

  const handleAddToPlan = () => {
    if (hasEnquiriesPending && hasEnquiriesPending()) {
      setIsModalOpen(false);
      onShowPendingEnquiryModal();
      return;
    }
    
    setIsModalOpen(false);
    onAddToPlan();
  };

  const handleSaveForLater = () => {
    const selectedDateObj = selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null;
    
    onSaveForLater({ 
      package: packageInfo, 
      selectedDate: selectedDateObj,
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

  return (
    <>
      {/* ✅ ENHANCED: Replacement mode banner with better package display */}
   {/* ✅ REPLACEMENT MODE: Styled like regular booking bar */}
{!showAddonModal && !isAddingToPlan && isReplacementMode && (
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
      </button>
    </div>
  </div>
)}

      {/* ✅ NORMAL MODE: Show regular booking bar only */}
      {!showAddonModal && !isAddingToPlan && !isReplacementMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-xs">{packageInfo.name}</p>
                <p className="text-sm text-gray-600">
                  {packageInfo.price ? `£${packageInfo.price}` : 'Select package'} • {packageInfo.duration}
                  {selectedDate && (
                    <span className="ml-2 text-primary-500 font-medium">
                      •  {getSelectedDateDisplay()}
                    </span>
                  )}
                  {isFromDashboard && partyDate && (
                    <span className="ml-2 text-primary-500 font-medium">
                      • {partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                  {typeof buttonState.text === 'string' ? buttonState.text : 'Add to Plan'}
                  {selectedDate && ` (${getSelectedDateDisplay()})`}
                  {isFromDashboard && partyDate && ` (${partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ✅ BOOKING MODAL: Only show in normal mode */}
      {isModalOpen && !isReplacementMode && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-3xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {isFromDashboard ? 'Party Date Calendar' : selectedDate ? 'Change Date' : 'Pick Your Party Date'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              {/* Party date status banner */}
              {isFromDashboard && partyDate && partyDateStatus && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  partyDateStatus === 'available' 
                    ? 'bg-green-50 border-green-200' 
                    : partyDateStatus === 'unavailable' 
                    ? 'bg-red-50 border-red-200'
                    : partyDateStatus === 'busy'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      partyDateStatus === 'available' ? 'bg-green-200' : 
                      partyDateStatus === 'unavailable' ? 'bg-red-200' :
                      partyDateStatus === 'busy' ? 'bg-yellow-200' :
                      'bg-gray-200'
                    }`}>
                      {partyDateStatus === 'available' ? (
                        <Calendar className="w-4 h-4 text-green-700" />
                      ) : (
                        <Info className="w-4 h-4 text-gray-700" />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${
                        partyDateStatus === 'available' ? 'text-green-800' :
                        partyDateStatus === 'unavailable' ? 'text-red-800' :
                        partyDateStatus === 'busy' ? 'text-yellow-800' :
                        'text-gray-800'
                      }`}>
                        Your Party Date: {partyDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <p className={`text-sm ${
                        partyDateStatus === 'available' ? 'text-green-700' :
                        partyDateStatus === 'unavailable' ? 'text-red-700' :
                        partyDateStatus === 'busy' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {partyDateStatus === 'available' && '✅ Available for booking!'}
                        {partyDateStatus === 'unavailable' && '❌ Not available on this date'}
                        {partyDateStatus === 'busy' && '⚠️ Already booked on this date'}
                        {partyDateStatus === 'closed' && '🚫 Supplier is closed on this date'}
                        {partyDateStatus === 'past' && '📅 This date has passed'}
                        {partyDateStatus === 'outside-window' && '📋 Outside booking window'}
                      </p>
                      {isFromDashboard && (
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Date set in your party plan
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
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
              <div className="grid grid-cols-7 gap-1 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 p-3 text-sm">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`text-center p-3 rounded-lg text-sm font-medium transition-colors border ${getDayStyle(day)} relative`}
                    disabled={day.status !== 'available' || !day.isCurrentMonth || isFromDashboard || day.isPartyDay}
                    title={day.isPartyDay ? `Your Party Date - ${day.status.replace("-", " ")}` : day.status.replace("-", " ")}
                  >
                    {day.day}
                    {day.isPartyDay && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900">Legend:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {isFromDashboard && (
                    <div className="flex items-center gap-2 col-span-2">
                      <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 relative">
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-600">Your Party Date</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-gray-600">Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-gray-600">Busy/Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                    <span className="text-gray-600">Day Off</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleAddToPlan}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  disabled={!isFromDashboard && !selectedDate}
                >
                  <Plus className="w-5 h-5" />
                  Add to Plan{' '}
                  {!isFromDashboard && selectedDate && `(${getSelectedDateDisplay()})`}
                  {isFromDashboard && partyDate && `(${partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                </button>
                <button 
                  onClick={handleSaveForLater}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Save for Later
                </button>
              </div>
            </div>
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