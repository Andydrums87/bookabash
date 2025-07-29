"use client"

import { Suspense } from 'react'
import PaymentSuccessContent from './PaymentSuccessContent'

// Loading component for the suspense fallback
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Confirming your payment...</p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}