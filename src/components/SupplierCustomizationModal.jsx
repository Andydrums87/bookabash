// Enhanced SupplierCustomizationModal with unified pricing system integration
"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
} from "lucide-react"
import Image from "next/image"

// ✅ UPDATED: Import unified pricing system
import {
  calculateFinalPrice,
  isLeadBasedSupplier,
  isTimeBasedSupplier,
  getPartyDuration,
  formatDuration,
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

// Package Details Modal (Drawer on mobile)
const PackageDetailsModal = ({ pkg, isOpen, onClose, onChoosePackage, isSelected, isPartyBags, isCake, partyBagsQuantity, formattedDuration, supplier }) => {
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
        // Use instant behavior to avoid smooth scroll causing visible jump
        window.scrollTo({ top: scrollY, behavior: 'instant' })
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChoosePackage = () => {
    onChoosePackage(pkg.id)
    onClose()
  }

  // Calculate display price for party bags
  const displayPrice = isPartyBags ? (pkg.price * (partyBagsQuantity || 1)).toFixed(2) : (pkg.enhancedPrice || pkg.price)

  // Get cake-specific data from supplier
  const cakeDescription = supplier?.description || supplier?.serviceDetails?.description || ''
  const cakeFlavours = supplier?.flavours || supplier?.serviceDetails?.flavours || []
  const cakeDietary = supplier?.dietaryInfo || supplier?.serviceDetails?.dietaryInfo || []
  const feedsInfo = pkg.serves || pkg.feeds

  // Dietary labels for display
  const dietaryLabels = {
    'vegetarian': 'Vegetarian',
    'vegan': 'Vegan',
    'gluten-free': 'Gluten Free',
    'dairy-free': 'Dairy Free',
    'nut-free': 'Nut Free',
    'egg-free': 'Egg Free',
    'halal': 'Halal'
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Modal Header */}
        <div className="relative h-48 sm:h-64 flex-shrink-0 bg-gray-100">
          <Image
            src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl || "/placeholder.png")}
            alt={pkg.name}
            fill
            className="object-contain"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white hover:bg-gray-100 rounded-full p-1.5 sm:p-2 shadow-md transition-colors z-10"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-gray-600" />
          </button>

          {/* Package info directly on image */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10">
            <h2 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg mb-2">{pkg.name}</h2>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div>
                <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">
                  £{displayPrice}
                </span>
              </div>
              {isCake && feedsInfo && (
                <div className="flex items-center text-white text-sm sm:text-base drop-shadow-md">
                  <span className="font-semibold">Feeds {feedsInfo} people</span>
                </div>
              )}
              {!isPartyBags && !isCake && (
                <div className="flex items-center text-white text-sm sm:text-base drop-shadow-md">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                  <span className="font-semibold">{formattedDuration || pkg.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ minHeight: 0 }}>
          {/* For cakes: Show About this cake */}
          {isCake && cakeDescription && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">About This Cake</h3>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="whitespace-pre-line text-sm sm:text-base text-gray-700 leading-relaxed">
                  {cakeDescription}
                </div>
              </div>
            </div>
          )}

          {/* For cakes: Show available flavours */}
          {isCake && cakeFlavours.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Available Flavours</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {cakeFlavours.map((flavour, i) => (
                  <span key={i} className="bg-[hsl(var(--primary-500))] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {flavour}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* For cakes: Show dietary options */}
          {isCake && cakeDietary.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Dietary Options Available</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {cakeDietary.map((option, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {dietaryLabels[option] || option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* For non-cakes: What's Included */}
          {!isCake && pkg.features?.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">What's Included</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {pkg.features.map((item, i) => (
                  <span key={i} className="bg-[hsl(var(--primary-500))] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Package Description (for non-cakes or if cake has package-specific description) */}
          {!isCake && pkg.description && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Package Details</h3>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="whitespace-pre-line text-sm sm:text-base text-gray-700 leading-relaxed">
                  {pkg.description}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer with CTA */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-white flex-shrink-0">
          <Button
            onClick={handleChoosePackage}
            className={`w-full h-12 sm:h-14 font-bold text-base sm:text-lg rounded-xl transition-all ${
              isSelected
                ? "bg-primary-500 hover:bg-primary-600 text-white"
                : "bg-primary-500 hover:bg-primary-600 text-white shadow-lg"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                {isCake ? 'Size Selected' : 'Package Selected'}
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                {isCake ? 'Choose This Size' : 'Choose This Package'}
              </>
            )}
          </Button>
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
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [canAddCheck, setCanAddCheck] = useState({ canAdd: true, reason: "planning_empty_slot", showModal: false })

  // Cake customization state
  const [selectedFlavor, setSelectedFlavor] = useState("vanilla")
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState([]) // Array for multiple selections
  const [customMessage, setCustomMessage] = useState("")
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery") // "delivery" or "pickup"

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

  // Store scroll position in ref to avoid stale closure issues
  const scrollPositionRef = useRef(0)

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
    if (!supplier) return { isLeadBased: false, isTimeBased: false, isCake: false, isPartyBags: false, isBalloons: false, isFacePainting: false, isSoftPlay: false, isMultiSelect: false, isCatering: false, isSweetTreats: false, isDecorations: false, isEntertainment: false }

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
      isMultiSelect: isMultiSelectSupplier,
      supplierTypeDetectionIsMultiSelect: supplierTypeDetection?.isMultiSelect,
      supplierType,
      supplierDataKeys: Object.keys(dataObj || {}),
    })

    if (supplierPackages.length > 0) {
      // For multi-select suppliers, show all items; for others, limit to 3 (except venues which show all)
      const catLower = (supplier?.category || dataObj?.category || '').toLowerCase()
      const isVenueType = catLower.includes('venue') || catLower.includes('function room') || catLower.includes('hall')
      const packagesToShow = (isMultiSelectSupplier || isVenueType) ? supplierPackages : supplierPackages.slice(0, 3)
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

    const basePrice = supplier.priceFrom || 100
    const priceUnit = supplier.priceUnit || "per event"

    const basicPrice = Math.round(basePrice * 1.0)
    const premiumPrice = Math.round(basePrice * 1.5)
    const deluxePrice = Math.round(basePrice * 2.0)

    return [
      {
        id: "basic",
        name: "Basic Package",
        price: basicPrice,
        enhancedPrice: calculatePackageEnhancedPrice(basicPrice),
        duration: priceUnit,
        features: ["Standard service", "Up to 15 children", "Basic setup"],
        description: `Basic ${supplier.category?.toLowerCase()} package`,
        popular: false,
      },
      {
        id: "premium",
        name: "Premium Package",
        price: premiumPrice,
        enhancedPrice: calculatePackageEnhancedPrice(premiumPrice),
        duration: priceUnit,
        features: ["Enhanced service", "Professional setup", "Up to 25 children"],
        description: `Enhanced ${supplier.category?.toLowerCase()} package`,
        popular: true,
      },
      {
        id: "deluxe",
        name: "Deluxe Package",
        price: deluxePrice,
        enhancedPrice: calculatePackageEnhancedPrice(deluxePrice),
        duration: priceUnit,
        features: ["Premium service", "Full setup & cleanup", "Up to 35 children"],
        description: `Complete ${supplier.category?.toLowerCase()} package`,
        popular: false,
      },
    ]
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

  // Helper to format duration for venues
  const formatDurationText = (duration) => {
    if (!duration) return duration

    // Check if this is a venue
    const isVenue = supplier?.category?.toLowerCase() === 'venue' ||
                    supplier?.type?.toLowerCase() === 'venue'

    if (isVenue && duration.toLowerCase().includes('hour')) {
      return `${duration} booking (inc. setup & cleanup)`
    }

    return duration
  }

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
      packagePrice = pricePerBag * partyBagsQuantity
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
      packagePrice = pricePerChild * partyBagsQuantity
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
      packagePrice = pricePerSet * decorationsPackSize
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
        ? selectedCatering.pricePerHead * cateringGuestCount
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

    // Calculate addons price (addons typically don't have weekend/duration premiums for now)
    const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find((a) => a.id === addonId)
      return sum + (addon?.price || 0)
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

    // Final totals
    const totalPrice = packagePrice + addonsTotalPrice + deliveryFee

    return {
      packagePrice,
      addonsTotalPrice,
      deliveryFee,
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
  }, [selectedPackage, supplier, selectedAddons, availableAddons, supplierTypeDetection, effectivePartyDetails, partyBagsQuantity, fulfillmentMethod, cakeFulfillmentOptions, selectedPackageIds, packages, decorationsPackSize, selectedCateringId, cateringGuestCount])

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
      } else {
        // Set default flavor only on first open
        setSelectedFlavor(availableFlavors[0].id);
        setSelectedDietaryOptions([]);
        setCustomMessage("");
        setFulfillmentMethod("delivery"); // Default to delivery
      }
    }

    // Reset when modal closes
    if (!isOpen) {
      setSelectedDietaryOptions([]);
      setCustomMessage("");
      setFulfillmentMethod("delivery");
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
      // Check if supplier already has a selected package
      const existingPackageId = supplier?.packageData?.id || supplier?.packageId;

      if (existingPackageId) {
        // Verify the package still exists in the packages array
        const packageExists = packages.some(pkg => pkg.id === existingPackageId);
        if (packageExists) {
          setSelectedPackageId(existingPackageId);
          return;
        }
      }

      // ✅ NEW: For face painting and balloons, try to auto-select based on party theme
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
      setSelectedCateringId(null);
      setCateringGuestCount(20);
    }
  }, [isOpen, packages, supplier, supplierTypeDetection.isFacePainting, supplierTypeDetection.isBalloons, databasePartyData?.theme, partyDetails?.theme])

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

  if (!supplier) return null

  const handleAddonToggle = (addonId) => {
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  // ✅ UPDATED: Handle add to plan with unified pricing data
  const handleAddToPlan = () => {
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
        enhancedPrice: calculateModalPricing.packagePrice,
        totalPrice: calculateModalPricing.packagePrice,
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
        // ✅ CRITICAL FIX: Include partyBagsMetadata for pricing calculations
        partyBagsMetadata: {
          quantity: partyBagsQuantity,
          pricePerBag: pricePerBag,
          totalPrice: calculateModalPricing.packagePrice,
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
        enhancedPrice: calculateModalPricing.packagePrice,
        totalPrice: calculateModalPricing.packagePrice,
        // Catering specific data
        cateringQuantity: partyBagsQuantity,
        guestCount: partyDetails?.guestCount || 10,
        pricePerChild: pricePerChild,
        // Include cateringMetadata for pricing calculations
        cateringMetadata: {
          quantity: partyBagsQuantity,
          pricePerChild: pricePerChild,
          totalPrice: calculateModalPricing.packagePrice,
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
    } else {
      // ✅ UPDATED: For non-cake, non-party-bags suppliers, still apply unified pricing
      // ✅ FIX: Use totalPrice (includes add-ons) not just packagePrice
      finalPackage = {
        ...selectedPackage,
        price: selectedPackage.price, // Keep original price
        originalPrice: selectedPackage.price,
        enhancedPrice: calculateModalPricing.packagePrice, // Store enhanced price separately
        totalPrice: calculateModalPricing.totalPrice, // ✅ FIXED: Include add-ons in total
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
      }
    }

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

    if (supplierTypeDetection.isCake) {
      return `Book Cake - £${totalPrice}`
    }

    if (supplierTypeDetection.isBalloons) {
      return `Book Balloons - £${totalPrice}`
    }

    if (supplierTypeDetection.isFacePainting) {
      return `Book Face Painting - £${totalPrice}`
    }

    if (supplierTypeDetection.isSoftPlay) {
      return `Book Soft Play - £${totalPrice}`
    }

    if (supplierTypeDetection.isSweetTreats) {
      return `Book Sweet Treats - £${totalPrice}`
    }

    if (supplierTypeDetection.isCatering) {
      return `Book Catering - £${totalPrice}`
    }

    if (supplierTypeDetection.isMultiSelect) {
      return `Book Selection - £${totalPrice}`
    }

    return `Book Service - £${totalPrice}`
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-0 sm:p-4 sm:flex sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:mx-auto bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full md:max-h-[85vh] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 flex items-center justify-between flex-shrink-0 bg-primary-500">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow-sm flex-shrink-0">
              <Image
                src={typeof supplier.image === 'object' ? supplier.image.src : (supplier.image || supplier.imageUrl || "/placeholder.png")}
                alt={supplier.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                {supplierTypeDetection.isCake && <span className="flex-shrink-0">🎂</span>}
                {supplierTypeDetection.isPartyBags && <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />}
                {supplierTypeDetection.isBalloons && <span className="flex-shrink-0">🎈</span>}
                {supplierTypeDetection.isFacePainting && <span className="flex-shrink-0">🎨</span>}
                {supplierTypeDetection.isCatering && <span className="flex-shrink-0">🍱</span>}
                {supplierTypeDetection.isSweetTreats && <span className="flex-shrink-0">🍭</span>}
                {supplierTypeDetection.isDecorations && <span className="flex-shrink-0">🎊</span>}
                {supplierTypeDetection.isEntertainment && <span className="flex-shrink-0">🎭</span>}
                {supplierTypeDetection.isVenue && <span className="flex-shrink-0">🏠</span>}
                <span className="truncate">{supplier.name || supplier.data?.name || 'Supplier'}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          <div className="p-6 space-y-6">
            {/* Cake Suppliers - Single Page Form */}
            {supplierTypeDetection.isCake && (
              <section className="space-y-5">
                {/* Choose Size - Pill buttons on mobile, cards on desktop */}
                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">Choose Size</Label>

                  {/* Mobile: Compact pill buttons */}
                  <div className="sm:hidden">
                    <div className="flex flex-wrap gap-2">
                      {packages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-primary-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                            {pkg.name} · £{pkg.price}
                          </button>
                        );
                      })}
                    </div>
                    {/* Show details for selected size */}
                    {selectedPackage && (
                      <p className="text-xs text-gray-500 mt-2">
                        {[
                          selectedPackage.sizeInches && `${selectedPackage.sizeInches}"`,
                          (() => {
                            const tiers = selectedPackage.tiers || (() => {
                              const name = selectedPackage.name?.toLowerCase() || '';
                              if (name.includes('small') || name.includes('6"') || name.includes('6 inch')) return 1;
                              if (name.includes('medium') || name.includes('8"') || name.includes('8 inch')) return 1;
                              if (name.includes('large') || name.includes('10"') || name.includes('10 inch')) return 2;
                              if (name.includes('xl') || name.includes('extra') || name.includes('12"') || name.includes('12 inch')) return 2;
                              return 1;
                            })();
                            return `${tiers} ${tiers === 1 ? 'tier' : 'tiers'}`;
                          })(),
                          (selectedPackage.serves || selectedPackage.feeds) && `Feeds ${selectedPackage.serves || selectedPackage.feeds}`
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Desktop: Horizontal scroll cards */}
                  <div className="hidden sm:block relative -mx-6">
                    <div
                      className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-6 snap-x snap-mandatory"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {packages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        // Get tiers with fallback based on size name
                        const tiers = pkg.tiers || (() => {
                          const name = pkg.name?.toLowerCase() || '';
                          if (name.includes('small') || name.includes('6"') || name.includes('6 inch')) return 1;
                          if (name.includes('medium') || name.includes('8"') || name.includes('8 inch')) return 1;
                          if (name.includes('large') || name.includes('10"') || name.includes('10 inch')) return 2;
                          if (name.includes('xl') || name.includes('extra') || name.includes('12"') || name.includes('12 inch')) return 2;
                          return 1;
                        })();
                        const feeds = pkg.serves || pkg.feeds;

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`relative flex-shrink-0 w-[150px] rounded-2xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                              isSelected
                                ? "border-[hsl(var(--primary-500))] shadow-lg scale-[1.02]"
                                : "border-[hsl(var(--primary-100))] hover:border-[hsl(var(--primary-300))] shadow-sm hover:shadow-md"
                            }`}
                          >
                            {/* Top colored section */}
                            <div
                              className="px-4 py-3"
                              style={{
                                background: isSelected
                                  ? 'linear-gradient(135deg, hsl(var(--primary-500)), hsl(var(--primary-600)))'
                                  : 'linear-gradient(135deg, hsl(var(--primary-400)), hsl(var(--primary-500)))'
                              }}
                            >
                              <h4 className="font-bold text-white text-center text-lg">
                                {pkg.name}
                              </h4>
                              <div className="text-white/80 text-xs text-center mt-0.5">
                                {tiers} {tiers === 1 ? 'tier' : 'tiers'}
                              </div>
                            </div>

                            {/* Bottom white section */}
                            <div className={`px-4 py-3 ${isSelected ? 'bg-[hsl(var(--primary-50))]' : 'bg-white'}`}>
                              {/* Price - show base price only, delivery is added separately */}
                              <div className="text-2xl font-bold text-center text-[hsl(var(--primary-600))]">
                                £{pkg.price}
                              </div>

                              {/* Feeds info */}
                              {feeds && (
                                <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>Feeds {feeds}</span>
                                </div>
                              )}
                            </div>

                            {/* Selected checkmark */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-md">
                                <CheckCircle className="w-5 h-5 text-[hsl(var(--primary-500))]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="space-y-4">
                  {/* Flavour Selection - Pills like dietary */}
                  <div>
                    <p className="font-medium text-gray-900 text-sm mb-2">Cake Flavour</p>
                    {availableFlavors.length === 0 ? (
                      <span className="text-sm text-gray-500">Contact baker</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableFlavors.map((flavor) => {
                          const isSelected = selectedFlavor === flavor.id
                          return (
                            <button
                              key={flavor.id}
                              type="button"
                              onClick={() => setSelectedFlavor(flavor.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? "bg-primary-500 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                              {flavor.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dietary Requirements - Multi-select */}
                  <div>
                    <p className="font-medium text-gray-900 text-sm mb-2">Dietary Requirements</p>
                    {availableDietaryOptions.length === 0 ? (
                      <p className="text-sm text-gray-500">Standard (no special options available)</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableDietaryOptions.map((option) => {
                          const isSelected = selectedDietaryOptions.includes(option.id)
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setSelectedDietaryOptions(prev =>
                                  isSelected
                                    ? prev.filter(id => id !== option.id)
                                    : [...prev, option.id]
                                )
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? "bg-primary-500 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                              {option.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {selectedDietaryOptions.length === 0 && availableDietaryOptions.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">No dietary requirements selected (standard)</p>
                    )}
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <p className="font-medium text-gray-900 text-sm mb-3">Delivery Method</p>

                    <div className="grid grid-cols-2 gap-3">
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
                            <span className={`font-semibold ${fulfillmentMethod === "delivery" ? "text-gray-900" : "text-gray-700"}`}>
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
                                <span className={`text-base font-bold ${effectiveDeliveryFee > 0 ? "text-gray-900" : "text-gray-900"}`}>
                                  {effectiveDeliveryFee > 0 ? `+£${effectiveDeliveryFee.toFixed(2)}` : "Free"}
                                </span>
                              )
                            })()}
                          </div>
                        </button>
                      )}

                      {/* Pickup Option */}
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
                            <span className={`font-semibold ${fulfillmentMethod === "pickup" ? "text-gray-900" : "text-gray-700"}`}>
                              Pickup
                            </span>
                            {fulfillmentMethod === "pickup" && (
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-500 mb-3">Collect from the baker's location</p>

                          {/* Price row */}
                          <div className="flex items-center w-full mt-auto">
                            <span className="text-base font-bold text-gray-900">Free</span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Pickup Location Info */}
                    {fulfillmentMethod === "pickup" && (cakeFulfillmentOptions.location || cakeFulfillmentOptions.address) && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        {/* Address */}
                        <div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">Collection Address</p>
                              {cakeFulfillmentOptions.address ? (
                                <div className="text-gray-600 mt-1">
                                  {cakeFulfillmentOptions.address.line1 && <p>{cakeFulfillmentOptions.address.line1}</p>}
                                  {cakeFulfillmentOptions.address.line2 && <p>{cakeFulfillmentOptions.address.line2}</p>}
                                  {cakeFulfillmentOptions.address.city && <p>{cakeFulfillmentOptions.address.city}</p>}
                                  {cakeFulfillmentOptions.address.postcode && <p>{cakeFulfillmentOptions.address.postcode}</p>}
                                </div>
                              ) : (
                                <p className="text-gray-600 mt-1">{cakeFulfillmentOptions.location}</p>
                              )}
                            </div>
                          </div>
                          {/* Map Link */}
                          {(cakeFulfillmentOptions.address?.postcode || cakeFulfillmentOptions.location) && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                cakeFulfillmentOptions.address
                                  ? `${cakeFulfillmentOptions.address.line1 || ''} ${cakeFulfillmentOptions.address.city || ''} ${cakeFulfillmentOptions.address.postcode || ''}`
                                  : cakeFulfillmentOptions.location
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 mt-2 ml-6"
                            >
                              <span>View on map</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>

                        {/* Collection Hours */}
                        {cakeFulfillmentOptions.collectionHours && (
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-start gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">Collection Hours</p>
                                <div className="text-gray-600 mt-1 space-y-0.5 text-xs">
                                  {Object.entries(cakeFulfillmentOptions.collectionHours)
                                    .filter(([_, hours]) => hours.isOpen)
                                    .map(([day, hours]) => (
                                      <div key={day} className="flex justify-between gap-4">
                                        <span className="capitalize">{day}</span>
                                        <span>{hours.from} - {hours.to}</span>
                                      </div>
                                    ))}
                                  {Object.values(cakeFulfillmentOptions.collectionHours).every(h => !h.isOpen) && (
                                    <p className="text-gray-500 italic">Collection times arranged after booking</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-2">Special Requests <span className="font-normal text-gray-400">(optional)</span></p>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="E.g. 'Happy 5th Birthday Emma!' or any decorating requests..."
                    rows={2}
                    className="bg-gray-50 border-gray-200 rounded-lg resize-none text-sm placeholder:text-gray-400"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-400 text-right mt-1">{customMessage.length}/500</div>
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
                  <h4 className="font-semibold text-gray-900 text-base mb-3">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start text-sm">
                      <div>
                        <span className="text-gray-600">{selectedPackage?.name || 'Select a size'}</span>
                        {selectedPackage && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {(() => {
                              const tiers = selectedPackage.tiers || (() => {
                                const name = selectedPackage.name?.toLowerCase() || '';
                                if (name.includes('small') || name.includes('6"') || name.includes('6 inch')) return 1;
                                if (name.includes('medium') || name.includes('8"') || name.includes('8 inch')) return 1;
                                if (name.includes('large') || name.includes('10"') || name.includes('10 inch')) return 2;
                                if (name.includes('xl') || name.includes('extra') || name.includes('12"') || name.includes('12 inch')) return 2;
                                return 1;
                              })();
                              const feeds = selectedPackage.serves || selectedPackage.feeds;
                              return `${tiers} ${tiers === 1 ? 'tier' : 'tiers'}${feeds ? ` · Feeds ${feeds}` : ''}`;
                            })()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {selectedPackage ? `£${selectedPackage.price}` : '-'}
                      </span>
                    </div>
                    {fulfillmentMethod === "delivery" && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium text-gray-900">
                          {calculateModalPricing.deliveryFee > 0 ? `£${calculateModalPricing.deliveryFee.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                    )}
                    {fulfillmentMethod === "pickup" && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Pickup</span>
                        <span className="font-medium text-gray-900">Free</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-xl text-gray-900">
                          {selectedPackage ? `£${calculateModalPricing.totalPrice}` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Face Painting - Simplified view with what's included + special requests */}
            {supplierTypeDetection.isFacePainting && (
              <section className="space-y-4">
                {/* What's Included */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Professional face painter for 2 hours
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      FDA-approved, hypoallergenic paints
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Theme-specific + classic designs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      All equipment provided
                    </li>
                  </ul>
                </div>

                {/* Special Requests */}
                <div className="bg-primary-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Special requests</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Let the face painter know about any design preferences or special requirements
                  </p>
                  <Textarea
                    placeholder="e.g., Birthday child wants a dragon, please avoid glitter, child has sensitive skin..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="bg-white border-gray-200 text-sm resize-none"
                    rows={3}
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
                      Balloon modelling
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      20 min break for food
                    </li>
                  </ul>
                </div>

                {/* Special Requests */}
                <div className="bg-primary-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Special requests</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Let the entertainer know about your child's interests or any special requirements
                  </p>
                  <Textarea
                    placeholder="e.g., Birthday child loves dinosaurs, please avoid loud noises, child has additional needs..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="bg-white border-gray-200 text-sm resize-none"
                    rows={3}
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">£{totalPrice}</span>
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
                <div className="sm:hidden relative -mx-6">
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-6 snap-x snap-mandatory"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageIds.includes(pkg.id)
                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[140px] rounded-2xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] shadow-lg scale-[1.02]"
                              : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-sm hover:shadow-md"
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
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center shadow-md">
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
                              £{pkg.price}
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
                        className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer group relative flex ${
                          isSelected
                            ? "ring-2 ring-[hsl(var(--primary-500))]"
                            : "hover:shadow-lg hover:ring-2 hover:ring-gray-200"
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
                              £{pkg.price}
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

                {/* Selected Items Summary */}
                {selectedPackageIds.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-sm text-green-800 font-medium">
                      {selectedPackageIds.length} item{selectedPackageIds.length > 1 ? 's' : ''} selected - £{calculateModalPricing.packagePrice}
                    </p>
                  </div>
                )}

                {/* Minimum Selection Warning */}
                {selectedPackageIds.length === 0 && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm text-amber-700">
                      Please select at least one item to continue
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Catering Suppliers - Lunchbox Selection with Contents */}
            {supplierTypeDetection.isCatering && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Choose Your Lunchbox</h3>
                </div>

                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden relative -mx-6">
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-6 snap-x snap-mandatory"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id
                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[160px] rounded-2xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] shadow-lg scale-[1.02]"
                              : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-sm hover:shadow-md"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Lunchbox Image */}
                          <div className="relative w-full h-28">
                            <Image
                              src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl || "/placeholder.png")}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                              sizes="160px"
                            />
                            {/* Selection checkmark overlay */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center shadow-md">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Lunchbox Info */}
                          <div className="p-2.5 bg-white">
                            <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">
                              {pkg.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-[hsl(var(--primary-600))] text-base">
                                £{pkg.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-gray-400">per child</span>
                            </div>
                            {/* Show first 2 contents items */}
                            {pkg.contents && pkg.contents.length > 0 && (
                              <p className="text-[10px] text-gray-500 mt-1 truncate">
                                {pkg.contents.slice(0, 2).join(', ')}
                                {pkg.contents.length > 2 && '...'}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: Vertical list with full details */}
                <div className="hidden sm:block space-y-4">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id
                    return (
                      <div
                        key={pkg.id}
                        className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer group ${
                          isSelected
                            ? "ring-2 ring-[hsl(var(--primary-500))]"
                            : "hover:shadow-lg hover:ring-2 hover:ring-gray-200"
                        }`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        {/* Header with Image, Title, Price and Checkbox */}
                        <div className="flex items-center p-3 gap-3">
                          {/* Lunchbox Image */}
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl || "/placeholder.png")}
                              alt={pkg.name}
                              fill
                              className="object-cover group-hover:brightness-110 transition-all duration-300"
                              sizes="80px"
                            />
                          </div>

                          {/* Title and Price */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base">{pkg.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-[hsl(var(--primary-600))] text-lg">
                                £{pkg.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-400">per child</span>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
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

                        {/* Contents - Compact when not selected, full when selected */}
                        {/* Show contents if available, or fallback message for catering */}
                        {(pkg.contents && pkg.contents.length > 0) ? (
                          <div className={`border-t border-gray-100 px-3 pb-3 pt-2 ${isSelected ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What&apos;s included:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Show first 3 items when not selected, all items when selected */}
                              {(isSelected ? pkg.contents : pkg.contents.slice(0, 3)).map((item, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    isSelected
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-white text-gray-600 border border-gray-200'
                                  }`}
                                >
                                  {item}
                                </span>
                              ))}
                              {/* Show "+X more" badge when not selected and there are more items */}
                              {!isSelected && pkg.contents.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-500 font-medium">
                                  +{pkg.contents.length - 3} more
                                </span>
                              )}
                            </div>

                            {/* Features badges - show when selected */}
                            {isSelected && pkg.features && pkg.features.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-green-200">
                                <div className="flex flex-wrap gap-2">
                                  {pkg.features.map((feature, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                      <Check className="w-3 h-3" />
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : supplierTypeDetection.isCatering && (
                          <div className={`border-t border-gray-100 px-3 pb-3 pt-2 ${isSelected ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What&apos;s included:</p>
                            <p className="text-xs text-gray-500 italic">
                              Full menu details confirmed after booking
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Decorations - Special card layout for package selection */}
            {supplierTypeDetection.isDecorations && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Choose Your Package</h3>
                </div>

                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden relative -mx-6">
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-6 snap-x snap-mandatory"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg, index) => {
                      const isSelected = selectedPackageId === pkg.id
                      const isPremium = index === packages.length - 1
                      const isMiddle = index === 1
                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[160px] rounded-2xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] shadow-lg scale-[1.02]"
                              : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-sm hover:shadow-md"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Package Image - uses theme-based image if available */}
                          <div className="relative w-full h-32">
                            {getDecorationsPackageImage(pkg) ? (
                              <Image
                                src={getDecorationsPackageImage(pkg)}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="160px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                <Package className="w-8 h-8 text-purple-300" />
                              </div>
                            )}
                            {/* Badge overlay */}
                            {isPremium && (
                              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold py-1 text-center">
                                BEST VALUE
                              </div>
                            )}
                            {isMiddle && !isPremium && pkg.popular && (
                              <div className="absolute top-0 left-0 right-0 bg-[hsl(var(--primary-500))] text-white text-[10px] font-bold py-1 text-center">
                                POPULAR
                              </div>
                            )}
                            {/* Selection checkmark */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white">
                            <h4 className="font-bold text-gray-800 text-sm mb-1">
                              {pkg.name}
                            </h4>
                            <p className="font-bold text-[hsl(var(--primary-600))] text-xl mb-0.5">
                              £{(pkg.price * decorationsPackSize).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-500 mb-2">
                              {decorationsPackSize} sets incl. delivery
                            </p>
                            <ul className="text-[10px] text-gray-600 space-y-0.5">
                              {pkg.features?.map((feature, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: Grid layout with images and full details */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-4">
                  {packages.map((pkg, index) => {
                    const isSelected = selectedPackageId === pkg.id
                    const isPremium = index === packages.length - 1
                    const isMiddle = index === 1
                    return (
                      <div
                        key={pkg.id}
                        className={`relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden border-2 ${
                          isSelected
                            ? "border-[hsl(var(--primary-500))] shadow-xl scale-[1.02]"
                            : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-md hover:shadow-lg"
                        } ${isPremium ? 'ring-2 ring-amber-400' : ''}`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        {/* Package Image - uses theme-based image if available */}
                        <div className="relative w-full h-44">
                          {getDecorationsPackageImage(pkg) ? (
                            <Image
                              src={getDecorationsPackageImage(pkg)}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                              <Package className="w-12 h-12 text-purple-300" />
                            </div>
                          )}
                          {/* Badge overlay */}
                          {isPremium && (
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold py-1.5 text-center">
                              BEST VALUE
                            </div>
                          )}
                          {isMiddle && !isPremium && (
                            <div className="absolute top-0 left-0 right-0 bg-[hsl(var(--primary-500))] text-white text-xs font-bold py-1.5 text-center">
                              MOST POPULAR
                            </div>
                          )}
                          {/* Selection checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center shadow-md z-20">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white">
                          <h4 className="font-bold text-gray-800 text-base mb-1">
                            {pkg.name}
                          </h4>
                          <p className="font-bold text-[hsl(var(--primary-600))] text-2xl mb-0.5">
                            £{(pkg.price * decorationsPackSize).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            {decorationsPackSize} sets incl. free delivery
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1.5">
                            {pkg.features?.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Balloons/Party Bags - Card Grid Package Selection */}
            {(supplierTypeDetection.isBalloons || supplierTypeDetection.isPartyBags) && !supplierTypeDetection.isMultiSelect && !supplierTypeDetection.isCatering && !supplierTypeDetection.isDecorations && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Choose Your Package</h3>
                </div>

                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden relative -mx-6">
                  <div
                    className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-6 snap-x snap-mandatory"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {packages.map((pkg, index) => {
                      const isSelected = selectedPackageId === pkg.id
                      const isPremium = index === packages.length - 1
                      const isMiddle = index === 1
                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex-shrink-0 w-[200px] rounded-2xl cursor-pointer transition-all duration-200 snap-center overflow-hidden border-2 ${
                            isSelected
                              ? "border-[hsl(var(--primary-500))] shadow-lg scale-[1.02] ring-3 ring-[hsl(var(--primary-200))]"
                              : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-sm hover:shadow-md opacity-75"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Selected overlay glow */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-[hsl(var(--primary-500))]/5 pointer-events-none z-10" />
                          )}
                          {/* Package Image */}
                          <div className="relative w-full h-28">
                            {pkg.image || pkg.imageUrl ? (
                              <Image
                                src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl)}
                                alt={pkg.name}
                                fill
                                className="object-cover"
                                sizes="200px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                <Package className="w-10 h-10 text-purple-300" />
                              </div>
                            )}
                            {/* Badge overlay */}
                            {isPremium && (
                              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold py-1 text-center">
                                BEST VALUE
                              </div>
                            )}
                            {isMiddle && !isPremium && pkg.popular && (
                              <div className="absolute top-0 left-0 right-0 bg-[hsl(var(--primary-500))] text-white text-[10px] font-bold py-1 text-center">
                                POPULAR
                              </div>
                            )}
                            {/* Selection checkmark */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center shadow-lg ring-2 ring-white">
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white">
                            <h4 className="font-bold text-gray-800 text-sm mb-1">
                              {pkg.name}
                            </h4>
                            <p className="font-bold text-[hsl(var(--primary-600))] text-xl mb-0.5">
                              £{supplierTypeDetection.isPartyBags ? (pkg.price * partyBagsQuantity).toFixed(2) : pkg.enhancedPrice}
                            </p>
                            {supplierTypeDetection.isPartyBags && (
                              <p className="text-[10px] text-gray-500 mb-2">
                                {partyBagsQuantity} bags
                              </p>
                            )}
                            {pkg.description && (
                              <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">
                                {pkg.description}
                              </p>
                            )}
                            <ul className="text-[10px] text-gray-600 space-y-0.5">
                              {pkg.features?.map((feature, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop: Grid layout with full details */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-4">
                  {packages.map((pkg, index) => {
                    const isSelected = selectedPackageId === pkg.id
                    const isPremium = index === packages.length - 1
                    const isMiddle = index === 1
                    return (
                      <div
                        key={pkg.id}
                        className={`relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden border-3 ${
                          isSelected
                            ? "border-[hsl(var(--primary-500))] shadow-xl scale-[1.02] ring-4 ring-[hsl(var(--primary-200))]"
                            : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-md hover:shadow-lg opacity-75 hover:opacity-100"
                        } ${isPremium && !isSelected ? 'ring-2 ring-amber-400' : ''}`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        {/* Selected overlay glow */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-[hsl(var(--primary-500))]/5 pointer-events-none z-10" />
                        )}
                        {/* Package Image */}
                        <div className="relative w-full h-32">
                          {pkg.image || pkg.imageUrl ? (
                            <Image
                              src={typeof pkg.image === 'object' ? pkg.image.src : (pkg.image || pkg.imageUrl)}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                              <Package className="w-12 h-12 text-purple-300" />
                            </div>
                          )}
                          {/* Badge overlay */}
                          {isPremium && (
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold py-1.5 text-center">
                              BEST VALUE
                            </div>
                          )}
                          {isMiddle && !isPremium && pkg.popular && (
                            <div className="absolute top-0 left-0 right-0 bg-[hsl(var(--primary-500))] text-white text-xs font-bold py-1.5 text-center">
                              MOST POPULAR
                            </div>
                          )}
                          {/* Selection checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center shadow-lg z-20 ring-2 ring-white">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white">
                          <h4 className="font-bold text-gray-800 text-base mb-1">
                            {pkg.name}
                          </h4>
                          <p className="font-bold text-[hsl(var(--primary-600))] text-2xl mb-0.5">
                            £{supplierTypeDetection.isPartyBags ? (pkg.price * partyBagsQuantity).toFixed(2) : pkg.enhancedPrice}
                          </p>
                          {supplierTypeDetection.isPartyBags && (
                            <p className="text-xs text-gray-500 mb-3">
                              {partyBagsQuantity} bags included
                            </p>
                          )}
                          {!supplierTypeDetection.isPartyBags && (
                            <p className="text-xs text-gray-500 mb-3">
                              {pkg.duration || 'Full party duration'}
                            </p>
                          )}
                          {pkg.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                          <ul className="text-sm text-gray-600 space-y-1.5 mb-3">
                            {pkg.features?.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {pkg.fixedItems && pkg.fixedItems.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500 font-medium mb-1">Also includes:</p>
                              <p className="text-xs text-gray-600">{pkg.fixedItems.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {supplierTypeDetection.isPartyBags && selectedPackage && (
              <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Number of Party Bags</h4>
                  <p className="text-xs text-gray-600">
                    Pre-set to match your guest count ({partyDetails?.guestCount || 10}), adjust if needed
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Math.max(1, Number(partyBagsQuantity) - 1))}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                    disabled={Number(partyBagsQuantity) <= 1}
                  >
                    <span className="text-lg">−</span>
                  </Button>

                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-xs text-gray-500">bags</div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>

                <div className="bg-white rounded p-3 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{partyBagsQuantity} bags</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 text-sm">Total:</span>
                        <span className="font-bold text-xl text-gray-900">
                          £{(selectedPackage.price * Number(partyBagsQuantity)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {supplierTypeDetection.isCatering && selectedPackage && (
              <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Number of Lunchboxes</h4>
                  <p className="text-xs text-gray-600">
                    Pre-set to match your guest count ({partyDetails?.guestCount || 10}), adjust if needed
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Math.max(supplier?.minimumOrder || 10, Number(partyBagsQuantity) - 1))}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                    disabled={Number(partyBagsQuantity) <= (supplier?.minimumOrder || 10)}
                  >
                    <span className="text-lg">−</span>
                  </Button>

                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-xs text-gray-500">lunchboxes</div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>

                <div className="bg-white rounded p-3 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{partyBagsQuantity} lunchboxes</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Price per lunchbox:</span>
                      <span className="font-medium text-gray-900">£{selectedPackage.price.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 text-sm">Total:</span>
                        <span className="font-bold text-xl text-gray-900">
                          £{(selectedPackage.price * Number(partyBagsQuantity)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Free Delivery Included</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Delivered the evening before your party (5-8pm). You&apos;ll be emailed delivery details in advance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Minimum order note */}
                {(supplier?.minimumOrder || supplier?.data?.minimumOrder) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum order: {supplier?.minimumOrder || supplier?.data?.minimumOrder} lunchboxes
                  </p>
                )}
              </section>
            )}

            {supplierTypeDetection.isDecorations && selectedPackage && (
              <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Guest Count</h4>
                  <p className="text-xs text-gray-600">
                    Tableware is supplied in packs - we'll round up to ensure you have enough
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Math.max(1, Number(partyBagsQuantity) - 1))}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                    disabled={Number(partyBagsQuantity) <= 1}
                  >
                    <span className="text-lg">−</span>
                  </Button>

                  <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{partyBagsQuantity}</div>
                    <div className="text-xs text-gray-500">guests</div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>

                <div className="bg-white rounded p-3 border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Guest count:</span>
                      <span className="font-medium text-gray-900">{partyBagsQuantity} guests</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Pack size supplied:</span>
                      <span className="font-medium text-gray-900">{decorationsPackSize} sets</span>
                    </div>
                    {decorationsPackSize > partyBagsQuantity && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-600">Buffer included:</span>
                        <span className="font-medium text-green-600">+{decorationsPackSize - partyBagsQuantity} spare</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Price per set:</span>
                      <span className="font-medium text-gray-900">£{selectedPackage.price.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 text-sm">Total:</span>
                        <span className="font-bold text-xl text-gray-900">
                          £{(selectedPackage.price * decorationsPackSize).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Free Delivery Included</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Delivered to your home the evening before (5-8pm)
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {availableAddons.length > 0 && !supplierTypeDetection.isCake && !supplierTypeDetection.isVenue && (
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
                      <div className="font-semibold text-primary-600 text-lg flex-shrink-0">+£{addon.price}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Venue Suppliers - Room Selection + Catering Add-on */}
            {console.log('🏠 [Venue Check] isVenue:', supplierTypeDetection.isVenue, 'packages:', packages.length)}
            {supplierTypeDetection.isVenue && (
              <section className="space-y-6">
                {/* Party date pricing indicator */}
                {effectivePartyDetails?.date && (
                  <div className={`px-4 py-2.5 rounded-lg text-sm ${
                    isWeekendParty
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}>
                    <span className="font-medium">
                      {isWeekendParty ? "Weekend pricing" : "Weekday pricing"}
                    </span>
                    <span className="ml-1 opacity-75">
                      ({isWeekendParty ? "Fri-Sat rates apply" : "Sun-Thu rates apply"})
                    </span>
                  </div>
                )}

                {/* Room Package Cards - Grid like party bags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map((pkg, index) => {
                    const isSelected = selectedPackageId === pkg.id
                    const displayPrice = getVenuePackagePrice(pkg)
                    const hasWeekendPricing = pkg.weekendPrice && pkg.weekendPrice !== pkg.price

                    return (
                      <div
                        key={pkg.id}
                        className={`relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
                          isSelected
                            ? "ring-2 ring-[hsl(var(--primary-500))] shadow-lg"
                            : "border border-gray-200 hover:shadow-md"
                        }`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        {/* Popular badge */}
                        {pkg.popular && (
                          <div className="absolute top-0 left-0 right-0 bg-[hsl(var(--primary-500))] text-white text-xs font-semibold text-center py-1.5 uppercase tracking-wide z-10">
                            Most Popular
                          </div>
                        )}

                        {/* Selection checkmark */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[hsl(var(--primary-500))] flex items-center justify-center z-10">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Package Image */}
                        {pkg.image && (
                          <div className={`relative w-full h-36 ${pkg.popular ? 'mt-7' : ''}`}>
                            <Image
                              src={typeof pkg.image === 'object' ? pkg.image.src : pkg.image}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 50vw"
                            />
                          </div>
                        )}

                        {/* Package Content */}
                        <div className="p-4 bg-white">
                          <h4 className="font-bold text-gray-900 text-lg">{pkg.name}</h4>

                          {/* Price */}
                          <div className="mt-2">
                            <span className="text-2xl font-bold text-[hsl(var(--primary-500))]">
                              £{displayPrice}
                            </span>
                            {hasWeekendPricing && (
                              <span className="text-sm text-gray-500 ml-2">
                                {isWeekendParty ? `(£${pkg.price} weekdays)` : `(£${pkg.weekendPrice} weekends)`}
                              </span>
                            )}
                          </div>

                          {/* Capacity & Duration */}
                          {(pkg.minGuests || pkg.maxGuests || pkg.duration) && (
                            <p className="text-sm text-gray-500 mt-1">
                              {pkg.minGuests && pkg.maxGuests && `${pkg.minGuests}-${pkg.maxGuests} guests`}
                              {pkg.duration && ` • ${pkg.duration}`}
                            </p>
                          )}

                          {/* Description */}
                          {pkg.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pkg.description}</p>
                          )}

                          {/* Features */}
                          {pkg.features && pkg.features.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {pkg.features.slice(0, 5).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* SECTION 2: Add Catering (if venue offers it) */}
                {(() => {
                  const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                  if (cateringPackages.length === 0) return null

                  return (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Party Catering</h3>

                      <div className="space-y-3">
                        {/* No catering option */}
                        <div
                          className={`rounded-xl cursor-pointer transition-all duration-200 p-4 ${
                            !selectedCateringId
                              ? "bg-[hsl(var(--primary-50))] ring-2 ring-[hsl(var(--primary-500))]"
                              : "bg-gray-50 border border-gray-200 hover:border-gray-300"
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

                          return (
                            <div
                              key={catering.id}
                              className={`rounded-xl cursor-pointer transition-all duration-200 overflow-hidden ${
                                isSelected
                                  ? "ring-2 ring-[hsl(var(--primary-500))]"
                                  : "border border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setSelectedCateringId(catering.id)}
                            >
                              {/* Catering image if available */}
                              {catering.image && (
                                <div className="relative w-full h-32">
                                  <Image
                                    src={catering.image}
                                    alt={catering.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              <div className="p-4 bg-white">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{catering.name}</h4>
                                    <p className="text-sm text-gray-600 mt-0.5">{catering.description}</p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="text-xl font-bold text-[hsl(var(--primary-500))]">£{catering.pricePerHead}</div>
                                    <div className="text-xs text-gray-500">per person</div>
                                  </div>
                                  <div className={`ml-3 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? 'bg-[hsl(var(--primary-500))] border-[hsl(var(--primary-500))]'
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                </div>

                                {/* Menu items - grouped by section if available */}
                                {catering.sections && catering.sections.length > 0 ? (
                                  <div className="mt-4 space-y-4">
                                    {catering.sections.map((section, sIdx) => (
                                      <div key={sIdx}>
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{section.title}</h5>
                                        <div className="space-y-1">
                                          {section.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                              <span>{item}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : catering.items && catering.items.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    {catering.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span>{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {catering.dietaryInfo && (
                                  <p className="text-xs text-gray-500 mt-3 italic">{catering.dietaryInfo}</p>
                                )}

                                {/* Guest count when selected */}
                                {isSelected && (
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
                                        £{(catering.pricePerHead * cateringGuestCount).toFixed(2)}
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
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-[hsl(var(--primary-500))]" />
                      <h3 className="text-lg font-bold text-gray-900">Add Extras</h3>
                    </div>
                    <div className="space-y-3">
                      {availableAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedAddons.includes(addon.id)
                              ? "bg-[hsl(var(--primary-50))] ring-2 ring-[hsl(var(--primary-500))]"
                              : "bg-gray-50 border border-gray-200 hover:border-gray-300"
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
                            <div className="flex items-center gap-2 mb-1">
                              <label
                                htmlFor={`venue-addon-${addon.id}`}
                                className="font-semibold text-gray-900 cursor-pointer"
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
                            {addon.description && (
                              <p className="text-sm text-gray-600">{addon.description}</p>
                            )}
                          </div>
                          <div className="font-bold text-[hsl(var(--primary-500))] text-lg flex-shrink-0">+£{addon.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 4: Price Summary */}
                {selectedPackage && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">Your Booking Summary</h4>
                    <div className="space-y-3">
                      {/* Room */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{selectedPackage.name}</p>
                          <p className="text-sm text-gray-500">{selectedPackage.duration}</p>
                        </div>
                        <span className="font-semibold text-gray-900">£{getVenuePackagePrice(selectedPackage)}</span>
                      </div>

                      {/* Catering (if selected) */}
                      {(() => {
                        const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                        const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)
                        if (!selectedCatering) return null

                        return (
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900">{selectedCatering.name}</p>
                              <p className="text-sm text-gray-500">{cateringGuestCount} guests × £{selectedCatering.pricePerHead}</p>
                            </div>
                            <span className="font-semibold text-gray-900">£{(selectedCatering.pricePerHead * cateringGuestCount).toFixed(2)}</span>
                          </div>
                        )
                      })()}

                      {/* Add-ons (if selected) */}
                      {selectedAddons.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 space-y-2">
                          {selectedAddons.map(addonId => {
                            const addon = availableAddons.find(a => a.id === addonId)
                            if (!addon) return null
                            return (
                              <div key={addonId} className="flex justify-between items-center">
                                <p className="font-medium text-gray-900">{addon.name}</p>
                                <span className="font-semibold text-gray-900">£{addon.price}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-2">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[hsl(var(--primary-500))]">
                          £{(() => {
                            const venuePrice = getVenuePackagePrice(selectedPackage)
                            const cateringPackages = supplier?.data?.cateringPackages || supplier?.cateringPackages || []
                            const selectedCatering = cateringPackages.find(c => c.id === selectedCateringId)
                            const cateringPrice = selectedCatering ? selectedCatering.pricePerHead * cateringGuestCount : 0
                            const addonsPrice = selectedAddons.reduce((sum, addonId) => {
                              const addon = availableAddons.find(a => a.id === addonId)
                              return sum + (addon?.price || 0)
                            }, 0)
                            return (venuePrice + cateringPrice + addonsPrice).toFixed(2)
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
                        <span className="font-medium text-gray-900">£{addon.price}</span>
                      </div>
                    ) : null
                  })}

                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">£{totalPrice}</span>
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
                (supplierTypeDetection.isMultiSelect ? selectedPackageIds.length === 0 : (!selectedPackageId && !supplierTypeDetection.isFacePainting)) ||
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

      {/* Package Details Modal */}
      {showPackageModal && selectedPackageForModal && (
        <PackageDetailsModal
          pkg={selectedPackageForModal}
          isOpen={showPackageModal}
          onClose={() => {
            setShowPackageModal(false)
            setSelectedPackageForModal(null)
          }}
          onChoosePackage={setSelectedPackageId}
          isSelected={selectedPackageId === selectedPackageForModal.id}
          isPartyBags={supplierTypeDetection.isPartyBags}
          isCake={supplierTypeDetection.isCake}
          partyBagsQuantity={partyBagsQuantity}
          formattedDuration={formatDurationText(selectedPackageForModal.duration)}
          supplier={supplier}
        />
      )}
    </div>
  )
}
