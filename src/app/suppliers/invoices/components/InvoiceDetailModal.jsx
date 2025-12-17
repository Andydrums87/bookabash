"use client"

import { useState } from "react"
import { X, FileText, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "Pending Approval",
      className: "bg-yellow-100 text-yellow-700",
      icon: Clock
    },
    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2
    },
    declined: {
      label: "Declined",
      className: "bg-red-100 text-red-700",
      icon: XCircle
    },
    paid: {
      label: "Paid",
      className: "bg-blue-100 text-blue-700",
      icon: CheckCircle2
    }
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  )
}

export default function InvoiceDetailModal({ invoice, isOpen, onClose, onApprove, onDecline, loading }) {
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  if (!isOpen || !invoice) return null

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(amount || 0)
  }

  // Get booking details from snapshot
  const bookingDetails = invoice.booking_details || {}
  const partyDetails = bookingDetails.party || {}
  const serviceDetails = bookingDetails.service || {}
  const enquiryDetails = bookingDetails.enquiry || {}

  // Handle decline
  const handleDecline = () => {
    if (showDeclineForm) {
      onDecline(invoice, declineReason)
      setDeclineReason("")
      setShowDeclineForm(false)
    } else {
      setShowDeclineForm(true)
    }
  }

  // Handle close
  const handleClose = () => {
    setShowDeclineForm(false)
    setDeclineReason("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h2>
                <p className="text-sm text-gray-500">Invoice Details</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex justify-center">
              <StatusBadge status={invoice.status} />
            </div>

            {/* PDF Actions */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = `/api/invoices/${invoice.id}/pdf`
                  link.download = `${invoice.invoice_number}.pdf`
                  link.click()
                }}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>

            {/* Amount breakdown */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-3">Payment Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking amount</span>
                  <span className="text-gray-900">{formatCurrency(invoice.gross_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee (15%)</span>
                  <span className="text-gray-500">-{formatCurrency(invoice.platform_fee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Your earnings</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(invoice.net_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service details */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Service Details</h3>
              <div className="space-y-3">
                {invoice.service_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Service Date</p>
                      <p className="text-sm text-gray-600">{formatDate(invoice.service_date)}</p>
                    </div>
                  </div>
                )}

                {partyDetails.childName && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center mt-0.5">
                      <span className="text-xs">🎂</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Event</p>
                      <p className="text-sm text-gray-600">
                        {partyDetails.childName}'s {partyDetails.theme ? `${partyDetails.theme} ` : ""}Party
                      </p>
                    </div>
                  </div>
                )}

                {partyDetails.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{partyDetails.location}</p>
                      {partyDetails.postcode && (
                        <p className="text-sm text-gray-500">{partyDetails.postcode}</p>
                      )}
                    </div>
                  </div>
                )}

                {serviceDetails.category && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Service Category</p>
                      <p className="text-sm text-gray-600 capitalize">{serviceDetails.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice dates */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Invoice Date</p>
                  <p className="text-gray-900">{formatDate(invoice.invoice_date || invoice.created_at)}</p>
                </div>
                {invoice.approved_at && (
                  <div>
                    <p className="text-gray-500">Approved</p>
                    <p className="text-gray-900">{formatDate(invoice.approved_at)}</p>
                  </div>
                )}
                {invoice.declined_at && (
                  <div>
                    <p className="text-gray-500">Declined</p>
                    <p className="text-gray-900">{formatDate(invoice.declined_at)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Decline reason if present */}
            {invoice.decline_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Decline Reason</p>
                    <p className="text-sm text-red-600 mt-1">{invoice.decline_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Decline form */}
            {showDeclineForm && invoice.status === "pending" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700 mb-2">Why are you declining this invoice?</p>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Enter reason (optional)"
                  className="w-full p-3 border border-red-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          {invoice.status === "pending" && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
              {showDeclineForm ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeclineForm(false)}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDecline}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Declining..." : "Confirm Decline"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    className="flex-1"
                    disabled={loading}
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => onApprove(invoice)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "Approving..." : "Approve Invoice"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
