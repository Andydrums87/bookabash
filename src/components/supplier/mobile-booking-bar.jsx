import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Star,
  Heart,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock
} from "lucide-react";

const MobileBookingBar = ({ 
  selectedPackage = null, 
  supplier = null,
  onAddToPlan = () => {}, 
  onSaveForLater = () => {},
  addToPlanButtonState = null, // Get button state from parent
  selectedDate = null, // Get selected date from parent calendar
  currentMonth = new Date(), // Get current month from parent
  setSelectedDate = () => {}, // Function to update parent's selected date
  setCurrentMonth = () => {}, // Function to update parent's current month
  hasValidPartyPlan = () => false, // Party plan validation function
  isFromDashboard = false, // Dashboard context
  partyDate = null, // Party date if available
  // NEW: Add props to detect when addon modal is open
  showAddonModal = false,
  isAddingToPlan = false, // To hide when adding to plan



    hasEnquiriesPending = () => false, // Function to check pending enquiries
    onShowPendingEnquiryModal = () => {}, // Function to show the modal
    pendingCount = 0, // Number of pending enquiries
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use a ref to track if we've already set the initial month (like desktop)
  const hasSetInitialMonth = useRef(false);

  // Set initial month to party date if coming from dashboard - COPIED FROM DESKTOP
  useEffect(() => {
    // Only run this effect once when component mounts and we have a party date
    if (isFromDashboard && partyDate && !hasSetInitialMonth.current) {
      const partyYear = partyDate.getFullYear()
      const partyMonth = partyDate.getMonth()
      const currentYear = currentMonth.getFullYear()
      const currentMonthIndex = currentMonth.getMonth()
      
      // Only update if the current month is different from the party date month
      if (partyYear !== currentYear || partyMonth !== currentMonthIndex) {
        setCurrentMonth(new Date(partyYear, partyMonth, 1))
      }
      
      // Mark that we've set the initial month
      hasSetInitialMonth.current = true
    }
  }, [isFromDashboard, partyDate]) // Remove setCurrentMonth and currentMonth from dependencies

  // Default package if none provided
  const packageInfo = selectedPackage || {
    name: "Select Package",
    price: 0,
    duration: "Various options",
    description: "Choose a package to continue",
    features: []
  };

  // Use the exact same availability logic from desktop calendar
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

  // NEW: Memoize the party date string to avoid recalculation (COPIED FROM DESKTOP)
  const partyDateString = useMemo(() => {
    return partyDate ? partyDate.toDateString() : null
  }, [partyDate])

  // NEW: Check if date is the party date - use memoized string comparison (COPIED FROM DESKTOP)
  const isPartyDate = (date) => {
    if (!partyDateString) return false
    return date.toDateString() === partyDateString
  }

  // NEW: Memoize party date status to avoid recalculation (COPIED FROM DESKTOP)
  const partyDateStatus = useMemo(() => {
    return partyDate ? getDateStatus(partyDate, supplier) : null
  }, [partyDate, supplier])

  // Calendar generation with exact same logic as desktop
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
      // FIX: Check if this date matches the selected date (comparing day numbers within current month)
      const isSelected = selectedDate && date.getDate() === selectedDate && isCurrentMonth && !isFromDashboard; // Don't show selected on dashboard
      
      const status = getDateStatus(date, supplier);
      const isPartyDay = isPartyDate(date); // NEW: Check if this is the party date
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPartyDay, // NEW: Add party day flag
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
    
    // NEW: Special styling for party date (COPIED FROM DESKTOP)
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
    // NEW: Don't allow date selection on dashboard or for party dates
    if (day.status !== 'available' || !day.isCurrentMonth || isFromDashboard || day.isPartyDay) return;
    setSelectedDate(day.day); // Update parent's selected date
  };

  // NEW: Use the same button logic as desktop with party plan validation
  const getButtonState = () => {
    if (addToPlanButtonState) return addToPlanButtonState;
    
    // Fallback logic if no button state provided
    if (!selectedPackage?.price) {
      return {
        disabled: true,
        className: "bg-gray-300 text-gray-500 cursor-not-allowed",
        text: "Select a Package"
      };
    }
    
    // NEW: Check party plan validation like desktop
    const hasPartyPlan = hasValidPartyPlan()
    
    if (!hasPartyPlan && !selectedDate) {
      return {
        disabled: false,
        className: "bg-orange-500 hover:bg-orange-600 text-white transition-colors",
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
    console.log('🔘 Mobile button clicked:', {
      buttonState,
      selectedDate,
      isFromDashboard,
      partyDate,
      requiresDate: buttonState.requiresDate,
      hasValidPartyPlan: hasValidPartyPlan ? hasValidPartyPlan() : 'No function',
      selectedPackage: selectedPackage?.name,
      supplier: supplier?.name,
      supplierCategory: supplier?.category
    });
    
    // NEW: Check for pending enquiries first
    if (hasEnquiriesPending && hasEnquiriesPending()) {
      console.log('🚫 Mobile: Showing pending enquiry modal');
      onShowPendingEnquiryModal();
      return;
    }
    
    // For non-dashboard users, check if date selection is needed first
    if (!isFromDashboard && (buttonState.requiresDate || !selectedDate)) {
      console.log('📅 Opening modal for date selection');
      setIsModalOpen(true);
      return;
    }
    
    // Close any open modals first
    setIsModalOpen(false);
    
    // Call parent's handleAddToPlan function directly (like desktop does)
    console.log('🚀 Calling parent handleAddToPlan directly');
    console.log('📦 Package info being used:', packageInfo);
    
    // The parent's handleAddToPlan will handle date logic and addon checks
    onAddToPlan(); // Call without parameters - let parent handle everything
  };

  const handleAddToPlan = () => {
    console.log('📱 Mobile handleAddToPlan called - calling parent directly');
    
    // NEW: Check for pending enquiries first (also in modal context)
    if (hasEnquiriesPending && hasEnquiriesPending()) {
      console.log('🚫 Mobile modal: Showing pending enquiry modal');
      setIsModalOpen(false); // Close current modal
      onShowPendingEnquiryModal(); // Show pending enquiry modal
      return;
    }
    
    // Close modal and call parent's handleAddToPlan function
    setIsModalOpen(false);
    onAddToPlan(); // Call parent's handleAddToPlan directly without parameters
  };
  const handleSaveForLater = () => {
    // FIX: Create proper Date object from selectedDate and currentMonth
    const selectedDateObj = selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null;
    
    onSaveForLater({ 
      package: packageInfo, 
      selectedDate: selectedDateObj,
      timestamp: new Date() 
    });
    setIsModalOpen(false);
  };

  // Format selected date for display
  const getSelectedDateDisplay = () => {
    if (!selectedDate) {
      console.log('❌ No selected date for display');
      return null;
    }
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    console.log('✅ Displaying selected date:', dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Sticky Bottom Bar - Mobile Only - Hide when addon modal is open or adding to plan */}
      {!showAddonModal && !isAddingToPlan && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-xs">{packageInfo.name}</p>
                <p className="text-sm text-gray-600 text-xs">
                  {packageInfo.price ? `£${packageInfo.price}` : 'Select package'} • {packageInfo.duration}
                  {selectedDate && (
                    <span className="ml-2 text-green-600 font-medium">
                      • ✅ {getSelectedDateDisplay()}
                    </span>
                  )}
                  {/* NEW: Show party date if from dashboard */}
                  {isFromDashboard && partyDate && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • 🎉 {partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className={`text-xs font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center gap-2 ${
                  selectedDate || (isFromDashboard && partyDate)
                    ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {isFromDashboard ? 'View Calendar' : selectedDate ? 'Change Date' : 'Check Dates'}
              </button>
            </div>
            <button 
              onClick={handleMainButtonClick}
              className={`w-full font-semibold py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${buttonState.className}`}
              disabled={buttonState.disabled}
            >
              {buttonState.requiresDate ? (
                <>
                  <Calendar className="w-5 h-5" />
                  {buttonState.text}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {/* Fix the [object Object] issue by properly handling the text */}
                  {typeof buttonState.text === 'string' ? buttonState.text : 'Add to Plan'}
                  {selectedDate && ` (${getSelectedDateDisplay()})`}
                  {isFromDashboard && partyDate && ` (${partyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
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
              {/* NEW: Party date status banner (COPIED FROM DESKTOP) */}
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
                    {/* NEW: Party date indicator (COPIED FROM DESKTOP) */}
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
                  {/* NEW: Add party date legend item if from dashboard (COPIED FROM DESKTOP) */}
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

              {/* Selected Date Info - only show for browse users */}
              {!isFromDashboard && selectedDate && (
                <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Selected Date</h4>
                  <p className="text-green-800">
                    {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-green-700 mt-1">✅ Available for booking</p>
                </div>
              )}

              {/* Package Summary */}
              <div className="bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{packageInfo.name}</h4>
                    <p className="text-sm text-gray-600">{packageInfo.description}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">Package Price</span>
                    <span className="font-bold text-primary-600">£{packageInfo.price}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 Duration: {packageInfo.duration}</p>
                    {packageInfo.features && packageInfo.features.slice(0, 2).map((feature, index) => (
                      <p key={index}>• {feature}</p>
                    ))}
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
                  {/* Fix the [object Object] issue by properly handling the text */}
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

      {/* Add bottom padding to page content to prevent overlap */}
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