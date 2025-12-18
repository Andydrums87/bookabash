"use client"

// Status text with subtle styling
function StatusBadge({ status }) {
  const styles = {
    pending: "text-gray-500",
    approved: "text-gray-700",
    declined: "text-gray-400",
    paid: "text-gray-700"
  }

  const labels = {
    pending: "Pending",
    approved: "Approved",
    declined: "Declined",
    paid: "Paid"
  }

  return (
    <span className={`text-sm ${styles[status] || styles.pending}`}>
      {labels[status] || "Pending"}
    </span>
  )
}

export default function InvoiceCard({ invoice, onView }) {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—"
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

  // Get party name
  const partyName = partyDetails.childName
    ? `${partyDetails.childName}'s Party`
    : "Party Service"

  // Get service category
  const category = serviceDetails.category
    ? serviceDetails.category.charAt(0).toUpperCase() + serviceDetails.category.slice(1)
    : "Service"

  return (
    <button
      onClick={() => onView(invoice)}
      className="w-full grid grid-cols-[1fr_100px_100px_80px] items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
    >
      {/* Customer/Party */}
      <div className="min-w-0">
        <p className="text-gray-900 font-medium truncate">{partyName}</p>
        <p className="text-gray-500 text-sm">{category}</p>
      </div>

      {/* Date */}
      <div className="text-gray-600 text-sm">
        {formatDate(invoice.service_date)}
      </div>

      {/* Amount */}
      <div className="text-gray-900 font-medium text-right">
        {formatCurrency(invoice.net_amount)}
      </div>

      {/* Status */}
      <div className="text-right">
        <StatusBadge status={invoice.status} />
      </div>
    </button>
  )
}
