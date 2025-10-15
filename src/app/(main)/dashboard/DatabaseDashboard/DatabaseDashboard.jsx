// DatabaseDashboard.jsx - UPDATED with unified pricing system
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useSearchParams, useRouter } from "next/navigation"
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
import BookingConfirmedBanner from "./components/BookingConfirmedBanner"
import MobileBottomTabBar from "./components/MobileBottomTabBar"
import useDisableScroll from "@/hooks/useDisableScroll"
import { useChatNotifications } from '../hooks/useChatNotifications'

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
const [recommendedSuppliers, setRecommendedSuppliers] = useState({})
const [recommendationsLoaded, setRecommendationsLoaded] = useState(false)
const [loadingCards, setLoadingCards] = useState([])
const [activeBottomTabModal, setActiveBottomTabModal] = useState(null)
  const welcomePopupShownRef = useRef(false)

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
  
      // Check if pricing has already been enhanced
      let supplierCost = 0;
  
      if (supplier.enhancedPrice && supplier.originalPrice) {
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
      return isAccepted && isUnpaid
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

  const handleModalSendEnquiry = async (supplier, selectedPackage, partyId) => {
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
      
      const currentUrl = new URL(window.location)
      currentUrl.searchParams.set('enquiry_sent', 'true')
      currentUrl.searchParams.set('supplier_name', encodeURIComponent(supplier.name))
      router.push(currentUrl.toString())
      
    } catch (error) {
      console.error('CRITICAL ERROR in handleModalSendEnquiry:', error)
      setEnquiryFeedback(`Failed to add ${supplier.name}: ${error.message}`)
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
  const handlePaymentReady = () => router.push(`/payment/secure-party?party_id=${partyId}`)
  const handleCreateInvites = () => window.location.href = "/e-invites/create"

  const handleNotificationClick = () => {
    markMessagesAsRead() // Mark as read
    router.push('/party-summary#supplier-messages') // Navigate to chat
  }

  // Add these helper functions before your event handlers section

const getRecommendedSupplierForType = (categoryType) => {
  console.log('🔍 Getting recommended supplier for:', categoryType)
  console.log('📦 Available recommendations:', recommendedSuppliers)
  return recommendedSuppliers[categoryType] || null
}

// In DatabaseDashboard.jsx - REPLACE the handleAddRecommendedSupplier function

const handleAddRecommendedSupplier = async (categoryType, supplier) => {
  console.log('🎯 Adding recommended supplier...', supplier.name)
  
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
    
    // Update the active mobile tab
    setActiveMobileSupplierType(categoryType)
    
  } catch (error) {
    console.error('💥 Error:', error)
    setEnquiryFeedback(`Failed to add ${supplier.name}: ${error.message}`)
  }
}

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
    <div className="min-h-screen bg-primary-50 w-screen overflow-hidden">
      <ContextualBreadcrumb currentPage="dashboard"/>


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
      
      <BookingConfirmedBanner 
        suppliers={visibleSuppliers}
        enquiries={enquiries}
        paymentDetails={{
          depositAmount: enhancedTotalCost * 0.2, // Use enhancedTotalCost
          remainingBalance: enhancedTotalCost * 0.8 // Use enhancedTotalCost
        }}
      />
      <EnquirySuccessBanner 
        partyId={partyId}
      />
      
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
      />
      
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
        <DatabasePartyHeader 
          theme={partyTheme}
          partyDetails={partyDetails}
          currentParty={currentParty}
          dataSource="database"
          enquiries={enquiries}
          unreadCount={unreadCount}
          hasNewMessages={hasNewMessages}
          onNotificationClick={handleNotificationClick}
          loading={loading} // ✅ ADD THIS LINE
        />

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
  <PartyPhaseContent
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
  />
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
            AddSuppliersSection={addSuppliersSection} // ✅ ADD THIS
          />
        </div>
      </div>

      <WelcomeDashboardPopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
      />
      

{!showSupplierModal && (
  <MobileBottomTabBar
    suppliers={visibleSuppliers}
    enquiries={enquiries}
    totalCost={enhancedTotalCost}
    timeRemaining={24}
    partyDetails={partyDetails}
    partyData={partyData} // ✅ ADD THIS
    // ✅ SIMPLE: Just pass the component
    getSupplierDisplayName={getSupplierDisplayName}
    getSupplierDisplayPricing={getSupplierDisplayPricing}
    AddSuppliersSection={addSuppliersSection}
    ProgressWidget={
      <SnappysPresentParty
        suppliers={visibleSuppliers}
        enquiries={enquiries}
        timeRemaining={24}
        onPaymentReady={handlePaymentReady}
        showPaymentCTA={true}
        isPaymentComplete={isPaymentConfirmed}
        totalOutstandingCost={outstandingData.totalDeposit}
        outstandingSuppliers={outstandingData.suppliers.map(s => s.type)}
      />
    }
    CountdownWidget={
      <CountdownWidget
        partyDate={partyDetails?.date}
      />
    }
  />
)}
    </div>
  )
}