"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import SupplierCustomizationModal from './SupplierCustomizationModal'
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
  initialFilters = {} // NEW: Add this prop
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

  // Availability checking logic
  const checkSupplierAvailabilityOnDate = (supplier, date) => {
    if (!date) return true;
    
    console.log(`🔍 Checking availability for ${supplier.name} on ${date}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate;
    try {
      checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      if (isNaN(checkDate.getTime())) {
        console.log(`📅 Invalid date format: ${date}, assuming available`);
        return true;
      }
    } catch (e) {
      console.log(`📅 Invalid date format: ${date}, assuming available`);
      return true;
    }
    
    if (checkDate < today) {
      console.log(`⏰ ${supplier.name}: Past date - unavailable`);
      return false;
    }
    
    // Additional availability checks...
    console.log(`✅ ${supplier.name}: Available on ${checkDate.toDateString()}`);
    return true;
  };

  const selectedDate = useMemo(() => {
    if (!date) return null;
    if (date instanceof Date) return date;
    return new Date(date);
  }, [date]);

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

  const filteredSuppliers = useMemo(() => {
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

      if (availableOnly && selectedDate) {
        const isAvailableOnDate = checkSupplierAvailabilityOnDate(supplier, selectedDate);
        if (!isAvailableOnDate) return false;
      }
      
      if (distance !== "all") {
        if (!supplier.location) {
          console.log(`📍 ${supplier.name}: No location data - including in results`);
        } else {
          const hasLocalArea = supplier.location.toLowerCase().includes('london') || 
                              supplier.location.toLowerCase().includes('uk wide');
          if (!hasLocalArea) return false;
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

    return filtered;
  }, [suppliers, category, selectedDate, availableOnly, distance, priceRange, ratingFilter, categoryMapping]);

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
        <div className="md:hidden flex-shrink-0 p-4 border-b border-[hsl(var(--primary-100))] bg-white">
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

  // UPDATED SupplierCard with Quick Add
  const SupplierCard = ({ supplier }) => {
    const { navigateWithContext } = useContextualNavigation();
    const isAvailableOnDate = selectedDate ? checkSupplierAvailabilityOnDate(supplier, selectedDate) : true;
    
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

          <div className="mb-3">
            <Badge variant="default" className="text-[0.7rem] rounded-full bg-primary-200 text-primary-900 font-light">
              {supplier.availability || "Available this weekend"}
            </Badge>
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
              <p className="text-white capitalize">
                {theme} Theme • {selectedDate ? selectedDate.toLocaleDateString() : date}
              </p>
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

      {/* NEW: Customization Modal - with debugging */}
      {console.log('🔍 MODAL RENDER CHECK:', {
        showCustomizationModal,
        selectedSupplierForCustomization: selectedSupplierForCustomization?.name,
        shouldRender: showCustomizationModal && selectedSupplierForCustomization
      })}
      
      <SupplierCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => {
          console.log('🚪 MODAL CLOSING - onClose called')
          setShowCustomizationModal(false)
          setSelectedSupplierForCustomization(null)
        }}
        supplier={selectedSupplierForCustomization}
        onAddToPlan={handleCustomizationAddToPlan}
        isAdding={addingSupplier === selectedSupplierForCustomization?.id}
      />
    </>
  )
}