"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import { BusinessProvider } from "../../../contexts/BusinessContext"
import Link from "next/link"
import { Calendar, MapPin, Clock, ChevronRight, CheckCircle2, Building2, Search, ChevronDown, ChevronUp, X, ArrowUpDown, LayoutGrid, LayoutList, Users, Package, Mail, Phone } from "lucide-react"
import EnquiryResponseModal from "./components/EnquiryResponseModal"
import CakeOrderCard from "../enquiries/components/CakeOrderCard"

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

// Booking card component - Party-focused collapsible design
function BookingCard({ booking, onView }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const party = booking.parties
  const customer = party?.users
  const partyDate = new Date(party?.party_date)
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))
  const businessName = booking.supplier?.business_name || booking.supplier?.businessName

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Compact Header - Always Visible - Clickable */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Party Name - Main Title */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {party?.child_name}'s {party?.theme} Party
              </h3>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
            </div>

            {/* Compact Info Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">
                  {partyDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{party?.guest_count} kids</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span className="capitalize">{booking.supplier_category}</span>
              </div>
            </div>

            {/* Business Name */}
            {businessName && (
              <div className="flex items-center gap-1 text-xs text-primary-600">
                <Building2 className="w-3 h-3" />
                <span>{businessName}</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            daysUntilEvent < 0 ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
          }`}>
            {daysUntilEvent < 0 ? 'Completed' :
             daysUntilEvent === 0 ? 'Today' :
             daysUntilEvent === 1 ? 'Tomorrow' :
             `In ${daysUntilEvent}d`}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Customer Details</h4>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-gray-700">
                  {customer?.first_name} {customer?.last_name}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="truncate text-xs">{customer?.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs">{customer?.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="truncate">{party?.location || party?.postcode}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span>{party?.party_time || 'TBD'}</span>
            </div>
          </div>

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(booking)
            }}
            className="w-full py-2.5 text-center text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors rounded-lg border border-primary-200"
          >
            View Full Details
          </button>
        </div>
      )}
    </div>
  )
}

// Party group card - Timeline Style Design
function PartyEnquiryGroup({ partyId, partyEnquiries, onAccept, onDecline }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get party info from the first enquiry (all share the same party)
  const firstEnquiry = partyEnquiries[0]
  const party = firstEnquiry?.parties
  const customer = party?.users
  const partyDate = new Date(party?.party_date)
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))

  // Calculate total value of all services for this party
  const totalValue = partyEnquiries.reduce((sum, e) => sum + (parseFloat(e.quoted_price) || 0), 0)

  // Get venue info
  const selectedVenue = party?.party_plan?.venue
  const originalSupplier = selectedVenue?.originalSupplier
  const venueName = originalSupplier?.name ||
                    originalSupplier?.businessName ||
                    originalSupplier?.business_name ||
                    selectedVenue?.name ||
                    selectedVenue?.businessName
  const venueAddress = originalSupplier?.venueAddress ||
                       originalSupplier?.serviceDetails?.venueAddress ||
                       originalSupplier?.owner?.address ||
                       originalSupplier?.serviceDetails?.location

  const getAddressString = () => {
    if (!venueAddress) return null
    if (venueAddress.fullAddress) return venueAddress.fullAddress
    const parts = []
    if (venueAddress.line1) parts.push(venueAddress.line1)
    if (venueAddress.line2) parts.push(venueAddress.line2)
    if (venueAddress.addressLine1) parts.push(venueAddress.addressLine1)
    if (venueAddress.addressLine2) parts.push(venueAddress.addressLine2)
    if (venueAddress.city) parts.push(venueAddress.city)
    if (venueAddress.postcode) parts.push(venueAddress.postcode)
    return parts.length > 0 ? parts.join(', ') : null
  }
  const addressString = getAddressString()

  const getStatusBadge = () => {
    if (daysUntilEvent < 0) return { text: 'Passed', color: 'bg-gray-100 text-gray-500' }
    if (daysUntilEvent === 0) return { text: 'Today', color: 'bg-red-100 text-red-700' }
    if (daysUntilEvent === 1) return { text: 'Tomorrow', color: 'bg-orange-100 text-orange-700' }
    if (daysUntilEvent <= 7) return { text: `${daysUntilEvent}d`, color: 'bg-orange-100 text-orange-700' }
    return { text: `${daysUntilEvent}d`, color: 'bg-gray-100 text-gray-600' }
  }

  const status = getStatusBadge()

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Compact Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Status Badge - Left */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.text}
          </div>

          {/* Party Info - Center */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {party?.child_name}'s {party?.theme} Party
            </h3>
            <p className="text-sm text-gray-500">
              {partyDate.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })} · {party?.party_time || 'TBD'} · {party?.guest_count} kids
            </p>
          </div>

          {/* Price & Expand - Right */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900">£{totalValue.toFixed(0)}</span>
            <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Timeline View */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          {/* Timeline Container */}
          <div className="relative pl-6">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

            {/* Customer Node */}
            <div className="relative pb-4">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                  <p className="font-medium text-gray-900">{customer?.first_name} {customer?.last_name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {customer?.email && (
                    <a href={`mailto:${customer.email}`} className="hover:text-gray-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {customer?.phone && (
                    <a href={`tel:${customer.phone}`} className="hover:text-gray-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Node */}
            <div className="relative pb-4">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                {selectedVenue && venueName ? (
                  <>
                    <p className="font-medium text-gray-900">{venueName}</p>
                    <p className="text-sm text-gray-600">{addressString || party?.location || party?.postcode}</p>
                  </>
                ) : (
                  <p className="text-gray-900">{party?.location || party?.postcode || 'To be confirmed'}</p>
                )}
              </div>
            </div>

            {/* Services Node */}
            <div className="relative">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Services ({partyEnquiries.length})
              </p>

              {/* Service Cards */}
              <div className="space-y-2">
                {partyEnquiries.map((enquiry) => {
                  const businessName = enquiry.supplier?.business_name || enquiry.supplier?.businessName

                  // Parse addon_details for package and add-ons info
                  const addonDetails = typeof enquiry?.addon_details === 'string'
                    ? JSON.parse(enquiry.addon_details || '{}')
                    : enquiry?.addon_details || {}

                  // Get package name
                  const packageName = addonDetails?.packageName ||
                                      addonDetails?.selectedPackage?.name ||
                                      addonDetails?.packageData?.name ||
                                      (enquiry.package_id ? enquiry.package_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null)

                  // Get add-ons (can be an array in addon_details or addon_ids)
                  const addons = Array.isArray(addonDetails) ? addonDetails :
                                 (addonDetails?.addons || addonDetails?.selectedAddons || [])
                  const addonIds = enquiry.addon_ids || []

                  // For cakes, get customization details
                  const cakeCustomization = addonDetails?.cakeCustomization || {}
                  const isCake = enquiry.supplier_category?.toLowerCase()?.includes('cake')

                  return (
                    <div key={enquiry.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{businessName}</span>
                            <span className="text-xs text-gray-500 capitalize">{enquiry.supplier_category}</span>
                          </div>

                          {/* Package info */}
                          {packageName && !isCake && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                              <Package className="w-3 h-3 text-primary-500" />
                              <span className="font-medium">{packageName}</span>
                            </div>
                          )}

                          {/* Cake customization */}
                          {isCake && (cakeCustomization.size || cakeCustomization.flavorName) && (
                            <div className="text-xs text-gray-600 mb-1">
                              {cakeCustomization.size && <span className="font-medium">{cakeCustomization.size}</span>}
                              {cakeCustomization.size && cakeCustomization.flavorName && ' · '}
                              {cakeCustomization.flavorName && <span>{cakeCustomization.flavorName}</span>}
                              {cakeCustomization.customMessage && (
                                <span className="block text-gray-500 mt-0.5">"{cakeCustomization.customMessage}"</span>
                              )}
                            </div>
                          )}

                          {/* Add-ons */}
                          {(addons.length > 0 || addonIds.length > 0) && (
                            <div className="text-xs text-gray-500">
                              + {addons.length || addonIds.length} add-on{(addons.length || addonIds.length) !== 1 ? 's' : ''}
                              {addons.length > 0 && (
                                <span className="text-gray-400 ml-1">
                                  ({addons.slice(0, 2).map(a => a.name || a).join(', ')}{addons.length > 2 ? '...' : ''})
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-sm font-semibold text-primary-600 mt-1">£{enquiry.quoted_price}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDecline(enquiry)
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAccept(enquiry)
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Party group card for confirmed bookings - Timeline Style Design
function PartyBookingGroup({ partyId, partyBookings, onView, isCakeOrder, handleCakeStatusUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get party info from the first booking
  const firstBooking = partyBookings[0]
  const party = firstBooking?.parties
  const customer = party?.users
  const partyDate = new Date(party?.party_date)
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))

  // Calculate total value
  const totalValue = partyBookings.reduce((sum, b) => sum + (parseFloat(b.quoted_price) || 0), 0)

  // Get venue info
  const selectedVenue = party?.party_plan?.venue
  const originalSupplier = selectedVenue?.originalSupplier
  const venueName = originalSupplier?.name ||
                    originalSupplier?.businessName ||
                    originalSupplier?.business_name ||
                    selectedVenue?.name ||
                    selectedVenue?.businessName
  const venueAddress = originalSupplier?.venueAddress ||
                       originalSupplier?.serviceDetails?.venueAddress ||
                       originalSupplier?.owner?.address ||
                       originalSupplier?.serviceDetails?.location

  const getAddressString = () => {
    if (!venueAddress) return null
    if (venueAddress.fullAddress) return venueAddress.fullAddress
    const parts = []
    if (venueAddress.line1) parts.push(venueAddress.line1)
    if (venueAddress.line2) parts.push(venueAddress.line2)
    if (venueAddress.addressLine1) parts.push(venueAddress.addressLine1)
    if (venueAddress.addressLine2) parts.push(venueAddress.addressLine2)
    if (venueAddress.city) parts.push(venueAddress.city)
    if (venueAddress.postcode) parts.push(venueAddress.postcode)
    return parts.length > 0 ? parts.join(', ') : null
  }
  const addressString = getAddressString()

  const getStatusBadge = () => {
    if (daysUntilEvent < 0) return { text: 'Done', color: 'bg-gray-100 text-gray-500' }
    if (daysUntilEvent === 0) return { text: 'Today', color: 'bg-green-100 text-green-700' }
    if (daysUntilEvent === 1) return { text: 'Tomorrow', color: 'bg-green-100 text-green-700' }
    if (daysUntilEvent <= 7) return { text: `${daysUntilEvent}d`, color: 'bg-green-100 text-green-700' }
    return { text: `${daysUntilEvent}d`, color: 'bg-blue-100 text-blue-700' }
  }

  const status = getStatusBadge()

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Compact Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Status Badge - Left */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.text}
          </div>

          {/* Party Info - Center */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {party?.child_name}'s {party?.theme} Party
              </h3>
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500">
              {partyDate.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })} · {party?.party_time || 'TBD'} · {party?.guest_count} kids
            </p>
          </div>

          {/* Price & Expand - Right */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-green-600">£{totalValue.toFixed(0)}</span>
            <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Timeline View */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          {/* Timeline Container */}
          <div className="relative pl-6">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

            {/* Customer Node */}
            <div className="relative pb-4">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                  <p className="font-medium text-gray-900">{customer?.first_name} {customer?.last_name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {customer?.email && (
                    <a href={`mailto:${customer.email}`} className="hover:text-gray-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {customer?.phone && (
                    <a href={`tel:${customer.phone}`} className="hover:text-gray-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Node */}
            <div className="relative pb-4">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                {selectedVenue && venueName ? (
                  <>
                    <p className="font-medium text-gray-900">{venueName}</p>
                    <p className="text-sm text-gray-600">{addressString || party?.location || party?.postcode}</p>
                  </>
                ) : (
                  <p className="text-gray-900">{party?.location || party?.postcode || 'To be confirmed'}</p>
                )}
              </div>
            </div>

            {/* Services Node */}
            <div className="relative">
              <div className="absolute left-[-22px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Booked ({partyBookings.length})
              </p>

              {/* Service Cards */}
              <div className="space-y-2">
                {partyBookings.map((booking) => {
                  const businessName = booking.supplier?.business_name || booking.supplier?.businessName
                  const isCake = isCakeOrder ? isCakeOrder(booking) : false

                  // Parse addon_details for package and add-ons info
                  const addonDetails = typeof booking?.addon_details === 'string'
                    ? JSON.parse(booking.addon_details || '{}')
                    : booking?.addon_details || {}

                  // Get package name
                  const packageName = addonDetails?.packageName ||
                                      addonDetails?.selectedPackage?.name ||
                                      addonDetails?.packageData?.name ||
                                      (booking.package_id ? booking.package_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null)

                  // Get add-ons (can be an array in addon_details or addon_ids)
                  const addons = Array.isArray(addonDetails) ? addonDetails :
                                 (addonDetails?.addons || addonDetails?.selectedAddons || [])
                  const addonIds = booking.addon_ids || []

                  // For cakes, get customization details
                  const cakeCustomization = addonDetails?.cakeCustomization || {}

                  return (
                    <div key={booking.id} className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 truncate">{businessName}</span>
                            <span className="text-xs text-gray-500 capitalize">{booking.supplier_category}</span>
                            {booking.order_status && (
                              <span className="text-xs bg-white text-gray-600 px-1.5 py-0.5 rounded capitalize">
                                {booking.order_status.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>

                          {/* Package info */}
                          {packageName && !isCake && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                              <Package className="w-3 h-3 text-green-500" />
                              <span className="font-medium">{packageName}</span>
                            </div>
                          )}

                          {/* Cake customization */}
                          {isCake && (cakeCustomization.size || cakeCustomization.flavorName) && (
                            <div className="text-xs text-gray-600 mb-1">
                              {cakeCustomization.size && <span className="font-medium">{cakeCustomization.size}</span>}
                              {cakeCustomization.size && cakeCustomization.flavorName && ' · '}
                              {cakeCustomization.flavorName && <span>{cakeCustomization.flavorName}</span>}
                              {cakeCustomization.customMessage && (
                                <span className="block text-gray-500 mt-0.5">"{cakeCustomization.customMessage}"</span>
                              )}
                            </div>
                          )}

                          {/* Add-ons */}
                          {(addons.length > 0 || addonIds.length > 0) && (
                            <div className="text-xs text-gray-500">
                              + {addons.length || addonIds.length} add-on{(addons.length || addonIds.length) !== 1 ? 's' : ''}
                              {addons.length > 0 && (
                                <span className="text-gray-400 ml-1">
                                  ({addons.slice(0, 2).map(a => a.name || a).join(', ')}{addons.length > 2 ? '...' : ''})
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-sm font-semibold text-green-600 mt-1">£{booking.quoted_price}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onView) onView(booking)
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact list view for enquiries - Party-focused design
function EnquiryListItem({ enquiry, onAccept, onDecline }) {
  const party = enquiry.parties
  const partyDate = new Date(party?.party_date)
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))
  const businessName = enquiry.supplier?.business_name || enquiry.supplier?.businessName

  const getStatusText = () => {
    if (daysUntilEvent < 0) return 'Event passed'
    if (daysUntilEvent === 0) return 'Today'
    if (daysUntilEvent === 1) return 'Tomorrow'
    if (daysUntilEvent <= 7) return `In ${daysUntilEvent} days`
    return `In ${daysUntilEvent} days`
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Party Name - Main Title */}
        <h3 className="font-bold text-gray-900 truncate mb-1">
          {party?.child_name}'s {party?.theme} Party
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <span className={`font-medium ${daysUntilEvent <= 7 ? 'text-orange-600' : 'text-primary-600'}`}>
            {getStatusText()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {partyDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
          <span>•</span>
          <span className="capitalize">{enquiry.supplier_category}</span>
          <span>•</span>
          <span className="font-bold text-primary-600">£{enquiry.quoted_price}</span>
          {businessName && (
            <>
              <span>•</span>
              <span className="text-primary-600 truncate">{businessName}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={() => onDecline(enquiry)}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(enquiry)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

// Compact list view for bookings - Party-focused
function BookingListItem({ booking, onView }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const party = booking.parties
  const customer = party?.users
  const partyDate = new Date(party?.party_date)
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))
  const businessName = booking.supplier?.business_name || booking.supplier?.businessName

  const getStatusText = () => {
    if (daysUntilEvent < 0) return 'Completed'
    if (daysUntilEvent === 0) return 'Today'
    if (daysUntilEvent === 1) return 'Tomorrow'
    if (daysUntilEvent <= 7) return `In ${daysUntilEvent} days`
    return `In ${daysUntilEvent} days`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Compact Header - Clickable */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Party Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {party?.child_name}'s {party?.theme} Party
            </h3>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {partyDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
            </span>
            <span>•</span>
            <span className="capitalize">{booking.supplier_category}</span>
            {businessName && (
              <>
                <span>•</span>
                <span className="text-primary-600">{businessName}</span>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
          daysUntilEvent < 0 ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
        }`}>
          {getStatusText()}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2">
          {/* Customer Info - Condensed */}
          <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
            <div className="font-medium text-gray-900">
              {customer?.first_name} {customer?.last_name}
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Mail className="w-3 h-3" />
              <span className="truncate">{customer?.email}</span>
            </div>
            {customer?.phone && (
              <div className="flex items-center gap-1 text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{customer?.phone}</span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(booking)
            }}
            className="w-full py-2 text-center text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors rounded border border-primary-200"
          >
            View Full Details
          </button>
        </div>
      )}
    </div>
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
  const { enquiries, loading: enquiriesLoading, refetch } = useSupplierEnquiries(null, null)

  // Check if this is a cake-only supplier (product-based, no enquiries flow)
  const isCakeSupplier = supplierData?.category?.toLowerCase()?.includes('cake') ||
                         supplierData?.serviceType?.toLowerCase()?.includes('cake')

  // For cake suppliers, default to "bookings" (orders) tab since they don't have enquiries
  const [activeTab, setActiveTab] = useState(isCakeSupplier ? "bookings" : "enquiries")

  // Modal state for responding to enquiries
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialResponseType, setInitialResponseType] = useState(null)

  const handleOpenResponseModal = (enquiry, responseType = null) => {
    setSelectedEnquiry(enquiry)
    setInitialResponseType(responseType)
    setIsModalOpen(true)
  }

  const handleAcceptEnquiry = (enquiry) => {
    handleOpenResponseModal(enquiry, 'accepted')
  }

  const handleDeclineEnquiry = (enquiry) => {
    handleOpenResponseModal(enquiry, 'declined')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEnquiry(null)
    setInitialResponseType(null)
  }

  const handleResponseSent = async (enquiryId, responseType) => {
    // Refresh the enquiries list
    if (refetch) {
      await refetch()
    }
  }

  // Helper to check if an enquiry is a cake order
  const isCakeOrder = (enquiry) => {
    const category = enquiry?.supplier_category?.toLowerCase() || ''
    return category.includes('cake') || category === 'cakes'
  }

  // Handle cake order status updates
  const handleCakeStatusUpdate = (enquiryId, newStatus, trackingUrl) => {
    console.log('Cake order status updated:', { enquiryId, newStatus, trackingUrl })
    if (refetch) {
      refetch()
    }
  }

  // Filter, sort, and view state for enquiries
  const [enquirySearch, setEnquirySearch] = useState('')
  const [enquirySortBy, setEnquirySortBy] = useState('newest')
  const [enquiryFilterBy, setEnquiryFilterBy] = useState('all')
  const [enquiryViewMode, setEnquiryViewMode] = useState('grid')

  // Filter, sort, and view state for bookings
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingSortBy, setBookingSortBy] = useState('event_date')
  const [bookingFilterBy, setBookingFilterBy] = useState('upcoming') // Default to upcoming
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

    // Helper to check if this is a cake order
    const checkIsCakeOrder = (e) => {
      const category = e?.supplier_category?.toLowerCase() || ''
      return category.includes('cake') || category === 'cakes'
    }

    // Confirmed bookings = Supplier has manually accepted/confirmed
    // OR cake orders that are auto-accepted (paid in full - show in Bookings with CakeOrderCard)
    const allConfirmedBookings = enquiries
      .filter(e => {
        if (e.status !== 'accepted') return false
        // Include if supplier has responded
        if (hasSupplierResponded(e)) return true
        // Include auto-accepted cake orders (paid in full)
        if (e.auto_accepted && checkIsCakeOrder(e)) return true
        return false
      })

    // Pending enquiries = Awaiting supplier response
    // Exclude auto-accepted cake orders (they go to Bookings)
    const allPendingEnquiries = enquiries
      .filter(e => {
        if (e.status === 'pending' || e.status === 'viewed') return true
        // Auto-accepted non-cake orders still need supplier response
        if (e.status === 'accepted' && e.auto_accepted && !e.supplier_response && !checkIsCakeOrder(e)) return true
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

  // Group pending enquiries by party_id
  const groupedPendingEnquiries = useMemo(() => {
    const groups = new Map()

    pendingEnquiries.forEach(enquiry => {
      const partyId = enquiry.party_id
      if (!groups.has(partyId)) {
        groups.set(partyId, [])
      }
      groups.get(partyId).push(enquiry)
    })

    // Convert to array and sort by earliest party date
    return Array.from(groups.entries())
      .map(([partyId, enquiries]) => ({ partyId, enquiries }))
      .sort((a, b) => {
        const dateA = new Date(a.enquiries[0]?.parties?.party_date || 0)
        const dateB = new Date(b.enquiries[0]?.parties?.party_date || 0)
        return dateA - dateB
      })
  }, [pendingEnquiries])

  // Helper to check if an order is completed (delivered or past party date)
  const isOrderCompleted = (booking) => {
    // Delivered orders are always completed
    if (booking.order_status === 'delivered') return true
    // Past party date is also completed
    if (getEventDaysAway(booking) < 0) return true
    return false
  }

  // Filtered and sorted confirmed bookings
  const confirmedBookings = useMemo(() => {
    let filtered = allConfirmedBookings

    // Apply search
    filtered = filtered.filter(b => matchesSearch(b, bookingSearch))

    // Apply filter
    if (bookingFilterBy === 'upcoming') {
      // Upcoming = not completed (not delivered AND party date in future)
      filtered = filtered.filter(b => !isOrderCompleted(b))
    } else if (bookingFilterBy === 'this_week') {
      filtered = filtered.filter(b => {
        const days = getEventDaysAway(b)
        return days >= 0 && days <= 7 && !isOrderCompleted(b)
      })
    } else if (bookingFilterBy === 'this_month') {
      filtered = filtered.filter(b => {
        const days = getEventDaysAway(b)
        return days >= 0 && days <= 30 && !isOrderCompleted(b)
      })
    } else if (bookingFilterBy === 'past') {
      // Past = completed (delivered OR party date passed)
      filtered = filtered.filter(b => isOrderCompleted(b))
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

  // Separate lists for "All" view - upcoming and completed
  const { upcomingBookings, completedBookings } = useMemo(() => {
    let filtered = allConfirmedBookings.filter(b => matchesSearch(b, bookingSearch))

    const upcoming = filtered.filter(b => !isOrderCompleted(b))
    const completed = filtered.filter(b => isOrderCompleted(b))

    // Sort both by event date
    const sortFn = (a, b) => {
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
          return new Date(a.parties?.party_date || 0) - new Date(b.parties?.party_date || 0)
      }
    }

    upcoming.sort(sortFn)
    completed.sort((a, b) => new Date(b.parties?.party_date || 0) - new Date(a.parties?.party_date || 0)) // Most recent first for completed

    return { upcomingBookings: upcoming, completedBookings: completed }
  }, [allConfirmedBookings, bookingSearch, bookingSortBy])

  // Group confirmed bookings by party_id
  const groupedConfirmedBookings = useMemo(() => {
    const groups = new Map()

    confirmedBookings.forEach(booking => {
      const partyId = booking.party_id
      if (!groups.has(partyId)) {
        groups.set(partyId, [])
      }
      groups.get(partyId).push(booking)
    })

    // Convert to array and sort by party date
    return Array.from(groups.entries())
      .map(([partyId, bookings]) => ({ partyId, bookings }))
      .sort((a, b) => {
        const dateA = new Date(a.bookings[0]?.parties?.party_date || 0)
        const dateB = new Date(b.bookings[0]?.parties?.party_date || 0)
        return dateA - dateB
      })
  }, [confirmedBookings])

  // Group upcoming and completed bookings by party
  const { groupedUpcoming, groupedCompleted } = useMemo(() => {
    const groupByParty = (items) => {
      const groups = new Map()
      items.forEach(item => {
        const partyId = item.party_id
        if (!groups.has(partyId)) {
          groups.set(partyId, [])
        }
        groups.get(partyId).push(item)
      })
      return Array.from(groups.entries())
        .map(([partyId, bookings]) => ({ partyId, bookings }))
        .sort((a, b) => {
          const dateA = new Date(a.bookings[0]?.parties?.party_date || 0)
          const dateB = new Date(b.bookings[0]?.parties?.party_date || 0)
          return dateA - dateB
        })
    }

    return {
      groupedUpcoming: groupByParty(upcomingBookings),
      groupedCompleted: groupByParty(completedBookings)
    }
  }, [upcomingBookings, completedBookings])

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
    // Helper inline since isOrderCompleted is outside useMemo
    const checkCompleted = (b) => b.order_status === 'delivered' || getEventDaysAway(b) < 0

    const upcoming = allConfirmedBookings.filter(b => !checkCompleted(b)).length
    const thisWeek = allConfirmedBookings.filter(b => {
      const days = getEventDaysAway(b)
      return days >= 0 && days <= 7 && !checkCompleted(b)
    }).length
    const thisMonth = allConfirmedBookings.filter(b => {
      const days = getEventDaysAway(b)
      return days >= 0 && days <= 30 && !checkCompleted(b)
    }).length
    const past = allConfirmedBookings.filter(b => checkCompleted(b)).length
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
          {/* For cake suppliers, only show Orders tab (no enquiries flow) */}
          {isCakeSupplier ? (
            <div className="flex justify-center mb-8">
              <h2 className="text-lg font-semibold text-gray-900">
                {allConfirmedBookings.length} order{allConfirmedBookings.length !== 1 ? 's' : ''}
              </h2>
            </div>
          ) : (
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
          )}

          {/* Enquiries Tab Content - Not shown for cake suppliers */}
          {activeTab === "enquiries" && !isCakeSupplier && (
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

                  {groupedPendingEnquiries.length === 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      {groupedPendingEnquiries.map(({ partyId, enquiries }) => (
                        <PartyEnquiryGroup
                          key={partyId}
                          partyId={partyId}
                          partyEnquiries={enquiries}
                          onAccept={handleAcceptEnquiry}
                          onDecline={handleDeclineEnquiry}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Bookings/Orders Tab Content - Always show for cake suppliers */}
          {(activeTab === "bookings" || isCakeSupplier) && (
            <>
              {!hasBookings ? (
                <div className="max-w-md mx-auto text-center py-12">
                  <EmptyStateIllustration />
                  <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                    {isCakeSupplier ? "No orders yet" : "No confirmed bookings yet"}
                  </h2>
                  <p className="mt-2 text-gray-500">
                    {isCakeSupplier
                      ? "When customers order your cakes, they'll appear here."
                      : hasEnquiries
                        ? `You have ${allPendingEnquiries.length} enquir${allPendingEnquiries.length === 1 ? 'y' : 'ies'} waiting for a response.`
                        : "When you accept an enquiry, the booking will appear here."
                    }
                  </p>
                  {hasEnquiries && !isCakeSupplier && (
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
                  {/* Hide header for cake suppliers since we already show order count above */}
                  {!isCakeSupplier && (
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {allConfirmedBookings.length} confirmed booking{allConfirmedBookings.length === 1 ? '' : 's'}
                    </h2>
                  )}

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

                  {groupedConfirmedBookings.length === 0 ? (
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
                  ) : bookingFilterBy === 'all' ? (
                    // Show separate sections for "All" view
                    <div className="space-y-8">
                      {/* Upcoming section */}
                      {groupedUpcoming.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                            Upcoming ({upcomingBookings.length} services across {groupedUpcoming.length} parties)
                          </h3>
                          <div className="space-y-4">
                            {groupedUpcoming.map(({ partyId, bookings }) => (
                              <PartyBookingGroup
                                key={partyId}
                                partyId={partyId}
                                partyBookings={bookings}
                                onView={handleOpenResponseModal}
                                isCakeOrder={isCakeOrder}
                                handleCakeStatusUpdate={handleCakeStatusUpdate}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Completed section */}
                      {groupedCompleted.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                            Completed ({completedBookings.length} services across {groupedCompleted.length} parties)
                          </h3>
                          <div className="space-y-4">
                            {groupedCompleted.map(({ partyId, bookings }) => (
                              <PartyBookingGroup
                                key={partyId}
                                partyId={partyId}
                                partyBookings={bookings}
                                onView={handleOpenResponseModal}
                                isCakeOrder={isCakeOrder}
                                handleCakeStatusUpdate={handleCakeStatusUpdate}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Filtered view - also grouped by party
                    <div className="space-y-4">
                      {groupedConfirmedBookings.map(({ partyId, bookings }) => (
                        <PartyBookingGroup
                          key={partyId}
                          partyId={partyId}
                          partyBookings={bookings}
                          onView={handleOpenResponseModal}
                          isCakeOrder={isCakeOrder}
                          handleCakeStatusUpdate={handleCakeStatusUpdate}
                        />
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

      {/* Enquiry Response Modal */}
      <EnquiryResponseModal
        enquiry={selectedEnquiry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onResponseSent={handleResponseSent}
        initialResponseType={initialResponseType}
      />
    </BusinessProvider>
  )
}
