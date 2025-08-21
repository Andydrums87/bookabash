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

// Replace your existing handleAlaCarteBooking function with this:

const handleAlaCarteBooking = useCallback(async (partyDetails) => {
  if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
    console.log('🚫 User trying to add supplier - showing pending enquiry modal')
    return { showPendingEnquiry: true }
  }

  try {
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
    
    console.log('📦 Selected package:', selectedPkg)
    console.log('🏪 Supplier:', { id: supplier.id, name: supplier.name, category: supplier.category })
    
    setIsAddingToPlan(true)
    setProgress(25)

    const enhancedPartyDetails = {
      // Essential party info
      childName: partyDetails.childName || 'Your Child',
      childAge: parseInt(partyDetails.childAge) || 6,
      date: partyDetails.date || new Date().toISOString().split('T')[0],
      time: partyDetails.time || '14:00',
      location: partyDetails.location || 'London',
      postcode: partyDetails.postcode || 'SW1A 1AA',
      guestCount: parseInt(partyDetails.guestCount) || 10,
      theme: partyDetails.theme || 'superhero',
      
      // Pricing
      totalPrice: partyDetails.totalPrice || selectedPkg.price,
      basePrice: partyDetails.basePrice || selectedPkg.price,
      selectedAddons: partyDetails.selectedAddons || [],
      
      // Metadata
      createdAt: new Date().toISOString(),
      source: 'a_la_carte',
      
      // Preserve A-LA-CARTE specific fields
      firstName: partyDetails.firstName,
      lastName: partyDetails.lastName,
      skipWelcomePopup: partyDetails.skipWelcomePopup,
      timeSlot: partyDetails.timeSlot,
      
      // Add essential fields
      duration: partyDetails.duration || '2 hours',
      budget: partyDetails.totalPrice || selectedPkg.price
    }
    
    console.log('✨ Enhanced party details:', enhancedPartyDetails)
    setProgress(40)

    // Save party details
    try {
      localStorage.setItem('party_details', JSON.stringify(enhancedPartyDetails))
      console.log('💾 Party details saved to localStorage')
      
      const saved = localStorage.getItem('party_details')
      if (!saved) {
        throw new Error('Failed to save party details to localStorage')
      }
    } catch (storageError) {
      console.error('❌ Storage error:', storageError)
      throw new Error('Failed to save party details')
    }

    setProgress(60)

    // Category mapping for scroll
    const getCategoryMapping = (category) => {
      const mapping = {
        'Entertainment': 'entertainment',
        'Venues': 'venue',
        'Venue': 'venue', 
        'Catering': 'catering',
        'Face Painting': 'facePainting',
        'Activities': 'activities',
        'Party Bags': 'partyBags',
        'Decorations': 'decorations',
        'Balloons': 'balloons',
        'Photography': 'photography',
        'Cakes': 'cakes'
      }
      
      const result = mapping[category] || 'entertainment'
      console.log('🎯 Category mapping:', category, '→', result)
      return result
    }

    const supplierCategory = getCategoryMapping(supplier.category)

    // Create party plan structure
    const partyPlan = {
      // Initialize all possible slots
      venue: null,
      entertainment: null,
      catering: null,
      facePainting: null,
      activities: null,
      partyBags: null,
      decorations: null,
      balloons: null,
      photography: null,
      cakes: null,
      
      // Add the selected supplier to correct category
      [supplierCategory]: {
        id: supplier.id,
        name: supplier.name,
        description: supplier.description || `${supplier.category} service`,
        price: enhancedPartyDetails.totalPrice,
        status: "confirmed",
        image: supplier.image || supplier.coverPhoto || supplier.avatar,
        category: supplier.category,
        priceUnit: supplier.priceUnit || "per event",
        packageId: selectedPkg.id,
        packageData: {
          ...selectedPkg,
          selectedAddons: enhancedPartyDetails.selectedAddons,
          totalPrice: enhancedPartyDetails.totalPrice,
          basePrice: enhancedPartyDetails.basePrice,
          addonsPriceTotal: enhancedPartyDetails.totalPrice - enhancedPartyDetails.basePrice
        },
        selectedAddons: enhancedPartyDetails.selectedAddons,
        totalPrice: enhancedPartyDetails.totalPrice,
        basePrice: enhancedPartyDetails.basePrice,
        addedAt: new Date().toISOString(),
        originalSupplier: {
          ...supplier,
          ...(backendSupplier || {})
        },
        bookingMethod: 'a_la_carte',
        confirmed: true
      },
      
      // Initialize empty addons array
      addons: [],
      
      // Add metadata
      createdAt: new Date().toISOString(),
      source: 'a_la_carte',
      theme: enhancedPartyDetails.theme
    }

    console.log('🎪 Created party plan:', partyPlan)
    setProgress(80)

    // Save party plan
    try {
      localStorage.setItem('user_party_plan', JSON.stringify(partyPlan))
      console.log('💾 Party plan saved to localStorage')
      
      const savedPlan = localStorage.getItem('user_party_plan')
      if (!savedPlan) {
        throw new Error('Failed to save party plan to localStorage')
      }
      
      const parsedPlan = JSON.parse(savedPlan)
      if (!parsedPlan[supplierCategory] || !parsedPlan[supplierCategory].name) {
        throw new Error('Party plan structure is incorrect after saving')
      }
      
      console.log('✅ Party plan verified in localStorage')
    } catch (storageError) {
      console.error('❌ Storage error:', storageError)
      throw new Error('Failed to save party plan')
    }

    setProgress(95)

    // Success
    const addonMessage = enhancedPartyDetails.selectedAddons?.length > 0 
      ? ` with ${enhancedPartyDetails.selectedAddons.length} add-on${enhancedPartyDetails.selectedAddons.length > 1 ? 's' : ''}` 
      : ''
    
    setProgress(100)
    console.log('✅ À la carte booking completed successfully')

    await new Promise(resolve => setTimeout(resolve, 1500))

    // ✅ NAVIGATE WITH SCROLL PARAMETERS
    const dashboardUrl = `/dashboard?show_welcome=true&source=a_la_carte&scrollTo=${supplierCategory}&action=supplier-added`
    console.log('🚀 À la carte - navigating to:', dashboardUrl)
    router.push(dashboardUrl)

    return { 
      success: true, 
      message: `🎉 ${supplier.name} added to your party plan${addonMessage}!` 
    }

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
}, [packages, selectedPackageId, supplier, backendSupplier, router, enquiryStatus])

