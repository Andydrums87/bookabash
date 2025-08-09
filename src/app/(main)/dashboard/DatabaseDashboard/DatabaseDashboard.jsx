// 1. Main Dashboard Component (DatabaseDashboard.jsx) - Much cleaner!
"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"

// Hooks
import { usePartyData } from '../hooks/usePartyData'
import { useReplacementManager } from '../hooks/useReplacementManager'
import { usePartyPhase } from '../hooks/usePartyPhase'
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { usePartyDetails } from "../hooks/usePartyDetails"
import { useBudgetManager } from "../hooks/useBudgetManager"

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
import MobileBudgetBar from "../components/MobileBudgetBar"


// Modals
import WelcomeDashboardPopup from "@/components/welcome-dashboard-popup"


export default function DatabaseDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { navigateWithContext } = useContextualNavigation()

  const [isUpdating, setIsUpdating] = useState(false)
  const [hasCreatedInvites, setHasCreatedInvites] = useState(false)



 const {
  partyData,
  partyId,
  totalCost,
  addons,
  loading,
  user,
  currentParty,
  refreshPartyData,
  handleAddAddon,
  handleRemoveAddon,
  

  handlePartyDetailsUpdate
} = usePartyData()



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

console.log('🔍 DEBUG partyData.einvites:', JSON.stringify(partyData?.einvites, null, 2))

  const {     
    partyDetails,     
    partyTheme,     
    themeLoaded,     
    handleNameSubmit,     
    handlePartyDetailsUpdate: originalHandlePartyDetailsUpdate   
  } = usePartyDetails(user, currentParty)

  // Replacement system
  const {
    replacements,
    isProcessingRejection,
    handleApproveReplacement,
    handleViewSupplier,
    handleDismissReplacement
  } = useReplacementManager(partyId, partyData, refreshPartyData)

  // Phase and UI state
  const {
    partyPhase,
    visibleSuppliers,
    hasEnquiriesPending,
    enquiries,
    isPaymentConfirmed,
    paymentDetails
  } = usePartyPhase(partyData, partyId)


  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [notifications, setNotifications] = useState([])
  const welcomePopupShownRef = useRef(false)

  // Handle welcome popup
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

  // Navigation handlers
  const handleAddSupplier = () => navigateWithContext('/browse', 'dashboard')
  const handlePaymentReady = () => router.push('/payment')
  const handleCreateInvites = () => window.location.href = "/e-invites"
  const handleDismissNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  // Loading state
  if (loading || !themeLoaded) {
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
    <div className="min-h-screen bg-primary-50 w-screen overflow-hidden">
      <ContextualBreadcrumb currentPage="dashboard"/>
      <EnquirySuccessBanner />
      <EInvitesBanner 
        hasCreatedInvites={false} 
        isBookingPending={true} 
        onCreateInvites={handleCreateInvites} 
      />
      
      <div className="container min-w-screen px-4 sm:px-6 lg:px-8 py-8">
        <PartyHeader 
          theme={partyTheme}
          partyDetails={partyDetails}
          onPartyDetailsChange={handlePartyDetailsUpdate}
          isPaymentConfirmed={isPaymentConfirmed}
          enquiries={enquiries}
          isSignedIn={true}
        />

        {/* Replacement Manager */}
        <ReplacementManager
          replacements={replacements}
          isProcessingRejection={isProcessingRejection}
          onApproveReplacement={handleApproveReplacement}
          onViewSupplier={handleViewSupplier}
          onDismiss={handleDismissReplacement}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-8">
           

            {/* Supplier Grid */}
            <SupplierGrid
              suppliers={visibleSuppliers}
              enquiries={enquiries}
              addons={addons}
              onRemoveAddon={handleRemoveAddon}
              hasEnquiriesPending={hasEnquiriesPending}
              isPaymentConfirmed={isPaymentConfirmed}
              onAddSupplier={handleAddSupplier}
   
            />
             {/* Phase-specific content */}
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
            />

            {/* Add-ons and Recommendations */}
            <div className="w-screen pr-6 md:pr-20">
              {/* Add-ons and recommended add-ons components */}
            </div>
          </main>

          {/* Sidebar */}
          <Sidebar
            partyData={partyData}
            partyDate= {partyDetails?.date}
            totalCost={totalCost}
            isPaymentConfirmed={isPaymentConfirmed}
          />

        </div>
      </div>

      {/* Mobile Budget Bar */}
      {!isPaymentConfirmed && (
        <MobileBudgetBar totalSpent={totalCost} />
      )}

      {/* Modals */}
      <WelcomeDashboardPopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
      />
    </div>
  )
}