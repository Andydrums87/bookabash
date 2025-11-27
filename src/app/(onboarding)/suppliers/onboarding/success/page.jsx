"use client"

import { Suspense } from 'react'
import SupplierOnboardingSuccessContent from './SupplierOnboardingSuccessContent'

// Loading component for the suspense fallback
function SupplierOnboardingSuccessLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading your success page...</p>
      </div>
    </div>
  )
}

export default function SupplierOnboardingSuccessPage() {
  return (
    <Suspense fallback={<SupplierOnboardingSuccessLoading />}>
      <SupplierOnboardingSuccessContent />
    </Suspense>
  )
}