"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Star, 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  Lock,
  Gift,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

// Hooks and Backend
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'

// Initialize Stripe with proper configuration
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
  locale: 'en-GB',
})

// Payment Form Component
// Updated PaymentForm component with working Apple/Google Pay
function PaymentForm({ 
  partyDetails, 
  confirmedSuppliers, 
  addons, 
  totalCost, 
  depositAmount,
  onPaymentSuccess,
  onPaymentError 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [billingDetails, setBillingDetails] = useState({
    name: partyDetails.parentName || '',
    postalCode: partyDetails.location || ''
  })

  // Initialize Apple Pay / Google Pay
  useEffect(() => {
    if (stripe) {
      console.log('🔄 Initializing Payment Request API...')
      
      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
          label: `${partyDetails.childName}'s Party Deposit`,
          amount: depositAmount * 100, // Amount in pence
        },
        displayItems: [
          {
            label: 'Party Deposit',
            amount: depositAmount * 100,
          },
          ...(confirmedSuppliers || []).map(supplier => ({
            label: `${supplier.category} Service`,
            amount: Math.round((supplier.price || 0) * 100),
          })),
          ...(addons || []).map(addon => ({
            label: addon.name,
            amount: Math.round((addon.price || 0) * 100),
          }))
        ],
        requestPayerName: true,
        requestPayerEmail: true,
      })

      // ✅ UNCOMMENTED: Check if Apple Pay / Google Pay is available
      pr.canMakePayment().then(result => {
        console.log('🔍 Payment Request API availability check:', result)
        if (result) {
          setPaymentRequest(pr)
          setCanMakePayment(true)
          console.log('✅ Payment Request API available - showing buttons')
        } else {
          console.log('❌ Payment Request API not available on this device/browser')
        }
      }).catch(err => {
        console.log('❌ Error checking payment request availability:', err)
        setCanMakePayment(false)
      })

      // Handle Apple Pay / Google Pay payment
      pr.on('paymentmethod', async (ev) => {
        console.log('💳 Processing Payment Request API payment...')
        setIsProcessing(true)
        setPaymentError(null)

        try {
          // Create payment intent on your backend
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: depositAmount * 100,
              currency: 'gbp',
              partyDetails: {
                ...partyDetails,
                parentName: ev.payerName || partyDetails.parentName,
                email: ev.payerEmail || partyDetails.email
              },
              suppliers: confirmedSuppliers,
              addons,
              paymentType: 'payment_request' // Indicate this is from Apple/Google Pay
            }),
          })

          const { clientSecret, error: backendError } = await response.json()

          if (backendError) {
            throw new Error(backendError)
          }

          // ✅ FIXED: Use confirmPayment instead of confirmCardPayment for Payment Request API
          const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
              payment_method: ev.paymentMethod.id,
              return_url: `${window.location.origin}/payment/success`,
            },
            redirect: 'if_required'
          })

          if (error) {
            console.error('❌ Payment Request API error:', error)
            ev.complete('fail')
            throw new Error(error.message)
          }

          if (paymentIntent.status === 'succeeded') {
            console.log('✅ Payment Request API payment successful:', paymentIntent.id)
            ev.complete('success')
            onPaymentSuccess(paymentIntent)
          } else {
            ev.complete('fail')
            throw new Error('Payment not completed')
          }

        } catch (error) {
          console.error('❌ Payment Request API payment error:', error)
          ev.complete('fail')
          setPaymentError(error.message)
          onPaymentError(error)
        } finally {
          setIsProcessing(false)
        }
      })
    }
  }, [stripe, depositAmount, partyDetails, confirmedSuppliers, addons, onPaymentSuccess, onPaymentError])

  // Handle regular card payment
  const handleCardPayment = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      console.log('💳 Processing card payment...')

      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: depositAmount * 100,
          currency: 'gbp',
          partyDetails,
          suppliers: confirmedSuppliers,
          addons,
          billingDetails,
          paymentType: 'card'
        }),
      })

      const { clientSecret, error: backendError } = await response.json()

      if (backendError) {
        throw new Error(backendError)
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name || partyDetails.parentName || 'Parent',
            email: partyDetails.email,
            address: {
              postal_code: billingDetails.postalCode || partyDetails.location || ''
            }
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Card payment successful:', paymentIntent.id)
        onPaymentSuccess(paymentIntent)
      }

    } catch (error) {
      console.error('❌ Card payment error:', error)
      setPaymentError(error.message)
      onPaymentError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field, value) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* ✅ IMPROVED: Apple Pay / Google Pay Button with better error handling */}
      {canMakePayment && paymentRequest && !isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Quick & Secure Payment</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <PaymentRequestButtonElement 
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: 'default', // or 'buy', 'donate'
                      theme: 'dark',   // or 'light', 'light-outline'
                      height: '48px',
                    },
                  },
                }}
                onReady={() => {
                  console.log('✅ Payment Request Button ready')
                }}
                onClick={(event) => {
                  console.log('👆 Payment Request Button clicked')
                }}
              />
            </div>
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500">Or pay with card</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DEBUG: Show why Apple/Google Pay isn't available */}
      {!canMakePayment && !isProcessing && (
        <div className="text-center text-xs text-gray-500 p-2 bg-gray-50 rounded">
          Apple Pay & Google Pay not available on this device/browser
        </div>
      )}

      {/* Card Payment Form */}
      <form onSubmit={handleCardPayment} className="space-y-4">
        {/* Billing Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your full name"
              value={billingDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
              placeholder="SW1A 1AA"
              value={billingDetails.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value.toUpperCase())}
              maxLength="8"
              required
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Card Element */}
        <div className="p-4 border border-gray-300 rounded-lg bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  iconColor: '#424770',
                },
                invalid: {
                  color: '#9e2146',
                  iconColor: '#9e2146',
                },
              },
              hidePostalCode: true, // We collect it separately above
              iconStyle: 'solid',
              disabled: isProcessing,
            }}
          />
        </div>

        {/* Payment Error */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{paymentError}</p>
          </div>
        )}

        {/* Payment Button */}
        <Button 
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Pay £{depositAmount} Securely</span>
            </div>
          )}
        </Button>
      </form>

      {/* Security notices */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Stripe. Your card details are encrypted and never stored.
        </p>
        {canMakePayment && (
          <p className="text-xs text-gray-500 text-center">
            Apple Pay and Google Pay use your device's secure authentication.
          </p>
        )}
      </div>
    </div>
  )
}

