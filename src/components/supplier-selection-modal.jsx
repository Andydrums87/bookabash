"use client"

import { useState, useEffect } from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  Calendar
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSuppliers } from '@/utils/mockBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'

export default function SupplierSelectionModal({
  isOpen,
  onClose,
  category,
  theme,
  date, // This should be a Date object passed from parent
  onSelectSupplier,
}) {
  const [priceRange, setPriceRange] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [distance, setDistance] = useState("10")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [addingSupplier, setAddingSupplier] = useState(null)
  const [selectedPackageId, setSelectedPackageId] = useState('premium') 


  
  
  // Get suppliers from backend
  const { suppliers, loading, error } = useSuppliers()
  const { addSupplier, removeSupplier } = usePartyPlan()

  const handleAddSupplier = async (supplier) => {
    try {
      setAddingSupplier(supplier.id);

      
  
      // Add supplier to the user's party plan/dashboard
      await addSupplier({
        id: supplier.id,
        name: supplier.name,
        category: supplier.category,
        priceFrom: supplier.priceFrom,
        description: supplier.description,
        image: supplier.image,
        // Include the selected package if relevant
        selectedPackage: selectedPackageId || 'basic',
        // Add any other fields your dashboard needs
      });
      
      console.log(`✅ Added ${supplier.name} to party plan`);
      
      // Optional: Close modal after successful add
      onClose();
      
    } catch (error) {
      console.error('❌ Error adding supplier to party plan:', error);
    } finally {
      setAddingSupplier(null);
    }
  };

  const checkSupplierAvailabilityOnDate = (supplier, date) => {
    if (!date) return true;
    
    console.log(`🔍 Checking availability for ${supplier.name} on ${date}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate;
    try {
      checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      // Validate the date is actually valid
      if (isNaN(checkDate.getTime())) {
        console.log(`📅 Invalid date format: ${date}, assuming available`);
        return true;
      }
    } catch (e) {
      console.log(`📅 Invalid date format: ${date}, assuming available`);
      return true;
    }
    
    // 1. Reject if clearly in the past
    if (checkDate < today) {
      console.log(`⏰ ${supplier.name}: Past date - unavailable`);
      return false;
    }
    
    // 2. Check specific unavailable dates if they exist
    if (supplier.unavailableDates && Array.isArray(supplier.unavailableDates)) {
      const checkDateStr = checkDate.toISOString().split('T')[0]; // Now safe to use
      
      const isUnavailable = supplier.unavailableDates.some(unavailableDate => {
        try {
          const unavailableDateObj = new Date(unavailableDate);
          unavailableDateObj.setHours(0, 0, 0, 0);
          const unavailableDateStr = unavailableDateObj.toISOString().split('T')[0];
          
          const matches = unavailableDateStr === checkDateStr;
          if (matches) {
            console.log(`❌ ${supplier.name}: Specifically unavailable on ${checkDateStr} (matches ${unavailableDateStr})`);
          }
          return matches;
        } catch (e) {
          console.log(`⚠️ Invalid unavailable date format for ${supplier.name}:`, unavailableDate);
          return false;
        }
      });
    
      if (isUnavailable) return false;
    }
    
    
    // 3. Check working hours for the day of the week
    if (supplier.workingHours) {
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      const daySchedule = supplier.workingHours[dayName];
      
      if (daySchedule && !daySchedule.active) {
        console.log(`📅 ${supplier.name}: Not working on ${dayName}`);
        return false;
      }
      
      if (daySchedule && daySchedule.active) {
        console.log(`✅ ${supplier.name}: Working on ${dayName} (${daySchedule.start} - ${daySchedule.end})`);
      }
    }
    
    // 4. Check busy dates (optional - might still be bookable but with note)
    if (supplier.busyDates && Array.isArray(supplier.busyDates)) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      const isBusy = supplier.busyDates.some(busyDate => {
        try {
          const busyDateObj = new Date(busyDate);
          busyDateObj.setHours(0, 0, 0, 0);
          const busyDateStr = busyDateObj.toISOString().split('T')[0];
          return busyDateStr === checkDateStr;
        } catch (e) {
          return false;
        }
      });
      
      if (isBusy) {
        console.log(`⚠️ ${supplier.name}: Busy on ${checkDateStr} but may still be bookable`);
        // Don't return false here - busy doesn't mean unavailable
      }
    }
    
    // 5. Check advance booking requirements
    if (supplier.advanceBookingDays) {
      const minBookingDate = new Date(today);
      minBookingDate.setDate(today.getDate() + supplier.advanceBookingDays);
      
      if (checkDate < minBookingDate) {
        console.log(`⏰ ${supplier.name}: Requires ${supplier.advanceBookingDays} days advance booking`);
        return false;
      }
    }
    
    // 6. Check maximum booking window
    if (supplier.maxBookingDays) {
      const maxBookingDate = new Date(today);
      maxBookingDate.setDate(today.getDate() + supplier.maxBookingDays);
      
      if (checkDate > maxBookingDate) {
        console.log(`📅 ${supplier.name}: Beyond maximum booking window of ${supplier.maxBookingDays} days`);
        return false;
      }
    }
    
    console.log(`✅ ${supplier.name}: Available on ${checkDate.toDateString()}`);
    return true;
  };
  
  // Example of how to test this function:
  const testSupplier = {
    name: "Test Supplier",
    unavailableDates: ["2025-06-15", "2025-06-20"],
    workingHours: {
      Monday: { active: true, start: "09:00", end: "17:00" },
      Tuesday: { active: true, start: "09:00", end: "17:00" },
      Wednesday: { active: true, start: "09:00", end: "17:00" },
      Thursday: { active: true, start: "09:00", end: "17:00" },
      Friday: { active: true, start: "09:00", end: "17:00" },
      Saturday: { active: true, start: "10:00", end: "16:00" },
      Sunday: { active: false, start: "10:00", end: "16:00" }
    },
    busyDates: ["2025-06-18"],
    advanceBookingDays: 2,
    maxBookingDays: 365
  };
  

  
  // How to add unavailable dates to a supplier:
  const addUnavailableDateToSupplier = (supplierId, unavailableDate) => {
    // This would be in your supplier management backend
    const suppliers = getAllSuppliers();
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    
    if (supplierIndex !== -1) {
      if (!suppliers[supplierIndex].unavailableDates) {
        suppliers[supplierIndex].unavailableDates = [];
      }
      
      // Add the date if it's not already there
      const dateStr = new Date(unavailableDate).toISOString().split('T')[0];
      if (!suppliers[supplierIndex].unavailableDates.includes(dateStr)) {
        suppliers[supplierIndex].unavailableDates.push(dateStr);
        saveSuppliers(suppliers);
        console.log(`Added unavailable date ${dateStr} to ${suppliers[supplierIndex].name}`);
      }
    }
  };
  const selectedDate = useMemo(() => {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date);
  }, [date]);

  const categoryMapping = useMemo(() => ({
    entertainment: ['Entertainment', 'Services', 'Entertainers', 'entertainment'], // Multiple matches
    venue: ['Venues', 'venue'], // Handle both cases
    venues: ['Venues', 'venue'],
    catering: ['Catering'],
    activities: ['Activities'],
    facePainting: ['Face Painting'],
    partyBags: ['Party Bags'],
    decorations: ['Decorations'],
    photography: ['Photography']
  }), []);

  // ENHANCED FILTERING WITH DATE AVAILABILITY - MOVE THIS UP
  const filteredSuppliers = useMemo(() => {
    console.log(`🔍 Filtering suppliers for category: ${category}, date: ${selectedDate?.toDateString()}, availableOnly: ${availableOnly}`);
    console.log('🔍 Sample supplier data:', suppliers[0]);
console.log('🔍 Checking what availability fields exist:');
suppliers.slice(0, 3).forEach(supplier => {
  console.log(`${supplier.name}:`, {
    hasWorkingHours: !!supplier.workingHours,
    workingHours: supplier.workingHours,
    hasUnavailableDates: !!supplier.unavailableDates,
    unavailableDates: supplier.unavailableDates,
    hasBusyDates: !!supplier.busyDates,
    advanceBookingDays: supplier.advanceBookingDays,
    maxBookingDays: supplier.maxBookingDays
  });
});
    const filtered = suppliers.filter((supplier) => {
      // Filter by category
      const supplierCategory = categoryMapping[category]

      const targetCategories = Array.isArray(categoryMapping[category]) 
      ? categoryMapping[category] 
      : [categoryMapping[category]];
    
    // Handle missing category gracefully
    if (!supplier.category) {
      console.log(`❌ ${supplier.name}: No category defined`);
      return false;
    }
    
    const matchesCategory = targetCategories.some(cat => {
      if (!cat) return false;
      return supplier.category === cat || 
             supplier.category?.toLowerCase() === cat.toLowerCase();
    });
    
    if (!matchesCategory) {
      console.log(`❌ ${supplier.name}: Category "${supplier.category}" doesn't match "${targetCategories.join(', ')}"`);
      return false;
    }
    
    
    if (!matchesCategory) {
      console.log(`❌ ${supplier.name}: Category "${supplier.category}" doesn't match "${targetCategories.join(', ')}"`);
      return false;
    }
  

      // 🎯 Filter by specific date availability
      if (availableOnly && selectedDate) {
        const isAvailableOnDate = checkSupplierAvailabilityOnDate(supplier, selectedDate);
        if (!isAvailableOnDate) {
          console.log(`❌ Filtered out ${supplier.name} - not available on selected date`);
          return false;
        }
      }
      
      if (distance !== "all") {
        // For prototype: if no location data, assume they're available
        if (!supplier.location) {
          console.log(`📍 ${supplier.name}: No location data - including in results`);
        } else {
          const hasLocalArea = supplier.location.toLowerCase().includes('london') || 
                              supplier.location.toLowerCase().includes('uk wide');
          if (!hasLocalArea) return false;
        }
      }
      // Filter by price range
      if (priceRange !== "all") {
        const [min, max] = priceRange.split('-').map(p => p.replace('+', '').replace('£', ''))
        if (max) {
          if (supplier.priceFrom < parseInt(min) || supplier.priceFrom > parseInt(max)) return false
        } else {
          if (supplier.priceFrom < parseInt(min)) return false
        }
      }

      // Filter by rating
      if (ratingFilter !== "all") {
        const minRating = parseFloat(ratingFilter.replace('+', ''))
        if (supplier.rating < minRating) return false
      }

      return true
    });

    console.log(`📊 Filtered results: ${filtered.length}/${suppliers.length} suppliers available`);
    return filtered;
  }, [suppliers, category, selectedDate, availableOnly, distance, priceRange, ratingFilter, categoryMapping]);



  if (!isOpen) return null


  // UPDATE YOUR MobileFriendlyFilters COMPONENT TO SHOW DATE INFO
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
        <div className="md:hidden flex-shrink-0 p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 h-10"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
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
                <SelectTrigger className="w-full h-11 bg-white">
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
                <SelectTrigger className="w-full h-11 bg-white">
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
                <SelectTrigger className="w-full h-11 bg-white">
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

            {/* Availability - ENHANCED */}
            <div className="space-y-3">
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

        {/* Desktop Filters - ENHANCED */}
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
            {filteredSuppliers.length} suppliers
            {availableOnly && selectedDate && (
              <span className="text-green-600 font-medium"> available</span>
            )}
          </div>
        </div>
      </>
    );
  };

  // ADD AVAILABILITY STATUS TO SUPPLIER CARDS
  const SupplierCard = ({ supplier }) => {
    const isAvailableOnDate = selectedDate ? checkSupplierAvailabilityOnDate(supplier, selectedDate) : true;
    
    return (
      <Card className="border border-[hsl(var(--primary-200))] shadow-sm overflow-hidden rounded-lg flex flex-col">
        <div className="relative w-full h-60 md:h-60 ">
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
    src={
      supplier.image ||
      supplier.imageUrl ||
      `/placeholder.svg?height=256&width=256&query=${pkg.name.replace(/\s+/g, "+")}+package`
    }
    alt={supplier.name}
    fill
    className="object-cover group-hover:brightness-110 transition-all duration-300 "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
   
          
                  {/* Image container with clip path */}
                
          {/* <Image
            src={supplier.image || "https://placehold.co/600x200?text=Event+Banner"}
            alt={`${supplier.name} banner`}
            fill
            className="object-cover"
          /> */}
          
          {/* Availability badge when date is selected */}
          {/* {selectedDate && (
            <Badge className={`absolute top-3 right-3 text-xs px-2 py-1 shadow-md ${
              isAvailableOnDate 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isAvailableOnDate ? '✅ Available' : '❌ Unavailable'}
            </Badge>
          )} */}
{/*           
          {supplier.badges && supplier.badges[0] && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 shadow-md">
              {supplier.badges[0]}
            </Badge>
          )} */}
              {/* Bookmark button - top right */}
              {supplier.badges && supplier.badges[0] && (
            <Badge className="absolute top-3 left-3 bg-primary-100 text-primary-700 text-xs px-2 py-1 shadow-md">
              {supplier.badges[0]}
            </Badge>
          )}
        <button
          // onClick={() => setIsBookmarked(!isBookmarked)}
          className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
        >
          <Heart className={`w-4 h-4`} />
        </button>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{supplier.name}</h3>
            <div className="text-right flex-shrink-0 ml-2">
              {/* <div className="text-xl font-bold text-gray-900">£{supplier.priceFrom}</div> */}
              <div className="flex px-2 items-center gap-1 rounded-full justify-center border-[hsl(var(--primary-900))] border-1">
              <Star className="w-3 h-3 fill-[hsl(var(--primary-700))] text-primary-700" />
              <span className="font-medium text-sm text-primary-700">{supplier.rating}</span>
              {/* <span className="text-gray-500">({supplier.reviewCount} reviews)</span> */}
            </div>
             
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
            {/* <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{supplier.rating}</span>
              <span className="text-gray-500">({supplier.reviewCount} reviews)</span>
            </div> */}

            {/* <span className="text-gray-600">{supplier.location}</span> */}
                    <div className="text-sm font-bold text-gray-400">From £{supplier.priceFrom}</div>
          </div>

          {/* Show working hours if date is selected */}
          {/* {selectedDate && isAvailableOnDate && (() => {
            const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            const daySchedule = supplier.workingHours?.[dayName];
            return daySchedule?.active && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                  Available {daySchedule.start} - {daySchedule.end}
                </Badge>
              </div>
            );
          })()} */}

          <div className="mb-3">
            <Badge variant="default" className="text-[0.7rem] rounded-full bg-primary-200 text-primary-900 font-light">
              {supplier.availability || "Available this weekend"}
            </Badge>
          </div>

          {/* <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">{supplier.description}</p> */}

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex md:flex-col sm:flex-row gap-2">
              <Button size="lg" variant="outline" className="flex-1 py-2 rounded-full bg-primary-100 border-none text-primary-900" asChild>
                <Link href={`/supplier/${supplier.id}`}>View Details</Link>
              </Button>
              <Button
                size="lg"
                className="bg-primary-500 hover:bg-[hsl(var(--primary-700))] py-3 text-gray-100 flex-1 relative rounded-full"
                onClick={() => handleAddSupplier(supplier)}
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
                    Add to Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // REST OF YOUR COMPONENT REMAINS THE SAME, JUST UPDATE THE SUPPLIER GRID TO USE THE NEW CARD:
  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {category === 'facePainting' ? 'Activities' : category} Providers
              </h2>
              <p className="text-gray-600 capitalize">
                {theme} Theme • {selectedDate ? selectedDate.toLocaleDateString() : date}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

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
    </div>
  )
}