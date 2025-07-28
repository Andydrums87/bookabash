// pages/suppliers/enquiries.js
// Supplier enquiries management page

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"

export default function SupplierEnquiriesPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const [activeTab, setActiveTab] = useState(initialStatus)
  
  // Load enquiries based on active tab
  const statusFilter = activeTab === 'all' ? null : activeTab
  const { enquiries, loading, error, refetch } = useSupplierEnquiries(statusFilter)

  // Group enquiries by status for tabs
  const enquiriesByStatus = {
    all: enquiries,
    pending: enquiries.filter(e => e.status === 'pending'),
    viewed: enquiries.filter(e => e.status === 'viewed'),
    accepted: enquiries.filter(e => e.status === 'accepted'),
    declined: enquiries.filter(e => e.status === 'declined')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      viewed: 'bg-blue-100 text-blue-800 border-blue-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      viewed: <Eye className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      declined: <XCircle className="w-4 h-4" />,
      expired: <Clock className="w-4 h-4" />
    }
    return icons[status] || icons.pending
  }

  const EnquiryCard = ({ enquiry }) => {
    const party = enquiry.parties
    const customer = party?.users

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {party?.child_name}'s {party?.theme} Party
                </h3>
                <p className="text-sm text-gray-600">
                  {customer?.first_name} {customer?.last_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(enquiry.status)}>
                  {getStatusIcon(enquiry.status)}
                  <span className="ml-1 capitalize">{enquiry.status}</span>
                </Badge>
                {enquiry.status === 'pending' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>

            {/* Party Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{formatDate(party?.party_date)}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatTime(party?.party_time)}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{party?.guest_count} children (Age {party?.child_age})</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{party?.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{customer?.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{customer?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Service Requested</h4>
                <span className="text-lg font-bold text-primary-600">
                  £{enquiry.quoted_price}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="capitalize">{enquiry.supplier_category}</span>
                {enquiry.package_id && (
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Package Selected
                  </span>
                )}
                {enquiry.addon_ids && enquiry.addon_ids.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    {enquiry.addon_ids.length} Add-ons
                  </span>
                )}
              </div>
            </div>

            {/* Message Preview */}
            {enquiry.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  "{enquiry.message.substring(0, 100)}
                  {enquiry.message.length > 100 ? '...' : ''}"
                </p>
              </div>
            )}

            {/* Response Section */}
            {enquiry.supplier_response && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-1">Your Response:</h5>
                <p className="text-sm text-green-800">{enquiry.supplier_response}</p>
                {enquiry.final_price && (
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Final Price: £{enquiry.final_price}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
              <Button 
                asChild 
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Link href={`/suppliers/enquiries/${enquiry.id}`}>
                  View Full Details & Respond
                </Link>
              </Button>
              
              {enquiry.status === 'pending' && (
                <Badge className="bg-yellow-100 text-yellow-800 self-start sm:self-center">
                  Awaiting Your Response
                </Badge>
              )}
              
              <div className="text-xs text-gray-500 self-end sm:self-center sm:ml-auto">
                Received {new Date(enquiry.created_at).toLocaleDateString()}
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
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Party Enquiries</h1>
          <p className="text-gray-600">
            Manage incoming party booking requests and respond to potential customers
          </p>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="all" className="relative">
              All
              {enquiriesByStatus.all.length > 0 && (
                <Badge className="ml-2 bg-gray-500 text-white text-xs">
                  {enquiriesByStatus.all.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {enquiriesByStatus.pending.length > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white text-xs">
                  {enquiriesByStatus.pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="viewed" className="relative">
              Viewed
              {enquiriesByStatus.viewed.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs">
                  {enquiriesByStatus.viewed.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="relative">
              Accepted
              {enquiriesByStatus.accepted.length > 0 && (
                <Badge className="ml-2 bg-green-500 text-white text-xs">
                  {enquiriesByStatus.accepted.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="declined" className="relative">
              Declined
              {enquiriesByStatus.declined.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {enquiriesByStatus.declined.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          {Object.entries(enquiriesByStatus).map(([status, statusEnquiries]) => (
            <TabsContent key={status} value={status} className="space-y-6">
              {statusEnquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No {status === 'all' ? '' : status} enquiries
                    </h3>
                    <p className="text-gray-600">
                      {status === 'pending' 
                        ? "You're all caught up! New enquiries will appear here." 
                        : `No ${status} enquiries at the moment.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {statusEnquiries.map((enquiry) => (
                    <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}