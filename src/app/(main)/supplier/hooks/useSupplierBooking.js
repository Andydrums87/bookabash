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


import { calculateFinalPrice, getPartyDuration } from '@/utils/unifiedPricing'



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

  const isLeadTimeBased = useMemo(() => {
    const leadTimeCategories = ['Cakes', 'Party Bags', 'Decorations'];
    return leadTimeCategories.includes(supplier?.category);
  }, [supplier?.category]);

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

  

// Add this new useMemo to get party duration - place this before packagesWithSmartPricing
const effectivePartyDuration = useMemo(() => {
  // Priority 1: From database party data
  if (userType === 'DATABASE_USER' && databasePartyData?.duration) {
    console.log('🕐 Using duration from database:', databasePartyData.duration)
    return databasePartyData.duration
  }
  
  // Priority 2: Try to get from localStorage party details
  try {
    const partyDetails = localStorage.getItem('party_details')
    if (partyDetails) {
      const parsed = JSON.parse(partyDetails)
      if (parsed.duration && parsed.duration > 0) {
        console.log('🕐 Using duration from localStorage:', parsed.duration)
        return parsed.duration
      }
      
      // Try to calculate from start/end times if available
      if (parsed.startTime && parsed.endTime) {
        const duration = getPartyDuration(parsed)
        console.log('🕐 Calculated duration from times:', duration)
        return duration
      }
    }
  } catch (error) {
    console.warn('Could not get party duration from localStorage:', error)
  }
  
  // Priority 3: Default calculation
  const defaultDuration = getPartyDuration({
    date: selectedDate ? new Date(currentMonth?.getFullYear(), currentMonth?.getMonth(), selectedDate) : null
  })
  
  console.log('🕐 Using default duration:', defaultDuration)
  return defaultDuration
}, [userType, databasePartyData, selectedDate, currentMonth])

