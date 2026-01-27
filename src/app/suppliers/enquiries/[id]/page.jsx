"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
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
  Gift,
  Loader2,
  ArrowLeft,
  Send,
  PoundSterling,
  Package,
  Building2,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { supplierEnquiryBackend } from "@/utils/supplierEnquiryBackend"

// Helper functions
function calculatePartyTimes(party) {
  const partyDate = new Date(party.party_date)
  if (party.party_time) {
    const [hours, minutes] = party.party_time.split(':').map(Number)
    partyDate.setHours(hours, minutes, 0, 0)
  } else if (party.time_slot) {
    partyDate.setHours(party.time_slot === 'morning' ? 10 : 13, 0, 0, 0)
  } else {
    partyDate.setHours(14, 0, 0, 0)
  }
  const duration = party.duration || 2
  const endDate = new Date(partyDate.getTime() + duration * 60 * 60 * 1000)
  return { startDateTime: partyDate.toISOString(), endDateTime: endDate.toISOString() }
}

async function createCalendarEventsForBooking(enquiry, party, customer) {
  // Get session token for authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('No valid session for calendar sync')
  }

  const { startDateTime, endDateTime } = calculatePartyTimes(party)
  const eventData = {
    title: `${party.theme} Party - ${party.child_name}`,
    description: `Party Booking - ${customer.first_name} ${customer.last_name}\nChild: ${party.child_name}, Age ${party.child_age}\nGuests: ${party.guest_count}\nPrice: £${enquiry.final_price || enquiry.quoted_price}`,
    location: `${party.location}${party.postcode ? `, ${party.postcode}` : ''}`,
    startTime: startDateTime,
    endTime: endDateTime,
    timeZone: 'Europe/London',
    attendees: [customer.email],
  }
  const response = await fetch('/api/calendar/booking-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ supplierId: enquiry.supplier_id, enquiryId: enquiry.id, eventData }),
  })
  if (!response.ok) throw new Error('Calendar sync failed')
  return response.json()
}

