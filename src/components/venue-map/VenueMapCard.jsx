"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { X, Star, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import useEmblaCarousel from "embla-carousel-react"
import { calculateTotalAttendees } from "@/utils/partyBuilderBackend"

// Helper function to calculate venue price
const calculateVenuePrice = (venue) => {
  if (venue.price && venue.price > 0) {
    return venue.price
  }

  const hourlyRate =
    venue.serviceDetails?.pricing?.hourlyRate ||
    venue.data?.serviceDetails?.pricing?.hourlyRate ||
    0

  const totalVenueHours =
    venue.serviceDetails?.pricing?.minimumBookingHours ||
    venue.serviceDetails?.availability?.minimumBookingHours ||
    venue.data?.serviceDetails?.pricing?.minimumBookingHours ||
    venue.data?.serviceDetails?.availability?.minimumBookingHours ||
    4

  const totalPrice = hourlyRate * totalVenueHours

  if (totalPrice > 0) {
    return totalPrice
  }

  return venue.packages?.[0]?.price || venue.priceFrom || venue.data?.priceFrom || 0
}

export default function VenueMapCard({
  venue,
  onClose,
  onViewDetails,
  onSelect,
  partyDetails,
  className = "",
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const [isHovering, setIsHovering] = useState(false)

  // Get venue images
  const getVenueImages = () => {
    const images = []

    // Primary image
    const coverPhoto = venue.coverPhoto || venue.image || venue.imageUrl || venue.data?.coverPhoto
    if (coverPhoto) images.push(coverPhoto)

    // Check multiple possible gallery locations
    const gallery = venue.gallery ||
                    venue.photos ||
                    venue.data?.gallery ||
                    venue.data?.photos ||
                    venue.serviceDetails?.gallery ||
                    venue.serviceDetails?.photos ||
                    venue.data?.serviceDetails?.gallery ||
                    venue.data?.serviceDetails?.photos ||
                    []

    gallery.forEach(img => {
      const imgUrl = typeof img === "string" ? img : (img.url || img.src)
      if (imgUrl && !images.includes(imgUrl)) {
        images.push(imgUrl)
      }
    })

    // Fallback
    if (images.length === 0) {
      images.push("/placeholder.png")
    }

    return images.slice(0, 5) // Max 5 images
  }

  const images = getVenueImages()

  // Update carousel state
  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentSlide(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onEmblaSelect()
    emblaApi.on("select", onEmblaSelect)
    emblaApi.on("reInit", onEmblaSelect)
    return () => {
      emblaApi.off("select", onEmblaSelect)
      emblaApi.off("reInit", onEmblaSelect)
    }
  }, [emblaApi, onEmblaSelect])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  // Venue details
  const venueName = venue.name || venue.businessName || venue.data?.name || "Unnamed Venue"
  const price = calculateVenuePrice(venue)
  const rating = venue.rating || venue.data?.rating || null
  const reviewCount = venue.reviewCount || venue.data?.reviewCount || 0
  const location = venue.venueAddress?.city || venue.location || venue.data?.location || ""

  // Capacity check
  const capacity = venue.serviceDetails?.venueDetails?.capacity ||
                   venue.data?.serviceDetails?.venueDetails?.capacity ||
                   venue.capacity || null

  const attendees = partyDetails?.guestCount
    ? calculateTotalAttendees(partyDetails.guestCount)
    : null

  // Venue type
  const venueType = venue.serviceDetails?.venueType || venue.data?.serviceDetails?.venueType || "Venue"

  // Get first highlight for "Perfect for" display
  const highlights = venue.highlights ||
                     venue.serviceDetails?.highlights ||
                     venue.data?.highlights ||
                     venue.data?.serviceDetails?.highlights || []
  const perfectFor = highlights.length > 0 ? highlights[0] : null

  return (
    <div
      className={`bg-white rounded-xl shadow-xl overflow-hidden w-[300px] animate-in fade-in zoom-in-95 duration-200 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Image Carousel */}
      <div
        className="relative h-[180px]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                <Image
                  src={img}
                  alt={`${venueName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Navigation arrows - Airbnb style */}
        {images.length > 1 && (
          <>
            {/* Left arrow - hide on first slide */}
            <button
              onClick={scrollPrev}
              className={`
                absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white hover:bg-white rounded-full
                shadow-lg flex items-center justify-center hover:scale-110
                transition-all duration-200 z-10
                ${isHovering && currentSlide > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            {/* Right arrow - hide on last slide */}
            <button
              onClick={scrollNext}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white hover:bg-white rounded-full
                shadow-lg flex items-center justify-center hover:scale-110
                transition-all duration-200 z-10
                ${isHovering && currentSlide < images.length - 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>
          </>
        )}

        {/* Dot indicators - Airbnb style */}
        {images.length > 1 && (
          <div className={`
            absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10
            transition-opacity duration-200
            ${isHovering ? 'opacity-100' : 'opacity-70'}
          `}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-200
                  ${index === currentSlide
                    ? "bg-white scale-100"
                    : "bg-white/60 scale-90"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Header row: Name and Rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">
            {venueName}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
              <span className="text-sm font-medium text-gray-900">
                {rating.toFixed(1)}
                {reviewCount > 0 && (
                  <span className="text-gray-500 font-normal"> ({reviewCount})</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Venue type */}
        <p className="text-sm text-gray-500 mb-1">{venueType}</p>

        {/* Location and capacity */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
          {capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {capacity} capacity
            </span>
          )}
        </div>

        {/* Perfect for highlight */}
        {perfectFor && (
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {perfectFor}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold text-gray-900">£{price}</span>
          <span className="text-sm text-gray-500 ml-1">total</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 text-xs h-9"
          >
            View Details
          </Button>
          <Button
            size="sm"
            onClick={onSelect}
            className="flex-1 text-xs h-9 bg-primary-500 hover:bg-primary-600 text-white"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  )
}
