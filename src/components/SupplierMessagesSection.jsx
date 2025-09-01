"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const SupplierMessagesSection = ({ customerId, partyId }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedMessages, setExpandedMessages] = useState(new Set())

  useEffect(() => {
    if (customerId) {
      loadSupplierMessages()
    }
  }, [customerId, partyId])

  const loadSupplierMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading messages for customer:', customerId, 'party:', partyId)

      // Step 1: Get supplier responses - temporarily filter by party only
      let query = supabase
        .from('supplier_responses')
        .select('*')
        // .eq('customer_id', customerId) // Temporarily commented out
        
      if (partyId) {
        query = query.eq('party_id', partyId)
      }

      const { data: responses, error: responsesError } = await query
        .order('sent_at', { ascending: false })

      if (responsesError) {
        throw new Error(`Failed to fetch supplier messages: ${responsesError.message}`)
      }

      console.log('Found responses:', responses?.length || 0)

      if (!responses || responses.length === 0) {
        setMessages([])
        return
      }

      // Step 2: Get related data manually
      const supplierIds = [...new Set(responses.map(r => r.supplier_id).filter(Boolean))]
      const enquiryIds = [...new Set(responses.map(r => r.enquiry_id).filter(Boolean))]

      // Fetch suppliers
      let suppliersData = []
      if (supplierIds.length > 0) {
        const { data: suppliers, error: suppliersError } = await supabase
          .from('suppliers')
          .select('id, business_name, data')
          .in('id', supplierIds)

        if (!suppliersError) {
          suppliersData = suppliers || []
        }
      }

      // Fetch enquiries  
      let enquiriesData = []
      if (enquiryIds.length > 0) {
        const { data: enquiries, error: enquiriesError } = await supabase
          .from('enquiries')
          .select('id, quoted_price, package_id, status, supplier_category')
          .in('id', enquiryIds)

        if (!enquiriesError) {
          enquiriesData = enquiries || []
        }
      }

      // Step 3: Create lookup maps and enrich responses
      const suppliersMap = new Map(suppliersData.map(s => [s.id, s]))
      const enquiriesMap = new Map(enquiriesData.map(e => [e.id, e]))

      const enrichedResponses = responses.map(response => ({
        ...response,
        suppliers: suppliersMap.get(response.supplier_id) || null,
        enquiries: enquiriesMap.get(response.enquiry_id) || null
      }))

      setMessages(enrichedResponses)

      // Mark unread messages as read
      const unreadMessages = responses?.filter(msg => !msg.read_by_customer_at) || []
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id)
        await markMessagesAsRead(unreadIds)
      }

    } catch (err) {
      console.error('Error loading supplier messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper to extract data from supplier JSON
  const getSupplierData = (supplier, field) => {
    try {
      if (!supplier?.data) return null
      
      const data = typeof supplier.data === 'string' ? JSON.parse(supplier.data) : supplier.data
      
      switch (field) {
        case 'email':
          return data.contactInfo?.email || data.owner?.email || null
        case 'phone':
          return data.contactInfo?.phone || data.owner?.phone || null
        case 'category':
          return data.category || null
        default:
          return null
      }
    } catch (error) {
      console.error('Error parsing supplier data:', error)
      return null
    }
  }

  const markMessagesAsRead = async (messageIds) => {
    try {
      const { error } = await supabase
        .from('supplier_responses')
        .update({ read_by_customer_at: new Date().toISOString() })
        .in('id', messageIds)

      if (error) {
        console.error('Error marking messages as read:', error)
      }
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const minutes = Math.floor((now - date) / (1000 * 60))
        return `${minutes}m ago`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short'
        })
      }
    } catch (error) {
      return 'Recently'
    }
  }

  const getStatusColor = (responseType) => {
    return responseType === 'accepted' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200'
  }

  const getStatusIcon = (responseType) => {
    return responseType === 'accepted' 
      ? <CheckCircle className="w-4 h-4" />
      : <XCircle className="w-4 h-4" />
  }

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      entertainment: 'Entertainment',
      catering: 'Catering',
      venue: 'Venue',
      photography: 'Photography',
      decorations: 'Decorations',
      activities: 'Activities',
      facePainting: 'Face Painting',
      partyBags: 'Party Bags',
      balloons: 'Balloons',
      cakes: 'Cakes'
    }
    return categoryNames[category] || category
  }

  // Don't show section if no messages and not loading
  if (!loading && messages.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          Supplier Messages
          {messages.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {messages.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Responses and updates from your party suppliers
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading messages...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <p className="text-red-600">Failed to load messages: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSupplierMessages}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No supplier messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Suppliers will appear here when they respond to your enquiries
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isExpanded = expandedMessages.has(message.id)
              const isLongMessage = message.response_message && message.response_message.length > 150
              const supplier = message.suppliers
              const enquiry = message.enquiries
              const supplierCategory = enquiry?.supplier_category || getSupplierData(supplier, 'category')
              
              return (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Message Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {supplier?.business_name || 'Supplier'}
                        </h4>
                        {supplierCategory && (
                          <Badge className="text-xs bg-gray-100 text-gray-700">
                            {getCategoryDisplayName(supplierCategory)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(message.sent_at)}</span>
                        {!message.read_by_customer_at && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={`${getStatusColor(message.response_type)} mb-1`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(message.response_type)}
                          {message.response_type === 'accepted' ? 'CONFIRMED' : 'DECLINED'}
                        </span>
                      </Badge>
                      {message.final_price && (
                        <div className="text-sm font-semibold text-gray-900">
                          £{message.final_price}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className={`text-gray-800 ${!isExpanded && isLongMessage ? 'line-clamp-3' : ''}`}>
                      {message.response_message}
                    </p>
                    
                    {isLongMessage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMessageExpansion(message.id)}
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto mt-2 text-sm"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Read more
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Contact Info for Confirmed Suppliers */}
                  {message.response_type === 'accepted' && supplier && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {getSupplierData(supplier, 'email') && (
                          <a 
                            href={`mailto:${getSupplierData(supplier, 'email')}`}
                            className="flex items-center gap-2 text-green-800 hover:text-green-900 transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            {getSupplierData(supplier, 'email')}
                          </a>
                        )}
                        {getSupplierData(supplier, 'phone') && (
                          <a 
                            href={`tel:${getSupplierData(supplier, 'phone')}`}
                            className="flex items-center gap-2 text-green-800 hover:text-green-900 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            {getSupplierData(supplier, 'phone')}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SupplierMessagesSection