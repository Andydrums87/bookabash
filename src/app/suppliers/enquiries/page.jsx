// pages/suppliers/enquiries.js
// Supplier enquiries management page

"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Package,
  Gift,
  Loader2,
  Building2,
  Cake,
} from "lucide-react"
import Link from "next/link"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import CakeOrderCard from "./components/CakeOrderCard"

export default function SupplierEnquiriesPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get("status") || "all"
  const [activeTab, setActiveTab] = useState(initialStatus)

  // Load enquiries based on active tab
  const statusFilter = activeTab === "all" ? null : activeTab
  const { enquiries, loading, error, refetch, setEnquiries } = useSupplierEnquiries(statusFilter)

  // Helper to check if supplier has responded
  const hasSupplierResponded = (e) => {
    return e.supplier_response || (e.status === 'accepted' && !e.auto_accepted)
  }

  // Helper to check if this is a cake order
  const isCakeOrder = (e) => {
    const category = e.supplier_category?.toLowerCase() || ''
    return category.includes('cake') || category === 'cakes'
  }

  // Handle cake order status updates
  const handleCakeStatusUpdate = (enquiryId, newStatus, trackingUrl) => {
    // The enquiry list will be refetched automatically via real-time subscription
    console.log('Cake order status updated:', { enquiryId, newStatus, trackingUrl })
    refetch()
  }

  // Handle archive - optimistically update UI then refetch
  const handleArchive = (enquiryId) => {
    console.log('Order archived:', enquiryId)
    // Optimistic update - immediately mark as archived in local state
    setEnquiries(prev => prev.map(e =>
      e.id === enquiryId ? { ...e, archived: true } : e
    ))
  }

  // Filter out archived enquiries for active tabs, show only archived in "past" tab
  const activeEnquiries = enquiries.filter(e => !e.archived)
  const archivedEnquiries = enquiries.filter(e => e.archived)

  // Group enquiries by status for tabs
  // Auto-accepted enquiries without supplier response go to "pending"
  const enquiriesByStatus = {
    all: activeEnquiries,
    pending: activeEnquiries.filter((e) =>
      e.status === "pending" ||
      (e.status === "accepted" && e.auto_accepted && !e.supplier_response)
    ),
    viewed: activeEnquiries.filter((e) => e.status === "viewed"),
    accepted: activeEnquiries.filter((e) => e.status === "accepted" && hasSupplierResponded(e)),
    declined: activeEnquiries.filter((e) => e.status === "declined"),
    past: archivedEnquiries,
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "Time TBD"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      viewed: "bg-blue-100 text-blue-800 border-blue-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      declined: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      viewed: <Eye className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      declined: <XCircle className="w-4 h-4" />,
      expired: <Clock className="w-4 h-4" />,
    }
    return icons[status] || icons.pending
  }

  // In your supplier enquiries page - UPDATED EnquiryCard component
  const EnquiryCard = ({ enquiry }) => {
    const party = enquiry.parties
    const customer = party?.users
    const isAutoAccepted = enquiry?.auto_accepted || false
    const isDepositPaid = isAutoAccepted && enquiry?.status === "accepted"
    const businessName = enquiry.supplier?.businessName

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Business indicator */}
            {businessName && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-primary-600">{businessName}</span>
              </div>
            )}

            {/* Header - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                  {party?.child_name}'s {party?.theme} Party
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {customer?.first_name} {customer?.last_name}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Status badges - Mobile optimized */}
                {isDepositPaid ? (
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs sm:text-sm">
                    <span className="text-red-600 font-bold mr-1">🚨</span>
                    DEPOSIT PAID - URGENT
                  </Badge>
                ) : (
                  <Badge className={`text-xs sm:text-sm ${getStatusColor(enquiry.status)}`}>
                    {getStatusIcon(enquiry.status)}
                    <span className="ml-1 capitalize">{enquiry.status}</span>
                  </Badge>
                )}

                {/* Pulsing indicators */}
                {isDepositPaid && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />}
                {enquiry.status === "pending" && !isDepositPaid && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Special alert for auto-accepted - Mobile optimized */}
            {isDepositPaid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-red-800 font-medium">
                  🚨 PRIORITY: Customer paid £{Math.round(enquiry.quoted_price * 0.2)} deposit. Confirm availability
                  within 2 hours or PartySnap will find replacement.
                </p>
              </div>
            )}

            {/* Party Details - Mobile optimized grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{formatDate(party?.party_date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>{formatTime(party?.party_time)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>
                    {party?.guest_count} children (Age {party?.child_age})
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {party?.full_delivery_address ||
                     (party?.delivery_address_line_1
                       ? `${party.delivery_address_line_1}, ${party.delivery_postcode || party.postcode}`
                       : party?.location)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{customer?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span>{customer?.phone || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Service Details - Mobile optimized */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Service Requested</h4>
                <span className="text-lg sm:text-xl font-bold text-primary-600">£{enquiry.quoted_price}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span className="capitalize">{enquiry.supplier_category}</span>
                {enquiry.package_id && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                    Package Selected
                  </span>
                )}
                {enquiry.addon_ids && enquiry.addon_ids.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
                    {enquiry.addon_ids.length} Add-ons
                  </span>
                )}
              </div>
            </div>

            {/* Message Preview - Mobile optimized */}
            {enquiry.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-blue-800">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />"{enquiry.message.substring(0, 80)}
                  {enquiry.message.length > 80 ? "..." : ""}"
                </p>
              </div>
            )}

            {/* Response Section - Mobile optimized */}
            {enquiry.supplier_response && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-1 text-sm">Your Response:</h5>
                <p className="text-xs sm:text-sm text-green-800">{enquiry.supplier_response}</p>
                {enquiry.final_price && (
                  <p className="text-xs sm:text-sm text-green-800 mt-1">
                    <strong>Final Price: £{enquiry.final_price}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Actions - Mobile optimized */}
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
              <Button
                asChild
                className={`w-full h-10 sm:h-12 text-sm sm:text-base ${
                  isDepositPaid
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-primary-500 hover:bg-primary-600 text-white"
                }`}
              >
                <Link href={`/suppliers/enquiries/${enquiry.id}`}>
                  {isDepositPaid ? "🚨 URGENT: Confirm or Decline" : "View Full Details & Respond"}
                </Link>
              </Button>

              <div className="flex items-center justify-between">
                {isDepositPaid ? (
                  <Badge className="bg-red-100 text-red-800 text-xs">DEPOSIT PAID - RESPOND NOW</Badge>
                ) : enquiry.status === "pending" ? (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Awaiting Your Response</Badge>
                ) : null}

                <div className="text-xs text-gray-500">
                  Received {new Date(enquiry.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading your enquiries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading enquiries: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Page Header - Mobile optimized */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Party Enquiries</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage incoming party booking requests and respond to potential customers
          </p>
        </div>

        {/* Status Tabs - Mobile optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm h-auto">
            <TabsTrigger value="all" className="relative text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">All</span>
              {enquiriesByStatus.all.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-gray-500 text-white text-xs">{enquiriesByStatus.all.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">New</span>
              {enquiriesByStatus.pending.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-yellow-500 text-white text-xs">
                  {enquiriesByStatus.pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="viewed" className="relative text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Viewed</span>
              <span className="sm:hidden">Seen</span>
              {enquiriesByStatus.viewed.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-blue-500 text-white text-xs">{enquiriesByStatus.viewed.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="relative text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Accepted</span>
              <span className="sm:hidden">Yes</span>
              {enquiriesByStatus.accepted.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-green-500 text-white text-xs">
                  {enquiriesByStatus.accepted.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="declined" className="relative text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Declined</span>
              <span className="sm:hidden">No</span>
              {enquiriesByStatus.declined.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-red-500 text-white text-xs">
                  {enquiriesByStatus.declined.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="relative text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Past</span>
              <span className="sm:hidden">Past</span>
              {enquiriesByStatus.past.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-gray-400 text-white text-xs">
                  {enquiriesByStatus.past.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Mobile optimized spacing */}
          {Object.entries(enquiriesByStatus).map(([status, statusEnquiries]) => (
            <TabsContent key={status} value={status} className="space-y-4 sm:space-y-6">
              {statusEnquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      No {status === "all" ? "" : status} enquiries
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {status === "pending"
                        ? "You're all caught up! New enquiries will appear here."
                        : `No ${status} enquiries at the moment.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {statusEnquiries.map((enquiry) => {
                    const isCake = isCakeOrder(enquiry)
                    // Show CakeOrderCard for accepted cake orders (including auto-accepted)
                    const isAcceptedCake = enquiry.status === 'accepted'
                    const shouldShowCakeCard = isCake && isAcceptedCake

                    return shouldShowCakeCard ? (
                      <CakeOrderCard
                        key={enquiry.id}
                        enquiry={enquiry}
                        onStatusUpdate={handleCakeStatusUpdate}
                        onArchive={handleArchive}
                      />
                    ) : (
                      <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
