// hooks/useSupplierAvailability.js - FIXED VERSION
"use client"

import { useState, useCallback, useMemo } from 'react'
import { 
  dateToLocalString, 
  stringToLocalDate, 
  getDateStringForComparison,
  parseSupplierDate,
  migrateDateArray,
  isSameDay,
  addDays,
  formatDate
} from '@/utils/dateHelpers' // Import the centralized helpers

// Time slot definitions - matching the calendar
const TIME_SLOTS = {
  morning: {
    id: 'morning',
    label: 'Morning',
    defaultStart: '09:00',
    defaultEnd: '13:00',
    displayTime: '9am - 1pm'
  },
  afternoon: {
    id: 'afternoon', 
    label: 'Afternoon',
    defaultStart: '13:00',
    defaultEnd: '17:00',
    displayTime: '1pm - 5pm'
  }
}

export const useSupplierAvailability = (supplier) => {
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  // Migration helper for legacy supplier data
  const getSupplierWithTimeSlots = useCallback((supplierData) => {
    if (!supplierData) return null
    
    // If already has time slots, return as-is
    if (supplierData.workingHours?.Monday?.timeSlots) {
      return supplierData
    }
    
    // Migrate legacy data on-the-fly for display
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
    
    // FIXED: Migrate unavailable dates using centralized helper
    if (supplierData.unavailableDates && Array.isArray(supplierData.unavailableDates)) {
      migrated.unavailableDates = migrateDateArray(supplierData.unavailableDates)
    }
    
    // FIXED: Migrate busy dates using centralized helper
    if (supplierData.busyDates && Array.isArray(supplierData.busyDates)) {
      migrated.busyDates = migrateDateArray(supplierData.busyDates)
    }
    
    return migrated
  }, [])

  const migratedSupplier = useMemo(() => getSupplierWithTimeSlots(supplier), [supplier, getSupplierWithTimeSlots])

  // FIXED: Check if a specific time slot is available on a date
  const isTimeSlotAvailable = useCallback((date, timeSlot) => {
    console.log('🔍 === TIME SLOT CHECK START ===')
    console.log('🔍 Checking date:', date)
    console.log('🔍 Checking time slot:', timeSlot)
    
    if (!migratedSupplier || !date || !timeSlot) {
      console.log('❌ Missing required data for time slot check')
      return false
    }
    
    try {
      // FIXED: Use centralized date handling
      let checkDate = parseSupplierDate(date)
      if (!checkDate) {
        console.log('❌ Could not parse date:', date)
        return false
      }
      
      const dateString = dateToLocalString(checkDate)
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
      
      console.log('🔍 Final date string for comparison:', dateString)
      console.log('🔍 Day name:', dayName)
      console.log('🔍 Local date:', checkDate.toLocaleDateString('en-GB'))
      
      // Check working hours
      const workingDay = migratedSupplier.workingHours?.[dayName]
      console.log('🔍 Working day data:', workingDay)
      
      if (!workingDay?.active) {
        console.log('❌ Day not active')
        return false
      }
      
      if (!workingDay.timeSlots?.[timeSlot]?.available) {
        console.log(`❌ Time slot ${timeSlot} not available in working hours`)
        console.log('🔍 Available time slots for this day:', workingDay.timeSlots)
        return false
      }
      
      console.log(`✅ Time slot ${timeSlot} is available in working hours`)
      
      // FIXED: Check unavailable dates with consistent date comparison
      console.log('🔍 Checking unavailable dates:', migratedSupplier.unavailableDates)
      const unavailableDate = migratedSupplier.unavailableDates?.find(ud => {
        const udDate = getDateStringForComparison(ud.date || ud)
        console.log('🔍 Comparing unavailable date:', udDate, 'with', dateString)
        return udDate === dateString
      })
      
      if (unavailableDate) {
        console.log('🔍 Found unavailable date entry:', unavailableDate)
        if (typeof unavailableDate === 'string') {
          console.log('❌ Legacy format - entire day unavailable')
          return false // Legacy: entire day
        }
        if (unavailableDate.timeSlots?.includes(timeSlot)) {
          console.log(`❌ Time slot ${timeSlot} is in unavailable list:`, unavailableDate.timeSlots)
          return false
        }
        console.log(`✅ Time slot ${timeSlot} not in unavailable list:`, unavailableDate.timeSlots)
      } else {
        console.log('✅ No unavailable date entry found for', dateString)
      }
      
      // FIXED: Check busy dates with consistent date comparison
      console.log('🔍 Checking busy dates:', migratedSupplier.busyDates)
      const busyDate = migratedSupplier.busyDates?.find(bd => {
        const bdDate = getDateStringForComparison(bd.date || bd)
        console.log('🔍 Comparing busy date:', bdDate, 'with', dateString)
        return bdDate === dateString
      })
      
      if (busyDate) {
        console.log('🔍 Found busy date entry:', busyDate)
        if (typeof busyDate === 'string') {
          console.log('❌ Legacy format - entire day busy')
          return false // Legacy: entire day
        }
        if (busyDate.timeSlots?.includes(timeSlot)) {
          console.log(`❌ Time slot ${timeSlot} is in busy list:`, busyDate.timeSlots)
          return false
        }
        console.log(`✅ Time slot ${timeSlot} not in busy list:`, busyDate.timeSlots)
      } else {
        console.log('✅ No busy date entry found for', dateString)
      }
      
      console.log(`✅ Time slot ${timeSlot} is AVAILABLE for ${dateString}`)
      console.log('🔍 === TIME SLOT CHECK END ===')
      return true
    } catch (error) {
      console.error('❌ Error checking time slot availability:', error)
      return false
    }
  }, [migratedSupplier])

  // Get available time slots for a date
  const getAvailableTimeSlots = useCallback((date) => {
    return Object.keys(TIME_SLOTS).filter(slot => 
      slot !== 'allday' && isTimeSlotAvailable(date, slot)
    )
  }, [isTimeSlotAvailable])

  // Helper functions for party date from localStorage
  const hasPartyDate = useCallback(() => {
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (!partyDetails) return false
      const parsed = JSON.parse(partyDetails)
      return !!(parsed.date)
    } catch (error) {
      return false
    }
  }, [])
  
  const getPartyDate = useCallback(() => {
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (!partyDetails) return null
      const parsed = JSON.parse(partyDetails)
      return parsed.date ? new Date(parsed.date) : null
    } catch (error) {
      return null
    }
  }, [])

  // Get party time slot from localStorage
  const getPartyTimeSlot = useCallback(() => {
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (!partyDetails) return null
      const parsed = JSON.parse(partyDetails)
      return parsed.timeSlot || null
    } catch (error) {
      return null
    }
  }, [])
  
  const isFromDashboard = useCallback(() => {
    return hasPartyDate()
  }, [hasPartyDate])

  // FIXED: Enhanced availability check with time slot support
  const checkSupplierAvailability = useCallback((dateToCheck, timeSlotToCheck = null) => {
    // Always return a valid object structure
    const defaultResult = { available: true, timeSlots: [], allSlots: Object.keys(TIME_SLOTS) }
    
    if (!migratedSupplier || !dateToCheck) {
      console.log('❌ No supplier or date to check')
      return defaultResult
    }
    
    try {
      // FIXED: Parse the date we're checking using centralized helper
      const checkDate = parseSupplierDate(dateToCheck)
      if (!checkDate) {
        console.log('❌ Invalid date to check:', dateToCheck)
        return defaultResult
      }
      
      console.log('🔍 Checking availability for:', formatDate(checkDate))
      console.log('🔍 Requested time slot:', timeSlotToCheck)
      
      // Determine the required time slot from party time if not specified
      if (!timeSlotToCheck) {
        try {
          const partyDetails = localStorage.getItem('party_details')
          if (partyDetails) {
            const parsed = JSON.parse(partyDetails)
            if (parsed.time) {
              const timeStr = parsed.time.toLowerCase()
              if (timeStr.includes('am') || timeStr.startsWith('9') || timeStr.startsWith('10') || timeStr.startsWith('11') || timeStr.startsWith('12')) {
                timeSlotToCheck = 'morning'
              } else if (timeStr.includes('pm') || timeStr.includes('2') || timeStr.includes('3') || timeStr.includes('4') || timeStr.includes('5')) {
                timeSlotToCheck = 'afternoon'
              }
            }
            if (parsed.timeSlot) {
              timeSlotToCheck = parsed.timeSlot
            }
          }
        } catch (error) {
          console.log('Could not determine time slot from party details')
        }
      }
      
      console.log('🔍 Final time slot to check:', timeSlotToCheck)
      
      // If specific time slot requested, check that slot
      if (timeSlotToCheck) {
        const isSlotAvailable = isTimeSlotAvailable(checkDate, timeSlotToCheck)
        console.log(`🔍 Time slot ${timeSlotToCheck} availability:`, isSlotAvailable)
        
        return { 
          available: isSlotAvailable, 
          timeSlots: isSlotAvailable ? [timeSlotToCheck] : [],
          checkedTimeSlot: timeSlotToCheck,
          allSlots: Object.keys(TIME_SLOTS),
          requestedSlot: timeSlotToCheck
        }
      }
      
      // Check all time slots (fallback when no specific slot requested)
      const availableSlots = getAvailableTimeSlots(checkDate)
      console.log('🔍 Available time slots:', availableSlots)
      
      return {
        available: availableSlots.length > 0,
        timeSlots: availableSlots,
        allSlots: Object.keys(TIME_SLOTS)
      }
      
    } catch (error) {
      console.error('❌ Error checking supplier availability:', error)
      return defaultResult
    }
  }, [migratedSupplier, isTimeSlotAvailable, getAvailableTimeSlots])

  // FIXED: Get selected calendar date as string
  const getSelectedCalendarDate = useCallback(() => {
    if (!selectedDate || !currentMonth) {
      return null
    }
    
    try {
      // Create the date object with local timezone
      const selectedDateObj = new Date(
        currentMonth.getFullYear(), 
        currentMonth.getMonth(), 
        selectedDate
      )
      
      // FIXED: Use centralized date helper
      const dateString = dateToLocalString(selectedDateObj)
      console.log('📅 Generated calendar date string:', dateString)
      return dateString
    } catch (error) {
      console.error('❌ Error generating calendar date:', error)
      return null
    }
  }, [selectedDate, currentMonth])

  // Enhanced date status with time slot consideration
  const getDateStatus = useCallback((date, supplierData = migratedSupplier) => {
    if (!supplierData) return "unknown"
    
    try {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkDate < today) return "past"
      
      // Check advance booking
      const advanceDays = supplierData.advanceBookingDays || 0
      if (advanceDays > 0) {
        const minBookingDate = new Date(today)
        minBookingDate.setDate(today.getDate() + advanceDays)
        minBookingDate.setHours(0, 0, 0, 0)
        
        if (checkDate < minBookingDate) return "outside-window"
      }
      
      // Check maximum booking window
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
  }, [migratedSupplier, getAvailableTimeSlots])

  // FIXED: Legacy availability functions (updated to work with migrated data)
  const isDateUnavailable = useCallback((date, supplierData = migratedSupplier) => {
    if (!supplierData?.unavailableDates) return false
    
    const checkDateString = dateToLocalString(date)
    
    return supplierData.unavailableDates.some((unavailableDate) => {
      const dateToCheck = getDateStringForComparison(unavailableDate.date || unavailableDate)
      return dateToCheck === checkDateString
    })
  }, [migratedSupplier])

  const isDateBusy = useCallback((date, supplierData = migratedSupplier) => {
    if (!supplierData?.busyDates) return false
    
    const checkDateString = dateToLocalString(date)
    
    return supplierData.busyDates.some((busyDate) => {
      const dateToCheck = getDateStringForComparison(busyDate.date || busyDate)
      return dateToCheck === checkDateString
    })
  }, [migratedSupplier])

  const isDayAvailable = useCallback((date, supplierData = migratedSupplier) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    
    // Check if day is active
    if (supplierData?.workingHours?.[dayName]?.active === false) return false
    
    // Check if any time slots are available
    const availableSlots = getAvailableTimeSlots(date)
    return availableSlots.length > 0
  }, [migratedSupplier, getAvailableTimeSlots])

  // Calendar generation with time slot support
  const generateCalendarDays = useCallback((month = currentMonth) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === monthIndex;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.getDate() === selectedDate && isCurrentMonth && !isFromDashboard();
      const status = getDateStatus(date, migratedSupplier);
      const availableSlots = getAvailableTimeSlots(date);
      
      // Check if this is the user's party date
      const partyDate = getPartyDate();
      const isPartyDay = partyDate ? isSameDay(date, partyDate) : false;
      
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
  }, [currentMonth, selectedDate, isFromDashboard, getDateStatus, migratedSupplier, getAvailableTimeSlots, getPartyDate])

  // Calendar navigation
  const nextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }, [currentMonth]);

  const prevMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }, [currentMonth]);

  // Get styling for calendar days with time slot awareness
  const getDayStyle = useCallback((day) => {
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
        return isFromDashboard() 
          ? 'bg-green-50 text-green-700 cursor-default border-green-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer border-green-300';
      case "partially-available":
        return isFromDashboard()
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
  }, [isFromDashboard]);

  // Handle date selection with time slot consideration
  const handleDateClick = useCallback((day) => {
    if (day.status !== 'available' && day.status !== 'partially-available') return;
    if (!day.isCurrentMonth || isFromDashboard() || day.isPartyDay) return;
    
    const availableSlots = day.availableSlots || getAvailableTimeSlots(day.date);
    
    if (availableSlots.length === 0) return;
    
    // Set the selected date
    setSelectedDate(day.day);
    
    // Auto-select time slot if only one available
    if (availableSlots.length === 1) {
      setSelectedTimeSlot(availableSlots[0]);
    } else {
      // Reset time slot selection if multiple available (let user choose)
      setSelectedTimeSlot(null);
    }
  }, [isFromDashboard, getAvailableTimeSlots]);

  // Get display string for selected date
  const getSelectedDateDisplay = useCallback(() => {
    if (!selectedDate) {
      return null;
    }
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedDate, currentMonth]);

  // Get display string for selected time slot
  const getSelectedTimeSlotDisplay = useCallback(() => {
    if (!selectedTimeSlot || !TIME_SLOTS[selectedTimeSlot]) return '';
    return ` (${TIME_SLOTS[selectedTimeSlot].label})`;
  }, [selectedTimeSlot]);

  // Check if current selection (date + time slot) is valid for booking
  const isCurrentSelectionBookable = useCallback(() => {
    if (!selectedDate || !currentMonth) return false;
    
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    const status = getDateStatus(selectedDateObj);
    
    // Must be available or partially available
    if (status !== 'available' && status !== 'partially-available') return false;
    
    // If partially available, must have a time slot selected
    if (status === 'partially-available' && !selectedTimeSlot) return false;
    
    // If time slot is selected, verify it's actually available
    if (selectedTimeSlot) {
      return isTimeSlotAvailable(selectedDateObj, selectedTimeSlot);
    }
    
    // For fully available dates, time slot selection is optional
    return true;
  }, [selectedDate, currentMonth, selectedTimeSlot, getDateStatus, isTimeSlotAvailable]);

  // Calendar data for components
  const calendarData = useMemo(() => ({
    days: generateCalendarDays(),
    monthNames: ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"],
    currentMonthName: currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }), [generateCalendarDays, currentMonth]);

  // Validate if booking is possible with current selection
  const validateBookingAvailability = useCallback(() => {
    if (!selectedDate || !currentMonth) {
      return { canBook: false, reason: 'no-date-selected' }
    }
    
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
    const dateString = dateToLocalString(selectedDateObj) // FIXED: Use centralized helper
    
    let requiredTimeSlot = selectedTimeSlot
    if (!requiredTimeSlot) {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          requiredTimeSlot = parsed.timeSlot
        }
      } catch (error) {
        // Ignore error, continue without time slot requirement
      }
    }
    
    const availabilityResult = checkSupplierAvailability(dateString, requiredTimeSlot)
    
    if (!availabilityResult.available) {
      return {
        canBook: false,
        reason: 'unavailable',
        details: {
          date: dateString,
          timeSlot: requiredTimeSlot,
          availableSlots: availabilityResult.timeSlots
        }
      }
    }
    
    if (availabilityResult.timeSlots.length > 1 && !requiredTimeSlot) {
      return {
        canBook: false,
        reason: 'time-slot-required',
        details: {
          availableSlots: availabilityResult.timeSlots
        }
      }
    }
    
    return { canBook: true, timeSlot: requiredTimeSlot }
  }, [selectedDate, selectedTimeSlot, currentMonth, checkSupplierAvailability])

  return {
    // State
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    
    // Party date helpers
    hasPartyDate,
    getPartyDate,
    getPartyTimeSlot,
    isFromDashboard,
    
    // Calendar helpers
    getSelectedCalendarDate,
    getSelectedDateDisplay,
    getSelectedTimeSlotDisplay,
    
    // Time slot functions
    isTimeSlotAvailable,
    getAvailableTimeSlots,
    isCurrentSelectionBookable,
    validateBookingAvailability,
    
    // Availability checking with time slot support
    checkSupplierAvailability,
    isDateUnavailable,
    isDateBusy,
    isDayAvailable,
    getDateStatus,
    
    // Calendar generation
    generateCalendarDays,
    calendarData,
    
    // Calendar navigation
    nextMonth,
    prevMonth,
    
    // UI helpers
    getDayStyle,
    handleDateClick,
    
    // Migrated supplier data
    migratedSupplier,
    
    // Time slot constants for components
    TIME_SLOTS
  }
}