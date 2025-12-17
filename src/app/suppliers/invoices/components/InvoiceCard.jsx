"use client"

import { FileText, Calendar, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react"

// Status indicator dot
function StatusDot({ status }) {
  const colors = {
    pending: "bg-yellow-400",
    approved: "bg-green-400",
    declined: "bg-red-400",
    paid: "bg-blue-400"
  }

  return (
    <span className={`w-2 h-2 rounded-full ${colors[status] || colors.pending}`} />
  )
}

export default function InvoiceCard({ invoice, onView }) {
  // Format date
  const formatDate = (dateString) => {
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

  return (
    <button
      onClick={() => onView(invoice)}
      className="w-full bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all text-left"
    >
      {/* Invoice number with status dot */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <StatusDot status={invoice.status} />
          <span className="font-medium text-gray-900 text-xs">{invoice.invoice_number}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* Child's name */}
      <p className="text-gray-800 font-medium text-sm truncate mb-1">
        {partyDetails.childName ? `${partyDetails.childName}'s Party` : 'Party Service'}
      </p>

      {/* Service date and amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(invoice.service_date)}</span>
        </div>
        <span className="font-semibold text-green-600 text-sm">{formatCurrency(invoice.net_amount)}</span>
      </div>
    </button>
  )
}
