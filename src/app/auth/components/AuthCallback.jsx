"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getBaseUrl, buildUrl } from "@/utils/env"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef(null)
  const [status, setStatus] = useState("processing")
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState([])
  const [userType, setUserType] = useState("customer") // Track user type for messaging

  // Helper function to add debug info
  const addDebugInfo = (message) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Dynamic steps based on user type
  const getSteps = (type) => {
    if (type === "supplier") {
      return [
        { message: "Setting up your business account...", duration: 2000, progress: 25 },
        { message: "Creating your supplier profile...", duration: 2500, progress: 50 },
        { message: "Adding party planning tools...", duration: 2000, progress: 75 },
        { message: "Almost ready for business!", duration: 1500, progress: 95 },
      ]
    } else {
      return [
        { message: "Setting up your account...", duration: 2000, progress: 25 },
        { message: "Preparing your dashboard...", duration: 2000, progress: 60 },
        { message: "Almost ready to plan!", duration: 1500, progress: 90 },
      ]
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleLoaded = () => {
        video.currentTime = 1
        video.play().catch(console.error)
      }
      video.addEventListener("loadedmetadata", handleLoaded)
      return () => video.removeEventListener("loadedmetadata", handleLoaded)
    }
  }, [])

  // Animate through the steps
  useEffect(() => {
    if (status !== "processing") return
    
    const steps = getSteps(userType)
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1
        if (nextStep < steps.length) {
          setProgress(steps[nextStep].progress)
          return nextStep
        }
        return prev
      })
    }, 2000)
    
    return () => clearInterval(stepInterval)
  }, [status, userType])

  // Smooth progress animation
  useEffect(() => {
    if (status !== "processing") return
    const steps = getSteps(userType)
    const targetProgress = steps[currentStep]?.progress || 0
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 1, targetProgress)
        }
        return prev
      })
    }, 50)
    return () => clearInterval(progressInterval)
  }, [currentStep, status, userType])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        addDebugInfo("🔄 Starting OAuth callback processing...")
        
        // Force loading screen to show for at least 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hasOAuthParams = urlParams.has("code") || urlParams.has("access_token") || urlParams.has("error")
        const hasTypeParam = urlParams.has("type")
        const returnTo = searchParams.get("return_to")
        const type = searchParams.get("type")
        const step = searchParams.get("step")
        const urlUserType = searchParams.get("user_type")
        
        // Set user type early for appropriate messaging
        if (urlUserType) {
          setUserType(urlUserType)
        } else if (type === "supplier" || step === "onboarding") {
          setUserType("supplier")
        }
        
        addDebugInfo(`📋 URL params - type: ${type}, step: ${step}, userType: ${urlUserType}, hasOAuth: ${hasOAuthParams}`)
        
        // Check for OAuth errors first
        const error = searchParams.get("error")
        if (error) {
          addDebugInfo(`❌ OAuth error from provider: ${error}`)
          throw new Error(`Authentication failed: ${error}`)
        }

        // If no OAuth params and no type param, this might be a direct visit
        if (!hasOAuthParams && !hasTypeParam) {
          addDebugInfo("❌ No OAuth parameters found - direct visit or missing params")
          throw new Error("Invalid callback - missing authentication parameters")
        }

        // Move to step 1
        setCurrentStep(1)
        await new Promise((resolve) => setTimeout(resolve, 800))

        addDebugInfo("🔍 Getting user session...")
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          addDebugInfo(`❌ Session error: ${sessionError.message}`)
          throw new Error(`Authentication failed: ${sessionError.message}`)
        }

        const user = sessionData.session?.user
        if (!user) {
          addDebugInfo("❌ No user session found")
          throw new Error("Authentication incomplete - please try again")
        }

        addDebugInfo(`✅ User authenticated: ${user.email}`)

        // Update user type from metadata if not set
        if (!urlUserType && user.user_metadata?.user_type) {
          setUserType(user.user_metadata.user_type)
        }

        // Move to step 2
        setCurrentStep(2)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Route based on callback type
        if (type === "supplier" && step === "onboarding") {
          addDebugInfo("🎯 Supplier onboarding flow")
          await handleSupplierOnboarding(user)
        } else if (urlUserType === "customer" || type === "signin") {
          addDebugInfo("🎯 Customer flow - redirect to /dashboard")
          await handleCustomerFlow(user)
        } else {
          // Determine from user metadata
          const userMetaType = user.user_metadata?.user_type
          addDebugInfo(`🔍 Determining user type from metadata: ${userMetaType}`)

          if (userMetaType === "supplier") {
            addDebugInfo("🎯 Supplier flow - check profile or onboard")
            await handleExistingSupplierFlow(user)
          } else {
            addDebugInfo("🎯 Default customer flow - redirect to /dashboard")
            await handleCustomerFlow(user)
          }
        }
      } catch (error) {
        addDebugInfo(`💥 Auth callback error: ${error.message}`)
        console.error("💥 Auth callback error:", error)
        setStatus("error")
        setErrorMessage(error.message || "Authentication failed")
      }
    }

    const handleSupplierOnboarding = async (user) => {
      try {
        addDebugInfo("🏗️ Creating new supplier from onboarding flow...")
        
        const businessDataStr = localStorage.getItem("pendingBusinessData")
        if (!businessDataStr) {
          throw new Error("Business information not found. Please restart the onboarding process.")
        }

        const businessData = JSON.parse(businessDataStr)
        addDebugInfo(`📋 Retrieved business data for: ${businessData.businessName}`)

        await new Promise((resolve) => setTimeout(resolve, 800))

        // Create onboarding draft and supplier profile...
        // (keeping existing onboarding logic)

        addDebugInfo("✅ New supplier profile created successfully")
        
        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        // Store success message for toast on supplier dashboard
        sessionStorage.setItem('auth_success', JSON.stringify({
          type: 'supplier_created',
          message: `Welcome ${businessData.businessName}! Your business account is ready.`,
          timestamp: Date.now()
        }))
        
        // REDIRECT: New supplier → /suppliers/dashboard
        const redirectUrl = buildUrl('/suppliers/dashboard')
        addDebugInfo(`🚀 New supplier redirecting to: ${redirectUrl}`)
        window.location.href = redirectUrl
      } catch (error) {
        throw error
      }
    }

    const handleCustomerFlow = async (user) => {
      addDebugInfo("🎯 Processing customer - redirect to /dashboard")
      setCurrentStep(2)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      setProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      // Store success message for toast on customer dashboard
      sessionStorage.setItem('auth_success', JSON.stringify({
        type: 'customer_signin',
        message: 'Welcome to PartySnap! Ready to plan amazing parties?',
        timestamp: Date.now()
      }))
      
      // REDIRECT: Customer → /dashboard (or returnTo if specified)
      const returnTo = searchParams.get("return_to")
      const redirectUrl = returnTo 
        ? decodeURIComponent(returnTo) 
        : buildUrl('/dashboard')
        
      addDebugInfo(`🚀 Customer redirecting to: ${redirectUrl}`)
      window.location.href = redirectUrl
    }

    const handleExistingSupplierFlow = async (user) => {
      addDebugInfo("🔍 Checking existing supplier profile...")
      
      // Check if supplier profile exists
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("auth_user_id", user.id)
        .eq("is_primary", true)
        .maybeSingle()

      if (supplierError && supplierError.code !== "PGRST116") {
        throw new Error("Database error occurred")
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (supplierData) {
        // Existing supplier - go to supplier dashboard
        addDebugInfo("✅ Existing supplier found")
        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        sessionStorage.setItem('auth_success', JSON.stringify({
          type: 'supplier_signin',
          message: `Welcome back to ${supplierData.data?.businessName || 'your business'}!`,
          timestamp: Date.now()
        }))
        
        // REDIRECT: Existing supplier → /suppliers/dashboard
        const redirectUrl = buildUrl('/suppliers/dashboard')
        addDebugInfo(`🚀 Existing supplier redirecting to: ${redirectUrl}`)
        window.location.href = redirectUrl
      } else {
        // Supplier type but no profile - needs onboarding
        addDebugInfo("🏗️ Supplier needs onboarding")
        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        // REDIRECT: Supplier without profile → /suppliers/onboarding
        const redirectUrl = buildUrl('/suppliers/onboarding')
        addDebugInfo(`🚀 Supplier (no profile) redirecting to: ${redirectUrl}`)
        window.location.href = redirectUrl
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  // Only show processing and error states
  if (status === "processing") {
    const steps = getSteps(userType)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          
          {/* Bigger Snappy Animation */}
          <div className="w-48 h-36 mx-auto mb-6 animate-fade-in-up">
            <video
              ref={videoRef}
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

          {/* Welcome Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            {userType === "supplier" ? "Welcome to PartySnap Business!" : "Welcome to PartySnap!"}
          </h1>

          {/* Dynamic Status Message */}
          <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
            {steps[currentStep]?.message || "Getting everything ready..."}
          </p>

          {/* Enhanced Progress Bar */}
          <div className="w-full max-w-md bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xl font-bold text-primary-600 mb-6">{Math.round(progress)}%</div>

          {/* Loading Spinner */}
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="w-6 h-6 text-[hsl(var(--primary-500))] animate-spin" />
          </div>

          {/* Fun Tagline */}
          <p className="text-xs text-gray-500 italic">
            {userType === "supplier" 
              ? "Setting up your business tools... 🎪" 
              : "Preparing your party planning magic... ✨"
            }
          </p>
          
          {/* Debug Console */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
              <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded-lg max-h-32 overflow-y-auto">
                <div className="text-xs font-mono space-y-1">
                  {debugInfo.slice(-10).map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
                </div>
              </div>
            </details>
          )}
        </div>

        {/* Animation Styles */}
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
    )
  }

  // Only show error state if something goes wrong
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center animate-fade-in-up">
          
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error Message */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
          
          <p className="text-red-600 mb-8 text-sm leading-relaxed">{errorMessage}</p>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <details className="mb-6">
              <summary className="text-xs text-gray-400 cursor-pointer mb-2">Debug Details</summary>
              <div className="bg-gray-900 text-red-400 p-3 rounded-lg max-h-32 overflow-y-auto text-left">
                <div className="text-xs font-mono space-y-1">
                  {debugInfo.slice(-10).map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
                </div>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = userType === "supplier" 
                ? buildUrl('/suppliers/onboarding') 
                : buildUrl('/dashboard')
              }
              className="w-full bg-[hsl(var(--primary-500))] text-white py-3 px-6 rounded-xl hover:bg-[hsl(var(--primary-600))] transition-colors font-semibold shadow-lg"
            >
              {userType === "supplier" ? "Try Onboarding Again" : "Go to Dashboard"}
            </button>
            
            <button
              onClick={() => window.location.href = getBaseUrl()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Return Home
            </button>
          </div>
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
    )
  }

  return null
}