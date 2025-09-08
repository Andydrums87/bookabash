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

// Icons
import { RefreshCw, ChevronRight, Plus } from "lucide-react"

// Custom Components
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import EnquirySuccessBanner from "@/components/enquirySuccessBanner"
import LocalStoragePartyHeader from "../components/ui/LocalStoragePartyHeader"
import CountdownWidget from "../components/ui/CountdownWidget"
import PartyExcitementMeter from "../components/ui/PartyExcitementMeter"
import DeleteConfirmDialog from "../components/Dialogs/DeleteConfirmDialog"

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
import SimpleMobileBottomTabBar from "../components/SimpleMobileBottomBar"
import PartySummarySection from "../components/PartySummarySection"

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

  
  // Refs for tracking
  const welcomePopupShownRef = useRef(false)
  const confettiTriggeredRef = useRef(false)

  // Welcome popup state
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeJustCompleted, setWelcomeJustCompleted] = useState(false)
  const [isTourActiveOnNavigation, setIsTourActiveOnNavigation] = useState(false)

  // General state
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState(null)
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
  const [activeMobileSupplierType, setActiveMobileSupplierType] = useState('venue')


  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    category: '',
    theme: '',
    date: null,
    filters: {}
  })
  // Debug state (remove in production)
  const [debugInfo, setDebugInfo] = useState({})


  useDisableScroll([showSupplierModal, showWelcomePopup, showSupplierModal])

  const handleMobileNavigationStepActive = (isActive) => {
    console.log('Dashboard received mobile nav step active:', isActive)
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
    console.log('🔧 Dashboard: Component mounted')
  }, [])

  // Hooks - only run after mounting
  const {
    partyPlan, 
    loading: planLoading, 
    error: planError, 
    totalCost, 
    addons,
    removeSupplier,
    addAddon,
    removeAddon,
    addSupplier,
    hasAddon,
    removeAddonFromSupplier,
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

  // ✅ PRODUCTION SAFE: Welcome popup detection with one-time-only logic
  useEffect(() => {
    if (!isMounted || !isClient) {
      console.log('⏸️ Dashboard: Waiting for client-side mount...')
      return
    }

    console.log('🔍 Dashboard: Starting welcome popup detection...')
    
    try {
      // Check URL parameters
      const showWelcomeFromURL = searchParams.get("show_welcome") === "true"
      const sourceFromURL = searchParams.get("source")
      const timestampFromURL = searchParams.get("t")
      
      console.log('📊 URL Check:', { showWelcomeFromURL, sourceFromURL, timestampFromURL })

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
        
        showWelcomeFlag = showWelcomeRaw === 'true' || redirectWelcome === 'true'
        
        console.log('💾 LocalStorage Check:', {
          welcomeTrigger: !!welcomeTrigger,
          partyDetails: !!partyDetailsData,
          showWelcomeFlag,
          partyJustCreated: !!partyJustCreated,
          redirectWelcome: !!redirectWelcome,
          welcomeCompleted // ✅ NEW: Log completion status
        })

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
      
      console.log('🎯 Welcome popup decision:', {
        showWelcomeFromURL,
        welcomeTriggerFlag: welcomeTrigger?.shouldShowWelcome,
        showWelcomeFlag,
        hasPartyData,
        welcomeCompleted, // ✅ NEW: Log completion status
        alreadyShown: welcomePopupShownRef.current,
        finalDecision: shouldShowWelcome
      })
      
      if (shouldShowWelcome) {
        console.log('🎉 SHOWING WELCOME POPUP!')
        
        // Use setTimeout for production safety
        setTimeout(() => {
          setShowWelcomePopup(true)
          welcomePopupShownRef.current = true
        }, 200)

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
          console.log('🧹 Cleaned up welcome triggers')
        } catch (cleanupError) {
          console.warn('⚠️ Cleanup error:', cleanupError)
        }
      } else {
        console.log('❌ NOT showing welcome popup', welcomeCompleted ? '(already completed)' : '')
      }
      
    } catch (error) {
      console.error('💥 Welcome popup detection error:', error)
    }
  }, [isMounted, isClient, searchParams, router])

  // ✅ PRODUCTION SAFE: Confetti effect
  useEffect(() => {
    if (welcomeJustCompleted && !showWelcomePopup && !confettiTriggeredRef.current && isMounted) {
      console.log('🎊 Triggering confetti celebration!')
      
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
      // Check URL parameters for scroll hints
      const scrollToSupplier = searchParams.get('scrollTo')
      const lastAction = searchParams.get('action') 
      const fromPage = searchParams.get('from')
      const source = searchParams.get('source')
      
      console.log('📍 Unified scroll management check:', { 
        scrollToSupplier, 
        lastAction, 
        fromPage, 
        source,
        showWelcomePopup,
        activeMobileSupplierType
      })

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
        console.log('⏸️ Welcome popup is showing, scroll will be handled after close')
        return
      }

      if (scrollToSupplier && lastAction === 'supplier-added') {
        console.log(`🎯 Supplier added - handling navigation to: ${scrollToSupplier}`)
        
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
            console.log(`🖥️ Desktop: Scrolling to supplier-${scrollToSupplier}`)
            desktopElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            })
          } else {
            // Mobile: Scroll to mobile content area
            const mobileContent = document.getElementById('mobile-supplier-content')
            if (mobileContent) {
              console.log(`📱 Mobile: Scrolling to mobile content area`)
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
}, [isMounted, isClient, searchParams, router, showWelcomePopup, activeMobileSupplierType])

