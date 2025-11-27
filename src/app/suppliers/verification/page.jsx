"use client"

import { useState, useRef, useEffect } from "react"
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  Loader2,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSupplierDashboard } from '@/utils/mockBackend'
import { useBusiness } from "@/contexts/BusinessContext"

export default function VerificationPage() {
  const { currentSupplier, refresh } = useSupplierDashboard()
  const { getPrimaryBusiness } = useBusiness()
  const [documents, setDocuments] = useState({
    dbs: { status: 'not_submitted', file: null, fileName: '', uploadedAt: null },
    id: { status: 'not_submitted', file: null, fileName: '', uploadedAt: null },
    address: { status: 'not_submitted', file: null, fileName: '', uploadedAt: null }
  })

  const [uploading, setUploading] = useState('')
  const [removing, setRemoving] = useState('')
  const fileInputRefs = {
    dbs: useRef(null),
    id: useRef(null),
    address: useRef(null)
  }

  useEffect(() => {
    const primaryBusiness = getPrimaryBusiness()
    const verificationData = currentSupplier?.data?.verification?.documents ||
                            currentSupplier?.verification?.documents ||
                            primaryBusiness?.data?.verification?.documents ||
                            primaryBusiness?.supplierData?.data?.verification?.documents

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

  const removeDocument = async (docType) => {
    if (!confirm('Remove this document?')) return

    setRemoving(docType)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Please refresh and try again.')
      }

      const response = await fetch('/api/verification/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          documentType: docType,
          supplierId: currentSupplier?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed')
      }

      setDocuments(prev => ({
        ...prev,
        [docType]: {
          status: 'not_submitted',
          file: null,
          fileName: '',
          uploadedAt: null,
          cloudinaryUrl: null
        }
      }))

      if (refresh) {
        setTimeout(() => refresh(), 500)
      }

    } catch (error) {
      console.error('Delete failed:', error)
      alert(`Delete failed: ${error.message}`)
    } finally {
      setRemoving('')
    }
  }

  const documentTypes = [
    { id: 'dbs', icon: Shield, title: 'DBS Certificate' },
    { id: 'id', icon: Camera, title: 'Photo ID' },
    { id: 'address', icon: MapPin, title: 'Proof of Address' },
  ]

  // Get status display for uploaded documents
  const getStatusDisplay = (status) => {
    if (status === 'approved') {
      return (
        <span className="flex items-center gap-1.5 text-gray-900 font-medium text-sm">
          <CheckCircle className="w-4 h-4" />
          Verified
        </span>
      )
    }
    if (status === 'submitted') {
      return (
        <span className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
          <Clock className="w-4 h-4" />
          In review
        </span>
      )
    }
    if (status === 'rejected') {
      return (
        <span className="flex items-center gap-1.5 text-gray-900 font-medium text-sm">
          <XCircle className="w-4 h-4" />
          Rejected
        </span>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      {/* Header - matching other tabs (hidden on mobile as modal has title) */}
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verification</h1>
        <p className="text-sm text-gray-500">
          Upload your documents to get verified
        </p>
      </div>

        {/* Document Card */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {documentTypes.map((doc) => {
            const docState = documents[doc.id]
            const DocIcon = doc.icon
            const isUploaded = docState.status !== 'not_submitted'
            const isUploading = uploading === doc.id
            const isRemoving = removing === doc.id

            return (
              <div key={doc.id} className="px-6 py-5">
                <input
                  ref={fileInputRefs[doc.id]}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <DocIcon className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    <span className="text-[17px] font-semibold text-gray-900">
                      {doc.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {isUploaded ? (
                      <>
                        {getStatusDisplay(docState.status)}

                        {docState.cloudinaryUrl && (
                          <a
                            href={docState.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="View document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {docState.status !== 'approved' && (
                          <button
                            onClick={() => removeDocument(doc.id)}
                            disabled={isRemoving}
                            className="text-gray-400 hover:text-gray-600 underline text-sm font-medium transition-colors"
                          >
                            {isRemoving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Remove'
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => fileInputRefs[doc.id].current.click()}
                        disabled={isUploading}
                        className="text-gray-900 hover:text-gray-600 underline text-[15px] font-semibold transition-colors"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Upload'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      {/* Help text */}
      <p className="mt-4 text-sm text-gray-400">
        PDF, JPG, or PNG · Max 10MB
      </p>
    </div>
  )
}
