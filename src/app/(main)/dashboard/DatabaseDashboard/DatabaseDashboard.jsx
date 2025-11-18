// DatabaseDashboard.jsx - UPDATED with unified pricing system
"use client"

import { useState, useEffect, useRef, useMemo } from "react"

// Import Google Font for handwritten style
if (typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap'
  link.rel = 'stylesheet'
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link)
  }
}
import { supabase } from "@/lib/supabase"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Users, Mail, Gift, Trash2 } from "lucide-react"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Import unified pricing system
import { calculateFinalPrice, calculatePartyTotal } from '@/utils/unifiedPricing'

// Hooks
import { usePartyData } from '../hooks/usePartyData'
import { useReplacementManager } from '../hooks/useReplacementManager'
import { usePartyPhase } from '../hooks/usePartyPhase'
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from "../hooks/usePartyDetails"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import { useBudgetManager } from "../hooks/useBudgetManager"
import { useSupplierManager } from "../hooks/useSupplierManager"
import NextStepsWelcomeCard from "./components/NextStepsWelcomeCard"
import SupplierAddedBanner from "./components/SupplierAddedBanner"
import useDisableScroll from "@/hooks/useDisableScroll"
import { useChatNotifications } from '../hooks/useChatNotifications'
import { useToast } from '@/components/ui/toast'

// Layout Components
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import EnquirySuccessBanner from "@/components/enquirySuccessBanner"
import DatabasePartyHeader from "../components/ui/DatabaseDashboardPartyHeader"
import CountdownWidget from "../components/ui/CountdownWidget"

import DashboardSkeleton from "./components/DashboardSkeleton"

// Feature Components
import ReplacementManager from './components/ReplacementManager'
import SupplierGrid from '../components/SupplierGrid'
import PartyPhaseContent from '../components/PartyPhaseContent'
import Sidebar from './components/Sidebar'
import SnappysPresentParty from "./components/SnappysPresentParty"
import SupplierAddedConfirmationModal from "./components/SupplierAddedConfirmationModal"
import SnappyLoader from "@/components/ui/SnappyLoader"
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"
import { AddSuppliersSection } from "./components/PartyJourney/AddSuppliersSection"
import SnappyTimelineAssistant from "./components/SnappyTimelineAssistant"
import MissingSuppliersSuggestions from "@/components/MissingSuppliersSuggestions"
import PartyChecklistModal from "./components/PartyChecklistModal"
import WeatherWidget from "./components/WeatherWidget"
import PartyTimeline from "./components/PartyTimeline"
import EmergencyContacts from "./components/EmergencyContacts"





// ADD: Unified pricing helper function (same as LocalStorageDashboard)
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

export default function DatabaseDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext, getStoredModalState, clearModalState } = useContextualNavigation()

  // ALL STATE HOOKS FIRST - NO EARLY RETURNS BEFORE THIS SECTION
  const [isUpdating, setIsUpdating] = useState(false)
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquiryFeedback, setEnquiryFeedback] = useState(null)
  const [hasSeenPartyReadyModal, setHasSeenPartyReadyModal] = useState(false)
  const [hasCreatedInvites, setHasCreatedInvites] = useState(false)
  const [showSupplierAddedModal, setShowSupplierAddedModal] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [addedSupplierData, setAddedSupplierData] = useState(null)
  const [notification, setNotification] = useState(null)
  const [activeMobileSupplierType, setActiveMobileSupplierType] = useState('venue')
  const [isClient, setIsClient] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    category: '',
    theme: '',
    date: null,
    filters: {}
  })
  const [isCancelling, setIsCancelling] = useState(false)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
const [recommendedSuppliers, setRecommendedSuppliers] = useState({})
const [recommendationsLoaded, setRecommendationsLoaded] = useState(false)

  // Toast notifications
  const { toast } = useToast()
