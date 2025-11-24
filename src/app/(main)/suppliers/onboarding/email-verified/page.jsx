"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CheckCircle, Loader2 } from "lucide-react"

const STORAGE_KEY = 'supplierOnboardingData'

export default function EmailVerifiedPage() {
  const router = useRouter()
  const [status, setStatus] = useState('verifying') // 'verifying', 'creating', 'success', 'error'

  useEffect(() => {
    async function handleVerification() {
      try {
        // Wait a moment for Supabase to process the hash
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          console.error('❌ No session found after verification')
          setStatus('error')
          return
        }

        console.log('✅ User session verified:', session.user.id)

        // Get saved wizard data
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) {
          console.log('ℹ️ No saved wizard data, redirecting to start')
          setTimeout(() => {
            router.push('/suppliers/onboarding/new-supplier')
          }, 2000)
          return
        }

        const parsed = JSON.parse(saved)

        // Check if supplier already exists
        const { data: existingSupplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('auth_user_id', session.user.id)
          .maybeSingle()

        if (existingSupplier) {
          console.log('✅ Supplier already exists, redirecting...')
          setStatus('success')
          setTimeout(() => {
            router.push('/suppliers/onboarding/new-supplier')
          }, 1500)
          return
        }

        // Create supplier
        setStatus('creating')
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
          setStatus('error')
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

        // Update localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...parsed,
          supplierId: newSupplier.id,
          currentStep: 3
        }))

        setStatus('success')

        // Redirect to wizard
        setTimeout(() => {
          router.push('/suppliers/onboarding/new-supplier')
        }, 1500)

      } catch (error) {
        console.error('Error in verification flow:', error)
        setStatus('error')
      }
    }

    handleVerification()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Verifying your email...
              </h1>
              <p className="text-gray-600">
                Please wait a moment
              </p>
            </>
          )}

          {status === 'creating' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Setting up your account...
              </h1>
              <p className="text-gray-600">
                Creating your supplier profile
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Email verified!
              </h1>
              <p className="text-gray-600 mb-4">
                Redirecting you to complete your profile...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn't complete the verification. Please try again or contact support.
              </p>
              <button
                onClick={() => router.push('/suppliers/onboarding/new-supplier')}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
              >
                Go to Onboarding
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