const packagesWithSmartPricing = useMemo(() => {
  if (!packages || packages.length === 0) return []
  
  console.log('🔍 DEBUG: Original packages received:', packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    hasOriginalPrice: !!pkg.originalPrice
  })))
  
  // COMPLETELY RAW - no pricing enhancement whatsoever
  const rawPackages = packages.map((pkg, index) => {
    const cleanPackage = {
      ...pkg,
      // Ensure we preserve the TRUE original price
      originalPrice: pkg.originalPrice || pkg.price,
      popular: pkg.id === selectedPackageId || (!selectedPackageId && index === 0)
    }
    
    console.log(`🔍 DEBUG: Package "${pkg.name}" - Original: £${pkg.originalPrice || pkg.price}, Current: £${pkg.price}`)
    
    return cleanPackage
  })
  
  console.log('🔍 DEBUG: Clean packages output:', rawPackages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    originalPrice: pkg.originalPrice
  })))
  
  return rawPackages
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
    // Initial validation
    if (!supplier || !selectedPackageId) {
      return { 
        success: false, 
        message: "Please select a package first." 
      }
    }
  
    const urlParams = new URLSearchParams(window.location.search)
    const fromReviewBook = urlParams.get('from') === 'review-book-missing'
    const behavior = getHandleAddToPlanBehavior(userType, userContext, supplier, selectedDate)
  
    // 1. Handle date picker flow
    if (behavior.shouldShowDatePicker) {
      return { 
        showDatePicker: true,
        message: "Please select an available date from the calendar below first!"
      }
    }
  
    // 2. Extract party date and time slot
    const { partyDate, partyTimeSlot } = extractPartyDateTime()
    
    // 3. Check party date availability
    if (partyDate) {
      const timeSlotToCheck = isLeadTimeBased ? null : partyTimeSlot
      const partyDateAvailability = checkSupplierAvailability(partyDate, timeSlotToCheck)
      
      if (!partyDateAvailability?.available) {
        return { 
          showUnavailableModal: true,
          unavailableDate: partyDate,
          unavailableTimeSlot: timeSlotToCheck,
          availableSlots: partyDateAvailability?.timeSlots || [],
          reason: 'party_date_unavailable'
        }
      }
    }
  
    // 4. Check selected calendar date if different from party date
    if (selectedDate && currentMonth) {
      const selectedCalendarDateString = getSelectedCalendarDate()
      
      if (selectedCalendarDateString && selectedCalendarDateString !== partyDate) {
        const calendarTimeSlot = selectedTimeSlot || partyTimeSlot
        const calendarDateAvailability = checkSupplierAvailability(selectedCalendarDateString, calendarTimeSlot)
        
        if (!calendarDateAvailability?.available) {
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
  
    // 5. Handle a la carte flow
    if (behavior.shouldShowAlaCarteModal) {
      return { showAlaCarteModal: true }
    }
    
    // 6. Check category occupation for database users
    if (behavior.shouldCheckCategoryOccupation && userType === 'DATABASE_USER') {
      const categoryOccupied = await checkCategoryOccupation()
      if (categoryOccupied.occupied) {
        return {
          success: false,
          message: categoryOccupied.message
        }
      }
    }
    
    // 7. Validate selected package
    const selectedPkg = packagesWithSmartPricing.find((pkg) => pkg.id === selectedPackageId)
    if (!selectedPkg) {
      return { 
        success: false, 
        message: "Selected package not found." 
      }
    }
  
    // 8. Handle addon modal for entertainers
    const isEntertainer = supplier?.category?.toLowerCase().includes("entertain") || supplier?.category === "Entertainment"
    const hasAddons = supplier?.serviceDetails?.addOnServices?.length > 0
  
    if (hasAddons && !skipAddonModal && !addonData) {
      return { showAddonModal: true }
    }
    
    // 9. Start loading process
    const shouldShowLoadingModal = !fromReviewBook
    if (shouldShowLoadingModal) {
      setIsAddingToPlan(true)
      setLoadingStep(0)
      setProgress(10)
    }
  
    try {
      // 10. Calculate unified pricing
      const pricingData = calculateUnifiedPricing(selectedPkg, partyDate, addonData)
      
      if (shouldShowLoadingModal) setProgress(30)
  
      // 11. Prepare enhanced package and supplier data
      const { enhancedPackage, enhancedSupplierData } = prepareEnhancedData(
        selectedPkg, 
        pricingData, 
        addonData, 
        partyDate, 
        partyTimeSlot
      )
  
      if (shouldShowLoadingModal) setProgress(50)
      if (shouldShowLoadingModal) setLoadingStep(1)
  
      // 12. Add supplier to plan based on user type
      const result = await addSupplierToPlan(enhancedSupplierData, enhancedPackage)
      
      if (shouldShowLoadingModal) setProgress(70)
      if (shouldShowLoadingModal) setLoadingStep(2)
  
      // 13. Handle enquiry creation if needed
      if (result.success && shouldSendEnquiry()) {
        await handleEnquiryCreation(enhancedSupplierData, enhancedPackage)
        if (shouldShowLoadingModal) setLoadingStep(3)
      }
  
      if (shouldShowLoadingModal) setProgress(100)
      if (shouldShowLoadingModal) setLoadingStep(4)
  
      // 14. Handle success response
      if (result.success) {
        return await handleSuccessResponse(pricingData, enhancedPackage, partyTimeSlot)
      } else {
        throw new Error(result?.error || "Failed to add supplier")
      }
  
    } catch (error) {
      console.error("Error in handleAddToPlan:", error)
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
    }
  
    // Helper functions for the main flow:
  
    function extractPartyDateTime() {
      let partyDate = null
      let partyTimeSlot = null
      
      if (userType === 'DATABASE_USER' && databasePartyData) {
        partyDate = databasePartyData.party_date || databasePartyData.date
        partyTimeSlot = databasePartyData.time_slot || databasePartyData.timeSlot
        
        if (!partyTimeSlot) {
          const timeField = databasePartyData.start_time || databasePartyData.party_time || databasePartyData.time
          if (timeField) {
            const hour = parseInt(timeField.toString().split(':')[0])
            if (!isNaN(hour)) {
              partyTimeSlot = hour < 13 ? 'morning' : 'afternoon'
            }
          }
        }
      } else if (userType === 'LOCALSTORAGE_USER' || userType === 'MIGRATION_NEEDED') {
        try {
          const partyDetails = localStorage.getItem('party_details')
          if (partyDetails) {
            const parsed = JSON.parse(partyDetails)
            partyDate = parsed.date
            partyTimeSlot = parsed.timeSlot
            
            if (!partyTimeSlot && parsed.time) {
              const timeStr = parsed.time.toLowerCase()
              if (timeStr.includes('am')) {
                partyTimeSlot = 'morning'
              } else if (timeStr.includes('pm')) {
                partyTimeSlot = 'afternoon'
              }
            }
          }
        } catch (error) {
          console.log('Could not parse localStorage party details')
        }
      }
      
      return { partyDate, partyTimeSlot }
    }
  
    async function checkCategoryOccupation() {
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
            return {
              occupied: true,
              message: `You already have a ${supplier.category.toLowerCase()} provider (${dbPartyPlan[slotName].name}). Remove them first to add ${supplier.name}.`
            }
          }
        }
      } catch (error) {
        console.log('Database check failed, continuing...', error)
        if (userType === 'DATABASE_USER') {
          return {
            occupied: true,
            message: "Unable to verify party status. Please try again."
          }
        }
      }
      
      return { occupied: false }
    }
  
    function calculateUnifiedPricing(selectedPkg, partyDate, addonData) {
      console.log('🔍 DEBUG: calculateUnifiedPricing START')
      console.log('🔍 DEBUG: selectedPkg input:', {
        id: selectedPkg.id,
        name: selectedPkg.name,
        price: selectedPkg.price,
        originalPrice: selectedPkg.originalPrice
      })
      
      const partyDetailsForPricing = {
        date: partyDate || (selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null),
        duration: effectivePartyDuration,
        guestCount: null
      }
      
      console.log('🔍 DEBUG: Party details for pricing:', partyDetailsForPricing)
      
      // CRITICAL: Determine the TRUE base price
      const trueBasePrice = selectedPkg.originalPrice || selectedPkg.price
      
      console.log('🔍 DEBUG: True base price determined:', trueBasePrice)
      console.log('🔍 DEBUG: Extra hour rate from supplier:', supplier.extraHourRate)
      console.log('🔍 DEBUG: Extra hour rate from serviceDetails:', supplier.serviceDetails?.extraHourRate)
      
      const supplierForPricing = {
        ...supplier,
        price: trueBasePrice, // Force use of true base price
        originalPrice: trueBasePrice, // Ensure originalPrice is set
        weekendPremium: supplier.weekendPremium || backendSupplier?.weekendPremium,
        extraHourRate: supplier.extraHourRate || backendSupplier?.extraHourRate,
        category: supplier.category
      }
      
      console.log('🔍 DEBUG: Supplier for pricing:', {
        name: supplierForPricing.name,
        price: supplierForPricing.price,
        originalPrice: supplierForPricing.originalPrice,
        extraHourRate: supplierForPricing.extraHourRate,
        duration: effectivePartyDuration
      })
      
      const pricingResult = calculateFinalPrice(
        supplierForPricing,
        partyDetailsForPricing,
        addonData?.addons || []
      )
      
      console.log('🔍 DEBUG: Unified pricing result:', {
        finalPrice: pricingResult.finalPrice,
        basePrice: pricingResult.basePrice,
        breakdown: pricingResult.breakdown,
        details: pricingResult.details
      })
      
      // Check if there's unexpected enhancement
      const expectedPrice = trueBasePrice + (pricingResult.breakdown.weekend || 0) + (pricingResult.breakdown.extraHours || 0)
      const actualPrice = pricingResult.finalPrice
      
      if (Math.abs(expectedPrice - actualPrice) > 0.01) {
        console.error('🚨 DEBUG: PRICE MISMATCH DETECTED!')
        console.error('🚨 Expected:', expectedPrice)
        console.error('🚨 Actual:', actualPrice)
        console.error('🚨 Difference:', actualPrice - expectedPrice)
      }
      
      return {
        pricingResult,
        finalPrice: pricingResult.finalPrice,
        weekendAdjustedBasePrice: pricingResult.basePrice,
        debugInfo: {
          inputPrice: selectedPkg.price,
          inputOriginalPrice: selectedPkg.originalPrice,
          trueBasePrice,
          expectedPrice,
          actualPrice
        }
      }
    }
  
    function prepareEnhancedData(selectedPkg, pricingData, addonData, partyDate, partyTimeSlot) {
      const { pricingResult, finalPrice, weekendAdjustedBasePrice } = pricingData
      const packageToAdd = addonData?.package || selectedPkg
      const bookingTimeSlot = partyTimeSlot || selectedTimeSlot
      const bookingDate = partyDate || (selectedDate ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate) : null)
      
      const enhancedPackage = {
        ...packageToAdd,
        addons: addonData?.addons || [],
        originalPrice: selectedPkg.originalPrice || selectedPkg.price,
        totalPrice: finalPrice,
        addonsPriceTotal: pricingResult.breakdown.addons,
        cakeCustomization: packageToAdd.cakeCustomization || null,
        packageType: packageToAdd.packageType || 'standard',
        supplierType: packageToAdd.supplierType || 'standard',
        selectedTimeSlot: isLeadTimeBased ? null : bookingTimeSlot,
        selectedDate: bookingDate,
        bookingTimeSlot: isLeadTimeBased ? null : bookingTimeSlot,
        partyDate: partyDate,
        partyTimeSlot: isLeadTimeBased ? null : partyTimeSlot,
        supplierDeliveryType: isLeadTimeBased ? 'lead_time' : 'time_slot',
        weekendPremiumApplied: pricingResult.breakdown.weekend > 0,
        weekendPremiumAmount: pricingResult.breakdown.weekend,
        weekendAdjustedPrice: weekendAdjustedBasePrice,
        pricingBreakdown: {
          basePrice: selectedPkg.price,
          weekendPremium: pricingResult.breakdown.weekend,
          extraHours: pricingResult.breakdown.extraHours,
          addons: pricingResult.breakdown.addons,
          finalBasePrice: weekendAdjustedBasePrice,
          grandTotal: finalPrice
        }
      }
  
      console.log('Enhanced package with unified pricing:', {
        name: packageToAdd.name,
        originalPrice: enhancedPackage.originalPrice,
        weekendAdjustedPrice: enhancedPackage.weekendAdjustedPrice,
        totalPrice: enhancedPackage.totalPrice,
        weekendPremiumApplied: enhancedPackage.weekendPremiumApplied,
        weekendPremiumAmount: enhancedPackage.weekendPremiumAmount
      })
      
      const enhancedSupplierData = {
        ...backendSupplier,
        id: supplier.id,
        name: supplier.name,
        category: supplier.category, // Explicitly include category for correct slot assignment
        weekendPremium: supplier.weekendPremium || backendSupplier?.weekendPremium,
        extraHourRate: supplier.extraHourRate || backendSupplier?.extraHourRate,
        price: finalPrice,
        originalPrice: selectedPkg.price,
        weekendAdjustedPrice: weekendAdjustedBasePrice
      }
  
      return { enhancedPackage, enhancedSupplierData }
    }
  
    async function addSupplierToPlan(enhancedSupplierData, enhancedPackage) {
      if (userType === 'DATABASE_USER' && userContext?.currentPartyId) {
        return await partyDatabaseBackend.addSupplierToParty(
          userContext.currentPartyId,
          enhancedSupplierData,
          enhancedPackage
        )
      } else {
        const partyDetails = getSupplierInPartyDetails()
        if (partyDetails.inParty) {
          if (partyDetails.supplierType === "addon") {
            await removeAddon(supplier.id)
            return await addSupplier(enhancedSupplierData, enhancedPackage)
          } else {
            return await addSupplier(enhancedSupplierData, enhancedPackage)
          }
        } else {
          // Check if this is a main category (case-insensitive, handles singular/plural)
          const categoryLower = supplier.category?.toLowerCase() || ""
          const isMainCategory = [
            "venue", "venues",
            "catering",
            "cake", "cakes",
            "party bag", "party bags",
            "face painting",
            "activities", "activity",
            "entertainment"
          ].includes(categoryLower)

          if (isMainCategory) {
            return await addSupplier(enhancedSupplierData, enhancedPackage)
          } else {
            const addonDataToAdd = {
              ...supplier,
              price: enhancedSupplierData.price,
              originalPrice: enhancedSupplierData.originalPrice,
              weekendAdjustedPrice: enhancedSupplierData.weekendAdjustedPrice,
              packageId: enhancedPackage.id,
              selectedAddons: enhancedPackage.addons,
              packageData: enhancedPackage,
              selectedTimeSlot: enhancedPackage.selectedTimeSlot,
              bookingTimeSlot: enhancedPackage.bookingTimeSlot,
              weekendPremium: supplier.weekendPremium,
              weekendPremiumApplied: enhancedPackage.weekendPremiumApplied,
              weekendPremiumAmount: enhancedPackage.weekendPremiumAmount,
              supplierId: supplier.id,
              supplierName: supplier.name,
              supplierType: supplier.category?.toLowerCase() === 'venues' || supplier.category?.toLowerCase() === 'venue' ? 'venue' : supplier.category?.toLowerCase(),
              attachedToSupplier: supplier.category?.toLowerCase() === 'venues' || supplier.category?.toLowerCase() === 'venue' ? 'venue' : supplier.category?.toLowerCase(),
              category: supplier.category,
              parentSupplierId: supplier.id, // Backup reference
              parentSupplierName: supplier.name // Backup reference
            }
            return await addAddon(addonDataToAdd)
          }
        }
      }
    }
  
    function shouldSendEnquiry() {
      return behavior.shouldSendEnquiry || (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0)
    }
  
    async function handleEnquiryCreation(enhancedSupplierData, enhancedPackage) {
      if (userType === 'DATABASE_USER' && userContext?.currentPartyId) {
        const enquiryReason = enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0
          ? `Added to party plan while managing ${enquiryStatus.pendingCount} other pending enquiry${enquiryStatus.pendingCount === 1 ? '' : 's'}`
          : `Added to expand party team for your ${supplier.category.toLowerCase()} needs`
        
        const enquiryResult = await partyDatabaseBackend.createUnpaidBookingRecord(
          userContext.currentPartyId,
          enhancedSupplierData,
          enhancedPackage,
          enquiryReason
        )
      
        if (enquiryResult.success) {
          console.log('Enquiry record created as accepted but unpaid')
        }
      }
    }
  
    async function handleSuccessResponse(pricingData, enhancedPackage, partyTimeSlot) {
      const { pricingResult } = pricingData
      const bookingTimeSlot = partyTimeSlot || selectedTimeSlot
      
      let successMessage = `${supplier.name} added to your party`
      
      if (bookingTimeSlot) {
        const timeSlotLabel = bookingTimeSlot === 'morning' ? 'morning' : 'afternoon'
        successMessage += ` for ${timeSlotLabel}`
      }
      
      if (pricingResult.breakdown.weekend > 0) {
        successMessage += ` (weekend premium applied: +£${pricingResult.breakdown.weekend})`
      }
      
      if (enhancedPackage.cakeCustomization) {
        successMessage += ` with ${enhancedPackage.cakeCustomization.flavorName} flavor`
      }
      
      const addonMessage = addonData?.addons?.length > 0 ? ` with ${addonData.addons.length} add-on${addonData.addons.length > 1 ? 's' : ''}` : ''
      successMessage += addonMessage
      
      if (shouldSendEnquiry()) {
        successMessage += ' and enquiry sent!'
      } else {
        successMessage += '!'
      }
      
      if (enquiryStatus.isAwaiting && enquiryStatus.pendingCount > 0) {
        localStorage.setItem('recentBookingWithPendingEnquiries', JSON.stringify({
          pendingCount: enquiryStatus.pendingCount,
          addedSupplier: supplier.name,
          selectedTimeSlot: bookingTimeSlot,
          weekendPremiumApplied: pricingResult.breakdown.weekend > 0,
          weekendPremiumAmount: pricingResult.breakdown.weekend,
          timestamp: Date.now()
        }))
      }
      
      const waitTime = fromReviewBook ? 500 : 1000
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      
      // Handle navigation
      if (fromReviewBook) {
        localStorage.setItem('reviewBookToast', JSON.stringify({
          type: 'success',
          title: 'Supplier Added Successfully',
          message: `${supplier.name} added to your party plan!`,
          timeSlot: bookingTimeSlot,
          weekendPremium: pricingResult.breakdown.weekend > 0,
          timestamp: Date.now()
        }))
        
        const reviewUrl = `/review-book?restore=step4&added=true&supplier=${encodeURIComponent(supplier.name)}`
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
        
        if (userType === 'DATABASE_USER') {
          const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=supplier-added&from=supplier-detail&enquiry_sent=true&timestamp=${Date.now()}`
          router.push(dashboardUrl)
        } else {
          const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=supplier-added&from=supplier-detail`
          router.push(dashboardUrl)
        }
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
        } : null,
        weekendPremiumInfo: pricingResult.breakdown.weekend > 0 ? {
          applied: true,
          amount: pricingResult.breakdown.weekend,
          originalPrice: selectedPkg.price,
          adjustedPrice: pricingResult.basePrice
        } : null
      }
    }
  
  }, [
    userType, 
    userContext, 
    supplier, 
    selectedPackageId, 
    selectedDate, 
    selectedTimeSlot,
    currentMonth,
    packagesWithSmartPricing,
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
    databasePartyData,
    effectivePartyDuration
  ]);

