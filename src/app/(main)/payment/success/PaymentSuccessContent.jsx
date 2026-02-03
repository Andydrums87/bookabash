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

  // Upgrade payment params
  const isUpgrade = searchParams.get("type") === "upgrade"
  const upgradeKey = searchParams.get("upgrade_key")
  const upgradeSupplierType = searchParams.get("supplier_type")
  const upgradeSupplierName = searchParams.get("supplier_name")
  const upgradeAmount = searchParams.get("amount")
  const upgradePartyId = searchParams.get("party_id")

  const [upgradeCompleted, setUpgradeCompleted] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  // Handle upgrade completion
  useEffect(() => {
    const completeUpgrade = async () => {
      if (!isUpgrade || !upgradeKey) return

      try {
        // Retrieve pending upgrade data from sessionStorage
        const pendingDataStr = sessionStorage.getItem(upgradeKey)
        if (!pendingDataStr) {
          console.warn('⚠️ No pending upgrade data found for key:', upgradeKey)
          // Still mark as completed if no pending data (might be a refresh)
          setUpgradeCompleted(true)
          return
        }

        const pendingData = JSON.parse(pendingDataStr)
        console.log('📦 Found pending upgrade data:', pendingData)

        // Call API to complete the supplier update
        const response = await fetch('/api/complete-upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partyId: upgradePartyId || pendingData._editContext?.partyId,
            supplierType: upgradeSupplierType || pendingData._editContext?.supplierType,
            updatedData: pendingData,
            paymentIntentId
          })
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ Upgrade completed successfully')
          // Clear the pending data
          sessionStorage.removeItem(upgradeKey)
          setUpgradeCompleted(true)
        } else {
          console.error('❌ Failed to complete upgrade:', result.error)
          setUpgradeError(result.error || 'Failed to complete upgrade')
        }
      } catch (error) {
        console.error('❌ Error completing upgrade:', error)
        setUpgradeError(error.message || 'Failed to complete upgrade')
      }
    }

    completeUpgrade()
  }, [isUpgrade, upgradeKey, upgradePartyId, upgradeSupplierType, paymentIntentId])

  useEffect(() => {
    const loadBookingDetails = async () => {
      // Skip loading booking details for upgrade payments - not needed
      if (isUpgrade) {
        setLoading(false)
        return
      }

      try {
        // ✅ Fetch party details from database using payment intent
        // Retry up to 10 times with 1 second delay to allow webhook to complete
        if (paymentIntentId) {
          const maxRetries = 10
          const retryDelay = 1000 // 1 second

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch party by payment intent...`)

            const response = await fetch(`/api/get-party-by-payment-intent?payment_intent_id=${paymentIntentId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.party) {
                console.log('✅ Party found!', data.party.child_name)
                setBookingDetails({
                  childName: data.party.child_name,
                  theme: data.party.theme,
                  date: data.party.party_date,
                  time: data.party.party_time,
                  location: data.party.location,
                  guestCount: data.party.guest_count,
                  email: data.party.parent_email,
                  childAge: data.party.child_age
                })
                setLoading(false)
                // Mark paid with payment details for timeline
                await markPaid({
                  amount: data.party.total_paid || null,
                  partyId: data.party.id,
                  childName: data.party.child_name,
                  theme: data.party.theme,
                  paymentIntentId: paymentIntentId
                })
                return
              }
            }

            // If not found and we have more retries, wait and try again
            if (attempt < maxRetries) {
              console.log(`⏳ Party not found yet, waiting ${retryDelay}ms before retry...`)
              await new Promise(resolve => setTimeout(resolve, retryDelay))
            }
          }

          console.log('⚠️ Max retries reached, falling back to URL params')
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

        // Mark payment as completed in tracking (fallback with minimal data)
        await markPaid({
          paymentIntentId: paymentIntentId
        })
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
  }, [searchParams, paymentIntentId, isUpgrade])

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

  // Upgrade payment success page - show immediately, don't wait for booking details
  if (isUpgrade) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Success Banner */}
        <div className="bg-green-50 border-b-2 border-green-200 py-3 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-center">
                <span className="text-sm font-semibold text-green-900">
                  Payment successful
                </span>
                <span className="text-sm text-green-800 mx-2 hidden sm:inline">•</span>
                <span className="text-sm text-green-800 block sm:inline mt-1 sm:mt-0">
                  Your booking has been updated
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
                Booking Updated Successfully!
              </h1>
              <p className="text-gray-600 text-lg">
                {upgradeSupplierName ? (
                  <>Your {upgradeSupplierName} booking has been updated.</>
                ) : (
                  <>Your booking changes have been saved.</>
                )}
              </p>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Upgrade payment</span>
                <span className="text-lg font-semibold text-gray-900">
                  £{parseFloat(upgradeAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Processing Status */}
            {!upgradeCompleted && !upgradeError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="text-sm text-blue-800">
                    Updating your booking details...
                  </p>
                </div>
              </div>
            )}

            {upgradeCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Your supplier has been notified of the changes.
                </p>
              </div>
            )}

            {upgradeError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  ⚠️ There was an issue updating your booking: {upgradeError}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Don't worry - your payment was successful. Please contact support if this persists.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  // Clear party data cache to force refresh with updated data
                  sessionStorage.removeItem('party_data_cache')
                  sessionStorage.removeItem('party_plan_cache')
                  router.push('/dashboard?upgrade_complete=true')
                }}
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

  // Loading state for non-upgrade pages
  if (loading || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full"></div>
      </div>
    )
  }

  // Adding supplier success page - Clean consistent design
  if (isAddingSupplier) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-10">
            <p className="text-gray-700 text-lg mb-4">
              Exciting news!
            </p>
            <p className="text-gray-600 leading-relaxed">
              {supplierName || `Your ${supplierCategory}`} is joining the party! A receipt has been sent to <span className="font-medium text-gray-900">{bookingDetails.email}</span>.
            </p>
          </div>

          {/* What happens next */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What happens next?</h2>

            {/* Step 1 */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">1</span>
                <h3 className="text-lg font-semibold text-gray-900">Wait for confirmation</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-10">
                We're confirming your booking with {supplierName || 'the supplier'}. You'll receive a confirmation email within <span className="font-semibold">24 hours</span> once everything is locked in.
              </p>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">2</span>
                <h3 className="text-lg font-semibold text-gray-900">Check your dashboard</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-10">
                Your dashboard has been updated with your new supplier. You can view your complete party lineup and all booking details there.
              </p>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">3</span>
                <h3 className="text-lg font-semibold text-gray-900">We'll keep you updated</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-10">
                You'll receive reminders before your party with supplier contact details and any specific instructions.
              </p>
            </div>
          </div>

          {/* Main CTA */}
          <Button
            onClick={handleReturnToDashboard}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-lg font-medium text-base"
          >
            Go to My Dashboard
          </Button>

          {/* Reference Number */}
          {paymentIntentId && (
            <p className="text-xs text-gray-400 text-center mt-6">
              Payment Reference: {paymentIntentId.slice(-8).toUpperCase()}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Initial booking success page - Clean Sharesy-inspired design
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-xl mx-auto px-6 py-12">

        {/* Header with greeting */}
        <div className="mb-10">
          <p className="text-gray-700 text-lg mb-4">
            Congratulations!
          </p>
          <p className="text-gray-600 leading-relaxed">
            {bookingDetails.childName}'s party is happening! We're so excited to help make this a day to remember. A receipt has been sent to <span className="font-medium text-gray-900">{bookingDetails.email}</span>.
          </p>
        </div>

        {/* What happens next section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What happens next?</h2>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">1</span>
              <h3 className="text-lg font-semibold text-gray-900">Wait for confirmation</h3>
            </div>
            <p className="text-gray-600 leading-relaxed ml-10">
              We're confirming your booking with your suppliers. You'll receive a confirmation email within <span className="font-semibold">24 hours</span> once everything is locked in.
            </p>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">2</span>
              <h3 className="text-lg font-semibold text-gray-900">Invite your guests</h3>
            </div>
            <p className="text-gray-600 leading-relaxed ml-10">
              We've created a guest list and e-invite tools for you. Share your party details with guests via WhatsApp, email, or our digital invites.
            </p>
            <button
              onClick={handleReturnToDashboard}
              className="ml-10 mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm underline underline-offset-2"
            >
              Go to my dashboard
            </button>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">3</span>
              <h3 className="text-lg font-semibold text-gray-900">We'll keep you updated</h3>
            </div>
            <p className="text-gray-600 leading-relaxed ml-10">
              You'll receive reminders from us before your party. We'll also remind your suppliers about your booking and any specific requests you made.
            </p>
          </div>

          {/* Step 4 */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center mr-3">4</span>
              <h3 className="text-lg font-semibold text-gray-900">Save the date</h3>
            </div>
            <p className="text-gray-600 leading-relaxed ml-10">
              Add the party to your calendar so you don't forget! We'll email you 48 hours before with final details and supplier contact information.
            </p>
            <button
              onClick={handleAddToCalendar}
              className="ml-10 mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm underline underline-offset-2"
            >
              Add to calendar
            </button>
          </div>
        </div>

        {/* Booking summary card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Party for</span>
              <span className="font-medium text-gray-900">{bookingDetails.childName} (Age {bookingDetails.childAge})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theme</span>
              <span className="font-medium text-gray-900">{bookingDetails.theme ? `${bookingDetails.theme.charAt(0).toUpperCase()}${bookingDetails.theme.slice(1)}` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">{formatDate(bookingDetails.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">{formatTime(bookingDetails.time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium text-gray-900">{bookingDetails.guestCount} children</span>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <Button
          onClick={handleReturnToDashboard}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-lg font-medium text-base"
        >
          Go to My Dashboard
        </Button>

        {/* Reference Number */}
        {paymentIntentId && (
          <p className="text-xs text-gray-400 text-center mt-6">
            Booking Reference: {paymentIntentId.slice(-8).toUpperCase()}
          </p>
        )}
      </div>
    </div>
  )
}