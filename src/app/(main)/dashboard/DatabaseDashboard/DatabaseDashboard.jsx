// DatabaseDashboard.jsx - Updated with modal restoration functionality
"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useSearchParams, useRouter } from "next/navigation"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Hooks
import { usePartyData } from '../hooks/usePartyData'
import { useReplacementManager } from '../hooks/useReplacementManager'
import { usePartyPhase } from '../hooks/usePartyPhase'
import { useContextualNavigation } from '@/hooks/useContextualNavigation' // ✅ Already imported
import { usePartyDetails } from "../hooks/usePartyDetails"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import { useBudgetManager } from "../hooks/useBudgetManager"
import { useSupplierManager } from "../hooks/useSupplierManager"
import BookingConfirmedBanner from "./components/BookingConfirmedBanner"
import MobileBottomTabBar from "./components/MobileBottomTabBar"
import useDisableScroll from "@/hooks/useDisableScroll"

// Layout Components
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import EnquirySuccessBanner from "@/components/enquirySuccessBanner"
import EInvitesBanner from "../components/ui/EInvitesBanner"
import PartyHeader from "../components/ui/PartyHeader"
import CountdownWidget from "../components/ui/CountdownWidget"

// Feature Components
import ReplacementManager from './components/ReplacementManager'
import SupplierGrid from '../components/SupplierGrid'
import PartyPhaseContent from '../components/PartyPhaseContent'
import Sidebar from './components/Sidebar'
import SnappysPresentParty from "./components/SnappysPresentParty"
import SupplierAddedConfirmationModal from "./components/SupplierAddedConfirmationModal"


// Modals
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"


export default function DatabaseDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext, getStoredModalState, clearModalState } = useContextualNavigation() // ✅ Already available

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
// Add this state variable at the top with your other state declarations:
const [isClient, setIsClient] = useState(false)

