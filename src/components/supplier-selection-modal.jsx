// Enhanced SupplierSelectionModal with unified pricing system integration
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import SupplierCustomizationModal from './SupplierCustomizationModal'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { LocationService } from '@/utils/locationService'
import SwipeableSupplierCarousel from "./supplier/SwipableSupplierCarousel"
import useDisableScroll from "@/hooks/useDisableScroll"
import { 
  X, 
  Star, 
  Check, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Heart,
  DollarSign,
  Calendar,
  Plus,
  Sparkles,
  Clock,
  Sun,
  Moon,
  Package,
  Truck,
  AlertCircle
} from "lucide-react"
import Image from "next/image"
import { useSuppliers } from '@/utils/mockBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'

// Import the supplier type utilities
import { 
  getAvailabilityType, 
  AVAILABILITY_TYPES,
  isLeadTimeBased,
  isTimeSlotBased 
} from '@/app/suppliers/utils/supplierTypes'

// FIXED: Import centralized date helpers
import { 
  dateToLocalString, 
  stringToLocalDate, 
  getDateStringForComparison,
  parseSupplierDate,
  migrateDateArray,
  isSameDay,
  formatDate
} from '@/utils/dateHelpers'

// ✅ UPDATED: Import unified pricing system
import { 
  calculateFinalPrice, 
  isLeadBasedSupplier,
  isTimeBasedSupplier,
  getDisplayPrice,
  formatDuration 
} from '@/utils/unifiedPricing'

// Time slot definitions - matching other components
const TIME_SLOTS = {
  morning: {
    id: 'morning',
    label: 'Morning',
    defaultStart: '09:00',
    defaultEnd: '13:00',
    displayTime: '9am - 1pm',
    icon: Sun
  },
  afternoon: {
    id: 'afternoon', 
    label: 'Afternoon',
    defaultStart: '13:00',
    defaultEnd: '17:00',
    displayTime: '1pm - 5pm',
    icon: Moon
  }
}

