"use client"

import { Suspense } from 'react'
import RSVPMain from '../components/RSVPMain'
import { Loader2 } from "lucide-react"

// Loading component for Suspense fallback
function RSVPLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden relative -mt-16 pt-16">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-gray-700 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Loading your RSVP's...</h2>
          <p className="text-gray-600">Just a moment while we prepare everything!</p>
        </div>
      </div>
    </div>
  )
}

export default function RSVPPage() {
  return (
    <Suspense fallback={<RSVPLoading />}>
      <RSVPMain />
    </Suspense>
  )
}