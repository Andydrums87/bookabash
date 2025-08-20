"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import confetti from "canvas-confetti" // ADD: Import confetti for dashboard

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

// NEW: Updated imports for unified card system
import SupplierCard from "../components/SupplierCard/SupplierCard" // Our new unified card system
import MobileSupplierNavigation from "../components/MobileSupplierNavigation" // New mobile nav

import AddonsSection from "../components/AddonsSection"
import { AddonProvider, RecommendedAddonsWrapper, AddonsSectionWrapper } from '../components/AddonProviderWrapper'
import AddonDetailsModal from "@/components/AddonDetailsModal"

// Existing Components
import BudgetControls from "@/components/budget-controls"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import RecommendedAddons from "@/components/recommended-addons"
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"

// Hooks
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useSupplierManager } from '../hooks/useSupplierManager'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { usePartyPlan } from '@/utils/partyPlanBackend'
import ReferFriend from "@/components/ReferFriend"

export default function LocalStorageDashboard() {
  // Router and search params
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext, getStoredModalState, clearModalState } = useContextualNavigation()

  // Refs
  const welcomePopupShownRef = useRef(false)
  const confettiTriggeredRef = useRef(false) // NEW: Track if confetti has been triggered

  // State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState(null)
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
  const [welcomeJustCompleted, setWelcomeJustCompleted] = useState(false) // NEW: Track when welcome is completed

  // NEW: Modal restoration state
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    category: '',
    theme: '',
    date: null,
    filters: {}
  })

  // Add handler for addon clicks
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
    // Modal will close itself after showing success state
  }

  // Use your existing party plan hook
  const {
    partyPlan, 
    loading: planLoading, 
    error: planError, 
    totalCost, 
    addons,
    removeSupplier,
    addAddon,
    removeAddon,
    addSupplier,         // ✅ Make sure this is imported
    hasAddon,
    removeAddonFromSupplier,
  } = usePartyPlan()

  // Other hooks
  const {
    partyDetails,
    partyTheme,
    themeLoaded,
    handleNameSubmit: originalHandleNameSubmit, // Rename to avoid conflict
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
    selectedSupplierModal, // This might be the old modal state
    getSupplierDisplayName,
    openSupplierModal: originalOpenSupplierModal, // Rename to avoid conflict
    closeSupplierModal: originalCloseSupplierModal,
    handleSupplierSelection: originalHandleSupplierSelection,
    handleDeleteSupplier,
    confirmDeleteSupplier,
    cancelDeleteSupplier
  } = useSupplierManager(removeSupplier)

  // Create suppliers object from party plan
  const suppliers = {
    venue: partyPlan.venue || null,
    entertainment: partyPlan.entertainment || null,
    catering: partyPlan.catering || null,
    facePainting: partyPlan.facePainting || null,
    activities: partyPlan.activities || null,
    partyBags: partyPlan.partyBags || null,
    decorations: partyPlan.decorations || null,
    balloons: partyPlan.balloons || null,
  }

  // NEW: Enhanced name submit handler with confetti trigger
  const handleNameSubmit = (nameData) => {
    console.log('🎉 Welcome form completed, setting up confetti trigger')
    originalHandleNameSubmit(nameData)
    setWelcomeJustCompleted(true) // Flag that welcome was just completed
  }

  // NEW: Confetti effect when welcome popup closes after completion
  useEffect(() => {
    if (welcomeJustCompleted && !showWelcomePopup && !confettiTriggeredRef.current) {
      console.log('🎊 Triggering confetti celebration on dashboard!')
      
      confettiTriggeredRef.current = true // Prevent multiple triggers
      
      const timeout = setTimeout(() => {
        // More celebratory confetti for the dashboard
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff6b35', '#f7931e', '#ffd23f', '#06d6a0', '#118ab2', '#073b4c']
        })
        
        // Second burst after a delay
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.7 },
            colors: ['#ff6b35', '#f7931e', '#ffd23f']
          })
        }, 300)
        
        // Third burst for extra celebration
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 110,
            origin: { y: 0.8 },
            colors: ['#06d6a0', '#118ab2', '#073b4c']
          })
        }, 600)
      }, 500)
      
      // Reset the flag after animation
      setTimeout(() => {
        setWelcomeJustCompleted(false)
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [welcomeJustCompleted, showWelcomePopup])

  // NEW: Enhanced modal handlers
  const openSupplierModal = (category, theme = 'superhero') => {
    console.log('🔓 Opening supplier modal:', { category, theme })
    
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
    clearModalState()
  }

  const handleSupplierSelection = async (supplierData) => {
    console.log('✅ Supplier selected in localStorage dashboard:', supplierData)
    
    try {
      // Extract the supplier and package info
      const { supplier, package: selectedPackage, addons: selectedAddons = [], autoEnquiry = false } = supplierData
      
      if (!supplier) {
        console.error('❌ No supplier data provided')
        return
      }
  
      // For localStorage, we use the addSupplier function from usePartyPlan hook
      const result = await addSupplier(supplier, selectedPackage)
      
      if (result.success) {
        console.log('✅ Supplier added to localStorage successfully!')
        
        // ✅ FIXED: Add any selected addons with proper supplier properties
        if (selectedAddons && selectedAddons.length > 0) {
          console.log('🔧 Adding supplier addons:', selectedAddons)
          
          for (const addon of selectedAddons) {
            console.log('🔧 Processing addon:', addon)
            
            // ✅ Call addAddon with the supplier ID as second parameter
            await handleAddAddon(addon, supplier.id)
          }
        }
        
        // Close modal after successful addition
        closeSupplierModal()
        
        // Optional: Show success message
        console.log(`🎉 ${supplier.name} has been added to your party plan!`)
        
      } else {
        console.error('❌ Failed to add supplier:', result.error)
      }
      
    } catch (error) {
      console.error('💥 Error in handleSupplierSelection:', error)
    }
  }
  
  // NEW: Modal restoration effect
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

  // NEW: Listen for custom modal restoration events
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

  // Welcome popup handling
  useEffect(() => {
    if (searchParams.get("show_welcome") === "true" && !welcomePopupShownRef.current) {
      setShowWelcomePopup(true)
      welcomePopupShownRef.current = true

      const currentPath = window.location.pathname
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("show_welcome")
      router.replace(`${currentPath}?${newSearchParams.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  const handleAddAddon = async (addon, supplierId = null) => {
    if (hasAddon(addon.id)) {
      console.log('🔍 HANDLEADDADDON DEBUG - Addon already exists, returning early')
      return
    }
    
    try {
      // ✅ FIXED: Preserve existing supplier properties from addon, only override if not present
      const finalSupplierId = addon.supplierId || supplierId
      const finalSupplierName = addon.supplierName || (finalSupplierId ? suppliers[finalSupplierId]?.name : 'General')
      
      const addonWithSupplier = {
        ...addon,
        supplierId: finalSupplierId,
        supplierName: finalSupplierName,
        attachedToSupplier: !!finalSupplierId,  // ✅ Add this flag
        isSupplierAddon: !!finalSupplierId,     // ✅ Add this flag
        addedAt: new Date().toISOString()
      }
      
      console.log('🔧 Final addon being added:', addonWithSupplier)
      
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
      console.log('🗑️ Attempting to remove addon:', addonId)
      
      // First try the regular remove (for global addons)
      let result = await removeAddon(addonId)
      
      if (!result.success) {
        console.log('🔄 Not found in global addons, checking supplier addons...')
        
        // If not found in global addons, try each supplier
        const supplierTypes = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons']
        
        for (const supplierType of supplierTypes) {
          const supplier = suppliers[supplierType]
          if (supplier && supplier.selectedAddons) {
            const hasAddon = supplier.selectedAddons.some(addon => addon.id === addonId)
            if (hasAddon) {
              console.log(`🎯 Found addon in ${supplierType}, removing...`)
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

  // NEW: Helper functions for unified card system
  const getEnquiryStatus = (type) => {
    // LocalStorage dashboard is always in "selected" state (no enquiries)
    return null
  }

  const getEnquiryTimestamp = (type) => {
    // No enquiry timestamps in localStorage dashboard
    return null
  }

  // Loading state
  if (!themeLoaded || planLoading) {
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
    <div className={`${showWelcomePopup ? "blur-sm opacity-50" : "" }min-h-screen overflow-hidden`}>
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
                {/* Left: Snappy + Heading */}
                <div className="flex justfy-center">
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

                {/* Right: Add Supplier Button */}
                <Button onClick={handleAddSupplier} variant="outline" className="flex gap-2 text-primary border-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </Button>
              </div>

              {/* NEW: Unified Responsive Supplier Grid */}
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
                      enquiryStatus={getEnquiryStatus(type)} // Always null for localStorage
                      enquirySentAt={getEnquiryTimestamp(type)} // Always null for localStorage
                      isSignedIn={false} // LocalStorage = not signed in
                      isPaymentConfirmed={false} // LocalStorage = planning phase
                      enquiries={[]} // No enquiries in localStorage
                      // NEW: LocalStorage is always in planning phase
                      currentPhase="planning"
                    />
                  ))}
                </div>

                {/* NEW: Mobile Navigation */}
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
                    isPaymentConfirmed={false} // LocalStorage = planning phase
                    enquiries={[]} // No enquiries in localStorage
                    // NEW: Don't show party tasks in localStorage dashboard (selected state)
                    showPartyTasks={false}
                    currentPhase="planning" // LocalStorage is always planning phase
                    partyTasksStatus={{}}
                  />
                </div>
              </div>

              <div className="md:block hidden">
                <AddonsSectionWrapper suppliers={suppliers}  />
              </div>
              
              {/* Recommended Add-ons */}
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
              <ReferFriend  />
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

      {/* UPDATED: New Modal with Restoration Support */}
      <SupplierSelectionModal
        isOpen={showSupplierModal}
        onClose={closeSupplierModal}
        category={modalConfig.category}
        theme={modalConfig.theme}
        date={modalConfig.date}
        initialFilters={modalConfig.filters}
        onSelectSupplier={handleSupplierSelection}
        partyLocation={partyDetails.location}
        currentPhase="planning"                     // LocalStorage is always planning
        isAwaitingResponses={false}                 // Never awaiting in localStorage
        partyData={partyPlan}                       // Pass current party plan
        enquiries={[]}                              // No enquiries in localStorage
        hasEnquiriesPending={false}                 // Never pending in localStorage
        isSignedIn={false}                          // LocalStorage users aren't signed in
        currentPartyId={null}                       // No party ID for localStorage
      />

      <WelcomeDashboardPopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
        onNameSubmit={handleNameSubmit}
      />

      <DeleteConfirmDialog
        isOpen={!!showDeleteConfirm}
        supplierType={showDeleteConfirm}
        onConfirm={confirmDeleteSupplier}
        onCancel={cancelDeleteSupplier}
      />

      {/* Add the new Addon Details Modal */}
      <AddonDetailsModal
        isOpen={isAddonModalOpen}
        onClose={handleAddonModalClose}
        addon={selectedAddon}
        onAddToParty={handleAddAddonFromModal}
        isAlreadyAdded={selectedAddon ? hasAddon(selectedAddon.id) : false}
      />

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