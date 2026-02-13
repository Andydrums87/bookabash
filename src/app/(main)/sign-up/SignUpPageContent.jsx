"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { getBaseUrl } from "@/utils/env"
import { processReferralSignup } from "@/utils/referralUtils"
import { linkEmail } from "@/utils/partyTracking"

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
    setError("")
    setFieldErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validatePassword = (pwd) => {
    if (!pwd || !pwd.trim()) return "Password is required"
    if (/^\s+$/.test(pwd)) return "Password cannot contain only spaces"
    if (pwd.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(pwd)) return "Must contain uppercase letter"
    if (!/[a-z]/.test(pwd)) return "Must contain lowercase letter"
    if (!/[0-9]/.test(pwd)) return "Must contain a number"
    return null
  }

  const validateForm = () => {
    const newFieldErrors = {}
    let hasError = false

    const trimmedFirstName = formData.firstName.trim()
    const trimmedLastName = formData.lastName.trim()

    if (!trimmedFirstName) {
      newFieldErrors.firstName = "Required"
      hasError = true
    } else if (/^\d+$/.test(trimmedFirstName)) {
      newFieldErrors.firstName = "Invalid name"
      hasError = true
    }
    if (!trimmedLastName) {
      newFieldErrors.lastName = "Required"
      hasError = true
    } else if (/^\d+$/.test(trimmedLastName)) {
      newFieldErrors.lastName = "Invalid name"
      hasError = true
    }
    const trimmedEmail = formData.email.trim()
    if (!trimmedEmail) {
      newFieldErrors.email = "Required"
      hasError = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newFieldErrors.email = "Invalid email"
      hasError = true
    }
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newFieldErrors.password = passwordError
      hasError = true
    }
    if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
      newFieldErrors.confirmPassword = "Required"
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

      const userResult = await partyDatabaseBackend.createOrGetUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: '',
        postcode: ''
      })

      if (!userResult.success) {
        throw new Error('Failed to create customer profile')
      }

      const referralResult = await processReferralSignup(user.id)
      if (referralResult.referralRecorded) {
        console.log("Referral recorded!")
      }

      await linkEmail(formData.email)

      if (authData.user && !authData.session) {
        setSuccess("Account created! Please check your email to verify your account.")
      } else {
        if (returnTo) {
          window.location.href = decodeURIComponent(returnTo)
        } else {
          router.push("/dashboard")
        }
      }

    } catch (err) {
      console.error("Sign-up error:", err)
      if (err.message.includes('already registered')) {
        setError("An account with this email already exists.")
      } else {
        setError(err.message || "Failed to create account.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider) => {
    setError("")
    setOauthLoading(provider)

    try {
      let redirectUrl = `${getBaseUrl()}/auth/callback/customer`
      if (returnTo) {
        redirectUrl += `?return_to=${encodeURIComponent(returnTo)}`
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: { access_type: 'offline' }
        }
      })

      if (error) {
        setError(`Failed to sign up with ${provider}.`)
        setOauthLoading(null)
      }

    } catch (err) {
      setError(`Failed to sign up with ${provider}.`)
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
            Party planning,<br />made simple.
          </h1>

          <p className="text-sm text-white/90 max-w-md">
            Create unforgettable celebrations for your children with trusted local suppliers.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-8 lg:py-0">
        <div className="w-full max-w-md px-6 sm:px-12">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 mt-1">Start planning your perfect party today</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2 mb-4">
            <Button
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-gray-700 text-base"
              disabled={isLoading || oauthLoading}
              onClick={() => handleOAuthSignUp("google")}
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
              onClick={() => handleOAuthSignUp("apple")}
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
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={isLoading || oauthLoading}
                  className={`mt-1 h-11 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={isLoading || oauthLoading}
                  className={`mt-1 h-11 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading || oauthLoading}
                className={`mt-1 h-11 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading || oauthLoading}
                  className={`h-11 pr-10 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { test: formData.password.length >= 8, label: "8+ chars" },
                    { test: /[A-Z]/.test(formData.password), label: "A-Z" },
                    { test: /[a-z]/.test(formData.password), label: "a-z" },
                    { test: /[0-9]/.test(formData.password), label: "0-9" },
                  ].map((req, i) => (
                    <span key={i} className={`text-xs flex items-center gap-1 ${req.test ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className={`h-3 w-3 ${req.test ? '' : 'opacity-0'}`} />
                      {req.label}
                    </span>
                  ))}
                </div>
              )}
              {fieldErrors.password && !formData.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading || oauthLoading}
                  className={`h-11 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
