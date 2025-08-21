"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const SwipeableSupplierCarousel = ({ 
  supplier, 
  className = "",
  aspectRatio = "aspect-[4/3]" // Default aspect ratio, can be customized
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef(null)
  
  // SOLUTION 1: Store previous supplier ID to detect actual changes
  const prevSupplierIdRef = useRef(null)

  // SOLUTION 2: Memoize images to prevent unnecessary recalculations
  const images = useMemo(() => {
    const imageList = []
    
    // Add cover photo first (it's a direct URL string)
    if (supplier?.coverPhoto) {
      imageList.push(supplier.coverPhoto)
    }
    
    // Add portfolio images (they are objects with src property)
    if (supplier?.portfolioImages && Array.isArray(supplier.portfolioImages)) {
      const portfolioImages = supplier.portfolioImages
        .filter(img => img && img.src && img.src !== supplier.coverPhoto) // Filter by src property and remove duplicates
        .slice(0, 3) // Limit to 3 additional images
        .map(img => img.src) // Extract just the src URL string
      
      imageList.push(...portfolioImages)
    }
    
    // Fallback if no images
    if (imageList.length === 0) {
      imageList.push('/placeholder.png') // Add your placeholder image path
    }
    
    return imageList
  }, [supplier?.coverPhoto, supplier?.portfolioImages])

  const totalImages = images.length

  // SOLUTION 3: Only reset when supplier ID actually changes
  useEffect(() => {
    const currentSupplierId = supplier?.id
    
    // Only reset if the supplier ID has actually changed
    if (currentSupplierId && currentSupplierId !== prevSupplierIdRef.current) {
      console.log('Supplier changed from', prevSupplierIdRef.current, 'to', currentSupplierId)
      setCurrentImageIndex(0)
      prevSupplierIdRef.current = currentSupplierId
    }
  }, [supplier?.id]) // Only depend on the ID, not the entire supplier object

  // SOLUTION 4: Reset index if current index exceeds available images
  useEffect(() => {
    if (currentImageIndex >= totalImages && totalImages > 0) {
      setCurrentImageIndex(0)
    }
  }, [totalImages, currentImageIndex])

  // Swipe detection
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(0) // Reset touch end
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentImageIndex < totalImages - 1) {
      nextImage()
    }
    if (isRightSwipe && currentImageIndex > 0) {
      prevImage()
    }
  }

  const nextImage = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentImageIndex(prev => {
      const newIndex = prev < totalImages - 1 ? prev + 1 : prev
      return newIndex
    })
    
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const prevImage = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentImageIndex(prev => {
      const newIndex = prev > 0 ? prev - 1 : prev
      return newIndex
    })
    
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return
    
    setIsTransitioning(true)
    setCurrentImageIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Container */}
      <div 
        className={`
          relative ${aspectRatio} w-full overflow-hidden rounded-xl bg-gray-100
          ${isTransitioning ? 'transition-transform duration-300 ease-in-out' : ''}
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        ref={carouselRef}
      >
        {/* Images */}
        <div 
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{
            width: `${totalImages * 100}%`,
            transform: `translateX(-${(currentImageIndex * 100) / totalImages}%)`,
          }}
        >
          {images.map((image, index) => (
            <div 
              key={`${supplier?.id}-${index}`} // Include supplier ID in key to force re-render when supplier changes
              className="relative flex-shrink-0 h-full"
              style={{ width: `${100 / totalImages}%` }}
            >
              <Image
                src={image}
                alt={`${supplier?.name || 'Supplier'} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0} // Prioritize first image
                onError={(e) => {
                  // Fallback to placeholder on error
                  e.target.src = '/placeholder-supplier.jpg'
                }}
              />
              
              {/* Image loading overlay */}
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Only show if more than 1 image */}
        {totalImages > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent card click
                prevImage()
              }}
              disabled={currentImageIndex === 0 || isTransitioning}
              className={`
                absolute left-2 top-1/2 -translate-y-1/2 z-10
                w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20
                flex items-center justify-center
                transition-all duration-200 hover:bg-black/70 hover:scale-110
                disabled:opacity-0 disabled:pointer-events-none
              `}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent card click
                nextImage()
              }}
              disabled={currentImageIndex === totalImages - 1 || isTransitioning}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 z-10
                w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20
                flex items-center justify-center
                transition-all duration-200 hover:bg-black/70 hover:scale-110
                disabled:opacity-0 disabled:pointer-events-none
              `}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* Image Counter - Only show if more than 1 image */}
        {totalImages > 1 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/20">
              {currentImageIndex + 1} / {totalImages}
            </div>
          </div>
        )}
      </div>

      {/* Dot Indicators - Only show if more than 1 image */}
      {totalImages > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {images.map((_, index) => (
            <button
              key={`dot-${supplier?.id}-${index}`} // Include supplier ID in key
              onClick={(e) => {
                e.stopPropagation() // Prevent card click
                goToImage(index)
              }}
              disabled={isTransitioning}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === currentImageIndex 
                  ? 'bg-primary-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SwipeableSupplierCarousel