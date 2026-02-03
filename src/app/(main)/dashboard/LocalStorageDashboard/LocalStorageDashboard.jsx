"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti"
import { useToast } from '@/components/ui/toast'
// UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"
// Icons
import { RefreshCw, ChevronRight, Plus, Check, Sparkles, X, Building, AlertTriangle } from "lucide-react"
// Custom Components
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import EnquirySuccessBanner from "@/components/enquirySuccessBanner"
import LocalStoragePartyHeader from "../components/ui/LocalStoragePartyHeader"
import CountdownWidget from "../components/ui/CountdownWidget"
import PartyExcitementMeter from "../components/ui/PartyExcitementMeter"
import DeleteConfirmDialog from "../components/Dialogs/DeleteConfirmDialog"
import GoogleOneTap from "@/components/GoogleOneTap"
// Supplier Components
import SupplierCard from "../components/SupplierCard/SupplierCard"
import MobileSupplierNavigation from "../components/MobileSupplierNavigation"
// Addon Components
import AddonsSection from "../components/AddonsSection"
import { AddonProvider, RecommendedAddonsWrapper, AddonsSectionWrapper } from '../components/AddonProviderWrapper'
import AddonDetailsModal from "@/components/AddonDetailsModal"
// Other Components
import BudgetControls from "@/components/budget-controls"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import RecommendedAddons from "@/components/recommended-addons"
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"
import ReferFriend from "@/components/ReferFriend"
// Make sure you have this import
import { SnappyDashboardTour, useDashboardTour } from '@/components/ui/SnappyDashboardTour'
// import SimpleMobileBottomTabBar from "../components/SimpleMobileBottomBar"
// import PartySummarySection from "../components/PartySummarySection" // Removed - functionality moved to SmartStickyBottomBar
import SmartStickyBottomBar from "../components/SmartStickyBottomBar"
import VenueBrowserModal from "@/components/VenueBrowserModal"
// Hooks
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useSupplierManager } from '../hooks/useSupplierManager'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { usePartyPlan } from '@/utils/partyPlanBackend'
import useDisableScroll from "@/hooks/useDisableScroll"
import  SnappyLoader  from "@/components/ui/SnappyLoader"

import { calculateFinalPrice, calculatePartyTotal, getDisplayPrice, getPriceBreakdownText } from '@/utils/unifiedPricing'




const getSupplierDisplayPricing = (supplier, partyDetails, supplierAddons = []) => {
  if (!supplier) return null;
  
  const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
  
  return {
    totalPrice: pricing.finalPrice,
    basePrice: pricing.basePrice,
    weekendInfo: pricing.details.isWeekend ? {
      premiumAmount: pricing.breakdown.weekend,
      isApplied: pricing.breakdown.weekend > 0
    } : null,
    durationInfo: pricing.breakdown.extraHours > 0 ? {
      hasDurationPremium: true,
      extraHours: pricing.details.extraHours,
      extraCost: pricing.breakdown.extraHours
    } : { hasDurationPremium: false },
    isTimeBased: pricing.details.extraHours > 0,
    breakdown: pricing.breakdown,
    details: pricing.details
  };
};


export default function LocalStorageDashboard() {
  // Router and navigation
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext, getStoredModalState, clearModalState } = useContextualNavigation()
  const { toast } = useToast()

  // ✅ PRODUCTION SAFETY: Core state management
  const [isMounted, setIsMounted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [preventScrollFlag, setPreventScrollFlag] = useState(false)
  const scrollLockPositionRef = useRef(null)


  // Refs for tracking
  const welcomePopupShownRef = useRef(false)
  const confettiTriggeredRef = useRef(false)

  // Welcome popup state
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeJustCompleted, setWelcomeJustCompleted] = useState(false)
  const [welcomeFormSubmitted, setWelcomeFormSubmitted] = useState(false)
  const [isTourActiveOnNavigation, setIsTourActiveOnNavigation] = useState(false)
  const [isCheckingWelcome, setIsCheckingWelcome] = useState(true) // NEW: Track if we're still checking for welcome popup

  // Party header expansion state
  const [isPartyHeaderExpanded, setIsPartyHeaderExpanded] = useState(false)

  // General state
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState(null)
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
  const [activeMobileSupplierType, setActiveMobileSupplierType] = useState('myParty')
  const [recommendedSuppliers, setRecommendedSuppliers] = useState({})
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false)
  const [isSelectingVenue, setIsSelectingVenue] = useState(false)
  const [showVenueBrowserModal, setShowVenueBrowserModal] = useState(false)
  const [showDesktopCompleteCTA, setShowDesktopCompleteCTA] = useState(false)
  const [showStickyBottomCTA, setShowStickyBottomCTA] = useState(false)
  const [showVenueConflictModal, setShowVenueConflictModal] = useState(false)
  const [venueConflictData, setVenueConflictData] = useState(null)
  // Add these state variables near your other useState declarations



  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [isNavigatingToReview, setIsNavigatingToReview] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    category: '',
    theme: '',
    date: null,
    filters: {
    },
  })

  const [uploadingChildPhoto, setUploadingChildPhoto] = useState(false)
const childPhotoRef = useRef(null)
  // Debug state (remove in production)
  const [debugInfo, setDebugInfo] = useState({})


  useDisableScroll([showSupplierModal, showWelcomePopup, showSupplierModal])

  const handleMobileNavigationStepActive = (isActive) => {

    setIsTourActiveOnNavigation(isActive)
  }

  const { 
    isTourActive, 
    startTour, 

    completeTour, 
    closeTour 
  } = useDashboardTour()

  


  // ✅ PRODUCTION SAFETY: Mount detection
  useEffect(() => {
    setIsMounted(true)
    setIsClient(typeof window !== 'undefined')
    // Note: isCheckingWelcome starts as true, so loading screen shows immediately
  }, [])

  // Show sticky bottom CTA after scrolling 400px (desktop only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBottomCTA(true)
      } else {
        setShowStickyBottomCTA(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hooks - only run after mounting
  const {
    partyPlan,
    loading: planLoading,
    error: planError,
    totalCost,
    addons,
    venueCarouselOptions, // NEW: Get carousel options
    removeSupplier,
    addAddon,
    removeAddon,
    addSupplier,
    hasAddon,
    removeAddonFromSupplier,
    updateSupplierPackage, // Add this to handle customization
    refetch, // Add this to refresh the party plan
  } = usePartyPlan()

  const {
    partyDetails,
    partyTheme,
    themeLoaded,
    handleNameSubmit: originalHandleNameSubmit,
    handlePartyDetailsUpdate
  } = usePartyDetails()
  

  const {
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    updateSuppliersForBudget
  } = useBudgetManager(totalCost, isUpdating, setIsUpdating)

  const {
    loadingCards,
    setLoadingCards,
    suppliersToDelete,
    recentlyDeleted,
    showDeleteConfirm,
    selectedSupplierModal,
    getSupplierDisplayName,
    openSupplierModal: originalOpenSupplierModal,
    closeSupplierModal: originalCloseSupplierModal,
    handleSupplierSelection: originalHandleSupplierSelection,
    handleDeleteSupplier,
    confirmDeleteSupplier,
    cancelDeleteSupplier
  } = useSupplierManager(removeSupplier)

  // ✅ CRITICAL FIX: Create suppliers object with useMemo so it updates when partyPlan changes
  const suppliers = useMemo(() => ({
    venue: partyPlan.venue || null,
    entertainment: partyPlan.entertainment || null,
    cakes: partyPlan.cakes || null,
    facePainting: partyPlan.facePainting || null,
    activities: partyPlan.activities || null,
    partyBags: partyPlan.partyBags || null,
    decorations: partyPlan.decorations || null,
    balloons: partyPlan.balloons || null,
    catering: partyPlan.catering || null,
    photography: partyPlan.photography || null,
    bouncyCastle: partyPlan.bouncyCastle || null,
    sweetTreats: partyPlan.sweetTreats || null,
  }), [partyPlan])

  // ✅ PRODUCTION SAFE: Welcome popup detection with one-time-only logic
  useEffect(() => {
    if (!isMounted || !isClient) {

      return
    }



    try {
      // Check URL parameters
      const showWelcomeFromURL = searchParams.get("show_welcome") === "true"
      const sourceFromURL = searchParams.get("source")
      const timestampFromURL = searchParams.get("t")



      // Check localStorage with error handling
      let welcomeTrigger = null
      let partyDetailsData = null
      let hasPartyData = false
      let showWelcomeFlag = false
      let welcomeCompleted = false

      try {
        // Check multiple localStorage keys
        const welcomeTriggerData = localStorage.getItem('welcome_trigger')
        const partyDetailsRaw = localStorage.getItem('party_details')
        const showWelcomeRaw = localStorage.getItem('show_welcome_popup')
        const partyJustCreated = localStorage.getItem('party_just_created')
        const redirectWelcome = localStorage.getItem('redirect_welcome')

        // ✅ NEW: Check if welcome was already completed
        const welcomeCompletedFlag = localStorage.getItem('welcome_completed')
        const welcomeCompletedSession = sessionStorage.getItem('welcome_completed')

        if (welcomeTriggerData) {
          welcomeTrigger = JSON.parse(welcomeTriggerData)
        }

        if (partyDetailsRaw) {
          partyDetailsData = JSON.parse(partyDetailsRaw)
          hasPartyData = true
          // Check if welcome was completed in party details
          welcomeCompleted = partyDetailsData.welcomeCompleted === true
        }

        // Check multiple completion flags
        welcomeCompleted = welcomeCompleted ||
                          welcomeCompletedFlag === 'true' ||
                          welcomeCompletedSession === 'true'

        // Set state if welcome was already completed
        if (welcomeCompleted) {
          setWelcomeFormSubmitted(true)
        }

        showWelcomeFlag = showWelcomeRaw === 'true' || redirectWelcome === 'true'



        // Update debug info
        setDebugInfo({
          mounted: isMounted,
          isClient,
          showWelcomeFromURL,
          sourceFromURL,
          welcomeTrigger: !!welcomeTrigger,
          partyDetails: !!partyDetailsData,
          showWelcomeFlag,
          hasPartyData,
          welcomeCompleted, // ✅ NEW: Add to debug
          alreadyShown: welcomePopupShownRef.current,
          timestamp: new Date().toISOString()
        })

      } catch (storageError) {
        console.error('❌ LocalStorage error:', storageError)
      }

      // ✅ FIXED: Only show welcome if not completed and other conditions met
      const shouldShowWelcome = (
        !welcomeCompleted && // ✅ NEW: Don't show if already completed
        (showWelcomeFromURL ||
         welcomeTrigger?.shouldShowWelcome ||
         showWelcomeFlag) && // ✅ REMOVED: hasPartyData (too broad)
        !welcomePopupShownRef.current
      )



      if (shouldShowWelcome) {


        // ✅ NEW: Show popup immediately without delay to prevent flashing
        setShowWelcomePopup(true)
        welcomePopupShownRef.current = true
        setIsCheckingWelcome(false) // Done checking

        // Clean up URL parameters
        try {
          const currentPath = window.location.pathname
          const newSearchParams = new URLSearchParams(searchParams.toString())
          newSearchParams.delete("show_welcome")
          newSearchParams.delete("source")
          newSearchParams.delete("t")

          const newURL = newSearchParams.toString() ?
            `${currentPath}?${newSearchParams.toString()}` :
            currentPath

          router.replace(newURL, { scroll: false })
        } catch (urlError) {
          console.warn('⚠️ URL cleanup error:', urlError)
        }

        // Clean up localStorage triggers
        try {
          localStorage.removeItem('welcome_trigger')
          localStorage.removeItem('show_welcome_popup')
          localStorage.removeItem('party_just_created')
          localStorage.removeItem('redirect_welcome')
  
        } catch (cleanupError) {
          console.warn('⚠️ Cleanup error:', cleanupError)
        }
      } else {
      
        // ✅ NEW: Done checking, allow dashboard to render
        setIsCheckingWelcome(false)
      }

    } catch (error) {
      console.error('💥 Welcome popup detection error:', error)
      // ✅ NEW: On error, also stop checking
      setIsCheckingWelcome(false)
    }
  }, [isMounted, isClient, searchParams, router])

  // ✅ PRODUCTION SAFE: Confetti effect
  useEffect(() => {
    if (welcomeJustCompleted && !showWelcomePopup && !confettiTriggeredRef.current && isMounted) {


      confettiTriggeredRef.current = true

      const triggerConfetti = () => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b35', '#f7931e', '#ffd23f', '#06d6a0', '#118ab2', '#073b4c']
        })

        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.7 },
            colors: ['#ff6b35', '#f7931e', '#ffd23f']
          })
        }, 300)

        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 110,
            origin: { y: 0.8 },
            colors: ['#06d6a0', '#118ab2', '#073b4c']
          })
        }, 600)
      }

      setTimeout(triggerConfetti, 500)
      setTimeout(() => setWelcomeJustCompleted(false), 2000)
    }
  }, [welcomeJustCompleted, showWelcomePopup, isMounted])

