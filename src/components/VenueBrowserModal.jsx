// components/VenueBrowserModal.jsx
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, Building, ArrowLeft, SlidersHorizontal, Zap, ChevronDown, Check, Map, List } from "lucide-react"
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import { calculateTotalAttendees } from "@/utils/partyBuilderBackend"
import { checkSupplierAvailability } from "@/utils/availabilityChecker"
import { LocationService } from "@/utils/locationService"

// Import map components
import VenueMapView from "@/components/venue-map/VenueMapView"
import VenueMapListItem from "@/components/venue-map/VenueMapListItem"
import VenueMobileBottomSheet from "@/components/venue-map/VenueMobileBottomSheet"

// Check if venue has instant book enabled (manual flag or Google Calendar sync)
const hasInstantBook = (venue) => {
  // Check manual instant book flag first
  if (venue.instantBook === true || venue.data?.instantBook === true) {
    return true
  }
  // Fall back to calendar integration check
  return venue.googleCalendarSync?.enabled === true ||
         venue.calendarIntegration?.enabled === true ||
         venue.data?.googleCalendarSync?.enabled === true ||
         venue.data?.calendarIntegration?.enabled === true
}

// Check if venue accepts bouncy castles (not in restricted items)
const acceptsBouncyCastle = (venue) => {
  const restrictedItems = venue.serviceDetails?.restrictedItems ||
                          venue.data?.serviceDetails?.restrictedItems || []
  // Return true if bouncy castles are NOT restricted
  const isRestricted = restrictedItems.some(item =>
    item.toLowerCase().includes('bouncy') || item.toLowerCase().includes('inflatable')
  )
  return !isRestricted
}

// Check if venue has kitchen facilities
const hasKitchenFacilities = (venue) => {
  const facilities = venue.serviceDetails?.facilities ||
                     venue.data?.serviceDetails?.facilities || []
  return facilities.some(f => f.toLowerCase().includes('kitchen'))
}

// Check if venue offers catering (has cateringPackages)
const offersCatering = (venue) => {
  const cateringPackages = venue.cateringPackages ||
                           venue.serviceDetails?.cateringPackages ||
                           venue.data?.cateringPackages ||
                           venue.data?.serviceDetails?.cateringPackages || []
  return Array.isArray(cateringPackages) && cateringPackages.length > 0
}

// Check if venue has customization options that require the modal
const hasCustomizationOptions = (venue) => {
  // Check for multiple packages
  const packages = venue.packages ||
                   venue.serviceDetails?.packages ||
                   venue.data?.packages ||
                   venue.data?.serviceDetails?.packages || []
  const hasMultiplePackages = Array.isArray(packages) && packages.length > 1

  // Check for catering packages
  const cateringPackages = venue.cateringPackages ||
                           venue.serviceDetails?.cateringPackages ||
                           venue.data?.cateringPackages ||
                           venue.data?.serviceDetails?.cateringPackages || []
  const hasCateringPackages = Array.isArray(cateringPackages) && cateringPackages.length > 0

  // Check for add-ons
  const addons = venue.addons ||
                 venue.serviceDetails?.addons ||
                 venue.data?.addons ||
                 venue.data?.serviceDetails?.addons || []
  const hasAddons = Array.isArray(addons) && addons.length > 0

  return hasMultiplePackages || hasCateringPackages || hasAddons
}

// Get venue type
const getVenueType = (venue) => {
  return venue.serviceDetails?.venueType ||
         venue.data?.serviceDetails?.venueType ||
         'Other'
}

// Calculate venue price helper
const calculateVenuePrice = (venue) => {
  if (venue.price && venue.price > 0) return venue.price

  const hourlyRate = venue.serviceDetails?.pricing?.hourlyRate ||
                     venue.data?.serviceDetails?.pricing?.hourlyRate || 0
  const totalHours = venue.serviceDetails?.pricing?.minimumBookingHours ||
                     venue.serviceDetails?.availability?.minimumBookingHours || 4
  const totalPrice = hourlyRate * totalHours

  if (totalPrice > 0) return totalPrice
  return venue.packages?.[0]?.price || venue.priceFrom || venue.data?.priceFrom || 0
}

