"use client"

import { useState, useMemo, useEffect, use, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useContextualNavigation } from "@/hooks/useContextualNavigation"
import { useSupplier } from "@/utils/mockBackend"
import { useUserTypeDetection, getHandleAddToPlanBehavior } from '@/hooks/useUserTypeDetection'

import { supabase } from "@/lib/supabase"

import { Shield, Award, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { usePartyPlan } from '@/utils/partyPlanBackend'
import CakeCustomizationModal from "@/components/supplier/packages/CakeCustomizationModal"
import AddonSelectionModal from "@/components/supplier/addon-selection-modal"
import SupplierHeader from "@/components/supplier/supplier-header"
import SupplierPackages from "@/components/supplier/supplier-packages"
import SupplierReviews from "@/components/supplier/supplier-reviews"
import SupplierActionBar from "@/components/supplier/supplier-action-bar"
import AddingToPlanModal from "@/components/supplier/adding-to-plan-modal"
import NotificationPopup from "@/components/supplier/notification-popup"
import SupplierBadges from "@/components/supplier/supplier-badges"
import SupplierSidebar from "@/components/supplier/supplier-sidebar"
import MobileBookingBar from "@/components/supplier/mobile-booking-bar"
import AlaCarteModal from "../components/AddToCartModal"
import SupplierUnavailableModal from "@/components/supplier/supplier-unavailable-modal"
import SupplierPackagesRouter from "@/components/supplier/packages/SupplierPackagesRouter"


import SupplierServiceDetails from "@/components/supplier/supplier-service-details"
import ServiceDetailsDisplayRouter from "@/components/supplier/display/ServiceDetailsDisplayRouter"
import SupplierPortfolioGallery from "@/components/supplier/supplier-portfolio-gallery"
import SupplierCredentials from "@/components/supplier/supplier-credentials"
import SupplierQuickStats from "@/components/supplier/supplier-quick-stats"
import SupplierAvailabilityCalendar from "@/components/supplier/supplier-availability-calendar"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import AboutMeComponent from "@/components/supplier/about-me"
import PendingEnquiryModal from "@/components/supplier/PendingEnquiryModal"

import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { useSupplierData } from "../hooks/useSupplierData"
import { useSupplierBooking } from "../hooks/useSupplierBooking"
import { useSupplierAvailability } from "../hooks/useSupplierAvailability"
import { useSupplierModals } from "../hooks/useSupplierModals"
import { useSupplierEnquiries } from "../hooks/useSupplierEnquiries"
import { useReplacementMode } from "../hooks/useReplacementMode"
import { useSupplierNotifications } from "../hooks/useSupplierNotifications"

const SelectedDateBanner = ({ selectedDate, currentMonth, onClearDate }) => {
  if (!selectedDate || !currentMonth) return null
  
  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900 text-sm">
              Perfect! Party date selected
            </h4>
            <p className="text-sm text-green-700">
              {dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <button
          onClick={onClearDate}
          className="text-sm text-green-700 hover:text-green-800 underline transition-colors"
        >
          Change date
        </button>
      </div>
    </div>
  )
}

// Move this function outside the component to prevent recreation on every render
const hasValidPartyPlanDebug = () => {
  try {
    const localPlan = localStorage.getItem('user_party_plan')
    const localDetails = localStorage.getItem('party_details')
    
    if (!localPlan && !localDetails) {
      return false
    }
    
    let hasValidPlan = false
    let hasValidDetails = false
    
    if (localPlan) {
      try {
        const parsedPlan = JSON.parse(localPlan)
        const supplierCategories = ['venue', 'entertainment', 'catering', 'facePainting', 'activities', 'partyBags', 'decorations', 'balloons']
        
        const validSuppliers = supplierCategories.filter(category => {
          const supplier = parsedPlan[category]
          return supplier && typeof supplier === 'object' && supplier.name
        })
        
        hasValidPlan = validSuppliers.length > 0
      } catch (error) {
        hasValidPlan = false
      }
    }
    
    if (localDetails) {
      try {
        const parsedDetails = JSON.parse(localDetails)
        const checks = {
          hasTheme: parsedDetails.theme && parsedDetails.theme !== 'general',
          hasDate: !!parsedDetails.date,
          hasChildName: parsedDetails.childName && parsedDetails.childName !== 'Emma',
          hasGuestCount: !!parsedDetails.guestCount,
          hasPostcode: !!parsedDetails.postcode,
          isAlaCarteSource: parsedDetails.source === 'a_la_carte'
        }
        
        hasValidDetails = Object.values(checks).some(check => check)
      } catch (error) {
        hasValidDetails = false
      }
    }
    
    return hasValidPlan || hasValidDetails
  } catch (error) {
    console.error('❌ Error in hasValidPartyPlan:', error)
    return false
  }
}


export default function SupplierProfilePage({ backendSupplier }) {
  const router = useRouter()


  const { userType, userContext, loading: userTypeLoading } = useUserTypeDetection()
  const { partyPlan, addSupplier, addAddon, removeAddon, hasAddon } = usePartyPlan()
  const { navigateWithContext, navigationContext } = useContextualNavigation()

  
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

// 2. Call the data hook first (no selectedPackageId needed)
const { supplier, packages: basePackages, portfolioImages, credentials, reviews, isCakeSupplier } = 
  useSupplierData(backendSupplier)

 useEffect(() => {
  const getPartyId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const partyIdResult = await partyDatabaseBackend.getCurrentPartyId()
        if (partyIdResult.success) {
          console.log('🎯 Dashboard got party ID:', partyIdResult.partyId)
          setCurrentPartyId(partyIdResult.partyId)
        }
      }
    } catch (error) {
      console.error('❌ Error getting party ID:', error)
    }
  }
  getPartyId()
}, [])

