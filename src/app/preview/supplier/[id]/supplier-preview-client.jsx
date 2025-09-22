// app/preview/supplier/[id]/preview-supplier-page-client.js
"use client"

import { useState, useMemo, useEffect, use, useCallback } from "react"

import { Button } from "@/components/ui/button"

import { Shield, Award, CheckCircle, AlertCircle, Calendar } from "lucide-react"

import SupplierHeader from "@/components/supplier/supplier-header"
import SupplierReviews from "@/components/supplier/supplier-reviews"
import SupplierBadges from "@/components/supplier/supplier-badges"
import SupplierPackagesRouter from "@/components/supplier/packages/SupplierPackagesRouter"
import SupplierServiceDetails from "@/components/supplier/supplier-service-details"
import ServiceDetailsDisplayRouter from "@/components/supplier/display/ServiceDetailsDisplayRouter"
import SupplierPortfolioGallery from "@/components/supplier/supplier-portfolio-gallery"
import SupplierCredentials from "@/components/supplier/supplier-credentials"
import SupplierQuickStats from "@/components/supplier/supplier-quick-stats"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import AboutMeComponent from "@/components/supplier/about-me"

import { useSupplierData } from "@/app/(main)/supplier/hooks/useSupplierData"
import SnappyLoader from "@/components/ui/SnappyLoader"

// Preview-specific components (non-interactive versions)
import PreviewSupplierActionBar from "./preview-components/PreviewSupplierActionBar"
import PreviewMobileBookingBar from "./preview-components/PreviewMobileBookingBar"
import MockSupplierSidebar from "./preview-components/MockSupplierSidebar"
import { PreviewContextualBreadcrumb } from "./preview-components/PreviewContextualBreadcrumb"

