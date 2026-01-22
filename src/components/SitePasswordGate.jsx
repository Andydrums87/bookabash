"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import ComingSoon from "@/components/ComingSoon"

export default function SitePasswordGate({ children }) {
  const [isLoading, setIsLoading] = useState(true)

  // Check if we're in production and if coming soon mode is enabled
  const isProduction = process.env.NODE_ENV === "production"
  const isComingSoonEnabled = process.env.NEXT_PUBLIC_ENABLE_COMING_SOON === "true"

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // If coming soon is enabled, show coming soon page
  if (isComingSoonEnabled) {
    return <ComingSoon />
  }

  // Otherwise show the actual site
  return <>{children}</>
}
