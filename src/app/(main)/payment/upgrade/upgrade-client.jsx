"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Shield,
  Lock,
  Loader2,
  CreditCard,
  TrendingUp
} from 'lucide-react'

import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
  locale: 'en-GB',
})

// ========================================
// PAYMENT FORM COMPONENT
// ========================================
function UpgradePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
  supplierName,
  isProcessing,
  setIsProcessing
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.error('Payment error:', error)
        onError(error)
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
      }
    } catch (err) {
      console.error('Payment submission error:', err)
      onError(err)
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['apple_pay', 'google_pay', 'card'],
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }}
      />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay £{amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
}

// ========================================
// MAIN UPGRADE PAYMENT CLIENT
// ========================================
export default function UpgradePaymentClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Extract params from URL
  const partyId = searchParams.get('partyId')
  const supplierType = searchParams.get('supplierType')
  const supplierName = searchParams.get('supplierName') || 'Supplier'
  const supplierImage = searchParams.get('supplierImage') || '/placeholder.jpg'
  const amount = parseFloat(searchParams.get('amount') || '0')
  const originalPrice = parseFloat(searchParams.get('originalPrice') || '0')
  const newPrice = parseFloat(searchParams.get('newPrice') || '0')
  const upgradeKey = searchParams.get('upgradeKey') // Key to retrieve pending data after payment
  const changesParam = searchParams.get('changes')

  // Parse changes if provided - memoize to prevent infinite re-renders
  const changes = useMemo(() => {
    try {
      if (changesParam) {
        return JSON.parse(decodeURIComponent(changesParam))
      }
    } catch (e) {
      console.warn('Could not parse changes:', e)
    }
    return []
  }, [changesParam])

  useEffect(() => {
    async function createUpgradePaymentIntent() {
      if (!partyId || !amount || amount <= 0) {
        setError('Invalid upgrade payment details')
        setLoading(false)
        return
      }

      // Skip if we already have a client secret
      if (clientSecret) return

      try {
        const response = await fetch('/api/create-upgrade-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partyId,
            supplierType,
            supplierName,
            amount: Math.round(amount * 100), // Convert to pence
            originalPrice,
            newPrice,
            changes
          }),
        })

        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        }
      } catch (err) {
        console.error('Error creating payment intent:', err)
        setError('Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    createUpgradePaymentIntent()
  }, [partyId, supplierType, supplierName, amount, originalPrice, newPrice, changes, clientSecret])

  const handlePaymentSuccess = async (paymentIntent) => {
    console.log('✅ Upgrade payment successful:', paymentIntent.id)

    // Redirect to success page with upgrade-specific params
    const successParams = new URLSearchParams({
      payment_intent: paymentIntent.id,
      type: 'upgrade',
      supplier_type: supplierType,
      supplier_name: supplierName,
      amount: amount.toString(),
      party_id: partyId,
      upgrade_key: upgradeKey || ''
    })

    router.push(`/payment/success?${successParams.toString()}`)
  }

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
    setError(error.message || 'Payment failed. Please try again.')
    setIsProcessing(false)
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  // Format change for display
  const formatChange = (change) => {
    switch (change.type) {
      case 'package_changed':
        return `Package: ${change.from} → ${change.to}`
      case 'cake_flavor_changed':
        return `Flavour: ${change.from} → ${change.to}`
      case 'cake_size_changed':
        return `Size: ${change.from} → ${change.to}`
      case 'dietary_changed':
        return `Dietary: ${change.from} → ${change.to}`
      case 'fulfillment_changed':
        const fromMethod = change.from === 'delivery' ? 'Delivery' : change.from === 'pickup' ? 'Collection' : change.from
        const toMethod = change.to === 'delivery' ? 'Delivery' : change.to === 'pickup' ? 'Collection' : change.to
        return `${fromMethod} → ${toMethod}`
      case 'addons_added':
        return `Add-ons added: ${change.to}`
      case 'quantity_changed':
        return `Quantity: ${change.from} → ${change.to}`
      default:
        return `${change.type.replace(/_/g, ' ')}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Preparing Payment</h2>
          <p className="text-gray-600">Setting up your upgrade payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleCancel} variant="outline">
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
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Complete Your Upgrade</h1>
              <p className="text-gray-600 text-sm mt-1">Pay the difference to update your booking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column - Upgrade Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Supplier Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="relative h-32 w-full bg-gray-100">
                {supplierImage && supplierImage !== '/placeholder.jpg' ? (
                  <Image
                    src={supplierImage}
                    alt={supplierName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CreditCard className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-lg">{supplierName}</h3>
                  <p className="text-white/80 text-sm capitalize">{supplierType}</p>
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">What's changing:</h4>
                {changes.length > 0 ? (
                  <ul className="space-y-2">
                    {changes.filter(c => c.type !== 'price_changed').map((change, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{formatChange(change)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Booking details updated</p>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Original price</span>
                  <span>£{originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>New price</span>
                  <span>£{newPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Amount to pay</span>
                    <span className="text-primary-600">£{amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Secure Payment</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Your payment is protected by 256-bit SSL encryption. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Lock className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
              </div>

              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#f97316',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <UpgradePaymentForm
                    clientSecret={clientSecret}
                    amount={amount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    supplierName={supplierName}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading payment form...</p>
                </div>
              )}

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Stripe Protected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel link */}
            <div className="text-center mt-4">
              <button
                onClick={handleCancel}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel and return to dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
