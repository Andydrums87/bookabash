// DatabaseDashboard.jsx - FIXED with single loading state
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
    // REMOVED: loading from usePartyPhase - no longer needed
  } = usePartyPhase(partyData, partyId)

  // OTHER HOOKS
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

  // ALL EFFECTS
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
      const supplierPrice = supplier.totalPrice || supplier.price || 0
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

  // EVENT HANDLERS (after all hooks)
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

  // SINGLE LOADING CHECK - This is the key fix!
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading your party..." />
      </div>
    )
  }

  // Redirect check
  if (dataSource === 'localStorage') {
    console.log('Redirecting to localStorage dashboard')
    router.push('/dashboard-local')
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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