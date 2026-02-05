"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight, X } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

// Check if venue has instant book enabled (via Google Calendar sync)
const hasInstantBook = (venue) => {
  return venue.googleCalendarSync?.enabled === true ||
         venue.calendarIntegration?.enabled === true ||
         venue.data?.googleCalendarSync?.enabled === true ||
         venue.data?.calendarIntegration?.enabled === true
}

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

export default function VenueMobileBottomSheet({
  venue,
  isOpen,
  onClose,
  onViewDetails,
  onSelect,
  partyDetails,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)

  // Get venue images
  const getVenueImages = () => {
    if (!venue) return ["/placeholder.png"]

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

  // Reset carousel when venue changes
  useEffect(() => {
    if (emblaApi && venue) {
      emblaApi.scrollTo(0)
      setCurrentSlide(0)
    }
  }, [venue?.id, emblaApi])

  const scrollPrev = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollNext()
  }, [emblaApi])

  if (!venue || !isOpen) return null

  // Venue details
  const venueName = venue.name || venue.businessName || venue.data?.name || "Unnamed Venue"
  const price = calculateVenuePrice(venue)
  const rating = venue.rating || venue.data?.rating || null
  const reviewCount = venue.reviewCount || venue.data?.reviewCount || 0
  const venueType = venue.serviceDetails?.venueType || venue.data?.serviceDetails?.venueType || "Venue"
  const postcode = venue.venueAddress?.postcode || venue.location || venue.serviceDetails?.venueAddress?.postcode || ""
  const capacity = venue.serviceDetails?.venueDetails?.capacity ||
                   venue.data?.serviceDetails?.venueDetails?.capacity ||
                   venue.capacity || null

  // Get first highlight for "Perfect for" display
  const highlights = venue.highlights ||
                     venue.serviceDetails?.highlights ||
                     venue.data?.highlights ||
                     venue.data?.serviceDetails?.highlights || []
  const perfectFor = highlights.length > 0 ? highlights[0] : null

  return (
    <>
      {/* Backdrop - click to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Floating card at bottom - Airbnb style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-6 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image Carousel */}
          <div className="relative aspect-[16/10]">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((img, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                    <Image
                      src={img}
                      alt={`${venueName} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Guest favourite badge - like Airbnb */}
            {rating && rating >= 4.8 && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-white px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 shadow-sm">
                  Guest favourite
                </span>
              </div>
            )}

            {/* Close button - Airbnb style */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className={`
                    absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full
                    shadow-sm flex items-center justify-center active:scale-95
                    transition-all duration-200 z-10
                    ${currentSlide > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  `}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-800" />
                </button>
                <button
                  onClick={scrollNext}
                  className={`
                    absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full
                    shadow-sm flex items-center justify-center active:scale-95
                    transition-all duration-200 z-10
                    ${currentSlide < images.length - 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  `}
                >
                  <ChevronRight className="w-4 h-4 text-gray-800" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-1.5 h-1.5 rounded-full transition-all duration-200
                      ${index === currentSlide
                        ? "bg-white"
                        : "bg-white/50"
                      }
                    `}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content - Airbnb style */}
          <div className="p-4" onClick={onViewDetails}>
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-medium text-gray-900 text-base line-clamp-1">
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

            {/* Subtitle */}
            <p className="text-sm text-gray-500 mb-1">
              {venueType}
              {postcode && ` · ${postcode}`}
            </p>

            {/* Perfect for highlight */}
            {perfectFor && (
              <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {perfectFor}
              </p>
            )}

            {/* Price */}
            <p className="text-base text-gray-900 mt-2">
              <span className="font-semibold">£{price}</span>
              <span className="font-normal"> total</span>
            </p>

            {/* Free cancellation */}
            <p className="text-sm text-gray-500 mt-1">
              Free cancellation
            </p>

            {/* Select venue link */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.(venue)
              }}
              className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors mt-3"
            >
              Select venue
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
