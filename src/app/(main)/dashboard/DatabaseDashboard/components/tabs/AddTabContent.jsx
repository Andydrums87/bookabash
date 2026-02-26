"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, CheckCircle } from "lucide-react"
import { useSuppliers } from "@/utils/mockBackend"
import { scoreSupplierWithTheme } from "@/utils/partyBuilderBackend"
import { checkSupplierAvailability } from "@/utils/availabilityChecker"
import { calculateFinalPrice } from "@/utils/unifiedPricing"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import { supabase } from "@/lib/supabase"

// Contextual persuasive copy for each supplier type
const SUPPLIER_PITCHES = {
  venue: {
    headline: "Where's the party at?",
    pitch: "Lock in a venue first — it sets the date, time, and vibe for everything else.",
    icon: "🏛️",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/venues-hero.jpg"
  },
  entertainment: {
    headline: "Keep the kids entertained",
    pitch: "From magicians to discos — make it a party they'll never forget.",
    icon: "🎭",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/entertainment-hero.jpg"
  },
  cakes: {
    headline: "No party without cake!",
    pitch: "The showstopper moment. Find your perfect birthday cake.",
    icon: "🎂",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/cakes-hero.jpg"
  },
  partyBags: {
    headline: "Send them home happy",
    pitch: "Party bags are the #1 most-added extra. Kids love them!",
    icon: "🎁",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/partybags-hero.jpg"
  },
  balloons: {
    headline: "Add some pop!",
    pitch: "Balloon arches, bouquets, and more — instant wow factor.",
    icon: "🎈",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/balloons-hero.jpg"
  },
  bouncyCastle: {
    headline: "Let them bounce it out",
    pitch: "Hours of entertainment. Safe, supervised, and seriously fun.",
    icon: "🏰",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/bouncycastle-hero.jpg"
  },
  activities: {
    headline: "Perfect for the little ones",
    pitch: "Soft play keeps toddlers safe and entertained while you relax.",
    icon: "🎪",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/softplay-hero.jpg"
  },
  catering: {
    headline: "Feed the party people",
    pitch: "From finger food to full spreads — let someone else handle it.",
    icon: "🍽️",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/catering-hero.jpg"
  },
  decorations: {
    headline: "Transform your space",
    pitch: "Themed decorations that set the scene for magic.",
    icon: "🎊",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/decorations-hero.jpg"
  },
  sweetTreats: {
    headline: "Add a sweet touch",
    pitch: "Candy carts, ice cream, and treats that make faces light up.",
    icon: "🍭",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/sweettreats-hero.jpg"
  },
  photography: {
    headline: "Capture the memories",
    pitch: "Professional photos you'll treasure forever.",
    icon: "📸",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/photography-hero.jpg"
  },
  facePainting: {
    headline: "Creative fun for everyone",
    pitch: "Watch them transform into their favourite characters.",
    icon: "🎨",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/facepainting-hero.jpg"
  }
}

// Priority order for supplier types
const SUPPLIER_PRIORITY = [
  'venue',
  'entertainment',
  'cakes',
  'partyBags',
  'balloons',
  'bouncyCastle',
  'activities', // soft play
  'catering',
  'decorations',
  'sweetTreats',
  'photography',
  'facePainting'
]

// Map supplier types to categories for matching
const TYPE_TO_CATEGORIES = {
  venue: ["Venues"],
  entertainment: ["Entertainment"],
  cakes: ["Cakes"],
  partyBags: ["Party Bags"],
  balloons: ["Balloons"],
  bouncyCastle: ["Bouncy Castle"],
  activities: ["Activities", "Soft Play"],
  catering: ["Catering"],
  decorations: ["Decorations"],
  sweetTreats: ["Sweet Treats"],
  photography: ["Photography"],
  facePainting: ["Face Painting"]
}

// Category images
const CATEGORY_IMAGES = {
  venue: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1759827489/axdrlu8nswmpbrdgra6c.jpg",
  entertainment: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749460635/edson-junior-YlgnX_ISPLo-unsplash_wlsz60.jpg",
  cakes: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753224729/hpvtz7jiktglaxcivftv.jpg",
  catering: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1760617877/iStock-530205524_tjmnq7.jpg",
  facePainting: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1755590150/howzjwfgpd9swhvcwqke.jpg",
  activities: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768831921/ChatGPT_Image_Jan_19_2026_02_09_57_PM_prlmt0.png",
  partyBags: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386272/iStock-2212524051_v1njlh.jpg",
  decorations: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1760617929/iStock-1463458517_vqltq9.jpg",
  balloons: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754381160/iStock-1564856102_abqkpd.jpg",
  photography: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386547/iStock-1181011006_tf3w8n.jpg",
  bouncyCastle: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386872/iStock-120532646_bdk29o.jpg",
  sweetTreats: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1768859789/ChatGPT_Image_Jan_19_2026_09_56_15_PM_tozjbo.png"
}

