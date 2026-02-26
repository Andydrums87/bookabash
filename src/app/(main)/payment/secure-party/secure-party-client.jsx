"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

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
  Lock
} from 'lucide-react'

import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'
import { trackPaymentPageStarted } from '@/utils/partyTracking'
import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb'
import { BookingTermsAcceptance } from '@/components/booking-terms-modal'
import { supabase } from '@/lib/supabase'
import { getAvailableCredit, applyReferralCredit, getPendingReferralDiscount } from '@/utils/referralUtils'

import {
  calculateFinalPrice,
  isLeadBasedSupplier,
  getPriceBreakdownText
} from '@/utils/unifiedPricing'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
  locale: 'en-GB',
})


// ========================================
// DATE FORMATTING HELPER
// ========================================
const formatDateWithOrdinal = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${getOrdinal(day)} ${month} ${year}`;
};

// ========================================
// SKELETON LOADER COMPONENT
// ========================================
function PaymentPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row animate-pulse">
      {/* Left panel skeleton */}
      <div className="lg:w-1/2 bg-[#f6f9fc] lg:min-h-screen order-1 lg:order-1">
        <div className="max-w-md ml-auto px-6 lg:px-12 py-8 lg:py-16">
          <div className="mb-8">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>

          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-gray-100 rounded"></div>
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="lg:w-1/2 bg-white lg:min-h-screen order-2 lg:order-2">
        <div className="max-w-md mr-auto px-6 lg:px-12 py-8 lg:py-16">
          <div className="space-y-4">
            <div className="h-12 w-full bg-gray-100 rounded"></div>
            <div className="h-12 w-full bg-gray-100 rounded"></div>
            <div className="h-12 w-full bg-gray-100 rounded"></div>
          </div>
          <div className="h-12 w-full bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    </div>
  )
}


// ========================================
// HELPER FUNCTIONS
// ========================================
const isLeadBasedSupplierEnhanced = (supplier) => {
  if (!supplier) return false
  
  const category = supplier.category?.toLowerCase() || ''
  const type = supplier.type?.toLowerCase() || ''
  
  const leadBasedCategories = [
    'party bags', 'party bag', 'partybags',
    'cakes', 'cake', 
    'decorations', 'decoration',
    'balloons', 'balloon',
    'photography'
  ]
  
  return leadBasedCategories.some(leadCategory => 
    category.includes(leadCategory) || type.includes(leadCategory)
  )
}

// REMOVED - Use unified pricing for ALL suppliers including party bags
// This ensures single source of truth for pricing calculations

const calculatePaymentBreakdown = (suppliers, partyDetails, addons = []) => {
  const paymentDetails = []

  const pricingPartyDetails = {
    date: partyDetails.party_date,
    duration: partyDetails.party_duration || partyDetails.duration || 2,
    guestCount: partyDetails.guest_count || 15,
    startTime: partyDetails.start_time
  }

  suppliers.forEach(supplier => {
    const isPartyBags = supplier.category?.toLowerCase().includes('party bag')

    // ✅ CRITICAL FIX: For party bags, use stored totalPrice from metadata
    let totalPrice

    if (isPartyBags && (supplier.partyBagsMetadata?.totalPrice || supplier.packageData?.partyBagsMetadata?.totalPrice)) {
      // Use the stored total price that was calculated with custom quantity
      totalPrice = supplier.partyBagsMetadata?.totalPrice || supplier.packageData?.partyBagsMetadata?.totalPrice
      console.log('🎒 PARTY BAGS: Using stored totalPrice from metadata:', totalPrice)
    } else if (isPartyBags && supplier.packageData?.totalPrice) {
      // Fallback to packageData totalPrice
      totalPrice = supplier.packageData.totalPrice
      console.log('🎒 PARTY BAGS: Using packageData totalPrice:', totalPrice)
    } else {
      // Use unified pricing for all other suppliers
      const pricing = calculateFinalPrice(supplier, pricingPartyDetails, [])
      totalPrice = pricing.finalPrice
    }

    // Debug logging for party bags
    if (isPartyBags) {
      console.log('🎒 PARTY BAGS PRICING DEBUG:', {
        supplierName: supplier.name,
        totalPrice,
        partyBagsMetadata: supplier.partyBagsMetadata,
        packageData: supplier.packageData,
        originalPrice: supplier.originalPrice,
        price: supplier.price
      })
    }

    // ✅ SIMPLIFIED: Everything is full payment now
    paymentDetails.push({
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      image: supplier.image,
      rating: supplier.rating || 4.5,
      totalAmount: totalPrice,
      amountToday: totalPrice, // Full payment
      remaining: 0, // No remaining balance
      paymentType: 'full_payment',
      breakdown: getPriceBreakdownText(supplier, pricingPartyDetails, [])
    })
  })

  // ✅ Add add-ons to payment details
  addons.forEach(addon => {
    paymentDetails.push({
      id: addon.id,
      name: addon.name,
      category: 'Add-on',
      image: addon.image || '/placeholder.jpg',
      rating: addon.rating || 4.5,
      totalAmount: addon.price || 0,
      amountToday: addon.price || 0,
      remaining: 0,
      paymentType: 'full_payment',
      breakdown: `Add-on: ${addon.name}`
    })
  })

  const totalPaymentToday = paymentDetails.reduce((sum, detail) => sum + detail.amountToday, 0)

  return {
    totalPaymentToday,
    totalCost: totalPaymentToday, // Same as totalPaymentToday since no deposits
    remainingBalance: 0, // No remaining balance
    paymentDetails,
    addons // Include addons in the return for reference
  }
}

// ========================================
// PAYMENT FORM COMPONENT
// ========================================
function PaymentForm({
  partyDetails,
  confirmedSuppliers,
  addons,
  paymentBreakdown,
  onPaymentSuccess,
  onPaymentError,
  isRedirecting,
  setIsRedirecting,
  clientSecret,
  creditApplied = 0
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [bookingTermsAccepted, setBookingTermsAccepted] = useState(false)

  // ✅ Auto-accept terms if already accepted in review-book page
  useEffect(() => {
    const autoAcceptTerms = async () => {
      if (partyDetails && partyDetails.termsAccepted && !bookingTermsAccepted) {
        setBookingTermsAccepted(true)

        // Log acceptance to database if not already logged
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Check if already logged
            const { data: existing } = await supabase
              .from('terms_acceptances')
              .select('id')
              .eq('user_id', user.id)
              .eq('booking_id', partyDetails.id)
              .maybeSingle()

            if (!existing) {
              await supabase
                .from('terms_acceptances')
                .insert({
                  user_id: user.id,
                  user_email: user.email,
                  booking_id: partyDetails.id,
                  terms_version: "1.0",
                  privacy_version: "1.0",
                  ip_address: await getUserIP(),
                  user_agent: navigator.userAgent,
                  accepted_at: partyDetails.termsAcceptedAt || new Date().toISOString(),
                  acceptance_context: 'booking'
                })
            }
          }
        } catch (error) {
          console.warn('Failed to log terms acceptance:', error)
        }
      }
    }

    autoAcceptTerms()
  }, [partyDetails, bookingTermsAccepted])

  // Helper to log terms acceptance (fire-and-forget, doesn't block payment)
  const logTermsAcceptance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const ip = await getUserIP()
        await supabase
          .from('terms_acceptances')
          .insert({
            user_id: user.id,
            user_email: user.email,
            booking_id: partyDetails.id,
            terms_version: "1.0",
            privacy_version: "1.0",
            ip_address: ip,
            user_agent: navigator.userAgent,
            accepted_at: new Date().toISOString(),
            acceptance_context: 'booking'
          })
      }
    } catch (error) {
      console.warn('Failed to log terms acceptance:', error)
    }
  }

  const handlePayment = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!bookingTermsAccepted) {
      setPaymentError('Please accept the booking terms to continue')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    // ✅ CRITICAL: Log terms acceptance in background (fire-and-forget)
    // This MUST NOT block the payment flow - Apple Pay requires immediate user gesture
    logTermsAcceptance()

    // Build return_url with add_supplier parameters from current URL
    const currentParams = new URLSearchParams(window.location.search)
    const addSupplier = currentParams.get('add_supplier')
    const supplierName = currentParams.get('supplier_name')
    const supplierCategory = currentParams.get('supplier_category')

    const returnParams = new URLSearchParams({
      party_id: partyDetails.id,
      ...(addSupplier && { add_supplier: addSupplier }),
      ...(supplierName && { supplier_name: supplierName }),
      ...(supplierCategory && { supplier_category: supplierCategory })
    })

    try {
      // ✅ CRITICAL: confirmPayment must be called immediately after user gesture
      // No async operations before this call (Apple Pay requirement)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?${returnParams.toString()}`,
          payment_method_data: {
            billing_details: {
              name: partyDetails.parentName,
              email: partyDetails.email,
              address: {
                postal_code: partyDetails.location,
                country: 'GB'
              }
            }
          }
        },
        redirect: 'if_required'
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsProcessing(false)
        setIsRedirecting(true)
        onPaymentSuccess(paymentIntent)
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        window.location.href = `${window.location.origin}/payment/success?payment_intent=${paymentIntent.id}`
      }

    } catch (error) {
      setPaymentError(error.message)
      onPaymentError(error)
      setIsProcessing(false)
    }
  }

  const getUserIP = async () => {
    try {
      const response = await fetch('/api/get-ip')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  const isFormDisabled = isProcessing || isRedirecting

  return (
    <div className="space-y-5">
      {clientSecret && (
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: false
            },
            paymentMethodOrder: ['apple_pay', 'google_pay', 'card', 'klarna'],
            wallets: {
              applePay: 'auto',
              googlePay: 'auto'
            },
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                address: {
                  country: 'never',
                  postalCode: 'auto'
                }
              }
            },
            terms: {
              card: 'never',
              klarna: 'auto'
            }
          }}
        />
      )}

      {paymentError && !isRedirecting && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{paymentError}</p>
        </div>
      )}

      {!clientSecret && (
        <div className="py-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Loading payment options...</p>
          </div>
        </div>
      )}

      {partyDetails?.termsAccepted ? (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            Terms & conditions accepted
          </p>
        </div>
      ) : (
        <BookingTermsAcceptance
          termsAccepted={bookingTermsAccepted}
          setTermsAccepted={setBookingTermsAccepted}
          partyDetails={partyDetails}
          required={true}
        />
      )}

      {/* Trust reassurance checklist */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-green-800">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>Personally confirmed with suppliers</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-800">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>100% money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-800">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>Add extras anytime before the party</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={!stripe || isFormDisabled || !bookingTermsAccepted || !clientSecret}
        className="cursor-pointer w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-lg font-semibold text-[15px] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        {isRedirecting ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Redirecting...</span>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <span>Pay £{(paymentBreakdown.totalPaymentToday - creditApplied).toFixed(2)} & Secure My Party</span>
          )}
      </button>

      {/* Human contact */}
      <p className="text-xs text-gray-500 text-center">
        Questions? Email us at <a href="mailto:hello@partysnap.co.uk" className="text-primary-600 hover:underline">hello@partysnap.co.uk</a> — we're here to help.
      </p>
    </div>
  )
}

