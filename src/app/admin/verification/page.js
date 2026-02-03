"use client"

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { Shield, FileText, CheckCircle, XCircle, Clock, Loader2, Lock, Eye, ExternalLink, PoundSterling, FileSearch, Search, Download, Users, Activity, ChevronRight, X, Globe, Monitor, Smartphone, Tablet } from 'lucide-react'

// Admin emails
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

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

  // CRM state
  const [crmSessions, setCrmSessions] = useState([])
  const [crmLoading, setCrmLoading] = useState(false)
  const [crmFilter, setCrmFilter] = useState('all')
  const [crmDaysFilter, setCrmDaysFilter] = useState('30')
  const [crmSearch, setCrmSearch] = useState('')
  const [crmStats, setCrmStats] = useState({ total: 0, browsing: 0, checkout: 0, paid: 0, abandoned: 0, with_email: 0, conversion_rate: 0 })
  const [crmFunnel, setCrmFunnel] = useState({ started: 0, added_suppliers: 0, reached_checkout: 0, completed: 0 })
  const [crmTraffic, setCrmTraffic] = useState({ total_views: 0, unique_visitors: 0, new_visitors: 0, returning_visitors: 0, top_pages: [], top_referrers: [], devices: { desktop: 0, mobile: 0, tablet: 0 }, visitor_to_session_rate: 0 })
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false)
  const [crmDisplayCount, setCrmDisplayCount] = useState(15) // Pagination: show 15 at a time

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
    } else if (activeTab === 'invoices') {
      fetchInvoices()
    } else if (activeTab === 'crm') {
      fetchCrmSessions()
    }
  }, [activeTab, isAuthorized, verificationFilter, invoiceFilter, crmFilter, crmDaysFilter])

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
    console.log('🔍 reviewDocument called:', { supplierId, documentType, decision, feedback })
    try {
      const headers = await getAuthHeaders()
      console.log('📤 Making API request to /api/admin/verification/review')
      const response = await fetch('/api/admin/verification/review', {
        method: 'POST',
        headers,
        body: JSON.stringify({ supplierId, documentType, decision, feedback })
      })
      console.log('📥 Response status:', response.status)
      const result = await response.json()
      console.log('📥 Response data:', result)
      if (result.success) {
        alert(`Document ${decision}!`)
        fetchSuppliers()
        if (selectedSupplier?.id === supplierId) {
          viewSupplierDetails(supplierId)
        }
      } else {
        alert(`Review failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Review error:', error)
      alert(`Review failed: ${error.message}`)
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

  // ============ CRM FUNCTIONS ============
  const fetchCrmSessions = async () => {
    setCrmLoading(true)
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams({
        status: crmFilter,
        days: crmDaysFilter,
        ...(crmSearch && { search: crmSearch })
      })
      const response = await fetch(`/api/admin/crm/sessions?${params}`, { headers })
      const data = await response.json()
      if (data.sessions) {
        setCrmSessions(data.sessions)
        setCrmStats(data.stats || {})
        setCrmFunnel(data.funnel || {})
        setCrmTraffic(data.traffic || { total_views: 0, unique_visitors: 0, new_visitors: 0, returning_visitors: 0, top_pages: [], top_referrers: [], devices: { desktop: 0, mobile: 0, tablet: 0 }, visitor_to_session_rate: 0 })
      }
    } catch (error) {
      console.error('Error fetching CRM sessions:', error)
    }
    setCrmLoading(false)
  }

  const fetchSessionDetail = async (sessionId) => {
    setSessionDetailLoading(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/crm/sessions/${sessionId}`, { headers })
      const data = await response.json()
      if (data.session) {
        setSelectedSession({ ...data.session, timeline: data.timeline })
      }
    } catch (error) {
      console.error('Error fetching session detail:', error)
    }
    setSessionDetailLoading(false)
  }

  // Filter CRM sessions by search term
  const filteredCrmSessions = crmSessions.filter(session => {
    if (!crmSearch.trim()) return true
    const search = crmSearch.toLowerCase()
    return session.email?.toLowerCase().includes(search)
  })

  // Paginated sessions (show only crmDisplayCount)
  const paginatedCrmSessions = filteredCrmSessions.slice(0, crmDisplayCount)
  const hasMoreSessions = filteredCrmSessions.length > crmDisplayCount

  // Reset pagination when filters change
  useEffect(() => {
    setCrmDisplayCount(15)
  }, [crmFilter, crmDaysFilter, crmSearch])

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 1000 / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Export CRM sessions to CSV
  const exportCrmToCSV = () => {
    const dataToExport = filteredCrmSessions.length > 0 ? filteredCrmSessions : crmSessions

    const headers = ['Email', 'Status', 'Theme', 'Guest Count', 'Suppliers Added', 'Total Cost', 'Started', 'Last Activity', 'Referrer']
    const rows = dataToExport.map(s => [
      s.email || 'Anonymous',
      s.status,
      s.party_theme || '-',
      s.guest_count || '-',
      s.supplier_count || 0,
      s.total_cost ? `£${s.total_cost}` : '-',
      s.started_at ? new Date(s.started_at).toLocaleString() : '-',
      s.last_activity ? new Date(s.last_activity).toLocaleString() : '-',
      s.referrer || 'Direct'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `crm-sessions-${crmFilter}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

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
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'crm' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            CRM
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
                          {(docData.status === 'submitted' || docData.status === 'pending') && (
                            <>
                              <button
                                onClick={() => {
                                  console.log('Approve clicked for:', docType, selectedSupplier.id)
                                  reviewDocument(selectedSupplier.id, docType, 'approved')
                                }}
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
                          {docData.status !== 'submitted' && docData.status !== 'pending' && docData.status !== 'approved' && docData.status !== 'rejected' && (
                            <span className="text-xs text-gray-500">Status: {docData.status}</span>
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

        {/* ============ CRM TAB ============ */}
        {activeTab === 'crm' && (
          <div>
            {/* Site Traffic Section */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Site Traffic (Last {crmDaysFilter === 'all' ? 'All Time' : `${crmDaysFilter} Days`})
              </h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{crmTraffic.total_views}</div>
                  <div className="text-xs text-gray-600">Page Views</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{crmTraffic.unique_visitors}</div>
                  <div className="text-xs text-gray-600">Unique Visitors</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{crmTraffic.new_visitors}</div>
                  <div className="text-xs text-gray-600">New Visitors</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">{crmTraffic.visitor_to_session_rate}%</div>
                  <div className="text-xs text-gray-600">Started Planning</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Device Breakdown */}
                <div className="border rounded-lg p-3">
                  <div className="text-sm font-medium mb-2">Devices</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-600"><Monitor className="h-3 w-3" /> Desktop</span>
                      <span className="font-medium">{crmTraffic.devices?.desktop || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-600"><Smartphone className="h-3 w-3" /> Mobile</span>
                      <span className="font-medium">{crmTraffic.devices?.mobile || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-600"><Tablet className="h-3 w-3" /> Tablet</span>
                      <span className="font-medium">{crmTraffic.devices?.tablet || 0}</span>
                    </div>
                  </div>
                </div>
                {/* Top Pages */}
                <div className="border rounded-lg p-3">
                  <div className="text-sm font-medium mb-2">Top Pages</div>
                  <div className="space-y-1 text-sm">
                    {crmTraffic.top_pages?.length > 0 ? crmTraffic.top_pages.slice(0, 4).map((page, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600 truncate max-w-[120px]" title={page.path}>{page.path}</span>
                        <span className="font-medium">{page.count}</span>
                      </div>
                    )) : <span className="text-gray-400">No data yet</span>}
                  </div>
                </div>
                {/* Top Referrers */}
                <div className="border rounded-lg p-3">
                  <div className="text-sm font-medium mb-2">Top Referrers</div>
                  <div className="space-y-1 text-sm">
                    {crmTraffic.top_referrers?.length > 0 ? crmTraffic.top_referrers.slice(0, 4).map((ref, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600 truncate max-w-[120px]" title={ref.domain}>{ref.domain}</span>
                        <span className="font-medium">{ref.count}</span>
                      </div>
                    )) : <span className="text-gray-400">Direct traffic</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Status Distribution Pie Chart */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4">Session Status Distribution</h3>
                <div className="flex items-center justify-center gap-8">
                  <PieChart
                    data={[
                      { label: 'Browsing', value: crmStats.browsing || 0, color: '#9CA3AF' },
                      { label: 'Review & Book', value: crmStats.review_book || 0, color: '#3B82F6' },
                      { label: 'Payment Page', value: crmStats.payment_page || 0, color: '#F97316' },
                      { label: 'Checkout', value: crmStats.checkout || 0, color: '#FBBF24' },
                      { label: 'Completed', value: crmStats.paid || 0, color: '#10B981' },
                      { label: 'Abandoned', value: crmStats.abandoned || 0, color: '#EF4444' },
                    ]}
                    size={160}
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span>Browsing ({crmStats.browsing || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Review & Book ({crmStats.review_book || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Payment Page ({crmStats.payment_page || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span>Checkout ({crmStats.checkout || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Completed ({crmStats.paid || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Abandoned ({crmStats.abandoned || 0})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Distribution Pie Chart */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4">Device Distribution</h3>
                <div className="flex items-center justify-center gap-8">
                  <PieChart
                    data={[
                      { label: 'Desktop', value: crmTraffic.devices?.desktop || 0, color: '#3B82F6' },
                      { label: 'Mobile', value: crmTraffic.devices?.mobile || 0, color: '#8B5CF6' },
                      { label: 'Tablet', value: crmTraffic.devices?.tablet || 0, color: '#EC4899' },
                    ]}
                    size={160}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Desktop ({crmTraffic.devices?.desktop || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Mobile ({crmTraffic.devices?.mobile || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span>Tablet ({crmTraffic.devices?.tablet || 0})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Party Planning Stats Cards */}
            <div className="grid grid-cols-7 gap-3 mb-6">
              <StatCard label="Total Sessions" value={crmStats.total || 0} color="gray" />
              <StatCard label="Browsing" value={crmStats.browsing || 0} color="gray" />
              <StatCard label="Review & Book" value={crmStats.review_book || 0} color="blue" />
              <StatCard label="Payment Page" value={crmStats.payment_page || 0} color="orange" />
              <StatCard label="Checkout" value={crmStats.checkout || 0} color="yellow" />
              <StatCard label="Completed" value={crmStats.paid || 0} subtitle={`${crmStats.conversion_rate || 0}% conv`} color="green" />
              <StatCard label="Abandoned" value={crmStats.abandoned || 0} color="red" />
            </div>

            {/* Conversion Funnel - Visual Bar Chart */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Conversion Funnel (Last {crmDaysFilter === 'all' ? 'All Time' : `${crmDaysFilter} Days`})
              </h3>
              <FunnelChart funnel={crmFunnel} />
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Customer Sessions</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={crmFilter}
                      onChange={(e) => setCrmFilter(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="browsing">Browsing</option>
                      <option value="review_book">Review & Book</option>
                      <option value="payment_page">Payment Page</option>
                      <option value="checkout">In Checkout</option>
                      <option value="paid">Completed</option>
                      <option value="abandoned">Abandoned</option>
                    </select>
                    <select
                      value={crmDaysFilter}
                      onChange={(e) => setCrmDaysFilter(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="all">All time</option>
                    </select>
                    <button
                      onClick={exportCrmToCSV}
                      disabled={crmSessions.length === 0}
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
                    placeholder="Search by email..."
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                {crmLoading ? (
                  <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : filteredCrmSessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{crmSearch ? 'No matching sessions' : 'No sessions found'}</p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Theme</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Suppliers</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Est. Value</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last Active</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedCrmSessions.map(session => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium">{session.email || 'Anonymous'}</div>
                            {session.referrer && (
                              <div className="text-xs text-gray-500">via {new URL(session.referrer).hostname || session.referrer}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <CrmStatusBadge status={session.status} />
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">{session.party_theme || '-'}</td>
                          <td className="px-4 py-3 text-center text-sm">
                            {session.supplier_count > 0 ? (
                              <span className="text-green-600 font-medium">{session.supplier_count}</span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {session.total_cost ? (
                              <span className="font-semibold text-green-700">£{session.total_cost.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatRelativeTime(session.last_activity)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => fetchSessionDetail(session.id)}
                              className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Load More / Pagination Info */}
              {filteredCrmSessions.length > 0 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Showing {paginatedCrmSessions.length} of {filteredCrmSessions.length} sessions
                  </span>
                  {hasMoreSessions && (
                    <button
                      onClick={() => setCrmDisplayCount(prev => prev + 15)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Session Detail Drawer */}
            {selectedSession && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedSession(null)} />
                <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedSession.email || 'Anonymous Session'}</h3>
                      <CrmStatusBadge status={selectedSession.status} />
                    </div>
                    <button onClick={() => setSelectedSession(null)} className="p-1 hover:bg-gray-100 rounded">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Session Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Started:</span>
                        <div>{selectedSession.started_at ? new Date(selectedSession.started_at).toLocaleString() : '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Active:</span>
                        <div>{formatRelativeTime(selectedSession.last_activity)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div>{selectedSession.duration_minutes ? `${selectedSession.duration_minutes} mins` : '-'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Actions:</span>
                        <div>{selectedSession.total_actions || 0}</div>
                      </div>
                      {selectedSession.device_info && (
                        <>
                          <div className="col-span-2">
                            <span className="text-gray-500">Device:</span>
                            <div className="text-xs truncate">{selectedSession.device_info.platform} - {selectedSession.device_info.screen}</div>
                          </div>
                        </>
                      )}
                      {selectedSession.referrer && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Referrer:</span>
                          <div className="text-xs truncate">{selectedSession.referrer}</div>
                        </div>
                      )}
                    </div>

                    {/* Party Data */}
                    {selectedSession.party_data && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Party Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {selectedSession.party_data.theme && <div><span className="text-gray-500">Theme:</span> {selectedSession.party_data.theme}</div>}
                          {selectedSession.party_data.guestCount && <div><span className="text-gray-500">Guests:</span> {selectedSession.party_data.guestCount}</div>}
                          {selectedSession.party_data.childAge && <div><span className="text-gray-500">Age:</span> {selectedSession.party_data.childAge}</div>}
                          {selectedSession.party_data.postcode && <div><span className="text-gray-500">Postcode:</span> {selectedSession.party_data.postcode}</div>}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Activity Timeline</h4>
                      {sessionDetailLoading ? (
                        <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
                      ) : selectedSession.timeline && selectedSession.timeline.length > 0 ? (
                        <div className="space-y-3">
                          {selectedSession.timeline.map((event, idx) => (
                            <TimelineEvent key={idx} event={event} isLast={idx === selectedSession.timeline.length - 1} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No timeline data</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ HELPER COMPONENTS ============

// Visual Funnel Chart Component
function FunnelChart({ funnel }) {
  const stages = [
    { label: 'Started', value: funnel.started || 0, color: '#3B82F6' },
    { label: 'Added Suppliers', value: funnel.added_suppliers || 0, color: '#8B5CF6' },
    { label: 'Review & Book', value: funnel.reached_review_book || 0, color: '#3B82F6' },
    { label: 'Payment Page', value: funnel.reached_payment_page || 0, color: '#F59E0B' },
    { label: 'Completed', value: funnel.completed || 0, color: '#10B981' },
  ]

  const maxValue = Math.max(...stages.map(s => s.value), 1)

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const percentage = funnel.started > 0 ? Math.round((stage.value / funnel.started) * 100) : 0
        const barWidth = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
        const prevStage = index > 0 ? stages[index - 1] : null
        const dropOff = prevStage && prevStage.value > 0
          ? Math.round(((prevStage.value - stage.value) / prevStage.value) * 100)
          : 0

        return (
          <div key={stage.label} className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                {index > 0 && dropOff > 0 && (
                  <span className="text-xs text-red-500">(-{dropOff}%)</span>
                )}
              </div>
              <div className="text-sm">
                <span className="font-bold">{stage.value}</span>
                <span className="text-gray-500 ml-1">({percentage}%)</span>
              </div>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${barWidth}%`, backgroundColor: stage.color }}
              >
                {barWidth > 15 && (
                  <span className="text-white text-xs font-medium">{stage.value}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// SVG Pie Chart Component
function PieChart({ data, size = 160 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2 - 10} fill="#E5E7EB" />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" className="text-xs fill-gray-400">
          No data
        </text>
      </svg>
    )
  }

  const radius = size / 2 - 10
  const center = size / 2
  let currentAngle = -90 // Start from top

  const slices = data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="white"
        strokeWidth="2"
      />
    )
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      {/* Center circle for donut effect */}
      <circle cx={center} cy={center} r={radius * 0.5} fill="white" />
      <text x={center} y={center - 8} textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold" fill="#374151">
        {total}
      </text>
      <text x={center} y={center + 10} textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#6B7280">
        total
      </text>
    </svg>
  )
}

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

