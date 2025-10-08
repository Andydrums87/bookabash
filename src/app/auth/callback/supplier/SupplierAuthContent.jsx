"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AlertCircle, Loader2 } from "lucide-react"
import { buildUrl } from "@/utils/env"

export default function SupplierAuthCallback() {
   
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef(null)
  const [status, setStatus] = useState("processing")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    console.log("🚨 SUPPLIER CALLBACK STARTED")
    
    // Also write to localStorage so we can check later
    const debugLog = JSON.parse(localStorage.getItem('debug_log') || '[]')
    debugLog.push({
      timestamp: Date.now(),
      message: "SUPPLIER CALLBACK LOADED",
      url: window.location.href,
      params: Object.fromEntries(new URLSearchParams(window.location.search))
    })
    localStorage.setItem('debug_log', JSON.stringify(debugLog))
  }, [])

  const steps = [
    { message: "Setting up your business account...", progress: 25 },
    { message: "Checking your business profile...", progress: 60 },
    { message: "Preparing your dashboard...", progress: 90 },
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

  // Animate through steps
  useEffect(() => {
    if (status !== "processing") return
    
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1
        if (nextStep < steps.length) {
          return nextStep
        }
        return prev
      })
    }, 1500)
    
    return () => clearInterval(stepInterval)
  }, [status])

  // Smooth progress animation
  useEffect(() => {
    if (status !== "processing") return
    const targetProgress = steps[currentStep]?.progress || 0
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress)
        }
        return prev
      })
    }, 50)
    return () => clearInterval(progressInterval)
  }, [currentStep, status])

  useEffect(() => {
    const handleSupplierCallback = async () => {
      try {
        console.log("🏢 Processing supplier OAuth callback...")
        
        // Force minimum loading time for UX
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Check for OAuth errors
        const error = searchParams.get("error")
        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        // Move to step 1
        setCurrentStep(1)
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Get user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Authentication failed: ${sessionError.message}`)
        }

        const user = sessionData.session?.user
        if (!user) {
          throw new Error("Authentication incomplete - please try again")
        }

        console.log("✅ Supplier authenticated:", user.email)

        // Move to step 2
        setCurrentStep(2)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("🔍 DEBUG: Checking for existing supplier profile...")
        
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

        if (supplierData) {
          // Existing supplier
          console.log("✅ Existing supplier profile found")
          
          setProgress(100)
          await new Promise((resolve) => setTimeout(resolve, 300))
          
          // Store success message for toast
          sessionStorage.setItem('auth_success', JSON.stringify({
            type: 'supplier_signin',
            message: `Welcome back to ${supplierData.data?.businessName || 'your business'}!`,
            timestamp: Date.now()
          }))
          
          const step = searchParams.get("step")
          const redirectUrl = step === "onboarding" 
            ? buildUrl('/suppliers/onboarding/success')
            : buildUrl('/suppliers/dashboard')
    
          window.location.href = redirectUrl
          return
        }

        // No existing supplier - check if they have a customer account
        console.log("🔍 No supplier found, checking if this is a customer account...")
        
        // Check for onboarding draft first
        const { data: draft, error: draftError } = await supabase
          .from("onboarding_drafts")
          .select("*")
          .eq("email", user.email)
          .maybeSingle()

        if (draft) {
          // Has draft - create supplier from it
          console.log("📋 Found onboarding draft, creating supplier profile...")
          await createSupplierFromDraft(user, draft)
          
          setProgress(100)
          await new Promise((resolve) => setTimeout(resolve, 300))
          
          // Store success message for toast
          sessionStorage.setItem('auth_success', JSON.stringify({
            type: 'supplier_created',
            message: `Welcome ${draft.business_name}! Your business account is ready.`,
            timestamp: Date.now()
          }))
          
          // Redirect to supplier dashboard
          window.location.href = buildUrl('/suppliers/dashboard')
          return
        }

        // Check localStorage for pending business data
        console.log("📋 No draft found, checking localStorage for business data...")
        const businessDataStr = localStorage.getItem("pendingBusinessData")

        if (businessDataStr) {
          console.log("💾 Found business data in localStorage, creating draft...")
          const businessData = JSON.parse(businessDataStr)
          
          // Create draft with OAuth email
          const { data: newDraft, error: newDraftError } = await supabase
            .from("onboarding_drafts")
            .insert({
              email: user.email,
              your_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              business_name: businessData.businessName,
              phone: businessData.phone,
              postcode: businessData.postcode,
              supplier_type: businessData.supplierType,
            })
            .select()
            .single()
         
          if (!newDraftError && newDraft) {
            console.log("✅ Created draft from OAuth + business data:", newDraft.business_name)
            
            // Now create supplier from this new draft
            await createSupplierFromDraft(user, newDraft)  
            
            setProgress(100)
            await new Promise((resolve) => setTimeout(resolve, 300))
            
            // Store success message for toast
            sessionStorage.setItem('auth_success', JSON.stringify({
              type: 'supplier_created',
              message: `Welcome ${newDraft.business_name}! Your business account is ready.`,
              timestamp: Date.now()
            }))
            
            // Clean up localStorage
            localStorage.removeItem("pendingBusinessData")
            
            // Redirect to success page
            window.location.href = buildUrl('/suppliers/onboarding/success')
            return
          } else {
            console.error("❌ Failed to create draft from business data:", newDraftError)
          }
        }

        // No supplier, no draft, no business data
        // This might be a customer trying to access supplier portal
        console.log("⚠️ No supplier record or business data found for this email")
        console.log("🚫 This appears to be a customer account trying to access supplier portal")

        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Sign them out
        await supabase.auth.signOut()

        // Store error message for the sign-in page
        sessionStorage.setItem('supplier_auth_error', JSON.stringify({
          message: "This email is registered as a customer account. Please use the customer sign-in or create a business account.",
          email: user.email,
          timestamp: Date.now()
        }))

        // Redirect to customer sign-in with message
        window.location.href = buildUrl(`/signin?email=${encodeURIComponent(user.email)}&supplier_blocked=true`)

      } catch (error) {
        console.error("❌ Supplier callback error:", error)
        setStatus("error")
        setErrorMessage(error.message || "Authentication failed")
      }
    }

    const createSupplierFromDraft = async (user, draft) => {
      console.log(`🏭 Creating supplier from draft for: ${draft.business_name}`)
      
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
        console.error("❌ Failed to create supplier:", supplierError)
        throw new Error("Failed to create supplier profile")
      }

      // Clean up draft
      await supabase.from("onboarding_drafts").delete().eq("email", user.email)
      console.log("✅ Supplier profile created from draft")
    }

    handleSupplierCallback()
  }, [searchParams, router])

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center">
          
          {/* Snappy Animation */}
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
            Welcome to PartySnap Business!
          </h1>

          <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
            {steps[currentStep]?.message || "Setting up your business account..."}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
            <div
              className="bg-gradient-to-br from-[hsl(var(--primary-500))] via-[hsl(var(--primary-600))] to-[hsl(var(--primary-500))] h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xl font-bold text-primary-600 mb-6">{Math.round(progress)}%</div>

          <p className="text-xs text-gray-500 italic">
            Setting up your business tools... 🎪
          </p>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        `}</style>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto text-center animate-fade-in-up">
          
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
          
          <p className="text-red-600 mb-8 text-sm leading-relaxed">{errorMessage}</p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = buildUrl('/suppliers/onboarding')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-colors font-semibold shadow-lg"
            >
              Try Onboarding Again
            </button>
            
            <button
              onClick={() => window.location.href = buildUrl('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        `}</style>
      </div>
    )
  }

  return null
}