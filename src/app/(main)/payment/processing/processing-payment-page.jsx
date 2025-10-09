"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function PaymentProcessing() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Processing your payment...')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentIntent = searchParams.get('payment_intent')
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
      const partyId = searchParams.get('party_id')
      const redirectStatus = searchParams.get('redirect_status')

      console.log('Payment processing page loaded:', {
        paymentIntent,
        redirectStatus,
        partyId
      })

      // Klarna redirects with redirect_status
      if (redirectStatus === 'succeeded') {
        setStatus('success')
        setMessage('Payment successful! Redirecting to confirmation...')
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push(`/payment/success?payment_intent=${paymentIntent}`)
        }, 2000)
        
      } else if (redirectStatus === 'failed') {
        setStatus('error')
        setMessage('Payment failed. Please try again.')
        
        // Redirect back to payment page
        setTimeout(() => {
          router.push(`/payment?party_id=${partyId}`)
        }, 3000)
        
      } else if (paymentIntentClientSecret) {
        // For other payment methods, verify the payment intent
        try {
          const stripe = await import('@stripe/stripe-js').then(m => 
            m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
          )
          
          const { paymentIntent: intent } = await stripe.retrievePaymentIntent(
            paymentIntentClientSecret
          )
          
          if (intent.status === 'succeeded') {
            setStatus('success')
            setMessage('Payment successful! Redirecting to confirmation...')
            
            setTimeout(() => {
              router.push(`/payment/success?payment_intent=${intent.id}`)
            }, 2000)
            
          } else if (intent.status === 'processing') {
            setStatus('processing')
            setMessage('Your payment is being processed. This may take a moment...')
            
            // Poll for status update
            setTimeout(() => checkPaymentStatus(), 3000)
            
          } else if (intent.status === 'requires_payment_method') {
            setStatus('error')
            setMessage('Payment failed. Please try again with a different payment method.')
            
            setTimeout(() => {
              router.push(`/payment?party_id=${partyId}`)
            }, 3000)
          }
          
        } catch (error) {
          console.error('Error checking payment status:', error)
          setStatus('error')
          setMessage('Error verifying payment. Please contact support if payment was taken.')
        }
      } else {
        // No payment info found
        setStatus('error')
        setMessage('No payment information found.')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    }

    checkPaymentStatus()
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
          Please do not close this window
        </p>
      </div>
    </div>
  )
}