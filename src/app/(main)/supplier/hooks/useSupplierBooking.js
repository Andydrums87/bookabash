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
  selectedTimeSlot, // NEW: Include selected time slot
  currentMonth,
  checkSupplierAvailability, // This should come from useSupplierAvailability hook
  getSelectedCalendarDate,
  replacementContext,
  isCurrentSelectionBookable, // NEW: Check if current selection is valid
  migratedSupplier // NEW: Add migrated supplier data
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

  // UPDATED: Enhanced handleAddToPlan with time slot validation
  const handleAddToPlan = useCallback(async (skipAddonModal = false, addonData = null) => {
    console.log('🚀 === HANDLE ADD TO PLAN START ===')
    console.log('🚀 Input params:', { skipAddonModal, addonData })
    console.log('🚀 Current state:', { selectedDate, selectedTimeSlot, currentMonth })
    console.log('🚀 User type:', userType)

    if (!supplier || !selectedPackageId) {
      console.log('❌ Missing supplier or package')
      return { 
        success: false, 
        message: "Please select a package first." 
      }
    }
    
    // ✅ CHECK IF WE CAME FROM REVIEW-BOOK - IMPORTANT CHECK AT THE START
    const urlParams = new URLSearchParams(window.location.search)
    const fromReviewBook = urlParams.get('from') === 'review-book-missing'
    console.log('🔍 From review book:', fromReviewBook)
    
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

    // 2. TIME SLOT VALIDATION - FIXED
    if (selectedDate && currentMonth) {
      const dateString = getSelectedCalendarDate()
      
      if (dateString) {
        // FIXED: Get the correct time slot for validation
        let timeSlotForValidation = selectedTimeSlot
        
        // If no time slot selected, try to get from party details
        if (!timeSlotForValidation) {
          try {
            const partyDetails = localStorage.getItem('party_details')
            if (partyDetails) {
              const parsed = JSON.parse(partyDetails)
              timeSlotForValidation = parsed.timeSlot
              
              // Map from party time if timeSlot not explicitly set
              if (!timeSlotForValidation && parsed.time) {
                const timeStr = parsed.time.toLowerCase()
                console.log('🔍 BOOKING: Mapping party time to slot:', parsed.time)
                
                if (timeStr.includes('am') || 
                    timeStr.includes('9') || timeStr.includes('10') || 
                    timeStr.includes('11') || timeStr.includes('12')) {
                  timeSlotForValidation = 'morning'
                } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                          timeStr.includes('2') || timeStr.includes('3') || 
                          timeStr.includes('4') || timeStr.includes('5')) {
                  timeSlotForValidation = 'afternoon'
                }
                
                console.log('🔍 BOOKING: Mapped to time slot:', timeSlotForValidation)
              }
            }
          } catch (error) {
            console.log('Could not determine party time slot for booking validation')
          }
        }
        
        console.log('🔍 BOOKING: Final time slot for validation:', timeSlotForValidation)
        
        // Enhanced availability check with time slot
        const availabilityResult = checkSupplierAvailability(dateString, timeSlotForValidation)
        console.log('🔍 BOOKING: Time slot availability result:', availabilityResult)
        
        // Add null check for availabilityResult
        if (!availabilityResult || !availabilityResult.available) {
          console.log('🚫 BOOKING: Supplier unavailable for selected date/time slot')
          console.log('🚫 BOOKING: Checked date:', dateString, 'time slot:', timeSlotForValidation)
          return { 
            showUnavailableModal: true,
            unavailableInfo: {
              date: dateString,
              timeSlot: timeSlotForValidation,
              availableSlots: availabilityResult?.timeSlots || []
            }
          }
        }
        
        // If partially available but no time slot selected, prompt for selection
        if (availabilityResult.timeSlots && availabilityResult.timeSlots.length > 1 && !timeSlotForValidation) {
          return {
            showTimeSlotPicker: true,
            message: "Please select a preferred time slot for your party",
            availableSlots: availabilityResult.timeSlots
          }
        }
      }
    }

    // 3. PARTY DATE AVAILABILITY CHECK - Enhanced with time slots
    if (!selectedDate && (userType === 'LOCALSTORAGE_USER' || userType === 'DATABASE_USER' || userType === 'MIGRATION_NEEDED')) {
      let partyDateToCheck = null
      let partyTimeSlotToCheck = null
      
      // For localStorage users
      if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
        try {
          const partyDetails = localStorage.getItem('party_details')
          if (partyDetails) {
            const parsed = JSON.parse(partyDetails)
            partyDateToCheck = parsed.date
            partyTimeSlotToCheck = parsed.timeSlot
            
            // FIXED: Map party time to time slot if not explicitly set
            if (!partyTimeSlotToCheck && parsed.time) {
              const timeStr = parsed.time.toLowerCase()
              console.log('🔍 Mapping party time to slot:', parsed.time)
              
              // Map common time formats to slots
              if (timeStr.includes('am') || 
                  timeStr.includes('9') || timeStr.includes('10') || 
                  timeStr.includes('11') || timeStr.includes('12')) {
                partyTimeSlotToCheck = 'morning'
              } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                        timeStr.includes('2') || timeStr.includes('3') || 
                        timeStr.includes('4') || timeStr.includes('5')) {
                partyTimeSlotToCheck = 'afternoon'
              }
              
              console.log('🔍 Mapped to time slot:', partyTimeSlotToCheck)
            }
          }
        } catch (error) {
          console.log('❌ Could not parse party details for date check:', error)
        }
      }
      
      // For database users
      if (userType === 'DATABASE_USER' && userContext?.partyData) {
        partyDateToCheck = userContext.partyData.date
        partyTimeSlotToCheck = userContext.partyData.timeSlot
        
        // Map from time if timeSlot not set
        if (!partyTimeSlotToCheck && userContext.partyData.time) {
          const timeStr = userContext.partyData.time.toLowerCase()
          if (timeStr.includes('am') || timeStr.includes('morning')) {
            partyTimeSlotToCheck = 'morning'
          } else if (timeStr.includes('pm') || timeStr.includes('afternoon') || timeStr.includes('evening')) {
            partyTimeSlotToCheck = 'afternoon'
          }
        }
      }
      
      console.log('🔍 Party date check:', { partyDateToCheck, partyTimeSlotToCheck })
      
      if (partyDateToCheck) {
        const availabilityResult = checkSupplierAvailability(partyDateToCheck, partyTimeSlotToCheck)
        
        // Add null check for availabilityResult
        if (!availabilityResult || !availabilityResult.available) {
          console.log('🚫 Supplier unavailable on party date/time')
          return { 
            showUnavailableModal: true,
            unavailableDate: partyDateToCheck,
            unavailableTimeSlot: partyTimeSlotToCheck,
            availableSlots: availabilityResult?.timeSlots || []
          }
        }
      }
    }

    // 4. BOOKING VALIDATION - Check if current selection is bookable
    if (selectedDate && !isCurrentSelectionBookable()) {
      console.log('🚫 Current date/time selection is not bookable')
      return {
        success: false,
        message: "Selected date and time is not available. Please choose a different time slot."
      }
    }

    // 5. À LA CARTE FLOW
    if (behavior.shouldShowAlaCarteModal) {
      console.log('🎪 Opening à la carte modal for anonymous user with date')
      return { showAlaCarteModal: true }
    }
    
    // 6. CATEGORY OCCUPATION CHECK - Database users
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
    
    // 7. PACKAGE VALIDATION
    const selectedPkg = packagesWithPopular.find((pkg) => pkg.id === selectedPackageId)
    if (!selectedPkg) {
      return { 
        success: false, 
        message: "Selected package not found." 
      }
    }

    // 8. ADDON MODAL CHECK
    const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"
    const hasAddons = supplier?.serviceDetails?.addOnServices?.length > 0

    if (isEntertainer && hasAddons && !skipAddonModal && !addonData) {
      console.log('🎭 Showing addon modal')
      return { showAddonModal: true }
    }

    // 9. START ADDING PROCESS
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
      // Prepare package data with time slot information
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
        supplierType: packageToAdd.supplierType || 'standard',
        // NEW: Add time slot information
        selectedTimeSlot: selectedTimeSlot,
        selectedDate: selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null,
        bookingTimeSlot: selectedTimeSlot || null
      }

      console.log('🎯 Enhanced package with time slot:', enhancedPackage)
      if (shouldShowLoadingModal) setProgress(30)

      let result
      if (shouldShowLoadingModal) setLoadingStep(1)

      // 10. DATABASE USER FLOW
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
          
          // Include time slot information in enquiry
          const enquiryPackage = {
            ...enhancedPackage,
            timeSlotRequested: selectedTimeSlot,
            preferredTimeSlot: selectedTimeSlot
          }
          
          const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
            userContext.currentPartyId,
            backendSupplier,
            enquiryPackage,
            enquiryReason
          )
          
          if (enquiryResult.success) {
            console.log('✅ Auto-enquiry sent successfully with time slot info')
          }
        }
        
        result = addResult
      }
      // 11. LOCALSTORAGE USER FLOW
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
              packageData: enhancedPackage,
              // NEW: Include time slot data for addons too
              selectedTimeSlot: selectedTimeSlot,
              bookingTimeSlot: selectedTimeSlot
            }
            result = await addAddon(addonDataToAdd)
          }
        }
      }

      if (shouldShowLoadingModal) setLoadingStep(4)
      if (shouldShowLoadingModal) setProgress(100)

      // 12. SUCCESS HANDLING WITH SMART NAVIGATION
      if (result?.success) {
        let successMessage = `${supplier.name} added to your party`
        
        // Add time slot to success message
        if (selectedTimeSlot) {
          const timeSlotLabel = selectedTimeSlot === 'morning' ? 'morning' : 'afternoon'
          successMessage += ` for ${timeSlotLabel}`
        }
        
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
            selectedTimeSlot: selectedTimeSlot,
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
            timeSlot: selectedTimeSlot,
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
          } : null,
          timeSlotInfo: selectedTimeSlot ? {
            selectedTimeSlot,
            timeSlotLabel: selectedTimeSlot === 'morning' ? 'Morning' : 'Afternoon'
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
    selectedTimeSlot, // NEW
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
    isCurrentSelectionBookable, // NEW
    enquiryStatus
  ])

