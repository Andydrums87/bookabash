// components/VenueBrowserModal.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { X, MapPin, Users, CheckCircle, Building, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"
import { calculateTotalAttendees } from "@/utils/partyBuilderBackend"
import { checkSupplierAvailability } from "@/utils/availabilityChecker"

// Helper function to calculate venue price
// minimumBookingHours = TOTAL venue hours (includes setup/cleanup)
// Price = hourlyRate × minimumBookingHours
const calculateVenuePrice = (venue) => {
  // If venue already has calculated price, use it
  if (venue.price && venue.price > 0) {
    return venue.price;
  }

  // Get hourly rate from various locations
  const hourlyRate = venue.serviceDetails?.pricing?.hourlyRate ||
                     venue.data?.serviceDetails?.pricing?.hourlyRate ||
                     0;

  // Get total venue hours (minimumBookingHours = TOTAL hours including setup/cleanup)
  const totalVenueHours = venue.serviceDetails?.pricing?.minimumBookingHours ||
                          venue.serviceDetails?.availability?.minimumBookingHours ||
                          venue.data?.serviceDetails?.pricing?.minimumBookingHours ||
                          venue.data?.serviceDetails?.availability?.minimumBookingHours ||
                          4;

  // Calculate total price: hourlyRate × total hours
  const totalPrice = hourlyRate * totalVenueHours;

  // If we have a valid calculated price, return it
  if (totalPrice > 0) {
    return totalPrice;
  }

  // Fall back to package price or priceFrom only if we couldn't calculate
  return venue.packages?.[0]?.price || venue.priceFrom || venue.data?.priceFrom || 0;
};

// Helper to extract postcode district (e.g., "W4" from "W4 2DR")
const getPostcodeDistrict = (postcode) => {
  if (!postcode) return null;
  const clean = postcode.toUpperCase().replace(/\s+/g, '');
  // Match the outward code (district)
  const match = clean.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
  return match ? match[1] : null;
};

// Simple distance scoring based on postcode matching
const scoreVenueByLocation = (venue, userPostcode) => {
  if (!userPostcode) return 0;

  const userDistrict = getPostcodeDistrict(userPostcode);
  const venuePostcode = venue.venueAddress?.postcode ||
                        venue.serviceDetails?.venueDetails?.postcode ||
                        venue.location ||
                        venue.postcode;
  const venueDistrict = getPostcodeDistrict(venuePostcode);

  if (!venueDistrict || !userDistrict) return 0;

  // Exact district match
  if (venueDistrict === userDistrict) return 100;

  // Same area (first letter/number matches, e.g., W4 and W3)
  const userArea = userDistrict.match(/^([A-Z]{1,2})/)?.[1];
  const venueArea = venueDistrict.match(/^([A-Z]{1,2})/)?.[1];
  if (userArea && venueArea && userArea === venueArea) return 50;

  return 0;
};

