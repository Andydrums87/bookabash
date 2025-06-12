"use client"

import { useState, useEffect } from "react"
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
  date,
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

  if (!isOpen) return null

  // Map category names to supplier categories
  const categoryMapping = {
    venue: 'Venues',
    entertainment: 'Entertainment',
    catering: 'Catering',
    activities: 'Activities',
    facePainting: 'Face Painting', // Map face painting to activities
    partyBags: 'Party Bags',
    decorations: 'Decorations',
    photography: 'Photography'
  }

  // Filter suppliers by category and other criteria
  const filteredSuppliers = suppliers.filter((supplier) => {
    // Filter by category
    const supplierCategory = categoryMapping[category]
    if (supplier.category !== supplierCategory) return false

    // Filter by availability
    if (availableOnly && !supplier.availability.toLowerCase().includes('available')) return false
    
    // Filter by distance (simplified - just check if it contains London or UK Wide)
    if (distance !== "all") {
      const hasLocalArea = supplier.location.toLowerCase().includes('london') || 
                          supplier.location.toLowerCase().includes('uk wide')
      if (!hasLocalArea) return false
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
  })

  const handleAddSupplier = async (supplier) => {
    setAddingSupplier(supplier.id)
    
    try {
      // Add supplier to party plan
      const result = await addSupplier(supplier)
      
      if (result.success) {
        console.log('✅ Successfully added supplier to party plan')
        // Call the parent callback
        onSelectSupplier(supplier)
        // Close modal after short delay to show success
        setTimeout(() => {
          onClose()
          setAddingSupplier(null)
        }, 1000)
      } else {
        console.error('❌ Failed to add supplier:', result.error)
        setAddingSupplier(null)
      }
    } catch (error) {
      console.error('💥 Error adding supplier:', error)
      setAddingSupplier(null)
    }
  }


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
                <span>Available only</span>
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

          {/* Availability */}
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
              <Calendar className="w-4 h-4 mr-2" />
              Only show available on selected date
            </label>
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

      {/* Desktop Filters - Unchanged */}
      <div className="hidden md:flex flex-shrink-0 flex-wrap items-center gap-4 p-4 md:p-6 border-b border-gray-100 bg-gray-50">
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
            Available on date
          </label>
        </div>
      </div>
    </>
  );
};



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
                {theme} Theme • {date}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

         {/* NEW: Use this instead */}
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
            {/* Supplier List */}
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
                    <Card
                      key={supplier.id}
                      className="border border-gray-200 shadow-sm overflow-hidden rounded-lg flex flex-col"
                    >
                      <div className="relative w-full h-40 md:h-48 bg-gray-200">
                        <Image
                          src={supplier.image || "https://placehold.co/600x200?text=Event+Banner"}
                          alt={`${supplier.name} banner`}
                          fill
                          className="object-cover"
                        />
                        {supplier.badges && supplier.badges[0] && (
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 shadow-md">
                            {supplier.badges[0]}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{supplier.name}</h3>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-xl font-bold text-gray-900">£{supplier.priceFrom}</div>
                            <div className="text-xs text-gray-600">{supplier.priceUnit}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{supplier.rating}</span>
                            <span className="text-gray-500">({supplier.reviewCount} reviews)</span>
                          </div>
                          <span>•</span>
                          <span className="text-gray-600">{supplier.location}</span>
                        </div>

                        <div className="mb-3">
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            {supplier.availability}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-grow">{supplier.description}</p>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="lg" variant="outline" className="flex-1 py-2" asChild>
                              <Link href={`/supplier/${supplier.id}`}>View Details</Link>
                            </Button>
                            <Button
                              size="lg"
                              className="bg-primary-500 hover:bg-[hsl(var(--primary-700))] py-3 text-white flex-1 relative"
                              onClick={() => handleAddSupplier(supplier)}
                              disabled={addingSupplier === supplier.id}
                            >
                              {addingSupplier === supplier.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Add to Plan
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <div className="md:col-span-3 text-center py-10 text-gray-500">
                      <p className="text-lg mb-2">No {category} suppliers match your current filters.</p>
                      <p>Try adjusting your search criteria.</p>
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