"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          console.log("✅ Valid password reset session")
          setIsValidSession(true)
        } else {
          console.log("❌ No valid session found")
          setError("Invalid or expired reset link. Please request a new password reset.")
        }
      } catch (err) {
        console.error("❌ Session check error:", err)
        setError("Invalid or expired reset link. Please request a new password reset.")
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      console.log("✅ Password reset successful")
      setPasswordReset(true)

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/signin")
      }, 3000)

    } catch (err) {
      console.error("❌ Password reset error:", err)
      setError(err.message || "Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid session
  if (!isValidSession && !checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
        <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
          <Card className="w-full max-w-md shadow-xl border-gray-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                Password reset links expire after 1 hour for security reasons.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full bg-primary-500 hover:bg-[#FF5028] text-white">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/signin" className="w-full">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Success state
  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
        <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
          <Card className="w-full max-w-md shadow-xl border-gray-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Your password has been updated successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">
                You can now sign in with your new password.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Redirecting to sign in page...
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/signin" className="w-full">
                <Button className="w-full bg-primary-500 hover:bg-[#FF5028] text-white">
                  Go to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
      <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary-500 pt-6">
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 text-base pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400 text-base pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Password must contain:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span className={password.length >= 8 ? "text-green-600" : "text-gray-400"}>
                      {password.length >= 8 ? "✓" : "○"}
                    </span>
                    <span className="ml-2">At least 8 characters</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}>
                      {/[A-Z]/.test(password) ? "✓" : "○"}
                    </span>
                    <span className="ml-2">One uppercase letter</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}>
                      {/[a-z]/.test(password) ? "✓" : "○"}
                    </span>
                    <span className="ml-2">One lowercase letter</span>
                  </li>
                  <li className="flex items-center">
                    <span className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-400"}>
                      {/[0-9]/.test(password) ? "✓" : "○"}
                    </span>
                    <span className="ml-2">One number</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-[#FF5028] text-white py-3 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center pt-4 pb-8">
            <Link href="/signin" className="w-full">
              <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                Cancel and go back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
