// components/VenueBrowserModal.jsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { X, MapPin, Users, CheckCircle, Star, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"

export default function VenueBrowserModal({
  venues = [],
  selectedVenue,
  isOpen,
  onClose,
  onSelectVenue,
  partyDetails
}) {
  const [selectedForPreview, setSelectedForPreview] = useState(null)

  if (!isOpen) return null

  const handleSelectVenue = (venue) => {
    onSelectVenue(venue)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Choose Your Venue</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {venues.length} venues available in your area
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Venues Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ minHeight: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue) => {
                const isSelected = selectedVenue?.id === venue.id
                const venuePackage = venue.packages?.[0] || {}

                // Get venue name with fallbacks
                const venueName = venue.name || venue.businessName || venue.data?.name || 'Unnamed Venue'

                // Get price with multiple fallbacks
                const venuePrice = venue.price ||
                                  venuePackage.price ||
                                  venue.priceFrom ||
                                  venue.data?.priceFrom ||
                                  0

                return (
                  <div
                    key={venue.id}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'border-[hsl(var(--primary-500))] shadow-lg ring-2 ring-[hsl(var(--primary-200))]'
                        : 'border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-md'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={venue.coverPhoto || venue.image || venue.imageUrl || venue.data?.coverPhoto || '/placeholder.png'}
                        alt={venueName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500 text-white shadow-lg">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}

                      {/* Venue Name Overlay */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-base font-bold text-white drop-shadow-lg line-clamp-1">
                          {venueName}
                        </h3>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-white">
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

                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600">
                        {(venue.location || venue.data?.location) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{venue.location || venue.data?.location}</span>
                          </div>
                        )}
                        {venue.serviceDetails?.venueDetails?.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{venue.serviceDetails.venueDetails.capacity} capacity</span>
                          </div>
                        )}
                        {venue.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{venue.rating}</span>
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
                          disabled={isSelected}
                          className={`flex-1 ${
                            isSelected
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))]'
                          }`}
                        >
                          <span className="text-xs">
                            {isSelected ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                Selected
                              </>
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
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
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
