"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePartyBuilder } from "@/utils/partyBuilderBackend"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import Hero from "@/components/Home/Hero"
import MobileSearchForm from "@/components/Home/MobileSearchForm"
import PartyBuildingLoader from "@/components/Home/PartyBuildingLoader"
import TrustIndicators from "@/components/Home/TrustIndicators"
import CategoryGrid from "@/components/Home/CategoryGrid"
import HowItWorks from "@/components/Home/HowItWorks"
import CustomerStories from "@/components/Home/CustomerStories"
import FinalCTA from "@/components/Home/FinalCTA"
import FloatingCTA from "@/components/Home/FloatingCTA"
import PartyOverrideConfirmation from '@/components/party-override-confirmation'
import { Input } from "@/components/ui/input"
import Image from "next/image"
import FeaturesGrid from "@/components/Home/FeaturesGrid"
import { initTracking, trackStep } from '@/utils/partyTracking'

export default function HomePage() {
  const router = useRouter()

  // Confirmation dialog state
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)
  const [existingPartyDetails, setExistingPartyDetails] = useState(null)

  const { buildParty, loading, error } = usePartyBuilder()

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    theme: "princess",
    guestCount: "",
    postcode: "",
    childName: "",
    childAge: 6,
    timeSlot: "afternoon",
    duration: "2",
    hasOwnVenue: false, // IMPORTANT: This is here
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPartyLoader, setShowPartyLoader] = useState(false)
  const [buildingProgress, setBuildingProgress] = useState(0)
  const [builtPartyPlan, setBuiltPartyPlan] = useState(null)
  const [postcodeValid, setPostcodeValid] = useState(true)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Initialize tracking on mount
  useEffect(() => {
    initTracking();
  }, []);

  // IMPORTANT: This function handles all field changes
  const handleFieldChange = (field, value) => {
    console.log('🔧 Field change:', field, '=', value); // Debug log
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'timeSlot') {
        const timeSlotDefaults = {
          morning: '11:00',
          afternoon: '14:00'
        };
        updated.time = timeSlotDefaults[value] || '14:00';
      }
      
      console.log('📝 Updated formData:', updated); // Debug log
      return updated;
    });
  }

  // Enhanced function to check for existing party plan (database + localStorage)
  const checkForExistingPartyPlan = async () => {
    try {
      const dbParty = await partyDatabaseBackend.getActivePlannedParty()

      // ✅ FIX: Handle unauthenticated users gracefully
      if (!dbParty || !dbParty.success) {
        if (dbParty?.reason === 'unauthenticated') {
          console.log('👤 User not authenticated - using local storage only')
          return null
        }
        if (dbParty?.error) {
          console.warn('⚠️ Error getting active party:', dbParty.error)
        }
        return null
      }

      if (dbParty.data) {
        console.log('Found existing party in database:', dbParty.data)
        return dbParty.data
      }

      return null
    } catch (error) {
      console.error('Error checking for existing party:', error)
      return null
    }
  }

  const mapThemeValue = (formTheme) => {
    const themeMapping = {
      "no-theme": "no-theme",
      "simple": "no-theme",
      "general": "no-theme",
      "basic": "no-theme",
      spiderman: "spiderman",
      "spider-man": "spiderman",
      "taylor-swift": "taylor-swift",
      "taylor swift": "taylor-swift",
      swiftie: "taylor-swift",
      princess: "princess",
      dinosaur: "dinosaur",
      dino: "dinosaur",
      unicorn: "unicorn",
      science: "science",
      scientist: "science",
      laboratory: "science",
      superhero: "superhero",
      superheroes: "superhero",
      hero: "superhero",
      action: "superhero",
      "fairy-tale": "princess",
      "fairy tale": "princess",
      royal: "princess",
      prehistoric: "dinosaur",
      jurassic: "dinosaur",
      magic: "unicorn",
      magical: "unicorn",
      rainbow: "unicorn",
      stem: "science",
      experiment: "science",
      chemistry: "science",
    }

    const lowerTheme = formTheme?.toLowerCase() || ""
    return themeMapping[lowerTheme] || lowerTheme || "superhero"
  }

  const isFormValid = () => {
    return (
      formData.date && 
      formData.theme && 
      formData.guestCount && 
      formData.postcode && 
      postcodeValid
    );
  };

  const validateAndFormatPostcode = (postcode) => {
    if (!postcode) return { isValid: true, formatted: "" }
    const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i
    const isValid = UK_POSTCODE_REGEX.test(postcode.trim())

    let formatted = postcode
    if (isValid) {
      const clean = postcode.replace(/\s/g, "").toUpperCase()
      if (clean.length >= 5) {
        formatted = clean.slice(0, -3) + " " + clean.slice(-3)
      }
    }
    return { isValid, formatted }
  }
  
  // Main form submission handler - Allow multiple parties
  const handleSearch = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setHasAttemptedSubmit(true)

    if (!isFormValid()) {
      console.log('Form validation failed')
      return;
    }

    // ✅ NEW: Allow users to create multiple parties without warnings
    // Just proceed directly with party creation
    proceedWithPartyCreation(formData)
  }

  // Handle confirmation to override existing party
  const handleConfirmOverride = () => {
    setShowOverrideDialog(false)
    if (pendingFormData) {
      proceedWithPartyCreation(pendingFormData)
      setPendingFormData(null)
      setExistingPartyDetails(null)
    }
  }

  // Handle cancellation of override
  const handleCancelOverride = () => {
    setShowOverrideDialog(false)
    setPendingFormData(null)
    setExistingPartyDetails(null)
    setIsSubmitting(false)
  }

  // Actual party creation logic
  const proceedWithPartyCreation = async (data) => {
    try {
      setIsSubmitting(true)

      // Track party planning started
      await trackStep('party_planning_started', {
        theme: data.theme,
        guestCount: data.guestCount,
        childAge: data.childAge,
        hasOwnVenue: data.hasOwnVenue,
        timeSlot: data.timeSlot,
        postcode: data.postcode
      });

      setTimeout(() => {
        setShowPartyLoader(true)
        setBuildingProgress(0)
      }, 200)

      const partyDetails = {
        date: data.date,
        theme: mapThemeValue(data.theme),
        guestCount: Number.parseInt(data.guestCount),
        location: data.postcode,
        postcode: data.postcode,
        childName: data.childName || "Your Child",
        childAge: data.childAge,
        timeSlot: data.timeSlot || "afternoon",
        duration: parseFloat(data.duration) || 2,
        time: convertTimeSlotToLegacyTime(data.timeSlot || "afternoon"),
        startTime: convertTimeSlotToLegacyTime(data.timeSlot || "afternoon"), // Add startTime for header compatibility
        hasOwnVenue: data.hasOwnVenue || false, // IMPORTANT: Pass this through

        source: 'homepage_form',
        createdAt: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        environment: process.env.NODE_ENV || 'development',

        timePreference: {
          type: 'flexible',
          slot: data.timeSlot || "afternoon",
          duration: parseFloat(data.duration) || 2,
          specificTime: null
        }
      }

      console.log('🎉 Building party with hasOwnVenue:', partyDetails.hasOwnVenue); // Debug

      // ✅ Build party immediately without artificial delays
      const result = await buildParty(partyDetails)

      // Store the party plan for the loader to display
      if (result.success && result.data) {
        setBuiltPartyPlan(result.data.partyPlan)
      }

      if (result.success) {
        setBuildingProgress(100)

        try {
          const welcomeData = {
            shouldShowWelcome: true,
            partyCreated: true,
            createdAt: new Date().toISOString(),
            source: 'homepage_form',
            environment: process.env.NODE_ENV || 'development',
            childData: {
              firstName: data.childName?.split(' ')[0] || '',
              lastName: data.childName?.split(' ').slice(1).join(' ') || '',
              childAge: data.childAge
            }
          }

          // Clear any previous welcome completion flags to ensure modal shows for new party
          localStorage.removeItem('welcome_completed')
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('welcome_completed')
          }

          localStorage.setItem('welcome_trigger', JSON.stringify(welcomeData))
          localStorage.setItem('show_welcome_popup', 'true')
          localStorage.setItem('party_just_created', new Date().toISOString())

          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('welcome_trigger', JSON.stringify(welcomeData))
          }

        } catch (storageError) {
          console.error("Storage error:", storageError)
        }

        // ✅ Calculate total duration dynamically based on budget and guest count
        // Each item: 2.5 seconds
        const budget = getDefaultBudgetForGuests(formData.guestCount)

        // Calculate number of items that will be shown
        let itemCount = 4 // Core items: Venue, Entertainment, Cake, Party Bags

        if (budget > 700) {
          itemCount += 2 // Decorations, Activities
        }

        const totalDuration = itemCount * 2500
        console.log(`⏱️ Loader duration: ${itemCount} items × 2.5s = ${totalDuration}ms`)
        await new Promise((resolve) => setTimeout(resolve, totalDuration))

        try {
          const redirectURL = "/dashboard?show_welcome=true&source=homepage&t=" + Date.now()

          if (typeof window !== 'undefined') {
            window.localStorage.setItem('redirect_welcome', 'true')
          }

          // Redirect to dashboard
          router.push(redirectURL)

        } catch (redirectError) {
          console.error("Redirect error:", redirectError)
          window.location.href = "/dashboard?show_welcome=true"
        }
        
      } else {
        console.error("Failed to build party:", result.error)
        setIsSubmitting(false)
        setShowPartyLoader(false)
        setBuildingProgress(0)
      }
    } catch (error) {
      console.error("Error during party building:", error)
      setIsSubmitting(false)
      setShowPartyLoader(false)
      setBuildingProgress(0)
    }
  }

  // Helper function to convert time slot to legacy time format
  const convertTimeSlotToLegacyTime = (timeSlot) => {
    const timeSlotDefaults = {
      morning: '11:00',
      afternoon: '14:00'
    };
    return timeSlotDefaults[timeSlot] || '14:00';
  }

  // Calculate budget for loader based on guest count (matches partyBuilderBackend logic)
  const getDefaultBudgetForGuests = (guestCount) => {
    const guests = parseInt(guestCount);
    if (guests <= 5) return 400;
    if (guests <= 10) return 500;
    if (guests <= 15) return 600;
    if (guests <= 20) return 700;
    if (guests <= 25) return 800;
    return 900;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">

      <PartyBuildingLoader
        isVisible={showPartyLoader}
        theme={mapThemeValue(formData.theme)}
        childName={formData.childName || "Your Child"}
        progress={buildingProgress}
        partyDetails={{
          budget: getDefaultBudgetForGuests(formData.guestCount),
          guestCount: formData.guestCount
        }}
        partyPlan={builtPartyPlan}
      />

      <Hero
        handleSearch={handleSearch}
        formData={formData}
        handleFieldChange={handleFieldChange}
        postcodeValid={postcodeValid}
        setPostcodeValid={setPostcodeValid}
        validateAndFormatPostcode={validateAndFormatPostcode}
        isSubmitting={isSubmitting}
        hasAttemptedSubmit={hasAttemptedSubmit}
      />

      <FloatingCTA />

      <MobileSearchForm
        handleSearch={handleSearch}
        formData={formData}
        handleFieldChange={handleFieldChange}
        postcodeValid={postcodeValid}
        setPostcodeValid={setPostcodeValid}
        validateAndFormatPostcode={validateAndFormatPostcode}
        isSubmitting={isSubmitting}
        hasAttemptedSubmit={hasAttemptedSubmit}
      />

      {/* Confirmation Dialog */}
      <PartyOverrideConfirmation
        isOpen={showOverrideDialog}
        onConfirm={handleConfirmOverride}
        onCancel={handleCancelOverride}
        existingPartyDetails={existingPartyDetails}
      />

      <CategoryGrid />
      <FeaturesGrid />
      <CustomerStories />
      <FinalCTA />
   
    </div>
  )
}