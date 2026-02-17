// Enhanced SupplierCustomizationModal with unified pricing system integration
"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  Check,
  Plus,
  Sparkles,
  Clock,
  Truck,
  Cake,
  Package,
  Gift,
  X,
  CheckCircle,
  ImageIcon,
  Info,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react"
import Image from "next/image"
import SupplierNote from '@/components/SupplierNote'
import VenueDisplay from '@/components/supplier/display/VenueDisplay'

// ✅ UPDATED: Import unified pricing system
import {
  calculateFinalPrice,
  isLeadBasedSupplier,
  isTimeBasedSupplier,
  getPartyDuration,
  formatDuration,
  roundMoney,
} from "@/utils/unifiedPricing"

// Default cake flavors (only used if supplier hasn't specified any)
const DEFAULT_CAKE_FLAVORS = [
  { id: "vanilla", name: "Vanilla Sponge", popular: true },
  { id: "chocolate", name: "Chocolate Fudge", popular: true },
  { id: "strawberry", name: "Strawberry", popular: true },
  { id: "red-velvet", name: "Red Velvet" },
  { id: "lemon", name: "Lemon Drizzle" },
  { id: "funfetti", name: "Funfetti/Rainbow" },
]

// Dietary option labels for display
const DIETARY_LABELS = {
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten Free',
  'dairy-free': 'Dairy Free',
  'nut-free': 'Nut Free',
  'egg-free': 'Egg Free',
  'halal': 'Halal'
}

// Format price - shows "80p" for under £1, "£1.50" for £1 and over
const formatPriceCompact = (price) => {
  if (price < 1) {
    return `${Math.round(price * 100)}p`
  }
  return `£${price.toFixed(2)}`
}

