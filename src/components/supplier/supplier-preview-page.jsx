"use client"

import { useState, useMemo, useEffect, use, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { useContextualNavigation } from "@/hooks/useContextualNavigation"

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
import AlaCarteModal from "@/app/(main)/supplier/components/AddToCartModal"
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
import { useSupplierData } from "@/app/(main)/supplier/hooks/useSupplierData"
import { useSupplierBooking } from "@/app/(main)/supplier/hooks/useSupplierBooking"
import { useSupplierAvailability } from "@/app/(main)/supplier/hooks/useSupplierAvailability"
import { useSupplierModals } from "@/app/(main)/supplier/hooks/useSupplierModals"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import { useReplacementMode } from "@/app/(main)/supplier/hooks/useReplacementMode"
import { useSupplierNotifications } from "@/app/(main)/supplier/hooks/useSupplierNotifications"

import SnappyLoader from "@/components/ui/SnappyLoader"



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


export default function SupplierPreviewPage({ backendSupplier, isPreview = true }) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Only use the data hook - no booking, modals, or user interaction hooks
  const { 
    supplier, 
    packages: basePackages, 
    portfolioImages, 
    credentials, 
    reviews, 
    isCakeSupplier 
  } = useSupplierData(backendSupplier)

  useEffect(() => {
    if (backendSupplier) {
      setTimeout(() => setIsLoaded(true), 100)
    }
  }, [backendSupplier])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [backendSupplier?.id])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading Supplier Preview" />
      </div>      
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Supplier Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn't find the supplier you're looking for.
        </p>
      </div>
    )
  }

  // Add debugging and proper date handling
  const currentDate = new Date()
  
  console.log('Preview currentDate:', currentDate, 'Type:', typeof currentDate)

  const previewProps = {
    currentMonth: currentDate, // Use the date variable
    selectedDate: null,
    selectedTimeSlot: null,
    setCurrentMonth: () => {},
    setSelectedDate: () => {},
    setSelectedTimeSlot: () => {},
    handleAddToPlan: () => {},
    getAddToPartyButtonState: () => ({ text: "Contact Supplier", disabled: true }),
    getSupplierInPartyDetails: () => ({ inParty: false, selectedPackageId: null }),
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen font-sans">
      {/* Preview indicator */}
      {isPreview && (
        <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
          Preview Mode - Contact supplier directly to book
        </div>
      )}

      {/* Use the same header as main page */}
      <SupplierHeader
        supplier={supplier}
        portfolioImages={portfolioImages}
        getSupplierInPartyDetails={() => ({ inParty: false, selectedPackageId: null })}
        getAddToPartyButtonState={() => ({ 
          text: "Contact Supplier", 
          disabled: true, 
          variant: "outline" 
        })}
        handleAddToPlan={() => {}}
        isPreview={true}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">
            {/* Use the same packages component as main page */}
            <SupplierPackagesRouter
              supplier={supplier}
              packages={basePackages}
              selectedPackageId={basePackages?.[0]?.id || null}
              setSelectedPackageId={() => {}} // Disabled in preview
              handleAddToPlan={() => {}}
              getAddToPartyButtonState={() => ({ text: "Contact Supplier", disabled: true })}
              getSupplierInPartyDetails={() => ({ inParty: false, selectedPackageId: null })}
              onShowNotification={() => {}}
              isReplacementMode={false}
              selectedDate={null}
              partyDuration={2}
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
            {/* Use the same sidebar as main page */}
            <SupplierSidebar
              supplier={supplier}
              packages={basePackages}
              selectedPackageId={basePackages?.[0]?.id || null}
              handleAddToPlan={() => {}} // Disabled in preview
              getAddToPartyButtonState={() => ({ text: "Contact Supplier", disabled: true })}
              currentMonth={new Date().getMonth()}
              setCurrentMonth={() => {}} // Disabled in preview
              selectedDate={null}
              setSelectedDate={() => {}} // Disabled in preview
              selectedTimeSlot={null}
              setSelectedTimeSlot={() => {}} // Disabled in preview
              credentials={credentials}
              isFromDashboard={false}
              partyDate={null}
              partyTimeSlot={null}
              openCakeModal={() => {}} // Disabled in preview
              showCakeModal={false}
              isCakeSupplier={isCakeSupplier}
              showWeekendPricing={true}
              enableSmartPricing={true}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}