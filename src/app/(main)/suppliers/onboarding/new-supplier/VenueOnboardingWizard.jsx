"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import WizardLayout from "@/components/onboarding/WizardLayout"
import SupplierTypeStep from "@/components/onboarding/steps/SupplierTypeStep"
import VenueTypeStep from "@/components/onboarding/steps/venue/VenueTypeStep"
import VenueAddressStep from "@/components/onboarding/steps/venue/VenueAddressStep"
import VenueCapacityStep from "@/components/onboarding/steps/venue/VenueCapacityStep"
import VenueAmenitiesStep from "@/components/onboarding/steps/venue/VenueAmenitiesStep"
import VenueRestrictionsStep from "@/components/onboarding/steps/venue/VenueRestrictionsStep"
import VenuePhotosStep from "@/components/onboarding/steps/venue/VenuePhotosStep"
import VenuePricingStep from "@/components/onboarding/steps/venue/VenuePricingStep"
import EntertainerTypeStep from "@/components/onboarding/steps/entertainer/EntertainerTypeStep"
import ServiceDetailsStep from "@/components/onboarding/steps/entertainer/ServiceDetailsStep"
import ServiceAreaStep from "@/components/onboarding/steps/entertainer/ServiceAreaStep"
import PricingPackagesStep from "@/components/onboarding/steps/entertainer/PricingPackagesStep"
import VerificationDocumentsStep from "@/components/onboarding/steps/entertainer/VerificationDocumentsStep"
import CalendarConnectionStep from "@/components/onboarding/steps/CalendarConnectionStep"
import AccountCreationStep from "@/components/onboarding/steps/AccountCreationStep"

const STORAGE_KEY = 'supplierOnboardingData'

