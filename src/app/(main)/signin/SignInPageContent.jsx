"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Building } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { getBaseUrl } from '@/utils/env'
import { linkEmail } from "@/utils/partyTracking"

export default function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [businessAccountWarning, setBusinessAccountWarning] = useState(false)
  const [supplierBlockedWarning, setSupplierBlockedWarning] = useState(false)

  // Get URL parameters
  const returnTo = searchParams.get('return_to')
  const prefilledEmail = searchParams.get('email')
  const fromBusinessBlock = searchParams.get('business_account')
  const supplierBlocked = searchParams.get('supplier_blocked')

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }
    if (fromBusinessBlock === 'true') {
      setBusinessAccountWarning(true)
    }
    if (supplierBlocked === 'true') {
      setSupplierBlockedWarning(true)
    }
  }, [prefilledEmail, fromBusinessBlock, supplierBlocked])

  // Check if user has a business account
  const checkIfBusinessAccount = async (userId) => {
    try {
      const { data: supplierData, error } = await supabase
        .from("suppliers")
        .select("id, business_name")
        .eq("auth_user_id", userId)
        .eq("is_primary", true)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking for business account:", error)
        return false
      }

      return !!supplierData
    } catch (err) {
      console.error("Error in checkIfBusinessAccount:", err)
      return false
    }
  }

  // Handle email/password sign in
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Sign in user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      const user = authData.user
      if (!user) throw new Error("No user returned")

      console.log("🔐 User signed in:", user.id)

      // CHECK: Is this a business account?
      const isBusinessAccount = await checkIfBusinessAccount(user.id)

      if (isBusinessAccount) {
        console.log("🚫 Business account detected, blocking user sign-in")

        // Sign out the user
        await supabase.auth.signOut()

        // Redirect to business sign-in with their email
        router.push(`/suppliers/onboarding/auth/signin?email=${encodeURIComponent(email)}&blocked=true`)
        return
      }

      console.log("✅ User account verified, creating customer profile...")

      // Create or get customer profile
      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: user.user_metadata?.full_name?.split(' ')[1] || '',
        email: user.email,
        phone: user.user_metadata?.phone || '',
        postcode: ''
      })

      if (!userResult.success) {
        console.error('❌ Failed to create customer profile:', userResult.error)
        throw new Error('Failed to create customer account')
      }

      console.log("✅ Customer profile ready:", userResult.user.id)

      // Link email to party tracking session (for CRM)
      await linkEmail(email)

      // Redirect back to where they came from or dashboard
      if (returnTo) {
        window.location.href = decodeURIComponent(returnTo)
      } else {
        router.push("/dashboard")
      }

    } catch (err) {
      console.error("❌ Sign-in error:", err)
      setError(err.message || "Sign-in failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider) => {
    setError("")
    setOauthLoading(provider)

    try {
      console.log(`🔐 Starting ${provider} OAuth customer sign-in...`)

      // Direct to customer callback
      let redirectUrl = `${getBaseUrl()}/auth/callback/customer`

      if (returnTo) {
        redirectUrl += `?return_to=${encodeURIComponent(returnTo)}`
      }

      console.log('🎯 Customer OAuth redirect URL:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline'
          }
        }
      })

      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error)
        setError(`Failed to sign in with ${provider}. Please try again.`)
        setOauthLoading(null)
      }

    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      setError(`Failed to sign in with ${provider}. Please try again.`)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Left Panel - Branding with Hero Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 relative overflow-hidden">
        {/* Hero Image */}
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752832989/iStock-1149320278_srn8ti-removebg_efzwtu.png"
            alt="People celebrating at a party"
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-500/95 via-primary-500/50 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-end px-8 xl:px-12 pb-8 text-white h-full">
          <h1 className="text-3xl xl:text-4xl font-bold mb-2 leading-tight">
            Welcome back<br />to PartySnap.
          </h1>

          <p className="text-sm text-white/90 max-w-md">
            Sign in to continue planning your perfect party and manage your bookings.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-8 lg:py-0">
        <div className="w-full max-w-md px-6 sm:px-12">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="text-gray-500 mt-1">Continue planning your perfect party</p>
          </div>

          {/* Business Account Warning */}
          {businessAccountWarning && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <Building className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-1">
                    Business Account Detected
                  </h3>
                  <p className="text-sm text-amber-700">
                    This email is registered as a business account. Please use the
                    business sign-in page to access your supplier dashboard.
                  </p>
                  <Link
                    href={`/suppliers/signin?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                  >
                    Go to Business Sign-In →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-gray-700 text-base"
              disabled={isLoading || oauthLoading}
              onClick={() => handleOAuthSignIn("google")}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
              ) : (
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-gray-700 text-base"
              disabled={isLoading || oauthLoading}
              onClick={() => handleOAuthSignIn("apple")}
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
              ) : (
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000"/>
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || oauthLoading}
                className="mt-1 h-11 border-gray-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className={`text-sm text-primary-600 hover:text-primary-700 ${isLoading || oauthLoading ? "pointer-events-none opacity-50" : ""}`}
                  aria-disabled={isLoading || oauthLoading}
                  tabIndex={isLoading || oauthLoading ? -1 : undefined}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || oauthLoading}
                  className="h-11 pr-10 border-gray-300"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading || oauthLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white text-base font-semibold rounded-lg"
              disabled={isLoading || oauthLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
