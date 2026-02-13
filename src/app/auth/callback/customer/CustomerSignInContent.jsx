"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { linkEmail } from "@/utils/partyTracking"
import { AlertCircle, Loader2 } from "lucide-react"

export default function CustomerAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef(null)
  const [status, setStatus] = useState("processing")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const isProcessingRef = useRef(false) // Prevent duplicate processing

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

  // Smooth progress animation
  useEffect(() => {
    if (status !== "processing") return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 2
        return prev
      })
    }, 100)
    return () => clearInterval(interval)
  }, [status])

  useEffect(() => {
    console.log("👤 Processing customer OAuth callback...")

    // Check for OAuth errors in URL (returned by Supabase/provider)
    const errorParam = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const errorCode = searchParams.get("error_code")

    if (errorParam) {
      console.error("❌ OAuth error from provider:", { errorParam, errorCode, errorDescription })

      // Clean up localStorage
      localStorage.removeItem('oauth_return_to')
      localStorage.removeItem('oauth_preserve_party')
      localStorage.removeItem('oauth_context')

      // Show user-friendly error message
      let userMessage = "Authentication failed. Please try again."
      if (errorDescription?.includes("exchange external code")) {
        userMessage = "Apple Sign In configuration error. Please try Google sign in or email instead."
      } else if (errorDescription) {
        userMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      }

      setStatus("error")
      setErrorMessage(userMessage)
      return
    }

    // Get URL parameters
    const returnToParam = searchParams.get("return_to")
    const preservePartyParam = searchParams.get("preserve_party")
    const contextParam = searchParams.get("context")
    const userType = searchParams.get("user_type")

    // CRITICAL: Check localStorage first (survives OAuth redirect)
    const storedReturnTo = localStorage.getItem('oauth_return_to')
    const storedPreserveParty = localStorage.getItem('oauth_preserve_party')
    const storedContext = localStorage.getItem('oauth_context')

    // Use stored values with fallback to URL params
    const returnTo = storedReturnTo || returnToParam
    const preserveParty = storedPreserveParty || preservePartyParam
    const context = storedContext || contextParam

    console.log("📋 Callback parameters:", {
      returnTo,
      preserveParty,
      context,
      userType,
      source: storedReturnTo ? 'localStorage' : 'url'
    })

    // Clean up localStorage after reading
    localStorage.removeItem('oauth_return_to')
    localStorage.removeItem('oauth_preserve_party')
    localStorage.removeItem('oauth_context')

    // Use onAuthStateChange to reliably catch the session
    // This works for both Google (hash) and Apple (POST) OAuth flows
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state change:", event)

      if (event === 'SIGNED_IN' && session?.user) {
        await handleSuccessfulAuth(session.user, { returnTo, preserveParty, context })
      }
    })

    // Also check if session already exists (in case onAuthStateChange already fired)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log("✅ Found existing session:", session.user.email)
        await handleSuccessfulAuth(session.user, { returnTo, preserveParty, context })
      }
    }

    // Small delay to let Supabase process the callback first
    const timer = setTimeout(checkExistingSession, 200)

    // Timeout fallback - if no session after 10 seconds, show error
    const timeout = setTimeout(() => {
      setStatus("error")
      setErrorMessage("Authentication timed out. Please try signing in again.")
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
      clearTimeout(timeout)
    }

    async function handleSuccessfulAuth(user, { returnTo, preserveParty, context }) {
      // Prevent duplicate processing from multiple auth events
      if (isProcessingRef.current) {
        console.log("⏭️ Already processing auth, skipping duplicate call")
        return
      }
      isProcessingRef.current = true

      try {
        console.log("✅ Found session:", user.email)
  
        // CRITICAL: Check if this is a business account
        console.log("🔍 Checking if this is a business account...")
        const { data: supplierRecord, error: supplierError } = await supabase
          .from("suppliers")
          .select("id, business_name, data")
          .eq("auth_user_id", user.id)
          .eq("is_primary", true)
          .maybeSingle()
  
        if (supplierError && supplierError.code !== 'PGRST116') {
          console.error("Error checking supplier:", supplierError)
        }
  
        if (supplierRecord) {
          console.log("🚫 Business account detected via OAuth, blocking customer access")
          await supabase.auth.signOut()
          window.location.href = `${window.location.origin}/suppliers/onboarding/auth/signin?email=${encodeURIComponent(user.email)}&blocked=true`
          return
        }
  
        console.log("✅ User account verified, creating customer profile...")
        console.log("📝 User metadata from OAuth:", JSON.stringify(user.user_metadata, null, 2))

        // Extract name from OAuth metadata
        // Google uses: given_name, family_name, full_name
        // Apple uses: name.firstName, name.lastName (only on first sign-in), or full_name
        const getFirstName = () => {
          // Google format
          if (user.user_metadata?.given_name) return user.user_metadata.given_name
          // Apple format (first sign-in only)
          if (user.user_metadata?.name?.firstName) return user.user_metadata.name.firstName
          // Fallback to full_name split
          if (user.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0]
          return ''
        }

        const getLastName = () => {
          // Google format
          if (user.user_metadata?.family_name) return user.user_metadata.family_name
          // Apple format (first sign-in only)
          if (user.user_metadata?.name?.lastName) return user.user_metadata.name.lastName
          // Fallback to full_name split
          if (user.user_metadata?.full_name) return user.user_metadata.full_name.split(' ').slice(1).join(' ')
          return ''
        }

        const firstName = getFirstName()
        const lastName = getLastName()
        console.log("👤 Extracted name:", { firstName, lastName })

        // Create or get customer profile
        // Only pass name values if they exist (avoid overwriting with empty strings)
        const userResult = await partyDatabaseBackend.createOrGetUser({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: user.email,
          phone: user.user_metadata?.phone || undefined,
          postcode: undefined
        })
  
        if (!userResult.success) {
          throw new Error('Failed to create customer profile')
        }
  
        console.log("✅ Customer profile ready:", userResult.user.id)

        // Link email to party tracking session (for CRM)
        await linkEmail(user.email)

        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Determine where to redirect
        const currentOrigin = window.location.origin
        let redirectUrl = `${currentOrigin}/`
        let successMessage = 'Welcome to PartySnap!'

        if (preserveParty === 'true' || context === 'review_book' || (returnTo && returnTo.includes('/review-book'))) {
          console.log("🎉 Redirecting to review book")
          redirectUrl = `${currentOrigin}/review-book`
          successMessage = `Welcome ${user.user_metadata?.given_name || 'back'}! Let's continue with your party booking.`
        } else if (returnTo) {
          redirectUrl = returnTo.startsWith('http') ? returnTo : `${currentOrigin}${returnTo}`
          successMessage = `Welcome back ${user.user_metadata?.given_name || ''}!`
        } else {
          // ✅ FIX: Check if user has a party in database OR localStorage
          try {
            // First check database for existing parties
            const currentPartyResult = await partyDatabaseBackend.getCurrentParty()
            const hasPartyInDatabase = currentPartyResult.success && currentPartyResult.party

            // Then check localStorage
            const partyPlan = localStorage.getItem('user_party_plan')
            const partyDetails = localStorage.getItem('party_details')
            const hasPartyInLocalStorage = partyPlan && partyPlan !== 'null' && partyDetails && partyDetails !== 'null'

            if (hasPartyInDatabase || hasPartyInLocalStorage) {
              console.log("🎉 User has a party (database:", hasPartyInDatabase, ", localStorage:", hasPartyInLocalStorage, "), redirecting to dashboard")
              redirectUrl = `${currentOrigin}/dashboard`
              successMessage = `Welcome back ${user.user_metadata?.given_name || ''}! Let's continue planning your party.`
            } else {
              console.log("📍 No party found, redirecting to home")
              redirectUrl = `${currentOrigin}/`
              successMessage = `Welcome to PartySnap, ${user.user_metadata?.given_name || ''}!`
            }
          } catch (error) {
            console.error("Error checking party:", error)
            redirectUrl = `${currentOrigin}/`
          }
        }
  
        // Store success message
        sessionStorage.setItem('auth_success', JSON.stringify({
          type: preserveParty === 'true' ? 'oauth_signin_party' : 'oauth_signin',
          message: successMessage,
          timestamp: Date.now()
        }))
        
        console.log("🚀 Redirecting to:", redirectUrl)
        window.location.href = redirectUrl
  
      } catch (error) {
        console.error("❌ Customer callback error:", error)
        isProcessingRef.current = false // Allow retry on error
        setStatus("error")
        setErrorMessage(error.message || "Authentication failed")
      }
    }
  }, [searchParams, router])

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center p-4">
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
            Welcome to PartySnap!
          </h1>

          <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
            Setting up your party planning dashboard...
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-gray-200 h-4 rounded-full overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xl font-bold text-primary-600 mb-6">{Math.round(progress)}%</div>

          <div className="flex items-center justify-center mb-6">
            <Loader2 className="w-6 h-6 text-[hsl(var(--primary-500))] animate-spin" />
          </div>

          <p className="text-xs text-gray-500 italic">
            Preparing your party planning magic... ✨
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
              onClick={() => window.location.href = `${window.location.origin}/review-book`}
              className="w-full bg-[hsl(var(--primary-500))] text-white py-3 px-6 rounded-xl hover:bg-[hsl(var(--primary-600))] transition-colors font-semibold shadow-lg"
            >
              Back to Review & Book
            </button>
            
            <button
              onClick={() => window.location.href = window.location.origin}
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