// ✅ UPDATED: handleAlaCarteBooking with enhanced time slot support and availability checks
// const handleAlaCarteBooking = useCallback(async (partyDetails) => {
//   console.log('🎪 === HANDLE À LA CARTE BOOKING START ===')
//   console.log('🎪 Party details:', partyDetails)
//   console.log('🎪 Current state:', { selectedDate, selectedTimeSlot, currentMonth })

//   try {
//     // 1. VALIDATION
//     if (!partyDetails) {
//       throw new Error('No party details provided')
//     }

//     if (!supplier) {
//       throw new Error('No supplier data available')
//     }

//     // Get selected package
//     const selectedPkg = packagesWithPopular.find(pkg => pkg.id === selectedPackageId)
//     if (!selectedPkg) {
//       throw new Error('No package selected')
//     }

//     // 2. TIME SLOT VALIDATION - Enhanced with new availability system
//     if (partyDetails.date) {
//       let partyTimeSlot = partyDetails.timeSlot || selectedTimeSlot
      
//       // Map party time to time slot if not explicitly set (similar to handleAddToPlan)
//       if (!partyTimeSlot && partyDetails.time) {
//         const timeStr = partyDetails.time.toLowerCase()
//         console.log('🔍 À LA CARTE: Mapping party time to slot:', partyDetails.time)
        
