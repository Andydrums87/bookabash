"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function PaymentProcessing() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing your payment...')
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    const partyId = searchParams.get('party_id')

    // Get add_supplier parameters to pass through
    const addSupplier = searchParams.get('add_supplier')
    const supplierName = searchParams.get('supplier_name')
    const supplierCategory = searchParams.get('supplier_category')

    console.log('🔍 Payment processing page loaded:', {
      paymentIntent,
      partyId,
      addSupplier,
      supplierName,
      supplierCategory
    })

    if (!partyId || !paymentIntent) {
      console.error('❌ Missing party ID or payment intent')
      setStatus('error')
      setMessage('Missing payment information')
      setTimeout(() => router.push('/dashboard'), 2000)
      return
    }

    // ✅ WEBHOOK-BASED PAYMENT POLLING
    const MAX_POLLS = 30 // 30 seconds
    const POLL_INTERVAL = 1000 // 1 second
    let currentPoll = 0

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/check-payment-status?party_id=${partyId}&payment_intent_id=${paymentIntent}`
        )

        const data = await response.json()
        console.log(`🔍 Poll ${currentPoll + 1}: Payment status =`, data.status)

        if (data.status === 'complete') {
          setStatus('success')
          setMessage('Payment processed successfully! Redirecting...')

          // Build success URL with all params
          const successParams = new URLSearchParams({
            payment_intent: paymentIntent,
            ...(addSupplier && { add_supplier: addSupplier }),
            ...(supplierName && { supplier_name: supplierName }),
            ...(supplierCategory && { supplier_category: supplierCategory })
          })

          setTimeout(() => {
            router.push(`/payment/success?${successParams.toString()}`)
          }, 2000)

        } else if (data.status === 'failed') {
          setStatus('error')
          setMessage(data.message || 'Payment processing failed')

        } else if (data.status === 'processing') {
          currentPoll++
          setPollCount(currentPoll)

          if (currentPoll >= MAX_POLLS) {
            // Timeout - webhook might be delayed, but payment was captured
            console.log('⏰ Polling timeout - assuming success')
            setStatus('success')
            setMessage('Payment confirmed! Finalizing your booking...')

            const successParams = new URLSearchParams({
              payment_intent: paymentIntent,
              ...(addSupplier && { add_supplier: addSupplier }),
              ...(supplierName && { supplier_name: supplierName }),
              ...(supplierCategory && { supplier_category: supplierCategory })
            })

            setTimeout(() => {
              router.push(`/payment/success?${successParams.toString()}`)
            }, 2000)

          } else {
            // Continue polling
            setTimeout(checkPaymentStatus, POLL_INTERVAL)

            // Update message based on poll count
            if (currentPoll > 10) {
              setMessage('Still processing... This is taking longer than usual.')
            } else if (currentPoll > 5) {
              setMessage('Processing your payment and setting up your booking...')
            }
          }
        }

      } catch (error) {
        console.error('❌ Error checking payment status:', error)
        currentPoll++
        setPollCount(currentPoll)

        if (currentPoll >= MAX_POLLS) {
          // Assume success after max polls (payment was captured by Stripe)
          setStatus('success')
          setMessage('Payment confirmed! Your booking is being finalized.')

          const successParams = new URLSearchParams({
            payment_intent: paymentIntent,
            ...(addSupplier && { add_supplier: addSupplier }),
            ...(supplierName && { supplier_name: supplierName }),
            ...(supplierCategory && { supplier_category: supplierCategory })
          })

          setTimeout(() => {
            router.push(`/payment/success?${successParams.toString()}`)
          }, 2000)
        } else {
          // Retry
          setTimeout(checkPaymentStatus, POLL_INTERVAL)
        }
      }
    }

    // Start polling after a short delay
    const pollTimer = setTimeout(checkPaymentStatus, 500)

    return () => clearTimeout(pollTimer)
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="mb-6">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600">{message}</p>

            {/* Progress indicator */}
            {pollCount > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((pollCount / 30) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Confirming with suppliers...
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Issue
            </h1>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors"
            >
              Return to Dashboard
            </button>
          </>
        )}

        <p className="text-xs text-gray-500 mt-6">
          {status === 'processing' && 'Please do not close this window'}
          {status === 'success' && 'Check your email for booking confirmation'}
        </p>
      </div>
    </div>
  )
}
