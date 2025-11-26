"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Settings, Clock, Check, Loader2, AlertCircle, X, Calendar, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import GoogleCalendarSync from "./CompactGoogleCalendarSync"

// Default color palette for businesses (visually distinct, party-friendly colors)
const BUSINESS_COLORS = [
  { name: 'Primary', bg: 'hsl(var(--primary-50))', border: 'hsl(var(--primary-200))', text: 'hsl(var(--primary-700))', accent: 'hsl(var(--primary-500))' },
  { name: 'Purple', bg: '#f3e8ff', border: '#d8b4fe', text: '#7c3aed', accent: '#a855f7' },
  { name: 'Teal', bg: '#ccfbf1', border: '#5eead4', text: '#0f766e', accent: '#14b8a6' },
  { name: 'Orange', bg: '#ffedd5', border: '#fdba74', text: '#c2410c', accent: '#f97316' },
  { name: 'Pink', bg: '#fce7f3', border: '#f9a8d4', text: '#be185d', accent: '#ec4899' },
  { name: 'Blue', bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', accent: '#3b82f6' },
  { name: 'Green', bg: '#dcfce7', border: '#86efac', text: '#15803d', accent: '#22c55e' },
  { name: 'Amber', bg: '#fef3c7', border: '#fcd34d', text: '#b45309', accent: '#f59e0b' },
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
        {/* Header - uses business color */}
        <div
          className="border-b p-6"
          style={{
            backgroundColor: bookingColor.bg,
            borderColor: bookingColor.border
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <Check className="w-3 h-3" />
              Confirmed
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full transition-colors"
              style={{ backgroundColor: `${bookingColor.border}40` }}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{childName}'s Party</h2>
          {booking.businessName && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: bookingColor.accent }}
              />
              <p className="text-sm font-medium" style={{ color: bookingColor.text }}>{booking.businessName}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Date & Time */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary-50))] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[hsl(var(--primary-600))]" />
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

  // Compute unavailable dates based on selected business
  // When "all" is selected, aggregate from all businesses
  // When a specific business is selected, show only that business's blocked dates
  const filteredUnavailableDates = useMemo(() => {
    console.log('🗓️ Computing filtered unavailable dates for:', selectedCalendarBusiness)
    console.log('🗓️ Businesses available:', businesses?.length, businesses?.map(b => ({
      id: b.id,
      name: b.name || b.business_name,
      unavailableDatesCount: b.data?.unavailableDates?.length || 0
    })))

    if (selectedCalendarBusiness === 'all') {
      // Aggregate unavailable dates from ALL businesses
      const allDates = []
      const dateMap = new Map() // Track dates to avoid duplicates

      businesses?.forEach(business => {
        const businessDates = migrateDateArray(business.data?.unavailableDates) || []
        console.log(`🗓️ Business ${business.name || business.business_name}: ${businessDates.length} blocked dates`)
        businessDates.forEach(dateItem => {
          const existingDate = dateMap.get(dateItem.date)
          if (existingDate) {
            // Merge time slots if date already exists
            const mergedSlots = [...new Set([...existingDate.timeSlots, ...dateItem.timeSlots])]
            existingDate.timeSlots = mergedSlots
          } else {
            const newItem = { ...dateItem, businessId: business.id }
            dateMap.set(dateItem.date, newItem)
            allDates.push(newItem)
          }
        })
      })

      console.log('🗓️ Total aggregated blocked dates:', allDates.length)
      return allDates
    } else {
      // Show only the selected business's unavailable dates
      const selectedBusiness = businesses?.find(b => b.id === selectedCalendarBusiness)
      if (selectedBusiness) {
        const dates = migrateDateArray(selectedBusiness.data?.unavailableDates) || []
        console.log(`🗓️ Selected business ${selectedBusiness.name || selectedBusiness.business_name}: ${dates.length} blocked dates`)
        return dates
      }
      // Fallback to primary business
      const fallbackDates = migrateDateArray(currentSupplier?.unavailableDates) || []
      console.log('🗓️ Using fallback (currentSupplier):', fallbackDates.length, 'blocked dates')
      return fallbackDates
    }
  }, [selectedCalendarBusiness, businesses, currentSupplier])

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

  // Get blocked date info for a date (uses filtered unavailable dates based on selected business)
  const getBlockedDateInfo = (date) => {
    const dateStr = dateToLocalString(date)
    return filteredUnavailableDates.find((item) => item.date === dateStr)
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
      const blockedSlots = getBlockedSlots(date)
      const booking = getBookingForDate(date)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const isNonWorkingDay = !isWorkingDay(date)
      const isFullyBlocked = blockedSlots.length === 2 || isNonWorkingDay
      const isPartiallyBlocked = blockedSlots.length === 1 && !isNonWorkingDay
      const hasBooking = !!booking

      // Handle click - bookings open modal, available dates open time slot picker
      const handleClick = () => {
        if (isPast) return
        if (hasBooking) {
          setSelectedBooking(booking)
        } else if (!isNonWorkingDay) {
          setSelectedDate(date)
        }
      }

      // Determine which slot is blocked for partial blocks
      const isMorningBlocked = blockedSlots.includes("morning")
      const isAfternoonBlocked = blockedSlots.includes("afternoon")

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
            ${isToday ? "ring-2 ring-gray-900 ring-offset-2" : ""}
          `}
          style={hasBooking && !isPast ? {
            backgroundColor: bookingColor.bg,
            borderColor: bookingColor.border,
          } : undefined}
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
              : hasBooking ? ""
              : isFullyBlocked && !hasBooking ? "text-gray-400"
              : "text-gray-900"
            }`}
            style={hasBooking && !isPast ? { color: bookingColor.text } : undefined}
          >
            {day}
          </span>

          {/* Content area - more spacious */}
          <div className="flex-1 flex flex-col justify-end mt-1 relative z-10">
            {!isPast && hasBooking && (
              <div className="space-y-0.5">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: bookingColor.text }}
                >
                  {booking.parties?.child_name}'s
                </p>
                {formatPartyTime(booking) && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: bookingColor.accent }}
                  >
                    {formatPartyTime(booking)}
                  </p>
                )}
                {booking.businessName && businesses?.length > 1 && (
                  <p
                    className="text-[10px] truncate"
                    style={{ color: bookingColor.accent, opacity: 0.8 }}
                  >
                    {booking.businessName}
                  </p>
                )}
              </div>
            )}
            {!isPast && !hasBooking && isNonWorkingDay && (
              <span className="text-sm text-gray-400 font-medium">Closed</span>
            )}
            {!isPast && !hasBooking && isPartiallyBlocked && (
              <span className="text-xs font-medium text-gray-400 bg-white/80 px-1.5 py-0.5 rounded">
                <span className="line-through">{isMorningBlocked ? "AM" : "PM"}</span>
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
  }, [currentMonth, filteredUnavailableDates, workingHours, filteredBookings, businesses])

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
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: color.bg, border: `1px solid ${color.border}` }}
                      />
                      <span className="truncate max-w-[80px]">{business.name}</span>
                    </div>
                  )
                })
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-primary-200 bg-primary-50" />
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
            {/* Calendar view selector - only show if multiple businesses */}
            {businesses?.length > 1 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">Calendar view</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Choose which bookings to display</p>
                </div>
                <div className="p-3 space-y-1">
                  {/* All businesses option */}
                  <button
                    onClick={() => setSelectedCalendarBusiness('all')}
                    className={`w-full flex items-center gap-2.5 p-3.5 rounded-xl transition-all text-left ${
                      selectedCalendarBusiness === 'all'
                        ? 'bg-[hsl(var(--primary-50))] border border-[hsl(var(--primary-200))]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedCalendarBusiness === 'all'
                        ? 'bg-[hsl(var(--primary-500))] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 text-left">All businesses</p>
                      <p className="text-xs text-gray-500 text-left">Unified calendar view</p>
                    </div>
                    {selectedCalendarBusiness === 'all' && (
                      <Check className="w-4 h-4 text-[hsl(var(--primary-500))] ml-auto" />
                    )}
                  </button>

                  {/* Individual business options */}
                  {businesses.map((business, index) => {
                    const businessData = business.data || {}
                    const businessColor = getBusinessColor(business, index)
                    const currentColorIndex = businessData.calendarColorIndex ?? index

                    return (
                      <div key={business.id} className="relative">
                        <div
                          className={`w-full flex items-center gap-2.5 p-3.5 rounded-xl transition-all ${
                            selectedCalendarBusiness === business.id
                              ? 'border'
                              : 'hover:bg-gray-50'
                          }`}
                          style={selectedCalendarBusiness === business.id ? {
                            backgroundColor: businessColor.bg,
                            borderColor: businessColor.border,
                          } : undefined}
                        >
                          {/* Color indicator - clickable for color picker */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setColorPickerBusiness(colorPickerBusiness === business.id ? null : business.id)
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold hover:scale-105 transition-transform relative group"
                            style={{
                              backgroundColor: businessColor.bg,
                              border: `2px solid ${businessColor.border}`,
                              color: businessColor.text
                            }}
                            title="Click to change color"
                          >
                            {business.name?.charAt(0)?.toUpperCase() || 'B'}
                            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <Palette className="w-3 h-3 opacity-0 group-hover:opacity-70" style={{ color: businessColor.text }} />
                            </div>
                          </button>
                          {/* Business info - clickable to select */}
                          <button
                            onClick={() => setSelectedCalendarBusiness(business.id)}
                            className="flex-1 min-w-0 text-left py-1"
                          >
                            <p className="text-sm font-medium text-gray-900 text-left">{business.name}</p>
                          </button>
                          {selectedCalendarBusiness === business.id && (
                            <Check className="w-4 h-4 flex-shrink-0 ml-auto" style={{ color: businessColor.text }} />
                          )}
                        </div>
                        {/* Color picker popover */}
                        {colorPickerBusiness === business.id && (
                          <ColorPickerPopover
                            business={business}
                            currentColorIndex={currentColorIndex}
                            onColorSelect={handleColorSelect}
                            onClose={() => setColorPickerBusiness(null)}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Availability settings card */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-full p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-left">Availability settings</h3>
                  <p className="text-sm text-gray-500 mt-0.5 text-left">
                    {Object.values(workingHours).filter(d => d.active).length} working days
                  </p>
                  <p className="text-sm text-gray-500 text-left">
                    {advanceBookingDays === 0 ? 'Same-day' : `${advanceBookingDays}-day`} advance notice
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mt-0.5 flex-shrink-0" />
              </div>
            </button>

            {/* Calendar sync card - cleaner design */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Calendar sync</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCalendarBusiness === 'all' || !businesses?.length
                    ? 'Sync with external calendars'
                    : `Sync for ${businesses.find(b => b.id === selectedCalendarBusiness)?.name || 'selected business'}`
                  }
                </p>
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
                  targetBusiness={
                    selectedCalendarBusiness !== 'all'
                      ? businesses?.find(b => b.id === selectedCalendarBusiness)
                      : null
                  }
                  isUnifiedView={selectedCalendarBusiness === 'all'}
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

      {/* Time slot modal */}
      {selectedDate && (
        <TimeSlotModal
          date={selectedDate}
          blockedSlots={getBlockedSlots(selectedDate)}
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
      />

      {/* Auto-save indicator */}
      <AutoSaveIndicator status={saveStatus} />
    </div>
  )
}

export default TimeSlotAvailabilityContent