// Sort options
const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance', fullLabel: 'Distance (nearest)' },
  { value: 'price_low', label: 'Price ↑', fullLabel: 'Price (low to high)' },
  { value: 'price_high', label: 'Price ↓', fullLabel: 'Price (high to low)' },
  { value: 'rating', label: 'Rating', fullLabel: 'Rating' },
]

// Venue type options
const VENUE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'Church Hall', label: 'Church Hall' },
  { value: 'Community Hall', label: 'Community Hall' },
  { value: 'Sports Centre', label: 'Sports Centre' },
  { value: 'Pub', label: 'Pub' },
  { value: 'Soft Play', label: 'Soft Play' },
  { value: 'Village Hall', label: 'Village Hall' },
  { value: 'Scout Hut', label: 'Scout Hut' },
  { value: 'Hotel', label: 'Hotel' },
]

// Score venue by location using real distance calculation
const scoreVenueByLocation = async (venue, userPostcode, targetCoords) => {
  if (!userPostcode) return { score: 0, distanceKm: null }

  const venuePostcode = venue.location ||
                        venue.venueAddress?.postcode ||
                        venue.serviceDetails?.venueAddress?.postcode ||
                        venue.contactInfo?.postcode ||
                        venue.postcode

  if (!venuePostcode) return { score: 0, distanceKm: null }

  if (targetCoords) {
    const venueCoords = await LocationService.getPostcodeCoordinates(venuePostcode)
    if (venueCoords) {
      const distanceKm = LocationService.calculateDistance(
        targetCoords.lat, targetCoords.lng,
        venueCoords.lat, venueCoords.lng
      )
      const score = Math.max(0, Math.round(100 - (distanceKm * 3.33)))
      return { score, distanceKm }
    }
  }

  const score = LocationService.scoreByPostcode(venuePostcode, userPostcode)
  return { score, distanceKm: null }
}

// Custom hook for responsive detection
const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  return isMobile
}

// Skeleton component for venue cards
const VenueCardSkeleton = () => (
  <div className="animate-pulse">
    {/* Image skeleton */}
    <div className="aspect-[20/19] rounded-xl bg-gray-200 mb-3" />
    {/* Content skeleton */}
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
    </div>
  </div>
)

