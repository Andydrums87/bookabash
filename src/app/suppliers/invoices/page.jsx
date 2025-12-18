"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupplier } from "@/hooks/useSupplier"
import { FileText, Clock, CheckCircle2, XCircle, DollarSign, Filter, RefreshCw, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import InvoiceCard from "./components/InvoiceCard"
import InvoiceDetailModal from "./components/InvoiceDetailModal"

// Stats card component
function StatCard({ icon: Icon, label, value, subValue, color = "gray" }) {
  const colorClasses = {
    gray: "bg-gray-50 text-gray-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600"
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subValue && (
            <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Empty state component
function EmptyState({ status }) {
  const messages = {
    all: "No invoices yet. Invoices will appear here once generated.",
    pending: "No pending invoices. All caught up!",
    approved: "No approved invoices yet.",
    declined: "No declined invoices."
  }

  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
      <p className="text-gray-500">{messages[status] || messages.all}</p>
    </div>
  )
}

export default function SupplierInvoicesPage() {
  const { supplier, currentBusiness, loading: supplierLoading } = useSupplier()
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Get supplier ID - try supplier.id first, then currentBusiness.id
  const supplierId = supplier?.id || currentBusiness?.id

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!supplierId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      params.append("supplier_id", supplierId)

      const response = await fetch(`/api/invoices?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch invoices")
      }

      setInvoices(data.invoices || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error("Error fetching invoices:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supplierId, statusFilter])

  useEffect(() => {
    if (supplierId) {
      fetchInvoices()
    }
  }, [supplierId, statusFilter, fetchInvoices])

  // Handle approve
  const handleApprove = async (invoice) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/approve`, {
        method: "POST"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve invoice")
      }

      // Update local state
      setInvoices(prev => prev.map(inv =>
        inv.id === invoice.id ? { ...inv, status: "approved", approved_at: new Date().toISOString() } : inv
      ))

      // Update stats
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1,
          pendingEarnings: prev.pendingEarnings - parseFloat(invoice.net_amount),
          approvedEarnings: prev.approvedEarnings + parseFloat(invoice.net_amount)
        }))
      }

      setIsModalOpen(false)
      setSelectedInvoice(null)
    } catch (err) {
      console.error("Error approving invoice:", err)
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle decline
  const handleDecline = async (invoice, reason) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to decline invoice")
      }

      // Update local state
      setInvoices(prev => prev.map(inv =>
        inv.id === invoice.id ? { ...inv, status: "declined", declined_at: new Date().toISOString(), decline_reason: reason } : inv
      ))

      // Update stats
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          declined: prev.declined + 1,
          pendingEarnings: prev.pendingEarnings - parseFloat(invoice.net_amount)
        }))
      }

      setIsModalOpen(false)
      setSelectedInvoice(null)
    } catch (err) {
      console.error("Error declining invoice:", err)
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // View invoice detail
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setIsModalOpen(true)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(amount || 0)
  }

  if (supplierLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">Review and approve your invoices to receive payment</p>
      </div>

      {/* Stats - Collapsible on mobile, always visible on desktop */}
      {stats && (
        <>
          {/* Mobile: Summary bar with toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-900 font-medium">{formatCurrency(stats.totalEarnings)}</span>
                <span className="text-gray-500">{stats.pending} pending</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showStats ? "rotate-180" : ""}`} />
            </button>

            {/* Expanded stats */}
            {showStats && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <StatCard
                  icon={FileText}
                  label="Total Invoices"
                  value={stats.total}
                  color="gray"
                />
                <StatCard
                  icon={Clock}
                  label="Pending"
                  value={stats.pending}
                  subValue={formatCurrency(stats.pendingEarnings)}
                  color="yellow"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Approved"
                  value={stats.approved}
                  subValue={formatCurrency(stats.approvedEarnings)}
                  color="green"
                />
                <StatCard
                  icon={DollarSign}
                  label="Total Earnings"
                  value={formatCurrency(stats.totalEarnings)}
                  color="blue"
                />
              </div>
            )}
          </div>

          {/* Desktop: Always show stats grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={FileText}
              label="Total Invoices"
              value={stats.total}
              color="gray"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              subValue={formatCurrency(stats.pendingEarnings)}
              color="yellow"
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved"
              value={stats.approved}
              subValue={formatCurrency(stats.approvedEarnings)}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              label="Total Earnings"
              value={formatCurrency(stats.totalEarnings)}
              color="blue"
            />
          </div>
        </>
      )}

      {/* Filter and Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Invoices</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvoices}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchInvoices} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Invoices Table */}
      {!loading && !error && (
        <>
          {invoices.length === 0 ? (
            <EmptyState status={statusFilter} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_100px_100px_80px] items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-500">Customer</div>
                <div className="text-sm font-medium text-gray-500">Date</div>
                <div className="text-sm font-medium text-gray-500 text-right">Amount</div>
                <div className="text-sm font-medium text-gray-500 text-right">Status</div>
              </div>

              {/* Table Body */}
              <div>
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onView={handleViewInvoice}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedInvoice(null)
        }}
        onApprove={handleApprove}
        onDecline={handleDecline}
        loading={actionLoading}
      />
    </div>
  )
}
