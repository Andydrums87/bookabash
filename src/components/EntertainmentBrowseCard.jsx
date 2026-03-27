"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useEmblaCarousel from "embla-carousel-react"
import GoogleRatingBadge from "@/components/GoogleRatingBadge"

// Calculate entertainer price
const calculateEntertainerPrice = (entertainer) => {
  if (entertainer.price && entertainer.price > 0) {
    return entertainer.price
  }

  const priceFrom = entertainer.priceFrom || entertainer.data?.priceFrom || 0
  if (priceFrom > 0) return priceFrom

  // Check packages
  const packages = entertainer.packages || entertainer.data?.packages || []
  if (packages.length > 0) {
    const prices = packages.map(p => p.price || p.priceFrom || 0).filter(p => p > 0)
    if (prices.length > 0) return Math.min(...prices)
  }

  // Check hourly rate
  const hourlyRate = entertainer.serviceDetails?.hourlyRate ||
                     entertainer.data?.serviceDetails?.hourlyRate || 0
  if (hourlyRate > 0) return hourlyRate * 2

  return 0
}

// Get average rating from reviews
const getAverageRating = (entertainer) => {
  if (entertainer.rating) return { rating: entertainer.rating, count: entertainer.reviewCount || 0 }

  const reviews = entertainer.reviews || entertainer.data?.reviews || []
  if (reviews.length === 0) return null

  const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
  return { rating: avg, count: reviews.length }
}

export default function EntertainmentBrowseCard({
  entertainer,
  isCurrentlySelected = false,
  onClick,
  onSelect,
  isLoading = false,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const pointerStart = useRef(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // Get entertainer images
  const getImages = () => {
    const images = []
    const coverPhoto = entertainer.coverPhoto || entertainer.image || entertainer.imageUrl || entertainer.data?.coverPhoto
    if (coverPhoto) images.push(coverPhoto)

    const gallery = entertainer.gallery ||
                    entertainer.photos ||
                    entertainer.data?.gallery ||
                    entertainer.data?.photos ||
                    entertainer.serviceDetails?.gallery ||
                    entertainer.serviceDetails?.photos ||
                    entertainer.serviceDetails?.portfolioImages ||
                    entertainer.data?.serviceDetails?.portfolioImages ||
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

  const images = getImages()

  // Carousel state
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

  // Entertainer details
  const name = entertainer.name || entertainer.businessName || entertainer.data?.name || "Unnamed Entertainer"
  const price = calculateEntertainerPrice(entertainer)
  const ratingData = getAverageRating(entertainer)

  return (
    <div
      className="cursor-pointer transition-all duration-200 group"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[20/19] rounded-xl overflow-hidden mb-3">
        <div
          className="overflow-hidden h-full"
          ref={emblaRef}
          onPointerDown={(e) => { pointerStart.current = { x: e.clientX, y: e.clientY } }}
          onPointerUp={(e) => {
            if (!pointerStart.current || !onClick) return
            const dx = Math.abs(e.clientX - pointerStart.current.x)
            const dy = Math.abs(e.clientY - pointerStart.current.y)
            if (dx < 8 && dy < 8) onClick(e) // Tap, not drag
            pointerStart.current = null
          }}
        >
          <div className="flex h-full">
            {images.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                <Image
                  src={img}
                  alt={`${name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
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

        {/* Dot indicators */}
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
      </div>

      {/* Content */}
      <div className="space-y-1 pt-2">
        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
          {name}
        </h3>

        {/* Google Rating */}
        {entertainer.googleRating ? (
          <GoogleRatingBadge
            rating={entertainer.googleRating}
            reviewCount={entertainer.googleReviewCount}
            size="sm"
          />
        ) : ratingData && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
            <span className="text-sm text-gray-900">
              {ratingData.rating.toFixed(1)}
              {ratingData.count > 0 && (
                <span className="text-gray-500"> ({ratingData.count})</span>
              )}
            </span>
          </div>
        )}

        {/* Price */}
        {price > 0 && (
          <p className="text-sm text-gray-900">
            <span className="font-bold">From £{price}</span>
          </p>
        )}
      </div>
    </div>
  )
}