export default function VenueOnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [userId, setUserId] = useState(null) // Auth user ID after account creation
  const [supplierId, setSupplierId] = useState(null) // Supplier record ID
  const [wizardData, setWizardData] = useState({
    supplierType: "",
    account: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      agreedToTerms: false,
      notifications: {
        smsBookings: true, // Pre-checked by default
        smsReminders: false,
        emailBookings: true,
        emailMessages: true
      }
    },
    // Venue-specific fields
    venueType: "",
    venueAddress: {
      businessName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      country: "United Kingdom"
    },
    capacity: {
      max: 50,
      seated: 30,
      standing: 60,
      min: 10
    },
    facilities: [],
    restrictedItems: [],
    photos: [],
    pricing: {
      hourlyRate: 0,
      minimumBookingHours: 4,
      securityDeposit: 0
    },
    // Entertainer-specific fields
    entertainerType: "",
    serviceDetails: {
      businessName: "",
      description: "",
      ageGroups: [],
      specialRequirements: ""
    },
    serviceArea: {
      baseLocation: "",
      postcode: "",
      travelRadius: 10,
      travelFee: 0
    },
    entertainerPricing: {
      basePrice: 0,
      pricingType: "per_hour",
      minimumDuration: 1,
      additionalInfo: ""
    },
    verificationDocuments: {
      dbs: { file: null, fileName: '', uploaded: false },
      id: { file: null, fileName: '', uploaded: false },
      address: { file: null, fileName: '', uploaded: false }
    },
    // Shared fields
    calendar: {
      connected: false,
      provider: null, // 'google' or 'outlook'
      tokens: null,
      userEmail: null,
      userName: null,
      isWorkspaceAccount: false,
      workspaceDomain: null,
      blockedDates: [],
      eventsSynced: 0,
      connectedAt: null
    }
  })

  // Calculate total steps based on supplier type (use useMemo to recalculate when supplier type changes)
  // Entertainment: 10 steps (Type, Account, Entertainer Type, Service Details, Service Area, Photos, Pricing, Verification, Calendar, Review)
  // Venues: 11 steps
  const TOTAL_STEPS = wizardData.supplierType === 'entertainment' ? 10 : 11

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        console.log('📋 Loading saved wizard data:', parsedData)
        setWizardData(parsedData.data)
        setCurrentStep(parsedData.currentStep || parsedData.step || 1)
        setUserId(parsedData.userId || null)
        setSupplierId(parsedData.supplierId || null)
      } catch (e) {
        console.error('Failed to load saved data:', e)
      }
    }
  }, [])

  // Check for OAuth calendar callback and restore wizard state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    // Prevent double processing for OAuth
    if (sessionStorage.getItem('oauthProcessed')) {
      return
    }

    const calendarConnected = urlParams.get('calendar_connected')
    const calendarError = urlParams.get('calendar_error')
    const provider = urlParams.get('provider') // 'google' or 'outlook'
    const errorDetails = urlParams.get('details')

    // Only process if there are OAuth params
    if (!calendarConnected && !calendarError) {
      return
    }

    // Mark as processed
    sessionStorage.setItem('oauthProcessed', 'true')

    // Handle calendar connection error
    if (calendarError) {
      console.error('Calendar connection error:', calendarError, errorDetails)
      alert(`Calendar connection failed: ${calendarError}\n${errorDetails || ''}`)

      // Restore wizard state
      const savedWizardState = localStorage.getItem('wizardBeforeOAuth')
      if (savedWizardState) {
        try {
          const { data, step } = JSON.parse(savedWizardState)
          setWizardData(data)
          setCurrentStep(step)
          localStorage.removeItem('wizardBeforeOAuth')
        } catch (e) {
          console.error('Failed to restore wizard state:', e)
        }
      }

      // Clear URL parameters
      window.history.replaceState({}, '', window.location.pathname)
      sessionStorage.removeItem('oauthProcessed')
      return
    }

    // Handle successful calendar connection
    if (calendarConnected === 'true') {
      console.log('✅ Calendar OAuth callback detected:', provider)

      const eventsSynced = urlParams.get('events_synced') || '0'

      // Restore wizard state from before OAuth redirect (or from main storage)
      let savedState = localStorage.getItem('wizardBeforeOAuth')

      // If no wizardBeforeOAuth, try the main storage
      if (!savedState) {
        savedState = localStorage.getItem(STORAGE_KEY)
      }

      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          const data = parsed.data || parsed
          const step = parsed.step || currentStep
          const savedUserId = parsed.userId
          const savedSupplierId = parsed.supplierId

          console.log('📦 Restoring wizard state from storage:', {
            step,
            supplierType: data.supplierType,
            userId: savedUserId,
            supplierId: savedSupplierId
          })

          // Update wizard data with restored state AND calendar data
          setWizardData({
            ...data,
            calendar: {
              connected: true,
              provider: provider || 'google',
              eventsSynced: parseInt(eventsSynced),
              connectedAt: new Date().toISOString()
            }
          })

          // Restore current step and IDs
          setCurrentStep(step)
          if (savedUserId) setUserId(savedUserId)
          if (savedSupplierId) setSupplierId(savedSupplierId)

          console.log(`✅ Calendar connected successfully! ${eventsSynced} events synced`)

          localStorage.removeItem('wizardBeforeOAuth')
        } catch (e) {
          console.error('Failed to restore wizard state:', e)
        }
      } else {
        console.warn('⚠️ No saved wizard state found before OAuth')
        // Fallback: just update calendar
        setWizardData({
          ...wizardData,
          calendar: {
            connected: true,
            provider: provider || 'google',
            eventsSynced: parseInt(eventsSynced),
            connectedAt: new Date().toISOString()
          }
        })
      }

      // Clean up
      sessionStorage.removeItem('oauthProcessed')

      // Clear URL parameters
      setTimeout(() => {
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }, 100)
    }
  }, [])

  // Auto-save data on changes
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: wizardData,
        step: currentStep,
        userId: userId,
        supplierId: supplierId,
        lastSaved: new Date().toISOString()
      }))
    }

    const timeout = setTimeout(saveData, 500)
    return () => clearTimeout(timeout)
  }, [wizardData, currentStep, userId, supplierId])

  const handleNext = async () => {
    console.log('🔄 handleNext called - Current step:', currentStep, 'Total steps:', TOTAL_STEPS)
    console.log('🔄 Current wizard data:', {
      supplierType: wizardData.supplierType,
      photos: wizardData.photos?.length,
      entertainerType: wizardData.entertainerType,
      businessName: wizardData.serviceDetails?.businessName,
      supplierId: supplierId
    })

    // Step 2: Create account and supplier record
    if (currentStep === 2) {
      await handleAccountCreation()
      return
    }

    // Update supplier record for all steps between account creation and final review
    // For venues: steps 3-10 (final step is 11)
    // For entertainers: steps 3-9 (final step is 10)
    const isLastStep = currentStep === TOTAL_STEPS
    const shouldUpdate = currentStep >= 3 && !isLastStep

    console.log('🔍 handleNext - Save logic check:', {
      currentStep,
      TOTAL_STEPS,
      isLastStep,
      shouldUpdate,
      supplierId,
      supplierType: wizardData.supplierType,
      photosCount: wizardData.photos?.length,
      hasVerificationDocs: {
        dbs: wizardData.verificationDocuments?.dbs?.uploaded,
        id: wizardData.verificationDocuments?.id?.uploaded,
        address: wizardData.verificationDocuments?.address?.uploaded
      }
    })

    if (shouldUpdate) {
      if (!supplierId) {
        console.error('❌ No supplierId found! Cannot save data.')
        console.log('Current state:', { userId, supplierId, currentStep })
        alert('Error: No supplier profile found. Please refresh and try again.')
        return
      }

      // For step 8 (verification documents), wait a moment to ensure uploads have completed
      if (currentStep === 8 && wizardData.supplierType === 'entertainment') {
        console.log('⏳ Waiting for verification documents to finish uploading...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`💾 Saving step ${currentStep} data to database...`)

      try {
        await updateSupplierRecord()
        console.log(`✅ Step ${currentStep} data saved successfully`)
      } catch (error) {
        console.error(`❌ Error saving step ${currentStep}:`, error)
        alert(`Error saving data: ${error.message}. Please try again.`)
        return
      }
    } else {
      console.log(`⏭️  Skipping save for step ${currentStep} (shouldUpdate: ${shouldUpdate})`)
    }

    // Navigate to next step or complete wizard
    if (currentStep < TOTAL_STEPS) {
      let nextStep = currentStep + 1

      // Skip step 2 (account creation) if account already exists
      if (nextStep === 2 && userId) {
        console.log('⏭️ Skipping account creation step - account already exists')
        nextStep = 3
      }

      console.log('➡️ Moving to step:', nextStep)
      setCurrentStep(nextStep)
      window.scrollTo(0, 0)
    } else {
      // Final step - just mark as complete, data already saved from previous steps
      console.log('🎉 Final step - marking onboarding as complete (data already saved)')
      await completeWizard()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const targetStep = currentStep - 1

      // Prevent going back to account creation step (step 2) if account already created
      if (targetStep === 2 && userId) {
        // Skip step 2, go directly to step 1
        setCurrentStep(1)
      } else {
        setCurrentStep(targetStep)
      }
      window.scrollTo(0, 0)
    }
  }

  const handleSaveExit = () => {
    // Data is already auto-saved to database
    if (userId) {
      console.log('💾 Progress saved. Redirecting to dashboard...')
      router.push('/suppliers/dashboard')
    } else {
      // No account yet, just saved to localStorage
      alert('Your progress has been saved locally. Create an account in step 2 to continue!')
    }
  }

  const handleAccountCreation = async () => {
    try {
      console.log('🔐 Creating account at step 2...')

      // Prepare terms acceptance data
      const termsData = {
        terms_version: "1.0",
        privacy_version: "1.0",
        ip_address: "0.0.0.0",
        user_agent: navigator.userAgent,
        accepted_at: new Date().toISOString()
      }

      // Save to onboarding_drafts table
      const draftData = {
        email: wizardData.account.email,
        your_name: wizardData.account.fullName,
        business_name: wizardData.account.fullName, // Temporary, will update with venue name later
        phone: wizardData.account.phone || null,
        postcode: "", // Will add later
        supplier_type: wizardData.supplierType,
        terms_accepted: termsData
      }

      const { error: draftError } = await supabase
        .from("onboarding_drafts")
        .insert(draftData)

      if (draftError && draftError.code !== '23505') {
        throw draftError
      }

      // Create Supabase auth user with email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: wizardData.account.email,
        password: wizardData.account.password,
        options: {
          emailRedirectTo: `${window.location.origin}/suppliers/onboarding/email-verified`,
          data: {
            user_type: 'supplier',
            full_name: wizardData.account.fullName,
            phone: wizardData.account.phone || null,
            supplier_type: wizardData.supplierType
          }
        }
      })

      if (authError) {
        console.error('❌ Auth signup error:', authError)
        if (authError.message === 'User already registered') {
          alert("An account with this email already exists. Please try signing in instead.")
        } else {
          alert(`Account creation failed: ${authError.message}`)
        }
        return
      }

      console.log('✅ Auth user created:', authData.user?.id)
      setUserId(authData.user.id)

      // Check if email verification is required FIRST
      if (authData.user && !authData.session) {
        console.log('📧 Email verification required - not creating supplier yet')

        // Save wizard state so they can resume after email verification
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          data: wizardData,
          userId: authData.user.id,
          supplierId: null, // No supplier yet
          currentStep: 2,
          timestamp: Date.now(),
          termsData: termsData // Save terms data for later
        }))

        // Redirect to check-email page
        router.push(`/suppliers/onboarding/check-email?email=${encodeURIComponent(wizardData.account.email)}`)
        return
      }

      // If we get here, email is verified (or verification not required)
      // NOW create the supplier profile
      const supplierData = {
        name: wizardData.account.fullName,
        businessName: wizardData.account.fullName,
        serviceType: wizardData.supplierType,
        category: wizardData.supplierType,
        location: "",
        owner: {
          name: wizardData.account.fullName,
          email: wizardData.account.email,
          phone: wizardData.account.phone || "",
        },
        contactInfo: {
          email: wizardData.account.email,
          phone: wizardData.account.phone || "",
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
        // Store notification preferences
        notifications: wizardData.account.notifications || {
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
        auth_user_id: authData.user.id,
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
        console.error('❌ Failed to create supplier profile:', supplierError)
        throw new Error('Failed to create supplier profile. Please contact support.')
      }

      console.log('✅ Supplier profile created:', newSupplier.id)
      setSupplierId(newSupplier.id)

      // Save terms acceptance
      await supabase
        .from('terms_acceptances')
        .insert({
          user_id: authData.user.id,
          user_email: wizardData.account.email,
          terms_version: termsData.terms_version,
          privacy_version: termsData.privacy_version,
          ip_address: termsData.ip_address,
          user_agent: termsData.user_agent,
          accepted_at: termsData.accepted_at
        })

      console.log('✅ Account created successfully! Moving to next step...')

      // Move to next step
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)

    } catch (error) {
      console.error('💥 Error during account creation:', error)
      alert(error.message || 'An unexpected error occurred. Please try again.')
    }
  }

  const updateSupplierRecord = async () => {
    if (!supplierId) {
      console.error('❌ updateSupplierRecord called without supplierId')
      return
    }

    const isVenue = wizardData.supplierType === 'venues'
    const isEntertainer = wizardData.supplierType === 'entertainment'

    try {
      console.log('💾 Updating supplier record...', supplierId)
      console.log('📊 Supplier type:', wizardData.supplierType)

      // Get current supplier data
      const { data: currentSupplier, error: fetchError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', supplierId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching supplier:', fetchError)
        throw fetchError
      }

      console.log('📦 Fetched current supplier data from DB')
      console.log('📦 Has verification in DB?', !!currentSupplier.data?.verification)
      console.log('📦 Verification docs:', currentSupplier.data?.verification?.documents ? Object.keys(currentSupplier.data.verification.documents) : [])

      let updatedData = { ...currentSupplier.data }

      // VENUE DATA UPDATE
      if (isVenue) {
        updatedData = {
          ...currentSupplier.data, // This preserves notifications and other existing fields
          venueType: wizardData.venueType || currentSupplier.data.venueType,
          venueAddress: wizardData.venueAddress?.businessName ? wizardData.venueAddress : currentSupplier.data.venueAddress,
          name: wizardData.venueAddress?.businessName || currentSupplier.data.name,
          businessName: wizardData.venueAddress?.businessName || currentSupplier.data.businessName,
          location: wizardData.venueAddress?.postcode || currentSupplier.data.location,
          contactInfo: {
            ...currentSupplier.data.contactInfo,
            postcode: wizardData.venueAddress?.postcode || currentSupplier.data.contactInfo?.postcode
          },
          serviceDetails: (wizardData.venueType || wizardData.photos?.length > 0) ? {
            venueType: wizardData.venueType || currentSupplier.data.serviceDetails?.venueType,
            venueAddress: wizardData.venueAddress?.businessName ? wizardData.venueAddress : currentSupplier.data.serviceDetails?.venueAddress,
            capacity: wizardData.capacity?.max > 0 ? wizardData.capacity : currentSupplier.data.serviceDetails?.capacity,
            facilities: wizardData.facilities?.length > 0 ? wizardData.facilities : currentSupplier.data.serviceDetails?.facilities || [],
            restrictedItems: wizardData.restrictedItems || currentSupplier.data.serviceDetails?.restrictedItems || [],
            pricing: wizardData.pricing?.hourlyRate > 0 ? wizardData.pricing : currentSupplier.data.serviceDetails?.pricing,
            photos: wizardData.photos?.length > 0 ? wizardData.photos : currentSupplier.data.serviceDetails?.photos || [],
          } : currentSupplier.data.serviceDetails,
          portfolioImages: wizardData.photos?.length > 0 ? wizardData.photos : currentSupplier.data.portfolioImages || [],
          image: wizardData.photos?.length > 0 ? wizardData.photos[0].src : currentSupplier.data.image,
          coverPhoto: wizardData.photos?.length > 0 ? wizardData.photos[0].src : currentSupplier.data.coverPhoto,
          priceFrom: wizardData.pricing?.hourlyRate || currentSupplier.data.priceFrom,
          // Preserve existing calendar data
          unavailableDates: currentSupplier.data.unavailableDates || [],
          busyDates: currentSupplier.data.busyDates || [],
          googleCalendarSync: currentSupplier.data.googleCalendarSync || undefined,
          calendarIntegration: currentSupplier.data.calendarIntegration || {
            enabled: false,
            provider: null,
            connectedAt: null,
            eventsSynced: 0
          },
          updatedAt: new Date().toISOString()
        }
      }

      // ENTERTAINER DATA UPDATE
      if (isEntertainer) {
        updatedData = {
          ...currentSupplier.data, // This preserves notifications and other existing fields
          entertainerType: wizardData.entertainerType || currentSupplier.data.entertainerType,
          name: wizardData.serviceDetails?.businessName || wizardData.account?.fullName || currentSupplier.data.name,
          businessName: wizardData.serviceDetails?.businessName || wizardData.account?.fullName || currentSupplier.data.businessName,
          location: wizardData.serviceArea?.postcode || currentSupplier.data.location,
          contactInfo: {
            ...currentSupplier.data.contactInfo,
            postcode: wizardData.serviceArea?.postcode || currentSupplier.data.contactInfo?.postcode
          },
          description: wizardData.serviceDetails?.description || currentSupplier.data.description,
          businessDescription: wizardData.serviceDetails?.description || currentSupplier.data.businessDescription,
          // Photos
          portfolioImages: wizardData.photos?.length > 0 ? wizardData.photos : currentSupplier.data.portfolioImages || [],
          image: wizardData.photos?.length > 0 ? wizardData.photos[0].src : currentSupplier.data.image,
          coverPhoto: wizardData.photos?.length > 0 ? wizardData.photos[0].src : currentSupplier.data.coverPhoto,
          serviceDetails: {
            ...currentSupplier.data.serviceDetails,
            entertainerType: wizardData.entertainerType || currentSupplier.data.serviceDetails?.entertainerType,
            businessName: wizardData.serviceDetails?.businessName || currentSupplier.data.serviceDetails?.businessName,
            description: wizardData.serviceDetails?.description || currentSupplier.data.serviceDetails?.description,
            ageGroups: wizardData.serviceDetails?.ageGroups || currentSupplier.data.serviceDetails?.ageGroups || [],
            specialRequirements: wizardData.serviceDetails?.specialRequirements || currentSupplier.data.serviceDetails?.specialRequirements,
            serviceArea: {
              baseLocation: wizardData.serviceArea?.baseLocation || currentSupplier.data.serviceDetails?.serviceArea?.baseLocation,
              postcode: wizardData.serviceArea?.postcode || currentSupplier.data.serviceDetails?.serviceArea?.postcode,
              travelRadius: wizardData.serviceArea?.travelRadius || currentSupplier.data.serviceDetails?.serviceArea?.travelRadius || 10,
              travelFee: wizardData.serviceArea?.travelFee || currentSupplier.data.serviceDetails?.serviceArea?.travelFee || 0
            },
            pricing: {
              basePrice: wizardData.entertainerPricing?.basePrice || currentSupplier.data.serviceDetails?.pricing?.basePrice || 0,
              pricingType: wizardData.entertainerPricing?.pricingType || currentSupplier.data.serviceDetails?.pricing?.pricingType || 'per_hour',
              minimumDuration: wizardData.entertainerPricing?.minimumDuration || currentSupplier.data.serviceDetails?.pricing?.minimumDuration || 1,
              additionalInfo: wizardData.entertainerPricing?.additionalInfo || currentSupplier.data.serviceDetails?.pricing?.additionalInfo || ''
            },
            photos: wizardData.photos?.length > 0 ? wizardData.photos : currentSupplier.data.serviceDetails?.photos || []
          },
          priceFrom: wizardData.entertainerPricing?.basePrice || currentSupplier.data.priceFrom,
          priceUnit: wizardData.entertainerPricing?.pricingType === 'per_hour' ? 'per hour' : 'per event',
          // Preserve existing calendar data
          unavailableDates: currentSupplier.data.unavailableDates || [],
          busyDates: currentSupplier.data.busyDates || [],
          googleCalendarSync: currentSupplier.data.googleCalendarSync || undefined,
          calendarIntegration: currentSupplier.data.calendarIntegration || {
            enabled: false,
            provider: null,
            connectedAt: null,
            eventsSynced: 0
          },
          // Preserve verification data that was uploaded via API
          verification: currentSupplier.data.verification || undefined,
          updatedAt: new Date().toISOString()
        }
      }

      console.log('💾 Saving updated data to Supabase...')
      console.log('📊 Data being saved:', {
        businessName: updatedData.businessName,
        entertainerType: updatedData.entertainerType,
        photos: updatedData.portfolioImages?.length,
        pricing: updatedData.priceFrom,
        hasVerification: !!updatedData.verification,
        verificationDocs: updatedData.verification?.documents ? Object.keys(updatedData.verification.documents) : []
      })

      const { error: updateError } = await supabase
        .from('suppliers')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplierId)

      if (updateError) {
        console.error('❌ Error updating supplier:', updateError)
        throw updateError
      } else {
        console.log('✅ Supplier record updated successfully')
        console.log('✅ Saved data includes:', {
          businessName: updatedData.businessName,
          photos: updatedData.portfolioImages?.length,
          pricing: updatedData.priceFrom,
          verification: !!updatedData.verification
        })
      }

    } catch (error) {
      console.error('❌ Error in updateSupplierRecord:', error)
      throw error
    }
  }

  const completeWizard = async () => {
    try {
      console.log('🎉 Completing wizard...')

      if (!supplierId) {
        alert('Something went wrong. Please try again.')
        return
      }

      // Fetch current supplier data from database
      console.log('📦 Fetching current supplier data for completion...')
      const { data: currentSupplier, error: fetchError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', supplierId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching supplier for completion:', fetchError)
        throw fetchError
      }

      console.log('📊 Current supplier data from DB:', {
        businessName: currentSupplier.data?.businessName,
        photos: currentSupplier.data?.portfolioImages?.length,
        venueType: currentSupplier.data?.venueType,
        pricing: currentSupplier.data?.priceFrom,
        calendarConnected: currentSupplier.data?.calendarIntegration?.enabled,
        hasServiceDetails: !!currentSupplier.data?.serviceDetails,
        hasVerification: !!currentSupplier.data?.verification,
        verificationDocs: currentSupplier.data?.verification?.documents ? Object.keys(currentSupplier.data.verification.documents) : []
      })

      // Mark supplier as complete - PRESERVE ALL EXISTING DATA
      const updatedData = {
        ...currentSupplier.data,
        onboardingCompleted: true,
        isComplete: true,
        description: currentSupplier.data.businessDescription || currentSupplier.data.description || "Venue ready for bookings",
        businessDescription: currentSupplier.data.businessDescription || currentSupplier.data.description || "Venue ready for bookings",
        updatedAt: new Date().toISOString()
      }

      console.log('💾 Marking supplier as complete...')
      console.log('✅ Data to be saved includes:', {
        businessName: updatedData.businessName,
        photos: updatedData.portfolioImages?.length,
        pricing: updatedData.priceFrom,
        serviceDetails: !!updatedData.serviceDetails
      })

      const { error: updateError } = await supabase
        .from('suppliers')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplierId)

      if (updateError) {
        console.error('❌ Error marking supplier as complete:', updateError)
        throw updateError
      }

      console.log('✅ Supplier marked as complete!')

      // Clean up
      await supabase
        .from("onboarding_drafts")
        .delete()
        .eq("email", wizardData.account.email)

      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem('justCompletedOnboarding', 'true')

      // Redirect to dashboard
      console.log('🚀 Redirecting to dashboard...')
      router.push('/suppliers/dashboard')

    } catch (error) {
      console.error('❌ Error completing wizard:', error)
      alert('Error completing setup. Please try again.')
    }
  }

  const handleCalendarConnect = async (provider) => {
    try {
      console.log(`Connecting to ${provider} calendar with user ID:`, userId)

      if (!userId) {
        alert('Please create your account first before connecting calendar.')
        return
      }

      if (provider === 'google') {
        // Trigger Google OAuth flow
        const response = await fetch('/api/auth/google-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: `wizard-${userId}`, // Prefix to indicate wizard flow
            isOnboarding: true,
            email: wizardData.account.email
          })
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log('Auth URL received:', data.authUrl)

        if (!data.authUrl) {
          throw new Error('No auth URL returned from API')
        }

        // Save current wizard state before redirect
        localStorage.setItem('wizardBeforeOAuth', JSON.stringify({
          data: wizardData,
          step: currentStep,
          timestamp: Date.now()
        }))

        // Redirect to Google OAuth
        window.location.href = data.authUrl

      } else if (provider === 'outlook') {
        // Trigger Outlook OAuth flow
        const response = await fetch('/api/auth/outlook-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: `wizard-${userId}`, // Prefix to indicate wizard flow
            isOnboarding: true,
            email: wizardData.account.email
          })
        })

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.authUrl) {
          throw new Error('No auth URL returned from API')
        }

        // Save current wizard state before redirect
        localStorage.setItem('wizardBeforeOAuth', JSON.stringify({
          data: wizardData,
          step: currentStep,
          timestamp: Date.now()
        }))

        // Redirect to Outlook OAuth
        window.location.href = data.authUrl
      }

    } catch (error) {
      console.error('Calendar connection error:', error)
      alert('Failed to connect calendar. You can set this up later.')
    }
  }

  const handleCalendarSkip = () => {
    setWizardData({
      ...wizardData,
      calendar: {
        connected: false,
        provider: null
      }
    })
  }

  const isStepValid = () => {
    const isVenue = wizardData.supplierType === 'venues'
    const isEntertainer = wizardData.supplierType === 'entertainment'

    // Shared steps
    if (currentStep === 1) {
      return wizardData.supplierType !== ""
    }

    if (currentStep === 2) {
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      return (
        wizardData.account.fullName &&
        wizardData.account.email &&
        isValidEmail(wizardData.account.email) &&
        wizardData.account.password &&
        wizardData.account.password.length >= 6 &&
        wizardData.account.password === wizardData.account.confirmPassword &&
        wizardData.account.agreedToTerms &&
        wizardData.account.phone &&
        wizardData.account.phone.trim().length > 0
      )
    }

    // VENUE VALIDATION
    if (isVenue) {
      switch (currentStep) {
        case 3: // Venue Type
          return wizardData.venueType !== ""
        case 4: // Venue Address
          return (
            wizardData.venueAddress.businessName &&
            wizardData.venueAddress.addressLine1 &&
            wizardData.venueAddress.city &&
            wizardData.venueAddress.postcode
          )
        case 5: // Capacity
          return wizardData.capacity.max > 0
        case 6: // Amenities
          return true // Optional
        case 7: // Restrictions
          return true // Optional
        case 8: // Photos
          return wizardData.photos.length >= 5
        case 9: // Pricing
          return wizardData.pricing.hourlyRate > 0
        case 10: // Calendar
          return true // Optional
        case 11: // Review & Complete
          return true
        default:
          return true
      }
    }

    // ENTERTAINER VALIDATION
    if (isEntertainer) {
      switch (currentStep) {
        case 3: // Entertainer Type
          return wizardData.entertainerType !== ""
        case 4: // Service Details
          return (
            wizardData.serviceDetails.businessName &&
            wizardData.serviceDetails.businessName.trim().length > 0 &&
            wizardData.serviceDetails.description &&
            wizardData.serviceDetails.description.length >= 50 &&
            wizardData.serviceDetails.ageGroups &&
            wizardData.serviceDetails.ageGroups.length > 0
          )
        case 5: // Service Area
          return (
            wizardData.serviceArea.baseLocation &&
            wizardData.serviceArea.postcode &&
            wizardData.serviceArea.travelRadius > 0
          )
        case 6: // Photos
          return wizardData.photos.length >= 3 // Minimum 3 photos for entertainers
        case 7: // Pricing
          return wizardData.entertainerPricing.basePrice > 0
        case 8: // Verification Documents
          return (
            wizardData.verificationDocuments.dbs?.uploaded &&
            wizardData.verificationDocuments.id?.uploaded &&
            wizardData.verificationDocuments.address?.uploaded
          )
        case 9: // Calendar
          return true // Optional
        case 10: // Review & Complete
          return true
        default:
          return true
      }
    }

    return true
  }

  const renderStep = () => {
    const isVenue = wizardData.supplierType === 'venues'
    const isEntertainer = wizardData.supplierType === 'entertainment'

    console.log('🎨 Rendering step:', currentStep, 'Supplier type:', wizardData.supplierType, 'isEntertainer:', isEntertainer)

    // Steps 1-2 are shared for all supplier types
    if (currentStep === 1) {
      return (
        <SupplierTypeStep
          selectedType={wizardData.supplierType}
          onSelect={(type) => setWizardData({ ...wizardData, supplierType: type })}
        />
      )
    }

    if (currentStep === 2) {
      return (
        <AccountCreationStep
          accountData={wizardData.account}
          onChange={(account) => setWizardData({ ...wizardData, account })}
        />
      )
    }

    // VENUE FLOW (11 steps total)
    if (isVenue) {
      switch (currentStep) {
        case 3: // Venue Type
          return (
            <VenueTypeStep
              selectedType={wizardData.venueType}
              onSelect={(type) => setWizardData({ ...wizardData, venueType: type })}
            />
          )
        case 4: // Venue Address
          return (
            <VenueAddressStep
              venueData={wizardData.venueAddress}
              onChange={(address) => setWizardData({ ...wizardData, venueAddress: address })}
            />
          )
        case 5: // Capacity
          return (
            <VenueCapacityStep
              capacity={wizardData.capacity}
              onChange={(capacity) => setWizardData({ ...wizardData, capacity })}
            />
          )
        case 6: // Amenities
          return (
            <VenueAmenitiesStep
              selectedAmenities={wizardData.facilities}
              onChange={(facilities) => setWizardData({ ...wizardData, facilities })}
            />
          )
        case 7: // Restrictions
          return (
            <VenueRestrictionsStep
              restrictedItems={wizardData.restrictedItems}
              onChange={(restrictedItems) => setWizardData({ ...wizardData, restrictedItems })}
            />
          )
        case 8: // Photos
          return (
            <VenuePhotosStep
              photos={wizardData.photos}
              onChange={(photos) => setWizardData({ ...wizardData, photos })}
            />
          )
        case 9: // Pricing
          return (
            <VenuePricingStep
              pricing={wizardData.pricing}
              onChange={(pricing) => setWizardData({ ...wizardData, pricing })}
            />
          )
        case 10: // Calendar
          return (
            <CalendarConnectionStep
              connectedCalendar={wizardData.calendar.provider}
              onConnect={handleCalendarConnect}
              onSkip={handleCalendarSkip}
              eventsSynced={wizardData.calendar.eventsSynced || 0}
            />
          )
        case 11: // Review & Complete
          return (
            <div className="py-12 text-center max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
                  You're all set!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Your venue profile is complete and ready to submit.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  What happens next?
                </h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                      1
                    </div>
                    <p className="text-sm">
                      Our team will <strong>review your profile within 24 hours</strong> to ensure everything meets our quality standards.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                      2
                    </div>
                    <p className="text-sm">
                      You'll receive an <strong>email notification</strong> once your venue is approved and live on our platform.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                      3
                    </div>
                    <p className="text-sm">
                      Once live, customers will be able to <strong>find and book your venue</strong> for their events!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    // ENTERTAINER FLOW (10 steps total)
    if (isEntertainer) {
      switch (currentStep) {
        case 3: // Entertainer Type
          return (
            <EntertainerTypeStep
              selectedType={wizardData.entertainerType}
              onSelect={(type) => setWizardData({ ...wizardData, entertainerType: type })}
            />
          )
        case 4: // Service Details
          return (
            <ServiceDetailsStep
              serviceDetails={wizardData.serviceDetails}
              onChange={(details) => setWizardData({ ...wizardData, serviceDetails: details })}
            />
          )
        case 5: // Service Area
          return (
            <ServiceAreaStep
              serviceArea={wizardData.serviceArea}
              onChange={(area) => setWizardData({ ...wizardData, serviceArea: area })}
            />
          )
        case 6: // Photos
          return (
            <VenuePhotosStep
              photos={wizardData.photos}
              onChange={(photos) => setWizardData({ ...wizardData, photos })}
            />
          )
        case 7: // Pricing
          return (
            <PricingPackagesStep
              pricing={wizardData.entertainerPricing}
              onChange={(pricing) => setWizardData({ ...wizardData, entertainerPricing: pricing })}
            />
          )
        case 8: // Verification Documents
          return (
            <VerificationDocumentsStep
              documents={wizardData.verificationDocuments}
              onChange={(docs) => setWizardData({ ...wizardData, verificationDocuments: docs })}
              userId={userId}
              supplierId={supplierId}
            />
          )
        case 9: // Calendar
          return (
            <CalendarConnectionStep
              connectedCalendar={wizardData.calendar.provider}
              onConnect={handleCalendarConnect}
              onSkip={handleCalendarSkip}
              eventsSynced={wizardData.calendar.eventsSynced || 0}
            />
          )
        case 10: // Review & Complete
          return (
            <div className="py-12 text-center max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
                  You're all set!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Your profile is complete and ready to submit.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  What happens next?
                </h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                      1
                    </div>
                    <p className="text-sm">
                      Our team will <strong>review your profile and verification documents within 24 hours</strong> to ensure everything meets our quality and safety standards.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                      2
                    </div>
                    <p className="text-sm">
                      You'll receive an <strong>email notification</strong> once you're approved and live on our platform.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                      3
                    </div>
                    <p className="text-sm">
                      Once live, customers will be able to <strong>find and book your services</strong> for their events!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    return null
  }

  return (
    <WizardLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      onNext={handleNext}
      onSaveExit={handleSaveExit}
      nextDisabled={!isStepValid()}
      showBack={currentStep > 1}
      nextLabel={currentStep === TOTAL_STEPS ? "Complete Profile" : "Next"}
    >
      {renderStep()}
    </WizardLayout>
  )
}
