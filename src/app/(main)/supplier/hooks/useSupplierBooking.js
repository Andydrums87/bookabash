// components/supplier/hooks/useSupplierBooking.js
"use client"

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { usePartyPlan } from '@/utils/partyPlanBackend'
import { useUserTypeDetection, getHandleAddToPlanBehavior } from '@/hooks/useUserTypeDetection'
import { useContextualNavigation } from "@/hooks/useContextualNavigation"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { supabase } from "@/lib/supabase"

export const useSupplierBooking = (
  supplier, 
  packages, 
  backendSupplier, 
  userType, 
  userContext, 
  enquiryStatus,
  selectedDate,
  currentMonth,
  checkSupplierAvailability,
  getSelectedCalendarDate,
  replacementContext
) => {
  const router = useRouter()
  const { partyPlan, addSupplier, addAddon, removeAddon, hasAddon } = usePartyPlan()
  const { navigateWithContext, navigationContext } = useContextualNavigation()
  
  // Booking state
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [isAddingToPlan, setIsAddingToPlan] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [finalPackageData, setFinalPackageData] = useState(null)


  const getCategoryMappingForScroll = useCallback((category) => {
    const mapping = {
      'Entertainment': 'entertainment',
      'Venues': 'venue',
      'Venue': 'venue', 
      'Catering': 'catering',
      'Decorations': 'decorations',
      'Party Bags': 'partyBags',
      'Photography': 'photography',
      'Activities': 'activities',
      'Face Painting': 'facePainting',
      'Cakes': 'cakes',
      'Balloons': 'balloons'
    }
    
    return mapping[category] || 'entertainment'
  }, [])

  // Get supplier details in party plan (define this first)
  const getSupplierInPartyDetails = useCallback(() => {
    if (!supplier) return { inParty: false, currentPackage: null, supplierType: null }
    
    const isInAddons = hasAddon(supplier.id)
    
    // 🎂 ADD "cakes" to the mainSlots array
    const mainSlots = ["venue", "entertainment", "catering", "cakes", "facePainting", "activities", "partyBags"]
    
    const supplierInMainSlot = mainSlots.find((slot) => partyPlan[slot]?.id === supplier.id)

    if (isInAddons) {
      const addon = partyPlan.addons?.find((addon) => addon.id === supplier.id)
      return {
        inParty: true,
        currentPackage: addon?.packageId || null,
        supplierType: "addon",
        currentSupplierData: addon,
      }
    }
    
    if (supplierInMainSlot) {
      const supplierData = partyPlan[supplierInMainSlot]
      return {
        inParty: true,
        currentPackage: supplierData?.packageId || null,
        supplierType: supplierInMainSlot,
        currentSupplierData: supplierData,
      }
    }
    
    return { inParty: false, currentPackage: null, supplierType: null }
  }, [supplier, hasAddon, partyPlan])

  // Updated packages with popular flag based on selection
  const packagesWithPopular = useMemo(() => {
    return packages.map((pkg, index) => ({
      ...pkg,
      popular: pkg.id === selectedPackageId || (!selectedPackageId && index === 0)
    }))
  }, [packages, selectedPackageId])

  // Set initial package selection
  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      const partyDetails = getSupplierInPartyDetails()
      
      if (partyDetails.inParty && partyDetails.currentPackage) {
        setSelectedPackageId(partyDetails.currentPackage)
      } else {
        setSelectedPackageId(packages[0].id)
      }
    }
  }, [packages, selectedPackageId, getSupplierInPartyDetails])