// Add this useEffect to detect client-side mounting (add near the top of your component):
useEffect(() => {
  setIsClient(typeof window !== 'undefined')
}, [])

  // MAIN PARTY DATA HOOK
  const {
    partyData,
    partyId,
    totalCost,
    addons,
    loading,
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

  const {
    partyPhase,
    currentPhase,
    visibleSuppliers,
    hasEnquiriesPending,
    enquiries,
    isPaymentConfirmed,
    paymentDetails,
    loading: phaseLoading
  } = usePartyPhase(partyData, partyId)



  // ✅ MODAL STATE - Updated with restoration support
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    category: '',
    theme: '',
    date: null,
    filters: {}
  })

  // ✅ ENHANCED MODAL HANDLERS - Same as localStorage dashboard
  const openSupplierModal = (category, theme = 'superhero') => {
    console.log('🔓 Opening supplier modal:', { category, theme, currentPhase })
    
    setModalConfig({
      category,
      theme,
      date: partyDetails?.date,
      filters: {}
    })
    setShowSupplierModal(true)
  }

  const closeSupplierModal = () => {
    console.log('🔒 Closing supplier modal')
    setShowSupplierModal(false)
    clearModalState() // ✅ Clear modal state when closing
  }

  // ✅ MODAL RESTORATION EFFECT - Same as localStorage dashboard
  useEffect(() => {
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
  }, [searchParams, getStoredModalState, clearModalState])

  // ✅ CUSTOM EVENT LISTENER - Same as localStorage dashboard
  useEffect(() => {
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
  }, [])

  

  // Clean, separate functions for supplier selection
  const handleSupplierSelection = async (supplierData) => {
    const supplier = supplierData?.supplier || supplierData
    const selectedPackage = supplierData?.package || null
    
    if (!supplier) {
      console.error('❌ No supplier data provided')
      return
    }
    
    try {
      console.log('✅ Using Quick Add flow - show confirmation modal first')
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
      console.error('💥 Error in supplier selection:', error)
      setEnquiryFeedback(`❌ Failed to process ${supplier.name}: ${error.message}`)
    }
  }

  const handleNormalSupplierAddition = async (supplier, selectedPackage) => {
    console.log('📝 Quick Add for:', supplier.name, '- showing confirmation modal first')
    
    // DON'T add supplier to party plan yet - just show confirmation modal
    // Only add when user confirms in modal
    setAddedSupplierData({ supplier, selectedPackage })
    setShowSupplierAddedModal(true)
    closeSupplierModal() // ✅ This will now properly clear modal state
    setEnquiryFeedback(null)
  }

  const handleAutoEnquiryAddition = async (supplier, selectedPackage) => {
    console.log('🔄 Starting auto-enquiry addition for:', supplier.name)
    
    setSendingEnquiry(true)
    setEnquiryFeedback('Adding supplier and sending enquiry...')
    
    try {
      // Step 1: Add supplier to party plan
      console.log('📝 Adding supplier to party plan...')
      const addResult = await partyDatabaseBackend.addSupplierToParty(
        partyId, 
        supplier, 
        selectedPackage
      )

      if (!addResult.success) {
        throw new Error(addResult.error)
      }

      console.log('✅ Supplier added to party plan')

      // Step 2: Immediately send enquiry (no modal)
      console.log('📧 Auto-sending enquiry...')
      const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
        partyId,
        supplier,
        selectedPackage,
        `Added to expand party team for ${partyDetails?.child_name || 'child'}'s party`
      )

      if (enquiryResult.success) {
        console.log('✅ Auto-enquiry sent successfully')
        
        // ✅ ADD THIS: Set URL parameters for success banner
        const currentUrl = new URL(window.location)
        currentUrl.searchParams.set('enquiry_sent', 'true')
        currentUrl.searchParams.set('enquiry_count', '1')
        
        // Step 3: Refresh data
        await refreshPartyData()
        
        // Close modal first, then navigate with success params
        closeSupplierModal()
        setEnquiryFeedback(null)
        
        // Navigate with success parameters
        router.push(currentUrl.toString())
        
      } else {
        console.error('❌ Failed to send auto-enquiry:', enquiryResult.error)
        setEnquiryFeedback(`⚠️ ${supplier.name} added, but enquiry failed to send`)
      }

    } catch (error) {
      console.error('💥 Error in auto-enquiry addition:', error)
      setEnquiryFeedback(`❌ Failed to add ${supplier.name}: ${error.message}`)
    } finally {
      setSendingEnquiry(false)
    }
  }


  const handleMobileSupplierTabChange = (supplierType) => {
    console.log('Mobile tab changed to:', supplierType)
    setActiveMobileSupplierType(supplierType)
    
    setTimeout(() => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.classList.remove('modal-open', 'overflow-hidden')
    }, 50)
  }
  
  // Early return with specific error message if party ID is missing
  if (!loading && isSignedIn && !partyId) {
    console.error('❌ CRITICAL: User is signed in but no party ID found!')
    
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Party Found
          </h2>
          <p className="text-gray-600 mb-4">
            You're signed in but we couldn't find your party data. This might be because:
          </p>
          <ul className="text-sm text-gray-500 text-left mb-6">
            <li>• You haven't created a party yet</li>
            <li>• Your party wasn't saved properly</li>
            <li>• There's a database connection issue</li>
          </ul>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/party-builder')}
              className="bg-primary text-white px-4 py-2 rounded-lg w-full"
            >
              Create New Party
            </button>
            <button 
              onClick={() => {
                console.log('🔄 Forcing data refresh...')
                window.location.reload()
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Budget management
  const {
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    updateSuppliersForBudget
  } = useBudgetManager(totalCost, isUpdating, setIsUpdating)

  // Fix the useReplacementManager call with all required parameters
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

  // Supplier management
  const removeSupplier = async (supplierType) => {
    if (!partyId) {
      console.error('❌ Cannot remove supplier: No party ID')
      return { success: false, error: 'No party ID available' }
    }
    
    const result = await partyDatabaseBackend.removeSupplierFromParty(partyId, supplierType)
    if (result.success) {
      refreshPartyData()
      return { success: true }
    }
    return result
  }

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

  const {
    handleDeleteSupplier,
    getSupplierDisplayName,
  } = useSupplierManager(removeSupplier)

  // Add this function to your DatabaseDashboard.jsx
  const [isCancelling, setIsCancelling] = useState(false)

  // Replace your handleModalSendEnquiry function with this:
  const handleModalSendEnquiry = async (supplier, selectedPackage, partyId) => {
    setSendingEnquiry(true)
    
    try {
      console.log('🚀 Securing booking for:', supplier.name)
    
      // ✅ STEP 1: Add supplier to party plan (if not already there)
      console.log('📝 STEP 1: Adding supplier to party plan...')
      const addResult = await partyDatabaseBackend.addSupplierToParty(
        partyId,
        supplier,
        selectedPackage
      )
  
      if (!addResult.success) {
        throw new Error(addResult.error)
      }
      
      console.log('✅ STEP 1: Supplier added to party plan successfully')
  
      // ✅ STEP 2: Create AUTO-ACCEPTED enquiry for immediate booking
      console.log('📧 STEP 2: Creating auto-accepted booking...')
      const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
        partyId,
        supplier,
        selectedPackage,
        `Immediate booking confirmed for ${supplier.name}`
      )
  
      if (!enquiryResult.success) {
        console.error('❌ Booking failed but supplier was added:', enquiryResult.error)
        setEnquiryFeedback(`⚠️ ${supplier.name} added, but booking confirmation failed`)
      } else {
        console.log('✅ STEP 2: Booking confirmed successfully')
      }
  
      // ✅ Check sessionStorage for replacement context
      const replacementContextString = sessionStorage.getItem('replacementContext')
      let replacementContext = null
      
      if (replacementContextString) {
        try {
          replacementContext = JSON.parse(replacementContextString)
          console.log('🔄 Found replacement context:', replacementContext)
        } catch (error) {
          console.error('❌ Error parsing replacement context:', error)
        }
      }


      // ✅ STEP 3: If this was a replacement, mark old enquiry as processed
      if (replacementContext?.isReplacementFlow && replacementContext?.originalSupplierCategory) {
        console.log('🔄 === REPLACEMENT PROCESSING ===')
        console.log('🔄 Replacement context:', replacementContext)
        console.log('🔄 Party ID:', partyId)
        console.log('🔄 Original supplier category:', replacementContext.originalSupplierCategory)
        console.log('🔄 New supplier:', supplier.name)
        
        try {
          const markResult = await partyDatabaseBackend.markReplacementAsProcessed(
            partyId,
            replacementContext.originalSupplierCategory,
            supplier.id
          )
          
          console.log('🔄 Mark replacement result:', markResult)
          
          if (markResult.success) {
            console.log('✅ STEP 3: Replacement marked as processed successfully')
          } else {
            console.error('⚠️ STEP 3: Failed to mark replacement as processed:', markResult.error)
          }
        } catch (error) {
          console.error('❌ STEP 3: Exception marking replacement as processed:', error)
        }
        
        // ✅ Clear the replacement context
        sessionStorage.removeItem('replacementContext')
        console.log('🧹 Cleared replacement context from sessionStorage')
      } else {
        console.log('ℹ️ Not a replacement flow - skipping replacement processing')
      }

      // ✅ STEP 4: Close modal and show success
    console.log('🎉 STEP 4: Booking secured - updating UI...')
    await refreshPartyData()
    setShowSupplierAddedModal(false)
    setAddedSupplierData(null)
      
     // ✅ UPDATED: Show booking confirmation message
     const currentUrl = new URL(window.location)
     currentUrl.searchParams.set('booking_confirmed', 'true')
     currentUrl.searchParams.set('supplier_name', encodeURIComponent(supplier.name))
     router.push(currentUrl.toString())
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in handleModalSendEnquiry:', error)
      setEnquiryFeedback(`❌ Failed to add ${supplier.name}: ${error.message}`)
    } finally {
      console.log('🏁 FINAL STEP: Setting sendingEnquiry to false')
      setSendingEnquiry(false)
    }
  }

  const handleCancelEnquiry = async (supplierType) => {
    console.log('🚫 handleCancelEnquiry called with:', supplierType)
    console.log('🔍 partyId:', partyId)
    
    if (isCancelling || !partyId) {
      console.log('⚠️ Exiting early - isCancelling:', isCancelling, 'partyId:', partyId)
      return
    }
    
    setIsCancelling(true)
    
    try {
      const result = await partyDatabaseBackend.cancelEnquiryAndRemoveSupplier(partyId, supplierType)
      
      if (result.success) {
        console.log('✅ Enquiry cancelled and supplier removed')
        await refreshPartyData()
        setEnquiryFeedback(`✅ Request cancelled for ${supplierType}`)
        setTimeout(() => setEnquiryFeedback(null), 3000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Error cancelling enquiry:', error)
      setEnquiryFeedback(`❌ Failed to cancel request: ${error.message}`)
      setTimeout(() => setEnquiryFeedback(null), 5000)
    } finally {
      setIsCancelling(false)
    }
  }

  // Welcome popup state
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const welcomePopupShownRef = useRef(false)


    useDisableScroll([showSupplierModal, showWelcomePopup, showSupplierModal])

  

useEffect(() => {
  setIsClient(typeof window !== 'undefined')
}, [])



useEffect(() => {
  if (!isClient) return

  const handleScrollAndNavigation = () => {
    try {
      const scrollToSupplier = searchParams.get('scrollTo')
      const lastAction = searchParams.get('action') 
      const fromPage = searchParams.get('from')
      const source = searchParams.get('source')
      
      console.log('🔍 Database Dashboard Navigation Effect:', { 
        scrollToSupplier, 
        lastAction, 
        fromPage, 
        source,
        showWelcomePopup,
        showSupplierAddedModal,
        currentActiveMobileType: activeMobileSupplierType
      })

      if (scrollToSupplier && lastAction === 'supplier-added') {
        // Always set the mobile tab immediately, regardless of modal state
        console.log('🎯 SETTING MOBILE TAB TO:', scrollToSupplier)
        setActiveMobileSupplierType(scrollToSupplier)

        // Only handle scrolling if no modals are showing
        if (!showWelcomePopup && !showSupplierAddedModal) {
          console.log('📱 Processing scroll for newly added supplier:', scrollToSupplier)
          
          const scrollDelay = source === 'a_la_carte' ? 1000 : 500
          
          setTimeout(() => {
            // Try desktop scroll first
            const element = document.getElementById(`supplier-${scrollToSupplier}`)
            if (element && window.innerWidth >= 768) {
              console.log('🖥️ Desktop scrolling to element:', element)
              element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              })
            } else {
              // Mobile fallback - scroll to mobile content area
              const mobileContent = document.getElementById('mobile-supplier-content')
              if (mobileContent) {
                console.log('📱 Mobile scrolling to content area')
                mobileContent.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start',
                  inline: 'nearest'
                })
              } else {
                console.log('📱 Mobile content not found, scrolling to top')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }
          }, scrollDelay)

          // Clean up URL parameters after scrolling
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
          console.log('⏸️ Modals showing, tab set but scroll delayed')
        }
        
      } else if (fromPage === 'supplier-detail' || fromPage === 'browse') {
        console.log('📍 Returning from supplier page without adding')
        if (!showWelcomePopup && !showSupplierAddedModal) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
      
    } catch (error) {
      console.error('❌ Navigation effect error:', error)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const scrollTimeout = setTimeout(handleScrollAndNavigation, 200)
  return () => clearTimeout(scrollTimeout)
}, [searchParams, router, showWelcomePopup, showSupplierAddedModal, activeMobileSupplierType, isClient])

  const handleModalClose = () => {
    console.log('🚪 User clicked "Maybe Later" - closing modal, no supplier added')
    setShowSupplierAddedModal(false)
    setAddedSupplierData(null)
    // No need to refresh data since nothing was added
  }  

  // Navigation handlers
  const handleAddSupplier = () => navigateWithContext('/browse', 'dashboard')
  const handlePaymentReady = () => router.push('/payment/secure-party')
  const handleCreateInvites = () => window.location.href = "/e-invites/create"
  const calculatePartyBagsDisplayPrice = (supplier, guestCount) => {
    // Only calculate for party bags
    if (supplier.category !== 'Party Bags' && supplier.type !== 'partyBags') {
      return supplier.price;
    }
  
    // Get base price per bag
    const basePrice = supplier.packageData?.basePrice || 
                     supplier.pricePerBag || 
                     supplier.basePrice || 
                     5.00; // fallback
  
    const guests = parseInt(guestCount) || 10; // fallback to 10
    const totalPrice = basePrice * guests;
  
    return {
      totalPrice,
      basePrice,
      guestCount: guests,
      displayText: `${guests} bags × £${basePrice.toFixed(2)} = £${totalPrice.toFixed(2)}`,
      isCalculated: true
    };
  };

  
  
  // Update your getTotalPrice function in SupplierCard.jsx
  const getTotalPrice = () => {
    if (!supplier) return 0
    
    // For party bags, calculate based on guest count
    if (supplier.category === 'Party Bags' || type === 'partyBags') {
      // Get guest count from various sources
      let guestCount = null;
      
      // Try to get from partyDetails (both localStorage and database users)
      if (typeof window !== 'undefined') {
        try {
          const partyDetails = localStorage.getItem('party_details');
          if (partyDetails) {
            const parsed = JSON.parse(partyDetails);
            guestCount = parsed.guestCount;
          }
        } catch (error) {
          console.log('Could not get guest count from localStorage');
        }
      }
      
      // Fallback to supplier's stored guest count or default
      if (!guestCount) {
        guestCount = supplier.guestCount || 10;
      }
      
      const pricing = calculatePartyBagsDisplayPrice(supplier, guestCount);
      
      // Add addons to the calculated price
      const addonsPrice = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
      
      return pricing.totalPrice + addonsPrice;
    }
    
    // For other suppliers, use existing logic
    const basePrice = supplier.price || 0;
    const addonsPrice = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    
    return basePrice + addonsPrice;
  };


  const getOutstandingSupplierData = () => {
    console.log('🔍 DEBUG: Starting payment calculation...')
    console.log('🔍 Total enquiries:', enquiries.length)
    console.log('🔍 Available supplier types:', Object.keys(visibleSuppliers))
    
    // Step 1: Find all enquiries that are accepted but not paid
    const unpaidEnquiries = enquiries.filter(enquiry => {
      const isAccepted = enquiry.status === 'accepted'
      const isUnpaid = !enquiry.payment_status || enquiry.payment_status === 'unpaid'
      
      console.log(`🔍 Enquiry ${enquiry.supplier_category}:`, {
        status: enquiry.status,
        payment_status: enquiry.payment_status,
        isAccepted,
        isUnpaid,
        include: isAccepted && isUnpaid
      })
      
      return isAccepted && isUnpaid
    })
    
    console.log('🔍 Found unpaid enquiries:', unpaidEnquiries.length)
    
    if (unpaidEnquiries.length === 0) {
      console.log('✅ All enquiries paid or no accepted enquiries, returning empty')
      return { suppliers: [], totalCost: 0, totalDeposit: 0 }
    }
    
    // Step 2: Map unpaid enquiries to their supplier data
    const outstandingSuppliers = unpaidEnquiries
      .map(enquiry => {
        const supplierType = enquiry.supplier_category
        const supplier = visibleSuppliers[supplierType]
        
        console.log(`🔍 Looking for supplier data for ${supplierType}:`, {
          found: !!supplier,
          name: supplier?.name,
          price: supplier?.price || supplier?.totalPrice
        })
        
        if (!supplier) {
          console.log(`⚠️ No supplier found in visibleSuppliers for: ${supplierType}`)
          return null
        }
        
        return { enquiry, supplierType, supplier }
      })
      .filter(Boolean) // Remove entries where supplier wasn't found
    
    console.log('🔍 Mapped to suppliers:', outstandingSuppliers.length)
    
    // Step 3: Calculate payment amounts
    const paymentData = outstandingSuppliers.map(({ enquiry, supplierType, supplier }) => {
      // Get the supplier price
      const supplierPrice = supplier.totalPrice || supplier.price || 0
      
      // Calculate deposit (30% with £50 minimum, or use your specific logic)
      const supplierDepositAmount = Math.max(50, Math.round(supplierPrice * 0.3))
      
      console.log(`💰 Payment calculation for ${supplierType}:`, {
        supplierName: supplier.name,
        totalPrice: supplierPrice,
        depositAmount: supplierDepositAmount
      })
      
      return {
        type: supplierType,
        name: supplier.name,
        totalAmount: supplierPrice,
        depositAmount: supplierDepositAmount,
        enquiryId: enquiry.id
      }
    })
    
    // Step 4: Calculate totals
    const totalOutstandingCost = paymentData.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalDepositAmount = paymentData.reduce((sum, item) => sum + item.depositAmount, 0)
    
    console.log('💳 Final outstanding payment calculation:', {
      suppliers: paymentData.map(s => s.type),
      supplierCount: paymentData.length,
      totalCost: totalOutstandingCost,
      totalDeposit: totalDepositAmount
    })
    
    return {
      suppliers: paymentData,
      totalCost: totalOutstandingCost,
      totalDeposit: totalDepositAmount
    }
  }
  
  
  const outstandingData = getOutstandingSupplierData()

  // Loading state
  if (loading || !themeLoaded || phaseLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party...</p>
        </div>
      </div>
    )
  }

  // Show different content based on data source
  if (dataSource === 'localStorage') {
    console.log('📦 Rendering localStorage dashboard instead')
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-500 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Using Local Storage
          </h2>
          <p className="text-gray-600 mb-4">
            Your party data is stored locally. Sign in to sync to the cloud.
          </p>
          <button 
            onClick={() => router.push('/dashboard-local')}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Go to Local Dashboard
          </button>
        </div>
      </div>
    )
  }

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
          depositAmount: totalCost * 0.2,
          remainingBalance: totalCost * 0.8
        }}
      />
      <EnquirySuccessBanner />
      {/* <EInvitesBanner 
        partyId={partyId}
        isBookingPending={currentPhase !== 'confirmed'} 
        onCreateInvites={handleCreateInvites} 
      /> */}
      
      {/* Supplier Added Confirmation Modal */}
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
        <PartyHeader 
          theme={partyTheme}
          partyDetails={partyDetails}
          onPartyDetailsChange={handlePartyDetailsUpdate}
          dataSource={dataSource}
          currentParty={currentParty}
          isPaymentConfirmed={isPaymentConfirmed}
          enquiries={enquiries}
          isSignedIn={true}
        />
        




        {/* ✅ UPDATED: Supplier Selection Modal with Restoration Support */}
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
          partyLocation={partyDetails.location}
          partyData={partyData}
          enquiries={enquiries}
          hasEnquiriesPending={hasEnquiriesPending}
          isSignedIn={true}                    // ✅ Database users are signed in
          currentPartyId={partyId}             // ✅ Pass the party ID
        />

        {/* Replacement Manager - only if we have a party ID */}
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
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
            {/* Supplier Grid - NOW WITH PROPER PHASE DETECTION */}
            <SupplierGrid
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

            />

            <PartyPhaseContent
              phase={partyPhase}
              suppliers={visibleSuppliers}
              enquiries={enquiries}
              partyData={partyData}
              paymentDetails={paymentDetails}
              onPaymentReady={handlePaymentReady}
              onCreateInvites={handleCreateInvites}
              partyDetails={partyDetails}
              hasCreatedInvites={partyData?.einvites?.status === 'completed'}
              totalOutstandingCost={outstandingData.totalDeposit}
              outstandingSuppliers={outstandingData.suppliers.map(s => s.type)}
            />
          </main>

          {/* Sidebar */}
          <Sidebar
            partyData={partyData}
            partyDate={partyDetails?.date}
            totalCost={totalCost}
            isPaymentConfirmed={isPaymentConfirmed}
            suppliers={visibleSuppliers}
            enquiries={enquiries}
            timeRemaining={24}
            onPaymentReady={handlePaymentReady}
            showPaymentCTA={true}
     totalOutstandingCost={outstandingData.totalDeposit}
