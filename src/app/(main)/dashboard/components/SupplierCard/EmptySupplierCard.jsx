"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Lightbulb, Sparkles, Star, Heart, Smile, Gift, Camera, Music, Search, Info, CheckCircle, X, Eye } from "lucide-react"
import { calculateFinalPrice } from '@/utils/unifiedPricing'
import SupplierQuickViewModal from '@/components/SupplierQuickViewModal'
import SupplierCustomizationModal from '@/components/SupplierCustomizationModal'
import { checkSupplierAvailability } from '@/utils/availabilityChecker'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/toast'

// Generic category images mapping
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

// Snappy's expert tips for each category
const CATEGORY_TIPS = {
  venue: {
    title: "Snappy's Venue Wisdom",
    intro: "After organizing thousands of parties, I've learned that choosing the right venue is one of the most important decisions you'll make.",
    tips: [
      "A dedicated party venue handles setup and cleanup, allowing you to focus on enjoying the celebration with your child",
      "Indoor venues eliminate weather concerns, ensuring your party runs smoothly regardless of conditions",
      "Many venues come equipped with entertainment areas, saving you time and money on additional equipment",
      "Professional venues provide excellent photo opportunities with purpose-built party spaces",
      "Venues with catering facilities streamline food service and reduce logistical stress"
    ],
    conclusion: "In my experience, parents who book professional venues report significantly less stress and more enjoyment on party day."
  },
  entertainment: {
    title: "Snappy's Entertainment Insight",
    intro: "Professional entertainment is the difference between a good party and an unforgettable one.",
    tips: [
      "Skilled entertainers manage transitions and maintain energy throughout the event",
      "Professional performers engage even the shyest children through proven interactive techniques",
      "Entertainment provides structure to your party timeline, eliminating awkward gaps",
      "Quality entertainment creates memorable moments that children discuss for weeks afterward",
      "Having a professional entertainer allows you to be present as a parent rather than managing activities"
    ],
    conclusion: "Investment in professional entertainment consistently delivers the highest satisfaction ratings from both parents and children."
  },
  cakes: {
    title: "Snappy's Cake Expertise",
    intro: "The birthday cake represents the emotional centerpiece of your celebration and deserves careful consideration.",
    tips: [
      "The cake cutting ceremony creates the most photographed moment of any party",
      "Custom-designed cakes make your child feel uniquely celebrated on their special day",
      "Professional bakers ensure exceptional taste alongside visual appeal",
      "A themed cake reinforces your party concept and creates cohesive memories",
      "Quality cakes accommodate dietary requirements while maintaining design integrity"
    ],
    conclusion: "A professionally crafted cake transforms a simple dessert into a meaningful memory that your child will treasure."
  },
  catering: {
    title: "Snappy's Catering Recommendation",
    intro: "Professional catering eliminates one of the most stressful aspects of party planning while elevating the experience.",
    tips: [
      "Catering removes the burden of shopping, preparation, and cooking from your schedule",
      "Professional caterers expertly manage dietary requirements and allergies",
      "Quality presentation makes a positive impression on attending parents",
      "Timed food service ensures hot dishes arrive at optimal temperature",
      "Many caterers include cleanup and waste management in their service"
    ],
    conclusion: "Parents who invest in catering consistently report a 70% reduction in party-day stress levels."
  },
  facePainting: {
    title: "Snappy's Face Painting Analysis",
    intro: "Face painting serves multiple strategic purposes at children's parties beyond simple decoration.",
    tips: [
      "Children become emotionally invested in the party through character transformation",
      "Face painting naturally manages early arrival staggering, preventing crowd congestion",
      "Professional face painters use safe, tested materials and maintain hygiene standards",
      "Painted faces encourage imaginative play and interaction between children",
      "The face painting station can entertain groups for extended periods, typically 60-90 minutes"
    ],
    conclusion: "Face painting represents excellent value, providing both entertainment and photographic opportunities throughout your event."
  },
  activities: {
    title: "Snappy's Activities Strategy",
    intro: "Structured activities are essential for maintaining engagement and preventing chaos at children's parties.",
    tips: [
      "Planned activities provide purpose during natural energy transitions throughout the event",
      "Age-appropriate games facilitate social interaction between children who may not know each other",
      "Structured entertainment reduces screen time temptation and keeps children present",
      "Craft activities can double as party favors, adding value to your investment",
      "Professional activity coordination allows you to supervise rather than constantly direct"
    ],
    conclusion: "Research shows parties with structured activities receive 90% higher satisfaction ratings from parents."
  },
  partyBags: {
    title: "Snappy's Party Bag Philosophy",
    intro: "Party bags represent your last impression and significantly influence how guests remember your celebration.",
    tips: [
      "Quality party bags extend the party experience into children's homes for days afterward",
      "Thoughtful bags create positive impressions with attending parents, reflecting your attention to detail",
      "Well-curated bags offer healthier alternatives to standard candy-filled options",
      "Themed bag contents reinforce your party concept and create cohesive memories",
      "Children often keep favored party bag items for months, creating lasting associations with your event"
    ],
    conclusion: "85% of children retain party bag items for extended periods, making this investment in memory creation worthwhile."
  },
  decorations: {
    title: "Snappy's Decoration Perspective",
    intro: "Strategic decoration transforms ordinary spaces into immersive party environments that captivate young imaginations.",
    tips: [
      "Professional decorations create photo-worthy backgrounds that enhance your memory collection",
      "Immediate visual impact upon arrival sets the celebratory tone for the entire event",
      "Themed decorations help children mentally transition into party mode",
      "Quality decorations photograph exceptionally well, improving your event documentation",
      "Many decoration elements can be repurposed as bedroom decor, extending their value"
    ],
    conclusion: "Studies indicate children rate decorated parties as more enjoyable, even when other elements remain constant."
  },
  balloons: {
    title: "Snappy's Balloon Assessment",
    intro: "Balloons create instant festive atmosphere while serving multiple practical purposes at parties.",
    tips: [
      "Balloon installations like arches make entrances feel special and indicate the party location",
      "Balloons provide versatile photo booth backgrounds at minimal cost",
      "Helium balloons can serve double duty as both decoration and take-home favors",
      "Color schemes reinforce your theme while adding visual interest to any space",
      "Balloons appeal universally across age groups, from toddlers to pre-teens"
    ],
    conclusion: "Balloons offer exceptional value as decorative elements, creating significant visual impact relative to investment."
  },
  sweetTreats: {
    title: "Snappy's Sweet Treats Guide",
    intro: "Sweet treat stations add an extra layer of excitement and are always a hit with children and adults alike.",
    tips: [
      "Candy carts and sweet stations create a visual centerpiece that gets children excited",
      "Mix and match options like candy floss, popcorn, and slush machines for variety",
      "Sweet treats work perfectly as an activity - children love watching candy floss being made",
      "Most suppliers offer package deals when you book multiple treat stations together",
      "Consider timing - sweet treats work brilliantly as a mid-party energy boost or end-of-party treat"
    ],
    conclusion: "Sweet treat stations consistently rank among children's favorite party elements and create memorable photo opportunities."
  }
}

