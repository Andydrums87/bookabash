"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn, UserPlus, Loader2, Sparkles, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { useToast } from "@/components/ui/toast"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"

export default function AuthModal({ isOpen, onClose, onSuccess, returnTo, selectedSuppliersCount = 0 }) {
  const [isSignUp, setIsSignUp] = useState(true)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState(false)
  const [isSuccessComplete, setIsSuccessComplete] = useState(false)
  const { toast } = useToast()
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
    setShowSuccessAnimation(false)
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
          setIsSuccessComplete(true)
          
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
          // Auto sign-in successful
          console.log("✅ Account created and signed in automatically")
          setSuccess("🎉 Account created and signed in successfully!")
          setIsSuccessComplete(true)
          
          toast.success(`Welcome ${formData.firstName}! Your account is ready.`, {
            title: "Account Created Successfully",
            duration: 4000
          })
          
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

        setShowSuccessAnimation(true)
        setSuccess("🎉 Welcome back! Signing you in...")
        setIsSuccessComplete(true)

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
      setShowSuccessAnimation(false)
      setIsSuccessComplete(false)
      
      if (err.message.includes("already registered")) {
        setError("An account with this email already exists. Try signing in instead.")
        setIsSignUp(false)
        
        toast.info("Account already exists. Please sign in instead.", {
          title: "Account Found",
          duration: 4000
        })
        
      } else {
        const errorMessage = err.message || `${isSignUp ? "Sign-up" : "Sign-in"} failed. Please try again.`
        setError(errorMessage)
        
        toast.error(errorMessage, {
          title: isSignUp ? "Sign-up Failed" : "Sign-in Failed",
          duration: 5000
        })
      }
    } finally {
      if (!success) {
        setLoading(false)
      } else {
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
  
      // Use current origin to ensure we stay on localhost during development
      const currentOrigin = window.location.origin
      let redirectUrl = `${currentOrigin}/auth/callback/customer?user_type=customer`
      
      // Check if we're coming from party planning context
      const isFromReviewBook = returnTo && returnTo.includes('/review-book')
      const isPartyPlanningContext = window.location.pathname === '/review-book' || isFromReviewBook
      
      if (isPartyPlanningContext) {
        // Always preserve party context when coming from review-book
        redirectUrl += `&preserve_party=true`
        redirectUrl += `&context=review_book`
      }
      
      if (returnTo) {
        redirectUrl += `&return_to=${encodeURIComponent(returnTo)}`
      }
  
      console.log("🔗 OAuth redirect URL:", redirectUrl)
      console.log("🏠 Current origin:", currentOrigin)
      console.log("🎉 Party context:", isPartyPlanningContext)
  
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
        throw error
      }
  
      // OAuth redirect will happen automatically, no need to handle success here
  
    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      
      let errorMessage
      if (err.message.includes('popup')) {
        errorMessage = "Please allow popups and try again, or use email sign-in instead."
      } else if (err.message.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again."
      } else {
        errorMessage = `Failed to ${isSignUp ? "sign up" : "sign in"} with ${provider}. Please try again.`
      }
      
      setError(errorMessage)
      setOauthLoading(null)
      
      if (toast) {
        toast.error(errorMessage, {
          title: `${provider} Authentication Failed`,
          duration: 4000
        })
      }
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setSuccess("")
    setShowSuccessAnimation(false)
    setIsEmailVerificationRequired(false)
    setIsSuccessComplete(false)
    // Keep email but clear other fields
    setFormData((prev) => ({
      firstName: "",
      lastName: "",
      email: prev.email,
      password: "",
      confirmPassword: "",
    }))
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      theme="fun"
      showCloseButton={true}
      className="relative"
    >
      {/* Success Animation Overlay */}
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

      {/* Header */}
      <ModalHeader 
        title={isSignUp ? "Create Account" : "Welcome Back"}
        subtitle={isSignUp ? "Join the party planning fun!" : "Ready to continue planning?"}
        theme="fun"
        icon={isSignUp ? <UserPlus className="w-5 h-5 text-white" /> : <LogIn className="w-5 h-5 text-white" />}
      />

      {/* Content */}
      <ModalContent>
        <div className="space-y-4">
          {/* Name fields for sign up */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={loading || oauthLoading}
                  className="h-11"
                  required={isSignUp}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={loading || oauthLoading}
                  className="h-11"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading || oauthLoading}
              className="h-11"
              required
            />
          </div>

          {/* Password fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
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
                  className="h-11 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || oauthLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
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
                    className="h-11 pr-10"
                    required={isSignUp}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading || oauthLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Error Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              {error.includes("Account not found") && (
                <button
                  onClick={switchMode}
                  className="text-sm text-red-700 hover:text-red-900 underline mt-1 font-medium"
                  disabled={loading || oauthLoading}
                >
                  Click here to create a new account
                </button>
              )}
            </div>
          )}

          {/* Success Messages */}
          {success && !showSuccessAnimation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-600 font-medium">{success}</p>
                  {isEmailVerificationRequired && (
                    <p className="text-xs text-green-600 mt-1">
                      Switching to sign-in mode in a moment...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleEmailAuth}
            className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold"
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
              variant="outline"
              onClick={() => handleOAuthAuth("google")}
              disabled={loading || oauthLoading}
              className="h-11 border-gray-300"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Google
            </Button>

            <Button
              variant="outline"
              onClick={() => handleOAuthAuth("facebook")}
              disabled={loading || oauthLoading}
              className="h-11 border-gray-300"
            >
              {oauthLoading === "facebook" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2" />
                </svg>
              )}
              Facebook
            </Button>
          </div>
        </div>
      </ModalContent>

      {/* Footer */}
    
        <div className="text-center text-sm text-gray-600 pb-2">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={switchMode}
            className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            disabled={loading || oauthLoading}
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </div>

    </UniversalModal>
  )
}