const CATEGORY_NAMES = {
  venue: "Venue",
  entertainment: "Entertainment",
  cakes: "Birthday Cake",
  catering: "Catering",
  facePainting: "Face Painting",
  activities: "Soft Play",
  partyBags: "Party Bags",
  decorations: "Decorations",
  balloons: "Balloons",
  photography: "Photography",
  bouncyCastle: "Bouncy Castle",
  sweetTreats: "Sweet Treats"
}

export default function AddTabContent({
  suppliers: currentSuppliers,
  partyDetails,
  onAddSupplier,
  onCustomize,
  onBrowseVenues,
}) {
  const { suppliers: allSuppliers, loading } = useSuppliers()
  const [justAddedTypes, setJustAddedTypes] = useState(new Set())
  const [hiddenTypes, setHiddenTypes] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [modalSupplier, setModalSupplier] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [loadingSupplier, setLoadingSupplier] = useState(null)

  // Get missing supplier types based on what's already in the party
  const getMissingTypes = () => {
    const currentTypes = Object.keys(currentSuppliers || {}).filter(
      key => currentSuppliers[key] !== null &&
             currentSuppliers[key] !== undefined &&
             key !== 'addons' &&
             key !== 'einvites'
    )

    return SUPPLIER_PRIORITY.filter(type => {
      if (hiddenTypes.has(type)) return false
      if (justAddedTypes.has(type)) return true
      return !currentTypes.includes(type)
    })
  }

  // Get recommended supplier for a type
  const getRecommendedSupplier = (type) => {
    if (!allSuppliers || allSuppliers.length === 0) return null

    const categories = TYPE_TO_CATEGORIES[type]
    if (!categories) return null

    const partyTheme = partyDetails?.theme || 'no-theme'

    let matchingSuppliers = allSuppliers.filter(s => categories.includes(s.category))

    // Filter by availability if we have a date
    if (partyDetails?.date) {
      matchingSuppliers = matchingSuppliers.filter(supplier => {
        const check = checkSupplierAvailability(
          supplier,
          partyDetails.date,
          partyDetails.time || partyDetails.startTime,
          partyDetails.duration || 2
        )
        return check.available
      })
    }

    // Sort by theme score and rating
    const sorted = matchingSuppliers
      .map(supplier => ({
        supplier,
        themeScore: scoreSupplierWithTheme(supplier, partyTheme)
      }))
      .sort((a, b) => {
        if (a.themeScore !== b.themeScore) return b.themeScore - a.themeScore
        const aPopular = a.supplier.badges?.includes("Highly Rated") ? 1 : 0
        const bPopular = b.supplier.badges?.includes("Highly Rated") ? 1 : 0
        if (aPopular !== bPopular) return bPopular - aPopular
        const aScore = (a.supplier.rating || 0) * (a.supplier.reviewCount || 0)
        const bScore = (b.supplier.rating || 0) * (b.supplier.reviewCount || 0)
        return bScore - aScore
      })

    return sorted[0]?.supplier || null
  }

  // Fetch full supplier data for modal
  const fetchFullSupplierData = async (supplierId) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single()
      if (error) throw error
      const supplierData = data?.data || {}
      return {
        ...data,
        ...supplierData,
        packages: supplierData.packages || supplierData.pricing?.packages || [],
      }
    } catch (error) {
      console.error('Error fetching supplier data:', error)
      return null
    }
  }

  // Open customization modal
  const handleOpenModal = async (supplier, type) => {
    setLoadingSupplier(type)
    try {
      const fullData = await fetchFullSupplierData(supplier.id)
      setModalSupplier(fullData || supplier)
      setModalType(type)
      setShowModal(true)
    } catch (error) {
      setModalSupplier(supplier)
      setModalType(type)
      setShowModal(true)
    }
    setLoadingSupplier(null)
  }

  // Handle customization complete
  const handleCustomizationComplete = async (customizationData) => {
    const { package: selectedPackage, addons: selectedAddons = [], totalPrice } = customizationData

    const supplierWithCustomization = {
      ...modalSupplier,
      packageData: {
        ...selectedPackage,
        price: selectedPackage?.totalPrice || selectedPackage?.price,
        totalPrice: totalPrice || selectedPackage?.totalPrice,
        selectedAddons: selectedAddons,
      },
      selectedPackage: selectedPackage,
      selectedAddons: selectedAddons,
    }

    setJustAddedTypes(prev => new Set([...prev, modalType]))
    setShowModal(false)

    if (onAddSupplier) {
      const result = await onAddSupplier(supplierWithCustomization, modalType)
      if (result) {
        setTimeout(() => {
          setHiddenTypes(prev => new Set([...prev, modalType]))
          setJustAddedTypes(prev => {
            const newSet = new Set(prev)
            newSet.delete(modalType)
            return newSet
          })
        }, 2000)
      } else {
        setJustAddedTypes(prev => {
          const newSet = new Set(prev)
          newSet.delete(modalType)
          return newSet
        })
      }
    }
  }

  const missingTypes = getMissingTypes()
  const featuredTypes = missingTypes.slice(0, 3)
  const remainingTypes = missingTypes.slice(3)

  if (loading) {
    return (
      <div className="space-y-6 py-6 px-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (missingTypes.length === 0) {
    return (
      <div className="space-y-6 py-6 px-4">
        <div className="px-4">
          <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            Add Suppliers
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
          </h2>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎊</span>
          </div>
          <p className="text-green-800 font-semibold text-lg">You've got everything!</p>
          <p className="text-green-700 mt-2 text-sm">Your party plan is looking complete.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="px-4">
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          Add Suppliers
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">Make your party even more special</p>
      </div>

      {/* Featured Suppliers - 1 per row mobile, 2 per row desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {featuredTypes.map((type) => {
          const pitch = SUPPLIER_PITCHES[type]
          const recommendedSupplier = getRecommendedSupplier(type)
          const isJustAdded = justAddedTypes.has(type)
          const isLoading = loadingSupplier === type

          if (!pitch) return null

          const supplierImage = recommendedSupplier?.coverPhoto || recommendedSupplier?.image || CATEGORY_IMAGES[type]
          const categoryName = CATEGORY_NAMES[type] || type
          const pricing = recommendedSupplier ? calculateFinalPrice(recommendedSupplier, partyDetails, []) : { finalPrice: 0 }

          return (
            <div key={type} className="space-y-3">
              {/* Headline & Pitch - Outside card */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{pitch.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base">{pitch.headline}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{pitch.pitch}</p>
                </div>
              </div>

              {/* Simple Card */}
              {recommendedSupplier ? (
                <div
                  className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    isJustAdded ? 'border-green-400' : 'border-gray-200 hover:border-[hsl(var(--primary-300))]'
                  }`}
                  onClick={() => !isJustAdded && handleOpenModal(recommendedSupplier, type)}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={supplierImage}
                      alt={categoryName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 text-lg">{categoryName}</h4>
                    {pricing.finalPrice > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        from <span className="font-bold text-gray-900">£{pricing.finalPrice}</span>
                      </p>
                    )}

                    {/* Button */}
                    <button
                      className={`w-full mt-3 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isJustAdded
                          ? 'bg-green-500 text-white'
                          : 'bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!isJustAdded) handleOpenModal(recommendedSupplier, type)
                      }}
                      disabled={isLoading || isJustAdded}
                    >
                      {isLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : isJustAdded ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">Not available for your date</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Remaining Suppliers - Same layout */}
      {remainingTypes.length > 0 && (
        <div className="px-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            More to explore
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingTypes.map((type) => {
              const pitch = SUPPLIER_PITCHES[type]
              const recommendedSupplier = getRecommendedSupplier(type)
              const isJustAdded = justAddedTypes.has(type)
              const isLoading = loadingSupplier === type

              if (!pitch || !recommendedSupplier) return null

              const supplierImage = recommendedSupplier?.coverPhoto || recommendedSupplier?.image || CATEGORY_IMAGES[type]
              const categoryName = CATEGORY_NAMES[type] || type
              const pricing = calculateFinalPrice(recommendedSupplier, partyDetails, [])

              return (
                <div key={type} className="space-y-3">
                  {/* Headline & Pitch - Outside card */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{pitch.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">{pitch.headline}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{pitch.pitch}</p>
                    </div>
                  </div>

                  {/* Simple Card */}
                  <div
                    className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      isJustAdded ? 'border-green-400' : 'border-gray-200 hover:border-[hsl(var(--primary-300))]'
                    }`}
                    onClick={() => !isJustAdded && handleOpenModal(recommendedSupplier, type)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={supplierImage}
                        alt={categoryName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 text-lg">{categoryName}</h4>
                      {pricing.finalPrice > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          from <span className="font-bold text-gray-900">£{pricing.finalPrice}</span>
                        </p>
                      )}

                      {/* Button */}
                      <button
                        className={`w-full mt-3 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          isJustAdded
                            ? 'bg-green-500 text-white'
                            : 'bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isJustAdded) handleOpenModal(recommendedSupplier, type)
                        }}
                        disabled={isLoading || isJustAdded}
                      >
                        {isLoading ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : isJustAdded ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Customization Modal */}
      <SupplierCustomizationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        supplier={modalSupplier}
        onAddToPlan={handleCustomizationComplete}
        partyDetails={partyDetails}
        supplierType={modalType}
      />
    </div>
  )
}
