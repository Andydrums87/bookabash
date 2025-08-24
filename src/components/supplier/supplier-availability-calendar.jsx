"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Lock, Info, Clock, Sun, Moon } from "lucide-react"
import { useEffect, useRef, useMemo, useState } from "react"
import { 
  dateToLocalString, 
  stringToLocalDate, 
  getDateStringForComparison,
  parseSupplierDate,
  migrateDateArray,
  isSameDay,
  formatDate
} from '@/utils/dateHelpers' // Import the centralized helpers

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

export default function SupplierAvailabilityCalendar({
  supplier,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  isFromDashboard = false,
  partyDate = null,
  partyTimeSlot = null,
  readOnly = false,
  onTimeSlotSelect,
  showTimeSlotSelection = true
}) {

  const [showingTimeSlots, setShowingTimeSlots] = useState(false)
  const [selectedDateForSlots, setSelectedDateForSlots] = useState(null)
  const hasSetInitialMonth = useRef(false)

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

  // Migration helper for legacy supplier data
  const getSupplierWithTimeSlots = (supplierData) => {
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
  }

  const migratedSupplier = useMemo(() => getSupplierWithTimeSlots(supplier), [supplier])

  const isTimeSlotAvailable = (date, timeSlot) => {
    if (!migratedSupplier || !date || !timeSlot) return false
    
    try {
      const checkDate = parseSupplierDate(date)
      if (!checkDate) return false
      
      const dateString = dateToLocalString(checkDate)
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
      
      console.log(`🔍 CALENDAR: Checking time slot availability for ${dateString} (${dayName}) - ${timeSlot}`)
      
      // CRITICAL FIX: Check if working hours exist at all
      if (!migratedSupplier.workingHours || Object.keys(migratedSupplier.workingHours).length === 0) {
        console.log(`✅ CALENDAR: No working hours configured - defaulting to AVAILABLE`)
        return true // DEFAULT TO AVAILABLE when no working hours
      }
      
      // Check working hours
      const workingDay = migratedSupplier.workingHours?.[dayName]
      
      // CRITICAL FIX: Default to available if day not configured
      if (!workingDay) {
        console.log(`✅ CALENDAR: Day ${dayName} not configured - defaulting to AVAILABLE`)
        return true // DEFAULT TO AVAILABLE when day not configured
      }
      
      if (!workingDay.active) {
        console.log(`❌ CALENDAR: Day ${dayName} not active`)
        return false
      }
      
      // CRITICAL FIX: Default to available if time slot not configured
      if (!workingDay.timeSlots || !workingDay.timeSlots[timeSlot]) {
        console.log(`✅ CALENDAR: Time slot ${timeSlot} not configured - defaulting to AVAILABLE`)
        return true // DEFAULT TO AVAILABLE when time slot not configured
      }
      
      if (!workingDay.timeSlots[timeSlot].available) {
        console.log(`❌ CALENDAR: Time slot ${timeSlot} not available in working hours`)
        return false
      }
      
      // Check unavailable dates (your existing logic is fine here)
      const unavailableDate = migratedSupplier.unavailableDates?.find(ud => {
        const udDate = getDateStringForComparison(ud.date || ud)
        const matches = udDate === dateString
        return matches
      })
      
      if (unavailableDate) {
        if (typeof unavailableDate === 'string') {
          return false // Legacy: entire day
        }
        if (unavailableDate.timeSlots?.includes(timeSlot)) {
          return false
        }
      }
      
      // Check busy dates (your existing logic is fine here)
      const busyDate = migratedSupplier.busyDates?.find(bd => {
        const bdDate = getDateStringForComparison(bd.date || bd)
        const matches = bdDate === dateString
        return matches
      })
      
      if (busyDate) {
        if (typeof busyDate === 'string') {
          return false // Legacy: entire day
        }
        if (busyDate.timeSlots?.includes(timeSlot)) {
          return false
        }
      }
      
      console.log(`✅ CALENDAR: Time slot ${timeSlot} is available for ${dateString}`)
      return true
    } catch (error) {
      console.error('❌ CALENDAR: Error checking time slot availability:', error)
      return true // CRITICAL FIX: Default to available on error
    }
  }
  
  // ALSO FIX: Your migration function
  const migrateWorkingHours = (legacyHours) => {
    // CRITICAL FIX: Return default available hours if no hours provided
    if (!legacyHours || Object.keys(legacyHours).length === 0) {
      console.log('⚠️ MIGRATION: No working hours - defaulting to available Monday-Saturday')
      return {
        Monday: getDefaultDaySchedule(true),
        Tuesday: getDefaultDaySchedule(true),
        Wednesday: getDefaultDaySchedule(true),
        Thursday: getDefaultDaySchedule(true),
        Friday: getDefaultDaySchedule(true),
        Saturday: getDefaultDaySchedule(true),
        Sunday: getDefaultDaySchedule(false) // Only Sunday closed by default
      }
    }
    
    // Your existing migration logic for when hours do exist...
    if (legacyHours.Monday?.timeSlots) {
      return legacyHours
    }
    
    const migrated = {}
    Object.entries(legacyHours).forEach(([day, hours]) => {
      if (hours && typeof hours === 'object' && 'active' in hours) {
        migrated[day] = {
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
      } else {
        migrated[day] = getDefaultDaySchedule(true) // Default to available
      }
    })
    
    return migrated
  }

  // Get available time slots for a date
  const getAvailableTimeSlots = (date) => {
    return Object.keys(TIME_SLOTS).filter(slot => 
      slot !== 'allday' && isTimeSlotAvailable(date, slot)
    )
  }

  // Get date status with time slot consideration
  const getDateStatus = (date) => {
    if (!migratedSupplier) return "unknown"
    
    try {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkDate < today) return "past"
      
      // Check advance booking
      const advanceDays = migratedSupplier.advanceBookingDays || 0
      if (advanceDays > 0) {
        const minBookingDate = new Date(today)
        minBookingDate.setDate(today.getDate() + advanceDays)
        minBookingDate.setHours(0, 0, 0, 0)
        
        if (checkDate < minBookingDate) return "outside-window"
      }
      
      // Check maximum booking window
      const maxDays = migratedSupplier.maxBookingDays || 365
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

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const partyDateString = useMemo(() => {
    return partyDate ? partyDate.toDateString() : null
  }, [partyDate])

  const isPartyDate = (date) => {
    if (!partyDateString) return false
    return date.toDateString() === partyDateString
  }

  const getDayStyle = (date, status, isSelected, isCurrentMonth, availableSlots) => {
    if (!isCurrentMonth) return 'text-gray-400 cursor-not-allowed'
    
    if (isPartyDate(date)) {
      const baseStyle = 'border-2 border-blue-500 font-bold relative overflow-hidden'
      
      switch (status) {
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
    
    if (isSelected) return 'bg-primary text-white border-primary'
    
    switch (status) {
      case "available":
        return readOnly 
          ? 'bg-green-50 text-green-700 cursor-default border-green-200'
          : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer border-green-300'
      case "partially-available":
        return readOnly
          ? 'bg-yellow-50 text-yellow-700 cursor-default border-yellow-200'
          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer border-yellow-300'
      case "unavailable":
        return 'bg-red-100 text-red-800 cursor-not-allowed line-through border-red-300'
      case "past":
        return 'text-gray-300 cursor-not-allowed line-through border-gray-200'
      case "outside-window":
        return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200 line-through'
      default:
        return 'text-gray-400 cursor-not-allowed border-gray-200'
    }
  }

  // Handle date click - now considers time slots
  const handleDateClick = (date, day) => {
    console.log('🔍 MODAL DEBUG: Date clicked:', { date, day })
    console.log('🔍 MODAL DEBUG: readOnly:', readOnly)
    console.log('🔍 MODAL DEBUG: isPartyDate:', isPartyDate(date))
    
    if (readOnly || isPartyDate(date)) {
      console.log('❌ MODAL DEBUG: Blocked by readOnly or isPartyDate')
      return
    }
    
    const status = getDateStatus(date)
    console.log('🔍 MODAL DEBUG: Date status:', status)
    
    if (status !== "available" && status !== "partially-available") {
      console.log('❌ MODAL DEBUG: Blocked by status')
      return
    }
    
    const availableSlots = getAvailableTimeSlots(date)
    console.log('🔍 MODAL DEBUG: Available slots:', availableSlots)
    
    if (availableSlots.length === 0) {
      console.log('❌ MODAL DEBUG: No available slots')
      return
    }
    
    // Set the selected date first
    console.log('✅ MODAL DEBUG: Setting selected date to:', day)
    setSelectedDate(day)
    
    // If only one slot available, auto-select it
    if (availableSlots.length === 1) {
      console.log('✅ MODAL DEBUG: Auto-selecting single slot:', availableSlots[0])
      if (setSelectedTimeSlot) {
        setSelectedTimeSlot(availableSlots[0])
      }
      if (onTimeSlotSelect) {
        onTimeSlotSelect(date, availableSlots[0])
      }
      return
    }
    
    // CRITICAL DEBUG: Check showTimeSlotSelection prop
    console.log('🔍 MODAL DEBUG: showTimeSlotSelection prop:', showTimeSlotSelection)
    console.log('🔍 MODAL DEBUG: Multiple slots available:', availableSlots.length)
    
    // If multiple slots and time slot selection is enabled, show picker
    if (showTimeSlotSelection && availableSlots.length > 1) {
      console.log('✅ MODAL DEBUG: Showing time slot picker')
      setSelectedDateForSlots(date)
      setShowingTimeSlots(true)
    } else {
      console.log('⚠️ MODAL DEBUG: Not showing picker - defaulting to afternoon')
      if (setSelectedTimeSlot) {
        setSelectedTimeSlot('afternoon')
      }
    }
  }
  const handleTimeSlotSelection = (timeSlot) => {
    console.log('🕐 MODAL DEBUG: Time slot selected:', timeSlot)
    console.log('🕐 MODAL DEBUG: setSelectedTimeSlot function exists:', !!setSelectedTimeSlot)
    console.log('🕐 MODAL DEBUG: onTimeSlotSelect function exists:', !!onTimeSlotSelect)
    console.log('🕐 MODAL DEBUG: selectedDateForSlots:', selectedDateForSlots)
    
    if (setSelectedTimeSlot) {
      setSelectedTimeSlot(timeSlot)
      console.log('✅ MODAL DEBUG: Set selected time slot to:', timeSlot)
    }
    
    if (onTimeSlotSelect && selectedDateForSlots) {
      onTimeSlotSelect(selectedDateForSlots, timeSlot)
      console.log('✅ MODAL DEBUG: Called onTimeSlotSelect callback')
    }
    
    setShowingTimeSlots(false)
    setSelectedDateForSlots(null)
    console.log('✅ MODAL DEBUG: Closed modal and cleared selectedDateForSlots')
  }
  
  // DEBUGGING: Add this to check modal visibility
  console.log('🔍 MODAL RENDER DEBUG:', {
    showingTimeSlots,
    selectedDateForSlots: !!selectedDateForSlots,
    showTimeSlotSelection,
    modalShouldShow: showingTimeSlots && selectedDateForSlots && showTimeSlotSelection
  })

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayIndex = getFirstDayOfMonth(currentMonth)
    const daysInMonthCount = getDaysInMonth(currentMonth)
    const days = []

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonthCount; day++) {
      const date = new Date(year, month, day)
      const isSelected = selectedDate === day && !isFromDashboard
      const status = getDateStatus(date)
      const isCurrentMonth = true
      const availableSlots = getAvailableTimeSlots(date)
      const styling = getDayStyle(date, status, isSelected, isCurrentMonth, availableSlots)
      const isPartyDay = isPartyDate(date)

      const canClick = !readOnly && 
                      (status === "available" || status === "partially-available") && 
                      !isPartyDay

      days.push(
        <button
          key={day}
          onClick={() => canClick ? handleDateClick(date, day) : null}
          className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 border ${styling} relative`}
          title={
            isPartyDay 
              ? `Your Party Date - ${status.replace("-", " ")}`
              : availableSlots.length > 0
              ? `Available: ${availableSlots.map(s => TIME_SLOTS[s].label).join(', ')}`
              : status.replace("-", " ")
          }
          disabled={!canClick}
        >
          {day}
          
          {/* Party date indicator */}
          {isPartyDay && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
          
          {/* Time slot indicators - show dots for available slots */}
          {!isPartyDay && availableSlots.length > 0 && availableSlots.length < 2 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
              {availableSlots.map(slot => {
                const SlotIcon = TIME_SLOTS[slot].icon
                return (
                  <SlotIcon key={slot} className="w-2 h-2 text-current opacity-70" />
                )
              })}
            </div>
          )}
          
          {/* Show "AM/PM" text for partially available days */}
          {!isPartyDay && status === "partially-available" && availableSlots.length === 1 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">
              {availableSlots[0] === 'morning' ? 'AM' : 'PM'}
            </div>
          )}
        </button>,
      )
    }
    return days
  }, [currentMonth, migratedSupplier, selectedDate, isFromDashboard, readOnly, partyDateString])

  // FIXED: Party date status with proper time slot checking
  const partyDateStatus = useMemo(() => {
    if (!partyDate || !migratedSupplier) return null
    
    // Get party time slot
    let partyTimeSlotToCheck = partyTimeSlot
    
    if (!partyTimeSlotToCheck) {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          partyTimeSlotToCheck = parsed.timeSlot
          
          // Map from party time if timeSlot not explicitly set
          if (!partyTimeSlotToCheck && parsed.time) {
            const timeStr = parsed.time.toLowerCase()
            console.log('🔍 CALENDAR: Mapping party time to slot:', parsed.time)
            
            if (timeStr.includes('am') || 
                timeStr.includes('9') || timeStr.includes('10') || 
                timeStr.includes('11') || timeStr.includes('12')) {
              partyTimeSlotToCheck = 'morning'
            } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                      timeStr.includes('2') || timeStr.includes('3') || 
                      timeStr.includes('4') || timeStr.includes('5')) {
              partyTimeSlotToCheck = 'afternoon'
            }
            
            console.log('🔍 CALENDAR: Mapped party time slot:', partyTimeSlotToCheck)
          }
        }
      } catch (error) {
        console.log('Could not determine party time slot')
      }
    }
    
    // Check if the specific time slot is available
    if (partyTimeSlotToCheck) {
      const isSlotAvailable = isTimeSlotAvailable(partyDate, partyTimeSlotToCheck)
      console.log(`🔍 CALENDAR: Party date ${partyDate.toDateString()} ${partyTimeSlotToCheck} availability:`, isSlotAvailable)
      return isSlotAvailable ? 'available' : 'unavailable'
    }
    
    // Fallback to general date status
    return getDateStatus(partyDate)
  }, [partyDate, partyTimeSlot, migratedSupplier, isTimeSlotAvailable, getDateStatus])

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isFromDashboard ? "Party Date Availability" : "Time Slot Availability"}
          </h2>
          {migratedSupplier?.advanceBookingDays > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Book {migratedSupplier.advanceBookingDays}+ days ahead
            </div>
          )}
        </div>

        {/* Party date status banner with time slot info */}
        {isFromDashboard && partyDate && partyDateStatus && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            partyDateStatus === 'available' || partyDateStatus === 'partially-available'
              ? 'bg-green-50 border-green-200' 
              : partyDateStatus === 'unavailable' 
              ? 'bg-red-50 border-red-200'
              : partyDateStatus === 'busy'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                partyDateStatus === 'available' || partyDateStatus === 'partially-available' ? 'bg-green-200' : 
                partyDateStatus === 'unavailable' ? 'bg-red-200' :
                partyDateStatus === 'busy' ? 'bg-yellow-200' :
                'bg-gray-200'
              }`}>
                {(partyDateStatus === 'available' || partyDateStatus === 'partially-available') ? (
                  <Calendar className="w-4 h-4 text-green-700" />
                ) : (
                  <Info className="w-4 h-4 text-gray-700" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${
                  partyDateStatus === 'available' || partyDateStatus === 'partially-available' ? 'text-green-800' :
                  partyDateStatus === 'unavailable' ? 'text-red-800' :
                  partyDateStatus === 'busy' ? 'text-yellow-800' :
                  'text-gray-800'
                }`}>
                  Your Party Date: {formatDate(partyDate)}
                </h4>
                <p className={`text-sm mb-2 ${
                  partyDateStatus === 'available' || partyDateStatus === 'partially-available' ? 'text-green-700' :
                  partyDateStatus === 'unavailable' ? 'text-red-700' :
                  partyDateStatus === 'busy' ? 'text-yellow-700' :
                  'text-gray-700'
                }`}>
                  {partyDateStatus === 'available' && '✅ Available for booking!'}
                  {partyDateStatus === 'partially-available' && '⚠️ Partially available - some time slots open'}
                  {partyDateStatus === 'unavailable' && '❌ Not available for your party time'}
                  {partyDateStatus === 'busy' && '⚠️ Already booked on this date'}
                  {partyDateStatus === 'closed' && '🚫 Supplier is closed on this date'}
                  {partyDateStatus === 'past' && '📅 This date has passed'}
                  {partyDateStatus === 'outside-window' && '📋 Outside booking window'}
                </p>
                
                {/* Show available time slots for party date */}
                {(partyDateStatus === 'available' || partyDateStatus === 'partially-available') && (
                  <div className="flex gap-2 mt-2">
                    {getAvailableTimeSlots(partyDate).map(slot => {
                      const SlotIcon = TIME_SLOTS[slot].icon;
                      return (
                        <Badge 
                          key={slot} 
                          variant="secondary" 
                          className={`text-xs flex items-center gap-1 ${
                            partyTimeSlot === slot 
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          <SlotIcon className="w-3 h-3" />
                          {TIME_SLOTS[slot].label}
                          {partyTimeSlot === slot && ' (Your Party Time)'}
                        </Badge>
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

        <div className="space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-3 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Legend:</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {isFromDashboard && (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 relative">
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Your Party Date</span>
                </div>
              )}
              {[
                { label: "Fully Available", color: "bg-green-100 border-green-300" },
                { label: "Partially Available", color: "bg-yellow-100 border-yellow-300" },
                { label: "Unavailable", color: "bg-red-100 border-red-300" },
                { label: "Past/Outside Window", color: "bg-gray-100 border-gray-200 opacity-70" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border ${item.color}`}></div>
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              • AM/PM indicators show which time slots are available
              <br />
              • Click dates to select preferred time slot for your party
            </p>
          </div>

          {/* Selected Date Display with Time Slot */}
          {!isFromDashboard && selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="font-semibold text-blue-900">Selected Date</span>
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

        {/* Time Slot Selection Modal */}
        {showingTimeSlots && selectedDateForSlots && showTimeSlotSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                {getAvailableTimeSlots(selectedDateForSlots).map(slot => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSlotSelection(slot)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const SlotIcon = TIME_SLOTS[slot].icon;
                        return <SlotIcon className="w-5 h-5 text-amber-500" />;
                      })()}
                      <div>
                        <div className="font-medium">{TIME_SLOTS[slot].label}</div>
                        <div className="text-sm text-gray-500">{TIME_SLOTS[slot].displayTime}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowingTimeSlots(false)
                  setSelectedDateForSlots(null)
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}