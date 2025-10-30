"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function PaymentProcessing() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing your payment...')

  useEffect(() => {
    const completePayment = async () => {
      const paymentIntent = searchParams.get('payment_intent')
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
      const partyId = searchParams.get('party_id')
      const redirectStatus = searchParams.get('redirect_status')

      // Get add_supplier parameters to pass through
      const addSupplier = searchParams.get('add_supplier')
      const supplierName = searchParams.get('supplier_name')
      const supplierCategory = searchParams.get('supplier_category')

      console.log('🔍 Payment processing page loaded:', {
        paymentIntent,
        redirectStatus,
        partyId,
        addSupplier,
        supplierName,
        supplierCategory
      })

      if (!partyId) {
        console.error('❌ No party ID found')
        setStatus('error')
        setMessage('Missing party information')
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Klarna redirects with redirect_status
      if (redirectStatus === 'succeeded' && paymentIntent) {
        setStatus('processing')
        setMessage('Finalizing your booking...')
        
        try {
          console.log('✅ Klarna payment succeeded, completing booking...')
          console.log('🔍 Party ID:', partyId)
          console.log('🔍 Payment Intent:', paymentIntent)
          
          // Get party details
          const partyResult = await partyDatabaseBackend.getPartyById(partyId)
          console.log('🔍 Party result:', partyResult)
          
          if (!partyResult.success || !partyResult.party) {
            throw new Error('Party not found')
          }

          const party = partyResult.party
          console.log('🔍 Party data:', party)
          
          // Calculate payment breakdown
          const partyPlan = party.party_plan || {}
          const suppliers = Object.entries(partyPlan)
            .filter(([key, supplier]) => {
              // ✅ FIX: Exclude einvites and addons from payment
              if (key === 'addons' || key === 'einvites') {
                return false
              }
              return supplier &&
                typeof supplier === 'object' &&
                supplier.name
            })
            .map(([key, supplier]) => ({
              id: supplier.id,
              category: key,
              name: supplier.name,
              price: supplier.price || 0
            }))

          console.log('📦 Suppliers for payment:', suppliers)
          
          // Calculate totals
          const totalAmount = suppliers.reduce((sum, s) => sum + s.price, 0)
          const depositAmount = Math.round(totalAmount * 0.3)
          
          console.log('💰 Payment amounts:', { totalAmount, depositAmount })
          
          // Clear timer
          localStorage.removeItem(`booking_timer_${partyId}`)
          console.log('⏰ Timer cleared')
          
          // Update party status to planned - DIRECT SUPABASE UPDATE
          console.log('📝 Attempting to update party in database...')
          console.log('📝 Update payload:', {
            status: 'planned',
            payment_status: 'partial_paid',
            payment_intent_id: paymentIntent,
            payment_date: new Date().toISOString(),
            deposit_amount: depositAmount,
            total_paid: depositAmount
          })
          
          const { data: updateData, error: statusError } = await supabase
            .from('parties')
            .update({ 
              status: 'planned',
              payment_status: 'partial_paid',
              payment_intent_id: paymentIntent,
              payment_date: new Date().toISOString(),
              deposit_amount: depositAmount,
              total_paid: depositAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', partyId)
            .select()
          
          console.log('📝 Update response:', { data: updateData, error: statusError })
          
          if (statusError) {
            console.error('❌ Error updating party status:', statusError)
            throw new Error(`Database update failed: ${statusError.message}`)
          } else {
            console.log('✅ Party status updated successfully:', updateData)
          }
          
          // Check if enquiries exist
          const supplierCategories = suppliers.map(s => s.category)
          const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyId)
          const existingEnquiries = enquiriesResult.success ? enquiriesResult.enquiries : []
          
          const existingCategories = existingEnquiries.map(e => e.supplier_category)
          const enquiriesExist = supplierCategories.every(cat => existingCategories.includes(cat))

          if (enquiriesExist) {
            console.log('📧 Updating existing enquiries...')
            await partyDatabaseBackend.autoAcceptEnquiries(partyId, supplierCategories)
            await partyDatabaseBackend.updateEnquiriesPaymentStatus(partyId, supplierCategories, {})
          } else {
            console.log('📧 Creating new enquiries...')
            const enquiryResult = await partyDatabaseBackend.sendEnquiriesToSuppliers(
              partyId,
              "BOOKING CONFIRMED - Customer has completed payment"
            )
            
            if (enquiryResult.success) {
              await partyDatabaseBackend.autoAcceptEnquiries(partyId)
              await partyDatabaseBackend.updateEnquiriesPaymentStatus(partyId, supplierCategories, {})
            }
          }
          
          console.log('✅ Enquiries processed')
          
          setStatus('success')
          setMessage('Payment successful! Redirecting...')

          setTimeout(() => {
            const successParams = new URLSearchParams({
              payment_intent: paymentIntent,
              ...(addSupplier && { add_supplier: addSupplier }),
              ...(supplierName && { supplier_name: supplierName }),
              ...(supplierCategory && { supplier_category: supplierCategory })
            })
            router.push(`/payment/success?${successParams.toString()}`)
          }, 1500)
          
        } catch (error) {
          console.error('❌ Error completing payment:', error)
          setStatus('error')
          setMessage('Payment was successful, but there was an issue. Please contact support.')

          setTimeout(() => {
            const successParams = new URLSearchParams({
              payment_intent: paymentIntent,
              ...(addSupplier && { add_supplier: addSupplier }),
              ...(supplierName && { supplier_name: supplierName }),
              ...(supplierCategory && { supplier_category: supplierCategory })
            })
            router.push(`/payment/success?${successParams.toString()}`)
          }, 3000)
        }
        
      } else if (redirectStatus === 'failed') {
        setStatus('error')
        setMessage('Payment failed. Please try again.')
        
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
              const successParams = new URLSearchParams({
                payment_intent: intent.id,
                ...(addSupplier && { add_supplier: addSupplier }),
                ...(supplierName && { supplier_name: supplierName }),
                ...(supplierCategory && { supplier_category: supplierCategory })
              })
              router.push(`/payment/success?${successParams.toString()}`)
            }, 2000)
            
          } else if (intent.status === 'processing') {
            setStatus('processing')
            setMessage('Your payment is being processed. This may take a moment...')
            
            setTimeout(() => completePayment(), 3000)
            
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
        setStatus('error')
        setMessage('No payment information found.')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    }

    completePayment()
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