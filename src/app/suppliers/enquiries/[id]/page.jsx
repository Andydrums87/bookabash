// pages/suppliers/enquiries/[id].js
// Individual enquiry details and response page

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Package,
  Gift,
  Loader2,
  ArrowLeft,
  Send,
  PoundSterling
} from "lucide-react"
import Link from "next/link"
import { supplierEnquiryBackend } from "@/utils/supplierEnquiryBackend"

export default function EnquiryDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const enquiryId = params.id

  const [enquiry, setEnquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [error, setError] = useState(null)

  // Response form state
  const [response, setResponse] = useState('') // 'accepted' or 'declined'
  const [finalPrice, setFinalPrice] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)

  useEffect(() => {
    if (enquiryId) {
      loadEnquiryDetails()
    }
  }, [enquiryId])

  const loadEnquiryDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await supplierEnquiryBackend.getEnquiryDetails(enquiryId)
      
      if (result.success) {
        setEnquiry(result.enquiry)
        setFinalPrice(result.enquiry.quoted_price?.toString() || '')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (responseType) => {
    setResponse(responseType)
    setShowResponseForm(true)
  }

  const submitResponse = async () => {
    if (!response) return

    try {
      setResponding(true)
      
      const result = await supplierEnquiryBackend.respondToEnquiry(
        enquiryId,
        response,
        finalPrice ? parseFloat(finalPrice) : null,
        responseMessage
      )

      if (result.success) {
        // Reload enquiry to show updated status
        await loadEnquiryDetails()
        setShowResponseForm(false)
        
        // Show success message
        alert(`Enquiry ${response} successfully! The customer will be notified.`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setResponding(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      viewed: 'bg-blue-100 text-blue-800 border-blue-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  const parseSpecialRequests = (specialRequests) => {
    if (!specialRequests) return null
    
    try {
      return JSON.parse(specialRequests)
    } catch {
      return { message: specialRequests }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
          <p className="text-gray-600">Loading enquiry details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => router.push('/suppliers/enquiries')}>
            Back to Enquiries
          </Button>
        </div>
      </div>
    )
  }

  if (!enquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Enquiry not found</p>
          <Button onClick={() => router.push('/suppliers/enquiries')}>
            Back to Enquiries
          </Button>
        </div>
      </div>
    )
  }

  const party = enquiry.parties
  const customer = party?.users
  const specialReqs = parseSpecialRequests(enquiry.special_requests)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/suppliers/enquiries">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Enquiries
              </Link>
            </Button>
            <Badge className={getStatusColor(enquiry.status)}>
              <span className="capitalize">{enquiry.status}</span>
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {party?.child_name}'s {party?.theme} Party
          </h1>
          <p className="text-gray-600">
            Enquiry from {customer?.first_name} {customer?.last_name} • 
            Received {new Date(enquiry.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Party Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Party Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date & Time</label>
                    <p className="text-lg font-semibold">
                      {formatDate(party?.party_date)} at {formatTime(party?.party_time)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {party?.location}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Theme</label>
                    <p className="text-lg capitalize font-medium text-primary-600">{party?.theme}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Child Details</label>
                    <p>{party?.child_name}, {party?.child_age} years old</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Number of Children</label>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      {party?.guest_count} children expected
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Budget</label>
                    <p className="flex items-center gap-2">
                      <PoundSterling className="w-4 h-4 text-gray-500" />
                      £{party?.budget} total party budget
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Customer Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-semibold">{customer?.first_name} {customer?.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href={`mailto:${customer?.email}`} className="text-primary-600 hover:underline">
                      {customer?.email}
                    </a>
                  </p>
                </div>
                {customer?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${customer?.phone}`} className="text-primary-600 hover:underline">
                        {customer?.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Service Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-primary-900 capitalize">
                    {enquiry.supplier_category} Service
                  </h4>
                  <span className="text-2xl font-bold text-primary-700">
                    £{enquiry.quoted_price}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-primary-700">
                  {enquiry.package_id && (
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Package Selected
                    </span>
                  )}
                  {enquiry.addon_ids && enquiry.addon_ids.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      {enquiry.addon_ids.length} Add-ons Requested
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Message */}
          {enquiry.message && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Customer Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 italic">"{enquiry.message}"</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Requirements */}
          {specialReqs && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {specialReqs.dietary && Object.values(specialReqs.dietary).some(Boolean) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Dietary Requirements</h4>
                      <ul className="space-y-1">
                        {Object.entries(specialReqs.dietary).map(([key, value]) => 
                          value && (
                            <li key={key} className="text-sm text-gray-700">
                              • {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {specialReqs.accessibility && Object.values(specialReqs.accessibility).some(Boolean) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Accessibility Requirements</h4>
                      <ul className="space-y-1">
                        {Object.entries(specialReqs.accessibility).map(([key, value]) => 
                          value && (
                            <li key={key} className="text-sm text-gray-700">
                              • {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {specialReqs.numberOfChildren && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Expected Attendance</h4>
                      <p className="text-sm text-gray-700">{specialReqs.numberOfChildren} children</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Section */}
          {enquiry.status === 'accepted' || enquiry.status === 'declined' ? (
            <Card className={enquiry.status === 'accepted' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {enquiry.status === 'accepted' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  Your Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Badge className={enquiry.status === 'accepted' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                      {enquiry.status === 'accepted' ? 'ACCEPTED' : 'DECLINED'}
                    </Badge>
                    {enquiry.final_price && (
                      <span className="text-lg font-bold text-gray-900">
                        Final Price: £{enquiry.final_price}
                      </span>
                    )}
                  </div>
                  {enquiry.supplier_response && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-900">{enquiry.supplier_response}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Responded on {new Date(enquiry.supplier_response_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Respond to Enquiry</CardTitle>
              </CardHeader>
              <CardContent>
                {!showResponseForm ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      How would you like to respond to this party enquiry?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={() => handleResponse('accepted')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Enquiry
                      </Button>
                      <Button 
                        onClick={() => handleResponse('declined')}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline Enquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {response === 'accepted' ? 'Accept' : 'Decline'} Enquiry
                      </h3>
                      <Badge className={response === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {response === 'accepted' ? 'Accepting' : 'Declining'}
                      </Badge>
                    </div>

                    {response === 'accepted' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Final Price (Optional)
                        </label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="number"
                            value={finalPrice}
                            onChange={(e) => setFinalPrice(e.target.value)}
                            placeholder="Enter final price"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Leave blank to keep the original quote of £{enquiry.quoted_price}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message to Customer
                      </label>
                      <Textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder={
                          response === 'accepted' 
                            ? "Thank you for your enquiry! I'd be delighted to provide entertainment for your child's party. Please let me know if you have any questions..."
                            : "Thank you for your enquiry. Unfortunately, I'm not available for this date. I'd be happy to suggest alternative dates if you're flexible..."
                        }
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={submitResponse}
                        disabled={responding}
                        className={response === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                      >
                        {responding ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Response
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setShowResponseForm(false)}
                        variant="outline"
                        disabled={responding}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}