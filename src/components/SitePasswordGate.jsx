"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"

const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || "partysnap2025"
const PASSWORD_COOKIE_NAME = "site_access_granted"

export default function SitePasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if we're in production and if password protection is enabled
  const isProduction = process.env.NODE_ENV === "production"
  const isPasswordProtectionEnabled = process.env.NEXT_PUBLIC_ENABLE_PASSWORD_GATE === "true"

  useEffect(() => {
    // If not in production or password protection disabled, bypass
    if (!isProduction || !isPasswordProtectionEnabled) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // Check if user already authenticated (cookie check)
    const hasAccess = document.cookie.includes(`${PASSWORD_COOKIE_NAME}=true`)
    if (hasAccess) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [isProduction, isPasswordProtectionEnabled])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === SITE_PASSWORD) {
      // Set cookie that expires in 7 days
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      document.cookie = `${PASSWORD_COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`

      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }

    setIsSubmitting(false)
  }

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // If authenticated or not in production mode, show the actual site
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show password gate
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-gray-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Site Access Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            This site is currently in private testing mode. Please enter the password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter site password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  disabled={isSubmitting}
                  className="pr-10 h-12 text-base"
                  autoFocus
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Access Site
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Team Members:</strong> If you don't have the password, please contact the site administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
