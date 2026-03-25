// components/SupplierBrowserModal.jsx
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { X, ArrowLeft, SlidersHorizontal, ChevronDown, Check, Sparkles, Cake, Gift } from "lucide-react"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import { checkSupplierAvailability } from "@/utils/availabilityChecker"
import SupplierBrowseCard from "@/components/SupplierBrowseCard"
import Image from "next/image"

// Category configuration
const CATEGORY_CONFIG = {
  cakes: {
    supabaseCategory: 'Cakes',
    title: 'Choose a Cake',
    countLabel: 'cakes',
    emptyTitle: 'No cake suppliers available',
    emptyMessage: 'Try adjusting your party date.',
  },
  balloons: {
    supabaseCategory: 'Balloons',
    title: 'Choose Balloons',
    countLabel: 'balloon suppliers',
    emptyTitle: 'No balloon suppliers available',
    emptyMessage: 'Try adjusting your party date.',
  },
  partyBags: {
    supabaseCategory: 'Party Bags',
    title: 'Choose Party Bags',
    countLabel: 'party bag suppliers',
    emptyTitle: 'No party bag suppliers available',
    emptyMessage: 'Try adjusting your party date.',
  },
  decorations: {
    supabaseCategory: 'Decorations',
    title: 'Choose Decorations',
    countLabel: 'decoration suppliers',
    emptyTitle: 'No decoration suppliers available',
    emptyMessage: 'Try adjusting your party date.',
  },
}

// Sort options (no distance since these suppliers aren't location-based)
const SORT_OPTIONS = [
  { value: 'price_low', label: 'Price ↑', fullLabel: 'Price (low to high)' },
  { value: 'price_high', label: 'Price ↓', fullLabel: 'Price (high to low)' },
  { value: 'rating', label: 'Rating', fullLabel: 'Rating' },
]

// Calculate supplier price
const calculateSupplierPrice = (supplier) => {
  if (supplier.price && supplier.price > 0) return supplier.price
  const priceFrom = supplier.priceFrom || supplier.data?.priceFrom || 0
  if (priceFrom > 0) return priceFrom
  const packages = supplier.packages || supplier.data?.packages || []
  if (packages.length > 0) {
    const prices = packages.map(p => p.price || p.priceFrom || 0).filter(p => p > 0)
    if (prices.length > 0) return Math.min(...prices)
  }
  return 0
}

// Custom hook for responsive detection
const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [breakpoint])

  return isMobile
}

// Skeleton component
const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[20/19] rounded-xl bg-gray-200 mb-3" />
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
    </div>
  </div>
)

