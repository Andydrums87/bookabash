"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CheckCircle, AlertCircle } from "lucide-react"
import { getBaseUrl, buildUrl } from "@/utils/env" // or "@/lib/env" if that's where it is

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef(null)
  const [status, setStatus] = useState("processing") // Always start with processing
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState([])

  // Helper function to add debug info
  const addDebugInfo = (message) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Snappy's OAuth journey steps
  const oauthSteps = [
    {
      message: "Snappy's setting up your account...",
      duration: 2000,
      progress: 25,
    },
    {
      message: "Building your supplier profile...",
      duration: 2500,
      progress: 50,
    },
    {
      message: "Adding party planning tools...",
      duration: 2000,
      progress: 75,
    },
    {
      message: "Almost ready for business!",
      duration: 1500,
      progress: 95,
    },
  ]

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
    
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1
        if (nextStep < oauthSteps.length) {
          setProgress(oauthSteps[nextStep].progress)
          return nextStep
        }
        return prev
      })
    }, 2500) // Slightly longer intervals
    
    return () => clearInterval(stepInterval)
  }, [status])

  // Smooth progress animation
  useEffect(() => {
    if (status !== "processing") return
    const targetProgress = oauthSteps[currentStep]?.progress || 0
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 1, targetProgress)
        }
        return prev
      })
    }, 100)
    return () => clearInterval(progressInterval)
  }, [currentStep, status])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        addDebugInfo("🔄 Starting OAuth callback processing...")
        
        // Force loading screen to show for at least 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000))
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hasOAuthParams = urlParams.has("code") || urlParams.has("access_token") || urlParams.has("error")
        const hasTypeParam = urlParams.has("type")
        const returnTo = searchParams.get("return_to")
        const type = searchParams.get("type")
        const step = searchParams.get("step")
        
        addDebugInfo(`📋 URL params - type: ${type}, step: ${step}, hasOAuth: ${hasOAuthParams}`)
        
        // Check for OAuth errors first
        const error = searchParams.get("error")
        if (error) {
          addDebugInfo(`❌ OAuth error from provider: ${error}`)
          throw new Error(`OAuth error: ${error}`)
        }

        // If no OAuth params and no type param, this might be a direct visit
        if (!hasOAuthParams && !hasTypeParam) {
          addDebugInfo("❌ No OAuth parameters found - direct visit or missing params")
          throw new Error("Invalid callback - no authentication parameters found")
        }

        // Move to step 1
        setCurrentStep(1)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        addDebugInfo("🔍 Getting user session...")
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          addDebugInfo(`❌ Session error: ${sessionError.message}`)
          throw new Error(`Authentication failed: ${sessionError.message}`)
        }

        const user = sessionData.session?.user
        if (!user) {
          addDebugInfo("❌ No user session found")
          throw new Error("No user session found - authentication may have failed")
        }

        addDebugInfo(`✅ User authenticated: ${user.email}`)

        // Move to step 2
        setCurrentStep(2)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Route based on callback type
        if (type === "supplier" && step === "onboarding") {
          addDebugInfo("🎯 Supplier onboarding flow")
          await handleSupplierOnboarding(user)
        } else if (type === "signin") {
          addDebugInfo("🎯 Regular OAuth sign-in flow")
          await handleRegularSignIn(user)
        } else {
          // No type specified - determine from user metadata
          const userType = user.user_metadata?.user_type
          addDebugInfo(`🔍 No type specified, checking user metadata: ${userType}`)

          if (userType === "supplier") {
            addDebugInfo("🎯 User is supplier type, checking for profile...")
            await handleRegularSignIn(user)
          } else {
            addDebugInfo("🎯 Regular user, going to customer dashboard")
            setProgress(100)
            await new Promise((resolve) => setTimeout(resolve, 500))
            setStatus("success")
            setTimeout(() => {
              const redirectUrl = returnTo ? decodeURIComponent(returnTo) : buildUrl('/dashboard')
              addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
              window.location.href = redirectUrl
            }, 2000)
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
        addDebugInfo("🏗️ Starting supplier onboarding...")
        
        // Move to step 3
        setCurrentStep(2)
        const businessDataStr = localStorage.getItem("pendingBusinessData")
        if (!businessDataStr) {
          throw new Error("Business information not found. Please restart the onboarding process.")
        }

        const businessData = JSON.parse(businessDataStr)
        addDebugInfo(`📋 Retrieved business data for: ${businessData.businessName}`)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create or update onboarding draft
        const { data: draftResult, error: draftError } = await supabase
          .from("onboarding_drafts")
          .insert({
            email: user.email,
            your_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            business_name: businessData.businessName,
            phone: businessData.phone,
            postcode: businessData.postcode,
            supplier_type: businessData.supplierType,
          })
          .select()
          .single()

        if (draftError) {
          if (draftError.code === "23505") {
            addDebugInfo("📝 Email exists in drafts, updating...")
            const { error: updateError } = await supabase
              .from("onboarding_drafts")
              .update({
                your_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
                business_name: businessData.businessName,
                phone: businessData.phone,
                postcode: businessData.postcode,
                supplier_type: businessData.supplierType,
              })
              .eq("email", user.email)

            if (updateError) throw updateError
          } else {
            throw draftError
          }
        }

        // Move to final step
        setCurrentStep(3)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create supplier profile
        const supplierData = {
          name: businessData.businessName,
          businessName: businessData.businessName,
          serviceType: businessData.supplierType,
          category: businessData.supplierType,
          location: businessData.postcode,
          owner: {
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            email: user.email,
            phone: businessData.phone || "",
          },
          contactInfo: {
            email: user.email,
            phone: businessData.phone || "",
            postcode: businessData.postcode,
          },
          description: "New supplier - profile setup in progress",
          businessDescription: "New supplier - profile setup in progress",
          packages: [],
          portfolioImages: [],
          portfolioVideos: [],
          workingHours: {
            Monday: { start: "09:00", end: "17:00", active: true },
            Tuesday: { start: "09:00", end: "17:00", active: true },
            Wednesday: { start: "09:00", end: "17:00", active: true },
            Thursday: { start: "09:00", end: "17:00", active: true },
            Friday: { start: "09:00", end: "17:00", active: true },
            Saturday: { start: "10:00", end: "16:00", active: true },
            Sunday: { start: "10:00", end: "16:00", active: false },
          },
          unavailableDates: [],
          busyDates: [],
          rating: 0,
          reviewCount: 0,
          bookingCount: 0,
          priceFrom: 0,
          priceUnit: "per event",
          badges: ["New Provider"],
          themes: ["general"],
          availability: "Contact for availability",
          isComplete: "New supplier - profile setup in progress",
          coverPhoto: "",
          image: "",
          advanceBookingDays: 7,
          maxBookingDays: 365,
          availabilityNotes: "",
          serviceDetails: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          onboardingCompleted: true,
          createdFrom: "oauth_signup",
        }

        const supplierRecord = {
          auth_user_id: user.id,
          data: supplierData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: supplierError } = await supabase.from("suppliers").insert(supplierRecord)

        if (supplierError) {
          addDebugInfo(`❌ Failed to create supplier: ${supplierError.message}`)
          throw new Error("Failed to create supplier profile")
        }

        // Cleanup
        localStorage.removeItem("pendingBusinessData")
        await supabase.from("onboarding_drafts").delete().eq("email", user.email)

        addDebugInfo("✅ Supplier profile created successfully")

        // Success!
        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 800))
        setStatus("success")
        setTimeout(() => {
          const redirectUrl = buildUrl('/suppliers/dashboard')
          addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
          window.location.href = redirectUrl
        }, 2500)
      } catch (error) {
        addDebugInfo(`💥 Supplier onboarding error: ${error.message}`)
        throw error
      }
    }

    const handleRegularSignIn = async (user) => {
      try {
        addDebugInfo("🔍 Processing regular sign-in...")
        setCurrentStep(1)

        // Check URL parameter first - this overrides user metadata
        const urlUserType = searchParams.get("user_type")

        if (urlUserType === "customer") {
          addDebugInfo("🎯 Customer sign-in flow (from URL parameter)")
          setProgress(100)
          await new Promise((resolve) => setTimeout(resolve, 500))
          setStatus("success")
          
          const returnTo = searchParams.get("return_to")
          setTimeout(() => {
            const redirectUrl = returnTo 
              ? decodeURIComponent(returnTo) 
              : buildUrl('/dashboard')
            addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
            window.location.href = redirectUrl
          }, 2000)
          return
        }

        // Check if user already has a supplier profile
        const { data: supplierData, error: supplierError } = await supabase
          .from("suppliers")
          .select("*")
          .eq("auth_user_id", user.id)
          .eq("is_primary", true)
          .maybeSingle()

        if (supplierError && supplierError.code !== "PGRST116") {
          throw new Error("Database error occurred")
        }

        await new Promise((resolve) => setTimeout(resolve, 1500))

        if (supplierData) {
          addDebugInfo("✅ Existing supplier found, redirecting to dashboard")
          setProgress(100)
          await new Promise((resolve) => setTimeout(resolve, 500))
          setStatus("success")
          setTimeout(() => {
            const redirectUrl = buildUrl('/suppliers/dashboard')
            addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
            window.location.href = redirectUrl
          }, 2000)
          return
        }

        // Check if user is a supplier type
        const userType = user.user_metadata?.user_type
        addDebugInfo(`👤 User type from metadata: ${userType}`)
        
        if (userType === "supplier") {
          setCurrentStep(2)
          
          // Check for existing onboarding draft
          const { data: draft, error: draftError } = await supabase
            .from("onboarding_drafts")
            .select("*")
            .eq("email", user.email)
            .maybeSingle()

          if (draft) {
            addDebugInfo("📄 Found onboarding draft, creating supplier profile")
            await createSupplierFromDraft(user, draft)
            setProgress(100)
            await new Promise((resolve) => setTimeout(resolve, 500))
            setStatus("success")
            setTimeout(() => {
              const redirectUrl = buildUrl('/suppliers/dashboard')
              addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
              window.location.href = redirectUrl
            }, 2000)
            return
          }

          addDebugInfo("🏗️ No draft found, redirecting to onboarding")
          setProgress(100)
          await new Promise((resolve) => setTimeout(resolve, 500))
          setStatus("success")
          setTimeout(() => {
            const redirectUrl = buildUrl('/suppliers/onboarding')
            addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
            window.location.href = redirectUrl
          }, 2000)
          return
        }

        // Default to customer dashboard
        addDebugInfo("🎯 Default to customer dashboard")
        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setStatus("success")
        setTimeout(() => {
          const redirectUrl = buildUrl('/dashboard')
          addDebugInfo(`🚀 Redirecting to: ${redirectUrl}`)
          window.location.href = redirectUrl
        }, 2000)
      } catch (error) {
        addDebugInfo(`💥 Regular sign-in error: ${error.message}`)
        throw error
      }
    }

    const createSupplierFromDraft = async (user, draft) => {
      addDebugInfo(`🏭 Creating supplier from draft for: ${draft.business_name}`)
      
      const supplierData = {
        name: draft.business_name,
        businessName: draft.business_name,
        serviceType: draft.supplier_type,
        category: draft.supplier_type,
        location: draft.postcode,
        owner: {
          name: draft.your_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
          email: user.email,
          phone: draft.phone || "",
        },
        contactInfo: {
          email: user.email,
          phone: draft.phone || "",
          postcode: draft.postcode,
        },
        description: "New supplier - profile setup in progress",
        businessDescription: "New supplier - profile setup in progress",
        packages: [],
        portfolioImages: [],
        portfolioVideos: [],
        workingHours: {
          Monday: { start: "09:00", end: "17:00", active: true },
          Tuesday: { start: "09:00", end: "17:00", active: true },
          Wednesday: { start: "09:00", end: "17:00", active: true },
          Thursday: { start: "09:00", end: "17:00", active: true },
          Friday: { start: "09:00", end: "17:00", active: true },
          Saturday: { start: "10:00", end: "16:00", active: true },
          Sunday: { start: "10:00", end: "16:00", active: false },
        },
        unavailableDates: [],
        busyDates: [],
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        priceFrom: 0,
        priceUnit: "per event",
        badges: ["New Provider"],
        themes: ["general"],
        availability: "Contact for availability",
        isComplete: "New supplier - profile setup in progress",
        coverPhoto: "",
        image: "",
        advanceBookingDays: 7,
        maxBookingDays: 365,
        availabilityNotes: "",
        serviceDetails: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: true,
        createdFrom: "oauth_signin",
      }

      const supplierRecord = {
        auth_user_id: user.id,
        data: supplierData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: supplierError } = await supabase.from("suppliers").insert(supplierRecord)

      if (supplierError) {
        addDebugInfo(`❌ Failed to create supplier: ${supplierError.message}`)
        throw new Error("Failed to create supplier profile")
      }

      await supabase.from("onboarding_drafts").delete().eq("email", user.email)
      addDebugInfo("✅ Supplier profile created from draft")
    }

    // Always run the callback handler
    handleAuthCallback()
  }, [searchParams, router])

  // Always show loading screen first
  if (status === "processing") {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex flex-col items-center justify-center px-4 text-center">
        {/* Large Snappy Video Animation */}
        <div className="relative w-full max-w-2xl aspect-video mb-8 animate-fade-in-up">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="rounded-xl shadow-lg w-full"
            poster="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753083738/ChatGPT_Image_Jul_21_2025_08_42_11_AM_tznmag.png"
          >
            <source
              src="https://res.cloudinary.com/dghzq6xtd/video/upload/v1753083603/wQEAljVs5VrDNI1dyE8t8_output_nowo6h.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {/* Video overlay with subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl pointer-events-none"></div>

          {/* Floating elements around video */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-400 rounded-full animate-bounce opacity-80"></div>
          <div
            className="absolute -bottom-4 -left-4 w-6 h-6 bg-amber-400 rounded-full animate-bounce opacity-80"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-1/2 -left-6 w-4 h-4 bg-green-400 rounded-full animate-bounce opacity-80"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Text Content */}
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 mb-4 animate-fade-in-up">
            Welcome to PartySnap! 🎉
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 animate-pulse leading-relaxed">
            {oauthSteps[currentStep]?.message || "Getting everything ready..."}
          </p>

          {/* Enhanced Progress Bar */}
          <div className="w-full max-w-lg mx-auto mb-6">
            <div className="bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 h-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary-600 mt-3">{Math.round(progress)}%</div>
          </div>

          {/* Enhanced Loading dots */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          {/* Fun message */}
          <p className="text-sm text-gray-500 italic">Snappy is working his magic... 🐊✨</p>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <div className="mt-8 text-left bg-gray-900 text-green-400 p-4 rounded-lg max-h-40 overflow-y-auto">
              <div className="text-xs font-mono space-y-1">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Animation styles */}
        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
        `}</style>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="animate-fade-in-up max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 mb-6">Welcome to PartySnap! 🎊</h2>

          <p className="text-lg sm:text-xl text-gray-600 mb-4 leading-relaxed">
            Snappy's got everything set up for you!
          </p>

          <p className="text-base text-gray-500 mb-8">Taking you to your dashboard...</p>

          {/* Success animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-4 h-1 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-8 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-4 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
        `}</style>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="animate-fade-in-up max-w-md mx-auto">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Oops! Something went wrong</h2>

          <p className="text-red-600 mb-8 leading-relaxed">{errorMessage}</p>

          {/* Show debug info in development */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <div className="mb-8 text-left bg-gray-900 text-red-400 p-4 rounded-lg max-h-40 overflow-y-auto">
              <div className="text-xs font-mono space-y-1">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = buildUrl('/suppliers/onboarding')}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl hover:bg-primary-700 transition-colors font-semibold text-lg shadow-lg"
            >
              Restart Onboarding
            </button>
            <button
              onClick={() => window.location.href = getBaseUrl()}
              className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Return Home
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
        `}</style>
      </div>
    )
  }

  return null
}