"use client"

import { Suspense } from 'react'
import AnimatedRSVPPage from '../components/AnimatedRSVPPage'
import { Loader2 } from "lucide-react"

// Loading component for Suspense fallback
function InvitePageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden relative -mt-16 pt-16">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Loading your invitation...</h2>
          <p className="text-gray-600">Just a moment while we prepare everything!</p>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<InvitePageLoading />}>
      <AnimatedRSVPPage />
    </Suspense>
  )
}