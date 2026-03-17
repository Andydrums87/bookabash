"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, UserPlus, Loader2, Sparkles, CheckCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  // Get params from URL
  const returnTo = searchParams.get('returnTo') || '/dashboard'
  const defaultEmail = searchParams.get('email') || ''
  const defaultPhone = searchParams.get('phone') || ''
  const defaultName = searchParams.get('name') || ''
  const context = searchParams.get('context') // 'payment' means they're in checkout flow

  const [formData, setFormData] = useState({
    firstName: defaultName.split(" ")[0] || "",
    lastName: defaultName.split(" ").slice(1).join(" ") || "",
    email: defaultEmail,
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validation
      if (!formData.firstName.trim() || !formData.email.trim() || !formData.password.trim()) {
        throw new Error("Please fill in all required fields")
      }

      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        throw new Error(passwordError)
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      console.log("🔐 Starting customer sign-up...")

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            user_type: "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback/customer`,
        },
      })

      if (authError) throw authError

      const user = authData.user
      if (!user) throw new Error("No user created")

      console.log("✅ New customer account created:", user.id)

      // Create customer profile
      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: defaultPhone || "",
        postcode: "",
      })

      if (!userResult.success) {
        console.error("❌ Failed to create customer profile:", userResult.error)
        throw new Error("Failed to create customer profile")
      }

      console.log("✅ Customer profile created:", userResult.user.id)

      // Redirect based on context
      if (context === 'payment' && returnTo) {
        // Trigger party migration and redirect to payment
        const partyPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
        const supplierCount = Object.values(partyPlan).filter(supplier =>
          supplier && typeof supplier === 'object' && supplier.name
        ).length

        // The payment page will handle the migration
        const paymentUrl = `${returnTo}?party_id=migrate&suppliers=${supplierCount}`
        router.push(paymentUrl)
      } else {
        router.push(returnTo)
      }

    } catch (err) {
      console.error("❌ Signup error:", err)

      if (err.message.includes("already registered")) {
        setError("An account with this email already exists. Try signing in instead.")
      } else {
        const errorMessage = err.message || "Sign-up failed. Please try again."
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  const handleOAuthSignup = async (provider) => {
    try {
      console.log(`🔐 Starting ${provider} OAuth sign-up...`)

      const currentOrigin = window.location.origin

      // Store return path and context for after OAuth
      localStorage.setItem('oauth_return_to', returnTo)
      if (context === 'payment') {
        localStorage.setItem('oauth_preserve_party', 'true')
        localStorage.setItem('oauth_context', 'payment')
      }

      const redirectUrl = `${currentOrigin}/auth/callback/customer?user_type=customer`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      setError(`Failed to sign in with ${provider}. Please try again.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Back button */}
        <Link
          href="/review-book"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to review
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Desktop Two-Column Layout */}
          <div className="md:grid md:grid-cols-[1fr,380px]">

            {/* Left Column: Form */}
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">
                  {context === 'payment'
                    ? "Almost there! Create your account to complete your booking"
                    : "Get access to your dashboard, RSVP tracking, supplier messaging & more"}
                </p>
              </div>

              {/* Mobile Benefits - Only show on mobile */}
              <div className="md:hidden mb-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <h3 className="text-sm font-bold text-gray-900">What you'll get:</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700">Dashboard access & party management</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700">RSVP tracking & guest lists</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700">Direct supplier messaging</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={loading}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={loading}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      disabled={loading}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      disabled={loading}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 font-bold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    context === 'payment' ? 'Create Account & Continue to Payment' : 'Create Account'
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignup("google")}
                    disabled={loading}
                    className="border-gray-300"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignup("facebook")}
                    disabled={loading}
                    className="border-gray-300"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2" />
                    </svg>
                    Facebook
                  </Button>
                </div>

                {/* Sign in link */}
                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign in
                  </Link>
                </div>
              </form>
            </div>

            {/* Right Column: Benefits (Desktop Only) */}
            <div className="hidden md:block bg-gradient-to-br from-primary-500 to-primary-600 p-12 text-white">
              <div className="h-full flex flex-col justify-center">
                <Sparkles className="w-12 h-12 mb-6" />
                <h2 className="text-2xl font-black mb-6">What you'll get with your account</h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">Party Dashboard</h3>
                      <p className="text-sm text-primary-50">Access your personalized dashboard to manage everything in one place</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">RSVP Tracking</h3>
                      <p className="text-sm text-primary-50">Track RSVPs and manage your guest list effortlessly</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">Direct Messaging</h3>
                      <p className="text-sm text-primary-50">Message suppliers directly about your booking details</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">Party Timeline</h3>
                      <p className="text-sm text-primary-50">View booking confirmations and your complete party timeline</p>
                    </div>
                  </div>
                </div>

                {context === 'payment' && (
                  <div className="mt-8 pt-8 border-t border-primary-400">
                    <p className="text-sm text-primary-50">
                      After creating your account, you'll be redirected to complete your payment securely.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