export default function VenueBrowserModal({
  venues: initialVenues = [],
  selectedVenue,
  isOpen,
  onClose,
  onSelectVenue,
  partyDetails
}) {
  const [selectedForPreview, setSelectedForPreview] = useState(null)
  const [allVenues, setAllVenues] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Fetch all venues when modal opens
  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchAllVenues();
    }
  }, [isOpen, hasFetched]);

  const fetchAllVenues = async () => {
    setIsLoading(true);
    try {
      // Use client-side Supabase directly
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
      const supabase = createClientComponentClient();

      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('id, business_name, data')
        .eq('is_active', true)
        .not('data', 'is', null);

      if (error) throw error;

      // Transform and filter to only venues
      const venueSuppliers = (suppliers || [])
        .map(s => {
          const supplierData = typeof s.data === 'string' ? JSON.parse(s.data) : s.data;
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
            // Include availability data
            unavailableDates: supplierData?.unavailableDates,
            busyDates: supplierData?.busyDates,
            workingHours: supplierData?.workingHours,
            advanceBookingDays: supplierData?.advanceBookingDays,
            leadTimeSettings: supplierData?.leadTimeSettings,
            ...supplierData
          };
        })
        .filter(s =>
          s.category === 'Venues' || s.category?.toLowerCase() === 'venue'
        );

      // Filter by availability if party date is set
      const partyDate = partyDetails?.date;
      const partyTime = partyDetails?.time;
      const partyDuration = partyDetails?.duration || 2;

      const availableVenues = partyDate
        ? venueSuppliers.filter(venue => {
            const availabilityCheck = checkSupplierAvailability(venue, partyDate, partyTime, partyDuration);
            return availabilityCheck.available;
          })
        : venueSuppliers;

      // Score and sort by location (nearest first)
      const userPostcode = partyDetails?.postcode || partyDetails?.location;
      const scoredVenues = availableVenues.map(venue => ({
        ...venue,
        locationScore: scoreVenueByLocation(venue, userPostcode)
      }));

      // Sort by location score (highest first), then by rating
      scoredVenues.sort((a, b) => {
        if (b.locationScore !== a.locationScore) {
          return b.locationScore - a.locationScore;
        }
        return (b.rating || 0) - (a.rating || 0);
      });

      setAllVenues(scoredVenues);
      setHasFetched(true);
    } catch (error) {
      console.error('Error fetching venues:', error);
      // Fall back to initial venues
      setAllVenues(initialVenues);
    } finally {
      setIsLoading(false);
    }
  };

  // Use fetched venues or fall back to initial
  const venues = allVenues.length > 0 ? allVenues : initialVenues;

  // Calculate total attendees (children + adults)
  const attendees = useMemo(() => {
    return calculateTotalAttendees(partyDetails?.guestCount || 10);
  }, [partyDetails?.guestCount]);

  // Check if venue has enough capacity
  const checkVenueCapacity = (venue) => {
    const capacity = venue.serviceDetails?.venueDetails?.capacity ||
                    venue.data?.serviceDetails?.venueDetails?.capacity ||
                    venue.capacity ||
                    null;

    if (!capacity) return { hasCapacity: true, capacity: null }; // Unknown capacity, allow

    const numCapacity = parseInt(capacity);
    const hasCapacity = numCapacity >= attendees.forVenueCapacity;

    return {
      hasCapacity,
      capacity: numCapacity,
      needed: attendees.forVenueCapacity,
      shortBy: hasCapacity ? 0 : attendees.forVenueCapacity - numCapacity
    };
  };

  // Lock scroll when modal is open (iOS Safari compatible)
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

  if (!isOpen) return null

  const handleSelectVenue = (venue) => {
    onSelectVenue(venue)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary-500 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Choose Your Venue</h2>
                <p className="text-sm text-white/90 mt-0.5">
                  {venues.length} venues available in your area
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Venues Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ minHeight: 0 }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading venues near you...</p>
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue) => {
                const isSelected = selectedVenue?.id === venue.id
                const venuePackage = venue.packages?.[0] || {}
                const capacityCheck = checkVenueCapacity(venue)

                // Get venue name with fallbacks
                const venueName = venue.name || venue.businessName || venue.data?.name || 'Unnamed Venue'

                // Calculate venue price using the new model (party hours + setup + cleanup)
                const venuePrice = calculateVenuePrice(venue)

                return (
                  <div
                    key={venue.id}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      !capacityCheck.hasCapacity
                        ? 'border-red-300 opacity-75'
                        : isSelected
                          ? 'border-[hsl(var(--primary-500))] shadow-lg'
                          : 'border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-md'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={venue.coverPhoto || venue.image || venue.imageUrl || venue.data?.coverPhoto || '/placeholder.png'}
                        alt={venueName}
                        fill
                        className="object-cover z-0"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-[1] pointer-events-none" />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-[2]">
                          <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}

                      {/* Under Capacity Warning Badge */}
                      {!capacityCheck.hasCapacity && !isSelected && (
                        <div className="absolute top-2 right-2 z-[2]">
                          <Badge className="bg-red-500 text-white shadow-lg">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Too Small
                          </Badge>
                        </div>
                      )}

                      {/* Venue Name Overlay */}
                      <div
                        className="absolute bottom-2 left-2 right-2 z-[2]"
                        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
                      >
                        <h3 className="text-base font-bold text-white drop-shadow-lg line-clamp-1">
                          {venueName}
                        </h3>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white">
                      {/* Capacity Warning */}
                      {!capacityCheck.hasCapacity && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-red-700">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span>
                              Only fits {capacityCheck.capacity} people (need {capacityCheck.needed})
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-[hsl(var(--primary-600))]">
                          £{venuePrice}
                        </span>
                        {venuePackage.duration && (
                          <span className="text-xs text-gray-500 ml-1">
                            / {venuePackage.duration}
                          </span>
                        )}
                      </div>

                      {/* Postcode */}
                      <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600">
                        {(venue.venueAddress?.postcode || venue.location || venue.data?.location) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{venue.venueAddress?.postcode || venue.location || venue.data?.location}</span>
                          </div>
                        )}
                        {capacityCheck.capacity && (
                          <div className={`flex items-center gap-1 ${!capacityCheck.hasCapacity ? 'text-red-600' : ''}`}>
                            <Users className="w-3 h-3" />
                            <span>{capacityCheck.capacity} capacity</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedForPreview(venue)}
                          className="flex-1 border-gray-200 hover:bg-gray-50"
                        >
                          <span className="text-xs">View Details</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectVenue(venue)}
                          disabled={isSelected || !capacityCheck.hasCapacity}
                          className={`flex-1 ${
                            !capacityCheck.hasCapacity
                              ? 'bg-gray-300 cursor-not-allowed'
                              : isSelected
                                ? 'bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))]'
                                : 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))]'
                          }`}
                        >
                          <span className="text-xs">
                            {isSelected ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                Selected
                              </>
                            ) : !capacityCheck.hasCapacity ? (
                              'Too Small'
                            ) : (
                              'Select'
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {venues.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No venues available
                </h3>
                <p className="text-sm text-gray-600">
                  We couldn't find any venues in your area. Please try adjusting your search criteria.
                </p>
              </div>
            )}
            </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <Button
              onClick={onClose}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedForPreview && (
        <SupplierQuickViewModal
          supplier={selectedForPreview}
          isOpen={!!selectedForPreview}
          onClose={() => setSelectedForPreview(null)}
          type="venue"
        />
      )}
    </>
  )
}