// Main Payment Page Component
export default function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [loading, setLoading] = useState(true)
  const [partyDetails, setPartyDetails] = useState(null)
  const [confirmedSuppliers, setConfirmedSuppliers] = useState([])
  const [user, setUser] = useState(null)
  const [partyId, setPartyId] = useState(null)

  // Party plan hook for current data
  const { partyPlan, totalCost, addons } = usePartyPlan()

  const depositAmount = 50 // Fixed deposit amount
  const remainingBalance = totalCost - depositAmount

  // Stripe Elements options
  const stripeOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#10b981',
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          padding: '12px',
          fontSize: '16px',
        },
        '.Input:focus': {
          boxShadow: '0 0 0 2px #10b981',
        },
      },
    },
  }

  // // Load party and user data
  // useEffect(() => {
  //   const loadPaymentData = async () => {
  //     try {
  //       // Get current user
  //       const userResult = await partyDatabaseBackend.getCurrentUser()
  //       if (!userResult.success) {
  //         router.push('/auth/signin?redirect=/payment')
  //         return
  //       }
  //       setUser(userResult.user)

  //       // Get current party from database
  //       const partyResult = await partyDatabaseBackend.getCurrentParty()
  //       if (!partyResult.success || !partyResult.party) {
  //         // No database party - redirect back to dashboard
  //         router.push('/dashboard')
  //         return
  //       }

  //       setPartyId(partyResult.party.id)
  //       setPartyDetails({
  //         childName: partyResult.party.child_name,
  //         theme: partyResult.party.theme,
  //         date: partyResult.party.party_date,
  //         childAge: partyResult.party.child_age,
  //         location: partyResult.party.location,
  //         guestCount: partyResult.party.guest_count,
  //         email: userResult.user.email,
  //         parentName: `${userResult.user.first_name} ${userResult.user.last_name}`.trim()
  //       })

  //       // Get confirmed suppliers from enquiries
  //       const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyResult.party.id)
  //       if (enquiriesResult.success) {
  //         const confirmed = enquiriesResult.enquiries
  //           .filter(enquiry => enquiry.status === 'accepted')
  //           .map(enquiry => ({
  //             id: enquiry.supplier_id,
  //             category: enquiry.supplier_category,
  //             price: enquiry.quoted_price || 0,
  //             name: `${enquiry.supplier_category} Supplier`,
  //             rating: 4.8,
  //             image: '/placeholder-supplier.jpg'
  //           }))
  //         setConfirmedSuppliers(confirmed)
  //       }

  //     } catch (error) {
  //       console.error('Error loading payment data:', error)
  //       router.push('/dashboard')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   loadPaymentData()
  // }, [router])
  // Load party and user data - UPDATED FOR IMMEDIATE BOOKING FLOW
