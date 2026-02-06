"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Settings, Clock, Check, Loader2, AlertCircle, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import GoogleCalendarSync from "./CompactGoogleCalendarSync"

// Muted color palette for business dot indicators (minimal, professional)
const BUSINESS_COLORS = [
  { name: 'Slate', dot: '#64748b' },      // Muted blue-gray
  { name: 'Rose', dot: '#e879a0' },       // Muted pink
  { name: 'Teal', dot: '#5eadb0' },       // Muted teal
  { name: 'Amber', dot: '#d4a05a' },      // Muted amber
  { name: 'Violet', dot: '#9c8cd4' },     // Muted purple
  { name: 'Emerald', dot: '#6bb38a' },    // Muted green
  { name: 'Sky', dot: '#7aade0' },        // Muted blue
  { name: 'Coral', dot: '#e08a7a' },      // Muted coral
]

// Get color for a business by index or custom setting
const getBusinessColor = (business, index) => {
  // Check if business has a custom color set
  const customColorIndex = business?.data?.calendarColorIndex
  if (typeof customColorIndex === 'number' && BUSINESS_COLORS[customColorIndex]) {
    return BUSINESS_COLORS[customColorIndex]
  }
  // Default: use index to assign color
  return BUSINESS_COLORS[index % BUSINESS_COLORS.length]
}

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

