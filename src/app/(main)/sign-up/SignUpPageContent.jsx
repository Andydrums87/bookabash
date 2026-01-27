// src/app/(main)/sign-up/page.jsx
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, UserPlus, Loader2, LogIn } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { getBaseUrl } from "@/utils/env"
import { processReferralSignup } from "@/utils/referralUtils"

export default function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)

  // Get URL parameters
  const returnTo = searchParams.get('return_to')
  const prefilledEmail = searchParams.get('email')

  useEffect(() => {
    if (prefilledEmail) {
      setFormData(prev => ({ ...prev, email: prefilledEmail }))
    }
  }, [prefilledEmail])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Clear errors when user types
    setFieldErrors(prev => ({ ...prev, [field]: "" })) // Clear field-specific error
  }

  const validatePassword = (pwd) => {
    if (!pwd || !pwd.trim()) {
      return "Password is required"
    }
    if (/^\s+$/.test(pwd)) {
      return "Password cannot contain only spaces"
    }
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

  const validateForm = () => {
    const newFieldErrors = {}
    let hasError = false

    const trimmedFirstName = formData.firstName.trim()
    const trimmedLastName = formData.lastName.trim()

    if (!trimmedFirstName) {
      newFieldErrors.firstName = "First name is required"
      hasError = true
    } else if (/^\d+$/.test(trimmedFirstName)) {
      newFieldErrors.firstName = "First name cannot be only numbers"
      hasError = true
    }
    if (!trimmedLastName) {
      newFieldErrors.lastName = "Last name is required"
      hasError = true
    } else if (/^\d+$/.test(trimmedLastName)) {
      newFieldErrors.lastName = "Last name cannot be only numbers"
      hasError = true
    }
    const trimmedEmail = formData.email.trim()
    if (!trimmedEmail) {
      newFieldErrors.email = "Email is required"
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newFieldErrors.email = "Please enter a valid email address"
      hasError = true
    }
    // Check password - validatePassword handles empty/whitespace checks
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newFieldErrors.password = passwordError
      hasError = true
    }

    // Check confirm password
    if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
      newFieldErrors.confirmPassword = "Please confirm your password"
      hasError = true
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords don't match"
      hasError = true
    }

    setFieldErrors(newFieldErrors)
    return !hasError
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
  
    if (!validateForm()) {
      setIsLoading(false)
      return
    }
  
    try {
      console.log("📝 Creating new customer account...")
      
      // Create new user account with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'customer',
            full_name: `${formData.firstName} ${formData.lastName}`.trim()
          }
        }
      })
  
      if (signUpError) throw signUpError
      
      const user = authData.user
      if (!user) throw new Error("No user created")
  
      console.log("✅ New customer account created:", user.id)
  
      // Create customer profile in your database
      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: '',
        postcode: ''
      })
  
      if (!userResult.success) {
        console.error('❌ Failed to create customer profile:', userResult.error)
        throw new Error('Failed to create customer profile')
      }
  
      console.log("✅ Customer profile created:", userResult.user.id)

      // Process referral if user came via referral link
      const referralResult = await processReferralSignup(user.id)
      if (referralResult.referralRecorded) {
        console.log("🎉 Referral recorded for new user!")
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        setSuccess("Account created! Please check your email to verify your account, then sign in.")
      } else {
        // Auto sign-in successful, redirect
        console.log("✅ Account created and signed in automatically")
        if (returnTo) {
          window.location.href = decodeURIComponent(returnTo)
        } else {
          router.push("/dashboard")
        }
      }
  
    } catch (err) {
      console.error("❌ Sign-up error:", err)
      if (err.message.includes('already registered')) {
        setError("An account with this email already exists. Try signing in instead.")
      } else {
        setError(err.message || "Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OAuth sign up (same as sign-in)
  const handleOAuthSignUp = async (provider) => {
    setError("")
    setOauthLoading(provider)

    try {
      console.log(`🔐 Starting ${provider} OAuth sign-up...`)
      
       // CLEAN: Direct to customer callback
    let redirectUrl = `${getBaseUrl()}/auth/callback/customer`
    if (returnTo) {
      redirectUrl += `?return_to=${encodeURIComponent(returnTo)}`
    }
    
      
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
        setError(`Failed to sign up with ${provider}. Please try again.`)
        setOauthLoading(null)
      }
      
    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      setError(`Failed to sign up with ${provider}. Please try again.`)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
      <div className="flex flex-col items-center justify-start pt-6 sm:pt-12 pb-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-gray-200">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary-500 pt-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Sign up to start planning your perfect party
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-gray-700 text-sm">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={isLoading || oauthLoading}
                    className={`focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-gray-700 text-sm">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={isLoading || oauthLoading}
                    className={`focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isLoading || oauthLoading}
                  className={`focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.email ? 'border-red-500' : ''}`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={isLoading || oauthLoading}
                    className={`focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || oauthLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {/* Password Requirements - Ultra Compact */}
                {formData.password && (
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-md mt-1">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Must have: 8+ chars, A-Z, a-z, 0-9
                    </p>
                    <div className="flex flex-wrap gap-x-3 text-xs text-gray-600">
                      <span className={formData.password.length >= 8 ? "text-green-600" : "text-gray-400"}>
                        {formData.password.length >= 8 ? "✓" : "○"} 8+ chars
                      </span>
                      <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                        {/[A-Z]/.test(formData.password) ? "✓" : "○"} A-Z
                      </span>
                      <span className={/[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                        {/[a-z]/.test(formData.password) ? "✓" : "○"} a-z
                      </span>
                      <span className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                        {/[0-9]/.test(formData.password) ? "✓" : "○"} 0-9
                      </span>
                    </div>
                  </div>
                )}
                {fieldErrors.password && !formData.password && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={isLoading || oauthLoading}
                    className={`focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || oauthLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
              
              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-600">{success}</p>
                </div>
              )}
             <Button
  type="submit"
  className="w-full bg-primary-500 hover:bg-[#FF5028] text-white py-2.5 text-base font-semibold"
  disabled={isLoading || oauthLoading}
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Creating Account...
    </>
  ) : (
    <>
      <UserPlus className="mr-2 h-5 w-5" />
      Create Account
    </>
  )}
</Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2.5 pt-1 pb-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50" 
                disabled={isLoading || oauthLoading}
                onClick={() => handleOAuthSignUp("google")}
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
                onClick={() => handleOAuthSignUp("facebook")}
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

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href={`/signin`}
                className={`font-medium text-primary-600 hover:text-primary-700 hover:underline ${isLoading || oauthLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}