// Updated loadPaymentData function
useEffect(() => {
  // In PaymentPageContent.jsx - FIXED loadPaymentData
const loadPaymentData = async () => {
  try {
    setLoading(true)
    
    // Get current user
    const userResult = await partyDatabaseBackend.getCurrentUser()
    if (!userResult.success) {
      router.push('/auth/signin?redirect=/payment')
      return
    }
    setUser(userResult.user)

    // Get party ID from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const partyIdFromUrl = urlParams.get('party_id')
    
    if (!partyIdFromUrl) {
      console.error('❌ No party ID provided to payment page')
      router.push('/dashboard')
      return
    }

    // Get specific party by ID
    const partyResult = await partyDatabaseBackend.getPartyById(partyIdFromUrl)
    if (!partyResult.success || !partyResult.party) {
      console.error('❌ Could not load party for payment:', partyIdFromUrl)
      router.push('/dashboard')
      return
    }

    const party = partyResult.party
    setPartyId(party.id)
    setPartyDetails({
      id: party.id,
      childName: party.child_name,
      theme: party.theme,
      date: party.party_date,
      childAge: party.child_age,
      location: party.location,
      guestCount: party.guest_count,
      email: userResult.user.email,
      parentName: `${userResult.user.first_name} ${userResult.user.last_name}`.trim()
    })

    // ✅ FIXED: Get enquiries and check for auto-accepted ones
    const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(party.id)
    
    let confirmedSuppliers = []
    
    if (enquiriesResult.success && enquiriesResult.enquiries.length > 0) {
      console.log('📋 Found enquiries, checking status...', enquiriesResult.enquiries)
      
      // ✅ FIXED: Look for enquiries that need payment (either old flow or new flow)
      confirmedSuppliers = enquiriesResult.enquiries
        .filter(enquiry => {
          console.log(`Enquiry ${enquiry.id}: status=${enquiry.status}, payment_status=${enquiry.payment_status}`)
          
          // Old flow: accepted + unpaid
          if (enquiry.status === 'accepted' && enquiry.payment_status === 'unpaid') {
            return true
          }
          
          // ✅ NEW FLOW: auto-accepted (pending payment)
          // These are enquiries that were just auto-accepted for immediate booking
          if (enquiry.status === 'accepted' && !enquiry.payment_status) {
            return true
          }
          
          return false
        })
        .map(enquiry => ({
          id: enquiry.supplier_id,
          category: enquiry.supplier_category,
          price: enquiry.quoted_price || 0,
          name: `${enquiry.supplier_category} Supplier`,
          rating: 4.8,
          image: '/placeholder-supplier.jpg',
          enquiry_id: enquiry.id
        }))
      
      console.log(`✅ Found ${confirmedSuppliers.length} suppliers ready for payment`)
    } 
    
    // ✅ FALLBACK: If no enquiries found, use party plan (shouldn't happen now)
    if (confirmedSuppliers.length === 0) {
      console.log('⚠️ No payment-ready enquiries found, using party plan as fallback')
      const partyPlan = party.party_plan || {}
      
      confirmedSuppliers = Object.entries(partyPlan)
        .filter(([key, supplier]) => 
          supplier && 
          typeof supplier === 'object' && 
          supplier.name &&
          !['einvites', 'addons'].includes(key)
        )
        .map(([category, supplier]) => ({
          id: supplier.id,
          name: supplier.name,
          image: supplier.image || supplier.imageUrl || '/placeholder-supplier.jpg',
          rating: supplier.rating || 4.8,
          description: supplier.description || 'Professional service provider',
          category: category,
          price: supplier.price || 0,
          status: 'immediate_booking'
        }))
    }
    
    console.log(`✅ Final suppliers for payment: ${confirmedSuppliers.length}`)
    setConfirmedSuppliers(confirmedSuppliers)

  } catch (error) {
    console.error('❌ Error loading payment data:', error)
    router.push('/dashboard')
  } finally {
    setLoading(false)
  }
}
loadPaymentData()
}, [router])

  // const handlePaymentSuccess = async (paymentIntent) => {
  //   try {
  //     console.log('Payment successful:', paymentIntent.id)
      
  //     // UPDATE: Record the payment in your database
  //     const updateResult = await partyDatabaseBackend.updatePartyPaymentStatus(partyId, {
  //       payment_status: 'deposit_paid',
  //       payment_intent_id: paymentIntent.id,
  //       deposit_amount: depositAmount,
  //       payment_date: new Date().toISOString()
  //     })
      
  //     if (!updateResult.success) {
  //       console.error('Failed to update payment status:', updateResult.error)
  //     }
      
  //     // Redirect to success page
  //     router.push(`/payment/success?payment_intent=${paymentIntent.id}`)
      
  //   } catch (error) {
  //     console.error('Error handling payment success:', error)
  //   }
  // }
  // const handlePaymentSuccess = async (paymentIntent) => {
  //   try {
  //     // 1. Record payment (existing code stays)
  //     const updateResult = await partyDatabaseBackend.updatePartyPaymentStatus(partyId, {
  //       payment_status: 'deposit_paid',
  //       payment_intent_id: paymentIntent.id,
  //       deposit_amount: depositAmount,
  //     })
      
  //     // 2. ✅ NEW: Create enquiries AFTER successful payment
  //     const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
  //       partyId,
  //       "Deposit paid - booking confirmed subject to availability",
  //       JSON.stringify({ paymentIntent: paymentIntent.id, bookingType: 'immediate' })
  //     )
      
  //     // 3. ✅ NEW: Mark enquiries as "deposit_paid" immediately
  //     if (enquiryResult.success) {
  //       const supplierCategories = confirmedSuppliers.map(s => s.category)
  //       await partyDatabaseBackend.updateEnquiriesPaymentStatus(partyId, supplierCategories)
  //     }
      
  //     // 4. Redirect to success (existing code)
  //     router.push(`/payment/success?payment_intent=${paymentIntent.id}`)
      
  //   } catch (error) {
  //     console.error('Error handling payment success:', error)
  //   }
  // }

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // 1. Record payment (existing function)
      await partyDatabaseBackend.updatePartyPaymentStatus(partyId, {
        payment_status: 'deposit_paid',
        payment_intent_id: paymentIntent.id,
        deposit_amount: depositAmount,
      })
      
      // 2. Create enquiries after payment (existing function)
      await partyDatabaseBackend.sendEnquiriesToSuppliers(
        partyId,
        "PRIORITY BOOKING - Deposit paid, please confirm availability within 2 hours"
      )
      
      // 3. Skip admin task creation for now
      // await createAdminTask(...) // <-- Skip this
      
      // 4. Redirect to dashboard with success
      router.push(`/dashboard?booking=confirmed&payment_intent=${paymentIntent.id}`)
      
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
    // Handle payment failure (show error, allow retry, etc.)
  }

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!partyDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Party Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your party details.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secure Your Booking</h1>
            <p className="text-gray-600">Complete your payment to guarantee your party date</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Party Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Celebration Header */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 All Suppliers Confirmed!
                </h2>
                <p className="text-gray-600">
                  {partyDetails.childName}'s {partyDetails.theme} party is ready to go
                </p>
              </CardContent>
            </Card>

            {/* Party Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Party Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{partyDetails.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Age {partyDetails.childAge}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{partyDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{partyDetails.guestCount || '10-15'} guests</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmed Suppliers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Confirmed Party Team
                </h3>
                <div className="space-y-4">
                  {confirmedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={supplier.image} 
                        alt={supplier.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span>{supplier.rating}</span>
                            </div>
                            <span>•</span>
                            <span className="capitalize">{supplier.category}</span>
                          </div>
                          <span className="font-semibold text-gray-900">£{supplier.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h3>
                
                {/* Cost breakdown */}
                <div className="space-y-3 mb-4">
                  {confirmedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{supplier.category}</span>
                      <span className="text-gray-900">£{supplier.price}</span>
                    </div>
                  ))}
                  
                  {(addons || []).map((addon) => (
                    <div key={addon.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{addon.name}</span>
                      <span className="text-gray-900">£{addon.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost</span>
                    <span>£{totalCost}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Deposit required today</span>
                    <span>£{depositAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Remaining balance</span>
                    <span>£{remainingBalance}</span>
                  </div>
                </div>

                {/* Security notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Booking Protection</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Full refund if suppliers cancel</li>
                    <li>• 48-hour booking guarantee</li>
                    <li>• Customer support included</li>
                  </ul>
                </div>

                {/* Stripe Payment Form */}
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <PaymentForm
                    partyDetails={partyDetails}
                    confirmedSuppliers={confirmedSuppliers}
                    addons={addons || []}
                    totalCost={totalCost}
                    depositAmount={depositAmount}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </Elements>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Remaining balance due on party day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}