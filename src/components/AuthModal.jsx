"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn, UserPlus, Loader2, X, Sparkles, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { useToast } from "@/components/ui/toast"

export default function AuthModal({ isOpen, onClose, onSuccess, returnTo, selectedSuppliersCount = 0 }) {
  const [isSignUp, setIsSignUp] = useState(true) // Default to sign-up since it's for new customers
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false) // NEW: For success animation
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState(false) // NEW: Track if email verification needed
  const [isSuccessComplete, setIsSuccessComplete] = useState(false) // NEW: Track when success phase is complete
  const { toast } = useToast() // Add toast hook
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const validateSignUp = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return false
    }
    return true
  }

  const handleEmailAuth = async () => {
    setError("")
    setSuccess("")
    setShowSuccessAnimation(false) // Reset animation
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign Up Flow
        if (!validateSignUp()) {
          setLoading(false)
          return
        }

        console.log("📝 Creating new customer account...")
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              user_type: "customer",
              full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            },
          },
        })

        if (signUpError) throw signUpError

        const user = authData.user
        if (!user) throw new Error("No user created")

        console.log("✅ New customer account created:", user.id)

        // Create customer profile
        const userResult = await partyDatabaseBackend.createOrGetUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: "",
          postcode: "",
        })

        if (!userResult.success) {
          console.error("❌ Failed to create customer profile:", userResult.error)
          throw new Error("Failed to create customer profile")
        }

        console.log("✅ Customer profile created:", userResult.user.id)

        // Show success animation
        setShowSuccessAnimation(true)

        // Check if email confirmation is required
        if (authData.user && !authData.session) {
          // Email verification required
          setIsEmailVerificationRequired(true)
          setSuccess("🎉 Account created successfully! Please check your email to verify your account, then sign in below.")
          setIsSuccessComplete(true) // Mark success as complete
          
          // Show toast notification
          toast.success("Account created! Check your email to verify.", {
            title: "Welcome to PartySnap!",
            duration: 5000
          })
          
          // Auto-switch to sign-in mode after showing success
          setTimeout(() => {
            setIsSignUp(false)
            setShowSuccessAnimation(false)
          }, 3000)
          
        } else {
          // Auto sign-in successful - call onSuccess callback with user data
          console.log("✅ Account created and signed in automatically")
          setSuccess("🎉 Account created and signed in successfully!")
          setIsSuccessComplete(true) // Mark success as complete
          
          // Show success toast
          toast.success(`Welcome ${formData.firstName}! Your account is ready.`, {
            title: "Account Created Successfully",
            duration: 4000
          })
          
          // Wait a moment to show success, then call onSuccess
          setTimeout(() => {
            onSuccess(user, {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: user.user_metadata?.phone || "",
            })
          }, 1500)
        }
        
      } else {
        // Sign In Flow
        console.log("🔐 Signing in existing user...")
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (authError) {
          // If user doesn't exist, suggest sign-up
          if (
            authError.message.includes("Invalid login credentials") ||
            authError.message.includes("Email not confirmed") ||
            authError.message.includes("User not found")
          ) {
            setError("Account not found with these credentials. Would you like to create a new account instead?")
            return
          }
          throw authError
        }

        const user = authData.user
        if (!user) throw new Error("No user returned")

        console.log("🔐 Signed in user:", user.id)

        // Show success animation
        setShowSuccessAnimation(true)
        setSuccess("🎉 Welcome back! Signing you in...")
        setIsSuccessComplete(true) // Mark success as complete

        // Show welcome back toast
        toast.success("Successfully signed in!", {
          title: "Welcome Back",
          duration: 3000
        })

        // Create or get customer profile
        const userResult = await partyDatabaseBackend.createOrGetUser({
          firstName: user.user_metadata?.full_name?.split(" ")[0] || "",
          lastName: user.user_metadata?.full_name?.split(" ")[1] || "",
          email: user.email,
          phone: user.user_metadata?.phone || "",
          postcode: "",
        })

        if (!userResult.success) {
          console.error("❌ Failed to create customer profile:", userResult.error)
          throw new Error("Failed to create customer account")
        }

        console.log("✅ Customer profile ready:", userResult.user.id)

        // Wait a moment to show success, then call onSuccess
        setTimeout(() => {
          onSuccess(user, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: user.user_metadata?.phone || "",
          })
        }, 1500)
      }
    } catch (err) {
      console.error("❌ Auth error:", err)
      setShowSuccessAnimation(false) // Hide animation on error
      setIsSuccessComplete(false) // Reset success state on error
      
      if (err.message.includes("already registered")) {
        setError("An account with this email already exists. Try signing in instead.")
        setIsSignUp(false)
        
        // Show informative toast
        toast.info("Account already exists. Please sign in instead.", {
          title: "Account Found",
          duration: 4000
        })
        
      } else {
        const errorMessage = err.message || `${isSignUp ? "Sign-up" : "Sign-in"} failed. Please try again.`
        setError(errorMessage)
        
        // Show error toast
        toast.error(errorMessage, {
          title: isSignUp ? "Sign-up Failed" : "Sign-in Failed",
          duration: 5000
        })
      }
    } finally {
      // Don't set loading to false immediately if we're showing success
      if (!success) {
        setLoading(false)
      } else {
        // Keep loading state for a moment during success animation
        setTimeout(() => {
          setLoading(false)
        }, 1500)
      }
    }
  }

  const handleOAuthAuth = async (provider) => {
    setError("")
    setSuccess("")
    setOauthLoading(provider)

    try {
      console.log(`🔐 Starting ${provider} OAuth ${isSignUp ? "sign-up" : "sign-in"}...`)

      let redirectUrl = `${window.location.origin}/auth/callback?type=${isSignUp ? "signup" : "signin"}`
      if (returnTo) {
        redirectUrl += `&return_to=${encodeURIComponent(returnTo)}`
      }
      redirectUrl += `&user_type=customer`

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
          },
        },
      })

      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error)
        const errorMessage = `Failed to ${isSignUp ? "sign up" : "sign in"} with ${provider}. Please try again.`
        setError(errorMessage)
        setOauthLoading(null)
        
        // Show error toast for OAuth failures
        toast.error(errorMessage, {
          title: `${provider} Authentication Failed`,
          duration: 4000
        })
      }
    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      const errorMessage = `Failed to ${isSignUp ? "sign up" : "sign in"} with ${provider}. Please try again.`
      setError(errorMessage)
      setOauthLoading(null)
      
      // Show error toast for OAuth exceptions
      toast.error(errorMessage, {
        title: `${provider} Error`,
        duration: 4000
      })
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setSuccess("")
    setShowSuccessAnimation(false)
    setIsEmailVerificationRequired(false)
    setIsSuccessComplete(false) // Reset success complete state
    // Keep email but clear other fields
    setFormData((prev) => ({
      firstName: "",
      lastName: "",
      email: prev.email,
      password: "",
      confirmPassword: "",
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] rounded-2xl w-[90%] sm:max-w-md max-h-[70vh] sm:max-h-[90vh] overflow-y-auto border-2 border-[hsl(var(--primary-200))] shadow-2xl relative">
        
        {/* Snappy Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5E6] to-white rounded-2xl z-20 flex flex-col items-center justify-center p-6">
            {/* Snappy Video */}
            <div className="w-32 h-24 mb-4 animate-fade-in-up">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="rounded-xl shadow-lg w-full h-full object-cover"
                poster="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753133136/ra6l3fe9lb45gejgvgms.png"
                onLoadedMetadata={(e) => {
                  e.target.currentTime = 1;
                  e.target.play();
                }}
              >
                <source
                  src="https://res.cloudinary.com/dghzq6xtd/video/upload/v1753083603/wQEAljVs5VrDNI1dyE8t8_output_nowo6h.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

            {/* Success Text */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {isEmailVerificationRequired ? "Account Created!" : isSignUp ? "Account Created!" : "Welcome Back!"}
              </h3>
              <p className="text-gray-600 text-sm">
                {isEmailVerificationRequired 
                  ? "Check your email to verify your account" 
                  : isSignUp 
                    ? "Setting up your party profile..." 
                    : "Getting you signed in..."}
              </p>
            </div>

            {/* Add the animation styles */}
            <style jsx>{`
              @keyframes fade-in-up {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.6s ease-out;
              }
            `}</style>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="absolute top-6 left-6 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-40 animate-pulse"></div>
          <div
            className="absolute top-12 right-8 w-1.5 h-1.5 bg-[hsl(var(--primary-400))] rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <Sparkles className="absolute top-8 right-6 w-3 h-3 text-[hsl(var(--primary-300))] opacity-30" />
        </div>

        <div className="p-5 sm:p-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                {isSignUp ? (
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-xs text-gray-600 hidden sm:block">
                  {isSignUp ? "Join the party planning fun!" : "Ready to continue planning?"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 sm:p-2"
              disabled={loading || oauthLoading}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-2.5 sm:space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm font-semibold text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={loading || oauthLoading}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-1 focus:ring-[hsl(var(--primary-200))] rounded-lg sm:rounded-xl h-9 sm:h-12 text-base transition-all duration-200"
                    required={isSignUp}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm font-semibold text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={loading || oauthLoading}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-1 focus:ring-[hsl(var(--primary-200))] rounded-lg sm:rounded-xl h-9 sm:h-12 text-base transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading || oauthLoading}
                className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-1 focus:ring-[hsl(var(--primary-200))] rounded-lg sm:rounded-xl h-9 sm:h-12 text-base transition-all duration-200"
                required
              />
            </div>

            <div className={`grid ${isSignUp ? "grid-cols-1" : "grid-cols-1"} gap-2 sm:gap-4`}>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={loading || oauthLoading}
                    className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-1 focus:ring-[hsl(var(--primary-200))] rounded-lg sm:rounded-xl h-9 sm:h-12 text-base transition-all duration-200 pr-9"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || oauthLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      disabled={loading || oauthLoading}
                      className="bg-white border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] focus:ring-1 focus:ring-[hsl(var(--primary-200))] rounded-lg sm:rounded-xl h-9 sm:h-12 text-base transition-all duration-200 pr-9"
                      required={isSignUp}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading || oauthLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Messages */}
            {error && (
              <div className="p-2.5 sm:p-3 bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
                {error.includes("Account not found") && (
                  <button
                    onClick={switchMode}
                    className="text-xs sm:text-sm text-red-700 hover:text-red-900 underline mt-1 font-medium"
                    disabled={loading || oauthLoading}
                  >
                    Click here to create a new account
                  </button>
                )}
              </div>
            )}

            {/* Success Messages */}
            {success && !showSuccessAnimation && (
              <div className="p-2.5 sm:p-3 bg-green-50 border-2 border-green-200 rounded-lg sm:rounded-xl">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">{success}</p>
                    {isEmailVerificationRequired && (
                      <p className="text-xs text-green-600 mt-1">
                        Switching to sign-in mode in a moment...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button */}
            <Button
              onClick={handleEmailAuth}
              className="w-full my-5 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white py-2 sm:py-3 text-sm font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || oauthLoading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>
                    {isSuccessComplete 
                      ? (isEmailVerificationRequired ? "Account Created!" : isSignUp ? "Account Created!" : "Signed In!") 
                      : (isSignUp ? "Creating Account..." : "Signing In...")
                    }
                  </span>
                </div>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {isSignUp ? "Create Account" : "Sign In"}
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="my-3 sm:my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[hsl(var(--primary-200))]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 sm:px-3 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-6">
            <Button
              variant="outline"
              onClick={() => handleOAuthAuth("google")}
              disabled={loading || oauthLoading}
              className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg sm:rounded-xl h-9 sm:h-12 text-xs sm:text-sm font-medium transition-all duration-200"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <svg className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Google
            </Button>

            <Button
              variant="outline"
              onClick={() => handleOAuthAuth("facebook")}
              disabled={loading || oauthLoading}
              className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg sm:rounded-xl h-9 sm:h-12 text-xs sm:text-sm font-medium transition-all duration-200"
            >
              {oauthLoading === "facebook" ? (
                <Loader2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <svg className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                    fill="#1877F2"
                  />
                </svg>
              )}
              Facebook
            </Button>
          </div>

          {/* Switch Mode Link */}
          <div className="text-center my-5 text-xs sm:text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={switchMode}
              className="font-bold text-[hsl(var(--primary-600))] hover:text-[hsl(var(--primary-700))] hover:underline transition-colors duration-200"
              disabled={loading || oauthLoading}
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}