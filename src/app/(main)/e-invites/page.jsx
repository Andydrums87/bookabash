
// app/e-invites/page.jsx
"use client"

import { Suspense } from 'react'
import EInvitesPage from './components/EinvitesPage'
import { Loader2 } from "lucide-react"

// Loading component for Suspense fallback
function EInvitesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Loading invitation creator...</h2>
          <p className="text-gray-600">Setting up your party planning tools!</p>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<EInvitesLoading />}>
      <EInvitesPage />
    </Suspense>
  )
}