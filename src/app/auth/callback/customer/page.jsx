"use client"

import { Suspense } from 'react'
import CustomerAuthCallback from './CustomerSignInContent'

// Loading component for the suspense fallback
function CustomerSignInPageLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

export default function CustomerSignInPage() {
  return (
    <Suspense fallback={<CustomerSignInPageLoading />}>
      <CustomerAuthCallback />
    </Suspense>
  )
}