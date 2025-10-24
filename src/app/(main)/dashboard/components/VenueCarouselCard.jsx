"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Check, CheckCircle, MapPin, Users, Star, X, Gift, ChevronDown, ChevronUp, Eye, MoreVertical, Trash2 } from "lucide-react"
import { calculateFinalPrice } from '@/utils/unifiedPricing'
import AddonSelectionModal from "@/components/supplier/addon-selection-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function VenueCarouselCard({
  venues = [],
  selectedVenue,
  onSelectVenue,
  partyDetails,
  isLoading = false,
  addons = [],
  handleRemoveAddon,
  handleDeleteSupplier,
  openSupplierModal,
  type
}) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [showAddons, setShowAddons] = useState(false)
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const cardRef = useRef(null)

  // Initialize with selected venue
  useEffect(() => {
    if (selectedVenue && venues.length > 0) {
      const selectedIndex = venues.findIndex(v => v.id === selectedVenue.id)
      if (selectedIndex !== -1) {
        setCurrentIndex(selectedIndex)
      }
    }
  }, [selectedVenue, venues])

  const currentVenue = venues[currentIndex]
  const isCurrentSelected = selectedVenue?.id === currentVenue?.id
  
  // Get addons for current venue
  const venueAddons = addons.filter(addon => 
    addon.supplierId === currentVenue?.id || 
    addon.supplierType === 'venue' ||
    addon.attachedToSupplier === 'venue'
  )
  const hasAddons = venueAddons && venueAddons.length > 0

  // ✅ Calculate unified pricing for the current venue
  const pricing = useMemo(() => {
    if (!currentVenue) {
      return { finalPrice: 0, breakdown: {}, details: {} }
    }

    // ✅ FIX: Create a clean venue object with the correct base price from packageData
    const cleanVenue = {
      ...currentVenue,
      // Use package price as the true base price
      price: currentVenue.packageData?.price || currentVenue.originalPrice || currentVenue.price,
      originalPrice: currentVenue.packageData?.price || currentVenue.originalPrice || currentVenue.price,
    }

    console.log('🏛️ VENUE PRICING DEBUG:', {
      venueName: currentVenue.name,
      rawPrice: currentVenue.price,
      packagePrice: currentVenue.packageData?.price,
      originalPrice: currentVenue.originalPrice,
      usingPrice: cleanVenue.price,
      addonsCount: venueAddons.length
    })

    // Use unified pricing system with clean venue
    const result = calculateFinalPrice(cleanVenue, partyDetails, venueAddons)
    
    console.log('🏛️ VENUE PRICING RESULT:', {
      finalPrice: result.finalPrice,
      breakdown: result.breakdown,
      details: result.details
    })

    return result
  }, [currentVenue, partyDetails, venueAddons])

  const displayPrice = pricing.finalPrice

  // Show weekend info if weekend premium was applied
  const showWeekendInfo = pricing.details?.isWeekend && pricing.breakdown?.weekend > 0

  // Show duration info if extra hours were charged
  const showDurationInfo = !!(
    currentVenue?.serviceDetails?.pricing?.hourlyRate &&
    partyDetails?.duration && 
    partyDetails.duration > 2 &&
    pricing.breakdown.extraHours > 0
  )

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentIndex < venues.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(venues.length - 1, prev + 1))
  }

  const handleSelectVenue = () => {
    if (currentVenue && !isCurrentSelected) {
      // Check if venue has addons available
      const venueHasAddons = currentVenue.serviceDetails?.addOnServices?.length > 0
      
      if (venueHasAddons) {
        // Show addon modal
        setShowAddonModal(true)
      } else {
        // No addons, select venue directly
        onSelectVenue(currentVenue)
      }
    }
  }

  const handleAddonModalConfirm = (addonData) => {
    console.log('🏛️ Venue addon modal confirmed:', addonData)
    
    // Close modal
    setShowAddonModal(false)
    
    // Create venue with selected addons
    const venueWithAddons = {
      ...currentVenue,
      selectedAddons: addonData.addons || [],
      packageData: {
        ...currentVenue.packageData,
        addons: addonData.addons || []
      }
    }
    
    console.log('🏛️ Selecting venue with addons:', venueWithAddons)
    
    // Call the select venue handler with addons
    onSelectVenue(venueWithAddons)
  }

  const handleAddonModalClose = () => {
    setShowAddonModal(false)
  }

  // Navigate to venue profile
  const handleViewProfile = (e) => {
    // Don't navigate if clicking on buttons or interactive elements
    if (e.target.closest('button') || e.target.closest('a')) {
      return
    }
    
    if (currentVenue?.id) {
      router.push(`/supplier/${currentVenue.id}?from=dashboard`)
    }
  }

  const handleViewDetails = () => {
    if (currentVenue?.id) {
      router.push(`/supplier/${currentVenue.id}?from=dashboard`)
    }
  }

  if (!venues || venues.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl">
        <div className="h-96 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No venues available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      ref={cardRef}
      className={`overflow-hidden rounded-2xl border-2 shadow-2xl relative cursor-pointer transition-all duration-300 ${
        isCurrentSelected
          ? 'ring-2 ring-offset-2 hover:scale-[1.02]'
          : ''
      }`}
      style={isCurrentSelected ? {
        borderColor: 'hsl(var(--primary-400))',
        '--tw-ring-color': 'hsl(var(--primary-300) / 0.5)',
        boxShadow: '0 25px 50px -12px hsl(var(--primary-200) / 0.3)'
      } : {
        borderColor: 'white'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleViewProfile}
      id="supplier-venue"
    >
      {/* Main Card Content */}
      <div className="relative h-64 w-full">
        {/* Image */}
        <div className="absolute inset-0">
          <Image
            src={currentVenue.image || currentVenue.imageUrl || '/placeholder.jpg'}
            alt={currentVenue.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />


        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg backdrop-blur-sm">
              🏛️ Venue
            </Badge>
            {isCurrentSelected && (
              <Badge className="text-white shadow-lg backdrop-blur-sm border border-white/20 animate-pulse flex items-center gap-1" style={{
                background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))'
              }}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Selected
              </Badge>
            )}
            {currentIndex === 0 && !isCurrentSelected && (
              <Badge className="bg-purple-500 text-white shadow-lg backdrop-blur-sm">
                Recommended
              </Badge>
            )}
          </div>

          {/* Three-dots menu */}
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg z-30"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-white shadow-xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">View Details</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSupplier(type)
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Venue info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
              {currentVenue?.name || 'Venue'}
            </h3>
           
            {/* Quick stats */}
            <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
              {currentVenue.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="drop-shadow">{currentVenue.location}</span>
                </div>
              )}
              {currentVenue.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="drop-shadow">Up to {currentVenue.capacity}</span>
                </div>
              )}
              {currentVenue.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="drop-shadow">{currentVenue.rating}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black drop-shadow-lg">
                    £{displayPrice}
                  </span>
                </div>
                
                {/* Show compact price breakdown */}
                {(showDurationInfo || showWeekendInfo || hasAddons) && (
                  <div className="text-xs text-white/90 mt-1 drop-shadow">
                    £{pricing.breakdown.base}
                    {showWeekendInfo && ` + Weekend £${pricing.breakdown.weekend}`}
                    {showDurationInfo && ` + ${pricing.details.extraHours}h £${pricing.breakdown.extraHours}`}
                    {hasAddons && ` + Addons £${pricing.breakdown.addons}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="pb-6 px-6 pt-2 bg-white space-y-6">
      
        {/* Addons section - only show for selected venue */}
        {isCurrentSelected && hasAddons && (
          <div className="mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddons(!showAddons)
              }}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[hsl(var(--primary-50))] to-white rounded-xl border border-[hsl(var(--primary-100))] hover:from-[hsl(var(--primary-100))] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                <span className="font-bold text-gray-500 text-xs">
                  Selected Add-ons ({venueAddons.length})
                </span>
              </div>
              {showAddons ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showAddons && (
              <div className="mt-3 space-y-3 animate-in slide-in-from-top duration-200">
                {venueAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 ml-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{addon.name}</p>
                      <p className="text-xs text-gray-600 truncate">{addon.description}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-sm font-bold text-[hsl(var(--primary-600))]">£{addon.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAddon(addon.id)
                        }}
                        className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation: Dots and Arrows in one line */}
        <div className="flex items-center justify-center gap-3">
          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            disabled={currentIndex === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              currentIndex === 0 
                ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                : 'bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))]'
            }`}
            aria-label="Previous venue"
          >
            <ChevronLeft className={`w-4 h-4 ${currentIndex === 0 ? 'text-gray-400' : 'text-white'}`} />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2">
            {venues.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`transition-all duration-200 rounded-full ${
                  index === currentIndex 
                    ? 'w-8 h-2 bg-[hsl(var(--primary-500))]' 
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to venue ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            disabled={currentIndex === venues.length - 1}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              currentIndex === venues.length - 1 
                ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                : 'bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))]'
            }`}
            aria-label="Next venue"
          >
            <ChevronRight className={`w-4 h-4 ${currentIndex === venues.length - 1 ? 'text-gray-400' : 'text-white'}`} />
          </button>
        </div>

        {/* Select button - full width */}
        <Button
          onClick={(e) => {
            e.stopPropagation()
            handleSelectVenue()
          }}
          className={`w-full shadow-lg transition-all ${
            isCurrentSelected
              ? 'bg-teal-500 hover:bg-teal-600 text-white cursor-default'
              : 'bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white'
          }`}
          disabled={isLoading || isCurrentSelected}
          size="lg"
        >
          {isCurrentSelected ? (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Selected</span>
            </div>
          ) : (
            isLoading ? 'Selecting...' : 'Select Venue'
          )}
        </Button>
      </div>

      {/* ✅ Addon Selection Modal */}
      {showAddonModal && currentVenue && (
        <AddonSelectionModal
          isOpen={showAddonModal}
          onClose={handleAddonModalClose}
          onConfirm={handleAddonModalConfirm}
          supplier={currentVenue}
          selectedPackage={currentVenue.packageData}
          isEntertainer={false}
        />
      )}
    </Card>
  )
}