// Booking detail modal - shows when clicking on a booked date
function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null

  const party = booking.parties
  const childName = party?.child_name || 'Unknown'
  const theme = party?.theme || ''
  const partyDate = party?.party_date
  const partyTime = party?.party_time
  const bookingColor = booking.businessColor || BUSINESS_COLORS[0]

  // Format date nicely
  const formattedDate = partyDate
    ? new Date(partyDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''

  // Format time
  const formattedTime = partyTime
    ? (() => {
        const [hours, minutes] = partyTime.split(':')
        const hour = parseInt(hours, 10)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
      })()
    : ''

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
        {/* Header - minimal white with dot indicator */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {booking.businessName && (
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: bookingColor.dot }}
                />
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Confirmed
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{childName}'s Party</h2>
          {booking.businessName && (
            <p className="text-sm text-gray-500 mt-1">{booking.businessName}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Date & Time */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{formattedDate}</p>
              {formattedTime && <p className="text-gray-500">{formattedTime}</p>}
            </div>
          </div>

          {/* Theme */}
          {theme && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎉</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{theme}</p>
                <p className="text-gray-500">Party theme</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Booking confirmed</p>
              <p className="text-gray-500">Payment received</p>
            </div>
          </div>

          {/* Booking reference */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Reference</p>
            <p className="text-sm font-mono text-gray-700">{booking.id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Close button */}
        <div className="px-6 pb-6">
          <Button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
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
function SettingsPanel({ isOpen, onClose, workingHours, setWorkingHours, advanceBookingDays, setAdvanceBookingDays, businessName }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const [expandedDay, setExpandedDay] = useState(null)

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

  const setDayAvailability = (day, type) => {
    // type: 'all', 'morning', 'afternoon', 'off'
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: type !== 'off',
        timeSlots: {
          morning: { available: type === 'all' || type === 'morning' },
          afternoon: { available: type === 'all' || type === 'afternoon' }
        }
      }
    }))
    setExpandedDay(null)
  }

  const getDayAvailabilityType = (day) => {
    const hours = workingHours[day]
    if (!hours?.active) return 'off'
    const morning = hours.timeSlots?.morning?.available
    const afternoon = hours.timeSlots?.afternoon?.available
    if (morning && afternoon) return 'all'
    if (morning && !afternoon) return 'morning'
    if (!morning && afternoon) return 'afternoon'
    return 'off'
  }

  const getDayAvailabilityLabel = (day) => {
    const type = getDayAvailabilityType(day)
    switch (type) {
      case 'all': return 'All day'
      case 'morning': return 'Morning only'
      case 'afternoon': return 'Afternoon only'
      case 'off': return 'Closed'
      default: return 'Closed'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Availability settings</h2>
            {businessName && (
              <p className="text-sm text-gray-500">{businessName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Working Days */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Working hours</h3>
            <p className="text-sm text-gray-500 mb-4">Set availability for each day of the week</p>
            <div className="space-y-2">
              {days.map(day => {
                const availabilityType = getDayAvailabilityType(day)
                const isExpanded = expandedDay === day

                return (
                  <div key={day} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Day header */}
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{day}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${availabilityType === 'off' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getDayAvailabilityLabel(day)}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded options */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-2">
                        <button
                          onClick={() => setDayAvailability(day, 'all')}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            availabilityType === 'all'
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">All day</div>
                            <div className={`text-xs ${availabilityType === 'all' ? 'text-gray-300' : 'text-gray-500'}`}>
                              Morning & afternoon
                            </div>
                          </div>
                          {availabilityType === 'all' && <Check className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setDayAvailability(day, 'morning')}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            availabilityType === 'morning'
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">Morning only</div>
                            <div className={`text-xs ${availabilityType === 'morning' ? 'text-gray-300' : 'text-gray-500'}`}>
                              9:00 AM - 1:00 PM
                            </div>
                          </div>
                          {availabilityType === 'morning' && <Check className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setDayAvailability(day, 'afternoon')}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            availabilityType === 'afternoon'
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">Afternoon only</div>
                            <div className={`text-xs ${availabilityType === 'afternoon' ? 'text-gray-300' : 'text-gray-500'}`}>
                              1:00 PM - 5:00 PM
                            </div>
                          </div>
                          {availabilityType === 'afternoon' && <Check className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setDayAvailability(day, 'off')}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            availabilityType === 'off'
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">Closed</div>
                            <div className={`text-xs ${availabilityType === 'off' ? 'text-gray-300' : 'text-gray-500'}`}>
                              Not available
                            </div>
                          </div>
                          {availabilityType === 'off' && <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
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

// Color picker popover for businesses
function ColorPickerPopover({ business, currentColorIndex, onColorSelect, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 w-48">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">Pick a color</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BUSINESS_COLORS.map((color, index) => (
          <button
            key={index}
            onClick={() => onColorSelect(business.id, index)}
            className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
              currentColorIndex === index ? 'ring-2 ring-gray-900 ring-offset-1' : ''
            }`}
            style={{
              backgroundColor: color.bg,
              border: `2px solid ${color.border}`
            }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  )
}

// Calendar skeleton component for loading state
const CalendarSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Days of week header skeleton */}
      <div className="grid grid-cols-7 gap-px border-b border-gray-100 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="h-24 sm:h-28 rounded-2xl border-2 border-gray-100 bg-gray-50 p-3"
          >
            <div className="h-5 w-6 bg-gray-200 rounded mb-2" />
            <div className="mt-auto space-y-1">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-2 w-12 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
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
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedCalendarBusiness, setSelectedCalendarBusiness] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const [saveStatus, setSaveStatus] = useState("idle")
  const [bookings, setBookings] = useState([])
  const [colorPickerBusiness, setColorPickerBusiness] = useState(null) // Track which business's color picker is open
  const [businessColors, setBusinessColors] = useState({}) // Local state for color overrides
  const [isCalendarLoading, setIsCalendarLoading] = useState(false) // Loading state for calendar transitions
  const [showMobileCalendarSync, setShowMobileCalendarSync] = useState(false) // Mobile calendar sync panel
  const [showMobileBusinessPicker, setShowMobileBusinessPicker] = useState(false) // Mobile business picker panel
  const [showDesktopBusinessDropdown, setShowDesktopBusinessDropdown] = useState(false) // Desktop business dropdown
  const [showMonthPicker, setShowMonthPicker] = useState(false) // Month picker dropdown
  const [monthPickerMonth, setMonthPickerMonth] = useState(currentMonth.getMonth()) // Track viewed month in picker
  const [monthPickerYear, setMonthPickerYear] = useState(currentMonth.getFullYear()) // Track viewed year in picker
  const monthPickerRef = useRef(null) // Ref for click outside detection
  const saveTimeoutRef = useRef(null)
  const lastSavedDataRef = useRef(null)
  const previousBusinessRef = useRef(selectedCalendarBusiness)

  // Handle color selection for a business
  const handleColorSelect = async (businessId, colorIndex) => {
    setBusinessColors(prev => ({ ...prev, [businessId]: colorIndex }))
    setColorPickerBusiness(null)

    // Save to database
    try {
      const business = businesses?.find(b => b.id === businessId)
      if (!business) return

      const updatedData = {
        ...business.data,
        calendarColorIndex: colorIndex,
        updatedAt: new Date().toISOString()
      }

      const { error } = await supabase
        .from('suppliers')
        .update({ data: updatedData })
        .eq('id', businessId)

      if (error) {
        console.error('Failed to save color preference:', error)
      } else {
        // Refresh bookings to get updated colors
        window.location.reload()
      }
    } catch (err) {
      console.error('Error saving color:', err)
    }
  }

  // Auto-select first business if only one exists, or if none selected yet
  // This ensures saves work correctly for single-business suppliers
  useEffect(() => {
    if (businesses?.length === 1 && selectedCalendarBusiness === 'all') {
      console.log('📅 Auto-selecting single business:', businesses[0].id)
      setSelectedCalendarBusiness(businesses[0].id)
    }
  }, [businesses, selectedCalendarBusiness])

  // Load initial data (working hours, unavailable dates, and advance booking from primary)
  useEffect(() => {
    if (currentSupplier) {
      setWorkingHours(migrateWorkingHours(currentSupplier.workingHours) || getDefaultWorkingHours())
      setAdvanceBookingDays(currentSupplier.advanceBookingDays ?? 7)

      // Load unavailable dates from database (including synced calendar events)
      const loadedUnavailableDates = migrateDateArray(currentSupplier.unavailableDates) || []
      console.log('📅 Loading unavailable dates from DB:', loadedUnavailableDates.length, 'dates')
      setUnavailableDates(loadedUnavailableDates)
    }
  }, [currentSupplier])

  // Load all settings (including unavailableDates) when switching to a specific business
  useEffect(() => {
    if (selectedCalendarBusiness === 'all') {
      // Reset to primary business settings when viewing all
      if (currentSupplier) {
        setWorkingHours(migrateWorkingHours(currentSupplier.workingHours) || getDefaultWorkingHours())
        setAdvanceBookingDays(currentSupplier.advanceBookingDays ?? 7)
        // Clear local unavailableDates - in "all" mode, filteredUnavailableDates aggregates from businesses prop
        setUnavailableDates([])
        console.log('📅 Switched to All businesses view - clearing local unavailableDates')
      }
    } else {
      // Load the selected business's settings
      const selectedBusiness = businesses?.find(b => b.id === selectedCalendarBusiness)
      if (selectedBusiness?.data) {
        console.log('📅 Loading data for business:', selectedBusiness.id, selectedBusiness.business_name || selectedBusiness.name)
        setWorkingHours(migrateWorkingHours(selectedBusiness.data.workingHours) || getDefaultWorkingHours())
        setAdvanceBookingDays(selectedBusiness.data.advanceBookingDays ?? 7)
        // IMPORTANT: Also load unavailableDates for the selected business
        const businessUnavailableDates = migrateDateArray(selectedBusiness.data.unavailableDates) || []
        console.log('📅 Loading unavailableDates for business:', businessUnavailableDates.length, 'dates')
        setUnavailableDates(businessUnavailableDates)
      }
    }
    // Reset the lastSavedDataRef so changes are detected properly
    lastSavedDataRef.current = null
  }, [selectedCalendarBusiness, businesses, currentSupplier])

  // Compute unavailable dates based on selected business
  // When "all" is selected, don't show any blocked dates (just bookings)
  // When a specific business is selected, show only that business's blocked dates
  const filteredUnavailableDates = useMemo(() => {
    console.log('🗓️ Computing filtered unavailable dates for:', selectedCalendarBusiness)

    if (selectedCalendarBusiness === 'all') {
      // Don't show blocked dates in "All businesses" view - only show bookings
      console.log('🗓️ All businesses view - not showing blocked dates')
      return []
    } else {
      // When viewing a specific business, use the local unavailableDates state
      // This ensures manual blocks are immediately reflected in the UI
      console.log(`🗓️ Using local unavailableDates state: ${unavailableDates?.length} blocked dates`)
      return unavailableDates
    }
  }, [selectedCalendarBusiness, businesses, unavailableDates])

  // Show loading skeleton when switching between businesses
  useEffect(() => {
    if (previousBusinessRef.current !== selectedCalendarBusiness) {
      setIsCalendarLoading(true)
      // Short delay to show transition, then hide skeleton
      const timer = setTimeout(() => {
        setIsCalendarLoading(false)
      }, 300)
      previousBusinessRef.current = selectedCalendarBusiness
      return () => clearTimeout(timer)
    }
  }, [selectedCalendarBusiness])

  // Reset month picker view when opening
  useEffect(() => {
    if (showMonthPicker) {
      setMonthPickerMonth(currentMonth.getMonth())
      setMonthPickerYear(currentMonth.getFullYear())
    }
  }, [showMonthPicker, currentMonth])

  // Close month picker on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false)
      }
    }
    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMonthPicker])

  // Fetch confirmed bookings from ALL businesses
  useEffect(() => {
    const fetchBookings = async () => {
      // Get all business IDs from the businesses array
      const allBusinessIds = businesses?.map(b => b.id).filter(Boolean) || []

      // Fallback to current supplier/primary if no businesses array
      if (allBusinessIds.length === 0) {
        const supplierId = supplier?.id || primaryBusiness?.id
        if (supplierId) allBusinessIds.push(supplierId)
      }

      if (allBusinessIds.length === 0) return

      console.log('📅 Fetching bookings for ALL businesses:', allBusinessIds)

      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select(`
            id,
            party_id,
            supplier_id,
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
          .in('supplier_id', allBusinessIds)
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

        // Create a map of business IDs to names and colors
        const businessInfoMap = {}
        businesses?.forEach((b, index) => {
          businessInfoMap[b.id] = {
            name: b.name || b.data?.name || 'Unknown Business',
            color: getBusinessColor(b, index),
            index: index
          }
        })

        // Add business name and color to each booking
        const bookingsWithBusinessName = confirmedBookings.map(booking => {
          const businessInfo = businessInfoMap[booking.supplier_id] || { name: 'Unknown Business', color: BUSINESS_COLORS[0], index: 0 }
          return {
            ...booking,
            businessName: businessInfo.name,
            businessColor: businessInfo.color,
            businessIndex: businessInfo.index
          }
        })

        console.log('📅 Confirmed bookings with business names:', bookingsWithBusinessName)
        setBookings(bookingsWithBusinessName)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      }
    }

    fetchBookings()
  }, [businesses, supplier?.id, primaryBusiness?.id])

  // Auto-save - saves to the currently selected business
  const saveToDatabase = useCallback(async (data) => {
    // Don't save when viewing "all businesses" - settings are per-business
    if (selectedCalendarBusiness === 'all') {
      console.log('❌ Save skipped: viewing all businesses')
      return
    }

    const dataString = JSON.stringify({ ...data, businessId: selectedCalendarBusiness })
    if (lastSavedDataRef.current === dataString) {
      console.log('⏭️ Save skipped: no changes detected')
      return
    }

    try {
      setSaveStatus("saving")

      // Find the target business to save to
      const targetBusiness = businesses?.find(b => b.id === selectedCalendarBusiness) || primaryBusiness
      if (!targetBusiness) {
        console.error('❌ No target business found for ID:', selectedCalendarBusiness)
        throw new Error("No business found")
      }

      console.log('💾 Saving to database...')
      console.log('   Target business:', targetBusiness.id, targetBusiness.business_name || targetBusiness.name)
      console.log('   Unavailable dates being saved:', data.unavailableDates)

      const updatedData = {
        ...targetBusiness.data,
        workingHours: data.workingHours,
        unavailableDates: data.unavailableDates,
        advanceBookingDays: data.advanceBookingDays,
        availabilityVersion: "2.0",
        lastUpdated: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("suppliers")
        .update({ data: updatedData })
        .eq("id", targetBusiness.id)

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Save successful!')

      // Update the local businesses data so "All businesses" view stays in sync
      // This mutates the business object in the businesses array
      if (targetBusiness.data) {
        targetBusiness.data.unavailableDates = data.unavailableDates
        targetBusiness.data.workingHours = data.workingHours
        targetBusiness.data.advanceBookingDays = data.advanceBookingDays
        console.log('📅 Updated local business data for sync')
      }

      lastSavedDataRef.current = dataString
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }, [selectedCalendarBusiness, businesses, primaryBusiness])

  useEffect(() => {
    // Don't auto-save when viewing all businesses
    if (selectedCalendarBusiness === 'all') return
    if (!primaryBusiness && !businesses?.length) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase({ workingHours, unavailableDates, advanceBookingDays })
    }, 1500)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [workingHours, unavailableDates, advanceBookingDays, saveToDatabase, primaryBusiness, selectedCalendarBusiness, businesses])

  // Calendar navigation
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))

  // Get blocked date info for a date (uses filtered unavailable dates based on selected business)
  const getBlockedDateInfo = (date) => {
    const dateStr = dateToLocalString(date)
    return filteredUnavailableDates.find((item) => item.date === dateStr)
  }

  // Get blocked slots for a date (for calendar display)
  const getBlockedSlots = (date) => {
    return getBlockedDateInfo(date)?.timeSlots || []
  }

  // Get blocked slots from local state (for modal - always reflects current edits)
  const getLocalBlockedSlots = (date) => {
    const dateStr = dateToLocalString(date)
    const found = unavailableDates.find((item) => item.date === dateStr)
    return found?.timeSlots || []
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

  // Get working hours for a specific business (or the shared state for primary/settings)
  const getBusinessWorkingHours = (businessId) => {
    if (!businessId || businessId === 'all') return null
    const business = businesses?.find(b => b.id === businessId)
    if (business?.data?.workingHours) {
      return migrateWorkingHours(business.data.workingHours)
    }
    return null
  }

  // Check if a day is a working day based on settings
  // Only applies when viewing a specific business, not "all businesses"
  const isWorkingDay = (date) => {
    // When viewing all businesses, all days are considered working days
    if (selectedCalendarBusiness === 'all') return true

    // Get working hours for the selected business
    const businessWorkingHours = getBusinessWorkingHours(selectedCalendarBusiness) || workingHours
    const dayName = getDayName(date)
    return businessWorkingHours[dayName]?.active ?? true
  }

  // Get unavailable slots from working hours settings (e.g., morning-only means afternoon is unavailable)
  // Only applies when viewing a specific business, not "all businesses"
  const getWorkingHoursUnavailableSlots = (date) => {
    // Don't apply working hours restrictions when viewing all businesses
    if (selectedCalendarBusiness === 'all') return []

    // Get working hours for the selected business
    const businessWorkingHours = getBusinessWorkingHours(selectedCalendarBusiness) || workingHours
    const dayName = getDayName(date)
    const dayHours = businessWorkingHours[dayName]
    if (!dayHours?.active) return ['morning', 'afternoon'] // Closed = both unavailable

    const unavailable = []
    if (!dayHours.timeSlots?.morning?.available) unavailable.push('morning')
    if (!dayHours.timeSlots?.afternoon?.available) unavailable.push('afternoon')
    return unavailable
  }

  // Check if a slot is unavailable due to working hours settings
  const isSlotUnavailableFromWorkingHours = (date, slot) => {
    const unavailableSlots = getWorkingHoursUnavailableSlots(date)
    return unavailableSlots.includes(slot)
  }

  // Filter bookings based on selected calendar business
  const filteredBookings = useMemo(() => {
    if (selectedCalendarBusiness === 'all') {
      return bookings
    }
    return bookings.filter(b => b.supplier_id === selectedCalendarBusiness)
  }, [bookings, selectedCalendarBusiness])

  // Get booking for a specific date
  const getBookingForDate = (date) => {
    const dateStr = dateToLocalString(date)
    return filteredBookings.find(booking => {
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

    // Day cells - Airbnb style: taller cells with date at top
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const manualBlockedSlots = getBlockedSlots(date)
      const workingHoursUnavailable = getWorkingHoursUnavailableSlots(date)
      // Combine manual blocks with working hours restrictions
      const allUnavailableSlots = [...new Set([...manualBlockedSlots, ...workingHoursUnavailable])]
      const booking = getBookingForDate(date)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const isNonWorkingDay = !isWorkingDay(date)
      const isFullyBlocked = allUnavailableSlots.length === 2 || isNonWorkingDay
      const isPartiallyBlocked = allUnavailableSlots.length === 1 && !isNonWorkingDay
      const hasBooking = !!booking

      // Handle click - bookings open modal, available dates open time slot picker
      // Only allow blocking when a specific business is selected (not "all")
      const handleClick = () => {
        if (isPast) return
        if (hasBooking) {
          setSelectedBooking(booking)
        } else if (!isNonWorkingDay && selectedCalendarBusiness !== 'all') {
          setSelectedDate(date)
        }
      }

      // Determine which slot is blocked for partial blocks (from both manual and working hours)
      const isMorningBlocked = allUnavailableSlots.includes("morning")
      const isAfternoonBlocked = allUnavailableSlots.includes("afternoon")

      // Get business color for this booking
      const bookingColor = booking?.businessColor || BUSINESS_COLORS[0]

      days.push(
        <button
          key={day}
          onClick={handleClick}
          disabled={isPast}
          className={`
            h-24 sm:h-28 rounded-2xl border-2 transition-all relative p-3 flex flex-col overflow-hidden
            ${isPast
              ? "bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100"
              : hasBooking
                ? "cursor-pointer hover:shadow-md"
                : isNonWorkingDay
                  ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                  : isFullyBlocked
                    ? "bg-gray-100 text-gray-400 border-gray-200"
                    : isPartiallyBlocked
                      ? "bg-white border-gray-200 cursor-pointer hover:border-gray-400 hover:shadow-sm"
                      : "bg-white border-gray-200 cursor-pointer hover:border-gray-400 hover:shadow-sm"
            }
            ${hasBooking && !isPast ? "bg-gray-50 border-gray-300" : ""}
            ${isToday ? "ring-2 ring-gray-900 ring-offset-2" : ""}
          `}
        >
          {/* Diagonal overlay for partial blocks */}
          {!isPast && !hasBooking && isPartiallyBlocked && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isMorningBlocked
                  ? "linear-gradient(to bottom right, rgb(229 231 235) 50%, transparent 50%)"
                  : "linear-gradient(to top left, rgb(229 231 235) 50%, transparent 50%)"
              }}
            />
          )}

          {/* Date number - larger, bolder */}
          <span
            className={`text-lg font-semibold relative z-10 ${
              isPast ? "text-gray-300"
              : hasBooking ? "text-gray-900"
              : isFullyBlocked && !hasBooking ? "text-gray-400"
              : "text-gray-900"
            }`}
          >
            {day}
          </span>

          {/* Content area - minimal */}
          <div className="flex-1 flex flex-col justify-end mt-1 relative z-10">
            {!isPast && hasBooking && (
              <div className="flex items-center gap-1.5">
                {/* Colored dot indicator for business */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: bookingColor.dot }}
                />
                <p className="text-xs font-medium text-gray-600 truncate">
                  {booking.parties?.child_name?.split(' ')[0] || 'Booked'}
                </p>
              </div>
            )}
            {!isPast && !hasBooking && isNonWorkingDay && (
              <span className="text-sm text-gray-400 font-medium">Closed</span>
            )}
            {!isPast && !hasBooking && isPartiallyBlocked && (
              <span className="text-xs font-medium text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
                {isMorningBlocked ? "PM only" : "AM only"}
              </span>
            )}
            {!isPast && !hasBooking && isFullyBlocked && !isNonWorkingDay && (
              <span className="text-sm text-gray-400 font-medium">Blocked</span>
            )}
          </div>
        </button>
      )
    }

    return days
  }, [currentMonth, filteredUnavailableDates, workingHours, filteredBookings, businesses, selectedCalendarBusiness])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Generate months for mobile scroll view (12 months from now)
  const generateMobileMonths = () => {
    const months = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      months.push({ year: date.getFullYear(), month: date.getMonth() })
    }
    return months
  }

  // Mobile month component
  const MobileMonthView = ({ year, month }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December']

    const days = []

    // Empty cells
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const booking = getBookingForDate(date)
      const hasBooking = !!booking
      const manualBlockedSlots = getBlockedSlots(date)
      const workingHoursUnavailable = getWorkingHoursUnavailableSlots(date)
      // Combine manual blocks with working hours restrictions
      const allUnavailableSlots = [...new Set([...manualBlockedSlots, ...workingHoursUnavailable])]
      const isNonWorkingDay = !isWorkingDay(date)
      const isFullyBlocked = allUnavailableSlots.length === 2 || isNonWorkingDay
      const isPartiallyBlocked = allUnavailableSlots.length === 1 && !isNonWorkingDay
      const isMorningBlocked = allUnavailableSlots.includes("morning")

      // Get business color for booking
      const bookingColor = booking?.businessColor || BUSINESS_COLORS[0]

      // Only allow blocking when a specific business is selected (not "all")
      const handleClick = () => {
        if (isPast) return
        if (hasBooking) {
          setSelectedBooking(booking)
        } else if (!isNonWorkingDay && selectedCalendarBusiness !== 'all') {
          setSelectedDate(date)
        }
      }

      days.push(
        <button
          key={day}
          onClick={handleClick}
          disabled={isPast}
          className={`
            aspect-square p-1 border-b border-r border-gray-100 flex flex-col items-center justify-center relative overflow-hidden
            ${isPast ? 'opacity-40' : 'active:bg-gray-100'}
            ${isToday ? 'ring-2 ring-gray-900 ring-inset' : ''}
            ${isNonWorkingDay && !hasBooking ? 'bg-gray-50' : ''}
            ${isFullyBlocked && !hasBooking && !isNonWorkingDay ? 'bg-gray-100' : ''}
            ${hasBooking && !isPast ? 'bg-gray-50' : ''}
          `}
        >
          {/* Diagonal overlay for partial blocks */}
          {!isPast && !hasBooking && isPartiallyBlocked && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isMorningBlocked
                  ? "linear-gradient(to bottom right, rgb(229 231 235) 50%, transparent 50%)"
                  : "linear-gradient(to top left, rgb(229 231 235) 50%, transparent 50%)"
              }}
            />
          )}

          {/* Date number */}
          <span
            className={`text-base relative z-10 ${
              isPast ? 'text-gray-300'
              : hasBooking ? 'font-semibold text-gray-900'
              : isFullyBlocked || isNonWorkingDay ? 'text-gray-400'
              : 'text-gray-900'
            }`}
          >
            {day}
          </span>

          {/* Booking indicator - colored dot */}
          {!isPast && hasBooking && (
            <div className="flex items-center gap-0.5 relative z-10">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: bookingColor.dot }}
              />
            </div>
          )}
        </button>
      )
    }

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">
          {monthNames[month]} {year}
        </h2>
        <div className="grid grid-cols-7 gap-0 bg-white rounded-xl overflow-hidden border border-gray-200">
          {days}
        </div>
      </div>
    )
  }

  // Check if Google Calendar is connected
  const isCalendarConnected = currentBusiness?.data?.googleCalendarSync?.connected ||
                               currentBusiness?.data?.calendarIntegration?.enabled

  // Mobile calendar view
  const MobileCalendarView = () => {
    const mobileMonths = generateMobileMonths()

    // Get current selected business name for display
    const selectedBusinessName = selectedCalendarBusiness === 'all'
      ? 'All businesses'
      : businesses?.find(b => b.id === selectedCalendarBusiness)?.name || 'Calendar'

    return (
      <div className="min-h-screen bg-white">
        {/* Fixed Header - at very top like Airbnb */}
        <div className="fixed top-0 left-0 right-0 z-20 bg-white">
          {/* Title row */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
            <div className="flex items-center gap-2">
              {/* Calendar Sync Button */}
              <button
                onClick={() => setShowMobileCalendarSync(true)}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                <Calendar className="w-5 h-5 text-gray-600" />
              </button>
              {/* Settings Button - only enabled when a specific business is selected */}
              <button
                onClick={() => selectedCalendarBusiness !== 'all' && setShowSettings(true)}
                className={`p-2 rounded-full border border-gray-200 ${
                  selectedCalendarBusiness !== 'all'
                    ? 'hover:bg-gray-50'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={selectedCalendarBusiness === 'all'}
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Business Picker Bar - only show if multiple businesses */}
          {businesses?.length > 1 && (
            <button
              onClick={() => setShowMobileBusinessPicker(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white"
            >
              <span className="text-sm font-medium text-gray-900">{selectedBusinessName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Day Headers - solid white background */}
          <div className="grid grid-cols-7 bg-white border-b border-gray-200">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content - add padding top to account for fixed header */}
        <div className={`px-4 pt-4 pb-24 ${businesses?.length > 1 ? 'mt-[136px]' : 'mt-[104px]'}`}>
          {/* Months */}
          {mobileMonths.map(({ year, month }) => (
            <MobileMonthView key={`${year}-${month}`} year={year} month={month} />
          ))}

          {/* Legend */}
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-gray-200 bg-white" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[hsl(var(--primary-50))] border border-[hsl(var(--primary-200))]" />
                <span className="text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
                <span className="text-gray-600">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
                <span className="text-gray-600">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Business Picker Dropdown */}
        {showMobileBusinessPicker && (
          <div className="fixed inset-0 z-50" onClick={() => setShowMobileBusinessPicker(false)}>
            {/* Dropdown positioned below the business picker bar */}
            <div
              className="absolute left-4 right-4 top-[100px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* All businesses option */}
              <button
                onClick={() => {
                  setSelectedCalendarBusiness('all')
                  setShowMobileBusinessPicker(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 ${
                  selectedCalendarBusiness === 'all' ? 'bg-gray-50' : ''
                }`}
              >
                <span className="text-sm font-medium text-gray-900">All businesses</span>
                {selectedCalendarBusiness === 'all' && (
                  <Check className="w-4 h-4 text-gray-900" />
                )}
              </button>

              {/* Individual businesses */}
              {businesses?.map((business, index) => {
                const color = getBusinessColor(business, index)
                return (
                  <button
                    key={business.id}
                    onClick={() => {
                      setSelectedCalendarBusiness(business.id)
                      setShowMobileBusinessPicker(false)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                      selectedCalendarBusiness === business.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color.dot }}
                      />
                      <span className="text-sm font-medium text-gray-900">{business.name}</span>
                    </div>
                    {selectedCalendarBusiness === business.id && (
                      <Check className="w-4 h-4 text-gray-900" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Mobile Calendar Sync Panel */}
        {showMobileCalendarSync && (
          <div className="fixed inset-0 bg-black/50 z-50">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Calendar sync</h2>
                <button onClick={() => setShowMobileCalendarSync(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-4">Sync with external calendars to automatically block dates when you're busy.</p>
                <GoogleCalendarSync
                  onSyncToggle={(enabled) => {
                    setSupplierData(prev => ({
                      ...prev,
                      googleCalendarSync: { ...prev?.googleCalendarSync, enabled }
                    }))
                  }}
                  currentSupplier={currentSupplier}
                  authUserId={primaryBusiness?.auth_user_id}
                  targetBusiness={
                    selectedCalendarBusiness !== 'all'
                      ? businesses?.find(b => b.id === selectedCalendarBusiness)
                      : null
                  }
                  isUnifiedView={selectedCalendarBusiness === 'all'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile View - Airbnb-style scrolling calendar */}
      <div className="block md:hidden">
        <MobileCalendarView />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Calendar Header - Airbnb style */}
        <div className="flex items-center justify-between mb-6">
          {/* Month title with dropdown arrow */}
          <div className="relative" ref={monthPickerRef}>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 -ml-2 transition-colors"
            >
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </h1>
              <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 w-[320px]">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      if (monthPickerMonth === 0) {
                        setMonthPickerMonth(11)
                        setMonthPickerYear(monthPickerYear - 1)
                      } else {
                        setMonthPickerMonth(monthPickerMonth - 1)
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="font-semibold text-gray-900">
                    {new Date(monthPickerYear, monthPickerMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => {
                      if (monthPickerMonth === 11) {
                        setMonthPickerMonth(0)
                        setMonthPickerYear(monthPickerYear + 1)
                      } else {
                        setMonthPickerMonth(monthPickerMonth + 1)
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const daysInMonth = new Date(monthPickerYear, monthPickerMonth + 1, 0).getDate()
                    const firstDay = new Date(monthPickerYear, monthPickerMonth, 1).getDay()
                    const startOffset = firstDay === 0 ? 6 : firstDay - 1
                    const today = new Date()
                    const days = []

                    // Empty cells
                    for (let i = 0; i < startOffset; i++) {
                      days.push(<div key={`empty-${i}`} className="h-9" />)
                    }

                    // Day cells
                    for (let day = 1; day <= daysInMonth; day++) {
                      const isToday = day === today.getDate() &&
                                      monthPickerMonth === today.getMonth() &&
                                      monthPickerYear === today.getFullYear()

                      days.push(
                        <button
                          key={day}
                          onClick={() => {
                            setCurrentMonth(new Date(monthPickerYear, monthPickerMonth, day))
                            setShowMonthPicker(false)
                          }}
                          className={`
                            h-9 w-full rounded-full text-sm transition-all
                            hover:bg-gray-100
                            ${isToday ? 'font-bold text-gray-900' : 'text-gray-700'}
                          `}
                        >
                          {day}
                        </button>
                      )
                    }

                    return days
                  })()}
                </div>
              </div>
            )}
          </div>

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
            {isCalendarLoading ? (
              <CalendarSkeleton />
            ) : (
              <>
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
              </>
            )}

            {/* Legend - subtle bottom bar */}
            <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-gray-200 bg-white" />
                <span>Available</span>
              </div>
              {/* Show color-coded legend when multiple businesses */}
              {businesses?.length > 1 ? (
                businesses.map((business, index) => {
                  const color = getBusinessColor(business, index)
                  return (
                    <div key={business.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border border-gray-300 bg-gray-50 flex items-center justify-center">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color.dot }}
                        />
                      </div>
                      <span className="truncate max-w-[80px]">{business.name}</span>
                    </div>
                  )
                })
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-gray-300 bg-gray-50" />
                  <span>Booked</span>
                </div>
              )}
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
          <div className="lg:w-80 flex-shrink-0 space-y-3">
            {/* Calendar view dropdown - only show if multiple businesses */}
            {businesses?.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowDesktopBusinessDropdown(!showDesktopBusinessDropdown)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all bg-white"
                >
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-0.5">Calendar view</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedCalendarBusiness === 'all'
                        ? 'All businesses'
                        : businesses.find(b => b.id === selectedCalendarBusiness)?.name || 'Select business'
                      }
                    </p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDesktopBusinessDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showDesktopBusinessDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDesktopBusinessDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          setSelectedCalendarBusiness('all')
                          setShowDesktopBusinessDropdown(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                          selectedCalendarBusiness === 'all' ? 'bg-gray-50' : ''
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-900">All businesses</span>
                        {selectedCalendarBusiness === 'all' && <Check className="w-4 h-4 text-gray-900" />}
                      </button>
                      {businesses.map((business, index) => {
                        const color = getBusinessColor(business, index)
                        return (
                          <button
                            key={business.id}
                            onClick={() => {
                              setSelectedCalendarBusiness(business.id)
                              setShowDesktopBusinessDropdown(false)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              selectedCalendarBusiness === business.id ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color.dot }}
                              />
                              <span className="text-sm font-medium text-gray-900">{business.name}</span>
                            </div>
                            {selectedCalendarBusiness === business.id && <Check className="w-4 h-4 text-gray-900" />}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Availability settings card - only show when a specific business is selected */}
            {selectedCalendarBusiness !== 'all' ? (
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all bg-white text-left"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Settings for {businesses?.find(b => b.id === selectedCalendarBusiness)?.name || 'this business'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {Object.values(workingHours).filter(d => d.active).length} working days, {advanceBookingDays === 0 ? 'same-day' : `${advanceBookingDays}-day`} notice
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            ) : (
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-left">
                <p className="text-xs text-gray-500 mb-0.5">Availability settings</p>
                <p className="text-sm text-gray-500">
                  Select a specific business to edit its availability settings
                </p>
              </div>
            )}

            {/* Calendar sync card - cleaner design */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-0.5">Calendar sync</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedCalendarBusiness === 'all' || !businesses?.length
                    ? 'Sync with external calendars'
                    : `Sync for ${businesses.find(b => b.id === selectedCalendarBusiness)?.name || 'selected business'}`
                  }
                </p>
              </div>
              <GoogleCalendarSync
                onSyncToggle={(enabled) => {
                  setSupplierData(prev => ({
                    ...prev,
                    googleCalendarSync: { ...prev?.googleCalendarSync, enabled }
                  }))
                }}
                currentSupplier={currentSupplier}
                authUserId={primaryBusiness?.auth_user_id}
                targetBusiness={
                  selectedCalendarBusiness !== 'all'
                    ? businesses?.find(b => b.id === selectedCalendarBusiness)
                    : null
                }
                isUnifiedView={selectedCalendarBusiness === 'all'}
              />
            </div>

            {/* Quick stats */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <p className="text-xs text-gray-500 mb-0.5">This month</p>
              <p className="text-sm font-medium text-gray-900 mb-3">
                {filteredBookings.filter(b => {
                  const partyDate = b.parties?.party_date ? new Date(b.parties.party_date) : null
                  return partyDate &&
                         partyDate.getMonth() === currentMonth.getMonth() &&
                         partyDate.getFullYear() === currentMonth.getFullYear()
                }).length} booking{filteredBookings.filter(b => {
                  const partyDate = b.parties?.party_date ? new Date(b.parties.party_date) : null
                  return partyDate &&
                         partyDate.getMonth() === currentMonth.getMonth() &&
                         partyDate.getFullYear() === currentMonth.getFullYear()
                }).length === 1 ? '' : 's'}, {unavailableDates.filter(d => {
                  const date = new Date(d.date)
                  return date.getMonth() === currentMonth.getMonth() &&
                         date.getFullYear() === currentMonth.getFullYear() &&
                         d.timeSlots.length === 2
                }).length} blocked
              </p>
              <div className="space-y-2 pt-2 border-t border-gray-100">
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
                    {filteredBookings.filter(b => {
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
      </div>

      {/* Time slot modal */}
      {selectedDate && (
        <TimeSlotModal
          date={selectedDate}
          blockedSlots={getLocalBlockedSlots(selectedDate)}
          onToggle={handleTimeSlotToggle}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
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
        businessName={selectedCalendarBusiness !== 'all' ? businesses?.find(b => b.id === selectedCalendarBusiness)?.name : null}
      />

      {/* Auto-save indicator */}
      <AutoSaveIndicator status={saveStatus} />
    </>
  )
}

export default TimeSlotAvailabilityContent