//         if (timeStr.includes('am') || 
//             timeStr.includes('9') || timeStr.includes('10') || 
//             timeStr.includes('11') || timeStr.includes('12')) {
//           partyTimeSlot = 'morning'
//         } else if (timeStr.includes('pm') || timeStr.includes('1') || 
//                   timeStr.includes('2') || timeStr.includes('3') || 
//                   timeStr.includes('4') || timeStr.includes('5')) {
//           partyTimeSlot = 'afternoon'
//         }
        
//         console.log('🔍 À LA CARTE: Mapped to time slot:', partyTimeSlot)
//       }
      
//       console.log('🔍 À LA CARTE: Final time slot for validation:', partyTimeSlot)
      
//       // Enhanced availability check with time slot
//       const availabilityResult = checkSupplierAvailability(partyDetails.date, partyTimeSlot)
//       console.log('🔍 À LA CARTE: Availability result:', availabilityResult)
      
//       // Add null check for availabilityResult
//       if (!availabilityResult || !availabilityResult.available) {
//         const timeSlotText = partyTimeSlot ? ` during ${partyTimeSlot}` : ''
//         throw new Error(`Supplier is not available on ${partyDetails.date}${timeSlotText}. Please choose a different date or time slot.`)
//       }
      
//       // If partially available but no specific time slot, use the first available slot
//       if (availabilityResult.timeSlots && availabilityResult.timeSlots.length > 0 && !partyTimeSlot) {
//         partyTimeSlot = availabilityResult.timeSlots[0]
//         console.log('🔍 À LA CARTE: Auto-selected time slot:', partyTimeSlot)
//       }
      
