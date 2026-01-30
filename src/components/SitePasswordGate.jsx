"use client"

import { useState, useEffect } from "react"
import { Loader2, X } from "lucide-react"
import ComingSoon from "@/components/ComingSoon"

export default function SitePasswordGate({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [hasAccess, setHasAccess] = useState(false)

  // Check if coming soon mode is enabled
  const isComingSoonEnabled = process.env.NEXT_PUBLIC_ENABLE_COMING_SOON === "true"

  useEffect(() => {
    setIsLoading(false)

    // Check if user has already verified their email (stored in localStorage)
    if (isComingSoonEnabled) {
      const storedAccess = localStorage.getItem("founder_access")
      if (storedAccess === "true") {
        setHasAccess(true)
      }
    }
  }, [isComingSoonEnabled])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setVerifying(true)

    try {
      // Get whitelist from environment variable
      const whitelist = process.env.NEXT_PUBLIC_FOUNDER_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []

      if (whitelist.includes(email.toLowerCase())) {
        // Grant access
        localStorage.setItem("founder_access", "true")
        setHasAccess(true)
        setShowEmailModal(false)
      } else {
        setError("This email is not authorized to access the site.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // If coming soon is enabled and user doesn't have access
  if (isComingSoonEnabled && !hasAccess) {
    return (
      <>
        <ComingSoon />

        {/* Founder Access Button - Small Dot */}
        <button
          onClick={() => setShowEmailModal(true)}
          className="fixed bottom-4 right-4 w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-500 transition-colors opacity-30 hover:opacity-100"
          aria-label="Founder access"
        />

        {/* Email Verification Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setError("")
                  setEmail("")
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold mb-4">Founder Access</h2>
              <p className="text-gray-600 mb-6">
                Enter your email to bypass the coming soon page.
              </p>

              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none mb-4"
                  required
                  disabled={verifying}
                />

                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    )
  }

  // Otherwise show the actual site
  return <>{children}</>
}
