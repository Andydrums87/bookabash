import React, { useState } from 'react';
import {
  Calendar,
  Star,
  Heart,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const MobileBookingBar = ({ 
  selectedPackage = null, 
  supplier = null,
  onAddToPlan = () => {}, 
  onSaveForLater = () => {},
  addToPlanButtonState = null, // NEW: Get button state from parent
  selectedDate = null, // NEW: Get selected date from parent calendar
  currentMonth = new Date(), // NEW: Get current month from parent
  setSelectedDate = () => {}, // NEW: Function to update parent's selected date
  setCurrentMonth = () => {} // NEW: Function to update parent's current month
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const isSelected = selectedDate && date.getDate() === selectedDate && isCurrentMonth;
      
      const status = getDateStatus(date, supplier);
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
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
    if (day.isSelected) return 'bg-primary-500 text-white border-primary-500';
    
    switch (day.status) {
      case "available":
        return 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer border-green-300';
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
    if (day.status !== 'available' || !day.isCurrentMonth) return;
    setSelectedDate(day.day); // Update parent's selected date
  };

  // NEW: Use the same button logic as desktop
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
    
    if (!selectedDate) {
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
      text: "Add to Plan"
    };
  };

  const buttonState = getButtonState();

  const handleMainButtonClick = () => {
    if (buttonState.requiresDate || !selectedDate) {
      // Open modal to pick date
      setIsModalOpen(true);
      return;
    }
    
    // Proceed with adding to plan
    handleAddToPlan();
  };

  const handleAddToPlan = () => {
    onAddToPlan({ 
      package: packageInfo, 
      selectedDate: selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null,
      timestamp: new Date() 
    });
    setIsModalOpen(false);
  };

  const handleSaveForLater = () => {
    onSaveForLater({ 
      package: packageInfo, 
      selectedDate: selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null,
      timestamp: new Date() 
    });
    setIsModalOpen(false);
  };

  // Format selected date for display
  const getSelectedDateDisplay = () => {
    if (!selectedDate) return null;
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Sticky Bottom Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900 text-xs">{packageInfo.name}</p>
              <p className="text-sm text-gray-600 text-xs">
                {packageInfo.price ? `£${packageInfo.price}` : 'Select package'} • {packageInfo.duration}
                {selectedDate && (
                  <span className="ml-2 text-green-600">
                    • {getSelectedDateDisplay()}
                  </span>
                )}
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`text-xs font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center gap-2 ${
                selectedDate 
                  ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {selectedDate ? 'Change Date' : 'Check Dates'}
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
                {selectedDate ? `${buttonState.text} (${getSelectedDateDisplay()})` : buttonState.text}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-3xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDate ? 'Change Date' : 'Pick Your Party Date'}
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
                    className={`text-center p-3 rounded-lg text-sm font-medium transition-colors border ${getDayStyle(day)}`}
                    disabled={day.status !== 'available' || !day.isCurrentMonth}
                    title={day.status.replace("-", " ")}
                  >
                    {day.day}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900">Legend:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
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

              {/* Selected Date Info */}
              {selectedDate && (
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
                  disabled={!selectedDate}
                >
                  <Plus className="w-5 h-5" />
                  Add to Plan {selectedDate && `(${getSelectedDateDisplay()})`}
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