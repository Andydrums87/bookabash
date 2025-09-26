"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Camera, 
  Award, 
  Users,
  Info,
  Eye,
  Trash2,
  Loader2,
  MapPin,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useSupplierDashboard } from '@/utils/mockBackend' 

export default function VerificationPage() {
  const { currentSupplier, saving, updateProfile, refresh } = useSupplierDashboard()
  const [documents, setDocuments] = useState({
    dbs: { 
      status: 'not_submitted', 
      file: null, 
      fileName: '', 
      uploadedAt: null
    },
    id: { 
      status: 'not_submitted', 
      file: null, 
      fileName: '', 
      uploadedAt: null
    },
    address: { 
      status: 'not_submitted', 
      file: null, 
      fileName: '', 
      uploadedAt: null
    }
  })

  const [uploading, setUploading] = useState('')
  const fileInputRefs = {
    dbs: useRef(null),
    id: useRef(null),
    address: useRef(null)
  }


// Load existing verification data from currentSupplier
useEffect(() => {
  if (currentSupplier?.verification?.documents) {
    console.log('Loading existing verification data:', currentSupplier.verification.documents)
    
    const { dbs, id, address } = currentSupplier.verification.documents

    setDocuments({
      dbs: {
        status: dbs?.status || 'not_submitted',
        file: dbs?.fileName ? { name: dbs.fileName } : null,
        fileName: dbs?.fileName || '',
        uploadedAt: dbs?.uploadedAt || null
      },
      id: {
        status: id?.status || 'not_submitted',
        file: id?.fileName ? { name: id.fileName } : null,
        fileName: id?.fileName || '',
        uploadedAt: id?.uploadedAt || null
      },
      address: {
        status: address?.status || 'not_submitted',
        file: address?.fileName ? { name: address.fileName } : null,
        fileName: address?.fileName || '',
        uploadedAt: address?.uploadedAt || null
      }
    })
  }
}, [currentSupplier]) // Watch currentSupplier instead of supplierData

  const getOverallStatus = () => {
    const requiredDocs = ['dbs', 'id', 'address']
    const allApproved = requiredDocs.every(doc => documents[doc].status === 'approved')
    const anyPending = requiredDocs.some(doc => documents[doc].status === 'submitted')
    const anyRejected = requiredDocs.some(doc => documents[doc].status === 'rejected')

    if (allApproved) return 'verified'
    if (anyRejected) return 'rejected'
    if (anyPending) return 'pending'
    return 'not_started'
  }

  const statusConfig = {
    not_submitted: { icon: Upload, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Not Submitted' },
    submitted: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Under Review' },
    approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Rejected' },
  }

  const handleFileUpload = async (docType, file) => {
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please choose a file under 10MB.')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, or PDF files only.')
      return
    }

    setUploading(docType)

    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !session.access_token) {
        throw new Error('No session found. Please refresh and try again.')
      }

      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', docType)

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

      // Update document state
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

      setTimeout(() => {
        window.location.reload()
      }, 1000) // Small delay to let the success message show

      alert(`${docType} document uploaded successfully!`)


      
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading('')
    }
  }

  const removeDocument = (docType) => {
    if (confirm('Are you sure you want to remove this document?')) {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          file: null,
          fileName: '',
          status: 'not_submitted',
          uploadedAt: null
        }
      }))
    }
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="md:text-2xl text-5xl lg:text-4xl font-black text-gray-900 leading-tight mb-4">
                Verification Center
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Complete your verification to build trust with families and increase bookings
              </p>
            </div>
          </div>

          {/* Overall Status Alert */}
          {overallStatus === 'verified' && (
            <Alert className="border-green-200 bg-green-50 mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Congratulations!</strong> Your verification is complete. You now have a verified badge and are eligible for premium bookings.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === 'pending' && (
            <Alert className="border-yellow-200 bg-yellow-50 mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Under Review:</strong> Your documents are being reviewed. We'll notify you within 48 hours with the results.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === 'not_started' && (
            <Alert className="border-blue-200 bg-blue-50 mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Get Started:</strong> Complete your verification to unlock premium bookings and build trust with families. Verified entertainers get 3x more bookings!
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === 'rejected' && (
            <Alert className="border-red-200 bg-red-50 mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> Some documents need attention. Please review the feedback below and resubmit.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6">
          
          {/* Left Column - Document Upload */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* DBS Certificate */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-200 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Enhanced DBS Certificate</CardTitle>
                      <CardDescription className="text-red-700 font-medium">
                        Required - Critical for child safety
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[documents.dbs.status].bg} ${statusConfig[documents.dbs.status].color}`}>
                    {statusConfig[documents.dbs.status].text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>UK Law Requirement:</strong> Enhanced DBS checks are legally required for anyone working with children. Must be within the last 3 years.
                    </AlertDescription>
                  </Alert>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRefs.dbs}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('dbs', e.target.files[0])}
                      className="hidden"
                    />
                    
                    {documents.dbs.file ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div className="text-left">
                            <div className="font-medium text-green-900">{documents.dbs.fileName}</div>
                            <div className="text-sm text-green-600">
                              Uploaded {new Date(documents.dbs.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => alert('Preview functionality would be here')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeDocument('dbs')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Button 
                          onClick={() => fileInputRefs.dbs.current.click()}
                          disabled={uploading === 'dbs'}
                          className="mb-2"
                        >
                          {uploading === 'dbs' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload DBS Certificate
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-gray-500">PDF, JPG, or PNG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo ID */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Camera className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Government Photo ID</CardTitle>
                      <CardDescription>Passport, Driving License, or National ID</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[documents.id.status].bg} ${statusConfig[documents.id.status].color}`}>
                    {statusConfig[documents.id.status].text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRefs.id}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('id', e.target.files[0])}
                      className="hidden"
                    />
                    
                    {documents.id.file ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div className="text-left">
                            <div className="font-medium text-green-900">{documents.id.fileName}</div>
                            <div className="text-sm text-green-600">
                              Uploaded {new Date(documents.id.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => alert('Preview functionality would be here')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeDocument('id')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Button 
                          onClick={() => fileInputRefs.id.current.click()}
                          disabled={uploading === 'id'}
                          variant="outline"
                          className="mb-2"
                        >
                          {uploading === 'id' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Photo ID
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-gray-500">Clear photo of your government-issued ID</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Verification */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-200 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Address Verification</CardTitle>
                      <CardDescription>Recent utility bill, bank statement, or council tax</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[documents.address.status].bg} ${statusConfig[documents.address.status].color}`}>
                    {statusConfig[documents.address.status].text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRefs.address}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('address', e.target.files[0])}
                      className="hidden"
                    />
                    
                    {documents.address.file ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div className="text-left">
                            <div className="font-medium text-green-900">{documents.address.fileName}</div>
                            <div className="text-sm text-green-600">
                              Uploaded {new Date(documents.address.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => alert('Preview functionality would be here')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeDocument('address')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Button 
                          onClick={() => fileInputRefs.address.current.click()}
                          disabled={uploading === 'address'}
                          variant="outline"
                          className="mb-2"
                        >
                          {uploading === 'address' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Address Proof
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-gray-500">Document must be dated within last 3 months</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Info and Help */}
          <div className="space-y-6">
            
            {/* Verification Benefits */}
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Verification Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Verified Badge</div>
                    <div className="text-xs text-gray-600">Stand out with a trust badge on your profile</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">3x More Bookings</div>
                    <div className="text-xs text-gray-600">Verified entertainers get significantly more enquiries</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Premium Listings</div>
                    <div className="text-xs text-gray-600">Access to higher-value bookings and premium features</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help and Guidelines */}
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-5 w-5 text-blue-500" />
                  Help & Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm pt-0">
                <div>
                  <div className="font-medium mb-2">Document Requirements:</div>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside">
                    <li>All documents must be clear and fully visible</li>
                    <li>No expired documents accepted</li>
                    <li>File formats: PDF, JPG, PNG only</li>
                    <li>Maximum file size: 10MB per document</li>
                  </ul>
                </div>

                <div>
                  <div className="font-medium mb-2">DBS Certificate:</div>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside">
                    <li>Must be Enhanced DBS level</li>
                    <li>Must be within the last 3 years</li>
                    <li>Must show "Child Workforce" checking</li>
                  </ul>
                </div>

                <div>
                  <div className="font-medium mb-2">Review Process:</div>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside">
                    <li>Verification typically takes 24-48 hours</li>
                    <li>You'll receive email updates on progress</li>
                    <li>Rejected documents include feedback</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* DBS Information */}
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="h-5 w-5 text-purple-500" />
                  Need a DBS Check?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm pt-0">
                <p className="text-gray-600">
                  Don't have an Enhanced DBS certificate? You can apply for one through the official government service.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open('https://www.gov.uk/request-copy-criminal-record', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apply for DBS Check
                </Button>
                <p className="text-xs text-gray-500">
                  DBS checks typically take 2-4 weeks to process. Standard cost is £40 for Enhanced DBS.
                </p>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:hello@partysnap.uk?subject=Verification Support'}
                >
                  Contact Verification Support
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Our verification team is here to help with any questions
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}