// 2. UNIFIED: Single scroll management effect
useEffect(() => {
  if (!isMounted || !isClient) return

  const handleScrollToSupplier = () => {
    try {
      // CRITICAL: If preventScrollFlag is set, skip ALL scroll logic
      if (preventScrollFlag) {
        return
      }

      // Check URL parameters for scroll hints
      const scrollToSupplier = searchParams.get('scrollTo')
      const lastAction = searchParams.get('action')
      const fromPage = searchParams.get('from')
      const source = searchParams.get('source')

   

      // ✅ ALWAYS ensure scroll is unlocked first
      const unlockScroll = () => {
        document.body.style.overflow = 'unset'
        document.documentElement.style.overflow = 'unset'
        document.body.classList.remove('modal-open', 'overflow-hidden')
        document.documentElement.classList.remove('modal-open', 'overflow-hidden')
      }

      unlockScroll() // Immediate unlock

      // Handle welcome popup scenario
      if (showWelcomePopup) {

        return
      }

      if (scrollToSupplier && lastAction === 'supplier-added') {

        // ✅ MOBILE: Switch to the correct tab
        setActiveMobileSupplierType(scrollToSupplier)
        
        // ✅ UNIFIED: Handle both desktop and mobile scrolling
        const scrollDelay = source === 'a_la_carte' ? 1000 : 500
        
        setTimeout(() => {
          // Ensure scroll is still unlocked
          unlockScroll()
          
          // Try desktop scroll first
          const desktopElement = document.getElementById(`supplier-${scrollToSupplier}`)
          if (desktopElement && window.innerWidth >= 768) {

            desktopElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            })
          } else {
            // Mobile: Scroll to mobile content area
            const mobileContent = document.getElementById('mobile-supplier-content')
            if (mobileContent) {
           
              mobileContent.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              })
            } else {
              console.log(`📱 Mobile: Content area not found, scrolling to top`)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }
        }, scrollDelay)

        // Clean up URL parameters
        setTimeout(() => {
          const newSearchParams = new URLSearchParams(searchParams.toString())
          newSearchParams.delete('scrollTo')
          newSearchParams.delete('action')
          if (fromPage && fromPage !== 'dashboard') newSearchParams.delete('from')
          
          const newURL = newSearchParams.toString() ? 
            `/dashboard?${newSearchParams.toString()}` : 
            '/dashboard'
          
          router.replace(newURL, { scroll: false })
        }, scrollDelay + 1000)
        
      } else if (fromPage === 'supplier-detail' || fromPage === 'browse') {
        // Coming back from supplier pages without adding
        console.log('📍 Returning from supplier page without adding - scrolling to top')
        setTimeout(() => {
          unlockScroll()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        // General case - just ensure scroll is unlocked
        setTimeout(unlockScroll, 100)
      }
      
    } catch (error) {
      console.error('❌ Unified scroll error:', error)
      // Emergency scroll unlock and top scroll
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const scrollTimeout = setTimeout(handleScrollToSupplier, 200)
  return () => clearTimeout(scrollTimeout)
}, [isMounted, isClient, searchParams, router, showWelcomePopup, activeMobileSupplierType, preventScrollFlag])

// 3. ✅ WELCOME POPUP: Handle scroll after welcome popup closes
useEffect(() => {
  if (!showWelcomePopup && isMounted && isClient) {
    const scrollToSupplier = searchParams.get('scrollTo')
    const lastAction = searchParams.get('action')
    
    if (scrollToSupplier && lastAction === 'supplier-added') {

      
      // Update mobile tab
      setActiveMobileSupplierType(scrollToSupplier)
      
      setTimeout(() => {
        // Ensure scroll is unlocked
        document.body.style.overflow = 'unset'
        document.documentElement.style.overflow = 'unset'
        
        // Try scrolling to the element
        const desktopElement = document.getElementById(`supplier-${scrollToSupplier}`)
        const mobileContent = document.getElementById('mobile-supplier-content')
        
        if (desktopElement && window.innerWidth >= 768) {
          desktopElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
        } else if (mobileContent) {
          mobileContent.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 500)
    }
  }
}, [showWelcomePopup, isMounted, isClient, searchParams])

// 4. SAFETY NET: Global scroll unlock effect
useEffect(() => {
  const unlockScroll = () => {
    // CRITICAL: Don't unlock if prevent-auto-scroll is active (prevents interference with Optional Extras)
    if (document.body.classList.contains('prevent-auto-scroll')) {
      return
    }

    document.body.style.overflow = 'unset'
    document.documentElement.style.overflow = 'unset'
    document.body.classList.remove('modal-open', 'overflow-hidden')
    document.documentElement.classList.remove('modal-open', 'overflow-hidden')
  }

  // Run immediately when modals change
  unlockScroll()

  // Run again after a short delay as safety net
  const timeoutId = setTimeout(unlockScroll, 100)

  return () => {
    clearTimeout(timeoutId)
    unlockScroll() // Cleanup on unmount
  }
}, [showSupplierModal, showWelcomePopup, isAddonModalOpen])

useEffect(() => {


  if (!isMounted || !partyDetails) {

    return
  }

  // ✅ Debounce the loading to prevent multiple triggers
  const timeoutId = setTimeout(() => {
    const loadRecommendations = async () => {
      try {


        const { suppliersAPI } = await import('@/utils/mockBackend')
        const { scoreSupplierWithTheme } = await import('@/utils/partyBuilderBackend')
        const { checkSupplierAvailability } = await import('@/utils/availabilityChecker')
        const allSuppliers = await suppliersAPI.getAllSuppliers()

        const partyTheme = partyDetails?.theme || 'no-theme'


        const categoryMap = {
          venue: 'Venues',
          entertainment: 'Entertainment',
          cakes: 'Cakes',
          catering: 'Catering',
          facePainting: 'Face Painting',
          activities: 'Activities',
          partyBags: 'Party Bags',
          decorations: 'Decorations',
          balloons: 'Balloons',
          photography: 'Photography',
          bouncyCastle: 'Bouncy Castle',
          sweetTreats: 'Sweet Treats'
        }

        const newRecommendations = {}

        // For each category, if no supplier exists, recommend one based on theme
        Object.entries(categoryMap).forEach(([categoryKey, categoryName]) => {
          const hasSupplier = suppliers[categoryKey]

          if (!hasSupplier) {
            // Find all suppliers in this category
            const categorySuppliers = allSuppliers.filter(s => s.category === categoryName)

            if (categorySuppliers.length > 0) {
              // ✅ Filter by availability if party date is set
              let availableSuppliers = categorySuppliers
              let allUnavailable = false
              let unavailabilityReason = null

              if (partyDetails?.date) {
                let firstUnavailableReason = null
                availableSuppliers = categorySuppliers.filter(supplier => {
                  const availabilityCheck = checkSupplierAvailability(
                    supplier,
                    partyDetails.date,
                    partyDetails.time || partyDetails.startTime,
                    partyDetails.duration || 2
                  )
                  // Store the first unavailability reason (for lead time messages)
                  if (!availabilityCheck.available && !firstUnavailableReason) {
                    firstUnavailableReason = availabilityCheck
                  }
                  return availabilityCheck.available
                })

                // Check if all suppliers are unavailable
                if (availableSuppliers.length === 0 && categorySuppliers.length > 0) {
                  allUnavailable = true
                  // Store the reason for unavailability
                  unavailabilityReason = firstUnavailableReason
                }
              }

              if (availableSuppliers.length > 0) {
                // ✅ Sort by theme score and pick the best match
                const sortedByTheme = availableSuppliers
                  .map(supplier => ({
                    supplier,
                    themeScore: scoreSupplierWithTheme(supplier, partyTheme)
                  }))
                  .sort((a, b) => b.themeScore - a.themeScore)

                const bestMatch = sortedByTheme[0].supplier
                newRecommendations[categoryKey] = bestMatch

        
              } else if (allUnavailable) {
                // ✅ Mark category as having no available suppliers
                // Include the unavailability reason so UI can show helpful messages
                newRecommendations[categoryKey] = {
                  unavailable: true,
                  category: categoryName,
                  categoryKey: categoryKey,
                  totalSuppliers: categorySuppliers.length,
                  // Pass through lead time info for helpful messaging
                  requiredLeadTime: unavailabilityReason?.requiredLeadTime,
                  unavailabilityReason: unavailabilityReason?.reason
                }
                console.log(`⚠️ ${categoryKey}: No available suppliers for party date`, unavailabilityReason)
              }
            }
          }
        })


        setRecommendedSuppliers(newRecommendations)
        setRecommendationsLoaded(true)

      } catch (error) {
        console.error('❌ Error loading recommendations:', error)
        setRecommendationsLoaded(true)
      }
    }

    loadRecommendations()
  }, 300) // ✅ 300ms debounce

  return () => clearTimeout(timeoutId)

}, [isMounted, partyDetails, partyPlan]) // ✅ Use partyPlan instead of suppliers


// Handle edit party details - expand header and scroll to it
const handleEditPartyDetails = () => {
  setIsPartyHeaderExpanded(true)
  // Scroll to top where the header is
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleNameSubmit = (nameData) => {


  try {
    if (typeof originalHandleNameSubmit === 'function') {
      originalHandleNameSubmit(nameData)
    }

    setWelcomeJustCompleted(true)
    setWelcomeFormSubmitted(true) // Track that form was submitted

    // Set completion flags to prevent re-showing
    try {
      localStorage.setItem('welcome_completed', 'true')
      sessionStorage.setItem('welcome_completed', 'true')

      // Update party details with completion flag
      const existingPartyDetails = localStorage.getItem('party_details')
      if (existingPartyDetails) {
        const parsed = JSON.parse(existingPartyDetails)
        const updatedDetails = {
          ...parsed,
          childName: nameData.childName,
          firstName: nameData.firstName,
          lastName: nameData.lastName,
          childAge: nameData.childAge,
          welcomeCompleted: true,
          welcomeCompletedAt: new Date().toISOString()
        }

        localStorage.setItem('party_details', JSON.stringify(updatedDetails))

      }

      // NEW: Start tour after confetti completes
      setTimeout(() => {
        const tourCompleted = localStorage.getItem('dashboard_tour_completed') === 'true'
        if (!tourCompleted) {
          console.log('🎯 Auto-starting tour after welcome completion')
          startTour()
        }
      }, 3000) // Wait 3 seconds for confetti to finish

    } catch (updateError) {
      console.warn('⚠️ Error updating party details:', updateError)
    }

  } catch (error) {
    console.error('💥 Error in handleNameSubmit:', error)
  }
}

  const openSupplierModal = (category, theme = 'superhero') => {


    // Map frontend category to backend supplier type
    const supplierTypeMapping = {
      venue: 'Venues',
      entertainment: 'Entertainment',
      catering: 'Catering',
      cakes: 'Cakes',
      facePainting: 'Face Painting',
      activities: 'Activities',
      decorations: 'Decorations',
      partyBags: 'Party Bags',
      balloons: 'Balloons',
      photography: 'Photography',
      bouncyCastle: 'Bouncy Castle',
      sweetTreats: 'Sweet Treats'
    }
    
    setModalConfig({
      category,
      theme,
      date: partyDetails?.date,
      filters: {
        supplierType: supplierTypeMapping[category] || category,
        categoryDisplay: category
      }
    })
    setShowSupplierModal(true)
  }

  const closeSupplierModal = () => {
    console.log('🔒 Closing supplier modal with cleanup')
    setShowSupplierModal(false)
    clearModalState()
    
    // ✅ Comprehensive scroll unlock
    setTimeout(() => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      
      // Remove any modal-related classes
      const classesToRemove = ['modal-open', 'overflow-hidden', 'no-scroll']
      classesToRemove.forEach(className => {
        document.body.classList.remove(className)
        document.documentElement.classList.remove(className)
      })
      
      // Force a style recalculation
      document.body.offsetHeight

    }, 50)
  }

  const handleSupplierSelection = async (supplierData) => {

    
    try {
      const { supplier, package: selectedPackage, addons: selectedAddons = [] } = supplierData
      
      if (!supplier) {
        console.error('No supplier data provided')
        return
      }
  
      // Check if this is part of a replacement flow
      const replacementContext = sessionStorage.getItem('replacement_context')
      
      if (replacementContext) {
        const context = JSON.parse(replacementContext)
        
        if (context.isReplacementFlow) {
          // This is a replacement - show confirmation
          toast.success(`Replaced ${context.originalSupplier.name} with ${supplier.name}`, {
            duration: 4000
          })
          
          // Clear the replacement context
          sessionStorage.removeItem('replacement_context')
          
          // Check if there are more suppliers to replace
          if (context.remainingReplacements && context.remainingReplacements.length > 0) {
            const nextUnavailable = context.remainingReplacements[0]
            
            // Ask if user wants to replace the next unavailable supplier
            toast.info(`Next: Find replacement for ${getSupplierDisplayName(nextUnavailable.type)}?`, {
              duration: 5000,
              action: {
                label: 'Yes',
                onClick: () => {
                  // Store updated context
                  sessionStorage.setItem('replacement_context', JSON.stringify({
                    originalSupplier: nextUnavailable.supplier,
                    supplierType: nextUnavailable.type,
                    reason: nextUnavailable.reason,
                    remainingReplacements: context.remainingReplacements.slice(1),
                    isReplacementFlow: true
                  }))
                  
                  // Open modal for next supplier
                  openSupplierModal(nextUnavailable.type, currentDetails.theme)
                }
              }
            })
          }
        }
      }
      
      // Continue with normal supplier selection logic
      const result = await addSupplier(supplier, selectedPackage)
      
      if (result.success) {
        console.log('Supplier added successfully!')
        
        if (selectedAddons && selectedAddons.length > 0) {
          for (const addon of selectedAddons) {
            await handleAddAddon(addon, supplier.id)
          }
        }
        
        const supplierTypeMapping = {
          'Venues': 'venue',
          'Entertainment': 'entertainment',
          'Catering': 'catering',
          'Cakes': 'cakes',
          'Face Painting': 'facePainting',
          'Activities': 'activities',
          'Decorations': 'decorations',
          'Photography': 'photography',
          'Party Bags': 'partyBags',
          'Bouncy Castle': 'bouncyCastle',
          'Sweet Treats': 'sweetTreats'
        }
        
        const supplierType = supplierTypeMapping[supplier.category] || 'venue'
        setActiveMobileSupplierType(supplierType)
        
        closeSupplierModal()
        
        // Scroll handling
        setTimeout(() => {
          document.body.style.overflow = 'unset'
          document.documentElement.style.overflow = 'unset'
          document.body.classList.remove('modal-open', 'overflow-hidden')
          document.documentElement.classList.remove('modal-open', 'overflow-hidden')
          
          const mobileContent = document.getElementById('mobile-supplier-content')
          if (mobileContent && window.innerWidth < 768) {
            mobileContent.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            })
          }
        }, 150)
        
      } else {
        console.error('Failed to add supplier:', result.error)
      }
      
    } catch (error) {
      console.error('Error in handleSupplierSelection:', error)
    }
  }


  // Modal restoration effects
  useEffect(() => {
    if (!isMounted) return
    
    const shouldRestoreModal = searchParams.get('restoreModal')
    
    if (shouldRestoreModal) {
      const storedState = getStoredModalState()
      
      if (storedState) {
 
        
        setModalConfig({
          category: storedState.category,
          theme: storedState.theme,
          date: storedState.date,
          filters: storedState.filters || {}
        })
        
        setShowSupplierModal(true)
        
        setTimeout(() => {
          if (storedState.scrollPosition) {
            window.scrollTo(0, storedState.scrollPosition)
          }
        }, 100)
        
        clearModalState()
        window.history.replaceState({}, '', '/dashboard')
      }
    }
  }, [isMounted, searchParams, getStoredModalState, clearModalState])

  useEffect(() => {
    if (!isMounted) return
    
    const handleRestoreModal = (event) => {
      const { detail: modalState } = event
      
      if (modalState) {
    
        setModalConfig({
          category: modalState.category,
          theme: modalState.theme,
          date: modalState.date,
          filters: modalState.filters || {}
        })
        
        setShowSupplierModal(true)
        
        setTimeout(() => {
          if (modalState.scrollPosition) {
            window.scrollTo(0, modalState.scrollPosition)
          }
        }, 100)
      }
    }

    window.addEventListener('restoreModal', handleRestoreModal)
    return () => window.removeEventListener('restoreModal', handleRestoreModal)
  }, [isMounted])

  // Addon handlers
  const handleAddonClick = (addon) => {
    
    setSelectedAddon(addon)
    setIsAddonModalOpen(true)
  }

  const handleAddonModalClose = () => {
    setIsAddonModalOpen(false)
    setSelectedAddon(null)
  }

  const handleAddAddonFromModal = async (addon) => {
    await handleAddAddon(addon)
  }

  const handleAddAddon = async (addon, supplierId = null) => {
    if (hasAddon(addon.id)) {
  
      return
    }
    
    try {
      // ✅ ENHANCED: Better supplier association
      const finalSupplierId = addon.supplierId || supplierId
      
      // Find the supplier object to get more details
      let supplierObj = null
      if (finalSupplierId) {
        // Try to find supplier in suppliers object
        supplierObj = Object.values(suppliers).find(s => s && s.id === finalSupplierId)
      }
      
      const finalSupplierName = addon.supplierName || supplierObj?.name || 'General'
      const supplierCategory = supplierObj?.category || addon.category
      
      // Determine supplier type (for filtering)
      let supplierType = null
      if (supplierCategory) {
        const categoryLower = supplierCategory.toLowerCase()
        if (categoryLower === 'venues' || categoryLower === 'venue') {
          supplierType = 'venue'
        } else if (categoryLower === 'entertainment') {
          supplierType = 'entertainment'
        } else if (categoryLower === 'catering') {
          supplierType = 'catering'
        } else if (categoryLower === 'cakes') {
          supplierType = 'cakes'
        } else if (categoryLower === 'face painting') {
          supplierType = 'facePainting'
        } else if (categoryLower === 'activities') {
          supplierType = 'activities'
        } else if (categoryLower === 'party bags') {
          supplierType = 'partyBags'
        } else if (categoryLower === 'decorations') {
          supplierType = 'decorations'
        }
      }
      
      const addonWithSupplier = {
        ...addon,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        supplierType: supplierType,
        attachedToSupplier: supplierType, // Use same value for consistency
        category: supplierCategory,
        isSupplierAddon: !!finalSupplierId,
        addedAt: new Date().toISOString(),
        // Backup references
        parentSupplierId: finalSupplierId,
        parentSupplierName: finalSupplierName
      }
      

      
      const result = await addAddon(addonWithSupplier)
      
      if (result.success) {
        console.log("✅ Add-on added successfully!")
      } else {
        console.error("❌ Failed to add addon:", result.error)
      }
    } catch (error) {
      console.error("💥 Error adding addon:", error)
    }
  }

  const handleRemoveAddon = async (addonId) => {
    try {

      
      let result = await removeAddon(addonId)
      
      if (!result.success) {
        const supplierTypes = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons', 'sweetTreats']
        
        for (const supplierType of supplierTypes) {
          const supplier = suppliers[supplierType]
          if (supplier && supplier.selectedAddons) {
            const hasAddon = supplier.selectedAddons.some(addon => addon.id === addonId)
            if (hasAddon) {
              result = await removeAddonFromSupplier(supplierType, addonId)
              break
            }
          }
        }
      }
      
      if (result.success) {
        console.log("✅ Add-on removed successfully!")
      } else {
        console.error("❌ Failed to remove addon:", result.error)
      }
    } catch (error) {
      console.error("💥 Error removing addon:", error)
    }
  }

  // Navigation handlers
  const handleAddSupplier = () => {
    navigateWithContext('/browse', 'dashboard')
  }

  // Helper functions
  const getEnquiryStatus = (type) => null
  const getEnquiryTimestamp = (type) => null

  // Category helpers for desktop grid
  const getCategoryName = (type) => {
    const categoryNames = {
      venue: 'The Place',
      entertainment: 'The Entertainment',
      catering: 'The Food',
      cakes: 'The Cake',
      facePainting: 'Face Painting',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'The Decorations',
      balloons: 'Balloons',
      photography: 'Photography',
      bouncyCastle: 'Bouncy Castle',
      sweetTreats: 'Sweet Treats'
    }
    return categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getCategoryIcon = (type) => {
    const categoryIcons = {
      venue: '/journey-icons/location.png',
      entertainment: '/category-icons/entertainment.png',
      cakes: '/category-icons/cake.png',
      partyBags: '/category-icons/party-bags.png',
      catering: '/category-icons/catering.png',
      decorations: '/category-icons/decorations.png',
      facePainting: '/category-icons/face-painting.png',
      activities: '/category-icons/activities.png',
      balloons: '/category-icons/balloons.png',
      photography: '/category-icons/photography.png',
      bouncyCastle: '/category-icons/bouncy-castle.png',
      sweetTreats: '/category-icons/sweet-treats.png'
    }
    return categoryIcons[type] || null
  }

  const getCategoryTagline = (type) => {
    const theme = partyDetails?.theme?.toLowerCase() || 'party'

    const themeTaglines = {
      superhero: {
        venue: 'The hero headquarters awaits',
        entertainment: 'Super-powered fun for heroes',
        catering: 'Power-up food for little heroes',
        cakes: 'A super-powered showstopper',
        facePainting: 'Become your favorite superhero',
        activities: 'Hero training and super missions',
        partyBags: 'Super supplies for every hero',
        decorations: 'Create an epic hero hideout',
        balloons: 'Bold colors for brave heroes',
        photography: 'Capture heroic action shots',
        bouncyCastle: 'Bounce like a superhero',
        sweetTreats: 'Super sweet treats for heroes'
      },
      princess: {
        venue: 'A royal palace for the celebration',
        entertainment: 'Enchanting magic for little royals',
        catering: 'A feast fit for a princess',
        cakes: 'A magical royal masterpiece',
        facePainting: 'Become a beautiful princess',
        activities: 'Enchanting games for little royalty',
        partyBags: 'Royal treasures for each guest',
        decorations: 'Transform into an enchanted castle',
        balloons: 'Sparkles and princess colors',
        photography: 'Capture royal memories',
        bouncyCastle: 'Bounce in the royal court',
        sweetTreats: 'Royal sweets for little princesses'
      },
      // Add more themes as needed
    }

    const defaultTaglines = {
      venue: 'Where the party happens',
      entertainment: 'Keep them laughing for hours',
      catering: 'Delicious food everyone will love',
      cakes: 'Every party needs a showstopper',
      facePainting: 'Transform into their favorite character',
      activities: 'Fun games and activities',
      partyBags: 'Send them home with a smile',
      decorations: 'Set the perfect party scene',
      balloons: 'Add color and excitement',
      photography: 'Capture all the magical moments',
      bouncyCastle: 'Non-stop bouncing fun',
      sweetTreats: 'Candy carts, ice cream & sweet delights'
    }

    const taglines = themeTaglines[theme] || defaultTaglines
    return taglines[type] || ''
  }



  const enhancedTotalCost = useMemo(() => {
    // Early return if partyDetails not loaded yet - avoids console warnings
    if (!partyDetails) return 0;

    let total = 0;

    // Calculate each supplier's cost using ALWAYS FRESH pricing
    Object.entries(suppliers).forEach(([type, supplier]) => {
      if (!supplier) return;
  
      // ✅ FIXED: Get addons for this supplier - special handling for venue
      let supplierAddons = [];
      
      if (type === 'venue') {
        // For venue, get addons from selectedAddons property
        supplierAddons = supplier.selectedAddons || [];

      } else {
        // For other suppliers, get from global addons array
        supplierAddons = addons.filter(addon => 
          addon.supplierId === supplier.id || 
          addon.supplierType === type ||
          addon.attachedToSupplier === type
        );
      }
  

      const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
      const supplierCost = pricing.finalPrice;
  
      total += supplierCost;
      

    });
  
    // Add standalone addons (not attached to any supplier)
    const standaloneAddons = addons.filter(addon => 
      !addon.supplierId && !addon.supplierType && !addon.attachedToSupplier
    );
    const standaloneAddonsTotal = standaloneAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    total += standaloneAddonsTotal;
  

    return total;
  }, [suppliers, addons, partyDetails]);

  // Budget control props
  const budgetControlProps = {
    totalSpent: enhancedTotalCost, // Use PricingBrain total
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    isUpdating,
    showAdvancedControls,
    setShowAdvancedControls,
  }
  const handleMobileSupplierTabChange = (supplierType) => {
    setActiveMobileSupplierType(supplierType)

    // Only unlock scroll if prevent-auto-scroll is NOT active
    if (!document.body.classList.contains('prevent-auto-scroll')) {
      setTimeout(() => {
        document.body.style.overflow = 'unset'
        document.documentElement.style.overflow = 'unset'
        document.body.classList.remove('modal-open', 'overflow-hidden')
      }, 50)
    }
  }

  const handlePartyRebuilt = (rebuildResults) => {

    
    if (rebuildResults.type === 'needs_replacements') {
      // User wants to find replacements for unavailable suppliers
      const unavailableSuppliers = rebuildResults.unavailableSuppliers
      
      // Open supplier selection modal for the first unavailable supplier
      if (unavailableSuppliers.length > 0) {
        const firstUnavailable = unavailableSuppliers[0]
        
        toast.info(`Finding replacement for ${getSupplierDisplayName(firstUnavailable.type)}: ${firstUnavailable.supplier.name}`, {
          duration: 3000
        })
        
        // Open your existing supplier modal for this category
        openSupplierModal(firstUnavailable.type, currentDetails.theme)
        
        // Store context so you know this is a replacement flow
        sessionStorage.setItem('replacement_context', JSON.stringify({
          originalSupplier: firstUnavailable.supplier,
          supplierType: firstUnavailable.type,
          reason: firstUnavailable.reason,
          remainingReplacements: unavailableSuppliers.slice(1), // Other suppliers that need replacement
          isReplacementFlow: true
        }))
      }
      
    } else if (rebuildResults.type === 'replacements') {
      // Direct replacement applied (if you implement auto-replacement later)

      
      // Update localStorage with new party plan
      if (rebuildResults.partyPlan) {
        localStorage.setItem('user_party_plan', JSON.stringify(rebuildResults.partyPlan))
      }
      
      // Show success message
      toast.success(`Party updated with ${rebuildResults.totalReplaceable} replacement supplier${rebuildResults.totalReplaceable !== 1 ? 's' : ''}`)
    }
  }

  const getRecommendedSupplierForType = (categoryType) => {
  
    return recommendedSuppliers[categoryType] || null
  }

  // Helper function to auto-select cake package and defaults based on guest count
  const getAutoCakeDefaults = (supplier, guestCount) => {
    const packages = supplier?.packages || supplier?.data?.packages || []
    if (packages.length === 0) return null

    // Find the best package that feeds at least the guest count
    // Sort by serves/feeds to find the smallest one that fits
    const sortedPackages = [...packages].sort((a, b) => {
      const aServes = a.serves || a.feeds || 10
      const bServes = b.serves || b.feeds || 10
      return aServes - bServes
    })

    // Find first package that can feed the guest count (or largest if none fit)
    let selectedPackage = sortedPackages.find(pkg => {
      const serves = pkg.serves || pkg.feeds || 10
      return serves >= guestCount
    }) || sortedPackages[sortedPackages.length - 1] // Fallback to largest

    // Get first available flavor
    const flavours = supplier?.serviceDetails?.flavours || supplier?.flavours || []
    const defaultFlavor = flavours.length > 0
      ? flavours[0].toLowerCase().replace(/\s+/g, '-')
      : 'vanilla'
    const defaultFlavorName = flavours.length > 0 ? flavours[0] : 'Vanilla Sponge'

    // Get delivery fee
    const fulfilment = supplier?.serviceDetails?.fulfilment || {}
    const deliveryFee = selectedPackage?.deliveryFee ?? fulfilment?.deliveryFee ?? 0

    // Build package data with defaults
    return {
      ...selectedPackage,
      id: selectedPackage.id || 'auto-selected',
      price: selectedPackage.price,
      totalPrice: selectedPackage.price + deliveryFee,
      enhancedPrice: selectedPackage.price + deliveryFee,
      cakeCustomization: {
        size: selectedPackage.name,
        servings: selectedPackage.serves || selectedPackage.feeds || null,
        tiers: selectedPackage.tiers || 1,
        flavor: defaultFlavor,
        flavorName: defaultFlavorName,
        dietaryOptions: [],
        dietaryNames: [],
        dietaryName: 'Standard',
        customMessage: '',
        fulfillmentMethod: 'delivery',
        deliveryFee: deliveryFee,
        basePrice: selectedPackage.price,
        totalPrice: selectedPackage.price + deliveryFee,
      }
    }
  }

  // Handle adding a recommended supplier from the missing extras section

  const handleAddRecommendedSupplier = async (categoryType, supplier, shouldNavigate = true) => {
    try {
      setLoadingCards(prev => [...prev, categoryType])

      // Auto-select cake defaults if it's a cake supplier without packageData
      let packageData = supplier.packageData || null
      const isCakeSupplier = categoryType === 'cakes' ||
        supplier?.category?.toLowerCase().includes('cake')

      if (isCakeSupplier && !packageData) {
        const guestCount = partyDetails?.guestCount || 15
        packageData = getAutoCakeDefaults(supplier, guestCount)
        console.log('🎂 Auto-selected cake defaults:', { guestCount, packageData })
      }

      const result = await addSupplier(supplier, packageData)

      if (result.success) {
        // Only update URL and trigger navigation if shouldNavigate is true
        if (shouldNavigate) {
          const addTimestamp = Date.now()

          // Update URL with timestamp
          const currentUrl = new URL(window.location.href)
          currentUrl.searchParams.set('scrollTo', categoryType)
          currentUrl.searchParams.set('action', 'supplier-added')
          currentUrl.searchParams.set('ts', addTimestamp.toString())
          window.history.replaceState({}, '', currentUrl)

          // Clean up URL after animation
          setTimeout(() => {
            const cleanUrl = new URL(window.location.href)
            if (cleanUrl.searchParams.get('ts') === addTimestamp.toString()) {
              cleanUrl.searchParams.delete('scrollTo')
              cleanUrl.searchParams.delete('action')
              cleanUrl.searchParams.delete('ts')
              window.history.replaceState({}, '', cleanUrl)
            }
          }, 2500)
        }
      }
    } catch (error) {
      console.error('Error adding supplier:', error)
    } finally {
      setLoadingCards(prev => prev.filter(c => c !== categoryType))
    }
  }



 const handleSelectVenue = async (venue, skipConflictCheck = false) => {
  setIsSelectingVenue(true)

  try {
    // Check for bouncy castle conflict (unless we're skipping the check)
    if (!skipConflictCheck) {
      const hasBouncyCastle = suppliers.bouncyCastle || suppliers.activities || suppliers.softPlay

      if (hasBouncyCastle) {
        // Check if venue restricts bouncy castles
        const restrictedItems = venue?.serviceDetails?.restrictedItems ||
                               venue?.data?.serviceDetails?.restrictedItems ||
                               venue?.restrictedItems ||
                               venue?.data?.restrictedItems ||
                               []

        const venueRestrictsBouncyCastles = Array.isArray(restrictedItems) && restrictedItems.some(item =>
          typeof item === 'string' && (
            item.toLowerCase().includes('bouncy castle') ||
            item.toLowerCase().includes('bouncy castles') ||
            item.toLowerCase().includes('inflatables')
          )
        )

        if (venueRestrictsBouncyCastles) {
          // Show conflict modal
          setVenueConflictData({
            venue,
            conflictingSupplier: suppliers.bouncyCastle || suppliers.activities || suppliers.softPlay,
            conflictType: 'bouncyCastle'
          })
          setShowVenueConflictModal(true)
          setIsSelectingVenue(false)
          return // Don't proceed until user makes a choice
        }
      }
    }

    // Use the addSupplier function from usePartyPlan hook
    const result = await addSupplier(venue, venue.packageData || null)

    if (result.success) {
      // Update party details to clear hasOwnVenue flag
      const updatedPartyDetails = {
        ...partyDetails,
        hasOwnVenue: false
      }

      localStorage.setItem('party_details', JSON.stringify(updatedPartyDetails))

      // Trigger party details update
      handlePartyDetailsUpdate(updatedPartyDetails)

      // Close venue browser modal if open
      setShowVenueBrowserModal(false)
    }

  } catch (error) {
    console.error('❌ Error selecting venue:', error)
    alert('Failed to select venue. Please try again.')
  } finally {
    setIsSelectingVenue(false)
  }
}


// In LocalStorageDashboard.jsx - add this handler
const handleCustomizeSupplier = (type, supplier) => {


  // Example: Navigate to supplier page with customize mode
  router.push(`/supplier/${supplier.id}?mode=customize&from=dashboard`)

  // OR: Open a customization modal
  // setShowCustomizeModal(true)
  // setCustomizeSupplierData({ type, supplier })
}

// Handle customization completion from the modal
const handleCustomizationComplete = async (customizationData) => {
  const { supplier, package: selectedPackage, addons: selectedAddons = [], totalPrice } = customizationData

  try {
    // Update the supplier's package if a new package was selected
    if (selectedPackage && supplier.id) {
      // ✅ CRITICAL FIX: Find the supplier by matching category OR by checking all possible IDs
      const supplierCategory = supplier.category?.toLowerCase().replace(/\s+/g, '')

      // Try to find by category first (most reliable)
      let supplierType = null
      if (supplierCategory) {
        // Map common category names to slot names
        const categoryToSlot = {
          'decorations': 'decorations',
          'cakes': 'cakes',
          'cake': 'cakes',
          'entertainment': 'entertainment',
          'venue': 'venue',
          'facepainting': 'facePainting',
          'activities': 'activities',
          'partybags': 'partyBags',
          'balloons': 'balloons',
          'catering': 'catering',
          'sweettreats': 'sweetTreats'
        }
        supplierType = categoryToSlot[supplierCategory]
      }

      // Fallback: search by ID matching (including originalSupplier)
      if (!supplierType) {
        supplierType = Object.keys(partyPlan).find(key => {
          const planSupplier = partyPlan[key]
          if (!planSupplier || typeof planSupplier !== 'object') return false

          // Check direct ID match
          if (planSupplier.id === supplier.id || planSupplier.id === supplier.legacyId) return true

          // Check originalSupplier IDs
          if (planSupplier.originalSupplier) {
            if (planSupplier.originalSupplier.id === supplier.id ||
                planSupplier.originalSupplier.id === supplier.legacyId ||
                planSupplier.originalSupplier.legacyId === supplier.id ||
                planSupplier.originalSupplier.legacyId === supplier.legacyId) {
              return true
            }
          }

          return false
        })
      }

      const actualSupplierInPlan = supplierType ? partyPlan[supplierType] : null
      const supplierIdToUse = actualSupplierInPlan?.id || supplier.id

      // Determine the correct price to use
      let priceToUse

      // ✅ CRITICAL FIX: For party bags, use the per-bag price directly
      const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
      if (isPartyBags) {
        // Party bags packages already have per-bag pricing
        priceToUse = selectedPackage.pricePerBag || selectedPackage.price
      } else {
        // For other suppliers, use enhanced/total/base price
        priceToUse = selectedPackage.enhancedPrice || selectedPackage.totalPrice || selectedPackage.price
      }

      // Prepare package data with all customization info
      const packageUpdate = {
        ...selectedPackage,
        price: priceToUse,
        duration: selectedPackage.duration,
        id: selectedPackage.id,
        // Include cake customization if present
        cakeCustomization: selectedPackage.cakeCustomization,
        // Include party bags quantity if present
        partyBagsQuantity: selectedPackage.partyBagsQuantity,
        pricePerBag: selectedPackage.pricePerBag,
        // ✅ CRITICAL: Include partyBagsMetadata with totalPrice for pricing calculations
        partyBagsMetadata: selectedPackage.partyBagsMetadata,
        // ✅ Include totalPrice for party bags
        totalPrice: selectedPackage.partyBagsMetadata?.totalPrice || totalPrice,
        // Include any other special customizations
        features: selectedPackage.features,
        description: selectedPackage.description,
        // ✅ Preserve image for balloons/face painting theme-based display
        image: selectedPackage.image,
      }



      const updateResult = await updateSupplierPackage(supplierIdToUse, packageUpdate)

      if (!updateResult.success) {
        console.error('Failed to update supplier package:', updateResult.error)
        toast.error('Failed to update package')
        return
      }

    }

    // Add any new addons that were selected
    if (selectedAddons && selectedAddons.length > 0) {
      for (const addon of selectedAddons) {
        // Check if addon already exists
        if (!hasAddon(addon.id)) {
          await handleAddAddon(addon, supplier.id)
        }
      }
      console.log('✅ Addons added successfully')
    }

    await new Promise(resolve => setTimeout(resolve, 200))



    // DEBUG: Check what's actually in localStorage after update
    const storedPlan = JSON.parse(localStorage.getItem('user_party_plan'))
 

    refetch()

    // Also trigger a manual window storage event to ensure cross-component updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user_party_plan',
      newValue: localStorage.getItem('user_party_plan')
    }))

    toast.success(`${supplier.name} customization saved!`, {
      description: 'Your changes have been applied',
      duration: 3000
    })

  } catch (error) {
    console.error('❌ Error saving customization:', error)
    toast.error('Failed to save customization')
  }
}

