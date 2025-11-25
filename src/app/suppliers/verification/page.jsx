"use client"

import { useState, useRef, useEffect } from "react"
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Camera,
  Trash2,
  Loader2,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useSupplierDashboard } from '@/utils/mockBackend'
import { useBusiness } from "@/contexts/BusinessContext"

export default function VerificationPage() {
  const { currentSupplier, saving, updateProfile, refresh } = useSupplierDashboard()
  const { getPrimaryBusiness } = useBusiness()
  const [documents, setDocuments] = useState({
    dbs: { status: 'not_submitted', file: null, fileName: '', uploadedAt: null },
    id: { status: 'not_submitted', file: null, fileName: '', uploadedAt: null },
    address: { status: 'not_submitted', file: null, fileName: '', uploadedAt: null }
  })

  const [uploading, setUploading] = useState('')
  const fileInputRefs = {
    dbs: useRef(null),
    id: useRef(null),
    address: useRef(null)
  }

  useEffect(() => {
    // Try multiple sources for verification data
    const primaryBusiness = getPrimaryBusiness()

    // Check currentSupplier first (from useSupplierDashboard), then primaryBusiness
    const verificationData = currentSupplier?.data?.verification?.documents ||
                            currentSupplier?.verification?.documents ||
                            primaryBusiness?.data?.verification?.documents ||
                            primaryBusiness?.supplierData?.data?.verification?.documents

    console.log('Verification page - currentSupplier:', currentSupplier?.id)
    console.log('Verification page - verificationData found:', !!verificationData)
    console.log('Verification page - documents:', verificationData ? Object.keys(verificationData) : [])

    if (verificationData) {
      const { dbs, id, address } = verificationData
      setDocuments({
        dbs: {
          status: dbs?.status || 'not_submitted',
          file: dbs?.fileName ? { name: dbs.fileName } : null,
          fileName: dbs?.fileName || '',
          uploadedAt: dbs?.uploadedAt || null,
          cloudinaryUrl: dbs?.cloudinaryUrl || null
        },
        id: {
          status: id?.status || 'not_submitted',
          file: id?.fileName ? { name: id.fileName } : null,
          fileName: id?.fileName || '',
          uploadedAt: id?.uploadedAt || null,
          cloudinaryUrl: id?.cloudinaryUrl || null
        },
        address: {
          status: address?.status || 'not_submitted',
          file: address?.fileName ? { name: address.fileName } : null,
          fileName: address?.fileName || '',
          uploadedAt: address?.uploadedAt || null,
          cloudinaryUrl: address?.cloudinaryUrl || null
        }
      })
    }
  }, [currentSupplier, getPrimaryBusiness])

  const getOverallStatus = () => {
    const requiredDocs = ['dbs', 'id', 'address']
    const allApproved = requiredDocs.every(doc => documents[doc].status === 'approved')
    const anyPending = requiredDocs.some(doc => documents[doc].status === 'submitted')
    if (allApproved) return 'verified'
    if (anyPending) return 'pending'
    return 'incomplete'
  }

  const statusConfig = {
    not_submitted: { icon: Upload, color: 'text-gray-500', bg: 'bg-gray-100', text: 'Upload' },
    submitted: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Reviewing' },
    approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Rejected' },
  }

  const handleFileUpload = async (docType, file) => {
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max 10MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload JPG, PNG, or PDF only.')
      return
    }

    setUploading(docType)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Please refresh and try again.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', docType)
      // Include supplier ID to ensure it saves to the correct supplier
      if (currentSupplier?.id) {
        formData.append('supplierId', currentSupplier.id)
      }

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        credentials: 'include',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          file: file,
          fileName: file.name,
          status: 'submitted',
          uploadedAt: new Date().toISOString()
        }
      }))

      // Refresh data from server
      if (refresh) {
        setTimeout(() => refresh(), 500)
      }

    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading('')
    }
  }

  const removeDocument = (docType) => {
    if (confirm('Remove this document?')) {
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], file: null, fileName: '', status: 'not_submitted', uploadedAt: null }
      }))
    }
  }

  const overallStatus = getOverallStatus()

  const documentTypes = [
    {
      id: 'dbs',
      icon: Shield,
      title: 'Enhanced DBS Certificate',
      subtitle: 'Required for working with children',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      id: 'id',
      icon: Camera,
      title: 'Photo ID',
      subtitle: 'Passport or driving license',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'address',
      icon: MapPin,
      title: 'Proof of Address',
      subtitle: 'Utility bill or bank statement',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full p-4 sm:p-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Verification</h1>
            {overallStatus === 'verified' && (
              <Badge className="bg-green-100 text-green-700">Verified</Badge>
            )}
            {overallStatus === 'pending' && (
              <Badge className="bg-yellow-100 text-yellow-700">Under Review</Badge>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            Upload documents to get verified and build trust with families.
          </p>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {documentTypes.map((doc) => {
            const docState = documents[doc.id]
            const status = statusConfig[docState.status]
            const StatusIcon = status.icon
            const DocIcon = doc.icon

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                {/* Left side - Icon and info */}
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${doc.iconBg}`}>
                    <DocIcon className={`h-5 w-5 ${doc.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    {docState.file ? (
                      <div>
                        <p className="text-sm text-green-600">{docState.fileName}</p>
                        {docState.uploadedAt && (
                          <p className="text-xs text-gray-400">
                            Uploaded {new Date(docState.uploadedAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{doc.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Right side - Status and actions */}
                <div className="flex items-center gap-3">
                  <Badge className={`${status.bg} ${status.color} border-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.text}
                  </Badge>

                  <input
                    ref={fileInputRefs[doc.id]}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                    className="hidden"
                  />

                  {docState.file ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRefs[doc.id].current.click()}
                      disabled={uploading === doc.id}
                    >
                      {uploading === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 mt-4">
          Accepted formats: PDF, JPG, PNG (max 10MB). Review takes 24-48 hours.
        </p>
      </div>
    </div>
  )
}