useEffect(() => {
  if (!userTypeLoading && backendSupplier) {
    // Small delay to ensure smooth transition
    setTimeout(() => setIsLoaded(true), 100)
  }
}, [userTypeLoading, backendSupplier])


const modals = useSupplierModals()
const replacement = useReplacementMode()
const notifications = useSupplierNotifications()
const availability = useSupplierAvailability(supplier)
const enquiries = useSupplierEnquiries(userContext?.currentPartyId)
const booking = useSupplierBooking(
  supplier, 
  basePackages,  // Pass the base packages
  backendSupplier, 
  userType, 
  userContext, 
  enquiries.enquiryStatus, 
  availability.selectedDate,        // ← Use availability hook
  availability.currentMonth,        // ← Use availability hook
  availability.checkSupplierAvailability,  // ← Use availability hook
  availability.getSelectedCalendarDate,    // ← Use availability hook
  availability.getSelectedCalendarDate,
  replacement.replacementContext  
)

const packages = booking.packages



  const handleAddToPlanWithModals = async (...args) => {
    const result = await booking.handleAddToPlan(...args)
    
    if (result.showPendingEnquiry) {
      modals.openPendingEnquiryModal()
    } else if (result.showDatePicker) {
      modals.handleModalFlow('showDatePicker')
    } else if (result.showUnavailableModal) {
      modals.handleModalFlow('showUnavailableModal', { unavailableDate: result.unavailableDate })
    } else if (result.showAlaCarteModal) {
      modals.openAlaCarteModal()
    } else if (result.showAddonModal) {
      modals.openAddonModal()
    } else if (result.success) {
      notifications.showSuccess(result.message)  // ← Use notifications hook
    } else if (!result.success) {
      notifications.showError(result.message)    // ← Use notifications hook
    }
  }



  const handleAddonConfirm = useCallback((addonData) => {
    setSelectedAddons(addonData.addons)
    setFinalPackageData(addonData)
    setShowAddonModal(false)

    // addonData.addons.forEach(addon => {
    //   const enhancedAddon = {
    //     ...addon,
    //     supplierId: supplier?.id,
    //     supplierName: supplier?.name,
    //     packageId: addonData.package?.id,
    //     addedAt: new Date().toISOString()
    //   }
    //   addAddon(enhancedAddon)
    // })
    
    handleAddToPlan(true, addonData)
  }, [supplier, addAddon, booking.handleAddToPlan])
  
  const handleAddonModalClose = useCallback(() => {
    setShowAddonModal(false)
    setSelectedAddons([])
    setFinalPackageData(null)
  }, [])


  if (hasLoadedOnce && (supplierError || !supplier)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {supplierError ? "Error Loading Supplier" : "Oops! Supplier Not Found"}
        </h1>
        <p className="text-gray-600 mb-6">
          {supplierError
            ? "We encountered an error trying to load the supplier details. Please try again later."
            : "We couldn't find the supplier you're looking for. It might have been removed or the link is incorrect."}
        </p>
        <Button onClick={() => router.push("/")}>Go to Homepage</Button>
      </div>
    )
  }

  // UPDATE your loading check to include user type loading:
