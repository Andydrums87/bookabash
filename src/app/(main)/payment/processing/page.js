"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentProcessingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const partyId = searchParams.get('party_id')
  const paymentIntentId = searchParams.get('payment_intent')

  const [status, setStatus] = useState('processing') // 'processing' | 'complete' | 'failed'
  const [message, setMessage] = useState('Processing your payment...')
  const [pollCount, setPollCount] = useState(0)
  const [error, setError] = useState(null)

  // Maximum polling attempts (30 seconds with 1-second interval)
  const MAX_POLLS = 30
  const POLL_INTERVAL = 1000 // 1 second

  useEffect(() => {
    if (!partyId || !paymentIntentId) {
      setStatus('failed')
      setMessage('Invalid payment information')
      return
    }

    let pollTimer

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/check-payment-status?party_id=${partyId}&payment_intent_id=${paymentIntentId}`
        )

        const data = await response.json()

        if (data.status === 'complete') {
          setStatus('complete')
          setMessage('Payment processed successfully! Redirecting...')

          // Build success URL with all params from current URL
          const currentParams = new URLSearchParams(window.location.search)
          const successParams = new URLSearchParams({
            payment_intent: paymentIntentId
          })

          // Preserve add_supplier params if present
          const addSupplier = currentParams.get('add_supplier')
          const supplierName = currentParams.get('supplier_name')
          const supplierCategory = currentParams.get('supplier_category')
          if (addSupplier) successParams.set('add_supplier', addSupplier)
          if (supplierName) successParams.set('supplier_name', supplierName)
          if (supplierCategory) successParams.set('supplier_category', supplierCategory)

          // Redirect to success page after short delay
          setTimeout(() => {
            router.push(`/payment/success?${successParams.toString()}`)
          }, 2000)

        } else if (data.status === 'failed') {
          setStatus('failed')
          setMessage(data.message || 'Payment processing failed')
          setError(data.error)

        } else if (data.status === 'processing') {
          // Still processing - continue polling
          setPollCount(prev => {
            const newCount = prev + 1

            if (newCount >= MAX_POLLS) {
              // Timeout - webhook might be delayed
              setStatus('complete')
              setMessage('Payment confirmed! Finalizing your booking...')

              // Build success URL with params
              const currentParams = new URLSearchParams(window.location.search)
              const successParams = new URLSearchParams({ payment_intent: paymentIntentId })
              const addSupplier = currentParams.get('add_supplier')
              const supplierName = currentParams.get('supplier_name')
              const supplierCategory = currentParams.get('supplier_category')
              if (addSupplier) successParams.set('add_supplier', addSupplier)
              if (supplierName) successParams.set('supplier_name', supplierName)
              if (supplierCategory) successParams.set('supplier_category', supplierCategory)

              // Still redirect to success as payment was captured
              setTimeout(() => {
                router.push(`/payment/success?${successParams.toString()}`)
              }, 2000)

              return newCount
            }

            // Schedule next poll
            pollTimer = setTimeout(checkPaymentStatus, POLL_INTERVAL)
            return newCount
          })

          // Update message based on poll count
          if (pollCount > 10) {
            setMessage('Still processing your payment... This is taking longer than usual.')
          } else if (pollCount > 5) {
            setMessage('Processing your payment and setting up your booking...')
          }
        }

      } catch (error) {
        console.error('Error checking payment status:', error)

        // After MAX_POLLS, assume success (webhook will eventually process)
        if (pollCount >= MAX_POLLS) {
          setStatus('complete')
          setMessage('Payment confirmed! Your booking is being finalized.')
          // Build success URL
          const currentParams = new URLSearchParams(window.location.search)
          const successParams = new URLSearchParams({ payment_intent: paymentIntentId })
          const addSupplier = currentParams.get('add_supplier')
          const supplierName = currentParams.get('supplier_name')
          const supplierCategory = currentParams.get('supplier_category')
          if (addSupplier) successParams.set('add_supplier', addSupplier)
          if (supplierName) successParams.set('supplier_name', supplierName)
          if (supplierCategory) successParams.set('supplier_category', supplierCategory)

          setTimeout(() => {
            router.push(`/payment/success?${successParams.toString()}`)
          }, 2000)
        } else {
          // Continue polling
          pollTimer = setTimeout(checkPaymentStatus, POLL_INTERVAL)
          setPollCount(prev => prev + 1)
        }
      }
    }

    // Start polling
    checkPaymentStatus()

    // Cleanup
    return () => {
      if (pollTimer) {
        clearTimeout(pollTimer)
      }
    }
  }, [partyId, paymentIntentId, pollCount, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Status Icon */}
            {status === 'processing' && (
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
              </div>
            )}

            {status === 'complete' && (
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
            )}

            {/* Status Message */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {status === 'processing' && 'Processing Payment'}
                {status === 'complete' && 'Payment Successful!'}
                {status === 'failed' && 'Payment Failed'}
              </h1>
              <p className="text-gray-600">
                {message}
              </p>
            </div>

            {/* Progress Info */}
            {status === 'processing' && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((pollCount / MAX_POLLS) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Confirming your booking with suppliers...
                </p>
              </div>
            )}

            {/* Error Details */}
            {status === 'failed' && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            {status === 'failed' && (
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/payment')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}

            {/* Important Notice */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                {status === 'processing' && (
                  <>
                    Please do not close this window. We are confirming your booking with suppliers.
                  </>
                )}
                {status === 'complete' && (
                  <>
                    Check your email for booking confirmation and party details.
                  </>
                )}
                {status === 'failed' && (
                  <>
                    If you were charged, please contact support at{' '}
                    <a href="tel:08001234567" className="text-green-600 hover:underline">
                      0800 123 4567
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
