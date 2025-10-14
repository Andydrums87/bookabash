"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const SwipeableSupplierCarousel = ({ 
  supplier, 
  className = "",
  aspectRatio = "aspect-[4/3]"
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imageErrors, setImageErrors] = useState({})
  const carouselRef = useRef(null)
  const prevSupplierIdRef = useRef(null)

  // Build image list with fallbacks
  const images = useMemo(() => {
    if (!supplier) return ['/placeholder.png']
    
    const imageList = []
    const seenUrls = new Set()
    
    const addImage = (url) => {
      if (url && !seenUrls.has(url)) {
        imageList.push(url)
        seenUrls.add(url)
      }
    }
    
    // Add cover photo (check both locations)
    if (supplier.coverPhoto) {
      addImage(supplier.coverPhoto)
    } else if (supplier.originalSupplier?.coverPhoto) {
      addImage(supplier.originalSupplier.coverPhoto)
    } else if (supplier.image) {
      addImage(supplier.image)
    } else if (supplier.originalSupplier?.image) {
      addImage(supplier.originalSupplier.image)
    } else if (supplier.imageUrl) {
      addImage(supplier.imageUrl)
    }
    
    // Process image in different formats
    const processImage = (img) => {
      if (typeof img === 'string') {
        addImage(img)
      } else if (img?.src) {
        addImage(img.src)
      } else if (img?.url) {
        addImage(img.url)
      } else if (img?.image) {
        addImage(img.image)
      } else if (img?.public_id) {
        const cloudinaryUrl = `https://res.cloudinary.com/${img.cloud_name || 'dghzq6xtd'}/image/upload/${img.public_id}`
        addImage(cloudinaryUrl)
      }
    }
    
    // Add portfolio images from multiple possible locations
    const portfolioFields = ['portfolioImages', 'portfolio_images', 'images', 'gallery', 'photos']
    
    portfolioFields.forEach(field => {
      // Check top-level supplier
      if (supplier[field] && Array.isArray(supplier[field])) {
        supplier[field].forEach(processImage)
      }
      
      // Check originalSupplier
      if (supplier.originalSupplier?.[field] && Array.isArray(supplier.originalSupplier[field])) {
        supplier.originalSupplier[field].forEach(processImage)
      }
    })
    
    // Limit to 6 images
    const limitedImages = imageList.slice(0, 6)
    
    return limitedImages.length > 0 ? limitedImages : ['/placeholder.png']
  }, [supplier])

  const totalImages = images.length

  // Reset when supplier changes
  useEffect(() => {
    const currentSupplierId = supplier?.id
    
    if (currentSupplierId && currentSupplierId !== prevSupplierIdRef.current) {
      setCurrentImageIndex(0)
      setImageErrors({})
      prevSupplierIdRef.current = currentSupplierId
    }
  }, [supplier?.id])

  // Validate current index
  useEffect(() => {
    if (currentImageIndex >= totalImages && totalImages > 0) {
      setCurrentImageIndex(0)
    }
  }, [totalImages, currentImageIndex])

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(0)
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
    setCurrentImageIndex(prev => Math.min(prev + 1, totalImages - 1))
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const prevImage = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentImageIndex(prev => Math.max(prev - 1, 0))
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return
    
    setIsTransitioning(true)
    setCurrentImageIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Container */}
      <div 
        className={`
          relative ${aspectRatio} w-full overflow-hidden bg-gray-200
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
          {images.map((image, index) => {
            const isError = imageErrors[index]
            
            return (
              <div 
                key={`${supplier?.id}-${index}`}
                className="relative flex-shrink-0 h-full bg-gray-100"
                style={{ width: `${100 / totalImages}%` }}
              >
                {!isError ? (
                  <Image
                    src={image}
                    alt={`${supplier?.name || 'Supplier'} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                    onError={() => handleImageError(index)}
                    unoptimized={true}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-500">Image unavailable</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              disabled={currentImageIndex === 0 || isTransitioning}
              className={`
                absolute left-2 top-1/2 -translate-y-1/2 z-20
                w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20
                flex items-center justify-center
                transition-all duration-200 hover:bg-black/70 hover:scale-110
                disabled:opacity-0 disabled:pointer-events-none
              `}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              disabled={currentImageIndex === totalImages - 1 || isTransitioning}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 z-20
                w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20
                flex items-center justify-center
                transition-all duration-200 hover:bg-black/70 hover:scale-110
                disabled:opacity-0 disabled:pointer-events-none
              `}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {totalImages > 1 && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/20">
              {currentImageIndex + 1} / {totalImages}
            </div>
          </div>
        )}
      </div>

      {/* Dot Indicators */}
      {totalImages > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {images.map((_, index) => (
            <button
              key={`dot-${supplier?.id}-${index}`}
              onClick={(e) => {
                e.stopPropagation()
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