// 3. ✅ WELCOME POPUP: Handle scroll after welcome popup closes
useEffect(() => {
  if (!showWelcomePopup && isMounted && isClient) {
    const scrollToSupplier = searchParams.get('scrollTo')
    const lastAction = searchParams.get('action')
    
    if (scrollToSupplier && lastAction === 'supplier-added') {
      console.log('🎉 Welcome popup closed, handling delayed scroll to:', scrollToSupplier)
      
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

// 4. ✅ SAFETY NET: Global scroll unlock effect
useEffect(() => {
  const unlockScroll = () => {
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

const handleNameSubmit = (nameData) => {
  console.log('🎉 Welcome form completed:', nameData)
  
  try {
    if (typeof originalHandleNameSubmit === 'function') {
      originalHandleNameSubmit(nameData)
    }
    
    setWelcomeJustCompleted(true)
    
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
        console.log('📝 Updated party details with welcome data and completion flag')
      }
      
      console.log('✅ Welcome completion flags set - popup will not show again')
      
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
    console.log('🔓 Opening supplier modal:', { category, theme })
    
    // Map frontend category to backend supplier type
    const supplierTypeMapping = {
      venue: 'Venues',
      entertainment: 'Entertainment', 
      catering: 'Catering',
      cakes: 'Cakes',              // 🎂 Now searches for "Cakes" supplier type
      facePainting: 'Face Painting',
      activities: 'Activities',
      decorations: 'Decorations',
      // ... others
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
      
      console.log('✅ Scroll cleanup completed')
    }, 50)
  }

  const handleSupplierSelection = async (supplierData) => {
    console.log('Supplier selected:', supplierData)
    
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
          'Bouncy Castle': 'bouncyCastle'
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
        console.log('🔄 Restoring modal state:', storedState)
        
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
        console.log('🎯 Restoring modal via custom event:', modalState)
        
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
    console.log('🎯 Addon clicked:', addon)
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
      console.log('🔍 Addon already exists, returning early')
      return
    }
    
    try {
      const finalSupplierId = addon.supplierId || supplierId
      const finalSupplierName = addon.supplierName || (finalSupplierId ? suppliers[finalSupplierId]?.name : 'General')
      
      const addonWithSupplier = {
        ...addon,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        attachedToSupplier: !!finalSupplierId,
        isSupplierAddon: !!finalSupplierId,
        addedAt: new Date().toISOString()
      }
      
      console.log('🔧 Adding addon:', addonWithSupplier)
      
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
      console.log('🗑️ Removing addon:', addonId)
      
      let result = await removeAddon(addonId)
      
      if (!result.success) {
        const supplierTypes = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons']
        
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

  // Create suppliers object
  const suppliers = {
    venue: partyPlan.venue || null,
    entertainment: partyPlan.entertainment || null,
    catering: partyPlan.catering || null,
    facePainting: partyPlan.facePainting || null,
    activities: partyPlan.activities || null,
    partyBags: partyPlan.partyBags || null,
    decorations: partyPlan.decorations || null,
    balloons: partyPlan.balloons || null,
    cakes: partyPlan.cakes || null,        // 🎂 Just add this line

  }

  const enhancedTotalCost = useMemo(() => {
    let total = 0;
  
    // Calculate each supplier's cost using ALWAYS FRESH pricing
    Object.entries(suppliers).forEach(([type, supplier]) => {
      if (!supplier) return;
  
      // Get addons for this specific supplier
      const supplierAddons = addons.filter(addon => 
        addon.supplierId === supplier.id || 
        addon.supplierType === type ||
        addon.attachedToSupplier === type
      );
  
      // FIXED: ALWAYS calculate fresh pricing - never use pre-enhanced values
      console.log('📊 Dashboard Total: ALWAYS calculating fresh pricing for', supplier.name);
      const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
      const supplierCost = pricing.finalPrice;
  
      total += supplierCost;
      
      console.log('📊 Dashboard Total: Added supplier', supplier.name, 'cost:', supplierCost);
    });
  
    // Add standalone addons (not attached to any supplier)
    const standaloneAddons = addons.filter(addon => 
      !addon.supplierId && !addon.supplierType && !addon.attachedToSupplier
    );
    const standaloneAddonsTotal = standaloneAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    total += standaloneAddonsTotal;
  
    console.log('📊 Dashboard Total: Final calculated total:', total);
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
    console.log('🔄 Mobile tab changed to:', supplierType)
    setActiveMobileSupplierType(supplierType)
    
    // Always ensure scroll is unlocked when changing tabs
    setTimeout(() => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.classList.remove('modal-open', 'overflow-hidden')
    }, 50)
  }

  const handlePartyRebuilt = (rebuildResults) => {
    console.log('Party rebuild result:', rebuildResults)
    
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
      console.log('Replacements applied:', rebuildResults.replacements)
      
      // Update localStorage with new party plan
      if (rebuildResults.partyPlan) {
        localStorage.setItem('user_party_plan', JSON.stringify(rebuildResults.partyPlan))
      }
      
      // Show success message
      toast.success(`Party updated with ${rebuildResults.totalReplaceable} replacement supplier${rebuildResults.totalReplaceable !== 1 ? 's' : ''}`)
    }
  }

  return (
    <div className={`${showWelcomePopup ? "blur-sm opacity-50" : ""} min-h-screen overflow-hidden`}>
      <ContextualBreadcrumb currentPage="dashboard"/>
      <EnquirySuccessBanner />
      
  

      <AddonProvider
        addAddon={handleAddAddon}
        removeAddon={handleRemoveAddon}
        hasAddon={hasAddon}
        addons={addons}
      >
        <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
          <div data-tour="party-header">
          <LocalStoragePartyHeader 
  theme={partyTheme}
  partyDetails={partyDetails}
  onPartyDetailsChange={handlePartyDetailsUpdate}
  suppliers={suppliers}
  onPartyRebuilt={handlePartyRebuilt}
/>
           
          </div>
      

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <main className="lg:col-span-2 space-y-8">
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
                      Meet Your Party Team!
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                      Snappy's picked the best suppliers for your big day 
                    </p>
                  </div>
                 
                </div>
     
                <Button onClick={handleAddSupplier} variant="outline" className="flex gap-2 text-primary border-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </Button>
              </div>

              {/* Supplier Grid */}
              <div className="w-full">
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-6" >
   
{Object.entries(suppliers).map(([type, supplier]) => {
  // Get addons for this specific supplier
  const supplierAddons = addons.filter(addon => 
    addon.supplierId === supplier?.id || 
    addon.supplierType === type ||
    addon.attachedToSupplier === type
  );
  
  return (
    <SupplierCard 
      key={type}
      type={type} 
      supplier={supplier}
      loadingCards={loadingCards}
      suppliersToDelete={suppliersToDelete}
      openSupplierModal={openSupplierModal}
      handleDeleteSupplier={handleDeleteSupplier}
      getSupplierDisplayName={getSupplierDisplayName}
      addons={supplierAddons} // ✅ Pass specific addons
      handleRemoveAddon={handleRemoveAddon}
      enquiryStatus={getEnquiryStatus(type)}
      enquirySentAt={getEnquiryTimestamp(type)}
      isSignedIn={false}
      isPaymentConfirmed={false}
      enquiries={[]}
      partyDetails={partyDetails} // ✅ Ensure this is passed
      currentPhase="planning"
      enhancedPricing={supplier ? getSupplierDisplayPricing(supplier, partyDetails, supplierAddons) : null}
    />
  )
})}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden" >
   
                <MobileSupplierNavigation
    suppliers={suppliers}
    loadingCards={loadingCards}
    partyDetails={partyDetails}
    // NEW: Add this function to calculate pricing
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
    // NEW PROPS:
    activeSupplierType={activeMobileSupplierType}
    onSupplierTabChange={handleMobileSupplierTabChange}
    isTourActiveOnNavigation={isTourActiveOnNavigation}
  
  />
                </div>
              </div>
 
              <div className="md:block hidden">
                <AddonsSectionWrapper suppliers={suppliers} />
              </div>
              
              <div className="md:block hidden w-screen pr-6 md:pr-20">
                <RecommendedAddonsWrapper 
                  context="dashboard" 
                  maxItems={4}
                  onAddonClick={handleAddonClick}
                />
              </div>
              
              {/* <PartySummarySection
  partyDetails={partyDetails}
  suppliers={suppliers}
  totalCost={totalCost}
  addons={addons}
/> */}

              {/* Action Section */}
              <div className="flex flex-col sm:flex-row gap-4"  data-tour="review-book">
                <Button
                  className="flex-3 bg-teal-500 animate-pulse rounded-full hover:bg-[hsl(var(--primary-600))] text-primary-foreground py-4 text-xl font-bold"
                  asChild
                >
                  <Link href="/review-book">Let's Make This happen!</Link>
                </Button>
              
                <Button variant="ghost" className="sm:w-auto">
                  Get Help
                </Button>
              </div>
              
              <div className="md:hidden block">
                <ReferFriend />
              </div>
            </main>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
            <div data-tour="budget-tracker">
                <BudgetControls {...budgetControlProps} />
              </div>
              <CountdownWidget partyDate={partyDetails?.date} />
              <ReferFriend />
            </aside>
          </div>
        </div>
      </AddonProvider>

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

      {/* ✅ PRODUCTION SAFE: Welcome Popup */}
      {isMounted && (
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
  <SimpleMobileBottomTabBar
  suppliers={suppliers}
  partyDetails={partyDetails}
  addons={addons} // ✅ ADD THIS LINE
  tempBudget={tempBudget}
  budgetPercentage={budgetPercentage}
  getBudgetCategory={getBudgetCategory}
  CountdownWidget={
    <CountdownWidget
      partyDate={partyDetails?.date}
    />
  }
/>
      <SnappyDashboardTour
        isOpen={isTourActive}
        onMobileNavigationStepActive={handleMobileNavigationStepActive} 
        onClose={closeTour}
        onComplete={completeTour}
        suppliers={suppliers} // Add this
        partyDetails={partyDetails} // Add this  
        totalCost={totalCost} // Add this
      />
    </div>
  )
}