// ========================================
// CREDIT ONLY BOOKING COMPONENT
// ========================================
function CreditOnlyBooking({ partyDetails, creditApplied, onSuccess, isRedirecting, setIsRedirecting }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingTermsAccepted, setBookingTermsAccepted] = useState(false)

  // Auto-accept terms if already accepted
  useEffect(() => {
    if (partyDetails?.termsAccepted && !bookingTermsAccepted) {
      setBookingTermsAccepted(true)
    }
  }, [partyDetails, bookingTermsAccepted])

  const handleCreditBooking = async () => {
    if (!bookingTermsAccepted) return

    setIsProcessing(true)
    try {
      // Simulate payment intent for credit-only booking
      const creditPaymentIntent = {
        id: `credit_${Date.now()}`,
        status: 'succeeded',
        amount: 0,
        creditUsed: creditApplied
      }
      setIsRedirecting(true)
      onSuccess(creditPaymentIntent)
    } catch (error) {
      console.error('Credit booking error:', error)
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-green-800">Free booking with referral credit!</h3>
            <p className="text-sm text-green-600">Your £{creditApplied.toFixed(2)} referral credit covers this entire booking.</p>
          </div>
        </div>
      </div>

      {!partyDetails?.termsAccepted && (
        <BookingTermsAcceptance
          onAcceptChange={setBookingTermsAccepted}
          accepted={bookingTermsAccepted}
          partyDetails={partyDetails}
          required={true}
        />
      )}

      <button
        onClick={handleCreditBooking}
        disabled={!bookingTermsAccepted || isProcessing || isRedirecting}
        className="cursor-pointer w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRedirecting ? (
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Redirecting to confirmation...</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Confirm Free Booking</span>
          </div>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        No payment required. Your referral credit will be applied automatically.
      </p>
    </div>
  )
}

