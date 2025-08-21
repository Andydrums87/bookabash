// components/supplier/hooks/useSupplierAvailability.js
"use client"

import { useState, useCallback, useMemo } from 'react'

export const useSupplierAvailability = (supplier) => {
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)

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
  
  const isFromDashboard = useCallback(() => {
    // You can pass navigationContext as a parameter if needed
    return hasPartyDate()
  }, [hasPartyDate])

  // Get selected calendar date as string
  const getSelectedCalendarDate = useCallback(() => {
    if (!selectedDate || !currentMonth) {
      return null
    }
    
    try {
      // Create the date object with local timezone (no UTC conversion)
      const selectedDateObj = new Date(
        currentMonth.getFullYear(), 
        currentMonth.getMonth(), 
        selectedDate
      )
      
      // Use local date methods instead of toISOString() to avoid timezone issues
      const year = selectedDateObj.getFullYear()
      const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0') // +1 because getMonth() is 0-based
      const day = String(selectedDateObj.getDate()).padStart(2, '0')
      
      // Format as YYYY-MM-DD using local date components
      const dateString = `${year}-${month}-${day}`
      console.log('📅 Generated calendar date string:', dateString)
      return dateString
    } catch (error) {
      console.error('❌ Error generating calendar date:', error)
      return null
    }
  }, [selectedDate, currentMonth])

  // Check if supplier is available on a specific date
  const checkSupplierAvailability = useCallback((dateToCheck) => {
    if (!supplier || !dateToCheck) {
      console.log('❌ No supplier or date to check')
      return true
    }
    
    try {
      // Parse the date we're checking (user's party date)
      const checkDate = new Date(dateToCheck + 'T12:00:00') // Add noon to avoid timezone edge cases
      if (isNaN(checkDate.getTime())) {
        console.log('❌ Invalid date to check:', dateToCheck)
        return true
      }
      
      console.log('🔍 Parsed check date:', checkDate)
      console.log('🔍 Check date in London timezone:', checkDate.toLocaleDateString('en-GB'))
      
      // Check unavailable dates with timezone awareness
      if (supplier.unavailableDates && supplier.unavailableDates.length > 0) {
        console.log('🔍 Checking against unavailable dates...')
        
        const isUnavailable = supplier.unavailableDates.some((unavailableDate, index) => {
          console.log(`🔍 [${index}] Checking unavailable date:`, unavailableDate)
          
          try {
            // Parse the database timestamp
            const unavailableDateTime = new Date(unavailableDate)
            
            if (isNaN(unavailableDateTime.getTime())) {
              console.log(`❌ [${index}] Invalid unavailable date format:`, unavailableDate)
              return false
            }
            
            // Convert both dates to local date strings for comparison
            const checkDateString = checkDate.toLocaleDateString('en-GB') // DD/MM/YYYY
            const unavailableDateString = unavailableDateTime.toLocaleDateString('en-GB') // DD/MM/YYYY
            
            console.log(`🔍 [${index}] Comparing local dates:`)
            console.log(`🔍 [${index}]   Check date: ${checkDateString}`)
            console.log(`🔍 [${index}]   Unavailable: ${unavailableDateString}`)
            
            const isSameDate = checkDateString === unavailableDateString
            
            if (isSameDate) {
              console.log(`❌ [${index}] MATCH FOUND! ${unavailableDate} matches ${dateToCheck}`)
              console.log(`❌ [${index}] Database timestamp ${unavailableDate} = ${unavailableDateString} in London time`)
            }
            
            return isSameDate
          } catch (error) {
            console.log(`❌ [${index}] Error parsing unavailable date:`, unavailableDate, error)
            return false
          }
        })
        
        console.log(`🔍 Final unavailable check result: ${isUnavailable}`)
        
        if (isUnavailable) {
          console.log(`❌ Supplier ${supplier.name} is UNAVAILABLE on ${dateToCheck}`)
          return false
        }
      }
      
      // Check working hours
      const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      console.log(`🔍 Day of week: ${dayOfWeek}`)
      
      if (supplier.workingHours && supplier.workingHours[dayOfWeek]) {
        const workingDay = supplier.workingHours[dayOfWeek]
        if (!workingDay.active || workingDay.active === false) {
          console.log(`❌ Supplier ${supplier.name} is not working on ${dayOfWeek}`)
          return false
        }
      }
      
      // Check busy dates (similar timezone handling)
      if (supplier.busyDates && supplier.busyDates.length > 0) {
        const isBusy = supplier.busyDates.some(busyDate => {
          try {
            const busyDateTime = new Date(busyDate)
            const checkDateString = checkDate.toLocaleDateString('en-GB')
            const busyDateString = busyDateTime.toLocaleDateString('en-GB')
            return checkDateString === busyDateString
          } catch (error) {
            console.log('❌ Error parsing busy date:', busyDate, error)
            return false
          }
        })
        
        if (isBusy) {
          console.log(`⚠️ Supplier ${supplier.name} is busy on ${dateToCheck} but might still be available`)
          return true // Treat busy as available for now
        }
      }
      
      console.log(`✅ Supplier ${supplier.name} is AVAILABLE on ${dateToCheck}`)
      return true
      
    } catch (error) {
      console.error('❌ Error checking supplier availability:', error)
      return true // Default to available on error
    }
  }, [supplier])

  // Advanced date helpers for calendar components
  const isDateUnavailable = useCallback((date, supplierData = supplier) => {
    if (!supplierData?.unavailableDates) return false
    return supplierData.unavailableDates.some(
      (unavailableDate) => new Date(unavailableDate).toDateString() === date.toDateString(),
    )
  }, [supplier])

  const isDateBusy = useCallback((date, supplierData = supplier) => {
    if (!supplierData?.busyDates) return false
    return supplierData.busyDates.some((busyDate) => new Date(busyDate).toDateString() === date.toDateString())
  }, [supplier])

  const isDayAvailable = useCallback((date, supplierData = supplier) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    return supplierData?.workingHours?.[dayName]?.active || false
  }, [supplier])

  const getDateStatus = useCallback((date, supplierData = supplier) => {
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
  }, [supplier, isDateUnavailable, isDateBusy, isDayAvailable])

  // Calendar generation helpers
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
      const status = getDateStatus(date, supplier);
      
      // Check if this is the user's party date
      const partyDate = getPartyDate();
      const isPartyDay = partyDate ? date.toDateString() === partyDate.toDateString() : false;
      
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
  }, [currentMonth, selectedDate, isFromDashboard, getDateStatus, supplier, getPartyDate]);

  // Calendar navigation
  const nextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }, [currentMonth]);

  const prevMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }, [currentMonth]);

  // Get styling for calendar days
  const getDayStyle = useCallback((day) => {
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
        return isFromDashboard() 
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
  }, [isFromDashboard]);

  // Handle date selection
  const handleDateClick = useCallback((day) => {
    if (day.status !== 'available' || !day.isCurrentMonth || isFromDashboard() || day.isPartyDay) return;
    setSelectedDate(day.day);
  }, [isFromDashboard]);

  // Get display string for selected date
  const getSelectedDateDisplay = useCallback(() => {
    if (!selectedDate) {
      return null;
    }
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedDate, currentMonth]);

  // Calendar data for components
  const calendarData = useMemo(() => ({
    days: generateCalendarDays(),
    monthNames: ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"],
    currentMonthName: currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }), [generateCalendarDays, currentMonth]);

  return {
    // State
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    
    // Party date helpers
    hasPartyDate,
    getPartyDate,
    isFromDashboard,
    
    // Calendar helpers
    getSelectedCalendarDate,
    getSelectedDateDisplay,
    
    // Availability checking
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
    handleDateClick
  }
}