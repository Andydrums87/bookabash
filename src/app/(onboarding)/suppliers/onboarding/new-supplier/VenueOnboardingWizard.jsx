"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import CompanyNameStep from "@/components/onboarding/steps/entertainer/CompanyNameStep"
import AboutServiceStep from "@/components/onboarding/steps/entertainer/AboutServiceStep"
import ServiceAreaStep from "@/components/onboarding/steps/entertainer/ServiceAreaStep"
import PricingPackagesStep from "@/components/onboarding/steps/entertainer/PricingPackagesStep"
import VerificationDocumentsStep from "@/components/onboarding/steps/entertainer/VerificationDocumentsStep"
import CalendarConnectionStep from "@/components/onboarding/steps/CalendarConnectionStep"
import AccountCreationStep from "@/components/onboarding/steps/AccountCreationStep"
// Cake supplier steps (initial onboarding)
import CakeBusinessStep from "@/components/onboarding/steps/cake/CakeBusinessStep"
import CakeLocationStep from "@/components/onboarding/steps/cake/CakeLocationStep"
import CakeCollectionStep from "@/components/onboarding/steps/cake/CakeCollectionStep"
import CakeDeliveryStep from "@/components/onboarding/steps/cake/CakeDeliveryStep"
import CakeLeadTimeStep from "@/components/onboarding/steps/cake/CakeLeadTimeStep"
// Cake product steps (add cake wizard)
import CakeNameStep from "@/components/onboarding/steps/cake/CakeNameStep"
import CakeAboutStep from "@/components/onboarding/steps/cake/CakeAboutStep"
import CakeFlavoursStep from "@/components/onboarding/steps/cake/CakeFlavoursStep"
import CakeDietaryStep from "@/components/onboarding/steps/cake/CakeDietaryStep"
import CakePackagesStep from "@/components/onboarding/steps/cake/CakePackagesStep"
import CakeThemesStep from "@/components/onboarding/steps/cake/CakeThemesStep"

const STORAGE_KEY = 'supplierOnboardingData'

// Helper to normalize category names to match database conventions
// e.g., 'cakes' -> 'Cakes', 'entertainment' -> 'Entertainment', 'venues' -> 'Venues'
const normalizeCategory = (supplierType) => {
  const categoryMap = {
    'cakes': 'Cakes',
    'entertainment': 'Entertainment',
    'venues': 'Venues',
    'decorations': 'Decorations',
    'catering': 'Catering',
    'photography': 'Photography',
    'party-bags': 'Party Bags',
  }
  return categoryMap[supplierType?.toLowerCase()] || supplierType
}