const parseAddonDetails = (addonDetailsString) => {
  if (!addonDetailsString) return []
  try {
    const parsed = typeof addonDetailsString === "string" ? JSON.parse(addonDetailsString) : addonDetailsString
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

// Section component for consistent styling
function Section({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function EnquiryDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const enquiryId = params.id

  const [enquiry, setEnquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState("")
  const [finalPrice, setFinalPrice] = useState("")
  const [responseMessage, setResponseMessage] = useState("")
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [messageTemplates, setMessageTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)

  useEffect(() => {
    if (enquiryId) loadEnquiryDetails()
  }, [enquiryId])

  const loadEnquiryDetails = async () => {
    try {
      setLoading(true)
      const result = await supplierEnquiryBackend.getEnquiryDetails(enquiryId)
      if (result.success) {
        setEnquiry(result.enquiry)
        setFinalPrice(result.enquiry.quoted_price?.toString() || "")
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD"
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch { return "Date TBD" }
  }

  const formatTime = (party) => {
    if (!party) return "Time TBD"
    if (party.time_slot) {
      const slot = party.time_slot === 'morning' ? 'Morning (10am-1pm)' : 'Afternoon (1pm-4pm)'
      return party.duration ? `${slot} - ${party.duration}h` : slot
    }
    if (party.party_time) {
      const [hours, minutes] = party.party_time.split(":")
      const time = new Date()
      time.setHours(Number(hours), Number(minutes))
      return time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    }
    return "Time TBD"
  }

  const processTemplate = (template) => {
    if (!template || !enquiry) return template
    const customer = enquiry.parties?.users
    const party = enquiry.parties
    // Get business name from supplier data - check multiple possible locations
    const businessName = enquiry.supplier?.data?.name ||
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
      .replace(/{package_name}/g, enquiry.package_id?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "your package")
  }

  // Load message templates for this supplier/business
  const loadMessageTemplates = async () => {
    if (!enquiry?.supplier_id) return []
    try {
      // Get supplier's templates - query by supplier_id
      const { data, error } = await supabase
        .from('supplier_message_templates')
        .select('*')
        .eq('supplier_id', enquiry.supplier_id)
        .eq('template_type', 'acceptance')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading templates:', error)
        throw error
      }

      console.log('Loaded templates for supplier:', enquiry.supplier_id, data)
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
      // Load saved templates from database
      const templates = await loadMessageTemplates()

      if (responseType === "accepted" && templates && templates.length > 0) {
        // Use the default template (first one, as they're sorted by is_default)
        const defaultTemplate = templates.find(t => t.is_default) || templates[0]
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id)
          setResponseMessage(processTemplate(defaultTemplate.message_template))
        } else {
          // Fallback to old system
          const template = await supplierEnquiryBackend.getSupplierTemplate(
            enquiry.supplier_id,
            enquiry.supplier_category,
            responseType
          )
          setResponseMessage(processTemplate(template))
        }
      } else {
        // For decline or if no templates, use default message
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
    setShowResponseForm(true)
  }

  const submitResponse = async () => {
    if (!response) return
    try {
      setResponding(true)
      const party = enquiry.parties
      const customer = party?.users
      const isPaid = ['paid', 'fully_paid', 'deposit_paid'].includes(enquiry.payment_status)

      const enquiryResult = await supplierEnquiryBackend.respondToEnquiry(
        enquiryId, response, finalPrice ? Number(finalPrice) : null, responseMessage, isPaid
      )
      if (!enquiryResult.success) { setError(enquiryResult.error); return }

      await supplierEnquiryBackend.saveSupplierResponse({
        enquiry_id: enquiryId,
        party_id: party?.id,
        supplier_id: enquiry.supplier_id,
        customer_id: customer?.id,
        response_type: response,
        response_message: responseMessage,
        final_price: finalPrice ? Number(finalPrice) : null,
      })

      if (response === "accepted") {
        try { await createCalendarEventsForBooking(enquiry, party, customer) } catch {}
      }

      try {
        await fetch("/api/email/customer-response", {
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
      } catch {}

      await loadEnquiryDetails()
      setShowResponseForm(false)

      if (isPaid && response === "declined") {
        alert("PartySnap has been notified. They will find a replacement supplier.")
      } else if (isPaid && response === "accepted") {
        alert("Booking confirmed! You'll receive final details closer to the date.")
      } else {
        alert(`Enquiry ${response}! The customer has been notified.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading enquiry...</p>
        </div>
      </div>
    )
  }

  if (error || !enquiry) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{error || "Enquiry not found"}</h3>
          <Button onClick={() => router.push("/suppliers/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const party = enquiry.parties
  const customer = party?.users
  const addons = parseAddonDetails(enquiry.addon_details)
  const isDepositPaid = enquiry?.auto_accepted && enquiry?.status === "accepted"
  const hasResponded = (enquiry.status === "accepted" && !enquiry.auto_accepted) || enquiry.status === "declined"
  const businessName = enquiry.supplier?.businessName

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Back button */}
        <Link
          href="/suppliers/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Link>

        {/* Header Card */}
        <Section className="mb-6">
          <div className="p-6">
            {/* Business indicator */}
            {businessName && (
              <div className="flex items-center gap-2 text-sm text-primary-600 mb-3">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{businessName}</span>
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {party?.child_name}'s {party?.theme} Party
                </h1>
                <p className="text-gray-500 mt-1">
                  {customer?.first_name} {customer?.last_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">£{enquiry.quoted_price}</p>
                <p className="text-sm text-gray-500">Quoted price</p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {isDepositPaid ? (
                <Badge className="bg-red-100 text-red-700 border-0">
                  Deposit Paid - Urgent
                </Badge>
              ) : hasResponded ? (
                <Badge className={enquiry.status === "accepted"
                  ? "bg-green-100 text-green-700 border-0"
                  : "bg-red-100 text-red-700 border-0"
                }>
                  {enquiry.status === "accepted" ? "Accepted" : "Declined"}
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  Awaiting Response
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                Received {new Date(enquiry.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </Section>

        {/* Urgent Alert for deposit-paid */}
        {isDepositPaid && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Priority Booking - Deposit Paid</p>
                <p className="text-sm text-red-700 mt-1">
                  Customer paid £{Math.round(enquiry.quoted_price * 0.2)} deposit.
                  Please confirm availability within 2 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Party Details */}
        <Section className="mb-6">
          <SectionHeader title="Party Details" />
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoRow icon={Calendar} label="Date" value={formatDate(party?.party_date)} />
            <InfoRow icon={Clock} label="Time" value={formatTime(party)} />
            <InfoRow icon={MapPin} label="Location" value={`${party?.location}${party?.postcode ? ` (${party.postcode})` : ''}`} />
            <InfoRow icon={Users} label="Guests" value={`${party?.guest_count} children (age ${party?.child_age})`} />
            {enquiry.package_id && (
              <InfoRow icon={Package} label="Package" value={enquiry.package_id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} />
            )}
          </div>
        </Section>

        {/* Customer Contact */}
        <Section className="mb-6">
          <SectionHeader title="Customer Contact" />
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoRow
              icon={Mail}
              label="Email"
              value={
                <a href={`mailto:${customer?.email}`} className="text-primary-600 hover:underline">
                  {customer?.email}
                </a>
              }
            />
            {customer?.phone && (
              <InfoRow
                icon={Phone}
                label="Phone"
                value={
                  <a href={`tel:${customer?.phone}`} className="text-primary-600 hover:underline">
                    {customer?.phone}
                  </a>
                }
              />
            )}
          </div>
        </Section>

        {/* Add-ons */}
        {addons.length > 0 && (
          <Section className="mb-6">
            <SectionHeader title={`Add-ons (${addons.length})`} />
            <div className="p-6 space-y-3">
              {addons.map((addon, index) => (
                <div key={addon.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{addon.name}</p>
                    {addon.description && <p className="text-sm text-gray-500">{addon.description}</p>}
                  </div>
                  <p className="font-medium text-gray-900">£{addon.price}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <p className="font-medium text-gray-900">Add-ons Total</p>
                <p className="font-semibold text-gray-900">
                  £{addons.reduce((sum, addon) => sum + (addon.price || 0), 0)}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* Customer Message */}
        {enquiry.message && (
          <Section className="mb-6">
            <SectionHeader title="Customer Message" />
            <div className="p-6">
              <p className="text-gray-700 italic">"{enquiry.message}"</p>
            </div>
          </Section>
        )}

        {/* Response Section */}
        {hasResponded ? (
          <Section className="mb-6">
            <SectionHeader
              title="Your Response"
              subtitle={`Sent ${new Date(enquiry.supplier_response_date).toLocaleDateString("en-GB")}`}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={enquiry.status === "accepted"
                  ? "bg-green-600 text-white border-0 px-4 py-1.5"
                  : "bg-red-600 text-white border-0 px-4 py-1.5"
                }>
                  {enquiry.status === "accepted" ? "Accepted" : "Declined"}
                </Badge>
                {enquiry.final_price && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Final Price</p>
                    <p className="text-xl font-semibold">£{enquiry.final_price}</p>
                  </div>
                )}
              </div>
              {enquiry.supplier_response && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{enquiry.supplier_response}</p>
                </div>
              )}
            </div>
          </Section>
        ) : (
          <Section>
            <SectionHeader
              title="Respond to Enquiry"
              subtitle={isDepositPaid ? "Urgent: Customer has paid deposit" : "Accept or decline this booking"}
            />
            <div className="p-6">
              {!showResponseForm ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleResponse("accepted")}
                    className="bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleResponse("declined")}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 py-6 rounded-xl"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <Badge className={response === "accepted"
                      ? "bg-green-100 text-green-700 border-0"
                      : "bg-red-100 text-red-700 border-0"
                    }>
                      {response === "accepted" ? "Accepting" : "Declining"}
                    </Badge>
                    <button
                      onClick={() => setShowResponseForm(false)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Change
                    </button>
                  </div>

                  {response === "accepted" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Price (optional)
                      </label>
                      <div className="relative">
                        <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value)}
                          placeholder={enquiry.quoted_price}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to use quoted price of £{enquiry.quoted_price}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Message to Customer
                      </label>
                      {/* Template selector - only show if templates exist and accepting */}
                      {response === "accepted" && messageTemplates.length > 0 && (
                        <div className="relative">
                          <select
                            value={selectedTemplateId || ''}
                            onChange={(e) => handleSelectTemplate(Number(e.target.value))}
                            className="text-sm text-gray-600 bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 pr-8 appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          >
                            <option value="" disabled>Select template</option>
                            {messageTemplates.map(template => (
                              <option key={template.id} value={template.id}>
                                {template.template_name}{template.is_default ? ' (Default)' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                        </div>
                      )}
                    </div>
                    <Textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={6}
                      placeholder={templatesLoading ? "Loading template..." : "Write your message..."}
                      className="resize-none"
                    />
                    {response === "accepted" && messageTemplates.length === 0 && !templatesLoading && (
                      <p className="text-xs text-gray-500 mt-2">
                        <Link href="/suppliers/profile" className="text-primary-600 hover:underline">
                          Create message templates
                        </Link>
                        {' '}to save time on future responses.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={submitResponse}
                      disabled={responding}
                      className={`flex-1 py-3 rounded-xl ${
                        response === "accepted"
                          ? "bg-gray-900 hover:bg-gray-800 text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
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
                      className="py-3 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}