export default function PreviewSupplierPageClient({ backendSupplier }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  
  // Call the data hook
  const { supplier, packages: basePackages, portfolioImages, credentials, reviews, isCakeSupplier } = 
    useSupplierData(backendSupplier)

  // Hardcoded dates for preview - doesn't matter what they are
  const previewDate = new Date('2025-02-15')
  const [selectedPackageId, setSelectedPackageId] = useState(basePackages?.[0]?.id || null)
  const [selectedDate, setSelectedDate] = useState(previewDate)
  const [currentMonth, setCurrentMonth] = useState(previewDate)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00')
  const [showCakeModal, setShowCakeModal] = useState(false)

  useEffect(() => {
    if (backendSupplier && supplier) {
      // Small delay to ensure smooth transition, then hide loader
      setTimeout(() => {
        setIsLoaded(true)
        setShowLoader(false)
      }, 500) // Reduced delay since we're showing loader immediately
    }
  }, [backendSupplier, supplier])

  useEffect(() => {
    // Scroll to top when component mounts or when supplier changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [backendSupplier?.id]) // Re-run when supplier ID changes

  // Preview functions (non-functional but return proper data structures)
  const previewFunctions = {
    handleAddToPlan: () => {
      console.log('Preview mode - Add to plan disabled')
    },
    getAddToPartyButtonState: (packageId) => ({ 
      text: 'Add to Party Plan', 
      disabled: true, 
      variant: 'default' 
    }),
    getSupplierInPartyDetails: () => ({
      inParty: false,
      supplierData: null,
      category: null
    }),
    selectedPackageId,
    setSelectedPackageId: () => {}, // Disabled in preview
    selectedDate: previewDate, // Use hardcoded date
    setSelectedDate: () => {}, // Disabled in preview
    currentMonth: previewDate, // Use hardcoded date
    setCurrentMonth: () => {}, // Disabled in preview
    selectedTimeSlot,
    setSelectedTimeSlot: () => {}, // Disabled in preview
    openCakeModal: () => {},
    showCakeModal
  }

  const getPartyDuration = () => {
    return 2 // Default duration for preview
  }

  // Show loader immediately while data is processing
  if (showLoader || !supplier || !isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading Your Supplier Preview" />
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
          We couldn't find the supplier you're looking for in preview mode.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen font-sans">
      {/* Preview overlay to disable interactions */}
      <div className="fixed inset-0 bg-transparent z-40 pointer-events-none" />
      
      <PreviewContextualBreadcrumb 
        currentPage="supplier-detail" 
        supplierName={backendSupplier?.name}
      />

      <SupplierHeader
        supplier={supplier}
        portfolioImages={portfolioImages}
        getSupplierInPartyDetails={previewFunctions.getSupplierInPartyDetails}
        getAddToPartyButtonState={previewFunctions.getAddToPartyButtonState}
        handleAddToPlan={previewFunctions.handleAddToPlan}
        isPreview={true}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2 space-y-8">
            <SupplierPackagesRouter
              supplier={supplier}
              packages={basePackages}
              selectedPackageId={previewFunctions.selectedPackageId}
              setSelectedPackageId={previewFunctions.setSelectedPackageId}
              handleAddToPlan={previewFunctions.handleAddToPlan}
              getAddToPartyButtonState={previewFunctions.getAddToPartyButtonState}
              getSupplierInPartyDetails={previewFunctions.getSupplierInPartyDetails}
              onShowNotification={() => {}}
              isReplacementMode={false} 
              selectedDate={previewFunctions.selectedDate} 
              partyDuration={getPartyDuration()}
              isPreview={true}
            />

            <ServiceDetailsDisplayRouter supplier={supplier} isPreview={true} />
            <SupplierPortfolioGallery 
              portfolioImages={supplier?.portfolioImages || []} 
              portfolioVideos={supplier?.portfolioVideos || []}
              isPreview={true}
            />
            <SupplierCredentials credentials={credentials} isPreview={true} />
            <SupplierReviews reviews={reviews} isPreview={true} />
            <SupplierBadges supplier={supplier} isPreview={true} />
            <SupplierQuickStats supplier={supplier} isPreview={true} />
            <AboutMeComponent supplier={supplier} isPreview={true} />
          </main>
          
          <aside className="hidden md:block lg:col-span-1">
            <MockSupplierSidebar
              supplier={supplier}
              packages={basePackages}
              selectedPackageId={previewFunctions.selectedPackageId}
              credentials={credentials}
              isCakeSupplier={isCakeSupplier}
            />
          </aside>
        </div>
      </div>

      <PreviewSupplierActionBar
        supplierPhoneNumber={supplier.phone}
        getAddToPartyButtonState={() => previewFunctions.getAddToPartyButtonState()}
        handleAddToPlan={previewFunctions.handleAddToPlan}
      />

      <PreviewMobileBookingBar 
        selectedPackage={basePackages?.find(pkg => pkg.id === previewFunctions.selectedPackageId) || basePackages?.[0] || null}
        supplier={supplier}
        onAddToPlan={previewFunctions.handleAddToPlan}
        addToPlanButtonState={previewFunctions.getAddToPartyButtonState()}
        selectedDate={previewFunctions.selectedDate}
        currentMonth={previewFunctions.currentMonth}
        setSelectedDate={previewFunctions.setSelectedDate}
        setCurrentMonth={previewFunctions.setCurrentMonth}
        hasValidPartyPlan={true}
        isFromDashboard={() => false}
        partyDate={() => previewDate}
        onSaveForLater={() => {}}
        showAddonModal={false}
        setShowAddonModal={() => {}}
        onAddonConfirm={() => {}}
        isAddingToPlan={false}
        hasEnquiriesPending={false}
        onShowPendingEnquiryModal={() => {}}
        pendingCount={0}
        isReplacementMode={false}
        replacementSupplierName=""
        onReturnToReplacement={() => {}}
        packages={basePackages}
        openCakeModal={previewFunctions.openCakeModal}
        showCakeModal={previewFunctions.showCakeModal}
        isCakeSupplier={isCakeSupplier}
        databasePartyData={null}
        userType="preview"
        enableSmartPricing={true}
        showWeekendPricing={true}
      />
    </div>
  )
}