"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import { BusinessProvider } from "../../../contexts/BusinessContext"
import Link from "next/link"
import { Calendar, MapPin, Clock, ChevronRight, CheckCircle2, Building2 } from "lucide-react"

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

  // Filter and categorize enquiries
  const { confirmedBookings, pendingEnquiries } = useMemo(() => {
    if (!enquiries || enquiries.length === 0) {
      return { confirmedBookings: [], pendingEnquiries: [] }
    }

    // Helper to check if supplier has responded
    const hasSupplierResponded = (e) => {
      // Supplier has responded if:
      // 1. There's a supplier_response message, OR
      // 2. It's accepted but NOT auto_accepted (manual acceptance)
      return e.supplier_response || (e.status === 'accepted' && !e.auto_accepted)
    }

    // Confirmed bookings = Supplier has manually accepted/confirmed
    // - status === 'accepted' AND supplier has responded
    const confirmedBookings = enquiries
      .filter(e => e.status === 'accepted' && hasSupplierResponded(e))
      .sort((a, b) => {
        const dateA = a.parties?.party_date ? new Date(a.parties.party_date) : new Date(0)
        const dateB = b.parties?.party_date ? new Date(b.parties.party_date) : new Date(0)
        return dateA - dateB
      })

    // Pending enquiries = Awaiting supplier response
    // - status === 'pending' OR 'viewed'
    // - OR auto_accepted but supplier hasn't confirmed yet
    const pendingEnquiries = enquiries
      .filter(e => {
        // Standard pending/viewed status
        if (e.status === 'pending' || e.status === 'viewed') return true
        // Auto-accepted but supplier hasn't responded yet
        if (e.status === 'accepted' && e.auto_accepted && !e.supplier_response) return true
        return false
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return { confirmedBookings, pendingEnquiries }
  }, [enquiries])

  if (loading || enquiriesLoading) {
    return (
      <BusinessProvider>
        <DashboardSkeleton />
      </BusinessProvider>
    )
  }

  const hasEnquiries = pendingEnquiries.length > 0
  const hasBookings = confirmedBookings.length > 0

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
                    {pendingEnquiries.length} enquir{pendingEnquiries.length === 1 ? 'y' : 'ies'} to respond to
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingEnquiries.map((enquiry) => (
                      <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                    ))}
                  </div>
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
                      ? `You have ${pendingEnquiries.length} enquir${pendingEnquiries.length === 1 ? 'y' : 'ies'} waiting for a response.`
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
                    {confirmedBookings.length} confirmed booking{confirmedBookings.length === 1 ? '' : 's'}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {confirmedBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
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