export default function SupplierSelectionModal({
  isOpen,
  onClose,
  category,
  theme,
  date,
  onSelectSupplier,
  initialFilters = {},
  partyLocation = null,
  currentPhase = "planning",
  partyData = {},
  enquiries = [],
  hasEnquiriesPending = false,
  partyId,
}) {

  // State with restored filters or defaults
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || "all")
  const [ratingFilter, setRatingFilter] = useState(initialFilters.ratingFilter || "all")
  const [distance, setDistance] = useState(initialFilters.distance || "all")
  const [availableOnly, setAvailableOnly] = useState(initialFilters.availableOnly || false)
  const [addingSupplier, setAddingSupplier] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState('premium')
  const [clickedSuppliers, setClickedSuppliers] = useState(new Set())

  // Customization modal state
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [selectedSupplierForCustomization, setSelectedSupplierForCustomization] = useState(null)

  // Get suppliers from backend
  const { suppliers, loading, error } = useSuppliers()
  const { addSupplier, removeSupplier, addAddon } = usePartyPlan()

  // ✅ NEW: Get current month for date calculations
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // ✅ NEW: Create party details object for pricing calculations
  const partyDetailsForPricing = useMemo(() => {
    let pricingDate = date
    let duration = 2 // Default
    let guestCount = null

    // Try to get from party data prop
    if (partyData?.date) pricingDate = partyData.date
    if (partyData?.duration) duration = partyData.duration
    if (partyData?.guestCount) guestCount = partyData.guestCount

    // Try to get from localStorage if not in props
    if (!pricingDate || !guestCount) {
      try {
        const partyDetails = localStorage.getItem('party_details')
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails)
          if (!pricingDate && parsed.date) pricingDate = parsed.date
          if (!guestCount && parsed.guestCount) guestCount = parsed.guestCount
          if (duration === 2 && parsed.duration) duration = parsed.duration
        }
      } catch (error) {
        console.warn('Could not get party details from localStorage for pricing')
      }
    }

    return {
      date: pricingDate ? new Date(pricingDate) : null,
      duration,
      guestCount
    }
  }, [date, partyData])

  // Update filters when initialFilters change (for restoration)
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      console.log('🔄 Applying restored filters:', initialFilters)
      setPriceRange(initialFilters.priceRange || "all")
      setRatingFilter(initialFilters.ratingFilter || "all")
      setDistance(initialFilters.distance || "10")
      setAvailableOnly(initialFilters.availableOnly || false)
    }
  }, [initialFilters])

  // ENHANCED: Migration helper with lead-time support
  const getSupplierWithTimeSlots = (supplierData) => {
    if (!supplierData) return null
    
    // If already has time slots, return as-is
    if (supplierData.workingHours?.Monday?.timeSlots) {
      return supplierData
    }
    
    // Try to parse supplier data if it's a string
    let parsedData = supplierData
    if (supplierData.data && typeof supplierData.data === 'string') {
      try {
        const parsed = JSON.parse(supplierData.data)
        parsedData = { ...supplierData, ...parsed }
      } catch (e) {
        console.log('Could not parse supplier data:', e.message)
      }
    }
    
    // Migrate legacy data on-the-fly for display
    const migrated = { ...parsedData }
    
    // Only migrate working hours for time-slot based suppliers
    if (parsedData.workingHours && isTimeSlotBased(parsedData.category)) {
      migrated.workingHours = {}
      Object.entries(parsedData.workingHours).forEach(([day, hours]) => {
        migrated.workingHours[day] = {
          active: hours.active,
          timeSlots: {
            morning: { 
              available: hours.active, 
              startTime: hours.start || "09:00", 
              endTime: "13:00" 
            },
            afternoon: { 
              available: hours.active, 
              startTime: "13:00", 
              endTime: hours.end || "17:00" 
            }
          }
        }
      })
    }
    
    // FIXED: Migrate unavailable dates using centralized helper
    if (parsedData.unavailableDates && Array.isArray(parsedData.unavailableDates)) {
      migrated.unavailableDates = migrateDateArray(parsedData.unavailableDates)
    }
    
    // FIXED: Migrate busy dates using centralized helper
    if (parsedData.busyDates && Array.isArray(parsedData.busyDates)) {
      migrated.busyDates = migrateDateArray(parsedData.busyDates)
    }
    
    return migrated
  }

  // ✅ FIXED: Supplier card pricing - show per-unit price for browsing, not total
  const calculateSupplierCardPricing = (supplier, partyDetails) => {
    if (!supplier) {
      return {
        displayPrice: 0,
        formattedPrice: 'From £0',
        hasEnhancedPricing: false,
        isLeadBased: false
      }
    }

    const isLeadBased = isLeadBasedSupplier(supplier)

    console.log('🔍 Supplier Card: Calculating pricing for browsing:', {
      supplierName: supplier.name,
      category: supplier.category,
      basePrice: supplier.price || supplier.priceFrom,
      isLeadBased,
      partyDetails
    })

    // ✅ FIXED: For lead-based suppliers (like party bags), show per-unit price for browsing
    if (isLeadBased) {
      const unitPrice = supplier.price || supplier.priceFrom || 5
      
      // For party bags, show per-bag pricing in cards
      if (supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')) {
        console.log('🎁 Party bags card: Showing per-bag price for browsing:', unitPrice)
        return {
          displayPrice: unitPrice,
          formattedPrice: `From £${unitPrice} per bag`,
          hasEnhancedPricing: false, // Lead-based suppliers don't have enhanced pricing
          isLeadBased: true,
          pricingBreakdown: { base: unitPrice, weekend: 0, extraHours: 0, addons: 0 },
          pricingDetails: { isLeadBased: true }
        }
      } else {
        // Other lead-based suppliers (cakes, decorations, etc.)
        return {
          displayPrice: unitPrice,
          formattedPrice: `From £${unitPrice}`,
          hasEnhancedPricing: false,
          isLeadBased: true,
          pricingBreakdown: { base: unitPrice, weekend: 0, extraHours: 0, addons: 0 },
          pricingDetails: { isLeadBased: true }
        }
      }
    }

    // For time-based suppliers, apply enhanced pricing (weekend/duration premiums)
    const supplierForPricing = {
      ...supplier,
      price: supplier.price || supplier.priceFrom || 100
    }

    const pricingResult = calculateFinalPrice(supplierForPricing, partyDetails, [])
    const hasEnhancedPricing = pricingResult.finalPrice !== supplierForPricing.price

    console.log('🔍 Supplier Card: Time-based pricing result:', {
      supplierName: supplier.name,
      isLeadBased,
      finalPrice: pricingResult.finalPrice,
      basePrice: supplierForPricing.price,
      hasEnhancedPricing,
      breakdown: pricingResult.breakdown
    })

    return {
      displayPrice: pricingResult.finalPrice,
      formattedPrice: `From £${pricingResult.finalPrice}`,
      hasEnhancedPricing,
      isLeadBased: false,
      pricingBreakdown: pricingResult.breakdown,
      pricingDetails: pricingResult.details
    }
  }

  // ENHANCED: Lead-time availability checking
  const getLeadTimeAvailability = (supplier, date) => {
    if (!supplier || !date) {
      return { available: true, reason: 'no-data-provided' }
    }
    
    const checkDate = parseSupplierDate(date)
    if (!checkDate) {
      return { available: true, reason: 'date-parse-error' }
    }
    
    checkDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkDate < today) {
      return { available: false, reason: 'past-date' }
    }
    
    // Check lead time requirements
    const leadTimeSettings = supplier.leadTimeSettings || {}
    const minLeadTime = leadTimeSettings.minLeadTimeDays || 3
    const advanceBooking = supplier.advanceBookingDays || 0
    
    const minBookingDate = new Date(today)
    minBookingDate.setDate(today.getDate() + minLeadTime + advanceBooking)
    minBookingDate.setHours(0, 0, 0, 0)
    
    if (checkDate < minBookingDate) {
      return { 
        available: false, 
        reason: 'insufficient-lead-time',
        requiredLeadTime: minLeadTime + advanceBooking
      }
    }
    
    const maxDays = supplier.maxBookingDays || 365
    const maxBookingDate = new Date(today)
    maxBookingDate.setDate(today.getDate() + maxDays)
    maxBookingDate.setHours(0, 0, 0, 0)
    
    if (checkDate > maxBookingDate) {
      return { available: false, reason: 'outside-window' }
    }
    
    // Check stock if applicable
    if (leadTimeSettings.stockBased && !leadTimeSettings.unlimitedStock) {
      if (leadTimeSettings.stockQuantity <= 0) {
        return { available: false, reason: 'out-of-stock' }
      }
    }
    
    return { 
      available: true, 
      reason: 'available',
      leadTimeDays: minLeadTime + advanceBooking
    }
  }

  // ENHANCED: Time slot availability check (existing logic but cleaner)
  const isTimeSlotAvailable = (supplier, date, timeSlot) => {
    if (!supplier || !date) {
      return true
    }
    
    const migratedSupplier = getSupplierWithTimeSlots(supplier)
    
    if (!migratedSupplier) {
      return true
    }
    
    try {
      const checkDate = parseSupplierDate(date)
      if (!checkDate) {
        return true
      }
      
      const dateString = dateToLocalString(checkDate)
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' })
      
      // LENIENT: Only check if we have working hours data
      if (migratedSupplier.workingHours?.[dayName]) {
        const workingDay = migratedSupplier.workingHours[dayName]
        
        // If day is explicitly marked as inactive, respect that
        if (workingDay.active === false) {
          return false
        }
        
        // If we have time slot data, check it
        if (workingDay.timeSlots?.[timeSlot]) {
          const slotAvailable = workingDay.timeSlots[timeSlot].available
          if (slotAvailable === false) {
            return false
          }
        }
      }
      
      // Check unavailable dates and busy dates (existing logic)
      // ... (keep your existing unavailable/busy date checking logic)
      
      return true
      
    } catch (error) {
      console.error(`❌ LENIENT: Error checking ${supplier.name}, assuming available:`, error)
      return true
    }
  }

  // ✅ UPDATED: Unified availability checking that uses lead-based detection
  const checkSupplierAvailability = (supplier, date, timeSlot = null) => {
    if (!date || !supplier) {
      return { available: true, reason: 'no-data-provided' }
    }
    
    // ✅ Use unified pricing system to determine supplier type
    const isLeadBased = isLeadBasedSupplier(supplier)
    
    console.log('🔍 Availability Check:', {
      supplierName: supplier.name,
      category: supplier.category,
      isLeadBased,
      checkingDate: date
    })
    
    if (isLeadBased) {
      return getLeadTimeAvailability(supplier, date)
    } else {
      
      // Convert the check date
      let checkDate
      if (typeof date === 'string') {
        checkDate = parseSupplierDate(date)
      } else {
        checkDate = date
      }
      
      if (!checkDate) {
        return { available: true, reason: 'date-parse-error' }
      }
      
      // Only block past dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (checkDate < today) {
        return { available: false, reason: 'past-date' }
      }

      // Get party time slot if not provided
      if (!timeSlot) {
        try {
          const partyDetails = localStorage.getItem('party_details')
          if (partyDetails) {
            const parsed = JSON.parse(partyDetails)
            timeSlot = parsed.timeSlot
            
            // Map from party time if timeSlot not explicitly set
            if (!timeSlot && parsed.time) {
              const timeStr = parsed.time.toLowerCase()
              if (timeStr.includes('am') || 
                  timeStr.includes('9') || timeStr.includes('10') || 
                  timeStr.includes('11') || timeStr.includes('12')) {
                timeSlot = 'morning'
              } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                        timeStr.includes('2') || timeStr.includes('3') || 
                        timeStr.includes('4') || timeStr.includes('5')) {
                timeSlot = 'afternoon'
              }
            }
          }
        } catch (e) {
          console.log('Could not determine party time slot, will check generally')
        }
      }

      // If we have a specific time slot, check it
      if (timeSlot) {
        const isSlotAvailable = isTimeSlotAvailable(supplier, checkDate, timeSlot)
        return {
          available: isSlotAvailable,
          reason: isSlotAvailable ? 'available' : 'time-slot-blocked',
          timeSlot: timeSlot,
          checkedDate: dateToLocalString(checkDate)
        }
      }

      // Fallback: check both morning and afternoon (lenient approach)
      const morningAvailable = isTimeSlotAvailable(supplier, checkDate, 'morning')
      const afternoonAvailable = isTimeSlotAvailable(supplier, checkDate, 'afternoon')
      
      const anyAvailable = morningAvailable || afternoonAvailable
      const availableSlots = []
      if (morningAvailable) availableSlots.push('morning')
      if (afternoonAvailable) availableSlots.push('afternoon')

      return {
        available: anyAvailable,
        reason: anyAvailable ? 'slots-available' : 'all-slots-blocked',
        availableSlots: availableSlots,
        checkedDate: dateToLocalString(checkDate)
      }
    }
  }

  // Handle Quick Add - simplified
  const handleQuickAdd = (supplier) => {
    setSelectedSupplierForCustomization(supplier)
    setShowCustomizationModal(true)
  }

  const handleCustomizationAddToPlan = async (customizationData) => {
    const { supplier, package: selectedPackage, addons, totalPrice } = customizationData
    
    if (!supplier || !selectedPackage) {
      console.error("❌ Missing supplier or package data")
      return { success: false, error: "Missing required data" }
    }
  
    try {
      setAddingSupplier(supplier.id)
      
      const enhancedPackage = {
        ...selectedPackage,
        addons: addons || [],
        originalPrice: selectedPackage.price,
        totalPrice: totalPrice,
        addonsPriceTotal: totalPrice - selectedPackage.price,
        selectedAddons: addons || []
      }
  
      console.log('🔥 CUSTOMIZATION MODAL: Enhanced package created:', enhancedPackage)
      
      // FIXED: Don't call addSupplier - pass data to dashboard instead
      const supplierSelectionData = {
        supplier: supplier,
        package: enhancedPackage,
        addons: addons || [],
        totalPrice: totalPrice,
        autoEnquiry: false
      }
  
      // This should call handleSupplierSelection in the dashboard
      const result = await onSelectSupplier(supplierSelectionData)
      
      // Close the customization modal
      setShowCustomizationModal(false)
      setSelectedSupplierForCustomization(null)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ CUSTOMIZATION MODAL: Error:', error)
      return { success: false, error: error.message }
    } finally {
      setAddingSupplier(null)
    }
  }

  // Category mapping (existing)
  const categoryMapping = useMemo(() => ({
    entertainment: ['Entertainment', 'Services', 'Entertainers', 'entertainment'],
    venue: ['Venues', 'venue'],
    venues: ['Venues', 'venue'],
    catering: ['Catering'],
    cakes: ['Cakes'],
    activities: ['Activities'],
    facePainting: ['Face Painting'],
    partyBags: ['Party Bags'],
    decorations: ['Decorations'],
    photography: ['Photography']
  }), []);

  const selectedDate = useMemo(() => {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date);
  }, [date]);

  // ✅ UPDATED: Filter with unified lead-based awareness
  const filteredSuppliers = useMemo(() => {
    const getPartyDetails = () => {
      try {
        const partyDetails = localStorage.getItem('party_details');
        if (partyDetails) {
          const parsed = JSON.parse(partyDetails);
          return {
            timeSlot: parsed.timeSlot || (parsed.time && parsed.time.includes('am') ? 'morning' : 'afternoon'),
            duration: parsed.duration || 2,
            time: parsed.time
          };
        }
      } catch (e) {
        console.log('Could not get party details for availability checking');
      }
      return { timeSlot: 'afternoon', duration: 2 };
    };
  
    const partyDetails = getPartyDetails();
    
    const filtered = suppliers.filter((supplier) => {
      const targetCategories = Array.isArray(categoryMapping[category]) 
        ? categoryMapping[category] 
        : [categoryMapping[category]];
    
      if (!supplier.category) {
        return false;
      }
    
      const matchesCategory = targetCategories.some(cat => {
        if (!cat) return false;
        return supplier.category === cat || 
               supplier.category?.toLowerCase() === cat.toLowerCase();
      });
    
      if (!matchesCategory) return false;
  
      // ✅ UPDATED: Availability filtering with unified lead-based support
      if (availableOnly && selectedDate) {
        const availabilityResult = checkSupplierAvailability(supplier, selectedDate, partyDetails.timeSlot)
        
        // Only exclude if we're really sure they're unavailable
        const isDefinitelyUnavailable = availabilityResult.reason === 'past-date' || 
                                       availabilityResult.reason === 'time-slot-blocked' ||
                                       availabilityResult.reason === 'all-slots-blocked' ||
                                       availabilityResult.reason === 'insufficient-lead-time' ||
                                       availabilityResult.reason === 'out-of-stock'
        
        if (isDefinitelyUnavailable) {
          return false
        }
      }
      
      // Other filters remain the same...
      if (distance !== "all" && partyLocation) {
        if (!supplier.location) {
          return false
        }
        
        const comparisonLocation = LocationService.getComparisonLocation(supplier.category, partyLocation)
        const distanceMap = {
          "5": "exact",
          "10": "district", 
          "15": "wide",
          "all": "all"
        }
        
        const maxDistance = distanceMap[distance] || "district"
        const canServe = LocationService.arePostcodesNearby(
          supplier.location, 
          comparisonLocation, 
          maxDistance
        )
        
        if (!canServe) {
          return false
        }
      }
  
      if (priceRange !== "all") {
        const [min, max] = priceRange.split('-').map(p => p.replace('+', '').replace('£', ''))
        if (max) {
          if (supplier.priceFrom < parseInt(min) || supplier.priceFrom > parseInt(max)) return false
        } else {
          if (supplier.priceFrom < parseInt(min)) return false
        }
      }
  
      if (ratingFilter !== "all") {
        const minRating = parseFloat(ratingFilter.replace('+', ''))
        if (supplier.rating < minRating) return false
      }
  
      return true
    });
  
    // Sorting logic remains the same...
    if (partyLocation) {
      return filtered.sort((a, b) => {
        const aComparisonLocation = LocationService.getComparisonLocation(a.category, partyLocation);
        const bComparisonLocation = LocationService.getComparisonLocation(b.category, partyLocation);
        
        const aIsRealPostcode = LocationService.isValidPostcode(a.location);
        const bIsRealPostcode = LocationService.isValidPostcode(b.location);
        const aIsDescriptive = LocationService.isDescriptiveLocation(a.location);
        const bIsDescriptive = LocationService.isDescriptiveLocation(b.location);
        
        if (aIsRealPostcode && bIsDescriptive) return -1;
        if (bIsRealPostcode && aIsDescriptive) return 1;
        
        return (b.rating || 0) - (a.rating || 0);
      });
    }
  
    return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [suppliers, category, selectedDate, availableOnly, distance, priceRange, ratingFilter, categoryMapping, partyLocation]);

  if (!isOpen) return null

  // ✅ UPDATED: AvailabilityStatus component with unified lead-based support
  const AvailabilityStatus = ({ supplier, selectedDate }) => {
    if (!selectedDate) {
      return (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          No date selected
        </Badge>
      );
    }

    const isLeadBased = isLeadBasedSupplier(supplier)
    const availabilityResult = checkSupplierAvailability(supplier, selectedDate)

    console.log('🔍 Availability Status:', {
      supplierName: supplier.name,
      isLeadBased,
      availabilityResult
    })

    if (availabilityResult.available) {
      if (isLeadBased) {
        return (
          <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <Package className="w-3 h-3" />
            Can Deliver
            {availabilityResult.leadTimeDays && (
              <span className="text-xs ml-1">({availabilityResult.leadTimeDays}d lead)</span>
            )}
          </Badge>
        );
      } else {
        // Time-slot based availability display (existing logic)
        const getPartyTimeSlot = () => {
          try {
            const partyDetails = localStorage.getItem('party_details');
            if (partyDetails) {
              const parsed = JSON.parse(partyDetails);
              let timeSlot = parsed.timeSlot;
              
              if (!timeSlot && parsed.time) {
                const timeStr = parsed.time.toLowerCase();
                if (timeStr.includes('am') || 
                    timeStr.includes('9') || timeStr.includes('10') || 
                    timeStr.includes('11') || timeStr.includes('12')) {
                  timeSlot = 'morning';
                } else if (timeStr.includes('pm') || timeStr.includes('1') || 
                          timeStr.includes('2') || timeStr.includes('3') || 
                          timeStr.includes('4') || timeStr.includes('5')) {
                  timeSlot = 'afternoon';
                }
              }
              
              return timeSlot;
            }
          } catch (e) {
            console.log('Could not get party time slot');
          }
          return null;
        };

        const partyTimeSlot = getPartyTimeSlot();
        const TimeSlotIcon = partyTimeSlot && TIME_SLOTS[partyTimeSlot]?.icon;
        
        return (
          <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Available
            {TimeSlotIcon && partyTimeSlot && (
              <span className="flex items-center gap-1 ml-1">
                {/* <TimeSlotIcon className="w-3 h-3" />
                <span className="text-xs">{TIME_SLOTS[partyTimeSlot].label}</span> */}
              </span>
            )}
          </Badge>
        );
      }
    } else {
      // Handle different unavailability reasons
      if (isLeadBased) {
        if (availabilityResult.reason === 'insufficient-lead-time') {
          return (
            <Badge variant="destructive" className="text-xs bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Need {availabilityResult.requiredLeadTime}+ days
            </Badge>
          );
        } else if (availabilityResult.reason === 'out-of-stock') {
          return (
            <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </Badge>
          );
        } else {
          return (
            <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
              <X className="w-3 h-3" />
              Unavailable
            </Badge>
          );
        }
      } else {
        // Time-slot based unavailability (existing logic)
        const isDefinitelyUnavailable = availabilityResult.reason === 'past-date' || 
                                       availabilityResult.reason === 'time-slot-blocked' ||
                                       availabilityResult.reason === 'all-slots-blocked'
        
        if (isDefinitelyUnavailable) {
          return (
            <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
              <X className="w-3 h-3" />
              Unavailable
            </Badge>
          );
        } else {
          return (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Check Availability
            </Badge>
          );
        }
      }
    }
  };

  // Complete MobileFriendlyFilters component (existing - no changes needed)
  const MobileFriendlyFilters = ({
    priceRange,
    setPriceRange,
    ratingFilter,
    setRatingFilter,
    distance,
    setDistance,
    availableOnly,
    setAvailableOnly,
    category,
    resultsCount = 0
  }) => {
    const [showFilters, setShowFilters] = useState(false);

    // Count active filters
    const activeFiltersCount = [
      priceRange !== "all",
      ratingFilter !== "all", 
      distance !== "10",
      availableOnly
    ].filter(Boolean).length;

    const clearAllFilters = () => {
      setPriceRange("all");
      setRatingFilter("all");
      setDistance("10");
      setAvailableOnly(false);
    };

    return (
      <>
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden max-h-[85%] flex-shrink-0 p-4 border-b border-[hsl(var(--primary-100))] bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 h-10 border-[hsl(var(--primary-200))]"
              >
                <Filter className="w-4 h-4 text-primary-500" />
                <span className="text-gray-700">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge className="bg-primary-500 text-white text-xs px-2 py-0.5 min-w-[20px] h-5">
                    {activeFiltersCount}
                  </Badge>
                )}
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 h-10"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {resultsCount} results
            </div>
          </div>

          {/* Active Filters Pills - Mobile */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {priceRange !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 text-xs px-3 py-1 flex items-center space-x-1"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>£{priceRange}</span>
                  <button 
                    onClick={() => setPriceRange("all")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {ratingFilter !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 flex items-center space-x-1"
                >
                  <Star className="w-3 h-3" />
                  <span>{ratingFilter}</span>
                  <button 
                    onClick={() => setRatingFilter("all")}
                    className="ml-1 hover:text-yellow-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {distance !== "10" && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-800 text-xs px-3 py-1 flex items-center space-x-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{distance === "all" ? "Any distance" : `${distance} mi`}</span>
                  <button 
                    onClick={() => setDistance("10")}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {availableOnly && (
                <Badge 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-800 text-xs px-3 py-1 flex items-center space-x-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Available on date</span>
                  <button 
                    onClick={() => setAvailableOnly(false)}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Mobile Expanded Filters */}
        {showFilters && (
          <div className="md:hidden flex-shrink-0 p-4 bg-gray-50 border-b border-gray-100 space-y-4">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price Range
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full h-11 bg-white pl-3">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-100">£0 - £100</SelectItem>
                  <SelectItem value="100-150">£100 - £150</SelectItem>
                  <SelectItem value="150-200">£150 - £200</SelectItem>
                  <SelectItem value="200+">£200+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Star className="w-4 h-4 inline mr-1" />
                Minimum Rating
              </label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full h-11 bg-white pl-3">
                  <SelectValue placeholder="Select minimum rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5+">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                Distance
              </label>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger className="w-full h-11 bg-white pl-3">
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Up to 5 miles</SelectItem>
                  <SelectItem value="10">Up to 10 miles</SelectItem>
                  <SelectItem value="15">Up to 15 miles</SelectItem>
                  <SelectItem value="all">Any distance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ UPDATED: Availability checkbox with unified lead-based awareness */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Availability
              </label>
              
              {selectedDate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Party Date:</strong> {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <Checkbox
                  id="available-only-mobile"
                  checked={availableOnly}
                  onCheckedChange={(checked) => {
                    console.log('🔄 SELECTION: Availability filter toggled:', checked)
                    setAvailableOnly(Boolean(checked))
                  }}
                  className="data-[state=checked]:bg-primary-500"
                />
                <label 
                  htmlFor="available-only-mobile" 
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  Only show suppliers available for {selectedDate ? 'selected date' : 'party date'}
                  <div className="text-xs text-gray-500 ml-1">
                    (includes lead-time and party bags)
                  </div>
                </label>
              </div>
              
              {!selectedDate && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ No specific date provided. Filter will use party plan date if available.
                </div>
              )}
            </div>

            {/* Apply/Clear Actions */}
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex-1 h-11"
                disabled={activeFiltersCount === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white h-11"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-shrink-0 flex-wrap items-center gap-4 p-4 md:p-6 border-b border-gray-100 bg-gray-50">
          {/* Show selected date */}
          {selectedDate && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Price:</span>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-auto md:w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0-100">£0-100</SelectItem>
                <SelectItem value="100-150">£100-150</SelectItem>
                <SelectItem value="150-200">£150-200</SelectItem>
                <SelectItem value="200+">£200+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Rating:</span>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-auto md:w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="4.5+">4.5+</SelectItem>
                <SelectItem value="4.0+">4.0+</SelectItem>
                <SelectItem value="3.5+">3.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Distance:</span>
            <Select value={distance} onValueChange={setDistance}>
              <SelectTrigger className="w-auto md:w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Up to 5 mi</SelectItem>
                <SelectItem value="10">Up to 10 mi</SelectItem>
                <SelectItem value="15">Up to 15 mi</SelectItem>
                <SelectItem value="all">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available-only"
              checked={availableOnly}
              onCheckedChange={(checked) => {
                console.log('🔄 SELECTION: Desktop availability filter toggled:', checked)
                setAvailableOnly(Boolean(checked))
              }}
            />
            <label htmlFor="available-only" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Available for {selectedDate ? 'date' : 'party date'} (inc. lead & party bags)
            </label>
          </div>
          
          {/* Results count */}
          <div className="ml-auto text-sm text-gray-600">
            {resultsCount} suppliers
            {availableOnly && selectedDate && (
              <span className="text-green-600 font-medium"> available</span>
            )}
          </div>
        </div>
      </>
    );
  };

  // ✅ UPDATED: SupplierCard with unified pricing
  const SupplierCard = ({ supplier }) => {
    const { navigateWithContext } = useContextualNavigation();
    
    const isLeadBased = isLeadBasedSupplier(supplier)
    const availabilityResult = selectedDate ? checkSupplierAvailability(supplier, selectedDate) : { available: true }
    
    // ✅ UPDATED: Calculate unified pricing for this supplier
    const supplierPricing = calculateSupplierCardPricing(supplier, partyDetailsForPricing)
    
    console.log('🔍 Supplier Card:', {
      supplierName: supplier.name,
      isLeadBased,
      pricing: supplierPricing
    })
    
    // Enhanced unavailability checking for lead-based suppliers
    const isDefinitelyUnavailable = isLeadBased 
      ? (availabilityResult.reason === 'insufficient-lead-time' || 
         availabilityResult.reason === 'out-of-stock' ||
         availabilityResult.reason === 'past-date')
      : (availabilityResult.reason === 'past-date' || 
         availabilityResult.reason === 'time-slot-blocked' ||
         availabilityResult.reason === 'all-slots-blocked')
    
    const isAvailableOnDate = !isDefinitelyUnavailable
    
    const handleViewDetails = (supplier) => {
      // Check if already clicked
      if (clickedSuppliers.has(supplier.id)) {
        console.log('❌ Supplier already being processed:', supplier.id)
        return
      }
      
      console.log('🚀 Starting navigation to supplier:', supplier.id)
      
      // Add to clicked set
      setClickedSuppliers(prev => new Set([...prev, supplier.id]))
      
      try {
        // Check if supplier ID exists
        if (!supplier.id) {
          throw new Error('No supplier ID found')
        }
        
        console.log('🔗 Navigating with context to supplier:', supplier.id)
        
        // Create modal state using your exact prop names
        const modalState = {
          category: category,
          theme: theme,
          date: date,
          filters: initialFilters,
          scrollPosition: window.pageYOffset,
          selectedSupplierId: supplier.id,
          returnAction: 'view-details'
        }
        
        // Use setTimeout for visual feedback, then navigate
        setTimeout(() => {
          navigateWithContext(`/supplier/${supplier.id}`, 'dashboard', modalState)
          console.log('✅ Navigation with context initiated')
        }, 300)
        
      } catch (error) {
        console.error('❌ Navigation error:', error)
        
        // Remove from clicked set on error
        setClickedSuppliers(prev => {
          const newSet = new Set(prev)
          newSet.delete(supplier.id)
          return newSet
        })
        
        alert(`Failed to open supplier profile. Error: ${error.message}`)
      }
    }

    return (
      <Card className="border border-[hsl(var(--primary-200))] shadow-sm overflow-hidden rounded-lg flex flex-col">
        <SwipeableSupplierCarousel 
          supplier={supplier}
          className="mb-4"
          aspectRatio="aspect-[4/3]"
        />
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{supplier.name}</h3>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="flex px-2 items-center gap-1 rounded-full justify-center border-[hsl(var(--primary-900))] border-1">
                <Star className="w-3 h-3 fill-[hsl(var(--primary-700))] text-primary-700" />
                <span className="font-medium text-sm text-primary-700">{supplier.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
            {/* ✅ UPDATED: Show unified pricing */}
            <div className="text-sm font-bold text-gray-400">
              {supplierPricing.formattedPrice}
             
            </div>
            {/* ✅ UPDATED: Add supplier type indicator */}
           
          </div>

          {/* ✅ UPDATED: Availability display with unified support */}
          <div className="mb-3 space-y-2">
            <AvailabilityStatus 
              supplier={supplier} 
              selectedDate={selectedDate}
            />
            
            {/* Show specific availability info for lead-based suppliers */}
            {/* {isLeadBased && selectedDate && availabilityResult.reason && (
              <div className="text-xs text-gray-600">
                {availabilityResult.reason === 'available' && availabilityResult.leadTimeDays && (
                  <span className="text-green-700">Ready in {availabilityResult.leadTimeDays} days</span>
                )}
                {availabilityResult.reason === 'insufficient-lead-time' && availabilityResult.requiredLeadTime && (
                  <span className="text-amber-700">Needs {availabilityResult.requiredLeadTime} days lead time</span>
                )}
              </div>
            )} */}
            
            {/* Show pricing breakdown for enhanced pricing */}
            {/* {supplierPricing.hasEnhancedPricing && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {supplierPricing.pricingDetails?.isWeekend && supplierPricing.pricingBreakdown?.weekend > 0 && (
                  <span>Weekend +£{supplierPricing.pricingBreakdown.weekend}</span>
                )}
                {supplierPricing.pricingBreakdown?.extraHours > 0 && (
                  <span className="ml-2">Extra time +£{supplierPricing.pricingBreakdown.extraHours}</span>
                )}
                {supplierPricing.pricingDetails?.guestCount && supplier.category === 'Party Bags' && (
                  <span className="ml-2">{supplierPricing.pricingDetails.guestCount} bags</span>
                )}
              </div>
            )}
             */}
            {/* Show availability reason if debugging needed */}
            {/* {selectedDate && !isAvailableOnDate && (
              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                {isLeadBased ? 
                  (availabilityResult.reason === 'insufficient-lead-time' ? 
                    'Insufficient lead time' : 
                    availabilityResult.reason === 'out-of-stock' ? 
                    'Currently out of stock' : 
                    'Not available'
                  ) :
                  `Reason: ${availabilityResult.reason}`
                }
              </div>
            )} */}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex md:flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={(e) => {
                  // Visual scale feedback
                  const button = e.currentTarget
                  if (button && !clickedSuppliers.has(supplier.id)) {
                    button.style.transform = 'scale(0.95)'
                    button.style.transition = 'transform 0.1s ease'
                    
                    setTimeout(() => {
                      button.style.transform = ''
                      button.style.transition = 'transform 0.2s ease'
                    }, 20)
                  }
                  
                  handleViewDetails(supplier)
                }}
                disabled={clickedSuppliers.has(supplier.id)}
                className={`
                  transition-all duration-200
                  ${clickedSuppliers.has(supplier.id) 
                    ? 'opacity-75 cursor-wait bg-primary-100 text-primary-700' 
                    : 'hover:scale-105 rounded-full h-10 border-[hsl(var(--primary-500))] text-gray-700 active:scale-95'
                  }
                `}
              >
                {clickedSuppliers.has(supplier.id) ? (
                  <div className="flex items-center gap-2 rounded-full">
                    <div className="w-4 h-4 border-2 rounded-full border-[hsl(var(--primary-500))] border-t-transparent animate-spin"></div>
                    Opening...
                  </div>
                ) : (
                  'View Details'
                )}
              </Button>
              
              {/* ✅ UPDATED: Quick Add Button with unified lead-based awareness */}
              <Button
                size="lg"
                className={`py-3 flex-1 relative rounded-full transition-all duration-200 ${
                  isDefinitelyUnavailable
                    ? 'bg-gray-400 hover:bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-gray-100'
                }`}
                onClick={() => handleQuickAdd(supplier)}
                disabled={addingSupplier === supplier.id || isDefinitelyUnavailable}
              >
                {addingSupplier === supplier.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Adding...
                  </>
                ) : isDefinitelyUnavailable ? (
                  <>
                    {isLeadBased ? (
                      availabilityResult.reason === 'insufficient-lead-time' ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Too Soon
                        </>
                      ) : availabilityResult.reason === 'out-of-stock' ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Not Available
                        </>
                      )
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Not Available
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isLeadBased ? (
                      <Truck className="w-4 h-4 mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Quick Add
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {category === 'facePainting' ? 'Activities' : category} Providers
              </h2>
              {selectedDate && (
                <p className="text-primary-100 text-sm mt-1">
                  For {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Filters */}
          <MobileFriendlyFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            distance={distance}
            setDistance={setDistance}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            category={category}
            resultsCount={filteredSuppliers.length}
          />

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading suppliers...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">
                  <p>Error loading suppliers: {error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSuppliers.map((supplier) => (
                    <SupplierCard key={supplier.id} supplier={supplier} />
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <div className="md:col-span-3 text-center py-10 text-gray-500">
                      <p className="text-lg mb-2">
                        {availableOnly && selectedDate 
                          ? `No ${category} suppliers available for ${selectedDate.toLocaleDateString()}.`
                          : `No ${category} suppliers match your current filters.`
                        }
                      </p>
                      <p>Try adjusting your search criteria{availableOnly && selectedDate ? ' or selecting a different date' : ''}.</p>
                      {availableOnly && selectedDate && (
                        <p className="text-sm text-gray-400 mt-2">
                          Note: Lead-based suppliers (like party bags) need sufficient advance notice
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Pass unified pricing props to SupplierCustomizationModal */}
      <SupplierCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => {
          setShowCustomizationModal(false)
          setSelectedSupplierForCustomization(null)
        }}
        supplier={selectedSupplierForCustomization}
        isAdding={addingSupplier === selectedSupplierForCustomization?.id}
        onAddToPlan={handleCustomizationAddToPlan}
        // ✅ UPDATED: Pass unified pricing props
        selectedDate={null} // We don't have a selected calendar date in this context
        currentMonth={currentMonth}
        partyDate={selectedDate} // Use the modal's selected date as party date
        partyDetails={partyDetailsForPricing} // Pass complete party details for pricing
      />
    </>
  )
}