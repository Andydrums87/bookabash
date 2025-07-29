"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

// Backend
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

// UI Components
import { Button } from "@/components/ui/button"


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
import SnappysPresentParty from "./SnappysPresentParty"
import RealTimeNotifications from "./realTimeNotifications"
import AutoReplacementFlow from "./AutoReplacementFlow"

// Existing Components
import BudgetControls from "@/components/budget-controls"
import SupplierSelectionModal from "@/components/supplier-selection-modal"
import RecommendedAddons from "@/components/recommended-addons"
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"

// Hooks
import { useEnquiryStatus } from "../hooks/useEnquiryStatus"
import { usePaymentStatus } from '../hooks/usePaymentStatus'
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useSupplierManager } from '../hooks/useSupplierManager'
import { useBudgetManager } from '../hooks/useBudgetManager'

export default function DatabaseDashboard() {
  // Router and search params
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext } = useContextualNavigation()

  // Refs
  const welcomePopupShownRef = useRef(false)

  // State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [replacements, setReplacements] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(24)

  // Database-specific state
  const [partyData, setPartyData] = useState({})
  const [partyId, setPartyId] = useState(null)
  const [totalCost, setTotalCost] = useState(0)
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)

  // Load database party data
  useEffect(() => {
    const loadPartyData = async () => {
      setLoading(true)
      try {
        const partyResult = await partyDatabaseBackend.getCurrentParty()
        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          setPartyData(party.party_plan || {})
          setPartyId(party.id)
          setTotalCost(party.estimated_cost || 0)
          setAddons(party.party_plan?.addons || [])
        }
      } catch (error) {
        console.error('Error loading party data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPartyData()
  }, [])

  // Database-specific hooks
  const { enquiries, getEnquiryStatus } = useEnquiryStatus(partyId, true)
  const { paymentStatus, paymentDetails, isPaymentConfirmed } = usePaymentStatus(partyId, true)

  // Create suppliers object from party plan
  const suppliers = {
    venue: partyData.venue || null,
    entertainment: partyData.entertainment || null,
    catering: partyData.catering || null,
    facePainting: partyData.facePainting || null,
    activities: partyData.activities || null,
    partyBags: partyData.partyBags || null,
    decorations: partyData.decorations || null,
    balloons: partyData.balloons || null,
    einvites: partyData.einvites || null
  }

  // Check enquiry states
  const enquiriesSent = enquiries.length > 0
  const allSupplierTypesWithEnquiries = Object.keys(suppliers).filter(key => suppliers[key] && key !== 'einvites')
  const allConfirmed = enquiriesSent && allSupplierTypesWithEnquiries.every(type => 
    getEnquiryStatus(type) === 'accepted'
  )

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

  // Database-specific supplier manager
  const removeSupplier = async (supplierType) => {
    const result = await partyDatabaseBackend.removeSupplierFromParty(partyId, supplierType)
    if (result.success) {
      setPartyData(result.party.party_plan || {})
      setTotalCost(result.party.estimated_cost || 0)
      return { success: true }
    }
    return result
  }

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

  // Database-specific addon handlers
  const addAddon = async (addon) => {
    const result = await partyDatabaseBackend.addAddonToParty(partyId, addon)
    if (result.success) {
      setPartyData(result.party.party_plan || {})
      setTotalCost(result.party.estimated_cost || 0)
      setAddons(result.party.party_plan?.addons || [])
      return { success: true }
    }
    return result
  }

  const removeAddon = async (addonId) => {
    const result = await partyDatabaseBackend.removeAddonFromParty(partyId, addonId)
    if (result.success) {
      setPartyData(result.party.party_plan || {})
      setTotalCost(result.party.estimated_cost || 0)
      setAddons(result.party.party_plan?.addons || [])
      return { success: true }
    }
    return result
  }

  const hasAddon = (addonId) => {
    return addons?.some(addon => addon.id === addonId) || false
  }

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

  const handlePaymentReady = () => {
    router.push('/payment')
  }

  // Notification handlers
  const handleDismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
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

  // Loading state
  if (!themeLoaded || loading) {
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
    <div className="min-h-screen bg-primary-50  w-screen overflow-hidden">
      <ContextualBreadcrumb currentPage="dashboard"/>
      <EnquirySuccessBanner />

      {/* Real-time notifications */}
      <RealTimeNotifications 
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
      
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
        <PartyHeader 
          theme={partyTheme} 
          partyDetails={partyDetails}
          onPartyDetailsChange={handlePartyDetailsUpdate}
          isPaymentConfirmed={isPaymentConfirmed}
        />

        {/* Payment confirmed state */}
        {isPaymentConfirmed && (
          <div className="mb-8">
            <PostPaymentSuccessSection
              suppliers={suppliers}
              enquiries={enquiries}
              partyDetails={partyDetails}
              paymentDetails={paymentDetails}
            />
          </div>
        )}

        {/* Enquiries sent but not paid yet */}
        {enquiriesSent && !isPaymentConfirmed && (
          <div className="mb-8">
            <SnappysPresentParty
              suppliers={suppliers}
              enquiries={enquiries}
              timeRemaining={timeRemaining}
              onPaymentReady={handlePaymentReady}
              showPaymentCTA={allConfirmed}
            />
          </div>
        )}

        {/* Auto-replacement notifications */}
        {replacements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supplier Updates
            </h3>
            <AutoReplacementFlow
              replacements={replacements}
              onApproveReplacement={(id) => console.log('Approved:', id)}
              onViewSupplier={(id) => console.log('View supplier:', id)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
            {/* Desktop Header */}
            <div className="hidden md:flex justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-primary-700">
                  {isPaymentConfirmed ? 'Your Confirmed Party Team! 🎉' : 'Your Party Team! 🎉'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isPaymentConfirmed 
                    ? 'All suppliers confirmed and ready for your party'
                    : 'Amazing suppliers to make your day perfect'
                  }
                </p>
              </div>
              {!isPaymentConfirmed && (
                <button 
                  onClick={handleAddSupplier} 
                  className="bg-primary-500 px-4 py-3 text-white hover:bg-[hsl(var(--primary-700))] rounded"
                >
                  Add New Supplier
                </button>
              )}
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
                  enquiryStatus={getEnquiryStatus(type)}
                  isSignedIn={true} // Always signed in for database dashboard
                  isPaymentConfirmed={isPaymentConfirmed}
                  enquiries={enquiries}
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
                getEnquiryStatus={getEnquiryStatus}
                isSignedIn={true}
                isPaymentConfirmed={isPaymentConfirmed}
                enquiries={enquiries}
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
            {!isPaymentConfirmed && (
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
            )}
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {!isPaymentConfirmed && (
              <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <BudgetControls {...budgetControlProps} />
              </Card>
            )}
            
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
      {!isPaymentConfirmed && (
        <MobileBudgetBar 
          totalSpent={totalCost}
          tempBudget={tempBudget}
          budgetControlProps={budgetControlProps}
        />
      )}

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

// ===================================================================
// 4. POST PAYMENT SUCCESS SECTION COMPONENT 
// ===================================================================
import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

function PostPaymentSuccessSection({ suppliers, enquiries, partyDetails, paymentDetails }) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600">
            Your party deposit has been paid and your suppliers are ready to go
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your suppliers will contact you within 24 hours</li>
            <li>• Use the contact buttons below to reach them directly</li>
            <li>• Discuss final details and arrangements</li>
            <li>• Remaining balance due on party day: £{paymentDetails?.remainingBalance || 0}</li>
            <li>• Enjoy your magical party! ✨</li>
          </ul>
        </div>

        {/* Payment Summary */}
        {paymentDetails && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deposit paid:</span>
                <span className="font-bold text-green-600">£{paymentDetails.depositAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining balance:</span>
                <span className="font-bold text-gray-900">£{paymentDetails.remainingBalance}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                * Remaining balance due on party day
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}