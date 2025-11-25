"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Settings, Clock, Check, Loader2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import GoogleCalendarSync from "./CompactGoogleCalendarSync"

// Auto-save indicator (subtle, bottom right)
const AutoSaveIndicator = ({ status }) => {
  if (status === "idle") return null

  const config = {
    saving: { icon: Loader2, text: "Saving...", className: "animate-spin text-gray-400" },
    saved: { icon: Check, text: "Saved", className: "text-green-500" },
    error: { icon: AlertCircle, text: "Error saving", className: "text-red-500" },
  }

  const { icon: Icon, text, className } = config[status] || config.saved

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 border flex items-center gap-2 z-50">
      <Icon className={`w-4 h-4 ${className}`} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

// Helper functions
const dateToLocalString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const getDefaultWorkingHours = () => ({
  Monday: { active: true, timeSlots: { morning: { available: true }, afternoon: { available: true } } },
  Tuesday: { active: true, timeSlots: { morning: { available: true }, afternoon: { available: true } } },
  Wednesday: { active: true, timeSlots: { morning: { available: true }, afternoon: { available: true } } },
  Thursday: { active: true, timeSlots: { morning: { available: true }, afternoon: { available: true } } },
  Friday: { active: true, timeSlots: { morning: { available: true }, afternoon: { available: true } } },
  Saturday: { active: false, timeSlots: { morning: { available: false }, afternoon: { available: false } } },
  Sunday: { active: false, timeSlots: { morning: { available: false }, afternoon: { available: false } } },
})

const migrateWorkingHours = (legacyHours) => {
  if (!legacyHours) return getDefaultWorkingHours()
  if (legacyHours.Monday?.timeSlots) return legacyHours
  return getDefaultWorkingHours()
}

const migrateDateArray = (dateArray) => {
  if (!Array.isArray(dateArray)) return []
  return dateArray.map((dateItem) => {
    if (typeof dateItem === "string") {
      return { date: dateItem.split("T")[0], timeSlots: ["morning", "afternoon"] }
    } else if (dateItem && typeof dateItem === "object" && dateItem.date) {
      return dateItem
    }
    return { date: new Date(dateItem).toISOString().split("T")[0], timeSlots: ["morning", "afternoon"] }
  })
}

// Time slot picker modal
function TimeSlotModal({ date, blockedSlots, onToggle, onClose }) {
  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const isAllDay = blockedSlots.includes("morning") && blockedSlots.includes("afternoon")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{dateStr}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 mb-4">Select times to block:</p>

          <button
            onClick={() => onToggle("allday")}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              isAllDay
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-gray-900">Block entire day</div>
            <div className="text-sm text-gray-500">Not available all day</div>
          </button>

          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 uppercase">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            onClick={() => onToggle("morning")}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              blockedSlots.includes("morning") && !isAllDay
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-gray-900">Morning</div>
            <div className="text-sm text-gray-500">9:00 AM - 1:00 PM</div>
          </button>

          <button
            onClick={() => onToggle("afternoon")}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              blockedSlots.includes("afternoon") && !isAllDay
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-gray-900">Afternoon</div>
            <div className="text-sm text-gray-500">1:00 PM - 5:00 PM</div>
          </button>
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

// Settings panel (slide out)
function SettingsPanel({ isOpen, onClose, workingHours, setWorkingHours, advanceBookingDays, setAdvanceBookingDays }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const toggleDay = (day) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day].active,
        timeSlots: {
          morning: { available: !prev[day].active },
          afternoon: { available: !prev[day].active }
        }
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Availability settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Working Days */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Working days</h3>
            <div className="space-y-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-gray-900">{day}</span>
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    workingHours[day]?.active ? "bg-gray-900" : "bg-gray-200"
                  }`}>
                    <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
                      workingHours[day]?.active ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Advance booking */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Minimum notice</h3>
            <p className="text-sm text-gray-500 mb-4">How far in advance can guests book?</p>
            <select
              value={advanceBookingDays}
              onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value={0}>Same day</option>
              <option value={1}>1 day notice</option>
              <option value={2}>2 days notice</option>
              <option value={3}>3 days notice</option>
              <option value={7}>1 week notice</option>
              <option value={14}>2 weeks notice</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

const TimeSlotAvailabilityContent = ({
  supplier,
  supplierData,
  setSupplierData,
  loading,
  currentBusiness,
  primaryBusiness,
  businesses,
}) => {
  const currentSupplier = primaryBusiness?.data || supplierData
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [workingHours, setWorkingHours] = useState(() => getDefaultWorkingHours())
  const [unavailableDates, setUnavailableDates] = useState([])
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [saveStatus, setSaveStatus] = useState("idle")
  const [bookings, setBookings] = useState([])
  const saveTimeoutRef = useRef(null)
  const lastSavedDataRef = useRef(null)

  // Load initial data
  useEffect(() => {
    if (currentSupplier) {
      setWorkingHours(migrateWorkingHours(currentSupplier.workingHours) || getDefaultWorkingHours())
      setUnavailableDates(migrateDateArray(currentSupplier.unavailableDates) || [])
      setAdvanceBookingDays(currentSupplier.advanceBookingDays ?? 7)
    }
  }, [currentSupplier])

  // Fetch confirmed bookings from PartySnap
  useEffect(() => {
    const fetchBookings = async () => {
      // Use supplier.id (current business) or fall back to primaryBusiness.id
      const supplierId = supplier?.id || primaryBusiness?.id
      if (!supplierId) return

      console.log('📅 Fetching bookings for supplier:', supplierId)

      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select(`
            id,
            party_id,
            status,
            supplier_response,
            auto_accepted,
            parties (
              id,
              child_name,
              theme,
              party_date,
              party_time
            )
          `)
          .eq('supplier_id', supplierId)
          .eq('status', 'accepted')

        if (error) {
          console.error('Error fetching bookings:', error)
          return
        }

        console.log('📅 Raw bookings data:', data)

        // Include bookings where supplier has responded OR it's accepted (not auto)
        const confirmedBookings = data?.filter(b =>
          b.supplier_response || (b.status === 'accepted' && !b.auto_accepted)
        ) || []

        console.log('📅 Confirmed bookings:', confirmedBookings)
        setBookings(confirmedBookings)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      }
    }

    fetchBookings()
  }, [supplier?.id, primaryBusiness?.id])

  // Auto-save
  const saveToDatabase = useCallback(async (data) => {
    const dataString = JSON.stringify(data)
    if (lastSavedDataRef.current === dataString) return

    try {
      setSaveStatus("saving")

      if (!primaryBusiness) throw new Error("No business found")

      const updatedData = {
        ...primaryBusiness.data,
        workingHours: data.workingHours,
        unavailableDates: data.unavailableDates,
        advanceBookingDays: data.advanceBookingDays,
        availabilityVersion: "2.0",
        lastUpdated: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("suppliers")
        .update({ data: updatedData })
        .eq("id", primaryBusiness.id)

      if (error) throw error

      lastSavedDataRef.current = dataString
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }, [primaryBusiness])

  useEffect(() => {
    if (!primaryBusiness) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase({ workingHours, unavailableDates, advanceBookingDays })
    }, 1500)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [workingHours, unavailableDates, advanceBookingDays, saveToDatabase, primaryBusiness])

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))

  // Get blocked date info for a date
  const getBlockedDateInfo = (date) => {
    const dateStr = dateToLocalString(date)
    return unavailableDates.find((item) => item.date === dateStr)
  }

  // Get blocked slots for a date
  const getBlockedSlots = (date) => {
    return getBlockedDateInfo(date)?.timeSlots || []
  }

  // Check if a blocked date is a PartySnap booking (has "Party" in title)
  const isPartySnapBooking = (blockedDate) => {
    if (!blockedDate?.eventTitle) return false
    // Check if it looks like a party booking (contains "Party -" pattern from calendar sync)
    return blockedDate.eventTitle.toLowerCase().includes('party')
  }

  // Extract party name from event title (e.g., "superhero Party - Ray H" -> "Ray H's")
  const getPartyDisplayName = (blockedDate) => {
    if (!blockedDate?.eventTitle) return ''
    const title = blockedDate.eventTitle
    // Try to extract name after " - " (e.g., "superhero Party - Ray H")
    const dashIndex = title.lastIndexOf(' - ')
    if (dashIndex > -1) {
      const name = title.substring(dashIndex + 3).trim()
      // Add 's if it doesn't already end with s
      return name.endsWith('s') ? `${name}'` : `${name}'s`
    }
    return title
  }

  // Get time slot display (AM/PM based on timeSlots array)
  const getTimeSlotDisplay = (blockedDate) => {
    if (!blockedDate?.timeSlots) return ''
    if (blockedDate.timeSlots.includes('morning') && !blockedDate.timeSlots.includes('afternoon')) {
      return 'AM'
    }
    if (blockedDate.timeSlots.includes('afternoon') && !blockedDate.timeSlots.includes('morning')) {
      return 'PM'
    }
    return ''
  }

  // Handle time slot toggle
  const handleTimeSlotToggle = (timeSlot) => {
    if (!selectedDate) return
    const dateStr = dateToLocalString(selectedDate)

    setUnavailableDates((prev) => {
      const existing = prev.find((item) => item.date === dateStr)

      if (timeSlot === "allday") {
        if (existing?.timeSlots.includes("morning") && existing?.timeSlots.includes("afternoon")) {
          return prev.filter((item) => item.date !== dateStr)
        }
        if (existing) {
          return prev.map((item) =>
            item.date === dateStr ? { ...item, timeSlots: ["morning", "afternoon"] } : item
          )
        }
        return [...prev, { date: dateStr, timeSlots: ["morning", "afternoon"], source: "manual" }]
      }

      if (existing) {
        if (existing.timeSlots.includes(timeSlot)) {
          const updated = existing.timeSlots.filter((s) => s !== timeSlot)
          return updated.length === 0
            ? prev.filter((item) => item.date !== dateStr)
            : prev.map((item) => (item.date === dateStr ? { ...item, timeSlots: updated } : item))
        }
        return prev.map((item) =>
          item.date === dateStr ? { ...item, timeSlots: [...item.timeSlots, timeSlot] } : item
        )
      }
      return [...prev, { date: dateStr, timeSlots: [timeSlot], source: "manual" }]
    })
  }

  // Get day name from date
  const getDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  // Check if a day is a working day based on settings
  const isWorkingDay = (date) => {
    const dayName = getDayName(date)
    return workingHours[dayName]?.active ?? true
  }

  // Get booking for a specific date
  const getBookingForDate = (date) => {
    const dateStr = dateToLocalString(date)
    return bookings.find(booking => {
      if (!booking.parties?.party_date) return false
      const bookingDateStr = booking.parties.party_date.split('T')[0]
      return bookingDateStr === dateStr
    })
  }

  // Format party time for display
  const formatPartyTime = (booking) => {
    if (!booking?.parties?.party_time) return ''
    const time = booking.parties.party_time
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Adjust for Monday start
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const days = []

    // Empty cells - match height of day cells
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 sm:h-24" />)
    }

    // Day cells - Airbnb style: taller cells with date in top-left
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const blockedSlots = getBlockedSlots(date)
      const booking = getBookingForDate(date)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const isNonWorkingDay = !isWorkingDay(date)
      const isFullyBlocked = blockedSlots.length === 2 || isNonWorkingDay
      const isPartiallyBlocked = blockedSlots.length === 1 && !isNonWorkingDay
      const hasBooking = !!booking

      days.push(
        <button
          key={day}
          onClick={() => !isPast && !isNonWorkingDay && !hasBooking && setSelectedDate(date)}
          disabled={isPast || isNonWorkingDay || hasBooking}
          className={`
            h-20 sm:h-24 rounded-xl border transition-all relative p-2 flex flex-col
            ${isPast
              ? "bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100"
              : hasBooking
                ? "bg-primary-50 border-primary-200 cursor-default"
                : isNonWorkingDay
                  ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                  : isFullyBlocked
                    ? "bg-gray-100 text-gray-400 border-gray-200"
                    : isPartiallyBlocked
                      ? "bg-white border-gray-200 cursor-pointer hover:border-gray-400 hover:shadow-sm"
                      : "bg-white border-gray-200 cursor-pointer hover:border-gray-400 hover:shadow-sm"
            }
            ${isToday ? "ring-2 ring-gray-900 ring-offset-1" : ""}
          `}
          title={hasBooking ? `${booking.parties?.child_name}'s ${booking.parties?.theme || ''} Party` : ''}
        >
          {/* Date number in top-left */}
          <span className={`text-sm font-medium ${isPast ? "text-gray-300" : isFullyBlocked && !hasBooking ? "text-gray-400 line-through" : "text-gray-900"}`}>
            {day}
          </span>

          {/* Content area */}
          <div className="flex-1 flex flex-col justify-end">
            {!isPast && hasBooking && (
              <div className="text-xs leading-tight text-primary-600 font-medium truncate">
                {booking.parties?.child_name}'s
                {formatPartyTime(booking) && <span className="block text-[10px] text-primary-500">{formatPartyTime(booking)}</span>}
              </div>
            )}
            {!isPast && !hasBooking && isNonWorkingDay && (
              <span className="text-xs text-gray-400">Closed</span>
            )}
            {!isPast && !hasBooking && isPartiallyBlocked && (
              <span className="text-xs text-gray-500">
                {blockedSlots[0] === "morning" ? "PM only" : "AM only"}
              </span>
            )}
            {!isPast && !hasBooking && isFullyBlocked && !isNonWorkingDay && (
              <span className="text-xs text-gray-400">Blocked</span>
            )}
          </div>
        </button>
      )
    }

    return days
  }, [currentMonth, unavailableDates, workingHours, bookings])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Calendar Header - Airbnb style */}
        <div className="flex items-center justify-between mb-6">
          {/* Month title with dropdown arrow */}
          <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 -ml-2 transition-colors">
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </h1>
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>

          {/* Navigation arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Days of week header - Airbnb style */}
            <div className="grid grid-cols-7 gap-px border-b border-gray-100 mb-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays}
            </div>

            {/* Legend - subtle bottom bar */}
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-gray-200 bg-white" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-primary-200 bg-primary-50" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-gray-200 bg-gray-100" />
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-2 ring-gray-900 ring-offset-1 bg-white" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Airbnb style */}
          <div className="lg:w-72 flex-shrink-0 space-y-3">
            {/* Availability settings card */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-full p-4 border border-gray-200 rounded-xl text-left hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Availability settings</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {Object.values(workingHours).filter(d => d.active).length} working days
                  </p>
                  <p className="text-sm text-gray-500">
                    {advanceBookingDays === 0 ? 'Same-day' : `${advanceBookingDays}-day`} advance notice
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mt-0.5" />
              </div>
            </button>

            {/* Calendar sync card - cleaner design */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Calendar sync</h3>
                <p className="text-xs text-gray-500 mt-0.5">Sync with external calendars</p>
              </div>
              <div className="p-4">
                <GoogleCalendarSync
                  onSyncToggle={(enabled) => {
                    setSupplierData(prev => ({
                      ...prev,
                      googleCalendarSync: { ...prev?.googleCalendarSync, enabled }
                    }))
                  }}
                  currentSupplier={currentSupplier}
                  authUserId={primaryBusiness?.auth_user_id}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-3">This month</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Blocked days</span>
                  <span className="font-medium text-gray-900">
                    {unavailableDates.filter(d => {
                      const date = new Date(d.date)
                      return date.getMonth() === currentMonth.getMonth() &&
                             date.getFullYear() === currentMonth.getFullYear() &&
                             d.timeSlots.length === 2
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Partial blocks</span>
                  <span className="font-medium text-gray-900">
                    {unavailableDates.filter(d => {
                      const date = new Date(d.date)
                      return date.getMonth() === currentMonth.getMonth() &&
                             date.getFullYear() === currentMonth.getFullYear() &&
                             d.timeSlots.length === 1
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Confirmed bookings</span>
                  <span className="font-medium text-gray-900">
                    {bookings.filter(b => {
                      const partyDate = b.parties?.party_date ? new Date(b.parties.party_date) : null
                      return partyDate &&
                             partyDate.getMonth() === currentMonth.getMonth() &&
                             partyDate.getFullYear() === currentMonth.getFullYear()
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time slot modal */}
      {selectedDate && (
        <TimeSlotModal
          date={selectedDate}
          blockedSlots={getBlockedSlots(selectedDate)}
          onToggle={handleTimeSlotToggle}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Settings panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        workingHours={workingHours}
        setWorkingHours={setWorkingHours}
        advanceBookingDays={advanceBookingDays}
        setAdvanceBookingDays={setAdvanceBookingDays}
      />

      {/* Auto-save indicator */}
      <AutoSaveIndicator status={saveStatus} />
    </div>
  )
}

export default TimeSlotAvailabilityContent
