"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Home,
  Calendar,
  MapPin,
  Users,
  Cake,
  Clock,
  Mail
} from "lucide-react"
import { markPaid } from '@/utils/partyTracking';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const paymentIntentId = searchParams.get("payment_intent")
  const isAddingSupplier = searchParams.get("add_supplier") === "true"
  const supplierName = searchParams.get("supplier_name")
  const supplierCategory = searchParams.get("supplier_category")

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        // ✅ NEW: Fetch party details from database using payment intent
        if (paymentIntentId) {
          const response = await fetch(`/api/get-party-by-payment-intent?payment_intent_id=${paymentIntentId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.party) {
              setBookingDetails({
                childName: data.party.child_name,
                theme: data.party.theme,
                date: data.party.party_date,
                time: data.party.party_time,
                location: data.party.location,
                guestCount: data.party.guest_count,
                email: data.party.email,
                childAge: data.party.child_age
              })
              setLoading(false)
              await markPaid()
              return
            }
          }
        }

        // Fallback to URL params if payment intent lookup fails
        const childName = searchParams.get("child_name") || "Your child"
        const theme = searchParams.get("theme") || "Awesome"
        const date = searchParams.get("date") || new Date().toLocaleDateString('en-GB')
        const time = searchParams.get("time") || "14:00"
        const location = searchParams.get("location") || "Your venue"
        const guestCount = searchParams.get("guests") || "15"
        const email = searchParams.get("email") || "your email"
        const childAge = searchParams.get("age") || "8"

        setBookingDetails({
          childName,
          theme,
          date,
          time,
          location,
          guestCount,
          email,
          childAge
        })
        setLoading(false)

        // Mark payment as completed in tracking
        await markPaid()
      } catch (error) {
        console.error('Error loading booking details:', error)
        // Use fallback data
        setBookingDetails({
          childName: "Your child",
          theme: "Awesome",
          date: new Date().toLocaleDateString('en-GB'),
          time: "14:00",
          location: "Your venue",
          guestCount: "15",
          email: "your email",
          childAge: "8"
        })
        setLoading(false)
      }
    }

    loadBookingDetails()
  }, [searchParams, paymentIntentId])

  const handleAddToCalendar = () => {
    if (!bookingDetails) return

    const eventTitle = `${bookingDetails.childName}'s ${bookingDetails.theme} Party`
    const eventDetails = `Party for ${bookingDetails.childName} (Age ${bookingDetails.childAge})\nTheme: ${bookingDetails.theme}\nLocation: ${bookingDetails.location}\nGuests: ${bookingDetails.guestCount}`
    
    let startDate
    if (bookingDetails.date.includes('-') && bookingDetails.date.split('-')[0].length === 4) {
      const [year, month, day] = bookingDetails.date.split('-')
      const time = bookingDetails.time && bookingDetails.time !== 'undefined' 
        ? bookingDetails.time 
        : '14:00'
      const [hours, minutes] = time.split(':')
      startDate = new Date(year, month - 1, day, parseInt(hours) || 14, parseInt(minutes) || 0)
    } else {
      const [day, month, year] = bookingDetails.date.split('/')
      const time = bookingDetails.time && bookingDetails.time !== 'undefined' 
        ? bookingDetails.time 
        : '14:00'
      const [hours, minutes] = time.split(':')
      startDate = new Date(year, month - 1, day, parseInt(hours) || 14, parseInt(minutes) || 0)
    }
    
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000))

    const formatDateForCalendar = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(bookingDetails.location)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`

    window.open(googleCalendarUrl, '_blank')
  }

  const handleReturnToDashboard = () => {
    // Check if this is adding a supplier (vs initial booking)
    const isAddingSupplier = searchParams.get("add_supplier") === "true"
    const supplierName = searchParams.get("supplier_name")
    const supplierCategory = searchParams.get("supplier_category")

    console.log('🔍 Payment Success - Redirect Check:', {
      isAddingSupplier,
      supplierName,
      supplierCategory,
      allParams: Object.fromEntries(searchParams.entries())
    })

    if (isAddingSupplier) {
      // Redirect with supplier_added parameters
      const params = new URLSearchParams({
        supplier_added: "true",
        ...(supplierName && { supplier_name: supplierName }),
        ...(supplierCategory && { supplier_category: supplierCategory })
      })
      console.log('✅ Redirecting to supplier added:', params.toString())
      router.push(`/dashboard?${params.toString()}`)
    } else {
      // Initial booking - show full welcome card
      console.log('✅ Redirecting to party booked')
      router.push(`/dashboard?payment_success=true&booking_confirmed=true&timestamp=${Date.now()}`)
    }
  }

  const formatTime = (time) => {
    if (!time || time === 'undefined') return '2:00pm'
    
    const [hours, minutes] = time.split(':')
    if (!hours || !minutes) return '2:00pm'
    
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes}${ampm}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'undefined') {
      return new Date().toLocaleDateString('en-GB', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }

    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const date = new Date(dateStr + 'T12:00:00')
      return date.toLocaleDateString('en-GB', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }

    const [day, month, year] = dateStr.split('/')
    if (day && month && year) {
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('en-GB', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }

    return dateStr
  }

  if (loading || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full"></div>
      </div>
    )
  }

  // Different content for adding supplier vs initial booking
  if (isAddingSupplier) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Email Confirmation Banner */}
        <div className="bg-green-50 border-b-2 border-green-200 py-3 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-center">
                <span className="text-sm font-semibold text-green-900">
                  Payment successful
                </span>
                <span className="text-sm text-green-800 mx-2 hidden sm:inline">•</span>
                <span className="text-sm text-green-800 block sm:inline mt-1 sm:mt-0">
                  Confirmation sent to <span className="font-medium">{bookingDetails.email}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">

            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {supplierName ? (
                  <>🎉 Woohoo! {supplierName} is Joining the Party!</>
                ) : (
                  <>🎉 Woohoo! Your {supplierCategory || 'Supplier'} is Joining the Party!</>
                )}
              </h1>
              <p className="text-gray-600 text-lg">
                Your party just got even more amazing! Get ready for an unforgettable celebration! 🎈
              </p>
            </div>

            {/* What's Happening Now */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-3">
                ✨ What's Happening Now?
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Payment confirmation is already in your inbox 📧</li>
                <li>• {supplierName ? <><span className="font-semibold">{supplierName}</span> will</> : <>Your supplier will</>} be in touch within 24 hours to finalize the exciting details! 🎊</li>
                <li>• Check your dashboard to see your complete party lineup 🎪</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleReturnToDashboard}
                className="flex-1 bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white py-3"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>

            {/* Reference Number */}
            {paymentIntentId && (
              <p className="text-xs text-gray-400 text-center mt-6">
                Payment Reference: {paymentIntentId.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Initial booking success page
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Email Confirmation Banner - Fixed at Top like Treatwell */}
      <div className="bg-green-50 border-b-2 border-green-200 py-3 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center space-x-3">
            {/* <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> */}
            <div className="text-center">
              <span className="text-sm font-semibold text-green-900">
                Booking confirmed
              </span>
              <span className="text-sm text-green-800 mx-2 hidden sm:inline">•</span>
              <span className="text-sm text-green-800 block sm:inline mt-1 sm:mt-0">
                Confirmation sent to <span className="font-medium">{bookingDetails.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Success Icon */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div> */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Woohoo! {bookingDetails.childName}'s Party is Booked!
            </h1>
            <p className="text-gray-600 text-lg">
              Get excited! An unforgettable {bookingDetails.theme} celebration is on its way! 🎈
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            
            {/* Header */}
            {/* <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {bookingDetails.childName}'s Epic {bookingDetails.theme} Party! 🎂
              </h2>
              <p className="text-primary-100">
                The ultimate age {bookingDetails.childAge} birthday bash is happening!
              </p>
            </div> */}

            {/* Main Details */}
            <div className="p-6">
              
              {/* Date and Time - Large Display */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {formatTime(bookingDetails.time)}
                  </div>
                  <div className="text-lg text-gray-600">
                    {formatDate(bookingDetails.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Duration</div>
                  <div className="text-xl font-semibold text-gray-900">2 hours</div>
                </div>
              </div>

              {/* Location and Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Location
                    </div>
                    <div className="font-medium text-gray-900">
                      {bookingDetails.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Guests
                    </div>
                    <div className="font-medium text-gray-900">
                      {bookingDetails.guestCount} children
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cake className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Theme
                    </div>
                    <div className="font-medium text-gray-900">
                      {bookingDetails.theme}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Status
                    </div>
                    <div className="font-medium text-green-600">
                      All Set! ✨
                    </div>
                  </div>
                </div>

              </div>

              {/* Add to Calendar Button */}
              <button
                onClick={handleAddToCalendar}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Add to calendar</span>
              </button>

            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">
              ✨ What Happens Next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your amazing suppliers are already preparing for the big day! 🎪</li>
              <li>• Arrive 10 minutes early to set up the perfect party zone</li>
              <li>• Check your inbox for all the fun details and supplier contacts 📧</li>
              <li>• Need changes? Just let us know at least 48 hours ahead</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleReturnToDashboard} 
              className="flex-1 bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white py-3"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.print()}
              className="flex-1 border-gray-300 py-3"
            >
              Print Confirmation
            </Button>
          </div>

          {/* Reference Number */}
          {paymentIntentId && (
            <p className="text-xs text-gray-400 text-center mt-6">
              Booking Reference: {paymentIntentId.slice(-8).toUpperCase()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}