// Package Details Modal - Visual Grid "What's Included" view
const PackageDetailsModal = ({ pkg, isOpen, onClose }) => {
  // Disable body scroll when modal is open (iOS Safari compatible)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo({ top: scrollY, behavior: 'instant' })
      }
    }
  }, [isOpen])

  if (!isOpen || !pkg) return null

  const items = pkg.features?.length > 0 ? pkg.features : (pkg.contents?.length > 0 ? pkg.contents : (pkg.whatsIncluded || []))

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
            <p className="text-sm text-[hsl(var(--primary-600))] font-medium">£{(pkg.price || 0).toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Styled checklist */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">What&apos;s Included</p>
          {items.length > 0 ? (
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 text-sm pt-0.5">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Package details not available.</p>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SupplierCustomizationModal({
  isOpen,
  onClose,
  supplier,
  onAddToPlan,
  isAdding = false,
  currentPhase = "planning",
  partyData = {},
  enquiries = [],
  hasEnquiriesPending = false,
  // ✅ ENHANCED: Add unified pricing support props
  selectedDate = null,
  currentMonth = new Date(),
  partyDate = null,
  partyDetails = null, // New prop for complete party details
  databasePartyData = null,
  userType = null,
  mobileHeight = "max-h-[85vh]", // Mobile height (default 85vh)
  desktopHeight = "md:h-[90vh]", // Desktop height (default 90vh)
  // ✅ EDIT MODE: New props for editing booked suppliers
  mode = "add", // "add" | "edit"
  onSaveChanges = null, // Callback for edit mode
  originalTotalPrice = null, // Original price for diff calculation
  // ✅ NEW: Allow parent to override supplier type detection
  supplierType = null, // e.g., "cakes", "partyBags" - forces specific UI mode
}) {


  // ✅ DEBUG: Log when modal receives new supplier prop
  useEffect(() => {
    if (isOpen && supplier) {
      console.log('🎯 [Modal] Received supplier prop:', {
        name: supplier.name,
        category: supplier.category,
        serviceType: supplier.serviceType,
        service_type: supplier.service_type,
        type: supplier.type,
        supplierKeys: Object.keys(supplier),
        serviceDetails: supplier.serviceDetails,
        service_details: supplier.service_details,
        packages: supplier.packages,
        dataPackages: supplier.data?.packages,
      });

      // Log serviceDetails structure
      const sd = supplier.serviceDetails || supplier.service_details || {}
      console.log('🎂 [Modal] ServiceDetails structure:', {
        hasServiceDetails: !!supplier.serviceDetails,
        hasService_details: !!supplier.service_details,
        sdKeys: Object.keys(sd),
        flavours: sd.flavours,
        cakeFlavors: sd.cakeFlavors,
        cake_flavors: sd.cake_flavors,
        dietaryInfo: sd.dietaryInfo,
        dietary_info: sd.dietary_info,
        packages: sd.packages,
        fulfilment: sd.fulfilment,
        cakeFulfilment: sd.cakeFulfilment,
      });
    }
  }, [isOpen, supplier]);
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [selectedPackageIds, setSelectedPackageIds] = useState([]) // For multi-select suppliers
  const [selectedAddons, setSelectedAddons] = useState([])
  // Venue catering state
  const [selectedCateringId, setSelectedCateringId] = useState(null)
  const [cateringGuestCount, setCateringGuestCount] = useState(20) // Default guest count for catering
  const [expandedCateringMenus, setExpandedCateringMenus] = useState({}) // Track which catering menus are expanded
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [canAddCheck, setCanAddCheck] = useState({ canAdd: true, reason: "planning_empty_slot", showModal: false })

  // Cake customization state
  const [selectedFlavor, setSelectedFlavor] = useState("vanilla")
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState([]) // Array for multiple selections
  const [customMessage, setCustomMessage] = useState("")
  const [showSpecialRequests, setShowSpecialRequests] = useState(false) // Collapsible special requests
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery") // "delivery" or "pickup"
  const [selectedCupcakeOption, setSelectedCupcakeOption] = useState(null) // null, "box6", "box12", "box24"

  // Party bags quantity state - ensure it's always a number
  const [partyBagsQuantity, setPartyBagsQuantity] = useState(Number(partyDetails?.guestCount) || 10)


  // Helper function to round up to nearest pack size for decorations
  const getDecorationsPackSize = (guestCount, packSizes = [8, 16, 24, 32, 40, 48]) => {
    const count = Number(guestCount) || 10
    // Find the smallest pack size that covers the guest count
    for (const size of packSizes) {
      if (size >= count) return size
    }
    // If guest count exceeds all pack sizes, use the largest one
    return packSizes[packSizes.length - 1]
  }

  // Package details modal state
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [selectedPackageForModal, setSelectedPackageForModal] = useState(null)

  // Special requests for entertainment suppliers
  const [specialRequests, setSpecialRequests] = useState("")

  // Image carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  // Mobile swipe state
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Info accordion state
  const [openAccordion, setOpenAccordion] = useState(null)

  // About section expand state (mobile)
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)

  // Store scroll position in ref to avoid stale closure issues
  const scrollPositionRef = useRef(0)

  // Get all supplier images for carousel
  const getSupplierImages = (supplier) => {
    if (!supplier) return []
    const imageList = []
    const seenUrls = new Set()

    const addImage = (url) => {
      if (url && !seenUrls.has(url)) {
        imageList.push(url)
        seenUrls.add(url)
      }
    }

    // Add cover photo first
    if (supplier.coverPhoto) addImage(supplier.coverPhoto)
    else if (supplier.originalSupplier?.coverPhoto) addImage(supplier.originalSupplier.coverPhoto)
    else if (supplier.image) addImage(typeof supplier.image === 'object' ? supplier.image.src : supplier.image)
    else if (supplier.originalSupplier?.image) addImage(supplier.originalSupplier.image)
    else if (supplier.imageUrl) addImage(supplier.imageUrl)

    // Process images from various fields
    const processImage = (img) => {
      if (typeof img === 'string') addImage(img)
      else if (img?.src) addImage(img.src)
      else if (img?.url) addImage(img.url)
      else if (img?.image) addImage(img.image)
    }

    // Add portfolio images
    const portfolioFields = ['portfolioImages', 'portfolio_images', 'images', 'gallery', 'photos']
    portfolioFields.forEach(field => {
      if (supplier[field] && Array.isArray(supplier[field])) {
        supplier[field].forEach(processImage)
      }
      if (supplier.originalSupplier?.[field] && Array.isArray(supplier.originalSupplier[field])) {
        supplier.originalSupplier[field].forEach(processImage)
      }
    })

    return imageList.slice(0, 6)
  }

  const supplierImages = getSupplierImages(supplier)

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
    // Reset about section expanded state when supplier changes
    setIsAboutExpanded(false)
  }, [supplier?.id, emblaApi])

  const scrollPrev = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e) => {
    e.stopPropagation()
    emblaApi?.scrollNext()
  }, [emblaApi])

  // Mobile swipe handlers for image carousel
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((imagesLength) => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50 // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - go to next image
        setCarouselIndex(prev => prev === imagesLength - 1 ? 0 : prev + 1)
      } else {
        // Swiped right - go to previous image
        setCarouselIndex(prev => prev === 0 ? imagesLength - 1 : prev - 1)
      }
    }
  }, [])

  // Disable body scroll when main modal is open (iOS Safari compatible)
  useEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        // Use instant behavior to avoid smooth scroll causing visible jump
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      }
    }
  }, [isOpen])

  // ✅ Initialize party bags quantity from existing data or guest count
  useEffect(() => {
    if (isOpen && supplier && (supplier.category === "Party Bags" || supplier.category?.toLowerCase().includes("party bag"))) {
      // Check if supplier already has a custom quantity set
      const existingQuantity = supplier?.partyBagsQuantity ||
                               supplier?.packageData?.partyBagsQuantity ||
                               supplier?.partyBagsMetadata?.quantity;

      if (existingQuantity) {

        setPartyBagsQuantity(Number(existingQuantity));
      } else {
        // Default to guest count
        setPartyBagsQuantity(Number(partyDetails?.guestCount) || 10);
      }
    }
  }, [isOpen, supplier, partyDetails?.guestCount])

  // ✅ Initialize decorations quantity from existing data or guest count
  useEffect(() => {
    if (isOpen && supplier && (supplier.category === "Decorations" || supplier.category?.toLowerCase().includes("decoration") || supplier.category?.toLowerCase().includes("tableware"))) {
      // Check if supplier already has a custom quantity set
      const existingGuestCount = supplier?.decorationsMetadata?.guestCount ||
                               supplier?.packageData?.guestCount;

      if (existingGuestCount) {
        setPartyBagsQuantity(Number(existingGuestCount));
      } else {
        // Default to guest count
        setPartyBagsQuantity(Number(partyDetails?.guestCount) || 10);
      }
    }
  }, [isOpen, supplier, partyDetails?.guestCount])

  // ✅ UPDATED: Detect supplier types using unified system
  const supplierTypeDetection = useMemo(() => {
    if (!supplier) return { isLeadBased: false, isTimeBased: false, isCake: false, isPartyBags: false, isBalloons: false, isFacePainting: false, isSoftPlay: false, isBouncyCastle: false, isMultiSelect: false, isCatering: false, isSweetTreats: false, isDecorations: false, isEntertainment: false }

    const isLeadBased = isLeadBasedSupplier(supplier)
    const isTimeBased = isTimeBasedSupplier(supplier)

    // Check for multi-select pricing model
    const supplierData = supplier?.data || {}
    const isMultiSelectModel = supplierData?.pricingModel === 'multiSelect' || supplier?.pricingModel === 'multiSelect'
    // Check for per-child pricing model (catering)
    const isPerChildModel = supplierData?.pricingModel === 'perChild' || supplier?.pricingModel === 'perChild'

    // ✅ If supplierType prop is provided, use it as the primary source
    if (supplierType) {
      const isCakeFromType = supplierType === 'cakes' || supplierType.toLowerCase().includes('cake')
      const isPartyBagsFromType = supplierType === 'partyBags' || supplierType.toLowerCase().includes('party bag')
      const isBalloonsFromType = supplierType === 'balloons' || supplierType.toLowerCase().includes('balloon')
      const isFacePaintingFromType = supplierType === 'facePainting' || supplierType.toLowerCase().includes('face') || supplierType.toLowerCase().includes('painting')
      const isSoftPlayFromType = supplierType === 'activities' || supplierType === 'softPlay' || supplierType.toLowerCase().includes('soft play')
      const isBouncyCastleFromType = supplierType === 'bouncyCastle' || supplierType.toLowerCase().includes('bouncy') || supplierType.toLowerCase().includes('inflatable')
      const isCateringFromType = supplierType === 'catering' || supplierType.toLowerCase().includes('catering') || supplierType.toLowerCase().includes('lunchbox')
      const isSweetTreatsFromType = supplierType === 'sweetTreats' || supplierType.toLowerCase().includes('sweet') || supplierType.toLowerCase().includes('candy')
      const isDecorationsFromType = supplierType === 'decorations' || supplierType.toLowerCase().includes('decoration') || supplierType.toLowerCase().includes('tableware')
      const isEntertainmentFromType = supplierType === 'entertainment' || supplierType.toLowerCase().includes('entertain') || supplierType.toLowerCase().includes('magician') || supplierType.toLowerCase().includes('clown')

      // Detect if this is a venue supplier from supplierType prop or category
      const venueTypesFromProp = ['venue', 'private function room', 'community hall', 'church hall', 'village hall', 'school hall', 'sports centre', 'hotel', 'restaurant', 'pub', 'bar', 'event space']
      const supplierCategory = (supplier?.category || supplierData?.category || '').toLowerCase()
      const isVenueFromType = venueTypesFromProp.some(type => supplierType.toLowerCase().includes(type)) ||
        supplierCategory === 'venue' || supplierCategory === 'venues' ||
        venueTypesFromProp.some(type => supplierCategory.includes(type))

      // For activities/soft play and sweet treats, always treat as multi-select
      // These suppliers are inherently multi-select (users pick individual items)
      const isMultiSelectForActivities = isSoftPlayFromType || isSweetTreatsFromType

      console.log('🔍 [Type Detection] Using supplierType prop override:', {
        supplierType,
        isCake: isCakeFromType,
        isPartyBags: isPartyBagsFromType,
        isBalloons: isBalloonsFromType,
        isFacePainting: isFacePaintingFromType,
        isSoftPlay: isSoftPlayFromType,
        isBouncyCastle: isBouncyCastleFromType,
        isCatering: isCateringFromType,
        isSweetTreats: isSweetTreatsFromType,
        isDecorations: isDecorationsFromType,
        isEntertainment: isEntertainmentFromType,
        isVenue: isVenueFromType,
        isMultiSelect: isMultiSelectModel || isMultiSelectForActivities,
        hasPackages: supplierData?.packages?.length
      })

      return {
        isLeadBased,
        isTimeBased,
        isCake: isCakeFromType,
        isPartyBags: isPartyBagsFromType,
        isBalloons: isBalloonsFromType,
        isFacePainting: isFacePaintingFromType,
        isSoftPlay: isSoftPlayFromType,
        isBouncyCastle: isBouncyCastleFromType,
        isCatering: isCateringFromType,
        isSweetTreats: isSweetTreatsFromType,
        isDecorations: isDecorationsFromType,
        isEntertainment: isEntertainmentFromType,
        isVenue: isVenueFromType,
        isMultiSelect: isMultiSelectModel || isMultiSelectForActivities,
      }
    }

    // Get data from supplier.data JSONB column
    const dataObj = supplier?.data || {}
    const serviceDetails = supplier?.serviceDetails || supplier?.service_details || dataObj?.serviceDetails || dataObj?.service_details || {}

    // Detect if this is a cake supplier - check multiple fields
    // Check all possible locations where category might be stored
    const categoryStr = (
      supplier?.category ||
      dataObj?.category ||
      supplier?.data?.category ||  // Nested in data object
      supplier?.serviceType ||
      dataObj?.serviceType ||
      supplier?.service_type ||
      supplier?.subcategory ||
      ''
    ).toLowerCase()

    const isCakeSupplier =
      categoryStr.includes("cake") ||
      supplier?.type?.toLowerCase()?.includes("cake") ||
      (categoryStr.includes("catering") &&
        (serviceDetails?.cateringType?.toLowerCase()?.includes("cake") ||
          serviceDetails?.cateringType?.toLowerCase()?.includes("baker") ||
          serviceDetails?.cakeFlavors?.length > 0 ||
          serviceDetails?.cakeSpecialist === true)) ||
      `${supplier?.name || dataObj?.name || ""} ${supplier?.description || dataObj?.description || ""}`.toLowerCase().includes("cake") ||
      // Also check if serviceDetails has cake-specific fields
      serviceDetails?.cakeFlavors?.length > 0 ||
      serviceDetails?.packages?.some(p => p.serves || p.feeds) ||
      // Check data directly
      dataObj?.flavours?.length > 0 ||
      dataObj?.packages?.some(p => p.serves || p.feeds)

    // Detect if this is a party bags supplier
    const isPartyBagsSupplier =
      supplier?.category === "Party Bags" ||
      dataObj?.category === "Party Bags" ||
      supplier?.category?.toLowerCase().includes("party bag") ||
      supplier?.type?.toLowerCase().includes("party bag")

    // Detect if this is a balloon supplier
    const isBalloonsSupplier =
      categoryStr.includes("balloon") ||
      supplier?.type?.toLowerCase()?.includes("balloon")

    // Detect if this is a face painting supplier
    const isFacePaintingSupplier =
      categoryStr.includes("facepainting") ||
      categoryStr.includes("face painting") ||
      categoryStr.includes("face-painting") ||
      supplier?.type?.toLowerCase()?.includes("face") ||
      supplier?.serviceType === 'facePainting' ||
      dataObj?.serviceType === 'facePainting'

    // Detect if this is a soft play / activities supplier
    const isSoftPlaySupplier =
      categoryStr.includes("activities") ||
      categoryStr.includes("soft play") ||
      categoryStr.includes("softplay") ||
      supplier?.serviceType === 'activities' ||
      dataObj?.serviceType === 'activities'

    // Detect if this is a bouncy castle supplier
    const isBouncyCastleSupplier =
      categoryStr.includes("bouncy castle") ||
      categoryStr.includes("bouncy-castle") ||
      categoryStr.includes("bouncycastle") ||
      categoryStr.includes("inflatable") ||
      supplier?.serviceType === 'bouncyCastle' ||
      dataObj?.serviceType === 'bouncyCastle' ||
      supplier?.category === 'Bouncy Castle' ||
      dataObj?.category === 'Bouncy Castle'

    // Detect if this is a catering supplier (per-child pricing like lunchboxes)
    const isCateringSupplier =
      categoryStr.includes("catering") ||
      categoryStr.includes("lunchbox") ||
      supplier?.serviceType === 'catering' ||
      dataObj?.serviceType === 'catering' ||
      isPerChildModel

    // Detect if this is a sweet treats supplier (multi-select - candy cart, ice cream, etc.)
    const isSweetTreatsSupplier =
      categoryStr.includes("sweet treats") ||
      categoryStr.includes("sweettreats") ||
      categoryStr.includes("candy") ||
      categoryStr.includes("ice cream") ||
      supplier?.serviceType === 'sweetTreats' ||
      dataObj?.serviceType === 'sweetTreats'

    // Detect if this is a decorations/tableware supplier (per-child with buffer)
    const isDecorationsSupplier =
      categoryStr.includes("decorations") ||
      categoryStr.includes("decoration") ||
      categoryStr.includes("tableware") ||
      supplier?.serviceType === 'decorations' ||
      dataObj?.serviceType === 'decorations' ||
      dataObj?.pricingModel === 'perChildWithBuffer'

    // Detect if this is an entertainment supplier (flat 2-hour service)
    const isEntertainmentSupplier =
      categoryStr.includes("entertainment") ||
      categoryStr.includes("entertainer") ||
      categoryStr.includes("magician") ||
      categoryStr.includes("clown") ||
      supplier?.serviceType === 'entertainer' ||
      supplier?.serviceType === 'entertainment' ||
      dataObj?.serviceType === 'entertainer' ||
      dataObj?.serviceType === 'entertainment' ||
      supplier?.category === 'Entertainment'

    // Detect if this is a venue supplier
    // Venue types include: Private Function Room, Community Hall, Church Hall, etc.
    const venueTypes = ['private function room', 'community hall', 'church hall', 'school hall',
      'sports centre', 'outdoor space', 'village hall', 'hotel conference room',
      'restaurant private room', 'village green', 'community centre']
    const isVenueSupplier =
      categoryStr.includes("venue") ||
      venueTypes.some(type => categoryStr.includes(type)) ||
      supplier?.type?.toLowerCase()?.includes("venue") ||
      supplier?.serviceType === 'venue' ||
      supplier?.serviceType === 'venues' ||
      dataObj?.serviceType === 'venue' ||
      dataObj?.serviceType === 'venues' ||
      supplier?.category === 'Venue' ||
      supplier?.category === 'Venues' ||
      dataObj?.category === 'Venue' ||
      dataObj?.category === 'Venues'

    // Sweet treats also uses multi-select
    const isMultiSelectForSweetTreats = isSoftPlaySupplier || isSweetTreatsSupplier

    console.log('🔍 [Type Detection] Checking supplier type:', {
      category: categoryStr,
      rawCategory: supplier?.category,
      dataCategory: dataObj?.category,
      isCake: isCakeSupplier,
      isPartyBags: isPartyBagsSupplier,
      isBalloons: isBalloonsSupplier,
      isFacePainting: isFacePaintingSupplier,
      isSoftPlay: isSoftPlaySupplier,
      isBouncyCastle: isBouncyCastleSupplier,
      isCatering: isCateringSupplier,
      isSweetTreats: isSweetTreatsSupplier,
      isDecorations: isDecorationsSupplier,
      isEntertainment: isEntertainmentSupplier,
      isVenue: isVenueSupplier,
      isMultiSelect: isMultiSelectModel || isMultiSelectForSweetTreats,
      hasDataFlavours: dataObj?.flavours?.length > 0,
      hasDataPackages: dataObj?.packages?.length > 0,
      dataPackagesCount: dataObj?.packages?.length,
      supplierPackagesCount: supplier?.packages?.length,
    })

    return {
      isLeadBased,
      isTimeBased,
      isCake: isCakeSupplier,
      isPartyBags: isPartyBagsSupplier,
      isBalloons: isBalloonsSupplier,
      isFacePainting: isFacePaintingSupplier,
      isSoftPlay: isSoftPlaySupplier,
      isBouncyCastle: isBouncyCastleSupplier,
      isCatering: isCateringSupplier,
      isSweetTreats: isSweetTreatsSupplier,
      isDecorations: isDecorationsSupplier,
      isEntertainment: isEntertainmentSupplier,
      isVenue: isVenueSupplier,
      isMultiSelect: isMultiSelectModel || isMultiSelectForSweetTreats,
    }
  }, [supplier, supplierType])

  // ✅ UPDATED: Create comprehensive party details for pricing
  const effectivePartyDetails = useMemo(() => {
    // Priority 1: Use provided partyDetails prop
    if (partyDetails) {

      return partyDetails
    }

    // Priority 2: Build from various sources
    let date = partyDate || selectedDate
    let duration = 2 // Default
    let guestCount = null

    // Try to get from database party data
    if (userType === "DATABASE_USER" && databasePartyData) {
      if (databasePartyData.date) date = databasePartyData.date
      if (databasePartyData.duration) duration = databasePartyData.duration
      if (databasePartyData.guestCount) guestCount = databasePartyData.guestCount
  
    }

    // Try to get from localStorage
    if (!date || !guestCount || duration === 2) {
      try {
        const partyDetailsStored = localStorage.getItem("party_details")
        if (partyDetailsStored) {
          const parsed = JSON.parse(partyDetailsStored)
          if (!date && parsed.date) date = parsed.date
          if (!guestCount && parsed.guestCount) guestCount = parsed.guestCount
          if (duration === 2 && parsed.duration) duration = parsed.duration

          // Try to calculate duration from times
          if (duration === 2 && parsed.startTime && parsed.endTime) {
            duration = getPartyDuration(parsed)
          }

        }
      } catch (error) {
        console.warn("Could not get party details from localStorage:", error)
      }
    }

    // Build final party details object
    const finalDetails = {
      date: date ? new Date(date) : null,
      duration,
      guestCount,
    }


    return finalDetails
  }, [partyDetails, partyDate, selectedDate, userType, databasePartyData])

  // Get available cake flavors - check both British and American spellings
  const availableFlavors = useMemo(() => {
    if (!supplier) return DEFAULT_CAKE_FLAVORS

    // Get serviceDetails from multiple possible locations
    // Database stores data in supplier.data JSONB column
    const dataObj = supplier?.data || {}
    const serviceDetails = supplier?.serviceDetails || supplier?.service_details || dataObj?.serviceDetails || dataObj?.service_details || {}

    // Check multiple locations for flavours data
    // 1. Top level on supplier
    // 2. Inside supplier.data (database JSONB)
    // 3. Inside serviceDetails
    const flavourData =
                        // supplier?.flavours ||
                        // dataObj?.flavours ||
                        serviceDetails?.flavours ||
                        serviceDetails?.cakeFlavors ||
                        serviceDetails?.cake_flavors ||
                        []

    console.log('🎂 [Flavours] Looking for flavours:', {
      supplierFlavours: supplier?.flavours,
      dataFlavours: dataObj?.flavours,
      serviceDetailsFlavours: serviceDetails?.flavours,
      found: flavourData
    })

    if (flavourData?.length > 0) {
      return flavourData.map((flavor, index) => ({
        id: flavor.toLowerCase().replace(/\s+/g, "-"),
        name: flavor,
        popular: index < 3,
      }))
    }

    return DEFAULT_CAKE_FLAVORS
  }, [supplier])

  // Get available dietary options from supplier
  const availableDietaryOptions = useMemo(() => {
    if (!supplier) return []

    // Get serviceDetails from multiple possible locations
    // Database stores data in supplier.data JSONB column
    const dataObj = supplier?.data || {}
    const serviceDetails = supplier?.serviceDetails || supplier?.service_details || dataObj?.serviceDetails || dataObj?.service_details || {}

    // Check multiple locations for dietary info
    // 1. Top level on supplier
    // 2. Inside supplier.data (database JSONB)
    // 3. Inside serviceDetails
    const dietaryData =
                        supplier?.dietaryInfo ||
                        dataObj?.dietaryInfo ||
                        serviceDetails?.dietaryInfo ||
                        serviceDetails?.dietary_info ||
                        serviceDetails?.dietaryOptions ||
                        serviceDetails?.dietary_options ||
                        []

    console.log('🥗 [Dietary] Looking for dietary options:', {
      supplierDietary: supplier?.dietaryInfo,
      dataDietary: dataObj?.dietaryInfo,
      serviceDetailsDietary: serviceDetails?.dietaryInfo,
      found: dietaryData
    })

    if (dietaryData?.length > 0) {
      return dietaryData.map(option => ({
        id: option,
        name: DIETARY_LABELS[option] || option
      }))
    }

    return []
  }, [supplier])

  // Get cake fulfillment options from supplier
  const cakeFulfillmentOptions = useMemo(() => {
    if (!supplier) return { offersDelivery: true, offersPickup: true, deliveryFee: 0, location: '', address: null, collectionHours: null }

    // Get serviceDetails from multiple possible locations
    // Database stores data in supplier.data JSONB column
    const dataObj = supplier?.data || {}
    const serviceDetails = supplier?.serviceDetails || supplier?.service_details || dataObj?.serviceDetails || dataObj?.service_details || {}

    // Check for fulfilment in multiple locations
    const fulfilment = serviceDetails?.fulfilment ||
                       serviceDetails?.cakeFulfilment ||
                       serviceDetails?.cake_fulfilment ||
                       serviceDetails?.fulfillment ||
                       dataObj?.cakeFulfilment ||
                       dataObj?.fulfilment ||
                       {}

    // Get full address
    const address = supplier?.address || serviceDetails?.address || dataObj?.address || null

    // Get collection hours
    const collectionHours = fulfilment?.collectionHours || null

    console.log('🚚 [Fulfilment] Looking for fulfilment options:', {
      serviceDetailsFulfilment: serviceDetails?.fulfilment,
      dataFulfilment: dataObj?.fulfilment,
      dataCakeFulfilment: dataObj?.cakeFulfilment,
      found: fulfilment
    })

    return {
      offersDelivery: fulfilment?.offersDelivery ?? true,
      offersPickup: fulfilment?.offersPickup ?? true,
      deliveryFee: fulfilment?.deliveryFee ?? 0,
      deliveryRadius: fulfilment?.deliveryRadius ?? null,
      location: supplier?.location || serviceDetails?.location || dataObj?.location || '',
      address,
      collectionHours
    }
  }, [supplier])

  const calculatePackageEnhancedPrice = useMemo(() => {
    return (packagePrice) => {
      if (!supplier || !effectivePartyDetails) {
   
        return packagePrice
      }

      // ✅ REMOVED: Early return for lead-based suppliers
      // Let calculateFinalPrice handle all supplier types including lead-based

      const supplierForPricing = {
        ...supplier,
        price: packagePrice,
      }

     
      const pricing = calculateFinalPrice(supplierForPricing, effectivePartyDetails, [])

   

      return pricing.finalPrice
    }
  }, [supplier, effectivePartyDetails, supplierTypeDetection])

  // Helper to check if party date is a weekend (Fri-Sat)
  const isWeekendParty = useMemo(() => {
    const partyDateStr = effectivePartyDetails?.date || partyDate || selectedDate
    if (!partyDateStr) return false

    const date = new Date(partyDateStr)
    const dayOfWeek = date.getDay()
    // Friday = 5, Saturday = 6
    return dayOfWeek === 5 || dayOfWeek === 6
  }, [effectivePartyDetails?.date, partyDate, selectedDate])

  // Get the appropriate price for a venue package based on party date
  const getVenuePackagePrice = (pkg) => {
    if (!pkg) return 0
    // If weekend and weekendPrice exists, use it; otherwise use regular price
    if (isWeekendParty && pkg.weekendPrice) {
      return pkg.weekendPrice
    }
    return pkg.price
  }

  // ✅ UPDATED: Enhanced packages with unified pricing
  const packages = useMemo(() => {
    if (!supplier) return []

    // Get serviceDetails from multiple possible locations
    // Database stores data in supplier.data JSONB column
    const dataObj = supplier?.data || {}
    const serviceDetails = supplier?.serviceDetails || supplier?.service_details || dataObj?.serviceDetails || dataObj?.service_details || {}

    // Check multiple locations for packages (different supplier types store them differently)
    // Cake suppliers store packages in multiple places:
    // 1. supplier.packages
    // 2. supplier.data.packages (direct on JSONB data)
    // 3. supplier.data.serviceDetails.packages
    // 4. supplier.serviceDetails.packages
    const supplierPackages = supplier.packages ||
      dataObj?.packages ||
      serviceDetails?.packages ||
      []

    // Check if this is a multi-select supplier (don't limit items)
    // Use the already-computed supplierTypeDetection if available
    const isMultiSelectSupplier = supplierTypeDetection?.isMultiSelect || dataObj?.pricingModel === 'multiSelect' || supplier?.pricingModel === 'multiSelect'

    console.log('📦 [Packages] Looking for packages:', {
      supplierPackages: supplier.packages,
      dataPackages: dataObj?.packages,
      serviceDetailsPackages: serviceDetails?.packages,
      found: supplierPackages?.length,
      firstPackage: supplierPackages?.[0],
      firstPackageWhatsIncluded: supplierPackages?.[0]?.whatsIncluded,
      firstPackageFeatures: supplierPackages?.[0]?.features,
      isMultiSelect: isMultiSelectSupplier,
      supplierTypeDetectionIsMultiSelect: supplierTypeDetection?.isMultiSelect,
      supplierType,
      supplierDataKeys: Object.keys(dataObj || {}),
    })

    if (supplierPackages.length > 0) {
      // For multi-select suppliers, show all items; for others, limit to 3 (except venues and cakes which show all)
      const catLower = (supplier?.category || dataObj?.category || '').toLowerCase()
      const isVenueType = catLower.includes('venue') || catLower.includes('function room') || catLower.includes('hall')
      const isCakeType = catLower.includes('cake') || supplierTypeDetection?.isCake
      const packagesToShow = (isMultiSelectSupplier || isVenueType || isCakeType) ? supplierPackages : supplierPackages.slice(0, 3)
      return packagesToShow.map((pkg, index) => {
        const enhancedPrice = calculatePackageEnhancedPrice(pkg.price)
        return {
          id: pkg.id || `real-${index}`,
          name: pkg.name,
          price: pkg.price,
          weekendPrice: pkg.weekendPrice || null, // Venue weekend pricing
          enhancedPrice: enhancedPrice,
          duration: pkg.duration,
          image: pkg.image,
          themeImages: pkg.themeImages, // Theme-based images for decorations
          features: pkg.whatsIncluded || pkg.features || [],
          contents: pkg.contents || [], // Catering lunchbox contents
          popular: pkg.popular || index === 1,
          description: pkg.description,
          // Cake-specific fields
          serves: pkg.serves,
          feeds: pkg.feeds,
          tiers: pkg.tiers,
          sizeInches: pkg.sizeInches,
          deliveryFee: pkg.deliveryFee, // Package-level delivery fee
          // Decorations-specific fields
          packSizes: pkg.packSizes,
          pricingModel: pkg.pricingModel,
          fixedItems: pkg.fixedItems,
          // Venue-specific fields
          minGuests: pkg.minGuests,
          maxGuests: pkg.maxGuests,
          pricePerPerson: pkg.pricePerPerson, // For packages with per-person add-ons like catering
        }
      })
    }

    // No real packages found - return empty array (no fallback packages)
    console.log('📦 [Packages] No packages found for supplier, returning empty array')
    return []
  }, [supplier, calculatePackageEnhancedPrice])

  // Check multiple locations for add-on services (database stores in data JSONB)
  const availableAddons = supplier?.serviceDetails?.addOnServices ||
                          supplier?.data?.serviceDetails?.addOnServices ||
                          supplier?.addOnServices ||
                          supplier?.data?.addOnServices ||
                          []
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId)
  const selectedFlavorObj = availableFlavors.find((f) => f.id === selectedFlavor) || availableFlavors[0]

  // Decorations pack size (auto-calculated with buffer)
  const decorationsPackSize = useMemo(() => {
    const packSizes = selectedPackage?.packSizes || [8, 16, 24, 32, 40, 48]
    return getDecorationsPackSize(partyBagsQuantity, packSizes)
  }, [partyBagsQuantity, selectedPackage?.packSizes])

  // Get party theme for decorations (used for theme-based images)
  // Check multiple possible paths for theme
  const partyTheme = databasePartyData?.theme ||
                     partyDetails?.theme ||
                     partyDetails?.partyTheme ||
                     supplier?.partyTheme ||
                     'general'

  // Debug: Log theme resolution on mount for decorations
  useEffect(() => {
    if (supplierTypeDetection.isDecorations && isOpen) {
      console.log('🎭🎭🎭 DECORATIONS THEME CHECK:', {
        partyTheme,
        partyDetailsKeys: partyDetails ? Object.keys(partyDetails) : 'null',
        partyDetailsTheme: partyDetails?.theme,
        databaseTheme: databasePartyData?.theme,
        supplierPartyTheme: supplier?.partyTheme,
      })
    }
  }, [supplierTypeDetection.isDecorations, isOpen])

  // Helper to get theme-based image for decorations packages
  const getDecorationsPackageImage = (pkg) => {
    if (!pkg) return null
    // Check for theme-specific image first
    const themeKey = partyTheme?.toLowerCase()
    console.log('🎨 [Decorations Image] Theme lookup:', {
      partyTheme,
      themeKey,
      hasThemeImages: !!pkg.themeImages,
      themeImagesKeys: pkg.themeImages ? Object.keys(pkg.themeImages) : [],
      matchFound: pkg.themeImages?.[themeKey] ? 'YES' : 'NO',
      defaultImage: pkg.image?.substring?.(0, 50) || pkg.image
    })
    if (pkg.themeImages && themeKey && pkg.themeImages[themeKey]) {
      return pkg.themeImages[themeKey]
    }
    // Fall back to default image
    return typeof pkg.image === 'object' ? pkg.image.src : pkg.image
  }

  // Get display names for selected dietary options
  const selectedDietaryNames = selectedDietaryOptions.map(id => {
    const option = availableDietaryOptions.find(d => d.id === id)
    return option?.name || DIETARY_LABELS[id] || id
  })
  const dietaryDisplayName = selectedDietaryOptions.length === 0
    ? 'Standard'
    : selectedDietaryNames.join(', ')

  // ✅ UPDATED: Unified pricing calculation for modal totals
  const calculateModalPricing = useMemo(() => {
    // Multi-select suppliers (soft play) - sum up all selected items
    if (supplierTypeDetection.isMultiSelect) {
      const selectedItems = packages.filter(pkg => selectedPackageIds.includes(pkg.id))
      const itemsPrice = selectedItems.reduce((sum, item) => sum + (item.price || 0), 0)
      const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
        const addon = availableAddons.find((a) => a.id === addonId)
        return sum + (addon?.price || 0)
      }, 0)

      return {
        packagePrice: itemsPrice,
        addonsTotalPrice,
        totalPrice: itemsPrice + addonsTotalPrice,
        hasEnhancedPricing: false,
        pricingInfo: null,
        selectedItems,
      }
    }

    // Face painting has flat rate, no package selection needed
    if (supplierTypeDetection.isFacePainting) {
      const basePrice = supplier?.price || supplier?.priceFrom || 150
      const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
        const addon = availableAddons.find((a) => a.id === addonId)
        return sum + (addon?.price || 0)
      }, 0)

      return {
        packagePrice: basePrice,
        addonsTotalPrice,
        totalPrice: basePrice + addonsTotalPrice,
        hasEnhancedPricing: false,
        pricingInfo: null,
      }
    }

    if (!selectedPackage || !supplier) {
      // For venues without packages, calculate based on hourly rate × hours
      if (supplierTypeDetection.isVenue && supplier) {
        const hourlyRate = supplier.priceFrom || supplier.data?.priceFrom || 0
        const priceUnit = supplier.priceUnit || supplier.data?.priceUnit || 'per event'
        const serviceDetails = supplier.serviceDetails || supplier.data?.serviceDetails || {}
        const minimumHours = serviceDetails.pricing?.minimumBookingHours ||
                            serviceDetails.availability?.minimumBookingHours || 4

        // Calculate venue price: hourly rate × party duration (or minimum hours)
        const partyDuration = effectivePartyDetails?.duration || minimumHours
        const hoursToCharge = Math.max(partyDuration, minimumHours)

        // If priceUnit is "per hour", multiply by hours; otherwise use as flat rate
        const isHourlyRate = priceUnit?.toLowerCase().includes('hour')
        const venueBasePrice = isHourlyRate ? (hourlyRate * hoursToCharge) : hourlyRate

        console.log('🏠 Venue without packages - pricing:', {
          hourlyRate,
          priceUnit,
          isHourlyRate,
          minimumHours,
          partyDuration,
          hoursToCharge,
          venueBasePrice,
        })

        const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
          const addon = availableAddons.find((a) => a.id === addonId)
          return sum + (addon?.price || 0)
        }, 0)
        return {
          packagePrice: venueBasePrice,
          addonsTotalPrice,
          totalPrice: venueBasePrice + addonsTotalPrice,
          hasEnhancedPricing: false,
          pricingInfo: {
            isHourlyRate,
            hourlyRate,
            hoursCharged: hoursToCharge,
            minimumHours,
          },
        }
      }
      return {
        packagePrice: 0,
        addonsTotalPrice: 0,
        totalPrice: 0,
        hasEnhancedPricing: false,
        pricingInfo: null,
      }
    }

    // Use the pre-calculated enhanced price from packages
    // For cakes, use base price (delivery is added separately)
    let packagePrice = supplierTypeDetection.isCake
      ? selectedPackage.price
      : selectedPackage.enhancedPrice
    const hasEnhancedPricing = !supplierTypeDetection.isCake && packagePrice !== selectedPackage.price

    // ✅ PARTY BAGS: Adjust price based on custom quantity
    if (supplierTypeDetection.isPartyBags) {
      // selectedPackage.price is ALREADY the per-bag price
      const pricePerBag = selectedPackage.price
      packagePrice = roundMoney(pricePerBag * partyBagsQuantity)
      console.log("🎒 Party Bags custom quantity pricing:", {
        originalPrice: selectedPackage.price,
        pricePerBag,
        customQuantity: partyBagsQuantity,
        newPackagePrice: packagePrice,
      })
    }

    // ✅ CATERING: Adjust price based on number of children (uses same quantity state as party bags)
    if (supplierTypeDetection.isCatering) {
      const pricePerChild = selectedPackage.price
      packagePrice = roundMoney(pricePerChild * partyBagsQuantity)
      console.log("🍱 Catering per-child pricing:", {
        originalPrice: selectedPackage.price,
        pricePerChild,
        numberOfChildren: partyBagsQuantity,
        newPackagePrice: packagePrice,
      })
    }

    // ✅ DECORATIONS: Adjust price based on pack size (rounds up to nearest pack)
    if (supplierTypeDetection.isDecorations) {
      const pricePerSet = selectedPackage.price
      packagePrice = roundMoney(pricePerSet * decorationsPackSize)
      console.log("🎨 Decorations pack-size pricing:", {
        originalPrice: selectedPackage.price,
        pricePerSet,
        guestCount: partyBagsQuantity,
        packSize: decorationsPackSize,
        newPackagePrice: packagePrice,
      })
    }

    // ✅ VENUE: Use weekend price if applicable, plus separate catering add-on
    if (supplierTypeDetection.isVenue) {
      // Get the correct base price based on party date (weekend vs weekday)
      const partyDateStr = effectivePartyDetails?.date
      let isWeekend = false
      if (partyDateStr) {
        const date = new Date(partyDateStr)
        const dayOfWeek = date.getDay()
        isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Friday or Saturday
      }

      // Use weekend price if it's a weekend and weekend price exists
      const venueBasePrice = (isWeekend && selectedPackage.weekendPrice)
        ? selectedPackage.weekendPrice
        : selectedPackage.price

      // Add catering if a catering package is selected (from cateringPackages array)
      const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
      const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)
      const cateringPrice = selectedCatering
        ? roundMoney(selectedCatering.pricePerHead * cateringGuestCount)
        : 0

      packagePrice = venueBasePrice + cateringPrice

      console.log("🏠 Venue pricing:", {
        isWeekend,
        venueBasePrice,
        weekendPrice: selectedPackage.weekendPrice,
        selectedCateringId,
        selectedCatering: selectedCatering?.name,
        cateringGuestCount,
        cateringPrice,
        totalPackagePrice: packagePrice,
      })
    }

    // Calculate addons price - multiply by quantity for per-child addons
    const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find((a) => a.id === addonId)
      if (!addon) return sum

      // Check if addon is per-child pricing (for catering)
      // Note: data may use snake_case (per_child, per_head, per_item) or camelCase (perChild, perHead, perItem)
      const isPerChild = addon.priceType === 'perChild' || addon.priceType === 'per_child' || addon.priceType === 'per_head' || addon.priceType === 'perItem' || addon.priceType === 'per_item'
      if (isPerChild && supplierTypeDetection.isCatering) {
        return sum + roundMoney(addon.price * Number(partyBagsQuantity))
      }
      return sum + (addon.price || 0)
    }, 0)

    // Calculate delivery fee for cakes - use package-level fee if available, fallback to business-level
    let deliveryFee = 0
    if (supplierTypeDetection.isCake && fulfillmentMethod === "delivery") {
      // Package-level delivery fee takes priority over business-level
      const packageDeliveryFee = selectedPackage?.deliveryFee
      deliveryFee = packageDeliveryFee !== undefined && packageDeliveryFee !== null && packageDeliveryFee !== ''
        ? parseFloat(packageDeliveryFee) || 0
        : cakeFulfillmentOptions.deliveryFee || 0
    }

    // Calculate cupcakes price for cakes
    let cupcakesPrice = 0
    if (supplierTypeDetection.isCake && selectedCupcakeOption) {
      const cupcakePrices = { box6: 20, box12: 30, box24: 50 }
      cupcakesPrice = cupcakePrices[selectedCupcakeOption] || 0
    }

    // Final totals - use roundMoney to prevent floating point issues
    const totalPrice = roundMoney(packagePrice + addonsTotalPrice + deliveryFee + cupcakesPrice)

    return {
      packagePrice,
      addonsTotalPrice,
      deliveryFee,
      cupcakesPrice,
      totalPrice,
      hasEnhancedPricing,
      pricingInfo: hasEnhancedPricing
        ? {
            originalPrice: selectedPackage.price,
            finalPrice: packagePrice,
            isTimeBased: supplierTypeDetection.isTimeBased,
            isLeadBased: supplierTypeDetection.isLeadBased,
            duration: effectivePartyDetails?.duration,
          }
        : null,
    }
  }, [selectedPackage, supplier, selectedAddons, availableAddons, supplierTypeDetection, effectivePartyDetails, partyBagsQuantity, fulfillmentMethod, cakeFulfillmentOptions, selectedPackageIds, packages, decorationsPackSize, selectedCateringId, cateringGuestCount, selectedCupcakeOption])

  // Use the calculated totals
  const totalPrice = calculateModalPricing.totalPrice

  // ✅ EDIT MODE: Calculate price difference
  const priceDiff = useMemo(() => {
    if (mode !== "edit" || originalTotalPrice === null) return 0
    return totalPrice - originalTotalPrice
  }, [mode, originalTotalPrice, totalPrice])

  // ✅ Initialize cake customization from existing data or defaults
  useEffect(() => {
    if (isOpen && availableFlavors.length > 0) {
      // Check if supplier already has cake customization data
      const existingCakeData = supplier?.packageData?.cakeCustomization;

      if (existingCakeData) {
        // Restore previous customization
        setSelectedFlavor(existingCakeData.flavor || availableFlavors[0].id);
        // Handle both old single dietary and new array format
        const existingDietary = existingCakeData.dietaryOptions || existingCakeData.dietary;
        if (Array.isArray(existingDietary)) {
          setSelectedDietaryOptions(existingDietary);
        } else if (existingDietary && existingDietary !== 'standard') {
          setSelectedDietaryOptions([existingDietary]);
        } else {
          setSelectedDietaryOptions([]);
        }
        setCustomMessage(existingCakeData.customMessage || "");
        // Restore fulfillment method (delivery or pickup)
        if (existingCakeData.fulfillmentMethod) {
          setFulfillmentMethod(existingCakeData.fulfillmentMethod);
        }
        // Restore cupcake selection
        if (existingCakeData.cupcakeOption) {
          setSelectedCupcakeOption(existingCakeData.cupcakeOption);
        }
      } else {
        // Set default flavor only on first open
        setSelectedFlavor(availableFlavors[0].id);
        setSelectedDietaryOptions([]);
        setCustomMessage("");
        setFulfillmentMethod("delivery"); // Default to delivery
        setSelectedCupcakeOption(null); // No cupcakes by default
      }
    }

    // Reset when modal closes
    if (!isOpen) {
      setSelectedDietaryOptions([]);
      setCustomMessage("");
      setFulfillmentMethod("delivery");
      setSelectedCupcakeOption(null);
    }
  }, [isOpen, availableFlavors, supplier])

  // ✅ Helper function to find best matching package for party theme
  const findThemeMatchingPackage = (packages, partyTheme) => {
    if (!partyTheme || !packages.length) return null

    const themeLower = partyTheme.toLowerCase()

    // Find package with themeMatch array that includes this theme
    for (const pkg of packages) {
      if (pkg.themeMatch && Array.isArray(pkg.themeMatch)) {
        const matches = pkg.themeMatch.some(t =>
          themeLower.includes(t.toLowerCase()) || t.toLowerCase().includes(themeLower)
        )
        if (matches) {
          console.log('🎨 [Theme Match] Found matching package:', pkg.name, 'for theme:', partyTheme)
          return pkg.id
        }
      }
    }

    // Fallback: check package name/id for theme keywords
    for (const pkg of packages) {
      const pkgNameLower = (pkg.name || pkg.id || '').toLowerCase()
      if (themeLower.includes('spider') || themeLower.includes('superhero') || themeLower.includes('avenger') || themeLower.includes('marvel')) {
        if (pkgNameLower.includes('superhero') || pkgNameLower.includes('hero')) return pkg.id
      }
      if (themeLower.includes('princess') || themeLower.includes('frozen') || themeLower.includes('fairy') || themeLower.includes('unicorn')) {
        if (pkgNameLower.includes('princess') || pkgNameLower.includes('fantasy')) return pkg.id
      }
      if (themeLower.includes('safari') || themeLower.includes('jungle') || themeLower.includes('animal') || themeLower.includes('dinosaur')) {
        if (pkgNameLower.includes('animal') || pkgNameLower.includes('kingdom')) return pkg.id
      }
    }

    return null
  }

  // ✅ Initialize selected package when modal opens or supplier changes
  useEffect(() => {
    if (isOpen && packages.length > 0) {
      // ✅ For multi-select (soft play/activities): Restore previously selected items
      if (supplierTypeDetection.isMultiSelect) {
        const existingSelectedIds = supplier?.packageData?.selectedItemIds ||
                                     supplier?.packageData?.selectedItems?.map(item => item.id) ||
                                     [];

        if (existingSelectedIds.length > 0) {
          // Verify the items still exist in packages
          const validIds = existingSelectedIds.filter(id =>
            packages.some(pkg => pkg.id === id)
          );
          if (validIds.length > 0) {
            console.log('🎯 [Auto-Select] Restoring multi-select items:', validIds)
            setSelectedPackageIds(validIds);
            return;
          }
        }
        // Don't set any default for multi-select - let user choose
        setSelectedPackageIds([]);
        return;
      }

      // Check if supplier already has a selected package by ID
      const existingPackageId = supplier?.packageData?.id || supplier?.packageId;

      if (existingPackageId) {
        // Verify the package still exists in the packages array
        const packageExists = packages.some(pkg => pkg.id === existingPackageId);
        if (packageExists) {
          setSelectedPackageId(existingPackageId);
          return;
        }
      }

      // ✅ For cakes: Check if party builder selected a package via cakeCustomization
      if (supplierTypeDetection.isCake) {
        const cakeCustomization = supplier?.packageData?.cakeCustomization;

        // First try to match by packageId (new format)
        if (cakeCustomization?.packageId) {
          const packageExists = packages.some(pkg => pkg.id === cakeCustomization.packageId);
          if (packageExists) {
            console.log('🎂 [Auto-Select] Setting cake package based on cakeCustomization.packageId:', cakeCustomization.packageId)
            setSelectedPackageId(cakeCustomization.packageId);
            return;
          }
        }

        // Fallback: match by size/name (legacy format)
        const existingCakeSize = cakeCustomization?.size;
        if (existingCakeSize) {
          // Find the package by name
          const matchingPackage = packages.find(pkg =>
            pkg.name === existingCakeSize ||
            pkg.name?.toLowerCase() === existingCakeSize?.toLowerCase()
          );
          if (matchingPackage) {
            console.log('🎂 [Auto-Select] Setting cake package based on cakeCustomization.size:', existingCakeSize, '->', matchingPackage.id)
            setSelectedPackageId(matchingPackage.id);
            return;
          }
        }
      }

      // ✅ For face painting and balloons, try to auto-select based on party theme
      if (supplierTypeDetection.isFacePainting || supplierTypeDetection.isBalloons) {
        const partyTheme = databasePartyData?.theme || partyDetails?.theme
        if (partyTheme) {
          const themeMatchedPackageId = findThemeMatchingPackage(packages, partyTheme)
          if (themeMatchedPackageId) {
            console.log('🎨 [Auto-Select] Setting package based on party theme:', partyTheme, '->', themeMatchedPackageId)
            setSelectedPackageId(themeMatchedPackageId)
            return
          }
        }
      }

      // Default to first package if no existing selection or theme match
      setSelectedPackageId(packages[0].id)
    }

    // Reset when modal closes
    if (!isOpen) {
      setSelectedPackageId(null);
      setSelectedPackageIds([]);
      setSelectedCateringId(null);
      setCateringGuestCount(20);
    }
  }, [isOpen, packages, supplier, supplierTypeDetection.isFacePainting, supplierTypeDetection.isBalloons, supplierTypeDetection.isCake, supplierTypeDetection.isMultiSelect, databasePartyData?.theme, partyDetails?.theme])

  // ✅ Restore previously selected addons when modal opens/closes
  useEffect(() => {
    if (isOpen && supplier) {
      // Check if supplier has previously selected addons
      const existingAddons = supplier?.selectedAddons || supplier?.packageData?.selectedAddons || [];

      if (existingAddons.length > 0) {
        const existingAddonIds = existingAddons.map(addon => addon.id);

        setSelectedAddons(existingAddonIds);
      } else {
        // Reset addons if no existing selection
        setSelectedAddons([]);
      }
    }

    // Reset when modal closes
    if (!isOpen) {
      setSelectedAddons([]);
      setSpecialRequests("");
    }
  }, [isOpen, supplier])

  // ✅ Restore venue catering selection when modal opens
  useEffect(() => {
    if (isOpen && supplier && supplierTypeDetection.isVenue) {
      // Check if supplier has previously selected catering via venueMetadata
      const venueMetadata = supplier?.packageData?.venueMetadata || supplier?.venueMetadata

      if (venueMetadata?.selectedCateringId) {
        console.log('🏠 [Venue] Restoring catering selection:', venueMetadata)
        setSelectedCateringId(venueMetadata.selectedCateringId)
        if (venueMetadata.cateringGuestCount) {
          setCateringGuestCount(venueMetadata.cateringGuestCount)
        }
      }
    }
  }, [isOpen, supplier, supplierTypeDetection.isVenue])

  if (!supplier) return null

  const handleAddonToggle = (addonId) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  // ✅ UPDATED: Handle add to plan with unified pricing data
  const handleAddToPlan = () => {
    console.log('🚀 [CustomizationModal] handleAddToPlan called', {
      supplierTypeDetection,
      selectedPackageIds,
      selectedPackageId,
      calculateModalPricing,
    })

    // Get selected addon objects
    const selectedAddonObjects = selectedAddons
      .map((addonId) => {
        const addon = availableAddons.find((addon) => addon.id === addonId)
        if (!addon) return null

        return {
          ...addon,
          supplierId: supplier.id,
          supplierName: supplier.name,
          attachedToSupplier: true,
          isSupplierAddon: true,
          supplierType: supplier.category,
          addedAt: new Date().toISOString(),
          displayId: `${supplier.id}-${addon.id}`,
        }
      })
      .filter(Boolean)

    // Create enhanced package with unified pricing data
    let finalPackage = selectedPackage

    if (supplierTypeDetection.isCake) {
      finalPackage = {
        ...selectedPackage,

        // ✅ UPDATED: Use unified pricing
        price: selectedPackage.price, // Keep original price (cake base price)
        originalPrice: selectedPackage.price,
        totalPrice: calculateModalPricing.totalPrice, // Total including delivery fee
        enhancedPrice: calculateModalPricing.totalPrice, // Total including delivery fee

        // Payment and delivery info
        paymentType: "full_payment",
        deliveryExpectation: "pre_party_delivery",
        supplierContactRequired: true,

        // Enhanced cake customization data
        cakeCustomization: {
          // Size/package info
          size: selectedPackage.name,
          servings: selectedPackage.serves || selectedPackage.feeds || null,
          tiers: selectedPackage.tiers || null,
          sizeInches: selectedPackage.sizeInches || null,
          packageDescription: selectedPackage.description || null,
          // Flavor and dietary
          flavor: selectedFlavor,
          flavorName: selectedFlavorObj?.name || "Custom Flavor",
          dietaryOptions: selectedDietaryOptions, // Array of selected dietary options
          dietaryNames: selectedDietaryNames, // Array of display names
          dietaryName: dietaryDisplayName, // Comma-separated string for display
          customMessage: customMessage.trim(),
          customizationType: "cake_specialist",
          // Fulfillment
          fulfillmentMethod: fulfillmentMethod,
          deliveryFee: fulfillmentMethod === "delivery" ? calculateModalPricing.deliveryFee : 0,
          pickupLocation: fulfillmentMethod === "pickup" ? cakeFulfillmentOptions.location : null,
          // Matching cupcakes
          cupcakeOption: selectedCupcakeOption,
          cupcakesPrice: calculateModalPricing.cupcakesPrice || 0,
          // Pricing
          basePrice: selectedPackage.price,
          totalPrice: calculateModalPricing.totalPrice,
        },

        // Update package features
        features: [
          ...(selectedPackage.features || []),
          `${selectedFlavorObj?.name || "Custom"} flavour`,
          ...(selectedDietaryOptions.length > 0 ? [dietaryDisplayName] : []),
          "Professional cake decoration",
          "Pre-party delivery included",
        ],

        // Update description
        description: selectedPackage.description
          ? `${selectedPackage.description} - ${selectedFlavorObj?.name || "Custom"} flavor`
          : `${selectedFlavorObj?.name || "Custom"} cake`,

        packageType: "cake",
        supplierType: "cake_specialist",

        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
      }
    } else if (supplierTypeDetection.isPartyBags) {
      // ✅ PARTY BAGS: Include quantity and per-bag pricing
      // selectedPackage.price is ALREADY the per-bag price
      const pricePerBag = selectedPackage.price

      // Get theme-based image for party bags (like decorations)
      const partyTheme = partyDetails?.theme
      const themeKey = partyTheme?.toLowerCase().replace(/\s+/g, '-')
      let partyBagsThemeImage = null
      if (selectedPackage.themeImages && themeKey && selectedPackage.themeImages[themeKey]) {
        partyBagsThemeImage = selectedPackage.themeImages[themeKey]
      }

      finalPackage = {
        ...selectedPackage,
        price: pricePerBag, // Store per-bag price
        originalPrice: pricePerBag,
        enhancedPrice: calculateModalPricing.totalPrice, // Total including addons for display
        totalPrice: calculateModalPricing.totalPrice, // Total including addons for display
        // Override image with theme-based image if available
        image: partyBagsThemeImage || selectedPackage.image,
        // Preserve themeImages for dynamic theme switching on card
        themeImages: selectedPackage.themeImages || {},
        // Store the party theme for reference
        partyTheme: partyTheme,
        // Party bags specific data
        partyBagsQuantity: partyBagsQuantity,
        guestCount: partyDetails?.guestCount || 10,
        pricePerBag: pricePerBag,
        // ✅ CRITICAL: Include partyBagsMetadata for pricing calculations
        // totalPrice should be BASE price (without addons) for unifiedPricing
        // Addons are handled separately by calculateFinalPrice
        partyBagsMetadata: {
          quantity: partyBagsQuantity,
          pricePerBag: pricePerBag,
          totalPrice: calculateModalPricing.packagePrice, // ✅ BASE price only (no addons)
          addonsTotal: calculateModalPricing.addonsTotalPrice, // Track addons separately for reference
        },
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
      }
    } else if (supplierTypeDetection.isCatering) {
      // ✅ CATERING: Include quantity and per-child pricing (similar to party bags)
      const pricePerChild = selectedPackage.price
      finalPackage = {
        ...selectedPackage,
        price: pricePerChild, // Store per-child price
        originalPrice: pricePerChild,
        enhancedPrice: calculateModalPricing.totalPrice, // Total including addons for display
        totalPrice: calculateModalPricing.totalPrice, // Total including addons for display
        // Catering specific data
        cateringQuantity: partyBagsQuantity,
        guestCount: partyDetails?.guestCount || 10,
        pricePerChild: pricePerChild,
        // Include cateringMetadata for pricing calculations
        // ✅ IMPORTANT: totalPrice should be BASE price (without addons) for unifiedPricing
        // Addons are handled separately by calculateFinalPrice
        cateringMetadata: {
          quantity: partyBagsQuantity,
          pricePerChild: pricePerChild,
          totalPrice: calculateModalPricing.packagePrice, // ✅ BASE price only (no addons)
          addonsTotal: calculateModalPricing.addonsTotalPrice, // Track addons separately for reference
          deliveryIncluded: true,
          deliveryTiming: 'Evening before party (5-8pm)',
        },
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
      }
    } else if (supplierTypeDetection.isDecorations) {
      // ✅ DECORATIONS: Include pack size and per-set pricing (rounds up to pack size)
      const pricePerSet = selectedPackage.price
      // Get theme-based image for the selected package
      const themeBasedImage = getDecorationsPackageImage(selectedPackage)
      finalPackage = {
        ...selectedPackage,
        price: pricePerSet, // Store per-set price
        originalPrice: pricePerSet,
        enhancedPrice: calculateModalPricing.packagePrice,
        totalPrice: calculateModalPricing.packagePrice,
        // Override image with theme-based image
        image: themeBasedImage || selectedPackage.image,
        // Preserve themeImages for dynamic theme switching on card
        themeImages: selectedPackage.themeImages || {},
        // Store the party theme for reference
        partyTheme: partyTheme,
        // Decorations specific data
        guestCount: partyBagsQuantity,
        packSize: decorationsPackSize,
        pricePerSet: pricePerSet,
        bufferCount: decorationsPackSize - partyBagsQuantity,
        // Include decorationsMetadata for pricing calculations
        decorationsMetadata: {
          guestCount: partyBagsQuantity,
          packSize: decorationsPackSize,
          pricePerSet: pricePerSet,
          totalPrice: calculateModalPricing.packagePrice,
          bufferCount: decorationsPackSize - partyBagsQuantity,
          fixedItems: selectedPackage.fixedItems || [],
        },
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
      }
    } else if (supplierTypeDetection.isFacePainting) {
      // ✅ FACE PAINTING: Flat rate with theme-based designs
      const partyTheme = databasePartyData?.theme || partyDetails?.theme || 'general'
      // Check both supplier.themeDesigns and supplier.data.themeDesigns
      const allThemeDesigns = supplier?.themeDesigns || supplier?.data?.themeDesigns || {}
      const themeDesigns = allThemeDesigns[partyTheme.toLowerCase()] || allThemeDesigns.general
      const basePrice = supplier?.price || supplier?.priceFrom || supplier?.data?.price || 150

      finalPackage = {
        id: 'face-painting-flat',
        name: 'Face Painting',
        price: basePrice,
        originalPrice: basePrice,
        enhancedPrice: calculateModalPricing.packagePrice,
        totalPrice: calculateModalPricing.totalPrice,
        duration: supplier?.duration || supplier?.data?.duration || '2 hours',
        // Theme-specific data
        partyTheme: partyTheme,
        themeDesigns: themeDesigns?.featured || [],
        image: themeDesigns?.image || supplier?.coverPhoto || supplier?.data?.coverPhoto || supplier?.image || supplier?.data?.image,
        description: themeDesigns?.description || 'Professional face painting',
        // Include classic designs info
        classicDesigns: supplier?.classicDesigns || supplier?.data?.classicDesigns || [],
        features: [
          'Professional face painter',
          'FDA-approved hypoallergenic paints',
          'Theme-specific designs',
          'Classic designs available',
          'All equipment provided'
        ],
        enhancedPricing: null,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: false,
        isLeadBased: true,
      }
    } else if (supplierTypeDetection.isMultiSelect) {
      // ✅ MULTI-SELECT (Soft Play): Multiple items selected
      const selectedItems = packages.filter(pkg => selectedPackageIds.includes(pkg.id))
      const firstItem = selectedItems[0] || {}

      console.log('🎯 [Multi-Select] Building finalPackage:', {
        selectedItems: selectedItems.map(i => ({ id: i.id, name: i.name, image: i.image })),
        firstItem: { id: firstItem.id, name: firstItem.name, image: firstItem.image },
      })

      finalPackage = {
        id: 'multi-select-bundle',
        name: selectedItems.map(item => item.name).join(' + '),
        price: calculateModalPricing.packagePrice,
        originalPrice: calculateModalPricing.packagePrice,
        enhancedPrice: calculateModalPricing.packagePrice,
        totalPrice: calculateModalPricing.totalPrice,
        duration: firstItem.duration || '2 hours',
        // Store all selected items
        selectedItems: selectedItems,
        selectedItemIds: selectedPackageIds,
        // Use first item's image for the card
        image: firstItem.image || supplier?.coverPhoto || supplier?.data?.coverPhoto,
        description: `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected`,
        features: selectedItems.map(item => item.name),
        enhancedPricing: null,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: false,
        isLeadBased: true,
        isMultiSelect: true,
      }
    } else if (supplierTypeDetection.isVenue) {
      // ✅ VENUE: Include catering selection and guest count
      const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
      const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)

      // Handle venues without packages - calculate based on hourly rate × hours
      const serviceDetails = supplier.serviceDetails || supplier.data?.serviceDetails || {}
      const hourlyRate = supplier.priceFrom || supplier.data?.priceFrom || 0
      const priceUnit = supplier.priceUnit || supplier.data?.priceUnit || 'per event'
      const minimumHours = serviceDetails.pricing?.minimumBookingHours ||
                          serviceDetails.availability?.minimumBookingHours || 4
      const partyDuration = effectivePartyDetails?.duration || minimumHours
      const hoursToCharge = Math.max(partyDuration, minimumHours)
      const isHourlyRate = priceUnit?.toLowerCase().includes('hour')

      // Use package price if available, otherwise calculate from hourly rate
      const venueBasePrice = selectedPackage?.price ||
                            (isHourlyRate ? (hourlyRate * hoursToCharge) : hourlyRate)

      // Build package name based on hours if no package
      const packageName = selectedPackage?.name ||
                         (isHourlyRate ? `${hoursToCharge} Hour Venue Hire` : 'Venue Hire')

      finalPackage = {
        ...(selectedPackage || {}),
        id: selectedPackage?.id || 'venue-base',
        name: packageName,
        price: venueBasePrice,
        originalPrice: venueBasePrice,
        enhancedPrice: calculateModalPricing.packagePrice,
        // ✅ FIX: Use packagePrice (base only) not totalPrice (which includes addons)
        // Addons are handled separately by unifiedPricing's calculateFinalPrice
        totalPrice: calculateModalPricing.packagePrice,
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
        // ✅ Store venue pricing metadata for hourly venues
        venueMetadata: {
          selectedCateringId: selectedCateringId,
          cateringGuestCount: cateringGuestCount,
          selectedCateringName: selectedCatering?.name || null,
          cateringPricePerHead: selectedCatering?.pricePerHead || 0,
          cateringTotalPrice: selectedCatering ? (selectedCatering.pricePerHead * cateringGuestCount) : 0,
          // Hourly rate info for venues without packages
          isHourlyRate: !selectedPackage && isHourlyRate,
          hourlyRate: !selectedPackage ? hourlyRate : null,
          hoursCharged: !selectedPackage ? hoursToCharge : null,
          minimumHours: !selectedPackage ? minimumHours : null,
        },
      }
    } else {
      // ✅ UPDATED: For non-cake, non-party-bags suppliers, still apply unified pricing
      // ✅ FIX: Use packagePrice (base only) - addons are handled separately by calculateFinalPrice
      finalPackage = {
        ...selectedPackage,
        price: selectedPackage.price, // Keep original price
        originalPrice: selectedPackage.price,
        enhancedPrice: calculateModalPricing.packagePrice, // Store enhanced price separately
        totalPrice: calculateModalPricing.packagePrice, // ✅ FIXED: Base price only, addons handled by unifiedPricing
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
      }
    }

    console.log('🎯 [CustomizationModal] handleConfirm - finalPackage:', {
      finalPackage,
      calculateModalPricing,
      supplierTypeDetection,
      selectedPackageIds,
    })

    const dataToSend = {
      supplier: {
        ...supplier,
        // ✅ FIX: Don't override the supplier's base price
        originalPrice: supplier.price || supplier.priceFrom,
        weekendPremium: supplier.weekendPremium,
        extraHourRate: supplier.extraHourRate,
        isLeadBased: supplierTypeDetection.isLeadBased,
        isTimeBased: supplierTypeDetection.isTimeBased,
        // ✅ Add partyBagsMetadata for easy access in cards
        ...(supplierTypeDetection.isPartyBags && {
          partyBagsMetadata: {
            quantity: partyBagsQuantity,
            pricePerBag: selectedPackage.price,
            totalPrice: calculateModalPricing.packagePrice,
          },
        }),
        // ✅ Add cateringMetadata for easy access in cards
        ...(supplierTypeDetection.isCatering && {
          cateringMetadata: {
            quantity: partyBagsQuantity,
            pricePerChild: selectedPackage.price,
            totalPrice: calculateModalPricing.packagePrice,
            deliveryIncluded: true,
            deliveryTiming: 'Evening before party (5-8pm)',
          },
        }),
        // ✅ Add decorationsMetadata for easy access in cards
        ...(supplierTypeDetection.isDecorations && {
          decorationsMetadata: {
            guestCount: partyBagsQuantity,
            packSize: decorationsPackSize,
            pricePerSet: selectedPackage.price,
            totalPrice: calculateModalPricing.packagePrice,
            bufferCount: decorationsPackSize - partyBagsQuantity,
            fixedItems: selectedPackage.fixedItems || [],
          },
        }),
        // ✅ Add entertainmentMetadata for special requests
        ...(supplierTypeDetection.isEntertainment && {
          entertainmentMetadata: {
            specialRequests: specialRequests.trim(),
            duration: 2, // Standardised 2-hour party
            totalPrice: calculateModalPricing.totalPrice,
          },
        }),
        // ✅ Add facePaintingMetadata for special requests
        ...(supplierTypeDetection.isFacePainting && {
          facePaintingMetadata: {
            specialRequests: specialRequests.trim(),
            partyTheme: databasePartyData?.theme || partyDetails?.theme || 'general',
            duration: 2, // Standardised 2-hour party
            totalPrice: calculateModalPricing.totalPrice,
          },
        }),
        // ✅ Add venueMetadata for catering selection
        ...(supplierTypeDetection.isVenue && {
          venueMetadata: {
            selectedCateringId: selectedCateringId,
            cateringGuestCount: cateringGuestCount,
            selectedCateringName: (() => {
              const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
              const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)
              return selectedCatering?.name || null
            })(),
            totalPrice: calculateModalPricing.totalPrice,
          },
        }),
      },
      package: finalPackage,
      addons: selectedAddonObjects,
      totalPrice: calculateModalPricing.totalPrice,
      autoEnquiry: false,
    }

   

    try {
      // ✅ EDIT MODE: Call appropriate handler based on mode
      if (mode === "edit" && onSaveChanges) {
        onSaveChanges(dataToSend)
      } else {
        onAddToPlan(dataToSend)
      }
      onClose()
    } catch (error) {
      console.error("Error calling handler:", error)
    }
  }

  const getButtonText = () => {
    if (isAdding) {
      return mode === "edit" ? "Saving..." : "Adding..."
    }

    if (!canAddCheck.canAdd && mode !== "edit") {
      return currentPhase === "awaiting_responses" ? "Slot Occupied" : "Enquiry Pending"
    }

    // Edit mode button text
    if (mode === "edit") {
      if (priceDiff > 0) {
        return `Save Changes (+£${priceDiff.toFixed(2)})`
      } else if (priceDiff < 0) {
        return `Save Changes (-£${Math.abs(priceDiff).toFixed(2)})`
      }
      return "Save Changes"
    }

    const formattedPrice = totalPrice.toFixed(2)

    if (supplierTypeDetection.isCake) {
      return `Book Cake - £${formattedPrice}`
    }

    if (supplierTypeDetection.isBalloons) {
      return `Book Balloons - £${formattedPrice}`
    }

    if (supplierTypeDetection.isFacePainting) {
      return `Book Face Painting - £${formattedPrice}`
    }

    if (supplierTypeDetection.isSoftPlay) {
      return `Book Soft Play - £${formattedPrice}`
    }

    if (supplierTypeDetection.isSweetTreats) {
      return `Book Sweet Treats - £${formattedPrice}`
    }

    if (supplierTypeDetection.isCatering) {
      return `Book Catering - £${formattedPrice}`
    }

    if (supplierTypeDetection.isMultiSelect) {
      return `Book Selection - £${formattedPrice}`
    }

    return `Book Service - £${formattedPrice}`
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-0 lg:p-4 lg:flex lg:items-center lg:justify-center"
      onClick={onClose}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:mx-auto bg-white rounded-t-2xl lg:rounded-xl max-w-5xl w-full max-h-[90vh] lg:max-h-[85vh] overflow-hidden shadow-xl flex flex-col animate-in slide-in-from-bottom lg:fade-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Split Layout Container */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">

          {/* Left Side - Image (sticky on desktop) */}
          <div className="lg:w-[45%] lg:flex-shrink-0 bg-gray-100">
            {/* Mobile: taller image at top with overlaid header */}
            <div
              className="lg:hidden relative w-full h-56 bg-gray-900 overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(supplierImages.length)}
            >
              {supplierImages.length > 0 ? (
                <>
                  {/* Blurred background image - fills the space with colors */}
                  <div className="absolute inset-0">
                    <Image
                      src={supplierImages[carouselIndex] || supplierImages[0]}
                      alt=""
                      fill
                      className="object-cover blur-2xl scale-110"
                      sizes="100vw"
                      priority={false}
                    />
                    {/* Dark overlay to ensure image pops */}
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  {/* Main image - full visible with contain */}
                  <div className="absolute inset-0 z-10">
                    <Image
                      src={supplierImages[carouselIndex] || supplierImages[0]}
                      alt={`${supplier.name} - Image ${carouselIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                  {/* Mobile navigation arrows */}
                  {supplierImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCarouselIndex(prev => prev === 0 ? supplierImages.length - 1 : prev - 1)
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCarouselIndex(prev => prev === supplierImages.length - 1 ? 0 : prev + 1)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                  {/* Mobile bottom gradient with supplier name */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-8 pb-3 px-4">
                    <h2 className="text-white font-bold text-lg truncate">{supplier.name}</h2>
                    {supplierImages.length > 1 && (
                      <div className="flex gap-2 mt-2">
                        {supplierImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCarouselIndex(idx)
                            }}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === carouselIndex ? "bg-white scale-110" : "bg-white/50"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Mobile close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  {/* Mobile fullscreen button with image counter */}
                  <button
                    onClick={() => {
                      setLightboxIndex(carouselIndex)
                      setShowLightbox(true)
                    }}
                    className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">
                      {supplierImages.length > 1 ? `${carouselIndex + 1}/${supplierImages.length}` : 'View'}
                    </span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Desktop: taller image panel with blurred background */}
            <div className="hidden lg:block relative w-full h-full min-h-[500px] bg-gray-900 overflow-hidden">
              {supplierImages.length > 0 ? (
                <>
                  {/* Blurred background image */}
                  <Image
                    src={supplierImages[carouselIndex] || supplierImages[0]}
                    alt=""
                    fill
                    className="object-cover blur-xl scale-110 opacity-50"
                    sizes="50vw"
                  />

                  {/* Main centered image */}
                  <Image
                    src={supplierImages[carouselIndex] || supplierImages[0]}
                    alt={`${supplier.name} - Image ${carouselIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="45vw"
                    priority
                  />

                  {/* Desktop navigation arrows */}
                  {supplierImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCarouselIndex(prev => prev > 0 ? prev - 1 : supplierImages.length - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 hover:bg-white transition-all duration-200 z-20"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={() => setCarouselIndex(prev => prev < supplierImages.length - 1 ? prev + 1 : 0)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 hover:bg-white transition-all duration-200 z-20"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Desktop navigation dots */}
                  {supplierImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {supplierImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            setCarouselIndex(idx)
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 hover:scale-110 ${idx === carouselIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"}`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image counter */}
                  {supplierImages.length > 1 && (
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <span className="text-white text-xs font-medium">{carouselIndex + 1}/{supplierImages.length}</span>
                    </div>
                  )}

                  {/* Fullscreen button */}
                  <button
                    onClick={() => {
                      setLightboxIndex(carouselIndex)
                      setShowLightbox(true)
                    }}
                    className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 transition-all shadow-lg"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">View</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Content (scrollable) */}
          <div className="flex-1 flex flex-col lg:border-l border-gray-200 min-w-0" style={{ minHeight: 0 }}>
            {/* Desktop Header with action buttons */}
            <div className="hidden lg:flex p-4 items-center justify-between flex-shrink-0 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {supplier.name || supplier.data?.name || 'Supplier'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto min-w-0" style={{ minHeight: 0 }}>

            {/* About Section - Skip for venues (VenueDisplay has its own) */}
            {!supplierTypeDetection.isVenue && (() => {
              // Prioritize serviceDetails.aboutUs as it contains the detailed about content
              const description = supplier?.serviceDetails?.aboutUs ||
                                 supplier?.serviceDetails?.description ||
                                 supplier?.description ||
                                 supplier?.businessDescription || ''

              if (!description) return null

              // Check if description is long enough to need truncation (roughly 150 chars)
              const needsTruncation = description.length > 150

              return (
                <div className="px-5 lg:px-6 pt-5 pb-4 border-b border-gray-100">
                  {/* Desktop: always show full text */}
                  <p className="hidden lg:block text-sm text-gray-600 leading-relaxed">
                    {description}
                  </p>
                  {/* Mobile: truncate with "more" button */}
                  <div className="lg:hidden">
                    <p className={`text-sm text-gray-600 leading-relaxed ${!isAboutExpanded && needsTruncation ? 'line-clamp-3' : ''}`}>
                      {description}
                    </p>
                    {needsTruncation && (
                      <button
                        onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-1"
                      >
                        {isAboutExpanded ? 'Show less' : 'More'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}

            <div className="p-5 lg:p-6 space-y-6 min-w-0">
            {/* Cake Suppliers - Single Page Form */}
            {supplierTypeDetection.isCake && (
              <section className="space-y-5">
                {/* Choose Size - Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Cake Size
                  </label>
                  <Select
                    value={selectedPackageId || ''}
                    onValueChange={(value) => setSelectedPackageId(value)}
                  >
                    <SelectTrigger className="w-full h-11 text-sm font-normal bg-white border-gray-200 rounded-lg px-4">
                      <SelectValue placeholder="Select a size">
                        {selectedPackage && (
                          <span className="text-gray-700 font-normal">
                            {selectedPackage.name}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id} className="py-2.5 text-sm font-normal">
                          <span className="text-gray-700">{pkg.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Flavour Selection - Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Cake Flavour
                  </label>
                  {availableFlavors.length === 0 ? (
                    <p className="text-sm text-gray-500">Contact baker for flavour options</p>
                  ) : (
                    <Select
                      value={selectedFlavor || ''}
                      onValueChange={(value) => setSelectedFlavor(value)}
                    >
                      <SelectTrigger className="w-full h-11 text-sm font-normal bg-white border-gray-200 rounded-lg px-4">
                        <SelectValue placeholder="Select a flavour">
                          {selectedFlavor && (
                            <span className="text-gray-700 font-normal">
                              {availableFlavors.find(f => f.id === selectedFlavor)?.name || selectedFlavor}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableFlavors.map((flavor) => (
                          <SelectItem key={flavor.id} value={flavor.id} className="py-2.5 text-sm font-normal">
                            <span className="text-gray-700">{flavor.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Matching Cupcakes - Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Matching Cupcakes
                    <span className="font-normal normal-case tracking-normal text-gray-500 ml-1">(optional)</span>
                  </label>
                  <Select
                    value={selectedCupcakeOption || 'none'}
                    onValueChange={(value) => setSelectedCupcakeOption(value === 'none' ? null : value)}
                  >
                    <SelectTrigger className="w-full h-11 text-sm font-normal bg-white border-gray-200 rounded-lg px-4">
                      <SelectValue>
                        {selectedCupcakeOption === null || selectedCupcakeOption === 'none' ? (
                          <span className="text-gray-700 font-normal">No cupcakes</span>
                        ) : selectedCupcakeOption === 'box6' ? (
                          <span className="text-gray-700 font-normal">Box of 6 (+£20)</span>
                        ) : selectedCupcakeOption === 'box12' ? (
                          <span className="text-gray-700 font-normal">Box of 12 (+£30)</span>
                        ) : (
                          <span className="text-gray-700 font-normal">2 x Box of 12 (+£50)</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="py-2.5 text-sm font-normal">
                        <span className="text-gray-700">No cupcakes</span>
                      </SelectItem>
                      <SelectItem value="box6" className="py-2.5 text-sm font-normal">
                        <span className="text-gray-700">Box of 6 <span className="text-gray-400">(+£20)</span></span>
                      </SelectItem>
                      <SelectItem value="box12" className="py-2.5 text-sm font-normal">
                        <span className="text-gray-700">Box of 12 <span className="text-gray-400">(+£30)</span></span>
                      </SelectItem>
                      <SelectItem value="box24" className="py-2.5 text-sm font-normal">
                        <span className="text-gray-700">2 x Box of 12 <span className="text-gray-400">(+£50)</span></span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Requests - Collapsible */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSpecialRequests(!showSpecialRequests)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide hover:text-gray-900 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSpecialRequests ? 'rotate-180' : ''}`} />
                    <span>Special Requests</span>
                    <span className="font-normal normal-case tracking-normal text-gray-500">(optional)</span>
                  </button>
                  {showSpecialRequests && (
                    <div className="mt-3">
                      <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Add names, ages, colour preferences, or any other details here."
                        rows={2}
                        className="bg-white border-gray-200 rounded-lg resize-none text-sm font-normal placeholder:text-gray-400 px-4 py-3"
                        maxLength={500}
                      />
                      <div className="flex justify-between items-start mt-1.5">
                        <p className="text-[11px] text-gray-400">We'll confirm all custom details with you after booking.</p>
                        <span className="text-[11px] text-gray-400">{customMessage.length}/500</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2.5">
                    Delivery Method
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Collection Option */}
                    {cakeFulfillmentOptions.offersPickup && (
                      <button
                        type="button"
                        onClick={() => setFulfillmentMethod("pickup")}
                        className={`relative p-4 rounded-xl border text-left transition-all flex flex-col ${
                          fulfillmentMethod === "pickup"
                            ? "border-[hsl(var(--primary-300))] bg-primary-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className={`text-sm ${fulfillmentMethod === "pickup" ? "text-gray-900" : "text-gray-700"}`}>
                            Collection
                          </span>
                          {fulfillmentMethod === "pickup" && (
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500 mb-3">Collect from the baker's location</p>

                        {/* Price row */}
                        <div className="flex items-center w-full mt-auto">
                          <span className="text-sm text-gray-900">Free</span>
                        </div>
                      </button>
                    )}

                    {/* Delivery Option */}
                    {cakeFulfillmentOptions.offersDelivery && (
                      <button
                        type="button"
                        onClick={() => setFulfillmentMethod("delivery")}
                        className={`relative p-4 rounded-xl border text-left transition-all flex flex-col ${
                          fulfillmentMethod === "delivery"
                            ? "border-[hsl(var(--primary-300))] bg-primary-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className={`text-sm ${fulfillmentMethod === "delivery" ? "text-gray-900" : "text-gray-700"}`}>
                            Delivery
                          </span>
                          {fulfillmentMethod === "delivery" && (
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500 mb-3">Delivered 1-2 days before your party</p>

                        {/* Price row */}
                        <div className="flex items-center justify-between w-full mt-auto">
                          {(() => {
                            // Get delivery fee for currently selected package
                            const pkgDeliveryFee = selectedPackage?.deliveryFee
                            const effectiveDeliveryFee = pkgDeliveryFee !== undefined && pkgDeliveryFee !== null && pkgDeliveryFee !== ''
                              ? parseFloat(pkgDeliveryFee) || 0
                              : cakeFulfillmentOptions.deliveryFee || 0
                            return (
                              <span className="text-sm text-gray-900">
                                {effectiveDeliveryFee > 0 ? `+£${effectiveDeliveryFee.toFixed(2)}` : "Free"}
                              </span>
                            )
                          })()}
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Pickup Location Info */}
                  {fulfillmentMethod === "pickup" && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">Collection Address</p>
                          <p className="text-xs text-gray-500 mt-1">The collection address will be shared after booking is confirmed.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery/Collection Note */}
                  <p className="text-xs text-gray-500 mt-3">
                    Delivery date and collection details are confirmed after booking.
                  </p>
                </div>

                {/* Cake Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* ✅ EDIT MODE: Price diff banner for cakes */}
                  {mode === "edit" && priceDiff !== 0 && (
                    <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 ${
                      priceDiff > 0
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-green-50 border border-green-200"
                    }`}>
                      <Info className={`w-4 h-4 flex-shrink-0 ${priceDiff > 0 ? "text-amber-600" : "text-green-600"}`} />
                      <p className={`text-sm ${priceDiff > 0 ? "text-amber-800" : "text-green-800"}`}>
                        {priceDiff > 0
                          ? `This change will increase the price by £${priceDiff.toFixed(2)}`
                          : `This change will reduce the price by £${Math.abs(priceDiff).toFixed(2)}`
                        }
                      </p>
                    </div>
                  )}
                  <h4 className="text-sm text-gray-600 mb-3">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{selectedPackage?.name || 'Select a size'}</span>
                      <span className="text-gray-900">
                        {selectedPackage ? `£${selectedPackage.price}` : '-'}
                      </span>
                    </div>
                    {fulfillmentMethod === "delivery" && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Delivery</span>
                        <span className="text-gray-900">
                          {calculateModalPricing.deliveryFee > 0 ? `£${calculateModalPricing.deliveryFee.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                    )}
                    {fulfillmentMethod === "pickup" && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Collection</span>
                        <span className="text-gray-900">Free</span>
                      </div>
                    )}
                    {selectedCupcakeOption && calculateModalPricing.cupcakesPrice > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Cupcakes ({selectedCupcakeOption === 'box6' ? 'Box of 6' : selectedCupcakeOption === 'box12' ? 'Box of 12' : '2 x Box of 12'})
                        </span>
                        <span className="text-gray-900">£{calculateModalPricing.cupcakesPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900">Total</span>
                        <span className="font-semibold text-lg text-gray-900">
                          {selectedPackage ? `£${calculateModalPricing.totalPrice}` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Face Painting - Simple flat rate */}
            {supplierTypeDetection.isFacePainting && (
              <section className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-[hsl(var(--primary-500))]">✓</span>
                      Vetted, professional face painter for your party
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[hsl(var(--primary-500))]">✓</span>
                      All paints, brushes and glitter included
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[hsl(var(--primary-500))]">✓</span>
                      Designs to match your party theme
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[hsl(var(--primary-500))]">✓</span>
                      Child-safe, hypoallergenic paints
                    </li>
                  </ul>
                </div>

                {/* Special Requests */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Special requests</h4>
                  <Textarea
                    placeholder="Any specific designs or requests? e.g. butterflies, superheroes, birthday child's name..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="bg-white border-gray-200 text-sm resize-none"
                    rows={2}
                  />
                </div>
              </section>
            )}

            {/* Entertainment - Simplified view with what's included + special requests */}
            {supplierTypeDetection.isEntertainment && (
              <section className="space-y-4">
                {/* What's Included */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      2 hours of professional entertainment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Games, activities & prizes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Music and dancing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      20 min break for food
                    </li>
                  </ul>
                </div>

                {/* Special Requests */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Special requests</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Let the entertainer know about your child's interests or any special requirements
                  </p>
                  <Textarea
                    placeholder="Add names, ages, colour preferences, or any other details here."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="bg-white border-gray-200 text-sm resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-2">We'll confirm all custom details with you after booking.</p>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">£{totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Flat rate for 2-hour party</p>
                </div>
              </section>
            )}

            {/* Multi-Select Suppliers (Soft Play) - Item Selection */}
            {supplierTypeDetection.isMultiSelect && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Choose Your Items</h3>
                </div>

                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden -mx-5 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div
                    className="flex gap-3 py-2 px-5 snap-x snap-mandatory w-max"
                    style={{
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageIds.includes(pkg.id)
                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[140px] rounded-xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => {
                            setSelectedPackageIds(prev =>
                              prev.includes(pkg.id)
                                ? prev.filter(id => id !== pkg.id)
                                : [...prev, pkg.id]
                            )
                          }}
                        >
                          {/* Item Image */}
                          <div className="relative w-full h-28">
                            {pkg.image || pkg.imageUrl ? (
                              <Image
                                src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl || "/placeholder.png")}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="140px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            {/* Selection checkmark overlay */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Item Info */}
                          <div className="p-2.5 bg-white">
                            <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">
                              {pkg.name}
                            </h4>
                            <p className="font-bold text-[hsl(var(--primary-600))] text-base">
                              £{(pkg.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: Vertical list */}
                <div className="hidden sm:block space-y-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageIds.includes(pkg.id)
                    return (
                      <div
                        key={pkg.id}
                        className={`bg-white rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group relative flex border ${
                          isSelected
                            ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedPackageIds(prev =>
                            prev.includes(pkg.id)
                              ? prev.filter(id => id !== pkg.id)
                              : [...prev, pkg.id]
                          )
                        }}
                      >
                        {/* Item Image - Square on left */}
                        {pkg.image || pkg.imageUrl ? (
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <Image
                              src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl || "/placeholder.png")}
                              alt={pkg.name}
                              fill
                              className="object-cover group-hover:brightness-110 transition-all duration-300"
                              sizes="96px"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        {/* Item Info - Right side */}
                        <div className="flex-1 p-3 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-800 text-base mb-1">
                              {pkg.name}
                            </h4>
                            <p className="font-bold text-[hsl(var(--primary-600))] text-lg">
                              £{(pkg.price || 0).toFixed(2)}
                            </p>
                          </div>

                          {/* Selection Indicator */}
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[hsl(var(--primary-500))] border-[hsl(var(--primary-500))]'
                              : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </section>
            )}

            {/* Catering Suppliers - Same card style as party bags/decorations */}
            {supplierTypeDetection.isCatering && (
              <section>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Choose Lunchbox
                </label>

                {/* Horizontal scroll on all screens - uses negative margin to break out of padding */}
                <div className="-mx-5 lg:-mx-6 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div
                    className="flex gap-3 py-1 px-5 lg:px-6 snap-x snap-mandatory w-max"
                    style={{
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id
                      const packageImage = typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl)

                      // Prose for catering
                      const getCateringProse = () => {
                        const features = pkg?.features || pkg?.contents || []
                        if (features.length === 0) return pkg.description || null
                        return `Includes ${features.slice(0, 2).join(', ').toLowerCase()}${features.length > 2 ? ' and more' : ''}.`
                      }

                      const prose = getCateringProse()

                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Package Image */}
                          <div className="relative w-full h-24 sm:h-28">
                            {packageImage ? (
                              <Image
                                src={packageImage}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="220px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            {/* Selection checkmark */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-3 bg-white flex flex-col h-[165px]">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                {pkg.name}
                              </h4>
                              <p className="font-bold text-primary-600 text-base flex-shrink-0">
                                £{roundMoney(pkg.price * partyBagsQuantity).toFixed(2)}
                              </p>
                            </div>

                            {/* Description prose - fixed height area */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                              {prose && (
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                  {prose}
                                </p>
                              )}

                              {/* Guest count info */}
                              <p className="text-[10px] text-gray-400 mt-1">
                                {partyBagsQuantity} guests × £{pkg.price.toFixed(2)} each
                              </p>
                            </div>

                            {/* What's Included - opens modal - always at bottom */}
                            {(pkg.features?.length > 0 || pkg.contents?.length > 0) && (
                              <div className="pt-2 border-t border-gray-100 mt-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPackageForModal(pkg)
                                    setShowPackageModal(true)
                                  }}
                                  className="flex items-center gap-1 text-xs sm:text-sm text-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-600))] font-medium transition-colors"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  <span>What&apos;s included</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Decorations - Compact Card Layout */}
            {supplierTypeDetection.isDecorations && (
              <section>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Choose Package
                </label>

                {/* Horizontal scroll on all screens - uses negative margin to break out of padding */}
                <div className="-mx-5 lg:-mx-6 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div
                    className="flex gap-3 py-1 px-5 lg:px-6 snap-x snap-mandatory w-max"
                    style={{
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg, index) => {
                      const isSelected = selectedPackageId === pkg.id
                      const packageImage = getDecorationsPackageImage(pkg) || pkg.image || pkg.images?.[0]

                      // Short descriptions for decorations
                      const getDecorationsProse = () => {
                        const features = pkg?.features || pkg?.contents || []
                        if (features.length === 0) return pkg.description || null
                        return `Includes ${features.slice(0, 2).join(', ').toLowerCase()}${features.length > 2 ? ' and more' : ''}.`
                      }

                      const prose = getDecorationsProse()

                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Package Image */}
                          <div className="relative w-full h-24 sm:h-28">
                            {packageImage ? (
                              <Image
                                src={packageImage}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="220px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            {/* Selection checkmark */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-3 bg-white flex flex-col h-[165px]">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                {pkg.name}
                              </h4>
                              <p className="font-bold text-primary-600 text-base flex-shrink-0">
                                £{roundMoney(pkg.price * decorationsPackSize).toFixed(2)}
                              </p>
                            </div>

                            {/* Description prose - fixed height area */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                              {prose && (
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                  {prose}
                                </p>
                              )}

                              {/* Pack size info */}
                              <p className="text-[10px] text-gray-400 mt-1">
                                {decorationsPackSize} sets
                              </p>
                            </div>

                            {/* What's Included - opens modal - always at bottom */}
                            {(pkg.features?.length > 0 || pkg.contents?.length > 0) && (
                              <div className="pt-2 border-t border-gray-100 mt-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPackageForModal(pkg)
                                    setShowPackageModal(true)
                                  }}
                                  className="flex items-center gap-1 text-xs sm:text-sm text-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-600))] font-medium transition-colors"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  <span>What&apos;s included</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Balloons/Party Bags - Cards with description inside */}
            {(supplierTypeDetection.isBalloons || supplierTypeDetection.isPartyBags) && !supplierTypeDetection.isMultiSelect && !supplierTypeDetection.isCatering && !supplierTypeDetection.isDecorations && (
              <section>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Choose Package
                </label>

                {/* Horizontal scroll on all screens - uses negative margin to break out of padding */}
                <div className="-mx-5 lg:-mx-6 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div
                    className="flex gap-3 py-1 px-5 lg:px-6 snap-x snap-mandatory w-max"
                    style={{
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg, index) => {
                      const isSelected = selectedPackageId === pkg.id
                      const packageImage = pkg.image || pkg.images?.[0]

                      // Short descriptions for balloons - use package description
                      const getBalloonProse = () => {
                        if (supplierTypeDetection.isPartyBags) return null
                        // Use the description from the package data
                        return pkg.description || null
                      }

                      // Prose for party bags
                      const getPartyBagsProse = () => {
                        const features = pkg?.features || pkg?.contents || []
                        if (features.length === 0) return pkg.description || null
                        return `Includes ${features.slice(0, 2).join(', ').toLowerCase()}${features.length > 2 ? ' and more' : ''}.`
                      }

                      const prose = supplierTypeDetection.isBalloons
                        ? getBalloonProse()
                        : getPartyBagsProse()

                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Package Image */}
                          <div className="relative w-full h-24 sm:h-28">
                            {packageImage ? (
                              <Image
                                src={packageImage}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="220px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            {/* Selection checkmark */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-3 bg-white flex flex-col h-[165px]">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                {pkg.name}
                              </h4>
                              <p className="font-bold text-primary-600 text-base flex-shrink-0">
                                £{supplierTypeDetection.isPartyBags
                                  ? roundMoney(pkg.price * partyBagsQuantity).toFixed(2)
                                  : parseFloat(pkg.enhancedPrice || pkg.price).toFixed(2)}
                              </p>
                            </div>

                            {/* Description prose - fixed height area */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                              {prose && (
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                  {prose}
                                </p>
                              )}

                              {/* Party bags quantity */}
                              {supplierTypeDetection.isPartyBags && (
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {partyBagsQuantity} bags
                                </p>
                              )}
                            </div>

                            {/* What's Included - opens modal - always at bottom */}
                            {(pkg.features?.length > 0 || pkg.contents?.length > 0) && (
                              <div className="pt-2 border-t border-gray-100 mt-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPackageForModal(pkg)
                                    setShowPackageModal(true)
                                  }}
                                  className="flex items-center gap-1 text-xs sm:text-sm text-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-600))] font-medium transition-colors"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  <span>What&apos;s included</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {supplierTypeDetection.isPartyBags && selectedPackage && (
              <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900">Number of Party Bags</h4>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setPartyBagsQuantity(Math.max(1, Number(partyBagsQuantity) - 1))}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-medium transition-all duration-200 ${
                      Number(partyBagsQuantity) <= 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] active:scale-95 shadow-sm'
                    }`}
                    disabled={Number(partyBagsQuantity) <= 1}
                  >
                    −
                  </button>

                  <div className="text-center min-w-[100px]">
                    <div className="text-4xl font-bold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-sm text-gray-500 font-medium">bags</div>
                    <div className="text-lg font-bold text-[hsl(var(--primary-500))] mt-1">
                      £{roundMoney(selectedPackage.price * Number(partyBagsQuantity)).toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-medium bg-white border-2 border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] active:scale-95 shadow-sm transition-all duration-200"
                  >
                    +
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4 italic">
                  Don't worry about exact numbers or themes yet - we'll confirm details closer to your party date.
                </p>
              </section>
            )}

            {/* Catering Add-ons - ABOVE the quantity selector */}
            {supplierTypeDetection.isCatering && availableAddons.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Add to your order</h3>
                </div>
                <div className="space-y-3">
                  {availableAddons.map((addon) => {
                    // Note: data may use snake_case (per_child, per_head, per_item) or camelCase (perChild, perHead, perItem)
                    const isPerChild = addon.priceType === 'perChild' || addon.priceType === 'per_child' || addon.priceType === 'per_head' || addon.priceType === 'perItem' || addon.priceType === 'per_item'
                    const displayPrice = formatPriceCompact(addon.price)

                    return (
                      <div
                        key={addon.id}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                          selectedAddons.includes(addon.id)
                            ? 'border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleAddonToggle(addon.id)}
                      >
                        <Checkbox
                          id={`catering-addon-${addon.id}`}
                          checked={selectedAddons.includes(addon.id)}
                          onCheckedChange={(checked) => {
                            handleAddonToggle(addon.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`catering-addon-${addon.id}`}
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {addon.name}
                          </label>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mt-0.5">{addon.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-[hsl(var(--primary-500))]">+{displayPrice}</span>
                          {isPerChild && (
                            <span className="text-xs text-gray-500 ml-1">/child</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {supplierTypeDetection.isCatering && selectedPackage && (
              <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900">Number of Lunchboxes</h4>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setPartyBagsQuantity(Math.max(supplier?.minimumOrder || 10, Number(partyBagsQuantity) - 1))}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-medium transition-all duration-200 ${
                      Number(partyBagsQuantity) <= (supplier?.minimumOrder || 10)
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] active:scale-95 shadow-sm'
                    }`}
                    disabled={Number(partyBagsQuantity) <= (supplier?.minimumOrder || 10)}
                  >
                    −
                  </button>

                  <div className="text-center min-w-[100px]">
                    <div className="text-4xl font-bold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-sm text-gray-500 font-medium">lunchboxes</div>
                    <div className="text-lg font-bold text-[hsl(var(--primary-500))] mt-1">
                      £{roundMoney(selectedPackage.price * Number(partyBagsQuantity)).toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-medium bg-white border-2 border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] active:scale-95 shadow-sm transition-all duration-200"
                  >
                    +
                  </button>
                </div>
              </section>
            )}

            {supplierTypeDetection.isDecorations && selectedPackage && (
              <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Guest Count</h4>
                  <p className="text-sm text-gray-500">Decoration sets come in packs of 8</p>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setPartyBagsQuantity(Math.max(1, Number(partyBagsQuantity) - 1))}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-medium transition-all duration-200 ${
                      Number(partyBagsQuantity) <= 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] active:scale-95 shadow-sm'
                    }`}
                    disabled={Number(partyBagsQuantity) <= 1}
                  >
                    −
                  </button>

                  <div className="text-center min-w-[100px]">
                    <div className="text-4xl font-bold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-sm text-gray-500 font-medium">guests</div>
                    <div className="text-lg font-bold text-[hsl(var(--primary-500))] mt-1">
                      £{roundMoney(selectedPackage.price * decorationsPackSize).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      ({decorationsPackSize} sets @ £{selectedPackage.price.toFixed(2)} each)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-medium bg-white border-2 border-gray-200 text-gray-700 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))] active:scale-95 shadow-sm transition-all duration-200"
                  >
                    +
                  </button>
                </div>
              </section>
            )}

            {availableAddons.length > 0 && !supplierTypeDetection.isCake && !supplierTypeDetection.isVenue && !supplierTypeDetection.isCatering && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Popular Add-ons</h3>
                </div>
                <div className="space-y-3">
                  {availableAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-all"
                    >
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={() => handleAddonToggle(addon.id)}
                        className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] mt-0.5 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <label
                            htmlFor={addon.id}
                            className="font-medium text-gray-900 cursor-pointer"
                            onClick={() => handleAddonToggle(addon.id)}
                          >
                            {addon.name}
                          </label>
                          {addon.popular && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                      </div>
                      <div className="font-semibold text-primary-600 text-lg flex-shrink-0">+£{(addon.price || 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Venue Suppliers - What's Included + VenueDisplay + Room Selection + Catering */}
            {console.log('🏠 [Venue Check] isVenue:', supplierTypeDetection.isVenue, 'packages:', packages.length)}
            {supplierTypeDetection.isVenue && (
              <section className="space-y-6">
                {/* What's Included - Show features from package OR generate from venue data */}
                {(() => {
                  const activePackage = selectedPackage || packages[0]
                  let features = activePackage?.features || activePackage?.whatsIncluded || []

                  // If no package features, generate from venue serviceDetails
                  if (features.length === 0) {
                    const serviceDetails = supplier?.serviceDetails || supplier?.data?.serviceDetails || {}
                    const pricing = serviceDetails?.pricing || {}
                    const capacity = serviceDetails?.capacity || {}
                    const generatedFeatures = []

                    // Add booking duration
                    const minimumHours = pricing.minimumBookingHours ||
                                        serviceDetails?.availability?.minimumBookingHours || 4
                    generatedFeatures.push(`${minimumHours} hour${minimumHours > 1 ? 's' : ''} venue hire`)

                    // Add setup/cleanup time if available
                    if (pricing.setupTime && pricing.cleanupTime) {
                      generatedFeatures.push(`${pricing.setupTime} mins setup + ${pricing.cleanupTime} mins cleanup included`)
                    } else if (pricing.setupTime) {
                      generatedFeatures.push(`${pricing.setupTime} mins setup time included`)
                    }

                    // Add capacity info
                    if (capacity.standing || capacity.max) {
                      generatedFeatures.push(`Capacity up to ${capacity.standing || capacity.max} guests`)
                    }

                    // Add key facilities
                    const facilities = serviceDetails?.facilities || []
                    const keyFacilities = facilities.filter(f =>
                      f.toLowerCase().includes('kitchen') ||
                      f.toLowerCase().includes('parking') ||
                      f.toLowerCase().includes('toilet') ||
                      f.toLowerCase().includes('accessible')
                    ).slice(0, 3)
                    keyFacilities.forEach(f => generatedFeatures.push(f))

                    // Add tables/chairs if available
                    const equipment = serviceDetails?.equipment || {}
                    if (equipment.chairs > 0 || equipment.tables > 0) {
                      const items = []
                      if (equipment.tables > 0) items.push(`${equipment.tables} tables`)
                      if (equipment.chairs > 0) items.push(`${equipment.chairs} chairs`)
                      if (items.length > 0) generatedFeatures.push(`${items.join(' & ')} available`)
                    }

                    features = generatedFeatures
                  }

                  if (features.length === 0) return null

                  return (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">What's Included</h3>
                      <div className="space-y-2">
                        {features.map((feature, idx) => {
                          // Remove any existing checkmarks/ticks from the start of the text
                          const cleanFeature = feature.replace(/^[✓✔☑️]\s*/g, '').trim()
                          return (
                            <div key={idx} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-[hsl(var(--primary-500))] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-sm">{cleanFeature}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* VenueDisplay - Shows about, capacity, facilities, location, rules, etc. */}
                <VenueDisplay
                  supplier={supplier}
                  serviceDetails={supplier?.serviceDetails || supplier?.service_details || supplier?.data?.serviceDetails || {}}
                  selectedAddons={selectedAddons}
                  onToggleAddon={(addon) => {
                    const addonId = addon.id || `addon-${addon.name}`
                    const isSelected = selectedAddons.some(a => (a.id || a) === addonId)
                    if (isSelected) {
                      setSelectedAddons(selectedAddons.filter(a => (a.id || a) !== addonId))
                    } else {
                      setSelectedAddons([...selectedAddons, { ...addon, id: addonId }])
                    }
                  }}
                  isInteractive={true}
                />

                {/* Room/Package Selection - Only show if more than 1 package OR has catering */}
                {(() => {
                  const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                  const hasMultipleOptions = packages.length > 1 || cateringPackages.length > 0

                  if (!hasMultipleOptions) return null

                  return (
                    <>
                      {packages.length > 1 && (
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Your Room</h3>
                        </div>
                      )}
                    </>
                  )
                })()}

                {/* Room Package Cards - Compact horizontal scroll style */}
                {packages.length > 1 && (
                <div className="-mx-5 lg:-mx-6 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div
                    className="flex gap-3 py-1 px-5 lg:px-6 snap-x snap-mandatory w-max"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id
                      const displayPrice = getVenuePackagePrice(pkg)
                      const packageImage = typeof pkg.image === 'object' ? pkg.image.src : pkg.image

                      // Prose for venue
                      const getVenueProse = () => {
                        if (pkg.description) return pkg.description
                        const features = pkg?.features || []
                        if (features.length === 0) return null
                        return `Includes ${features.slice(0, 2).join(', ').toLowerCase()}${features.length > 2 ? ' and more' : ''}.`
                      }

                      const prose = getVenueProse()

                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[200px] sm:w-[220px] rounded-xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Popular badge */}
                          {pkg.popular && (
                            <div className="absolute top-0 left-0 right-0 bg-[hsl(var(--primary-500))] text-white text-[10px] font-semibold text-center py-1 uppercase tracking-wide z-10">
                              Most Popular
                            </div>
                          )}

                          {/* Package Image */}
                          <div className={`relative w-full h-24 sm:h-28 ${pkg.popular ? 'mt-5' : ''}`}>
                            {packageImage ? (
                              <Image
                                src={packageImage}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="220px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            {/* Selection checkmark */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-3 bg-white flex flex-col h-[165px]">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                {pkg.name}
                              </h4>
                              <p className="font-bold text-primary-600 text-base flex-shrink-0">
                                £{displayPrice}
                              </p>
                            </div>

                            {/* Capacity & Duration */}
                            {(pkg.minGuests || pkg.maxGuests || pkg.duration) && (
                              <p className="text-[10px] text-gray-400 mb-1">
                                {pkg.minGuests && pkg.maxGuests && `${pkg.minGuests}-${pkg.maxGuests} guests`}
                                {pkg.duration && ` • ${pkg.duration}`}
                              </p>
                            )}

                            {/* Description prose - fixed height area */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                              {prose && (
                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                  {prose}
                                </p>
                              )}
                            </div>

                            {/* What's Included - opens modal - always at bottom */}
                            {pkg.features && pkg.features.length > 0 && (
                              <div className="pt-2 border-t border-gray-100 mt-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPackageForModal(pkg)
                                    setShowPackageModal(true)
                                  }}
                                  className="flex items-center gap-1 text-xs sm:text-sm text-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-600))] font-medium transition-colors"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                  <span>What&apos;s included</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                )}

                {/* SECTION 2: Add Catering (if venue offers it) */}
                {(() => {
                  const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                  if (cateringPackages.length === 0) return null

                  // Parse dietary codes from text like "v = vegetarian, ve = vegan, nga = non-gluten available"
                  const getDietaryBadges = (dietaryInfo) => {
                    if (!dietaryInfo) return []
                    const badges = []
                    const lower = dietaryInfo.toLowerCase()
                    if (lower.includes('ve') || lower.includes('vegan')) badges.push({ code: 'VE', label: 'Vegan options' })
                    if ((lower.includes('v =') || lower.includes('v=') || lower.includes('vegetarian')) && !badges.some(b => b.code === 'VE')) badges.push({ code: 'V', label: 'Vegetarian options' })
                    if (lower.includes('nga') || lower.includes('gluten')) badges.push({ code: 'GF', label: 'Gluten-free available' })
                    return badges
                  }

                  return (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Party Catering</h3>

                      <div className="space-y-3">
                        {/* No catering option */}
                        <div
                          className={`rounded-lg cursor-pointer transition-all duration-200 p-4 border ${
                            !selectedCateringId
                              ? "bg-[hsl(var(--primary-50))] border-[hsl(var(--primary-500))]"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedCateringId(null)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">No catering needed</h4>
                              <p className="text-sm text-gray-500">Room hire only</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              !selectedCateringId
                                ? 'bg-[hsl(var(--primary-500))] border-[hsl(var(--primary-500))]'
                                : 'bg-white border-gray-300'
                            }`}>
                              {!selectedCateringId && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </div>

                        {/* Catering packages */}
                        {cateringPackages.map((catering) => {
                          const isSelected = selectedCateringId === catering.id
                          const menuExpanded = expandedCateringMenus[catering.id] || false
                          const dietaryBadges = getDietaryBadges(catering.dietaryInfo)
                          const hasMenu = (catering.sections && catering.sections.length > 0) || (catering.items && catering.items.length > 0)

                          return (
                            <div
                              key={catering.id}
                              className={`rounded-lg transition-all duration-200 overflow-hidden border ${
                                isSelected
                                  ? "border-[hsl(var(--primary-500))] bg-[hsl(var(--primary-50))]"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {/* Catering image if available */}
                              {catering.image && (
                                <div
                                  className="relative w-full h-32 cursor-pointer"
                                  onClick={() => setSelectedCateringId(catering.id)}
                                >
                                  <Image
                                    src={catering.image}
                                    alt={catering.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              <div className="p-4 bg-white">
                                {/* Main clickable card header */}
                                <div
                                  className="cursor-pointer"
                                  onClick={() => setSelectedCateringId(catering.id)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-gray-900">{catering.name}</h4>
                                        {/* Dietary badges */}
                                        {dietaryBadges.length > 0 && (
                                          <span className="text-xs text-gray-500 font-medium">
                                            {dietaryBadges.map(b => b.code).join(' · ')}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{catering.description}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                      {catering.pricePerHead ? (
                                        <>
                                          <div className="text-xl font-bold text-[hsl(var(--primary-500))]">£{catering.pricePerHead}</div>
                                          <div className="text-xs text-gray-500">per person</div>
                                        </>
                                      ) : catering.pricing && (
                                        <div className="text-sm font-medium text-gray-700">{catering.pricing}</div>
                                      )}
                                    </div>
                                    <div className={`ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                      isSelected
                                        ? 'bg-[hsl(var(--primary-500))] border-[hsl(var(--primary-500))]'
                                        : 'bg-white border-gray-300'
                                    }`}>
                                      {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                  </div>
                                </div>

                                {/* Collapsible menu section */}
                                {hasMenu && (
                                  <div className="mt-3">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setExpandedCateringMenus(prev => ({
                                          ...prev,
                                          [catering.id]: !prev[catering.id]
                                        }))
                                      }}
                                      className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary-600))] hover:text-[hsl(var(--primary-700))] transition-colors"
                                    >
                                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${menuExpanded ? 'rotate-180' : ''}`} />
                                      {menuExpanded ? 'Hide menu' : 'View menu'}
                                    </button>

                                    {/* Expanded menu content */}
                                    {menuExpanded && (
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        {catering.sections && catering.sections.length > 0 ? (
                                          <div className="space-y-4">
                                            {catering.sections.map((section, sIdx) => (
                                              <div key={sIdx}>
                                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{section.title}</h5>
                                                <div className="space-y-1.5">
                                                  {section.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                      <Check className="w-3.5 h-3.5 text-[hsl(var(--primary-500))] flex-shrink-0 mt-0.5" />
                                                      <span>{item}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : catering.items && catering.items.length > 0 && (
                                          <div className="space-y-1.5">
                                            {catering.items.map((item, idx) => (
                                              <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <Check className="w-3.5 h-3.5 text-[hsl(var(--primary-500))] flex-shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Guest count when selected */}
                                {isSelected && catering.pricePerHead && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">Number of guests:</span>
                                      <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setCateringGuestCount(prev => Math.max((catering.minGuests || 1), prev - 1))
                                          }}
                                          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg"
                                        >
                                          -
                                        </button>
                                        <span className="w-10 text-center font-bold text-xl">{cateringGuestCount}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setCateringGuestCount(prev => Math.min((catering.maxGuests || 100), prev + 1))
                                          }}
                                          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                      <span className="text-sm text-gray-600">Catering total:</span>
                                      <span className="font-bold text-lg text-[hsl(var(--primary-500))]">
                                        £{roundMoney(catering.pricePerHead * cateringGuestCount).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* SECTION 3: Add-ons (if venue has any) */}
                {availableAddons.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Plus className="w-4 h-4 text-[hsl(var(--primary-500))]" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Add-ons</h3>
                    </div>
                    <div className="space-y-2">
                      {availableAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                            selectedAddons.includes(addon.id)
                              ? "bg-[hsl(var(--primary-50))] border-[hsl(var(--primary-500))]"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleAddonToggle(addon.id)}
                        >
                          <Checkbox
                            id={`venue-addon-${addon.id}`}
                            checked={selectedAddons.includes(addon.id)}
                            onCheckedChange={() => handleAddonToggle(addon.id)}
                            className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`venue-addon-${addon.id}`}
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                              >
                                {addon.name}
                              </label>
                              {addon.popular && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            {addon.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{addon.description}</p>
                            )}
                          </div>
                          <div className="font-semibold text-[hsl(var(--primary-500))] text-sm flex-shrink-0">+£{(addon.price || 0).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: Price Summary */}
                {selectedPackage && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Booking Summary</h4>
                    <div className="space-y-2">
                      {/* Room */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{selectedPackage.name}</p>
                          {selectedPackage.duration && (
                            <p className="text-xs text-gray-500">{selectedPackage.duration}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">£{(getVenuePackagePrice(selectedPackage) || 0).toFixed(2)}</span>
                      </div>

                      {/* Catering (if selected) */}
                      {(() => {
                        const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                        const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)
                        if (!selectedCatering) return null

                        return (
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <div>
                              <p className="text-sm font-medium text-gray-700">{selectedCatering.name}</p>
                              <p className="text-xs text-gray-500">{cateringGuestCount} guests × £{selectedCatering.pricePerHead}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">£{roundMoney(selectedCatering.pricePerHead * cateringGuestCount).toFixed(2)}</span>
                          </div>
                        )
                      })()}

                      {/* Add-ons (if selected) */}
                      {selectedAddons.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 space-y-1.5">
                          {selectedAddons.map(addonId => {
                            const addon = availableAddons.find(a => a.id === addonId)
                            if (!addon) return null
                            return (
                              <div key={addonId} className="flex justify-between items-center">
                                <p className="text-sm text-gray-700">{addon.name}</p>
                                <span className="text-sm font-medium text-gray-900">£{(addon.price || 0).toFixed(2)}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-1">
                        <span className="text-sm font-bold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          £{(() => {
                            const venuePrice = getVenuePackagePrice(selectedPackage)
                            const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                            const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)
                            const cateringPrice = selectedCatering ? roundMoney(selectedCatering.pricePerHead * cateringGuestCount) : 0
                            const addonsPrice = selectedAddons.reduce((sum, addonId) => {
                              const addon = availableAddons.find(a => a.id === addonId)
                              return sum + (addon?.price || 0)
                            }, 0)
                            return roundMoney(venuePrice + cateringPrice + addonsPrice).toFixed(2)
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {!supplierTypeDetection.isCake && !supplierTypeDetection.isPartyBags && !supplierTypeDetection.isCatering && !supplierTypeDetection.isDecorations && !supplierTypeDetection.isEntertainment && !supplierTypeDetection.isVenue && (
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                {/* ✅ EDIT MODE: Price diff banner */}
                {mode === "edit" && priceDiff !== 0 && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    priceDiff > 0
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-green-50 border border-green-200"
                  }`}>
                    <Info className={`w-4 h-4 flex-shrink-0 ${priceDiff > 0 ? "text-amber-600" : "text-green-600"}`} />
                    <p className={`text-sm ${priceDiff > 0 ? "text-amber-800" : "text-green-800"}`}>
                      {priceDiff > 0
                        ? `This change will increase the price by £${priceDiff.toFixed(2)}`
                        : `This change will reduce the price by £${Math.abs(priceDiff).toFixed(2)}`
                      }
                    </p>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 text-base">Price Summary</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {selectedPackage?.name}
                      {calculateModalPricing.pricingInfo?.isTimeBased && (
                        <span className="text-gray-500 text-xs ml-2">
                          ({formatDuration(effectivePartyDetails?.duration || 2)})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900">£{calculateModalPricing.packagePrice}</span>
                  </div>

                  {selectedAddons.map((addonId) => {
                    const addon = availableAddons.find((a) => a.id === addonId)
                    return addon ? (
                      <div key={addonId} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{addon.name}</span>
                        <span className="font-medium text-gray-900">£{(addon.price || 0).toFixed(2)}</span>
                      </div>
                    ) : null
                  })}

                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">£{totalPrice.toFixed(2)}</span>
                  </div>

                  {calculateModalPricing.hasEnhancedPricing && (
                    <div className="text-xs text-gray-600 bg-gray-100 rounded p-2.5 text-center mt-3">
                      Enhanced pricing applied based on your party details
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Category-specific disclaimer note */}
          <SupplierNote category={supplierType} className="py-3 px-4" />

          {/* Info Accordions Section */}
          <div className="px-6 pb-6 space-y-0 border-t border-gray-200 mt-4 pt-4">
            {(() => {
              const serviceDetails = supplier?.serviceDetails || supplier?.service_details || {}
              const AccordionItem = ({ id, title, children }) => {
                const isOpen = openAccordion === id
                return (
                  <div className="border-b border-gray-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? null : id)}
                      className="w-full flex items-center justify-between py-3 text-left"
                    >
                      <span className="font-semibold text-gray-800 uppercase text-xs tracking-wide">{title}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-3' : 'max-h-0'}`}>
                      <div className="text-sm text-gray-600 space-y-1">
                        {children}
                      </div>
                    </div>
                  </div>
                )
              }

              // Helper to format age groups for entertainers
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

              const ageGroups = serviceDetails?.ageGroups || []

              return (
                <>
                  {/* ===== ENTERTAINMENT ACCORDIONS ===== */}
                  {supplierTypeDetection.isEntertainment && (
                    <>
                      {ageGroups.length > 0 && (
                        <AccordionItem id="entertainer-ages" title="Suitable Ages">
                          <p>Perfect for children aged {formatAgeRange(ageGroups)}.</p>
                        </AccordionItem>
                      )}

                      {serviceDetails.performanceSpecs?.spaceRequired && (
                        <AccordionItem id="entertainer-space" title="Space Required">
                          <p>{serviceDetails.performanceSpecs.spaceRequired}</p>
                        </AccordionItem>
                      )}

                      {serviceDetails.travelRadius && (
                        <AccordionItem id="entertainer-coverage" title="Coverage Area">
                          <p>Available for bookings up to {serviceDetails.travelRadius} miles from their location.</p>
                        </AccordionItem>
                      )}

                      <AccordionItem id="entertainer-schedule" title="Party Schedule">
                        <p>• Entertainer arrives 15-30 minutes before to setup</p>
                        <p>• First hour of games and activities</p>
                        <p>• 20 minutes for food and refreshments</p>
                        <p>• Final 40 minutes of more entertainment</p>
                      </AccordionItem>

                      {serviceDetails.personalBio?.personalStory && (
                        <AccordionItem id="entertainer-bio" title="Meet the Entertainer">
                          {serviceDetails.personalBio.yearsExperience && (
                            <p className="mb-2">
                              <span className="font-medium text-gray-900">{serviceDetails.personalBio.yearsExperience} years of experience</span> bringing joy to parties.
                            </p>
                          )}
                          <p>{serviceDetails.personalBio.personalStory}</p>
                        </AccordionItem>
                      )}

                      <AccordionItem id="entertainer-equipment" title="What's Included">
                        <p>Our entertainers bring all the equipment needed and keep the kids engaged throughout the party.</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== FACE PAINTING ACCORDIONS ===== */}
                  {supplierTypeDetection.isFacePainting && (
                    <>
                      <AccordionItem id="fp-included" title="What's Included">
                        <p>• Professional face paints and materials</p>
                        <p>• Range of designs for all ages</p>
                        <p>• Glitter and gems for extra sparkle</p>
                        <p>• Theme-matching designs available</p>
                      </AccordionItem>

                      <AccordionItem id="fp-setup" title="Setup & Requirements">
                        <p><span className="font-medium text-gray-900">Space needed:</span> {serviceDetails?.spaceRequired || 'One table and two chairs in a well-lit area.'}</p>
                        <p><span className="font-medium text-gray-900">Setup:</span> Artist arrives 15 mins early to prepare.</p>
                      </AccordionItem>

                      <AccordionItem id="fp-safety" title="Safety & Hygiene">
                        <p>All paints are hypoallergenic and FDA-approved. Fresh sponges and brushes used for each child.</p>
                      </AccordionItem>

                      <AccordionItem id="fp-kids" title="How Many Kids?">
                        <p>Typically 8-12 faces per hour depending on design complexity. Simple designs are faster!</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== BOUNCY CASTLE ACCORDIONS ===== */}
                  {supplierTypeDetection.isBouncyCastle && (
                    <>
                      <AccordionItem id="bc-duration" title="Hire Duration">
                        <p>Included for the full duration of your party.</p>
                      </AccordionItem>

                      <AccordionItem id="bc-space" title="Space Required">
                        <p>{serviceDetails?.spaceRequired || 'Flat outdoor area or large indoor space with high ceiling.'}</p>
                      </AccordionItem>

                      <AccordionItem id="bc-setup" title="Setup & Collection">
                        <p><span className="font-medium text-gray-900">Setup:</span> We arrive 30-45 minutes before to inflate and secure the castle.</p>
                        <p><span className="font-medium text-gray-900">Collection:</span> We pack away after your party - you don't need to do anything!</p>
                      </AccordionItem>

                      <AccordionItem id="bc-safety" title="Safety Information">
                        <p>All castles are safety-tested and we provide safety mats.</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== ACTIVITIES / SOFT PLAY ACCORDIONS ===== */}
                  {supplierTypeDetection.isMultiSelect && (
                    <>
                      <AccordionItem id="act-age" title="Suitable Ages">
                        <p>{serviceDetails?.ageRange || 'Ages 1-6 years'}</p>
                      </AccordionItem>

                      <AccordionItem id="act-space" title="Space Required">
                        <p>{serviceDetails?.spaceRequired || 'Minimum 3m x 3m clear floor area'}</p>
                      </AccordionItem>

                      <AccordionItem id="act-setup" title="Setup & Collection">
                        <p><span className="font-medium text-gray-900">Delivery:</span> {serviceDetails?.setupTime || 'We deliver and set up 30-60 mins before your party starts'}</p>
                        <p><span className="font-medium text-gray-900">Collection:</span> {serviceDetails?.collectionTime || 'Collected after your party - no need to pack anything away!'}</p>
                      </AccordionItem>

                      <AccordionItem id="act-safety" title="Safety Information">
                        <p>All equipment is cleaned and safety-checked before every hire.</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== CAKES ACCORDIONS ===== */}
                  {supplierTypeDetection.isCake && (
                    <>
                      <AccordionItem id="delivery" title="Delivery Information">
                        {serviceDetails.deliveryInfo ? (
                          <p>{serviceDetails.deliveryInfo}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Delivery:</span> Delivered to your venue or home address</p>
                            <p><span className="font-medium text-gray-900">Timing:</span> We'll confirm delivery window after booking</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="collection" title="Collection Information">
                        {serviceDetails.collectionInfo ? (
                          <p>{serviceDetails.collectionInfo}</p>
                        ) : (
                          <p>Collection available — address provided after booking confirmation.</p>
                        )}
                      </AccordionItem>

                      <AccordionItem id="allergens" title="Allergens">
                        {serviceDetails.allergens ? (
                          <p>{serviceDetails.allergens}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Sponge:</span> Eggs, Milk, Gluten (Wheat)</p>
                            <p><span className="font-medium text-gray-900">Fillings:</span> Milk, Soya, Gluten, Eggs, Nuts</p>
                            <p className="text-xs text-gray-500 mt-2">Please inform us of any allergies when booking.</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="cakecare" title="Important Cake Care Guide">
                        {serviceDetails.cakeCare ? (
                          <p>{serviceDetails.cakeCare}</p>
                        ) : (
                          <>
                            <p>Store in a cool, dry place away from direct sunlight.</p>
                            <p>Keep refrigerated if not serving within 24 hours.</p>
                            <p>Remove from fridge 1-2 hours before serving for best taste.</p>
                          </>
                        )}
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== CATERING ACCORDIONS ===== */}
                  {supplierTypeDetection.isCatering && (
                    <>
                      <AccordionItem id="catering-delivery" title="Delivery Information">
                        {serviceDetails.deliveryInfo ? (
                          <p>{serviceDetails.deliveryInfo}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Delivery:</span> Delivered fresh to your venue</p>
                            <p><span className="font-medium text-gray-900">Timing:</span> We'll confirm delivery window after booking</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="catering-allergens" title="Allergens & Dietary">
                        {serviceDetails.allergens ? (
                          <p>{serviceDetails.allergens}</p>
                        ) : (
                          <>
                            <p>Please inform us of any allergies or dietary requirements when booking.</p>
                            <p className="text-xs text-gray-500 mt-2">We can accommodate most dietary needs with advance notice.</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="catering-storage" title="Storage & Serving">
                        <p>Keep refrigerated until serving. Best consumed within 24 hours of delivery.</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== BALLOONS ACCORDIONS ===== */}
                  {supplierTypeDetection.isBalloons && (
                    <>
                      <AccordionItem id="delivery" title="Delivery Information">
                        {serviceDetails.deliveryInfo ? (
                          <p>{serviceDetails.deliveryInfo}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Delivery:</span> Delivered to your venue or home address</p>
                            <p><span className="font-medium text-gray-900">Timing:</span> We'll confirm delivery window after booking</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="duration" title="How Long They Last">
                        {serviceDetails.duration ? (
                          <p>{serviceDetails.duration}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Helium balloons:</span> 12-24 hours float time</p>
                            <p><span className="font-medium text-gray-900">Air-filled:</span> Several days to weeks</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="customisation" title="Customisation">
                        {serviceDetails.customisation ? (
                          <p>{serviceDetails.customisation}</p>
                        ) : (
                          <p>Colours and styles may vary slightly. We always match your theme as closely as possible.</p>
                        )}
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== PARTY BAGS ACCORDIONS ===== */}
                  {supplierTypeDetection.isPartyBags && (
                    <>
                      <AccordionItem id="pb-delivery" title="Delivery Information">
                        {serviceDetails.deliveryInfo ? (
                          <p>{serviceDetails.deliveryInfo}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Delivery:</span> Delivered to your venue or home address</p>
                            <p><span className="font-medium text-gray-900">Timing:</span> We'll confirm delivery window after booking</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="pb-contents" title="What's Included">
                        <p>Each party bag contains a selection of themed toys, treats, and surprises appropriate for the party theme.</p>
                      </AccordionItem>

                      <AccordionItem id="pb-allergens" title="Allergens">
                        <p>Party bags may contain items with allergens. Please inform us of any allergies when booking.</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== DECORATIONS ACCORDIONS ===== */}
                  {supplierTypeDetection.isDecorations && (
                    <>
                      <AccordionItem id="deco-delivery" title="Delivery Information">
                        {serviceDetails.deliveryInfo ? (
                          <p>{serviceDetails.deliveryInfo}</p>
                        ) : (
                          <>
                            <p><span className="font-medium text-gray-900">Delivery:</span> Delivered to your venue or home address</p>
                            <p><span className="font-medium text-gray-900">Timing:</span> We'll confirm delivery window after booking</p>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem id="deco-setup" title="Setup Tips">
                        <p>Decorations arrive ready to display. No assembly required for most items.</p>
                      </AccordionItem>

                      <AccordionItem id="deco-customisation" title="Customisation">
                        <p>Colours and styles matched to your party theme. Minor variations may occur.</p>
                      </AccordionItem>
                    </>
                  )}

                  {/* ===== GENERAL LEAD TIME (for categories that need it) ===== */}
                  {(supplierTypeDetection.isCake || supplierTypeDetection.isPartyBags || supplierTypeDetection.isBalloons || supplierTypeDetection.isDecorations || supplierTypeDetection.isCatering) && (
                    <AccordionItem id="leadtime" title="Lead Time">
                      {serviceDetails.leadTime ? (
                        <p>{typeof serviceDetails.leadTime === 'object' ? serviceDetails.leadTime.minimum : serviceDetails.leadTime} days notice required</p>
                      ) : (
                        <p>5-7 days notice recommended. Contact us for rush orders.</p>
                      )}
                    </AccordionItem>
                  )}
                </>
              )
            })()}
          </div>
        </div>

        <div className="border-t border-gray-200 p-5 flex-shrink-0 bg-white">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 font-medium bg-transparent"
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToPlan}
              className={`flex-[2] h-12 font-semibold shadow-lg hover:shadow-xl transition-all ${
                !canAddCheck.canAdd
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }`}
              disabled={
                // For multi-select, require at least one item; for others, require package selection
                // Face painting doesn't need package selection (flat rate)
                // Venues don't require package selection - they use priceFrom
                (supplierTypeDetection.isMultiSelect ? selectedPackageIds.length === 0 : (!selectedPackageId && !supplierTypeDetection.isFacePainting && !supplierTypeDetection.isVenue)) ||
                isAdding ||
                !canAddCheck.canAdd
              }
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {getButtonText()}
                </>
              ) : !canAddCheck.canAdd ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  {getButtonText()}
                </>
              ) : (
                <>
                  {supplierTypeDetection.isCake ? (
                    <Cake className="w-4 h-4 mr-2" />
                  ) : supplierTypeDetection.isLeadBased ? (
                    <Package className="w-4 h-4 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {getButtonText()}
                </>
              )}
            </Button>
          </div>
        </div>
            </div>
          </div>
        </div>

      {/* Package Details Modal - Simple what's included view */}
      <PackageDetailsModal
        pkg={selectedPackageForModal}
        isOpen={showPackageModal}
        onClose={() => {
          setShowPackageModal(false)
          setSelectedPackageForModal(null)
        }}
      />

      {/* Lightbox Modal for fullscreen images */}
      {showLightbox && supplierImages.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={supplierImages[lightboxIndex]}
              alt={`${supplier.name} - Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Lightbox navigation */}
          {supplierImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((prev) => (prev === 0 ? supplierImages.length - 1 : prev - 1))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((prev) => (prev === supplierImages.length - 1 ? 0 : prev + 1))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Lightbox counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/10 rounded-full">
                <span className="text-white text-sm">{lightboxIndex + 1} / {supplierImages.length}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
