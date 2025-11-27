"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import { BusinessProvider } from "../../../contexts/BusinessContext"
import Link from "next/link"
import { Calendar, MapPin, Clock, ChevronRight, CheckCircle2, Building2, Search, ChevronDown, X, ArrowUpDown, LayoutGrid, LayoutList } from "lucide-react"

// Empty state illustration component (Airbnb style)
function EmptyStateIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-48 h-48 mx-auto"
      fill="none"
    >
      {/* Book/notebook illustration */}
      <rect x="40" y="60" width="120" height="100" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2"/>
      <rect x="50" y="70" width="100" height="80" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
      {/* Pages */}
      <line x1="100" y1="70" x2="100" y2="150" stroke="#E5E7EB" strokeWidth="1"/>
      {/* Bookmark */}
      <path d="M130 60 L130 85 L140 75 L150 85 L150 60" fill="#F472B6" />
      {/* Lines on page */}
      <line x1="60" y1="90" x2="90" y2="90" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="105" x2="85" y2="105" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
      <line x1="60" y1="120" x2="88" y2="120" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
      <line x1="110" y1="90" x2="140" y2="90" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
      <line x1="110" y1="105" x2="135" y2="105" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Booking card component (Airbnb style)
function BookingCard({ booking }) {
  const partyDate = new Date(booking.parties?.party_date)
  const isToday = new Date().toDateString() === partyDate.toDateString()
  const businessName = booking.supplier?.businessName

  return (
    <Link
      href={`/suppliers/enquiries/${booking.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {booking.parties?.party_name || `${booking.parties?.child_name}'s Party`}
            </h3>
            <p className="text-sm text-gray-500">
              {booking.lead_name || booking.parties?.parent_name || 'Guest'}
            </p>
          </div>
          {isToday && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              Today
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {/* Business name indicator */}
          {businessName && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-500" />
              <span className="font-medium text-primary-600">{businessName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>
              {partyDate.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
          {booking.parties?.party_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{booking.parties.party_time}</span>
            </div>
          )}
          {booking.parties?.venue_location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate">{booking.parties.venue_location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {booking.service_type || 'Service booked'}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </Link>
  )
}

// Pending enquiry card (needs response)
function EnquiryCard({ enquiry }) {
  const partyDate = new Date(enquiry.parties?.party_date)
  const businessName = enquiry.supplier?.businessName

  return (
    <Link
      href={`/suppliers/enquiries/${enquiry.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {enquiry.parties?.party_name || `${enquiry.parties?.child_name}'s Party`}
            </h3>
            <p className="text-sm text-gray-500">
              {enquiry.lead_name || enquiry.parties?.parent_name || 'New enquiry'}
            </p>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            Needs response
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {/* Business name indicator */}
          {businessName && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-500" />
              <span className="font-medium text-primary-600">{businessName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>
              {partyDate.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
        <span className="text-sm font-medium text-orange-700">
          Respond to enquiry
        </span>
        <ChevronRight className="h-4 w-4 text-orange-500" />
      </div>
    </Link>
  )
}

// Compact list view for enquiries
function EnquiryListItem({ enquiry }) {
  const partyDate = new Date(enquiry.parties?.party_date)
  const createdDate = new Date(enquiry.created_at)
  const businessName = enquiry.supplier?.businessName
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysUntilEvent <= 7 && daysUntilEvent >= 0

  return (
    <Link
      href={`/suppliers/enquiries/${enquiry.id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">
            {enquiry.parties?.party_name || `${enquiry.parties?.child_name}'s Party`}
          </h3>
          {isUrgent && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {daysUntilEvent === 0 ? 'Today' : daysUntilEvent === 1 ? 'Tomorrow' : `${daysUntilEvent} days`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{enquiry.lead_name || enquiry.parties?.parent_name}</span>
          <span className="text-gray-300">•</span>
          <span>{partyDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          {businessName && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-primary-600 truncate">{businessName}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-3">
        <span className="hidden sm:block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          Needs response
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </Link>
  )
}

// Compact list view for bookings
function BookingListItem({ booking }) {
  const partyDate = new Date(booking.parties?.party_date)
  const isToday = new Date().toDateString() === partyDate.toDateString()
  const businessName = booking.supplier?.businessName
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <Link
      href={`/suppliers/enquiries/${booking.id}`}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">
            {booking.parties?.party_name || `${booking.parties?.child_name}'s Party`}
          </h3>
          {isToday && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{booking.lead_name || booking.parties?.parent_name}</span>
          <span className="text-gray-300">•</span>
          <span>{partyDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          {booking.parties?.party_time && (
            <>
              <span className="text-gray-300">•</span>
              <span>{booking.parties.party_time}</span>
            </>
          )}
          {businessName && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-primary-600 truncate">{businessName}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-500">
          {daysUntilEvent > 0 ? `In ${daysUntilEvent} day${daysUntilEvent === 1 ? '' : 's'}` : daysUntilEvent === 0 ? 'Today' : 'Completed'}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    </Link>
  )
}

// Filter and sort controls
function FilterSortControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  viewMode,
  setViewMode,
  sortOptions,
  filterOptions,
  itemCount
}) {
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  return (
    <div className="mb-4 space-y-3">
      {/* Search and controls row - all on one line */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
          {showSortDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === option.value ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="List view"
          >
            <LayoutList className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter chips - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterBy(filterBy === option.value ? 'all' : option.value)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
              filterBy === option.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1 ${filterBy === option.value ? 'text-gray-300' : 'text-gray-400'}`}>
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded mb-8" />
        <div className="flex gap-2 mb-8">
          <div className="h-10 w-24 bg-gray-200 rounded-full" />
          <div className="h-10 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SupplierDashboard() {
  const { supplier, supplierData, loading } = useSupplier()
  // Fetch enquiries for ALL businesses (pass null for specificBusinessId)
  const { enquiries, loading: enquiriesLoading } = useSupplierEnquiries(null, null)
  const [activeTab, setActiveTab] = useState("enquiries")

  // Filter, sort, and view state for enquiries
  const [enquirySearch, setEnquirySearch] = useState('')
  const [enquirySortBy, setEnquirySortBy] = useState('newest')
  const [enquiryFilterBy, setEnquiryFilterBy] = useState('all')
  const [enquiryViewMode, setEnquiryViewMode] = useState('grid')

  // Filter, sort, and view state for bookings
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingSortBy, setBookingSortBy] = useState('event_date')
  const [bookingFilterBy, setBookingFilterBy] = useState('all')
  const [bookingViewMode, setBookingViewMode] = useState('grid')

  // Filter and categorize enquiries (base data)
  const { allConfirmedBookings, allPendingEnquiries } = useMemo(() => {
    if (!enquiries || enquiries.length === 0) {
      return { allConfirmedBookings: [], allPendingEnquiries: [] }
    }

    // Helper to check if supplier has responded
    const hasSupplierResponded = (e) => {
      return e.supplier_response || (e.status === 'accepted' && !e.auto_accepted)
    }

    // Confirmed bookings = Supplier has manually accepted/confirmed
    const allConfirmedBookings = enquiries
      .filter(e => e.status === 'accepted' && hasSupplierResponded(e))

    // Pending enquiries = Awaiting supplier response
    const allPendingEnquiries = enquiries
      .filter(e => {
        if (e.status === 'pending' || e.status === 'viewed') return true
        if (e.status === 'accepted' && e.auto_accepted && !e.supplier_response) return true
        return false
      })

    return { allConfirmedBookings, allPendingEnquiries }
  }, [enquiries])

  // Helper functions for filtering
  const getEventDaysAway = (item) => {
    const partyDate = new Date(item.parties?.party_date)
    return Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))
  }

  const matchesSearch = (item, query) => {
    if (!query) return true
    const searchLower = query.toLowerCase()
    const partyName = (item.parties?.party_name || '').toLowerCase()
    const childName = (item.parties?.child_name || '').toLowerCase()
    const leadName = (item.lead_name || item.parties?.parent_name || '').toLowerCase()
    const businessName = (item.supplier?.businessName || '').toLowerCase()
    return partyName.includes(searchLower) ||
           childName.includes(searchLower) ||
           leadName.includes(searchLower) ||
           businessName.includes(searchLower)
  }

  // Filtered and sorted pending enquiries
  const pendingEnquiries = useMemo(() => {
    let filtered = allPendingEnquiries

    // Apply search
    filtered = filtered.filter(e => matchesSearch(e, enquirySearch))

    // Apply filter
    if (enquiryFilterBy === 'urgent') {
      filtered = filtered.filter(e => getEventDaysAway(e) <= 7 && getEventDaysAway(e) >= 0)
    } else if (enquiryFilterBy === 'this_week') {
      filtered = filtered.filter(e => {
        const days = getEventDaysAway(e)
        return days >= 0 && days <= 7
      })
    } else if (enquiryFilterBy === 'this_month') {
      filtered = filtered.filter(e => {
        const days = getEventDaysAway(e)
        return days >= 0 && days <= 30
      })
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (enquirySortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'event_date':
          return new Date(a.parties?.party_date || 0) - new Date(b.parties?.party_date || 0)
        case 'event_date_desc':
          return new Date(b.parties?.party_date || 0) - new Date(a.parties?.party_date || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [allPendingEnquiries, enquirySearch, enquiryFilterBy, enquirySortBy])

  // Filtered and sorted confirmed bookings
  const confirmedBookings = useMemo(() => {
    let filtered = allConfirmedBookings

    // Apply search
    filtered = filtered.filter(b => matchesSearch(b, bookingSearch))

    // Apply filter
    if (bookingFilterBy === 'upcoming') {
      filtered = filtered.filter(b => getEventDaysAway(b) >= 0)
    } else if (bookingFilterBy === 'this_week') {
      filtered = filtered.filter(b => {
        const days = getEventDaysAway(b)
        return days >= 0 && days <= 7
      })
    } else if (bookingFilterBy === 'this_month') {
      filtered = filtered.filter(b => {
        const days = getEventDaysAway(b)
        return days >= 0 && days <= 30
      })
    } else if (bookingFilterBy === 'past') {
      filtered = filtered.filter(b => getEventDaysAway(b) < 0)
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (bookingSortBy) {
        case 'event_date':
          return new Date(a.parties?.party_date || 0) - new Date(b.parties?.party_date || 0)
        case 'event_date_desc':
          return new Date(b.parties?.party_date || 0) - new Date(a.parties?.party_date || 0)
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        default:
          return 0
      }
    })

    return filtered
  }, [allConfirmedBookings, bookingSearch, bookingFilterBy, bookingSortBy])

  // Calculate filter counts for chips
  const enquiryFilterCounts = useMemo(() => {
    const urgent = allPendingEnquiries.filter(e => {
      const days = getEventDaysAway(e)
      return days <= 7 && days >= 0
    }).length
    const thisWeek = allPendingEnquiries.filter(e => {
      const days = getEventDaysAway(e)
      return days >= 0 && days <= 7
    }).length
    const thisMonth = allPendingEnquiries.filter(e => {
      const days = getEventDaysAway(e)
      return days >= 0 && days <= 30
    }).length
    return { urgent, thisWeek, thisMonth, all: allPendingEnquiries.length }
  }, [allPendingEnquiries])

  const bookingFilterCounts = useMemo(() => {
    const upcoming = allConfirmedBookings.filter(b => getEventDaysAway(b) >= 0).length
    const thisWeek = allConfirmedBookings.filter(b => {
      const days = getEventDaysAway(b)
      return days >= 0 && days <= 7
    }).length
    const thisMonth = allConfirmedBookings.filter(b => {
      const days = getEventDaysAway(b)
      return days >= 0 && days <= 30
    }).length
    const past = allConfirmedBookings.filter(b => getEventDaysAway(b) < 0).length
    return { upcoming, thisWeek, thisMonth, past, all: allConfirmedBookings.length }
  }, [allConfirmedBookings])

  // Sort options
  const enquirySortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'event_date', label: 'Event date (soonest)' },
    { value: 'event_date_desc', label: 'Event date (latest)' },
  ]

  const bookingSortOptions = [
    { value: 'event_date', label: 'Event date (soonest)' },
    { value: 'event_date_desc', label: 'Event date (latest)' },
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
  ]

  // Filter options
  const enquiryFilterOptions = [
    { value: 'all', label: 'All', count: enquiryFilterCounts.all },
    { value: 'urgent', label: 'Urgent', count: enquiryFilterCounts.urgent },
    { value: 'this_week', label: 'This week', count: enquiryFilterCounts.thisWeek },
    { value: 'this_month', label: 'This month', count: enquiryFilterCounts.thisMonth },
  ]

  const bookingFilterOptions = [
    { value: 'all', label: 'All', count: bookingFilterCounts.all },
    { value: 'upcoming', label: 'Upcoming', count: bookingFilterCounts.upcoming },
    { value: 'this_week', label: 'This week', count: bookingFilterCounts.thisWeek },
    { value: 'this_month', label: 'This month', count: bookingFilterCounts.thisMonth },
    { value: 'past', label: 'Past', count: bookingFilterCounts.past },
  ]

  if (loading || enquiriesLoading) {
    return (
      <BusinessProvider>
        <DashboardSkeleton />
      </BusinessProvider>
    )
  }

  const hasEnquiries = allPendingEnquiries.length > 0
  const hasBookings = allConfirmedBookings.length > 0

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Enquiries/Bookings Toggle - Airbnb style */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab("enquiries")}
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
                  activeTab === "enquiries"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Enquiries
                {hasEnquiries && (
                  <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingEnquiries.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
                  activeTab === "bookings"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bookings
                {hasBookings && (
                  <span className="bg-gray-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {confirmedBookings.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Enquiries Tab Content */}
          {activeTab === "enquiries" && (
            <>
              {!hasEnquiries ? (
                <div className="max-w-md mx-auto text-center py-12">
                  <EmptyStateIllustration />
                  <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                    No pending enquiries
                  </h2>
                  <p className="mt-2 text-gray-500">
                    When customers send you enquiries, they'll appear here for you to respond to.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {allPendingEnquiries.length} enquir{allPendingEnquiries.length === 1 ? 'y' : 'ies'} to respond to
                  </h2>

                  <FilterSortControls
                    searchQuery={enquirySearch}
                    setSearchQuery={setEnquirySearch}
                    sortBy={enquirySortBy}
                    setSortBy={setEnquirySortBy}
                    filterBy={enquiryFilterBy}
                    setFilterBy={setEnquiryFilterBy}
                    viewMode={enquiryViewMode}
                    setViewMode={setEnquiryViewMode}
                    sortOptions={enquirySortOptions}
                    filterOptions={enquiryFilterOptions}
                    itemCount={pendingEnquiries.length}
                  />

                  {pendingEnquiries.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No enquiries match your filters</p>
                      <button
                        onClick={() => {
                          setEnquirySearch('')
                          setEnquiryFilterBy('all')
                        }}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : enquiryViewMode === 'grid' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pendingEnquiries.map((enquiry) => (
                        <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingEnquiries.map((enquiry) => (
                        <EnquiryListItem key={enquiry.id} enquiry={enquiry} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Bookings Tab Content */}
          {activeTab === "bookings" && (
            <>
              {!hasBookings ? (
                <div className="max-w-md mx-auto text-center py-12">
                  <EmptyStateIllustration />
                  <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                    No confirmed bookings yet
                  </h2>
                  <p className="mt-2 text-gray-500">
                    {hasEnquiries
                      ? `You have ${allPendingEnquiries.length} enquir${allPendingEnquiries.length === 1 ? 'y' : 'ies'} waiting for a response.`
                      : "When you accept an enquiry, the booking will appear here."
                    }
                  </p>
                  {hasEnquiries && (
                    <Button
                      onClick={() => setActiveTab("enquiries")}
                      className="mt-6 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-6"
                    >
                      View enquiries
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {allConfirmedBookings.length} confirmed booking{allConfirmedBookings.length === 1 ? '' : 's'}
                  </h2>

                  <FilterSortControls
                    searchQuery={bookingSearch}
                    setSearchQuery={setBookingSearch}
                    sortBy={bookingSortBy}
                    setSortBy={setBookingSortBy}
                    filterBy={bookingFilterBy}
                    setFilterBy={setBookingFilterBy}
                    viewMode={bookingViewMode}
                    setViewMode={setBookingViewMode}
                    sortOptions={bookingSortOptions}
                    filterOptions={bookingFilterOptions}
                    itemCount={confirmedBookings.length}
                  />

                  {confirmedBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No bookings match your filters</p>
                      <button
                        onClick={() => {
                          setBookingSearch('')
                          setBookingFilterBy('all')
                        }}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : bookingViewMode === 'grid' ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {confirmedBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {confirmedBookings.map((booking) => (
                        <BookingListItem key={booking.id} booking={booking} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Incomplete Profile Banner */}
          {!supplierData?.onboardingCompleted && !supplierData?.isComplete && (
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">
                Complete your profile
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Finish setting up your profile to start receiving bookings.
              </p>
              <Link href="/suppliers/onboarding/new-supplier">
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  Continue setup
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </BusinessProvider>
  )
}
