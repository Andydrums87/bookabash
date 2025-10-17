"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getBaseUrl } from "@/utils/env"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Send password reset email
      // Use window.location.origin in production to get correct domain
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : `${getBaseUrl()}/reset-password`

      console.log('🔐 Password reset redirect URL:', redirectUrl)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      console.log("✅ Password reset email sent to:", email)
      setEmailSent(true)

    } catch (err) {
      console.error("❌ Password reset error:", err)
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
        <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
          <Card className="w-full max-w-md shadow-xl border-gray-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                We've sent password reset instructions to
              </CardDescription>
              <p className="text-sm font-semibold text-primary-600 mt-1">
                {email}
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-sm text-blue-900">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Enter your new password</li>
                </ol>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                The link will expire in 1 hour for security reasons.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                }}
                variant="outline"
                className="w-full"
              >
                Send to a different email
              </Button>
              <Link href="/signin" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50">
      <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary-500 pt-6">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              No worries! Enter your email and we'll send you reset instructions.
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
                  disabled={isLoading}
                  className="focus:ring-primary-500 focus:border-primary-500 text-base placeholder:text-sm placeholder:text-gray-400"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the email address associated with your account
                </p>
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
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3 pt-4 pb-8">
            <Link href="/signin" className="w-full">
              <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
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
