"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { X, CreditCard, Lock, CheckCircle, AlertCircle, Smartphone } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
  locale: 'en-GB',
})

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true, // We'll collect it separately
}

// Payment Form Component
function PaymentForm({
  amount,
  partyId,
  supplierType,
  supplierName,
  onSuccess,
  onError,
  onCancel
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [postcode, setPostcode] = useState('')
  const [paymentRequest, setPaymentRequest] = useState(null)
  const [canMakePayment, setCanMakePayment] = useState(false)

  // Create payment intent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-upgrade-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to pence
            currency: 'gbp',
            partyId,
            supplierType,
            supplierName,
            paymentType: 'booking_upgrade'
          })
        })

        const data = await response.json()

        if (data.error) {
          setPaymentError(data.error)
        } else {
          setClientSecret(data.clientSecret)
        }
      } catch (error) {
        console.error('Error creating payment intent:', error)
        setPaymentError('Failed to initialize payment. Please try again.')
      }
    }

    createPaymentIntent()
  }, [amount, partyId, supplierType, supplierName])

  // Initialize Apple Pay / Google Pay
  useEffect(() => {
    if (!stripe || !amount) return

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: `Booking upgrade - ${supplierName}`,
        amount: Math.round(amount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr)
        setCanMakePayment(true)
        console.log('✅ Apple Pay / Google Pay available')
      }
    })

    pr.on('paymentmethod', async (event) => {
      if (!clientSecret) {
        event.complete('fail')
        return
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: event.paymentMethod.id },
        { handleActions: false }
      )

      if (error) {
        event.complete('fail')
        setPaymentError(error.message)
        onError?.(error)
      } else {
        event.complete('success')
        if (paymentIntent.status === 'succeeded') {
          onSuccess?.(paymentIntent)
        }
      }
    })
  }, [stripe, amount, supplierName, clientSecret, onSuccess, onError])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    if (!postcode.trim()) {
      setPaymentError('Please enter your billing postcode')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            address: {
              postal_code: postcode.trim().toUpperCase()
            }
          }
        }
      })

      if (error) {
        setPaymentError(error.message)
        onError?.(error)
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent)
      }
    } catch (error) {
      setPaymentError('Payment failed. Please try again.')
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Apple Pay / Google Pay Button */}
      {canMakePayment && paymentRequest && (
        <div className="mb-4">
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '48px',
                }
              }
            }}
          />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">or pay with card</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Input */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="bg-white rounded-lg border border-gray-300 p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Postcode Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Billing Postcode
        </label>
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.toUpperCase())}
          placeholder="e.g. SW1A 1AA"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          maxLength={10}
        />
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{paymentError}</p>
        </div>
      )}

      {/* Secure Payment Notice */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe. Your payment details are encrypted.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !clientSecret || isProcessing}
          className="flex-[2] bg-primary-500 hover:bg-primary-600 text-white"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay £{amount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Main Modal Component
export default function PriceDifferencePaymentModal({
  isOpen,
  onClose,
  amount,
  partyId,
  supplierType,
  supplierName,
  onPaymentSuccess,
  originalPrice,
  newPrice
}) {
  const [paymentComplete, setPaymentComplete] = useState(false)

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const handleSuccess = (paymentIntent) => {
    setPaymentComplete(true)
    // Wait a moment to show success state, then call the callback
    setTimeout(() => {
      onPaymentSuccess?.(paymentIntent)
      onClose()
    }, 1500)
  }

  const handleError = (error) => {
    console.error('Payment error:', error)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-500 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {paymentComplete ? 'Payment Successful!' : 'Pay Price Difference'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentComplete ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Complete!
              </h3>
              <p className="text-gray-600">
                Your booking changes have been saved.
              </p>
            </div>
          ) : (
            <>
              {/* Price Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {supplierName} - Price Update
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price</span>
                    <span className="text-gray-900">£{originalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Price</span>
                    <span className="text-gray-900">£{newPrice?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Amount Due</span>
                      <span className="text-primary-600">£{amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={amount}
                  partyId={partyId}
                  supplierType={supplierType}
                  supplierName={supplierName}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onCancel={onClose}
                />
              </Elements>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