function StatCard({ label, value, amount, color, subtitle }) {
  const colors = {
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    orange: 'border-orange-200 bg-orange-50',
    gray: 'border-gray-200 bg-gray-50',
    red: 'border-red-200 bg-red-50'
  }
  return (
    <div className={`border rounded-lg p-3 ${colors[color]}`}>
      <p className="text-xs text-gray-600">{label}</p>
      {value !== '' && <p className="text-xl font-bold">{value}</p>}
      {amount !== undefined && <p className="text-lg font-semibold">£{parseFloat(amount || 0).toFixed(2)}</p>}
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function CrmStatusBadge({ status }) {
  const styles = {
    browsing: 'bg-gray-100 text-gray-800',
    review_book: 'bg-blue-100 text-blue-800',
    payment_page: 'bg-orange-100 text-orange-800',
    checkout: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    abandoned: 'bg-red-100 text-red-800'
  }
  const labels = {
    browsing: 'Browsing',
    review_book: 'Review & Book',
    payment_page: 'Payment Page',
    checkout: 'Checkout',
    paid: 'Completed',
    abandoned: 'Abandoned'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || styles.browsing}`}>
      {labels[status] || status}
    </span>
  )
}

function TimelineEvent({ event, isLast }) {
  const getEventIcon = (action) => {
    switch (action) {
      case 'party_planning_started': return '🎉'
      case 'supplier_added': return '➕'
      case 'supplier_removed': return '➖'
      case 'review_book_started': return '📋'
      case 'payment_page_started': return '💰'
      case 'checkout_started': return '🛒'
      case 'theme_changed': return '🎨'
      case 'payment_completed': return '💳'
      case 'payment_successful': return '💳'
      case 'booking_confirmed': return '✅'
      case 'status_changed': return '📝'
      default: return '•'
    }
  }

  const getEventLabel = (action) => {
    switch (action) {
      case 'party_planning_started': return 'Started Planning'
      case 'supplier_added': return 'Added Supplier'
      case 'supplier_removed': return 'Removed Supplier'
      case 'review_book_started': return 'Reached Review & Book'
      case 'payment_page_started': return 'Reached Payment Page'
      case 'checkout_started': return 'Started Checkout'
      case 'theme_changed': return 'Changed Theme'
      case 'payment_completed': return 'Payment Completed'
      case 'payment_successful': return 'Payment Successful'
      case 'booking_confirmed': return 'Booking Confirmed'
      case 'status_changed': return 'Status Updated'
      default: return action?.replace(/_/g, ' ') || 'Unknown'
    }
  }

  const getEventBgColor = (action) => {
    if (action === 'payment_completed' || action === 'payment_successful' || action === 'booking_confirmed') {
      return 'bg-green-100'
    }
    if (action === 'review_book_started') {
      return 'bg-blue-100'
    }
    if (action === 'payment_page_started') {
      return 'bg-orange-100'
    }
    return 'bg-blue-100'
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${getEventBgColor(event.action)} flex items-center justify-center text-sm`}>
          {getEventIcon(event.action)}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>}
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getEventLabel(event.action)}</span>
          <span className="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
        </div>
        {event.time_since_start && (
          <div className="text-xs text-gray-400">+{event.time_since_start}</div>
        )}
        {event.data?.supplier && (
          <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded p-2">
            <div className="font-medium">{event.data.supplier.name}</div>
            <div className="text-xs text-gray-500">{event.data.supplier.category} • £{event.data.supplier.price}</div>
          </div>
        )}
        {event.data?.total_cost !== undefined && (
          <div className="text-xs text-green-600 mt-1">Total: £{event.data.total_cost}</div>
        )}
        {event.data?.theme && (
          <div className="text-xs text-gray-600 mt-1">Theme: {event.data.theme}</div>
        )}
        {/* Payment completed event details */}
        {event.action === 'payment_completed' && (
          <div className="mt-1 text-sm bg-green-50 rounded p-2 border border-green-200">
            {event.data?.amount && (
              <div className="font-semibold text-green-700">Payment: £{Number(event.data.amount).toFixed(2)}</div>
            )}
            {event.data?.childName && (
              <div className="text-xs text-gray-600 mt-1">Party for: {event.data.childName}</div>
            )}
            {event.data?.theme && !event.data?.childName && (
              <div className="text-xs text-gray-600">Theme: {event.data.theme}</div>
            )}
            {!event.data?.amount && !event.data?.childName && (
              <div className="text-green-700 font-medium">Booking completed</div>
            )}
          </div>
        )}
        {/* Generic amount display for other events */}
        {event.action !== 'payment_completed' && event.data?.amount && (
          <div className="mt-1 text-sm text-green-700 bg-green-50 rounded p-2 font-medium">
            Payment: £{Number(event.data.amount).toFixed(2)}
          </div>
        )}
        {event.data?.new_status && (
          <div className="text-xs text-gray-600 mt-1">New status: {event.data.new_status}</div>
        )}
      </div>
    </div>
  )
}
