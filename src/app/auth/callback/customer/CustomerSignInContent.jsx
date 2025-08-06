"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { AlertCircle, Loader2 } from "lucide-react"
import { buildUrl } from "@/utils/env"

export default function CustomerAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef(null)
  const [status, setStatus] = useState("processing")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

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
    const handleCustomerCallback = async () => {
      try {
        console.log("👤 Processing customer OAuth callback...")
        
        // Check for OAuth errors
        const error = searchParams.get("error")
        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        // Get user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Authentication failed: ${sessionError.message}`)
        }

        const user = sessionData.session?.user
        if (!user) {
          throw new Error("Authentication incomplete - please try again")
        }

        console.log("✅ Customer authenticated:", user.email)

        // Create or get customer profile
        const userResult = await partyDatabaseBackend.createOrGetUser({
          firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ')[1] || '',
          email: user.email,
          phone: user.user_metadata?.phone || '',
          postcode: ''
        })

        if (!userResult.success) {
          throw new Error('Failed to create customer profile')
        }

        console.log("✅ Customer profile ready:", userResult.user.id)

        setProgress(100)
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        // Store success message for toast
        sessionStorage.setItem('auth_success', JSON.stringify({
          type: 'customer_signin',
          message: 'Welcome to PartySnap! Ready to plan amazing parties?',
          timestamp: Date.now()
        }))
        
        // Redirect
        const returnTo = searchParams.get("return_to")
        const redirectUrl = returnTo 
          ? decodeURIComponent(returnTo) 
          : buildUrl('/dashboard')
        
        console.log("🚀 Redirecting customer to:", redirectUrl)
        window.location.href = redirectUrl

      } catch (error) {
        console.error("❌ Customer callback error:", error)
        setStatus("error")
        setErrorMessage(error.message || "Authentication failed")
      }
    }

    handleCustomerCallback()
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
              onClick={() => window.location.href = buildUrl('/auth/signin')}
              className="w-full bg-[hsl(var(--primary-500))] text-white py-3 px-6 rounded-xl hover:bg-[hsl(var(--primary-600))] transition-colors font-semibold shadow-lg"
            >
              Try Again
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