// ========================================
// MAIN PAGE COMPONENT
// ========================================
export default function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [loading, setLoading] = useState(true)
  const [partyDetails, setPartyDetails] = useState(null)
  const [confirmedSuppliers, setConfirmedSuppliers] = useState([])
  const [user, setUser] = useState(null)
  const [partyId, setPartyId] = useState(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)
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
  const [referralCredit, setReferralCredit] = useState(0)
  const [creditApplied, setCreditApplied] = useState(0)

  const { partyPlan, addons } = usePartyPlan()

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const userResult = await partyDatabaseBackend.getCurrentUser()
        if (!userResult.success) {
          router.push('/auth/signin?redirect=/payment')
          return
        }
        setUser(userResult.user)
  
        const urlParams = new URLSearchParams(window.location.search)
        const partyIdFromUrl = urlParams.get('party_id')
        
        if (!partyIdFromUrl) {
          router.push('/dashboard')
          return
        }

        const partyResult = await partyDatabaseBackend.getPartyById(partyIdFromUrl)
        if (!partyResult.success || !partyResult.party) {
          router.push('/dashboard')
          return
        }
  
        if (partyResult.party.user_id !== userResult.user.id) {
          router.push('/dashboard')
          return
        }

        const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyResult.party.id)
        const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : []

        console.log('🔍 ALL ENQUIRIES:', existingEnquiries.map(e => ({
          category: e.supplier_category,
          status: e.status,
          payment_status: e.payment_status
        })))

        const paidCategories = new Set(
          existingEnquiries
            .filter(enquiry => ['paid', 'fully_paid', 'partial_paid'].includes(enquiry.payment_status))
            .map(enquiry => enquiry.supplier_category)
        )

        console.log('💰 PAID CATEGORIES:', Array.from(paidCategories))

        const partyPlan = partyResult.party.party_plan || {}

        console.log('📋 PARTY PLAN KEYS:', Object.keys(partyPlan))
        console.log('📋 PARTY PLAN SUPPLIERS:', Object.entries(partyPlan)
          .filter(([key]) => key !== 'addons' && key !== 'einvites')
          .map(([key, supplier]) => ({
            category: key,
            name: supplier?.name,
            hasSupplier: !!supplier
          }))
        )

        // ✅ Extract add-ons from party_plan
        const addonsList = partyPlan.addons || []
        console.log('📦 Add-ons from party_plan:', addonsList)

        // Check if we're adding a specific supplier (post-booking)
        const isAddingSpecificSupplier = urlParams.get('add_supplier') === 'true'
        const specificSupplierCategory = urlParams.get('supplier_category')

        console.log('🎯 Add supplier mode:', { isAddingSpecificSupplier, specificSupplierCategory })

        const supplierList = Object.entries(partyPlan)
          .filter(([key, supplier]) => {
            // ✅ FIX: Exclude einvites and addons from payment
            if (key === 'addons' || key === 'einvites') {
              console.log(`⏭️ Skipping ${key} - not a payable supplier`)
              return false
            }

            // Exclude already paid suppliers
            if (paidCategories.has(key)) {
              console.log(`⏭️ Skipping ${key} - already paid`)
              return false
            }

            // ✅ NEW: If adding a specific supplier, ONLY include that category
            if (isAddingSpecificSupplier && specificSupplierCategory) {
              if (key !== specificSupplierCategory) {
                console.log(`⏭️ Skipping ${key} - not the supplier being added (${specificSupplierCategory})`)
                return false
              }
            }

            // Only include valid supplier objects with names
            return supplier &&
              typeof supplier === 'object' &&
              supplier.name
          })
          .map(([key, supplier]) => {
            // ✅ CRITICAL FIX: For party bags, use totalPrice from metadata
            const isPartyBags = key === 'partyBags' || supplier.category?.toLowerCase().includes('party bag')
            let supplierPrice = supplier.price || 0

            if (isPartyBags) {
              // Use stored totalPrice for party bags
              supplierPrice = supplier.partyBagsMetadata?.totalPrice ||
                             supplier.packageData?.partyBagsMetadata?.totalPrice ||
                             supplier.packageData?.totalPrice ||
                             supplier.totalPrice ||
                             supplier.price || 0

              console.log('🎒 PAYMENT PAGE: Setting party bags price:', {
                name: supplier.name,
                finalPrice: supplierPrice,
                metadata: supplier.partyBagsMetadata,
                packageData: supplier.packageData
              })
            }

            return {
              id: supplier.id,
              name: supplier.name,
              image: supplier.image || '/placeholder.jpg',
              rating: supplier.rating || 4.5,
              description: supplier.description || 'Professional service provider',
              category: key,
              price: supplierPrice,
              // ✅ CRITICAL: For party bags, use total price as originalPrice too
              originalPrice: isPartyBags ? supplierPrice : supplier.originalPrice,
              priceFrom: supplier.priceFrom,
              packageData: supplier.packageData,
              partyBagsMetadata: supplier.partyBagsMetadata,
              selectedAddons: supplier.selectedAddons || []
            }
          })

        console.log('✅ Suppliers loaded for payment:', supplierList.map(s => ({
          category: s.category,
          name: s.name,
          price: s.price
        })))

        if (supplierList.length === 0) {
          console.log('❌ NO UNPAID SUPPLIERS FOUND - REDIRECTING TO DASHBOARD')
          console.log('🔍 Debug Info:')
          console.log('  - Party Plan had categories:', Object.keys(partyPlan))
          console.log('  - Paid categories:', Array.from(paidCategories))
          console.log('  - Enquiries:', existingEnquiries.length)
          router.push('/dashboard?message=no-pending-payments')
          return
        }
        
        const breakdown = calculatePaymentBreakdown(supplierList, partyResult.party, addonsList)

        setConfirmedSuppliers(supplierList)
        setPaymentBreakdown(breakdown)
        setPartyId(partyResult.party.id)

        // Determine the display location - venue address takes priority over user's home
        const venue = partyPlan.venue
        let displayLocation = null

        if (venue) {
          // Check various venue address formats
          const venueAddress = venue.venueAddress || venue.serviceDetails?.venueAddress || venue.data?.venueAddress
          if (venueAddress) {
            // Build full address from venue
            const parts = [
              venueAddress.line1 || venueAddress.addressLine1,
              venueAddress.line2 || venueAddress.addressLine2,
              venueAddress.city,
              venueAddress.postcode
            ].filter(Boolean)
            displayLocation = parts.length > 0 ? parts.join(', ') : venue.name || venue.location
          } else {
            displayLocation = venue.name || venue.location || null
          }
        }

        // Fallback to user's home address if no venue
        if (!displayLocation) {
          const userAddressParts = [
            userResult.user.address_line_1,
            userResult.user.address_line_2,
            userResult.user.city,
            userResult.user.postcode || partyResult.party.location
          ].filter(Boolean)
          displayLocation = userAddressParts.length > 0 ? userAddressParts.join(', ') : partyResult.party.location
        }

        setPartyDetails({
          id: partyResult.party.id,
          childName: partyResult.party.child_name,
          theme: partyResult.party.theme,
          date: partyResult.party.party_date,
          childAge: partyResult.party.child_age,
          location: displayLocation,
          guestCount: partyResult.party.guest_count,
          email: userResult.user.email,
          parentName: `${userResult.user.first_name} ${userResult.user.last_name}`.trim(),
          termsAccepted: partyResult.party.terms_accepted || false,
          termsAcceptedAt: partyResult.party.terms_accepted_at || null,
          hasVenue: !!venue
        })

        // Fetch available referral credit for user
        // IMPORTANT: Use auth_user_id since referral system uses auth.users IDs
        let availableCredit = 0
        const authUserId = userResult.user.auth_user_id
        try {
          // First check for existing credits
          availableCredit = await getAvailableCredit(authUserId)

          // Also check for pending referral (first-order discount)
          if (availableCredit === 0) {
            const pendingReferralDiscount = await getPendingReferralDiscount(authUserId)
            if (pendingReferralDiscount > 0) {
              availableCredit = pendingReferralDiscount
              console.log('🎁 First-order referral discount:', pendingReferralDiscount)
            }
          }

          setReferralCredit(availableCredit)
          console.log('💰 Available referral credit:', availableCredit)
        } catch (creditError) {
          console.warn('Could not fetch referral credit:', creditError)
        }

        // Calculate how much credit to apply (can't exceed total)
        const creditToApply = Math.min(availableCredit, breakdown.totalPaymentToday)
        setCreditApplied(creditToApply)

        // Calculate final payment amount after credit
        const finalPaymentAmount = breakdown.totalPaymentToday - creditToApply
        const paymentAmount = Math.round(finalPaymentAmount * 100)

        // Only enable Klarna for orders £600+ (60000 pence) due to high fees
        const KLARNA_MINIMUM_AMOUNT = 60000 // £600 in pence
        const shouldEnableKlarna = paymentAmount >= KLARNA_MINIMUM_AMOUNT

        if (paymentAmount > 0) {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: paymentAmount,
              currency: 'gbp',
              partyDetails: partyResult.party,
              suppliers: supplierList,
              addons: partyResult.party.party_plan?.addons || [],
              paymentType: 'unified',
              enableKlarna: shouldEnableKlarna,
              referralCreditApplied: creditToApply
            }),
          })

          const { clientSecret: secret, error: backendError } = await response.json()

          if (backendError) {
            console.error('❌ Payment intent creation failed:', backendError)
          } else if (secret) {
            setClientSecret(secret)
          }
        } else if (creditToApply > 0 && finalPaymentAmount === 0) {
          // Credit covers entire payment - no Stripe needed
          console.log('🎉 Referral credit covers entire payment!')
          setClientSecret('credit_only')
        }
  
        // Track that user reached the payment page (Step 2 of checkout)
        trackPaymentPageStarted()

      } catch (error) {
        console.error('Error loading payment data:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadPaymentData()
  }, [router])

  // ✅ WEBHOOK-BASED PAYMENT SUCCESS HANDLER
  // This function now just redirects to a processing page
  // The webhook will handle all database updates and emails
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      console.log('✅ Payment confirmed by Stripe:', paymentIntent.id)
      console.log('🔄 Redirecting to processing page - webhook will complete the booking')

      // Apply referral credit if any was used
      // Note: referral system uses auth.users IDs, so we need user.auth_user_id
      if (creditApplied > 0 && user) {
        try {
          const authUserId = user.auth_user_id || user.id
          await applyReferralCredit(authUserId, partyId, creditApplied)
          console.log('🎉 Referral credit applied:', creditApplied)
        } catch (creditError) {
          console.warn('Failed to apply referral credit:', creditError)
        }
      }

      // Clear timers and localStorage
      localStorage.removeItem(`booking_timer_${partyId}`)
      localStorage.removeItem('party_details')
      localStorage.removeItem('user_party_plan')

      // Check if this is adding a supplier (preserve these params)
      const currentParams = new URLSearchParams(window.location.search)
      const addSupplier = currentParams.get('add_supplier')
      const supplierName = currentParams.get('supplier_name')
      const supplierCategory = currentParams.get('supplier_category')

      // Build success page URL with all necessary params
      const successParams = new URLSearchParams({
        payment_intent: paymentIntent.id,
        ...(addSupplier && { add_supplier: addSupplier }),
        ...(supplierName && { supplier_name: supplierName }),
        ...(supplierCategory && { supplier_category: supplierCategory })
      })

      // Redirect directly to success page
      router.push(`/payment/success?${successParams.toString()}`)

    } catch (error) {
      console.error('Error in payment success handler:', error)
      // Even if redirect fails, payment is captured - webhook will process it
      setIsRedirecting(false)
      alert('Payment captured successfully. Please wait while we finalize your booking.')
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
  }

  // SHOW SKELETON WHILE LOADING
  if (loading) {
    return <PaymentPageSkeleton />
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
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Order summary panel - shows first on mobile, left side on desktop */}
      <div className="lg:w-1/2 bg-[#f6f9fc] lg:min-h-screen">
        <div className="max-w-md ml-auto px-6 lg:px-12 py-8 lg:py-16">

          {/* Party header */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Pay PartySnap</p>
            <p className="text-4xl font-bold text-gray-900">
              £{(paymentBreakdown.totalPaymentToday - creditApplied).toFixed(2)}
            </p>
          </div>

          {/* Order items */}
          <div className="space-y-4 mb-6">
            {paymentBreakdown.paymentDetails.map((supplier) => (
              <div key={supplier.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{supplier.category}</p>
                  <p className="text-xs text-gray-500">For {partyDetails.childName}'s party</p>
                </div>
                <p className="text-sm text-gray-900">£{supplier.amountToday}</p>
              </div>
            ))}
          </div>

          {/* Subtotal & Total */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">£{paymentBreakdown.totalPaymentToday}</span>
            </div>

            {creditApplied > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Referral Credit</span>
                <span className="text-green-600">-£{creditApplied.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total due</span>
              <span className="text-gray-900">£{(paymentBreakdown.totalPaymentToday - creditApplied).toFixed(2)}</span>
            </div>
          </div>

          {/* Party details - compact */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Party Details</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span>{formatDateWithOrdinal(partyDetails.date)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span>{partyDetails.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span>{partyDetails.guestCount || '10-15'} guests · Age {partyDetails.childAge}</span>
              </div>
            </div>
          </div>

          {/* Booking protection - minimal */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              <span>Secure booking · Customer support included</span>
            </div>
          </div>

          {/* Powered by footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-semibold">stripe</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Payment form (white background) */}
      <div className="flex-1 lg:w-1/2 bg-white lg:min-h-screen">
        <div className="max-w-md mx-auto lg:mr-auto lg:ml-0 px-6 lg:px-12 py-8 lg:py-16">

          {creditApplied > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800">
                  <span className="font-medium">£{creditApplied.toFixed(2)} referral credit applied</span>
                </p>
              </div>
            </div>
          )}

          {clientSecret === 'credit_only' ? (
            <CreditOnlyBooking
              partyDetails={partyDetails}
              creditApplied={creditApplied}
              onSuccess={handlePaymentSuccess}
              isRedirecting={isRedirecting}
              setIsRedirecting={setIsRedirecting}
            />
          ) : clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0f172a',
                    colorBackground: '#ffffff',
                    colorText: '#1e293b',
                    colorDanger: '#dc2626',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '6px',
                    fontSizeBase: '14px',
                  },
                  rules: {
                    '.Input': {
                      border: '1px solid #e2e8f0',
                      boxShadow: 'none',
                      padding: '12px',
                    },
                    '.Input:focus': {
                      border: '1px solid #0f172a',
                      boxShadow: '0 0 0 1px #0f172a',
                    },
                    '.Label': {
                      fontWeight: '500',
                      fontSize: '14px',
                      color: '#1e293b',
                      marginBottom: '8px',
                    },
                    '.Tab': {
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                    },
                    '.Tab--selected': {
                      border: '1px solid #0f172a',
                      backgroundColor: '#ffffff',
                    },
                  },
                },
              }}
            >
              <PaymentForm
                partyDetails={partyDetails}
                confirmedSuppliers={confirmedSuppliers}
                addons={addons || []}
                paymentBreakdown={paymentBreakdown}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isRedirecting={isRedirecting}
                setIsRedirecting={setIsRedirecting}
                clientSecret={clientSecret}
                creditApplied={creditApplied}
              />
            </Elements>
          ) : (
            <div className="py-16">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// "use client"


// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// import { loadStripe } from '@stripe/stripe-js'
// import {
//   Elements,
//   CardElement,
//   PaymentRequestButtonElement,
//   useStripe,
//   useElements
// } from '@stripe/react-stripe-js'

// // UI Components
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { 
//   CheckCircle, 
//   Star, 
//   Calendar, 
//   MapPin, 
//   Users, 
//   Shield, 
//   Lock,
//   ArrowLeft,
//   CreditCard,
//   Sparkles,
//   Package,
//   Clock
// } from 'lucide-react'

// // Hooks and Backend
// import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
// import { usePartyPlan } from '@/utils/partyPlanBackend'
// import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb'
// import { BookingTermsAcceptance } from '@/components/booking-terms-modal'
// import { supabase } from '@/lib/supabase'

// // ONLY use unified pricing system
// import { 
//   calculateFinalPrice,
//   isLeadBasedSupplier,
//   getPriceBreakdownText 
// } from '@/utils/unifiedPricing'

// // Initialize Stripe with proper configuration
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
//   locale: 'en-GB',
// })

// // Enhanced isLeadBasedSupplier for payment page
// const isLeadBasedSupplierEnhanced = (supplier) => {
//   if (!supplier) return false;
  
//   const category = supplier.category?.toLowerCase() || '';
//   const type = supplier.type?.toLowerCase() || '';
  
//   // Enhanced lead-based supplier categories - handle both formats
//   const leadBasedCategories = [
//     'party bags',
//     'party bag', 
//     'partybags',  // camelCase version
//     'cakes',
//     'cake', 
//     'decorations',
//     'decoration',
//     'balloons',
//     'balloon',
//     'photography'
//   ];
  
//   return leadBasedCategories.some(leadCategory => 
//     category.includes(leadCategory) || type.includes(leadCategory)
//   );
// }

// // Enhanced calculateFinalPrice for party bags
// const calculateFinalPriceEnhanced = (supplier, partyDetails, addons = []) => {
//   if (!supplier) {
//     return {
//       finalPrice: 0,
//       breakdown: { base: 0, weekend: 0, extraHours: 0, addons: 0 },
//       details: { isWeekend: false, extraHours: 0, hasAddons: false, isLeadBased: false }
//     }
//   }

//   // Check if this is party bags using enhanced detection
//   const isPartyBags = supplier.category === 'partyBags' || 
//                      supplier.category === 'Party Bags' || 
//                      supplier.category?.toLowerCase().includes('party bag');

//   let basePrice = 0;

//   if (isPartyBags) {
//     // Special handling for party bags - multiply by guest count
//     const guestCount = partyDetails.guestCount || 15;
//     const pricePerBag = supplier.originalPrice || supplier.price || 5;
    
//     // If price seems to be total already, use it directly
//     if (supplier.price && supplier.price > (pricePerBag * 2)) {
//       basePrice = supplier.price;
//     } else {
//       basePrice = pricePerBag * guestCount;
//     }
    
//     console.log('🎒 PARTY BAGS CALCULATION:', {
//       pricePerBag,
//       guestCount,
//       totalCalculated: basePrice,
//       supplierPrice: supplier.price,
//       originalPrice: supplier.originalPrice
//     });
//   } else {
//     // Use unified pricing for non-party bags
//     const pricing = calculateFinalPrice(supplier, partyDetails, addons);
//     return pricing;
//   }

//   // Return party bags result in same format
//   return {
//     finalPrice: basePrice,
//     basePrice,
//     breakdown: {
//       base: basePrice,
//       weekend: 0,
//       extraHours: 0,
//       addons: 0
//     },
//     details: {
//       isWeekend: false,
//       extraHours: 0,
//       hasAddons: false,
//       isLeadBased: true,
//       guestCount: partyDetails.guestCount || 15
//     }
//   }
// }

// // Unified pricing payment calculation
// const calculatePaymentBreakdown = (suppliers, partyDetails) => {
//   let depositAmount = 0;
//   let fullPaymentAmount = 0;
//   const paymentDetails = [];

//   // Create party details object for pricing calculations
//   const pricingPartyDetails = {
//     date: partyDetails.party_date,
//     duration: partyDetails.duration || 2,
//     guestCount: partyDetails.guest_count || 15,
//     startTime: partyDetails.start_time
//   };

//   console.log('🔍 PAYMENT DEBUG: Party details for pricing:', pricingPartyDetails);

//   suppliers.forEach(supplier => {
//     console.log('🔍 PAYMENT DEBUG: Processing supplier:', {
//       name: supplier.name,
//       category: supplier.category,
//       price: supplier.price,
//       originalPrice: supplier.originalPrice
//     });

//     // Use enhanced pricing system
//     const pricing = calculateFinalPriceEnhanced(supplier, pricingPartyDetails, []);
//     const isLeadBased = isLeadBasedSupplierEnhanced(supplier);
//     const totalPrice = pricing.finalPrice;
    
//     console.log('🔍 PAYMENT DEBUG: Enhanced pricing result:', {
//       name: supplier.name,
//       isLeadBased,
//       totalPrice,
//       breakdown: pricing.breakdown
//     });
    
//     let paymentType;
//     let amountToday;
//     let remaining;
    
//     if (isLeadBased) {
//       // Lead-based suppliers require full payment upfront
//       paymentType = 'full_payment';
//       amountToday = totalPrice;
//       remaining = 0;
//       fullPaymentAmount += totalPrice;
//     } else {
//       // Service suppliers require 30% deposit
//       paymentType = 'deposit';
//       amountToday = Math.round(totalPrice * 0.3);
//       remaining = totalPrice - amountToday;
//       depositAmount += amountToday;
//     }
    
//     paymentDetails.push({
//       id: supplier.id,
//       name: supplier.name,
//       category: supplier.category,
//       image: supplier.image,
//       rating: supplier.rating || 4.5,
//       totalAmount: totalPrice,
//       amountToday,
//       remaining,
//       paymentType,
//       isLeadBased,
//       breakdown: getPriceBreakdownText(supplier, pricingPartyDetails, [])
//     });
//   });

//   const totalPaymentToday = depositAmount + fullPaymentAmount;
//   const totalCost = paymentDetails.reduce((sum, detail) => sum + detail.totalAmount, 0);
//   const remainingBalance = totalCost - totalPaymentToday;

//   console.log('🔍 PAYMENT DEBUG: Final breakdown:', {
//     depositAmount,
//     fullPaymentAmount,
//     totalPaymentToday,
//     totalCost,
//     remainingBalance
//   });

//   return {
//     depositAmount,
//     fullPaymentAmount,
//     totalPaymentToday,
//     totalCost,
//     remainingBalance,
//     hasDeposits: depositAmount > 0,
//     hasFullPayments: fullPaymentAmount > 0,
//     paymentDetails
//   };
// };

// function PaymentForm({ 
//   partyDetails, 
//   confirmedSuppliers, 
//   addons, 
//   paymentBreakdown,
//   onPaymentSuccess,
//   onPaymentError,
//   isRedirecting,
//   setIsRedirecting
// }) {
//   const stripe = useStripe()
//   const elements = useElements()
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [paymentError, setPaymentError] = useState(null)
//   const [paymentRequest, setPaymentRequest] = useState(null)
//   const [canMakePayment, setCanMakePayment] = useState(false)
//   const [bookingTermsAccepted, setBookingTermsAccepted] = useState(false)
//   const [billingDetails, setBillingDetails] = useState({
//     name: partyDetails.parentName || '',
//     postalCode: partyDetails.location || ''
//   })

//   // Initialize Apple Pay / Google Pay
//   useEffect(() => {
//     if (stripe) {
//       console.log('Initializing Payment Request API...')
      
//       const pr = stripe.paymentRequest({
//         country: 'GB',
//         currency: 'gbp',
//         total: {
//           label: `${partyDetails.childName}'s Party Payment`,
//           amount: paymentBreakdown.totalPaymentToday * 100,
//         },
//         displayItems: [
//           ...(paymentBreakdown.hasDeposits ? [{
//             label: 'Service Deposits',
//             amount: paymentBreakdown.depositAmount * 100,
//           }] : []),
//           ...(paymentBreakdown.hasFullPayments ? [{
//             label: 'Full Payments (Products)',
//             amount: paymentBreakdown.fullPaymentAmount * 100,
//           }] : []),
//           ...paymentBreakdown.paymentDetails.map(supplier => ({
//             label: `${supplier.category} - ${supplier.paymentType === 'full_payment' ? 'Full Payment' : 'Deposit'}`,
//             amount: supplier.amountToday * 100,
//           })),
//           ...(addons || []).map(addon => ({
//             label: addon.name,
//             amount: Math.round((addon.price || 0) * 100),
//           }))
//         ],
//         requestPayerName: true,
//         requestPayerEmail: true,
//       })

//       // Check if Apple Pay / Google Pay is available
//       pr.canMakePayment().then(result => {
//         console.log('Payment Request API availability check:', result)
//         if (result) {
//           setPaymentRequest(pr)
//           setCanMakePayment(true)
//           console.log('Payment Request API available - showing buttons')
//         } else {
//           console.log('Payment Request API not available on this device/browser')
//         }
//       }).catch(err => {
//         console.log('Error checking payment request availability:', err)
//         setCanMakePayment(false)
//       })

//       // Handle Apple Pay / Google Pay payment
//       pr.on('paymentmethod', async (ev) => {
//         console.log('Processing Payment Request API payment...')
//         setIsProcessing(true)
//         setPaymentError(null)
      
//         try {

//           const { data: { user } } = await supabase.auth.getUser()
  
//           if (user) {
//             console.log('Logging booking terms acceptance for Payment Request API...')
//             const { error: termsError } = await supabase
//               .from('terms_acceptances')
//               .insert({
//                 user_id: user.id,
//                 user_email: user.email,
//                 booking_id: partyDetails.id,
//                 terms_version: "1.0",
//                 privacy_version: "1.0",
//                 ip_address: await getUserIP(),
//                 user_agent: navigator.userAgent,
//                 accepted_at: new Date().toISOString(),
//                 acceptance_context: 'booking'
//               })
        
//             if (termsError) {
//               console.warn('Failed to log booking terms acceptance:', termsError)
//             }
//           }

//           const response = await fetch('/api/create-payment-intent', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               amount: paymentBreakdown.totalPaymentToday * 100,
//               currency: 'gbp',
//               partyDetails: {
//                 ...partyDetails,
//                 parentName: ev.payerName || partyDetails.parentName,
//                 email: ev.payerEmail || partyDetails.email
//               },
//               suppliers: confirmedSuppliers,
//               addons,
//               paymentType: 'payment_request'
//             }),
//           })
      
//           const { clientSecret, error: backendError } = await response.json()
      
//           if (backendError) {
//             throw new Error(backendError)
//           }
      
//           const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//             payment_method: ev.paymentMethod.id,
//           })
      
//           if (error) {
//             console.error('Payment Request API error:', error)
//             ev.complete('fail')
//             throw new Error(error.message)
//           }
      
//           if (paymentIntent.status === 'succeeded') {
//             console.log('Payment Request API payment successful:', paymentIntent.id)
//             ev.complete('success')
            
//             setIsProcessing(false)
//             setIsRedirecting(true)
            
//             onPaymentSuccess(paymentIntent)
//           } else {
//             ev.complete('fail')
//             throw new Error('Payment not completed')
//           }
      
//         } catch (error) {
//           console.error('Payment Request API payment error:', error)
//           ev.complete('fail')
//           setPaymentError(error.message)
//           onPaymentError(error)
//           setIsProcessing(false)
//         }
//       })
//     }
//   }, [stripe, paymentBreakdown, partyDetails, confirmedSuppliers, addons, onPaymentSuccess, onPaymentError])

// // Handle regular card payment
// const handleCardPayment = async (event) => {
//   event.preventDefault()
  
//   if (!stripe || !elements) {
//     return
//   }

//   // Validate terms acceptance first
//   if (!bookingTermsAccepted) {
//     setPaymentError('Please accept the booking terms to continue')
//     return
//   }

//   setIsProcessing(true)
//   setPaymentError(null)

//   const cardElement = elements.getElement(CardElement)

//   try {
//     console.log('Processing card payment...')

//     // Get current user for terms logging
//     const { data: { user } } = await supabase.auth.getUser()
    
//     // Log booking terms acceptance BEFORE processing payment
//     if (user) {
//       console.log('Logging booking terms acceptance...')
//       const { error: termsError } = await supabase
//         .from('terms_acceptances')
//         .insert({
//           user_id: user.id,
//           user_email: user.email,
//           booking_id: partyDetails.id,
//           terms_version: "1.0",
//           privacy_version: "1.0",
//           ip_address: await getUserIP(),
//           user_agent: navigator.userAgent,
//           accepted_at: new Date().toISOString(),
//           acceptance_context: 'booking'
//         })

//       if (termsError) {
//         console.warn('Failed to log booking terms acceptance:', termsError)
//         // Continue with payment - don't block for logging issues
//       } else {
//         console.log('Booking terms acceptance logged successfully')
//       }
//     }

//     const response = await fetch('/api/create-payment-intent', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         amount: paymentBreakdown.totalPaymentToday * 100,
//         currency: 'gbp',
//         partyDetails,
//         suppliers: confirmedSuppliers,
//         addons,
//         billingDetails,
//         paymentType: 'card'
//       }),
//     })

//     const { clientSecret, error: backendError } = await response.json()

//     if (backendError) {
//       throw new Error(backendError)
//     }

//     const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: cardElement,
//         billing_details: {
//           name: billingDetails.name || partyDetails.parentName || 'Parent',
//           email: partyDetails.email,
//           address: {
//             postal_code: billingDetails.postalCode || partyDetails.location || ''
//           }
//         },
//       },
//     })

//     if (error) {
//       throw new Error(error.message)
//     }

//     if (paymentIntent.status === 'succeeded') {
//       console.log('Card payment successful:', paymentIntent.id)
      
//       setIsProcessing(false)
//       setIsRedirecting(true)
      
//       onPaymentSuccess(paymentIntent)
//     }

//   } catch (error) {
//     console.error('Card payment error:', error)
//     setPaymentError(error.message)
//     onPaymentError(error)
//     setIsProcessing(false)
//   }
// }

// // Helper function for IP address (add if not already present)
// const getUserIP = async () => {
//   try {
//     const response = await fetch('/api/get-ip')
//     const data = await response.json()
//     return data.ip
//   } catch {
//     return 'unknown'
//   }
// }

//   const handleInputChange = (field, value) => {
//     setBillingDetails(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   return (
//     <div className="space-y-6">
      
//       {/* Apple Pay / Google Pay Button */}
//       {canMakePayment && paymentRequest && !isProcessing && !isRedirecting && (
//         <div className="space-y-4">
//           <div className="text-center">
//             <p className="text-sm text-gray-600 mb-3">Quick & Secure Payment</p>
//             <div className="bg-white border border-gray-200 rounded-lg p-4">
//               <PaymentRequestButtonElement 
//                 options={{
//                   paymentRequest,
//                   style: {
//                     paymentRequestButton: {
//                       type: 'default',
//                       theme: 'dark',
//                       height: '48px',
//                     },
//                   },
//                 }}
//                 onReady={() => {
//                   console.log('Payment Request Button ready')
//                 }}
//                 onClick={(event) => {
//                   console.log('Payment Request Button clicked')
//                 }}
//               />
//             </div>
//           </div>
          
//           {/* Divider */}
//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t border-gray-300" />
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="bg-white px-3 text-gray-500">Or pay with card</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Card Payment Form */}
//       <form onSubmit={handleCardPayment} className="space-y-4">
//         {/* Billing Details */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Full Name
//             </label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               placeholder="Your full name"
//               value={billingDetails.name}
//               onChange={(e) => handleInputChange('name', e.target.value)}
//               required
//               disabled={isProcessing || isRedirecting}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Postcode
//             </label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase"
//               placeholder="SW1A 1AA"
//               value={billingDetails.postalCode}
//               onChange={(e) => handleInputChange('postalCode', e.target.value.toUpperCase())}
//               maxLength="8"
//               required
//               disabled={isProcessing || isRedirecting}
//             />
//           </div>
//         </div>

//         {/* Card Element */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Card Details
//           </label>
//           <div className="p-3 border border-gray-300 rounded-md bg-white">
//             <CardElement 
//               options={{
//                 style: {
//                   base: {
//                     fontSize: '16px',
//                     color: '#374151',
//                     '::placeholder': {
//                       color: '#9ca3af',
//                     },
//                     iconColor: '#6b7280',
//                   },
//                   invalid: {
//                     color: '#ef4444',
//                     iconColor: '#ef4444',
//                   },
//                 },
//                 hidePostalCode: true,
//                 iconStyle: 'solid',
//                 disabled: isProcessing || isRedirecting,
//               }}
//             />
//           </div>
//         </div>

//         {/* Payment Error */}
//         {paymentError && !isRedirecting && (
//           <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-700 text-sm">{paymentError}</p>
//           </div>
//         )}

// <BookingTermsAcceptance
//   termsAccepted={bookingTermsAccepted}
//   setTermsAccepted={setBookingTermsAccepted}
//   partyDetails={partyDetails}
//   required={true}
// />


//         {/* Payment Button with Enhanced States */}
//         <button 
//           type="submit"
//           disabled={!stripe || isProcessing || isRedirecting || !bookingTermsAccepted}
//           className="cursor-pointer w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isRedirecting ? (
//             <div className="flex items-center justify-center space-x-2">
//               <CheckCircle className="w-4 h-4 text-green-400" />
//               <span>Redirecting to confirmation...</span>
//             </div>
//           ) : isProcessing ? (
//             <div className="flex items-center justify-center space-x-2">
//               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//               <span>Processing Payment...</span>
//             </div>
//           ) : (
//             <div className="flex items-center justify-center space-x-2">
//               <Lock className="w-4 h-4" />
//               <span>Pay £{paymentBreakdown.totalPaymentToday} Securely</span>
//             </div>
//           )}
//         </button>
//       </form>

//       {/* Security notices */}
//       <div className="space-y-2">
//         <p className="text-xs text-gray-500 text-center">
//           Secure payment powered by Stripe. Your card details are encrypted and never stored.
//         </p>
//         {canMakePayment && (
//           <p className="text-xs text-gray-500 text-center">
//             Apple Pay and Google Pay use your device's secure authentication.
//           </p>
//         )}
//       </div>
//     </div>
//   )
// }

// // Main Payment Page Component - UNCHANGED
// export default function PaymentPageContent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
  
//   // State
//   const [loading, setLoading] = useState(true)
//   const [partyDetails, setPartyDetails] = useState(null)
//   const [confirmedSuppliers, setConfirmedSuppliers] = useState([])
//   const [user, setUser] = useState(null)
//   const [partyId, setPartyId] = useState(null)
//   const [isRedirecting, setIsRedirecting] = useState(false)
//   const [paymentBreakdown, setPaymentBreakdown] = useState({
//     depositAmount: 0,
//     fullPaymentAmount: 0,
//     totalPaymentToday: 0,
//     totalCost: 0,
//     remainingBalance: 0,
//     hasDeposits: false,
//     hasFullPayments: false,
//     paymentDetails: []
//   })

//   // Party plan hook for current data
//   const { partyPlan, addons } = usePartyPlan()

//   useEffect(() => {
//     const loadPaymentData = async () => {
//       try {
//         // Get current user
//         const userResult = await partyDatabaseBackend.getCurrentUser();
//         if (!userResult.success) {
//           router.push('/auth/signin?redirect=/payment');
//           return;
//         }
//         setUser(userResult.user);
  
//         // Get party ID from URL parameters
//         const urlParams = new URLSearchParams(window.location.search);
//         const partyIdFromUrl = urlParams.get('party_id');
        
//         if (!partyIdFromUrl) {
//           console.error('No party ID in URL');
//           router.push('/dashboard');
//           return;
//         }
  
//         // Get specific party by ID (works for both draft and planned)
//         const partyResult = await partyDatabaseBackend.getPartyById(partyIdFromUrl);
//         if (!partyResult.success || !partyResult.party) {
//           console.error('Party not found:', partyIdFromUrl);
//           router.push('/dashboard');
//           return;
//         }
  
//         // Verify this party belongs to the current user
//         if (partyResult.party.user_id !== userResult.user.id) {
//           console.error('Party does not belong to current user');
//           router.push('/dashboard');
//           return;
//         }
  
//         // Get enquiries for this party to check payment status
//         const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyResult.party.id);
//         const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : [];
        
//         // Create a set of paid categories
//         const paidCategories = new Set(
//           existingEnquiries
//             .filter(enquiry => enquiry.payment_status === 'paid')
//             .map(enquiry => enquiry.supplier_category)
//         );
        
//         console.log('Already paid categories:', Array.from(paidCategories));
  
//         // Build supplier list from party plan, excluding already paid ones
//         const partyPlan = partyResult.party.party_plan || {};
//         const supplierList = Object.entries(partyPlan)
//           .filter(([key, supplier]) => 
//             supplier && 
//             typeof supplier === 'object' && 
//             supplier.name &&
//             key !== 'addons' &&
//             !paidCategories.has(key)
//           )
//           .map(([key, supplier]) => ({
//             id: supplier.id,
//             name: supplier.name,
//             image: supplier.image || '/placeholder.jpg',
//             rating: supplier.rating || 4.5,
//             description: supplier.description || 'Professional service provider',
//             category: key,
//             price: supplier.price || 0,
//             originalPrice: supplier.originalPrice,
//             priceFrom: supplier.priceFrom,
//             packageData: supplier.packageData,
//             selectedAddons: supplier.selectedAddons || []
//           }));
        
//         console.log('Suppliers for payment (unpaid only):', supplierList);
        
//         // If no unpaid suppliers, redirect to dashboard with message
//         if (supplierList.length === 0) {
//           console.log('No unpaid suppliers found - redirecting to dashboard');
//           router.push('/dashboard?message=no-pending-payments');
//           return;
//         }
        
//         // UNIFIED PRICING: Calculate payment breakdown
//         const breakdown = calculatePaymentBreakdown(supplierList, partyResult.party);
//         console.log('Unified pricing payment breakdown:', breakdown);
        
//         setConfirmedSuppliers(supplierList);
//         setPaymentBreakdown(breakdown);
//         setPartyId(partyResult.party.id);
//         setPartyDetails({
//           id: partyResult.party.id,
//           childName: partyResult.party.child_name,
//           theme: partyResult.party.theme,
//           date: partyResult.party.party_date,
//           childAge: partyResult.party.child_age,
//           location: partyResult.party.location,
//           guestCount: partyResult.party.guest_count,
//           email: userResult.user.email,
//           parentName: `${userResult.user.first_name} ${userResult.user.last_name}`.trim()
//         });
  
//       } catch (error) {
//         console.error('Error loading payment data:', error);
//         router.push('/dashboard');
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     loadPaymentData();
//   }, [router]);

//   const handlePaymentSuccess = async (paymentIntent) => {
//     try {
//       console.log('Processing payment success for payment intent:', paymentIntent.id);
  
//       // Step 1: Update party status from 'draft' to 'planned'
//       await supabase
//         .from('parties')
//         .update({ status: 'planned' })
//         .eq('id', partyId);
  
//       // Step 2: Record payment
//       const updateResult = await partyDatabaseBackend.updatePartyPaymentStatus(partyId, {
//         payment_status: paymentBreakdown.remainingBalance > 0 ? 'partial_paid' : 'fully_paid',
//         payment_intent_id: paymentIntent.id,
//         deposit_amount: paymentBreakdown.depositAmount,
//         full_payment_amount: paymentBreakdown.fullPaymentAmount,
//         total_paid_today: paymentBreakdown.totalPaymentToday,
//         remaining_balance: paymentBreakdown.remainingBalance,
//         payment_date: new Date().toISOString()
//       });
  
//       const supplierCategoriesToPay = confirmedSuppliers.map(s => s.category);
      
//       // Step 3: Check if enquiries already exist
//       const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyId);
//       const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : [];
      
//       const existingEnquiryCategories = existingEnquiries.map(e => e.supplier_category);
//       const enquiriesAlreadyExist = supplierCategoriesToPay.every(category => 
//         existingEnquiryCategories.includes(category)
//       );

//       if (enquiriesAlreadyExist) {
//         // Individual supplier payment
//         console.log('Individual supplier payment - setting auto_accepted and updating payment status');
        
//         await partyDatabaseBackend.autoAcceptEnquiries(partyId, supplierCategoriesToPay);
//         await partyDatabaseBackend.updateEnquiriesPaymentStatus(
//           partyId, 
//           supplierCategoriesToPay,
//           {
//             payment_breakdown: paymentBreakdown.paymentDetails,
//             lead_time_suppliers: supplierCategoriesToPay.filter(cat => 
//               paymentBreakdown.paymentDetails.find(p => p.category === cat)?.paymentType === 'full_payment'
//             )
//           }
//         );
//       } else {
//         // Initial party payment - create enquiries first
//         console.log('Creating new enquiries for initial party payment');
        
//         const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
//           partyId,
//           "BOOKING CONFIRMED - Customer has completed payment"
//         );
        
//         if (enquiryResult.success) {
//           await partyDatabaseBackend.autoAcceptEnquiries(partyId);
//           await partyDatabaseBackend.updateEnquiriesPaymentStatus(
//             partyId, 
//             supplierCategoriesToPay,
//             {
//               payment_breakdown: paymentBreakdown.paymentDetails
//             }
//           );
          
//           // Clear localStorage only after successful enquiry creation
//           localStorage.removeItem('party_details');
//           localStorage.removeItem('user_party_plan');
//         }
//       }
  
//       // Step 4: Send supplier notifications (non-blocking)
//       sendSupplierNotifications();
      
//       // Step 5: Send customer payment confirmation email
//         // Generate dashboard link for this party
//         const dashboardLink = `${window.location.origin}/dashboard?party_id=${partyId}`;
//       try {
//         console.log('Sending payment confirmation email to customer...');
        
      
        
//         const emailResponse = await fetch('/api/email/payment-confirmation', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             customerEmail: partyDetails.email,
//             customerName: partyDetails.parentName,
//             childName: partyDetails.childName,
//             childAge: partyDetails.childAge,
//             theme: partyDetails.theme,
//             partyDate: partyDetails.date,
//             partyTime: partyDetails.time || '14:00',
//             location: partyDetails.location,
//             guestCount: partyDetails.guestCount,
//             services: paymentBreakdown.paymentDetails.map(detail => ({
//               name: confirmedSuppliers.find(s => s.category === detail.category)?.name || detail.category,
//               category: detail.category,
//               price: detail.totalAmount,
//               paymentType: detail.paymentType,
//               amountPaid: detail.amountToday,
//               remainingAmount: detail.remaining
//             })),
//             totalPaidToday: paymentBreakdown.totalPaymentToday,
//             remainingBalance: paymentBreakdown.remainingBalance,
//             paymentIntentId: paymentIntent.id,
//             paymentMethod: 'Card',
//             dashboardLink: dashboardLink,
//             addons: addons || []
//           })
//         });
  
//         if (emailResponse.ok) {
//           const emailResult = await emailResponse.json();
//           console.log('✅ Payment confirmation email sent successfully:', emailResult.receiptId);
//         } else {
//           const emailError = await emailResponse.text();
//           console.warn('⚠️ Payment confirmation email failed:', emailError);
//           // Don't block the flow - payment was successful even if email fails
//         }
//       } catch (emailError) {
//         console.error('❌ Error sending payment confirmation email:', emailError);
//         // Don't block the flow - payment was successful even if email fails
//       }
      
//       // Step 6: Redirect to success page
//       router.push(`/payment/success?payment_intent=${paymentIntent.id}`);
      
//     } catch (error) {
//       console.error('Error handling payment success:', error);
//       setIsRedirecting(false);
//       alert('Payment was successful, but there was an issue setting up your booking. Please contact support.');
//     }
//   };

//   const sendSupplierNotifications = async () => {
//     try {
//       console.log('Sending supplier notifications via email and SMS...');
      
//       for (const supplier of confirmedSuppliers) {
//         try {
//           console.log(`Processing notifications for supplier: ${supplier.name} (ID: ${supplier.id})`);
          
//           // Get supplier details from database
//           const { data: supplierData, error } = await supabase
//             .from('suppliers')
//             .select('data')
//             .eq('id', supplier.id)
//             .single();
  
//           if (error || !supplierData?.data) {
//             console.warn(`No supplier data found for ${supplier.name}:`, error);
//             continue;
//           }
  
//           // Parse the JSON data column to get owner info
//           const supplierInfo = typeof supplierData.data === 'string' 
//             ? JSON.parse(supplierData.data) 
//             : supplierData.data;
  
//           console.log(`Supplier data parsed for ${supplier.name}:`, {
//             ownerName: supplierInfo.owner?.name,
//             ownerEmail: supplierInfo.owner?.email,
//             ownerPhone: supplierInfo.owner?.phone,
//             smsConsent: supplierInfo.notifications?.smsBookings
//           });
  
//           if (!supplierInfo?.owner?.email) {
//             console.warn(`No email found in owner data for ${supplier.name}`);
//             continue;
//           }
  
//           // Get supplier payment details
//           const supplierPaymentDetail = paymentBreakdown.paymentDetails.find(p => p.category === supplier.category);
          
//           const basePayload = {
//             supplierName: supplierInfo.owner.name || supplier.name,
//             customerName: partyDetails.parentName,
//             customerEmail: partyDetails.email,
//             customerPhone: user?.phone || '',
//             childName: partyDetails.childName,
//             theme: partyDetails.theme,
//             partyDate: partyDetails.date,
//             partyTime: partyDetails.time || '14:00',
//             partyLocation: partyDetails.location,
//             guestCount: String(partyDetails.guestCount || 10),
//             serviceType: supplier.category,
//             depositAmount: String(supplierPaymentDetail?.amountToday || supplier.price),
//             supplierEarning: String(supplier.price),
//             paymentType: supplierPaymentDetail?.paymentType || 'deposit'
//           };
  
//           // 1. Send Email Notification (Always send)
//           try {
//             const emailPayload = {
//               supplierEmail: supplierInfo.owner.email,
//               dashboardLink: 'http://localhost:3000/suppliers/dashboard',
//               ...basePayload
//             };
  
//             console.log(`Sending email to ${supplierInfo.owner.name} at ${supplierInfo.owner.email}`);
  
//             const emailResponse = await fetch('/api/email/supplier-notification', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(emailPayload)
//             });
  
//             if (emailResponse.ok) {
//               console.log(`✅ Email sent successfully to ${supplier.name}`);
//             } else {
//               const emailError = await emailResponse.text();
//               console.warn(`❌ Email failed for ${supplier.name}:`, emailError);
//             }
//           } catch (emailError) {
//             console.error(`Email error for ${supplier.name}:`, emailError);
//           }
  
//           // 2. Send SMS Notification (Only if consented and phone exists)
//           if (supplierInfo.owner?.phone) {
//             // Check if SMS notifications are enabled (consent given)
//             if (supplierInfo.notifications?.smsBookings === true) {
//               try {
//                 console.log(`Sending SMS to ${supplierInfo.owner.name} at ${supplierInfo.owner.phone} (consent: enabled)`);
                
//                 const smsPayload = {
//                   phoneNumber: supplierInfo.owner.phone,
//                   dashboardLink: 'http://localhost:3000/suppliers/dashboard',
//                   ...basePayload
//                 };
  
//                 const smsResponse = await fetch('/api/send-sms-notification', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify(smsPayload)
//                 });
  
//                 if (smsResponse.ok) {
//                   const smsResult = await smsResponse.json();
//                   console.log(`✅ SMS sent successfully to ${supplier.name} - Message ID: ${smsResult.messageId}`);
//                 } else {
//                   const smsError = await smsResponse.text();
//                   console.warn(`❌ SMS failed for ${supplier.name}:`, smsError);
//                 }
//               } catch (smsError) {
//                 console.error(`SMS error for ${supplier.name}:`, smsError);
//               }
//             } else {
//               // Phone exists but SMS is disabled
//               console.log(`📱 SMS disabled for ${supplier.name} - respecting user preference (phone: ${supplierInfo.owner.phone})`);
//             }
//           } else {
//             // No phone number at all
//             console.log(`📱 No phone number for ${supplier.name} - skipping SMS`);
//           }
  
//           console.log(`✅ Completed notification processing for ${supplier.name}`);
          
//         } catch (supplierError) {
//           console.error(`Error processing notifications for supplier ${supplier.name}:`, supplierError);
//         }
//       }
      
//       console.log('✅ All supplier notifications completed');
      
//     } catch (error) {
//       console.error('Error in supplier notifications:', error);
//     }
//   };

//   const handlePaymentError = (error) => {
//     console.error('Payment failed:', error)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading payment details...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!partyDetails) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">No Party Found</h1>
//           <p className="text-gray-600 mb-6">We couldn't find your party details.</p>
//           <Button onClick={() => router.push('/dashboard')} className="bg-gray-900 hover:bg-gray-800 text-white">
//             Return to Dashboard
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <ContextualBreadcrumb currentPage="payment" />
      
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="container mx-auto px-4 py-6 max-w-6xl">
//           <div className="flex items-center space-x-4">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Secure Your Booking</h1>
//               <p className="text-gray-600 text-sm mt-1">Complete your payment to guarantee your party date</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Left Column - Order Summary */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Status Banner */}
//             <div className="bg-primary-50 border border-[hsl(var(--primary-200))] rounded-lg p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="flex-shrink-0">
//                   <CheckCircle className="w-6 h-6 text-primary-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-bold text-primary-800">Your suppliers are ready</h3>
//                   <p className="text-sm text-primary-600">Complete payment to secure {partyDetails.childName}'s {partyDetails.theme} party</p>
//                 </div>
//               </div>
//             </div>

//             {/* Party Information */}
//             <div className="bg-white border border-gray-200 rounded-lg p-6">
//               <h2 className="text-lg font-medium text-gray-900 mb-4">Party Details</h2>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="flex items-center space-x-2 text-gray-600">
//                   <Calendar className="w-4 h-4" />
//                   <span>{partyDetails.date}</span>
//                 </div>
//                 <div className="flex items-center space-x-2 text-gray-600">
//                   <Users className="w-4 h-4" />
//                   <span>Age {partyDetails.childAge}</span>
//                 </div>
//                 <div className="flex items-center space-x-2 text-gray-600">
//                   <MapPin className="w-4 h-4" />
//                   <span>{partyDetails.location}</span>
//                 </div>
//                 <div className="flex items-center space-x-2 text-gray-600">
//                   <Users className="w-4 h-4" />
//                   <span>{partyDetails.guestCount || '10-15'} guests</span>
//                 </div>
//               </div>
//             </div>

//             {/* Available Services */}
//             <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
//               <h2 className="text-lg font-medium text-gray-900 mb-4">Selected Services</h2>
//               <div className="space-y-3">
//                 {paymentBreakdown.paymentDetails.map((supplier) => (
//                   <div key={supplier.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
//                     {/* Mobile Layout: Stack vertically */}
//                     <div className="sm:hidden">
//                       {/* Top Row: Image + Name */}
//                       <div className="flex items-center space-x-3 mb-3">
//                         <img 
//                           src={supplier.image || "/placeholder.jpg"} 
//                           alt={supplier.name}
//                           className="w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-medium text-gray-900 truncate text-sm">{supplier.name}</h3>
//                           <span className="text-xs text-gray-500 capitalize">{supplier.category}</span>
//                         </div>
//                       </div>
                      
//                       {/* Middle Row: Rating + Payment Type */}
//                       <div className="flex items-center justify-between mb-3 text-xs">
//                         <div className="flex items-center space-x-1">
//                           <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                           <span className="text-gray-600">{supplier.rating}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           {supplier.paymentType === 'full_payment' ? (
//                             <>
//                               <Package className="w-3 h-3 text-green-600" />
//                               <span className="text-green-600 font-medium">Full Payment</span>
//                             </>
//                           ) : (
//                             <>
//                               <Clock className="w-3 h-3 text-blue-600" />
//                               <span className="text-blue-600 font-medium">Deposit</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Bottom Row: Price */}
//                       <div className="flex items-center justify-between">
//                         <div className="text-xs text-blue-600 font-medium">Ready to book</div>
//                         <div className="text-right">
//                           <div className="font-semibold text-gray-900 text-sm">£{supplier.amountToday}</div>
//                           {supplier.remaining > 0 && (
//                             <div className="text-xs text-gray-500">£{supplier.remaining} on day</div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Desktop Layout: Side by side */}
//                     <div className="hidden sm:flex items-center justify-between">
//                       <div className="flex items-center space-x-4">
//                         <img 
//                           src={supplier.image || "/placeholder.jpg"} 
//                           alt={supplier.name}
//                           className="w-12 h-12 rounded-lg object-cover bg-gray-200"
//                         />
//                         <div>
//                           <h3 className="font-medium text-gray-900">{supplier.name}</h3>
//                           <div className="flex items-center space-x-3 text-sm text-gray-500">
//                             <div className="flex items-center space-x-1">
//                               <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                               <span>{supplier.rating}</span>
//                             </div>
//                             <span>•</span>
//                             <span className="capitalize">{supplier.category}</span>
//                             <span>•</span>
//                             <div className="flex items-center space-x-1">
//                               {supplier.paymentType === 'full_payment' ? (
//                                 <>
//                                   <Package className="w-3 h-3 text-green-600" />
//                                   <span className="text-green-600 font-medium">Full Payment</span>
//                                 </>
//                               ) : (
//                                 <>
//                                   <Clock className="w-3 h-3 text-blue-600" />
//                                   <span className="text-blue-600 font-medium">Deposit</span>
//                                 </>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-semibold text-gray-900">£{supplier.amountToday}</div>
//                         {supplier.remaining > 0 && (
//                           <div className="text-xs text-gray-500">£{supplier.remaining} on day</div>
//                         )}
//                         <div className="text-xs text-blue-600 font-medium">Ready to book</div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Payment */}
//           <div className="space-y-6">
            
//             {/* Payment Summary */}
//             <div className="bg-white border border-gray-200 rounded-lg p-6">
//               <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h2>
              
//               {/* Line items */}
//               <div className="space-y-2 mb-4">
//                 {paymentBreakdown.paymentDetails.map((supplier) => (
//                   <div key={supplier.id} className="flex justify-between text-sm">
//                     <span className="text-gray-600 capitalize">
//                       {supplier.category} ({supplier.paymentType === 'full_payment' ? 'Full' : 'Deposit'})
//                     </span>
//                     <span className="text-gray-900">£{supplier.amountToday}</span>
//                   </div>
//                 ))}
                
//                 {(addons || []).map((addon) => (
//                   <div key={addon.id} className="flex justify-between text-sm">
//                     <span className="text-gray-600">{addon.name}</span>
//                     <span className="text-gray-900">£{addon.price}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t border-gray-200 pt-4 mb-6">
//                 <div className="flex justify-between text-base font-medium text-gray-900 mb-3">
//                   <span>Total Due Today</span>
//                   <span>£{paymentBreakdown.totalPaymentToday}</span>
//                 </div>
                
//                 {paymentBreakdown.hasDeposits && (
//                   <div className="flex justify-between text-sm text-gray-600 mb-1">
//                     <span>Service deposits</span>
//                     <span>£{paymentBreakdown.depositAmount}</span>
//                   </div>
//                 )}
                
//                 {paymentBreakdown.hasFullPayments && (
//                   <div className="flex justify-between text-sm text-gray-600 mb-1">
//                     <span>Full payments (products)</span>
//                     <span>£{paymentBreakdown.fullPaymentAmount}</span>
//                   </div>
//                 )}
                
//                 {paymentBreakdown.remainingBalance > 0 && (
//                   <div className="flex justify-between text-sm text-gray-600">
//                     <span>Remaining balance (due on party day)</span>
//                     <span>£{paymentBreakdown.remainingBalance}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Payment Type Explanation */}
//               {(paymentBreakdown.hasDeposits && paymentBreakdown.hasFullPayments) && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                   <div className="flex items-start space-x-3">
//                     <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <h3 className="text-sm font-medium text-blue-900 mb-1">Mixed Payment Types</h3>
//                       <ul className="text-sm text-blue-800 space-y-1">
//                         <li>• Product suppliers (cakes, party bags) require full payment upfront</li>
//                         <li>• Service suppliers require deposits, remainder due on party day</li>
//                         <li>• All bookings guaranteed once payment is complete</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Standard Protection Notice */}
//               {(!paymentBreakdown.hasDeposits || !paymentBreakdown.hasFullPayments) && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                   <div className="flex items-start space-x-3">
//                     <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <h3 className="text-sm font-medium text-blue-900 mb-1">Booking Protection</h3>
//                       <ul className="text-sm text-blue-800 space-y-1">
//                         <li>• Full refund if suppliers cancel</li>
//                         <li>• 48-hour booking guarantee</li>
//                         <li>• Customer support included</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Stripe Payment Form */}
//               <Elements stripe={stripePromise} options={{
//                 appearance: {
//                   theme: 'stripe',
//                   variables: {
//                     colorPrimary: '#374151',
//                     colorBackground: '#ffffff',
//                     colorText: '#374151',
//                     colorDanger: '#ef4444',
//                     fontFamily: 'Inter, system-ui, sans-serif',
//                     spacingUnit: '4px',
//                     borderRadius: '6px',
//                   },
//                   rules: {
//                     '.Input': {
//                       padding: '12px',
//                       fontSize: '16px',
//                     },
//                     '.Input:focus': {
//                       boxShadow: '0 0 0 2px #3b82f6',
//                     },
//                   },
//                 },
//               }}>
//                 <PaymentForm
//                   partyDetails={partyDetails}
//                   confirmedSuppliers={confirmedSuppliers}
//                   addons={addons || []}
//                   paymentBreakdown={paymentBreakdown}
//                   onPaymentSuccess={handlePaymentSuccess}
//                   onPaymentError={handlePaymentError}
//                   isRedirecting={isRedirecting}
//                   setIsRedirecting={setIsRedirecting}
//                 />
//               </Elements>

//               {paymentBreakdown.remainingBalance > 0 && (
//                 <p className="text-xs text-gray-500 text-center mt-3">
//                   Remaining balance of £{paymentBreakdown.remainingBalance} due on party day.
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }