"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

const STORAGE_KEY = 'supplierOnboardingData'

export default function CheckEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Try to get from localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setEmail(parsed.data?.account?.email || '')
        } catch (e) {
          console.error('Error parsing saved data:', e)
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    // Poll for email verification every 3 seconds
    const pollInterval = setInterval(async () => {
      console.log('🔍 Checking for email verification...')

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error checking session:', error)
        return
      }

      if (session?.user) {
        console.log('✅ Email verified! Session found:', session.user.id)
        clearInterval(pollInterval)
        setIsVerified(true)
        setIsCreatingProfile(true)

        // Get saved wizard data
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) {
          console.error('No saved wizard data found')
          router.push('/suppliers/onboarding/new-supplier')
          return
        }

        try {
          const parsed = JSON.parse(saved)

          // Create supplier profile
          console.log('💾 Creating supplier profile...')

          const supplierData = {
            name: parsed.data.account.fullName,
            businessName: parsed.data.account.fullName,
            serviceType: parsed.data.supplierType,
            category: parsed.data.supplierType,
            location: "",
            owner: {
              name: parsed.data.account.fullName,
              email: parsed.data.account.email,
              phone: parsed.data.account.phone || "",
            },
            contactInfo: {
              email: parsed.data.account.email,
              phone: parsed.data.account.phone || "",
              postcode: "",
            },
            description: "Profile setup in progress...",
            businessDescription: "Profile setup in progress...",
            packages: [],
            portfolioImages: [],
            portfolioVideos: [],
            image: "",
            coverPhoto: "",
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
            priceUnit: "per hour",
            badges: ["New Provider"],
            themes: ["general"],
            availability: "Contact for availability",
            isComplete: false,
            advanceBookingDays: 7,
            maxBookingDays: 365,
            availabilityNotes: "",
            notifications: parsed.data.account.notifications || {
              smsBookings: true,
              smsReminders: false,
              emailBookings: true,
              emailMessages: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            onboardingCompleted: false,
            createdFrom: "wizard_signup",
          }

          const supplierRecord = {
            auth_user_id: session.user.id,
            data: supplierData,
            is_primary: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { data: newSupplier, error: supplierError } = await supabase
            .from("suppliers")
            .insert(supplierRecord)
            .select()
            .single()

          if (supplierError) {
            console.error('❌ Failed to create supplier:', supplierError)
            alert('Failed to create supplier profile. Please try again.')
            return
          }

          console.log('✅ Supplier created:', newSupplier.id)

          // Save terms acceptance if we have it
          if (parsed.termsData) {
            await supabase
              .from('terms_acceptances')
              .insert({
                user_id: session.user.id,
                user_email: parsed.data.account.email,
                terms_version: parsed.termsData.terms_version,
                privacy_version: parsed.termsData.privacy_version,
                ip_address: parsed.termsData.ip_address,
                user_agent: parsed.termsData.user_agent,
                accepted_at: parsed.termsData.accepted_at
              })
            console.log('✅ Terms acceptance saved')
          }

          // Update localStorage with supplier ID
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...parsed,
            supplierId: newSupplier.id,
            currentStep: 3
          }))

          // Redirect to wizard
          setTimeout(() => {
            router.push('/suppliers/onboarding/new-supplier')
          }, 1500)

        } catch (e) {
          console.error('Error creating supplier:', e)
          alert('An error occurred. Please try again.')
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {!isVerified ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Check your email
              </h1>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to:
              </p>
              <p className="text-lg font-medium text-gray-900 mb-6 break-all">
                {email}
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Click the link in the email to verify your account. This window will automatically continue once you verify.
                </p>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Waiting for verification...
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Email verified!
              </h1>
              {isCreatingProfile ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Setting up your account...
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating your profile...
                  </div>
                </>
              ) : (
                <p className="text-gray-600">
                  Redirecting to your onboarding...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