if (userTypeLoading) {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Detecting user type...</p>
        <p className="text-sm text-gray-500 mt-2">
          User type: {userType || 'detecting...'} | Data source: {userContext?.dataSource || 'unknown'}
        </p>
      </div>
    </div>
  )
}


  return (
    <div className="bg-[#F4F5F7] min-h-screen font-sans">

      <NotificationPopup notification={notifications.notification} />

 
      <SupplierUnavailableModal
  isOpen={modals.showUnavailableModal}
  onClose={modals.closeUnavailableModal}  // ← Use modals hook
  supplier={supplier}
  selectedDate={availability.getSelectedCalendarDate()}
  onSelectNewDate={() => modals.handleSelectNewDate(availability.setSelectedDate)}  // ← Pass the setter
  onViewAlternatives={() => modals.handleViewAlternatives(supplier, availability.getSelectedCalendarDate, router)}  // ← Pass required params
/>
      <ContextualBreadcrumb currentPage="supplier-detail" supplierName={backendSupplier?.name} />


      
      <SupplierHeader
        supplier={supplier}
        portfolioImages={portfolioImages}
        getSupplierInPartyDetails={booking.getSupplierInPartyDetails}
        getAddToPartyButtonState={booking.getAddToPartyButtonState}
        handleAddToPlan={handleAddToPlanWithModals}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">

          <SupplierPackagesRouter
  supplier={supplier}
  packages={packages}
  selectedPackageId={booking.selectedPackageId}
  setSelectedPackageId={booking.setSelectedPackageId}
  handleAddToPlan={booking.handleAddToPlan}
  getAddToPartyButtonState={booking.getAddToPartyButtonState}
  getSupplierInPartyDetails={booking.getSupplierInPartyDetails}
  onShowNotification={notifications.setNotification}
  isReplacementMode={replacement.isReplacementMode} 
/>


            {/* NEW: Add selected date confirmation */}
  <SelectedDateBanner 
    selectedDate={availability.selectedDate}
    currentMonth={availability.currentMonth}
    onClearDate={() => availability.setSelectedDate(null)}
  />
    <ServiceDetailsDisplayRouter supplier={supplier} />
            <SupplierPortfolioGallery 
              portfolioImages={supplier?.portfolioImages || []} 
              portfolioVideos={supplier?.portfolioVideos || []}
            />
            <SupplierCredentials credentials={credentials} />
            <SupplierReviews reviews={reviews} />
            <SupplierBadges supplier={supplier} />
            <SupplierQuickStats supplier={supplier} />
            <AboutMeComponent supplier={supplier} />
          </main>
          
          <aside className="hidden md:block lg:col-span-1">
            <SupplierSidebar
              supplier={supplier}
              packages={packages}
              selectedPackageId={booking.selectedPackageId}
              handleAddToPlan={handleAddToPlanWithModals}
              getAddToPartyButtonState={booking.getAddToPartyButtonState}
              currentMonth={availability.currentMonth}
              setCurrentMonth={availability.setCurrentMonth}
              selectedDate={availability.selectedDate}
              setSelectedDate={availability.setSelectedDate}
              credentials={credentials}
              isFromDashboard={availability.isFromDashboard()}
              partyDate={availability.getPartyDate()}
              openCakeModal={modals.openCakeModal}
              showCakeModal={modals.showCakeModal}
              isCakeSupplier={isCakeSupplier}
            />
          </aside>
        </div>
      </div>

      <SupplierActionBar
        supplierPhoneNumber={supplier.phone}
        getAddToPartyButtonState={() => booking.getAddToPartyButtonState(selectedPackageId)}
        handleAddToPlan={booking.handleAddToPlan}
      />

      <AddonSelectionModal
        isOpen={modals.showAddonModal}
        onClose={handleAddonModalClose}
        onConfirm={handleAddonConfirm}
        supplier={supplier}
        selectedPackage={packages.find(pkg => pkg.id === booking.selectedPackageId)}
        isEntertainer={supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"}
      />

      <AddingToPlanModal
        isAddingToPlan={booking.isAddingToPlan}
        loadingStep={booking.loadingStep}
        theme={partyPlan?.theme || "default"}
        progress={booking.progress}
      />




<MobileBookingBar 
  selectedPackage={packages.find(pkg => pkg.id === booking.selectedPackageId) || packages[0] || null}
  supplier={supplier}
  onAddToPlan={handleAddToPlanWithModals}
  addToPlanButtonState={booking.getAddToPartyButtonState(booking.selectedPackageId)}
  selectedDate={availability.selectedDate}
  currentMonth={availability.currentMonth}
  setSelectedDate={availability.setSelectedDate}
  setCurrentMonth={availability.setCurrentMonth}
  hasValidPartyPlan={availability.hasPartyDate}  // ← Use availability hook function
  isFromDashboard={availability.isFromDashboard()}  // ← Call the function
  partyDate={availability.getPartyDate()}  // ← Call the function
  onSaveForLater={(data) => {
    notifications.showSaveForLater(supplier.name)  // ← Use notifications hook
  }}
  showAddonModal={modals.showAddonModal}
  setShowAddonModal={modals.setShowAddonModal}
  onAddonConfirm={(addonData) => modals.handleAddonConfirm(addonData, handleAddToPlanWithModals)}  // ← Use modals hook handler
  isAddingToPlan={booking.isAddingToPlan}
  hasEnquiriesPending={enquiries.hasEnquiriesPending}
  onShowPendingEnquiryModal={modals.openPendingEnquiryModal}  // ← Use modals hook
  pendingCount={enquiries.getPendingEnquiriesCount()}
  isReplacementMode={replacement.isReplacementMode}  // ← Use replacement hook
  replacementSupplierName={replacement.replacementSupplierName}  // ← Use replacement hook
  onReturnToReplacement={replacement.handleReturnToReplacement}  // ← Use replacement hook
  packages={packages}
  openCakeModal={modals.openCakeModal}
  showCakeModal={modals.showCakeModal}
  isCakeSupplier={isCakeSupplier}
/>


{modals.showCakeModal && isCakeSupplier && modals.selectedPackageForCake && (
 <CakeCustomizationModal
 isOpen={modals.showCakeModal}
 onClose={modals.closeCakeModal}
 supplier={supplier}
 selectedPackage={modals.selectedPackageForCake}
 onConfirm={(enhancedPackage) => modals.handleCakeConfirm(enhancedPackage, handleAddToPlanWithModals)}
/>
)}


{modals.showAlaCarteModal && supplier && (
  <AlaCarteModal
    isOpen={modals.showAlaCarteModal}
    onClose={() => modals.setShowAlaCarteModal(false)}
    supplier={supplier}
    selectedPackage={packages.find(pkg => pkg.id === booking.selectedPackageId)}
    onBuildFullParty={() => {
      setShowAlaCarteModal(false)
      router.push('/party-builder')
    }}
    onJustBookSupplier={booking.handleAlaCarteBookingEnhanced} // ✅ Use enhanced handler
    preSelectedDate={availability.getSelectedCalendarDate()} 
  />
)}
<PendingEnquiryModal
  isOpen={modals.showPendingEnquiryModal}
  onClose={modals.closePendingEnquiryModal}
  supplier={supplier}
  pendingCount={enquiries.getPendingEnquiriesCount()}
  enquiries={enquiries.getPendingEnquiries()}
  estimatedResponseTime="24 hours"
  onViewDashboard={() => {
    modals.closePendingEnquiryModal()
    router.push('/dashboard')
  }}
/>
    </div>
  )
}