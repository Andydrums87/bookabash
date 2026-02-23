
// app/e-invites/page.jsx
"use client"

import { Suspense } from 'react'
// Template-based invite generation (Templated.io)
import TemplateEInvitesPage from '../components/TemplateEinvitesPage'
// Other options:
// import SimpleAIEinvitesPage from '../components/SimpleAIEinvitesPage' // AI generation
// import EInvitesPage from '../components/EinvitesPage' // Original complex AI flow
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
      <TemplateEInvitesPage />
    </Suspense>
  )
}