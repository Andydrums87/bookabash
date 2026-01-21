// components/SupplierQuickViewModal.jsx
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import the swipeable carousel
import SwipeableSupplierCarousel from '@/components/supplier/SwipableSupplierCarousel'

// Import service display components
import ServiceDetailsDisplayRouter from '@/components/supplier/display/ServiceDetailsDisplayRouter'

export default function SupplierQuickViewModal({
  supplier,
  isOpen,
  onClose,
  onCustomize, // Callback to open customization modal
  onBookPackage, // NEW: Callback to directly book a package (bypasses customization)
  bookingPackageId, // NEW: ID of package currently being booked (for loading state)
  partyDetails,
  type
}) {
  const [fullSupplier, setFullSupplier] = useState(null)
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [expandedPackageImage, setExpandedPackageImage] = useState(null) // NEW: For expanded package images
  const scrollPositionRef = useRef(0) // Store scroll position in ref to avoid stale closure

  // Detect theme from supplier name/description
  const getSupplierTheme = (supplier) => {
    if (!supplier?.name) return null;

    const name = supplier.name.toLowerCase();
    const description = (supplier.businessDescription || '').toLowerCase();
    const combined = name + ' ' + description;

    // Theme detection patterns matching party dashboard
    const themePatterns = [
      { keywords: ['spider', 'spiderman'], theme: 'spiderman', color: 'rgb(220, 38, 38)' },
      { keywords: ['princess'], theme: 'princess', color: 'rgb(236, 72, 153)' },
      { keywords: ['frozen', 'elsa'], theme: 'unicorn', color: 'rgb(59, 130, 246)' },
      { keywords: ['dinosaur', 'dino'], theme: 'dinosaur', color: 'rgb(34, 197, 94)' },
      { keywords: ['unicorn'], theme: 'unicorn', color: 'rgb(192, 132, 252)' },
      { keywords: ['science', 'lab', 'experiment'], theme: 'science', color: 'rgb(168, 85, 247)' },
      { keywords: ['superhero', 'hero', 'marvel'], theme: 'superhero', color: 'rgb(239, 68, 68)' },
      { keywords: ['pirate'], theme: 'pirate', color: 'rgb(202, 138, 4)' },
      { keywords: ['taylor swift', 'swift'], theme: 'taylor-swift', color: 'rgb(168, 85, 247)' },
      { keywords: ['cars', 'vehicles'], theme: 'cars', color: 'rgb(37, 99, 235)' },
      { keywords: ['space', 'astronaut', 'rocket'], theme: 'space', color: 'rgb(49, 46, 129)' },
      { keywords: ['jungle', 'safari', 'animals'], theme: 'jungle', color: 'rgb(22, 163, 74)' },
      { keywords: ['football', 'soccer'], theme: 'football', color: 'rgb(22, 163, 74)' },
    ];

    for (const pattern of themePatterns) {
      if (pattern.keywords.some(keyword => combined.includes(keyword))) {
        return pattern;
      }
    }

    return null;
  }

  const detectedTheme = fullSupplier ? getSupplierTheme(fullSupplier) : null;
  const themeAccentColor = detectedTheme?.color || null;

  // Get theme image for background
  const getThemeImage = () => {
    if (!detectedTheme) return null;

    const themeImages = {
      princess: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381349/iStock-1059655678_mfuiu6.jpg",
      superhero: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829350/jng4z1rdtb9mik2n6mp6.jpg",
      dinosaur: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380783/iStock-1646650260_douzyr.jpg",
      unicorn: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381224/iStock-1385363961_iltnu7.jpg",
      science: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380880/iStock-1603218889_xq4kqi.jpg",
      spiderman: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381418/iStock-1474890351_fduaev.jpg",
      "taylor-swift": "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380937/iStock-2201784646_cdvevq.jpg",
      cars: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754380995/iStock-2176668301_cstncj.jpg",
      space: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381070/iStock-684090490_smtflw.jpg",
      jungle: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg",
      football: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381299/iStock-488844390_wmv5zq.jpg",
      pirate: null,
    };

    return themeImages[detectedTheme.theme] || null;
  };

  const themeImage = getThemeImage();

  // Get all supplier images for lightbox - MUST match SwipeableSupplierCarousel logic exactly
  const getSupplierImages = (supplier) => {
    if (!supplier) return [];

    const imageList = [];
    const seenUrls = new Set();

    const addImage = (url) => {
      if (url && !seenUrls.has(url)) {
        imageList.push(url);
        seenUrls.add(url);
      }
    };

    // Add cover photo (check both locations) - same order as carousel
    if (supplier.coverPhoto) {
      addImage(supplier.coverPhoto);
    } else if (supplier.originalSupplier?.coverPhoto) {
      addImage(supplier.originalSupplier.coverPhoto);
    } else if (supplier.image) {
      addImage(supplier.image);
    } else if (supplier.originalSupplier?.image) {
      addImage(supplier.originalSupplier.image);
    } else if (supplier.imageUrl) {
      addImage(supplier.imageUrl);
    }

    // Process image in different formats
    const processImage = (img) => {
      if (typeof img === 'string') {
        addImage(img);
      } else if (img?.src) {
        addImage(img.src);
      } else if (img?.url) {
        addImage(img.url);
      } else if (img?.image) {
        addImage(img.image);
      } else if (img?.public_id) {
        const cloudinaryUrl = `https://res.cloudinary.com/${img.cloud_name || 'dghzq6xtd'}/image/upload/${img.public_id}`;
        addImage(cloudinaryUrl);
      }
    };

    // Add portfolio images from multiple possible locations - same order as carousel
    const portfolioFields = ['portfolioImages', 'portfolio_images', 'images', 'gallery', 'photos'];

    portfolioFields.forEach(field => {
      if (supplier[field] && Array.isArray(supplier[field])) {
        supplier[field].forEach(processImage);
      }
      if (supplier.originalSupplier?.[field] && Array.isArray(supplier.originalSupplier[field])) {
        supplier.originalSupplier[field].forEach(processImage);
      }
    });

    // Limit to 6 images - same as carousel
    return imageList.slice(0, 6);
  };

  const supplierImages = getSupplierImages(fullSupplier || supplier);

  // Disable body scroll when modal is open - Enhanced for mobile
  useEffect(() => {
    if (isOpen) {
      // Store in ref to avoid stale closure issues
      scrollPositionRef.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        // Use instant behavior to avoid smooth scroll causing visible jump
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      }
    }
  }, [isOpen])

  // Fetch full supplier data when modal opens
  useEffect(() => {
    const fetchFullSupplierData = async () => {
      if (!isOpen || !supplier?.id) {
        setFullSupplier(null)
        return
      }

      setIsLoadingSupplier(true)
      try {
        const { suppliersAPI } = await import('@/utils/mockBackend')
        const fullData = await suppliersAPI.getSupplierById(supplier.id)
        setFullSupplier(fullData)
      } catch (error) {
        console.error('❌ Error fetching full supplier data:', error)
        // Fallback to the supplier data we have
        setFullSupplier(supplier)
      } finally {
        setIsLoadingSupplier(false)
      }
    }

    fetchFullSupplierData()
  }, [isOpen, supplier?.id, supplier])

  if (!isOpen || !supplier) return null

  // Use fullSupplier when available, fallback to supplier
  const displaySupplier = fullSupplier || supplier

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-5xl w-full h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Close Button - Floating over carousel */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* ✅ MAXIMUM HEIGHT: Scrollable Content Area with background image */}
        <div
          className="flex-1 overflow-y-auto relative"
          style={{
            minHeight: 0
          }}
        >
          {/* Subtle background image */}
          {displaySupplier?.coverPhoto && (
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url(${displaySupplier.coverPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px)',
              }}
            />
          )}
          {/* Supplier Details - No tabs needed, just show content */}
          <div className="relative z-10">
            {isLoadingSupplier ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-[hsl(var(--primary-500))] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading full details...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: Carousel | Desktop: Gallery Grid */}
                <div className="relative">
                  {/* Mobile carousel with blurred background (hidden on lg+) */}
                  <div className="lg:hidden relative h-56 sm:h-64 md:h-72 overflow-hidden">
                    {/* Blurred background fill */}
                    {supplierImages.length > 0 && (
                      <div
                        className="absolute inset-0 scale-110"
                        style={{
                          backgroundImage: `url(${supplierImages[carouselIndex] || supplierImages[0]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(20px)',
                        }}
                      />
                    )}
                    {/* Dark overlay for better contrast */}
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Main image with object-contain */}
                    {supplierImages.length > 0 && (
                      <div className="relative h-full w-full">
                        <Image
                          src={supplierImages[carouselIndex] || supplierImages[0]}
                          alt={`Image ${carouselIndex + 1}`}
                          fill
                          className="object-contain relative z-10"
                          sizes="100vw"
                        />
                      </div>
                    )}
                    {/* Navigation dots for multiple images */}
                    {supplierImages.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
                        {supplierImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === carouselIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {/* Swipe areas for navigation */}
                    {supplierImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCarouselIndex(prev => prev === 0 ? supplierImages.length - 1 : prev - 1)}
                          className="absolute left-0 top-0 bottom-0 w-1/4 z-10"
                          aria-label="Previous image"
                        />
                        <button
                          onClick={() => setCarouselIndex(prev => prev === supplierImages.length - 1 ? 0 : prev + 1)}
                          className="absolute right-0 top-0 bottom-0 w-1/4 z-10"
                          aria-label="Next image"
                        />
                      </>
                    )}
                    {/* Maximize button */}
                    {supplierImages.length > 0 && (
                      <button
                        onClick={() => {
                          setLightboxIndex(carouselIndex)
                          setShowLightbox(true)
                        }}
                        className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 transition-all shadow-lg"
                      >
                        <Maximize2 className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-medium">View</span>
                      </button>
                    )}
                    {/* Image counter */}
                    {supplierImages.length > 1 && (
                      <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-medium">{carouselIndex + 1}/{supplierImages.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Desktop gallery grid (hidden below lg) - adapts to image count */}
                  <div className="hidden lg:block">
                    {/* Single image - full width with blurred background */}
                    {supplierImages.length === 1 && (
                      <div
                        className="relative h-80 rounded-b-2xl overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setLightboxIndex(0)
                          setShowLightbox(true)
                        }}
                      >
                        {/* Blurred background fill */}
                        <div
                          className="absolute inset-0 scale-110"
                          style={{
                            backgroundImage: `url(${supplierImages[0]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px)',
                          }}
                        />
                        {/* Main image with contain */}
                        <Image
                          src={supplierImages[0]}
                          alt="Main image"
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300 relative z-10"
                          sizes="(min-width: 1024px) 100vw, 100vw"
                        />
                        <button className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 transition-all shadow-lg">
                          <Maximize2 className="w-4 h-4 text-white" />
                          <span className="text-white text-xs font-medium">View</span>
                        </button>
                      </div>
                    )}

                    {/* Two images - side by side */}
                    {supplierImages.length === 2 && (
                      <div className="grid grid-cols-2 gap-2 h-80">
                        <div
                          className="relative rounded-bl-2xl overflow-hidden cursor-pointer group"
                          onClick={() => {
                            setLightboxIndex(0)
                            setShowLightbox(true)
                          }}
                        >
                          <Image
                            src={supplierImages[0]}
                            alt="Image 1"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                          />
                          <button className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 transition-all shadow-lg">
                            <Maximize2 className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-medium">View</span>
                          </button>
                        </div>
                        <div
                          className="relative rounded-br-2xl overflow-hidden cursor-pointer group"
                          onClick={() => {
                            setLightboxIndex(1)
                            setShowLightbox(true)
                          }}
                        >
                          <Image
                            src={supplierImages[1]}
                            alt="Image 2"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                          />
                        </div>
                      </div>
                    )}

                    {/* Three or more images - original layout */}
                    {supplierImages.length >= 3 && (
                      <div className="grid grid-cols-3 gap-2 h-80">
                        {/* Main large image */}
                        <div
                          className="col-span-2 relative rounded-bl-2xl overflow-hidden cursor-pointer group"
                          onClick={() => {
                            setLightboxIndex(0)
                            setShowLightbox(true)
                          }}
                        >
                          <Image
                            src={supplierImages[0]}
                            alt="Main image"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(min-width: 1024px) 66vw, 100vw"
                          />
                          <button className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 transition-all shadow-lg">
                            <Maximize2 className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-medium">View</span>
                          </button>
                        </div>

                        {/* Side images stack */}
                        <div className="flex flex-col gap-2">
                          <div
                            className="relative flex-1 overflow-hidden cursor-pointer group"
                            onClick={() => {
                              setLightboxIndex(1)
                              setShowLightbox(true)
                            }}
                          >
                            <Image
                              src={supplierImages[1]}
                              alt="Gallery image 2"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(min-width: 1024px) 33vw, 100vw"
                            />
                          </div>

                          <div
                            className="relative flex-1 rounded-br-2xl overflow-hidden cursor-pointer group"
                            onClick={() => {
                              setLightboxIndex(2)
                              setShowLightbox(true)
                            }}
                          >
                            <Image
                              src={supplierImages[2]}
                              alt="Gallery image 3"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(min-width: 1024px) 33vw, 100vw"
                            />
                            {/* +X more overlay */}
                            {supplierImages.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">+{supplierImages.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content with padding */}
                <div className="px-4 pt-6 pb-5 sm:px-6 sm:pt-8 sm:pb-6 space-y-6">

                {/* 1. WHAT TO EXPECT - The Story (FIRST) - Hide for categories that have their own aboutUs section */}
                {(() => {
                  const category = displaySupplier?.category?.toLowerCase() || ''
                  const serviceType = displaySupplier?.serviceType?.toLowerCase() || ''
                  const isCake = category === 'cakes' || category === 'cake'
                  const isVenue = category === 'venues' || category === 'venue'
                  const isBalloons = category === 'balloons' || category === 'balloon'
                  const isFacePainting = category === 'facepainting' || serviceType === 'facepainting' || category.includes('face')
                  const isCatering = category === 'catering' || category === 'caterer' || serviceType === 'catering'
                  const isPartyBags = category === 'partybags' || category === 'party bags' || serviceType === 'partybags'
                  const isDecorations = category === 'decorations' || category === 'decoration' || serviceType === 'decorations'
                  const isActivities = category === 'activities' || category === 'softplay' || serviceType === 'activities' || serviceType === 'softplay'
                  const isSweetTreats = category === 'sweettreats' || category === 'sweet treats' || serviceType === 'sweettreats'
                  const isBouncyCastle = category === 'bouncycastle' || category === 'bouncy castle' || serviceType === 'bouncycastle' || category.includes('bouncy')

                  // Skip for categories that have their own aboutUs section
                  if (isVenue || isBalloons || isFacePainting || isCatering || isPartyBags || isDecorations || isActivities || isSweetTreats || isBouncyCastle) return null

                  // For cakes, show description as "About This Cake"
                  if (isCake) {
                    const cakeDescription = displaySupplier?.description ||
                                            displaySupplier?.serviceDetails?.description ||
                                            displaySupplier?.businessDescription || ''
                    if (!cakeDescription) return null

                    return (
                      <div className="prose prose-sm sm:prose max-w-none">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                          About This Cake
                          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                        </h2>
                        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                          {cakeDescription}
                        </p>
                      </div>
                    )
                  }

                  // For non-cakes/non-venues, show aboutUs as before
                  if (!displaySupplier?.serviceDetails?.aboutUs) return null

                  return (
                    <div className="prose prose-sm sm:prose max-w-none">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                        What to Expect
                        <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                      </h2>
                      <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                        {displaySupplier.serviceDetails.aboutUs}
                      </p>
                    </div>
                  )
                })()}

                {/* 2. WHAT'S INCLUDED - Simple List (SECOND) */}
                {(() => {
                  const category = displaySupplier?.category?.toLowerCase() || ''
                  const serviceType = displaySupplier?.serviceType?.toLowerCase() || ''
                  const isCake = category === 'cakes' || category === 'cake'
                  const isBalloons = category === 'balloons' || category === 'balloon'
                  const isFacePainting = category === 'facepainting' || serviceType === 'facepainting' || category.includes('face')
                  const isEntertainment = category === 'entertainment' || category === 'entertainer' || serviceType === 'entertainment' || serviceType === 'entertainer'

                  // For entertainers, show "What You Need to Know" with timing info
                  if (isEntertainment) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const ageGroups = serviceDetails?.ageGroups || []

                    // Helper to format age groups into a readable range
                    const formatAgeRange = (ageGroups) => {
                      if (!ageGroups?.length) return 'All ages'
                      const ages = ageGroups.flatMap(group => {
                        const matches = group.match(/\d+/g)
                        return matches ? matches.map(Number) : []
                      })
                      if (ages.length === 0) return ageGroups.join(', ')
                      const min = Math.min(...ages)
                      const max = Math.max(...ages)
                      if (min === max) return `${min} years`
                      return `${min}-${max} years`
                    }

                    return (
                      <div className="space-y-6">
                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Age Range */}
                            {ageGroups.length > 0 && (
                              <div>
                                <span className="font-semibold text-gray-900">Perfect for: </span>
                                <span>{formatAgeRange(ageGroups)}</span>
                              </div>
                            )}

                            {/* Space Requirements */}
                            {serviceDetails.performanceSpecs?.spaceRequired && (
                              <div>
                                <span className="font-semibold text-gray-900">Space needed: </span>
                                <span>{serviceDetails.performanceSpecs.spaceRequired}</span>
                              </div>
                            )}

                            {/* Travel Radius */}
                            {serviceDetails.travelRadius && (
                              <div>
                                <span className="font-semibold text-gray-900">Coverage area: </span>
                                <span>Up to {serviceDetails.travelRadius} miles</span>
                              </div>
                            )}

                            {/* Timings */}
                            <div>
                              <span className="font-semibold text-gray-900 block mb-2">Timings:</span>
                              <div className="pl-4 space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                                  <span>Entertainer typically arrives 15-30 minutes before to setup</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                                  <span>First hour of games and activities</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                                  <span>20 minutes for food and refreshments</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[hsl(var(--primary-500))] mt-1">•</span>
                                  <span>Final 40 minutes of more entertainment</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Meet the Entertainer */}
                        {serviceDetails.personalBio?.personalStory && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Meet the Entertainer
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            {serviceDetails.personalBio.yearsExperience && (
                              <p className="text-base text-gray-700 mb-3">
                                <span className="font-semibold">{serviceDetails.personalBio.yearsExperience} years of experience</span> bringing joy to parties
                              </p>
                            )}
                            <p className="text-base text-gray-700 leading-relaxed">
                              {serviceDetails.personalBio.personalStory}
                            </p>
                          </div>
                        )}

                        {/* Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🎉</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Party Entertainment</h4>
                              <p className="text-base text-gray-700 mt-1">
                                Our entertainers bring all the equipment needed and keep the kids engaged throughout the party!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For face painting, show packages with designs
                  if (isFacePainting) {
                    const packages = displaySupplier?.packages || []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Face Painting
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Design Collections / Packages */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Design Collections
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                    <span className="font-black text-2xl text-[hsl(var(--primary-500))]">£{pkg.price}</span>
                                  </div>
                                  {pkg.description && (
                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                  )}
                                  {pkg.designs && pkg.designs.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Includes designs:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {pkg.designs.map((design, dIndex) => (
                                          <span key={dIndex} className="px-2 py-1 bg-primary-100 text-[hsl(var(--primary-700))] text-xs rounded-full">
                                            {design}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {pkg.features && pkg.features.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {pkg.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                          <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {/* Book button */}
                                  {(onBookPackage || onCustomize) && (
                                    <button
                                      onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                      disabled={bookingPackageId === (pkg.id || pkg.name)}
                                      className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                        bookingPackageId === (pkg.id || pkg.name)
                                          ? 'opacity-70 cursor-not-allowed'
                                          : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                      }`}
                                    >
                                      {bookingPackageId === (pkg.id || pkg.name) ? (
                                        <span className="flex items-center justify-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                      ) : 'Book'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Time per child */}
                            <div>
                              <span className="font-semibold text-gray-900">Time per design: </span>
                              <span>{serviceDetails?.avgTimePerChild || '3-5 minutes per child for most designs'}</span>
                            </div>

                            {/* Capacity */}
                            <div>
                              <span className="font-semibold text-gray-900">How many kids: </span>
                              <span>{serviceDetails?.maxChildren || 'Can paint approximately 10-15 children per hour'}</span>
                            </div>

                            {/* Paints used */}
                            <div>
                              <span className="font-semibold text-gray-900">Paints used: </span>
                              <span>{serviceDetails?.paintsUsed || 'Professional, hypoallergenic face paints safe for sensitive skin'}</span>
                            </div>

                            {/* Setup */}
                            <div>
                              <span className="font-semibold text-gray-900">Setup: </span>
                              <span>Just need a table and chair - we bring everything else!</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🎨</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Face Painting Fun</h4>
                              <p className="text-base text-gray-700 mt-1">
                                Kids love choosing their design! We work continuously throughout the party so everyone gets a turn.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For party bags, show "What You Need to Know"
                  const isPartyBags = category === 'partybags' || category === 'party bags' || serviceType === 'partybags' || category.includes('party bag')
                  if (isPartyBags) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const packages = displaySupplier?.packages || []
                    const aboutUs = serviceDetails?.aboutUs || displaySupplier?.description || ''

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Party Bags
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Packages */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Party Bag Options
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Price per bag - order one for each guest</p>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {packages.map((pkg, index) => {
                                const guestCount = partyDetails?.guestCount || 10
                                const totalPrice = (pkg.price * guestCount).toFixed(2)
                                return (
                                <div key={index} className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                    <div className="text-right">
                                      <span className="font-black text-2xl text-[hsl(var(--primary-500))]">£{totalPrice}</span>
                                      <p className="text-xs text-gray-500">£{pkg.price} per bag</p>
                                    </div>
                                  </div>
                                  {pkg.description && (
                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                  )}
                                  {pkg.contents && pkg.contents.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {pkg.contents.map((item, cIndex) => (
                                        <li key={cIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                          <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {pkg.features && pkg.features.length > 0 && !pkg.contents && (
                                    <ul className="space-y-1.5">
                                      {pkg.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                          <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {/* Book button */}
                                  {(onBookPackage || onCustomize) && (
                                    <button
                                      onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                      disabled={bookingPackageId === (pkg.id || pkg.name)}
                                      className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                        bookingPackageId === (pkg.id || pkg.name)
                                          ? 'opacity-70 cursor-not-allowed'
                                          : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                      }`}
                                    >
                                      {bookingPackageId === (pkg.id || pkg.name) ? (
                                        <span className="flex items-center justify-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                      ) : 'Book'}
                                    </button>
                                  )}
                                </div>
                              )})}
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Delivery Info */}
                            <div>
                              <span className="font-semibold text-gray-900">Delivery: </span>
                              <span>{serviceDetails?.delivery || 'Delivered to your home address within 3-5 working days'}</span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="font-semibold text-gray-900">Lead time: </span>
                              <span>{serviceDetails?.leadTime ? `${serviceDetails.leadTime} days notice required` : '5 days notice required'}</span>
                            </div>

                            {/* Allergen Info */}
                            {serviceDetails?.allergenInfo && (
                              <div>
                                <span className="font-semibold text-gray-900">Allergen info: </span>
                                <span>{serviceDetails.allergenInfo}</span>
                              </div>
                            )}

                            {/* Minimum Order */}
                            {serviceDetails?.minimumOrder && (
                              <div>
                                <span className="font-semibold text-gray-900">Minimum order: </span>
                                <span>{serviceDetails.minimumOrder} bags</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delivery Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🎁</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Free Delivery Included</h4>
                              <p className="text-base text-gray-700 mt-1">
                                Party bags delivered to your home within 3-5 working days so everything is ready for the big day!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For bouncy castle - simple hire for party duration
                  const isBouncyCastle = category === 'bouncycastle' || category === 'bouncy castle' || serviceType === 'bouncycastle' || serviceType === 'bouncy castle' || category.includes('bouncy')
                  if (isBouncyCastle) {
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Bouncy Castle
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Hire Duration */}
                            <div>
                              <span className="font-semibold text-gray-900">Hire duration: </span>
                              <span>Included for the full duration of your party</span>
                            </div>

                            {/* Space Required */}
                            <div>
                              <span className="font-semibold text-gray-900">Space needed: </span>
                              <span>{serviceDetails?.spaceRequired || 'Flat outdoor area or large indoor space with high ceiling'}</span>
                            </div>

                            {/* Setup */}
                            <div>
                              <span className="font-semibold text-gray-900">Setup: </span>
                              <span>We arrive 30-45 minutes before to inflate and secure the castle</span>
                            </div>

                            {/* Collection */}
                            <div>
                              <span className="font-semibold text-gray-900">Collection: </span>
                              <span>We pack away after your party - you don't need to do anything!</span>
                            </div>

                            {/* Safety */}
                            <div>
                              <span className="font-semibold text-gray-900">Safety: </span>
                              <span>All castles are safety-tested and we provide safety mats</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🏰</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Bouncy Castle Hire</h4>
                              <p className="text-base text-gray-700 mt-1">
                                The bouncy castle is included for your entire party - endless bouncing fun for the kids!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For activities/soft play, show items with images
                  const isActivities = category === 'activities' || serviceType === 'activities' || category.includes('soft play')
                  if (isActivities) {
                    const packages = displaySupplier?.packages || []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Soft Play
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Equipment Items */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Available Equipment
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {packages.map((pkg, index) => {
                                const imageUrl = typeof pkg.image === 'object' ? pkg.image.src : pkg.image
                                return (
                                  <div key={index} className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 overflow-hidden">
                                    {/* Item Image with View button */}
                                    {pkg.image && (
                                      <div className="relative h-32 w-full">
                                        <Image
                                          src={imageUrl}
                                          alt={pkg.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, 50vw"
                                        />
                                        {/* View button overlay */}
                                        <button
                                          onClick={() => setExpandedPackageImage(imageUrl)}
                                          className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
                                        >
                                          <Maximize2 className="w-3 h-3 text-gray-600" />
                                          <span className="text-[10px] font-medium text-gray-600">View</span>
                                        </button>
                                      </div>
                                    )}
                                    <div className="p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                        <span className="font-black text-xl text-[hsl(var(--primary-500))]">£{pkg.price}</span>
                                      </div>
                                      {pkg.description && (
                                        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                      )}
                                      {pkg.features && pkg.features.length > 0 && (
                                        <ul className="space-y-1">
                                          {pkg.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                              <span>{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                      {pkg.duration && (
                                        <p className="text-xs text-gray-500 mt-2">Duration: {pkg.duration}</p>
                                      )}
                                      {/* Book button */}
                                      {(onBookPackage || onCustomize) && (
                                        <button
                                          onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                          disabled={bookingPackageId === (pkg.id || pkg.name)}
                                          className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                            bookingPackageId === (pkg.id || pkg.name)
                                              ? 'opacity-70 cursor-not-allowed'
                                              : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                          }`}
                                        >
                                          {bookingPackageId === (pkg.id || pkg.name) ? (
                                            <span className="flex items-center justify-center gap-1">
                                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </span>
                                          ) : 'Book'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Age Range */}
                            <div>
                              <span className="font-semibold text-gray-900">Perfect for: </span>
                              <span>{serviceDetails?.ageRange || 'Ages 1-6 years'}</span>
                            </div>

                            {/* Space Required */}
                            <div>
                              <span className="font-semibold text-gray-900">Space needed: </span>
                              <span>{serviceDetails?.spaceRequired || 'Minimum 3m x 3m clear floor area'}</span>
                            </div>

                            {/* Setup & Collection */}
                            <div>
                              <span className="font-semibold text-gray-900">Delivery & setup: </span>
                              <span>{serviceDetails?.setupTime || 'We deliver and set up 30-60 mins before your party starts'}</span>
                            </div>

                            {/* Collection */}
                            <div>
                              <span className="font-semibold text-gray-900">Collection: </span>
                              <span>{serviceDetails?.collectionTime || 'Collected after your party - no need to pack anything away!'}</span>
                            </div>

                            {/* Safety */}
                            <div>
                              <span className="font-semibold text-gray-900">Safety: </span>
                              <span>All equipment is cleaned and safety-checked before every hire</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🎪</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Full Service Hire</h4>
                              <p className="text-base text-gray-700 mt-1">
                                We handle everything - delivery, setup, and collection. You just enjoy the party!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For sweet treats, show available items with multi-select options
                  const isSweetTreats = category === 'sweettreats' || category === 'sweet treats' || serviceType === 'sweettreats' || serviceType === 'sweet treats'
                  if (isSweetTreats) {
                    const packages = displaySupplier?.packages || displaySupplier?.items || []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Sweet Treats
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Available Items */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Available Treats
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Pick and choose from our range - mix and match for your perfect party!</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {packages.map((pkg, index) => {
                                const imageUrl = typeof pkg.image === 'object' ? pkg.image.src : pkg.image
                                return (
                                  <div key={index} className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 overflow-hidden">
                                    {/* Item Image with View button */}
                                    {pkg.image && (
                                      <div className="relative h-32 w-full">
                                        <Image
                                          src={imageUrl}
                                          alt={pkg.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, 50vw"
                                        />
                                        {/* View button overlay */}
                                        <button
                                          onClick={() => setExpandedPackageImage(imageUrl)}
                                          className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
                                        >
                                          <Maximize2 className="w-3 h-3 text-gray-600" />
                                          <span className="text-[10px] font-medium text-gray-600">View</span>
                                        </button>
                                      </div>
                                    )}
                                    <div className="p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                        <span className="font-black text-xl text-[hsl(var(--primary-500))]">£{pkg.price}</span>
                                      </div>
                                      {pkg.description && (
                                        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                      )}
                                      {pkg.features && pkg.features.length > 0 && (
                                        <ul className="space-y-1">
                                          {pkg.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                              <span>{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                      {pkg.duration && (
                                        <p className="text-xs text-gray-500 mt-2">Duration: {pkg.duration}</p>
                                      )}
                                      {/* Book button */}
                                      {(onBookPackage || onCustomize) && (
                                        <button
                                          onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                          disabled={bookingPackageId === (pkg.id || pkg.name)}
                                          className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                            bookingPackageId === (pkg.id || pkg.name)
                                              ? 'opacity-70 cursor-not-allowed'
                                              : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                          }`}
                                        >
                                          {bookingPackageId === (pkg.id || pkg.name) ? (
                                            <span className="flex items-center justify-center gap-1">
                                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </span>
                                          ) : 'Book'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Setup */}
                            <div>
                              <span className="font-semibold text-gray-900">Setup: </span>
                              <span>{serviceDetails?.setupTime || 'We arrive 30-60 minutes before your party to set up'}</span>
                            </div>

                            {/* Space Required */}
                            <div>
                              <span className="font-semibold text-gray-900">Space needed: </span>
                              <span>{serviceDetails?.spaceRequired || 'One table for the treats station'}</span>
                            </div>

                            {/* Staffing */}
                            <div>
                              <span className="font-semibold text-gray-900">Staffing: </span>
                              <span>{serviceDetails?.staffIncluded ? 'Staff member included to serve the treats' : 'Self-service - we set it up and you help yourselves!'}</span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="font-semibold text-gray-900">Lead time: </span>
                              <span>{serviceDetails?.leadTime || '5 days notice required'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🍭</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Sweet Treats at Your Party</h4>
                              <p className="text-base text-gray-700 mt-1">
                                A fun treat station the kids will love! Perfect for keeping energy levels up during the party.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For catering/lunchboxes, show packages with per-child pricing
                  const isCatering = category === 'catering' || serviceType === 'catering' || category.includes('lunchbox')
                  if (isCatering) {
                    const packages = displaySupplier?.packages || []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const dietaryOptions = displaySupplier?.dietaryOptions || serviceDetails?.dietaryOptions || []

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Catering
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Lunchbox Packages */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Lunchbox Options
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Price per child - order for each guest</p>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {packages.map((pkg, index) => {
                                const guestCount = partyDetails?.guestCount || 10
                                const totalPrice = (pkg.price * guestCount).toFixed(2)
                                return (
                                <div key={index} className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                    <div className="text-right">
                                      <span className="font-black text-2xl text-[hsl(var(--primary-500))]">£{totalPrice}</span>
                                      <p className="text-xs text-gray-500">£{pkg.price} per child</p>
                                    </div>
                                  </div>
                                  {pkg.description && (
                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                  )}
                                  {pkg.features && pkg.features.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {pkg.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                          <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {/* Book button */}
                                  {(onBookPackage || onCustomize) && (
                                    <button
                                      onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                      disabled={bookingPackageId === (pkg.id || pkg.name)}
                                      className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                        bookingPackageId === (pkg.id || pkg.name)
                                          ? 'opacity-70 cursor-not-allowed'
                                          : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                      }`}
                                    >
                                      {bookingPackageId === (pkg.id || pkg.name) ? (
                                        <span className="flex items-center justify-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                      ) : 'Book'}
                                    </button>
                                  )}
                                </div>
                              )})}
                            </div>
                          </div>
                        )}

                        {/* Dietary Options */}
                        {dietaryOptions.length > 0 && (
                          <div className="p-4 bg-primary-50 rounded-xl">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">🥗</span>
                              <div>
                                <h4 className="font-bold text-lg text-gray-900">Dietary Options Available</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {dietaryOptions.map((option, index) => (
                                    <span key={index} className="px-3 py-1 bg-white text-[hsl(var(--primary-700))] rounded-full text-sm border border-primary-200">
                                      {typeof option === 'object' ? option.name : option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Delivery */}
                            <div>
                              <span className="font-semibold text-gray-900">Delivery: </span>
                              <span>{serviceDetails?.delivery || 'Lunchboxes delivered chilled to your venue on the morning of your party'}</span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="font-semibold text-gray-900">Lead time: </span>
                              <span>{serviceDetails?.leadTime || '5 days notice required'}</span>
                            </div>

                            {/* Minimum Order */}
                            {serviceDetails?.minimumOrder && (
                              <div>
                                <span className="font-semibold text-gray-900">Minimum order: </span>
                                <span>{serviceDetails.minimumOrder}</span>
                              </div>
                            )}

                            {/* Dietary note */}
                            <div>
                              <span className="font-semibold text-gray-900">Dietary requirements: </span>
                              <span>Let us know any allergies or dietary needs when you book and we'll take care of it</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🚚</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Free Delivery Included</h4>
                              <p className="text-base text-gray-700 mt-1">
                                Fresh lunchboxes delivered direct to your party venue - one less thing to worry about!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For decorations, show packages with theme images gallery
                  const isDecorations = category === 'decorations' || serviceType === 'decorations'
                  if (isDecorations) {
                    const packages = displaySupplier?.packages || []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}

                    // Collect unique theme images from all packages
                    const getThemeImagesGallery = () => {
                      const themeImages = {}
                      packages.forEach(pkg => {
                        if (pkg.themeImages) {
                          Object.entries(pkg.themeImages).forEach(([theme, url]) => {
                            if (!themeImages[theme]) {
                              themeImages[theme] = url
                            }
                          })
                        }
                      })
                      return themeImages
                    }

                    const themeImagesGallery = getThemeImagesGallery()
                    const themeNames = {
                      pirate: 'Pirate',
                      princess: 'Princess',
                      superhero: 'Superhero',
                      dinosaur: 'Dinosaur',
                      unicorn: 'Unicorn',
                      safari: 'Safari',
                      space: 'Space',
                      mermaid: 'Mermaid',
                      science: 'Science',
                      frozen: 'Frozen',
                      'paw-patrol': 'Paw Patrol',
                      football: 'Football'
                    }

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Decorations
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Theme Gallery */}
                        {Object.keys(themeImagesGallery).length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Available Themes
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Our tableware and decorations are available in these popular themes</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                              {Object.entries(themeImagesGallery).map(([theme, imageUrl]) => (
                                <div key={theme} className="relative aspect-square rounded-xl overflow-hidden group">
                                  <Image
                                    src={imageUrl}
                                    alt={`${themeNames[theme] || theme} theme`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <span className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold text-center truncate">
                                    {themeNames[theme] || theme.charAt(0).toUpperCase() + theme.slice(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Packages */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Packages
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Priced per set - we round up to pack sizes to ensure you have enough</p>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {packages.map((pkg, index) => {
                                const guestCount = partyDetails?.guestCount || 10
                                const packSizes = pkg.packSizes || [8, 16, 24, 32, 40, 48]
                                // Find smallest pack size that covers guest count
                                const packSize = packSizes.find(size => size >= guestCount) || packSizes[packSizes.length - 1]
                                const totalPrice = (pkg.price * packSize).toFixed(2)
                                return (
                                <div key={index} className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                    <div className="text-right">
                                      <span className="font-black text-2xl text-[hsl(var(--primary-500))]">£{totalPrice}</span>
                                      <p className="text-xs text-gray-500">£{pkg.price}/set × {packSize} sets</p>
                                    </div>
                                  </div>
                                  {pkg.description && (
                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                  )}
                                  {pkg.features && pkg.features.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {pkg.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                          <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {/* Book button */}
                                  {(onBookPackage || onCustomize) && (
                                    <button
                                      onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                      disabled={bookingPackageId === (pkg.id || pkg.name)}
                                      className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                        bookingPackageId === (pkg.id || pkg.name)
                                          ? 'opacity-70 cursor-not-allowed'
                                          : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                      }`}
                                    >
                                      {bookingPackageId === (pkg.id || pkg.name) ? (
                                        <span className="flex items-center justify-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                      ) : 'Book'}
                                    </button>
                                  )}
                                </div>
                              )})}
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Delivery */}
                            <div>
                              <span className="font-semibold text-gray-900">Delivery: </span>
                              <span>{serviceDetails?.delivery || 'Delivered to your home the evening before your party (5-8pm)'}</span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="font-semibold text-gray-900">Lead time: </span>
                              <span>{serviceDetails?.leadTime ? `${serviceDetails.leadTime} days notice required` : '5 days notice required'}</span>
                            </div>

                            {/* Pack sizes */}
                            <div>
                              <span className="font-semibold text-gray-900">Pack sizes: </span>
                              <span>Tableware comes in packs of 8 - we'll round up your guest count to ensure you have enough</span>
                            </div>

                            {/* Eco-friendly */}
                            {serviceDetails?.ecoOptions && (
                              <div>
                                <span className="font-semibold text-gray-900">Eco-friendly: </span>
                                <span>{serviceDetails.ecoOptions}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delivery Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🚚</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Free Delivery Included</h4>
                              <p className="text-base text-gray-700 mt-1">
                                All decorations and tableware delivered to your door the evening before your party - no need to pick anything up!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For balloons, show packages and delivery info
                  if (isBalloons) {
                    const packages = displaySupplier?.packages || []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || ''
                    const deliveryInfo = displaySupplier?.serviceDetails?.deliveryInfo || ''

                    return (
                      <div className="space-y-6">
                        {/* About */}
                        {aboutUs && (
                          <div className="prose prose-sm sm:prose max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              About Our Balloons
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                              {aboutUs}
                            </p>
                          </div>
                        )}

                        {/* Packages */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Packages
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {packages.map((pkg, index) => (
                                <div key={index} className="p-5 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                    <span className="font-black text-2xl text-[hsl(var(--primary-500))]">£{pkg.price}</span>
                                  </div>
                                  {pkg.description && (
                                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                                  )}
                                  {pkg.features && pkg.features.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {pkg.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                          <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {/* Book button */}
                                  {(onBookPackage || onCustomize) && (
                                    <button
                                      onClick={() => onBookPackage ? onBookPackage(pkg) : onCustomize()}
                                      disabled={bookingPackageId === (pkg.id || pkg.name)}
                                      className={`mt-3 w-full py-2 px-4 text-white font-semibold rounded-xl transition-all text-sm bg-[hsl(var(--primary-500))] ${
                                        bookingPackageId === (pkg.id || pkg.name)
                                          ? 'opacity-70 cursor-not-allowed'
                                          : 'hover:bg-[hsl(var(--primary-600))] hover:scale-[1.02] active:scale-95'
                                      }`}
                                    >
                                      {bookingPackageId === (pkg.id || pkg.name) ? (
                                        <span className="flex items-center justify-center gap-1">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                      ) : 'Book'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Delivery */}
                            <div>
                              <span className="font-semibold text-gray-900">Delivery: </span>
                              <span>{deliveryInfo || 'Balloons delivered to your home address on the morning of your party'}</span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="font-semibold text-gray-900">Lead time: </span>
                              <span>{displaySupplier?.serviceDetails?.leadTime ? `${displaySupplier.serviceDetails.leadTime} days notice required` : '7 days notice required'}</span>
                            </div>

                            {/* Customisation */}
                            <div>
                              <span className="font-semibold text-gray-900">Customisation: </span>
                              <span>Colours can be matched to your party theme - just let us know when booking</span>
                            </div>

                            {/* Duration */}
                            <div>
                              <span className="font-semibold text-gray-900">How long they last: </span>
                              <span>Helium balloons stay inflated for 12-24 hours - perfect for your party day</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info Card */}
                        <div className="p-4 bg-primary-50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">🎈</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">Home Delivery</h4>
                              <p className="text-base text-gray-700 mt-1">
                                Balloons are delivered to your home address ready for you to take to your party venue.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For cakes, show flavours/dietary/sizes and delivery options
                  if (isCake) {
                    const cakeFlavours = displaySupplier?.flavours || displaySupplier?.serviceDetails?.flavours || []
                    const cakeDietary = displaySupplier?.dietaryInfo || displaySupplier?.serviceDetails?.dietaryInfo || []
                    const packages = displaySupplier?.packages || []
                    const fulfilment = displaySupplier?.serviceDetails?.fulfilment || {}
                    const offersDelivery = fulfilment.offersDelivery !== false
                    const offersCollection = fulfilment.offersCollection !== false
                    const deliveryFee = fulfilment.deliveryFee || 0
                    // Build collection address from available location data
                    const locationData = displaySupplier?.location
                    const locationString = typeof locationData === 'string' ? locationData :
                                           locationData?.address || locationData?.postcode || ''
                    const collectionAddress = displaySupplier?.serviceDetails?.businessAddress ||
                                              displaySupplier?.businessAddress ||
                                              displaySupplier?.address ||
                                              locationString ||
                                              displaySupplier?.postcode || ''

                    // Dietary label helper
                    const DIETARY_LABELS = {
                      'vegetarian': 'Vegetarian',
                      'vegan': 'Vegan',
                      'gluten-free': 'Gluten Free',
                      'dairy-free': 'Dairy Free',
                      'nut-free': 'Nut Free',
                      'egg-free': 'Egg Free',
                      'halal': 'Halal',
                    }

                    return (
                      <div className="space-y-6">
                        {/* Available Flavours */}
                        {cakeFlavours.length > 0 && (
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-3">Available Flavours</h3>
                            <div className="flex flex-wrap gap-2">
                              {cakeFlavours.map((flavour, index) => (
                                <span key={index} className="px-4 py-2 bg-[hsl(var(--primary-50))] text-[hsl(var(--primary-700))] rounded-full text-base">
                                  {flavour}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dietary Options */}
                        {cakeDietary.length > 0 && (
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-3">Dietary Options Available</h3>
                            <div className="flex flex-wrap gap-2">
                              {cakeDietary.map((dietary, index) => (
                                <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base">
                                  {DIETARY_LABELS[dietary] || dietary}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sizes & Pricing */}
                        {packages.length > 0 && (
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                              Sizes & Pricing
                              <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {packages.map((pkg, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-lg text-gray-900">{pkg.name}</span>
                                    <span className="font-black text-xl text-[hsl(var(--primary-500))]">£{pkg.price}</span>
                                  </div>
                                  {(pkg.serves || pkg.feeds) && (
                                    <p className="text-base text-gray-600 mt-2">Feeds {pkg.serves || pkg.feeds} people</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery & Collection Options */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            Delivery & Collection
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>
                          <div className="space-y-4">
                            {offersDelivery && (
                              <div className="p-4 bg-primary-50 rounded-xl">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">🚚</span>
                                  <div>
                                    <h4 className="font-bold text-lg text-gray-900">Delivery Available</h4>
                                    <p className="text-base text-gray-700 mt-1">
                                      Your cake will be delivered on the Friday before your party weekend to ensure freshness.
                                    </p>
                                    {deliveryFee > 0 && (
                                      <p className="text-base font-semibold text-[hsl(var(--primary-500))] mt-2">
                                        Delivery fee: £{deliveryFee}
                                      </p>
                                    )}
                                    {deliveryFee === 0 && (
                                      <p className="text-base font-semibold text-[hsl(var(--primary-600))] mt-2">
                                        Free delivery
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {offersCollection && (
                              <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">📍</span>
                                  <div>
                                    <h4 className="font-bold text-lg text-gray-900">Collection Available</h4>
                                    <p className="text-base text-gray-700 mt-1">
                                      Collect your cake from our location on the Friday before your party.
                                    </p>
                                    <p className="text-base text-gray-600 mt-2">
                                      <span className="font-medium">Location:</span> {collectionAddress || 'Address provided after booking'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* What You Need to Know */}
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          <div className="space-y-4 text-base text-gray-700">
                            {/* Delivery timing */}
                            <div>
                              <span className="font-semibold text-gray-900">When you'll get it: </span>
                              <span>Cakes are delivered/ready for collection on the Friday before your party weekend</span>
                            </div>

                            {/* Lead Time */}
                            <div>
                              <span className="font-semibold text-gray-900">Lead time: </span>
                              <span>{displaySupplier?.serviceDetails?.leadTime ? `${displaySupplier.serviceDetails.leadTime} days notice required` : '7-14 days notice required for custom cakes'}</span>
                            </div>

                            {/* Storage tip */}
                            <div>
                              <span className="font-semibold text-gray-900">Storage: </span>
                              <span>Keep in a cool place (not the fridge!) until party time for best results</span>
                            </div>

                            {/* Customisation */}
                            <div>
                              <span className="font-semibold text-gray-900">Customisation: </span>
                              <span>Name, age, and theme can be added - just let us know when booking!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // For non-cakes, show package features as before
                  const packageData = displaySupplier?.packageData ||
                                     displaySupplier?.selectedPackage ||
                                     displaySupplier?.packages?.[0]

                  let packageFeatures = []

                  if (packageData?.features && Array.isArray(packageData.features)) {
                    packageFeatures = packageData.features
                  } else if (packageData?.description && typeof packageData.description === 'string') {
                    packageFeatures = packageData.description.split('\n').filter(f => f.trim())
                  } else if (packageData?.included && Array.isArray(packageData.included)) {
                    packageFeatures = packageData.included
                  }

                  if (packageFeatures.length === 0 && !packageData) return null

                  const backgroundImage = displaySupplier?.coverPhoto;

                  return (
                    <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8">
                      {backgroundImage && (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${backgroundImage})`
                          }}
                        />
                      )}

                      <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                          What's Included
                          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                        </h2>

                        {packageFeatures.length > 0 ? (
                          <ul className="space-y-2">
                            {packageFeatures.map((feature, index) => (
                              <li key={index} className="flex items-start gap-3 text-base text-gray-700">
                                <span className="text-[hsl(var(--primary-500))] mt-1">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Package details will be shown after you customize this supplier.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Service Details Router */}
                <ServiceDetailsDisplayRouter
                  supplier={displaySupplier}
                  isPreview={false}
                  themeAccentColor={themeAccentColor}
                />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ COMPACT: Sticky Footer - Less padding on mobile */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2 sm:p-3 flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-semibold text-sm py-3"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Fullscreen Image Lightbox */}
      {showLightbox && supplierImages.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Image counter */}
          {supplierImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {lightboxIndex + 1} / {supplierImages.length}
            </div>
          )}

          {/* Previous button */}
          {supplierImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev === 0 ? supplierImages.length - 1 : prev - 1))
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-16 sm:mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={supplierImages[lightboxIndex] || '/placeholder.png'}
              alt={`Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next button */}
          {supplierImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev === supplierImages.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Expanded Package Image Modal */}
      {expandedPackageImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setExpandedPackageImage(null)}
        >
          <button
            onClick={() => setExpandedPackageImage(null)}
            className="absolute top-4 right-4 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4">
            <Image
              src={expandedPackageImage}
              alt="Expanded view"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}