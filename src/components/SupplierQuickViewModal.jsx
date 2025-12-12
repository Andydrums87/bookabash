// components/SupplierQuickViewModal.jsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import the swipeable carousel
import SwipeableSupplierCarousel from '@/components/supplier/SwipableSupplierCarousel'

// Import service display components
import ServiceDetailsDisplayRouter from '@/components/supplier/display/ServiceDetailsDisplayRouter'

export default function SupplierQuickViewModal({
  supplier,
  isOpen,
  onClose
}) {
  const [fullSupplier, setFullSupplier] = useState(null)
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false)

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

  // Disable body scroll when modal is open - Enhanced for mobile
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
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
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-5xl w-full h-[85vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 relative"
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
                {/* ✅ FULL-WIDTH EXCITING IMAGE CAROUSEL - EDGE TO EDGE */}
                <div className="relative">
                  <div className="relative h-72 sm:h-96 md:h-[500px]">
                    <SwipeableSupplierCarousel
                      supplier={displaySupplier}
                      className="h-full"
                      aspectRatio="h-full"
                    />
                    {/* Themed gradient overlay at bottom */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                      style={{
                        background: themeAccentColor
                          ? `linear-gradient(to top, ${themeAccentColor}40, transparent)`
                          : 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)'
                      }}
                    />
                  </div>

                </div>

                {/* Content with padding */}
                <div className="px-4 pt-12 pb-5 sm:px-6 sm:pt-16 sm:pb-6 space-y-6">

                {/* 1. WHAT TO EXPECT - The Story (FIRST) - Hide for cakes since CakeDisplay shows description */}
                {(() => {
                  const category = displaySupplier?.category?.toLowerCase() || ''
                  const isCake = category === 'cakes' || category === 'cake'

                  // For cakes, show description instead of aboutUs
                  if (isCake) {
                    const cakeDescription = displaySupplier?.serviceDetails?.description
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

                  // For non-cakes, show aboutUs as before
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
                  const isCake = category === 'cakes' || category === 'cake'

                  // For cakes, show flavours/dietary/sizes instead of package features
                  if (isCake) {
                    const cakeFlavours = displaySupplier?.flavours || displaySupplier?.serviceDetails?.flavours || []
                    const cakeDietary = displaySupplier?.dietaryInfo || displaySupplier?.serviceDetails?.dietaryInfo || []
                    const packages = displaySupplier?.packages || []

                    // Skip if no cake data
                    if (cakeFlavours.length === 0 && cakeDietary.length === 0 && packages.length === 0) {
                      return null
                    }

                    const backgroundImage = displaySupplier?.coverPhoto

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
                      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8">
                        {backgroundImage && (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${backgroundImage})`
                            }}
                          />
                        )}

                        <div className="relative z-10 space-y-6">
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                            What You Need to Know
                            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                          </h2>

                          {/* Available Flavours */}
                          {cakeFlavours.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Available Flavours</h3>
                              <div className="flex flex-wrap gap-2">
                                {cakeFlavours.map((flavour, index) => (
                                  <span key={index} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                                    {flavour}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dietary Options */}
                          {cakeDietary.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Dietary Options Available</h3>
                              <div className="flex flex-wrap gap-2">
                                {cakeDietary.map((dietary, index) => (
                                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    {DIETARY_LABELS[dietary] || dietary}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sizes & Pricing */}
                          {packages.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Sizes & Pricing</h3>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {packages.map((pkg, index) => (
                                  <div key={index} className="p-3 bg-white/80 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-900">{pkg.name}</span>
                                      <span className="font-bold text-[hsl(var(--primary-500))]">£{pkg.price}</span>
                                    </div>
                                    {(pkg.serves || pkg.feeds) && (
                                      <p className="text-sm text-gray-600 mt-1">Feeds {pkg.serves || pkg.feeds} people</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
    </div>
  )
}