"use client"

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { Shield, FileText, CheckCircle, XCircle, Clock, Loader2, Lock, Eye, ExternalLink, PoundSterling, FileSearch, Search, Download } from 'lucide-react'

// Admin emails
const ADMIN_EMAILS = ['andrew@partysnap.co.uk', 'neil@partysnap.co.uk']

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('verification')

  // Verification state
  const [suppliers, setSuppliers] = useState([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [verificationFilter, setVerificationFilter] = useState('pending')

  // Invoices state
  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoiceFilter, setInvoiceFilter] = useState('approved')
  const [invoiceStats, setInvoiceStats] = useState({ pending: 0, approved: 0, paid: 0, pendingAmount: 0, approvedAmount: 0 })
  const [invoiceSearch, setInvoiceSearch] = useState('')

  // Check admin auth
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setIsLoading(false)
        return
      }
      setUser(user)
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAuthorized(true)
      }
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  // Load data when tab changes
  useEffect(() => {
    if (!isAuthorized) return
    if (activeTab === 'verification') {
      fetchSuppliers()
    } else {
      fetchInvoices()
    }
  }, [activeTab, isAuthorized, verificationFilter, invoiceFilter])

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
    }
  }

  // ============ VERIFICATION FUNCTIONS ============
  const fetchSuppliers = async () => {
    setSuppliersLoading(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/verification/list?status=${verificationFilter}`, { headers })
      const data = await response.json()
      if (data.success) {
        setSuppliers(data.suppliers || [])
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
    setSuppliersLoading(false)
  }

  const viewSupplierDetails = async (supplierId) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/verification/list', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'getDetails', supplierId })
      })
      const data = await response.json()
      if (data.success) {
        setSelectedSupplier(data.supplier)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const viewDocument = async (docData, docType, supplierId) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/verification/view-document', {
        method: 'POST',
        headers,
        body: JSON.stringify({ cloudinaryId: docData.cloudinaryId, supplierId, documentType: docType })
      })
      const result = await response.json()
      if (result.success) {
        window.open(result.viewUrl, '_blank')
      }
    } catch (error) {
      alert('Failed to load document')
    }
  }

  const reviewDocument = async (supplierId, documentType, decision, feedback = '') => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/verification/review', {
        method: 'POST',
        headers,
        body: JSON.stringify({ supplierId, documentType, decision, feedback })
      })
      const result = await response.json()
      if (result.success) {
        alert(`Document ${decision}!`)
        fetchSuppliers()
        if (selectedSupplier?.id === supplierId) {
          viewSupplierDetails(supplierId)
        }
      }
    } catch (error) {
      alert('Review failed')
    }
  }

  // ============ INVOICE FUNCTIONS ============
  const fetchInvoices = async () => {
    setInvoicesLoading(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/invoices?status=${invoiceFilter}`, { headers })
      const data = await response.json()
      if (data.invoices) {
        setInvoices(data.invoices)
        setInvoiceStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
    setInvoicesLoading(false)
  }

  const approveInvoice = async (invoiceId) => {
    if (!confirm('Approve this invoice for payout?')) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoiceId}/approve`, {
        method: 'POST',
        headers
      })
      const result = await response.json()
      if (result.success) {
        alert('Invoice approved!')
        fetchInvoices()
      } else {
        alert('Failed: ' + result.error)
      }
    } catch (error) {
      alert('Error approving invoice')
    }
  }

  const declineInvoice = async (invoiceId) => {
    const reason = prompt('Reason for declining:')
    if (!reason) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoiceId}/decline`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason })
      })
      const result = await response.json()
      if (result.success) {
        alert('Invoice declined')
        fetchInvoices()
      }
    } catch (error) {
      alert('Error declining invoice')
    }
  }

  const markAsPaid = async (invoiceId) => {
    if (!confirm('Mark this invoice as paid?')) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        headers
      })
      const result = await response.json()
      if (result.success) {
        alert('Marked as paid!')
        fetchInvoices()
      }
    } catch (error) {
      alert('Error marking as paid')
    }
  }

  // Filter invoices by search term
  const filteredInvoices = invoices.filter(inv => {
    if (!invoiceSearch.trim()) return true
    const search = invoiceSearch.toLowerCase()
    return (
      inv.invoice_number?.toLowerCase().includes(search) ||
      inv.supplier_name?.toLowerCase().includes(search) ||
      inv.supplier_email?.toLowerCase().includes(search)
    )
  })

  // Export invoices to CSV
  const exportToCSV = () => {
    const dataToExport = filteredInvoices.length > 0 ? filteredInvoices : invoices

    const headers = ['Invoice Number', 'Supplier', 'Email', 'Service Date', 'Gross Amount', 'Platform Fee', 'Net Payout', 'Status', 'Approved At', 'Paid At']
    const rows = dataToExport.map(inv => [
      inv.invoice_number,
      inv.supplier_name,
      inv.supplier_email || '',
      inv.service_date ? new Date(inv.service_date).toLocaleDateString() : '',
      inv.gross_amount,
      inv.platform_fee,
      inv.net_amount,
      inv.status,
      inv.approved_at ? new Date(inv.approved_at).toLocaleDateString() : '',
      inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `invoices-${invoiceFilter}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // ============ RENDER ============
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-bold mb-4">Admin Login Required</h1>
          <button onClick={() => window.location.href = '/admin/login'} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have admin access.</p>
          <p className="text-sm text-gray-500 mb-4">{user.email}</p>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin/login' }} className="text-blue-600">Sign Out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin/login' }} className="text-sm text-gray-600 hover:text-gray-900">
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex gap-1 px-6">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'verification' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Verification
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'invoices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            <PoundSterling className="h-4 w-4 inline mr-2" />
            Invoices & Payouts
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ============ VERIFICATION TAB ============ */}
        {activeTab === 'verification' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Suppliers</h2>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {suppliersLoading ? (
                  <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : suppliers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No suppliers found</p>
                ) : (
                  <div className="space-y-2">
                    {suppliers.map(s => (
                      <div
                        key={s.id}
                        onClick={() => viewSupplierDetails(s.id)}
                        className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                          selectedSupplier?.id === s.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-sm text-gray-600">{s.owner.email}</p>
                          </div>
                          <StatusBadge status={s.verification.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Documents</h2>
              </div>
              <div className="p-4">
                {!selectedSupplier ? (
                  <p className="text-center text-gray-500 py-8">Select a supplier</p>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="font-medium">{selectedSupplier.business_name || selectedSupplier.name}</h3>
                      <p className="text-sm text-gray-600">{selectedSupplier.data?.owner?.email}</p>
                    </div>

                    {Object.entries(selectedSupplier.data?.verification?.documents || {}).map(([docType, docData]) => (
                      <div key={docType} className="border rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">{docType.replace('_', ' ')}</span>
                          <StatusBadge status={docData.status} />
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{docData.fileName}</p>
                        <div className="flex gap-2 flex-wrap">
                          {docData.cloudinaryId && (
                            <button
                              onClick={() => viewDocument(docData, docType, selectedSupplier.id)}
                              className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <ExternalLink className="h-3 w-3 inline mr-1" />
                              View
                            </button>
                          )}
                          {docData.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => reviewDocument(selectedSupplier.id, docType, 'approved')}
                                className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const feedback = prompt('Rejection reason:')
                                  if (feedback) reviewDocument(selectedSupplier.id, docType, 'rejected', feedback)
                                }}
                                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {Object.keys(selectedSupplier.data?.verification?.documents || {}).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ INVOICES TAB ============ */}
        {activeTab === 'invoices' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard label="Ready to Pay" value={invoiceStats.approved || 0} amount={invoiceStats.approvedAmount} color="green" />
              <StatCard label="Awaiting Supplier" value={invoiceStats.pending || 0} amount={invoiceStats.pendingAmount} color="yellow" />
              <StatCard label="Paid Out" value={invoiceStats.paid || 0} amount={invoiceStats.paidAmount} color="blue" />
              <StatCard label="Total Owed" value="" amount={(invoiceStats.pendingAmount || 0) + (invoiceStats.approvedAmount || 0)} color="gray" />
            </div>

            {/* Invoice List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Invoices</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={invoiceFilter}
                      onChange={(e) => setInvoiceFilter(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm"
                    >
                      <option value="approved">Ready to Pay ({invoiceStats.approved || 0})</option>
                      <option value="pending">Awaiting Supplier ({invoiceStats.pending || 0})</option>
                      <option value="paid">Paid ({invoiceStats.paid || 0})</option>
                      <option value="all">All</option>
                    </select>
                    <button
                      onClick={exportToCSV}
                      disabled={invoices.length === 0}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by invoice number, supplier name or email..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                {invoicesLoading ? (
                  <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : filteredInvoices.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{invoiceSearch ? 'No matching invoices' : 'No invoices found'}</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Invoice</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Supplier</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Service Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Net Payout</th>
                        {invoiceFilter === 'approved' && (
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payout Details</th>
                        )}
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono">{inv.invoice_number}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium">{inv.supplier_name}</div>
                            {inv.supplier_email && <div className="text-xs text-gray-500">{inv.supplier_email}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm">{inv.service_date ? new Date(inv.service_date).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-green-700">£{parseFloat(inv.net_amount || 0).toFixed(2)}</td>
                          {invoiceFilter === 'approved' && (
                            <td className="px-4 py-3 text-sm">
                              {inv.payout_details ? (
                                <div className="text-xs space-y-1">
                                  <div><span className="text-gray-500">Name:</span> {inv.payout_details.account_holder_name}</div>
                                  <div><span className="text-gray-500">Sort:</span> {inv.payout_details.sort_code}</div>
                                  <div><span className="text-gray-500">Acc:</span> {inv.payout_details.account_number}</div>
                                  {inv.payout_details.bank_name && <div><span className="text-gray-500">Bank:</span> {inv.payout_details.bank_name}</div>}
                                </div>
                              ) : (
                                <span className="text-xs text-orange-600">No bank details</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 text-center"><StatusBadge status={inv.status} /></td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-1 justify-center items-center">
                              <button
                                onClick={() => window.open(`/api/invoices/${inv.id}/pdf`, '_blank')}
                                className="text-xs px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                title="View Invoice"
                              >
                                <FileSearch className="h-3.5 w-3.5" />
                              </button>
                              {inv.status === 'pending' && (
                                <span className="text-xs text-gray-500 ml-1">Awaiting supplier</span>
                              )}
                              {inv.status === 'approved' && (
                                <button onClick={() => markAsPaid(inv.id)} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
                                  Mark Paid
                                </button>
                              )}
                              {inv.status === 'paid' && (
                                <span className="text-xs text-green-600 font-medium">Paid ✓</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ HELPER COMPONENTS ============
function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    declined: 'bg-red-100 text-red-800',
    paid: 'bg-blue-100 text-blue-800',
    not_started: 'bg-gray-100 text-gray-800'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || styles.not_started}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, amount, color }) {
  const colors = {
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    gray: 'border-gray-200 bg-gray-50'
  }
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      {value !== '' && <p className="text-2xl font-bold">{value}</p>}
      {amount !== undefined && <p className="text-lg font-semibold">£{parseFloat(amount || 0).toFixed(2)}</p>}
    </div>
  )
}