//       // Update partyDetails with the determined time slot
//       partyDetails = {
//         ...partyDetails,
//         timeSlot: partyTimeSlot
//       }
//     }

//     // 3. CURRENT SELECTION BOOKABLE CHECK
//     if (selectedDate && !isCurrentSelectionBookable()) {
//       throw new Error('Current date and time selection is not bookable. Please choose a different time slot.')
//     }

//     // 4. START LOADING PROCESS
//     console.log('🎪 Starting à la carte booking process')
//     setIsAddingToPlan(true)
//     setLoadingStep(0)
//     setProgress(10)

//     // 5. PREPARE ENHANCED PACKAGE DATA with time slot info
//     const enhancedPackage = {
//       ...selectedPkg,
//       addons: [],
//       originalPrice: selectedPkg.price,
//       totalPrice: selectedPkg.price,
//       addonsPriceTotal: 0,
//       cakeCustomization: selectedPkg.cakeCustomization || null,
//       packageType: selectedPkg.packageType || 'standard',
//       supplierType: selectedPkg.supplierType || 'standard',
//       // NEW: Add comprehensive time slot information
//       selectedTimeSlot: partyDetails.timeSlot,
//       bookingTimeSlot: partyDetails.timeSlot,
//       selectedDate: partyDetails.date ? new Date(partyDetails.date) : null,
//       partyTimeSlot: partyDetails.timeSlot
//     }

//     console.log('🎯 À LA CARTE: Enhanced package with time slot:', enhancedPackage)
//     setProgress(30)

//     // 6. PREPARE ENHANCED SUPPLIER DATA
//     const enhancedSupplier = {
//       ...backendSupplier,
//       selectedPackage: enhancedPackage,
//       bookingInfo: {
//         selectedDate: partyDetails.date,
//         selectedTimeSlot: partyDetails.timeSlot,
//         packageId: selectedPkg.id,
//         packageName: selectedPkg.name,
//         partyTime: partyDetails.time,
//         timeSlotMapped: !!partyDetails.timeSlot
//       }
//     }

//     setLoadingStep(1)
//     setProgress(50)

//     // 7. CREATE PARTY IN BACKEND
//     console.log('🎪 Creating new party with supplier and time slot info')
    
//     // Determine if we should create a database party or localStorage party
//     const shouldCreateDatabaseParty = userType !== 'ANONYMOUS' && userType !== 'ERROR_FALLBACK'
    