const [loadingCards, setLoadingCards] = useState([])
const [activeBottomTabModal, setActiveBottomTabModal] = useState(null)
const [uploadingChildPhoto, setUploadingChildPhoto] = useState(false)
const childPhotoRef = useRef(null)
  const welcomePopupShownRef = useRef(false)

  // ✅ NEW: Guests & Gifts State
  const [partyToolsData, setPartyToolsData] = useState({
    guestList: [],
    rsvps: [],
    einvites: null,
    giftRegistry: null,
    registryItemCount: 0
  })
  const [partyToolsLoading, setPartyToolsLoading] = useState(false)
  const [partyToolsKey, setPartyToolsKey] = useState(0) // Force re-render key

  // ✅ NEW: Multiple parties state
  const [allParties, setAllParties] = useState([])
  const [selectedPartyId, setSelectedPartyId] = useState(null)
  const [loadingParties, setLoadingParties] = useState(true)

  // MAIN PARTY DATA HOOK - This now handles ALL loading
  const {
    partyData,
    partyId,
    totalCost,
    addons,
    loading, // This is the SINGLE consolidated loading state
    user,
    currentParty,
    suppliers,
    dataSource,
    isSignedIn,
    refreshPartyData,
    handleAddAddon,
    handleRemoveAddon,
    handlePartyDetailsUpdate,
    partyDetails,
    partyTheme,
    themeLoaded
  } = usePartyData()

  // PARTY PHASE HOOK - No longer has loading state
  const {
    partyPhase,
    currentPhase,
    visibleSuppliers,
    hasEnquiriesPending,
    enquiries,
    isPaymentConfirmed,
    paymentDetails,
  } = usePartyPhase(partyData, partyId)

  // Scroll to top when component mounts/navigates to this page
  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if user just signed in
    const justSignedIn = sessionStorage.getItem('justSignedIn')
    if (justSignedIn === 'true') {
      console.log('🔄 Fresh sign-in detected, forcing data reload')
      sessionStorage.removeItem('justSignedIn')
      // The useEffect with user?.id dependency will handle the reload
      // Force re-render by updating a key
      setPartyToolsKey(prev => prev + 1)
    }
  }, []);

  // ✅ NEW: IMMEDIATELY clear and set loading when party changes
  useEffect(() => {
    console.log('🔄 Party ID changed to:', partyId, '- clearing party tools data and starting fresh load')

    // Immediately clear data and set loading to true
    setPartyToolsLoading(true)
    setPartyToolsData({
      guestList: [],
      rsvps: [],
      einvites: null,
      giftRegistry: null,
      registryItemCount: 0
    })

    // Increment key to force re-render of dependent components
    setPartyToolsKey(prev => prev + 1)
  }, [partyId])

  // ✅ NEW: Load all user parties on mount
  useEffect(() => {
    const loadAllParties = async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID, skipping party load')
        setLoadingParties(false)
        return
      }

      console.log('🔄 Loading all user parties for user:', user.id, user.email)
      console.log('📍 Current partyId prop:', partyId)
      console.log('📍 localStorage selectedPartyId:', localStorage.getItem('selectedPartyId'))

      const result = await partyDatabaseBackend.getAllUserParties()

      if (result.success && result.parties) {
        console.log('✅ Loaded', result.parties.length, 'parties for user:', user.email)
        console.log('📋 Party IDs:', result.parties.map(p => ({ id: p.id, name: p.child_name })))
        setAllParties(result.parties)

        // Set initial selected party to the current one or the first one
        if (partyId) {
          console.log('✅ Using partyId from prop:', partyId)
          setSelectedPartyId(partyId)
          localStorage.setItem('selectedPartyId', partyId)
        } else if (result.parties.length > 0) {
          console.log('✅ Using first party:', result.parties[0].id, result.parties[0].child_name)
          setSelectedPartyId(result.parties[0].id)
          localStorage.setItem('selectedPartyId', result.parties[0].id)
        }
      } else {
        console.error('❌ Failed to load parties:', result.error)
      }

      setLoadingParties(false)
    }

    loadAllParties()
  }, [user?.id, partyId])

  // ✅ NEW: Load theme-based supplier recommendations for empty slots
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!partyDetails || !visibleSuppliers) {
        return
      }

      try {
        const { suppliersAPI } = await import('@/utils/mockBackend')
        const { scoreSupplierWithTheme } = await import('@/utils/partyBuilderBackend')
        const allSuppliers = await suppliersAPI.getAllSuppliers()

        const partyTheme = partyDetails?.theme || 'no-theme'
        console.log('🎨 Loading recommendations for theme:', partyTheme)

        const categoryMap = {
          venue: 'Venues',
          entertainment: 'Entertainment',
          cakes: 'Cakes',
          decorations: 'Decorations',
          facePainting: 'Face Painting',
          activities: 'Activities',
          partyBags: 'Party Bags',
          balloons: 'Balloons',
          catering: 'Catering'
        }

        const newRecommendations = {}

        Object.entries(categoryMap).forEach(([categoryKey, categoryName]) => {
          // Only load recommendations for empty slots
          if (!visibleSuppliers[categoryKey]) {
            const categorySuppliers = allSuppliers.filter(s => s.category === categoryName)

            if (categorySuppliers.length > 0) {
              // Sort by theme score
              const sortedByTheme = categorySuppliers
                .map(supplier => ({
                  supplier,
                  themeScore: scoreSupplierWithTheme(supplier, partyTheme)
                }))
                .sort((a, b) => b.themeScore - a.themeScore)

              const bestMatch = sortedByTheme[0].supplier
              newRecommendations[categoryKey] = bestMatch
              console.log(`✅ ${categoryKey}: ${bestMatch.name} (score: ${sortedByTheme[0].themeScore})`)
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
  }, [partyDetails, visibleSuppliers])

  // ✅ NEW: Fetch party tools data directly (AFTER partyId is declared)
  useEffect(() => {
    async function fetchPartyToolsData() {
      if (!partyId) {
        console.log('⚠️ No partyId - skipping party tools fetch')
        setPartyToolsLoading(false)
        return
      }

      console.log('🔄 Fetching party tools data for party:', partyId)

      try {
        // Fetch guest list
        console.log('📋 Fetching guest list...')
        const guestResult = await partyDatabaseBackend.getPartyGuests(partyId)
        console.log('📋 Guest result:', guestResult)
        const guests = guestResult.success ? guestResult.guests || [] : []
        console.log('📋 Extracted guests:', guests.length, 'guests')

        // Fetch RSVPs
        console.log('✅ Fetching RSVPs...')
        const rsvpResult = await partyDatabaseBackend.getPartyRSVPs(partyId)
        console.log('✅ RSVP result:', rsvpResult)
        const rsvps = rsvpResult.success ? rsvpResult.rsvps || [] : []
        console.log('✅ Extracted RSVPs:', rsvps.length, 'rsvps')

        // Fetch e-invites
        console.log('💌 Fetching e-invites...')
        const einvitesResult = await partyDatabaseBackend.getEInvites(partyId)
        console.log('💌 E-invites result:', einvitesResult)
        const einvites = einvitesResult.success ? einvitesResult.einvites : null
        console.log('💌 Extracted e-invites:', einvites ? 'Found' : 'None')

        // Fetch gift registry
        console.log('🎁 Fetching gift registry...')
        const registryResult = await partyDatabaseBackend.findGiftRegistryForParty(partyId)
        console.log('🎁 Registry result (RAW):', registryResult)

        // ✅ Handle different response formats
        let registry = null
        if (registryResult?.success) {
          // Format: { success: true, registry: {...} }
          registry = registryResult.registry
        } else if (registryResult?.id) {
          // Format: Direct registry object
          registry = registryResult
        } else if (registryResult?.data?.id) {
          // Format: { data: {...} }
          registry = registryResult.data
        }

        console.log('🎁 Extracted registry:', registry ? 'Found (ID: ' + registry.id + ')' : 'None')

        // If registry exists, fetch items
        let itemCount = 0
        if (registry?.id) {
          console.log('📦 Fetching registry items for registry:', registry.id)
          const { data: items, error } = await supabase
            .from('party_gift_registry_items')
            .select('*')
            .eq('registry_id', registry.id)

          if (error) {
            console.error('❌ Error fetching registry items:', error)
          } else {
            itemCount = items?.length || 0
            console.log('📦 Registry items found:', itemCount)
          }
        }

        console.log('🎯 Guests & Gifts Data Summary:', {
          guestCount: guests.length,
          rsvpCount: rsvps.length,
          hasRegistry: !!registry,
          registryItemCount: itemCount,
          hasEinvites: !!einvites
        })

        const newData = {
          guestList: guests,
          rsvps: rsvps,
          einvites: einvites,
          giftRegistry: registry,
          registryItemCount: itemCount
        }
        console.log('💾 Setting party tools data:', newData)

        setPartyToolsData(newData)
      } catch (error) {
        console.error('❌ Error fetching party tools data:', error)
      } finally {
        // ✅ ALWAYS set loading to false when done
        setPartyToolsLoading(false)
      }
    }

    fetchPartyToolsData()
  }, [partyId]) // ✅ Trigger on partyId change only

  // UNIFIED PRICING CALCULATION (same pattern as LocalStorageDashboard)
  const enhancedTotalCost = useMemo(() => {
    let total = 0;

    // Calculate each supplier's cost, checking for pre-calculated pricing
    Object.entries(visibleSuppliers).forEach(([type, supplier]) => {
      if (!supplier) return;

      // Get addons for this specific supplier
      const supplierAddons = addons.filter(addon =>
        addon.supplierId === supplier.id ||
        addon.supplierType === type ||
        addon.attachedToSupplier === type
      );

      // Check if this is party bags - handle specially
      const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
      let supplierCost = 0;

      if (isPartyBags) {
        // ✅ FIX: Use unified pricing for party bags
        const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
        supplierCost = pricing.finalPrice;

        console.log('📊 Total Cost - Party Bags (Unified Pricing):', {
          supplierName: supplier.name,
          finalPrice: pricing.finalPrice,
          basePrice: pricing.basePrice,
          breakdown: pricing.breakdown
        })
      } else if (supplier.enhancedPrice && supplier.originalPrice) {
        // Use pre-calculated enhanced price
        console.log('📊 Database Dashboard Total: Using pre-calculated enhanced pricing for', supplier.name, ':', supplier.enhancedPrice);
        supplierCost = supplier.enhancedPrice;
      } else if (supplier.packageData?.enhancedPrice && supplier.packageData?.originalPrice) {
        // Use package enhanced price
        console.log('📊 Database Dashboard Total: Using package enhanced pricing for', supplier.name, ':', supplier.packageData.enhancedPrice);
        supplierCost = supplier.packageData.enhancedPrice;
      } else if (supplier.packageData?.totalPrice && supplier.packageData?.price &&
                 supplier.packageData.totalPrice !== supplier.packageData.price) {
        // Use package total price
        console.log('📊 Database Dashboard Total: Using package totalPrice for', supplier.name, ':', supplier.packageData.totalPrice);
        supplierCost = supplier.packageData.totalPrice;
      } else {
        // Calculate fresh pricing only if no pre-calculated values exist
        console.log('📊 Database Dashboard Total: Calculating fresh pricing for', supplier.name);
        const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
        supplierCost = pricing.finalPrice;
      }

      total += supplierCost;

      // Add addon costs (addons typically don't have enhanced pricing)
      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
      total += addonsCost;
    });

    // Add standalone addons (not attached to any supplier)
    const standaloneAddons = addons.filter(addon =>
      !addon.supplierId && !addon.supplierType && !addon.attachedToSupplier
    );
    const standaloneAddonsTotal = standaloneAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    total += standaloneAddonsTotal;

    console.log('📊 Database Dashboard Total: Final calculated total:', total);
    return total;
  }, [visibleSuppliers, addons, partyDetails]);

  // OTHER HOOKS - Updated to use enhancedTotalCost
  const {
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    updateSuppliersForBudget
  } = useBudgetManager(enhancedTotalCost, isUpdating, setIsUpdating) // Use enhancedTotalCost instead of totalCost

  const {
    replacements,
    isProcessingRejection,
    handleApproveReplacement,
    handleViewSupplier,
    handleDismissReplacement,
    clearApprovedReplacements
  } = useReplacementManager(
    partyId,
    partyDetails,
    refreshPartyData,
    setNotification,
    null
  )
  
  const {
    unreadCount,
    hasNewMessages,
    unreadByCategory,
    loading: notificationsLoading,
    markMessagesAsRead,
  } = useChatNotifications({
    suppliers: visibleSuppliers,
    partyId,
    customerId: user?.id
  })

  // Supplier management functions
  const removeSupplier = async (supplierType) => {
    if (!partyId) {
      console.error('Cannot remove supplier: No party ID')
      return { success: false, error: 'No party ID available' }
    }
    
    const result = await partyDatabaseBackend.removeSupplierFromParty(partyId, supplierType)
    if (result.success) {
      refreshPartyData()
      return { success: true }
    }
    return result
  }

  const {
    handleDeleteSupplier,
    getSupplierDisplayName,
  } = useSupplierManager(removeSupplier)
  // ✅ CHECK CACHE IMMEDIATELY - BEFORE ANY HOOKS
  const cachedData = (() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = sessionStorage.getItem('party_data_cache')
      if (!cached) {
        console.log('❌ No cache in sessionStorage')
        return null
      }
      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      if (age < 5 * 60 * 1000) {
        console.log('✅ CACHE VALID - age:', Math.round(age/1000), 'seconds')
        return data
      }
      console.log('⏰ Cache expired')
      return null
    } catch (e) {
      console.error('Cache read error:', e)
      return null
    }
  })()

  

  // ALL EFFECTS (keeping existing effects unchanged)
  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  useEffect(() => {
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
  }, [searchParams, getStoredModalState, clearModalState])

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleScrollAndNavigation = () => {
      try {
        const scrollToSupplier = searchParams.get('scrollTo')
        const lastAction = searchParams.get('action') 
        const fromPage = searchParams.get('from')
        const source = searchParams.get('source')
        
        if (scrollToSupplier && lastAction === 'supplier-added') {
          setActiveMobileSupplierType(scrollToSupplier)

          if (!showWelcomePopup && !showSupplierAddedModal) {
            const scrollDelay = source === 'a_la_carte' ? 1000 : 500
            
            setTimeout(() => {
              const element = document.getElementById(`supplier-${scrollToSupplier}`)
              if (element && window.innerWidth >= 768) {
                element.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest'
                })
              } else {
                const mobileContent = document.getElementById('mobile-supplier-content')
                if (mobileContent) {
                  console.log('Mobile scrolling to content area')
                  mobileContent.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                  })
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }
            }, scrollDelay)

            setTimeout(() => {
              const newSearchParams = new URLSearchParams(searchParams.toString())
              newSearchParams.delete('scrollTo')
              newSearchParams.delete('action')
              if (fromPage && fromPage !== 'dashboard') {
                newSearchParams.delete('from')
              }
              
              const newURL = newSearchParams.toString() ? 
                `/dashboard?${newSearchParams.toString()}` : 
                '/dashboard'
              
              router.replace(newURL, { scroll: false })
            }, scrollDelay + 1000)
          } else {
            console.log('Modals showing, tab set but scroll delayed')
          }
          
        } else if (fromPage === 'supplier-detail' || fromPage === 'browse') {
          console.log('Returning from supplier page without adding')
          if (!showWelcomePopup && !showSupplierAddedModal) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
        
      } catch (error) {
        console.error('Navigation effect error:', error)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const scrollTimeout = setTimeout(handleScrollAndNavigation, 200)
    return () => clearTimeout(scrollTimeout)
  }, [searchParams, router, showWelcomePopup, showSupplierAddedModal, activeMobileSupplierType, isClient])

  // Add this effect to load recommendations for empty supplier slots
