// DatabaseDashboard.jsx - FIXED with all hooks at the top
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
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
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
import DatabasePartyHeader from "../components/ui/DatabaseDashboardPartyHeader"
import CountdownWidget from "../components/ui/CountdownWidget"

// Feature Components
import ReplacementManager from './components/ReplacementManager'
import SupplierGrid from '../components/SupplierGrid'
import PartyPhaseContent from '../components/PartyPhaseContent'
import Sidebar from './components/Sidebar'
import SnappysPresentParty from "./components/SnappysPresentParty"
import SupplierAddedConfirmationModal from "./components/SupplierAddedConfirmationModal"
import SnappyLoader from "@/components/ui/SnappyLoader"
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"

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
  const welcomePopupShownRef = useRef(false)

  // ALL CUSTOM HOOKS SECOND
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

  // Supplier management functions
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

  const {
    handleDeleteSupplier,
    getSupplierDisplayName,
  } = useSupplierManager(removeSupplier)

  // ALL EFFECTS THIRD
  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

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
          console.log('🎯 SETTING MOBILE TAB TO:', scrollToSupplier)
          setActiveMobileSupplierType(scrollToSupplier)

          if (!showWelcomePopup && !showSupplierAddedModal) {
            console.log('📱 Processing scroll for newly added supplier:', scrollToSupplier)
            
            const scrollDelay = source === 'a_la_carte' ? 1000 : 500
            
            setTimeout(() => {
              const element = document.getElementById(`supplier-${scrollToSupplier}`)
              if (element && window.innerWidth >= 768) {
                console.log('🖥️ Desktop scrolling to element:', element)
                element.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest'
                })
              } else {
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

  // Use disable scroll hook
  useDisableScroll([showSupplierModal, showWelcomePopup])

  // COMPUTED VALUES (after all hooks)
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

  // Helper functions
  const getOutstandingSupplierData = () => {
    console.log('🔍 DEBUG: Starting payment calculation...')
    console.log('🔍 Total enquiries:', enquiries.length)
    console.log('🔍 Available supplier types:', Object.keys(visibleSuppliers))
    
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
      .filter(Boolean)
    
    console.log('🔍 Mapped to suppliers:', outstandingSuppliers.length)
    
    const paymentData = outstandingSuppliers.map(({ enquiry, supplierType, supplier }) => {
      const supplierPrice = supplier.totalPrice || supplier.price || 0
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

  // EVENT HANDLERS (after all hooks)
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
  }

  const handleSupplierSelection = async (supplierData) => {
    console.log('🎯 DASHBOARD: handleSupplierSelection ENTRY - supplierData:', supplierData)
    const supplier = supplierData?.supplier || supplierData
    const selectedPackage = supplierData?.package || null
    console.log('🎯 DASHBOARD: Extracted supplier:', supplier?.name)
    console.log('🎯 DASHBOARD: Extracted package:', selectedPackage?.name)
    if (!supplier) {
      console.error('❌ No supplier data provided')
      return
    }
    
    try {
      console.log('✅ Using Quick Add flow - calling handleNormalSupplierAddition')
      await handleNormalSupplierAddition(supplier, selectedPackage)
      console.log('✅ handleNormalSupplierAddition completed')
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
    console.log('📝 DASHBOARD: handleNormalSupplierAddition called for:', supplier.name)
    
    setShowSupplierModal(false)
    
    setTimeout(() => {
      console.log('📝 DASHBOARD: Setting modal data for:', supplier.name)
      
      const modalData = { supplier, selectedPackage }
      setAddedSupplierData(modalData)
      setShowSupplierAddedModal(true)
      
      console.log('📝 DASHBOARD: Modal state should now be:', {
        showSupplierAddedModal: true,
        addedSupplierData: modalData
      })
      
      setEnquiryFeedback(null)
      
    }, 200)
  }

  const handleModalSendEnquiry = async (supplier, selectedPackage, partyId) => {
    setSendingEnquiry(true)
    
    try {
      console.log('🚀 Securing booking for:', supplier.name)
    
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
        
        sessionStorage.removeItem('replacementContext')
        console.log('🧹 Cleared replacement context from sessionStorage')
      } else {
        console.log('ℹ️ Not a replacement flow - skipping replacement processing')
      }

      console.log('🎉 STEP 4: Booking secured - updating UI...')
      await refreshPartyData()
      setShowSupplierAddedModal(false)
      setAddedSupplierData(null)
      
      const currentUrl = new URL(window.location)
      currentUrl.searchParams.set('enquiry_sent', 'true')
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

  const handleMobileSupplierTabChange = (supplierType) => {
    console.log('Mobile tab changed to:', supplierType)
    setActiveMobileSupplierType(supplierType)
    
    setTimeout(() => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.classList.remove('modal-open', 'overflow-hidden')
    }, 50)
  }

  const handleModalClose = () => {
    console.log('🚪 User clicked "Maybe Later" - closing modal, no supplier added')
    setShowSupplierAddedModal(false)
    setAddedSupplierData(null)
  }

  const handleAddSupplier = () => navigateWithContext('/browse', 'dashboard')
  const handlePaymentReady = () => router.push(`/payment/secure-party?party_id=${partyId}`)
  const handleCreateInvites = () => window.location.href = "/e-invites/create"

  // NOW ALL CONDITIONAL RETURNS (after all hooks are called)
  
  // Loading check
  if (loading || phaseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SnappyLoader text="Loading your party..." />
      </div>
    )
  }

  // Redirect check
  if (dataSource === 'localStorage') {
    console.log('📦 Redirecting to localStorage dashboard')
    router.push('/dashboard-local')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SnappyLoader text="Redirecting to your local party..." />
      </div>
    )
  }

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
          depositAmount: totalCost * 0.2,
          remainingBalance: totalCost * 0.8
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
    </div>
  )
}