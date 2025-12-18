"use client"

import { useState } from "react"
import { X, FileText, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Download, ExternalLink, Cake, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvoiceDetailModal({ invoice, isOpen, onClose, onApprove, onDecline, loading }) {
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  if (!isOpen || !invoice) return null

  // Format date - short version
  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
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

  // Status config
  const statusConfig = {
    pending: { label: "Awaiting Approval", className: "text-amber-600 bg-amber-50", icon: Clock },
    approved: { label: "Approved", className: "text-green-600 bg-green-50", icon: CheckCircle2 },
    declined: { label: "Declined", className: "text-red-600 bg-red-50", icon: XCircle },
    paid: { label: "Paid", className: "text-blue-600 bg-blue-50", icon: CheckCircle2 }
  }
  const status = statusConfig[invoice.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center">
        <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">

          {/* Header - Compact */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">{invoice.invoice_number}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            {/* Hero - Your Earnings */}
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-1">Your earnings</p>
              <p className="text-4xl font-bold text-gray-900">{formatCurrency(invoice.net_amount)}</p>
              <p className="text-sm text-gray-400 mt-2">
                {formatCurrency(invoice.gross_amount)} booking − {formatCurrency(invoice.platform_fee)} fee
              </p>
            </div>

            {/* Service Summary Card */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {serviceDetails.category?.toLowerCase() === 'cakes' ? (
                    <Cake className="w-5 h-5 text-pink-500" />
                  ) : (
                    <PartyPopper className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {serviceDetails.packageName || serviceDetails.category || 'Service'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {partyDetails.childName ? `${partyDetails.childName}'s ${partyDetails.theme || ''} Party` : 'Party Service'}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDateShort(invoice.service_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{partyDetails.postcode || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* PDF Actions - Small */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View PDF
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = `/api/invoices/${invoice.id}/pdf`
                  link.download = `${invoice.invoice_number}.pdf`
                  link.click()
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            {/* Decline reason if present */}
            {invoice.decline_reason && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Decline reason</p>
                    <p className="text-sm text-red-600 mt-0.5">{invoice.decline_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Decline form */}
            {showDeclineForm && invoice.status === "pending" && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-red-700 mb-2">Why are you declining?</p>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Enter reason (optional)"
                  className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Footer CTAs */}
          {invoice.status === "pending" && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              {showDeclineForm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeclineForm(false)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={loading}
                    className="flex-1 py-3 px-4 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Declining..." : "Confirm Decline"}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={loading}
                    className="py-3 px-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onApprove(invoice)}
                    disabled={loading}
                    className="flex-1 py-3 px-4 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Approving..." : "Approve Invoice"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* For non-pending invoices, show close button */}
          {invoice.status !== "pending" && (
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