// Skeleton component for map
const MapSkeleton = () => (
  <div className="h-full w-full bg-gray-100 animate-pulse relative overflow-hidden">
    {/* Fake map grid lines */}
    <div className="absolute inset-0 opacity-30">
      <div className="h-full w-full" style={{
        backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
    </div>
    {/* Fake price markers */}
    <div className="absolute top-1/4 left-1/4 px-3 py-1.5 bg-white rounded-full shadow-md">
      <div className="h-4 w-8 bg-gray-200 rounded" />
    </div>
    <div className="absolute top-1/3 right-1/3 px-3 py-1.5 bg-white rounded-full shadow-md">
      <div className="h-4 w-10 bg-gray-200 rounded" />
    </div>
    <div className="absolute bottom-1/3 left-1/2 px-3 py-1.5 bg-white rounded-full shadow-md">
      <div className="h-4 w-8 bg-gray-200 rounded" />
    </div>
    <div className="absolute top-1/2 right-1/4 px-3 py-1.5 bg-white rounded-full shadow-md">
      <div className="h-4 w-12 bg-gray-200 rounded" />
    </div>
    {/* Loading indicator in center */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600 font-medium">Loading map...</span>
      </div>
    </div>
  </div>
)

export default function VenueBrowserModal({
  venues: initialVenues = [],
  selectedVenue,
  isOpen,
  onClose,
  onSelectVenue,
  partyDetails,
  isSelectingVenue = false
}) {
  const isMobile = useIsMobile()

  // Core state
  const [selectedForPreview, setSelectedForPreview] = useState(null)
  const [selectedForCustomization, setSelectedForCustomization] = useState(null)
  const [allVenues, setAllVenues] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Map state
  const [selectedVenueId, setSelectedVenueId] = useState(null)
  const [hoveredVenueId, setHoveredVenueId] = useState(null)
  const [venueCoordinates, setVenueCoordinates] = useState({})
  const [userCoordinates, setUserCoordinates] = useState(null)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // View mode state (map = split view with map, list = full-width list)
  const [viewMode, setViewMode] = useState('map')

  // Filter state
  const [instantBookOnly, setInstantBookOnly] = useState(false)
  const [sortBy, setSortBy] = useState('distance')
  const [venueTypeFilter, setVenueTypeFilter] = useState('all')
  const [bouncyCastleOnly, setBouncyCastleOnly] = useState(false)
  const [cateringOnly, setCateringOnly] = useState(false)
  const [offersCateringOnly, setOffersCateringOnly] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch all venues when modal opens
  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchAllVenues()
    }
  }, [isOpen, hasFetched])

  // Reset selection state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVenueId(null)
      setHoveredVenueId(null)
      setIsBottomSheetOpen(false)
    }
  }, [isOpen])

  const fetchAllVenues = async () => {
    setIsLoading(true)
    try {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()

      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('id, business_name, data')
        .eq('is_active', true)
        .not('data', 'is', null)

      if (error) throw error

      // Transform and filter to only venues
      const venueSuppliers = (suppliers || [])
        .map(s => {
          const supplierData = typeof s.data === 'string' ? JSON.parse(s.data) : s.data
          return {
            id: s.id,
            name: supplierData?.name || s.business_name,
            businessName: s.business_name,
            category: supplierData?.category,
            location: supplierData?.location,
            coverPhoto: supplierData?.coverPhoto,
            image: supplierData?.image,
            rating: supplierData?.rating,
            serviceDetails: supplierData?.serviceDetails,
            venueAddress: supplierData?.venueAddress,
            packages: supplierData?.packages,
            priceFrom: supplierData?.priceFrom,
            gallery: supplierData?.gallery,
            photos: supplierData?.photos,
            unavailableDates: supplierData?.unavailableDates,
            busyDates: supplierData?.busyDates,
            workingHours: supplierData?.workingHours,
            advanceBookingDays: supplierData?.advanceBookingDays,
            leadTimeSettings: supplierData?.leadTimeSettings,
            ...supplierData
          }
        })
        .filter(s =>
          s.category === 'Venues' || s.category?.toLowerCase() === 'venue'
        )

      // Filter by availability if party date is set
      const partyDate = partyDetails?.date
      // Handle both property names: 'time' (database) and 'startTime' (localStorage)
      const partyTime = partyDetails?.time || partyDetails?.startTime
      const partyDuration = partyDetails?.duration || 2

      const availableVenues = partyDate
        ? venueSuppliers.filter(venue => {
            const availabilityCheck = checkSupplierAvailability(venue, partyDate, partyTime, partyDuration)
            return availabilityCheck.available
          })
        : venueSuppliers

      // Score and sort by location
      const userPostcode = partyDetails?.postcode || partyDetails?.location
      const targetCoords = userPostcode
        ? await LocationService.getPostcodeCoordinates(userPostcode)
        : null

      // Store user coordinates for map centering
      if (targetCoords) {
        setUserCoordinates({ lat: targetCoords.lat, lng: targetCoords.lng })
      }

      console.log(`📍 VenueBrowser: Scoring ${availableVenues.length} venues by distance from "${userPostcode}"`)

      // Score all venues with real distance and fetch coordinates
      const coordinatesMap = {}
      const scoredVenues = await Promise.all(
        availableVenues.map(async (venue) => {
          const { score, distanceKm } = await scoreVenueByLocation(venue, userPostcode, targetCoords)

          // Get coordinates for the map
          const venuePostcode = venue.venueAddress?.postcode ||
                               venue.location ||
                               venue.serviceDetails?.venueAddress?.postcode

          if (venuePostcode) {
            const coords = await LocationService.getPostcodeCoordinates(venuePostcode)
            if (coords) {
              coordinatesMap[venue.id] = { lat: coords.lat, lng: coords.lng }
            }
          }

          return {
            ...venue,
            locationScore: score,
            distanceKm
          }
        })
      )

      // Sort by location score (highest first = closest), then by rating
      scoredVenues.sort((a, b) => {
        if (b.locationScore !== a.locationScore) {
          return b.locationScore - a.locationScore
        }
        return (b.rating || 0) - (a.rating || 0)
      })

      setVenueCoordinates(coordinatesMap)
      setAllVenues(scoredVenues)
      setHasFetched(true)
    } catch (error) {
      console.error('Error fetching venues:', error)
      setAllVenues(initialVenues)
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized venues list with all filters and sorting
  const venues = useMemo(() => {
    const sourceVenues = allVenues.length > 0 ? allVenues : initialVenues

    // Apply all filters
    let filteredVenues = sourceVenues

    // Instant book filter
    if (instantBookOnly) {
      filteredVenues = filteredVenues.filter(venue => hasInstantBook(venue))
    }

    // Venue type filter
    if (venueTypeFilter !== 'all') {
      filteredVenues = filteredVenues.filter(venue => {
        const type = getVenueType(venue)
        return type.toLowerCase().includes(venueTypeFilter.toLowerCase())
      })
    }

    // Bouncy castle filter
    if (bouncyCastleOnly) {
      filteredVenues = filteredVenues.filter(venue => acceptsBouncyCastle(venue))
    }

    // Kitchen facilities filter
    if (cateringOnly) {
      filteredVenues = filteredVenues.filter(venue => hasKitchenFacilities(venue))
    }

    // Offers catering filter (venues with cateringPackages)
    if (offersCateringOnly) {
      filteredVenues = filteredVenues.filter(venue => offersCatering(venue))
    }

    // Apply sorting
    return [...filteredVenues].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return calculateVenuePrice(a) - calculateVenuePrice(b)
        case 'price_high':
          return calculateVenuePrice(b) - calculateVenuePrice(a)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'distance':
        default:
          // Sort by distance (closest first)
          const aHasDistance = a.distanceKm != null || a.locationScore != null
          const bHasDistance = b.distanceKm != null || b.locationScore != null

          if (aHasDistance && !bHasDistance) return -1
          if (!aHasDistance && bHasDistance) return 1

          if (a.locationScore != null && b.locationScore != null) {
            if (b.locationScore !== a.locationScore) {
              return b.locationScore - a.locationScore
            }
          }

          if (a.distanceKm != null && b.distanceKm != null) {
            if (a.distanceKm !== b.distanceKm) {
              return a.distanceKm - b.distanceKm
            }
          }

          return (b.rating || 0) - (a.rating || 0)
      }
    })
  }, [allVenues, initialVenues, instantBookOnly, venueTypeFilter, bouncyCastleOnly, cateringOnly, offersCateringOnly, sortBy])

  // Get selected venue object
  const selectedMapVenue = useMemo(() => {
    return venues.find(v => v.id === selectedVenueId)
  }, [venues, selectedVenueId])

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Handlers
  const handleSelectVenue = useCallback((venue) => {
    // If venue has customization options, open the customization modal instead
    if (hasCustomizationOptions(venue)) {
      setSelectedForCustomization(venue)
      return
    }
    onSelectVenue(venue)
    onClose()
  }, [onSelectVenue, onClose])

  const handleMarkerClick = useCallback((venueId) => {
    setSelectedVenueId(venueId)
    if (isMobile) {
      setIsBottomSheetOpen(true)
    }
  }, [isMobile])

  const handleListItemClick = useCallback((venue) => {
    // On click, open the quick view modal
    setSelectedForPreview(venue)
  }, [])

  const handleViewDetails = useCallback((venue) => {
    setSelectedForPreview(venue)
    setIsBottomSheetOpen(false)
  }, [])

  const handleConfirmSelect = useCallback((venue) => {
    setIsBottomSheetOpen(false)
    handleSelectVenue(venue)
  }, [handleSelectVenue])

  const handleCloseBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(false)
    setSelectedVenueId(null)
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white">
        {isMobile ? (
          // MOBILE LAYOUT: Full-screen map with bottom sheet
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode('map')}
                  className={`
                    flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
                    ${viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                    }
                  `}
                >
                  <Map className="w-3.5 h-3.5" />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
                    ${viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                    }
                  `}
                >
                  <List className="w-3.5 h-3.5" />
                  List
                </button>
              </div>

              <button
                onClick={() => setIsFilterOpen('mobile')}
                className={`
                  p-2 -mr-2 rounded-full transition-colors relative
                  ${(sortBy !== 'distance' || venueTypeFilter !== 'all' || bouncyCastleOnly || cateringOnly || offersCateringOnly || instantBookOnly)
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {(sortBy !== 'distance' || venueTypeFilter !== 'all' || bouncyCastleOnly || cateringOnly || offersCateringOnly || instantBookOnly) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                    {[sortBy !== 'distance', venueTypeFilter !== 'all', bouncyCastleOnly, cateringOnly, offersCateringOnly, instantBookOnly].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filter Panel */}
            {isFilterOpen === 'mobile' && (
              <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsFilterOpen(false)}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-6">
                    {/* Sort By */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Sort by</h4>
                      <div className="flex flex-wrap gap-2">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium transition-all
                              ${sortBy === option.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700'
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Venue Type */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Venue type</h4>
                      <div className="flex flex-wrap gap-2">
                        {VENUE_TYPES.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setVenueTypeFilter(option.value)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium transition-all
                              ${venueTypeFilter === option.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700'
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
                      <div className="space-y-3">
                        {/* Instant Book */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="flex items-center gap-2 text-sm text-gray-700">
                            <Zap className={`w-4 h-4 ${instantBookOnly ? 'fill-teal-500 text-teal-500' : 'text-gray-400'}`} />
                            Instant Book
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={instantBookOnly}
                            onClick={() => setInstantBookOnly(!instantBookOnly)}
                            className={`
                              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                              transition-colors duration-200 ease-in-out
                              ${instantBookOnly ? 'bg-teal-500' : 'bg-gray-200'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                                transition duration-200 ease-in-out
                                ${instantBookOnly ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </label>

                        {/* Bouncy Castle */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-gray-700">Accepts Bouncy Castle</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={bouncyCastleOnly}
                            onClick={() => setBouncyCastleOnly(!bouncyCastleOnly)}
                            className={`
                              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                              transition-colors duration-200 ease-in-out
                              ${bouncyCastleOnly ? 'bg-teal-500' : 'bg-gray-200'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                                transition duration-200 ease-in-out
                                ${bouncyCastleOnly ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </label>

                        {/* Catering */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-gray-700">Kitchen/Catering Available</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={cateringOnly}
                            onClick={() => setCateringOnly(!cateringOnly)}
                            className={`
                              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                              transition-colors duration-200 ease-in-out
                              ${cateringOnly ? 'bg-teal-500' : 'bg-gray-200'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                                transition duration-200 ease-in-out
                                ${cateringOnly ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </label>

                        {/* Offers Catering */}
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-gray-700">Offers Catering</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={offersCateringOnly}
                            onClick={() => setOffersCateringOnly(!offersCateringOnly)}
                            className={`
                              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                              transition-colors duration-200 ease-in-out
                              ${offersCateringOnly ? 'bg-teal-500' : 'bg-gray-200'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                                transition duration-200 ease-in-out
                                ${offersCateringOnly ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => {
                        setSortBy('distance')
                        setVenueTypeFilter('all')
                        setBouncyCastleOnly(false)
                        setCateringOnly(false)
                        setOffersCateringOnly(false)
                        setInstantBookOnly(false)
                      }}
                      className="flex-1 py-3 text-sm font-semibold text-gray-700 underline"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold"
                    >
                      Show {venues.length} venues
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Map or List Area */}
            <div className="flex-1 relative overflow-hidden">
              {viewMode === 'map' ? (
                // Map View
                <>
                  {isLoading ? (
                    <MapSkeleton />
                  ) : (
                    <VenueMapView
                      venues={venues}
                      coordinates={venueCoordinates}
                      userCoordinates={userCoordinates}
                      selectedVenueId={selectedVenueId}
                      hoveredVenueId={hoveredVenueId}
                      onSelectVenue={handleMarkerClick}
                      onHoverVenue={setHoveredVenueId}
                      onViewDetails={handleViewDetails}
                      onConfirmSelect={handleConfirmSelect}
                      showPopupCard={false}
                      partyDetails={partyDetails}
                    />
                  )}

                  {/* Venue count badge */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-medium text-gray-900">
                      {venues.length} venues
                    </span>
                  </div>
                </>
              ) : (
                // List View
                <div className="h-full overflow-y-auto px-4 py-4">
                  {isLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <VenueCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : venues.length === 0 ? (
                    <div className="text-center py-20">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No venues available
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your filters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {venues.map((venue) => (
                        <VenueMapListItem
                          key={venue.id}
                          venue={venue}
                          isSelected={selectedVenueId === venue.id}
                          isHovered={false}
                          isCurrentlySelected={selectedVenue?.id === venue.id}
                          onClick={() => handleListItemClick(venue)}
                          onHover={() => {}}
                          onSelect={() => handleSelectVenue(venue)}
                          onViewDetails={() => handleViewDetails(venue)}
                          partyDetails={partyDetails}
                          isLoading={isSelectingVenue}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Bottom Sheet - only show in map view */}
            {viewMode === 'map' && (
              <VenueMobileBottomSheet
                venue={selectedMapVenue}
                isOpen={isBottomSheetOpen}
                onClose={handleCloseBottomSheet}
                onViewDetails={() => handleViewDetails(selectedMapVenue)}
                onSelect={() => handleConfirmSelect(selectedMapVenue)}
                partyDetails={partyDetails}
              />
            )}
          </div>
        ) : (
          // DESKTOP LAYOUT: Airbnb-style split view
          <div className="h-full flex flex-col">
            {/* Top navbar with back button and logo */}
            <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                {/* Back button */}
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 -ml-3 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Back to dashboard</span>
                </button>
                {/* View Toggle + Logo */}
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setViewMode('map')}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${viewMode === 'map'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <Map className="w-4 h-4" />
                      Map
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${viewMode === 'list'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      <List className="w-4 h-4" />
                      List
                    </button>
                  </div>
                  {/* Logo */}
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                    alt="BookABash"
                    width={130}
                    height={28}
                    className="h-auto w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Click outside to close dropdowns */}
            {isFilterOpen && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsFilterOpen(false)}
              />
            )}

            {/* Main content: Left panel (venues) + Right panel (map) OR full-width list */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Venue List */}
              <div className={`${viewMode === 'list' ? 'w-full' : 'w-[58%]'} overflow-y-auto px-6 pt-4 pb-6`}>
                {/* Heading */}
                <h1 className="text-xl font-semibold text-gray-900 mb-3">
                  {venues.length} venues available
                </h1>

                {/* Filters row */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  {/* Sort Dropdown */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setIsFilterOpen(isFilterOpen === 'sort' ? false : 'sort')}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap
                        ${sortBy !== 'distance'
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {isFilterOpen === 'sort' && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-30">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value)
                              setIsFilterOpen(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                          >
                            {option.fullLabel}
                            {sortBy === option.value && <Check className="w-4 h-4 text-teal-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Venue Type Dropdown */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setIsFilterOpen(isFilterOpen === 'type' ? false : 'type')}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap
                        ${venueTypeFilter !== 'all'
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {venueTypeFilter === 'all' ? 'Type' : venueTypeFilter}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {isFilterOpen === 'type' && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-30">
                        {VENUE_TYPES.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setVenueTypeFilter(option.value)
                              setIsFilterOpen(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                          >
                            {option.label}
                            {venueTypeFilter === option.value && <Check className="w-4 h-4 text-teal-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bouncy Castle Toggle */}
                  <button
                    onClick={() => setBouncyCastleOnly(!bouncyCastleOnly)}
                    className={`
                      px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                      ${bouncyCastleOnly
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
                    Bouncy Castle
                  </button>

                  {/* Kitchen Toggle */}
                  <button
                    onClick={() => setCateringOnly(!cateringOnly)}
                    className={`
                      px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                      ${cateringOnly
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
                    Kitchen
                  </button>

                  {/* Offers Catering Toggle */}
                  <button
                    onClick={() => setOffersCateringOnly(!offersCateringOnly)}
                    className={`
                      px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                      ${offersCateringOnly
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
                    Offers Catering
                  </button>

                  {/* Instant Book Toggle */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white whitespace-nowrap flex-shrink-0">
                    <Zap className={`w-4 h-4 flex-shrink-0 ${instantBookOnly ? 'fill-teal-500 text-teal-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">Instant</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={instantBookOnly}
                      onClick={() => setInstantBookOnly(!instantBookOnly)}
                      className={`
                        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                        transition-colors duration-200 ease-in-out
                        ${instantBookOnly ? 'bg-teal-500' : 'bg-gray-200'}
                      `}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0
                          transition duration-200 ease-in-out
                          ${instantBookOnly ? 'translate-x-4' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  </div>

                  {/* Clear filters */}
                  {(sortBy !== 'distance' || venueTypeFilter !== 'all' || bouncyCastleOnly || cateringOnly || offersCateringOnly || instantBookOnly) && (
                    <button
                      onClick={() => {
                        setSortBy('distance')
                        setVenueTypeFilter('all')
                        setBouncyCastleOnly(false)
                        setCateringOnly(false)
                        setOffersCateringOnly(false)
                        setInstantBookOnly(false)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Venue Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                    {[...Array(6)].map((_, i) => (
                      <VenueCardSkeleton key={i} />
                    ))}
                  </div>
                ) : venues.length === 0 ? (
                  <div className="text-center py-20">
                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No venues available
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                ) : (
                  <div className={`grid gap-x-6 gap-y-8 ${viewMode === 'list' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2'}`}>
                    {venues.map((venue) => (
                      <VenueMapListItem
                        key={venue.id}
                        venue={venue}
                        isSelected={selectedVenueId === venue.id}
                        isHovered={hoveredVenueId === venue.id}
                        isCurrentlySelected={selectedVenue?.id === venue.id}
                        onClick={() => handleListItemClick(venue)}
                        onHover={setHoveredVenueId}
                        onSelect={() => handleSelectVenue(venue)}
                        onViewDetails={() => handleViewDetails(venue)}
                        partyDetails={partyDetails}
                        isLoading={isSelectingVenue}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Panel: Map - only show in map view mode */}
              {viewMode === 'map' && (
              <div className="w-[42%] p-4 pl-0">
                <div className="h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                  {isLoading ? (
                    <MapSkeleton />
                  ) : (
                    <VenueMapView
                      venues={venues}
                      coordinates={venueCoordinates}
                      userCoordinates={userCoordinates}
                      selectedVenueId={selectedVenueId}
                      hoveredVenueId={hoveredVenueId}
                      onSelectVenue={handleMarkerClick}
                      onHoverVenue={setHoveredVenueId}
                      onViewDetails={handleViewDetails}
                      onConfirmSelect={handleConfirmSelect}
                      showPopupCard={true}
                      selectedVenue={selectedMapVenue}
                      partyDetails={partyDetails}
                    />
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedForPreview && (
        <SupplierQuickViewModal
          supplier={selectedForPreview}
          isOpen={!!selectedForPreview}
          onClose={() => setSelectedForPreview(null)}
          type="venue"
          onSelect={() => {
            handleSelectVenue(selectedForPreview)
            setSelectedForPreview(null)
          }}
          isSelectingSupplier={isSelectingVenue}
        />
      )}

      {/* Customization Modal for venues with packages/addons/catering */}
      {selectedForCustomization && (
        <SupplierCustomizationModal
          isOpen={!!selectedForCustomization}
          onClose={() => setSelectedForCustomization(null)}
          supplier={selectedForCustomization}
          partyDetails={partyDetails}
          partyDate={partyDetails?.date}
          onAddToPlan={(customizationData) => {
            // Transform the customization data to match what onSelectVenue expects
            // customizationData = { supplier, package, addons, totalPrice }
            const venueWithPackageData = {
              ...customizationData.supplier,
              packageData: {
                ...customizationData.package,
                addons: customizationData.addons,
                selectedAddons: customizationData.addons,
                totalPrice: customizationData.totalPrice,
              }
            }
            onSelectVenue(venueWithPackageData)
            setSelectedForCustomization(null)
            onClose()
          }}
        />
      )}
    </>
  )
}
