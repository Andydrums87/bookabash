"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Lock, Info, Sun, Moon, Package } from "lucide-react"
import { getAvailabilityType, AVAILABILITY_TYPES } from "../../app/suppliers/utils/supplierTypes"
import { useEffect, useRef, useMemo, useState } from "react"
import { shouldShowWeekendIndicator } from "@/utils/smartPricingSystem"
import {
  dateToLocalString,
  getDateStringForComparison,
  parseSupplierDate,
  migrateDateArray,
  formatDate,
} from "@/utils/dateHelpers"

const isGoogleCalendarConnected = (supplierData) => {
  return supplierData?.googleCalendarSync?.connected === true || supplierData?.googleCalendarSync?.inherited === true
}

export function getDefaultDaySchedule(isAvailable) {
  return {
    active: isAvailable,
    timeSlots: {
      morning: {
        available: isAvailable,
        startTime: "09:00",
        endTime: "13:00",
      },
      afternoon: {
        available: isAvailable,
        startTime: "13:00",
        endTime: "17:00",
      },
    },
  }
}

const TIME_SLOTS = {
  morning: {
    id: "morning",
    label: "Morning",
    defaultStart: "09:00",
    defaultEnd: "13:00",
    displayTime: "9am - 1pm",
    icon: Sun,
  },
  afternoon: {
    id: "afternoon",
    label: "Afternoon",
    defaultStart: "13:00",
    defaultEnd: "17:00",
    displayTime: "1pm - 5pm",
    icon: Moon,
  },
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
  showTimeSlotSelection = true,
}) {
  const availabilityType = getAvailabilityType(supplier?.category)
  const isLeadTimeBased = availabilityType === AVAILABILITY_TYPES.LEAD_TIME_BASED
  const [showingTimeSlots, setShowingTimeSlots] = useState(false)
  const [selectedDateForSlots, setSelectedDateForSlots] = useState(null)
  const hasSetInitialMonth = useRef(false)

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

  useEffect(() => {
    if (isFromDashboard && partyDate && selectedDate === null) {
      const partyDay = partyDate.getDate()
      const partyMonth = partyDate.getMonth()
      const currentMonthIndex = currentMonth.getMonth()

      if (partyMonth === currentMonthIndex) {
        setSelectedDate(partyDay)

        if (partyTimeSlot && setSelectedTimeSlot) {
          setSelectedTimeSlot(partyTimeSlot)
        }
      }
    }
  }, [isFromDashboard, partyDate, partyTimeSlot, selectedDate, currentMonth, setSelectedDate, setSelectedTimeSlot])

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
              endTime: "13:00",
            },
            afternoon: {
              available: hours.active,
              startTime: "13:00",
              endTime: hours.end || "17:00",
            },
          },
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
  }

  const getLeadTimeAvailability = (date, supplierData) => {
    if (!supplierData) return "unknown"

    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkDate < today) return "past"

    const leadTimeSettings = supplierData.leadTimeSettings || {}
    const minLeadTime = leadTimeSettings.minLeadTimeDays || 3
    const advanceBooking = supplierData.advanceBookingDays || 0

    const minBookingDate = new Date(today)
    minBookingDate.setDate(today.getDate() + minLeadTime + advanceBooking)
    minBookingDate.setHours(0, 0, 0, 0)

    if (checkDate < minBookingDate) return "outside-window"

    const maxDays = supplierData.maxBookingDays || 365
    const maxBookingDate = new Date(today)
    maxBookingDate.setDate(today.getDate() + maxDays)
    maxBookingDate.setHours(0, 0, 0, 0)

    if (checkDate > maxBookingDate) return "outside-window"

    if (leadTimeSettings.stockBased && !leadTimeSettings.unlimitedStock) {
      if (leadTimeSettings.stockQuantity <= 0) return "unavailable"
    }

    return "available"
  }

  const migratedSupplier = useMemo(() => getSupplierWithTimeSlots(supplier), [supplier])

  const isTimeSlotAvailable = (date, timeSlot) => {
    if (!migratedSupplier || !date || !timeSlot) return false

    try {
      const checkDate = parseSupplierDate(date)
      if (!checkDate) return false

      const dateString = dateToLocalString(checkDate)
      const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" })

      if (!migratedSupplier.workingHours || Object.keys(migratedSupplier.workingHours).length === 0) {
        return true
      }

      const workingDay = migratedSupplier.workingHours?.[dayName]

      if (!workingDay) {
        return true
      }

      if (!workingDay.active) {
        return false
      }

      if (!workingDay.timeSlots || !workingDay.timeSlots[timeSlot]) {
        return true
      }

      if (!workingDay.timeSlots[timeSlot].available) {
        return false
      }

      const unavailableDate = migratedSupplier.unavailableDates?.find((ud) => {
        const udDate = getDateStringForComparison(ud.date || ud)
        const matches = udDate === dateString
        return matches
      })

      if (unavailableDate) {
        if (typeof unavailableDate === "string") {
          return false
        }
        if (unavailableDate.timeSlots?.includes(timeSlot)) {
          return false
        }
      }

      const busyDate = migratedSupplier.busyDates?.find((bd) => {
        const bdDate = getDateStringForComparison(bd.date || bd)
        const matches = bdDate === dateString
        return matches
      })

      if (busyDate) {
        if (typeof busyDate === "string") {
          return false
        }
        if (busyDate.timeSlots?.includes(timeSlot)) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error checking time slot availability:", error)
      return true
    }
  }

  const getAvailableTimeSlots = (date) => {
    return Object.keys(TIME_SLOTS).filter((slot) => slot !== "allday" && isTimeSlotAvailable(date, slot))
  }

  const getDateStatus = (date) => {
    if (!migratedSupplier) return "unknown"

    if (isLeadTimeBased) {
      return getLeadTimeAvailability(date, migratedSupplier)
    }

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
      console.error("Error getting date status:", error)
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
    if (!isCurrentMonth) return "text-gray-200 cursor-not-allowed bg-transparent"

    if (isPartyDate(date)) {
      const baseStyle = "font-bold relative"

      switch (status) {
        case "available":
        case "partially-available":
          return `${baseStyle} bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all`
        case "unavailable":
        case "outside-window":
          return `${baseStyle} text-gray-300 bg-transparent`
        case "busy":
          return `${baseStyle} text-gray-400 bg-transparent`
        case "closed":
          return `${baseStyle} text-gray-400 bg-transparent`
        default:
          return `${baseStyle} text-gray-900 bg-transparent`
      }
    }

    if (isSelected)
      return "bg-teal-500 text-white rounded-full font-bold hover:bg-teal-600 transition-all shadow-lg ring-2 ring-teal-200"

    switch (status) {
      case "available":
        return readOnly
          ? "text-white bg-primary-500 rounded-full cursor-default font-bold"
          : "text-white bg-primary-500 hover:bg-primary-600 cursor-pointer transition-all font-bold rounded-full"
      case "partially-available":
        return readOnly
          ? "text-primary-800 bg-primary-200 rounded-full cursor-default font-semibold"
          : "text-primary-800 bg-primary-200 hover:bg-primary-300 cursor-pointer transition-all font-semibold rounded-full"
      case "unavailable":
        return "text-gray-300 cursor-not-allowed bg-transparent font-normal"
      case "past":
        return "text-gray-200 cursor-not-allowed bg-transparent font-normal"
      case "outside-window":
        return "text-gray-300 cursor-not-allowed opacity-50 bg-transparent font-normal"
      default:
        return "text-gray-300 cursor-not-allowed bg-transparent font-normal"
    }
  }

  const handleDateClick = (date, day) => {
    if (readOnly) {
      return
    }

    if (isFromDashboard && !isPartyDate(date)) {
      return
    }

    if (isFromDashboard && isPartyDate(date)) {
      setSelectedDate(day)
      if (partyTimeSlot && setSelectedTimeSlot && !isLeadTimeBased) {
        setSelectedTimeSlot(partyTimeSlot)
      }
      return
    }

    const status = getDateStatus(date)

    if (status !== "available" && status !== "partially-available") {
      return
    }

    setSelectedDate(day)

    if (isLeadTimeBased) {
      if (onTimeSlotSelect) {
        onTimeSlotSelect(date, null)
      }
      return
    }

    const availableSlots = getAvailableTimeSlots(date)

    if (availableSlots.length === 0) {
      return
    }

    if (availableSlots.length === 1) {
      if (setSelectedTimeSlot) {
        setSelectedTimeSlot(availableSlots[0])
      }
      if (onTimeSlotSelect) {
        onTimeSlotSelect(date, availableSlots[0])
      }
      return
    }

    if (showTimeSlotSelection && availableSlots.length > 1) {
      setSelectedDateForSlots(date)
      setShowingTimeSlots(true)
    } else {
      if (setSelectedTimeSlot) {
        setSelectedTimeSlot("afternoon")
      }
    }
  }

  const handleTimeSlotSelection = (timeSlot) => {
    if (setSelectedTimeSlot) {
      setSelectedTimeSlot(timeSlot)
    }

    if (onTimeSlotSelect && selectedDateForSlots) {
      onTimeSlotSelect(selectedDateForSlots, timeSlot)
    }

    setShowingTimeSlots(false)
    setSelectedDateForSlots(null)
  }

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayIndex = getFirstDayOfMonth(currentMonth)
    const daysInMonthCount = getDaysInMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    for (let day = 1; day <= daysInMonthCount; day++) {
      const date = new Date(year, month, day)
      const isSelected = selectedDate === day || (isFromDashboard && isPartyDate(date))
      const status = getDateStatus(date)
      const isCurrentMonth = true
      const availableSlots = isLeadTimeBased ? [] : getAvailableTimeSlots(date)
      const styling = getDayStyle(date, status, isSelected, isCurrentMonth, availableSlots)
      const isPartyDay = isPartyDate(date)

      const canClick = !readOnly && (status === "available" || status === "partially-available") && !isPartyDay

      days.push(
        <button
          key={day}
          onClick={() => (canClick ? handleDateClick(date, day) : null)}
          className={`h-8 w-8 mx-auto text-xs transition-all duration-200 ${styling} relative flex items-center justify-center`}
          title={
            isPartyDay
              ? `Your Party Date - ${status.replace("-", " ")}`
              : isLeadTimeBased
                ? status === "available"
                  ? "Available for delivery/pickup"
                  : status === "outside-window"
                    ? "Too soon - doesn't meet lead time"
                    : status.replace("-", " ")
                : availableSlots.length > 0
                  ? `Available: ${availableSlots.map((s) => TIME_SLOTS[s].label).join(", ")}`
                  : status.replace("-", " ")
          }
          disabled={!canClick}
        >
          {day}

          {isPartyDay && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}

          {shouldShowWeekendIndicator(date, migratedSupplier) && status === "available" && !isPartyDay && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>,
      )
    }
    return days
  }, [currentMonth, migratedSupplier, selectedDate, isFromDashboard, readOnly, partyDateString, isLeadTimeBased])

  const partyDateStatus = useMemo(() => {
    if (!partyDate || !migratedSupplier) return null

    if (isLeadTimeBased) {
      return getLeadTimeAvailability(partyDate, migratedSupplier)
    }

    let partyTimeSlotToCheck = partyTimeSlot

    if (!partyTimeSlotToCheck) {
      try {
        const partyDetails = localStorage.getItem("party_details")
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          partyTimeSlotToCheck = parsed.timeSlot

          if (!partyTimeSlotToCheck && parsed.time) {
            const timeStr = parsed.time.toLowerCase()

            if (
              timeStr.includes("am") ||
              timeStr.includes("9") ||
              timeStr.includes("10") ||
              timeStr.includes("11") ||
              timeStr.includes("12")
            ) {
              partyTimeSlotToCheck = "morning"
            } else if (
              timeStr.includes("pm") ||
              timeStr.includes("1") ||
              timeStr.includes("2") ||
              timeStr.includes("3") ||
              timeStr.includes("4") ||
              timeStr.includes("5")
            ) {
              partyTimeSlotToCheck = "afternoon"
            }
          }
        }
      } catch (error) {
        console.log("Could not determine party time slot")
      }
    }

    if (partyTimeSlotToCheck) {
      const isSlotAvailable = isTimeSlotAvailable(partyDate, partyTimeSlotToCheck)
      return isSlotAvailable ? "available" : "unavailable"
    }

    return getDateStatus(partyDate)
  }, [partyDate, partyTimeSlot, migratedSupplier, isLeadTimeBased])

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isFromDashboard
              ? "Party Date Availability"
              : isLeadTimeBased
                ? "Delivery Date Availability"
                : "Time Slot Availability"}
          </h2>
          {migratedSupplier?.advanceBookingDays > 0 && (
            <div className="text-xs text-white bg-[hsl(var(--primary-500))] font-semibold px-8 py-2 rounded-full">
              {isLeadTimeBased
                ? `${migratedSupplier.advanceBookingDays}+ days lead time`
                : `Book ${migratedSupplier.advanceBookingDays}+ days ahead`}
            </div>
          )}
        </div>

        {isFromDashboard && partyDate && partyDateStatus && (
          <div
            className={`mb-8 p-5 rounded-xl border ${
              partyDateStatus === "available" || partyDateStatus === "partially-available"
                ? "bg-green-50 border-green-200"
                : partyDateStatus === "unavailable"
                  ? "bg-red-50 border-red-200"
                  : partyDateStatus === "busy"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  partyDateStatus === "available" || partyDateStatus === "partially-available"
                    ? "bg-green-100"
                    : partyDateStatus === "unavailable"
                      ? "bg-red-100"
                      : partyDateStatus === "busy"
                        ? "bg-amber-100"
                        : "bg-gray-100"
                }`}
              >
                {partyDateStatus === "available" || partyDateStatus === "partially-available" ? (
                  isLeadTimeBased ? (
                    <Package className="w-5 h-5 text-green-700" />
                  ) : (
                    <Calendar className="w-5 h-5 text-green-700" />
                  )
                ) : (
                  <Info className="w-5 h-5 text-gray-700" />
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-semibold mb-1 ${
                    partyDateStatus === "available" || partyDateStatus === "partially-available"
                      ? "text-green-800"
                      : partyDateStatus === "unavailable"
                        ? "text-red-800"
                        : partyDateStatus === "busy"
                          ? "text-amber-800"
                          : "text-gray-800"
                  }`}
                >
                  Your Party Date: {formatDate(partyDate)}
                </h4>
                <p
                  className={`text-sm mb-2 ${
                    partyDateStatus === "available" || partyDateStatus === "partially-available"
                      ? "text-green-700"
                      : partyDateStatus === "unavailable"
                        ? "text-red-700"
                        : partyDateStatus === "busy"
                          ? "text-amber-700"
                          : "text-gray-700"
                  }`}
                >
                  {isLeadTimeBased
                    ? partyDateStatus === "available"
                      ? "Can deliver/be ready by this date"
                      : partyDateStatus === "unavailable"
                        ? "Cannot fulfill by this date"
                        : partyDateStatus === "outside-window"
                          ? "Insufficient lead time"
                          : "Check availability"
                    : (partyDateStatus === "available" && "Available for booking") ||
                      (partyDateStatus === "partially-available" && "Partially available - some time slots open") ||
                      (partyDateStatus === "unavailable" && "Not available for your party time") ||
                      (partyDateStatus === "busy" && "Already booked on this date") ||
                      (partyDateStatus === "closed" && "Supplier is closed on this date") ||
                      (partyDateStatus === "past" && "This date has passed") ||
                      (partyDateStatus === "outside-window" && "Outside booking window")}
                </p>

                {!isLeadTimeBased && (partyDateStatus === "available" || partyDateStatus === "partially-available") && (
                  <div className="flex gap-2 mt-2">
                    {getAvailableTimeSlots(partyDate).map((slot) => {
                      const SlotIcon = TIME_SLOTS[slot].icon
                      return (
                        <Badge
                          key={slot}
                          variant="secondary"
                          className={`text-xs flex items-center gap-1 ${
                            partyTimeSlot === slot
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <SlotIcon className="w-3 h-3" />
                          {TIME_SLOTS[slot].label}
                        </Badge>
                      )
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
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="h-10 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <h3 className="text-xl font-bold text-gray-700 tracking-wide uppercase">
              {currentMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </h3>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="h-10 px-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-500 py-3 text-sm tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-6 mb-8">{calendarDays}</div>

          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Legend</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {isFromDashboard && (
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    
                  </div>
                  <span className="text-gray-700 font-medium">Your Party Date</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-teal-200">
                  
                </div>
                <span className="text-gray-700 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                  
                </div>
                <span className="text-gray-700 font-medium">{isLeadTimeBased ? "Can Deliver" : "Available"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex-shrink-0 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-semibold">
                  
                </div>
                <span className="text-gray-700 font-medium">Partial</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-300 text-xs font-medium">15</span>
                </div>
                <span className="text-gray-700 font-medium">{isLeadTimeBased ? "Too Soon" : "Unavailable"}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              {isLeadTimeBased
                ? "Click available dates to select your delivery date"
                : "Click available dates to select your preferred time"}
            </p>
          </div>

          {!isFromDashboard && selectedDate && (
            <div className="bg-[hsl(var(--primary-50))] border border-[hsl(var(--primary-200))] rounded-xl p-5 mt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-teal-200">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-[hsl(var(--primary-900))] text-sm uppercase tracking-wide block mb-1">
                    {isLeadTimeBased ? "Selected Delivery Date" : "Selected Date"}
                  </span>
                  <p className="text-[hsl(var(--primary-700))] font-medium">
                    {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString(
                      "en-US",
                      { weekday: "long", year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                  {!isLeadTimeBased && selectedTimeSlot && (
                    <div className="flex items-center gap-2 mt-2">
                      {(() => {
                        const SlotIcon = TIME_SLOTS[selectedTimeSlot].icon
                        return <SlotIcon className="w-4 h-4 text-[hsl(var(--primary-500))]" />
                      })()}
                      <span className="text-[hsl(var(--primary-600))]" text-sm font-semibold>
                        {TIME_SLOTS[selectedTimeSlot].label} ({TIME_SLOTS[selectedTimeSlot].displayTime})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {showingTimeSlots && selectedDateForSlots && showTimeSlotSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Choose Your Preferred Time</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedDateForSlots.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="space-y-3 mb-6">
                {getAvailableTimeSlots(selectedDateForSlots).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSlotSelection(slot)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const SlotIcon = TIME_SLOTS[slot].icon
                        return <SlotIcon className="w-5 h-5 text-[hsl(var(--primary-500))]" />
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
