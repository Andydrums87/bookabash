"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight, Zap, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useEmblaCarousel from "embla-carousel-react"
import { calculateTotalAttendees } from "@/utils/partyBuilderBackend"

// Helper function to calculate venue price
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

export default function VenueMapListItem({
  venue,
  isSelected = false,
  isHovered = false,
  isCurrentlySelected = false,
  onClick,
  onHover,
  onSelect,
  onViewDetails,
  partyDetails,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // Get venue images
  const getVenueImages = () => {
    const images = []
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

    if (images.length === 0) {
      images.push("/placeholder.png")
    }

    return images.slice(0, 5)
  }

  const images = getVenueImages()

  // Update carousel state and scroll buttons
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

  const scrollPrev = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollNext()
  }, [emblaApi])

  // Venue details
  const venueName = venue.name || venue.businessName || venue.data?.name || "Unnamed Venue"
  const price = calculateVenuePrice(venue)
  const rating = venue.rating || venue.data?.rating || null
  const reviewCount = venue.reviewCount || venue.data?.reviewCount || 0
  const location = venue.venueAddress?.city || venue.location || venue.data?.location || ""
  const venueType = venue.serviceDetails?.venueType || venue.data?.serviceDetails?.venueType || "Venue"
  const postcode = venue.venueAddress?.postcode || venue.location || venue.serviceDetails?.venueAddress?.postcode || ""
  const isInstantBook = hasInstantBook(venue)

  // Get first highlight for "Perfect for" display
  const highlights = venue.highlights ||
                     venue.serviceDetails?.highlights ||
                     venue.data?.highlights ||
                     venue.data?.serviceDetails?.highlights || []
  const perfectFor = highlights.length > 0 ? highlights[0] : null

  // Capacity check
  const capacity = venue.serviceDetails?.venueDetails?.capacity ||
                   venue.data?.serviceDetails?.venueDetails?.capacity ||
                   venue.capacity || null

  const attendees = partyDetails?.guestCount
    ? calculateTotalAttendees(partyDetails.guestCount)
    : null

  const hasCapacity = !capacity || !attendees || parseInt(capacity) >= attendees.forVenueCapacity

  return (
    <div
      className={`
        cursor-pointer transition-all duration-200 group
        ${!hasCapacity ? "opacity-60" : ""}
      `}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovering(true)
        onHover?.(venue.id)
      }}
      onMouseLeave={() => {
        setIsHovering(false)
        onHover?.(null)
      }}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[20/19] rounded-xl overflow-hidden mb-3">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                <Image
                  src={img}
                  alt={`${venueName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows - Airbnb style with fade transition */}
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

        {/* Selected badge */}
        {isCurrentlySelected && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-primary-500 text-white text-xs">
              Selected
            </Badge>
          </div>
        )}

        {/* Capacity warning */}
        {!hasCapacity && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-red-500 text-white text-xs">
              Too Small
            </Badge>
          </div>
        )}

        {/* Instant Book badge */}
        {isInstantBook && hasCapacity && !isCurrentlySelected && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-white" />
              Instant Book
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-0.5">
        {/* Title and Rating row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 text-[15px] line-clamp-1">
            {venueName}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
              <span className="text-sm text-gray-900">
                {rating.toFixed(1)}
                {reviewCount > 0 && (
                  <span className="text-gray-500"> ({reviewCount})</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Venue type and postcode */}
        <p className="text-sm text-gray-500">
          {venueType}{postcode && ` · ${postcode}`}
        </p>

        {/* Capacity */}
        {capacity && (
          <p className="text-sm text-gray-500">{capacity} guests</p>
        )}

        {/* Perfect for highlight */}
        {perfectFor && (
          <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {perfectFor}
          </p>
        )}

        {/* Price */}
        <p className="text-[15px] text-gray-900 pt-1">
          <span className="font-semibold">£{price}</span>
          <span className="font-normal"> total</span>
        </p>

        {/* Guarantees */}
        <p className="text-xs text-gray-500 flex items-center gap-1 pt-1">
          <ShieldCheck className="w-3 h-3 text-teal-500" />
          Free cancellation · Money back guarantee
        </p>

        {/* Select venue link */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(venue)
          }}
          disabled={!hasCapacity}
          className={`
            text-sm font-semibold underline underline-offset-2 transition-colors mt-2
            ${isCurrentlySelected
              ? 'text-primary-500 hover:text-primary-600'
              : hasCapacity
                ? 'text-gray-900 hover:text-gray-600'
                : 'text-gray-400 cursor-not-allowed no-underline'
            }
          `}
        >
          {isCurrentlySelected ? 'Selected' : 'Select venue'}
        </button>
      </div>
    </div>
  )
}
