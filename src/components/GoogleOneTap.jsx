"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

export default function GoogleOneTap({ onSuccess }) {
  const router = useRouter()
  const { toast } = useToast()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) return

    // Check if user is already signed in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        return
      }

      // Load Google Identity Services library
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = initializeGoogleOneTap
      document.body.appendChild(script)
    }

    checkAuth()
    hasInitialized.current = true

    return () => {
      // Clean up
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (script) {
        script.remove()
      }
    }
  }, [])

  const initializeGoogleOneTap = () => {
    if (!window.google) {
      console.log("Google library not loaded")
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      console.log("No client ID found")
      return
    }

    try {
      console.log("Initializing Google One Tap with client:", clientId)

      // Cancel any previous state to reset cooldown
      window.google.accounts.id.cancel()

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      console.log("Attempting to display One Tap prompt...")
      window.google.accounts.id.prompt((notification) => {
        console.log("One Tap notification:", notification)
        if (notification.isNotDisplayed()) {
          console.log("❌ One Tap NOT displayed. Reason:", notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.log("⏭️ One Tap skipped. Reason:", notification.getSkippedReason())
        } else if (notification.isDismissedMoment()) {
          console.log("🚫 One Tap dismissed. Reason:", notification.getDismissedReason())
        } else {
          console.log("✅ One Tap displayed successfully!")
        }
      })
    } catch (error) {
      console.error("Error initializing Google One Tap:", error)
    }
  }

  const handleCredentialResponse = async (response) => {
    try {
      console.log("✅ Credential received from Google One Tap")
      const idToken = response.credential
      console.log("🔐 ID Token:", idToken ? "Received" : "Missing")

      console.log("📤 Sending to Supabase...")
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })

      console.log("📥 Supabase response:", { data, error })

      if (error) throw error

      console.log("✅ Successfully signed in!")

      toast({
        title: "Welcome back!",
        description: "You've been signed in with Google",
      })

      if (onSuccess) {
        onSuccess(data)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("❌ Error signing in with Google One Tap:", error)
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  return null
}
