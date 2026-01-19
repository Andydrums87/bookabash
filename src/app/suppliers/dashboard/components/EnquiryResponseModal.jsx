"use client"

import { useState, useEffect, useRef } from "react"
import { X, Calendar, Users, MapPin, Clock, CheckCircle, XCircle, Loader2, Send, ChevronDown, Mail, Phone, Cake, Truck, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { supplierEnquiryBackend } from "@/utils/supplierEnquiryBackend"
import Link from "next/link"

const shortcodes = [
  { code: '{customer_name}', label: 'Customer name' },
  { code: '{child_name}', label: 'Child name' },
  { code: '{event_date}', label: 'Event date' },
  { code: '{event_time}', label: 'Event time' },
  { code: '{package_name}', label: 'Package name' },
  { code: '{business_name}', label: 'Your business name' },
  { code: '{total_price}', label: 'Total price' },
]

export default function EnquiryResponseModal({ enquiry, isOpen, onClose, onResponseSent, initialResponseType }) {
  const [response, setResponse] = useState(null) // 'accepted' | 'declined' | null
  const [responseMessage, setResponseMessage] = useState("")
  const [finalPrice, setFinalPrice] = useState("")
  const [responding, setResponding] = useState(false)
  const [messageTemplates, setMessageTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const textareaRef = useRef(null)
  const cursorPositionRef = useRef(null)

  const party = enquiry?.parties
  const customer = party?.users
  const [supplierResponseMessage, setSupplierResponseMessage] = useState(null)
  const [loadingResponse, setLoadingResponse] = useState(false)

  // Check if this is a cake order and parse customization data
  const isCakeOrder = enquiry?.supplier_category?.toLowerCase()?.includes('cake')

  // Parse cake customization info from addon_details
  const addonDetails = typeof enquiry?.addon_details === 'string'
    ? JSON.parse(enquiry.addon_details || '{}')
    : enquiry?.addon_details || {}

  const cakeCustomization = addonDetails?.cakeCustomization || {}

  // Get package name from addon_details or fallback to formatted package_id
  const packageName = addonDetails?.packageName ||
                      addonDetails?.selectedPackage?.name ||
                      addonDetails?.packageData?.name ||
                      null

  const handleTextareaBlur = () => {
    const textarea = textareaRef.current
    if (textarea) {
      cursorPositionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      }
    }
  }

  const insertShortcode = (code) => {
    const textarea = textareaRef.current
    // Use saved cursor position, or append to end if no position saved
    const position = cursorPositionRef.current || { start: responseMessage.length, end: responseMessage.length }
    const start = position.start
    const end = position.end

    const newMessage = responseMessage.substring(0, start) + code + responseMessage.substring(end)
    setResponseMessage(newMessage)

    // Update cursor position ref and focus textarea
    const newCursorPos = start + code.length
    cursorPositionRef.current = { start: newCursorPos, end: newCursorPos }

    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Check if this is a confirmed booking (already responded)
  const isConfirmedBooking = enquiry?.status === 'accepted' && (enquiry?.supplier_response || !enquiry?.auto_accepted)

  // Load supplier response from supplier_responses table
  useEffect(() => {
    const loadSupplierResponse = async () => {
      if (!isOpen || !enquiry?.id || !isConfirmedBooking) return

      setLoadingResponse(true)
      try {
        const { data, error } = await supabase
          .from('supplier_responses')
          .select('response_message')
          .eq('enquiry_id', enquiry.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!error && data) {
          setSupplierResponseMessage(data.response_message)
        } else {
          // Fall back to enquiry.supplier_response
          setSupplierResponseMessage(enquiry.supplier_response)
        }
      } catch (err) {
        console.error('Error loading supplier response:', err)
        setSupplierResponseMessage(enquiry.supplier_response)
      } finally {
        setLoadingResponse(false)
      }
    }

    loadSupplierResponse()
  }, [isOpen, enquiry?.id, isConfirmedBooking])

  // Track if we need to trigger initial response
  const [shouldTriggerInitialResponse, setShouldTriggerInitialResponse] = useState(false)

  // Reset state when modal opens/closes or enquiry changes
  useEffect(() => {
    if (isOpen && enquiry) {
      setFinalPrice(enquiry.quoted_price?.toString() || "")
      setSelectedTemplateId(null)
      setResponse(null)
      setResponseMessage("")
      setShowSuccess(false)
      setSuccessData(null)

      // If an initial response type is provided, flag to trigger it
      if (initialResponseType) {
        setShouldTriggerInitialResponse(true)
      }
    }
  }, [isOpen, enquiry?.id, initialResponseType])

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD"
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (party) => {
    if (!party) return ""
    if (party.party_time) {
      const [hours, minutes] = party.party_time.split(":")
      const time = new Date()
      time.setHours(Number(hours), Number(minutes))
      return time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    }
    if (party.time_slot) {
      return party.time_slot === 'morning' ? '10am - 1pm' : '1pm - 4pm'
    }
    return ""
  }

  const formatTimeRange = (party) => {
    if (!party) return null
    if (party.start_time && party.end_time) {
      const formatSingleTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(":")
        const time = new Date()
        time.setHours(Number(hours), Number(minutes))
        return time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      }
      return `${formatSingleTime(party.start_time)} - ${formatSingleTime(party.end_time)}`
    }
    return null
  }

  const calculateDuration = (party) => {
    if (!party?.start_time || !party?.end_time) return null
    const [startH, startM] = party.start_time.split(":").map(Number)
    const [endH, endM] = party.end_time.split(":").map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const durationMinutes = endMinutes - startMinutes
    const hours = Math.floor(durationMinutes / 60)
    const mins = durationMinutes % 60
    if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`
    return `${hours}h ${mins}m`
  }

  const processTemplate = (template) => {
    if (!template || !enquiry) return template
    // Get business name from multiple possible locations
    const businessName = enquiry.businessName ||
                         enquiry.supplier?.businessName ||
                         enquiry.supplier?.business_name ||
                         enquiry.supplier?.data?.name ||
                         enquiry.supplier?.name ||
                         enquiry.suppliers?.data?.name ||
                         enquiry.suppliers?.name ||
                         "Your supplier"
    return template
      .replace(/{customer_name}/g, customer?.first_name || "there")
      .replace(/{child_name}/g, party?.child_name || "your child")
      .replace(/{event_date}/g, formatDate(party?.party_date))
      .replace(/{party_date}/g, formatDate(party?.party_date))
      .replace(/{event_time}/g, formatTime(party))
      .replace(/{party_theme}/g, party?.theme || "themed")
      .replace(/{final_price}/g, finalPrice || enquiry.quoted_price)
      .replace(/{total_price}/g, finalPrice || enquiry.quoted_price)
      .replace(/{guest_count}/g, party?.guest_count || "the children")
      .replace(/{business_name}/g, businessName)
      .replace(/{package_name}/g, packageName || "your package")
  }

  const loadMessageTemplates = async () => {
    if (!enquiry?.supplier_id) return []
    try {
      const { data, error } = await supabase
        .from('supplier_message_templates')
        .select('*')
        .eq('supplier_id', enquiry.supplier_id)
        .eq('template_type', 'acceptance')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessageTemplates(data || [])
      return data || []
    } catch (err) {
      console.error('Error loading templates:', err)
      return []
    }
  }

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId)
    const template = messageTemplates.find(t => t.id === templateId)
    if (template) {
      setResponseMessage(processTemplate(template.message_template))
    }
  }

  const handleResponse = async (responseType) => {
    setResponse(responseType)
    setTemplatesLoading(true)

    try {
      const templates = await loadMessageTemplates()

      if (responseType === "accepted" && templates && templates.length > 0) {
        const defaultTemplate = templates.find(t => t.is_default) || templates[0]
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id)
          setResponseMessage(processTemplate(defaultTemplate.message_template))
        }
      } else {
        setResponseMessage(
          responseType === "accepted"
            ? "Thank you for your enquiry! I'm pleased to confirm I can provide this service for your party."
            : "Thank you for your enquiry. Unfortunately, I'm not available for this date."
        )
      }
    } catch {
      setResponseMessage(
        responseType === "accepted"
          ? "Thank you for your enquiry! I'm pleased to confirm I can provide this service for your party."
          : "Thank you for your enquiry. Unfortunately, I'm not available for this date."
      )
    } finally {
      setTemplatesLoading(false)
    }
  }

  // Trigger initial response type when flagged
  useEffect(() => {
    if (shouldTriggerInitialResponse && initialResponseType && isOpen && enquiry) {
      handleResponse(initialResponseType)
      setShouldTriggerInitialResponse(false)
    }
  }, [shouldTriggerInitialResponse, initialResponseType, isOpen, enquiry])

  const submitResponse = async () => {
    if (!response || !enquiry) return

    try {
      setResponding(true)
      const isPaid = ['paid', 'fully_paid', 'deposit_paid'].includes(enquiry.payment_status)

      const enquiryResult = await supplierEnquiryBackend.respondToEnquiry(
        enquiry.id, response, finalPrice ? Number(finalPrice) : null, responseMessage, isPaid
      )

      if (!enquiryResult.success) {
        alert(enquiryResult.error || 'Failed to send response')
        return
      }

      await supplierEnquiryBackend.saveSupplierResponse({
        enquiry_id: enquiry.id,
        party_id: party?.id,
        supplier_id: enquiry.supplier_id,
        customer_id: customer?.id,
        response_type: response,
        response_message: responseMessage,
        final_price: finalPrice ? Number(finalPrice) : null,
      })

      // Send email notification
      let emailSent = false
      try {
        const emailResponse = await fetch("/api/email/customer-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerEmail: customer?.email,
            customerName: customer?.first_name,
            childName: party?.child_name,
            theme: party?.theme,
            partyDate: party?.party_date,
            supplierName: enquiry.supplier?.name || enquiry.businessName || 'Your Supplier',
            supplierEmail: enquiry.supplier?.owner?.email || enquiry.supplier?.email,
            supplierPhone: enquiry.supplier?.owner?.phone || enquiry.supplier?.phone,
            serviceType: enquiry.supplier_category,
            supplierMessage: responseMessage,
            responseType: response,
            dashboardLink: `${window.location.origin}/dashboard`,
          }),
        })
        emailSent = emailResponse.ok
      } catch {}

      // Store success data and show success state
      const successInfo = {
        responseType: response,
        customerName: customer?.first_name,
        childName: party?.child_name,
        partyDate: party?.party_date,
        price: finalPrice || enquiry.quoted_price,
        emailSent,
        enquiryId: enquiry.id,
      }
      setSuccessData(successInfo)
      setShowSuccess(true)
      setResponding(false)

    } catch (err) {
      console.error('Error submitting response:', err)
      alert('Something went wrong. Please try again.')
      setResponding(false)
    }
  }

  const handleSuccessDone = () => {
    // Notify parent that response was sent (for list refresh) when closing
    if (successData) {
      onResponseSent?.(successData.enquiryId, successData.responseType)
    }
    setShowSuccess(false)
    setSuccessData(null)
    onClose()
  }

  if (!isOpen || !enquiry) return null

  const timeDisplay = formatTime(party)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal - Desktop / Sheet - Mobile */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
        <div
          className="bg-white w-full lg:w-full lg:max-w-lg lg:rounded-2xl rounded-t-2xl max-h-[90vh] lg:max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={showSuccess ? handleSuccessDone : onClose}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-semibold text-gray-900">
              {showSuccess
                ? (successData?.responseType === 'accepted' ? 'Booking confirmed' : 'Response sent')
                : isConfirmedBooking
                  ? 'Booking details'
                  : 'Respond to enquiry'}
            </h2>
            <div className="w-9" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Success State */}
            {showSuccess ? (
              <div className="flex flex-col items-center text-center py-8">
                {/* Green checkmark circle */}
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {successData?.responseType === 'accepted'
                    ? 'Booking confirmed!'
                    : 'Response sent'}
                </h3>

                <p className="text-gray-500 mb-4">
                  {successData?.responseType === 'accepted'
                    ? `You're all set for ${successData?.childName}'s party on ${formatDate(successData?.partyDate)}`
                    : `${successData?.customerName} has been notified`}
                </p>

                <p className="text-sm text-gray-400">
                  {successData?.customerName} will receive an email with your message
                </p>
              </div>
            ) : (
              <>
                {/* Party summary */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {party?.child_name}'s {party?.theme || ''} Party
                  </h3>
                  <p className="text-gray-500">{customer?.first_name} {customer?.last_name}</p>
                </div>

                {/* Quick details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(party?.party_date)}</p>
                </div>
              </div>
              {(timeDisplay || formatTimeRange(party)) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time{calculateDuration(party) ? ` (${calculateDuration(party)})` : ''}</p>
                    <p className="font-medium text-gray-900">{formatTimeRange(party) || timeDisplay}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium text-gray-900">{party?.guest_count} children</p>
                </div>
              </div>
              {(enquiry?.package_id || packageName) && !isCakeOrder && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Package</p>
                    <p className="font-medium text-gray-900">{packageName || 'Selected package'}</p>
                  </div>
                </div>
              )}
              {enquiry?.addon_ids && enquiry.addon_ids.length > 0 && !isCakeOrder && (
                <div className="flex items-start gap-3 col-span-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-sm font-medium">✨</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Add-ons</p>
                    <p className="font-medium text-gray-900">
                      {enquiry.addon_ids.map(id => id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {isCakeOrder && (party?.full_delivery_address || party?.delivery_address_line_1 || party?.location) && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    {party?.full_delivery_address ? (
                      <p className="font-medium text-gray-900 whitespace-pre-line">{party.full_delivery_address}</p>
                    ) : party?.delivery_address_line_1 ? (
                      <div className="font-medium text-gray-900">
                        <p>{party.delivery_address_line_1}</p>
                        {party.delivery_address_line_2 && <p>{party.delivery_address_line_2}</p>}
                        <p>{party.delivery_postcode || party.postcode}</p>
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900">{party.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between py-4 border-t border-gray-100 mb-6">
              <span className="text-gray-600">{isConfirmedBooking ? 'Price' : 'Quoted price'}</span>
              <span className="text-xl font-semibold text-gray-900">£{enquiry.final_price || enquiry.quoted_price}</span>
            </div>

            {/* Cake Order Details */}
            {isCakeOrder && (cakeCustomization.flavorName || cakeCustomization.fulfillmentMethod || cakeCustomization.customMessage || enquiry.package_id) && (
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100 mb-6">
                <h4 className="font-semibold text-pink-900 flex items-center gap-2 mb-3">
                  <Cake className="w-4 h-4" />
                  Cake Order Details
                </h4>
                <div className="space-y-2 text-sm">
                  {enquiry.package_id && (
                    <div className="flex items-center gap-2">
                      <span className="text-pink-700 font-medium">Size:</span>
                      <span className="text-pink-900">{enquiry.package_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  )}
                  {cakeCustomization.flavorName && (
                    <div className="flex items-center gap-2">
                      <span className="text-pink-700 font-medium">Flavour:</span>
                      <span className="text-pink-900">{cakeCustomization.flavorName}</span>
                    </div>
                  )}
                  {cakeCustomization.dietaryName && cakeCustomization.dietaryName !== 'Standard' && (
                    <div className="flex items-center gap-2">
                      <span className="text-pink-700 font-medium">Dietary:</span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        {cakeCustomization.dietaryName}
                      </span>
                    </div>
                  )}
                  {cakeCustomization.fulfillmentMethod && (
                    <div className="flex items-center gap-2">
                      <span className="text-pink-700 font-medium">Fulfilment:</span>
                      <span className="text-pink-900 capitalize flex items-center gap-1">
                        {cakeCustomization.fulfillmentMethod === 'delivery' ? (
                          <>
                            <Truck className="w-3 h-3" /> Delivery
                            {cakeCustomization.deliveryFee > 0 && ` (+£${cakeCustomization.deliveryFee})`}
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3" /> Pickup
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  {cakeCustomization.customMessage && (
                    <div className="mt-2 p-2 bg-white rounded border border-pink-200">
                      <span className="text-pink-700 font-medium block text-xs mb-1">Custom Message:</span>
                      <p className="text-pink-900 text-sm italic">"{cakeCustomization.customMessage}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirmed booking view */}
            {isConfirmedBooking ? (
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    Confirmed
                  </span>
                </div>

                {/* Customer contact */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Customer contact</h4>
                  <div className="space-y-3">
                    {customer?.email && (
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex items-center gap-3 text-gray-900 hover:text-gray-600"
                      >
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span>{customer.email}</span>
                      </a>
                    )}
                    {customer?.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex items-center gap-3 text-gray-900 hover:text-gray-600"
                      >
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>{customer.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Your response */}
                {(supplierResponseMessage || enquiry.supplier_response) && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Your message</h4>
                    {loadingResponse ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                        {supplierResponseMessage || enquiry.supplier_response}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : !response ? (
              /* Response selection for pending enquiries */
              <div className="space-y-3">
                <button
                  onClick={() => handleResponse("accepted")}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accept booking
                </button>
                <button
                  onClick={() => handleResponse("declined")}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Decline
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Response type indicator */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    response === "accepted"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {response === "accepted" ? "Accepting" : "Declining"}
                  </span>
                  <button
                    onClick={() => setResponse(null)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Change
                  </button>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Message
                    </label>
                    {response === "accepted" && messageTemplates.length > 0 && (
                      <div className="relative">
                        <select
                          value={selectedTemplateId || ''}
                          onChange={(e) => handleSelectTemplate(Number(e.target.value))}
                          className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                          <option value="" disabled>Select template</option>
                          {messageTemplates.map(template => (
                            <option key={template.id} value={template.id}>
                              {template.template_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    onBlur={handleTextareaBlur}
                    rows={5}
                    placeholder={templatesLoading ? "Loading..." : "Write your message..."}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />

                  {/* Shortcode buttons */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1.5">Click to insert:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {shortcodes.map(({ code, label }) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => insertShortcode(code)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {response === "accepted" && messageTemplates.length === 0 && !templatesLoading && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Link href="/suppliers/profile" className="text-gray-900 underline">
                        Create templates
                      </Link>
                      {' '}to save time.
                    </p>
                  )}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Footer */}
          {showSuccess ? (
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleSuccessDone}
                className="w-full py-3 rounded-xl text-base font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          ) : isConfirmedBooking ? (
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-base font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          ) : response && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <button
                onClick={onClose}
                className="text-base font-medium text-gray-900 underline"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                disabled={responding || !responseMessage.trim()}
                className={`px-6 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-2 ${
                  responding || !responseMessage.trim()
                    ? 'bg-gray-200 text-gray-400'
                    : response === "accepted"
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {responding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