// ✅ UPDATED: handleAlaCarteBooking with enhanced time slot support and availability checks
const handleAlaCarteBooking = useCallback(async (partyDetails) => {
  console.log('🎪 === HANDLE À LA CARTE BOOKING START ===')
  console.log('🎪 Party details:', partyDetails)
  console.log('🎪 Current state:', { selectedDate, selectedTimeSlot, currentMonth })

  try {
    // 1. VALIDATION
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

    // 2. TIME SLOT VALIDATION - Enhanced with new availability system
    if (partyDetails.date) {
      let partyTimeSlot = partyDetails.timeSlot || selectedTimeSlot
      
      // Map party time to time slot if not explicitly set (similar to handleAddToPlan)
      if (!partyTimeSlot && partyDetails.time) {
        const timeStr = partyDetails.time.toLowerCase()
        console.log('🔍 À LA CARTE: Mapping party time to slot:', partyDetails.time)
        
        if (timeStr.includes('am') || 
            timeStr.includes('9') || timeStr.includes('10') || 
            timeStr.includes('11') || timeStr.includes('12')) {
          partyTimeSlot = 'morning'
        } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                  timeStr.includes('2') || timeStr.includes('3') || 
                  timeStr.includes('4') || timeStr.includes('5')) {
          partyTimeSlot = 'afternoon'
        }
        
        console.log('🔍 À LA CARTE: Mapped to time slot:', partyTimeSlot)
      }
      
      console.log('🔍 À LA CARTE: Final time slot for validation:', partyTimeSlot)
      
      // Enhanced availability check with time slot
      const availabilityResult = checkSupplierAvailability(partyDetails.date, partyTimeSlot)
      console.log('🔍 À LA CARTE: Availability result:', availabilityResult)
      
      // Add null check for availabilityResult
      if (!availabilityResult || !availabilityResult.available) {
        const timeSlotText = partyTimeSlot ? ` during ${partyTimeSlot}` : ''
        throw new Error(`Supplier is not available on ${partyDetails.date}${timeSlotText}. Please choose a different date or time slot.`)
      }
      
      // If partially available but no specific time slot, use the first available slot
      if (availabilityResult.timeSlots && availabilityResult.timeSlots.length > 0 && !partyTimeSlot) {
        partyTimeSlot = availabilityResult.timeSlots[0]
        console.log('🔍 À LA CARTE: Auto-selected time slot:', partyTimeSlot)
      }
      
      // Update partyDetails with the determined time slot
      partyDetails = {
        ...partyDetails,
        timeSlot: partyTimeSlot
      }
    }

    // 3. CURRENT SELECTION BOOKABLE CHECK
    if (selectedDate && !isCurrentSelectionBookable()) {
      throw new Error('Current date and time selection is not bookable. Please choose a different time slot.')
    }

    // 4. START LOADING PROCESS
    console.log('🎪 Starting à la carte booking process')
    setIsAddingToPlan(true)
    setLoadingStep(0)
    setProgress(10)

    // 5. PREPARE ENHANCED PACKAGE DATA with time slot info
    const enhancedPackage = {
      ...selectedPkg,
      addons: [],
      originalPrice: selectedPkg.price,
      totalPrice: selectedPkg.price,
      addonsPriceTotal: 0,
      cakeCustomization: selectedPkg.cakeCustomization || null,
      packageType: selectedPkg.packageType || 'standard',
      supplierType: selectedPkg.supplierType || 'standard',
      // NEW: Add comprehensive time slot information
      selectedTimeSlot: partyDetails.timeSlot,
      bookingTimeSlot: partyDetails.timeSlot,
      selectedDate: partyDetails.date ? new Date(partyDetails.date) : null,
      partyTimeSlot: partyDetails.timeSlot
    }

    console.log('🎯 À LA CARTE: Enhanced package with time slot:', enhancedPackage)
    setProgress(30)

    // 6. PREPARE ENHANCED SUPPLIER DATA
    const enhancedSupplier = {
      ...backendSupplier,
      selectedPackage: enhancedPackage,
      bookingInfo: {
        selectedDate: partyDetails.date,
        selectedTimeSlot: partyDetails.timeSlot,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        partyTime: partyDetails.time,
        timeSlotMapped: !!partyDetails.timeSlot
      }
    }

    setLoadingStep(1)
    setProgress(50)

    // 7. CREATE PARTY IN BACKEND
    console.log('🎪 Creating new party with supplier and time slot info')
    
    // Determine if we should create a database party or localStorage party
    const shouldCreateDatabaseParty = userType !== 'ANONYMOUS' && userType !== 'ERROR_FALLBACK'
    
    let result
    
    if (shouldCreateDatabaseParty) {
      // Create database party with enhanced supplier
      console.log('📊 Creating database party')
      result = await partyDatabaseBackend.createPartyWithSupplier(
        partyDetails,
        enhancedSupplier,
        enhancedPackage
      )
    } else {
      // Create localStorage party with enhanced supplier
      console.log('📦 Creating localStorage party')
      
      // Save party details to localStorage with time slot info
      const partyDetailsForStorage = {
        ...partyDetails,
        timeSlot: partyDetails.timeSlot,
        originalTime: partyDetails.time, // Keep original time format too
        created: new Date().toISOString(),
        source: 'ala-carte-booking'
      }
      
      localStorage.setItem('party_details', JSON.stringify(partyDetailsForStorage))
      
      // Add supplier to party plan
      const mainCategories = ["Venues", "Catering", "Cakes", "Party Bags", "Face Painting", "Activities", "Entertainment"]
      if (mainCategories.includes(supplier.category || "")) {
        result = await addSupplier(enhancedSupplier, enhancedPackage)
      } else {
        const addonDataToAdd = {
          ...supplier,
          price: selectedPkg.price,
          packageId: enhancedPackage.id,
          selectedAddons: enhancedPackage.addons,
          packageData: enhancedPackage,
          selectedTimeSlot: partyDetails.timeSlot,
          bookingTimeSlot: partyDetails.timeSlot
        }
        result = await addAddon(addonDataToAdd)
      }
    }

    setLoadingStep(2)
    setProgress(70)

    // 8. SEND AUTO-ENQUIRY (if needed, similar to handleAddToPlan)
    if (result?.success && shouldCreateDatabaseParty) {
      console.log('📧 À LA CARTE: Checking if auto-enquiry needed')
      
      // Send enquiry for new party bookings to ensure supplier communication
      if (result.partyId || userContext?.currentPartyId) {
        console.log('📧 À LA CARTE: Sending auto-enquiry for new party')
        setLoadingStep(3)
        
        const enquiryReason = `New party booking via à la carte selection for ${partyDetails.date}${partyDetails.timeSlot ? ` (${partyDetails.timeSlot})` : ''}`
        
        // Include comprehensive time slot information in enquiry
        const enquiryPackage = {
          ...enhancedPackage,
          timeSlotRequested: partyDetails.timeSlot,
          preferredTimeSlot: partyDetails.timeSlot,
          partyDate: partyDetails.date,
          enquiryType: 'ala-carte-booking'
        }
        
        const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
          result.partyId || userContext.currentPartyId,
          enhancedSupplier,
          enquiryPackage,
          enquiryReason
        )
        
        if (enquiryResult.success) {
          console.log('✅ À LA CARTE: Auto-enquiry sent successfully with comprehensive time slot info')
        }
      }
    }

    setLoadingStep(4)
    setProgress(100)

    // 9. SUCCESS HANDLING
    if (result?.success) {
      let successMessage = `Party created with ${supplier.name}`
      
      // Add time slot to success message
      if (partyDetails.timeSlot) {
        const timeSlotLabel = partyDetails.timeSlot === 'morning' ? 'morning' : 'afternoon'
        successMessage += ` for ${timeSlotLabel} on ${partyDetails.date}`
      } else {
        successMessage += ` on ${partyDetails.date}`
      }
      
      // Add enquiry info to message
      if (shouldCreateDatabaseParty) {
        successMessage += ' and enquiry sent!'
      } else {
        successMessage += '!'
      }
      
      // Store success info for potential display
      localStorage.setItem('alaCarteBookingSuccess', JSON.stringify({
        supplierName: supplier.name,
        partyDate: partyDetails.date,
        timeSlot: partyDetails.timeSlot,
        packageName: selectedPkg.name,
        enquirySent: shouldCreateDatabaseParty,
        timestamp: Date.now()
      }))
      
      // Wait for user to see completion
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Navigate to appropriate destination
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
      console.log('🎯 À LA CARTE: Mapping category for navigation:', supplier.category, '→', supplierType)
      
      const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=party-created&source=ala-carte&timeSlot=${partyDetails.timeSlot || ''}`
      console.log('🚀 À LA CARTE: Navigating to dashboard:', dashboardUrl)
      router.push(dashboardUrl)

      return { 
        success: true, 
        message: successMessage,
        partyId: result.partyId,
        timeSlotInfo: partyDetails.timeSlot ? {
          selectedTimeSlot: partyDetails.timeSlot,
          timeSlotLabel: partyDetails.timeSlot === 'morning' ? 'Morning' : 'Afternoon',
          partyDate: partyDetails.date
        } : null,
        enquiryInfo: shouldCreateDatabaseParty ? {
          enquirySent: true,
          enquiryReason: 'ala-carte-booking'
        } : null
      }
    } else {
      throw new Error(result?.error || "Failed to create party")
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
    console.log('🔧 À LA CARTE: Cleanup completed')
  }
}, [
  packages, 
  selectedPackageId, 
  selectedTimeSlot, 
  selectedDate, 
  currentMonth,
  supplier, 
  backendSupplier, 
  router, 
  checkSupplierAvailability,
  isCurrentSelectionBookable,
  userType,
  userContext,
  addSupplier,
  addAddon
])

  // UPDATED: Get button state with time slot validation
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
    
    // NEW: Check time slot availability for current selection
    if (selectedDate && currentMonth) {
      const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
      
      // If we have a party with a specific time slot, check that time slot
      let requiredTimeSlot = selectedTimeSlot
      
      // For users with party plans, check their party time slot
      if (!requiredTimeSlot && (userType === 'LOCALSTORAGE_USER' || userType === 'DATABASE_USER')) {
        try {
          if (userType === 'LOCALSTORAGE_USER') {
            const partyDetails = localStorage.getItem('party_details')
            if (partyDetails) {
              const parsed = JSON.parse(partyDetails)
              requiredTimeSlot = parsed.timeSlot
            }
          } else if (userType === 'DATABASE_USER' && userContext?.partyData?.timeSlot) {
            requiredTimeSlot = userContext.partyData.timeSlot
          }
        } catch (error) {
          console.log('Could not determine party time slot')
        }
      }
      
      // Check availability for the specific time slot or all slots
      const availabilityResult = checkSupplierAvailability(
        selectedDateObj.toISOString().split('T')[0], 
        requiredTimeSlot
      )
      
      // Add null check for availabilityResult
      if (!availabilityResult || !availabilityResult.available) {
        return {
          disabled: true,
          className: "bg-red-400 text-white cursor-not-allowed",
          text: requiredTimeSlot 
            ? `Unavailable (${requiredTimeSlot})`
            : "Unavailable"
        }
      }
      
      // If partially available and no time slot selected, prompt for selection
      if (availabilityResult.timeSlots && availabilityResult.timeSlots.length > 1 && !selectedTimeSlot && !requiredTimeSlot) {
        return {
          disabled: false,
          className: "bg-amber-500 hover:bg-amber-600 text-white",
          text: "⏰ Choose Time Slot"
        }
      }
    }
    
    // Check if current selection is not bookable
    if (selectedDate && !isCurrentSelectionBookable()) {
      return {
        disabled: true,
        className: "bg-red-400 text-white cursor-not-allowed",
        text: "Time Unavailable"
      }
    }
    
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
  }, [
    userType, 
    userContext, 
    supplier, 
    selectedDate, 
    selectedTimeSlot, // NEW
    selectedPackageId, 
    getSupplierInPartyDetails, 
    isAddingToPlan, 
    replacementContext,
    currentMonth,
    checkSupplierAvailability,
    isCurrentSelectionBookable // NEW
  ])

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