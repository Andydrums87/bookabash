"use client"

import { useState, useRef } from "react"
import { Shield, Camera, MapPin, CheckCircle, Clock, ExternalLink, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function VerificationDocumentsStep({ documents, onChange, userId, supplierId }) {
  const [localDocs, setLocalDocs] = useState(documents || {
    dbs: { file: null, fileName: '', uploaded: false },
    id: { file: null, fileName: '', uploaded: false },
    address: { file: null, fileName: '', uploaded: false }
  })

  const [uploading, setUploading] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const fileInputRefs = {
    dbs: useRef(null),
    id: useRef(null),
    address: useRef(null)
  }

  const documentTypes = [
    { id: 'dbs', icon: Shield, title: 'DBS Certificate' },
    { id: 'id', icon: Camera, title: 'Photo ID' },
    { id: 'address', icon: MapPin, title: 'Proof of Address' },
  ]

  const handleFileSelect = async (docType, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or image file (JPG, PNG)')
      return
    }

    setUploading(docType)
    setUploadError(null)

    try {
      console.log(`📤 Uploading ${docType} document:`, file.name)
      console.log(`📤 Using supplierId:`, supplierId)

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session || !session.access_token) {
        throw new Error('No session found. Please refresh and try again.')
      }

      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', docType)

      // IMPORTANT: Pass the supplierId so API knows which supplier to update
      if (supplierId) {
        formData.append('supplierId', supplierId)
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`
      }

      // Call upload API
      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log(`✅ ${docType} uploaded successfully`)

      // Update local state to show uploaded
      const updated = {
        ...localDocs,
        [docType]: {
          file: file,
          fileName: file.name,
          uploaded: true,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        }
      }

      setLocalDocs(updated)
      onChange(updated)

    } catch (error) {
      console.error('Upload failed:', error)
      setUploadError(`Upload failed: ${error.message}`)

      // Clear the file input on error
      if (fileInputRefs[docType].current) {
        fileInputRefs[docType].current.value = ''
      }
    } finally {
      setUploading(null)
    }
  }

  const handleRemove = async (docType) => {
    setRemoving(docType)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.access_token && supplierId) {
        // Call delete API
        await fetch('/api/verification/delete', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            documentType: docType,
            supplierId: supplierId
          })
        })
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }

    const updated = {
      ...localDocs,
      [docType]: { file: null, fileName: '', uploaded: false }
    }
    setLocalDocs(updated)
    onChange(updated)

    // Reset file input
    if (fileInputRefs[docType].current) {
      fileInputRefs[docType].current.value = ''
    }

    setRemoving(null)
  }

  const allRequiredUploaded = documentTypes.every(doc => localDocs[doc.id]?.uploaded)

  return (
    <div className="py-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Verification Documents
        </h1>
        <p className="text-lg text-gray-600">
          Help build trust with customers by verifying your identity
        </p>
      </div>

      {/* Error Alert */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-red-900">
            <strong>Upload Error:</strong> {uploadError}
          </p>
        </div>
      )}

      {/* Document Card - Minimal Style */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {documentTypes.map((doc) => {
          const DocIcon = doc.icon
          const docState = localDocs[doc.id] || {}
          const isUploaded = docState.uploaded
          const isUploading = uploading === doc.id
          const isRemoving = removing === doc.id

          return (
            <div key={doc.id} className="px-6 py-5">
              <input
                ref={fileInputRefs[doc.id]}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(doc.id, e)}
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
                      <span className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                        <Clock className="w-4 h-4" />
                        In review
                      </span>

                      <button
                        onClick={() => handleRemove(doc.id)}
                        disabled={isRemoving}
                        className="text-gray-400 hover:text-gray-600 underline text-sm font-medium transition-colors"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Remove'
                        )}
                      </button>
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

      {/* Progress Indicator */}
      <div className="text-center mt-8">
        {allRequiredUploaded ? (
          <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All documents uploaded</span>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {documentTypes.filter(d => localDocs[d.id]?.uploaded).length} of {documentTypes.length} documents uploaded
          </p>
        )}
      </div>
    </div>
  )
}
