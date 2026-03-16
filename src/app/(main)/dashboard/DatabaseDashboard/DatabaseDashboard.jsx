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
import { Lock, Users, Mail, Gift, Trash2, Pencil } from "lucide-react"
import { canEditBooking, getOrderStatusEditBlockReason } from "@/utils/editDeadline"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Import unified pricing system
import { calculateFinalPrice, calculatePartyTotal } from '@/utils/unifiedPricing'
import { isPerformanceParty, parseCompoundTheme, getEffectiveThemeForCategory } from '@/utils/compoundTheme'

// Hooks
import { usePartyData } from '../hooks/usePartyData'
import { useReplacementManager } from '../hooks/useReplacementManager'
import { usePartyPhase } from '../hooks/usePartyPhase'
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from "../hooks/usePartyDetails"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import { useBudgetManager } from "../hooks/useBudgetManager"
import { useSupplierManager } from "../hooks/useSupplierManager"
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
import PriceDifferencePaymentModal from "@/components/PriceDifferencePaymentModal"

// Tab-based dashboard layout
import DashboardTabs from "./components/DashboardTabs"

// Tab content components
import JourneyTabContent from "./components/tabs/JourneyTabContent"
import MyPlanTabContent from "./components/tabs/MyPlanTabContent"
import AddTabContent from "./components/tabs/AddTabContent"
import GuestsTabContent from "./components/tabs/GuestsTabContent"
import TimelineTabContent from "./components/tabs/TimelineTabContent"
import MoreTabContent from "./components/tabs/MoreTabContent"
import SimplifiedSidebar from "./components/SimplifiedSidebar"
import BudgetControls from "@/components/budget-controls"
import ReferFriend from "@/components/ReferFriend"
import SupportWidget from "./components/SupportWidget"





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
  const [activeDashboardTab, setActiveDashboardTab] = useState('journey')
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

  // ✅ NEW: Edit booked supplier state
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [editingSupplierType, setEditingSupplierType] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // ✅ NEW: Price difference payment state
  const [showPricePaymentModal, setShowPricePaymentModal] = useState(false)
  const [pendingEditData, setPendingEditData] = useState(null)
  const [originalEditPrice, setOriginalEditPrice] = useState(null)

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
    refreshEnquiries,
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
        const { checkSupplierAvailability } = await import('@/utils/availabilityChecker')
        const allSuppliers = await suppliersAPI.getAllSuppliers()

        const partyTheme = partyDetails?.theme || 'no-theme'
        console.log('🎨 Loading recommendations for theme:', partyTheme)

        const categoryMap = {
          venue: 'Venues',
          entertainment: 'Entertainment',
          cakes: 'Cakes',
          decorations: 'Decorations',
          facePainting: 'Face Painting',
          activities: 'Soft Play',
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
              // Filter by availability if party date is set
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
                  if (!availabilityCheck.available && !firstUnavailableReason) {
                    firstUnavailableReason = availabilityCheck
                  }
                  return availabilityCheck.available
                })

                if (availableSuppliers.length === 0 && categorySuppliers.length > 0) {
                  allUnavailable = true
                  unavailabilityReason = firstUnavailableReason
                }
              }

              if (availableSuppliers.length > 0) {
                // For performance parties, pre-filter entertainment to matching type
                let suppliersToScore = availableSuppliers
                if (categoryKey === 'entertainment' && isPerformanceParty(partyTheme)) {
                  const { activityType } = parseCompoundTheme(partyTheme)
                  const PERFORMANCE_TYPES = { 'drama-party': 'Drama Party', 'dance-party': 'Dance Party', 'music-party': 'Music Party' }
                  const requiredType = PERFORMANCE_TYPES[activityType]
                  const performanceFiltered = availableSuppliers.filter(s => s.serviceDetails?.entertainmentType === requiredType)
                  if (performanceFiltered.length > 0) suppliersToScore = performanceFiltered
                }

                // For performance parties, use sub-theme for non-entertainment scoring
                const themeForScoring = (categoryKey !== 'entertainment' && isPerformanceParty(partyTheme))
                  ? (getEffectiveThemeForCategory(partyTheme) || partyTheme)
                  : partyTheme

                // Sort by theme score
                const sortedByTheme = suppliersToScore
                  .map(supplier => ({
                    supplier,
                    themeScore: scoreSupplierWithTheme(supplier, themeForScoring)
                  }))
                  .sort((a, b) => b.themeScore - a.themeScore)

                const bestMatch = sortedByTheme[0].supplier

                // For performance party entertainment, attach the themed package
                if (categoryKey === 'entertainment' && isPerformanceParty(partyTheme)) {
                  const packages = bestMatch.packages || bestMatch.data?.packages || []
                  const subTheme = parseCompoundTheme(partyTheme).subTheme || 'general'
                  const themedPkg = packages.find(pkg => pkg.themes?.includes(subTheme))
                  if (themedPkg) {
                    bestMatch.packageData = themedPkg
                    bestMatch.name = themedPkg.name
                  }
                }

                newRecommendations[categoryKey] = bestMatch
                console.log(`✅ ${categoryKey}: ${bestMatch.name} (score: ${sortedByTheme[0].themeScore})`)
              } else if (allUnavailable) {
                // Mark category as having no available suppliers
                newRecommendations[categoryKey] = {
                  unavailable: true,
                  category: categoryName,
                  categoryKey: categoryKey,
                  totalSuppliers: categorySuppliers.length,
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
    handleDeleteSupplier: originalHandleDeleteSupplier,
    getSupplierDisplayName,
  } = useSupplierManager(removeSupplier)

  // Wrapper for handleDeleteSupplier to show toast notification
  const handleDeleteSupplier = async (supplierType) => {
    const supplierName = getSupplierDisplayName(supplierType)
    await originalHandleDeleteSupplier(supplierType)
    toast.success(`${supplierName} removed from your party`, {
      duration: 3000,
    })
  }
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

  // Handle upgrade complete notification
  useEffect(() => {
    const upgradeComplete = searchParams.get('upgrade_complete')
    if (upgradeComplete === 'true') {
      // Use setTimeout to avoid render loop
      setTimeout(() => {
        toast.success('Your booking has been updated successfully!', {
          title: 'Upgrade Complete',
          duration: 4000
        })
      }, 100)
      // Clear the param from URL immediately
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('upgrade_complete')
      const newURL = newSearchParams.toString() ?
        `/dashboard?${newSearchParams.toString()}` :
        '/dashboard'
      router.replace(newURL, { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
          activities: 'Soft Play',
          partyBags: 'Party Bags',
          decorations: 'Decorations',
          balloons: 'Balloons',
          photography: 'Photography',
          bouncyCastle: 'Bouncy Castle'
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
            // Find best supplier in this category
            let categorySupplier = null
            if (categoryKey === 'entertainment' && partyDetails?.theme && isPerformanceParty(partyDetails.theme)) {
              // For performance parties, find the matching entertainment type
              const { activityType } = parseCompoundTheme(partyDetails.theme)
              const PERFORMANCE_TYPES = { 'drama-party': 'Drama Party', 'dance-party': 'Dance Party', 'music-party': 'Music Party' }
              const requiredType = PERFORMANCE_TYPES[activityType]
              categorySupplier = allSuppliers.find(s => s.category === categoryName && s.serviceDetails?.entertainmentType === requiredType)
            }
            if (!categorySupplier) {
              categorySupplier = allSuppliers.find(s => s.category === categoryName)
            }

            if (categorySupplier) {
              // For performance party entertainment, attach the themed package
              if (categoryKey === 'entertainment' && partyDetails?.theme && isPerformanceParty(partyDetails.theme)) {
                const packages = categorySupplier.packages || categorySupplier.data?.packages || []
                const subTheme = parseCompoundTheme(partyDetails.theme).subTheme || 'general'
                const themedPkg = packages.find(pkg => pkg.themes?.includes(subTheme))
                if (themedPkg) {
                  categorySupplier.packageData = themedPkg
                  categorySupplier.name = themedPkg.name
                }
              }
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

  // ✅ NEW: Handle editing a booked supplier
  const handleEditSupplier = async (supplierType, supplier) => {
    console.log('📝 Opening edit modal for:', supplierType, supplier.name || supplier.data?.name)

    // First, check if the order can be edited based on order_status
    try {
      const { data: enquiry, error: enquiryError } = await supabase
        .from('enquiries')
        .select('order_status')
        .eq('party_id', partyId)
        .eq('supplier_id', supplier.id)
        .single()

      if (!enquiryError && enquiry?.order_status) {
        const blockReason = getOrderStatusEditBlockReason(enquiry.order_status)
        if (blockReason) {
          toast.error(blockReason, {
            title: 'Cannot Edit Order',
            duration: 4000
          })
          return
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not check order status:', err)
      // Continue with edit if we can't check status
    }

    setEditingSupplierType(supplierType)

    // Fetch full supplier data including packages from database
    try {
      const { data: fullSupplierData, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplier.id)
        .single()

      if (error) {
        console.warn('⚠️ Could not fetch full supplier data, using saved data:', error)
        setEditingSupplier(supplier)
      } else {
        // ✅ FIX: Extract data from JSONB column and flatten for easier access
        // The database stores supplier details in a `data` JSONB column
        const dataFromDb = fullSupplierData.data || {}

        // Merge the full supplier data with the saved customization data
        const mergedSupplier = {
          ...fullSupplierData,
          // ✅ Flatten key fields from data JSONB for easier access
          name: dataFromDb.name || supplier.name,
          description: dataFromDb.description || supplier.description,
          category: dataFromDb.category || supplier.category,
          image: dataFromDb.image || supplier.image,
          priceFrom: dataFromDb.priceFrom || supplier.priceFrom,
          location: dataFromDb.location || supplier.location,
          // Keep the full data object for nested access
          data: dataFromDb,
          // Preserve the saved package selection and customizations
          packageId: supplier.packageId,
          packageData: supplier.packageData,
          selectedAddons: supplier.selectedAddons,
          totalPrice: supplier.totalPrice,
          price: supplier.price,
        }
        console.log('✅ Fetched full supplier data:', {
          name: mergedSupplier.name,
          packages: dataFromDb.packages?.length || dataFromDb.serviceDetails?.packages?.length || 0,
          flavours: dataFromDb.flavours?.length || dataFromDb.serviceDetails?.flavours?.length || 0
        })
        setEditingSupplier(mergedSupplier)
      }
    } catch (fetchError) {
      console.error('❌ Error fetching supplier data:', fetchError)
      setEditingSupplier(supplier)
    }

    setShowEditModal(true)
  }

  // ✅ NEW: Handle saving edited supplier
  const handleSaveEditedSupplier = async (updatedData) => {
    if (!partyId || !editingSupplierType) {
      console.error('Missing partyId or supplierType')
      return
    }

    // Get the original price from the current supplier in the party plan
    const currentSupplier = visibleSuppliers[editingSupplierType]
    const originalPrice = currentSupplier?.totalPrice ||
                          currentSupplier?.price ||
                          currentSupplier?.packageData?.totalPrice ||
                          currentSupplier?.packageData?.price ||
                          0

    const newPrice = updatedData.totalPrice || 0
    const priceDiff = newPrice - originalPrice

    console.log('💰 Price comparison:', { originalPrice, newPrice, priceDiff })

    // If price increased, redirect to upgrade payment page
    if (priceDiff > 0) {
      console.log('💳 Price increased by £' + priceDiff.toFixed(2) + ' - redirecting to upgrade payment page')

      // Store pending edit data in sessionStorage for after payment
      const pendingUpgrade = {
        ...updatedData,
        _editContext: {
          supplierType: editingSupplierType,
          supplierId: editingSupplier?.id,
          supplierName: editingSupplier?.name || updatedData.supplier?.name,
          originalPrice,
          newPrice
        }
      }
      const upgradeKey = `upgrade_${partyId}_${Date.now()}`
      sessionStorage.setItem(upgradeKey, JSON.stringify(pendingUpgrade))

      // Calculate what changed for display
      const changes = []
      if (updatedData.package?.name !== currentSupplier?.packageData?.name) {
        changes.push({ type: 'package_changed', from: currentSupplier?.packageData?.name, to: updatedData.package?.name })
      }
      if (updatedData.selectedFlavor !== currentSupplier?.selectedFlavor) {
        changes.push({ type: 'cake_flavor_changed', from: currentSupplier?.selectedFlavor, to: updatedData.selectedFlavor })
      }
      if (updatedData.dietaryOption !== currentSupplier?.dietaryOption) {
        changes.push({ type: 'dietary_changed', from: currentSupplier?.dietaryOption, to: updatedData.dietaryOption })
      }

      // Close the edit modal
      setShowEditModal(false)
      setEditingSupplier(null)
      setEditingSupplierType(null)

      // Build redirect URL
      const upgradeParams = new URLSearchParams({
        partyId,
        supplierType: editingSupplierType,
        supplierName: editingSupplier?.name || updatedData.supplier?.name || 'Supplier',
        supplierImage: editingSupplier?.image || editingSupplier?.coverPhoto || '',
        amount: priceDiff.toFixed(2),
        originalPrice: originalPrice.toFixed(2),
        newPrice: newPrice.toFixed(2),
        upgradeKey,
        changes: encodeURIComponent(JSON.stringify(changes))
      })

      router.push(`/payment/upgrade?${upgradeParams.toString()}`)
      return
    }

    // If price decreased, process refund
    if (priceDiff < 0) {
      const refundAmount = Math.abs(priceDiff)
      console.log('💸 Price decreased by £' + refundAmount.toFixed(2) + ' - processing refund')

      let refundProcessed = false

      try {
        const response = await fetch('/api/process-refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partyId,
            supplierId: editingSupplier?.id,
            supplierType: editingSupplierType,
            refundAmount,
            reason: 'booking_downgrade'
          })
        })

        const result = await response.json()

        if (!response.ok) {
          console.error('❌ Refund failed:', result.error)
          toast.error(result.error || 'Failed to process refund', {
            title: 'Refund Error',
            duration: 4000
          })
          // Still proceed with the update - refund can be processed manually
        } else {
          console.log('✅ Refund processed:', result)
          toast.success(`Refund of £${refundAmount.toFixed(2)} processed to your card`, {
            title: 'Refund Processed',
            duration: 4000
          })
          refundProcessed = true
        }
      } catch (error) {
        console.error('❌ Refund error:', error)
        toast.error('Could not process refund - please contact support', {
          title: 'Refund Error',
          duration: 4000
        })
        // Still proceed with the update
      }

      // Store price change info for customer email (sent after update completes)
      updatedData._priceChange = {
        type: 'refund',
        originalPrice,
        newPrice,
        refundAmount,
        refundProcessed
      }
    }

    // Price same or decreased - proceed with save
    await performSupplierUpdate(updatedData)
  }

  // ✅ NEW: Actually perform the supplier update (called after payment or for non-price-increase edits)
  const performSupplierUpdate = async (updatedData) => {
    setIsSavingEdit(true)

    // Extract context from pending data if available (for post-payment updates)
    const editContext = updatedData._editContext
    const priceChange = updatedData._priceChange
    const supplierType = editContext?.supplierType || editingSupplierType
    const supplierInfo = editContext?.supplier || editingSupplier

    // Remove the _editContext and _priceChange from the data before saving
    const { _editContext, _priceChange, ...cleanedData } = updatedData

    console.log('📝 Performing supplier update:', {
      supplierType,
      supplierName: supplierInfo?.name || supplierInfo?.data?.name,
      hasEditContext: !!editContext
    })

    if (!supplierType) {
      console.error('❌ No supplier type available for update!')
      toast.error('Failed to update booking: Missing supplier type', {
        title: 'Error',
        duration: 4000
      })
      setIsSavingEdit(false)
      return
    }

    try {
      // Use the backend function to update the booked supplier
      const result = await partyDatabaseBackend.updateBookedSupplier(
        partyId,
        supplierType,
        cleanedData
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      // Send notification email to supplier for ALL changes
      console.log('📝 Update result:', { changes: result.changes, changeCount: result.changes?.length })

      if (result.changes && result.changes.length > 0) {
        try {
          // Get supplier email from the supplier data - check multiple locations
          // The supplier data structure varies, so we check many paths
          const supplierEmail = supplierInfo?.email ||
                               supplierInfo?.contactEmail ||
                               supplierInfo?.contact_email ||
                               supplierInfo?.data?.email ||
                               supplierInfo?.data?.contactEmail ||
                               supplierInfo?.data?.contact_email ||
                               supplierInfo?.data?.contactInfo?.email ||
                               supplierInfo?.data?.owner?.email ||
                               // Also check in nested supplier object
                               supplierInfo?.supplier?.email ||
                               supplierInfo?.supplier?.contact_email

          console.log('📧 Looking for supplier email:', {
            found: !!supplierEmail,
            email: supplierEmail,
            supplierInfoKeys: Object.keys(supplierInfo || {}),
            dataKeys: Object.keys(supplierInfo?.data || {})
          })

          if (supplierEmail) {
            const response = await fetch('/api/email/booking-updated', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                supplierEmail,
                supplierName: supplierInfo?.name || supplierInfo?.data?.name || 'Supplier',
                customerName: partyData?.parent_first_name || 'Customer',
                childName: partyData?.child_name || 'Child',
                theme: partyData?.theme || 'themed',
                partyDate: partyDetails?.date,
                changes: result.changes,
                dashboardLink: `${window.location.origin}/suppliers/dashboard`
              })
            })
            const emailResult = await response.json()
            console.log('📧 Supplier notification email result:', emailResult)
          } else {
            console.warn('⚠️ No supplier email found - skipping supplier notification. Full supplierInfo:', JSON.stringify(supplierInfo, null, 2))
          }
        } catch (emailError) {
          console.warn('⚠️ Failed to send supplier notification:', emailError)
          // Don't fail the whole operation if email fails
        }
      } else {
        console.log('ℹ️ No changes detected - skipping supplier notification')
      }

      // ✅ Send customer email ONLY for financial changes (upgrade/refund receipts)
      const customerEmail = user?.email || partyData?.email || partyData?.parent_email
      const hasFinancialChange = priceChange && (priceChange.refundProcessed || priceChange.paymentProcessed)

      console.log('📧 Checking customer email conditions:', {
        hasFinancialChange,
        priceChangeType: priceChange?.type,
        refundProcessed: priceChange?.refundProcessed,
        paymentProcessed: priceChange?.paymentProcessed,
        customerEmail
      })

      if (hasFinancialChange && customerEmail) {
        try {
          const emailType = priceChange.refundProcessed ? 'refund' : 'upgrade'

          const emailPayload = {
            customerEmail,
            customerName: partyData?.parent_first_name || 'there',
            childName: partyData?.child_name || 'Child',
            theme: partyData?.theme || 'themed',
            partyDate: partyDetails?.date,
            supplierName: supplierInfo?.name || supplierInfo?.data?.name || 'Supplier',
            supplierType: supplierType,
            previousTotal: priceChange.originalPrice,
            newTotal: priceChange.newPrice,
            changes: result.changes || [],
            type: emailType,
            dashboardLink: `${window.location.origin}/dashboard`
          }

          // Add refund or upgrade specific fields
          if (emailType === 'refund') {
            emailPayload.refundAmount = priceChange.refundAmount
          } else {
            emailPayload.amountPaid = priceChange.amountPaid
          }

          console.log('📧 Sending customer receipt email:', emailPayload)
          const emailResponse = await fetch('/api/email/customer-booking-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
          })
          const emailResult = await emailResponse.json()
          console.log(`📧 Customer ${emailType} receipt response:`, emailResult, 'status:', emailResponse.status)
        } catch (emailError) {
          console.warn(`⚠️ Failed to send customer receipt:`, emailError)
        }
      } else {
        console.log('ℹ️ No financial change - skipping customer receipt email')
      }

      // Refresh party data to show updates
      await refreshPartyData()

      // Show success toast
      const displayName = supplierInfo?.name || supplierInfo?.data?.name || 'Supplier'
      toast.success(`${displayName} has been notified of your changes.`, {
        title: 'Booking Updated',
        duration: 4000
      })

      // Close modals and reset state
      setShowEditModal(false)
      setShowPricePaymentModal(false)
      setEditingSupplier(null)
      setEditingSupplierType(null)
      setPendingEditData(null)
      setOriginalEditPrice(null)

    } catch (error) {
      console.error('❌ Error saving edited supplier:', error)
      toast.error(`Failed to update booking: ${error.message}`, {
        title: 'Error',
        duration: 4000
      })
    } finally {
      setIsSavingEdit(false)
    }
  }

  // ✅ NEW: Handle successful payment for price difference
  const handlePricePaymentSuccess = async (paymentIntent) => {
    console.log('✅ Price difference payment successful:', paymentIntent.id)

    if (pendingEditData) {
      const editContext = pendingEditData._editContext
      const amountPaid = (paymentIntent.amount / 100) // Convert from pence to pounds

      // Store upgrade payment info for customer email (sent after update completes with changes)
      const updatedPendingData = {
        ...pendingEditData,
        _priceChange: {
          type: 'upgrade',
          originalPrice: editContext?.originalPrice || originalEditPrice,
          newPrice: editContext?.newPrice,
          amountPaid: amountPaid,
          paymentProcessed: true
        }
      }

      // Now perform the actual supplier update (which will send the customer email)
      await performSupplierUpdate(updatedPendingData)
    }
  }

  // ✅ NEW: Handle closing payment modal without completing
  const handlePricePaymentClose = () => {
    setShowPricePaymentModal(false)
    // Re-open the edit modal so user can adjust their changes
    if (pendingEditData) {
      setShowEditModal(true)
    }
    setPendingEditData(null)
    setOriginalEditPrice(null)
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

// Helper function to auto-select cake package and defaults based on guest count
const getAutoCakeDefaults = (supplier, guestCount) => {
  const packages = supplier?.packages || supplier?.data?.packages || []
  if (packages.length === 0) return null

  // Helper to parse serving size from strings like "12-15" or "24-28"
  // Returns the minimum value for sorting, and max value for capacity check
  const parseServings = (value) => {
    if (typeof value === 'number') return { min: value, max: value }
    if (!value) return { min: 10, max: 10 }

    const str = String(value).replace(/[^\d-]/g, '') // Remove non-numeric except dash
    const parts = str.split('-').map(n => parseInt(n, 10)).filter(n => !isNaN(n))

    if (parts.length >= 2) {
      return { min: Math.min(...parts), max: Math.max(...parts) }
    } else if (parts.length === 1) {
      return { min: parts[0], max: parts[0] }
    }
    return { min: 10, max: 10 }
  }

  // Find the best package that feeds at least the guest count
  // Sort by minimum serves to find the smallest one that fits
  const sortedPackages = [...packages].sort((a, b) => {
    const aServes = parseServings(a.serves || a.feeds)
    const bServes = parseServings(b.serves || b.feeds)
    return aServes.min - bServes.min
  })

  console.log('🎂 Cake package selection for guest count:', guestCount)
  console.log('🎂 Sorted packages:', sortedPackages.map(p => ({ name: p.name, serves: p.serves, feeds: p.feeds, parsed: parseServings(p.serves || p.feeds) })))

  // Find first package where the MAX serving capacity >= guest count
  // This ensures the cake can definitely feed everyone
  let selectedPackage = sortedPackages.find(pkg => {
    const serves = parseServings(pkg.serves || pkg.feeds)
    return serves.max >= guestCount
  })

  // If no package found, default to the SECOND smallest package (index 1) if available
  // This avoids defaulting to the largest/most expensive package
  if (!selectedPackage) {
    // Try second package (index 1), or first if only 1-2 packages exist
    const fallbackIndex = Math.min(1, sortedPackages.length - 1)
    selectedPackage = sortedPackages[fallbackIndex]
    console.log('🎂 No exact match found, using fallback package at index:', fallbackIndex)
  }

  console.log('🎂 Selected package:', selectedPackage?.name)

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

// In DatabaseDashboard.jsx - REPLACE the handleAddRecommendedSupplier function

const handleAddRecommendedSupplier = async (categoryType, supplier, shouldNavigate = true) => {
  console.log('🎯 Adding recommended supplier...', supplier.name, 'shouldNavigate:', shouldNavigate)

  try {
    // ✅ DON'T add to database yet - just show the confirmation modal
    // This matches the flow when selecting from the supplier modal

    // Close any open modals first
    setShowSupplierModal(false)

    // Auto-select cake defaults if it's a cake supplier without packageData
    let packageData = supplier.packageData || null
    const isCakeSupplier = categoryType === 'cakes' ||
      supplier?.category?.toLowerCase().includes('cake')

    if (isCakeSupplier && !packageData) {
      const guestCount = partyDetails?.guestCount || 15
      packageData = getAutoCakeDefaults(supplier, guestCount)
      console.log('🎂 Auto-selected cake defaults:', { guestCount, packageData })
    }

    // Prepare the supplier data for the confirmation modal
    const supplierData = {
      supplier: supplier,
      selectedPackage: packageData  // Must be 'selectedPackage' to match SupplierAddedConfirmationModal prop
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

// Handler for Add tab - adds supplier directly without showing confirmation modal
// After customization modal completes, supplier is added directly to cart
// Note: MissingSuppliersSuggestions swaps the parameter order, so we receive (supplier, categoryType)
const handleAddSupplierDirect = async (supplier, categoryType) => {
  console.log('🛒 Adding supplier directly to cart...', supplier?.name, 'category:', categoryType)

  try {
    // Get package data from supplier (set by customization modal)
    const selectedPackage = supplier.packageData || supplier.selectedPackage || null

    // Add supplier to party database
    const addResult = await partyDatabaseBackend.addSupplierToParty(
      partyId,
      supplier,
      selectedPackage
    )

    if (!addResult.success) {
      throw new Error(addResult.error)
    }

    // Send enquiry/booking
    const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
      partyId,
      supplier,
      selectedPackage,
      `Booking confirmed for ${supplier.name}`
    )

    if (!enquiryResult.success) {
      console.error('Booking notification failed but supplier was added:', enquiryResult.error)
    } else if (enquiryResult.enquiry?.id) {
      // Auto-accept the enquiry so it shows in cart immediately
      // Use the proper function which sets status, payment_status, and other fields
      console.log('🎯 Auto-accepting enquiry:', enquiryResult.enquiry.id)
      const acceptResult = await partyDatabaseBackend.autoAcceptSpecificEnquiry(enquiryResult.enquiry.id)

      if (!acceptResult.success) {
        console.error('Failed to auto-accept enquiry:', acceptResult.error)
      } else {
        console.log('✅ Enquiry auto-accepted:', acceptResult.enquiry)
      }
    } else {
      console.warn('⚠️ No enquiry ID returned from sendIndividualEnquiry:', enquiryResult)
    }

    // Refresh party data AND enquiries (enquiries are separate from party data)
    await refreshPartyData()
    await refreshEnquiries()

    // Manually update sessionStorage cart data immediately
    // This ensures the cart icon appears right away without waiting for React re-render
    const price = selectedPackage?.totalPrice || selectedPackage?.price || supplier.price || 0
    const depositAmount = Math.max(50, Math.round(price * 0.3))

    // Get existing cart data and add the new supplier
    let existingCart = { suppliers: [], totalDeposit: 0 }
    try {
      const stored = sessionStorage.getItem('cartData')
      if (stored) {
        existingCart = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error reading cart data:', e)
    }

    // Add new supplier to cart
    const newSupplier = {
      type: categoryType,
      name: supplier.name,
      totalAmount: price,
      depositAmount: depositAmount,
      enquiryId: enquiryResult?.enquiry?.id
    }

    const updatedSuppliers = [...(existingCart.suppliers || []), newSupplier]
    const updatedTotalDeposit = updatedSuppliers.reduce((sum, s) => sum + (s.depositAmount || 0), 0)

    sessionStorage.setItem('cartData', JSON.stringify({
      suppliers: updatedSuppliers,
      totalDeposit: updatedTotalDeposit,
      supplierCount: updatedSuppliers.length,
      timestamp: Date.now()
    }))

    // Show success toast
    const categoryName = categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
    toast.success(`${supplier.name} added to your party! Check the cart to complete payment.`, {
      title: `${categoryName} Added`,
      duration: 4000
    })

    return true
  } catch (error) {
    console.error('💥 Error adding supplier directly:', error)
    toast.error(`Failed to add ${supplier.name}. Please try again.`, {
      title: 'Error',
      duration: 4000
    })
    return false
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

        {/* Edit Booked Supplier Modal */}
        {showEditModal && editingSupplier && (
          <SupplierCustomizationModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingSupplier(null)
              setEditingSupplierType(null)
            }}
            supplier={editingSupplier}
            onAddToPlan={() => {}} // Not used in edit mode
            mode="edit"
            onSaveChanges={handleSaveEditedSupplier}
            originalTotalPrice={editingSupplier?.totalPrice || editingSupplier?.price || 0}
            isAdding={isSavingEdit}
            partyDate={partyDetails?.date}
            partyDetails={partyDetails}
            databasePartyData={partyData}
            userType="DATABASE_USER"
            supplierType={editingSupplierType}
          />
        )}

        {/* Price Difference Payment Modal */}
        {showPricePaymentModal && pendingEditData && (
          <PriceDifferencePaymentModal
            isOpen={showPricePaymentModal}
            onClose={handlePricePaymentClose}
            amount={pendingEditData.totalPrice - (originalEditPrice || 0)}
            partyId={partyId}
            supplierType={editingSupplierType}
            supplierName={editingSupplier?.name || editingSupplier?.data?.name || 'Supplier'}
            onPaymentSuccess={handlePricePaymentSuccess}
            originalPrice={originalEditPrice || 0}
            newPrice={pendingEditData.totalPrice || 0}
          />
        )}

        {partyId && (
          <ReplacementManager
            replacements={replacements}
            isProcessingRejection={isProcessingRejection}
            onApproveReplacement={handleApproveReplacement}
            onViewSupplier={handleViewSupplier}
            onDismiss={handleDismissReplacement}
          />
        )}

        {/* NEW TABBED LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          {/* Main content with tabs - takes 3 columns */}
          <main className="lg:col-span-3">
            <DashboardTabs
              completedSteps={(() => {
                let completed = 0
                // Step 1: Has at least one supplier
                if (Object.values(visibleSuppliers).some(s => s)) completed++
                // Step 2: All suppliers confirmed
                const allConfirmed = enquiries.length > 0 && enquiries.every(e => e.status === 'accepted')
                if (allConfirmed) completed++
                // Step 3: Payment made
                if (isPaymentConfirmed) completed++
                // Step 4: Guest list created
                if (partyToolsData?.guestList?.length > 0) completed++
                // Step 5: E-invites created
                if (partyToolsData?.einvites) completed++
                // Step 6: Registry created
                if (partyToolsData?.giftRegistry) completed++
                // Step 7: Day of party
                const partyDate = new Date(partyDetails?.date)
                if (partyDate <= new Date()) completed++
                return completed
              })()}
              totalSteps={7}
              isPaymentConfirmed={isPaymentConfirmed}

              journeyContent={
                <JourneyTabContent
                  partyPhase={partyPhase}
                  visibleSuppliers={visibleSuppliers}
                  enquiries={enquiries}
                  partyData={partyData}
                  paymentDetails={paymentDetails}
                  partyDetails={partyDetails}
                  partyId={partyId}
                  hasCreatedInvites={partyData?.einvites?.status === 'completed'}
                  onPaymentReady={handlePaymentReady}
                  onCreateInvites={handleCreateInvites}
                  onAddSupplier={openSupplierModal}
                  onRemoveSupplier={handleDeleteSupplier}
                  loadingCards={loadingCards}
                  getSupplierDisplayName={getSupplierDisplayName}
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
                  onEditSupplier={handleEditSupplier}
                  partyDate={partyDetails?.date}
                />
              }

              myPlanContent={
                <MyPlanTabContent
                  visibleSuppliers={visibleSuppliers}
                  enquiries={enquiries}
                  addons={addons}
                  partyDetails={partyDetails}
                  handleCancelEnquiry={handleCancelEnquiry}
                  handleEditSupplier={handleEditSupplier}
                />
              }

              addContent={
                <AddTabContent
                  suppliers={visibleSuppliers}
                  partyDetails={partyDetails}
                  onAddSupplier={handleAddSupplierDirect}
                />
              }

              guestsContent={
                <GuestsTabContent
                  partyToolsData={partyToolsData}
                  partyToolsKey={partyToolsKey}
                  partyId={partyId}
                  partyDetails={partyDetails}
                  enquiries={enquiries}
                  visibleSuppliers={visibleSuppliers}
                />
              }

              timelineContent={
                <TimelineTabContent
                  partyDetails={partyDetails}
                  visibleSuppliers={visibleSuppliers}
                />
              }

              moreContent={
                <MoreTabContent
                  setShowChecklistModal={setShowChecklistModal}
                  visibleSuppliers={visibleSuppliers}
                  enquiries={enquiries}
                  partyDetails={partyDetails}
                />
              }

              notifications={{
                guests: partyToolsData?.guestList?.length || 0,
              }}

              defaultTab="journey"
              controlledActiveTab={activeDashboardTab}
              onTabChange={setActiveDashboardTab}
            />
          </main>

          {/* Simplified Sidebar - 1 column, desktop only */}
          <aside className="hidden lg:block">
            <SimplifiedSidebar
              partyData={partyData}
              isPaymentConfirmed={isPaymentConfirmed}
              budgetControlProps={{
                totalSpent: enhancedTotalCost,
              }}
            />
          </aside>
        </div>

        {/* Mobile Sidebar Content - shows below tabs on mobile/tablet */}
        <div className="lg:hidden px-4 pb-8 space-y-4">
          {/* Budget/Party Total - only show before payment is confirmed */}
          {!isPaymentConfirmed && (
            <BudgetControls totalSpent={enhancedTotalCost} />
          )}

          {/* Refer a Friend */}
          <ReferFriend />

          {/* Support Widget */}
          <SupportWidget />
        </div>
      </div>


      <WelcomeDashboardPopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        partyTheme={partyDetails?.theme}
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