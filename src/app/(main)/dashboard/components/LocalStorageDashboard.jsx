"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

// UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Icons
import { RefreshCw, ChevronRight } from "lucide-react"

// Custom Components
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import EnquirySuccessBanner from "@/components/enquirySuccessBanner"
import PartyHeader from "./PartyHeader"
import CountdownWidget from "./CountdownWidget"
import PartyExcitementMeter from "./PartyExcitementMeter"
import DeleteConfirmDialog from "./DeleteConfirmDialog"
import MobileBudgetBar from "./MobileBudgetBar"
import SupplierCard from "./SupplierCard"
import MobileSupplierTabs from "./MobileSupplierTabs"
import AddonsSection from "./AddonsSection"

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

export default function LocalStorageDashboard() {
  // Router and search params
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext } = useContextualNavigation()

  // Refs
  const welcomePopupShownRef = useRef(false)

  // State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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
    hasAddon
  } = usePartyPlan()

  // Other hooks
  const {
    partyDetails,
    partyTheme,
    themeLoaded,
    handleNameSubmit,
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
    openSupplierModal,
    closeSupplierModal,
    handleSupplierSelection,
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
    einvites: partyPlan.einvites || null
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

  // Add-on handlers
  const handleAddAddon = async (addon, supplierId = null) => {
    if (hasAddon(addon.id)) {
      return
    }
    
    try {
      const addonWithSupplier = {
        ...addon,
        supplierId: supplierId,
        supplierName: supplierId ? suppliers[supplierId]?.name : 'General',
        addedAt: new Date().toISOString()
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
      const result = await removeAddon(addonId)
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
    <div className="min-h-screen bg-primary-50">
      <ContextualBreadcrumb currentPage="dashboard"/>
      <EnquirySuccessBanner />
      
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
        <PartyHeader 
          theme={partyTheme} 
          partyDetails={partyDetails}
          onPartyDetailsChange={handlePartyDetailsUpdate}
          isPaymentConfirmed={false} // Never confirmed for localStorage users
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-primary-700">Your Party Team! 🎉</h2>
                <p className="text-gray-600 mt-1">Amazing suppliers to make your day perfect</p>
              </div>
              <button 
                onClick={handleAddSupplier} 
                className="bg-primary-500 px-4 py-3 text-white hover:bg-[hsl(var(--primary-700))] rounded"
              >
                Add New Supplier
              </button>
            </div>

            {/* Desktop Supplier Grid */}
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
                  enquiryStatus={null} // No enquiry status for localStorage users
                  isSignedIn={false} // Never signed in for localStorage dashboard
                  isPaymentConfirmed={false}
                  enquiries={[]}
                />
              ))}
            </div>

            {/* Mobile Supplier Tabs */}
            <div className="md:hidden">
              <MobileSupplierTabs
                suppliers={suppliers}
                loadingCards={loadingCards}
                suppliersToDelete={suppliersToDelete}
                openSupplierModal={openSupplierModal}
                handleDeleteSupplier={handleDeleteSupplier}
                getSupplierDisplayName={getSupplierDisplayName}
                addons={addons}
                handleRemoveAddon={handleRemoveAddon}
                getEnquiryStatus={() => null} // No enquiry status for localStorage
                isSignedIn={false}
                isPaymentConfirmed={false}
                enquiries={[]}
              />
            </div>

            {/* Add-ons Section */}
            <AddonsSection 
              addons={addons}
              handleRemoveAddon={handleRemoveAddon}
            />

            {/* Recommended Add-ons */}
            <div className="w-screen pr-6 md:pr-20">
              <RecommendedAddons 
                context="dashboard" 
                maxItems={4} 
                onAddToCart={handleAddAddon}
              />
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-primary hover:bg-primary-light text-primary-foreground py-3 text-base font-semibold"
                asChild
              >
                <Link href="/party-summary">Continue to Review & Book</Link>
              </Button>
              <Button variant="outline" className="sm:w-auto">
                Modify Party Details
              </Button>
              <Button variant="ghost" className="sm:w-auto">
                Get Help
              </Button>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <BudgetControls {...budgetControlProps} />
            </Card>
            
            <CountdownWidget partyDate="2025-06-14T14:00:00" />
            
            <PartyExcitementMeter 
              suppliers={suppliers}
              totalCost={totalCost}
              budget={tempBudget}
            />
          </aside>
        </div>
      </div>

      {/* Mobile Budget Bar */}
      <MobileBudgetBar 
        totalSpent={totalCost}
        tempBudget={tempBudget}
        budgetControlProps={budgetControlProps}
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

      {/* Modals and Dialogs */}
      <SupplierSelectionModal
        isOpen={selectedSupplierModal?.isOpen}
        onClose={closeSupplierModal}
        category={selectedSupplierModal?.category || "entertainment"}
        theme="Superhero"
        date={partyDetails?.date} 
        onSelectSupplier={handleSupplierSelection}
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
    </div>
  )
}