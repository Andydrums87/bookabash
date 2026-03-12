// MyPartyTabContent.jsx - Complete booking journey in My Party tab
"use client"

import React, { useState, useEffect } from "react"
import { X, Eye, CheckCircle, Sparkles, Info, Calendar, Clock, MapPin, Camera, RefreshCw, ShieldCheck, MessageCircle, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useRouter } from "next/navigation"
import MissingSuppliersSuggestions from "@/components/MissingSuppliersSuggestions"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import { UniversalModal, ModalHeader, ModalContent } from "@/components/ui/UniversalModal"
import { roundMoney } from "@/utils/unifiedPricing"
import { trackSupplierViewed } from "@/utils/partyTracking"

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
  onSaveForLater, // ✅ NEW PROP for save party plan
  hasSavedParty = false, // ✅ NEW PROP for saved state
  onShowVenueChoice, // ✅ NEW PROP for venue choice modal (own venue users)
}) {
  const router = useRouter()
  const [showMissingSuggestions, setShowMissingSuggestions] = useState(true)
  const [selectedSupplierForCustomize, setSelectedSupplierForCustomize] = useState(null)
  const [selectedSupplierType, setSelectedSupplierType] = useState(null) // Track supplier type for modal
  const [showPlanInfo, setShowPlanInfo] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [flyerDiscount, setFlyerDiscount] = useState(0)
  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [showHelpButton, setShowHelpButton] = useState(false)

  // Show help button after 25 seconds delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelpButton(true)
    }, 25000) // 25 seconds

    return () => clearTimeout(timer)
  }, [])

  // Check for flyer discount on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFlyerSource = localStorage.getItem('flyer_source') === 'true'
      const flyerDiscountPercent = parseInt(localStorage.getItem('flyer_discount') || '0', 10)
      if (isFlyerSource && flyerDiscountPercent > 0) {
        setFlyerDiscount(flyerDiscountPercent)
      }
    }
  }, [])

  // Social proof notification - show once per session after 5 seconds
  const [showSocialProof, setShowSocialProof] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenSocialProof = sessionStorage.getItem('seen_social_proof')
      if (!hasSeenSocialProof) {
        const showTimer = setTimeout(() => {
          setShowSocialProof(true)
          sessionStorage.setItem('seen_social_proof', 'true')
        }, 5000)

        const hideTimer = setTimeout(() => {
          setShowSocialProof(false)
        }, 10000) // Hide after 10 seconds total (5s delay + 5s visible)

        return () => {
          clearTimeout(showTimer)
          clearTimeout(hideTimer)
        }
      }
    }
  }, [])

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
      partyBags: { color: "bg-red-500", icon: "🎁" },
      sweetTreats: { color: "bg-pink-400", icon: "🍭" }
    }
    return configs[supplierType] || { color: "bg-gray-500", icon: "📦" }
  }

  const handleImHappy = async () => {
    // Show loading state - keep it active until navigation completes
    setIsProcessing(true)

    // Small delay to show the loading animation
    await new Promise(resolve => setTimeout(resolve, 300))

    // Call onImHappy if provided (for custom handlers)
    if (onImHappy) {
      onImHappy()
    } else {
      // Default behavior: navigate to review-book
      router.push('/review-book')
    }

    // Don't reset loading state - let navigation handle it
    // The component will unmount when navigation completes
  }

  // Fetch full supplier data for customization
  const fetchFullSupplierData = async (supplier, supplierType = null) => {
    if (!supplier?.id) return

    // Track that user viewed this supplier
    trackSupplierViewed(supplierType, supplier?.name || supplier?.data?.name, supplier.id)

    try {
      const { suppliersAPI } = await import('@/utils/mockBackend')
      const fullSupplier = await suppliersAPI.getSupplierById(supplier.id)

      // ✅ CRITICAL FIX: Merge the stored customization data with fetched supplier
      // Also ensure category is properly extracted from all possible locations
      const mergedSupplier = {
        ...fullSupplier,
        // Ensure category is preserved from all possible sources (critical for cake detection)
        category: fullSupplier?.category || fullSupplier?.data?.category || supplier.category || supplier.data?.category,
        // Preserve customization data from localStorage/database
        packageId: supplier.packageId,
        packageData: supplier.packageData,
        partyBagsQuantity: supplier.partyBagsQuantity,
        partyBagsMetadata: supplier.partyBagsMetadata,
        // ✅ FIX: Also preserve cateringMetadata for catering suppliers
        cateringMetadata: supplier.cateringMetadata,
        selectedAddons: supplier.selectedAddons,
        pricePerBag: supplier.pricePerBag,
      }

      console.log('🎯 [fetchFullSupplierData] Merged supplier:', {
        name: mergedSupplier.name,
        category: mergedSupplier.category,
        supplierType,
        fullSupplierCategory: fullSupplier?.category,
        fullSupplierDataCategory: fullSupplier?.data?.category,
        originalCategory: supplier.category,
      })

      setSelectedSupplierType(supplierType)
      setSelectedSupplierForCustomize(mergedSupplier)
    } catch (error) {
      console.error('❌ Error fetching supplier data:', error)
      setSelectedSupplierType(supplierType)
      setSelectedSupplierForCustomize(supplier)
    }
  }

  // Get all suppliers (both paid and unpaid)
  // ✅ FIX: Filter out empty suppliers, non-supplier fields, and those without valid IDs
  const nonSupplierFields = ['payment_status', 'estimated_cost', 'deposit_amount', 'addons', 'einvites', 'venueCarouselOptions']
  const allSuppliers = Object.entries(suppliers).filter(([type, supplier]) =>
    supplier &&
    !nonSupplierFields.includes(type) &&
    typeof supplier === 'object' &&
    supplier.id &&
    supplier.id !== 'null' &&
    supplier.id !== null
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
      activities: 'Soft Play',
      partyBags: 'Party Bags',
      decorations: 'The Decorations',
      balloons: 'Balloons',
      photography: 'Photography',
      bouncyCastle: 'Bouncy Castle',
      sweetTreats: 'Sweet Treats'
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
      sweetTreats: '/category-icons/sweet-treats.png',
      bouncyCastle: '/category-icons/bouncy-castle.png'
    }
    return categoryIcons[type] || null
  }

  const getCategoryTagline = (type) => {
    // Trust-focused taglines that highlight vetting, local suppliers, and convenience
    const trustTaglines = {
      venue: 'Verified for safety • Hand-picked local venues',
      entertainment: 'DBS checked • Insured • Personally selected',
      catering: 'Local caterers • Food hygiene certified',
      cakes: 'Hand-selected local bakers • Made fresh for you',
      facePainting: 'DBS checked • Child-safe paints',
      activities: 'Safety checked • Personally vetted',
      partyBags: 'Pre-filled • Ready to hand out • Delivered to your door',
      decorations: 'Quality checked • Local suppliers',
      balloons: 'Hand-picked local artists',
      photography: 'Portfolio reviewed • Personally selected',
      bouncyCastle: 'PAT tested • Fully insured',
      sweetTreats: 'Local suppliers • Quality assured'
    }

    return trustTaglines[type] || ''
  }

  const renderSupplierCard = ([type, supplier]) => {
    // ✅ FIX: Merge global addons with supplier.selectedAddons (same fix as SelectedSupplierCard)
    // Prioritize supplier.selectedAddons since they have more complete data (e.g., priceType)
    const globalAddons = Array.isArray(addons) ? addons.filter(addon =>
      addon.supplierId === supplier.id ||
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    ) : []
    const supplierSelectedAddons = supplier?.selectedAddons || supplier?.packageData?.selectedAddons || []
    // Put supplierSelectedAddons FIRST so they take priority in dedupe
    const allAddons = [...supplierSelectedAddons, ...globalAddons]
    const supplierAddons = allAddons.filter((addon, index, arr) =>
      arr.findIndex(a => a.id === addon.id) === index
    )

    // ✅ DEBUG: Log party bags data
    const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
    if (isPartyBags) {

    }

    // ✅ USE: Unified pricing function if available
    let basePrice = 0
    let totalPrice = 0

    if (getSupplierDisplayPricing) {
      const pricing = getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
      basePrice = pricing?.basePrice || 0
      totalPrice = pricing?.totalPrice || 0

      if (isPartyBags) {
        console.log('🎁 [MyPartyTab] Unified Pricing Result:', {
          basePrice,
          totalPrice,
          pricingObject: pricing
        })
      }
    } else {
      // Fallback to manual calculation
      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)

      // Check if this is a party bags supplier
      const isPartyBags = supplier.category === 'Party Bags' ||
                          supplier.category?.toLowerCase().includes('party bag')

      if (isPartyBags) {
        // Try different party bags price sources
        basePrice = supplier.partyBagsMetadata?.totalPrice ||
                    supplier.packageData?.totalPrice ||
                    (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                      ? roundMoney(supplier.packageData.price * supplier.packageData.partyBagsQuantity)
                      : null)

        // If no metadata exists, use price as-is (it's likely already the total)
        if (!basePrice) {
          basePrice = supplier.price || supplier.priceFrom || 0
        }
      } else {
        // For non-party-bags: use packageData.price if available, otherwise supplier.price
        basePrice = supplier.packageData?.price || (supplier.price || 0)
      }

      totalPrice = basePrice + addonsCost
    }
    const supplierName = supplier.name || 'Unknown Supplier'
    const typeConfig = getTypeConfig(type)

    const enquiry = enquiries.find((e) => e.supplier_category === type)
    const isPaid = ['paid', 'fully_paid', 'partial_paid'].includes(enquiry?.payment_status) || enquiry?.is_paid === true

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
            // Don't open modal if clicking on a button inside the image area
            if (e.target.closest('button')) return
            e.stopPropagation()
            fetchFullSupplierData(supplier, type)
          }}
        >
          {/* Use package image for balloons, face painting, activities, sweet treats, and decorations if available */}
          {(() => {
            const isBalloons = type === 'balloons'
            const isFacePainting = type === 'facePainting'
            const isActivities = type === 'activities' || type === 'softPlay'
            const isSweetTreats = type === 'sweetTreats'
            const isDecorations = type === 'decorations'
            const packageImage = supplier?.packageData?.image
            const packageThemeImages = supplier?.packageData?.themeImages
            // For multi-select (sweet treats), get first selected item's image
            const selectedItems = supplier?.packageData?.selectedItems || []
            const firstSelectedItemImage = selectedItems[0]?.image

            let imageSrc = supplier.coverPhoto || supplier.image || supplier.imageUrl || '/placeholder.png'

            if ((isBalloons || isFacePainting || isActivities) && packageImage) {
              imageSrc = typeof packageImage === 'object' ? packageImage.src : packageImage
            }

            // Sweet treats: use first selected item's image if available
            if (isSweetTreats && (firstSelectedItemImage || packageImage)) {
              const sweetTreatsImage = firstSelectedItemImage || packageImage
              imageSrc = typeof sweetTreatsImage === 'object' ? sweetTreatsImage.src : sweetTreatsImage
            }

            // Decorations: use theme-specific image based on party theme
            if (isDecorations) {
              const partyTheme = partyDetails?.theme
              // Check if package has theme-specific images
              if (packageThemeImages && partyTheme && packageThemeImages[partyTheme]) {
                imageSrc = packageThemeImages[partyTheme]
              } else if (packageImage) {
                // Fall back to package image
                imageSrc = typeof packageImage === 'object' ? packageImage.src : packageImage
              }
            }

            // Party Bags: use theme-specific image based on party theme
            const isPartyBagsType = type === 'partyBags'
            if (isPartyBagsType) {
              const partyTheme = partyDetails?.theme
              // Check if package has theme-specific images
              if (packageThemeImages && partyTheme && packageThemeImages[partyTheme]) {
                imageSrc = packageThemeImages[partyTheme]
              } else if (packageImage) {
                // Fall back to package image
                imageSrc = typeof packageImage === 'object' ? packageImage.src : packageImage
              }
            }

            return (
              <Image
                src={imageSrc}
                alt={supplierName}
                fill
                className="object-cover transition-transform duration-300 group-hover/image:scale-105"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            )
          })()}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70 transition-opacity group-hover/image:opacity-90" />

          {/* Change Button (venues only) - Top Left */}
          {type === 'venue' && onBrowseVenues && (
            <div className="absolute top-4 left-4 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onBrowseVenues()
                }}
                className="px-4 py-2 bg-white hover:bg-gray-100 rounded-full text-sm font-semibold text-gray-800 flex items-center gap-2 transition-all duration-200 shadow-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Change
              </button>
            </div>
          )}

          {/* Status Badge (non-venues) and Remove Button */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
            <div>
              {/* Only show paid badge for non-venues (venues have Change button) */}
              {type !== 'venue' && isPaid && (
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

              {/* Sweet Treats selected items display */}
              {type === 'sweetTreats' && supplier?.packageData?.selectedItems?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-white/90 font-medium">
                    {supplier.packageData.selectedItems[0]?.name}
                    {supplier.packageData.selectedItems.length > 1 && (
                      <span className="ml-1 text-white/70">
                        +{supplier.packageData.selectedItems.length - 1} more
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Decorations pack size display */}
              {type === 'decorations' && supplier?.packageData?.decorationsMetadata && (
                <div className="mb-2">
                  <p className="text-sm text-white/90 font-medium">
                    {supplier.packageData.name}
                    {supplier.packageData.decorationsMetadata.bufferCount > 0 && (
                      <span className="ml-1 text-white/70">
                        ({supplier.packageData.decorationsMetadata.packSize} sets incl. {supplier.packageData.decorationsMetadata.bufferCount} spare)
                      </span>
                    )}
                  </p>
                </div>
              )}

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

        {/* Action Button - Single unified modal */}
        <div className="px-4 bg-white">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              fetchFullSupplierData(supplier, type)
            }}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            View & Edit
          </Button>
        </div>

        {/* Image disclaimer - all categories except venue are white-labeled */}
        {type !== 'venue' ? (
          <p className="text-[10px] text-gray-400 text-center pt-0.5 pb-2 px-4">
            {type === 'entertainment' ? 'Images show example experiences' : 'Images show example styles'}
          </p>
        ) : (
          <div className="h-2" />
        )}
      </Card>
    )
  }

  // Calculate total cost
  const totalCost = allSuppliers.reduce((sum, [type, supplier]) => {
    // ✅ FIX: Merge global addons with supplier.selectedAddons
    const globalAddons = Array.isArray(addons) ? addons.filter(addon =>
      addon.supplierId === supplier.id ||
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    ) : []
    const supplierSelectedAddons = supplier?.selectedAddons || supplier?.packageData?.selectedAddons || []
    const allAddons = [...supplierSelectedAddons, ...globalAddons]
    const supplierAddons = allAddons.filter((addon, index, arr) =>
      arr.findIndex(a => a.id === addon.id) === index
    )

    // ✅ USE: Unified pricing function if available
    if (getSupplierDisplayPricing) {
      const pricing = getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
      return sum + (pricing?.totalPrice || 0)
    }

    // Fallback to manual calculation
    const addonsCost = supplierAddons.reduce((addonSum, addon) => addonSum + (addon.price || 0), 0)
    let basePrice = 0
    const isPartyBags = supplier.category === 'Party Bags' ||
                        supplier.category?.toLowerCase().includes('party bag')

    if (isPartyBags) {
      basePrice = supplier.partyBagsMetadata?.totalPrice ||
                  supplier.packageData?.totalPrice ||
                  (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                    ? roundMoney(supplier.packageData.price * supplier.packageData.partyBagsQuantity)
                    : null)

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

  // Format time for display - show Morning/Afternoon instead of exact times
  const formatTime = (timeString) => {
    // Handle timeSlot format
    if (partyDetails?.timeSlot) {
      return partyDetails.timeSlot === 'morning' ? 'Morning' : 'Afternoon'
    }

    // Handle HH:MM format - determine morning vs afternoon
    if (timeString && timeString.includes(':')) {
      try {
        const [hours] = timeString.split(':')
        const hour = parseInt(hours)
        return hour < 13 ? 'Morning' : 'Afternoon'
      } catch (e) {
        return 'Afternoon'
      }
    }

    return 'Afternoon'
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
    <div className="space-y-3" style={{ overflowAnchor: 'none' }}>

      {/* Header Section */}
      <div>
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-gray-700 leading-tight">
              {partyDetails?.childName ? `${partyDetails.childName}'s ` : ''}{partyDetails?.theme ? `${partyDetails.theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ` : ''}Party is Ready 🎉
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              We've selected everything for you. Tweak anything in seconds.
            </p>
          </div>

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
        </div>
      </div>


      {/* All Suppliers Section with Category Headings */}
      {/* overflow-anchor: none prevents scroll jump when new cards are added */}
      {allSuppliers.length > 0 ? (
        <div className="space-y-4" style={{ overflowAnchor: 'none' }}>
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

      {/* Anything Missing Section - Always show so users can add suppliers */}
      {showMissingSuggestions && (
        <>
          <div className="bg-gray-50/50 border border-gray-200/60 rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>{allSuppliers.length > 0 ? "✨ Optional Extras" : "Start building your party"}</span>
              </h3>
              <p className="text-sm text-gray-500">
                {allSuppliers.length > 0
                  ? "Not ready to decide? You can add these anytime from your dashboard."
                  : "Add suppliers to create your perfect party plan"}
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

                // Return true to indicate success (toast notification handled by EmptySupplierCard)
                return true
              }}
              addedSupplierIds={new Set()}
              showTitle={false}
              preventNavigation={true}
              horizontalScroll={true}
              onBrowseVenues={onBrowseVenues}
              onShowVenueChoice={onShowVenueChoice}
            />
          </div>

          {/* Party Plan Summary - Only show when there are suppliers */}
          {allSuppliers.length > 0 && (
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
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Your Plan</h4>
                <div className="space-y-2">
                  {Object.entries(suppliers)
                    .filter(([type, supplier]) =>
                      supplier &&
                      !nonSupplierFields.includes(type) &&
                      typeof supplier === 'object' &&
                      supplier.id
                    )
                    .map(([type, supplier]) => {
                      // ✅ FIX: Use unified pricing for party bags
                      const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')

                      let displayPrice = 0
                      if (getSupplierDisplayPricing) {
                        // ✅ FIX: Merge global addons with supplier.selectedAddons
                        const globalAddons = Array.isArray(addons) ? addons.filter(addon =>
                          addon.supplierId === supplier.id ||
                          addon.supplierType === type ||
                          addon.attachedToSupplier === type
                        ) : []
                        const supplierSelectedAddons = supplier?.selectedAddons || supplier?.packageData?.selectedAddons || []
                        const allAddons = [...supplierSelectedAddons, ...globalAddons]
                        const supplierAddons = allAddons.filter((addon, index, arr) =>
                          arr.findIndex(a => a.id === addon.id) === index
                        )
                        const pricing = getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
                        // Use totalPrice (finalPrice) which includes hourly calculations for venues
                        displayPrice = pricing?.totalPrice || pricing?.basePrice || 0

                        // Override for party bags with special metadata
                        if (isPartyBags && supplier.partyBagsMetadata?.totalPrice) {
                          displayPrice = supplier.partyBagsMetadata.totalPrice
                        }
                      } else {
                        // ✅ FIX: For party bags, use supplier.price (total) not packageData.price (per bag)
                        if (isPartyBags) {
                          displayPrice = supplier.partyBagsMetadata?.totalPrice || supplier.price || supplier.packageData?.price || 0

                        } else {
                          displayPrice = supplier.packageData?.price || supplier.price || 0
                        }
                      }

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
                  {addons.map((addon) => {
                    // Calculate addon display price - handle per-child pricing for catering
                    const attachedSupplier = Object.values(suppliers).find(s =>
                      s && (addon.supplierId === s.id || addon.supplierType === s.category)
                    )
                    const isCatering = attachedSupplier?.category === 'Catering' || attachedSupplier?.category?.toLowerCase().includes('catering') || attachedSupplier?.category?.toLowerCase().includes('lunchbox')
                    // Note: data may use snake_case (per_child, per_head, per_item) or camelCase (perChild, perHead, perItem)
                    const isPerChild = addon.priceType === 'perChild' || addon.priceType === 'per_child' || addon.priceType === 'per_head' || addon.priceType === 'perItem' || addon.priceType === 'per_item'
                    const cateringQuantity = attachedSupplier?.cateringMetadata?.quantity || attachedSupplier?.packageData?.cateringMetadata?.quantity || partyDetails?.guestCount || 10
                    const addonDisplayPrice = (isPerChild && isCatering)
                      ? roundMoney((addon.price || 0) * cateringQuantity)
                      : (addon.price || 0)

                    return (
                      <div key={addon.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{addon.name}</span>
                        <span className="font-semibold text-gray-900">£{addonDisplayPrice.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Total */}
            {(() => {
              // ✅ FIX: Use unified pricing for all suppliers including party bags
              const supplierTotal = Object.entries(suppliers)
                .filter(([type, s]) => s)
                .reduce((sum, [type, supplier]) => {
                  if (getSupplierDisplayPricing) {
                    // ✅ FIX: Merge global addons with supplier.selectedAddons
                    const globalAddons = Array.isArray(addons) ? addons.filter(addon =>
                      addon.supplierId === supplier.id ||
                      addon.supplierType === type ||
                      addon.attachedToSupplier === type
                    ) : []
                    const supplierSelectedAddons = supplier?.selectedAddons || supplier?.packageData?.selectedAddons || []
                    const allAddons = [...supplierSelectedAddons, ...globalAddons]
                    const supplierAddons = allAddons.filter((addon, index, arr) =>
                      arr.findIndex(a => a.id === addon.id) === index
                    )
                    const pricing = getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
                    return sum + (pricing?.basePrice || 0)
                  }

                  // ✅ FIX: For party bags, use supplier.price (total) not packageData.price (per bag)
                  const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
                  if (isPartyBags) {
                    return sum + (supplier.partyBagsMetadata?.totalPrice || supplier.price || 0)
                  }

                  return sum + (supplier.packageData?.price || supplier.price || 0)
                }, 0)

              const addonTotal = addons?.reduce((sum, a) => sum + (a.price || 0), 0) || 0
              const totalCost = supplierTotal + addonTotal

              return totalCost > 0 ? (
                <div className="pt-4 border-t-2 border-gray-300">
                  {flyerDiscount > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-teal-600 font-semibold flex items-center gap-1">
                        🎉 Launch Offer ({flyerDiscount}% off)
                      </span>
                      <span className="text-sm text-teal-600 font-semibold">
                        -£{(totalCost * flyerDiscount / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-gray-900">Total</span>
                    {flyerDiscount > 0 ? (
                      <div className="text-right">
                        <span className="text-sm text-gray-400 line-through mr-2">
                          £{totalCost.toFixed(2)}
                        </span>
                        <span className="font-bold text-2xl text-[hsl(var(--primary-600))]">
                          £{(totalCost * (1 - flyerDiscount / 100)).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-2xl text-[hsl(var(--primary-600))]">
                        £{totalCost.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ) : null
            })()}
          </div>
          )}

          {/* Complete Booking CTA - Only show when there are suppliers */}
          {allSuppliers.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-gray-500 text-center">Everything's ready. Tweak anything before securing your party.</p>

            <button
              onClick={handleImHappy}
              disabled={isProcessing}
              className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white font-bold py-3 px-8 w-full rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Secure My Party'
              )}
            </button>

            {/* Save for later button - prominent secondary CTA */}
            {onSaveForLater && (
              <button
                onClick={onSaveForLater}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 w-full rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-gray-200"
              >
                {hasSavedParty ? 'Update saved plan' : 'Email me this plan'}
              </button>
            )}

            {/* Trust badges */}
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <div className="flex gap-4">
                <span className="inline-flex items-center gap-1 text-gray-500 text-xs whitespace-nowrap">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Confirmed in 2 days
                </span>
                <span className="inline-flex items-center gap-1 text-gray-500 text-xs whitespace-nowrap">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Money-back guarantee
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-gray-500 text-xs whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                Fully vetted suppliers
              </span>
            </div>

          </div>
          )}
        </>
      )}

      {/* Unified Customization Modal */}
      {selectedSupplierForCustomize && (
        <SupplierCustomizationModal
          supplier={selectedSupplierForCustomize}
          partyDetails={partyDetails}
          isOpen={!!selectedSupplierForCustomize}
          onClose={() => {
            setSelectedSupplierForCustomize(null)
            setSelectedSupplierType(null)
          }}
          onAddToPlan={async (data) => {

            // Call the handler if provided
            if (onCustomizationComplete) {
              await onCustomizationComplete(data)
            }

            setSelectedSupplierForCustomize(null)
            setSelectedSupplierType(null)
          }}
          isAdding={false}
          currentPhase="planning"
          selectedDate={partyDetails?.date}
          partyDate={partyDetails?.date}
          mobileHeight="max-h-[92vh]"
          desktopHeight="md:h-[95vh]"
          supplierType={selectedSupplierType}
        />
      )}

      {/* PartySnap Guarantee Modal */}
      <UniversalModal
        isOpen={showGuaranteeModal}
        onClose={() => setShowGuaranteeModal(false)}
        size="md"
        theme="default"
      >
        <ModalHeader
          icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
          title="The PartySnap Guarantee"
          subtitle="Every supplier is personally vetted by our team"
          onClose={() => setShowGuaranteeModal(false)}
        />
        <ModalContent>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Personally Selected</h4>
                <p className="text-sm text-gray-600">Every supplier is hand-picked and interviewed by our team. We only work with the best local professionals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">DBS Checked</h4>
                <p className="text-sm text-gray-600">All entertainers and staff working with children have valid DBS certificates on file.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Fully Insured</h4>
                <p className="text-sm text-gray-600">Every supplier carries public liability insurance for your peace of mind.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Quality Assured</h4>
                <p className="text-sm text-gray-600">We review portfolios, check references, and ensure every supplier meets our high standards.</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 font-medium text-center">
                If you're not completely satisfied, we'll make it right. That's our promise.
              </p>
            </div>
          </div>
        </ModalContent>
      </UniversalModal>

      {/* Social Proof Notification */}
      {showSocialProof && (
        <div
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 z-50 animate-in slide-in-from-bottom duration-300"
        >
          <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2.5 flex items-center gap-2.5 w-fit mx-auto sm:mx-0">
            {/* Pulsing green dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-700 font-medium">
              50+ parents planning parties this week
            </span>
            <button
              onClick={() => setShowSocialProof(false)}
              className="text-gray-400 hover:text-gray-600 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Help Button - appears after 25 seconds */}
      {showHelpButton && (
        <div className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Help menu popup */}
          {showHelpMenu && (
            <div className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-64 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Need help?</h4>
                <button
                  onClick={() => setShowHelpMenu(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Chat with a real person - no bots here!
              </p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/447123456789?text=Hi!%20I%20have%20a%20question%20about%20my%20party%20plan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">WhatsApp us</p>
                    <p className="text-xs text-gray-500">Quick response</p>
                  </div>
                </a>
                <a
                  href="mailto:hello@partysnap.co.uk?subject=Question%20about%20my%20party"
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Email us</p>
                    <p className="text-xs text-gray-500">hello@partysnap.co.uk</p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* Help button - smaller pill with text */}
          <button
            onClick={() => setShowHelpMenu(!showHelpMenu)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg transition-all
              ${showHelpMenu
                ? 'bg-gray-800 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:shadow-xl'
              }
            `}
            aria-label="Need help?"
          >
            <Phone className="w-4 h-4" />
            <span className="text-xs font-medium">Need help?</span>
          </button>
        </div>
      )}
    </div>
  )
}
