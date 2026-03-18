"use client"

import { Suspense } from "react"
import VenueOnboardingWizard from "./VenueOnboardingWizard"

function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading onboarding...</p>
      </div>
    </div>
  )
}

export default function SupplierOnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <VenueOnboardingWizard />
    </Suspense>
  )
}
