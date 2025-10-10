"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import {
  Calendar,
  Eye,
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
  Building,
} from "lucide-react"
import Link from "next/link"
import { supplierEnquiryBackend } from "@/utils/supplierEnquiryBackend"

// Helper function to calculate party times
function calculatePartyTimes(party) {
  const partyDate = new Date(party.party_date)
  
  // If specific time is provided
  if (party.party_time) {
    const [hours, minutes] = party.party_time.split(':').map(Number)
    partyDate.setHours(hours, minutes, 0, 0)
  } 
  // If time slot is provided (morning/afternoon)
  else if (party.time_slot) {
    if (party.time_slot === 'morning') {
      partyDate.setHours(10, 0, 0, 0) // 10am start
    } else if (party.time_slot === 'afternoon') {
      partyDate.setHours(13, 0, 0, 0) // 1pm start
    }
  } 
  // Default fallback
  else {
    partyDate.setHours(14, 0, 0, 0) // 2pm default
  }

  const startDateTime = partyDate.toISOString()
  
  // Calculate end time based on duration
  const duration = party.duration || 2 // Default 2 hours
  const endDate = new Date(partyDate.getTime() + duration * 60 * 60 * 1000)
  const endDateTime = endDate.toISOString()

  return { startDateTime, endDateTime }
}