const handleAddToPlan = useCallback(async (skipAddonModal = false, addonData = null) => {

  if (!supplier || !selectedPackageId) {
    return { 
      success: false, 
      message: "Please select a package first." 
    }
  }
  
  // ✅ CHECK IF WE CAME FROM REVIEW-BOOK - IMPORTANT CHECK AT THE START
  const urlParams = new URLSearchParams(window.location.search)
  const fromReviewBook = urlParams.get('from') === 'review-book-missing'
  
  // Get behavior based on user type
  const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
  console.log('🚀 Behavior:', behavior)
  
  // 1. DATE PICKER FLOW
  if (behavior.shouldShowDatePicker) {
    console.log('📅 Showing date picker prompt')
    return { 
      showDatePicker: true,
      message: "📅 Please select an available date from the calendar below first!"
    }
  }

  // 2. AVAILABILITY CHECK #1 - Calendar selected dates
  if (selectedDate && currentMonth) {
    const dateString = getSelectedCalendarDate()
    
    if (dateString) {
      const isAvailable = checkSupplierAvailability(dateString)
      console.log('🔍 Calendar date availability result:', isAvailable)
      
      if (!isAvailable) {
        console.log('🚫 Supplier unavailable on calendar selected date')
        return { showUnavailableModal: true }
      }
    }
  }

  // 3. AVAILABILITY CHECK #2 - Party dates from storage/database
  if (!selectedDate && (userType === 'LOCALSTORAGE_USER' || userType === 'DATABASE_USER' || userType === 'MIGRATION_NEEDED')) {
    let partyDateToCheck = null
    
    // For localStorage users
    if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          partyDateToCheck = parsed.date
        }
      } catch (error) {
        console.log('❌ Could not parse party details for date check:', error)
      }
    }
    
    // For database users
    if (userType === 'DATABASE_USER' && userContext?.partyData?.date) {
      partyDateToCheck = userContext.partyData.date
    }
    
    if (partyDateToCheck) {
      const isAvailable = checkSupplierAvailability(partyDateToCheck)
      
      if (!isAvailable) {
        console.log('🚫 Supplier unavailable on party date')
        return { 
          showUnavailableModal: true,
          unavailableDate: partyDateToCheck
        }
      }
    }
  }

  // 4. À LA CARTE FLOW
  if (behavior.shouldShowAlaCarteModal) {
    console.log('🎪 Opening à la carte modal for anonymous user with date')
    return { showAlaCarteModal: true }
  }
  
  // 5. CATEGORY OCCUPATION CHECK - Database users
  if (behavior.shouldCheckCategoryOccupation && userType === 'DATABASE_USER' && userContext?.currentPartyId) {
    console.log('🔍 Checking category occupation for database user')
    try {
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      if (partyResult.success && partyResult.party?.party_plan) {
        const dbPartyPlan = partyResult.party.party_plan
        
        const categoryMap = {
          'Entertainment': 'entertainment',
          'Venues': 'venue', 
          'Catering': 'catering',
          'Decorations': 'decorations',
          'Party Bags': 'partyBags',
          'Photography': 'photography',
          'Activities': 'activities',
          'Face Painting': 'facePainting',
          'Cakes': 'cakes',   
        }
        
        const slotName = categoryMap[supplier.category]
        const isSlotOccupied = slotName && dbPartyPlan[slotName] && dbPartyPlan[slotName].name
        
        if (isSlotOccupied) {
          console.log('🚫 Database user - category occupied, blocking')
          return {
            success: false,
            message: `You already have a ${supplier.category.toLowerCase()} provider (${dbPartyPlan[slotName].name}). Remove them first to add ${supplier.name}.`
          }
        }
      }
    } catch (error) {
      console.log('❌ Database check failed, continuing...', error)
      if (userType === 'DATABASE_USER') {
        return { 
          success: false,
          message: "Unable to verify party status. Please try again." 
        }
      }
    }
  }
  
  // 6. PACKAGE VALIDATION
  const selectedPkg = packagesWithPopular.find((pkg) => pkg.id === selectedPackageId)
  if (!selectedPkg) {
    return { 
      success: false, 
      message: "Selected package not found." 
    }
  }

  // 7. ADDON MODAL CHECK
  const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"
  const hasAddons = supplier?.serviceDetails?.addOnServices?.length > 0

  if (isEntertainer && hasAddons && !skipAddonModal && !addonData) {
    console.log('🎭 Showing addon modal')
    return { showAddonModal: true }
  }

  // 8. START ADDING PROCESS
  console.log('🚀 Starting add to plan process')
  
  // ✅ SKIP LOADING MODAL IF FROM REVIEW-BOOK (for faster UX)
  const shouldShowLoadingModal = !fromReviewBook
  
  if (shouldShowLoadingModal) {
    setIsAddingToPlan(true)
    setLoadingStep(0)
    setProgress(10)
  } else {
    console.log('🔄 Skipping loading modal for review-book flow')
  }

  try {
    // Prepare package data
    const packageToAdd = addonData?.package || selectedPkg
    const finalPrice = addonData ? addonData.totalPrice : selectedPkg.price
    
    const enhancedPackage = {
      ...packageToAdd,
      addons: addonData?.addons || [],
      originalPrice: selectedPkg.price,
      totalPrice: finalPrice,
      addonsPriceTotal: addonData ? (addonData.totalPrice - selectedPkg.price) : 0,
      cakeCustomization: packageToAdd.cakeCustomization || null,
      packageType: packageToAdd.packageType || 'standard',
      supplierType: packageToAdd.supplierType || 'standard'
    }

    console.log('🎯 Enhanced package:', enhancedPackage)
    if (shouldShowLoadingModal) setProgress(30)

    let result
    if (shouldShowLoadingModal) setLoadingStep(1)

    // 9. DATABASE USER FLOW
    if (userType === 'DATABASE_USER' && userContext?.currentPartyId) {
      console.log('📊 Database user - adding supplier to database')
      if (shouldShowLoadingModal) setProgress(50)
      
      const addResult = await partyDatabaseBackend.addSupplierToParty(
        userContext.currentPartyId,
        backendSupplier,
        enhancedPackage
      )
      
      if (shouldShowLoadingModal) setProgress(70)
      if (shouldShowLoadingModal) setLoadingStep(2)
      
      // ✅ NEW: Always send enquiry if user has pending enquiries
      // This ensures even when users can book, we still track enquiries
      if (addResult.success && (behavior.shouldSendEnquiry || (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0))) {
        console.log('📧 Sending auto-enquiry - either for empty category or user has pending enquiries')
        if (shouldShowLoadingModal) setLoadingStep(3)
        
        const enquiryReason = enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0
          ? `Added to party plan while managing ${enquiryStatus.pendingCount} other pending enquir${enquiryStatus.pendingCount === 1 ? 'y' : 'ies'}`
          : `Added to expand party team for your ${supplier.category.toLowerCase()} needs`
        
        const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
          userContext.currentPartyId,
          backendSupplier,
          enhancedPackage,
          enquiryReason
        )
        
        if (enquiryResult.success) {
          console.log('✅ Auto-enquiry sent successfully')
        }
      }
      
      result = addResult
    }
    // 10. LOCALSTORAGE USER FLOW
    else {
      console.log('📦 LocalStorage user - adding supplier to localStorage')
      if (shouldShowLoadingModal) setProgress(50)
      if (shouldShowLoadingModal) setLoadingStep(2)
      
      const partyDetails = getSupplierInPartyDetails()
      if (partyDetails.inParty) {
        if (partyDetails.supplierType === "addon") {
          await removeAddon(supplier.id)
          result = await addSupplier(backendSupplier, enhancedPackage)
        } else {
          result = await addSupplier(backendSupplier, enhancedPackage)
        }
      } else {
        const mainCategories = ["Venues", "Catering", "Cakes", "Party Bags", "Face Painting", "Activities", "Entertainment"]
        if (mainCategories.includes(supplier.category || "")) {
          result = await addSupplier(backendSupplier, enhancedPackage)
        } else {
          const addonDataToAdd = {
            ...supplier,
            price: finalPrice,
            packageId: enhancedPackage.id,
            selectedAddons: enhancedPackage.addons,
            packageData: enhancedPackage
          }
          result = await addAddon(addonDataToAdd)
        }
      }
    }

    if (shouldShowLoadingModal) setLoadingStep(4)
    if (shouldShowLoadingModal) setProgress(100)

    // 11. SUCCESS HANDLING WITH SMART NAVIGATION
    if (result?.success) {
      let successMessage = `${supplier.name} added to your party`
      
      if (enhancedPackage.cakeCustomization) {
        successMessage += ` with ${enhancedPackage.cakeCustomization.flavorName} flavor`
      }
      
      const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
      successMessage += addonMessage
      
      // ✅ NEW: Update message based on enquiry status
      if (behavior.shouldSendEnquiry || (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0)) {
        successMessage += ' and enquiry sent!'
      } else {
        successMessage += '!'
      }
      
      // ✅ NEW: Show informational message about pending enquiries (non-blocking)
      if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
        // Store additional info for display
        localStorage.setItem('recentBookingWithPendingEnquiries', JSON.stringify({
          pendingCount: enquiryStatus.pendingCount,
          addedSupplier: supplier.name,
          timestamp: Date.now()
        }))
      }
      
      // ✅ DIFFERENT WAIT TIMES BASED ON CONTEXT
      const waitTime = fromReviewBook ? 500 : 1000 // Shorter wait for review-book
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      
      if (fromReviewBook) {
        // Store success message for toast after navigation
        localStorage.setItem('reviewBookToast', JSON.stringify({
          type: 'success',
          title: 'Supplier Added Successfully',
          message: `${supplier.name} added to your party plan!`,
          timestamp: Date.now()
        }))
        
        // Navigate back to review-book step 4 with success indicator (forgotten step is now at index 4)
        const reviewUrl = `/review-book?restore=step4&added=true&supplier=${encodeURIComponent(supplier.name)}`
        console.log('🔄 Returning to review-book with added supplier:', reviewUrl)
        router.push(reviewUrl)
      } else {
        // Normal dashboard navigation with scroll
        const categoryMap = {
          'Entertainment': 'entertainment',
          'Venues': 'venue', 
          'Venue': 'venue',
          'Catering': 'catering',
          'Decorations': 'decorations',
          'Party Bags': 'partyBags',
          'Photography': 'photography',
          'Activities': 'activities',
          'Face Painting': 'facePainting',
          'Cakes': 'cakes',
          'Balloons': 'balloons'
        }

        const supplierType = categoryMap[supplier.category] || 'entertainment'
        console.log('🎯 Mapping category for scroll:', supplier.category, '→', supplierType)
        
        const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=supplier-added&from=supplier-detail`
        console.log('🚀 Navigating to dashboard:', dashboardUrl)
        router.push(dashboardUrl)
      }

      return { 
        success: true, 
        message: successMessage,
        // ✅ NEW: Include enquiry info for UI updates
        enquiryInfo: enquiryStatus.isAwaiting ? {
          hasPendingEnquiries: true,
          pendingCount: enquiryStatus.pendingCount
        } : null
      }
    } else {
      throw new Error(result?.error || "Failed to add supplier")
    }

  } catch (error) {
    console.error("❌ Error in handleAddToPlan:", error)
    return { 
      success: false, 
      message: error.message || "Failed to add supplier. Please try again." 
    }
  } finally {
    if (shouldShowLoadingModal) {
      setIsAddingToPlan(false)
      setProgress(0)
      setLoadingStep(0)
    }
    setFinalPackageData(null)
    console.log('🔧 handleAddToPlan cleanup completed')
  }
}, [
  userType, 
  userContext, 
  supplier, 
  selectedPackageId, 
  selectedDate, 
  currentMonth,
  packages, 
  getSupplierInPartyDetails, 
  addSupplier, 
  addAddon, 
  removeAddon, 
  backendSupplier, 
  navigationContext, 
  navigateWithContext, 
  router, 
  checkSupplierAvailability, 
  getSelectedCalendarDate,
  enquiryStatus  // ✅ Keep this for non-blocking enquiry info
])

// ✅ ALSO UPDATE handleAlaCarteBooking to remove blocking
const handleAlaCarteBooking = useCallback(async (partyDetails) => {
  // ❌ REMOVE THIS BLOCKING CHECK
  // if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
  //   console.log('🚫 User trying to add supplier - showing pending enquiry modal')
  //   return { showPendingEnquiry: true }
  // }

  try {
    // ... rest of the function remains the same
    // Just remove the blocking check at the beginning
    
    // Validation
    if (!partyDetails) {
      throw new Error('No party details provided')
    }

    if (!supplier) {
      throw new Error('No supplier data available')
    }

    // Get selected package
    const selectedPkg = packagesWithPopular.find(pkg => pkg.id === selectedPackageId)
    if (!selectedPkg) {
      throw new Error('No package selected')
    }
    
    // ... continue with rest of existing logic
    
  } catch (error) {
    console.error("❌ Error in handleAlaCarteBooking:", error)
    
    return { 
      success: false, 
      message: `Failed to create party plan: ${error.message}. Please try again.` 
    }
  } finally {
    setIsAddingToPlan(false)
    setProgress(0)
    setLoadingStep(0)
    console.log('🔧 Cleanup completed')
  }
}, [packages, selectedPackageId, supplier, backendSupplier, router])  // ✅ Remove enquiryStatus dependency

  // Get button state
  const getAddToPartyButtonState = useCallback((packageIdToCompare) => {
    const currentPackageId = packageIdToCompare || selectedPackageId
    const partyDetails = getSupplierInPartyDetails()
    const isLoadingThisPackage = isAddingToPlan && selectedPackageId === currentPackageId
    
    // Handle loading state first
    if (isLoadingThisPackage) {
      return {
        disabled: true,
        className: "bg-gray-400",
        text: (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {partyDetails.inParty && partyDetails.currentPackage === currentPackageId ? "Updating..." : "Adding..."}
          </>
        ),
      }
    }
    
    // Check if we're in replacement mode
    const urlParams = new URLSearchParams(window.location.search)
    const isInReplacementMode = urlParams.get('from') === 'replacement' || !!replacementContext?.isReplacement
    
    // Skip date validation for replacement mode
    if (isInReplacementMode) {
      return {
        disabled: false,
        className: "bg-primary-500 hover:bg-primary-600 text-white",
        text: "Add to Plan"
      }
    }
    
    // Get behavior from user type detection
    const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
    
    // ✅ FIX: Handle different user types correctly based on their actual state
    switch (userType) {
      case 'ANONYMOUS':
      case 'ERROR_FALLBACK':
        // Only anonymous users need date selection flow
        if (!selectedDate) {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white",
            text: "📅 Pick a Date First"
          }
        } else {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white",
            text: "Book This Supplier"
          }
        }
        
      case 'LOCALSTORAGE_USER':
      case 'MIGRATION_NEEDED':
        // Show "In Plan" for localStorage users with the same package
        if (partyDetails.inParty && partyDetails.currentPackage === currentPackageId) {
          return {
            disabled: true,
            className: "bg-teal-500 hover:bg-teal-500 text-white cursor-not-allowed",
            text: (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                In Plan
              </>
            ),
          }
        } else {
          // ✅ FIX: LocalStorage users with party plans don't need date selection
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: "Add to Plan"
          }
        }
        
      case 'DATABASE_USER':
      case 'DATA_CONFLICT':
        // ✅ FIX: Database users never need date selection - they have party plans
        return {
          disabled: false,
          className: "bg-primary-500 hover:bg-primary-600 text-white",
          text: "Add to Plan"
        }
        
      default:
        // Unknown user type - check if package is selected
        if (!currentPackageId) {
          return {
            disabled: true,
            className: "bg-gray-300 text-gray-500 cursor-not-allowed",
            text: "Select a Package",
          }
        }
        
        // ✅ FIX: For unknown types, use behavior but don't force date selection for signed-in users
        if (userType !== 'ANONYMOUS' && userType !== 'ERROR_FALLBACK') {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: "Add to Plan"
          }
        }
        
        return { 
          disabled: behavior.buttonDisabled || false, 
          className: behavior.buttonDisabled 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary-500 hover:bg-primary-600 text-white", 
          text: behavior.buttonText
        }
    }
  }, [userType, userContext, supplier, selectedDate, selectedPackageId, getSupplierInPartyDetails, isAddingToPlan, replacementContext])

  return {
    // State
    selectedPackageId,
    setSelectedPackageId,
    isAddingToPlan,
    loadingStep,
    progress,
    finalPackageData,
    setFinalPackageData,
    
    // Updated packages with popular flags
    packages: packagesWithPopular,
    
    // Functions
    handleAddToPlan,
    handleAlaCarteBooking,
    getAddToPartyButtonState,
    getSupplierInPartyDetails
  }
}