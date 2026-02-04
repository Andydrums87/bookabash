"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Building2, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function ClaimSupplierPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token

  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    agreeTerms: false,
  })

  useEffect(() => {
    async function fetchSupplier() {
      if (!token) {
        return
      }

      try {
        console.log("Fetching supplier with token:", token)
        const { data, error } = await supabase
          .from("suppliers")
          .select("id, business_name, data, claim_token_expires_at, pending_owner_email")
          .eq("claim_token", token)
          .single()

        console.log("Supplier query result:", { data, error })

        if (error || !data) {
          setError("This claim link is invalid or has already been used.")
          setLoading(false)
          return
        }

        // Check if token expired
        if (data.claim_token_expires_at && new Date(data.claim_token_expires_at) < new Date()) {
          setError("This claim link has expired. Please contact support for a new link.")
          setLoading(false)
          return
        }

        setSupplier(data)
        // Pre-fill email if we have it
        if (data.pending_owner_email) {
          setFormData(prev => ({ ...prev, email: data.pending_owner_email }))
        }
      } catch (err) {
        setError("Something went wrong. Please try again.")
      }
      setLoading(false)
    }

    if (token) {
      fetchSupplier()
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setSubmitting(true)

    try {
      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: "supplier",
            full_name: formData.fullName,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/suppliers/claim/verify?token=${token}`,
        },
      })

      if (authError) {
        // Check if user already exists
        if (authError.message.includes("already registered")) {
          setError("An account with this email already exists. Please sign in instead.")
        } else {
          setError(authError.message)
        }
        setSubmitting(false)
        return
      }

      // 2. If email confirmation is disabled, claim immediately
      if (authData.user && authData.session) {
        await claimSupplier(authData.user.id)
      } else if (authData.user && !authData.session) {
        // Email confirmation required - store token for after verification
        localStorage.setItem("claim_token", token)
        localStorage.setItem("claim_supplier_id", supplier.id)
        setSuccess(true)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  const claimSupplier = async (userId) => {
    // Use API endpoint to bypass RLS
    const response = await fetch('/api/suppliers/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error || "Failed to claim this venue. Please contact support.")
      setSubmitting(false)
      return
    }

    // Sign out the user - they need to sign in via the business portal
    await supabase.auth.signOut()

    // Show success state
    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error && !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const businessName = supplier?.business_name || supplier?.data?.businessName || "Your Venue"

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h1>
          <p className="text-gray-600 mb-6">
            You&apos;ve successfully claimed <strong>{businessName}</strong>.
            Your venue page is now ready for you to manage.
          </p>
          <a
            href="/suppliers/onboarding/auth/signin"
            className="inline-block w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 text-center"
          >
            Sign In to Your Dashboard
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Use <strong>{formData.email}</strong> and the password you just created.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Claim Your Venue</h1>
            <p className="text-gray-600 mt-2">
              Create an account to manage <strong>{businessName}</strong> on PartySnap
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="you@venue.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="07xxx xxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 pr-10"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1 h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="/terms" className="text-violet-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-violet-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Claim Your Venue"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/suppliers/onboarding/auth/signin" className="text-violet-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