outstandingSuppliers={outstandingData.suppliers.map(s => s.type)}
          />
        </div>
      </div>

      {/* Modals */}
      <WelcomeDashboardPopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
      />
      
      <MobileBottomTabBar
        suppliers={visibleSuppliers}
        enquiries={enquiries}
        totalCost={totalCost}
        timeRemaining={24}
        partyDetails={partyDetails}
        onPaymentReady={handlePaymentReady}
        isPaymentConfirmed={isPaymentConfirmed}
        hasOutstandingPayments={outstandingData.suppliers.length > 0}
        outstandingSuppliers={outstandingData.suppliers}
        totalDepositAmount={outstandingData.totalDeposit}
        ProgressWidget={
          <SnappysPresentParty
            suppliers={visibleSuppliers}
            enquiries={enquiries}
            timeRemaining={24}
            onPaymentReady={handlePaymentReady}
            showPaymentCTA={true}
            isPaymentComplete={isPaymentConfirmed}
            totalOutstandingCost={outstandingData.totalDeposit} // Pass the deposit amount
  outstandingSuppliers={outstandingData.suppliers.map(s => s.type)} // Pass supplier types
          />
        }
        CountdownWidget={
          <CountdownWidget
            partyDate={partyDetails?.date}
          />
        }
      />
    </div>
  )
}