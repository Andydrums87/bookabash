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
  databasePartyData ,
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

// COMPLETELY REWRITTEN handleAddToPlan with correct date priority logic
const handleAddToPlan = useCallback(async (skipAddonModal = false, addonData = null) => {
  console.log('🚀 === HANDLE ADD TO PLAN START ===')
  console.log('🚀 Input params:', { skipAddonModal, addonData })
  console.log('🚀 Current state:', { selectedDate, selectedTimeSlot, currentMonth })
  console.log('🚀 User type:', userType)
  console.log('🚀 Database party data:', databasePartyData)

  if (!supplier || !selectedPackageId) {
    console.log('❌ Missing supplier or package')
    return { 
      success: false, 
      message: "Please select a package first." 
    }
  }
  
  // CHECK IF WE CAME FROM REVIEW-BOOK
  const urlParams = new URLSearchParams(window.location.search)
  const fromReviewBook = urlParams.get('from') === 'review-book-missing'
  console.log('🔍 From review book:', fromReviewBook)
  
  // Get behavior based on user type
  const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
  console.log('🚀 Behavior:', behavior)
  
  // 1. DATE PICKER FLOW (for users without parties)
  if (behavior.shouldShowDatePicker) {
    console.log('📅 Showing date picker prompt')
    return { 
      showDatePicker: true,
      message: "📅 Please select an available date from the calendar below first!"
    }
  }

  // 2. CRITICAL FIX: ALWAYS CHECK PARTY DATE FIRST FOR EXISTING PARTIES
  // This is the core fix - check party date regardless of selected calendar date
  
  let partyDateToCheck = null
  let partyTimeSlotToCheck = null
  
  // Extract party date and time slot based on user type
  if (userType === 'DATABASE_USER' && databasePartyData) {
    partyDateToCheck = databasePartyData.party_date || databasePartyData.date
    partyTimeSlotToCheck = databasePartyData.time_slot || databasePartyData.timeSlot
    
    // Map from start_time/party_time if timeSlot not set
    if (!partyTimeSlotToCheck) {
      const timeField = databasePartyData.start_time || databasePartyData.party_time || databasePartyData.time
      if (timeField) {
        const hour = parseInt(timeField.toString().split(':')[0])
        if (!isNaN(hour)) {
          partyTimeSlotToCheck = hour < 13 ? 'morning' : 'afternoon'
          console.log('🔍 DB: Mapped time', timeField, '→ slot:', partyTimeSlotToCheck)
        }
      }
    }
    
    console.log('🔍 DB USER: Party info extracted:', {
      party_date: partyDateToCheck,
      time_slot: partyTimeSlotToCheck,
      start_time: databasePartyData.start_time
    })
  } 
  else if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
    try {
      const partyDetails = localStorage.getItem('party_details')
      if (partyDetails) {
        const parsed = JSON.parse(partyDetails)
        partyDateToCheck = parsed.date
        partyTimeSlotToCheck = parsed.timeSlot
        
        if (!partyTimeSlotToCheck && parsed.time) {
          const timeStr = parsed.time.toLowerCase()
          if (timeStr.includes('am')) {
            partyTimeSlotToCheck = 'morning'
          } else if (timeStr.includes('pm')) {
            partyTimeSlotToCheck = 'afternoon'
          }
        }
      }
    } catch (error) {
      console.log('❌ Could not parse localStorage party details')
    }
    
    console.log('🔍 LS USER: Party info extracted:', {
      party_date: partyDateToCheck,
      time_slot: partyTimeSlotToCheck
    })
  }

  // 3. PARTY DATE AVAILABILITY CHECK - THE CRITICAL CHECK
  if (partyDateToCheck) {
    console.log('🔍 ⭐ CRITICAL CHECK: Validating supplier availability on PARTY DATE')
    console.log('🔍 ⭐ Party date:', partyDateToCheck)
    console.log('🔍 ⭐ Party time slot:', partyTimeSlotToCheck)
    console.log('🔍 ⭐ This should check Oct 4th, not Oct 9th!')
    
    const partyDateAvailability = checkSupplierAvailability(partyDateToCheck, partyTimeSlotToCheck)
    
    console.log('🔍 ⭐ PARTY DATE availability result:', partyDateAvailability)
    
    // BLOCK if supplier unavailable on party date
    if (!partyDateAvailability || !partyDateAvailability.available) {
      console.log('🚫 ⭐ BLOCKING: Supplier unavailable on PARTY DATE')
      console.log('🚫 This should show the unavailable modal!')
      return { 
        showUnavailableModal: true,
        unavailableDate: partyDateToCheck,
        unavailableTimeSlot: partyTimeSlotToCheck,
        availableSlots: partyDateAvailability?.timeSlots || [],
        reason: 'party_date_unavailable'
      }
    }
    
    console.log('✅ ⭐ PARTY DATE CHECK PASSED: Supplier available on party date')
  }

  // 4. SELECTED CALENDAR DATE VALIDATION (only if different from party date)
  if (selectedDate && currentMonth) {
    const selectedCalendarDateString = getSelectedCalendarDate()
    
    if (selectedCalendarDateString && selectedCalendarDateString !== partyDateToCheck) {
      console.log('🔍 SECONDARY: Calendar date differs from party date')
      console.log('🔍 Calendar date:', selectedCalendarDateString, 'vs Party date:', partyDateToCheck)
      
      let calendarTimeSlot = selectedTimeSlot || partyTimeSlotToCheck
      
      const calendarDateAvailability = checkSupplierAvailability(selectedCalendarDateString, calendarTimeSlot)
      
      if (!calendarDateAvailability || !calendarDateAvailability.available) {
        console.log('🚫 BLOCKING: Supplier unavailable on selected calendar date')
        return { 
          showUnavailableModal: true,
          unavailableInfo: {
            date: selectedCalendarDateString,
            timeSlot: calendarTimeSlot,
            availableSlots: calendarDateAvailability?.timeSlots || []
          },
          reason: 'calendar_date_unavailable'
        }
      }
    }
  }

  // 5. À LA CARTE FLOW
  if (behavior.shouldShowAlaCarteModal) {
    console.log('🎪 Opening à la carte modal for anonymous user')
    return { showAlaCarteModal: true }
  }
  
  // 6. CATEGORY OCCUPATION CHECK
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
  console.log('🚀 Starting add to plan process - all checks passed')
  
  const shouldShowLoadingModal = !fromReviewBook
  
  if (shouldShowLoadingModal) {
    setIsAddingToPlan(true)
    setLoadingStep(0)
    setProgress(10)
  }

  try {
    // Prepare package data with correct time slot information
    const packageToAdd = addonData?.package || selectedPkg
    const finalPrice = addonData ? addonData.totalPrice : selectedPkg.price
    
    // Use the party time slot for booking
    const bookingTimeSlot = partyTimeSlotToCheck || selectedTimeSlot
    const bookingDate = partyDateToCheck || (selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null)
    
    const enhancedPackage = {
      ...packageToAdd,
      addons: addonData?.addons || [],
      originalPrice: selectedPkg.price,
      totalPrice: finalPrice,
      addonsPriceTotal: addonData ? (addonData.totalPrice - selectedPkg.price) : 0,
      cakeCustomization: packageToAdd.cakeCustomization || null,
      packageType: packageToAdd.packageType || 'standard',
      supplierType: packageToAdd.supplierType || 'standard',
      // Use party date and time slot for booking
      selectedTimeSlot: bookingTimeSlot,
      selectedDate: bookingDate,
      bookingTimeSlot: bookingTimeSlot,
      partyDate: partyDateToCheck,
      partyTimeSlot: partyTimeSlotToCheck
    }

    console.log('🎯 Enhanced package with correct party date/time:', enhancedPackage)
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
      
// DON'T send enquiry - it will be sent after payment
if (addResult.success) {
  console.log('✅ Supplier added to party plan (enquiry will be sent after payment)')
  
  // Create accepted enquiry record but mark as unpaid
  if (behavior.shouldSendEnquiry || (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0)) {
    if (shouldShowLoadingModal) setLoadingStep(3)
    
    const enquiryReason = enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0
      ? `Added to party plan while managing ${enquiryStatus.pendingCount} other pending enquir${enquiryStatus.pendingCount === 1 ? 'y' : 'ies'}`
      : `Added to expand party team for your ${supplier.category.toLowerCase()} needs`
    
      const enquiryResult = await partyDatabaseBackend.createUnpaidBookingRecord(
        userContext.currentPartyId,
        backendSupplier,
        enhancedPackage,
        enquiryReason
      )
    
    if (enquiryResult.success) {
      console.log('✅ Enquiry record created as accepted but unpaid')
    }
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
            selectedTimeSlot: bookingTimeSlot,
            bookingTimeSlot: bookingTimeSlot
          }
          result = await addAddon(addonDataToAdd)
        }
      }
    }

    if (shouldShowLoadingModal) setLoadingStep(4)
    if (shouldShowLoadingModal) setProgress(100)

    // 12. SUCCESS HANDLING
    if (result?.success) {
      let successMessage = `${supplier.name} added to your party`
      
      if (bookingTimeSlot) {
        const timeSlotLabel = bookingTimeSlot === 'morning' ? 'morning' : 'afternoon'
        successMessage += ` for ${timeSlotLabel}`
      }
      
      if (enhancedPackage.cakeCustomization) {
        successMessage += ` with ${enhancedPackage.cakeCustomization.flavorName} flavor`
      }
      
      const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
      successMessage += addonMessage
      
      if (behavior.shouldSendEnquiry || (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0)) {
        successMessage += ' and enquiry sent!'
      } else {
        successMessage += '!'
      }
      
      if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
        localStorage.setItem('recentBookingWithPendingEnquiries', JSON.stringify({
          pendingCount: enquiryStatus.pendingCount,
          addedSupplier: supplier.name,
          selectedTimeSlot: bookingTimeSlot,
          timestamp: Date.now()
        }))
      }
      
      const waitTime = fromReviewBook ? 500 : 1000
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      
      if (fromReviewBook) {
        localStorage.setItem('reviewBookToast', JSON.stringify({
          type: 'success',
          title: 'Supplier Added Successfully',
          message: `${supplier.name} added to your party plan!`,
          timeSlot: bookingTimeSlot,
          timestamp: Date.now()
        }))
        
        const reviewUrl = `/review-book?restore=step4&added=true&supplier=${encodeURIComponent(supplier.name)}`
        console.log('🔄 Returning to review-book:', reviewUrl)
        router.push(reviewUrl)
      } else {
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
        const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=supplier-added&from=supplier-detail`
        console.log('🚀 Navigating to dashboard:', dashboardUrl)
        router.push(dashboardUrl)
      }

      return { 
        success: true, 
        message: successMessage,
        enquiryInfo: enquiryStatus.isAwaiting ? {
          hasPendingEnquiries: true,
          pendingCount: enquiryStatus.pendingCount
        } : null,
        timeSlotInfo: bookingTimeSlot ? {
          selectedTimeSlot: bookingTimeSlot,
          timeSlotLabel: bookingTimeSlot === 'morning' ? 'Morning' : 'Afternoon'
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
  selectedTimeSlot,
  currentMonth,
  packagesWithPopular, 
  getSupplierInPartyDetails, 
  addSupplier, 
  addAddon, 
  removeAddon, 
  backendSupplier, 
  router, 
  checkSupplierAvailability, 
  getSelectedCalendarDate,
  isCurrentSelectionBookable,
  enquiryStatus,
  databasePartyData // CRITICAL: Must be in dependencies
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
    
    if (isInReplacementMode) {
      return {
        disabled: false,
        className: "bg-primary-500 hover:bg-primary-600 text-white",
        text: "Add to Plan"
      }
    }
  
    // Get party date and time slot for button text
    let partyDateText = ''
    let timeSlotText = ''
    
    // For database users
    if (userType === 'DATABASE_USER' && userContext?.partyData) {
      const partyDate = userContext.partyData.party_date || userContext.partyData.date
      const partyTimeSlot = userContext.partyData.time_slot || userContext.partyData.timeSlot
      
      if (partyDate) {
        const dateObj = new Date(partyDate)
        partyDateText = ` (${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        
        if (partyTimeSlot) {
          const timeSlotLabel = partyTimeSlot === 'morning' ? 'AM' : 'PM'
          timeSlotText = ` ${timeSlotLabel}`
        }
      }
    }
    // For localStorage users
    else if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
      try {
        const partyDetailsLS = localStorage.getItem('party_details')
        if (partyDetailsLS) {
          const parsed = JSON.parse(partyDetailsLS)
          if (parsed.date) {
            const dateObj = new Date(parsed.date)
            partyDateText = ` (${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
            
            if (parsed.timeSlot || parsed.time) {
              const timeSlot = parsed.timeSlot || (parsed.time?.toLowerCase().includes('am') ? 'morning' : 'afternoon')
              const timeSlotLabel = timeSlot === 'morning' ? 'AM' : 'PM'
              timeSlotText = ` ${timeSlotLabel}`
            }
          }
        }
      } catch (error) {
        console.log('Could not get party date from localStorage')
      }
    }
  
    // TIME SLOT VALIDATION for selected dates
    if (selectedDate && currentMonth) {
      const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate)
      
      let requiredTimeSlot = selectedTimeSlot
      
      // For users with party plans, check their party time slot
      if (!requiredTimeSlot && (userType === 'LOCALSTORAGE_USER' || userType === 'DATABASE_USER')) {
        try {
          if (userType === 'LOCALSTORAGE_USER') {
            const partyDetailsLS = localStorage.getItem('party_details')
            if (partyDetailsLS) {
              const parsed = JSON.parse(partyDetailsLS)
              requiredTimeSlot = parsed.timeSlot
            }
          } else if (userType === 'DATABASE_USER' && userContext?.partyData?.timeSlot) {
            requiredTimeSlot = userContext.partyData.timeSlot
          }
        } catch (error) {
          console.log('Could not determine party time slot')
        }
      }
      
      // Check availability for the specific time slot
      const availabilityResult = checkSupplierAvailability(
        selectedDateObj.toISOString().split('T')[0], 
        requiredTimeSlot
      )
      
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
          text: "Choose Time Slot"
        }
      }
    }
    
    // Check if current selection is not bookable
    if (selectedDate && typeof isCurrentSelectionBookable === 'function' && !isCurrentSelectionBookable()) {
      return {
        disabled: true,
        className: "bg-red-400 text-white cursor-not-allowed",
        text: "Time Unavailable"
      }
    }
    
    // HANDLE DIFFERENT USER TYPES
    switch (userType) {
      case 'ANONYMOUS':
      case 'ERROR_FALLBACK':
        if (!selectedDate) {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: "Pick a Date First"
          }
        } else {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: "Book This Supplier"
          }
        }
        
      case 'LOCALSTORAGE_USER':
      case 'MIGRATION_NEEDED':
        // Show "In Plan" if already added with same package
        if (partyDetails.inParty && partyDetails.currentPackage === currentPackageId) {
          return {
            disabled: true,
            className: "bg-teal-500 text-white cursor-not-allowed",
            text: (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                In Plan{partyDateText}{timeSlotText}
              </>
            ),
          }
        } else {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: `Add to Plan${partyDateText}${timeSlotText}`
          }
        }
        
      case 'DATABASE_USER':
      case 'DATA_CONFLICT':
        // Show "In Plan" if already added with same package
        if (partyDetails.inParty && partyDetails.currentPackage === currentPackageId) {
          return {
            disabled: true,
            className: "bg-teal-500 text-white cursor-not-allowed",
            text: (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                In Plan{partyDateText}{timeSlotText}
              </>
            ),
          }
        } else {
          return {
            disabled: false,
            className: "bg-primary-500 hover:bg-primary-600 text-white",
            text: `Add to Plan${partyDateText}${timeSlotText}`
          }
        }
        
      default:
        if (!currentPackageId) {
          return {
            disabled: true,
            className: "bg-gray-300 text-gray-500 cursor-not-allowed",
            text: "Select a Package",
          }
        }
        
        return {
          disabled: false,
          className: "bg-primary-500 hover:bg-primary-600 text-white",
          text: `Add to Plan${partyDateText}${timeSlotText}`
        }
    }
  }, [
    userType, 
    userContext, 
    supplier, 
    selectedDate, 
    selectedTimeSlot,
    selectedPackageId, 
    getSupplierInPartyDetails, 
    isAddingToPlan, 
    replacementContext,
    currentMonth,
    checkSupplierAvailability,
    isCurrentSelectionBookable
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