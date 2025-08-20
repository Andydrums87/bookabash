"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Lock, Info } from "lucide-react"
import { useEffect, useRef, useMemo } from "react"

export default function SupplierAvailabilityCalendar({
  supplier,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  // NEW: Add these props
  isFromDashboard = false,
  partyDate = null,
  readOnly = false
}) {

  // ADD THIS LINE RIGHT AT THE TOP
  console.log("🚀 COMPONENT RENDER:", { 
    currentMonth: currentMonth?.toDateString(), 
    supplierAdvanceDays: supplier?.advanceBookingDays,
    today: new Date().toDateString()
  })

  // Also add this to see what the supplier data looks like
  useEffect(() => {
    console.log("🏢 SUPPLIER DEBUG:")
    console.log("supplier:", supplier)
    console.log("supplier.advanceBookingDays:", supplier?.advanceBookingDays)
    console.log("supplier.workingHours:", supplier?.workingHours)
    console.log("supplier keys:", supplier ? Object.keys(supplier) : 'no supplier')
  }, [supplier])

  // Use a ref to track if we've already set the initial month
  const hasSetInitialMonth = useRef(false)

  // Set initial month to party date if coming from dashboard - FIX: Add proper conditions
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

  // Memoize the party date string to avoid recalculation
  const partyDateString = useMemo(() => {
    return partyDate ? partyDate.toDateString() : null
  }, [partyDate])

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

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
    console.log("🔍 === ADVANCE BOOKING DEBUG ===")
    console.log("🔍 Date being checked:", date.toDateString())
    console.log("🔍 Supplier advanceBookingDays:", supplierData?.advanceBookingDays)
    
    // Normalize the input date to remove time components
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    
    console.log("🔍 Today (normalized):", today.toDateString())
    console.log("🔍 Check date (normalized):", checkDate.toDateString())
  
    // Check if date is in the past
    if (checkDate < today) {
      console.log("📅 Date is in the past")
      return "past"
    }
  
    // 🔧 FIX: Advance booking calculation
    const advanceDays = supplierData?.advanceBookingDays || 0
    console.log("🔍 Advance booking days required:", advanceDays)
    
    if (advanceDays > 0) {
      const minBookingDate = new Date(today)
      minBookingDate.setDate(today.getDate() + advanceDays)
      minBookingDate.setHours(0, 0, 0, 0) // Ensure we're comparing dates only
      
      console.log("🔍 Minimum booking date:", minBookingDate.toDateString())
      console.log("🔍 Is date before minimum?", checkDate < minBookingDate)
      console.log("🔍 Date comparison:", {
        checkDate: checkDate.getTime(),
        minBookingDate: minBookingDate.getTime(),
        difference: minBookingDate.getTime() - checkDate.getTime()
      })
      
      if (checkDate < minBookingDate) {
        console.log("🚫 Date is within advance booking window - BLOCKED")
        return "outside-window"
      }
    }
  
    // Check maximum booking window
    const maxDays = supplierData?.maxBookingDays || 365
    const maxBookingDate = new Date(today)
    maxBookingDate.setDate(today.getDate() + maxDays)
    maxBookingDate.setHours(0, 0, 0, 0)
  
    console.log("🔍 Maximum booking date:", maxBookingDate.toDateString())
    
    if (checkDate > maxBookingDate) {
      console.log("🚫 Date is beyond maximum booking window")
      return "outside-window"
    }
  
    // Check unavailable dates
    if (isDateUnavailable(checkDate, supplierData)) {
      console.log("❌ Date is explicitly unavailable")
      return "unavailable"
    }
    
    // Check busy dates
    if (isDateBusy(checkDate, supplierData)) {
      console.log("⚠️ Date is busy")
      return "busy"
    }
    
    // Check working hours (when this gets fixed)
    if (!supplierData?.workingHours) {
      console.log("⚠️ No working hours data, defaulting to available")
      return "available"
    }
    
    const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" })
    const dayWorkingHours = supplierData.workingHours[dayName]
    
    console.log("🕒 Working hours check:", {
      dayName,
      dayWorkingHours,
      isActive: dayWorkingHours?.active
    })
    
    if (!dayWorkingHours || !dayWorkingHours.active) {
      console.log("🚫 Supplier is closed on this day")
      return "closed"
    }
    
    console.log("✅ Date is available")
    return "available"
  }
  
  // NEW: Check if date is the party date - use memoized string comparison
  const isPartyDate = (date) => {
    if (!partyDateString) return false
    return date.toDateString() === partyDateString
  }


  const getDayStyle = (date, status, isSelected, isCurrentMonth) => {
    console.log("🎨 STYLING DEBUG:", {
      date: date.toDateString(),
      status,
      isSelected,
      isCurrentMonth
    })
    
    if (!isCurrentMonth) return 'text-gray-400 cursor-not-allowed'
    
    // NEW: Special styling for party date (if applicable)
    if (isPartyDate && isPartyDate(date)) {
      const partyDateStatus = status
      const baseStyle = 'border-2 border-blue-500 font-bold relative overflow-hidden'
      
      switch (partyDateStatus) {
        case "available":
          return `${baseStyle} bg-blue-100 text-blue-900 shadow-md`
        case "unavailable":
        case "outside-window": // Handle advance booking blocked dates
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
      case "unavailable":
        return 'bg-red-100 text-red-800 cursor-not-allowed line-through border-red-300'
      case "busy":
        return 'bg-yellow-100 text-yellow-800 cursor-not-allowed border-yellow-300'
      case "closed":
        return 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
      case "past":
        return 'text-gray-300 cursor-not-allowed line-through border-gray-200'
      case "outside-window": // 🔧 FIX: Make sure this case is handled
        console.log("🚫 Applying outside-window styling")
        return 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border-gray-200 line-through'
      default:
        console.log("⚠️ Unknown status:", status)
        return 'text-gray-400 cursor-not-allowed border-gray-200'
    }
  }
  // 🔧 TEST: Add this debug to verify the advance booking is working
  // Add this temporarily to your calendar component:
  
  useEffect(() => {
    if (supplier?.advanceBookingDays) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      console.log("🔍 ADVANCE BOOKING TEST:")
      console.log("Today:", today.toDateString())
      console.log("Advance days:", supplier.advanceBookingDays)
      
      // Test the next 10 days
      for (let i = 0; i < 10; i++) {
        const testDate = new Date(today)
        testDate.setDate(today.getDate() + i)
        const status = getDateStatus(testDate, supplier)
        console.log(`Day +${i} (${testDate.toDateString()}):`, status)
      }
    }
  }, [supplier])

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
      const status = getDateStatus(date, supplier)
      const isCurrentMonth = true
      const styling = getDayStyle(date, status, isSelected, isCurrentMonth)
      const isPartyDay = isPartyDate(date)

       // 🔧 ADD: Debug each day creation
    if (day >= 20 && day <= 27) {
      console.log(`📅 Creating day ${day}:`, {
        date: date.toDateString(),
        year,
        month,
        day
      })
    }
 

      // 🔧 FIX: Update the canClick logic
      const canClick = !readOnly && 
                      status === "available" && 
                      !isPartyDay &&
                      status !== "outside-window" &&  // 🔧 ADD THIS
                      status !== "unavailable" &&
                      status !== "busy" &&
                      status !== "closed" &&
                      status !== "past"

  
      days.push(
        <button
          key={day}
          onClick={() => canClick ? setSelectedDate(day) : null}
          className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 border ${styling} relative`}
          title={isPartyDay ? `Your Party Date - ${status.replace("-", " ")}` : status.replace("-", " ")}
          disabled={!canClick} // 🔧 MAKE SURE DISABLED ATTRIBUTE IS SET
        >
          {day}
          {/* Party date indicator */}
          {isPartyDay && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </button>,
      )
    }
    return days
  }, [currentMonth, supplier, selectedDate, isFromDashboard, readOnly, partyDateString])

  // Memoize party date status to avoid recalculation
  const partyDateStatus = useMemo(() => {
    return partyDate ? getDateStatus(partyDate, supplier) : null
  }, [partyDate, supplier])

  const handleDateSelect = (date) => {
    if (!date) return
    
    const normalizedDate = startOfDay(date)
    
    // Check if date is in the past
    if (isBefore(normalizedDate, startOfDay(new Date()))) {
      console.log("🚫 Cannot select past date")
      return
    }
    
    // 🔧 ADD: Check if date is blocked by advance booking
    const dateStatus = getDateStatus(normalizedDate, supplier)
    console.log("🔍 Date selection check:", {
      date: normalizedDate.toDateString(),
      status: dateStatus
    })
    
    if (dateStatus === "outside-window") {
      console.log("🚫 Cannot select date within advance booking window")
      return
    }
    
    if (dateStatus === "unavailable" || dateStatus === "busy" || dateStatus === "closed") {
      console.log("🚫 Cannot select unavailable date")
      return
    }
    
    // If we get here, the date is selectable
    setUnavailableDates((prev) => {
      const isAlreadyUnavailable = prev.some((d) => isDateEqual(d, normalizedDate))
      if (isAlreadyUnavailable) {
        return prev.filter((d) => !isDateEqual(d, normalizedDate))
      } else {
        return [...prev, normalizedDate]
      }
    })
  }

  if (!supplier?.workingHours && !supplier?.unavailableDates) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Availability Calendar</h2>
          <p className="text-sm text-gray-600">
            Detailed availability calendar is loading or not available. Please contact the supplier directly for booking
            inquiries.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isFromDashboard ? "Party Date Availability" : "Availability Calendar"}
          </h2>
          {supplier?.advanceBookingDays > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Book {supplier.advanceBookingDays}+ days ahead
            </div>
          )}
        </div>

        {/* NEW: Party date status banner */}
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

          {/* Calendar Grid - Use memoized days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Legend:</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {/* NEW: Add party date legend item if from dashboard */}
              {isFromDashboard && (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 relative">
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Your Party Date</span>
                </div>
              )}
              {[
                { label: "Available", color: "bg-green-100 border-green-300" },
                { label: "Unavailable", color: "bg-red-100 border-red-300" },
                { label: "Busy/Booked", color: "bg-yellow-100 border-yellow-300" },
                { label: "Day Off", color: "bg-gray-200 border-gray-300" },
                { label: "Past/Outside Window", color: "bg-gray-100 border-gray-200 opacity-70" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border ${item.color}`}></div>
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Display - only show for browse users */}
          {!isFromDashboard && selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <span className="font-semibold text-blue-900">Selected Date</span>
                  <p className="text-blue-700 text-sm">
                    {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString(
                      "en-US",
                      { weekday: "long", year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}