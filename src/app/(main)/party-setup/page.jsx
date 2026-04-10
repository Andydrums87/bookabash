"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Music, ArrowRight, Search, Sparkles, User, Cake, Mail, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import VenueMapListItem from "@/components/venue-map/VenueMapListItem"
import EntertainmentBrowseCard from "@/components/EntertainmentBrowseCard"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import VenueBrowserModal from "@/components/VenueBrowserModal"
import EntertainmentBrowserModal from "@/components/EntertainmentBrowserModal"
import StepProgressIndicator from "./components/StepProgressIndicator"
import { usePartyPlan } from "@/utils/partyPlanBackend"
import { usePartyBuilder, partyBuilderBackend } from "@/utils/partyBuilderBackend"
import { trackStep, trackSupplierViewed } from "@/utils/partyTracking"
import { useToast } from "@/components/ui/toast"

export default function PartySetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { buildParty } = usePartyBuilder()
  const buildPartyRef = useRef(buildParty)
  buildPartyRef.current = buildParty

  // Party data
  const [partyDetails, setPartyDetails] = useState(null)
  const [isBuildingParty, setIsBuildingParty] = useState(true)
  const { partyPlan, venueCarouselOptions, entertainmentCarouselOptions, addSupplier, refetch } = usePartyPlan()
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  // Step state
  const [currentStep, setCurrentStep] = useState(1) // 1 = venue, 2 = entertainer
  const [hasOwnVenue, setHasOwnVenue] = useState(false)

  // Selection state
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [selectedEntertainer, setSelectedEntertainer] = useState(null)

  // Name/age collection state
  const [showNameCollection, setShowNameCollection] = useState(false)
  const [childFirstName, setChildFirstName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [discountEmail, setDiscountEmail] = useState("")
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)

  // Modal state
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [customizationSupplier, setCustomizationSupplier] = useState(null)
  const [showVenueBrowserModal, setShowVenueBrowserModal] = useState(false)
  const [showEntertainmentBrowserModal, setShowEntertainmentBrowserModal] = useState(false)
  const [isSelectingVenue, setIsSelectingVenue] = useState(false)

  // Load party details from localStorage and kick off buildParty (runs once on mount)
  useEffect(() => {
    const init = async () => {
    try {
      const detailsStr = localStorage.getItem('party_details')
      if (!detailsStr) {
        router.push('/')
        return
      }

      const details = JSON.parse(detailsStr)
      setPartyDetails(details)
      setHasOwnVenue(details.hasOwnVenue || false)

      // If user has own venue, skip to entertainer step
      if (details.hasOwnVenue) {
        setCurrentStep(2)
      }

      // Restore step from sessionStorage if refreshing
      const savedStep = sessionStorage.getItem('party_setup_step')
      if (savedStep) {
        const step = parseInt(savedStep)
        if (step === 2 || (step === 1 && !details.hasOwnVenue)) {
          setCurrentStep(step)
        }
      }

      // Track setup started — also passes party details as fallback
      // in case party_planning_started didn't complete before page unload
      // Awaited to ensure session row exists before any subsequent trackStep calls
      await trackStep('party_setup_started', {
        hasOwnVenue: details.hasOwnVenue,
        theme: details.theme,
        guestCount: details.guestCount,
        childName: details.childName,
        childAge: details.childAge,
        postcode: details.postcode || details.location,
        date: details.date
      })

      // Check if party plan already exists (e.g. user refreshed or came back)
      const existingPlan = localStorage.getItem('user_party_plan')
      if (existingPlan) {
        const plan = JSON.parse(existingPlan)
        // If plan has venue/entertainment carousel options, it's already built
        if ((plan.venueCarouselOptions?.length > 0) || (plan.entertainmentCarouselOptions?.length > 0)) {
          setIsBuildingParty(false)
          return
        }
      }

      // Build party in the background — page shows skeletons while this runs
      buildPartyRef.current(details).then((result) => {
        if (result.success) {
          // Refetch the party plan from localStorage (buildParty saves it there)
          refetchRef.current()
        }
        setIsBuildingParty(false)
      }).catch((err) => {
        console.error('Error building party:', err)
        setIsBuildingParty(false)
      })

    } catch (err) {
      console.error('Error loading party details:', err)
      router.push('/')
    }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Persist current step
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('party_setup_step', String(currentStep))
    }
  }, [currentStep])

  // Handle card click — toggle selection or open customization modal
  const handleCardClick = useCallback((supplier) => {
    const supplierId = supplier.id || supplier.originalSupplier?.id
    // If clicking already-selected card, deselect it
    if (currentStep === 1 && selectedVenue?.id === supplierId) {
      setSelectedVenue(null)
      return
    }
    if (currentStep === 2 && selectedEntertainer?.id === supplierId) {
      setSelectedEntertainer(null)
      return
    }
    // Otherwise open customization modal
    const fullSupplier = supplier.originalSupplier || supplier
    setCustomizationSupplier(fullSupplier)
    setShowCustomizationModal(true)
    // Track supplier viewed
    trackSupplierViewed(
      currentStep === 1 ? 'Venues' : 'Entertainment',
      fullSupplier.name,
      fullSupplier.id
    )
  }, [currentStep, selectedVenue, selectedEntertainer])

  // Handle supplier added from customization modal
  // The modal calls onAddToPlan with a single object: { supplier, package, addons, totalPrice }
  const handleAddToPlan = useCallback(async (data) => {
    const supplier = data.supplier
    const packageData = data.package
    const addons = data.addons || []
    const category = supplier.category
    const isVenue = category === 'Venues'

    try {
      // Build the supplier object with package data (same pattern as dashboard)
      const supplierWithPackage = {
        ...supplier,
        packageData: packageData || supplier.packageData,
        selectedAddons: addons
      }

      const result = await addSupplier(supplierWithPackage, packageData)

      if (result.success) {
        if (isVenue) {
          setSelectedVenue(supplierWithPackage)
          toast.success(`${supplier.name} added to your party`, { duration: 2500 })
          trackStep('party_setup_venue_selected', {
            venueId: supplier.id,
            venueName: supplier.name,
            source: 'card'
          })
        } else {
          setSelectedEntertainer(supplierWithPackage)
          toast.success(`${supplier.name} added to your party`, { duration: 2500 })
          trackStep('party_setup_entertainer_selected', {
            entertainerId: supplier.id,
            entertainerName: supplier.name,
            source: 'card'
          })
        }
      }
    } catch (error) {
      console.error('Error adding supplier:', error)
    }

    setShowCustomizationModal(false)
  }, [addSupplier, toast])

  // Handle venue selected from VenueBrowserModal
  const handleSelectVenue = useCallback(async (venue) => {
    setIsSelectingVenue(true)
    try {
      const result = await addSupplier(venue, venue.packageData || null)
      if (result.success) {
        setSelectedVenue(venue)
        setShowVenueBrowserModal(false)
        toast.success(`${venue.name} added to your party`, { duration: 2500 })
        trackStep('party_setup_venue_selected', {
          venueId: venue.id,
          venueName: venue.name,
          source: 'browser_modal'
        })
      }
    } catch (error) {
      console.error('Error selecting venue:', error)
    } finally {
      setIsSelectingVenue(false)
    }
  }, [addSupplier, toast])

  // Handle entertainer selected from EntertainmentBrowserModal
  const handleSelectEntertainer = useCallback(async (entertainer) => {
    try {
      const result = await addSupplier(entertainer, entertainer.packageData || null)
      if (result.success) {
        setSelectedEntertainer(entertainer)
        setShowEntertainmentBrowserModal(false)
        toast.success(`${entertainer.name} added to your party`, { duration: 2500 })
        trackStep('party_setup_entertainer_selected', {
          entertainerId: entertainer.id,
          entertainerName: entertainer.name,
          source: 'browser_modal'
        })
      }
    } catch (error) {
      console.error('Error selecting entertainer:', error)
    }
  }, [addSupplier, toast])

  // Navigation handlers
  const handleContinue = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(2)
      window.scrollTo(0, 0)
    } else {
      // Show name collection instead of going to dashboard
      setShowNameCollection(true)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        setTimeout(() => document.getElementById('childFirstName')?.focus({ preventScroll: true }), 300)
      }, 50)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    if (currentStep === 1) {
      trackStep('party_setup_venue_skipped', {})
      setCurrentStep(2)
      window.scrollTo(0, 0)
    } else {
      trackStep('party_setup_entertainer_skipped', {})
      // Show name collection instead of going to dashboard
      setShowNameCollection(true)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        setTimeout(() => document.getElementById('childFirstName')?.focus({ preventScroll: true }), 300)
      }, 50)
    }
  }, [currentStep])

  // Auto-add free party bags when the campaign is active (or flyer flag set),
  // so users land on the dashboard with party bags already included.
  const autoAddFreePartyBagsIfEligible = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return

      const campaignActive = process.env.NEXT_PUBLIC_PARTYBAGS_CAMPAIGN_ACTIVE === 'true'
      const flyerFlag = localStorage.getItem('flyer_partybags') === 'true'
      if (!campaignActive && !flyerFlag) return

      // Skip if the plan already has a party bags supplier
      const currentPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
      if (currentPlan?.partyBags) return

      // Fetch party bags suppliers and pick the cheapest per-bag option
      const result = await partyBuilderBackend.getSuppliersByCategory('Party Bags')
      if (!result?.success || !Array.isArray(result.suppliers) || result.suppliers.length === 0) {
        console.log('🎁 No party bags suppliers available to auto-add')
        return
      }

      const cheapest = [...result.suppliers].sort(
        (a, b) => (a.priceFrom || a.price || 0) - (b.priceFrom || b.price || 0)
      )[0]

      const addResult = await addSupplier(cheapest, null)
      if (addResult?.success) {
        console.log('🎁 Free party bags auto-added to plan:', cheapest.name)
      } else {
        console.warn('🎁 Failed to auto-add party bags:', addResult?.error)
      }
    } catch (e) {
      console.error('🎁 Error auto-adding party bags:', e)
    }
  }, [addSupplier])

  // Handle final submit — save name/age, optionally submit email, and go to dashboard
  const handleFinalSubmit = useCallback(async () => {
    const name = childFirstName.trim()
    if (!name || !childAge) return

    setIsSubmittingEmail(true)

    // Update party_details in localStorage with child name/age
    let partyDetailsForEmail = null
    let partyPlanForEmail = null
    try {
      const detailsStr = localStorage.getItem('party_details')
      if (detailsStr) {
        const details = JSON.parse(detailsStr)
        details.childName = name
        details.firstName = name
        details.childAge = parseInt(childAge)
        details.welcomeCompleted = true
        details.welcomeCompletedAt = new Date().toISOString()
        localStorage.setItem('party_details', JSON.stringify(details))
        partyDetailsForEmail = details
      }
      partyPlanForEmail = JSON.parse(localStorage.getItem('user_party_plan') || '{}')
      // Set welcome completed flags so popup doesn't show
      localStorage.setItem('welcome_completed', 'true')
      sessionStorage.setItem('welcome_completed', 'true')
      localStorage.removeItem('show_welcome_popup')
      localStorage.removeItem('welcome_trigger')
      localStorage.removeItem('redirect_welcome')
    } catch (e) {
      console.error('Error saving child details:', e)
    }

    // Submit email for discount if provided
    const email = discountEmail.trim()
    if (email && email.includes('@')) {
      try {
        const res = await fetch('/api/save-party-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            sessionId: localStorage.getItem('tracking_session_id') || '',
            partyDetails: partyDetailsForEmail,
            partyPlan: partyPlanForEmail,
            totalCost: 0,
            marketingConsent: false
          })
        })
        const data = await res.json()
        if (data.success) {
          localStorage.setItem('saved_party_email', email.toLowerCase())
          if (data.discountCode) {
            localStorage.setItem('save_plan_discount_code', data.discountCode)
          }
          sessionStorage.setItem('save_plan_banner_dismissed', 'true')
        }
      } catch (e) {
        console.error('Error submitting email:', e)
      }
    }

    await trackStep('party_setup_completed', {
      venueSelected: !!selectedVenue,
      entertainerSelected: !!selectedEntertainer,
      childName: name,
      childAge: parseInt(childAge),
      emailProvided: !!email,
      email: email || null
    })
    await autoAddFreePartyBagsIfEligible()
    sessionStorage.removeItem('party_setup_step')
    router.push(`/dashboard?source=party_setup&t=${Date.now()}`)
  }, [childFirstName, childAge, discountEmail, selectedVenue, selectedEntertainer, router, autoAddFreePartyBagsIfEligible])

  // Handle skip name collection
  const handleSkipNameCollection = useCallback(async () => {
    // Save with placeholder
    try {
      const detailsStr = localStorage.getItem('party_details')
      if (detailsStr) {
        const details = JSON.parse(detailsStr)
        details.childName = details.childName || "Your Child"
        details.childAge = details.childAge || 6
        details.welcomeCompleted = true
        details.welcomeCompletedAt = new Date().toISOString()
        localStorage.setItem('party_details', JSON.stringify(details))
      }
      localStorage.setItem('welcome_completed', 'true')
      sessionStorage.setItem('welcome_completed', 'true')
      localStorage.removeItem('show_welcome_popup')
      localStorage.removeItem('welcome_trigger')
      localStorage.removeItem('redirect_welcome')
    } catch (e) {
      console.error('Error saving child details:', e)
    }

    await trackStep('party_setup_completed', {
      venueSelected: !!selectedVenue,
      entertainerSelected: !!selectedEntertainer,
      skippedNameCollection: true
    })
    await autoAddFreePartyBagsIfEligible()
    sessionStorage.removeItem('party_setup_step')
    router.push(`/dashboard?source=party_setup&t=${Date.now()}`)
  }, [selectedVenue, selectedEntertainer, router, autoAddFreePartyBagsIfEligible])

  const handleBack = useCallback(() => {
    if (showNameCollection) {
      setShowNameCollection(false)
      window.scrollTo(0, 0)
    } else if (currentStep === 2 && !hasOwnVenue) {
      setCurrentStep(1)
      window.scrollTo(0, 0)
    }
  }, [currentStep, hasOwnVenue, showNameCollection])

  // Show skeleton while reading localStorage (useEffect hasn't run yet)
  if (!partyDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl pb-24">
          <div className="mb-8 flex justify-center gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-16 h-0.5 bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="text-center mb-6">
            <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
          <div className="max-w-lg mx-auto">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-white mb-6">
              <div className="h-52 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const childName = partyDetails?.childName || "Your Child"
  const theme = partyDetails?.theme || ""
  const cardsLoading = isBuildingParty

  // Pre-selected #1 recommendations (or user's browsed pick)
  const recommendedVenue = selectedVenue || partyPlan?.venue
  const recommendedEntertainer = selectedEntertainer || partyPlan?.entertainment

  const hasSelection = (currentStep === 1 && selectedVenue) || (currentStep === 2 && selectedEntertainer)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl pb-24">

        {/* Progress indicator — hidden during name collection */}
        {!showNameCollection && (
          <div className="mb-8">
            <StepProgressIndicator
              currentStep={currentStep}
              hasOwnVenue={hasOwnVenue}
            />
          </div>
        )}

        {/* Step 1: Venue */}
        {currentStep === 1 && !hasOwnVenue && (
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                We've picked a great venue for you
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                A popular choice for kids' parties near you. You can swap this anytime.
              </p>
            </div>

            {/* Single recommendation card */}
            {cardsLoading ? (
              <div className="rounded-xl overflow-hidden border border-gray-100 bg-white mb-6">
                <Skeleton className="h-40 md:h-52 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full mt-3" />
                </div>
              </div>
            ) : recommendedVenue ? (
              <div className="mb-6">
                <div className="rounded-xl overflow-hidden ring-2 ring-[hsl(var(--primary-500))] ring-offset-2 [&_.aspect-\[20\/19\]]:aspect-[16/10] md:[&_.aspect-\[20\/19\]]:aspect-[20/19]">
                  <VenueMapListItem
                    venue={recommendedVenue.originalSupplier || recommendedVenue}
                    isCurrentlySelected={!!selectedVenue}
                    onClick={() => handleCardClick(recommendedVenue)}
                    partyDetails={partyDetails}
                  />
                </div>
                {/* PartySnap pick badge */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-gray-500">PartySnap recommendation</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 mb-6">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No venues found near you yet</p>
              </div>
            )}

            {/* Other options thumbnails */}
            {!cardsLoading && (() => {
              const others = (venueCarouselOptions || []).filter(v => v.id !== recommendedVenue?.id).slice(0, 4)
              if (others.length === 0) return null
              return (
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Other great options</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory">
                    {others.map(venue => {
                      const v = venue.originalSupplier || venue
                      const img = v.coverPhoto || v.image || v.serviceDetails?.photos?.[0]?.src || '/placeholder.png'
                      return (
                        <button
                          key={venue.id}
                          onClick={() => handleCardClick(venue)}
                          className="flex-shrink-0 w-[45%] text-left bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group snap-start block"
                        >
                          <div className="aspect-[16/10] overflow-hidden">
                            <img src={img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="p-2.5">
                            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{v.name}</p>
                            {(v.priceFrom || venue.price) ? (
                              <p className="text-xs text-gray-500 mt-0.5">£{venue.price || v.priceFrom}</p>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Browse link */}
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setShowVenueBrowserModal(true)
                  trackStep('party_setup_browse_venues', {})
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 transition-colors"
              >
                Browse other venues
              </button>
            </div>

          </div>
        )}

        {/* Step 2: Entertainer */}
        {currentStep === 2 && !showNameCollection && (
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                We've found a top entertainer
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                {(() => {
                  const ent = recommendedEntertainer?.originalSupplier || recommendedEntertainer
                  const gRating = ent?.googleRating
                  const ratingText = gRating ? `Rated ${gRating}★ on Google. ` : ''
                  return `${ratingText}Trusted by local parents for kids' parties. You can swap this anytime.`
                })()}
              </p>
            </div>

            {/* Single recommendation card */}
            {cardsLoading ? (
              <div className="rounded-xl overflow-hidden border border-gray-100 bg-white mb-6">
                <Skeleton className="h-40 md:h-52 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full mt-3" />
                </div>
              </div>
            ) : recommendedEntertainer ? (
              <div className="mb-6">
                <div className="rounded-xl overflow-hidden ring-2 ring-[hsl(var(--primary-500))] ring-offset-2 [&_.aspect-\[20\/19\]]:aspect-[16/10] md:[&_.aspect-\[20\/19\]]:aspect-[20/19]">
                  <EntertainmentBrowseCard
                    entertainer={recommendedEntertainer.originalSupplier || recommendedEntertainer}
                    isCurrentlySelected={!!selectedEntertainer}
                    onClick={() => handleCardClick(recommendedEntertainer)}
                  />
                </div>
                {/* PartySnap pick badge */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-gray-500">PartySnap recommendation</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 mb-6">
                <Music className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No entertainers found for your area yet</p>
              </div>
            )}

            {/* Other options thumbnails */}
            {!cardsLoading && (() => {
              const others = (entertainmentCarouselOptions || []).filter(e => e.id !== recommendedEntertainer?.id).slice(0, 4)
              if (others.length === 0) return null
              return (
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Other great options</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory">
                    {others.map(entertainer => {
                      const e = entertainer.originalSupplier || entertainer
                      const img = e.coverPhoto || e.image || e.serviceDetails?.photos?.[0]?.src || e.portfolioImages?.[0]?.src || '/placeholder.png'
                      return (
                        <button
                          key={entertainer.id}
                          onClick={() => handleCardClick(entertainer)}
                          className="flex-shrink-0 w-[45%] text-left bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group snap-start block"
                        >
                          <div className="aspect-[16/10] overflow-hidden">
                            <img src={img} alt={e.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="p-2.5">
                            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{e.name}</p>
                            {(e.priceFrom || entertainer.price) ? (
                              <p className="text-xs text-gray-500 mt-0.5">From £{entertainer.price || e.priceFrom}</p>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Browse link */}
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setShowEntertainmentBrowserModal(true)
                  trackStep('party_setup_browse_entertainers', {})
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 transition-colors"
              >
                Browse other entertainers
              </button>
            </div>

          </div>
        )}
        {/* Name/Age Collection */}
        {showNameCollection && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Nearly there!
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Who's the party for? We'll personalise everything for them.
              </p>
            </div>

            {/* Combined form card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Name & Age inputs */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="childFirstName" className="text-sm font-semibold text-gray-700">
                    Who's the party for?
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="childFirstName"
                      type="text"
                      value={childFirstName}
                      onChange={(e) => setChildFirstName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && childFirstName.trim() && childAge) handleFinalSubmit() }}
                      className="pl-11 h-12 text-base font-medium bg-gray-50 border border-gray-200 rounded-xl focus:border-[hsl(var(--primary-500))] focus:bg-white transition-colors"
                      placeholder="e.g. Emma"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="childAge" className="text-sm font-semibold text-gray-700">
                    How old will they be?
                  </Label>
                  <div className="relative">
                    <Cake className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Select value={childAge} onValueChange={setChildAge}>
                      <SelectTrigger className="w-full pl-11 h-12 text-base bg-gray-50 border border-gray-200 rounded-xl focus:border-[hsl(var(--primary-500))] focus:bg-white transition-colors">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(age => (
                          <SelectItem key={age} value={String(age)}>
                            {age} {age === 1 ? 'year old' : 'years old'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Email for discount — integrated section */}
              <div className="bg-gradient-to-r from-[#FF7247] to-[#E85A30] p-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <Gift className="w-4 h-4 text-white/90" />
                  <span className="text-sm font-bold text-white">Get £20 off</span>
                  <span className="text-[10px] font-semibold text-yellow-300 uppercase tracking-wide ml-auto">Limited Time</span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="discountEmail"
                    type="email"
                    value={discountEmail}
                    onChange={(e) => setDiscountEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && childFirstName.trim() && childAge) handleFinalSubmit() }}
                    className="pl-10 h-11 text-sm font-medium border-0 rounded-xl bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your email for a discount code"
                  />
                </div>
                <p className="text-white/60 text-xs mt-2 text-center">
                  No spam, ever. Just your discount code.
                </p>
              </div>
            </div>

            {/* What's next teaser */}
            <div className="mt-5 flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-600">
                Next up: add cakes, party bags, decorations and more!
              </p>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              No payment needed — you're just exploring for now.
            </p>
          </div>
        )}
      </div>

      {/* Sticky bottom banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto">
          {showNameCollection ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkipNameCollection}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip
                </button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={!childFirstName.trim() || !childAge || isSubmittingEmail}
                  size="sm"
                  className="gap-1.5"
                >
                  {isSubmittingEmail ? "Saving..." : childFirstName.trim() ? `See ${childFirstName.trim()}'s Party` : "See My Party"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full gap-1.5"
              >
                Looks good, continue
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  {currentStep === 2 && !hasOwnVenue && (
                    <button
                      onClick={handleBack}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSkip}
                  className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SupplierCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => {
          setShowCustomizationModal(false)
          setCustomizationSupplier(null)
        }}
        supplier={customizationSupplier}
        onAddToPlan={handleAddToPlan}
        partyDetails={partyDetails}
        partyDate={partyDetails?.date}
        currentPhase="planning"
      />

      <VenueBrowserModal
        venues={venueCarouselOptions || []}
        selectedVenue={selectedVenue}
        isOpen={showVenueBrowserModal}
        onClose={() => setShowVenueBrowserModal(false)}
        onSelectVenue={handleSelectVenue}
        partyDetails={partyDetails}
        isSelectingVenue={isSelectingVenue}
      />

      <EntertainmentBrowserModal
        isOpen={showEntertainmentBrowserModal}
        onClose={() => setShowEntertainmentBrowserModal(false)}
        onSelectEntertainer={handleSelectEntertainer}
        partyDetails={partyDetails}
        currentEntertainer={selectedEntertainer}
      />
    </div>
  )
}
