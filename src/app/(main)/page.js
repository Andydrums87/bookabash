"use client"
import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePartyBuilder } from "@/utils/partyBuilderBackend"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import Hero from "@/components/Home/Hero"
import PartyBagsCampaignBanner from "@/components/Home/PartyBagsCampaignBanner"
import PartyBagsSocialProofToast from "@/components/Home/PartyBagsSocialProofToast"
import MobileSearchForm from "@/components/Home/MobileSearchForm"
import PartyBuildingLoader from "@/components/Home/PartyBuildingLoader"
import TrustIndicators from "@/components/Home/TrustIndicators"
import CategoryGrid from "@/components/Home/CategoryGrid"
import HowItWorks from "@/components/Home/HowItWorks"
import CustomerStories from "@/components/Home/CustomerStories"
import FinalCTA from "@/components/Home/FinalCTA"
import FounderStory from "@/components/Home/FounderStory"
import FloatingCTA from "@/components/Home/FloatingCTA"
import PartyOverrideConfirmation from '@/components/party-override-confirmation'
import PostcodeRestrictionModal from '@/components/PostcodeRestrictionModal'
import { Input } from "@/components/ui/input"
import Image from "next/image"
import FeaturesGrid from "@/components/Home/FeaturesGrid"
import VideoSection from "@/components/Home/VideoSection"
import { initTracking, trackStep, updateReferrer } from '@/utils/partyTracking'
import { storeReferralCode } from '@/utils/referralUtils'

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Confirmation dialog state
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)
  const [existingPartyDetails, setExistingPartyDetails] = useState(null)

  // Postcode restriction modal state
  const [showPostcodeRestrictionModal, setShowPostcodeRestrictionModal] = useState(false)
  const [restrictedPostcode, setRestrictedPostcode] = useState("")

  const { buildParty } = usePartyBuilder()

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

  // Reset submitting state when user navigates back (bfcache)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) setIsSubmitting(false)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // Check if user came from flyer QR code
  const isFlyer = searchParams.get('flyer') !== null || searchParams.get('source') === 'flyer'

  // Check if user came from party bags flyer (free party bags offer)
  const isFlyerPartyBags = searchParams.get('flyer-partybags') !== null

  // Site-wide free party bags campaign (first 20 bookings)
  // Toggle via NEXT_PUBLIC_PARTYBAGS_CAMPAIGN_ACTIVE env var
  const isPartyBagsCampaignActive = process.env.NEXT_PUBLIC_PARTYBAGS_CAMPAIGN_ACTIVE === 'true'

  // Initialize tracking on mount and capture referral code from URL
  useEffect(() => {
    const init = async () => {
      await initTracking();

      // Capture referral code if present in URL
      const refCode = searchParams.get('ref')
      if (refCode) {
        storeReferralCode(refCode)
        console.log('📎 Referral code captured from URL:', refCode)
      }

      // Store flyer source if present (for applying discount later)
      if (isFlyer) {
        localStorage.setItem('flyer_source', 'true')
        localStorage.setItem('flyer_discount', '25')
        await updateReferrer('flyer')
        console.log('🎫 Flyer source captured - £25 discount available')
      }

      // Store party bags flyer source if present (for free party bags offer)
      if (isFlyerPartyBags) {
        localStorage.setItem('flyer_partybags', 'true')
        await updateReferrer('flyer-partybags')
        console.log('🎁 Party bags flyer captured - Free party bags available')
      }

      // Site-wide free party bags campaign: auto-apply offer to every visitor
      // while the campaign is active. Reuses the same flyer_partybags flag
      // so all downstream discount logic works unchanged.
      if (isPartyBagsCampaignActive && !isFlyerPartyBags) {
        localStorage.setItem('flyer_partybags', 'true')
        await updateReferrer('partybags-campaign')
        console.log('🎁 Party bags campaign active - Free party bags applied site-wide')
      }
    }
    init();
  }, [searchParams, isFlyer, isFlyerPartyBags, isPartyBagsCampaignActive]);

  // IMPORTANT: This function handles all field changes
  const handleFieldChange = (field, value) => {
    
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'timeSlot') {
        const timeSlotDefaults = {
          morning: '11:00',
          afternoon: '14:00'
        };
        updated.time = timeSlotDefaults[value] || '14:00';
      }
      

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
      "undecided": "undecided",
      "choose for me": "undecided",
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

  // Check if postcode is in allowed service area (AL1-AL5 St Albans, WD1-WD7 Watford)
  const isPostcodeInAllowedArea = (postcode) => {
    if (!postcode) return false
    const clean = postcode.replace(/\s/g, "").toUpperCase()
    const allowedAreas = [
      "AL1", "AL2", "AL3", "AL4", "AL5",
      "WD1", "WD2", "WD3", "WD4", "WD5", "WD6", "WD7",
    ]
    return allowedAreas.some(area => clean.startsWith(area))
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

    // Check if postcode is in allowed area (AL1-AL5)
    if (!isPostcodeInAllowedArea(formData.postcode)) {
      setRestrictedPostcode(formData.postcode)
      setShowPostcodeRestrictionModal(true)
      return
    }

    // Fire analytics before redirect — gtag/fbq just queue events locally (fast)
    if (window.gtag) {
      window.gtag('event', 'booking_started', {
        event_category: 'engagement',
        event_label: 'plan_my_party_click'
      });
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17997070672/NpkFCM2U0YMcENCC1oVD'
      });
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }

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

  // Actual party creation logic — build party then redirect to dashboard
  const proceedWithPartyCreation = async (data) => {
    try {
      setIsSubmitting(true)

      // Track party planning started
      await trackStep('party_planning_started', {
        theme: data.theme,
        guestCount: data.guestCount,
        childName: data.childName,
        childAge: data.childAge,
        hasOwnVenue: data.hasOwnVenue,
        timeSlot: data.timeSlot,
        postcode: data.postcode,
        date: data.date
      })

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
        startTime: convertTimeSlotToLegacyTime(data.timeSlot || "afternoon"),
        hasOwnVenue: data.hasOwnVenue || false,

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

      // Clear any stale party plan so buildParty() runs fresh
      localStorage.removeItem('user_party_plan');
      sessionStorage.removeItem('party_setup_step');

      // Save party details to localStorage for tracking and dashboard
      localStorage.setItem('party_details', JSON.stringify(partyDetails));

      // Build party immediately
      const result = await buildParty(partyDetails)

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

          localStorage.removeItem('welcome_completed')
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('welcome_completed')
          }

          localStorage.setItem('welcome_trigger', JSON.stringify(welcomeData))
          localStorage.setItem('show_welcome_popup', 'true')
          localStorage.setItem('party_just_created', new Date().toISOString())
          localStorage.setItem('redirect_welcome', 'true')

          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('welcome_trigger', JSON.stringify(welcomeData))
          }
        } catch (storageError) {
          console.error("Storage error:", storageError)
        }

        // Calculate loader duration based on item count (1s per item)
        const guests = parseInt(formData.guestCount) || 0
        let itemCount = 3 // Venue, Entertainment, Party Bags
        if (guests >= 20) itemCount += 1 // Soft Play
        const totalDuration = itemCount * 1000

        await new Promise((resolve) => setTimeout(resolve, totalDuration))

        try {
          const redirectURL = "/dashboard?show_welcome=true&source=homepage&t=" + Date.now()
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

  // Budget helper for the loader display
  const getDefaultBudgetForGuests = (guestCount) => {
    const guests = parseInt(guestCount);
    if (guests <= 5) return 400;
    if (guests <= 10) return 500;
    if (guests <= 15) return 600;
    if (guests <= 20) return 700;
    if (guests <= 25) return 800;
    return 900;
  }

  // Helper function to convert time slot to legacy time format
  const convertTimeSlotToLegacyTime = (timeSlot) => {
    const timeSlotDefaults = {
      morning: '11:00',
      afternoon: '14:00'
    };
    return timeSlotDefaults[timeSlot] || '14:00';
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
        onRetry={() => {
          setBuildingProgress(0)
          setBuiltPartyPlan(null)
          proceedWithPartyCreation(formData)
        }}
        onTimeout={() => {
          console.log('Party building timed out - user can retry')
        }}
      />

      {isPartyBagsCampaignActive && <PartyBagsCampaignBanner />}
      {isPartyBagsCampaignActive && <PartyBagsSocialProofToast />}

      <Hero
        handleSearch={handleSearch}
        formData={formData}
        handleFieldChange={handleFieldChange}
        postcodeValid={postcodeValid}
        setPostcodeValid={setPostcodeValid}
        validateAndFormatPostcode={validateAndFormatPostcode}
        isSubmitting={isSubmitting}
        hasAttemptedSubmit={hasAttemptedSubmit}
        isFlyer={isFlyer}
        isFlyerPartyBags={isFlyerPartyBags}
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
        isFlyer={isFlyer}
        isFlyerPartyBags={isFlyerPartyBags}
      />

      <TrustIndicators />

      {/* Confirmation Dialog */}
      <PartyOverrideConfirmation
        isOpen={showOverrideDialog}
        onConfirm={handleConfirmOverride}
        onCancel={handleCancelOverride}
        existingPartyDetails={existingPartyDetails}
      />

      {/* Postcode Restriction Modal */}
      <PostcodeRestrictionModal
        isOpen={showPostcodeRestrictionModal}
        onClose={() => setShowPostcodeRestrictionModal(false)}
        enteredPostcode={restrictedPostcode}
      />
      <HowItWorks />
      <CategoryGrid />
      <VideoSection />
      {/* <FeaturesGrid /> */}

      {/* TODO: Re-enable when we have real customer stories */}
      {/* <CustomerStories /> */}
      <FounderStory />
      <FinalCTA />
   
    </div>
  )
}