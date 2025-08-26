// hooks/useSupplierAvailability.js - Enhanced for database users
"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { 
  dateToLocalString, 
  stringToLocalDate, 
  getDateStringForComparison,
  parseSupplierDate,
  migrateDateArray,
  isSameDay,
  addDays,
  formatDate
} from '@/utils/dateHelpers'

// Time slot definitions - matching the calendar
const TIME_SLOTS = {
  morning: {
    id: 'morning',
    label: 'Morning',
    defaultStart: '09:00',
    defaultEnd: '13:00',
    displayTime: '9am - 1pm',
    icon: 'Sun'
  },
  afternoon: {
    id: 'afternoon', 
    label: 'Afternoon',
    defaultStart: '13:00',
    defaultEnd: '17:00',
    displayTime: '1pm - 5pm',
    icon: 'Moon'
  }
}


export const useSupplierAvailability = (supplier, externalPartyData, externalUserType) => {
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  
  // NEW: Party data state for database users
  const [databasePartyData, setDatabasePartyData] = useState(null)
  const [userType, setUserType] = useState(null)

  // Use external data when provided, fallback to internal
  const activePartyData = externalPartyData || databasePartyData
  const activeUserType = externalUserType || userType

  // NEW: Detect user type and get party data
  useEffect(() => {
    const detectUserAndPartyData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUserType('DATABASE_USER')
          
          // Get database party data
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          if (partyResult.success && partyResult.party) {
            console.log('📅 Got database party data:', partyResult.party)
            setDatabasePartyData(partyResult.party)
          } else {
            setUserType('LOCALSTORAGE_USER')
          }
        } else {
          setUserType('LOCALSTORAGE_USER')
        }
      } catch (error) {
        console.error('Error detecting user type:', error)
        setUserType('LOCALSTORAGE_USER')
      }
    }
    
    detectUserAndPartyData()
  }, [])

  // Migration helper for legacy supplier data
  const getSupplierWithTimeSlots = useCallback((supplierData) => {
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
    
    if (supplierData.unavailableDates && Array.isArray(supplierData.unavailableDates)) {
      migrated.unavailableDates = migrateDateArray(supplierData.unavailableDates)
    }
    
    if (supplierData.busyDates && Array.isArray(supplierData.busyDates)) {
      migrated.busyDates = migrateDateArray(supplierData.busyDates)
    }
    
    return migrated
  }, [])

  const migratedSupplier = useMemo(() => getSupplierWithTimeSlots(supplier), [supplier, getSupplierWithTimeSlots])

  const getPartyDate = useCallback(() => {
    if (userType === 'DATABASE_USER' && databasePartyData) {
      const partyDate = databasePartyData.party_date || databasePartyData.date
      return partyDate ? new Date(partyDate) : null
    } else {
      // Fallback to localStorage
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (!partyDetails) return null
        const parsed = JSON.parse(partyDetails)
        return parsed.date ? new Date(parsed.date) : null
      } catch (error) {
        return null
      }
    }
  }, [userType, databasePartyData])

  // ENHANCED: Get party time slot from correct source
  const getPartyTimeSlot = useCallback(() => {
    if (activeUserType === 'DATABASE_USER' && activePartyData) {
      let timeSlot = activePartyData.time_slot || activePartyData.timeSlot
      
      if (!timeSlot) {
        const timeField = activePartyData.start_time || activePartyData.party_time || activePartyData.time
        if (timeField) {
          const hour = parseInt(timeField.toString().split(':')[0])
          timeSlot = hour < 13 ? 'morning' : 'afternoon'
          console.log('Mapping time', timeField, 'to slot:', timeSlot)
        }
      }
      
      return timeSlot
    }
    else {
      // Fallback to localStorage
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (!partyDetails) return null
        const parsed = JSON.parse(partyDetails)
        
        let timeSlot = parsed.timeSlot
        
        // Map from party time if timeSlot not explicitly set
        if (!timeSlot && parsed.time) {
          const timeStr = parsed.time.toLowerCase()
          if (timeStr.includes('am') || 
              timeStr.includes('9') || timeStr.includes('10') || 
              timeStr.includes('11') || timeStr.includes('12')) {
            timeSlot = 'morning'
          } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                    timeStr.includes('2') || timeStr.includes('3') || 
                    timeStr.includes('4') || timeStr.includes('5')) {
            timeSlot = 'afternoon'
          }
        }
        
        return timeSlot
      } catch (error) {
        return null
      }
    }
  }, [userType, databasePartyData])

  // ENHANCED: Check if user has party date
  const hasPartyDate = useCallback(() => {
    return !!getPartyDate()
  }, [getPartyDate])
  
  const isFromDashboard = useCallback(() => {
    return hasPartyDate()
  }, [hasPartyDate])

  // Check if a specific time slot is available on a date
  const isTimeSlotAvailable = useCallback((date, timeSlot) => {
    if (!migratedSupplier || !date || !timeSlot) return false
    
    try {
      const checkDate = parseSupplierDate(date)
      if (!checkDate) return false
      
      const dateString = dateToLocalString(checkDate)
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
      
      // Check working hours - default to available if not configured
      if (!migratedSupplier.workingHours || Object.keys(migratedSupplier.workingHours).length === 0) {
        return true // Default to available when no working hours
      }
      
      const workingDay = migratedSupplier.workingHours?.[dayName]
      
      if (!workingDay) {
        return true // Default to available when day not configured
      }
      
      if (!workingDay.active) {
        return false
      }
      
      if (!workingDay.timeSlots || !workingDay.timeSlots[timeSlot]) {
        return true // Default to available when time slot not configured
      }
      
      if (!workingDay.timeSlots[timeSlot].available) {
        return false
      }
      
      // Check unavailable dates
      const unavailableDate = migratedSupplier.unavailableDates?.find(ud => {
        const udDate = getDateStringForComparison(ud.date || ud)
        return udDate === dateString
      })
      
      if (unavailableDate) {
        if (typeof unavailableDate === 'string') {
          return false // Legacy: entire day
        }
        if (unavailableDate.timeSlots?.includes(timeSlot)) {
          return false
        }
      }
      
      // Check busy dates
      const busyDate = migratedSupplier.busyDates?.find(bd => {
        const bdDate = getDateStringForComparison(bd.date || bd)
        return bdDate === dateString
      })
      
      if (busyDate) {
        if (typeof busyDate === 'string') {
          return false // Legacy: entire day
        }
        if (busyDate.timeSlots?.includes(timeSlot)) {
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('Error checking time slot availability:', error)
      return true // Default to available on error
    }
  }, [migratedSupplier])

  // Get available time slots for a date
  const getAvailableTimeSlots = useCallback((date) => {
    return Object.keys(TIME_SLOTS).filter(slot => 
      slot !== 'allday' && isTimeSlotAvailable(date, slot)
    )
  }, [isTimeSlotAvailable])

  // ENHANCED: Availability check with database party support
  const checkSupplierAvailability = useCallback((dateToCheck, timeSlotToCheck = null) => {
    const defaultResult = { available: true, timeSlots: [], allSlots: Object.keys(TIME_SLOTS) }
    
    if (!migratedSupplier || !dateToCheck) {
      return defaultResult
    }
    
    try {
      const checkDate = parseSupplierDate(dateToCheck)
      if (!checkDate) {
        return defaultResult
      }
      
      // Determine time slot if not provided
      if (!timeSlotToCheck) {
        const partyTimeSlot = getPartyTimeSlot()
        timeSlotToCheck = partyTimeSlot
      }
      
      console.log('Checking availability for date:', formatDate(checkDate), 'time slot:', timeSlotToCheck)
      
      // If specific time slot requested, check that slot
      if (timeSlotToCheck) {
        const isSlotAvailable = isTimeSlotAvailable(checkDate, timeSlotToCheck)
        
        return { 
          available: isSlotAvailable, 
          timeSlots: isSlotAvailable ? [timeSlotToCheck] : [],
          checkedTimeSlot: timeSlotToCheck,
          allSlots: Object.keys(TIME_SLOTS),
          requestedSlot: timeSlotToCheck,
          partyDate: getPartyDate(),
          partyTimeSlot: getPartyTimeSlot()
        }
      }
      
      // Check all time slots
      const availableSlots = getAvailableTimeSlots(checkDate)
      
      return {
        available: availableSlots.length > 0,
        timeSlots: availableSlots,
        allSlots: Object.keys(TIME_SLOTS),
        partyDate: getPartyDate(),
        partyTimeSlot: getPartyTimeSlot()
      }
      
    } catch (error) {
      console.error('Error checking supplier availability:', error)
      return defaultResult
    }
  }, [migratedSupplier, isTimeSlotAvailable, getAvailableTimeSlots, getPartyTimeSlot, getPartyDate])

  // Get selected calendar date as string
  const getSelectedCalendarDate = useCallback(() => {
    if (!selectedDate || !currentMonth) {
      return null
    }
    
    try {
      const selectedDateObj = new Date(
        currentMonth.getFullYear(), 
        currentMonth.getMonth(), 
        selectedDate
      )
      
      const dateString = dateToLocalString(selectedDateObj)
      return dateString
    } catch (error) {
      console.error('Error generating calendar date:', error)
      return null
    }
  }, [selectedDate, currentMonth])

  // Get date status with time slot consideration
  const getDateStatus = useCallback((date) => {
    if (!migratedSupplier) return "unknown"
    
    try {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkDate < today) return "past"
      
      const advanceDays = migratedSupplier.advanceBookingDays || 0
      if (advanceDays > 0) {
        const minBookingDate = new Date(today)
        minBookingDate.setDate(today.getDate() + advanceDays)
        minBookingDate.setHours(0, 0, 0, 0)
        
        if (checkDate < minBookingDate) return "outside-window"
      }
      
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
  }, [migratedSupplier, getAvailableTimeSlots])

  // Check if current selection is valid for booking
  const isCurrentSelectionBookable = useCallback(() => {
    if (!selectedDate || !currentMonth) return false
    
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
    const status = getDateStatus(selectedDateObj)
    
    if (status !== 'available' && status !== 'partially-available') return false
    
    if (status === 'partially-available' && !selectedTimeSlot) return false
    
    if (selectedTimeSlot) {
      return isTimeSlotAvailable(selectedDateObj, selectedTimeSlot)
    }
    
    return true
  }, [selectedDate, currentMonth, selectedTimeSlot, getDateStatus, isTimeSlotAvailable])

  return {
    // State
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    
    // Enhanced party date helpers (works for both database and localStorage users)
    hasPartyDate,
    getPartyDate,
    getPartyTimeSlot,
    isFromDashboard,
    
    // Calendar helpers
    getSelectedCalendarDate,
    isCurrentSelectionBookable,
    // Time slot functions
    isTimeSlotAvailable,
    getAvailableTimeSlots,
    isCurrentSelectionBookable,
    
    // Enhanced availability checking with database support
    checkSupplierAvailability,
    getDateStatus,
    
    // Migrated supplier data
    migratedSupplier,
    
    // User context
    userType,
    databasePartyData,
    
    // Time slot constants
    TIME_SLOTS
  }
}