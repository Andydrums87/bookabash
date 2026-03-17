"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ClaimVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [error, setError] = useState(null)

  useEffect(() => {
    async function handleVerification() {
      try {
        // Get the session (user just verified their email)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          setError("Could not verify your session. Please try signing in.")
          setStatus("error")
          return
        }

        // Get claim token from URL or localStorage
        const token = searchParams.get("token") || localStorage.getItem("claim_token")
        const supplierId = localStorage.getItem("claim_supplier_id")

        if (!token) {
          setError("No claim token found. Please use the original claim link.")
          setStatus("error")
          return
        }

        // Claim the supplier
        const { error: updateError } = await supabase
          .from("suppliers")
          .update({
            auth_user_id: session.user.id,
            claim_token: null,
            claim_token_expires_at: null,
            pending_owner_email: null,
            updated_at: new Date().toISOString(),
          })
          .eq("claim_token", token)

        if (updateError) {
          setError("Failed to claim this venue. It may have already been claimed.")
          setStatus("error")
          return
        }

        // Clear localStorage
        localStorage.removeItem("claim_token")
        localStorage.removeItem("claim_supplier_id")

        setStatus("success")

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/suppliers/dashboard?claimed=true")
        }, 2000)
      } catch (err) {
        setError("Something went wrong. Please try again.")
        setStatus("error")
      }
    }

    handleVerification()
  }, [router, searchParams])

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying and claiming your venue...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Claim Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/suppliers/onboarding/auth/signin"
            className="inline-block bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Venue Claimed!</h1>
        <p className="text-gray-600">
          Your venue page is now yours. Redirecting to your dashboard...
        </p>
      </div>
    </div>
  )
}
