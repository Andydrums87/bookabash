"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti"

// UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Icons
import { RefreshCw, ChevronRight, Plus } from "lucide-react"

// Custom Components
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import EnquirySuccessBanner from "@/components/enquirySuccessBanner"
import PartyHeader from "../components/ui/PartyHeader"
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

// Hooks
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useSupplierManager } from '../hooks/useSupplierManager'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { usePartyPlan } from '@/utils/partyPlanBackend'

export default function LocalStorageDashboard() {
  // Router and navigation
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext, getStoredModalState, clearModalState } = useContextualNavigation()

  // ✅ PRODUCTION SAFETY: Core state management
  const [isMounted, setIsMounted] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Refs for tracking
  const welcomePopupShownRef = useRef(false)
  const confettiTriggeredRef = useRef(false)

  // Welcome popup state
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeJustCompleted, setWelcomeJustCompleted] = useState(false)

  // General state
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState(null)
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)

  // Modal state
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    category: '',
    theme: '',
    date: null,
    filters: {}
  })

  // Debug state (remove in production)
  const [debugInfo, setDebugInfo] = useState({})

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

  // ✅ ENHANCED: Name submit handler with completion flags
  const handleNameSubmit = (nameData) => {
    console.log('🎉 Welcome form completed:', nameData)
    
    try {
      if (typeof originalHandleNameSubmit === 'function') {
        originalHandleNameSubmit(nameData)
      }
      
      setWelcomeJustCompleted(true)
      
      // ✅ CRITICAL: Set completion flags to prevent re-showing
      try {
        // Set multiple completion flags for reliability
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
            welcomeCompleted: true, // ✅ CRITICAL: Mark as completed
            welcomeCompletedAt: new Date().toISOString()
          }
          
          localStorage.setItem('party_details', JSON.stringify(updatedDetails))
          console.log('📝 Updated party details with welcome data and completion flag')
        }
        
        console.log('✅ Welcome completion flags set - popup will not show again')
        
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
    console.log('🔒 Closing supplier modal')
    setShowSupplierModal(false)
    clearModalState()
  }

  const handleSupplierSelection = async (supplierData) => {
    console.log('✅ Supplier selected:', supplierData)
    
    try {
      const { supplier, package: selectedPackage, addons: selectedAddons = [] } = supplierData
      
      if (!supplier) {
        console.error('❌ No supplier data provided')
        return
      }
  
      const result = await addSupplier(supplier, selectedPackage)
      
      if (result.success) {
        console.log('✅ Supplier added successfully!')
        
        if (selectedAddons && selectedAddons.length > 0) {
          for (const addon of selectedAddons) {
            await handleAddAddon(addon, supplier.id)
          }
        }
        
        closeSupplierModal()
      } else {
        console.error('❌ Failed to add supplier:', result.error)
      }
      
    } catch (error) {
      console.error('💥 Error in handleSupplierSelection:', error)
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

  // Budget control props
  const budgetControlProps = {
    totalSpent: totalCost,
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    isUpdating,
    showAdvancedControls,
    setShowAdvancedControls,
  }

  
  // ✅ PRODUCTION SAFETY: Don't render until mounted and data loaded
  if (!isMounted || !themeLoaded || planLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party...</p>
        </div>
      </div>
    )
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
          <PartyHeader 
            theme={partyTheme} 
            isSignedIn={false}
            partyDetails={partyDetails}
            onPartyDetailsChange={handlePartyDetailsUpdate}
            isPaymentConfirmed={false}
            budgetControlProps={{
              ...budgetControlProps,
              getBudgetCategory
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <main className="lg:col-span-2 space-y-8">
              <div className="hidden md:flex justify-between mb-4 items-start">
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
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {Object.entries(suppliers).map(([type, supplier]) => (
                    <SupplierCard 
                      key={type}
                      type={type} 
                      supplier={supplier}
                      loadingCards={loadingCards}
                      suppliersToDelete={suppliersToDelete}
                      openSupplierModal={openSupplierModal}
                      handleDeleteSupplier={handleDeleteSupplier}
                      getSupplierDisplayName={getSupplierDisplayName}
                      addons={addons}
                      handleRemoveAddon={handleRemoveAddon}
                      enquiryStatus={getEnquiryStatus(type)}
                      enquirySentAt={getEnquiryTimestamp(type)}
                      isSignedIn={false}
                      isPaymentConfirmed={false}
                      enquiries={[]}
                      partyDetails={partyDetails}
                      currentPhase="planning"
                    />
                  ))}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <MobileSupplierNavigation
                    suppliers={suppliers}
                    loadingCards={loadingCards}
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

              {/* Action Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-3 bg-primary rounded-full hover:bg-[hsl(var(--primary-600))] text-primary-foreground py-6 text-base font-semibold"
                  asChild
                >
                  <Link href="/review-book">Continue to Review & Book</Link>
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
              <BudgetControls {...budgetControlProps} />
              <CountdownWidget partyDate={partyDetails.date} />
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
        partyLocation={partyDetails.location}
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
      <div className="md:hidden fixed bottom-5 right-4 z-40">
        <button 
          onClick={handleAddSupplier}
          className="bg-primary-400 hover:bg-[hsl(var(--primary-600))] w-10 h-10 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}