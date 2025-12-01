"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, User, Building2, Settings, ChevronDown } from "lucide-react"
import { useBusiness } from "@/contexts/BusinessContext"
import { useAllSupplierEnquiries } from "@/app/suppliers/hooks/useAllSupplierEnquries"

// Helper to format date
function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Helper to format time
function formatTime(timeString) {
  if (!timeString) return ''
  try {
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    }
    return timeString
  } catch {
    return timeString
  }
}

// Helper to get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Helper to get first day of month (0 = Sunday, 1 = Monday, etc.)
function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday (0) to 7 for Monday-first calendar
  return day === 0 ? 6 : day - 1
}

// Month names
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_MONDAY_FIRST = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Get status badge style
function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case 'accepted':
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
    case 'waiting':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'replied':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'declined':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Booking card for the selected day
function BookingCard({ booking, onClick }) {
  const party = booking.parties
  const childName = party?.child_name || party?.data?.child_name || 'Unknown'
  const partyTime = party?.party_time || party?.data?.party_time
  const venue = party?.venue || party?.data?.venue || ''

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--primary-50))] text-[hsl(var(--primary-700))] rounded-full text-xs font-medium">
          <Building2 className="w-3 h-3" />
          {booking.businessName}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(booking.status)}`}>
          {booking.status || 'Pending'}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-2">
        <User className="w-4 h-4 inline mr-2 text-gray-400" />
        {childName}'s Party
      </h3>

      <div className="space-y-1.5 text-sm text-gray-600">
        {partyTime && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatTime(partyTime)}</span>
          </div>
        )}
        {venue && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{venue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Desktop Calendar day cell
function CalendarDay({ day, isToday, isSelected, hasBookings, bookingCount, onClick, isCurrentMonth }) {
  if (!day) {
    return <div className="h-12 sm:h-16" />
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative h-12 sm:h-16 w-full rounded-xl transition-all
        ${isCurrentMonth ? '' : 'opacity-40'}
        ${isSelected
          ? 'bg-[hsl(var(--primary-500))] text-white shadow-md'
          : isToday
            ? 'bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] font-semibold'
            : 'hover:bg-gray-100'
        }
      `}
    >
      <span className={`text-sm sm:text-base ${isSelected ? 'font-semibold' : ''}`}>
        {day}
      </span>
      {hasBookings && (
        <div className={`
          absolute bottom-1 left-1/2 -translate-x-1/2
          ${isSelected ? 'bg-white' : 'bg-[hsl(var(--primary-500))]'}
          rounded-full
          ${bookingCount > 1
            ? 'px-1.5 py-0.5 text-[10px] font-medium'
            : 'w-1.5 h-1.5'
          }
          ${isSelected ? 'text-[hsl(var(--primary-500))]' : 'text-white'}
        `}>
          {bookingCount > 1 ? bookingCount : ''}
        </div>
      )}
    </button>
  )
}