// Add this handler function with your other event handlers:
const handleChildPhotoUpload = async (file) => {
  if (!file) return;

  console.log('📷 Uploading child photo...');
  setUploadingChildPhoto(true);

  try {
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'portfolio_images');
    
    const response = await fetch('https://api.cloudinary.com/v1_1/dghzq6xtd/image/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const cloudinaryData = await response.json();
    const photoUrl = cloudinaryData.secure_url;
    console.log('✅ Child photo uploaded:', photoUrl);
    
    // Save to localStorage using handlePartyDetailsUpdate
    await handlePartyDetailsUpdate({
      childPhoto: photoUrl
    });
    
    console.log('✅ Photo saved to localStorage');
    
  } catch (error) {
    console.error('❌ Child photo upload failed:', error);
    alert(`Failed to upload photo: ${error.message}`);
  } finally {
    setUploadingChildPhoto(false);
    if (childPhotoRef.current) {
      childPhotoRef.current.value = '';
    }
  }
};

  // ✅ UPDATED: Don't show loading screen - just hide dashboard content while checking
  // The welcome popup will overlay immediately when needed
  return (
    <div className="min-h-screen">
      {/* ✅ Hide dashboard content while checking for welcome popup to prevent flashing */}
      <div className={showWelcomePopup || isCheckingWelcome ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-200"}>
          <ContextualBreadcrumb currentPage="dashboard"/>
          <EnquirySuccessBanner />

      {/* Google One Tap Sign In - Only show after welcome form is submitted */}
      <GoogleOneTap shouldInitialize={welcomeFormSubmitted} />

      <AddonProvider
        addAddon={handleAddAddon}
        removeAddon={handleRemoveAddon}
        hasAddon={hasAddon}
        addons={addons}
      >
        {/* Full Width Header */}
        <div data-tour="party-header" className="mb-8">
          <LocalStoragePartyHeader
            theme={partyTheme}
            partyDetails={partyDetails}
            onPartyDetailsChange={handlePartyDetailsUpdate}
            forceExpanded={isPartyHeaderExpanded}
            onExpandChange={setIsPartyHeaderExpanded}
            suppliers={suppliers}
            onPartyRebuilt={handlePartyRebuilt}
            childPhoto={partyDetails?.childPhoto}
            onPhotoUpload={handleChildPhotoUpload}
            uploadingPhoto={uploadingChildPhoto}
            totalCost={enhancedTotalCost}
          />
        </div>

        {/* Container for rest of content */}
        <div className="container min-w-screen px-4 sm:px-6 lg:px-8 pb-8 lg:pb-20">
          <div>
            {/* Main Content */}
            <main className="space-y-8">
              <div className="hidden md:flex justify-between mb-4 items-start" data-tour="supplier-section">
                <div className="flex justify-center">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png"
                    alt="Snappy the Alligator"
                    width={80}
                    height={80}
                    className="mt-1"
                  />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-700 leading-tight">
                      Here's Your Party Plan
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                      We've matched you with top suppliers for your date & location. Customize it however you like.
                    </p>
                  </div>
                 
                </div>
{/*      
                <Button onClick={handleAddSupplier} variant="outline" className="flex gap-2 text-primary border-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </Button> */}
              </div>

{/* Supplier Grid */}
<div className="w-full">
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-4 gap-6">
                  {(!recommendationsLoaded) ? (
                    // Show skeleton cards while recommendations load
                    <>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <Card key={i} className="overflow-hidden rounded-2xl border-2 border-white shadow-xl h-80">
                          <div className="relative h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                          <div className="p-6 bg-white">
                            <div className="h-12 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* ✅ NEW: Category-based layout with headers */}
                      {(() => {
                        // Define fixed order for all supplier types
                        const supplierOrder = [
                          'venue',
                          'entertainment',
                          'cakes',
                          'catering',
                          'facePainting',
                          'activities',
                          'partyBags',
                          'decorations',
                          'balloons',
                          'photography',
                          'bouncyCastle',
                          'sweetTreats'
                        ];

                        // Helper function to render venue card
                        const renderVenueCard = (isSelected) => {
                          const hasSelectedVenue = !!suppliers.venue;
                          const hasCarouselOptions = venueCarouselOptions && Array.isArray(venueCarouselOptions) && venueCarouselOptions.length > 0;
                          const userHasOwnVenue = partyDetails?.hasOwnVenue === true;

                          // Early return if we're looking for selected but venue is empty (or vice versa)
                          if (isSelected && !hasSelectedVenue) return null;
                          if (!isSelected && hasSelectedVenue) return null;

                          // ✅ PRIORITY CHECK: If user has own venue AND hasn't selected one yet, show empty card
                          if (userHasOwnVenue && !hasSelectedVenue) {
                            console.log('✅ User has own venue - showing EmptySupplierCard');
                            return (
                              <SupplierCard
                                key="venue"
                                type="venue"
                                supplier={null}
                                loadingCards={loadingCards}
                                suppliersToDelete={suppliersToDelete}
                                openSupplierModal={(category) => {
                                  console.log('🎯 User clicked to browse venues - clearing hasOwnVenue flag');
                                  const updatedPartyDetails = {
                                    ...partyDetails,
                                    hasOwnVenue: false
                                  };
                                  localStorage.setItem('party_details', JSON.stringify(updatedPartyDetails));
                                  handlePartyDetailsUpdate(updatedPartyDetails);
                                }}
                                handleDeleteSupplier={handleDeleteSupplier}
                                getSupplierDisplayName={getSupplierDisplayName}
                                addons={[]}
                                handleRemoveAddon={handleRemoveAddon}
                                enquiryStatus={null}
                                enquirySentAt={null}
                                isSignedIn={false}
                                isPaymentConfirmed={false}
                                enquiries={[]}
                                partyDetails={partyDetails}
                                currentPhase="planning"
                                recommendedSupplier={getRecommendedSupplierForType('venue')}
                                onAddSupplier={handleAddRecommendedSupplier}
                                enhancedPricing={null}
                                onCustomizationComplete={handleCustomizationComplete}
                              />
                            );
                          }

                          // ✅ KEY FIX: If NO selected venue, show empty card
                          if (!hasSelectedVenue) {
                            console.log('✅ No selected venue - showing EmptySupplierCard with generic image');
                            return (
                              <SupplierCard
                                key="venue"
                                type="venue"
                                supplier={null}
                                loadingCards={loadingCards}
                                suppliersToDelete={suppliersToDelete}
                                openSupplierModal={openSupplierModal}
                                handleDeleteSupplier={handleDeleteSupplier}
                                getSupplierDisplayName={getSupplierDisplayName}
                                addons={[]}
                                handleRemoveAddon={handleRemoveAddon}
                                enquiryStatus={null}
                                enquirySentAt={null}
                                isSignedIn={false}
                                isPaymentConfirmed={false}
                                enquiries={[]}
                                partyDetails={partyDetails}
                                currentPhase="planning"
                                recommendedSupplier={getRecommendedSupplierForType('venue')}
                                onAddSupplier={handleAddRecommendedSupplier}
                                enhancedPricing={null}
                                onCustomizationComplete={handleCustomizationComplete}
                              />
                            );
                          }

                          // ✅ Selected venue - show regular SupplierCard with Browse Venues option
                          const venueAddons = addons.filter(addon =>
                            addon.supplierId === suppliers.venue?.id ||
                            addon.supplierType === 'venue' ||
                            addon.attachedToSupplier === 'venue'
                          );

                          return (
                            <SupplierCard
                              key="venue"
                              type="venue"
                              supplier={suppliers.venue}
                              loadingCards={loadingCards}
                              suppliersToDelete={suppliersToDelete}
                              openSupplierModal={openSupplierModal}
                              handleDeleteSupplier={handleDeleteSupplier}
                              getSupplierDisplayName={getSupplierDisplayName}
                              addons={venueAddons}
                              handleRemoveAddon={handleRemoveAddon}
                              enquiryStatus={getEnquiryStatus('venue')}
                              enquirySentAt={getEnquiryTimestamp('venue')}
                              isSignedIn={false}
                              isPaymentConfirmed={false}
                              enquiries={[]}
                              partyDetails={partyDetails}
                              currentPhase="planning"
                              recommendedSupplier={getRecommendedSupplierForType('venue')}
                              onAddSupplier={handleAddRecommendedSupplier}
                              enhancedPricing={getSupplierDisplayPricing(suppliers.venue, partyDetails, venueAddons)}
                              onCustomizationComplete={handleCustomizationComplete}
                              // ✅ Add venue browser props
                              showBrowseVenues={hasCarouselOptions}
                              onBrowseVenues={() => setShowVenueBrowserModal(true)}
                            />
                          );
                        };

                        // Split suppliers into selected and available
                        const selectedTypes = supplierOrder.filter(type => {
                          const supplier = suppliers[type];
                          const isDeleting = suppliersToDelete.includes(type) || recentlyDeleted.includes(type);
                          return supplier && !isDeleting;
                        });

                        const availableTypes = supplierOrder.filter(type => {
                          const supplier = suppliers[type];
                          const recommendedSupplier = getRecommendedSupplierForType(type);
                          const isLoading = loadingCards[type];
                          const isDeleting = suppliersToDelete.includes(type) || recentlyDeleted.includes(type);
                          const alwaysShowCategories = ['photography', 'bouncyCastle', 'catering', 'sweetTreats', 'decorations'];
                          const shouldAlwaysShow = alwaysShowCategories.includes(type);

                          // Show if: no supplier AND (has recommendation OR is loading OR is deleting OR should always show)
                          const hasNoSupplier = !supplier || isDeleting;
                          const shouldShow = recommendedSupplier || isLoading || isDeleting || shouldAlwaysShow;
                          return hasNoSupplier && shouldShow;
                        });

                        // Helper to render a supplier card
                        const renderSupplierCard = (type) => {
                          const supplier = suppliers[type];
                          const recommendedSupplier = getRecommendedSupplierForType(type);
                          const isDeleting = suppliersToDelete.includes(type) || recentlyDeleted.includes(type);

                          const supplierAddons = addons.filter(addon =>
                            addon.supplierId === supplier?.id ||
                            addon.supplierType === type ||
                            addon.attachedToSupplier === type
                          );

                          const categoryName = getCategoryName(type);
                          const categoryTagline = getCategoryTagline(type);
                          const categoryIcon = getCategoryIcon(type);

                          return (
                            <div key={type} className="flex flex-col">
                              {/* Category Header */}
                              <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                  {categoryIcon && (
                                    <img
                                      src={categoryIcon}
                                      alt={categoryName}
                                      className="w-10 h-10 object-contain flex-shrink-0"
                                    />
                                  )}
                                  <h3 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                                    {categoryName}
                                    <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                                  </h3>
                                </div>
                                {categoryTagline && (
                                  <p className="text-sm text-gray-600">{categoryTagline}</p>
                                )}
                              </div>

                              {/* Supplier Card */}
                              <SupplierCard
                                type={type}
                                supplier={isDeleting ? null : (supplier || null)}
                                loadingCards={loadingCards}
                                suppliersToDelete={suppliersToDelete}
                                openSupplierModal={openSupplierModal}
                                handleDeleteSupplier={handleDeleteSupplier}
                                getSupplierDisplayName={getSupplierDisplayName}
                                addons={supplierAddons}
                                handleRemoveAddon={handleRemoveAddon}
                                enquiryStatus={getEnquiryStatus(type)}
                                enquirySentAt={getEnquiryTimestamp(type)}
                                isSignedIn={false}
                                isPaymentConfirmed={false}
                                enquiries={[]}
                                partyDetails={partyDetails}
                                currentPhase="planning"
                                recommendedSupplier={recommendedSupplier}
                                onAddSupplier={handleAddRecommendedSupplier}
                                enhancedPricing={isDeleting ? null : (supplier ? getSupplierDisplayPricing(supplier, partyDetails, supplierAddons) : null)}
                                onCustomizationComplete={handleCustomizationComplete}
                                selectedVenue={suppliers.venue}
                                onBrowseVenues={() => setShowVenueBrowserModal(true)}
                              />

                            </div>
                          );
                        };

                        return (
                          <>
                            {/* Selected suppliers */}
                            {selectedTypes.map(type => renderSupplierCard(type))}

                            {/* Divider between selected and available */}
                            {selectedTypes.length > 0 && availableTypes.length > 0 && (
                              <div className="col-span-full flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
                                  <span className="text-sm font-medium text-primary-600">Anything Else to Add?</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                              </div>
                            )}

                            {/* Available suppliers */}
                            {availableTypes.map(type => renderSupplierCard(type))}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <MobileSupplierNavigation
                    suppliers={suppliers}
                    loadingCards={loadingCards}
                    partyDetails={partyDetails}
                    getSupplierDisplayPricing={getSupplierDisplayPricing}
                    suppliersToDelete={suppliersToDelete}
                    openSupplierModal={openSupplierModal}
                    handleDeleteSupplier={handleDeleteSupplier}
                    getSupplierDisplayName={getSupplierDisplayName}
                    addons={addons}
                    handleRemoveAddon={handleRemoveAddon}
                    getEnquiryStatus={getEnquiryStatus}
                    getEnquiryTimestamp={getEnquiryTimestamp}
                    isPaymentConfirmed={false}
                    enquiries={[]}
                    showPartyTasks={false}
                    currentPhase="planning"
                    partyTasksStatus={{}}
                    totalCost={totalCost}
                    activeSupplierType={activeMobileSupplierType}
                    onSupplierTabChange={handleMobileSupplierTabChange}
                    isTourActiveOnNavigation={isTourActiveOnNavigation}
                    getRecommendedSupplierForType={getRecommendedSupplierForType}
                    onAddSupplier={handleAddRecommendedSupplier}
                    venueCarouselOptions={venueCarouselOptions}
                    onSelectVenue={handleSelectVenue}
                    isSelectingVenue={isSelectingVenue}
                    type="venue"
                    onCustomizationComplete={handleCustomizationComplete}
                    showBrowseVenues={venueCarouselOptions && venueCarouselOptions.length > 0}
                    onBrowseVenues={() => setShowVenueBrowserModal(true)}
                    onEditPartyDetails={handleEditPartyDetails}
                    childPhoto={partyDetails?.childPhoto}
                    onPhotoUpload={handleChildPhotoUpload}
                    uploadingPhoto={uploadingChildPhoto}
                  />
                </div>
              </div>

              <div className="md:hidden block">
                <ReferFriend />
              </div>

              {/* Desktop Party Summary removed - now handled by SmartStickyBottomBar */}
            </main>
          </div>
        </div>
      </AddonProvider>

      {/* Sticky Bottom CTA - Desktop Only */}
      <SmartStickyBottomBar
        suppliers={suppliers}
        totalCost={totalCost}
        onContinue={() => setShowDesktopCompleteCTA(true)}
        isVisible={showStickyBottomCTA}
      />

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 animate-pulse">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Updating suppliers for £{tempBudget} budget...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <SupplierSelectionModal
        isOpen={showSupplierModal}
        onClose={closeSupplierModal}
        category={modalConfig.category}
        theme={modalConfig.theme}
        date={modalConfig.date}
        initialFilters={modalConfig.filters}
        onSelectSupplier={handleSupplierSelection}
        partyLocation={partyDetails?.location}
        currentPhase="planning"
        isAwaitingResponses={false}
        partyData={partyPlan}
        enquiries={[]}
        hasEnquiriesPending={false}
        isSignedIn={false}
        currentPartyId={null}
      />
      </div>

      {/* ✅ PRODUCTION SAFE: Welcome Popup */}
      {isMounted && showWelcomePopup && (
        <WelcomeDashboardPopup
          isOpen={showWelcomePopup}
          onClose={() => {
            console.log('🔒 Closing welcome popup')
            setShowWelcomePopup(false)
          }}
          onNameSubmit={handleNameSubmit}
        />
      )}


      <DeleteConfirmDialog
        isOpen={!!showDeleteConfirm}
        supplierType={showDeleteConfirm}
        onConfirm={confirmDeleteSupplier}
        onCancel={cancelDeleteSupplier}
      />

      <AddonDetailsModal
        isOpen={isAddonModalOpen}
        onClose={handleAddonModalClose}
        addon={selectedAddon}
        onAddToParty={handleAddAddonFromModal}
        isAlreadyAdded={selectedAddon ? hasAddon(selectedAddon.id) : false}
      />

      {/* Venue Browser Modal */}
      <VenueBrowserModal
        venues={venueCarouselOptions || []}
        selectedVenue={suppliers.venue}
        isOpen={showVenueBrowserModal}
        onClose={() => setShowVenueBrowserModal(false)}
        onSelectVenue={handleSelectVenue}
        partyDetails={partyDetails}
      />

      {/* Venue Conflict Modal - Bouncy Castle Restriction */}
      <UniversalModal
        isOpen={showVenueConflictModal}
        onClose={() => {
          setShowVenueConflictModal(false)
          setVenueConflictData(null)
        }}
        size="md"
        theme="fun"
      >
        <ModalHeader
          title="Venue Restriction"
          subtitle="This venue has some restrictions"
          theme="fun"
          icon={<AlertTriangle className="w-6 h-6" />}
        />

        <ModalContent className="space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {venueConflictData?.venue?.name || 'This venue'} doesn't allow bouncy castles
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You currently have <strong>{venueConflictData?.conflictingSupplier?.name || 'a bouncy castle'}</strong> in your party plan.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">What would you like to do?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Find Another Venue:</strong> Browse venues that allow bouncy castles</p>
              <p>• <strong>Remove Bouncy Castle:</strong> Keep this venue and remove the bouncy castle</p>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => {
                setShowVenueConflictModal(false)
                setVenueConflictData(null)
                // Keep venue browser open so user can choose another
              }}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Find Another Venue
            </Button>
            <Button
              onClick={async () => {
                // Remove bouncy castle and add venue
                if (venueConflictData?.conflictType === 'bouncyCastle') {
                  removeSupplier('bouncyCastle')
                  removeSupplier('activities')
                  removeSupplier('softPlay')
                }
                // Now add the venue
                await handleSelectVenue(venueConflictData?.venue, true)
                setShowVenueConflictModal(false)
                setVenueConflictData(null)
              }}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
            >
              Remove Bouncy Castle
            </Button>
          </div>
        </ModalFooter>
      </UniversalModal>

      {/* Party Plan Review Modal - Desktop Only */}
      {showDesktopCompleteCTA && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowDesktopCompleteCTA(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary-500 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Your Party Plan</h2>
                <button
                  onClick={() => setShowDesktopCompleteCTA(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-white/90">
                Review all the details before completing your booking
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
              {/* Party Info - Simple List */}
              <div className="space-y-2 text-sm text-gray-700 mb-6">
                {partyDetails?.childName && (
                  <p>
                    <span className="font-semibold">Party for:</span> {partyDetails.childName}{partyDetails.age && `, turning ${partyDetails.age}`}
                  </p>
                )}

                {partyDetails?.date && (
                  <p>
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(partyDetails.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    {partyDetails.time && ` at ${partyDetails.time}`}
                  </p>
                )}

                {partyDetails?.guestCount && (
                  <p>
                    <span className="font-semibold">Guests:</span> {partyDetails.guestCount} children
                  </p>
                )}

                {suppliers?.venue && (
                  <p>
                    <span className="font-semibold">Venue:</span> {suppliers.venue.name}
                  </p>
                )}

                {partyDetails?.theme && (
                  <p>
                    <span className="font-semibold">Theme:</span> <span className="capitalize">{partyDetails.theme.replace(/-/g, ' ')}</span>
                  </p>
                )}
              </div>

              {/* Suppliers List */}
              {Object.keys(suppliers).filter(type => suppliers[type]).length > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Your Suppliers</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {Object.entries(suppliers).filter(([type, supplier]) => supplier).map(([type, supplier]) => {
                      // Calculate correct price for party bags
                      const isPartyBags = supplier.category === 'Party Bags' ||
                                         supplier.category?.toLowerCase().includes('party bag')

                      // Check if this is a cake supplier
                      const isCake = supplier.category?.toLowerCase().includes('cake') ||
                                    supplier.serviceType?.toLowerCase().includes('cake')

                      let displayPrice = supplier.packageData?.price || supplier.price || 0

                      if (isPartyBags) {
                        displayPrice = supplier.partyBagsMetadata?.totalPrice ||
                                      supplier.packageData?.totalPrice ||
                                      (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                                        ? supplier.packageData.price * supplier.packageData.partyBagsQuantity
                                        : null)

                        if (!displayPrice) {
                          displayPrice = supplier.price || supplier.priceFrom || 0
                        }
                      } else if (isCake) {
                        // For cakes, use totalPrice which includes delivery fee
                        displayPrice = supplier.packageData?.totalPrice ||
                                      supplier.packageData?.enhancedPrice ||
                                      supplier.packageData?.price ||
                                      supplier.price || 0
                      }

                      return (
                        <div key={type} className="flex items-center justify-between py-2">
                          <span>{supplier.name}</span>
                          <span className="font-semibold text-gray-900">£{displayPrice}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Addons List */}
              {addons && addons.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Add-ons</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between py-2">
                        <span>{addon.name}</span>
                        <span className="font-semibold text-gray-900">£{addon.price || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Total and CTA */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {/* Total */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-primary-600">£{totalCost.toFixed(2)}</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  setIsNavigatingToReview(true)
                  router.push('/review-book')
                }}
                disabled={isNavigatingToReview}
                className="w-full cursor-pointer bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 active:shadow-md flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isNavigatingToReview ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    Complete Booking
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-600 text-center mt-3">
                You'll review your full party plan before any payment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Add Supplier Button */}
      {/* <div className="md:hidden fixed bottom-5 right-4 z-40" data-tour="mobile-add-supplier">
        <button 
          onClick={handleAddSupplier}
          className="bg-primary-400 hover:bg-[hsl(var(--primary-600))] w-10 h-10 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div> */}
      {/* <SimpleMobileBottomTabBar
  suppliers={suppliers}
  partyDetails={partyDetails}
  addons={addons}
  tempBudget={tempBudget}
  budgetPercentage={budgetPercentage}
  getBudgetCategory={getBudgetCategory}
  onSupplierTabChange={handleMobileSupplierTabChange}
  CountdownWidget={
    <CountdownWidget
      partyDate={partyDetails?.date}
    />

  }
/> */}
      {/* <SnappyDashboardTour
        isOpen={isTourActive}
        onMobileNavigationStepActive={handleMobileNavigationStepActive} 
        onClose={closeTour}
        onComplete={completeTour}
        suppliers={suppliers} // Add this
        partyDetails={partyDetails} // Add this  
        totalCost={totalCost} // Add this
      /> */}
    </div>
  )
}