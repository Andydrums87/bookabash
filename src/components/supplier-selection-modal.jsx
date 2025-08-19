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
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { useSuppliers } from '@/utils/mockBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'



export default function SupplierSelectionModal({
  isOpen,
  onClose,
  category,
  theme,
  date,
  onSelectSupplier,
  initialFilters = {}, // NEW: Add this prop
  partyLocation = null,
  currentPhase = "planning",
  partyData = {},
  enquiries = [],
  hasEnquiriesPending = false,
  partyId, // Add this too
}) {
  // NEW: Initialize state with restored filters or defaults
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || "all")
  const [ratingFilter, setRatingFilter] = useState(initialFilters.ratingFilter || "all")
  const [distance, setDistance] = useState(initialFilters.distance || "10")
  const [availableOnly, setAvailableOnly] = useState(initialFilters.availableOnly || false)
  const [addingSupplier, setAddingSupplier] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState('premium')

  // NEW: Customization modal state
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [selectedSupplierForCustomization, setSelectedSupplierForCustomization] = useState(null)

  // Get suppliers from backend
  const { suppliers, loading, error } = useSuppliers()
  const { addSupplier, removeSupplier, addAddon } = usePartyPlan()

  // NEW: Update filters when initialFilters change (for restoration)
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      console.log('🔄 Applying restored filters:', initialFilters)
      setPriceRange(initialFilters.priceRange || "all")
      setRatingFilter(initialFilters.ratingFilter || "all")
      setDistance(initialFilters.distance || "10")
      setAvailableOnly(initialFilters.availableOnly || false)
    }
  }, [initialFilters])

  // Handle Quick Add - simplified
  const handleQuickAdd = (supplier) => {
    setSelectedSupplierForCustomization(supplier)
    setShowCustomizationModal(true)
  }

  const handleSendIndividualEnquiry = async (supplier, selectedPackage, partyId) => {
    try {
      console.log('📧 Sending individual enquiry from selection modal:', {
        supplierName: supplier.name,
        packageName: selectedPackage.name,
        partyId
      })
      
      // Import your database backend at the top of the file
      // import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
      
      // Call your backend to send individual enquiry
      const result = await partyDatabaseBackend.sendIndividualEnquiry(
        partyId, 
        supplier, 
        selectedPackage, 
        `Quick enquiry for ${supplier.category} services`
      )
      
      if (result.success) {
        console.log('✅ Individual enquiry sent successfully')
        return { success: true, enquiry: result.enquiry }
      } else {
        console.error('❌ Failed to send enquiry:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ Error in handleSendIndividualEnquiry:', error)
      return { success: false, error: error.message }
    }
  }

  // NEW: Handle customization modal add to plan - with comprehensive debugging
  const handleCustomizationAddToPlan = async (customizationData) => {
    const { supplier, package: selectedPackage, addons, totalPrice } = customizationData
    
    console.log('🔥 STEP 1 - Received customizationData:', customizationData)
    console.log('🔥 STEP 1 - Addons array:', addons)
    console.log('🔥 STEP 1 - Total price vs base price:', { totalPrice, basePrice: selectedPackage?.price })
    
    if (!supplier || !selectedPackage) {
      console.error("Missing supplier or package data")
      return
    }

    try {
      setAddingSupplier(supplier.id)
      
      // Create enhanced package in exact same format as supplier profile
      const enhancedPackage = {
        ...selectedPackage,
        addons: addons || [],
        originalPrice: selectedPackage.price,
        totalPrice: totalPrice,
        addonsPriceTotal: totalPrice - selectedPackage.price,
        selectedAddons: addons || []
      }

      console.log('🔥 STEP 2 - Enhanced package being sent to addSupplier:', enhancedPackage)
      console.log('🔥 STEP 2 - Enhanced package addons:', enhancedPackage.addons)
      console.log('🔥 STEP 2 - Enhanced package selectedAddons:', enhancedPackage.selectedAddons)
      
      // Call addSupplier with enhanced package
      console.log('🔥 STEP 3 - Calling addSupplier with:', { 
        supplierName: supplier.name, 
        enhancedPackageKeys: Object.keys(enhancedPackage),
        hasAddons: (enhancedPackage.addons || []).length > 0
      })
      
      const result = await addSupplier(supplier, enhancedPackage)
      
      console.log('🔥 STEP 4 - addSupplier result:', result)
      
      if (result.success) {
        // Wait a moment then check localStorage
        setTimeout(() => {
          const savedPlan = localStorage.getItem('user_party_plan')
          const parsedPlan = savedPlan ? JSON.parse(savedPlan) : null
          console.log('🔥 STEP 5 - Final saved plan:', parsedPlan)
          
          if (parsedPlan?.entertainment) {
            console.log('🔥 STEP 5 - Entertainment object:', parsedPlan.entertainment)
            console.log('🔥 STEP 5 - Entertainment selectedAddons:', parsedPlan.entertainment.selectedAddons)
            console.log('🔥 STEP 5 - Entertainment packageData:', parsedPlan.entertainment.packageData)
            console.log('🔥 STEP 5 - Entertainment totalPrice:', parsedPlan.entertainment.totalPrice)
          }
        }, 500)
        
        const addonMessage = addons?.length > 0 
          ? ` with ${addons.length} exciting add-on${addons.length > 1 ? 's' : ''}` 
          : ''
        
        console.log(`✅ ${supplier.name} successfully added to party plan${addonMessage}`)
        
        // Close both modals
        setShowCustomizationModal(false)
        setSelectedSupplierForCustomization(null)
        onClose()
      } else {
        throw new Error(result.error || "Failed to add supplier to party plan")
      }
      
    } catch (error) {
      console.error('❌ CUSTOMIZATION DEBUG - Error adding customized supplier:', error)
    } finally {
      setAddingSupplier(null)
    }
  }
  const categoryMapping = useMemo(() => ({
    entertainment: ['Entertainment', 'Services', 'Entertainers', 'entertainment'],
    venue: ['Venues', 'venue'],
    venues: ['Venues', 'venue'],
    catering: ['Catering'],
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

// Enhanced availability checking for SupplierSelectionModal
// Replace the checkSupplierAvailabilityOnDate function with this enhanced version

const checkSupplierAvailabilityOnDate = (supplier, date, timeSlot = null, duration = 2) => {
  if (!date) {
    console.log(`📅 ${supplier.name}: No date provided - assuming available`);
    return true;
  }
  
  console.log(`📅 Checking availability for ${supplier.name} on ${date}`);
  
  // Convert the check date to a Date object if it's a string
  let checkDate;
  if (typeof date === 'string') {
    checkDate = new Date(date);
  } else {
    checkDate = date;
  }
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkDate < today) {
    console.log(`⏰ ${supplier.name}: Past date - unavailable`);
    return false;
  }

  // Get supplier data (parse if it's a string)
  let supplierData = supplier;
  if (supplier.data && typeof supplier.data === 'string') {
    try {
      supplierData = { ...supplier, ...JSON.parse(supplier.data) };
      console.log(`📋 ${supplier.name}: Parsed supplier data successfully`);
    } catch (e) {
      console.log(`⚠️ ${supplier.name}: Could not parse supplier data:`, e.message);
    }
  }

  // SIMPLIFIED: Use the exact same logic as Browse Suppliers calendar
  const isDateUnavailable = (date, supplierData) => {
    if (!supplierData?.unavailableDates) return false;
    
    console.log(`📅 ${supplier.name}: Checking against unavailable dates:`, supplierData.unavailableDates);
    
    const result = supplierData.unavailableDates.some((unavailableDate) => {
      const unavailableDateObj = new Date(unavailableDate);
      const checkResult = unavailableDateObj.toDateString() === date.toDateString();
      
      console.log(`📅 ${supplier.name}: Comparing ${date.toDateString()} with ${unavailableDateObj.toDateString()} = ${checkResult}`);
      
      return checkResult;
    });
    
    return result;
  };

  // Check if date is unavailable using the same logic as Browse Suppliers
  if (isDateUnavailable(checkDate, supplierData)) {
    console.log(`❌ ${supplier.name}: Date ${checkDate.toDateString()} is unavailable`);
    return false;
  }

  // Check other availability rules (optional - can be simplified further)
  if (supplierData.availability) {
    const availability = supplierData.availability;
    
    // Check days of week if specified
    if (availability.daysOfWeek && Array.isArray(availability.daysOfWeek) && availability.daysOfWeek.length > 0) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[checkDate.getDay()];
      
      if (!availability.daysOfWeek.includes(dayOfWeek)) {
        console.log(`❌ ${supplier.name}: ${dayOfWeek} not in available days - unavailable`);
        return false;
      }
    }
    
    // Check time slots if specified
    if (timeSlot && availability.timeSlots && Array.isArray(availability.timeSlots) && availability.timeSlots.length > 0) {
      if (!availability.timeSlots.includes(timeSlot)) {
        console.log(`❌ ${supplier.name}: ${timeSlot} not in available time slots - unavailable`);
        return false;
      }
    }
  }

  console.log(`✅ ${supplier.name}: Available on ${checkDate.toDateString()}`);
  return true;
};

// Enhanced filtering logic that gets party details for better availability checking
const filteredSuppliers = useMemo(() => {
  console.log(`🔍 Filtering suppliers for category: ${category}, party location: ${partyLocation}, distance: ${distance}`);
  
  // Get party details for more accurate availability checking
  const getPartyDetails = () => {
    try {
      // Try to get party details from various sources
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
      console.log(`❌ ${supplier.name}: No category defined`);
      return false;
    }
  
    const matchesCategory = targetCategories.some(cat => {
      if (!cat) return false;
      return supplier.category === cat || 
             supplier.category?.toLowerCase() === cat.toLowerCase();
    });
  
    if (!matchesCategory) return false;

    // ENHANCED: More comprehensive availability checking
    if (availableOnly && selectedDate) {
      const isAvailableOnDate = checkSupplierAvailabilityOnDate(
        supplier, 
        selectedDate, 
        partyDetails.timeSlot, 
        partyDetails.duration
      );
      if (!isAvailableOnDate) {
        console.log(`❌ ${supplier.name}: Not available on ${selectedDate} for ${partyDetails.timeSlot} (${partyDetails.duration}h)`);
        return false;
      }
    }
    
    // Location filtering (existing logic)
    if (distance !== "all" && partyLocation) {
      if (!supplier.location) {
        console.log(`📍 ${supplier.name}: No location data - excluding`);
        return false;
      }
      
      const comparisonLocation = LocationService.getComparisonLocation(supplier.category, partyLocation);
      const distanceMap = {
        "5": "exact",
        "10": "district", 
        "15": "wide",
        "all": "all"
      };
      
      const maxDistance = distanceMap[distance] || "district";
      const canServe = LocationService.arePostcodesNearby(
        supplier.location, 
        comparisonLocation, 
        maxDistance
      );
      
      if (!canServe) {
        console.log(`❌ ${supplier.name}: Cannot serve location`);
        return false;
      }
    }

    // Other filters (price, rating, etc.)
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

  console.log(`📊 Filtering results: ${filtered.length}/${suppliers.length} suppliers match criteria`);
  console.log(`📅 Availability filter active: ${availableOnly}, date: ${selectedDate}`);

  // Sorting logic (existing)
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

// Add this debug function to see exactly what's happening
const debugSupplierAvailability = (supplier, checkDate) => {
  console.log('\n🔍 DEBUGGING AVAILABILITY FOR:', supplier.name);
  console.log('📅 Check date:', checkDate);
  console.log('📋 Supplier object keys:', Object.keys(supplier));
  
  // Check if supplier has data field
  if (supplier.data) {
    console.log('💾 Supplier has data field (type:', typeof supplier.data, ')');
    
    if (typeof supplier.data === 'string') {
      try {
        const parsedData = JSON.parse(supplier.data);
        console.log('✅ Successfully parsed supplier data');
        console.log('📋 Parsed data keys:', Object.keys(parsedData));
        
        // Check for unavailableDates
        if (parsedData.unavailableDates) {
          console.log('📅 Found unavailableDates:', parsedData.unavailableDates);
          console.log('📅 Type:', typeof parsedData.unavailableDates);
          console.log('📅 Is array:', Array.isArray(parsedData.unavailableDates));
          
          if (Array.isArray(parsedData.unavailableDates)) {
            console.log('📅 Unavailable dates list:');
            parsedData.unavailableDates.forEach((date, index) => {
              console.log(`  ${index + 1}. ${date} (type: ${typeof date})`);
            });
            
            // Test date normalization
            const checkDateNormalized = checkDate; // Assuming this is already "YYYY-MM-DD"
            console.log('📅 Check date normalized:', checkDateNormalized);
            
            parsedData.unavailableDates.forEach((unavailableDate, index) => {
              if (unavailableDate.includes('T')) {
                const datePart = unavailableDate.split('T')[0];
                console.log(`📅 Unavailable date ${index + 1}: ${unavailableDate} → ${datePart}`);
                console.log(`📅 Match with ${checkDateNormalized}?`, datePart === checkDateNormalized);
              }
            });
          }
        } else {
          console.log('❌ No unavailableDates field found in parsed data');
        }
        
        // Check other possible fields
        ['busyDates', 'blockedDates'].forEach(field => {
          if (parsedData[field]) {
            console.log(`📅 Found ${field}:`, parsedData[field]);
          }
        });
        
      } catch (e) {
        console.log('❌ Error parsing supplier data:', e.message);
        console.log('💾 Raw data:', supplier.data.substring(0, 200) + '...');
      }
    } else {
      console.log('📋 Data is not a string:', supplier.data);
    }
  } else {
    console.log('❌ No data field found on supplier');
  }
  
  // Check direct fields on supplier
  ['unavailableDates', 'busyDates', 'blockedDates'].forEach(field => {
    if (supplier[field]) {
      console.log(`📅 Found ${field} directly on supplier:`, supplier[field]);
    }
  });
};

// Use this in your component temporarily:
// debugSupplierAvailability(supplier, selectedDate);

  if (!isOpen) return null

  // Complete MobileFriendlyFilters component
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

            {/* Availability */}
            {/* <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Availability
              </label>
              
              {selectedDate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Selected Date:</strong> {selectedDate.toLocaleDateString('en-US', { 
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
                  onCheckedChange={(checked) => setAvailableOnly(Boolean(checked))}
                  className="data-[state=checked]:bg-primary-500"
                />
                <label 
                  htmlFor="available-only-mobile" 
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  Only show suppliers available on {selectedDate ? 'selected date' : 'party date'}
                </label>
              </div>
              
              {!selectedDate && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ No specific date provided. Using general availability.
                </div>
              )}
            </div> */}

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
              onCheckedChange={(checked) => setAvailableOnly(Boolean(checked))}
            />
            <label htmlFor="available-only" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Available on {selectedDate ? 'date' : 'party date'}
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

  const AvailabilityStatus = ({ supplier, selectedDate, partyDetails }) => {
    if (!selectedDate) {
      return (
        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
          📅 No date selected
        </Badge>
      );
    }
  
    const isAvailable = checkSupplierAvailabilityOnDate(
      supplier, 
      selectedDate, 
      partyDetails?.timeSlot, 
      partyDetails?.duration
    );
  
    if (isAvailable) {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
          ✅ Available
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200">
          ❌ Not Available
        </Badge>
      );
    }
  };

  // UPDATED SupplierCard with Quick Add
  const SupplierCard = ({ supplier }) => {
    debugSupplierAvailability(supplier, selectedDate);
    const { navigateWithContext } = useContextualNavigation();
    const isAvailableOnDate = selectedDate ? checkSupplierAvailabilityOnDate(supplier, selectedDate) : true;
    
    // Get party details for availability checking
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
        console.log('Could not get party details');
      }
      return { timeSlot: 'afternoon', duration: 2 };
    };
  
    const partyDetails = getPartyDetails();
    
    
    const handleViewDetails = () => {
      const modalState = {
        isOpen: true,
        category,
        theme,
        date,
        filters: { priceRange, ratingFilter, distance, availableOnly },
        scrollPosition: window.pageYOffset || document.documentElement.scrollTop
      };
      
      navigateWithContext(`/supplier/${supplier.id}`, 'dashboard', modalState);
    };
    
    return (
      <Card className="border border-[hsl(var(--primary-200))] shadow-sm overflow-hidden rounded-lg flex flex-col">
        <div className="relative w-full h-60 md:h-60">
          <div
            className="relative w-64 h-64 mask-image mx-auto mt-5"
            style={{
              WebkitMaskImage: 'url("/image.svg")',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'center',
              maskImage: 'url("/image.svg")',
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
              maskPosition: 'center',
            }}
          >
            <Image
              src={supplier.image || supplier.imageUrl || `/placeholder.png`}
              alt={supplier.name}
              fill
              className="object-cover group-hover:brightness-110 transition-all duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
   
          {supplier.badges && supplier.badges[0] && (
            <Badge className="absolute top-3 left-3 bg-primary-100 text-primary-700 text-xs px-2 py-1 shadow-md">
              {supplier.badges[0]}
            </Badge>
          )}
          <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10">
            <Heart className={`w-4 h-4`} />
          </button>
        </div>
        
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
            <div className="text-sm font-bold text-gray-400">From £{supplier.priceFrom}</div>
          </div>

          {/* UPDATED: Enhanced availability display */}
        <div className="mb-3 space-y-2">
          <AvailabilityStatus 
            supplier={supplier} 
            selectedDate={selectedDate} 
            partyDetails={partyDetails} 
          />
          
          {/* Show additional availability info if available */}
          {supplier.availability?.timeSlots && (
            <div className="text-xs text-gray-500">
              Available: {supplier.availability.timeSlots.join(', ')}
            </div>
          )}
          
          {supplier.availability?.maxDuration && (
            <div className="text-xs text-gray-500">
              Max duration: {supplier.availability.maxDuration}h
            </div>
          )}
        </div>
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex md:flex-col sm:flex-row gap-2">
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 py-2 rounded-full bg-primary-100 border-none text-primary-900"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
              {/* UPDATED: Quick Add Button */}
              <Button
                size="lg"
                className="bg-primary-500 hover:bg-[hsl(var(--primary-700))] py-3 text-gray-100 flex-1 relative rounded-full"
                onClick={() => handleQuickAdd(supplier)}
                disabled={addingSupplier === supplier.id || (selectedDate && !isAvailableOnDate)}
              >
                {addingSupplier === supplier.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Adding...
                  </>
                ) : selectedDate && !isAvailableOnDate ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Not Available
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {category === 'facePainting' ? 'Activities' : category} Providers
              </h2>
             
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
                          ? `No ${category} suppliers available on ${selectedDate.toLocaleDateString()}.`
                          : `No ${category} suppliers match your current filters.`
                        }
                      </p>
                      <p>Try adjusting your search criteria{availableOnly && selectedDate ? ' or selecting a different date' : ''}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

           <SupplierCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => {

          setShowCustomizationModal(false)
          setSelectedSupplierForCustomization(null)
        }}
        supplier={selectedSupplierForCustomization}
        // onAddToPlan={handleCustomizationAddToPlan}
        isAdding={addingSupplier === selectedSupplierForCustomization?.id}
        onAddToPlan={onSelectSupplier} 
      />
    </>
  )
}