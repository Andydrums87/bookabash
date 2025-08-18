
// app/e-invites/page.jsx
"use client"

import { Suspense } from 'react'
import PartyBuilderPage from './party-builder-content'
import { Loader2 } from "lucide-react"

// Loading component for Suspense fallback
function PartyBuilderLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
       
          <p className="text-gray-600">Building......</p>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<PartyBuilderLoading />}>
      <PartyBuilderPage />
    </Suspense>
  )
}