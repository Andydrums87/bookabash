
// app/e-invites/page.jsx
"use client"

import { Suspense } from 'react'
import EInvitesPage from '../components/EinvitesPage'
import { Loader2 } from "lucide-react"
import SnappyLoader from '@/components/ui/SnappyLoader'

// Loading component for Suspense fallback
function EInvitesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
           <SnappyLoader text="Loading your party..." />
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