//     let result
    
//     if (shouldCreateDatabaseParty) {
//       // Create database party with enhanced supplier
//       console.log('📊 Creating database party')
//       result = await partyDatabaseBackend.createPartyWithSupplier(
//         partyDetails,
//         enhancedSupplier,
//         enhancedPackage
//       )
//     } else {
//       // Create localStorage party with enhanced supplier
//       console.log('📦 Creating localStorage party')
      
//       // Save party details to localStorage with time slot info
//       const partyDetailsForStorage = {
//         ...partyDetails,
//         timeSlot: partyDetails.timeSlot,
//         originalTime: partyDetails.time, // Keep original time format too
//         created: new Date().toISOString(),
//         source: 'ala-carte-booking'
//       }
      
//       localStorage.setItem('party_details', JSON.stringify(partyDetailsForStorage))
      
//       // Add supplier to party plan
//       const mainCategories = ["Venues", "Catering", "Cakes", "Party Bags", "Face Painting", "Activities", "Entertainment"]
//       if (mainCategories.includes(supplier.category || "")) {
//         result = await addSupplier(enhancedSupplier, enhancedPackage)
//       } else {
//         const addonDataToAdd = {
//           ...supplier,
//           price: selectedPkg.price,
//           packageId: enhancedPackage.id,
//           selectedAddons: enhancedPackage.addons,
//           packageData: enhancedPackage,
//           selectedTimeSlot: partyDetails.timeSlot,
//           bookingTimeSlot: partyDetails.timeSlot
//         }
//         result = await addAddon(addonDataToAdd)
//       }
//     }

//     setLoadingStep(2)
//     setProgress(70)

//     // 8. SEND AUTO-ENQUIRY (if needed, similar to handleAddToPlan)
//     if (result?.success && shouldCreateDatabaseParty) {
//       console.log('📧 À LA CARTE: Checking if auto-enquiry needed')
      
//       // Send enquiry for new party bookings to ensure supplier communication
//       if (result.partyId || userContext?.currentPartyId) {
//         console.log('📧 À LA CARTE: Sending auto-enquiry for new party')
//         setLoadingStep(3)
        
//         const enquiryReason = `New party booking via à la carte selection for ${partyDetails.date}${partyDetails.timeSlot ? ` (${partyDetails.timeSlot})` : ''}`
        
//         // Include comprehensive time slot information in enquiry
//         const enquiryPackage = {
//           ...enhancedPackage,
//           timeSlotRequested: partyDetails.timeSlot,
//           preferredTimeSlot: partyDetails.timeSlot,
//           partyDate: partyDetails.date,
//           enquiryType: 'ala-carte-booking'
//         }
        
//         const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
//           result.partyId || userContext.currentPartyId,
//           enhancedSupplier,
//           enquiryPackage,
//           enquiryReason
//         )
        
//         if (enquiryResult.success) {
//           console.log('✅ À LA CARTE: Auto-enquiry sent successfully with comprehensive time slot info')
//         }
//       }
//     }

//     setLoadingStep(4)
//     setProgress(100)

//     // 9. SUCCESS HANDLING
//     if (result?.success) {
//       let successMessage = `Party created with ${supplier.name}`
      
//       // Add time slot to success message
//       if (partyDetails.timeSlot) {
//         const timeSlotLabel = partyDetails.timeSlot === 'morning' ? 'morning' : 'afternoon'
//         successMessage += ` for ${timeSlotLabel} on ${partyDetails.date}`
//       } else {
//         successMessage += ` on ${partyDetails.date}`
//       }
      
//       // Add enquiry info to message
//       if (shouldCreateDatabaseParty) {
//         successMessage += ' and enquiry sent!'
//       } else {
//         successMessage += '!'
//       }
      
//       // Store success info for potential display
//       localStorage.setItem('alaCarteBookingSuccess', JSON.stringify({
//         supplierName: supplier.name,
//         partyDate: partyDetails.date,
//         timeSlot: partyDetails.timeSlot,
//         packageName: selectedPkg.name,
//         enquirySent: shouldCreateDatabaseParty,
//         timestamp: Date.now()
//       }))
      
//       // Wait for user to see completion
//       await new Promise((resolve) => setTimeout(resolve, 1000))
      
//       // Navigate to appropriate destination
//       const categoryMap = {
//         'Entertainment': 'entertainment',
//         'Venues': 'venue', 
//         'Venue': 'venue',
//         'Catering': 'catering',
//         'Decorations': 'decorations',
//         'Party Bags': 'partyBags',
//         'Photography': 'photography',
//         'Activities': 'activities',
//         'Face Painting': 'facePainting',
//         'Cakes': 'cakes',
//         'Balloons': 'balloons'
//       }

//       const supplierType = categoryMap[supplier.category] || 'entertainment'
//       console.log('🎯 À LA CARTE: Mapping category for navigation:', supplier.category, '→', supplierType)
      
//       const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=party-created&source=ala-carte&timeSlot=${partyDetails.timeSlot || ''}`
//       console.log('🚀 À LA CARTE: Navigating to dashboard:', dashboardUrl)
//       router.push(dashboardUrl)

//       return { 
//         success: true, 
//         message: successMessage,
//         partyId: result.partyId,
//         timeSlotInfo: partyDetails.timeSlot ? {
//           selectedTimeSlot: partyDetails.timeSlot,
//           timeSlotLabel: partyDetails.timeSlot === 'morning' ? 'Morning' : 'Afternoon',
//           partyDate: partyDetails.date
//         } : null,
//         enquiryInfo: shouldCreateDatabaseParty ? {
//           enquirySent: true,
//           enquiryReason: 'ala-carte-booking'
//         } : null
//       }
//     } else {
//       throw new Error(result?.error || "Failed to create party")
//     }