// In DatabaseDashboard.jsx - Update the recommendations effect with more logging

useEffect(() => {

  if (!isClient || !partyDetails) {
    console.log('❌ Not ready - isClient:', isClient, 'partyDetails:', !!partyDetails)
    return
  }
  
  // ✅ Debounce the loading to prevent multiple triggers
  const timeoutId = setTimeout(() => {
    const loadRecommendations = async () => {
      try {
        console.log('📡 Starting to load recommendations...')
        
        const { suppliersAPI } = await import('@/utils/mockBackend')
        const allSuppliers = await suppliersAPI.getAllSuppliers()
        
        console.log('📦 Total suppliers available:', allSuppliers.length)
        console.log('📦 Sample supplier:', allSuppliers[0])
        console.log('🔍 Current visible suppliers:', visibleSuppliers)
        
        const categoryMap = {
          venue: 'Venues',
          entertainment: 'Entertainment',
          cakes: 'Cakes',
          catering: 'Catering',
          facePainting: 'Face Painting',
          activities: 'Activities',
          partyBags: 'Party Bags',
          decorations: 'Decorations',
          balloons: 'Balloons'
        }
        
        const newRecommendations = {}
        
        // For each category, if no supplier exists, recommend one
        Object.entries(categoryMap).forEach(([categoryKey, categoryName]) => {
          const hasSupplier = visibleSuppliers[categoryKey]
          
          console.log(`🔍 Checking ${categoryKey} (${categoryName}):`, {
            hasSupplier: !!hasSupplier,
            supplierName: hasSupplier?.name
          })
          
          if (!hasSupplier) {
            // Find first supplier in this category
            const categorySupplier = allSuppliers.find(s => s.category === categoryName)
            
            if (categorySupplier) {
              newRecommendations[categoryKey] = categorySupplier
              console.log(`✅ Recommending ${categorySupplier.name} for ${categoryKey}`)
            } else {
              console.log(`⚠️ No supplier found for category: ${categoryName}`)
            }
          } else {
            console.log(`⏭️ Skipping ${categoryKey} - already has supplier: ${hasSupplier.name}`)
          }
        })
        
        console.log('🎯 Final recommendations:', Object.keys(newRecommendations))
        console.log('📊 Recommendation details:', newRecommendations)
        
        setRecommendedSuppliers(newRecommendations)
        setRecommendationsLoaded(true)
        
        console.log('✅ Recommendations loaded successfully!')
        
      } catch (error) {
        console.error('❌ Error loading recommendations:', error)
        setRecommendationsLoaded(true) // Still set to true to show UI
      }
    }
    
    loadRecommendations()
  }, 300) // ✅ 300ms debounce
  
  return () => {
    console.log('🧹 Cleaning up recommendations effect')
    clearTimeout(timeoutId)
  }
  
}, [isClient, partyDetails, visibleSuppliers])

  // Use disable scroll hook
  useDisableScroll([showSupplierModal, showWelcomePopup])

  // COMPUTED VALUES (after all hooks) - Updated to use enhancedTotalCost
  const trackableSuppliers = Object.entries(visibleSuppliers).filter(([key, supplier]) => 
    supplier && key !== "einvites"
  )
  const totalSuppliers = trackableSuppliers.length
  const confirmedSuppliers = trackableSuppliers.filter(([type, supplier]) => {
    const enquiry = enquiries.find((e) => e.supplier_category === type)
    return enquiry?.status === "accepted"
  }).length
  
  const allSuppliersConfirmed = confirmedSuppliers === totalSuppliers && totalSuppliers > 0
  const showSnappysParty = allSuppliersConfirmed || currentPhase === 'confirmed'

  // Helper functions - Updated to use enhancedTotalCost
  const getOutstandingSupplierData = () => {
    const unpaidEnquiries = enquiries.filter(enquiry => {
      const isAccepted = enquiry.status === 'accepted'
      const isUnpaid = !enquiry.payment_status || enquiry.payment_status === 'unpaid'
      // ✅ FIX: Exclude einvites from payment - digital invites are NOT a paid supplier
      const isNotEinvites = enquiry.supplier_category !== 'einvites'
      return isAccepted && isUnpaid && isNotEinvites
    })

    if (unpaidEnquiries.length === 0) {
      return { suppliers: [], totalCost: 0, totalDeposit: 0 }
    }

    const outstandingSuppliers = unpaidEnquiries
      .map(enquiry => {
        const supplierType = enquiry.supplier_category
        const supplier = visibleSuppliers[supplierType]

        if (!supplier) {
          return null
        }

        // ✅ EXTRA SAFETY: Double-check we're not including einvites
        if (supplierType === 'einvites') {
          return null
        }

        return { enquiry, supplierType, supplier }
      })
      .filter(Boolean)
    
    const paymentData = outstandingSuppliers.map(({ enquiry, supplierType, supplier }) => {
      // Use unified pricing system to get supplier cost
      const supplierAddons = addons.filter(addon => 
        addon.supplierId === supplier.id || 
        addon.supplierType === supplierType ||
        addon.attachedToSupplier === supplierType
      );
      
      let supplierPrice;
      if (supplier.enhancedPrice && supplier.originalPrice) {
        supplierPrice = supplier.enhancedPrice;
      } else if (supplier.packageData?.enhancedPrice && supplier.packageData?.originalPrice) {
        supplierPrice = supplier.packageData.enhancedPrice;
      } else if (supplier.packageData?.totalPrice && supplier.packageData?.price && 
                 supplier.packageData.totalPrice !== supplier.packageData.price) {
        supplierPrice = supplier.packageData.totalPrice;
      } else {
        const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
        supplierPrice = pricing.finalPrice;
      }
      
      const supplierDepositAmount = Math.max(50, Math.round(supplierPrice * 0.3))

      return {
        type: supplierType,
        name: supplier.name,
        totalAmount: supplierPrice,
        depositAmount: supplierDepositAmount,
        enquiryId: enquiry.id
      }
    })
    
    const totalOutstandingCost = paymentData.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalDepositAmount = paymentData.reduce((sum, item) => sum + item.depositAmount, 0)
    
    return {
      suppliers: paymentData,
      totalCost: totalOutstandingCost,
      totalDeposit: totalDepositAmount
    }
  }

  const outstandingData = getOutstandingSupplierData()

  // Session storage effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cartData', JSON.stringify({
        suppliers: outstandingData.suppliers,
        totalDeposit: outstandingData.totalDeposit,
        supplierCount: outstandingData.suppliers.length,
        timestamp: Date.now()
      }))
    }
  }, [enquiries, visibleSuppliers])

  // EVENT HANDLERS (keeping all existing handlers unchanged)
  const openSupplierModal = (category, theme = 'superhero') => {
    setModalConfig({
      category,
      theme,
      date: partyDetails?.date,
      filters: {}
    })
    setShowSupplierModal(true)
  }

  const closeSupplierModal = () => {
    setShowSupplierModal(false)
  }

  const handleSupplierSelection = async (supplierData) => {
    const supplier = supplierData?.supplier || supplierData
    const selectedPackage = supplierData?.package || null

    if (!supplier) {
      console.error('No supplier data provided')
      return
    }
    
    try {
      await handleNormalSupplierAddition(supplier, selectedPackage)
      
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
        'Bouncy Castle': 'bouncyCastle'
      }
      
      const supplierType = supplierTypeMapping[supplier.category] || 'venue'
      setActiveMobileSupplierType(supplierType)
      
    } catch (error) {
      console.error('Error in supplier selection:', error)
      setEnquiryFeedback(`Failed to process ${supplier.name}: ${error.message}`)
    }
  }

  const handleNormalSupplierAddition = async (supplier, selectedPackage) => {
    setShowSupplierModal(false)
    
    setTimeout(() => {
      const modalData = { supplier, selectedPackage }
      setAddedSupplierData(modalData)
      setShowSupplierAddedModal(true)
      setEnquiryFeedback(null)
    }, 200)
  }

  const handleModalSendEnquiry = async (supplier, selectedPackage, partyId, selectedAddons = []) => {
    setSendingEnquiry(true)

    try {
      const addResult = await partyDatabaseBackend.addSupplierToParty(
        partyId,
        supplier,
        selectedPackage
      )

      if (!addResult.success) {
        throw new Error(addResult.error)
      }

      // Add any selected addons
      if (selectedAddons && selectedAddons.length > 0) {
        for (const addon of selectedAddons) {
          await handleAddAddon(addon)
        }
      }

      const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
        partyId,
        supplier,
        selectedPackage,
        `Immediate booking confirmed for ${supplier.name}`
      )

      if (!enquiryResult.success) {
        console.error('Booking failed but supplier was added:', enquiryResult.error)
        setEnquiryFeedback(`${supplier.name} added, but booking confirmation failed`)
      } else {
        console.log('STEP 2: Booking confirmed successfully')
      }

      const replacementContextString = sessionStorage.getItem('replacementContext')
      let replacementContext = null

      if (replacementContextString) {
        try {
          replacementContext = JSON.parse(replacementContextString)
        } catch (error) {
          console.error('Error parsing replacement context:', error)
        }
      }

      if (replacementContext?.isReplacementFlow && replacementContext?.originalSupplierCategory) {
        try {
          const markResult = await partyDatabaseBackend.markReplacementAsProcessed(
            partyId,
            replacementContext.originalSupplierCategory,
            supplier.id
          )

          if (markResult.success) {
            console.log('STEP 3: Replacement marked as processed successfully')
          } else {
            console.error('STEP 3: Failed to mark replacement as processed:', markResult.error)
          }
        } catch (error) {
          console.error('STEP 3: Exception marking replacement as processed:', error)
        }

        sessionStorage.removeItem('replacementContext')
      } else {
        console.log('Not a replacement flow - skipping replacement processing')
      }

      await refreshPartyData()
      setShowSupplierAddedModal(false)
      setAddedSupplierData(null)

      // Show success toast notification
      toast.success(`${supplier.name} has been added to your party!`, {
        title: 'Supplier Added',
        duration: 3000
      })

      // Don't show the enquiry success banner when securing booking
      // Just silently refresh the page without URL parameters

    } catch (error) {
      console.error('CRITICAL ERROR in handleModalSendEnquiry:', error)
      setEnquiryFeedback(`Failed to add ${supplier.name}: ${error.message}`)

      // Show error toast
      toast.error(`Failed to add ${supplier.name}. Please try again.`, {
        title: 'Error',
        duration: 4000
      })
    } finally {
      console.log('FINAL STEP: Setting sendingEnquiry to false')
      setSendingEnquiry(false)
    }
  }

  const handleCancelEnquiry = async (supplierType) => {
    if (isCancelling || !partyId) {
      console.log('Exiting early - isCancelling:', isCancelling, 'partyId:', partyId)
      return
    }
    
    setIsCancelling(true)
    
    try {
      const result = await partyDatabaseBackend.cancelEnquiryAndRemoveSupplier(partyId, supplierType)
      
      if (result.success) {
        await refreshPartyData()
        setEnquiryFeedback(`Request cancelled for ${supplierType}`)
        setTimeout(() => setEnquiryFeedback(null), 3000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error cancelling enquiry:', error)
      setEnquiryFeedback(`Failed to cancel request: ${error.message}`)
      setTimeout(() => setEnquiryFeedback(null), 5000)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleMobileSupplierTabChange = (supplierType) => {
    setActiveMobileSupplierType(supplierType)
    
    setTimeout(() => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.classList.remove('modal-open', 'overflow-hidden')
    }, 50)
  }

  const handleModalClose = () => {
    setShowSupplierAddedModal(false)
    setAddedSupplierData(null)
  }

  const handleAddSupplier = () => navigateWithContext('/browse', 'dashboard')

  const handlePaymentReady = () => {
    // DatabaseDashboard payment flow is ALWAYS adding a supplier (initial booking happened elsewhere)
    const unpaidEnquiry = enquiries.find(e =>
      !['paid', 'fully_paid', 'partial_paid'].includes(e.payment_status) && e.is_paid !== true
    )

    if (unpaidEnquiry) {
      const supplierType = unpaidEnquiry.supplier_category
      const supplier = visibleSuppliers[supplierType]

      const params = new URLSearchParams({
        party_id: partyId,
        add_supplier: 'true',
        ...(supplier?.name && { supplier_name: supplier.name }),
        ...(supplierType && { supplier_category: supplierType })
      })

      console.log('✅ DatabaseDashboard - Adding supplier with params:', params.toString())
      router.push(`/payment/secure-party?${params.toString()}`)
    } else {
      console.log('⚠️ No unpaid enquiry found, redirecting without add_supplier param')
      router.push(`/payment/secure-party?party_id=${partyId}`)
    }
  }

  const handleCreateInvites = () => window.location.href = "/e-invites/create"

  const handleNotificationClick = () => {
    markMessagesAsRead() // Mark as read
    router.push('/party-summary#supplier-messages') // Navigate to chat
  }

  // ✅ NEW: Handle party selection from dropdown
  const handleSelectParty = (newPartyId) => {
    console.log('🔄 Switching to party:', newPartyId)
    setSelectedPartyId(newPartyId)
    // Persist to localStorage so gift registry page knows which party is selected
    localStorage.setItem('selectedPartyId', newPartyId)
    console.log('💾 Saved selectedPartyId to localStorage:', newPartyId)

    // Navigate to the new party (this will cause usePartyData to reload with the new partyId)
    router.push(`/dashboard?party_id=${newPartyId}`)
  }

  // ✅ NEW: Handle create new party
  const handleCreateNewParty = () => {
    console.log('➕ Creating new party...')
    // Navigate to homepage to create a new party
    router.push('/')
  }

  // Add these helper functions before your event handlers section

const getRecommendedSupplierForType = (categoryType) => {
  console.log('🔍 Getting recommended supplier for:', categoryType)
  console.log('📦 Available recommendations:', recommendedSuppliers)
  return recommendedSuppliers[categoryType] || null
}

// In DatabaseDashboard.jsx - REPLACE the handleAddRecommendedSupplier function

const handleAddRecommendedSupplier = async (categoryType, supplier, shouldNavigate = true) => {
  console.log('🎯 Adding recommended supplier...', supplier.name, 'shouldNavigate:', shouldNavigate)

  try {
    // ✅ DON'T add to database yet - just show the confirmation modal
    // This matches the flow when selecting from the supplier modal

    // Close any open modals first
    setShowSupplierModal(false)

    // Prepare the supplier data for the confirmation modal
    const supplierData = {
      supplier: supplier,
      package: supplier.packageData || null
    }

    // Show the confirmation modal (same as regular supplier selection)
    setTimeout(() => {
      setAddedSupplierData(supplierData)
      setShowSupplierAddedModal(true)
      setEnquiryFeedback(null)
    }, 200)

    // ✅ Only navigate to the tab if shouldNavigate is true
    if (shouldNavigate) {
      setActiveMobileSupplierType(categoryType)
    }

  } catch (error) {
    console.error('💥 Error:', error)
    setEnquiryFeedback(`Failed to add ${supplier.name}: ${error.message}`)
  }
}

const handleChildPhotoUpload = async (file) => {
  if (!file) return;

  console.log('📷 Uploading child photo...');
  setUploadingChildPhoto(true);

  try {
    // Upload to Cloudinary (same as your profile photo)
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
    
    // ✅ For database users: Save to Supabase
    if (partyId && user) {
      const { data, error } = await supabase
        .from('parties')
        .update({ child_photo: photoUrl })
        .eq('id', partyId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }
      
      console.log('✅ Photo saved to database');
      
      // Refresh party data to show the new photo
      await refreshPartyData();
    } 
    // ✅ For localStorage users: Use handlePartyDetailsUpdate
    else {
      await handlePartyDetailsUpdate({
        childPhoto: photoUrl
      });
      
      console.log('✅ Photo saved to localStorage');
    }
    
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


  // ✅ CRITICAL: Only show loader if loading AND no cache
  if (loading && !cachedData) {
    console.log('🔴 SHOWING LOADER - no cache available')
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading your party..." />
      </div>
    )
  }

  const isRefreshing = loading && cachedData

  // Redirect check
  if (dataSource === 'localStorage') {
    console.log('Redirecting to localStorage dashboard')
    router.push('/dashboard')
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Redirecting to your local party..." />
      </div>
    )
  }

  // Inside the component, before the return:
const addSuppliersSection = (
  <AddSuppliersSection
    suppliers={visibleSuppliers}
    enquiries={enquiries}
    onAddSupplier={openSupplierModal}
    onRemoveSupplier={handleDeleteSupplier}
    getSupplierDisplayName={getSupplierDisplayName}
    loadingCards={loadingCards}
    partyDetails={partyDetails}
    addons={addons}
    handleRemoveAddon={handleRemoveAddon}
    isPaymentConfirmed={isPaymentConfirmed}
    currentPhase={currentPhase}
    onPaymentReady={handlePaymentReady}
    handleCancelEnquiry={handleCancelEnquiry}
    getSupplierDisplayPricing={getSupplierDisplayPricing}
    getRecommendedSupplierForType={getRecommendedSupplierForType}
    onAddRecommendedSupplier={handleAddRecommendedSupplier}
    recommendationsLoaded={recommendationsLoaded}
  />
)


  // MAIN COMPONENT JSX
  return (
    <div className="min-h-screen w-screen overflow-hidden">
      <ContextualBreadcrumb currentPage="dashboard"/>
 
      <SupplierAddedConfirmationModal
        isOpen={showSupplierAddedModal}
        onClose={handleModalClose}
        onSendEnquiry={handleModalSendEnquiry}
        supplier={addedSupplierData?.supplier}
        selectedPackage={addedSupplierData?.selectedPackage}
        partyDetails={partyDetails}
        isSending={sendingEnquiry}
        currentPhase={currentPhase}
        partyData={partyData}
        partyId={partyId}
        enquiries={enquiries}
        hasEnquiriesPending={hasEnquiriesPending}
        onGoToPayment={handlePaymentReady}
      />

      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Next Steps Welcome Card - Shows after initial booking */}
      <NextStepsWelcomeCard
        suppliers={visibleSuppliers}
        enquiries={enquiries}
      />

      {/* Supplier Added Banner - Shows when adding suppliers later */}
      <SupplierAddedBanner />
      <EnquirySuccessBanner
        partyId={partyId}
      />

      {/* Full Width Header */}
      <div className="mb-8">
        <DatabasePartyHeader
          key={`party-header-${partyId || 'default'}-${currentParty?.theme || partyTheme}`}
          theme={currentParty?.theme || partyTheme}
          partyDetails={partyDetails}
          currentParty={currentParty}
          dataSource="database"
          enquiries={enquiries}
          unreadCount={unreadCount}
          hasNewMessages={hasNewMessages}
          onNotificationClick={handleNotificationClick}
          loading={loading}
          childPhoto={currentParty?.child_photo || partyDetails?.childPhoto}
          onPhotoUpload={handleChildPhotoUpload}
          uploadingPhoto={uploadingChildPhoto}
          venue={visibleSuppliers?.venue || null}
          allParties={allParties}
          selectedPartyId={selectedPartyId || partyId}
          onSelectParty={handleSelectParty}
          onCreateNewParty={handleCreateNewParty}
        />
      </div>

      {/* Container for rest of content */}
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 pb-8">
        <SupplierSelectionModal
          isOpen={showSupplierModal}
          onClose={closeSupplierModal}
          category={modalConfig.category}
          theme={modalConfig.theme}
          date={modalConfig.date}
          initialFilters={modalConfig.filters}
          onSelectSupplier={handleSupplierSelection}
          currentPhase={currentPhase}
          isAwaitingResponses={currentPhase === 'awaiting_responses'}
          partyLocation={partyDetails?.location}
          partyData={partyData}
          enquiries={enquiries}
          hasEnquiriesPending={hasEnquiriesPending}
          isSignedIn={true}
          currentPartyId={partyId}
          onAddToPlan={handleSupplierSelection} 
        />

        {partyId && (
          <ReplacementManager
            replacements={replacements}
            isProcessingRejection={isProcessingRejection}
            onApproveReplacement={handleApproveReplacement}
            onViewSupplier={handleViewSupplier}
            onDismiss={handleDismissReplacement}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">
            {/* <SupplierGrid
              suppliers={suppliers}
              enquiries={enquiries}
              addons={addons}
              onRemoveAddon={handleRemoveAddon}
              hasEnquiriesPending={hasEnquiriesPending}
              isPaymentConfirmed={isPaymentConfirmed}
              onAddSupplier={handleAddSupplier}
              partyId={partyId}
              isSignedIn={true}
              currentPhase={currentPhase}
              openSupplierModal={openSupplierModal}
              renderKey={renderKey}
              onPaymentReady={handlePaymentReady}
              paymentDetails={paymentDetails}
              handleCancelEnquiry={handleCancelEnquiry}
              activeSupplierType={activeMobileSupplierType}
              onSupplierTabChange={handleMobileSupplierTabChange}
              partyDetails={partyDetails} // ADD: Pass partyDetails for unified pricing
              getSupplierDisplayPricing={getSupplierDisplayPricing} // ADD: Pass pricing function
              getRecommendedSupplierForType={getRecommendedSupplierForType}
              onAddRecommendedSupplier={handleAddRecommendedSupplier}
              recommendationsLoaded={recommendationsLoaded}
              loadingCards={loadingCards}
            /> */}

           {/* NEW: Journey takes center stage */}
  <div className="mb-8 px-4">
    <div className="mb-6">
      <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        Your Party Journey
        <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
      </h2>
      <p className="text-sm text-gray-600 mt-3">Track your planning progress</p>
    </div>
  </div>

  <PartyPhaseContent
    key={`party-phase-${partyId || 'default'}`}
    phase={partyPhase}
    suppliers={visibleSuppliers}
    enquiries={enquiries}
    partyData={partyData}
    paymentDetails={paymentDetails}
    partyDetails={partyDetails}
    hasCreatedInvites={partyData?.einvites?.status === 'completed'}
    onPaymentReady={handlePaymentReady}
    onCreateInvites={handleCreateInvites}
    onAddSupplier={openSupplierModal}
    onRemoveSupplier={handleDeleteSupplier}
    loadingCards={loadingCards}
    getSupplierDisplayName={getSupplierDisplayName}
     // ✅ ADD THESE
  addons={addons}
  handleRemoveAddon={handleRemoveAddon}
  isPaymentConfirmed={isPaymentConfirmed}
  currentPhase={currentPhase}
  handleCancelEnquiry={handleCancelEnquiry}
  getSupplierDisplayPricing={getSupplierDisplayPricing}
  getRecommendedSupplierForType={getRecommendedSupplierForType}
  onAddRecommendedSupplier={handleAddRecommendedSupplier}
  recommendationsLoaded={recommendationsLoaded}
  onDataUpdate={setPartyToolsData}
  />

            {/* Mobile: Total Cost Summary Card */}
            <div className="mt-8 px-4">
              <div className="bg-primary-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-1">Total Party Cost</p>
                    <p className="text-white text-2xl font-bold">
                      £{enhancedTotalCost.toFixed(2)}
                    </p>
                  </div>
                  {outstandingData.totalCost > 0 && (
                    <div className="text-right">
                      <p className="text-white/80 text-xs font-medium mb-1">Due Now</p>
                      <p className="text-white text-xl font-bold">
                        £{outstandingData.totalCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: My Party Plan Section - Horizontal Scroll with Remove Option */}
            <div className="mt-8 mb-8">
              <div className="mb-6 px-4">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  My Party Plan
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">All suppliers in your plan</p>
              </div>

              {(() => {
                // Get ALL suppliers (both paid and unpaid)
                const allPlanSuppliers = Object.entries(visibleSuppliers).filter(([type, supplier]) => {
                  return supplier && type !== "einvites"
                })

                // Sort suppliers: pending first, then paid
                const sortedSuppliers = allPlanSuppliers.sort(([typeA, supplierA], [typeB, supplierB]) => {
                  const enquiryA = enquiries.find((e) => e.supplier_category === typeA)
                  const enquiryB = enquiries.find((e) => e.supplier_category === typeB)
                  const isPaidA = ['paid', 'fully_paid', 'partial_paid'].includes(enquiryA?.payment_status) || enquiryA?.is_paid === true
                  const isPaidB = ['paid', 'fully_paid', 'partial_paid'].includes(enquiryB?.payment_status) || enquiryB?.is_paid === true

                  // Pending (not paid) comes first
                  if (!isPaidA && isPaidB) return -1
                  if (isPaidA && !isPaidB) return 1
                  return 0
                })

                // Category name mapping
                const categoryNames = {
                  venue: 'Venue',
                  entertainment: 'Entertainment',
                  catering: 'Catering',
                  cakes: 'Cakes',
                  facePainting: 'Face Painting',
                  activities: 'Activities',
                  partyBags: 'Party Bags',
                  decorations: 'Decorations',
                  balloons: 'Balloons',
                  photography: 'Photography',
                  bouncyCastle: 'Bouncy Castle'
                }

                if (sortedSuppliers.length === 0) {
                  return (
                    <div className="px-4">
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="font-bold text-gray-900 mb-2">No suppliers in your plan yet</h3>
                        <p className="text-sm text-gray-600">Start building your party by adding suppliers</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="flex gap-4 overflow-x-auto pb-2 pl-4 pr-4 snap-x snap-mandatory scrollbar-hide">
                    {sortedSuppliers.map(([type, supplier]) => {
                      const supplierAddons = Array.isArray(addons) ? addons.filter(addon =>
                        addon.supplierId === supplier.id ||
                        addon.supplierType === type ||
                        addon.attachedToSupplier === type
                      ) : []

                      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)

                      // Calculate base price - handle party bags differently
                      const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
                      let basePrice = 0

                      if (isPartyBags) {
                        // Get quantity - check multiple sources
                        const quantity = supplier.partyBagsQuantity ||
                                         supplier.partyBagsMetadata?.quantity ||
                                         supplier.packageData?.partyBagsQuantity ||
                                         10 // fallback

                        // Get price per bag
                        const pricePerBag = supplier.partyBagsMetadata?.pricePerBag ||
                                            supplier.packageData?.pricePerBag ||
                                            supplier.packageData?.price ||
                                            supplier.price ||
                                            supplier.priceFrom ||
                                            0

                        // Calculate total price
                        basePrice = pricePerBag * quantity

                        console.log('🎒 MY PLAN - Party Bags Price:', {
                          supplierName: supplier.name,
                          pricePerBag,
                          quantity,
                          totalPrice: basePrice,
                          supplier
                        })
                      } else {
                        basePrice = supplier.packageData?.price || supplier.price || 0
                      }

                      const totalPrice = basePrice + addonsCost
                      const supplierName = supplier.name || 'Unknown Supplier'
                      const categoryName = categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)

                      // Check if supplier is paid
                      const enquiry = enquiries.find((e) => e.supplier_category === type)
                      const isPaid = ['paid', 'fully_paid', 'partial_paid'].includes(enquiry?.payment_status) || enquiry?.is_paid === true
                      const canRemove = !isPaid // Can only remove if not paid

                      return (
                        <div
                          key={type}
                          className="flex-shrink-0 w-[280px] snap-start bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all"
                        >
                          {/* Supplier Image */}
                          {supplier.image && (
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={supplier.image}
                                alt={supplierName}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                              <div className="absolute top-3 right-3">
                                {isPaid ? (
                                  <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    ✓ Paid
                                  </span>
                                ) : (
                                  <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Supplier Details */}
                          <div className="p-4">
                            <p className="text-xs text-primary-600 uppercase tracking-wide mb-1 font-semibold">
                              {categoryName}
                            </p>
                            <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
                              {supplierName}
                            </h4>

                            <div className="mt-2">
                              <p className="text-lg font-bold text-primary-600">
                                £{totalPrice.toFixed(2)}
                              </p>
                              {supplierAddons.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>

                            {/* Remove Button for Unpaid Suppliers */}
                            {canRemove && (
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Remove ${supplierName} from your plan?`)) {
                                    await handleCancelEnquiry(type)
                                  }
                                }}
                                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-semibold border border-red-200 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove from Plan
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              <style jsx>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>

            {/* Mobile: Party Checklist Button */}
            <div className="mt-8 px-4">
              <button
                onClick={() => setShowChecklistModal(true)}
                className="w-full bg-primary-50 border-2 border-[hsl(var(--primary-200))] rounded-lg p-6 hover:shadow-lg transition-all active:scale-[0.98] relative overflow-hidden"
                style={{
                  transform: 'rotate(-0.5deg)',
                  boxShadow: '3px 3px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* Tape effect at top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 bg-white/60 border border-[hsl(var(--primary-200))]/40 rotate-0"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  }}
                />

                <div className="text-left relative">
                  <h3 className="text-primary-800 text-3xl mb-2" style={{ fontFamily: 'Indie Flower, cursive', fontWeight: 700 }}>
                    Party Checklist ✓
                  </h3>
                  <p className="text-primary-700 text-xl leading-tight" style={{ fontFamily: 'Indie Flower, cursive' }}>
                    Don't forget anything for the big day!
                  </p>

                  {/* Hand-drawn arrow */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-primary-400 text-4xl" style={{ fontFamily: 'Indie Flower, cursive', transform: 'translateY(-50%) rotate(-5deg)' }}>
                    →
                  </div>
                </div>
              </button>
            </div>

            {/* Mobile: Add More Suppliers Section - Horizontal Scroll */}
            <div className="mt-8">
              <div className="mb-6 px-4">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Level Up Your Party
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">Complete your party with these recommendations</p>
              </div>
              <MissingSuppliersSuggestions
                partyPlan={visibleSuppliers}
                partyDetails={partyDetails}
                onAddSupplier={async (supplier, supplierType) => {
                  // Use the same logic as AddSuppliersSection (from bottom bar)
                  await handleAddRecommendedSupplier(supplierType, supplier, false)
                  return true
                }}
                onCustomize={(supplier, supplierType) => {
                  // Open customization modal when clicking on supplier card
                  handleAddRecommendedSupplier(supplierType, supplier, false)
                }}
                showTitle={false}
                horizontalScroll={true}
                preventNavigation={true}
                disableConfetti={true}
              />
            </div>

            {/* Mobile: Party Tools Horizontal Scroll - RSVP, E-Invites, Registry */}
            <div className="mt-8 mb-8">
              <div className="mb-6 px-4">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Guests & Gifts
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">Manage invitations, RSVPs, and gift registry</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 pl-4 pr-4 snap-x snap-mandatory scrollbar-hide">
                {(() => {
                  const venueEnquiry = enquiries.find(e => e.supplier_category === 'venue')
                  const venueExists = !!visibleSuppliers.venue
                  const isVenueConfirmed = venueEnquiry?.status === 'accepted' && venueEnquiry?.auto_accepted === false
                  const venueAwaitingConfirmation = venueEnquiry?.status === 'accepted' && venueEnquiry?.auto_accepted === true
                  const hasPaidSuppliers = enquiries.some(e => ['paid', 'fully_paid', 'partial_paid'].includes(e.payment_status) || e.is_paid === true)

                  const einvitesData = partyToolsData?.einvites
                  const einvitesCreated = !!einvitesData && (einvitesData.inviteId || einvitesData.shareableLink || einvitesData.friendlySlug)
                  const inviteId = einvitesData?.inviteId || einvitesData?.shareableLink?.split('/e-invites/')[1] || einvitesData?.friendlySlug
                  const invitesSent = einvitesData?.guestList?.some(g => g.status === 'sent') || false
                  const sentCount = einvitesData?.guestList?.filter(g => g.status === 'sent').length || 0

                  const guestListData = partyToolsData?.guestList || []
                  const giftRegistryData = partyToolsData?.giftRegistry
                  const registryItemCountData = partyToolsData?.registryItemCount || 0

                  const partyTools = [
                    {
                      id: 'guests',
                      label: guestListData.length > 0 ? 'Manage Guest List' : 'Create Guest List',
                      icon: Users,
                      href: `/rsvps/${partyDetails?.id || ''}`,
                      hasContent: guestListData.length > 0,
                      count: guestListData.length,
                      isLocked: false,
                      status: guestListData.length > 0 ? `${guestListData.length} guest${guestListData.length !== 1 ? 's' : ''}` : 'Not created',
                      description: guestListData.length > 0 ? 'View and manage your guest list' : 'Add guests for invites and RSVPs',
                      image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg'
                    },
                    {
                      id: 'einvites',
                      label: einvitesCreated ? (invitesSent ? 'Manage Invites' : 'Send Invites') : 'Create E-Invites',
                      icon: Mail,
                      href: inviteId ? `/e-invites/${inviteId}/manage` : '/e-invites/create',
                      hasContent: einvitesCreated,
                      isLocked: !isVenueConfirmed,
                      lockMessage: venueAwaitingConfirmation ? 'Waiting for venue to confirm your booking' : !venueExists ? 'Add a venue to your party first' : 'Venue must confirm your booking first',
                      status: !isVenueConfirmed ? '🔒 Locked' : einvitesCreated ? invitesSent ? `${sentCount} sent` : '✓ Created' : 'Not created',
                      description: !isVenueConfirmed ? (venueAwaitingConfirmation ? 'Waiting for venue confirmation' : 'Add and confirm venue first') : einvitesCreated ? (invitesSent ? 'Manage and track your invitations' : 'Share with guests') : 'Create beautiful digital invitations',
                      image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1754388320/party-invites/seo3b2joo1omjdkdmjtw.png'
                    },
                    {
                      id: 'registry',
                      label: giftRegistryData ? 'Manage Registry' : 'Create Registry',
                      icon: Gift,
                      href: '/gift-registry',
                      hasContent: !!giftRegistryData,
                      count: registryItemCountData,
                      isLocked: !hasPaidSuppliers,
                      lockMessage: 'Secure at least one supplier to create registry',
                      status: !hasPaidSuppliers ? '🔒 Locked' : giftRegistryData ? registryItemCountData > 0 ? `${registryItemCountData} item${registryItemCountData !== 1 ? 's' : ''}` : 'Registry created' : 'Not created',
                      description: !hasPaidSuppliers ? 'Confirm suppliers first' : giftRegistryData ? registryItemCountData > 0 ? 'Manage your gift registry' : 'Add items to your registry' : 'Help guests know what to bring',
                      image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1753970180/iStock-2000435412-removebg_ewfzxs.png'
                    }
                  ]

                  return partyTools.map((tool) => {
                    const Icon = tool.icon
                    const isLocked = tool.isLocked

                    if (isLocked) {
                      return (
                        <div
                          key={`${partyToolsKey}-${partyId}-${tool.id}`}
                          className="flex-shrink-0 w-[280px] snap-start bg-gray-50 border-2 border-gray-200 rounded-xl opacity-60 cursor-not-allowed overflow-hidden"
                        >
                          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                            <img src={tool.image} alt={tool.label} className="w-full h-full object-cover grayscale" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-3">
                                <Lock className="w-6 h-6 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-400">{tool.label}</h4>
                              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">🔒 Locked</span>
                            </div>
                            <p className="text-xs text-gray-400">{tool.lockMessage}</p>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={`${partyToolsKey}-${partyId}-${tool.id}`}
                        href={tool.href}
                        className="flex-shrink-0 w-[280px] snap-start bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all active:scale-[0.98] overflow-hidden group"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img src={tool.image} alt={tool.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-3 right-3">
                            {tool.hasContent ? (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">✓ {tool.status}</span>
                            ) : (
                              <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">New</span>
                            )}
                          </div>
                          {tool.count > 0 && (
                            <div className="absolute bottom-3 right-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">{tool.count}</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 mb-1 text-base">{tool.label}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{tool.description}</p>
                        </div>
                      </Link>
                    )
                  })
                })()}
              </div>

              <style jsx>{`
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>

            {/* Mobile: Party Day Timeline */}
            <div className="mt-8">
              <div className="mb-6 px-4">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Party Timeline
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">Your suggested schedule for the big day</p>
              </div>
              <div className="px-4">
                <PartyTimeline
                  partyDetails={partyDetails}
                  suppliers={visibleSuppliers}
                />
              </div>
            </div>

            {/* Mobile: Party Tips & Blog Recommendations Horizontal Scroll */}
            <div className="mt-8 mb-8">
              <div className="mb-6 px-4">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Snappy's Tips
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">Helpful guides & inspiration</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 pl-4 pr-4 snap-x snap-mandatory scrollbar-hide">
                {(() => {
                  // Calculate days until party
                  const calculateDaysUntil = () => {
                    if (!partyDetails?.date) return 60
                    const partyDate = new Date(partyDetails.date)
                    const now = new Date()
                    const diffInDays = Math.ceil((partyDate - now) / (1000 * 60 * 60 * 24))
                    return Math.max(0, diffInDays)
                  }

                  const daysUntil = calculateDaysUntil()

                  // Determine phase
                  const getTimelinePhase = (days) => {
                    if (days > 90) return "planning"
                    if (days > 60) return "organizing"
                    if (days > 30) return "booking"
                    if (days > 14) return "confirming"
                    if (days > 7) return "finalizing"
                    if (days > 0) return "final-week"
                    return "party-day"
                  }

                  const phase = getTimelinePhase(daysUntil)

                  // Blog posts
                  const slugify = (text) => text
                    .toString()
                    .toLowerCase()
                    .trim()
                    .replace(/[\s\W-]+/g, "-")

                  const allBlogPosts = [
                    {
                      id: 1,
                      title: "The Ultimate Guide to Planning a Children's Party in London: 2025 Edition",
                      slug: slugify("The Ultimate Guide to Planning a Children's Party in London: 2025"),
                      excerpt: "Everything you need to know about planning the perfect children's party in London this year",
                      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595127/blog-post-1_lztnfr.png",
                      category: "Planning",
                      readTime: "8 min read",
                      phases: ["planning", "organizing", "booking"]
                    },
                    {
                      id: 2,
                      title: "How Much Does a Children's Party Cost in London?",
                      slug: slugify("How Much Does a Children's Party Cost in London? A Complete Breakdown"),
                      excerpt: "A detailed analysis of children's party costs in London, with budgeting tips and money-saving strategies",
                      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595130/blog-post-2_tjjp76.png",
                      category: "Budget",
                      readTime: "6 min read",
                      phases: ["planning", "organizing"]
                    },
                    {
                      id: 3,
                      title: "15 Trending Children's Party Themes in London for 2025",
                      slug: slugify("15 Trending Children's Party Themes in London for 2025"),
                      excerpt: "Discover the hottest party themes that London kids are loving this year",
                      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595133/blog-post-3_ltyj0d.png",
                      category: "Themes",
                      readTime: "7 min read",
                      phases: ["planning"]
                    },
                    {
                      id: 4,
                      title: "10 Outdoor Party Games That London Kids Can't Get Enough Of",
                      slug: slugify("10 Outdoor Party Games That London Kids Can't Get Enough Of"),
                      excerpt: "Get kids moving with these popular outdoor party games perfect for London parks",
                      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595136/blog-post-4_d2bv5i.png",
                      category: "Activities",
                      readTime: "5 min read",
                      phases: ["booking", "finalizing", "final-week"]
                    },
                    {
                      id: 5,
                      title: "DIY Party Decorations That Will Wow Your Guests",
                      slug: slugify("DIY Party Decorations That Will Wow Your Guests"),
                      excerpt: "Create stunning party decorations on a budget with these simple DIY ideas",
                      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595139/blog-post-5_nvozyq.png",
                      category: "Planning",
                      readTime: "4 min read",
                      phases: ["booking", "confirming", "finalizing"]
                    },
                    {
                      id: 6,
                      title: "Healthy Party Food Options That Kids Actually Love",
                      slug: slugify("Healthy Party Food Options That Kids Actually Love"),
                      excerpt: "Nutritious and delicious party food ideas that will keep both kids and parents happy",
                      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595143/blog-post-6_jguagy.png",
                      category: "Food",
                      readTime: "5 min read",
                      phases: ["organizing", "booking", "confirming"]
                    }
                  ]

                  // Filter posts by phase
                  const relevantPosts = allBlogPosts.filter(post => post.phases.includes(phase))
                  const blogPosts = relevantPosts.length > 0 ? relevantPosts.slice(0, 3) : [allBlogPosts[0]]

                  return blogPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="flex-shrink-0 w-[280px] snap-start bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all active:scale-[0.98] overflow-hidden group"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            {post.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-1 text-sm leading-tight line-clamp-2">{post.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{post.excerpt}</p>
                      </div>
                    </Link>
                  ))
                })()}
              </div>
            </div>

            {/* Mobile: Party Countdown Section */}
            <div className="md:hidden mt-8 px-4">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Party Countdown
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">How long until the big day?</p>
              </div>

              <CountdownWidget partyDate={partyDetails?.date} />
            </div>

            {/* Mobile: Weather Forecast Widget */}
            <div className="md:hidden mt-8 px-4">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Weather Forecast
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">Check the forecast for your party day</p>
              </div>

              <WeatherWidget
                partyDate={partyDetails?.date}
                venueLocation={
                  visibleSuppliers?.venue?.location ||
                  visibleSuppliers?.venue?.venueAddress?.postcode ||
                  visibleSuppliers?.venue?.serviceDetails?.venueAddress?.postcode ||
                  visibleSuppliers?.venue?.data?.location ||
                  partyDetails?.venue?.location ||
                  partyDetails?.venue?.venueAddress?.postcode ||
                  partyDetails?.party_plan?.venue?.location ||
                  partyDetails?.location
                }
              />
            </div>

            {/* Mobile: Emergency Contacts */}
            <div className="mt-8 mb-12">
              <div className="mb-6 px-4">
                <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  Emergency Contacts
                  <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                </h2>
                <p className="text-sm text-gray-600 mt-3">Quick access to all your supplier contacts</p>
              </div>
              <div className="px-4">
                <EmergencyContacts
                  suppliers={visibleSuppliers}
                  enquiries={enquiries}
                  partyDetails={partyDetails}
                />
              </div>
            </div>
          </main>

          <Sidebar
            partyData={partyData}
            partyDate={partyDetails?.date}
            totalCost={enhancedTotalCost}
            isPaymentConfirmed={isPaymentConfirmed}
            suppliers={visibleSuppliers}
            enquiries={enquiries}
            timeRemaining={24}
            onPaymentReady={handlePaymentReady}
            showPaymentCTA={true}
            totalOutstandingCost={outstandingData.totalDeposit}
            outstandingSuppliers={outstandingData.suppliers.map(s => s.type)}
            AddSuppliersSection={addSuppliersSection}
            partyDetails={partyDetails}
            venueLocation={
              visibleSuppliers?.venue?.location ||
              visibleSuppliers?.venue?.venueAddress?.postcode ||
              visibleSuppliers?.venue?.serviceDetails?.venueAddress?.postcode ||
              visibleSuppliers?.venue?.data?.location ||
              partyDetails?.venue?.location ||
              partyDetails?.venue?.venueAddress?.postcode ||
              partyDetails?.party_plan?.venue?.location ||
              partyDetails?.location
            }
            // ✅ Timeline Assistant Data
            TimelineAssistant={
              <SnappyTimelineAssistant
                partyDetails={partyDetails}
                suppliers={visibleSuppliers}
                guestList={partyToolsData?.guestList || []}
                giftRegistry={partyToolsData?.giftRegistry}
                einvites={partyToolsData?.einvites}
                onSupplierClick={openSupplierModal}
              />
            }
          />
        </div>
      </div>

      <WelcomeDashboardPopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
      />

      <PartyChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        partyId={partyId}
        suppliers={visibleSuppliers}
      />
    </div>
  )
}