export default function VenueOnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  const isNewBusinessMode = searchParams.get('newBusiness') === 'true' // Creating new business as existing user
  const resumeBusinessId = searchParams.get('businessId') // Resume incomplete business by ID
  const productType = searchParams.get('productType') // 'cake' when adding a new cake product
  const isAddingCakeProduct = productType === 'cake' && isNewBusinessMode
  const [currentStep, setCurrentStep] = useState(isEditMode ? 3 : 1) // Start at step 3 in edit mode
  const [userId, setUserId] = useState(null) // Auth user ID after account creation
  const [supplierId, setSupplierId] = useState(null) // Supplier record ID
  const [editModeLoaded, setEditModeLoaded] = useState(false)
  const [newBusinessModeLoaded, setNewBusinessModeLoaded] = useState(false)
  const [resumeBusinessLoaded, setResumeBusinessLoaded] = useState(false)
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
    // Cake supplier-specific fields
    cakeBusinessDetails: {
      businessName: "",
      phone: "",
      postcode: "",
      city: "",
      fullAddress: "",
      latitude: null,
      longitude: null
    },
    cakeFulfilment: {
      offersPickup: true,
      offersDelivery: false,
      deliveryRadius: 10,
      deliveryFee: 0,
      collectionHours: {
        monday: { open: true, from: '09:00', to: '17:00' },
        tuesday: { open: true, from: '09:00', to: '17:00' },
        wednesday: { open: true, from: '09:00', to: '17:00' },
        thursday: { open: true, from: '09:00', to: '17:00' },
        friday: { open: true, from: '09:00', to: '17:00' },
        saturday: { open: true, from: '10:00', to: '16:00' },
        sunday: { open: false, from: '10:00', to: '16:00' }
      }
    },
    cakeLeadTime: {
      minimum: 7
    },
    // Cake product fields (for adding individual cakes)
    parentBusinessId: null, // ID of the primary cake business (for linking products)
    cakeProductName: "",
    cakeProductDescription: "", // About this cake
    cakeProductPhotos: [],
    cakeProductFlavours: [], // Array of flavour strings
    cakeProductDietaryInfo: [], // Array of dietary option IDs
    cakeProductThemes: [],
    cakeProductPackages: [
      { id: '1', name: '', price: '', serves: '', tiers: '', sizeInches: '', deliveryFee: '' }
    ],
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
  // Entertainment: 11 steps (Type, Account, Entertainer Type, Company Name, About Service, Service Area, Photos, Pricing, Verification, Calendar, Review)
  // Venues: 11 steps
  // Cakes: 8 steps (Type, Account, Business Details, Location, Fulfilment, FulfilmentDetails, Lead Times, Complete)
  // Add Cake Product: 8 steps (Name, About, Photos, Flavours, Dietary, Themes, Packages, Complete)
  const isCake = wizardData.supplierType === 'cakes'
  // Cake business onboarding: 8 steps (Type, Account, Business, Location, Fulfilment, FulfilmentDetails, LeadTime, Complete)
  const TOTAL_STEPS = isAddingCakeProduct ? 8 : (isCake ? 8 : (wizardData.supplierType === 'entertainment' ? 11 : 11))

  // Load saved data on mount OR load current business data in edit mode
  useEffect(() => {
    const loadData = async () => {
      // If resuming an incomplete business by ID
      if (resumeBusinessId && !resumeBusinessLoaded) {
        try {
          console.log('🔄 Resuming incomplete business:', resumeBusinessId)

          // Get current user
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.error('No authenticated user found')
            router.push('/suppliers/onboarding')
            return
          }

          setUserId(user.id)

          // Load the specific business by ID
          const { data: supplier, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', resumeBusinessId)
            .eq('auth_user_id', user.id) // Security: only allow user's own businesses
            .single()

          if (error || !supplier) {
            console.error('Business not found:', error)
            router.push('/suppliers/listings')
            return
          }

          setSupplierId(supplier.id)
          console.log('✅ Loaded incomplete business:', supplier.id, supplier.data?.businessName)

          // Map supplier data to wizard format
          const supplierData = supplier.data || {}
          const isVenue = supplierData.serviceType === 'venues' || supplierData.category === 'venues'

          setWizardData(prev => ({
            ...prev,
            supplierType: supplierData.serviceType || supplierData.category || '',
            account: {
              fullName: supplierData.owner?.name || '',
              email: supplierData.owner?.email || user.email || '',
              phone: supplierData.owner?.phone || supplierData.contactInfo?.phone || '',
              agreedToTerms: true,
            },
            // Venue fields
            venueType: supplierData.venueType || supplierData.serviceDetails?.venueType || '',
            venueAddress: supplierData.venueAddress || supplierData.serviceDetails?.venueAddress || {
              businessName: supplierData.businessName || '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              postcode: supplierData.contactInfo?.postcode || '',
              country: 'United Kingdom'
            },
            capacity: supplierData.serviceDetails?.capacity || { max: 50, seated: 30, standing: 60, min: 10 },
            facilities: supplierData.serviceDetails?.facilities || [],
            restrictedItems: supplierData.serviceDetails?.restrictedItems || [],
            pricing: supplierData.serviceDetails?.pricing || { hourlyRate: supplierData.priceFrom || 0, minimumBookingHours: 4, securityDeposit: 0 },
            // Entertainer fields
            entertainerType: supplierData.entertainerType || supplierData.serviceDetails?.entertainerType || '',
            serviceDetails: {
              businessName: supplierData.businessName || supplierData.serviceDetails?.businessName || '',
              description: supplierData.description || supplierData.serviceDetails?.description || '',
              ageGroups: supplierData.serviceDetails?.ageGroups || [],
              specialRequirements: supplierData.serviceDetails?.specialRequirements || ''
            },
            serviceArea: supplierData.serviceDetails?.serviceArea || {
              baseLocation: '',
              postcode: supplierData.contactInfo?.postcode || '',
              travelRadius: 10,
              travelFee: 0
            },
            entertainerPricing: supplierData.serviceDetails?.pricing || {
              basePrice: supplierData.priceFrom || 0,
              pricingType: 'per_hour',
              minimumDuration: 1,
              additionalInfo: ''
            },
            // Shared fields
            photos: supplierData.portfolioImages || [],
            calendar: supplierData.calendarIntegration || { connected: false, provider: null }
          }))

          // Determine which step to resume from based on completed data
          let resumeStep = 3 // Default to step 3 (after account creation)
          if (!supplierData.serviceType && !supplierData.category) resumeStep = 1
          else if (isVenue && !supplierData.venueType) resumeStep = 3
          else if (isVenue && !supplierData.venueAddress?.addressLine1) resumeStep = 4

          setCurrentStep(resumeStep)
          setResumeBusinessLoaded(true)
          // Clear any saved onboarding data
          localStorage.removeItem(STORAGE_KEY)

        } catch (e) {
          console.error('Error loading business to resume:', e)
          router.push('/suppliers/listings')
        }
        return
      }

      // If adding a cake product (mini wizard for existing cake supplier)
      if (isAddingCakeProduct && !newBusinessModeLoaded) {
        try {
          console.log('🎂 Add Cake Product mode - loading parent business...')

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.log('No authenticated user found, redirecting to login')
            router.push('/suppliers/onboarding')
            return
          }

          console.log('✅ Found existing user:', user.id)
          setUserId(user.id)

          // Get the primary cake business (parent)
          const { data: primaryBusiness, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('auth_user_id', user.id)
            .eq('is_primary', true)
            .single()

          if (error || !primaryBusiness) {
            console.error('No primary cake business found:', error)
            router.push('/suppliers/listings')
            return
          }

          console.log('✅ Found primary cake business:', primaryBusiness.id)

          // Store parent business ID for later use when creating the cake product
          setWizardData(prev => ({
            ...prev,
            supplierType: 'cakes', // Ensure we're in cake mode
            parentBusinessId: primaryBusiness.id,
            account: {
              ...prev.account,
              fullName: primaryBusiness.data?.owner?.name || '',
              email: primaryBusiness.data?.owner?.email || user.email || '',
              phone: primaryBusiness.data?.owner?.phone || '',
              agreedToTerms: true
            }
          }))

          setNewBusinessModeLoaded(true)
          setCurrentStep(1) // Start at step 1 for cake product wizard
          localStorage.removeItem(STORAGE_KEY)

        } catch (e) {
          console.error('Error in add cake product mode:', e)
        }
        return
      }

      // If creating new business as existing user (non-cake)
      if (isNewBusinessMode && !newBusinessModeLoaded) {
        try {
          console.log('🆕 New business mode - checking for existing user...')

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.log('No authenticated user found, redirecting to login')
            router.push('/suppliers/onboarding')
            return
          }

          console.log('✅ Found existing user:', user.id)
          setUserId(user.id)

          // Pre-fill account data from existing user
          const { data: existingSupplier } = await supabase
            .from('suppliers')
            .select('data')
            .eq('auth_user_id', user.id)
            .limit(1)
            .single()

          if (existingSupplier?.data?.owner) {
            setWizardData(prev => ({
              ...prev,
              account: {
                ...prev.account,
                fullName: existingSupplier.data.owner.name || '',
                email: existingSupplier.data.owner.email || user.email || '',
                phone: existingSupplier.data.owner.phone || '',
                agreedToTerms: true
              }
            }))
          }

          setNewBusinessModeLoaded(true)
          // Clear any saved onboarding data for fresh start
          localStorage.removeItem(STORAGE_KEY)

        } catch (e) {
          console.error('Error in new business mode:', e)
        }
        return
      }

      // If in edit mode, load current business data from Supabase
      if (isEditMode && !editModeLoaded) {
        try {
          console.log('📝 Edit mode detected - loading current business data...')

          // Get current user
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.error('No authenticated user found')
            router.push('/suppliers/onboarding')
            return
          }

          setUserId(user.id)

          // Get current supplier (the one they selected from listings)
          const { data: suppliers, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('auth_user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)

          if (error || !suppliers?.length) {
            console.error('No supplier found:', error)
            router.push('/suppliers/listings')
            return
          }

          const supplier = suppliers[0]
          setSupplierId(supplier.id)

          console.log('✅ Loaded supplier for editing:', supplier.id, supplier.data?.businessName)

          // Map supplier data to wizard format
          const supplierData = supplier.data || {}
          const isVenue = supplierData.serviceType === 'venues' || supplierData.category === 'venues'
          const isEntertainer = supplierData.serviceType === 'entertainment' || supplierData.category === 'entertainment'

          setWizardData(prev => ({
            ...prev,
            supplierType: supplierData.serviceType || supplierData.category || '',
            account: {
              fullName: supplierData.owner?.name || '',
              email: supplierData.owner?.email || user.email || '',
              phone: supplierData.owner?.phone || supplierData.contactInfo?.phone || '',
              agreedToTerms: true,
            },
            // Venue fields
            venueType: supplierData.venueType || supplierData.serviceDetails?.venueType || '',
            venueAddress: supplierData.venueAddress || supplierData.serviceDetails?.venueAddress || {
              businessName: supplierData.businessName || '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              postcode: supplierData.contactInfo?.postcode || '',
              country: 'United Kingdom'
            },
            capacity: supplierData.serviceDetails?.capacity || { max: 50, seated: 30, standing: 60, min: 10 },
            facilities: supplierData.serviceDetails?.facilities || [],
            restrictedItems: supplierData.serviceDetails?.restrictedItems || [],
            pricing: supplierData.serviceDetails?.pricing || { hourlyRate: supplierData.priceFrom || 0, minimumBookingHours: 4, securityDeposit: 0 },
            // Entertainer fields
            entertainerType: supplierData.entertainerType || supplierData.serviceDetails?.entertainerType || '',
            serviceDetails: {
              businessName: supplierData.businessName || supplierData.serviceDetails?.businessName || '',
              description: supplierData.description || supplierData.serviceDetails?.description || '',
              ageGroups: supplierData.serviceDetails?.ageGroups || [],
              specialRequirements: supplierData.serviceDetails?.specialRequirements || ''
            },
            serviceArea: supplierData.serviceDetails?.serviceArea || {
              baseLocation: '',
              postcode: supplierData.contactInfo?.postcode || '',
              travelRadius: 10,
              travelFee: 0
            },
            entertainerPricing: supplierData.serviceDetails?.pricing || {
              basePrice: supplierData.priceFrom || 0,
              pricingType: 'per_hour',
              minimumDuration: 1,
              additionalInfo: ''
            },
            // Shared fields
            photos: supplierData.portfolioImages || [],
            calendar: supplierData.calendarIntegration || { connected: false, provider: null }
          }))

          setEditModeLoaded(true)
          setCurrentStep(3) // Start at step 3 for edit mode

        } catch (e) {
          console.error('Error loading edit mode data:', e)
        }
        return
      }

      // Normal mode - load from localStorage
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
    }

    loadData()
  }, [isEditMode, editModeLoaded, isNewBusinessMode, newBusinessModeLoaded, resumeBusinessId, resumeBusinessLoaded, isAddingCakeProduct, router])

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

      let errorMessage = `Calendar connection failed: ${calendarError}`
      if (calendarError === 'missing_calendar_scope') {
        errorMessage = 'Calendar permission not granted.\n\nPlease reconnect and make sure to allow access to your Google Calendar when prompted. You may have unchecked the calendar permission on the consent screen.'
      } else if (errorDetails) {
        errorMessage += `\n${errorDetails}`
      }

      alert(errorMessage)

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
      supplierId: supplierId,
      isNewBusinessMode,
      isAddingCakeProduct,
      userId
    })

    // CAKE PRODUCT WIZARD: Handle separately from main business onboarding
    if (isAddingCakeProduct) {
      if (currentStep < TOTAL_STEPS) {
        // Just navigate to next step
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      } else {
        // Final step - create the cake product
        await createCakeProduct()
      }
      return
    }

    // NEW BUSINESS MODE: After step 1 (supplier type), create supplier and skip to step 3
    if (currentStep === 1 && isNewBusinessMode && userId && !supplierId) {
      console.log('🆕 New business mode - creating supplier record for existing user...')
      await createSupplierForExistingUser()
      return
    }

    // Step 2: Create account and supplier record (only for new users)
    if (currentStep === 2 && !isNewBusinessMode) {
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

      // For step 9 (verification documents), wait a moment to ensure uploads have completed
      if (currentStep === 9 && wizardData.supplierType === 'entertainment') {
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
      let targetStep = currentStep - 1

      // In edit mode, don't go back past step 3
      if (isEditMode && targetStep < 3) {
        // Go back to listings instead
        router.push('/suppliers/listings')
        return
      }

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

  const handleSaveExit = async () => {
    // In edit mode or if we have a supplierId, save and go to listings
    if (isEditMode || supplierId) {
      // Save current data before exiting
      if (supplierId) {
        try {
          await updateSupplierRecord()
          console.log('💾 Changes saved successfully')
        } catch (error) {
          console.error('Error saving:', error)
        }
      }
      console.log('💾 Progress saved. Redirecting to listings...')
      router.push('/suppliers/listings')
      return
    }

    // Data is already auto-saved to database
    if (userId) {
      console.log('💾 Progress saved. Redirecting to listings...')
      router.push('/suppliers/listings')
    } else {
      // No account yet, just saved to localStorage
      alert('Your progress has been saved locally. Create an account in step 2 to continue!')
    }
  }

  // Create supplier for existing user (new business mode)
  const createSupplierForExistingUser = async () => {
    try {
      console.log('🆕 Creating new supplier for existing user...')

      const normalizedCategory = normalizeCategory(wizardData.supplierType)
      const supplierData = {
        name: wizardData.account.fullName || 'New Business',
        businessName: wizardData.account.fullName || 'New Business',
        serviceType: normalizedCategory,
        category: normalizedCategory,
        subcategory: normalizedCategory,
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
        notifications: {
          smsBookings: true,
          smsReminders: false,
          emailBookings: true,
          emailMessages: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
        createdFrom: "wizard_new_business",
      }

      const supplierRecord = {
        auth_user_id: userId,
        data: supplierData,
        is_primary: false, // Not primary since user already has a business
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
        throw new Error('Failed to create new business. Please try again.')
      }

      console.log('✅ New supplier profile created:', newSupplier.id)
      setSupplierId(newSupplier.id)

      // Skip step 2 and go directly to step 3
      console.log('⏭️ Skipping account creation, moving to step 3...')
      setCurrentStep(3)
      window.scrollTo(0, 0)

    } catch (error) {
      console.error('💥 Error creating supplier for existing user:', error)
      alert(error.message || 'An unexpected error occurred. Please try again.')
    }
  }

  // Create a new cake product (for cake suppliers adding cakes)
  const createCakeProduct = async () => {
    try {
      console.log('🎂 Creating new cake product...')

      if (!userId || !wizardData.parentBusinessId) {
        alert('Error: Missing user or parent business. Please try again.')
        return
      }

      // First, get the primary business to inherit business info
      const { data: primaryBusiness, error: fetchError } = await supabase
        .from('suppliers')
        .select('data')
        .eq('id', wizardData.parentBusinessId)
        .single()

      if (fetchError || !primaryBusiness) {
        console.error('Failed to fetch primary business:', fetchError)
        throw new Error('Failed to load business data. Please try again.')
      }

      // Calculate price from packages
      const packages = wizardData.cakeProductPackages.filter(p => p.name && p.price)
      const prices = packages.map(p => parseFloat(p.price)).filter(p => p > 0)
      const priceFrom = prices.length > 0 ? Math.min(...prices) : 0

      // Build the cake product data
      const cakeProductData = {
        // Cake product identity
        name: wizardData.cakeProductName,
        businessName: wizardData.cakeProductName, // Product name, not business name
        serviceType: 'Cakes',
        category: 'Cakes',
        subcategory: 'Cakes',

        // Inherited from primary business
        location: primaryBusiness.data.location || '',
        owner: primaryBusiness.data.owner || {},
        contactInfo: primaryBusiness.data.contactInfo || {},

        // Cake product specific data
        description: wizardData.cakeProductName,
        businessDescription: wizardData.cakeProductName,
        portfolioImages: wizardData.cakeProductPhotos || [],
        image: wizardData.cakeProductPhotos?.[0]?.src || '',
        coverPhoto: wizardData.cakeProductPhotos?.[0]?.src || '',

        // Packages (sizes & pricing)
        packages: packages.map(p => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price) || 0,
          serves: p.serves || '',
          feeds: p.serves || '', // Alias for serves
          tiers: p.tiers || '',
          sizeInches: p.sizeInches || '',
          deliveryFee: p.deliveryFee ? parseFloat(p.deliveryFee) : 0
        })),

        // Description
        description: wizardData.cakeProductDescription || "",

        // Flavours & dietary
        flavours: wizardData.cakeProductFlavours || [],
        dietaryInfo: wizardData.cakeProductDietaryInfo || [],

        // Themes (for party matching)
        themes: wizardData.cakeProductThemes?.length > 0 ? wizardData.cakeProductThemes : ["general"],

        // Service details (inherited from parent + product specific)
        serviceDetails: {
          ...primaryBusiness.data.serviceDetails,
          productName: wizardData.cakeProductName,
          description: wizardData.cakeProductDescription || "",
          flavours: wizardData.cakeProductFlavours || [],
          dietaryInfo: wizardData.cakeProductDietaryInfo || [],
          themes: wizardData.cakeProductThemes || [],
          packages: packages.map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price) || 0,
            serves: p.serves || '',
            feeds: p.serves || '',
            tiers: p.tiers || '',
            sizeInches: p.sizeInches || '',
            deliveryFee: p.deliveryFee ? parseFloat(p.deliveryFee) : 0
          }))
        },

        // Pricing
        priceFrom: priceFrom,
        priceUnit: "per cake",

        // Standard fields
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        badges: ["New"],
        availability: "Contact for availability",

        // Status
        isComplete: true,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdFrom: "cake_product_wizard"
      }

      // Create the cake product as a new supplier record
      const supplierRecord = {
        auth_user_id: userId,
        data: cakeProductData,
        is_primary: false, // This is a product, not the primary business
        parent_business_id: wizardData.parentBusinessId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: newCakeProduct, error: createError } = await supabase
        .from("suppliers")
        .insert(supplierRecord)
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create cake product:', createError)
        throw new Error('Failed to create cake product. Please try again.')
      }

      console.log('✅ Cake product created:', newCakeProduct.id)

      // Clean up and redirect
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem('justAddedCake', 'true')
      router.push('/suppliers/listings')

    } catch (error) {
      console.error('💥 Error creating cake product:', error)
      alert(error.message || 'An unexpected error occurred. Please try again.')
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
      const normalizedCategory = normalizeCategory(wizardData.supplierType)
      const supplierData = {
        name: wizardData.account.fullName,
        businessName: wizardData.account.fullName,
        serviceType: normalizedCategory,
        category: normalizedCategory,
        subcategory: normalizedCategory,
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
    const isCakeSupplier = wizardData.supplierType === 'cakes'

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
            // Dashboard reads aboutUs field for the "About Your Service" section
            aboutUs: wizardData.serviceDetails?.description || currentSupplier.data.serviceDetails?.aboutUs || currentSupplier.data.serviceDetails?.description,
            ageGroups: wizardData.serviceDetails?.ageGroups || currentSupplier.data.serviceDetails?.ageGroups || [],
            specialRequirements: wizardData.serviceDetails?.specialRequirements || currentSupplier.data.serviceDetails?.specialRequirements,
            serviceArea: {
              baseLocation: wizardData.serviceArea?.baseLocation || currentSupplier.data.serviceDetails?.serviceArea?.baseLocation,
              postcode: wizardData.serviceArea?.postcode || currentSupplier.data.serviceDetails?.serviceArea?.postcode,
              addressLine1: wizardData.serviceArea?.addressLine1 || currentSupplier.data.serviceDetails?.serviceArea?.addressLine1,
              fullAddress: wizardData.serviceArea?.fullAddress || currentSupplier.data.serviceDetails?.serviceArea?.fullAddress,
              latitude: wizardData.serviceArea?.latitude || currentSupplier.data.serviceDetails?.serviceArea?.latitude,
              longitude: wizardData.serviceArea?.longitude || currentSupplier.data.serviceDetails?.serviceArea?.longitude,
              country: wizardData.serviceArea?.country || currentSupplier.data.serviceDetails?.serviceArea?.country,
              travelRadius: wizardData.serviceArea?.travelRadius || currentSupplier.data.serviceDetails?.serviceArea?.travelRadius || 10,
              travelFee: wizardData.serviceArea?.travelFee || currentSupplier.data.serviceDetails?.serviceArea?.travelFee || 0
            },
            // Dashboard reads these flat fields for pricing section
            hourlyRate: wizardData.entertainerPricing?.basePrice || currentSupplier.data.serviceDetails?.hourlyRate || currentSupplier.data.serviceDetails?.pricing?.basePrice || 0,
            extraHourRate: wizardData.entertainerPricing?.extraHourRate || currentSupplier.data.serviceDetails?.extraHourRate || 0,
            groupSizeMin: wizardData.entertainerPricing?.groupSizeMin || currentSupplier.data.serviceDetails?.groupSizeMin || 1,
            groupSizeMax: wizardData.entertainerPricing?.groupSizeMax || currentSupplier.data.serviceDetails?.groupSizeMax || 30,
            additionalEntertainerPrice: wizardData.entertainerPricing?.additionalEntertainerPrice || currentSupplier.data.serviceDetails?.additionalEntertainerPrice || 150,
            // Also keep the nested pricing object for backwards compatibility
            pricing: {
              basePrice: wizardData.entertainerPricing?.basePrice || currentSupplier.data.serviceDetails?.pricing?.basePrice || 0,
              pricingType: wizardData.entertainerPricing?.pricingType || currentSupplier.data.serviceDetails?.pricing?.pricingType || 'per_hour',
              minimumDuration: wizardData.entertainerPricing?.minimumDuration || currentSupplier.data.serviceDetails?.pricing?.minimumDuration || 1,
              extraHourRate: wizardData.entertainerPricing?.extraHourRate || currentSupplier.data.serviceDetails?.pricing?.extraHourRate || 0,
              groupSizeMin: wizardData.entertainerPricing?.groupSizeMin || currentSupplier.data.serviceDetails?.pricing?.groupSizeMin || 1,
              groupSizeMax: wizardData.entertainerPricing?.groupSizeMax || currentSupplier.data.serviceDetails?.pricing?.groupSizeMax || 30,
              additionalEntertainerPrice: wizardData.entertainerPricing?.additionalEntertainerPrice || currentSupplier.data.serviceDetails?.pricing?.additionalEntertainerPrice || 150,
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

      // CAKE SUPPLIER DATA UPDATE
      if (isCakeSupplier) {
        updatedData = {
          ...currentSupplier.data,
          name: wizardData.cakeBusinessDetails.businessName || currentSupplier.data.name,
          businessName: wizardData.cakeBusinessDetails.businessName || currentSupplier.data.businessName,
          location: wizardData.cakeBusinessDetails.postcode || wizardData.cakeBusinessDetails.city || currentSupplier.data.location,
          contactInfo: {
            ...currentSupplier.data.contactInfo,
            phone: wizardData.cakeBusinessDetails.phone || currentSupplier.data.contactInfo?.phone,
            postcode: wizardData.cakeBusinessDetails.postcode || currentSupplier.data.contactInfo?.postcode
          },
          owner: {
            ...currentSupplier.data.owner,
            phone: wizardData.cakeBusinessDetails.phone || currentSupplier.data.owner?.phone
          },
          serviceDetails: {
            ...currentSupplier.data.serviceDetails,
            businessName: wizardData.cakeBusinessDetails.businessName || currentSupplier.data.serviceDetails?.businessName,
            location: {
              city: wizardData.cakeBusinessDetails.city || currentSupplier.data.serviceDetails?.location?.city,
              postcode: wizardData.cakeBusinessDetails.postcode || currentSupplier.data.serviceDetails?.location?.postcode,
              fullAddress: wizardData.cakeBusinessDetails.fullAddress || currentSupplier.data.serviceDetails?.location?.fullAddress,
              latitude: wizardData.cakeBusinessDetails.latitude || currentSupplier.data.serviceDetails?.location?.latitude,
              longitude: wizardData.cakeBusinessDetails.longitude || currentSupplier.data.serviceDetails?.location?.longitude
            },
            fulfilment: {
              offersPickup: wizardData.cakeFulfilment.offersPickup,
              offersDelivery: wizardData.cakeFulfilment.offersDelivery,
              deliveryRadius: wizardData.cakeFulfilment.deliveryRadius,
              deliveryFee: wizardData.cakeFulfilment.deliveryFee,
              collectionHours: wizardData.cakeFulfilment.collectionHours
            },
            leadTime: {
              minimum: wizardData.cakeLeadTime.minimum
            }
          },
          // Cake suppliers have no packages/photos in initial onboarding - they add products later
          portfolioImages: currentSupplier.data.portfolioImages || [],
          packages: currentSupplier.data.packages || [],
          description: "Cake business - add your cakes to complete your profile",
          businessDescription: "Cake business - add your cakes to complete your profile",
          priceFrom: 0,
          priceUnit: "per cake",
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
      // For cake suppliers, the business shell is complete but they need to add products
      const isCakeSupplier = wizardData.supplierType === 'cakes'
      const updatedData = {
        ...currentSupplier.data,
        onboardingCompleted: true,
        // Cake suppliers need to add products before they're truly "complete"
        isComplete: isCakeSupplier ? false : true,
        description: isCakeSupplier
          ? "Cake business - add your cakes to start receiving orders"
          : (currentSupplier.data.businessDescription || currentSupplier.data.description || "Ready for bookings"),
        businessDescription: isCakeSupplier
          ? "Cake business - add your cakes to start receiving orders"
          : (currentSupplier.data.businessDescription || currentSupplier.data.description || "Ready for bookings"),
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

      // Redirect to listings
      console.log('🚀 Redirecting to listings...')
      router.push('/suppliers/listings')

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

      if (!supplierId) {
        alert('Please complete earlier steps first before connecting calendar.')
        return
      }

      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        alert('Session expired. Please log in again.')
        return
      }

      if (provider === 'google') {
        // Trigger Google OAuth flow - include supplierId so callback knows which business to update
        const response = await fetch('/api/auth/google-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            userId: `wizard-${userId}:supplier:${supplierId}`, // Include supplierId in state
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
          userId: userId,
          supplierId: supplierId,
          timestamp: Date.now()
        }))

        // Redirect to Google OAuth
        window.location.href = data.authUrl

      } else if (provider === 'outlook') {
        // Trigger Outlook OAuth flow - include supplierId so callback knows which business to update
        const response = await fetch('/api/auth/outlook-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            userId: `wizard-${userId}:supplier:${supplierId}`, // Include supplierId in state
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
          userId: userId,
          supplierId: supplierId,
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
    const isCakeSupplier = wizardData.supplierType === 'cakes'

    // CAKE PRODUCT WIZARD VALIDATION (8 steps: Name, About, Photos, Flavours, Dietary, Themes, Packages, Complete)
    if (isAddingCakeProduct) {
      switch (currentStep) {
        case 1: // Cake Name
          return wizardData.cakeProductName && wizardData.cakeProductName.trim().length > 0
        case 2: // About this cake (required)
          return wizardData.cakeProductDescription && wizardData.cakeProductDescription.trim().length > 0
        case 3: // Photos
          return wizardData.cakeProductPhotos && wizardData.cakeProductPhotos.length >= 1
        case 4: // Flavours (optional)
          return true // Optional - can proceed without selecting any
        case 5: // Dietary (optional)
          return true // Optional - can proceed without selecting any
        case 6: // Themes (optional)
          return true // Optional - can proceed without selecting any
        case 7: // Packages (at least one complete package required)
          const hasCompletePackage = wizardData.cakeProductPackages.some(
            p => p.name?.trim() && parseFloat(p.price) > 0
          )
          return hasCompletePackage
        case 8: // Complete
          return true
        default:
          return true
      }
    }

    // Shared steps (for initial business onboarding)
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

    // CAKE SUPPLIER VALIDATION (7 steps total)
    if (isCakeSupplier) {
      switch (currentStep) {
        case 3: // Business Details (name only - phone collected earlier)
          return (
            wizardData.cakeBusinessDetails.businessName &&
            wizardData.cakeBusinessDetails.businessName.trim().length > 0
          )
        case 4: // Location
          return (
            wizardData.cakeBusinessDetails.postcode || wizardData.cakeBusinessDetails.city
          )
        case 5: // Collection
          return true // User can say yes or no
        case 6: // Delivery - ensure at least one fulfilment method is selected
          return (
            wizardData.cakeFulfilment.offersPickup || wizardData.cakeFulfilment.offersDelivery
          )
        case 7: // Lead Times
          return wizardData.cakeLeadTime.minimum > 0
        case 8: // Complete
          return true
        default:
          return true
      }
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
          return wizardData.photos.length >= 2
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
        case 4: // Company Name
          return (
            wizardData.serviceDetails.businessName &&
            wizardData.serviceDetails.businessName.trim().length > 0
          )
        case 5: // About Service (description)
          return (
            wizardData.serviceDetails.description &&
            wizardData.serviceDetails.description.length >= 50
          )
        case 6: // Service Area
          return (
            wizardData.serviceArea.baseLocation &&
            wizardData.serviceArea.postcode &&
            wizardData.serviceArea.travelRadius > 0
          )
        case 7: // Photos
          return wizardData.photos.length >= 3 // Minimum 3 photos for entertainers
        case 8: // Pricing
          return wizardData.entertainerPricing.basePrice > 0
        case 9: // Verification Documents
          return (
            wizardData.verificationDocuments.dbs?.uploaded &&
            wizardData.verificationDocuments.id?.uploaded &&
            wizardData.verificationDocuments.address?.uploaded
          )
        case 10: // Calendar
          return true // Optional
        case 11: // Review & Complete
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
    const isCakeSupplier = wizardData.supplierType === 'cakes'

    console.log('🎨 Rendering step:', currentStep, 'Supplier type:', wizardData.supplierType, 'isEntertainer:', isEntertainer, 'isCake:', isCakeSupplier, 'isAddingCakeProduct:', isAddingCakeProduct)

    // CAKE PRODUCT WIZARD (mini wizard for adding cakes to existing cake supplier)
    // 8 steps: Name, About, Photos, Flavours, Dietary, Themes, Packages, Complete
    if (isAddingCakeProduct) {
      switch (currentStep) {
        case 1: // Cake Name
          return (
            <CakeNameStep
              cakeName={wizardData.cakeProductName}
              onChange={(name) => setWizardData({ ...wizardData, cakeProductName: name })}
            />
          )
        case 2: // About this cake
          return (
            <CakeAboutStep
              description={wizardData.cakeProductDescription}
              onChange={(description) => setWizardData({ ...wizardData, cakeProductDescription: description })}
            />
          )
        case 3: // Photos
          return (
            <VenuePhotosStep
              photos={wizardData.cakeProductPhotos}
              onChange={(photos) => setWizardData({ ...wizardData, cakeProductPhotos: photos })}
              minPhotos={1}
              title="Add photos of this cake"
              subtitle="Upload at least 1 photo showing your cake from different angles"
            />
          )
        case 4: // Flavours
          return (
            <CakeFlavoursStep
              flavours={wizardData.cakeProductFlavours}
              onChange={(flavours) => setWizardData({ ...wizardData, cakeProductFlavours: flavours })}
            />
          )
        case 5: // Dietary
          return (
            <CakeDietaryStep
              dietaryInfo={wizardData.cakeProductDietaryInfo}
              onChange={(dietaryInfo) => setWizardData({ ...wizardData, cakeProductDietaryInfo: dietaryInfo })}
            />
          )
        case 6: // Themes
          return (
            <CakeThemesStep
              themes={wizardData.cakeProductThemes}
              onChange={(themes) => setWizardData({ ...wizardData, cakeProductThemes: themes })}
            />
          )
        case 7: // Packages (sizes & pricing)
          return (
            <CakePackagesStep
              cakePackages={wizardData.cakeProductPackages}
              onChange={(packages) => setWizardData({ ...wizardData, cakeProductPackages: packages })}
            />
          )
        case 8: // Complete
          const cakeImage = wizardData.cakeProductPhotos?.[0]?.src || wizardData.cakeProductPhotos?.[0]?.preview
          const lowestPrice = wizardData.cakeProductPackages
            ?.filter(p => p.name && p.price)
            ?.reduce((min, p) => Math.min(min, Number(p.price) || Infinity), Infinity)

          return (
            <div className="py-12 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                  Check your cake
                </h1>
                <p className="text-lg text-gray-600">
                  Please confirm everything looks correct
                </p>
              </div>

              {/* Cake Preview Card */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  {cakeImage ? (
                    <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                      <img
                        src={cakeImage}
                        alt={wizardData.cakeProductName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl">🎂</span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="p-5 flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {wizardData.cakeProductName || "Your Cake"}
                    </h2>
                    {lowestPrice && lowestPrice !== Infinity && (
                      <p className="text-lg text-primary-600 font-semibold mb-3">
                        From £{lowestPrice}
                      </p>
                    )}
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{wizardData.cakeProductFlavours?.length || 0} flavours</p>
                      <p>{wizardData.cakeProductPackages?.filter(p => p.name && p.price).length || 0} sizes</p>
                      {wizardData.cakeProductDietaryInfo?.length > 0 && (
                        <p>{wizardData.cakeProductDietaryInfo.length} dietary options</p>
                      )}
                      {wizardData.cakeProductThemes?.length > 0 && (
                        <p>{wizardData.cakeProductThemes.length} themes</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                You can edit this cake anytime from your dashboard.
              </p>
            </div>
          )
        default:
          return null
      }
    }

    // Steps 1-2 are shared for all supplier types (initial business onboarding)
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

    // CAKE SUPPLIER FLOW (7 steps total)
    if (isCakeSupplier) {
      switch (currentStep) {
        case 3: // Business Details
          return (
            <CakeBusinessStep
              cakeBusinessDetails={wizardData.cakeBusinessDetails}
              onChange={(details) => setWizardData({ ...wizardData, cakeBusinessDetails: details })}
            />
          )
        case 4: // Location
          return (
            <CakeLocationStep
              cakeBusinessDetails={wizardData.cakeBusinessDetails}
              onChange={(details) => setWizardData({ ...wizardData, cakeBusinessDetails: details })}
            />
          )
        case 5: // Collection
          return (
            <CakeCollectionStep
              cakeFulfilment={wizardData.cakeFulfilment}
              cakeBusinessDetails={wizardData.cakeBusinessDetails}
              onChange={(fulfilment) => setWizardData({ ...wizardData, cakeFulfilment: fulfilment })}
            />
          )
        case 6: // Delivery
          return (
            <CakeDeliveryStep
              cakeFulfilment={wizardData.cakeFulfilment}
              cakeBusinessDetails={wizardData.cakeBusinessDetails}
              onChange={(fulfilment) => setWizardData({ ...wizardData, cakeFulfilment: fulfilment })}
            />
          )
        case 7: // Lead Times
          return (
            <CakeLeadTimeStep
              cakeLeadTime={wizardData.cakeLeadTime}
              onChange={(leadTime) => setWizardData({ ...wizardData, cakeLeadTime: leadTime })}
            />
          )
        case 8: // Complete
          const getLeadTimeLabel = (days) => {
            if (days === 1) return "24 hours"
            if (days === 2) return "48 hours"
            if (days === 7) return "1 week"
            if (days === 14) return "2 weeks"
            if (days === 21) return "3 weeks"
            return `${days} days`
          }

          const fulfilmentMethods = []
          if (wizardData.cakeFulfilment.offersPickup) fulfilmentMethods.push("Collection")
          if (wizardData.cakeFulfilment.offersDelivery) fulfilmentMethods.push("Delivery")

          return (
            <div className="py-12 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                  Check your details
                </h1>
                <p className="text-lg text-gray-600">
                  Please confirm everything looks correct
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Business name</span>
                  <span className="font-medium text-gray-900">{wizardData.cakeBusinessDetails.businessName || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900 text-right max-w-[250px]">{wizardData.cakeBusinessDetails.fullAddress || `${wizardData.cakeBusinessDetails.city}${wizardData.cakeBusinessDetails.postcode ? `, ${wizardData.cakeBusinessDetails.postcode}` : ''}` || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Fulfilment</span>
                  <span className="font-medium text-gray-900">{fulfilmentMethods.join(" & ") || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Minimum notice</span>
                  <span className="font-medium text-gray-900">{getLeadTimeLabel(wizardData.cakeLeadTime.minimum)}</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                You can update these details anytime from your dashboard.
              </p>
            </div>
          )
        default:
          return null
      }
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
          const venueLocation = wizardData.venueAddress.fullAddress ||
            `${wizardData.venueAddress.addressLine1 ? wizardData.venueAddress.addressLine1 + ', ' : ''}${wizardData.venueAddress.city}${wizardData.venueAddress.postcode ? ', ' + wizardData.venueAddress.postcode : ''}`

          return (
            <div className="py-12 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                  Check your details
                </h1>
                <p className="text-lg text-gray-600">
                  Please confirm everything looks correct
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Venue name</span>
                  <span className="font-medium text-gray-900">{wizardData.venueAddress.businessName || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Venue type</span>
                  <span className="font-medium text-gray-900 capitalize">{wizardData.venueType?.replace(/-/g, ' ') || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900 text-right max-w-[250px]">{venueLocation || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium text-gray-900">Up to {wizardData.capacity.max} guests</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Hourly rate</span>
                  <span className="font-medium text-gray-900">£{wizardData.pricing.hourlyRate}</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                You can update these details anytime from your dashboard.
              </p>
            </div>
          )
        default:
          return null
      }
    }

    // ENTERTAINER FLOW (11 steps total)
    if (isEntertainer) {
      switch (currentStep) {
        case 3: // Entertainer Type
          return (
            <EntertainerTypeStep
              selectedType={wizardData.entertainerType}
              onSelect={(type) => setWizardData({ ...wizardData, entertainerType: type })}
            />
          )
        case 4: // Company Name
          return (
            <CompanyNameStep
              serviceDetails={wizardData.serviceDetails}
              onChange={(details) => setWizardData({ ...wizardData, serviceDetails: details })}
            />
          )
        case 5: // About Service (description + age groups)
          return (
            <AboutServiceStep
              serviceDetails={wizardData.serviceDetails}
              onChange={(details) => setWizardData({ ...wizardData, serviceDetails: details })}
            />
          )
        case 6: // Service Area
          return (
            <ServiceAreaStep
              serviceArea={wizardData.serviceArea}
              onChange={(area) => setWizardData({ ...wizardData, serviceArea: area })}
            />
          )
        case 7: // Photos
          return (
            <VenuePhotosStep
              photos={wizardData.photos}
              onChange={(photos) => setWizardData({ ...wizardData, photos })}
            />
          )
        case 8: // Pricing
          return (
            <PricingPackagesStep
              pricing={wizardData.entertainerPricing}
              onChange={(pricing) => setWizardData({ ...wizardData, entertainerPricing: pricing })}
            />
          )
        case 9: // Verification Documents
          return (
            <VerificationDocumentsStep
              documents={wizardData.verificationDocuments}
              onChange={(docs) => setWizardData({ ...wizardData, verificationDocuments: docs })}
              userId={userId}
              supplierId={supplierId}
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
          const entertainerLocation = wizardData.serviceArea.fullAddress ||
            `${wizardData.serviceArea.baseLocation}${wizardData.serviceArea.postcode ? ', ' + wizardData.serviceArea.postcode : ''}`

          const formatEntertainerType = (type) => {
            if (!type) return "—"
            return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          }

          return (
            <div className="py-12 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                  Check your details
                </h1>
                <p className="text-lg text-gray-600">
                  Please confirm everything looks correct
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Business name</span>
                  <span className="font-medium text-gray-900">{wizardData.serviceDetails.businessName || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Service type</span>
                  <span className="font-medium text-gray-900">{formatEntertainerType(wizardData.entertainerType)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-gray-900 text-right max-w-[250px]">{entertainerLocation || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Travel radius</span>
                  <span className="font-medium text-gray-900">{wizardData.serviceArea.travelRadius} miles</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Starting price</span>
                  <span className="font-medium text-gray-900">£{wizardData.entertainerPricing.basePrice}/hr</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                You can update these details anytime from your dashboard.
              </p>
            </div>
          )
        default:
          return null
      }
    }

    return null
  }

  // Adjust step numbers for display
  // Edit mode: step 3 becomes step 1 (skip steps 1-2)
  // New business mode: step 1 stays as 1, step 3+ becomes step 2+ (skip step 2)
  // Cake product wizard: steps 1-5 displayed as-is
  const getDisplayStep = () => {
    if (isAddingCakeProduct) return currentStep // No adjustment needed for cake product wizard
    if (isEditMode) return currentStep - 2
    if (isNewBusinessMode && currentStep >= 3) return currentStep - 1
    return currentStep
  }
  const getDisplayTotalSteps = () => {
    if (isAddingCakeProduct) return TOTAL_STEPS // No adjustment needed for cake product wizard
    if (isEditMode) return TOTAL_STEPS - 2
    if (isNewBusinessMode) return TOTAL_STEPS - 1 // One less step since we skip account creation
    return TOTAL_STEPS
  }
  const displayStep = getDisplayStep()
  const displayTotalSteps = getDisplayTotalSteps()

  // Determine next button label
  const getNextLabel = () => {
    if (isAddingCakeProduct) {
      return currentStep === TOTAL_STEPS ? "Add cake" : "Next"
    }
    return currentStep === TOTAL_STEPS ? "Complete profile" : "Next"
  }

  return (
    <WizardLayout
      currentStep={displayStep}
      totalSteps={displayTotalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onSaveExit={handleSaveExit}
      nextDisabled={!isStepValid()}
      showBack={isAddingCakeProduct ? currentStep > 1 : (isEditMode ? true : (isNewBusinessMode ? currentStep > 1 : currentStep > 1))}
      nextLabel={getNextLabel()}
      isEditMode={isEditMode}
    >
      {renderStep()}
    </WizardLayout>
  )
}
