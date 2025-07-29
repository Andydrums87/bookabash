"use client"

import { Suspense } from 'react'
import PaymentPageContent from './PaymentPageContent'

// Loading component for the suspense fallback
function PaymentPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading payment details...</p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <PaymentPageContent />
    </Suspense>
  )
}