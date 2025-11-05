// MyPartyTabContent.jsx - Complete booking journey in My Party tab
"use client"

import React, { useState } from "react"
import { X, Eye, CheckCircle, Sparkles, Wand2, Info, Calendar, Clock, MapPin, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useRouter } from "next/navigation"
import MissingSuppliersSuggestions from "@/components/MissingSuppliersSuggestions"
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"

export default function MyPartyTabContent({
  suppliers = {},
  enquiries = [],
  addons = [],
  partyDetails = {},
  onRemoveSupplier,
  onViewDetails,
  onAddSupplier,
  recommendedSuppliers = {},
  getSupplierDisplayPricing,
  onImHappy,
  onCustomizationComplete, // ✅ NEW PROP
  onBrowseVenues, // ✅ NEW PROP for venue browsing
  onEditPartyDetails, // ✅ NEW PROP for editing party details
  onPhotoUpload, // ✅ NEW PROP for photo upload
  childPhoto, // ✅ NEW PROP for child photo
  uploadingPhoto, // ✅ NEW PROP for upload state
}) {
  const router = useRouter()
  const [showMissingSuggestions, setShowMissingSuggestions] = useState(true)
  const [selectedSupplierForQuickView, setSelectedSupplierForQuickView] = useState(null)
  const [selectedSupplierForCustomize, setSelectedSupplierForCustomize] = useState(null)
  const [showPlanInfo, setShowPlanInfo] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Photo upload handler
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !onPhotoUpload) return
    await onPhotoUpload(file)
  }

  const getTypeConfig = (supplierType) => {
    const configs = {
      venue: { color: "bg-blue-500", icon: "🏛️" },
      entertainment: { color: "bg-purple-500", icon: "🎭" },
      catering: { color: "bg-orange-500", icon: "🍽️" },
      cakes: { color: "bg-pink-500", icon: "🎂" },
      facePainting: { color: "bg-green-500", icon: "🎨" },
      activities: { color: "bg-yellow-500", icon: "🎪" },
      decorations: { color: "bg-indigo-500", icon: "🎈" },
      balloons: { color: "bg-cyan-500", icon: "🎈" },
      partyBags: { color: "bg-red-500", icon: "🎁" }
    }
    return configs[supplierType] || { color: "bg-gray-500", icon: "📦" }
  }

  const handleImHappy = async () => {
    // Show loading state
    setIsProcessing(true)

    // Small delay to show the loading animation
    await new Promise(resolve => setTimeout(resolve, 500))

    // Call onImHappy if provided (for custom handlers)
    if (onImHappy) {
      onImHappy()
    } else {
      // Default behavior: navigate to review-book
      router.push('/review-book')
    }

    // Reset loading state after navigation
    setTimeout(() => {
      setIsProcessing(false)
    }, 100)
  }

  // Fetch full supplier data for customization
  const fetchFullSupplierData = async (supplier) => {
    if (!supplier?.id) return

    try {
      console.log('🔍 [MyPartyTab] Fetching supplier data for:', supplier.name)
      console.log('🔍 [MyPartyTab] Current supplier prop:', supplier)

      const { suppliersAPI } = await import('@/utils/mockBackend')
      const fullSupplier = await suppliersAPI.getSupplierById(supplier.id)

      // ✅ CRITICAL FIX: Merge the stored customization data with fetched supplier
      const mergedSupplier = {
        ...fullSupplier,
        // Preserve customization data from localStorage/database
        packageId: supplier.packageId,
        packageData: supplier.packageData,
        partyBagsQuantity: supplier.partyBagsQuantity,
        partyBagsMetadata: supplier.partyBagsMetadata,
        selectedAddons: supplier.selectedAddons,
        pricePerBag: supplier.pricePerBag,
      }

      console.log('📦 [MyPartyTab] Merged supplier data:', {
        name: mergedSupplier.name,
        packageId: mergedSupplier.packageId,
        packageDataId: mergedSupplier.packageData?.id,
        hasPackageData: !!mergedSupplier.packageData,
      })

      setSelectedSupplierForCustomize(mergedSupplier)
    } catch (error) {
      console.error('❌ Error fetching supplier data:', error)
      setSelectedSupplierForCustomize(supplier)
    }
  }

  // Get all suppliers (both paid and unpaid)
  const allSuppliers = Object.entries(suppliers).filter(([type, supplier]) =>
    supplier && type !== "einvites"
  )

  const fullChildName = partyDetails?.childName || partyDetails?.child_name || 'your child'
  const childFirstName = fullChildName.split(' ')[0]

  // Group suppliers by category
  const getCategoryName = (type) => {
    const categoryNames = {
      venue: 'The Place',
      entertainment: 'The Entertainment',
      catering: 'The Food',
      cakes: 'The Cake',
      facePainting: 'Face Painting',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'The Decorations',
      balloons: 'Balloons',
      photography: 'Photography',
      bouncyCastle: 'Bouncy Castle'
    }
    return categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getCategoryIcon = (type) => {
    const categoryIcons = {
      venue: '/journey-icons/location.png',
      entertainment: '/category-icons/entertainment.png',
      cakes: '/category-icons/cake.png',
      partyBags: '/category-icons/party-bags.png',
      catering: '/category-icons/catering.png',
      decorations: '/category-icons/decorations.png',
      facePainting: '/category-icons/face-painting.png',
      activities: '/category-icons/activities.png',
      balloons: '/category-icons/balloons.png',
      photography: '/category-icons/photography.png',
      bouncyCastle: '/category-icons/bouncy-castle.png'
    }
    return categoryIcons[type] || null
  }

  const getCategoryTagline = (type) => {
    const theme = partyDetails?.theme?.toLowerCase() || 'party'

    const themeTaglines = {
      dinosaur: {
        venue: 'Where the prehistoric adventure begins',
        entertainment: 'Roar-some fun for little explorers',
        catering: 'Dino-mite food for hungry adventurers',
        cakes: 'A roar-some centerpiece',
        facePainting: 'Transform into a fearsome dinosaur',
        activities: 'Jurassic games and dino discoveries',
        partyBags: 'Prehistoric treats to take home',
        decorations: 'Journey back to the Jurassic',
        balloons: 'Dino eggs and prehistoric colors',
        photography: 'Capture prehistoric memories',
        bouncyCastle: 'Bounce with the dinosaurs'
      },
      princess: {
        venue: 'A royal palace for the celebration',
        entertainment: 'Enchanting magic for little royals',
        catering: 'A feast fit for a princess',
        cakes: 'A magical royal masterpiece',
        facePainting: 'Become a beautiful princess',
        activities: 'Enchanting games for little royalty',
        partyBags: 'Royal treasures for each guest',
        decorations: 'Transform into an enchanted castle',
        balloons: 'Sparkles and princess colors',
        photography: 'Capture royal memories',
        bouncyCastle: 'Bounce in the royal court'
      },
      superhero: {
        venue: 'The hero headquarters awaits',
        entertainment: 'Super-powered fun for heroes',
        catering: 'Power-up food for little heroes',
        cakes: 'A super-powered showstopper',
        facePainting: 'Become your favorite superhero',
        activities: 'Hero training and super missions',
        partyBags: 'Super supplies for every hero',
        decorations: 'Create an epic hero hideout',
        balloons: 'Bold colors for brave heroes',
        photography: 'Capture heroic action shots',
        bouncyCastle: 'Bounce like a superhero'
      },
      unicorn: {
        venue: 'A magical realm for unicorns',
        entertainment: 'Magical fun for believers',
        catering: 'Rainbow treats and magical delights',
        cakes: 'A magical unicorn masterpiece',
        facePainting: 'Transform into a magical unicorn',
        activities: 'Enchanted games and unicorn quests',
        partyBags: 'Magical treasures to take home',
        decorations: 'Create a rainbow wonderland',
        balloons: 'Pastel magic and rainbow colors',
        photography: 'Capture magical unicorn moments',
        bouncyCastle: 'Bounce through the rainbow'
      },
      space: {
        venue: 'Launch pad for cosmic adventures',
        entertainment: 'Out-of-this-world entertainment',
        catering: 'Astronaut fuel for space explorers',
        cakes: 'A stellar cosmic creation',
        facePainting: 'Become a space explorer',
        activities: 'Galactic missions and star games',
        partyBags: 'Space treasures for young astronauts',
        decorations: 'Transform into outer space',
        balloons: 'Planets and cosmic colors',
        photography: 'Capture cosmic adventures',
        bouncyCastle: 'Bounce to the moon'
      },
      pirate: {
        venue: 'Set sail for adventure',
        entertainment: 'Swashbuckling fun for buccaneers',
        catering: 'Pirate feast for hungry crew',
        cakes: 'A treasure-worthy masterpiece',
        facePainting: 'Become a fearsome pirate',
        activities: 'Treasure hunts and pirate games',
        partyBags: 'Booty for every buccaneer',
        decorations: 'Transform into a pirate ship',
        balloons: 'Treasure chest colors',
        photography: 'Capture pirate adventures',
        bouncyCastle: 'Bounce on the high seas'
      },
      jungle: {
        venue: 'A wild jungle adventure awaits',
        entertainment: 'Wild fun for jungle explorers',
        catering: 'Jungle feast for wild adventurers',
        cakes: 'A wild jungle masterpiece',
        facePainting: 'Transform into jungle animals',
        activities: 'Safari games and jungle expeditions',
        partyBags: 'Jungle treasures to discover',
        decorations: 'Create a tropical jungle',
        balloons: 'Lush jungle greens and wildlife',
        photography: 'Capture wild safari moments',
        bouncyCastle: 'Bounce through the jungle'
      },
      mermaid: {
        venue: 'Dive into an underwater palace',
        entertainment: 'Magical fun under the sea',
        catering: 'Ocean treasures and sea delights',
        cakes: 'A magical underwater creation',
        facePainting: 'Become a beautiful mermaid',
        activities: 'Ocean adventures and pearl hunts',
        partyBags: 'Sea treasures for every mermaid',
        decorations: 'Transform into an ocean paradise',
        balloons: 'Ocean blues and shimmering scales',
        photography: 'Capture underwater memories',
        bouncyCastle: 'Bounce like ocean waves'
      },
      underwater: {
        venue: 'Explore the ocean depths',
        entertainment: 'Splashing fun for sea explorers',
        catering: 'Sea-inspired treats and delights',
        cakes: 'A stunning ocean masterpiece',
        facePainting: 'Become a sea creature',
        activities: 'Underwater adventures and games',
        partyBags: 'Ocean treasures to take home',
        decorations: 'Create an underwater wonderland',
        balloons: 'Deep sea blues and bubbles',
        photography: 'Capture deep sea adventures',
        bouncyCastle: 'Bounce beneath the waves'
      },
      football: {
        venue: 'The ultimate stadium experience',
        entertainment: 'Championship fun for players',
        catering: 'Match day fuel for champions',
        cakes: 'A winning goal celebration',
        facePainting: 'Team colors and player pride',
        activities: 'Skills training and football games',
        partyBags: 'Championship goodies for players',
        decorations: 'Transform into a football stadium',
        balloons: 'Team colors and victory vibes',
        photography: 'Capture championship moments',
        bouncyCastle: 'Bounce like a champion'
      },
      cars: {
        venue: 'Rev up at the race track',
        entertainment: 'High-speed fun for racers',
        catering: 'Pit stop fuel for champions',
        cakes: 'A turbocharged masterpiece',
        facePainting: 'Racing stripes and checkered flags',
        activities: 'Racing games and speed challenges',
        partyBags: 'Racing goodies for champions',
        decorations: 'Create the ultimate race track',
        balloons: 'Racing colors and checkered flags',
        photography: 'Capture racing action',
        bouncyCastle: 'Bounce to victory lane'
      },
      spiderman: {
        venue: 'Swing into action headquarters',
        entertainment: 'Web-slinging fun for heroes',
        catering: 'Hero fuel for web-slingers',
        cakes: 'A spectacular spider masterpiece',
        facePainting: 'Become the friendly neighborhood hero',
        activities: 'Web-slinging missions and hero training',
        partyBags: 'Spider-gear for every hero',
        decorations: 'Transform into New York City',
        balloons: 'Red, blue, and web-tastic',
        photography: 'Capture spider-tacular moments',
        bouncyCastle: 'Bounce like Spider-Man'
      },
      'taylor-swift': {
        venue: 'The ultimate Swiftie stage',
        entertainment: 'Shake it off with amazing fun',
        catering: 'Treats fit for Swifties',
        cakes: 'A fearless masterpiece',
        facePainting: 'Glitter and Swiftie sparkles',
        activities: 'Sing-along and dance party fun',
        partyBags: 'Era-inspired treats for Swifties',
        decorations: 'Create the Eras Tour experience',
        balloons: 'Sparkles and Swiftie colors',
        photography: 'Capture your era',
        bouncyCastle: 'Bounce to the beat'
      },
      science: {
        venue: 'The ultimate science laboratory',
        entertainment: 'Mind-blowing experiments and fun',
        catering: 'Brain food for young scientists',
        cakes: 'An explosive scientific creation',
        facePainting: 'Transform into a mad scientist',
        activities: 'Experiments and discovery missions',
        partyBags: 'Science kits for young explorers',
        decorations: 'Create a working laboratory',
        balloons: 'Bright colors and bubbling reactions',
        photography: 'Document your experiments',
        bouncyCastle: 'Bounce with physics'
      }
    }

    // Default taglines if theme not found
    const defaultTaglines = {
      venue: 'Where the party happens',
      entertainment: 'Keep them laughing for hours',
      catering: 'Delicious food everyone will love',
      cakes: 'Every party needs a showstopper',
      facePainting: 'Transform into their favorite character',
      activities: 'Fun games and activities',
      partyBags: 'Send them home with a smile',
      decorations: 'Set the perfect party scene',
      balloons: 'Add color and excitement',
      photography: 'Capture all the magical moments',
      bouncyCastle: 'Non-stop bouncing fun'
    }

    const taglines = themeTaglines[theme] || defaultTaglines
    return taglines[type] || ''
  }

  const renderSupplierCard = ([type, supplier]) => {
    const supplierAddons = Array.isArray(addons) ? addons.filter(addon =>
      addon.supplierId === supplier.id ||
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    ) : []

    const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)

    // Calculate base price:
    // 1. For party bags, use total from metadata (per-bag price × quantity)
    //    - First try partyBagsMetadata.totalPrice
    //    - Then try packageData.totalPrice (for party bags)
    //    - Then calculate from packageData: price × partyBagsQuantity
    // 2. For packages, use packageData.price (the selected package price)
    // 3. Otherwise use supplier.price
    let basePrice = 0

    // Check if this is a party bags supplier
    const isPartyBags = supplier.category === 'Party Bags' ||
                        supplier.category?.toLowerCase().includes('party bag')

    if (isPartyBags) {
      // Try different party bags price sources
      basePrice = supplier.partyBagsMetadata?.totalPrice ||
                  supplier.packageData?.totalPrice ||
                  (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                    ? supplier.packageData.price * supplier.packageData.partyBagsQuantity
                    : null)

      // If no metadata exists, use price as-is (it's likely already the total)
      if (!basePrice) {
        basePrice = supplier.price || supplier.priceFrom || 0
      }
    } else {
      // For non-party-bags: use packageData.price if available, otherwise supplier.price
      basePrice = supplier.packageData?.price || (supplier.price || 0)
    }

    const totalPrice = basePrice + addonsCost
    const supplierName = supplier.name || 'Unknown Supplier'
    const typeConfig = getTypeConfig(type)

    const enquiry = enquiries.find((e) => e.supplier_category === type)
    const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true

    return (
      <Card
        key={type}
        id={`supplier-card-${type}`}
        className="overflow-hidden rounded-2xl border-2 transition-all duration-300 relative ring-2 ring-offset-2 hover:scale-[1.02]"
        style={{
          borderColor: 'hsl(var(--primary-200))',
          '--tw-ring-color': 'hsl(var(--primary-300) / 0.5)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Image Section */}
        <div
          className="relative h-64 w-full cursor-pointer group/image"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedSupplierForQuickView(supplier)
          }}
        >
          <Image
            src={supplier.coverPhoto || supplier.image || supplier.imageUrl || '/placeholder.png'}
            alt={supplierName}
            fill
            className="object-cover transition-transform duration-300 group-hover/image:scale-105"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70 transition-opacity group-hover/image:opacity-90" />

          {/* Status Badge and Remove Button */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
            <div>
              {isPaid && (
                <Badge className="bg-green-500 text-white shadow-lg backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </Badge>
              )}
            </div>

            {/* Remove button - smaller */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveSupplier(type)
              }}
              className="w-7 h-7 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all duration-200 shadow-md z-30"
              aria-label="Remove supplier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Supplier info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {supplierName}
              </h3>

              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black drop-shadow-lg">£{totalPrice.toFixed(2)}</span>
                  </div>
                  {supplierAddons.length > 0 && (
                    <div className="text-sm text-white/90 mt-1">
                      Includes {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 bg-white flex flex-col sm:flex-row gap-3">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedSupplierForQuickView(supplier)
            }}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              fetchFullSupplierData(supplier)
            }}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </Card>
    )
  }

  // Calculate total cost
  const totalCost = allSuppliers.reduce((sum, [type, supplier]) => {
    const supplierAddons = Array.isArray(addons) ? addons.filter(addon =>
      addon.supplierId === supplier.id ||
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    ) : []
    const addonsCost = supplierAddons.reduce((addonSum, addon) => addonSum + (addon.price || 0), 0)

    // Calculate base price (same logic as renderSupplierCard)
    let basePrice = 0
    const isPartyBags = supplier.category === 'Party Bags' ||
                        supplier.category?.toLowerCase().includes('party bag')

    if (isPartyBags) {
      basePrice = supplier.partyBagsMetadata?.totalPrice ||
                  supplier.packageData?.totalPrice ||
                  (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                    ? supplier.packageData.price * supplier.packageData.partyBagsQuantity
                    : null)

      // If no metadata exists, use price as-is (it's likely already the total)
      if (!basePrice) {
        basePrice = supplier.price || supplier.priceFrom || 0
      }
    } else {
      basePrice = supplier.packageData?.price || (supplier.price || 0)
    }

    return sum + basePrice + addonsCost
  }, 0)

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    } catch (e) {
      return dateString
    }
  }

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '2pm - 4pm'

    // Handle timeSlot format
    if (partyDetails?.timeSlot) {
      return partyDetails.timeSlot === 'morning' ? '11am - 1pm' : '2pm - 4pm'
    }

    // Handle HH:MM format
    if (timeString.includes(':')) {
      try {
        const [hours] = timeString.split(':')
        const hour = parseInt(hours)
        const endHour = hour + 2
        const formatHour = (h) => h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`
        return `${formatHour(hour)} - ${formatHour(endHour)}`
      } catch (e) {
        return timeString
      }
    }

    return timeString
  }

  // Get full venue address
  const getVenueAddress = () => {
    const venue = suppliers?.venue

    // Get address from serviceDetails.venueAddress (database structure)
    if (venue?.serviceDetails?.venueAddress) {
      const address = venue.serviceDetails.venueAddress
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.postcode
      ].filter(Boolean) // Remove empty values

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    // Try to get full address from venue data.owner (alternative structure)
    if (venue?.data?.owner?.address) {
      const address = venue.data.owner.address
      const parts = [
        address.street,
        address.city,
        address.postcode
      ].filter(Boolean)

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    // Try to get full address from venue owner (direct structure)
    if (venue?.owner?.address) {
      const address = venue.owner.address
      const parts = [
        address.street,
        address.city,
        address.postcode
      ].filter(Boolean)

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    // Fallback to other location sources
    return venue?.location || partyDetails?.location || partyDetails?.postcode || 'Location TBD'
  }

  return (
    <div className="space-y-3">

      {/* Original Header Section */}
      <div>
        <div>
          {/* <div className="flex items-start gap-3 mb-4">
            <h2 className="text-3xl font-black text-gray-900 leading-tight animate-fade-in flex-1">
              Snappy's built the perfect party for {childFirstName}!
            </h2>
            <button
              onClick={() => setShowPlanInfo(!showPlanInfo)}
              className="flex-shrink-0 w-8 h-8 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center transition-colors"
              aria-label="Why this plan?"
            >
              <Info className="w-4 h-4 text-primary-600" />
            </button>
          </div> */}

          {showPlanInfo && (
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Why we chose these suppliers
              </h4>
              <div className="text-sm text-primary-800 space-y-2">
                <p>
                  Based on your party details ({partyDetails?.guestCount || 10} guests, {partyDetails?.theme || 'themed'} party),
                  Snappy has handpicked the best suppliers in your area.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Top-rated suppliers with verified reviews</li>
                  <li>Perfect match for your party size and theme</li>
                  <li>Competitive pricing with instant booking</li>
                  <li>Available on your party date</li>
                </ul>
                <p className="text-xs text-primary-600 mt-3">
                  You can customize or replace any supplier using the tabs above!
                </p>
              </div>
            </div>
          )}

          <div className="mb-4 bg-[#FAFAFA] border border-gray-200 rounded-lg p-3 w-full">
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              💡 <span className="font-semibold">Top tip:</span> You can {' '}
              <span className="inline-block relative font-bold text-gray-900">
                swap
                <span className="absolute -bottom-0.5 left-0 w-full h-1 bg-primary-500 -skew-x-12 opacity-70"></span>
              </span>
              , {' '}
              <span className="inline-block relative font-bold text-gray-900">
                tweak
                <span className="absolute -bottom-0.5 left-0 w-full h-1 bg-primary-500 -skew-x-12 opacity-70"></span>
              </span>
              , or {' '}
              <span className="inline-block relative font-bold text-gray-900">
                add your own touches
                <span className="absolute -bottom-0.5 left-0 w-full h-1 bg-primary-500 -skew-x-12 opacity-70"></span>
              </span>
              {' '} anytime.
            </p>
          </div>
        </div>
      </div>


      {/* All Suppliers Section with Category Headings */}
      {allSuppliers.length > 0 ? (
        <div className="space-y-4">
          {allSuppliers.map(([type, supplier]) => {
            const categoryName = getCategoryName(type)
            const categoryTagline = getCategoryTagline(type)
            const typeConfig = getTypeConfig(type)
            const categoryIcon = getCategoryIcon(type)

            return (
              <div key={type} id={`supplier-card-${type}`}>
                {/* Visual Separator */}
                <div className="border-t-2 border-gray-100 pt-6 mb-4">

                  {/* Category Heading */}
                  <div className="mb-3">
                    <div className="flex items-center gap-3">
                      {categoryIcon && (
                        <img
                          src={categoryIcon}
                          alt={categoryName}
                          className="w-10 h-10 object-contain flex-shrink-0"
                        />
                      )}
                      <h3 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                          {categoryName}
                        <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
                      </h3>
                    </div>


                    {categoryTagline && (
                      <p className="text-sm text-gray-600 mt-2">{categoryTagline}</p>
                    )}
                  </div>
                </div>

                {/* Supplier Card */}
                {renderSupplierCard([type, supplier])}

                {/* Venue Change Option */}
                {type === 'venue' && onBrowseVenues && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={onBrowseVenues}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium underline decoration-dotted underline-offset-2 transition-colors"
                    >
                      Want to change venue? Browse other options
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">No suppliers added yet</p>
          <p className="text-sm text-gray-500">
            Start building your party by adding suppliers in the tabs above!
          </p>
        </div>
      )}

      {/* Visual Separator */}
      {showMissingSuggestions && allSuppliers.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Add More Magic</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Anything Missing Section - Subtle styling */}
      {showMissingSuggestions && allSuppliers.length > 0 && (
        <>
          <div className="bg-gray-50/50 border border-gray-200/60 rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>Anything else you'd like to add?</span>
              </h3>
              <p className="text-sm text-gray-500">
                Here are some suggestions to make your party even better
              </p>
            </div>

            <MissingSuppliersSuggestions
              partyPlan={suppliers}
              partyDetails={partyDetails}
              suppliers={Object.values(recommendedSuppliers).filter(s => s)}
              onAddSupplier={async (supplier, supplierType) => {
                // Call the real add function to actually add the supplier
                // MobileSupplierNavigation.handleAddSupplier expects: (supplier, supplierType, shouldNavigate)
                if (onAddSupplier) {
                  await onAddSupplier(supplier, supplierType, false) // false = don't navigate
                }

                // After confetti animation (2 seconds), scroll to the newly added supplier card
                setTimeout(() => {
                  const cardElement = document.getElementById(`supplier-card-${supplierType}`)
                  if (cardElement) {
                    cardElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center'
                    })
                  }
                }, 2000) // Wait for confetti animation to finish

                // Return true to trigger confetti
                return true
              }}
              addedSupplierIds={new Set()}
              showTitle={false}
              preventNavigation={true}
              horizontalScroll={true}
            />
          </div>

          {/* Party Plan Summary */}
          <div className="mt-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[hsl(var(--primary-500))]" />
              <h3 className="text-lg font-bold text-gray-900">Your Party Plan</h3>
            </div>

            {/* Party Details */}
            <div className="space-y-2 text-sm text-gray-700 mb-4 pb-4 border-b border-gray-200">
              {partyDetails?.childName && (
                <p>
                  <span className="font-semibold">Party for:</span> {partyDetails.childName}
                  {partyDetails.age && `, turning ${partyDetails.age}`}
                </p>
              )}

              {partyDetails?.date && (
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(partyDetails.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  {partyDetails.time && ` at ${partyDetails.time}`}
                </p>
              )}

              {partyDetails?.guestCount && (
                <p>
                  <span className="font-semibold">Guests:</span> {partyDetails.guestCount} children
                </p>
              )}

              {partyDetails?.theme && (
                <p>
                  <span className="font-semibold">Theme:</span>{' '}
                  <span className="capitalize">{partyDetails.theme.replace(/-/g, ' ')}</span>
                </p>
              )}
            </div>

            {/* Suppliers List */}
            {Object.keys(suppliers).filter(type => suppliers[type]).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Selected Suppliers</h4>
                <div className="space-y-2">
                  {Object.entries(suppliers)
                    .filter(([type, supplier]) => supplier)
                    .map(([type, supplier]) => {
                      const displayPrice = supplier.packageData?.price || supplier.price || 0
                      return (
                        <div key={type} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{supplier.name}</span>
                          <span className="font-semibold text-gray-900">£{displayPrice}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Addons List */}
            {addons && addons.length > 0 && (
              <div className="mb-4 pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Add-ons</h4>
                <div className="space-y-2">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{addon.name}</span>
                      <span className="font-semibold text-gray-900">£{addon.price || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            {(() => {
              const supplierTotal = Object.values(suppliers)
                .filter(s => s)
                .reduce((sum, s) => sum + (s.packageData?.price || s.price || 0), 0)
              const addonTotal = addons?.reduce((sum, a) => sum + (a.price || 0), 0) || 0
              const totalCost = supplierTotal + addonTotal

              return totalCost > 0 ? (
                <div className="pt-4 border-t-2 border-gray-300 flex items-center justify-between">
                  <span className="font-bold text-base text-gray-900">Total</span>
                  <span className="font-bold text-2xl text-[hsl(var(--primary-600))]">
                    £{totalCost.toFixed(2)}
                  </span>
                </div>
              ) : null
            })()}
          </div>

          {/* Complete Booking CTA - Single click to start booking */}
          <div className="mt-4">
            <Button
              onClick={handleImHappy}
              disabled={isProcessing}
              className="w-full text-white py-7 text-lg font-bold shadow-2xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-90 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary-500)) 0%, hsl(var(--primary-600)) 100%)',
                boxShadow: '0 10px 40px -10px hsl(var(--primary-500) / 0.6)'
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <span className="relative flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Complete Booking
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </Button>
            <p className="text-xs text-center text-gray-600 mt-3">
              You'll review your full party plan before any payment
            </p>
          </div>
        </>
      )}

      {/* Quick View Modal */}
      {selectedSupplierForQuickView && (
        <SupplierQuickViewModal
          supplier={selectedSupplierForQuickView}
          isOpen={!!selectedSupplierForQuickView}
          onClose={() => setSelectedSupplierForQuickView(null)}
          isAlreadyAdded={true}
        />
      )}

      {/* Customization Modal */}
      {selectedSupplierForCustomize && (
        <SupplierCustomizationModal
          supplier={selectedSupplierForCustomize}
          partyDetails={partyDetails}
          isOpen={!!selectedSupplierForCustomize}
          onClose={() => setSelectedSupplierForCustomize(null)}
          onAddToPlan={async (data) => {
            console.log('🎨 MyPartyTab: Customization completed:', data)

            // Call the handler if provided
            if (onCustomizationComplete) {
              await onCustomizationComplete(data)
            }

            setSelectedSupplierForCustomize(null)
          }}
          isAdding={false}
          currentPhase="planning"
          selectedDate={partyDetails?.date}
          partyDate={partyDetails?.date}
          mobileHeight="max-h-[92vh]"
          desktopHeight="md:h-[95vh]"
        />
      )}
    </div>
  )
}