// Create calendar events for accepted booking
async function createCalendarEventsForBooking(enquiry, party, customer) {
  console.log("🗓️ Creating calendar events for accepted booking...")

  // Calculate start and end times
  const { startDateTime, endDateTime } = calculatePartyTimes(party)

  // Prepare event data
  const eventData = {
    title: `${party.theme} Party - ${party.child_name}`,
    description: `
🎉 Party Booking Confirmed

Customer: ${customer.first_name} ${customer.last_name}
Email: ${customer.email}
Phone: ${customer.phone || 'Not provided'}

Child: ${party.child_name}, Age ${party.child_age}
Theme: ${party.theme}
Guest Count: ${party.guest_count} children
Location: ${party.location}${party.postcode ? ` (${party.postcode})` : ''}

Service: ${enquiry.supplier_category}
Package: ${enquiry.package_id || 'Custom'}
Price: £${enquiry.final_price || enquiry.quoted_price}

Special Requirements: ${enquiry.special_requests || 'None'}
Customer Message: ${enquiry.message || 'None'}

Booking ID: ${enquiry.id}
    `.trim(),
    location: `${party.location}${party.postcode ? `, ${party.postcode}` : ''}`,
    startTime: startDateTime,
    endTime: endDateTime,
    timeZone: 'Europe/London',
    attendees: [customer.email],
  }

  console.log('📤 About to make POST request to /api/calendar/booking-sync')
  console.log('📦 Payload:', { supplierId: enquiry.supplier_id, enquiryId: enquiry.id })

  // Call calendar sync API
  const response = await fetch('/api/calendar/booking-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supplierId: enquiry.supplier_id,
      enquiryId: enquiry.id,
      eventData: eventData,
    }),
  })

  console.log('📥 Response status:', response.status)
  console.log('📥 Response ok:', response.ok)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Calendar sync failed: ${error.message}`)
  }

  const result = await response.json()
  console.log("✅ Calendar events created:", result)
  
  return result
}

// Add this helper function at the top of your component (after the imports)
const parseAddonDetails = (addonDetailsString) => {
  if (!addonDetailsString) return []
  try {
    const parsed = typeof addonDetailsString === "string" ? JSON.parse(addonDetailsString) : addonDetailsString
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error parsing addon details:", error)
    return []
  }
}

export default function EnquiryDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const enquiryId = params.id

  const [enquiry, setEnquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [error, setError] = useState(null)
  const [placeholderTemplates, setPlaceholderTemplates] = useState({
    accepted: "",
    declined: "",
  })
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesLoaded, setTemplatesLoaded] = useState(false)

  // Response form state
  const [response, setResponse] = useState("") // 'accepted' or 'declined'
  const [finalPrice, setFinalPrice] = useState("")
  const [responseMessage, setResponseMessage] = useState("")
  const [showResponseForm, setShowResponseForm] = useState(false)

  useEffect(() => {
    if (enquiryId) {
      loadEnquiryDetails()
    }
  }, [enquiryId])

  // 2. FIXED: Load templates immediately when enquiry is available
  useEffect(() => {
    const loadPlaceholderTemplates = async () => {
      if (enquiry?.supplier_id && enquiry?.supplier_category && !templatesLoaded) {
        try {
          setTemplatesLoading(true)
          console.log("🔄 Loading templates for:", {
            supplierId: enquiry.supplier_id,
            category: enquiry.supplier_category,
          })

          // FIX: Use correct template types that match your database
          const acceptTemplate = await supplierEnquiryBackend.getSupplierTemplate(
            enquiry.supplier_id,
            enquiry.supplier_category,
            "accepted", // This will be converted to 'acceptance' inside the function
          )
          const declineTemplate = await supplierEnquiryBackend.getSupplierTemplate(
            enquiry.supplier_id,
            enquiry.supplier_category,
            "declined", // This will be converted to 'decline' inside the function
          )

          console.log("📝 Raw templates loaded:", { acceptTemplate, declineTemplate })

          // Process templates with enquiry data
          const processedAccept = processTemplate(acceptTemplate)
          const processedDecline = processTemplate(declineTemplate)

          console.log("✅ Processed templates:", {
            processedAccept,
            processedDecline,
          })

          setPlaceholderTemplates({
            accepted: processedAccept,
            declined: processedDecline,
          })

          setTemplatesLoaded(true)
        } catch (error) {
          console.error("❌ Error loading templates:", error)
          // Set fallback templates
          setPlaceholderTemplates({
            accepted: "Thank you for your enquiry! I'm pleased to confirm I can provide this service for your party.",
            declined: "Thank you for your enquiry. Unfortunately, I'm not available for this date.",
          })
        } finally {
          setTemplatesLoading(false)
        }
      }
    }

    if (enquiry && !templatesLoaded) {
      loadPlaceholderTemplates()
    }
  }, [enquiry, templatesLoaded])

  const loadEnquiryDetails = async () => {
    try {
      setLoading(true)
      setError(null)
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
  // Add this helper function near the top with your other helper functions
  const getCakeCustomizationData = (enquiry) => {
    try {
      // Check if there's customization data stored directly in the enquiry
      if (enquiry.customization_data) {
        const customizationData =
          typeof enquiry.customization_data === "string"
            ? JSON.parse(enquiry.customization_data)
            : enquiry.customization_data

        if (customizationData.type === "cake") {
          return customizationData.details
        }
      }

      // Fallback: Check party plan for cake customization
      const party = enquiry.parties
      if (party?.party_plan?.catering?.packageData?.cakeCustomization) {
        return party.party_plan.catering.packageData.cakeCustomization
      }

      return null
    } catch (error) {
      console.error("Error parsing cake customization data:", error)
      return null
    }
  }
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Date TBD"
      const day = date.getDate()
      const suffix = getDaySuffix(day)
      const month = date.toLocaleDateString("en-GB", { month: "long" })
      const year = date.getFullYear()
      return `${day}${suffix} ${month}, ${year}`
    } catch (error) {
      return "Date TBD"
    }
  }

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) {
      return "th"
    }
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  const formatTimeDisplay = (party) => {
    if (!party) return { main: "Time TBD", detail: null }

    // Check if we have time slot information
    if (party.time_slot && party.duration) {
      const timeSlotDisplays = {
        morning: "Morning Party",
        afternoon: "Afternoon Party",
      }

      const formatDurationForDisplay = (duration) => {
        if (!duration) return ""
        if (duration === Math.floor(duration)) {
          return ` (${duration} hours)`
        } else {
          const hours = Math.floor(duration)
          const minutes = (duration - hours) * 60
          if (minutes === 30) {
            return ` (${hours}½ hours)`
          } else {
            return ` (${hours}h ${minutes}m)`
          }
        }
      }

      const slotDisplay = timeSlotDisplays[party.time_slot] || "Afternoon Party"
      const durationDisplay = formatDurationForDisplay(party.duration)

      return {
        main: slotDisplay + durationDisplay,
        detail: party.time_slot === "morning" ? "10am-1pm window" : "1pm-4pm window",
      }
    }

    // Fallback to legacy time display
    if (party.party_time) {
      try {
        const [hours, minutes] = party.party_time.split(":")
        const timeObj = new Date()
        timeObj.setHours(Number.parseInt(hours), Number.parseInt(minutes))
        const displayTime = timeObj.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })

        // Calculate end time (assume 2 hours if no duration specified)
        const duration = party.duration || 2
        const endTimeObj = new Date(timeObj.getTime() + duration * 60 * 60 * 1000)
        const displayEndTime = endTimeObj.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })

        return {
          main: `${displayTime} - ${displayEndTime}`,
          detail: `${duration} hour party`,
        }
      } catch (error) {
        return { main: party.party_time || "Time TBD", detail: null }
      }
    }

    return { main: "Time TBD", detail: null }
  }

  const parseSpecialRequests = (specialRequests) => {
    if (!specialRequests) return null
    try {
      return JSON.parse(specialRequests)
    } catch {
      return { message: specialRequests }
    }
  }

  // Add this function to your EnquiryDetailsPage component
  // Place it after your existing helper functions

  const processTemplate = (template) => {
    if (!template || !enquiry) return template

    const customer = enquiry.parties?.users
    const party = enquiry.parties

    return template
      .replace(/{customer_name}/g, customer?.first_name || "there")
      .replace(/{child_name}/g, party?.child_name || "your child")
      .replace(/{party_date}/g, formatDate(party?.party_date))
      .replace(/{party_theme}/g, party?.theme || "themed")
      .replace(/{final_price}/g, finalPrice || enquiry.quoted_price)
      .replace(/{guest_count}/g, party?.guest_count || "the children")
  }

  // Also add the getDefaultTemplate function to your component:
  const getDefaultTemplate = async (supplierCategory, responseType) => {
    try {
      const templateType = responseType === "accepted" ? "acceptance" : "decline"

      const { data: template, error } = await supabase
        .from("supplier_message_templates")
        .select("message_template")
        .eq("supplier_category", supplierCategory)
        .eq("template_type", templateType)
        .eq("is_default", true)
        .single()

      if (error || !template) {
        // Fallback messages
        const fallbacks = {
          accepted: "Thank you for your enquiry! I'm pleased to confirm I can provide this service for your party.",
          declined: "Thank you for your enquiry. Unfortunately, I'm not available for this date.",
        }
        return fallbacks[responseType] || fallbacks.accepted
      }

      return template.message_template
    } catch (error) {
      console.error("Error fetching template:", error)
      return "Thank you for your enquiry!"
    }
  }
  const handleResponse = async (responseType) => {
    setResponse(responseType)
    setTemplatesLoading(true)

    try {
      console.log("🎯 handleResponse called with:", responseType)
      console.log("🔍 Enquiry data available:", {
        supplierId: enquiry?.supplier_id,
        category: enquiry?.supplier_category,
        hasParty: !!enquiry?.parties,
        hasCustomer: !!enquiry?.parties?.users,
      })

      // Get template - let the backend handle the type conversion
      const template = await supplierEnquiryBackend.getSupplierTemplate(
        enquiry.supplier_id,
        enquiry.supplier_category,
        responseType, // Pass 'accepted' or 'declined' directly
      )

      console.log("📝 Template received from backend:", template?.substring(0, 100))

      // Process template with current enquiry data
      const processedMessage = processTemplate(template)
      console.log("✅ Final processed message:", processedMessage?.substring(0, 100))

      setResponseMessage(processedMessage)
    } catch (error) {
      console.error("❌ Error in handleResponse:", error)
      // Fallback message
      const fallbackMessage =
        responseType === "accepted"
          ? "Thank you for your enquiry! I'm pleased to confirm I can provide this service for your party."
          : "Thank you for your enquiry. Unfortunately, I'm not available for this date."
      setResponseMessage(fallbackMessage)
    } finally {
      setTemplatesLoading(false)
    }

    setShowResponseForm(true)
  }

  const submitResponse = async () => {
    if (!response) return

    try {
      setResponding(true)

      // Step 1: Update the enquiry status (your existing functionality)
      const enquiryResult = await supplierEnquiryBackend.respondToEnquiry(
        enquiryId,
        response,
        finalPrice ? Number.parseFloat(finalPrice) : null,
        responseMessage,
        enquiry.payment_status === "paid",
      )

      if (!enquiryResult.success) {
        setError(enquiryResult.error)
        return
      }

      // Step 2: Save to supplier response history (NEW)
      const party = enquiry.parties
      const customer = party?.users

      const responseHistoryData = {
        enquiry_id: enquiryId,
        party_id: party?.id,
        supplier_id: enquiry.supplier_id,
        customer_id: customer?.id,
        response_type: response,
        response_message: responseMessage,
        final_price: finalPrice ? Number.parseFloat(finalPrice) : null,
      }

      console.log("Saving response history:", responseHistoryData)

      const historyResult = await supplierEnquiryBackend.saveSupplierResponse(responseHistoryData)

      if (!historyResult.success) {
        console.warn("Failed to save response history:", historyResult.error)
      } else {
        console.log("Response history saved successfully:", historyResult.response_id)
      }
      if (response === "accepted") {
        try {
          await createCalendarEventsForBooking(enquiry, party, customer)
        } catch (calendarError) {
          console.error("Calendar sync failed:", calendarError)
          // Don't fail the entire response if calendar sync fails
        }
      }

      // Step 3: Send customer notification email
      try {
        const emailPayload = {
          customerEmail: customer?.email,
          customerName: customer?.first_name,
          childName: party?.child_name,
          theme: party?.theme,
          partyDate: party?.party_date,
          supplierName: enquiry.supplier?.name || 'Your Supplier', // ← Now using pre-loaded supplier name
          serviceType: enquiry.supplier_category,
          supplierMessage: responseMessage,
          responseType: response,
          finalPrice: finalPrice || enquiry.quoted_price,
          originalPrice: enquiry.quoted_price,
          isPaid: enquiry.payment_status === "paid",
          dashboardLink: `${window.location.origin}/dashboard`,
        }
        

        const emailResponse = await fetch("/api/email/customer-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        })

        if (!emailResponse.ok) {
          console.warn("Failed to send customer notification email:", await emailResponse.text())
        } else {
          console.log("Customer notification email sent successfully")
        }
      } catch (emailError) {
        console.warn("Error sending customer email:", emailError)
        // Continue with the rest of the function even if email fails
      }

      // Step 4: Reload enquiry to show updated status (existing functionality)
      await loadEnquiryDetails()
      setShowResponseForm(false)

      // Step 5: Show appropriate success message (existing functionality)
      if (enquiry.payment_status === "paid" && response === "declined") {
        alert(
          "PartySnap has been notified immediately. They will find a replacement supplier and handle all customer communication. Thank you for your honesty!",
        )
      } else if (enquiry.payment_status === "paid" && response === "accepted") {
        alert("Perfect! The customer's party is confirmed. You'll receive final details closer to the date.")
      } else {
        alert(
          `Enquiry ${response} successfully! The customer will be notified and can view your response in their profile.`,
        )
      }
    } catch (err) {
      console.error("Error in submitResponse:", err)
      setError(err.message)
    } finally {
      setResponding(false)
    }
  }

  // In your supplier enquiry list page - UPDATE getStatusColor function
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      deposit_paid: "bg-red-100 text-red-800 border-red-200", // ✅ NEW: Urgent red for deposit paid
      viewed: "bg-blue-100 text-blue-800 border-blue-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      declined: "bg-red-100 text-red-800 border-red-200",
      expired: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || colors.pending
  }

  // UPDATE getStatusIcon function
  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      deposit_paid: <span className="w-4 h-4 text-red-600 font-bold">🚨</span>, // ✅ NEW: Urgent icon
      viewed: <Eye className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      declined: <XCircle className="w-4 h-4" />,
      expired: <Clock className="w-4 h-4" />,
    }
    return icons[status] || icons.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-[hsl(var(--primary-100))] max-w-sm w-full">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 sm:mb-6 text-primary-500" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading enquiry details</h3>
          <p className="text-sm sm:text-base text-gray-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-red-200 max-w-sm w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm sm:text-base text-red-600 mb-4 sm:mb-6">{error}</p>
          <Button
            onClick={() => router.push("/suppliers/enquiries")}
            className="bg-primary-600 hover:bg-[hsl(var(--primary-700))] text-white w-full"
          >
            Back to Enquiries
          </Button>
        </div>
      </div>
    )
  }

  if (!enquiry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-[hsl(var(--primary-100))] max-w-sm w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Enquiry not found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            The enquiry you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/suppliers/enquiries")}
            className="bg-primary-600 hover:bg-[hsl(var(--primary-700))] text-white w-full"
          >
            Back to Enquiries
          </Button>
        </div>
      </div>
    )
  }

  // ✅ SAFE VARIABLE DECLARATIONS - Only after we know enquiry exists
  const party = enquiry.parties

  const customer = party?.users
  const specialReqs = parseSpecialRequests(enquiry.special_requests)

  console.log(enquiry)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-[hsl(var(--primary-200))] text-primary-700 hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-300))] bg-transparent w-fit"
            >
              <Link href="/suppliers/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Enquiries
              </Link>
            </Button>

            {/* <div className="flex items-center gap-2 sm:gap-4">
              {enquiry?.auto_accepted && enquiry?.status === "accepted" ? (
                <Badge className="bg-red-100 text-red-800 border-red-200 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium">
                  <span className="text-red-600 font-bold mr-1">🚨</span>
                  DEPOSIT PAID - URGENT
                </Badge>
              ) : (
                <Badge
                  className={`${getStatusColor(enquiry.status)} px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium`}
                >
                  <span className="capitalize">{enquiry.status}</span>
                </Badge>
              )}

              {enquiry?.auto_accepted && enquiry?.status === "accepted" && (
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div> */}
          </div>
{/* 
          {enquiry?.auto_accepted && enquiry?.status === "accepted" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-1 sm:mb-2 text-sm sm:text-base">
                    🚨 PRIORITY BOOKING - DEPOSIT PAID
                  </h4>
                  <p className="text-red-800 text-xs sm:text-sm">
                    Customer paid £{Math.round(enquiry.quoted_price * 0.2)} deposit. Confirm availability within 2 hours
                    or PartySnap will find replacement.
                  </p>
                </div>
              </div>
            </div>
          )} */}

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-[hsl(var(--primary-100))] p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                  {party?.child_name}'s {party?.theme} Party
                </h1>
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-gray-600">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {customer?.first_name} {customer?.last_name}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                      Received{" "}
                      {new Date(enquiry.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600 mb-1">
                  £{enquiry.quoted_price}
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Total quoted price</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <Card className="">
            <CardHeader className="py-6 sm:py-8 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Party Details
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Complete information about the requested party
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Date</label>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">{formatDate(party?.party_date)}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Time</label>
                    {(() => {
                      const timeDisplay = formatTimeDisplay(party)
                      return (
                        <>
                          <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">{timeDisplay.main}</p>
                          {timeDisplay.detail && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">{timeDisplay.detail}</p>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Customer Address
                    </label>
                    <p className="flex items-start gap-2 text-base sm:text-lg font-semibold text-gray-900 mt-1">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="min-w-0">
                        {party?.location}
                        {party?.postcode && (
                          <span className="text-gray-500 font-normal block sm:inline sm:ml-1">({party.postcode})</span>
                        )}
                      </span>
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Theme
                    </label>
                    <p className="text-lg sm:text-xl font-bold text-primary-600 capitalize mt-1">{party?.theme}</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Child Details
                    </label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
                      {party?.child_name}, {party?.child_age} years old
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Number of Children
                    </label>
                    <p className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mt-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      {party?.guest_count} children expected
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Selected Package
                    </label>
                    <p className="flex items-center gap-2 text-base sm:text-lg font-semibold text-primary-600 mt-1">
                      <Package className="w-4 h-4 text-primary-500" />
                      <span className="break-words">
                        {enquiry.package_id
                          ? enquiry.package_id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                          : "Package TBD"}
                      </span>
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Proposed Venue
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Subject to change</p>
                    {party?.party_plan?.venue ? (
                      <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                            {party.party_plan.venue.name}
                          </p>
                          {party.party_plan.venue.originalSupplier?.location && (
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {party.party_plan.venue.originalSupplier.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                        <Building className="w-4 h-4 text-gray-500" />
                        Venue TBD
                      </p>
                    )}
                  </div>

                  {party?.time_preference && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Time Flexibility
                      </label>
                      <p className="text-xs sm:text-sm text-gray-700 mt-1">
                        {party.time_preference.type === "flexible"
                          ? `Flexible within ${party.time_preference.slot} window`
                          : "Specific time required"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {party?.time_slot && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Time Slot Information</h4>
                      <p className="text-blue-800 text-xs sm:text-sm">
                        Customer requested a <strong>{party.time_slot} party</strong>
                        {party.duration && ` lasting ${party.duration} hours`}.
                        {party.time_slot === "morning" && " They prefer the 10am-1pm window."}
                        {party.time_slot === "afternoon" && " They prefer the 1pm-4pm window."}
                      </p>
                      {party.time_preference?.type === "flexible" && (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 Customer is flexible with exact timing within this window
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(() => {
            const cakeData = getCakeCustomizationData(enquiry)
            const isCateringEnquiry = enquiry.supplier_category === "catering"

            return (
              cakeData &&
              isCateringEnquiry && (
                <Card className="border-2 border-pink-200">
                  <CardHeader className="py-6 sm:py-8 bg-gradient-to-r from-pink-50 to-pink-100">
                    <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-lg sm:text-xl">🎂</span>
                      </div>
                      Cake Customization Details
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Special cake customization requested by the customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-pink-50 rounded-lg sm:rounded-xl border border-pink-200">
                          <label className="text-xs sm:text-sm font-medium text-pink-600 uppercase tracking-wide">
                            Selected Package
                          </label>
                          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 break-words">
                            {enquiry.package_id
                              ? enquiry.package_id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                              : "Custom Package"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">Cake specialist service</p>
                        </div>

                        <div className="p-3 sm:p-4 bg-pink-50 rounded-lg sm:rounded-xl border border-pink-200">
                          <label className="text-xs sm:text-sm font-medium text-pink-600 uppercase tracking-wide">
                            Cake Flavor
                          </label>
                          <p className="text-lg sm:text-xl font-bold text-pink-700 mt-1 break-words">
                            {cakeData.flavorName || cakeData.flavor || "Custom Flavor"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">Customer's selected flavor</p>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-pink-50 rounded-lg sm:rounded-xl border border-pink-200">
                          <label className="text-xs sm:text-sm font-medium text-pink-600 uppercase tracking-wide">
                            Child Details
                          </label>
                          <p className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
                            {cakeData.childName || party?.child_name}, {cakeData.childAge || party?.child_age} years old
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">For cake personalization</p>
                        </div>

                        <div className="p-3 sm:p-4 bg-pink-50 rounded-lg sm:rounded-xl border border-pink-200">
                          <label className="text-xs sm:text-sm font-medium text-pink-600 uppercase tracking-wide">
                            Cake Message
                          </label>
                          <div className="mt-2 p-2 sm:p-3 bg-white rounded-lg border border-pink-200">
                            <p className="text-base sm:text-lg font-semibold text-gray-900 italic break-words">
                              "{cakeData.message || "Happy Birthday!"}"
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">Message to write on the cake</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg sm:rounded-xl border border-pink-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs sm:text-sm">🎂</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-pink-900 mb-2 text-sm sm:text-base">
                            Cake Specialist Order Summary
                          </h4>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-pink-800 break-words">
                              <strong>Flavor:</strong> {cakeData.flavorName || cakeData.flavor}
                            </p>
                            <p className="text-pink-800 break-words">
                              <strong>Message:</strong> "{cakeData.message}"
                            </p>
                            <p className="text-pink-800">
                              <strong>For:</strong> {cakeData.childName}, Age {cakeData.childAge}
                            </p>
                            {cakeData.customizationType && (
                              <p className="text-pink-800">
                                <strong>Service Type:</strong> {cakeData.customizationType.replace("_", " ")}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 p-2 bg-white rounded border border-pink-200">
                            <p className="text-xs text-pink-700 font-medium">
                              💡 This order includes professional cake decoration and custom message writing
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border-2 border-pink-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <PoundSterling className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                        Cake Order Pricing
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm sm:text-base break-words flex-1 mr-2">
                            Base Package ({enquiry.package_id || "Custom"})
                          </span>
                          <span className="font-semibold text-sm sm:text-base">£{enquiry.quoted_price}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                          <span className="break-words flex-1 mr-2">
                            Includes: {cakeData.flavorName} flavor + custom message
                          </span>
                          <span>Included</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                            <span className="text-pink-700">Total Quoted:</span>
                            <span className="text-pink-700">£{enquiry.quoted_price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )
          })()}

          <Card className="">
            <CardHeader className="py-6 sm:py-8 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Customer Contact
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Contact information for the party organizer
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                  <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Name</label>
                  <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 break-words">
                    {customer?.first_name} {customer?.last_name}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                  <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Email</label>
                  <a
                    href={`mailto:${customer?.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-1 transition-colors text-sm sm:text-base break-all"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{customer?.email}</span>
                  </a>
                </div>

                {customer?.phone && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <label className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Phone
                    </label>
                    <a
                      href={`tel:${customer?.phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-1 transition-colors text-sm sm:text-base"
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {customer?.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons Section */}
          {(() => {
            const addons = parseAddonDetails(enquiry.addon_details)
            return (
              addons.length > 0 && (
                <Card className="">
                  <CardHeader className="py-8 bg-gradient-to-r from-amber-50 to-amber-100">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      Requested Add-ons ({addons.length})
                    </CardTitle>
                    <CardDescription className="text-base">
                      Additional services requested by the customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {addons.map((addon, index) => (
                        <div
                          key={addon.id || index}
                          className="p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{addon.name}</h4>
                            <span className="text-xl font-bold text-amber-600">£{addon.price}</span>
                          </div>
                          {addon.description && <p className="text-gray-700 mb-3">{addon.description}</p>}
                          <div className="flex flex-wrap gap-2">
                            {addon.category && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">{addon.category}</Badge>
                            )}
                            {addon.packageId && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                For: {addon.packageId} package
                              </Badge>
                            )}
                            {addon.popular && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">Popular choice</Badge>
                            )}
                            {addon.limitedTime && (
                              <Badge className="bg-red-100 text-red-700 border-red-200">Limited time</Badge>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Total add-ons cost */}
                      <div className="border-t pt-4 mt-6">
                        <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl">
                          <span className="text-lg font-semibold text-amber-900">Total Add-ons Cost:</span>
                          <span className="text-2xl font-bold text-amber-600">
                            £{addons.reduce((sum, addon) => sum + (addon.price || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )
          })()}

          {/* Customer Message */}
          {enquiry.message && (
            <Card className="">
              <CardHeader className="py-8 bg-gradient-to-r from-indigo-50 to-indigo-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  Customer Message
                </CardTitle>
                <CardDescription className="text-base">Special message from the customer</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-indigo-500">
                  <blockquote className="text-lg text-gray-900 italic">"{enquiry.message}"</blockquote>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Requirements */}
          {specialReqs && (
            <Card className="">
              <CardHeader className="py-8 bg-gradient-to-r from-rose-50 to-rose-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Special Requirements
                </CardTitle>
                <CardDescription className="text-base">Dietary and accessibility requirements</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {specialReqs.dietary && Object.values(specialReqs.dietary).some(Boolean) && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-white">🥗</span>
                        </div>
                        Dietary Requirements
                      </h4>
                      <ul className="space-y-2">
                        {Object.entries(specialReqs.dietary).map(
                          ([key, value]) =>
                            value && (
                              <li key={key} className="flex items-center gap-2 text-gray-700">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  )}

                  {specialReqs.accessibility && Object.values(specialReqs.accessibility).some(Boolean) && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-white">♿</span>
                        </div>
                        Accessibility Requirements
                      </h4>
                      <ul className="space-y-2">
                        {Object.entries(specialReqs.accessibility).map(
                          ([key, value]) =>
                            value && (
                              <li key={key} className="flex items-center gap-2 text-gray-700">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  )}

                  {specialReqs.numberOfChildren && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        Expected Attendance
                      </h4>
                      <p className="text-lg font-semibold text-gray-700">{specialReqs.numberOfChildren} children</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {(enquiry.status === "accepted" && !enquiry.auto_accepted) || enquiry.status === "declined" ? (
            <Card className="">
              <CardHeader
                className={`py-6 sm:py-8 ${enquiry.status === "accepted" ? "bg-gradient-to-r from-emerald-50 to-emerald-100" : "bg-gradient-to-r from-red-50 to-red-100"}`}
              >
                <CardTitle
                  className={`flex items-center gap-3 text-lg sm:text-xl ${enquiry.status === "accepted" ? "text-emerald-800" : "text-red-800"}`}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${enquiry.status === "accepted" ? "bg-emerald-500" : "bg-red-500"}`}
                  >
                    {enquiry.status === "accepted" ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  Your Response
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your response has been sent to the customer
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Badge
                      className={`text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 font-bold w-fit ${enquiry.status === "accepted" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
                    >
                      {enquiry.status === "accepted" ? "ACCEPTED" : "DECLINED"}
                    </Badge>
                    {enquiry.final_price && (
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-600">Final Price</p>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">£{enquiry.final_price}</span>
                      </div>
                    )}
                  </div>

                  {enquiry.supplier_response && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                        Your message to the customer:
                      </h4>
                      <p className="text-gray-800 text-sm sm:text-base break-words">{enquiry.supplier_response}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Responded on{" "}
                    {new Date(enquiry.supplier_response_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="">
              <CardHeader className="py-6 sm:py-8 bg-gradient-to-r from-primary-50 to-primary-100">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  {enquiry?.auto_accepted ? "Confirm Deposit-Paid Booking" : "Respond to Enquiry"}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {enquiry?.auto_accepted
                    ? "⚠️ URGENT: Customer has paid deposit. Confirm availability or request replacement within 2 hours."
                    : "Accept or decline this party booking request"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {!showResponseForm ? (
                  <div className="space-y-4 sm:space-y-6">
                 

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Button
                        onClick={() => handleResponse("accepted")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl h-auto"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        {enquiry?.auto_accepted ? "✅ I Can Do This Booking" : "Accept Enquiry"}
                      </Button>

                      <Button
                        onClick={() => handleResponse("declined")}
                        variant="outline"
                        className="border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl h-auto"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        {enquiry?.auto_accepted ? "❌ I'm Unavailable" : "Decline Enquiry"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {response === "accepted" ? "Accept" : "Decline"} Enquiry
                      </h3>
                      <Badge
                        className={`text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 font-semibold w-fit ${response === "accepted" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}`}
                      >
                        {response === "accepted" ? "Accepting" : "Declining"}
                      </Badge>
                    </div>

                    {response === "accepted" && (
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
                          Final Price (Optional)
                        </label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type="number"
                            value={finalPrice}
                            onChange={(e) => setFinalPrice(e.target.value)}
                            placeholder="Enter final price"
                            className="pl-10 h-10 sm:h-12"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Leave blank to keep the original quote of £{enquiry.quoted_price}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
                        Message to Customer
                      </label>
                      <Textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder={
                          templatesLoading
                            ? "Loading template..."
                            : response === "accepted"
                              ? placeholderTemplates.accepted || "Thank you for your enquiry! I'd be delighted to..."
                              : placeholderTemplates.declined ||
                                "Thank you for your enquiry. Unfortunately, I'm not available..."
                        }
                        rows={4}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={submitResponse}
                        disabled={responding}
                        className={`flex-1 py-3 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl h-auto ${
                          response === "accepted"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                      >
                        {responding ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Response...
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
                        className="py-3 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl h-auto"
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
