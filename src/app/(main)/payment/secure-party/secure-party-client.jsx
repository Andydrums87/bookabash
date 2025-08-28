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
  ArrowLeft,
  CreditCard,
  Sparkles,
  Package,
  Clock
} from 'lucide-react'

// Hooks and Backend
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'
import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb'
import { supabase } from '@/lib/supabase'

// Initialize Stripe with proper configuration
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
  locale: 'en-GB',
})

// Import helper functions
import { 
  isLeadTimeSupplier, 
  calculatePaymentAmounts,
  calculateSupplierPrice 
} from '@/utils/supplierPricingHelpers'

function PaymentForm({ 
  partyDetails, 
  confirmedSuppliers, 
  addons, 
  paymentBreakdown,
  onPaymentSuccess,
  onPaymentError,
  isRedirecting,
  setIsRedirecting
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
      console.log('Initializing Payment Request API...')
      
      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
          label: `${partyDetails.childName}'s Party Payment`,
          amount: paymentBreakdown.totalPaymentToday * 100,
        },
        displayItems: [
          ...(paymentBreakdown.hasDeposits ? [{
            label: 'Service Deposits',
            amount: paymentBreakdown.depositAmount * 100,
          }] : []),
          ...(paymentBreakdown.hasFullPayments ? [{
            label: 'Full Payments (Products)',
            amount: paymentBreakdown.fullPaymentAmount * 100,
          }] : []),
          ...paymentBreakdown.paymentDetails.map(supplier => ({
            label: `${supplier.category} - ${supplier.paymentType === 'full_payment' ? 'Full Payment' : 'Deposit'}`,
            amount: supplier.amountToday * 100,
          })),
          ...(addons || []).map(addon => ({
            label: addon.name,
            amount: Math.round((addon.price || 0) * 100),
          }))
        ],
        requestPayerName: true,
        requestPayerEmail: true,
      })

      // Check if Apple Pay / Google Pay is available
      pr.canMakePayment().then(result => {
        console.log('Payment Request API availability check:', result)
        if (result) {
          setPaymentRequest(pr)
          setCanMakePayment(true)
          console.log('Payment Request API available - showing buttons')
        } else {
          console.log('Payment Request API not available on this device/browser')
        }
      }).catch(err => {
        console.log('Error checking payment request availability:', err)
        setCanMakePayment(false)
      })

      // Handle Apple Pay / Google Pay payment
      pr.on('paymentmethod', async (ev) => {
        console.log('Processing Payment Request API payment...')
        setIsProcessing(true)
        setPaymentError(null)
      
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: paymentBreakdown.totalPaymentToday * 100,
              currency: 'gbp',
              partyDetails: {
                ...partyDetails,
                parentName: ev.payerName || partyDetails.parentName,
                email: ev.payerEmail || partyDetails.email
              },
              suppliers: confirmedSuppliers,
              addons,
              paymentType: 'payment_request'
            }),
          })
      
          const { clientSecret, error: backendError } = await response.json()
      
          if (backendError) {
            throw new Error(backendError)
          }
      
          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: ev.paymentMethod.id,
          })
      
          if (error) {
            console.error('Payment Request API error:', error)
            ev.complete('fail')
            throw new Error(error.message)
          }
      
          if (paymentIntent.status === 'succeeded') {
            console.log('Payment Request API payment successful:', paymentIntent.id)
            ev.complete('success')
            
            setIsProcessing(false)
            setIsRedirecting(true)
            
            onPaymentSuccess(paymentIntent)
          } else {
            ev.complete('fail')
            throw new Error('Payment not completed')
          }
      
        } catch (error) {
          console.error('Payment Request API payment error:', error)
          ev.complete('fail')
          setPaymentError(error.message)
          onPaymentError(error)
          setIsProcessing(false)
        }
      })
    }
  }, [stripe, paymentBreakdown, partyDetails, confirmedSuppliers, addons, onPaymentSuccess, onPaymentError])

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
      console.log('Processing card payment...')

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentBreakdown.totalPaymentToday * 100,
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
        console.log('Card payment successful:', paymentIntent.id)
        
        setIsProcessing(false)
        setIsRedirecting(true)
        
        onPaymentSuccess(paymentIntent)
      }

    } catch (error) {
      console.error('Card payment error:', error)
      setPaymentError(error.message)
      onPaymentError(error)
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
      <ContextualBreadcrumb currentPage="payment" />
      
      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && paymentRequest && !isProcessing && !isRedirecting && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Quick & Secure Payment</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <PaymentRequestButtonElement 
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: 'default',
                      theme: 'dark',
                      height: '48px',
                    },
                  },
                }}
                onReady={() => {
                  console.log('Payment Request Button ready')
                }}
                onClick={(event) => {
                  console.log('Payment Request Button clicked')
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

      {/* Card Payment Form */}
      <form onSubmit={handleCardPayment} className="space-y-4">
        {/* Billing Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Your full name"
              value={billingDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={isProcessing || isRedirecting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postcode
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase"
              placeholder="SW1A 1AA"
              value={billingDetails.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value.toUpperCase())}
              maxLength="8"
              required
              disabled={isProcessing || isRedirecting}
            />
          </div>
        </div>

        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-md bg-white">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                    iconColor: '#6b7280',
                  },
                  invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444',
                  },
                },
                hidePostalCode: true,
                iconStyle: 'solid',
                disabled: isProcessing || isRedirecting,
              }}
            />
          </div>
        </div>

        {/* Payment Error */}
        {paymentError && !isRedirecting && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{paymentError}</p>
          </div>
        )}

        {/* Payment Button with Enhanced States */}
        <button 
          type="submit"
          disabled={!stripe || isProcessing || isRedirecting}
          className="cursor-pointer w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRedirecting ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Redirecting to confirmation...</span>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Pay £{paymentBreakdown.totalPaymentToday} Securely</span>
            </div>
          )}
        </button>
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
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    depositAmount: 0,
    fullPaymentAmount: 0,
    totalPaymentToday: 0,
    totalCost: 0,
    remainingBalance: 0,
    hasDeposits: false,
    hasFullPayments: false,
    paymentDetails: []
  })

  // Party plan hook for current data
  const { partyPlan, addons } = usePartyPlan()

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        // Get current user
        const userResult = await partyDatabaseBackend.getCurrentUser();
        if (!userResult.success) {
          router.push('/auth/signin?redirect=/payment');
          return;
        }
        setUser(userResult.user);
  
        // Get party ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const partyIdFromUrl = urlParams.get('party_id');
        
        if (!partyIdFromUrl) {
          console.error('No party ID in URL');
          router.push('/dashboard');
          return;
        }
  
        // Get specific party by ID (works for both draft and planned)
        const partyResult = await partyDatabaseBackend.getPartyById(partyIdFromUrl);
        if (!partyResult.success || !partyResult.party) {
          console.error('Party not found:', partyIdFromUrl);
          router.push('/dashboard');
          return;
        }
  
        // Verify this party belongs to the current user
        if (partyResult.party.user_id !== userResult.user.id) {
          console.error('Party does not belong to current user');
          router.push('/dashboard');
          return;
        }
  
        // Get enquiries for this party to check payment status
        const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyResult.party.id);
        const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : [];
        
        // Create a set of paid categories
        const paidCategories = new Set(
          existingEnquiries
            .filter(enquiry => enquiry.payment_status === 'paid')
            .map(enquiry => enquiry.supplier_category)
        );
        
        console.log('Already paid categories:', Array.from(paidCategories));
  
        // Build supplier list from party plan, excluding already paid ones
        const partyPlan = partyResult.party.party_plan || {};
        const supplierList = Object.entries(partyPlan)
          .filter(([key, supplier]) => 
            supplier && 
            typeof supplier === 'object' && 
            supplier.name &&
            key !== 'addons' &&
            !paidCategories.has(key)
          )
          .map(([key, supplier]) => ({
            id: supplier.id,
            name: supplier.name,
            image: supplier.image || '/placeholder.jpg',
            rating: supplier.rating || 4.5,
            description: supplier.description || 'Professional service provider',
            category: key,
            price: supplier.price || 0,
            packageData: supplier.packageData,
            selectedAddons: supplier.selectedAddons || []
          }));
        
        console.log('Suppliers for payment (unpaid only):', supplierList);
        
        // If no unpaid suppliers, redirect to dashboard with message
        if (supplierList.length === 0) {
          console.log('No unpaid suppliers found - redirecting to dashboard');
          router.push('/dashboard?message=no-pending-payments');
          return;
        }
        
        // Calculate payment breakdown using your helper function
        const breakdown = calculatePaymentAmounts(supplierList, partyResult.party);
        console.log('Payment breakdown:', breakdown);
        
        setConfirmedSuppliers(supplierList);
        setPaymentBreakdown(breakdown);
        setPartyId(partyResult.party.id);
        setPartyDetails({
          id: partyResult.party.id,
          childName: partyResult.party.child_name,
          theme: partyResult.party.theme,
          date: partyResult.party.party_date,
          childAge: partyResult.party.child_age,
          location: partyResult.party.location,
          guestCount: partyResult.party.guest_count,
          email: userResult.user.email,
          parentName: `${userResult.user.first_name} ${userResult.user.last_name}`.trim()
        });
  
      } catch (error) {
        console.error('Error loading payment data:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
  
    loadPaymentData();
  }, [router]);

  // const handlePaymentSuccess = async (paymentIntent) => {
  //   try {
  //     // Step 1: Record payment
  //     const updateResult = await partyDatabaseBackend.updatePartyPaymentStatus(partyId, {
  //       payment_status: paymentBreakdown.remainingBalance > 0 ? 'partial_paid' : 'fully_paid',
  //       payment_intent_id: paymentIntent.id,
  //       deposit_amount: paymentBreakdown.depositAmount,
  //       full_payment_amount: paymentBreakdown.fullPaymentAmount,
  //       total_paid_today: paymentBreakdown.totalPaymentToday,
  //       remaining_balance: paymentBreakdown.remainingBalance,
  //       payment_date: new Date().toISOString()
  //     });
  
  //     const supplierCategoriesToPay = confirmedSuppliers.map(s => s.category);
      
  //     // Step 2: Check if enquiries already exist for the suppliers we're paying for
  //     const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyId);
  //     const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : [];
      
  //     const existingEnquiryCategories = existingEnquiries.map(e => e.supplier_category);
  //     const enquiriesAlreadyExist = supplierCategoriesToPay.every(category => 
  //       existingEnquiryCategories.includes(category)
  //     );
  
  //     if (enquiriesAlreadyExist) {
  //       // Individual supplier payment
  //       console.log('Individual supplier payment - setting auto_accepted and updating payment status');
        
  //       // First, mark as auto-accepted
  //       const autoAcceptResult = await partyDatabaseBackend.autoAcceptEnquiries(partyId, supplierCategoriesToPay);
        
  //       // Then update payment status with enhanced info
  //       const paymentUpdateResult = await partyDatabaseBackend.updateEnquiriesPaymentStatus(
  //         partyId, 
  //         supplierCategoriesToPay,
  //         {
  //           payment_breakdown: paymentBreakdown.paymentDetails,
  //           lead_time_suppliers: supplierCategoriesToPay.filter(cat => 
  //             paymentBreakdown.paymentDetails.find(p => p.category === cat)?.paymentType === 'full_payment'
  //           )
  //         }
  //       );
  //     } else {
  //       // Initial party payment - create enquiries first
  //       console.log('Creating new enquiries for initial party payment');
        
  //       const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
  //         partyId,
  //         "BOOKING CONFIRMED - Customer has completed payment"
  //       );
        
  //       if (enquiryResult.success) {
  //         const autoAcceptResult = await partyDatabaseBackend.autoAcceptEnquiries(partyId);
  //         const paymentUpdateResult = await partyDatabaseBackend.updateEnquiriesPaymentStatus(
  //           partyId, 
  //           supplierCategoriesToPay,
  //           {
  //             payment_breakdown: paymentBreakdown.paymentDetails
  //           }
  //         );
  //       }
  //     }
      
  //     router.push(`/payment/success?payment_intent=${paymentIntent.id}`);
      
  //   } catch (error) {
  //     console.error('Error handling payment success:', error);
  //     setIsRedirecting(false);
  //   }
  // };
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Step 0: Update party status from 'draft' to 'planned'
      await supabase
        .from('parties')
        .update({ status: 'planned' })
        .eq('id', partyId);
  
      // Step 1: Record payment (your existing logic)
      const updateResult = await partyDatabaseBackend.updatePartyPaymentStatus(partyId, {
        payment_status: paymentBreakdown.remainingBalance > 0 ? 'partial_paid' : 'fully_paid',
        payment_intent_id: paymentIntent.id,
        deposit_amount: paymentBreakdown.depositAmount,
        full_payment_amount: paymentBreakdown.fullPaymentAmount,
        total_paid_today: paymentBreakdown.totalPaymentToday,
        remaining_balance: paymentBreakdown.remainingBalance,
        payment_date: new Date().toISOString()
      });
  
      const supplierCategoriesToPay = confirmedSuppliers.map(s => s.category);
      
      // Step 2: Check if enquiries already exist (your existing logic)
      const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyId);
      const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : [];
      
      const existingEnquiryCategories = existingEnquiries.map(e => e.supplier_category);
      const enquiriesAlreadyExist = supplierCategoriesToPay.every(category => 
        existingEnquiryCategories.includes(category)
      );
  
      if (enquiriesAlreadyExist) {
        // Individual supplier payment (your existing logic)
        console.log('Individual supplier payment - setting auto_accepted and updating payment status');
        
        const autoAcceptResult = await partyDatabaseBackend.autoAcceptEnquiries(partyId, supplierCategoriesToPay);
        
        const paymentUpdateResult = await partyDatabaseBackend.updateEnquiriesPaymentStatus(
          partyId, 
          supplierCategoriesToPay,
          {
            payment_breakdown: paymentBreakdown.paymentDetails,
            lead_time_suppliers: supplierCategoriesToPay.filter(cat => 
              paymentBreakdown.paymentDetails.find(p => p.category === cat)?.paymentType === 'full_payment'
            )
          }
        );
      } else {
        // Initial party payment - create enquiries first (your existing logic)
        console.log('Creating new enquiries for initial party payment');
        
        const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
          partyId,
          "BOOKING CONFIRMED - Customer has completed payment"
        );
        
        if (enquiryResult.success) {
          const autoAcceptResult = await partyDatabaseBackend.autoAcceptEnquiries(partyId);
          const paymentUpdateResult = await partyDatabaseBackend.updateEnquiriesPaymentStatus(
            partyId, 
            supplierCategoriesToPay,
            {
              payment_breakdown: paymentBreakdown.paymentDetails
            }
          );
        }
        
        // Step 3: Clear localStorage only after successful enquiry creation
        localStorage.removeItem('party_details');
        localStorage.removeItem('user_party_plan');
      }
      
      router.push(`/payment/success?payment_intent=${paymentIntent.id}`);
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      setIsRedirecting(false);
    }
  };
  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
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
          <Button onClick={() => router.push('/dashboard')} className="bg-gray-900 hover:bg-gray-800 text-white">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContextualBreadcrumb currentPage="payment" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Secure Your Booking</h1>
              <p className="text-gray-600 text-sm mt-1">Complete your payment to guarantee your party date</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Banner */}
            <div className="bg-primary-50 border border-[hsl(var(--primary-200))] rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-800">Your suppliers are ready</h3>
                  <p className="text-sm text-primary-600">Complete payment to secure {partyDetails.childName}'s {partyDetails.theme} party</p>
                </div>
              </div>
            </div>

            {/* Party Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Party Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{partyDetails.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Age {partyDetails.childAge}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{partyDetails.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{partyDetails.guestCount || '10-15'} guests</span>
                </div>
              </div>
            </div>

            {/* Available Services */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
  <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Services</h2>
  <div className="space-y-3">
    {paymentBreakdown.paymentDetails.map((supplier) => (
      <div key={supplier.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
        {/* Mobile Layout: Stack vertically */}
        <div className="sm:hidden">
          {/* Top Row: Image + Name */}
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={supplier.image || "/placeholder.jpg"} 
              alt={supplier.name}
              className="w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate text-sm">{supplier.name}</h3>
              <span className="text-xs text-gray-500 capitalize">{supplier.category}</span>
            </div>
          </div>
          
          {/* Middle Row: Rating + Payment Type */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-gray-600">{supplier.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              {supplier.paymentType === 'full_payment' ? (
                <>
                  <Package className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 font-medium">Full Payment</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-600 font-medium">Deposit</span>
                </>
              )}
            </div>
          </div>
          
          {/* Bottom Row: Price */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-blue-600 font-medium">Ready to book</div>
            <div className="text-right">
              <div className="font-semibold text-gray-900 text-sm">£{supplier.amountToday}</div>
              {supplier.remaining > 0 && (
                <div className="text-xs text-gray-500">£{supplier.remaining} on day</div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout: Side by side (unchanged) */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={supplier.image || "/placeholder.jpg"} 
              alt={supplier.name}
              className="w-12 h-12 rounded-lg object-cover bg-gray-200"
            />
            <div>
              <h3 className="font-medium text-gray-900">{supplier.name}</h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{supplier.rating}</span>
                </div>
                <span>•</span>
                <span className="capitalize">{supplier.category}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  {supplier.paymentType === 'full_payment' ? (
                    <>
                      <Package className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">Full Payment</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-600 font-medium">Deposit</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">£{supplier.amountToday}</div>
            {supplier.remaining > 0 && (
              <div className="text-xs text-gray-500">£{supplier.remaining} on day</div>
            )}
            <div className="text-xs text-blue-600 font-medium">Ready to book</div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h2>
              
              {/* Line items */}
              <div className="space-y-2 mb-4">
                {paymentBreakdown.paymentDetails.map((supplier) => (
                  <div key={supplier.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">
                      {supplier.category} ({supplier.paymentType === 'full_payment' ? 'Full' : 'Deposit'})
                    </span>
                    <span className="text-gray-900">£{supplier.amountToday}</span>
                  </div>
                ))}
                
                {(addons || []).map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{addon.name}</span>
                    <span className="text-gray-900">£{addon.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-3">
                  <span>Total Due Today</span>
                  <span>£{paymentBreakdown.totalPaymentToday}</span>
                </div>
                
                {paymentBreakdown.hasDeposits && (
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Service deposits</span>
                    <span>£{paymentBreakdown.depositAmount}</span>
                  </div>
                )}
                
                {paymentBreakdown.hasFullPayments && (
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Full payments (products)</span>
                    <span>£{paymentBreakdown.fullPaymentAmount}</span>
                  </div>
                )}
                
                {paymentBreakdown.remainingBalance > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Remaining balance (due on party day)</span>
                    <span>£{paymentBreakdown.remainingBalance}</span>
                  </div>
                )}
              </div>

              {/* Payment Type Explanation */}
              {(paymentBreakdown.hasDeposits && paymentBreakdown.hasFullPayments) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">Mixed Payment Types</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Product suppliers (cakes, party bags) require full payment upfront</li>
                        <li>• Service suppliers require deposits, remainder due on party day</li>
                        <li>• All bookings guaranteed once payment is complete</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Protection Notice */}
              {(!paymentBreakdown.hasDeposits || !paymentBreakdown.hasFullPayments) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">Booking Protection</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Full refund if suppliers cancel</li>
                        <li>• 48-hour booking guarantee</li>
                        <li>• Customer support included</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise} options={{
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#374151',
                    colorBackground: '#ffffff',
                    colorText: '#374151',
                    colorDanger: '#ef4444',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '6px',
                  },
                  rules: {
                    '.Input': {
                      padding: '12px',
                      fontSize: '16px',
                    },
                    '.Input:focus': {
                      boxShadow: '0 0 0 2px #3b82f6',
                    },
                  },
                },
              }}>
                <PaymentForm
                  partyDetails={partyDetails}
                  confirmedSuppliers={confirmedSuppliers}
                  addons={addons || []}
                  paymentBreakdown={paymentBreakdown}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  isRedirecting={isRedirecting}
                  setIsRedirecting={setIsRedirecting}
                />
              </Elements>

              {paymentBreakdown.remainingBalance > 0 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Remaining balance of £{paymentBreakdown.remainingBalance} due on party day.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}