export default function SupplierBrowserModal({
  isOpen,
  onClose,
  onSelectSupplier,
  partyDetails,
  currentSupplier,
  category = 'cakes',
}) {
  const isMobile = useIsMobile()
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.cakes

  // Core state
  const [selectedForCustomization, setSelectedForCustomization] = useState(null)
  const [allSuppliers, setAllSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Filter state
  const [sortBy, setSortBy] = useState('price_low')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Reset when category changes
  useEffect(() => {
    setAllSuppliers([])
    setHasFetched(false)
    setSortBy('price_low')
  }, [category])

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchSuppliers()
    }
  }, [isOpen, hasFetched])

  const fetchSuppliers = async () => {
    setIsLoading(true)
    try {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()

      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('id, business_name, data')
        .eq('is_active', true)
        .not('data', 'is', null)

      if (error) throw error

      // Transform and filter to target category
      const categorySuppliers = (suppliers || [])
        .map(s => {
          const supplierData = typeof s.data === 'string' ? JSON.parse(s.data) : s.data
          return {
            id: s.id,
            name: supplierData?.name || s.business_name,
            businessName: s.business_name,
            category: supplierData?.category,
            subcategory: supplierData?.subcategory || supplierData?.serviceType,
            location: supplierData?.location,
            coverPhoto: supplierData?.coverPhoto,
            image: supplierData?.image,
            rating: supplierData?.rating,
            reviewCount: supplierData?.reviewCount,
            reviews: supplierData?.reviews,
            googleRating: supplierData?.googleRating,
            googleReviewCount: supplierData?.googleReviewCount,
            serviceDetails: supplierData?.serviceDetails,
            packages: supplierData?.packages,
            priceFrom: supplierData?.priceFrom,
            gallery: supplierData?.gallery,
            photos: supplierData?.photos,
            unavailableDates: supplierData?.unavailableDates,
            busyDates: supplierData?.busyDates,
            workingHours: supplierData?.workingHours,
            advanceBookingDays: supplierData?.advanceBookingDays,
            leadTimeSettings: supplierData?.leadTimeSettings,
            themes: supplierData?.themes,
            ...supplierData
          }
        })
        .filter(s =>
          s.category?.toLowerCase() === config.supabaseCategory.toLowerCase()
        )

      // Filter by availability if party date is set
      const partyDate = partyDetails?.date
      const partyTime = partyDetails?.time || partyDetails?.startTime
      const partyDuration = partyDetails?.duration || 2

      const availableSuppliers = partyDate
        ? categorySuppliers.filter(sup => {
            const check = checkSupplierAvailability(sup, partyDate, partyTime, partyDuration)
            return check.available
          })
        : categorySuppliers

      setAllSuppliers(availableSuppliers)
      setHasFetched(true)
    } catch (error) {
      console.error(`Error fetching ${category} suppliers:`, error)
      setAllSuppliers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Sort function
  const sortedSuppliers = useMemo(() => {
    return [...allSuppliers].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return calculateSupplierPrice(a) - calculateSupplierPrice(b)
        case 'price_high':
          return calculateSupplierPrice(b) - calculateSupplierPrice(a)
        case 'rating': {
          const aReviews = a.reviews || a.data?.reviews || []
          const bReviews = b.reviews || b.data?.reviews || []
          const aAvg = a.rating || (aReviews.length > 0 ? aReviews.reduce((s, r) => s + (r.rating || 0), 0) / aReviews.length : 0)
          const bAvg = b.rating || (bReviews.length > 0 ? bReviews.reduce((s, r) => s + (r.rating || 0), 0) / bReviews.length : 0)
          return bAvg - aAvg
        }
        default:
          return 0
      }
    })
  }, [allSuppliers, sortBy])

  const totalCount = sortedSuppliers.length

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Handlers
  const handleCardClick = useCallback((supplier) => {
    setSelectedForCustomization(supplier)
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white">
        {isMobile ? (
          // MOBILE LAYOUT
          <div className="h-full flex flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>

              <h2 className="text-sm font-semibold text-gray-900">{config.title}</h2>

              <button
                onClick={() => setIsFilterOpen('mobile')}
                className={`
                  p-2 -mr-2 rounded-full transition-colors relative
                  ${sortBy !== 'price_low'
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Panel */}
            {isFilterOpen === 'mobile' && (
              <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsFilterOpen(false)}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Sort by</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setIsFilterOpen(false) }}
                        className={`
                          w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between
                          ${sortBy === option.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}
                        `}
                      >
                        {option.fullLabel}
                        {sortBy === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold"
                    >
                      Show {totalCount} {config.countLabel}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Supplier Grid */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : totalCount === 0 ? (
                <div className="text-center py-20">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{config.emptyTitle}</h3>
                  <p className="text-gray-600">{config.emptyMessage}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {sortedSuppliers.map((sup) => (
                    <SupplierBrowseCard
                      key={sup.id}
                      supplier={sup}
                      isCurrentlySelected={currentSupplier?.id === sup.id}
                      onClick={() => handleCardClick(sup)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // DESKTOP LAYOUT
          <div className="h-full flex flex-col">
            {/* Top navbar */}
            <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2 -ml-3 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Back to dashboard</span>
                </button>
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto,w_400/v1752578876/Transparent_With_Text2_xtq8n5.png"
                  alt="BookABash"
                  width={130}
                  height={28}
                  className="h-auto w-auto"
                />
              </div>
            </div>

            {/* Click outside to close dropdowns */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
            )}

            {/* Main content */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
              <h1 className="text-xl font-semibold text-gray-900 mb-3">
                {totalCount} {config.countLabel} available
              </h1>

              {/* Sort bar */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setIsFilterOpen(isFilterOpen === 'sort' ? false : 'sort')}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap
                      ${sortBy !== 'price_low'
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }
                    `}
                  >
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {isFilterOpen === 'sort' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-30">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setIsFilterOpen(false) }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                        >
                          {option.fullLabel}
                          {sortBy === option.value && <Check className="w-4 h-4 text-teal-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {sortBy !== 'price_low' && (
                  <button
                    onClick={() => setSortBy('price_low')}
                    className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                  {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : totalCount === 0 ? (
                <div className="text-center py-20">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{config.emptyTitle}</h3>
                  <p className="text-gray-600">{config.emptyMessage}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                  {sortedSuppliers.map((sup) => (
                    <SupplierBrowseCard
                      key={sup.id}
                      supplier={sup}
                      isCurrentlySelected={currentSupplier?.id === sup.id}
                      onClick={() => handleCardClick(sup)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {selectedForCustomization && (
        <SupplierCustomizationModal
          isOpen={!!selectedForCustomization}
          onClose={() => setSelectedForCustomization(null)}
          supplier={selectedForCustomization}
          partyDetails={partyDetails}
          partyDate={partyDetails?.date}
          onAddToPlan={(customizationData) => {
            const supplierWithPackageData = {
              ...customizationData.supplier,
              packageData: {
                ...customizationData.package,
                addons: customizationData.addons,
                selectedAddons: customizationData.addons,
                totalPrice: customizationData.totalPrice,
              }
            }
            onSelectSupplier(supplierWithPackageData)
            setSelectedForCustomization(null)
            onClose()
          }}
        />
      )}
    </>
  )
}
