"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Send,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const SupplierChatTabs = ({ customerId, partyId, suppliers = {} }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(null)
  const [error, setError] = useState(null)

  // Get supplier categories that have been selected
  const supplierCategories = Object.keys(suppliers).filter(key => 
    suppliers[key] && key !== 'einvites'
  )

  useEffect(() => {
    if (customerId && supplierCategories.length > 0) {
      loadAllMessages()
      // Set first category as active tab
      if (!activeTab) {
        setActiveTab(supplierCategories[0])
      }
    }
  }, [customerId, partyId, supplierCategories.length])

  const loadAllMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('supplier_responses')
        .select('*')
        
      if (partyId) {
        query = query.eq('party_id', partyId)
      }

      const { data: responses, error: responsesError } = await query
        .order('sent_at', { ascending: false })

      if (responsesError) {
        throw new Error(responsesError.message)
      }

      // Get related data
      if (responses && responses.length > 0) {
        const supplierIds = [...new Set(responses.map(r => r.supplier_id).filter(Boolean))]
        const enquiryIds = [...new Set(responses.map(r => r.enquiry_id).filter(Boolean))]

        // Fetch suppliers and enquiries
        const [suppliersResult, enquiriesResult] = await Promise.all([
          supabase.from('suppliers_secure').select('id, business_name, data').in('id', supplierIds),
          supabase.from('enquiries').select('id, quoted_price, status, supplier_category').in('id', enquiryIds)
        ])

        const suppliersMap = new Map((suppliersResult.data || []).map(s => [s.id, s]))
        const enquiriesMap = new Map((enquiriesResult.data || []).map(e => [e.id, e]))

        const enrichedMessages = responses.map(response => ({
          ...response,
          supplier: suppliersMap.get(response.supplier_id),
          enquiry: enquiriesMap.get(response.enquiry_id)
        }))

        setMessages(enrichedMessages)
      } else {
        setMessages([])
      }

    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSupplierData = (supplier, field) => {
    try {
      if (!supplier?.data) return null
      const data = typeof supplier.data === 'string' ? JSON.parse(supplier.data) : supplier.data
      
      switch (field) {
        case 'email': return data.contactInfo?.email || data.owner?.email || null
        case 'phone': return data.contactInfo?.phone || data.owner?.phone || null
        case 'name': return data.name || supplier.business_name || 'Supplier'
        default: return null
      }
    } catch {
      return null
    }
  }

  const getCategoryDisplayName = (category) => {
    const names = {
      entertainment: 'Entertainment',
      catering: 'Catering', 
      venue: 'Venue',
      photography: 'Photography',
      decorations: 'Decorations',
      activities: 'Soft Play',
      facePainting: 'Face Painting',
      partyBags: 'Party Bags',
      balloons: 'Balloons',
      cakes: 'Cakes'
    }
    return names[category] || category
  }

  const getTabIcon = (category) => {
    const icons = {
      entertainment: '🎭',
      catering: '🍰',
      venue: '🏠',
      photography: '📸',
      decorations: '🎨',
      activities: '🎮',
      facePainting: '🎨',
      partyBags: '🎁',
      balloons: '🎈',
      cakes: '🧁'
    }
    return icons[category] || '💼'
  }

  const getMessagesForCategory = (category) => {
    return messages.filter(msg => msg.enquiry?.supplier_category === category)
  }

  const formatMessageTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  if (supplierCategories.length === 0) {
    return null
  }

  const activeMessages = activeTab ? getMessagesForCategory(activeTab) : []
  const activeSupplier = suppliers[activeTab]

  return (
    <Card className="mb-8 p-4">
   
      
      <CardContent className="p-0">
        {/* Supplier Category Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex overflow-x-auto gap-1 pb-2">
            {supplierCategories.map((category) => {
              const categoryMessages = getMessagesForCategory(category)
              const hasUnread = categoryMessages.some(msg => !msg.read_by_customer_at)
              const hasMessages = categoryMessages.length > 0
              
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === category
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{getTabIcon(category)}</span>
                  <span className="font-medium text-sm">
                    {getCategoryDisplayName(category)}
                  </span>
                  
                  {hasUnread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  
                  {hasMessages && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 min-w-5 h-5">
                      {categoryMessages.length}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="h-96 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading conversations...</span>
            </div>
          ) : !activeTab ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
              <p>Select a supplier to view messages</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">{getTabIcon(activeTab)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeSupplier?.name || getCategoryDisplayName(activeTab)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getCategoryDisplayName(activeTab)} Supplier
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm text-center mt-1">
                      Your {getCategoryDisplayName(activeTab).toLowerCase()} supplier hasn't responded yet.
                      <br />
                      Messages will appear here when they reply to your enquiry.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((message) => (
                      <SupplierMessage key={message.id} message={message} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const SupplierMessage = ({ message }) => {
  const supplier = message.supplier
  const isAccepted = message.response_type === 'accepted'
  
  const getSupplierData = (supplier, field) => {
    try {
      if (!supplier?.data) return null
      const data = typeof supplier.data === 'string' ? JSON.parse(supplier.data) : supplier.data
      
      switch (field) {
        case 'email': return data.contactInfo?.email || data.owner?.email || null
        case 'phone': return data.contactInfo?.phone || data.owner?.phone || null
        case 'name': return data.name || supplier.business_name || 'Supplier'
        default: return null
      }
    } catch {
      return null
    }
  }

  return (
    <div className="flex gap-3">
      {/* Supplier Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAccepted ? 'bg-green-500' : 'bg-red-500'
      }`}>
        {isAccepted ? (
          <CheckCircle className="w-4 h-4 text-white" />
        ) : (
          <XCircle className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className="flex-1 max-w-sm">
        <div className={`rounded-2xl rounded-tl-sm p-3 ${
          isAccepted 
            ? 'bg-green-100 border border-green-200' 
            : 'bg-red-100 border border-red-200'
        }`}>
          <p className="text-gray-800 text-sm leading-relaxed">
            {message.response_message}
          </p>
          
          {message.final_price && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                Final Price: £{message.final_price}
              </p>
            </div>
          )}
        </div>

        {/* Message Meta */}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{getSupplierData(supplier, 'name')}</span>
          <span>•</span>
          <span>{formatMessageTime(message.sent_at)}</span>
          {!message.read_by_customer_at && (
            <Badge className="bg-blue-500 text-white text-xs px-1 py-0">
              New
            </Badge>
          )}
        </div>

        {/* Contact Actions for Accepted Messages */}
        {isAccepted && supplier && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
            <h4 className="text-xs font-medium text-green-900 mb-2 uppercase tracking-wide">
              Contact {getSupplierData(supplier, 'name')}
            </h4>
            <div className="flex gap-2">
              {getSupplierData(supplier, 'email') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-green-300 text-green-700 hover:bg-green-50"
                  asChild
                >
                  <a href={`mailto:${getSupplierData(supplier, 'email')}`}>
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </a>
                </Button>
              )}
              {getSupplierData(supplier, 'phone') && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-green-300 text-green-700 hover:bg-green-50"
                  asChild
                >
                  <a href={`tel:${getSupplierData(supplier, 'phone')}`}>
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const formatMessageTime = (dateString) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    } else {
      return date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  } catch {
    return 'Recently'
  }
}

export default SupplierChatTabs