"use client"

import { Suspense } from 'react'
import SignUpPageContent from './SignUpPageContent'

// Loading component for the suspense fallback
function SignUpPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading sign up form...</p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpPageLoading />}>
      <SignUpPageContent />
    </Suspense>
  )
}