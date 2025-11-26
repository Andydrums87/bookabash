"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, User, Building2 } from "lucide-react"
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
  // Handle both "14:00" and "2:00 PM" formats
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
  return new Date(year, month, 1).getDay()
}

// Month names
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  const partyDate = party?.party_date || party?.data?.party_date
  const partyTime = party?.party_time || party?.data?.party_time
  const venue = party?.venue || party?.data?.venue || ''

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Business Name Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--primary-50))] text-[hsl(var(--primary-700))] rounded-full text-xs font-medium">
          <Building2 className="w-3 h-3" />
          {booking.businessName}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(booking.status)}`}>
          {booking.status || 'Pending'}
        </span>
      </div>

      {/* Child Name - Main heading */}
      <h3 className="font-semibold text-gray-900 text-lg mb-2">
        <User className="w-4 h-4 inline mr-2 text-gray-400" />
        {childName}'s Party
      </h3>

      {/* Time and Venue */}
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

// Calendar day cell
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

export default function SupplierCalendarPage() {
  const { businesses, loading: businessesLoading } = useBusiness()
  const { enquiries, loading: enquiriesLoading } = useAllSupplierEnquiries()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedBusiness, setSelectedBusiness] = useState('all') // 'all' or business ID

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Filter enquiries that are confirmed/accepted bookings
  const confirmedBookings = useMemo(() => {
    if (!enquiries?.length) return []

    return enquiries.filter(enquiry => {
      // Include accepted/confirmed bookings with payment
      const isConfirmed = ['accepted', 'confirmed', 'replied'].includes(enquiry.status?.toLowerCase())
      const isPaid = ['paid', 'fully_paid', 'deposit_paid'].includes(enquiry.payment_status)

      // Filter by selected business if not 'all'
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
        // Normalize the date to YYYY-MM-DD format
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

  // Navigation
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

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [currentYear, currentMonth])

  // Check if a day has bookings
  const dayHasBookings = (day) => {
    if (!day) return false
    const date = new Date(currentYear, currentMonth, day)
    const dateKey = date.toISOString().split('T')[0]
    return !!bookingsByDate[dateKey]
  }

  // Get booking count for a day
  const getBookingCount = (day) => {
    if (!day) return 0
    const date = new Date(currentYear, currentMonth, day)
    const dateKey = date.toISOString().split('T')[0]
    return bookingsByDate[dateKey]?.length || 0
  }

  // Check if day is today
  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear()
  }

  // Check if day is selected
  const isSelected = (day) => {
    if (!day) return false
    return day === selectedDate.getDate() &&
           currentMonth === selectedDate.getMonth() &&
           currentYear === selectedDate.getFullYear()
  }

  // Handle day click
  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(new Date(currentYear, currentMonth, day))
    }
  }

  // Handle booking click
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
    <div className="min-h-screen bg-white">
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
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
  )
}