// Mobile Airbnb-style scrollable month
function MobileMonth({ year, month, bookingsByDate, selectedDate, onDayClick, hourlyRate }) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year

  // Generate calendar grid
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  // Check if a specific day is today
  const isDayToday = (day) => {
    if (!day) return false
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // Check if a day is selected
  const isDaySelected = (day) => {
    if (!day || !selectedDate) return false
    return day === selectedDate.getDate() &&
           month === selectedDate.getMonth() &&
           year === selectedDate.getFullYear()
  }

  // Check if day is in the past
  const isDayPast = (day) => {
    if (!day) return false
    const date = new Date(year, month, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  }

  // Check if day has bookings
  const dayHasBookings = (day) => {
    if (!day) return false
    const date = new Date(year, month, day)
    const dateKey = date.toISOString().split('T')[0]
    return !!bookingsByDate[dateKey]
  }

  // Get price for day (weekday vs weekend)
  const getDayPrice = (day) => {
    if (!day || !hourlyRate) return null
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    // Weekend premium (Fri, Sat, Sun = 5, 6, 0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
    return isWeekend ? Math.round(hourlyRate * 1.06) : Math.round(hourlyRate * 0.94)
  }

  return (
    <div className="mb-8">
      {/* Month Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4 px-1">
        {MONTHS[month]} {year}
      </h2>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => {
          const isPast = isDayPast(day)
          const isToday = isDayToday(day)
          const isSelected = isDaySelected(day)
          const hasBooking = dayHasBookings(day)
          const price = getDayPrice(day)

          if (!day) {
            return <div key={index} className="aspect-square" />
          }

          return (
            <button
              key={index}
              onClick={() => !isPast && onDayClick(new Date(year, month, day))}
              disabled={isPast}
              className={`
                aspect-square p-1 border-b border-r border-gray-100 flex flex-col items-center justify-center
                ${isPast ? 'opacity-40' : 'active:bg-gray-100'}
                ${isSelected ? 'bg-gray-900 text-white' : ''}
                ${isToday && !isSelected ? 'font-bold' : ''}
                ${hasBooking && !isSelected ? 'bg-[hsl(var(--primary-50))]' : ''}
              `}
            >
              <span className={`text-base ${isSelected ? 'font-semibold' : ''}`}>
                {day}
              </span>
              {price && !isPast && (
                <span className={`text-xs mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                  £{price}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Mobile scroll-down calendar view (Airbnb style)
function MobileCalendarView({ bookingsByDate, selectedDate, onDayClick, hourlyRate }) {
  const scrollContainerRef = useRef(null)
  const [visibleMonthLabel, setVisibleMonthLabel] = useState('')

  // Generate 12 months from current month
  const months = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      result.push({ year: date.getFullYear(), month: date.getMonth() })
    }
    return result
  }, [])

  // Update visible month label on scroll
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const monthElements = container.querySelectorAll('[data-month]')
      for (const el of monthElements) {
        const rect = el.getBoundingClientRect()
        if (rect.top >= 0 && rect.top < 200) {
          const [year, month] = el.dataset.month.split('-')
          setVisibleMonthLabel(`${MONTHS[parseInt(month)]} ${year}`)
          break
        }
      }
    }

    handleScroll()
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">{visibleMonthLabel}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_MONDAY_FIRST.map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Months */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-24"
      >
        {months.map(({ year, month }) => (
          <div key={`${year}-${month}`} data-month={`${year}-${month}`}>
            <MobileMonth
              year={year}
              month={month}
              bookingsByDate={bookingsByDate}
              selectedDate={selectedDate}
              onDayClick={onDayClick}
              hourlyRate={hourlyRate}
            />
          </div>
        ))}

        {/* Scroll indicator */}
        <div className="flex justify-center py-4">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Month Picker Dropdown Component (Airbnb style)
function MonthPickerDropdown({ isOpen, onClose, currentYear, currentMonth, onSelectMonth }) {
  const [viewYear, setViewYear] = useState(currentYear)
  const [viewMonth, setViewMonth] = useState(currentMonth)
  const dropdownRef = useRef(null)

  // Reset view when opening
  useEffect(() => {
    if (isOpen) {
      setViewYear(currentYear)
      setViewMonth(currentMonth)
    }
  }, [isOpen, currentYear, currentMonth])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Generate calendar grid for the picker
  const generateMonthCalendar = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const today = new Date()

  const handleDayClick = (year, month, day) => {
    if (day) {
      onSelectMonth(new Date(year, month, day))
      onClose()
    }
  }

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 w-[320px]"
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900">{MONTHS[viewMonth]} {viewYear}</span>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_MONDAY_FIRST.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {generateMonthCalendar(viewYear, viewMonth).map((day, index) => {
          const isToday = day === today.getDate() &&
                          viewMonth === today.getMonth() &&
                          viewYear === today.getFullYear()

          if (!day) {
            return <div key={index} className="h-9" />
          }

          return (
            <button
              key={index}
              onClick={() => handleDayClick(viewYear, viewMonth, day)}
              className={`
                h-9 w-full rounded-full text-sm transition-all
                hover:bg-gray-100
                ${isToday ? 'font-bold text-gray-900' : 'text-gray-700'}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function SupplierCalendarPage() {
  const { businesses, currentBusiness, loading: businessesLoading } = useBusiness()
  const { enquiries, loading: enquiriesLoading } = useAllSupplierEnquiries()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Get hourly rate from current business
  const hourlyRate = useMemo(() => {
    if (!currentBusiness) return 0
    return currentBusiness.data?.serviceDetails?.hourlyRate ||
           currentBusiness.data?.serviceDetails?.pricing?.basePrice ||
           currentBusiness.data?.priceFrom ||
           0
  }, [currentBusiness])

  // Filter enquiries that are confirmed/accepted bookings
  const confirmedBookings = useMemo(() => {
    if (!enquiries?.length) return []

    return enquiries.filter(enquiry => {
      const isConfirmed = ['accepted', 'confirmed', 'replied'].includes(enquiry.status?.toLowerCase())
      const isPaid = ['paid', 'fully_paid', 'deposit_paid'].includes(enquiry.payment_status)

      if (selectedBusiness !== 'all' && enquiry.supplier_id !== selectedBusiness) {
        return false
      }

      return isConfirmed || isPaid
    })
  }, [enquiries, selectedBusiness])

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped = {}

    confirmedBookings.forEach(booking => {
      const party = booking.parties
      const partyDate = party?.party_date || party?.data?.party_date

      if (partyDate) {
        const dateKey = new Date(partyDate).toISOString().split('T')[0]
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(booking)
      }
    })

    return grouped
  }, [confirmedBookings])

  // Get bookings for selected date
  const selectedDateBookings = useMemo(() => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    return bookingsByDate[dateKey] || []
  }, [selectedDate, bookingsByDate])

  // Navigation (desktop)
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Generate calendar grid (desktop)
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [currentYear, currentMonth])

  const dayHasBookings = (day) => {
    if (!day) return false
    const date = new Date(currentYear, currentMonth, day)
    const dateKey = date.toISOString().split('T')[0]
    return !!bookingsByDate[dateKey]
  }

  const getBookingCount = (day) => {
    if (!day) return 0
    const date = new Date(currentYear, currentMonth, day)
    const dateKey = date.toISOString().split('T')[0]
    return bookingsByDate[dateKey]?.length || 0
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear()
  }

  const isSelected = (day) => {
    if (!day) return false
    return day === selectedDate.getDate() &&
           currentMonth === selectedDate.getMonth() &&
           currentYear === selectedDate.getFullYear()
  }

  const handleDayClick = (day) => {
    if (day instanceof Date) {
      setSelectedDate(day)
    } else if (day) {
      setSelectedDate(new Date(currentYear, currentMonth, day))
    }
  }

  const handleBookingClick = (booking) => {
    window.location.href = `/suppliers/enquiries/${booking.id}`
  }

  const loading = businessesLoading || enquiriesLoading

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-100 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-24 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View - Airbnb-style scrolling calendar */}
      <div className="block md:hidden">
        <MobileCalendarView
          bookingsByDate={bookingsByDate}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          hourlyRate={hourlyRate}
        />
      </div>

      {/* Desktop View - Original layout */}
      <div className="hidden md:block min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Calendar
            </h1>

            {/* Business Filter */}
            {businesses?.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary-500))] focus:border-transparent"
                >
                  <option value="all">All businesses</option>
                  {businesses.map(business => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <button
                      onClick={() => setShowMonthPicker(!showMonthPicker)}
                      className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 -ml-2 transition-colors"
                    >
                      <h2 className="text-xl font-semibold text-gray-900">
                        {MONTHS[currentMonth]} {currentYear}
                      </h2>
                      <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                    </button>
                    <MonthPickerDropdown
                      isOpen={showMonthPicker}
                      onClose={() => setShowMonthPicker(false)}
                      currentYear={currentYear}
                      currentMonth={currentMonth}
                      onSelectMonth={(date) => {
                        setCurrentDate(date)
                        setSelectedDate(date)
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToToday}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={goToPrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <CalendarDay
                      key={index}
                      day={day}
                      isToday={isToday(day)}
                      isSelected={isSelected(day)}
                      hasBookings={dayHasBookings(day)}
                      bookingCount={getBookingCount(day)}
                      onClick={() => handleDayClick(day)}
                      isCurrentMonth={true}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary-500))]" />
                    <span className="text-sm text-gray-500">Has bookings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[hsl(var(--primary-100))]" />
                    <span className="text-sm text-gray-500">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Day Bookings */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">
                    {formatDate(selectedDate)}
                  </h3>
                </div>

                {selectedDateBookings.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No bookings on this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateBookings.map(booking => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onClick={() => handleBookingClick(booking)}
                      />
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                {confirmedBookings.length > 0 && (
                  <div className="mt-6 p-4 bg-[hsl(var(--primary-50))] rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Quick stats</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{confirmedBookings.length} total booking{confirmedBookings.length !== 1 ? 's' : ''}</p>
                      {businesses?.length > 1 && selectedBusiness === 'all' && (
                        <p className="text-xs text-gray-500">
                          Across {businesses.length} businesses
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