// Tips Modal Component
function SupplierTipsModal({ isOpen, onClose, category }) {
  if (!isOpen || !category) return null

  const tips = CATEGORY_TIPS[category] || CATEGORY_TIPS.venue

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{tips.title}</h2>
          <p className="text-white/90 leading-relaxed">{tips.intro}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-280px)]">
          {/* Single box with all tips */}
          <div className="bg-white rounded-xl p-5 ">
            <ul className="space-y-4">
              {tips.tips.map((tip, idx) => (
                <li key={idx} className="text-gray-700 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary-500 before:font-bold">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Conclusion */}
          <div className="mt-6 bg-primary-50 border border-[hsl(var(--primary-200))] rounded-xl p-5">
            <p className="text-gray-800 leading-relaxed italic">
              {tips.conclusion}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full bg-primary-500 hover:from-[hsl(var(--primary-600)] hover:to-[hsl(var(--primary-700)] text-white font-semibold py-3 rounded-xl"
          >
            Thanks Snappy!
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function EmptySupplierCard({
  type,
  recommendedSupplier,
  partyDetails,
  openSupplierModal,
  onAddSupplier,
  getSupplierDisplayName,
  currentPhase = "planning",
  isSignedIn = false,
  isCompact = false,
  isAlreadyAdded = false,
  deliverooStyle = false,
  showJustAdded = false,
  onCustomize, // NEW: If provided, clicking will open customization modal instead
  disableSuccessState = false, // NEW: If true, don't show "In Plan" state or confetti
  selectedVenue = null, // Venue data to check for restrictions (e.g., bouncy castles not allowed)
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [showTipsModal, setShowTipsModal] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [fullSupplierData, setFullSupplierData] = useState(null)
  const [showUnavailableInfo, setShowUnavailableInfo] = useState(false)
  const [bookingPackage, setBookingPackage] = useState(null) // Track which package is being booked
  const router = useRouter()
  const { toast } = useToast()

  // Ref to store scroll position before modal opens - used to restore after add completes
  const savedScrollPositionRef = useRef(null)

  // Check if this supplier needs customization first (package selection)
  const isCakeSupplier = type === 'cakes'
  const isBalloonSupplier = type === 'balloons'
  const isPartyBagsSupplier = type === 'partyBags'
  const isFacePaintingSupplier = type === 'facePainting'
  const isActivitiesSupplier = type === 'activities' || type === 'softPlay' || type === 'bouncyCastle'
  const isSweetTreatsSupplier = type === 'sweetTreats'
  const isCateringSupplier = type === 'catering'
  const isDecorationsSupplier = type === 'decorations'
  const needsCustomization = isCakeSupplier || isBalloonSupplier || isPartyBagsSupplier || isFacePaintingSupplier || isActivitiesSupplier || isSweetTreatsSupplier || isCateringSupplier || isDecorationsSupplier

  // Check if this category is restricted by the selected venue
  const isVenueRestricted = useMemo(() => {
    // Debug logging for bouncy castle cards
    if (type === 'bouncyCastle' || type === 'bouncy-castle' || type === 'bouncy_castle') {
      console.log('🏰 Bouncy Castle Card - Venue Restriction Check:', {
        hasVenue: !!selectedVenue,
        venueName: selectedVenue?.name || selectedVenue?.businessName,
        serviceDetails: selectedVenue?.serviceDetails,
        dataServiceDetails: selectedVenue?.data?.serviceDetails,
        restrictedItems: selectedVenue?.serviceDetails?.restrictedItems || selectedVenue?.data?.serviceDetails?.restrictedItems || 'none found'
      })
    }

    if (!selectedVenue) return false

    // Get restricted items from venue's serviceDetails - check multiple possible paths
    const restrictedItems = selectedVenue?.serviceDetails?.restrictedItems ||
                           selectedVenue?.data?.serviceDetails?.restrictedItems ||
                           selectedVenue?.restrictedItems ||
                           selectedVenue?.data?.restrictedItems ||
                           []

    // Check if bouncy castles are restricted and this is a bouncy castle card
    if (type === 'bouncyCastle' || type === 'bouncy-castle' || type === 'bouncy_castle') {
      const isRestricted = Array.isArray(restrictedItems) && restrictedItems.some(item =>
        typeof item === 'string' && (
          item.toLowerCase().includes('bouncy castle') ||
          item.toLowerCase().includes('bouncy castles')
        )
      )
      console.log('🏰 Bouncy Castle Restriction Result:', { isRestricted, restrictedItems })
      return isRestricted
    }

    return false
  }, [selectedVenue, type])

  const venueRestrictionMessage = isVenueRestricted
    ? "Not allowed at your venue"
    : null

  // Fetch full supplier data with packages when needed for cake customization
  const fetchFullSupplierData = async (supplierId) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single()

      if (error) throw error

      // Extract packages from the data field
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update local justAdded state when showJustAdded prop changes
  useEffect(() => {
    if (showJustAdded && !disableSuccessState) {
      setJustAdded(true)
    }
  }, [showJustAdded, disableSuccessState])

  // Determine if the button should show as added (either from parent tracking or local state)
  // If disableSuccessState is true, never show as added
  const isAddedToParty = disableSuccessState ? false : (isAlreadyAdded || justAdded);


  const handleAddToParty = async (e) => {
    e.stopPropagation()
    if (!recommendedSupplier || isAdding) return

    // Don't allow adding unavailable categories
    if (isUnavailable || isUnavailableCategory) {
      console.log('Cannot add unavailable supplier/category')
      return
    }

    // If onCustomize is provided, open customization modal instead
    if (onCustomize) {
      onCustomize(recommendedSupplier, type)
      return
    }

    // For suppliers that need customization (cakes, balloons, party bags), open modal first
    if (needsCustomization) {
      setIsAdding(true)
      try {
        // Fetch full supplier data with packages
        const fullData = await fetchFullSupplierData(recommendedSupplier.id)
        if (fullData) {
          setFullSupplierData(fullData)
          setShowCustomizationModal(true)
        } else {
          // Fallback to basic supplier data if fetch fails
          setFullSupplierData(recommendedSupplier)
          setShowCustomizationModal(true)
        }
      } catch (error) {
        console.error('Error preparing customization:', error)
        // Fallback: still open modal with what we have
        setFullSupplierData(recommendedSupplier)
        setShowCustomizationModal(true)
      }
      setIsAdding(false)
      return
    }

    // Don't proceed if already added (unless disableSuccessState is true)
    if (isAddedToParty) return

    setIsAdding(true)

    try {
      await onAddSupplier(type, recommendedSupplier)

      // Only show success state if not disabled
      if (!disableSuccessState) {
        setIsAdding(false)
        setJustAdded(true)

        // Show toast notification for direct add (no modal)
        const categoryName = getDisplayName(type)
        const price = recommendedSupplier?.price || recommendedSupplier?.packageData?.price || 0
        toast.success(`${categoryName} - £${Number(price).toFixed(2)}`, {
          title: `${recommendedSupplier?.name || categoryName} added to your party!`,
          duration: 3000,
        })
      } else {
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Error adding supplier:', error)
      setIsAdding(false)
    }
  }

  // Handle customization complete - add supplier with customization data
  const handleCustomizationComplete = async (customizationData) => {
    // DON'T close modal yet - keep it open while we add the supplier
    // This way the DOM changes happen while body is fixed and user can't see them
    setIsAdding(true)

    try {
      // Extract the package data from customizationData
      const { package: selectedPackage, addons: selectedAddons = [], totalPrice, decorationsMetadata } = customizationData

      // Build the supplier object with packageData in the format addSupplier expects
      const supplierWithCustomization = {
        ...recommendedSupplier,
        // Include the full supplier data from customizationData if available
        ...(customizationData.supplier || {}),
        // Set packageData - this is what handleAddRecommendedSupplier uses
        packageData: {
          ...selectedPackage,
          // Include cake customization if present
          cakeCustomization: selectedPackage?.cakeCustomization,
          // Ensure price reflects the full total including delivery
          price: selectedPackage?.totalPrice || selectedPackage?.enhancedPrice || selectedPackage?.price,
          totalPrice: totalPrice || selectedPackage?.totalPrice,
          // Preserve image for balloons/face painting theme-based display
          image: selectedPackage?.image,
          // Include decorations metadata for pack size display
          decorationsMetadata: decorationsMetadata,
        },
        // Also set selectedPackage for backwards compatibility
        selectedPackage: selectedPackage,
        selectedAddons: selectedAddons,
        // Include decorations metadata at top level too
        decorationsMetadata: decorationsMetadata,
      }

      // Capture scroll position before modal closes (stored in body.style.top while modal is open)
      const bodyTop = document.body.style.top
      const savedScrollY = bodyTop ? Math.abs(parseInt(bodyTop, 10)) : window.scrollY

      // Add supplier
      await onAddSupplier(type, supplierWithCustomization, customizationData)

      // Close modal
      setShowCustomizationModal(false)

      // Wait for modal to close, then scroll down to stay at optional extras section
      await new Promise(resolve => setTimeout(resolve, 50))
      window.scrollTo({ top: savedScrollY + 400, behavior: 'instant' })

      // Only show success state if not disabled
      if (!disableSuccessState) {
        setIsAdding(false)
        setJustAdded(true)
      } else {
        setIsAdding(false)
      }

      // Show toast notification
      const categoryName = getDisplayName(type)
      const displayPrice = totalPrice || selectedPackage?.totalPrice || selectedPackage?.enhancedPrice || selectedPackage?.price || 0
      console.log('🎉 handleCustomizationComplete toast:', {
        type,
        totalPrice,
        selectedPackage,
        displayPrice,
        customizationData
      })
      toast.success(`${categoryName} - £${Number(displayPrice).toFixed(2)}`, {
        title: `${selectedPackage?.name || 'Package'} added to your party!`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Error adding customized supplier:', error)
      setShowCustomizationModal(false)
      setIsAdding(false)
    }
  }

  // Handle direct booking from quick view modal - bypasses customization modal
  const handleBookPackage = async (pkg) => {
    // Set booking state to show loading on the button
    setBookingPackage(pkg.id || pkg.name)

    // Brief delay to show click feedback
    await new Promise(resolve => setTimeout(resolve, 300))

    // Calculate total price based on pricing model
    const guestCount = partyDetails?.guestCount || 10
    // Check multiple price fields that might be used
    const basePrice = pkg.price || pkg.basePrice || pkg.enhancedPrice || pkg.totalPrice || 0

    console.log('📦 handleBookPackage:', { type, pkgName: pkg.name, pkg, basePrice })

    let totalPrice
    let quantity
    let pricePerUnit
    let decorationsMetadata

    if (type === 'decorations') {
      // Decorations use pack sizes - find smallest pack that covers guests
      const packSizes = pkg.packSizes || [8, 16, 24, 32, 40, 48]
      const packSize = packSizes.find(size => size >= guestCount) || packSizes[packSizes.length - 1]
      totalPrice = basePrice * packSize
      quantity = packSize
      pricePerUnit = basePrice
      decorationsMetadata = {
        packSize: packSize,
        pricePerSet: basePrice,
        totalPrice: totalPrice,
        bufferCount: packSize - guestCount
      }
    } else if (type === 'partyBags' || type === 'catering') {
      // Per-guest pricing
      totalPrice = basePrice * guestCount
      quantity = guestCount
      pricePerUnit = basePrice
    } else if (type === 'activities' || type === 'softPlay' || type === 'bouncyCastle') {
      // Activities/soft play - fixed price per item
      totalPrice = basePrice
      quantity = 1
    } else {
      // Fixed price items (entertainment, etc.)
      totalPrice = pkg.totalPrice || pkg.enhancedPrice || basePrice
      quantity = 1
    }

    // Build the supplier object with packageData
    const supplierWithCustomization = {
      ...recommendedSupplier,
      packageData: {
        ...pkg,
        totalPrice: totalPrice,
        quantity: quantity,
        pricePerUnit: pricePerUnit,
        decorationsMetadata: decorationsMetadata,
      },
      selectedPackage: pkg,
      selectedAddons: [],
      decorationsMetadata: decorationsMetadata,
    }

    // Capture scroll position before modal closes (stored in body.style.top while modal is open)
    const bodyTop = document.body.style.top
    const savedScrollY = bodyTop ? Math.abs(parseInt(bodyTop, 10)) : window.scrollY

    // Add supplier
    await onAddSupplier(type, supplierWithCustomization, { package: pkg, addons: [], totalPrice, decorationsMetadata })

    // Close modal
    setShowQuickView(false)
    setBookingPackage(null)

    // Wait for modal to close, then scroll down to stay at optional extras section
    await new Promise(resolve => setTimeout(resolve, 50))
    window.scrollTo({ top: savedScrollY + 400, behavior: 'instant' })

    // Show success state if not disabled
    if (!disableSuccessState) {
      setJustAdded(true)
    }

    // Show toast notification
    const categoryName = getDisplayName(type)
    toast.success(`${categoryName} - £${Number(totalPrice).toFixed(2)}`, {
      title: `${pkg?.name || 'Package'} added to your party!`,
      duration: 3000,
    })
  }

  const getDisplayName = (supplierType) => {
    if (getSupplierDisplayName) {
      return getSupplierDisplayName(supplierType)
    }
    const displayNames = {
      venue: "Venue",
      entertainment: "Entertainment",
      catering: "Catering",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      cakes: "Cakes",
      partyBags: "Party Bags",
      photography: "Photography",
      bouncyCastle: "Bouncy Castle",
      sweetTreats: "Sweet Treats"
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  // Calculate pricing for the recommended supplier
  const pricing = useMemo(() => {
    if (!recommendedSupplier || recommendedSupplier.unavailable) return { finalPrice: 0 }
    return calculateFinalPrice(recommendedSupplier, partyDetails, [])
  }, [recommendedSupplier, partyDetails])

  // ✅ Check if this is an unavailable category marker
  const isUnavailableCategory = recommendedSupplier?.unavailable === true

  // Get generic image for this category
  const genericImage = CATEGORY_IMAGES[type] || `/placeholder.svg`

  // Get actual supplier image - for decorations/party bags, use theme-specific image if available
  const getSupplierImage = () => {
    const partyTheme = partyDetails?.theme

    // For decorations and party bags, check for theme-specific images in packages
    if ((type === 'decorations' || type === 'partyBags') && partyTheme) {
      // Check packages for theme images
      const packages = recommendedSupplier?.packages || recommendedSupplier?.data?.packages || []
      for (const pkg of packages) {
        if (pkg.themeImages && pkg.themeImages[partyTheme]) {
          return pkg.themeImages[partyTheme]
        }
      }
    }

    // Fall back to cover photo, image, or generic
    return recommendedSupplier?.coverPhoto || recommendedSupplier?.image || recommendedSupplier?.imageUrl || genericImage
  }
  const supplierImage = getSupplierImage()
  const categoryDisplayName = getDisplayName(type)

  // ✅ Check supplier availability
  const availabilityCheck = useMemo(() => {
    // Check venue restrictions first (e.g., bouncy castles not allowed)
    if (isVenueRestricted) {
      return { available: false, reason: venueRestrictionMessage }
    }
    if (isUnavailableCategory) {
      // Pass through lead time info if available (for helpful "pick a later date" messaging)
      return {
        available: false,
        reason: recommendedSupplier?.unavailabilityReason || 'No suppliers available on your party date',
        requiredLeadTime: recommendedSupplier?.requiredLeadTime
      }
    }
    if (!recommendedSupplier || !partyDetails?.date) {
      return { available: true, reason: null }
    }
    return checkSupplierAvailability(
      recommendedSupplier,
      partyDetails.date,
      partyDetails.time || partyDetails.startTime,
      partyDetails.duration || 2
    )
  }, [recommendedSupplier, partyDetails, isUnavailableCategory, isVenueRestricted, venueRestrictionMessage])

  const isUnavailable = !availabilityCheck.available || isUnavailableCategory || isVenueRestricted

  // Get explanation for unavailability - use the reason from availability checker
  const getUnavailabilityExplanation = () => {
    if (isVenueRestricted) {
      if (type === 'activities' || type === 'bouncyCastle') {
        return "Your venue doesn't allow bouncy castles. Choose a different venue or skip this."
      }
      return venueRestrictionMessage || "Not permitted at your selected venue."
    }

    // Use the actual reason from the availability checker (has correct lead time per supplier)
    if (availabilityCheck.reason) {
      return availabilityCheck.reason
    }

    return null
  }

  const unavailabilityExplanation = isUnavailable ? getUnavailabilityExplanation() : null

  // Debug logging
  // useEffect(() => {
  //   console.log(`🔍 EmptySupplierCard [${type}]:`, {
  //     hasSupplier: !!recommendedSupplier,
  //     isUnavailableCategory,
  //     isUnavailable,
  //     availabilityCheck,
  //     isCompact,
  //     supplierData: recommendedSupplier
  //   })
  // }, [recommendedSupplier, type, isUnavailableCategory, isUnavailable, availabilityCheck, isCompact])

  // Compact skeleton (but not for unavailable categories - they should render)
  if (!isMounted) {
    return null
  }

  if (!recommendedSupplier) {
    return (
      <Card className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl ${
        deliverooStyle ? 'h-32' : isCompact ? 'h-48' : 'h-80'
      }`}>
        <div className={`relative w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${
          deliverooStyle ? 'h-20' : isCompact ? 'h-32' : 'h-64'
        }`} />
        <div className={`bg-white ${deliverooStyle ? 'p-2' : isCompact ? 'p-3' : 'p-6'}`}>
          <div className={`bg-gray-200 rounded animate-pulse ${
            deliverooStyle ? 'h-6' : isCompact ? 'h-8' : 'h-12'
          }`} />
        </div>
      </Card>
    )
  }

  // Deliveroo-style: Super compact horizontal card
  if (deliverooStyle) {
    return (
      <>
        <Card
          className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--primary-300))] h-full relative"
        >
          <div className="flex flex-col h-full">
            {/* Image section - clickable to show quick view */}
            <div
              className="relative h-32 w-full flex-shrink-0 cursor-pointer group/img"
              onClick={(e) => {
                e.stopPropagation()
                // Save scroll position before opening modal
                savedScrollPositionRef.current = window.scrollY
                // Always open quick view when tapping image (customization happens via Add button)
                setShowQuickView(true)
              }}
            >
              <Image
                src={supplierImage}
                alt={categoryDisplayName}
                fill
                className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 transition-opacity group-hover/img:opacity-80" />

              {/* View badge - shows on available suppliers to indicate clickable */}
              {!isUnavailable && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                    <Eye className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] font-medium text-gray-600">View</span>
                  </div>
                </div>
              )}

              {/* Info icon - shows unavailability reason when unavailable */}
              {isUnavailable && unavailabilityExplanation && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUnavailableInfo(!showUnavailableInfo)
                      }}
                      className="w-7 h-7 bg-primary-500 hover:bg-primary-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                    >
                      <Info className="w-3.5 h-3.5 text-white" />
                    </button>
                    {showUnavailableInfo && (
                      <div className="absolute top-9 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
                        <p className="text-xs text-gray-600 leading-snug">{unavailabilityExplanation}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowUnavailableInfo(false)
                          }}
                          className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Content section below image - clickable to open quick view */}
            <div className="p-3 flex-1 flex flex-col">
              {/* Clickable area for quick view (everything except button) */}
              <div
                className="flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  savedScrollPositionRef.current = window.scrollY
                  setShowQuickView(true)
                }}
              >
                {/* Category name - larger */}
                <h3 className="text-base font-bold text-gray-900 truncate mb-2">
                  {categoryDisplayName}
                </h3>

                {/* Price */}
                {pricing.finalPrice > 0 && !isUnavailable && (
                  <p className="text-xs text-gray-500 mb-3">
                    from <span className="font-bold text-gray-900">£{pricing.finalPrice}</span>
                    {isCakeSupplier && <span className="text-gray-400 ml-1">(incl. delivery)</span>}
                  </p>
                )}
              </div>

              {/* Button at bottom */}
              <Button
                className={`w-full text-white text-xs py-2 h-8 shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-auto ${
                  isUnavailable
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                    : isAddedToParty
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))]'
                }`}
                onClick={handleAddToParty}
                disabled={isAdding || isAddedToParty || isUnavailable}
                title={isUnavailable ? (unavailabilityExplanation || availabilityCheck.reason) : ''}
              >
                {isUnavailable ? (
                  <>
                    <X className="w-3.5 h-3.5 mr-1" />
                    <span className="font-semibold">
                      {isVenueRestricted
                        ? "Not at venue"
                        : availabilityCheck.requiredLeadTime
                          ? "Needs more notice"
                          : "Unavailable"}
                    </span>
                  </>
                ) : isAdding ? (
                  <>
                    <div className="relative w-3 h-3 mr-1.5">
                      <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="animate-pulse">Adding...</span>
                  </>
                ) : isAddedToParty ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    <span className="font-semibold">In Plan</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span className="font-semibold">Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick View Modal */}
        <SupplierQuickViewModal
          supplier={recommendedSupplier}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          onAddSupplier={onAddSupplier}
          partyDetails={partyDetails}
          type={type}
          onBookPackage={needsCustomization ? handleBookPackage : undefined}
          bookingPackageId={bookingPackage}
          onCustomize={needsCustomization ? () => {
            // Preserve scroll position when transitioning from quick view to customization
            const bodyTop = document.body.style.top
            if (bodyTop) {
              savedScrollPositionRef.current = Math.abs(parseInt(bodyTop, 10))
            }
            setShowQuickView(false)
            setShowCustomizationModal(true)
          } : undefined}
        />

        {/* Customization Modal for Cakes, Balloons, Party Bags */}
        {needsCustomization && (
          <SupplierCustomizationModal
            isOpen={showCustomizationModal}
            onClose={() => setShowCustomizationModal(false)}
            supplier={fullSupplierData || recommendedSupplier}
            onAddToPlan={handleCustomizationComplete}
            partyDetails={partyDetails}
            supplierType={type}
          />
        )}
      </>
    )
  }

  // Compact mode - shorter card
  if (isCompact) {
    return (
      <>
        <Card
          className="overflow-hidden bg-gray-300 rounded-xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-primary-400 opacity-75 hover:opacity-90 h-70 cursor-pointer"
          onClick={(e) => {
            if (isUnavailableCategory) return
            savedScrollPositionRef.current = window.scrollY
            setShowQuickView(true)
          }}
        >
          <div className="relative h-100 w-full">
            {/* Generic Category Image */}
            <div className="absolute inset-0">
              <Image
                src={supplierImage}
                alt={categoryDisplayName}
                fill
                className="object-cover transition-all"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 pointer-events-none" />

            {/* Info icon - shows unavailability reason when unavailable */}
            {!isUnavailableCategory && isUnavailable && unavailabilityExplanation && (
              <div className="absolute top-2 right-2 z-10">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUnavailableInfo(!showUnavailableInfo)
                    }}
                    className="w-8 h-8 bg-primary-500 hover:bg-primary-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                  >
                    <Info className="w-4 h-4 text-white" />
                  </button>
                  {showUnavailableInfo && (
                    <div className="absolute top-10 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
                      <p className="text-sm text-gray-600 leading-snug">{unavailabilityExplanation}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowUnavailableInfo(false)
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category name and pricing */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-3xl font-bold text-white/90 truncate drop-shadow-lg">
                {categoryDisplayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
              </div>
            </div>
          </div>

          {/* Compact button */}
          <div className="p-3" onClick={(e) => e.stopPropagation()}>
            <Button
              className={`w-full text-white text-sm py-2 shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
                isUnavailable
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                  : isAddedToParty
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))]'
              }`}
              onClick={handleAddToParty}
              disabled={isAdding || isAddedToParty || isUnavailable}
              title={isUnavailable ? (unavailabilityExplanation || availabilityCheck.reason) : ''}
            >
              {isUnavailable ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">
                    {isVenueRestricted
                      ? "Not allowed at venue"
                      : availabilityCheck.requiredLeadTime
                        ? "Needs more notice"
                        : "Unavailable"}
                  </span>
                </>
              ) : isAdding ? (
                <>
                  <div className="relative w-4 h-4 mr-2">
                    <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="animate-pulse text-xs">Adding...</span>
                </>
              ) : isAddedToParty ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">In Plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Click to Add</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Tips Modal */}
        <SupplierTipsModal
          isOpen={showTipsModal}
          onClose={() => setShowTipsModal(false)}
          category={type}
        />

        {/* Quick View Modal */}
        <SupplierQuickViewModal
          supplier={recommendedSupplier}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          onAddSupplier={onAddSupplier}
          partyDetails={partyDetails}
          type={type}
          onBookPackage={needsCustomization ? handleBookPackage : undefined}
          bookingPackageId={bookingPackage}
          onCustomize={needsCustomization ? () => {
            // Preserve scroll position when transitioning from quick view to customization
            const bodyTop = document.body.style.top
            if (bodyTop) {
              savedScrollPositionRef.current = Math.abs(parseInt(bodyTop, 10))
            }
            setShowQuickView(false)
            setShowCustomizationModal(true)
          } : undefined}
        />

        {/* Customization Modal for Cakes, Balloons, Party Bags */}
        {needsCustomization && (
          <SupplierCustomizationModal
            isOpen={showCustomizationModal}
            onClose={() => setShowCustomizationModal(false)}
            supplier={fullSupplierData || recommendedSupplier}
            onAddToPlan={handleCustomizationComplete}
            partyDetails={partyDetails}
            supplierType={type}
          />
        )}
      </>
    )
  }

  // Full size mode - taller image
  return (
    <>
      <Card
        className="overflow-hidden bg-gray-300 rounded-2xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-primary-400 opacity-75 hover:opacity-90 cursor-pointer"
        onClick={() => {
          if (isUnavailableCategory) return
          savedScrollPositionRef.current = window.scrollY
          setShowQuickView(true)
        }}
      >
        <div className="relative h-62 w-full">
          {/* Generic Category Image */}
          <div className="absolute inset-0">
            <Image
              src={supplierImage}
              alt={categoryDisplayName}
              fill
              className="object-cover transition-all"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 pointer-events-none" />

           {/* Info icon - only shows for unavailable suppliers */}
           {isUnavailable && unavailabilityExplanation && (
             <div className="absolute top-2 right-2 z-10">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUnavailableInfo(!showUnavailableInfo)
                    }}
                    className="w-8 h-8 bg-primary-500 hover:bg-primary-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-white" />
                  </button>
                  {showUnavailableInfo && (
                    <div className="absolute top-10 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
                      <p className="text-sm text-gray-600 leading-snug">{unavailabilityExplanation}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowUnavailableInfo(false)
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Category badge */}
          {/* <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gray-900 text-white shadow-lg backdrop-blur-sm">
              {categoryDisplayName}
            </Badge>
          </div> */}

          {/* Category name and pricing */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="text-white/90">
              <h3 className="text-4xl font-bold mb-2 drop-shadow-lg text-white/80">
                {categoryDisplayName}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="text-white/80">
                  <div className="flex items-center gap-2">
                    {/* Price removed as per your original code */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with single CTA */}
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <Button
            className={`w-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
              isUnavailable
                ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                : isAddedToParty
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))]'
            }`}
            size="lg"
            onClick={handleAddToParty}
            disabled={isAdding || isAddedToParty || isUnavailable}
            title={isUnavailable ? (unavailabilityExplanation || availabilityCheck.reason) : ''}
          >
            {isUnavailable ? (
              <>
                <X className="w-5 h-5 mr-2" />
                {isVenueRestricted
                  ? "Not allowed at your venue"
                  : availabilityCheck.requiredLeadTime
                    ? "Needs more notice"
                    : "Unavailable"}
              </>
            ) : isAdding ? (
              <>
                <div className="relative w-5 h-5 mr-2">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="animate-pulse">Adding...</span>
              </>
            ) : isAddedToParty ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                In Plan
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Click to Add
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Tips Modal */}
      <SupplierTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        category={type}
      />

      {/* Quick View Modal */}
      <SupplierQuickViewModal
        supplier={recommendedSupplier}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddSupplier={onAddSupplier}
        partyDetails={partyDetails}
        type={type}
        onBookPackage={needsCustomization ? handleBookPackage : undefined}
        bookingPackageId={bookingPackage}
        onCustomize={needsCustomization ? () => {
          // Preserve scroll position when transitioning from quick view to customization
          const bodyTop = document.body.style.top
          if (bodyTop) {
            savedScrollPositionRef.current = Math.abs(parseInt(bodyTop, 10))
          }
          setShowQuickView(false)
          setShowCustomizationModal(true)
        } : undefined}
      />

      {/* Customization Modal for Cakes, Balloons, Party Bags */}
      {needsCustomization && (
        <SupplierCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          supplier={fullSupplierData || recommendedSupplier}
          onAddToPlan={handleCustomizationComplete}
          partyDetails={partyDetails}
          supplierType={type}
        />
      )}
    </>
  )
}