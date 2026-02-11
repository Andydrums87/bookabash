// components/SupplierQuickViewModal.jsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Maximize2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import useEmblaCarousel from "embla-carousel-react"

// Import the swipeable carousel
import SwipeableSupplierCarousel from '@/components/supplier/SwipableSupplierCarousel'

// Import service display components
import ServiceDetailsDisplayRouter from '@/components/supplier/display/ServiceDetailsDisplayRouter'
import SupplierNote from '@/components/SupplierNote'

export default function SupplierQuickViewModal({
  supplier,
  isOpen,
  onClose,
  onCustomize, // Callback to open customization modal
  onBookPackage, // NEW: Callback to directly book a package (bypasses customization)
  bookingPackageId, // NEW: ID of package currently being booked (for loading state)
  partyDetails,
  type,
  onSaveVenueAddons, // NEW: Callback to save selected venue add-ons
  isAlreadyAdded = false // NEW: Whether this supplier is already in the party plan
}) {
  const [fullSupplier, setFullSupplier] = useState(null)
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showAllergens, setShowAllergens] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [openAccordion, setOpenAccordion] = useState(null) // Track which accordion section is open
  const [expandedPackageImage, setExpandedPackageImage] = useState(null) // NEW: For expanded package images
  const scrollPositionRef = useRef(0) // Store scroll position in ref to avoid stale closure

  // Embla Carousel for mobile swipe support
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  // Venue add-on selection state
  const [selectedVenueAddons, setSelectedVenueAddons] = useState([])

  // Check if this is a venue
  const isVenue = type === 'venue' ||
    supplier?.category?.toLowerCase() === 'venue' ||
    supplier?.category?.toLowerCase() === 'venues'

  // Handler for toggling venue add-ons
  const handleToggleVenueAddon = (addon) => {
    setSelectedVenueAddons(prev => {
      const addonId = addon.id || addon.name
      const isSelected = prev.some(a => (a.id || a.name) === addonId)
      if (isSelected) {
        return prev.filter(a => (a.id || a.name) !== addonId)
      } else {
        return [...prev, addon]
      }
    })
  }

  // Calculate total add-on price
  const venueAddonTotal = selectedVenueAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)

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

  // Embla carousel callbacks
  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return
    setCarouselIndex(emblaApi.selectedScrollSnap())
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

  // Reset carousel when supplier changes
  useEffect(() => {
    if (emblaApi && supplier?.id) {
      emblaApi.scrollTo(0)
      setCarouselIndex(0)
    }
  }, [supplier?.id, emblaApi])

  const scrollPrev = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollNext()
  }, [emblaApi])

  // Reset venue add-ons when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset selected add-ons when modal opens
      setSelectedVenueAddons([])
    }
  }, [isOpen])

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
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-5xl w-full h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
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
                {/* Unified Carousel for both Mobile and Desktop */}
                <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden">
                  {/* Blurred background fill */}
                  {supplierImages.length > 0 && (
                    <div
                      className="absolute inset-0 scale-110 z-0"
                      style={{
                        backgroundImage: `url(${supplierImages[carouselIndex] || supplierImages[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(20px)',
                      }}
                    />
                  )}
                  {/* Dark overlay for better contrast */}
                  <div className="absolute inset-0 bg-black/20 z-[1]" />

                  {/* Embla Carousel */}
                  <div className="overflow-hidden h-full relative z-[2]" ref={emblaRef}>
                    <div className="flex h-full">
                      {supplierImages.map((img, index) => (
                        <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                          <Image
                            src={img}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  {supplierImages.length > 1 && (
                    <>
                      <button
                        onClick={scrollPrev}
                        className={`
                          absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm rounded-full
                          shadow-lg flex items-center justify-center active:scale-95 hover:bg-white
                          transition-all duration-200 z-20
                          ${carouselIndex > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        `}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
                      </button>
                      <button
                        onClick={scrollNext}
                        className={`
                          absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 bg-white/90 backdrop-blur-sm rounded-full
                          shadow-lg flex items-center justify-center active:scale-95 hover:bg-white
                          transition-all duration-200 z-20
                          ${carouselIndex < supplierImages.length - 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        `}
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Navigation dots */}
                  {supplierImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {supplierImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            emblaApi?.scrollTo(idx)
                          }}
                          className={`
                            w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full transition-all duration-200 hover:scale-110
                            ${idx === carouselIndex
                              ? "bg-white"
                              : "bg-white/50 hover:bg-white/70"
                            }
                          `}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
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
                      <div>
                        <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">
                          About This Cake
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {cakeDescription}
                        </p>
                      </div>
                    )
                  }

                  // For non-cakes/non-venues, show aboutUs as before
                  if (!displaySupplier?.serviceDetails?.aboutUs) return null

                  return (
                    <div>
                      <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">
                        What to Expect
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
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

                  // For entertainers, show accordion-style details
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

                    // Accordion section component for entertainer
                    const EntertainerAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-4">
                        {/* About - Always visible */}
                        <div className="pb-4 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h3>
                          <p className="text-sm text-gray-600">
                            Professional children's entertainer providing fun-filled party entertainment with games, activities, and magical moments that keep kids engaged throughout.
                          </p>
                        </div>

                        {/* Accordion Sections */}
                        {ageGroups.length > 0 && (
                          <EntertainerAccordion id="entertainer-ages" title="Suitable Ages">
                            <p className="text-sm text-gray-600">
                              Perfect for children aged {formatAgeRange(ageGroups)}.
                            </p>
                          </EntertainerAccordion>
                        )}

                        {serviceDetails.performanceSpecs?.spaceRequired && (
                          <EntertainerAccordion id="entertainer-space" title="Space Required">
                            <p className="text-sm text-gray-600">
                              {serviceDetails.performanceSpecs.spaceRequired}
                            </p>
                          </EntertainerAccordion>
                        )}

                        {serviceDetails.travelRadius && (
                          <EntertainerAccordion id="entertainer-coverage" title="Coverage Area">
                            <p className="text-sm text-gray-600">
                              Available for bookings up to {serviceDetails.travelRadius} miles from their location.
                            </p>
                          </EntertainerAccordion>
                        )}

                        <EntertainerAccordion id="entertainer-schedule" title="Party Schedule">
                          <div className="text-sm text-gray-600 space-y-2">
                            <p>• Entertainer arrives 15-30 minutes before to setup</p>
                            <p>• First hour of games and activities</p>
                            <p>• 20 minutes for food and refreshments</p>
                            <p>• Final 40 minutes of more entertainment</p>
                          </div>
                        </EntertainerAccordion>

                        {serviceDetails.personalBio?.personalStory && (
                          <EntertainerAccordion id="entertainer-bio" title="Meet the Entertainer">
                            <div className="text-sm text-gray-600">
                              {serviceDetails.personalBio.yearsExperience && (
                                <p className="mb-2">
                                  <span className="font-semibold">{serviceDetails.personalBio.yearsExperience} years of experience</span> bringing joy to parties.
                                </p>
                              )}
                              <p>{serviceDetails.personalBio.personalStory}</p>
                            </div>
                          </EntertainerAccordion>
                        )}

                        <EntertainerAccordion id="entertainer-equipment" title="What's Included">
                          <p className="text-sm text-gray-600">
                            Our entertainers bring all the equipment needed and keep the kids engaged throughout the party.
                          </p>
                        </EntertainerAccordion>

                        <SupplierNote category="entertainment" className="mt-4" />
                      </div>
                    )
                  }

                  // For face painting - simple white-label description
                  if (isFacePainting) {
                    // Accordion section component for face painting
                    const FacePaintAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        <div className="pb-4">
                          <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            A fully vetted, professional face painter will attend your party with everything needed - paints, brushes, glitter, and a range of designs kids love. They'll tailor designs to match your party theme.
                          </p>
                        </div>

                        {/* What's Included */}
                        <FacePaintAccordion id="fp-included" title="What's Included">
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                              <span>Vetted, professional face painter for your party</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                              <span>All paints, brushes and glitter included</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                              <span>Designs to match your party theme</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                              <span>Child-safe, hypoallergenic paints</span>
                            </li>
                          </ul>
                        </FacePaintAccordion>

                        {/* How It Works */}
                        <FacePaintAccordion id="fp-howworks" title="How It Works">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Your face painter will arrive at your venue ready to set up. They'll work through guests throughout the party, creating designs that match your theme.</p>
                          </div>
                        </FacePaintAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="facePainting" />
                        </div>
                      </div>
                    )
                  }

                  // For party bags, show "What You Need to Know"
                  const isPartyBags = category === 'partybags' || category === 'party bags' || serviceType === 'partybags' || category.includes('party bag')
                  if (isPartyBags) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     []
                    const aboutUs = serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const leadTime = serviceDetails?.leadTime

                    // Accordion section component for party bags
                    const PartyBagAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Packages as cards */}
                        {packages.length > 0 && (
                          <div className="py-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-4">Options & Pricing</h2>
                            <p className="text-xs text-gray-500 mb-3">Price per bag</p>
                            <div className="grid grid-cols-2 gap-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <div className="font-semibold text-gray-900 text-sm">{pkg.name}</div>
                                  <div className="font-semibold text-gray-900 mt-1">£{pkg.price}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Information */}
                        <PartyBagAccordion id="pb-delivery" title="Delivery Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Free delivery included — delivered shortly before your party to ensure everything arrives fresh and ready.</p>
                          </div>
                        </PartyBagAccordion>

                        {/* Lead Time */}
                        <PartyBagAccordion id="pb-leadtime" title="Lead Time">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{leadTime ? `${leadTime} days notice required` : '5 days notice required'}</p>
                          </div>
                        </PartyBagAccordion>

                        {/* Allergens */}
                        <PartyBagAccordion id="pb-allergens" title="Allergens">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Options available on request. Please share any allergy details when booking.</p>
                          </div>
                        </PartyBagAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="partyBags" />
                        </div>
                      </div>
                    )
                  }

                  // For bouncy castle - simple hire for party duration
                  const isBouncyCastle = category === 'bouncycastle' || category === 'bouncy castle' || serviceType === 'bouncycastle' || serviceType === 'bouncy castle' || category.includes('bouncy')
                  if (isBouncyCastle) {
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const serviceDetails = displaySupplier?.serviceDetails || {}

                    // Accordion section component for bouncy castle
                    const BouncyAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Hire Duration */}
                        <BouncyAccordion id="bc-duration" title="Hire Duration">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Included for the full duration of your party.</p>
                          </div>
                        </BouncyAccordion>

                        {/* Space Required */}
                        <BouncyAccordion id="bc-space" title="Space Required">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.spaceRequired || 'Flat outdoor area or large indoor space with high ceiling.'}</p>
                          </div>
                        </BouncyAccordion>

                        {/* Setup & Collection */}
                        <BouncyAccordion id="bc-setup" title="Setup & Collection">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p><span className="font-medium text-gray-900">Setup:</span> We arrive 30-45 minutes before to inflate and secure the castle.</p>
                            <p><span className="font-medium text-gray-900">Collection:</span> We pack away after your party - you don't need to do anything!</p>
                          </div>
                        </BouncyAccordion>

                        {/* Safety */}
                        <BouncyAccordion id="bc-safety" title="Safety Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>All castles are safety-tested and we provide safety mats.</p>
                          </div>
                        </BouncyAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="bouncyCastle" />
                        </div>
                      </div>
                    )
                  }

                  // For activities/soft play, show items with images
                  const isActivities = category === 'activities' || serviceType === 'activities' || category.includes('soft play')
                  if (isActivities) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''

                    // Accordion section component for activities
                    const ActivityAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Equipment as cards */}
                        {packages.length > 0 && (
                          <div className="py-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-4">Equipment & Pricing</h2>
                            <div className="grid grid-cols-2 gap-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <div className="font-semibold text-gray-900 text-sm">{pkg.name}</div>
                                  <div className="font-semibold text-gray-900 mt-1">£{pkg.price}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Age Range */}
                        <ActivityAccordion id="act-age" title="Suitable Ages">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.ageRange || 'Ages 1-6 years'}</p>
                          </div>
                        </ActivityAccordion>

                        {/* Space Required */}
                        <ActivityAccordion id="act-space" title="Space Required">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.spaceRequired || 'Minimum 3m x 3m clear floor area'}</p>
                          </div>
                        </ActivityAccordion>

                        {/* Setup & Collection */}
                        <ActivityAccordion id="act-setup" title="Setup & Collection">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p><span className="font-medium text-gray-900">Delivery:</span> {serviceDetails?.setupTime || 'We deliver and set up 30-60 mins before your party starts'}</p>
                            <p><span className="font-medium text-gray-900">Collection:</span> {serviceDetails?.collectionTime || 'Collected after your party - no need to pack anything away!'}</p>
                          </div>
                        </ActivityAccordion>

                        {/* Safety */}
                        <ActivityAccordion id="act-safety" title="Safety Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>All equipment is cleaned and safety-checked before every hire.</p>
                          </div>
                        </ActivityAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="activities" />
                        </div>
                      </div>
                    )
                  }

                  // For sweet treats, show available items with multi-select options
                  const isSweetTreats = category === 'sweettreats' || category === 'sweet treats' || serviceType === 'sweettreats' || serviceType === 'sweet treats'
                  if (isSweetTreats) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     displaySupplier?.items ||
                                     []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const leadTime = serviceDetails?.leadTime

                    // Accordion section component for sweet treats
                    const SweetAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Treats as cards */}
                        {packages.length > 0 && (
                          <div className="py-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-4">Available Treats</h2>
                            <div className="grid grid-cols-2 gap-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <div className="font-semibold text-gray-900 text-sm">{pkg.name}</div>
                                  <div className="font-semibold text-gray-900 mt-1">£{pkg.price}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Setup & Delivery */}
                        <SweetAccordion id="sweet-setup" title="Setup & Delivery">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.setupTime || 'We arrive 30-60 minutes before your party to set up.'}</p>
                            <p><span className="font-medium text-gray-900">Space needed:</span> {serviceDetails?.spaceRequired || 'One table for the treats station.'}</p>
                          </div>
                        </SweetAccordion>

                        {/* Service Style */}
                        <SweetAccordion id="sweet-service" title="Service Style">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.staffIncluded ? 'Staff member included to serve the treats.' : 'Self-service - we set it up and you help yourselves!'}</p>
                          </div>
                        </SweetAccordion>

                        {/* Lead Time */}
                        <SweetAccordion id="sweet-leadtime" title="Lead Time">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{leadTime || '5 days notice required'}</p>
                          </div>
                        </SweetAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="sweetTreats" />
                        </div>
                      </div>
                    )
                  }

                  // For catering/lunchboxes, show packages with per-child pricing
                  const isCatering = category === 'catering' || serviceType === 'catering' || category.includes('lunchbox')
                  if (isCatering) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    // Check multiple locations for packages (consistent with SupplierCustomizationModal)
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const dietaryOptions = displaySupplier?.dietaryOptions || serviceDetails?.dietaryOptions || []
                    const leadTime = serviceDetails?.leadTime

                    // Accordion section component for catering
                    const CateringAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Lunchbox Options as cards */}
                        {packages.length > 0 && (
                          <div className="py-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-4">Lunchbox Options</h2>
                            <p className="text-xs text-gray-500 mb-3">Price per child</p>
                            <div className="grid grid-cols-2 gap-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <div className="font-semibold text-gray-900 text-sm">{pkg.name}</div>
                                  <div className="font-semibold text-gray-900 mt-1">£{pkg.price}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Information */}
                        <CateringAccordion id="catering-delivery" title="Delivery Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.delivery || 'Lunchboxes delivered chilled to your venue on the morning of your party.'}</p>
                            <p>Free delivery included.</p>
                          </div>
                        </CateringAccordion>

                        {/* Lead Time */}
                        <CateringAccordion id="catering-leadtime" title="Lead Time">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{leadTime ? `${leadTime} days notice required` : '5 days notice required'}</p>
                          </div>
                        </CateringAccordion>

                        {/* Dietary Requirements */}
                        <CateringAccordion id="catering-dietary" title="Dietary Requirements">
                          <div className="space-y-2 text-gray-600 text-sm">
                            {dietaryOptions.length > 0 ? (
                              <>
                                <p>Options available:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {dietaryOptions.map((option, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      {typeof option === 'object' ? option.name : option}
                                    </span>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p>Let us know any allergies or dietary needs when you book and we'll take care of it.</p>
                            )}
                          </div>
                        </CateringAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="catering" />
                        </div>
                      </div>
                    )
                  }

                  // For decorations, show packages with theme images gallery
                  const isDecorations = category === 'decorations' || serviceType === 'decorations'
                  if (isDecorations) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     []
                    const aboutUs = displaySupplier?.serviceDetails?.aboutUs || displaySupplier?.description || ''
                    const leadTime = serviceDetails?.leadTime

                    // Accordion section component for decorations
                    const DecoAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Packages as cards */}
                        {packages.length > 0 && (
                          <div className="py-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-4">Packages & Pricing</h2>
                            <div className="grid grid-cols-2 gap-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <div className="font-semibold text-gray-900 text-sm">{pkg.name}</div>
                                  <div className="font-semibold text-gray-900 mt-1">£{pkg.price}</div>
                                  <div className="text-xs text-gray-500">per set</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Information */}
                        <DecoAccordion id="deco-delivery" title="Delivery Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{serviceDetails?.delivery || 'Delivered to your home address the evening before your party.'}</p>
                            <p>Free delivery included.</p>
                          </div>
                        </DecoAccordion>

                        {/* Pack Sizes */}
                        <DecoAccordion id="deco-packs" title="Pack Sizes">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Tableware comes in packs of 8 - we'll round up your guest count to ensure you have enough.</p>
                          </div>
                        </DecoAccordion>

                        {/* Lead Time */}
                        <DecoAccordion id="deco-leadtime" title="Lead Time">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{leadTime ? `${leadTime} days notice required` : '5 days notice required'}</p>
                          </div>
                        </DecoAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="decorations" />
                        </div>
                      </div>
                    )
                  }

                  // For balloons, show packages and delivery info
                  if (isBalloons) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     []
                    const aboutUs = serviceDetails?.aboutUs || ''
                    const leadTime = serviceDetails?.leadTime

                    // Accordion section component for balloons
                    const BalloonAccordion = ({ id, title, children }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* About - always visible */}
                        {aboutUs && (
                          <div className="pb-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-3">About</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{aboutUs}</p>
                          </div>
                        )}

                        {/* Packages as cards */}
                        {packages.length > 0 && (
                          <div className="py-4">
                            <h2 className="font-semibold text-gray-800 uppercase text-sm tracking-wide mb-4">Packages</h2>
                            <div className="grid grid-cols-2 gap-2">
                              {packages.map((pkg, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <div className="font-semibold text-gray-900 text-sm">{pkg.name}</div>
                                  <div className="font-semibold text-gray-900 mt-1">£{pkg.price}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Information */}
                        <BalloonAccordion id="balloon-delivery" title="Delivery Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Balloons are delivered pre-inflated to your home address shortly before your party, ready to use or take with you to your venue.</p>
                          </div>
                        </BalloonAccordion>

                        {/* Customisation */}
                        <BalloonAccordion id="balloon-customisation" title="Customisation">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Colours and styling are matched to your chosen party theme and age. You can share any preferences during booking.</p>
                          </div>
                        </BalloonAccordion>

                        {/* How Long They Last */}
                        <BalloonAccordion id="balloon-duration" title="How Long They Last">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Helium balloons typically stay inflated for 12–24 hours, making them ideal for party day celebrations.</p>
                          </div>
                        </BalloonAccordion>

                        {/* Lead Time */}
                        <BalloonAccordion id="balloon-leadtime" title="Lead Time">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>{leadTime ? `${leadTime} days notice required` : '7 days notice required'}</p>
                          </div>
                        </BalloonAccordion>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="balloons" />
                        </div>
                      </div>
                    )
                  }

                  // For cakes, show accordion-style collapsible sections
                  if (isCake) {
                    const serviceDetails = displaySupplier?.serviceDetails || {}
                    const cakeFlavours = serviceDetails?.flavours || []
                    // Check multiple locations for packages (consistent with SupplierCustomizationModal)
                    const packages = displaySupplier?.packages ||
                                     displaySupplier?.data?.packages ||
                                     serviceDetails?.packages ||
                                     []
                    const fulfilment = serviceDetails?.fulfilment || {}
                    const offersDelivery = fulfilment.offersDelivery !== false
                    const offersCollection = fulfilment.offersCollection !== false
                    const deliveryFee = fulfilment.deliveryFee || 0
                    const leadTime = displaySupplier?.serviceDetails?.leadTime

                    // Accordion section component
                    const AccordionSection = ({ id, title, children, defaultOpen = false }) => {
                      const isOpen = openAccordion === id
                      return (
                        <div className="border-b border-gray-200">
                          <button
                            type="button"
                            onClick={() => setOpenAccordion(isOpen ? null : id)}
                            className="w-full flex items-center justify-between py-4 text-left"
                          >
                            <span className="font-semibold text-gray-800 uppercase text-sm tracking-wide">{title}</span>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                            {children}
                          </div>
                        </div>
                      )
                    }

                    // Helper to extract just the size from package name (e.g., "6"" from "6" (serves 12-15 | 3 layers)")
                    const extractSize = (name) => {
                      // Match patterns like "6"", "8"", "10"", "2 tier"
                      const sizeMatch = name.match(/^(\d+"|2 tier[^)]*)/i)
                      return sizeMatch ? sizeMatch[1] : name.split('(')[0].trim()
                    }

                    return (
                      <div className="divide-y divide-gray-200">
                        {/* Sizes & Pricing - Collapsible Table */}
                        {packages.length > 0 && (
                          <AccordionSection id="sizes" title="Sizes & Pricing">
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Size</th>
                                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Serves</th>
                                    <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {packages.map((pkg, index) => {
                                    const size = extractSize(pkg.name)
                                    const serves = pkg.serves || pkg.feeds
                                    return (
                                      <tr key={index} className={index !== packages.length - 1 ? "border-b border-gray-200" : ""}>
                                        <td className="py-2.5 px-3 text-gray-900 font-medium">{size}</td>
                                        <td className="py-2.5 px-3 text-gray-600">{serves || '—'}</td>
                                        <td className="py-2.5 px-3 text-gray-900 font-medium text-right">£{pkg.price}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </AccordionSection>
                        )}

                        {/* Flavours accordion */}
                        {cakeFlavours.length > 0 && (
                          <AccordionSection id="flavours" title="Flavours">
                            <p className="text-gray-600 text-sm">{cakeFlavours.join(', ')}</p>
                          </AccordionSection>
                        )}

                        {/* Delivery Information accordion */}
                        {offersDelivery && (
                          <AccordionSection id="delivery" title="Delivery Information">
                            <div className="space-y-2 text-gray-600 text-sm">
                              <p><span className="font-medium text-gray-900">Delivery days:</span> Tuesday – Saturday</p>
                              <p><span className="font-medium text-gray-900">Delivery times:</span> You'll receive an email with a 2-hour delivery window</p>
                              <p><span className="font-medium text-gray-900">Delivery charge:</span> {deliveryFee === 0 ? 'Free' : `From £${deliveryFee}`}</p>
                            </div>
                          </AccordionSection>
                        )}

                        {/* Collection Information accordion */}
                        {offersCollection && (
                          <AccordionSection id="collection" title="Collection Information">
                            <div className="space-y-2 text-gray-600 text-sm">
                              <p>Collection available — address provided after booking confirmation.</p>
                            </div>
                          </AccordionSection>
                        )}

                        {/* Allergens accordion */}
                        <AccordionSection id="allergens" title="Allergens">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p><span className="font-medium text-gray-900">Sponge:</span> Eggs, Milk, Gluten (Wheat)</p>
                            <p><span className="font-medium text-gray-900">Fillings:</span> Milk, Soya, Gluten, Eggs, Nuts</p>
                            <p className="text-xs italic text-gray-400 mt-2">Made in an environment handling gluten, milk, eggs, nuts, soya, peanuts, sesame, sulphites.</p>
                          </div>
                        </AccordionSection>

                        {/* Important Cake Care Guide accordion */}
                        <AccordionSection id="care" title="Important Cake Care Guide">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p>Store in a cool, dry place away from direct sunlight.</p>
                            <p>Keep refrigerated if not serving within 24 hours.</p>
                            <p>Best served at room temperature — remove from fridge 1 hour before serving.</p>
                          </div>
                        </AccordionSection>

                        {/* Lead Time / Ordering accordion */}
                        <AccordionSection id="ordering" title="Ordering Information">
                          <div className="space-y-2 text-gray-600 text-sm">
                            <p><span className="font-medium text-gray-900">Lead time:</span> {leadTime ? `${leadTime} days notice required` : '7–14 days recommended'}</p>
                            <p><span className="font-medium text-gray-900">Customisation:</span> Name, age, and theme can be added when booking</p>
                          </div>
                        </AccordionSection>

                        {/* Disclaimer Note */}
                        <div className="pt-4">
                          <SupplierNote category="cakes" />
                        </div>
                      </div>
                    )
                  }

                  // For non-cakes, show package features as before
                  const packageData = displaySupplier?.packageData ||
                                     displaySupplier?.selectedPackage ||
                                     displaySupplier?.packages?.[0]

                  let packageFeatures = []

                  // For venues, dynamically generate features based on serviceDetails
                  const supplierCategory = displaySupplier?.category?.toLowerCase() || ''
                  const isVenueCategory = supplierCategory === 'venues' || supplierCategory === 'venue'

                  if (isVenueCategory) {
                    const serviceDetails = displaySupplier?.serviceDetails || displaySupplier?.data?.serviceDetails || {}
                    const facilities = serviceDetails.facilities || []
                    const addOnServices = serviceDetails.addOnServices || []
                    const restrictedItems = serviceDetails.restrictedItems || []
                    const cateringPackages = displaySupplier?.cateringPackages || serviceDetails.cateringPackages || []
                    const capacity = serviceDetails.capacity || {}
                    const pricing = serviceDetails.pricing || {}
                    const availability = serviceDetails.availability || {}

                    // Check if kitchen is a facility (included) vs an add-on (not included)
                    const hasKitchenFacility = facilities.some(f =>
                      f.toLowerCase().includes('kitchen')
                    )
                    const hasKitchenAddon = addOnServices.some(a =>
                      a.name?.toLowerCase().includes('kitchen')
                    )

                    if (hasKitchenFacility && !hasKitchenAddon) {
                      packageFeatures.push('Kitchen facilities included')
                    }

                    // Party time, setup, and cleanup as separate items (fixed values)
                    packageFeatures.push('2 hours party time')
                    packageFeatures.push('1 hour setup time included')
                    packageFeatures.push('1 hour cleanup time included')

                    // Tables and chairs
                    const equipment = serviceDetails.equipment || {}
                    if (equipment.tables || equipment.chairs) {
                      packageFeatures.push('Tables and chairs included')
                    }

                    // Catering packages available
                    if (cateringPackages.length > 0) {
                      packageFeatures.push('Great food options available')
                    }

                    // Bouncy castle accepted
                    const bouncyCastleRestricted = restrictedItems.some(item =>
                      item.toLowerCase().includes('bouncy') || item.toLowerCase().includes('inflatable')
                    )
                    if (!bouncyCastleRestricted) {
                      packageFeatures.push('Bouncy castle and soft play accepted')
                    }

                    // Large capacity
                    const maxCapacity = capacity.max || capacity.standing || capacity.seated || 0
                    if (maxCapacity >= 70) {
                      packageFeatures.push('Loads of space for kids to run around')
                    }
                  } else if (packageData?.features && Array.isArray(packageData.features)) {
                    packageFeatures = packageData.features
                  } else if (packageData?.description && typeof packageData.description === 'string') {
                    packageFeatures = packageData.description.split('\n').filter(f => f.trim())
                  } else if (packageData?.included && Array.isArray(packageData.included)) {
                    packageFeatures = packageData.included
                  }

                  if (packageFeatures.length === 0 && !packageData && !isVenueCategory) return null

                  const backgroundImage = displaySupplier?.coverPhoto;

                  return (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        What's Included
                      </h2>

                      {packageFeatures.length > 0 ? (
                        <ul className="space-y-2">
                          {packageFeatures.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-[hsl(var(--primary-500))] mt-0.5">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Package details will be shown after you customize this supplier.
                        </p>
                      )}
                    </div>
                  )
                })()}

                {/* Service Details Router */}
                <ServiceDetailsDisplayRouter
                  supplier={displaySupplier}
                  isPreview={false}
                  themeAccentColor={themeAccentColor}
                  selectedAddons={selectedVenueAddons}
                  onToggleAddon={handleToggleVenueAddon}
                  isInteractive={isVenue && isAlreadyAdded && !!onSaveVenueAddons}
                />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ COMPACT: Sticky Footer - Less padding on mobile */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2 sm:p-3 flex-shrink-0">
          {/* Show save button when venue addons are selected */}
          {isVenue && isAlreadyAdded && onSaveVenueAddons && selectedVenueAddons.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-sm">
                <span className="text-gray-600">{selectedVenueAddons.length} extra{selectedVenueAddons.length !== 1 ? 's' : ''} selected</span>
                <span className="font-bold text-[hsl(var(--primary-600))]">+£{venueAddonTotal}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm py-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSaveVenueAddons(selectedVenueAddons)
                    onClose()
                  }}
                  className="flex-1 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white font-medium text-sm py-3"
                >
                  Save Extras
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-semibold text-sm py-3"
            >
              Close
            </Button>
          )}
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