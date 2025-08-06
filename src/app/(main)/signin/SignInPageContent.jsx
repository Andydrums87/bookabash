// Updated Sign-In page with customer account creation
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { getBaseUrl } from '@/utils/env' // Make sure this import is there

export default function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)

  // Get URL parameters
  const returnTo = searchParams.get('return_to')

  const prefilledEmail = searchParams.get('email')

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }
  }, [prefilledEmail])

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

    console.log("🔐 Customer signed in:", user.id)

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
  const handleCustomerFlow = async (user) => {
    try {
      console.log("👤 Handling customer sign-in flow")
      
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

      // Redirect back to where they came from or dashboard
      if (returnTo) {
        window.location.href = decodeURIComponent(returnTo)
      } else {
        router.push("/review-book")
      }

    } catch (error) {
      console.error('❌ Customer flow error:', error)
      throw error
    }
  }

  const handleSupplierFlow = async (user) => {
    try {
      console.log("🏢 Handling supplier sign-in flow")
      
      // Check for primary supplier record
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("auth_user_id", user.id)
        .eq("is_primary", true)
        .maybeSingle()

      if (supplierError && supplierError.code !== 'PGRST116') {
        console.error("❌ Error checking supplier:", supplierError)
        throw new Error("Database error occurred")
      }

      if (supplierData) {
        console.log("✅ Supplier profile exists:", supplierData.business_name)
        router.push("/suppliers/dashboard")
        return
      }

      // Check for onboarding draft
      const { data: draft, error: draftError } = await supabase
        .from("onboarding_drafts")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (draft) {
        console.log("📥 Found onboarding draft, creating supplier profile...")
        await createSupplierFromDraft(user, draft)
        router.push("/suppliers/dashboard")
        return
      }

      // No supplier record or draft - redirect to onboarding
      console.log("⚠️ No supplier record found, redirecting to onboarding")
      router.push("/suppliers/onboarding")

    } catch (error) {
      console.error('❌ Supplier flow error:', error)
      throw error
    }
  }



  const handleOAuthSignIn = async (provider) => {
    setError("")
    setOauthLoading(provider)
  
    try {
      console.log(`🔐 Starting ${provider} OAuth customer sign-in...`)
      
      // CLEAN: Direct to customer callback
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

  // // Helper function to create supplier from draft
  // const createSupplierFromDraft = async (user, draft) => {
  //   const supplierData = {
  //     name: draft.business_name,
  //     businessName: draft.business_name,
  //     serviceType: draft.supplier_type,
  //     category: draft.supplier_type,
  //     location: draft.postcode,
  //     owner: {
  //       name: draft.your_name || user.user_metadata?.full_name,
  //       email: user.email,
  //       phone: draft.phone || user.user_metadata?.phone || ""
  //     },
  //     contactInfo: {
  //       email: user.email,
  //       phone: draft.phone || user.user_metadata?.phone || "",
  //       postcode: draft.postcode
  //     },
  //     description: "New supplier - profile setup in progress",
  //     businessDescription: "New supplier - profile setup in progress",
  //     packages: [],
  //     portfolioImages: [],
  //     portfolioVideos: [],
  //     workingHours: {
  //       Monday: { start: "09:00", end: "17:00", active: true },
  //       Tuesday: { start: "09:00", end: "17:00", active: true },
  //       Wednesday: { start: "09:00", end: "17:00", active: true },
  //       Thursday: { start: "09:00", end: "17:00", active: true },
  //       Friday: { start: "09:00", end: "17:00", active: true },
  //       Saturday: { start: "10:00", end: "16:00", active: true },
  //       Sunday: { start: "10:00", end: "16:00", active: false }
  //     },
  //     unavailableDates: [],
  //     busyDates: [],
  //     rating: 0,
  //     reviewCount: 0,
  //     bookingCount: 0,
  //     priceFrom: 0,
  //     priceUnit: "per event",
  //     badges: ["New Provider"],
  //     themes: ["general"],
  //     availability: "Contact for availability",
  //     isComplete: "New supplier - profile setup in progress",
  //     coverPhoto: "",
  //     image: "",
  //     advanceBookingDays: 7,
  //     maxBookingDays: 365,
  //     availabilityNotes: "",
  //     serviceDetails: {},
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //     onboardingCompleted: true,
  //     createdFrom: "draft_promotion"
  //   }

  //   const supplierRecord = {
  //     auth_user_id: user.id,
  //     data: supplierData,
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString()
  //   }

  //   const { error: insertError } = await supabase
  //     .from("suppliers")
  //     .insert(supplierRecord)

  //   if (insertError) {
  //     console.error("❌ Failed to create supplier:", insertError)
  //     throw new Error("Failed to create supplier profile. Please contact support.")
  //   }

  //   // Clean up draft
  //   await supabase
  //     .from("onboarding_drafts")
  //     .delete()
  //     .eq("email", user.email)

  //   console.log("✅ Supplier profile created from draft")
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
      <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary-500 pt-10">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
            Sign in to continue planning your perfect party
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || oauthLoading}
                  className="focus:ring-primary-500 focus:border-primary-500 text-xs placeholder:text-xs placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className={`text-sm text-primary-600 hover:text-primary-700 hover:underline  ${isLoading || oauthLoading ? "pointer-events-none opacity-50" : ""}`}
                    aria-disabled={isLoading || oauthLoading}
                    tabIndex={isLoading || oauthLoading ? -1 : undefined}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || oauthLoading}
                    className="focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading || oauthLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-[#FF5028] text-white py-3 text-base font-semibold"
                disabled={isLoading || oauthLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4 pt-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50" 
                disabled={isLoading || oauthLoading}
                onClick={() => handleOAuthSignIn("google")}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50" 
                disabled={isLoading || oauthLoading}
                onClick={() => handleOAuthSignIn("facebook")}
              >
                {oauthLoading === "facebook" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/>
                  </svg>
                )}
                Facebook
              </Button>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600 pb-10">
              Don&apos;t have an account?{" "}
              <Link
                href={'/sign-up'}
                className={`font-medium text-primary-600 hover:text-primary-700 hover:underline ${isLoading || oauthLoading ? "pointer-events-none opacity-50" : ""}`}
                aria-disabled={isLoading || oauthLoading}
                tabIndex={isLoading || oauthLoading ? -1 : undefined}
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}