// Replace your existing handleAddToPlan function with this:

const handleAddToPlan = useCallback(async (skipAddonModal = false, addonData = null) => {
  // Check if user has pending enquiries - ONLY for database users
  if (userType === 'DATABASE_USER' && enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
    console.log('🚫 Database user has pending enquiries - showing pending enquiry modal')
    return { showPendingEnquiry: true }
  }

  // Basic validation
  if (!supplier || !selectedPackageId) {
    return { 
      success: false, 
      message: "Please select a package first." 
    }
  }
  
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
  setIsAddingToPlan(true)
  setLoadingStep(0)
  setProgress(10)

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
    setProgress(30)

    let result
    setLoadingStep(1)

    // 9. DATABASE USER FLOW
    if (userType === 'DATABASE_USER' && userContext?.currentPartyId) {
      console.log('📊 Database user - adding supplier to database')
      setProgress(50)
      
      const addResult = await partyDatabaseBackend.addSupplierToParty(
        userContext.currentPartyId,
        backendSupplier,
        enhancedPackage
      )
      
      setProgress(70)
      setLoadingStep(2)
      
      if (addResult.success && behavior.shouldSendEnquiry) {
        console.log('📧 Sending auto-enquiry for empty category')
        setLoadingStep(3)
        const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
          userContext.currentPartyId,
          backendSupplier,
          enhancedPackage,
          `Added to expand party team for your ${supplier.category.toLowerCase()} needs`
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
      setProgress(50)
      setLoadingStep(2)
      
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

    setLoadingStep(4)
    setProgress(100)

    // 11. SUCCESS HANDLING WITH SCROLL NAVIGATION
    if (result?.success) {
      let successMessage = `${supplier.name} added to your party`
      
      if (enhancedPackage.cakeCustomization) {
        successMessage += ` with ${enhancedPackage.cakeCustomization.flavorName} flavor`
      }
      
      const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
      successMessage += addonMessage
      
      if (behavior.shouldSendEnquiry) {
        successMessage += ' and enquiry sent!'
      } else {
        successMessage += '!'
      }
      
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // ✅ CATEGORY MAPPING FOR SCROLL
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
      
      // ✅ NAVIGATE WITH SCROLL PARAMETERS
      const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=supplier-added&from=supplier-detail`
      console.log('🚀 Navigating to:', dashboardUrl)
      router.push(dashboardUrl)

      return { 
        success: true, 
        message: successMessage 
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
    setIsAddingToPlan(false)
    setProgress(0)
    setLoadingStep(0)
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
  enquiryStatus
])

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