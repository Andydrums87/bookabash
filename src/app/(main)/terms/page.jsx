"use client"

import { Suspense } from 'react'
import TermsContent from "./terms-content"

function TermsLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <Suspense fallback={<TermsLoading />}>
      <TermsContent />
    </Suspense>
  )
}