//   } catch (error) {
//     console.error("❌ Error in handleAlaCarteBooking:", error)
    
//     return { 
//       success: false, 
//       message: `Failed to create party plan: ${error.message}. Please try again.` 
//     }
//   } finally {
//     setIsAddingToPlan(false)
//     setProgress(0)
//     setLoadingStep(0)
//     console.log('🔧 À LA CARTE: Cleanup completed')
//   }
// }, [
//   packages, 
//   selectedPackageId, 
//   selectedTimeSlot, 
//   selectedDate, 
//   currentMonth,
//   supplier, 
//   backendSupplier, 
//   router, 
//   checkSupplierAvailability,
//   isCurrentSelectionBookable,
//   userType,
//   userContext,
//   addSupplier,
//   addAddon
// ])
const handleAlaCarteBooking = useCallback(async (partyDetails) => {

  try {
    // 1. VALIDATION - Party Details
    if (!partyDetails) {
      throw new Error('No party details provided')
    }

    // 2. VALIDATION - Supplier Data
    const supplierToUse = backendSupplier || supplier
    if (!supplierToUse) {
      throw new Error('No supplier data available')
    }

    // 3. VALIDATION - Packages
    if (!packages || packages.length === 0) {
      throw new Error('No packages available for this supplier')
    }

    // 4. PACKAGE SELECTION - Defensive approach
    let packageIdToUse = selectedPackageId
    let selectedPkg = null

    if (packageIdToUse) {
      selectedPkg = packages.find(pkg => pkg.id === packageIdToUse)
    }

    // If no package selected or package not found, use first available
    if (!selectedPkg) {
      selectedPkg = packages[0]
      packageIdToUse = selectedPkg.id
 
      
      // Update state for consistency
      setSelectedPackageId(packageIdToUse)
    }

  

    // 5. TIME SLOT VALIDATION
    let finalTimeSlot = partyDetails.timeSlot || selectedTimeSlot
    
    // Map party time to time slot if not explicitly set
    if (!finalTimeSlot && partyDetails.time) {
      const timeStr = partyDetails.time.toLowerCase()

      
      if (timeStr.includes('am') || 
          ['9', '10', '11', '12'].some(hour => timeStr.includes(hour))) {
        finalTimeSlot = 'morning'
      } else if (timeStr.includes('pm') || 
                ['1', '2', '3', '4', '5'].some(hour => timeStr.includes(hour))) {
        finalTimeSlot = 'afternoon'
      }
      

    }

    // 6. AVAILABILITY CHECK
    if (partyDetails.date && checkSupplierAvailability) {

      
      const availabilityResult = checkSupplierAvailability(partyDetails.date, finalTimeSlot)
  
      
      if (!availabilityResult || !availabilityResult.available) {
        const timeSlotText = finalTimeSlot ? ` during ${finalTimeSlot}` : ''
        throw new Error(`Supplier is not available on ${partyDetails.date}${timeSlotText}. Please choose a different date or time slot.`)
      }
      
      // Auto-select available time slot if none specified
      if (!finalTimeSlot && availabilityResult.timeSlots?.length > 0) {
        finalTimeSlot = availabilityResult.timeSlots[0]

      }
    }

    // 7. CURRENT SELECTION BOOKABLE CHECK
    if (selectedDate && typeof isCurrentSelectionBookable === 'function' && !isCurrentSelectionBookable()) {
      throw new Error('Current date and time selection is not bookable. Please choose a different time slot.')
    }

    // 8. PREPARE ENHANCED PACKAGE DATA
    const enhancedPackage = {
      ...selectedPkg,
      addons: [],
      originalPrice: selectedPkg.price,
      totalPrice: selectedPkg.price,
      addonsPriceTotal: 0,
      cakeCustomization: selectedPkg.cakeCustomization || null,
      packageType: selectedPkg.packageType || 'standard',
      supplierType: selectedPkg.supplierType || 'standard',
      selectedTimeSlot: finalTimeSlot,
      bookingTimeSlot: finalTimeSlot,
      selectedDate: partyDetails.date ? new Date(partyDetails.date) : null,
      partyTimeSlot: finalTimeSlot
    }

    

    // 9. PREPARE ENHANCED SUPPLIER DATA
    const enhancedSupplier = {
      ...supplierToUse,
      selectedPackage: enhancedPackage,
      bookingInfo: {
        selectedDate: partyDetails.date,
        selectedTimeSlot: finalTimeSlot,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        partyTime: partyDetails.time,
        timeSlotMapped: !!finalTimeSlot
      }
    }


    
    const shouldCreateDatabaseParty = userType !== 'ANONYMOUS' && userType !== 'ERROR_FALLBACK'
    let result

    if (shouldCreateDatabaseParty) {
      // Create database party

      
      if (!partyDatabaseBackend?.createPartyWithSupplier) {
        throw new Error('Database backend not available')
      }
      
      result = await partyDatabaseBackend.createPartyWithSupplier(
        partyDetails,
        enhancedSupplier,
        enhancedPackage
      )
    } else {
      // Create localStorage party

      
      // Save party details to localStorage
      const partyDetailsForStorage = {
        ...partyDetails,
        timeSlot: finalTimeSlot,
        originalTime: partyDetails.time,
        created: new Date().toISOString(),
        source: 'ala-carte-booking'
      }
      
      localStorage.setItem('party_details', JSON.stringify(partyDetailsForStorage))
      
      // Add supplier to party plan
      const mainCategories = ["Venues", "Catering", "Cakes", "Party Bags", "Face Painting", "Activities", "Entertainment"]
      
      if (mainCategories.includes(supplierToUse.category || "")) {
        if (typeof addSupplier !== 'function') {
          throw new Error('addSupplier function not available')
        }
        result = await addSupplier(enhancedSupplier, enhancedPackage)
      } else {
        if (typeof addAddon !== 'function') {
          throw new Error('addAddon function not available')
        }
        
        const addonDataToAdd = {
          ...supplierToUse,
          price: selectedPkg.price,
          packageId: enhancedPackage.id,
          selectedAddons: enhancedPackage.addons,
          packageData: enhancedPackage,
          selectedTimeSlot: finalTimeSlot,
          bookingTimeSlot: finalTimeSlot
        }
        result = await addAddon(addonDataToAdd)
      }
    }

    // 11. SEND AUTO-ENQUIRY (for database users)
    if (result?.success && shouldCreateDatabaseParty) {

      
      const partyId = result.partyId || userContext?.currentPartyId
      if (partyId && partyDatabaseBackend?.sendIndividualEnquiry) {

        
        const enquiryReason = `New party booking via à la carte selection for ${partyDetails.date}${finalTimeSlot ? ` (${finalTimeSlot})` : ''}`
        
        const enquiryPackage = {
          ...enhancedPackage,
          timeSlotRequested: finalTimeSlot,
          preferredTimeSlot: finalTimeSlot,
          partyDate: partyDetails.date,
          enquiryType: 'ala-carte-booking'
        }
        
        try {
          const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
            partyId,
            enhancedSupplier,
            enquiryPackage,
            enquiryReason
          )
          
          if (enquiryResult.success) {
            console.log('Auto-enquiry sent successfully')
          }
        } catch (enquiryError) {
          console.warn('Failed to send auto-enquiry:', enquiryError)
          // Don't fail the entire booking for enquiry errors
        }
      }
    }

    // 12. SUCCESS HANDLING
    if (!result?.success) {
      throw new Error(result?.error || "Failed to create party")
    }

    let successMessage = `Party created with ${supplierToUse.name}`
    
    if (finalTimeSlot) {
      const timeSlotLabel = finalTimeSlot === 'morning' ? 'morning' : 'afternoon'
      successMessage += ` for ${timeSlotLabel} on ${partyDetails.date}`
    } else if (partyDetails.date) {
      successMessage += ` on ${partyDetails.date}`
    }
    
    if (shouldCreateDatabaseParty) {
      successMessage += ' and enquiry sent!'
    } else {
      successMessage += '!'
    }
    
    // Store success info
    localStorage.setItem('alaCarteBookingSuccess', JSON.stringify({
      supplierName: supplierToUse.name,
      partyDate: partyDetails.date,
      timeSlot: finalTimeSlot,
      packageName: selectedPkg.name,
      enquirySent: shouldCreateDatabaseParty,
      timestamp: Date.now()
    }))
    
    // Wait for user to see completion
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Navigate to dashboard
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

    const supplierType = categoryMap[supplierToUse.category] || 'entertainment'

    
    const dashboardUrl = `/dashboard?scrollTo=${supplierType}&action=party-created&source=ala-carte&timeSlot=${finalTimeSlot || ''}`

    router.push(dashboardUrl)

    return { 
      success: true, 
      message: successMessage,
      partyId: result.partyId,
      timeSlotInfo: finalTimeSlot ? {
        selectedTimeSlot: finalTimeSlot,
        timeSlotLabel: finalTimeSlot === 'morning' ? 'Morning' : 'Afternoon',
        partyDate: partyDetails.date
      } : null,
      enquiryInfo: shouldCreateDatabaseParty ? {
        enquirySent: true,
        enquiryReason: 'ala-carte-booking'
      } : null
    }

  } catch (error) {
    console.error('Error in handleAlaCarteBooking:', error)
    
    return { 
      success: false, 
      message: `Failed to create party plan: ${error.message}. Please try again.` 
    }
  } finally {
    console.log('À la carte cleanup completed')
  }
}, [
  packages, 
  selectedPackageId, 
  setSelectedPackageId,
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
            
            // if (parsed.timeSlot || parsed.time) {
            //   const timeSlot = parsed.timeSlot || (parsed.time?.toLowerCase().includes('am') ? 'morning' : 'afternoon')
            //   const timeSlotLabel = timeSlot === 'morning' ? 'AM' : 'PM'
            //   timeSlotText = ` ${timeSlotLabel}`
            // }
          }
        }
      } catch (error) {
        console.log('Could not get party date from localStorage')
      }
    }
  
    // TIME SLOT VALIDATION for selected dates
    if (selectedDate && currentMonth && !isLeadTimeBased) {
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
      
      const availabilityResult = checkSupplierAvailability(
        selectedDateObj.toISOString().split('T')[0], 
        requiredTimeSlot
      );
      
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
    packages: packagesWithSmartPricing,  // ✅ Change this line
    
    // Functions
    handleAddToPlan,
    handleAlaCarteBooking,
    getAddToPartyButtonState,
    getSupplierInPartyDetails
  }
}