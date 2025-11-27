"use client"

import { useState, useRef } from "react"
import { Shield, Upload, CheckCircle, FileText, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function VerificationDocumentsStep({ documents, onChange, userId, supplierId }) {
  const [localDocs, setLocalDocs] = useState(documents || {
    dbs: { file: null, fileName: '', uploaded: false },
    id: { file: null, fileName: '', uploaded: false },
    address: { file: null, fileName: '', uploaded: false }
  })

  const [uploading, setUploading] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const fileInputRefs = {
    dbs: useRef(null),
    id: useRef(null),
    address: useRef(null)
  }

  const documentTypes = [
    {
      id: "dbs",
      title: "DBS/Background Check",
      description: "Enhanced DBS certificate or equivalent background check",
      icon: Shield,
      required: true
    },
    {
      id: "id",
      title: "Photo ID",
      description: "Passport or driving license",
      icon: FileText,
      required: true
    },
    {
      id: "address",
      title: "Proof of Address",
      description: "Utility bill or bank statement (within 3 months)",
      icon: FileText,
      required: true
    }
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

  const handleRemove = (docType) => {
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
  }

  const allRequiredUploaded = documentTypes
    .filter(doc => doc.required)
    .every(doc => localDocs[doc.id]?.uploaded)

  return (
    <div className="py-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        {/* <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div> */}
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

      {/* Info Banner */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          <strong>Why verify?</strong> Verified entertainers get more bookings. Your documents are securely stored and only reviewed by our team.
        </p>
      </div> */}

      {/* Document Upload Cards */}
      <div className="space-y-4 mb-8">
        {documentTypes.map((docType) => {
          const Icon = docType.icon
          const doc = localDocs[docType.id] || {}
          const isUploading = uploading === docType.id

          return (
            <div
              key={docType.id}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {docType.title}
                        {docType.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{docType.description}</p>
                    </div>

                    {doc.uploaded && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>

                  {doc.uploaded ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-900 truncate">{doc.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(docType.id)}
                        className="text-red-600 hover:text-red-700 p-1 flex-shrink-0"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <input
                        ref={fileInputRefs[docType.id]}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileSelect(docType.id, e)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefs[docType.id].current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span className="text-sm font-medium">Choose File</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF or image (JPG, PNG) • Max 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        {allRequiredUploaded ? (
          <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All required documents uploaded</span>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {documentTypes.filter(d => d.required && localDocs[d.id]?.uploaded).length} of {documentTypes.filter(d => d.required).length} required documents uploaded
          </p>
        )}
      </div>
    </div>
  )
}
