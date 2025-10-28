// Enhanced SupplierCustomizationModal with unified pricing system integration
"use client"

import { useState, useMemo, useEffect } from "react"
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
  ChefHat,
  MessageSquare,
  Clock,
  Truck,
  Cake,
  Package,
  Gift,
  X,
  CheckCircle,
  ImageIcon,
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

// Default cake flavors
const DEFAULT_CAKE_FLAVORS = [
  { id: "vanilla", name: "Vanilla Sponge", popular: true },
  { id: "chocolate", name: "Chocolate Fudge", popular: true },
  { id: "strawberry", name: "Strawberry", popular: true },
  { id: "red-velvet", name: "Red Velvet" },
  { id: "lemon", name: "Lemon Drizzle" },
  { id: "funfetti", name: "Funfetti/Rainbow" },
]

// Package Details Modal (Drawer on mobile)
const PackageDetailsModal = ({ pkg, isOpen, onClose, onChoosePackage, isSelected, isPartyBags, partyBagsQuantity, formattedDuration }) => {
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
        window.scrollTo(0, scrollY)
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

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative h-48 sm:h-64 flex-shrink-0">
          <Image
            src={pkg.image || pkg.imageUrl || "/placeholder.png"}
            alt={pkg.name}
            fill
            className="object-cover"
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
              {!isPartyBags && (
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
          {/* What's Included */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">What's Included</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {pkg.features?.map((item, i) => (
                <span key={i} className="bg-[hsl(var(--primary-500))] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Package Description */}
          {pkg.description && (
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
                ? "bg-gray-200 hover:bg-green-600 text-white"
                : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Package Selected
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Choose This Package
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
}) {
  // ✅ DEBUG: Log when modal receives new supplier prop
  useEffect(() => {
    if (isOpen && supplier) {
      console.log('🎯 [Modal] Received supplier prop:', {
        name: supplier.name,
        packageId: supplier.packageId,
        packageData: supplier.packageData,
        packageDataId: supplier.packageData?.id,
        hasPackageData: !!supplier.packageData,
        supplierKeys: Object.keys(supplier)
      });
    }
  }, [isOpen, supplier]);
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [canAddCheck, setCanAddCheck] = useState({ canAdd: true, reason: "planning_empty_slot", showModal: false })

  // Cake customization state
  const [showCakeCustomization, setShowCakeCustomization] = useState(false)
  const [selectedFlavor, setSelectedFlavor] = useState("vanilla")
  const [customMessage, setCustomMessage] = useState("")

  // Party bags quantity state - ensure it's always a number
  const [partyBagsQuantity, setPartyBagsQuantity] = useState(Number(partyDetails?.guestCount) || 10)

  // Package details modal state
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [selectedPackageForModal, setSelectedPackageForModal] = useState(null)

  // Disable body scroll when main modal is open (iOS Safari compatible)
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
        window.scrollTo(0, scrollY)
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
        console.log('🎒 Restoring party bags quantity:', existingQuantity);
        setPartyBagsQuantity(Number(existingQuantity));
      } else {
        // Default to guest count
        setPartyBagsQuantity(Number(partyDetails?.guestCount) || 10);
      }
    }
  }, [isOpen, supplier, partyDetails?.guestCount])

  // ✅ UPDATED: Detect supplier types using unified system
  const supplierTypeDetection = useMemo(() => {
    if (!supplier) return { isLeadBased: false, isTimeBased: false, isCake: false, isPartyBags: false }

    const isLeadBased = isLeadBasedSupplier(supplier)
    const isTimeBased = isTimeBasedSupplier(supplier)


    // Detect if this is a cake supplier
    const isCakeSupplier =
      supplier?.category?.toLowerCase().includes("cake") ||
      supplier?.type?.toLowerCase().includes("cake") ||
      (supplier?.category?.toLowerCase().includes("catering") &&
        (supplier?.serviceDetails?.cateringType?.toLowerCase().includes("cake") ||
          supplier?.serviceDetails?.cateringType?.toLowerCase().includes("baker") ||
          supplier?.serviceDetails?.cakeFlavors?.length > 0 ||
          supplier?.serviceDetails?.cakeSpecialist === true)) ||
      `${supplier?.name || ""} ${supplier?.description || ""}`.toLowerCase().includes("cake")

    // Detect if this is a party bags supplier
    const isPartyBagsSupplier =
      supplier?.category === "Party Bags" ||
      supplier?.category?.toLowerCase().includes("party bag") ||
      supplier?.type?.toLowerCase().includes("party bag")



    return {
      isLeadBased,
      isTimeBased,
      isCake: isCakeSupplier,
      isPartyBags: isPartyBagsSupplier,
    }
  }, [supplier])

  // ✅ UPDATED: Create comprehensive party details for pricing
  const effectivePartyDetails = useMemo(() => {
    // Priority 1: Use provided partyDetails prop
    if (partyDetails) {
      console.log("🎭 Modal: Using provided party details:", partyDetails)
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
      console.log("🎭 Modal: Using database party data for pricing")
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
          console.log("🎭 Modal: Enhanced with localStorage party details")
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

    console.log("🎭 Modal: Final party details for pricing:", finalDetails)
    return finalDetails
  }, [partyDetails, partyDate, selectedDate, userType, databasePartyData])

  // Get available cake flavors
  const availableFlavors = useMemo(() => {
    if (!supplier) return DEFAULT_CAKE_FLAVORS

    if (supplier?.serviceDetails?.cakeFlavors?.length > 0) {
      return supplier.serviceDetails.cakeFlavors.map((flavor, index) => ({
        id: flavor.toLowerCase().replace(/\s+/g, "-"),
        name: flavor,
        popular: index < 3,
      }))
    }

    return DEFAULT_CAKE_FLAVORS
  }, [supplier])

  const calculatePackageEnhancedPrice = useMemo(() => {
    return (packagePrice) => {
      if (!supplier || !effectivePartyDetails) {
        console.log("🎭 Modal: No supplier or party details for pricing")
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

  // ✅ UPDATED: Enhanced packages with unified pricing
  const packages = useMemo(() => {
    if (!supplier) return []

    if (supplier.packages && supplier.packages.length > 0) {
      return supplier.packages.slice(0, 3).map((pkg, index) => {
        const enhancedPrice = calculatePackageEnhancedPrice(pkg.price)
        return {
          id: pkg.id || `real-${index}`,
          name: pkg.name,
          price: pkg.price,
          enhancedPrice: enhancedPrice,
          duration: pkg.duration,
          image: pkg.image,
          features: pkg.whatsIncluded || pkg.features || [],
          popular: index === 1,
          description: pkg.description,
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

  const availableAddons = supplier?.serviceDetails?.addOnServices || []
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId)
  const selectedFlavorObj = availableFlavors.find((f) => f.id === selectedFlavor) || availableFlavors[0]

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
    let packagePrice = selectedPackage.enhancedPrice
    const hasEnhancedPricing = packagePrice !== selectedPackage.price

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

    // Calculate addons price (addons typically don't have weekend/duration premiums for now)
    const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find((a) => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)

    // Final totals
    const totalPrice = packagePrice + addonsTotalPrice

  

    return {
      packagePrice,
      addonsTotalPrice,
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
  }, [selectedPackage, supplier, selectedAddons, availableAddons, supplierTypeDetection, effectivePartyDetails, partyBagsQuantity])

  // Use the calculated totals
  const totalPrice = calculateModalPricing.totalPrice

  // ✅ Initialize cake customization from existing data or defaults
  useEffect(() => {
    if (isOpen && availableFlavors.length > 0) {
      // Check if supplier already has cake customization data
      const existingCakeData = supplier?.packageData?.cakeCustomization;

      if (existingCakeData) {
        // Restore previous customization
        console.log('🎂 Restoring cake customization:', existingCakeData);
        setSelectedFlavor(existingCakeData.flavor || availableFlavors[0].id);
        setCustomMessage(existingCakeData.customMessage || "");
        setShowCakeCustomization(true); // Show customization if it exists
      } else {
        // Set default flavor only on first open
        setSelectedFlavor(availableFlavors[0].id);
        setCustomMessage("");
        setShowCakeCustomization(false);
      }
    }

    // Reset when modal closes
    if (!isOpen) {
      console.log('🔄 Modal closed, resetting cake customization');
      setShowCakeCustomization(false);
      setCustomMessage("");
    }
  }, [isOpen, availableFlavors, supplier])

  // ✅ Initialize selected package when modal opens or supplier changes
  useEffect(() => {
    if (isOpen && packages.length > 0) {
      // Check if supplier already has a selected package
      const existingPackageId = supplier?.packageData?.id || supplier?.packageId;

      console.log('🔍 Initializing package selection:', {
        existingPackageId,
        currentSelectedId: selectedPackageId,
        availablePackages: packages.map(p => p.id),
        // ✅ ADD: Debug what supplier actually has
        supplierPackageId: supplier?.packageId,
        supplierPackageDataId: supplier?.packageData?.id,
        supplierPackageData: supplier?.packageData,
        supplierKeys: supplier ? Object.keys(supplier) : [],
        fullSupplier: supplier
      });

      if (existingPackageId) {
        // Verify the package still exists in the packages array
        const packageExists = packages.some(pkg => pkg.id === existingPackageId);
        if (packageExists) {
          console.log('🎯 Restoring previously selected package:', existingPackageId);
          setSelectedPackageId(existingPackageId);
          return;
        }
      }

      // Default to first package if no existing selection
      console.log('📦 Defaulting to first package:', packages[0].id);
      setSelectedPackageId(packages[0].id)
    }

    // Reset when modal closes
    if (!isOpen) {
      console.log('🔄 Modal closed, resetting package selection');
      setSelectedPackageId(null);
    }
  }, [isOpen, packages, supplier])

  // ✅ Restore previously selected addons when modal opens/closes
  useEffect(() => {
    if (isOpen && supplier) {
      // Check if supplier has previously selected addons
      const existingAddons = supplier?.selectedAddons || supplier?.packageData?.selectedAddons || [];

      if (existingAddons.length > 0) {
        const existingAddonIds = existingAddons.map(addon => addon.id);
        console.log('🎯 Restoring previously selected addons:', existingAddonIds);
        setSelectedAddons(existingAddonIds);
      } else {
        // Reset addons if no existing selection
        setSelectedAddons([]);
      }
    }

    // Reset when modal closes
    if (!isOpen) {
      console.log('🔄 Modal closed, resetting addon selection');
      setSelectedAddons([]);
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

    if (supplierTypeDetection.isCake && showCakeCustomization) {
      finalPackage = {
        ...selectedPackage,

        // ✅ UPDATED: Use unified pricing
        price: selectedPackage.price, // Keep original price
        originalPrice: selectedPackage.price,
        totalPrice: calculateModalPricing.packagePrice,
        enhancedPrice: calculateModalPricing.packagePrice,

        // Payment and delivery info
        paymentType: "full_payment",
        deliveryExpectation: "pre_party_delivery",
        supplierContactRequired: true,

        // Enhanced cake customization data
        cakeCustomization: {
          flavor: selectedFlavor,
          flavorName: selectedFlavorObj?.name || "Custom Flavor",
          customMessage: customMessage.trim(),
          customizationType: "cake_specialist",
        },

        // Update package features
        features: [
          ...(selectedPackage.features || []),
          `${selectedFlavorObj?.name || "Custom"} flavor`,
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
      finalPackage = {
        ...selectedPackage,
        price: pricePerBag, // Store per-bag price
        originalPrice: pricePerBag,
        enhancedPrice: calculateModalPricing.packagePrice,
        totalPrice: calculateModalPricing.packagePrice,
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
    } else {
      // ✅ UPDATED: For non-cake, non-party-bags suppliers, still apply unified pricing
      finalPackage = {
        ...selectedPackage,
        price: selectedPackage.price, // Keep original price
        originalPrice: selectedPackage.price,
        enhancedPrice: calculateModalPricing.packagePrice, // Store enhanced price separately
        totalPrice: calculateModalPricing.packagePrice,
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
      },
      package: finalPackage,
      addons: selectedAddonObjects,
      totalPrice: calculateModalPricing.totalPrice,
      autoEnquiry: false,
    }

    console.log("🎭 Modal: Sending data with unified pricing:", {
      packagePrice: finalPackage.price,
      originalPrice: finalPackage.originalPrice,
      totalPrice: dataToSend.totalPrice,
      enhancedPricingApplied: calculateModalPricing.hasEnhancedPricing,
      duration: effectivePartyDetails?.duration,
      supplierType: supplierTypeDetection,
    })

    try {
      const result = onAddToPlan(dataToSend)
      onClose()
    } catch (error) {
      console.error("Error calling onAddToPlan:", error)
    }
  }

  const isCakeCustomizationComplete = () => {
    if (!supplierTypeDetection.isCake || !showCakeCustomization) return true
    return selectedFlavorObj && availableFlavors.length > 0
  }

  const getButtonText = () => {
    if (isAdding) {
      return "Adding..."
    }

    if (!canAddCheck.canAdd) {
      return currentPhase === "awaiting_responses" ? "Slot Occupied" : "Enquiry Pending"
    }

    if (supplierTypeDetection.isCake && !showCakeCustomization) {
      return `🎂 Customize Cake (£${totalPrice})`
    }

    return `Book ${supplierTypeDetection.isCake ? "Cake" : "Service"} - £${totalPrice}`
  }

  const handleCakeCustomizeClick = () => {
    if (!showCakeCustomization) {
      setShowCakeCustomization(true)
    } else {
      handleAddToPlan()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 flex items-center justify-between flex-shrink-0 bg-primary-500">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow-sm flex-shrink-0">
              <Image
                src={supplier.image || supplier.imageUrl || "/placeholder.png"}
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
                <span className="truncate">{supplier.name}</span>
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
          <div className="p-6 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">Choose Your Package</h3>
              </div>

              {supplierTypeDetection.isCake && showCakeCustomization && selectedPackage && (
                <div className="bg-primary-50 rounded-xl p-5 border-2 border-[hsl(var(--primary-200))] mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                        🎂 {selectedPackage.name}
                      </h4>
                      {/* ✅ Add Change Package button */}
                      <button
                        onClick={() => setShowCakeCustomization(false)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1 underline"
                      >
                        Change Package
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-600">£{calculateModalPricing.packagePrice}</div>
                      <div className="text-xs text-orange-700 font-medium">Full Payment</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-gray-700">Delivery</div>
                        <div className="text-xs text-gray-600">1-2 days before</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-gray-700">Contact</div>
                        <div className="text-xs text-gray-600">Supplier calls you</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!showCakeCustomization && (
                <div className="relative -mx-6">
                  {/* Horizontal Scroll Container */}
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
                          className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer group relative flex-shrink-0 w-[180px] snap-center my-1 ${
                            isSelected
                              ? "ring-2 ring-[hsl(var(--primary-500))] scale-[1.02]"
                              : "hover:shadow-lg hover:ring-2 hover:ring-gray-200"
                          }`}
                          onClick={() => setSelectedPackageId(pkg.id)}
                        >
                          {/* Package Image with Mask */}
                          {pkg.image || pkg.imageUrl ? (
                            <div className="relative w-full">
                              <div
                                className="relative w-[85%] h-[120px] mx-auto mt-1"
                                style={{
                                  WebkitMaskImage: 'url("/image.svg")',
                                  WebkitMaskRepeat: 'no-repeat',
                                  WebkitMaskSize: 'contain',
                                  WebkitMaskPosition: 'center',
                                  maskImage: 'url("/image.svg")',
                                  maskRepeat: 'no-repeat',
                                  maskSize: 'contain',
                                  maskPosition: 'center',
                                }}
                              >
                                <Image
                                  src={pkg.image || pkg.imageUrl || "/placeholder.png"}
                                  alt={pkg.name}
                                  fill
                                  className="object-cover group-hover:brightness-110 transition-all duration-300"
                                  sizes="180px"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}

                          {/* Package Info */}
                          <div className="p-2 text-center">
                            {/* Title */}
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <h4 className="font-bold text-gray-800 text-xs truncate">
                                {pkg.name} 
                              </h4>
                              {pkg.popular && (
                                <Badge className="bg-[hsl(var(--primary-500))] text-white text-[10px] px-1.5 py-0">
                                  ★
                                </Badge>
                              )}
                            </div>

                            {/* Price */}
                            <div className="mb-1">
                              {supplierTypeDetection.isPartyBags ? (
                                <p className="font-bold text-[hsl(var(--primary-600))] text-base">
                                  £{(pkg.price * partyBagsQuantity).toFixed(2)}
                                </p>
                              ) : (
                                <p className="font-bold text-[hsl(var(--primary-600))] text-base">
                                  £{pkg.enhancedPrice}
                                </p>
                              )}
                            </div>

                            {/* Duration */}
                            {/* <div className="flex items-center justify-center gap-1 text-gray-500 text-[10px] mb-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDurationText(pkg.duration)}</span>
                            </div> */}

                            {/* View Details Button */}
                            <button
                              className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white transition-colors text-sm py-2 font-semibold rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPackageForModal(pkg)
                                setShowPackageModal(true)
                              }}
                            >
                              Details
                            </button>
                          </div>

                          {/* Deselect Button */}
                          {isSelected && (
                            <button
                              className="absolute top-1 left-1 bg-gray-500 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-all duration-200 opacity-80 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPackageId(null)
                              }}
                              title="Deselect package"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Scroll Indicator */}
                  {packages.length > 1 && (
                    <div className="flex justify-center gap-1 mt-1">
                      {packages.map((pkg, index) => (
                        <div
                          key={pkg.id}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            selectedPackageId === pkg.id
                              ? 'w-6 bg-[hsl(var(--primary-500))]'
                              : 'w-1 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {supplierTypeDetection.isCake && showCakeCustomization && (
              <section className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 block">Choose Cake Flavor</Label>

                    {availableFlavors.length === 0 ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          This supplier hasn't specified their available flavors yet. Please discuss flavor options
                          directly with them.
                        </p>
                      </div>
                    ) : (
                      <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                        <SelectTrigger className="w-full h-12 px-3 bg-white border-2 border-gray-200 hover:border-primary-300 rounded-lg">
                          <SelectValue placeholder="Select a flavor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFlavors.map((flavor) => (
                            <SelectItem key={flavor.id} value={flavor.id} className="py-3">
                              {flavor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2 block">
                      {/* <MessageSquare className="w-4 h-4" /> */}
                      Special Requests or Custom Message
                    </Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Any special decorating requests, dietary requirements, or message for the cake maker..."
                      rows={4}
                      className="bg-white border-2 border-gray-200 hover:border-[hsl(var(--primary-300))] rounded-lg resize-none"
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 text-right mt-1">{customMessage.length}/500 characters</div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong className="font-semibold">Next steps:</strong> After booking,{" "}
                    {supplier?.name || "the cake maker"} will contact you within 24 hours to confirm delivery details
                    and finalize any custom decorating requests.
                  </p>
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

            {availableAddons.length > 0 && !showCakeCustomization && (
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

            {!showCakeCustomization && !supplierTypeDetection.isPartyBags && (
              <section className="bg-gray-50 rounded-lg p-5 border border-gray-200">
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
              onClick={
                supplierTypeDetection.isCake && !showCakeCustomization ? handleCakeCustomizeClick : handleAddToPlan
              }
              className={`flex-[2] h-12 font-semibold shadow-lg hover:shadow-xl transition-all ${
                !canAddCheck.canAdd
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }`}
              disabled={
                !selectedPackageId ||
                isAdding ||
                !canAddCheck.canAdd ||
                (supplierTypeDetection.isCake && showCakeCustomization && !isCakeCustomizationComplete())
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
                  {supplierTypeDetection.isCake && !showCakeCustomization ? (
                    <ChefHat className="w-4 h-4 mr-2" />
                  ) : showCakeCustomization ? (
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
          partyBagsQuantity={partyBagsQuantity}
          formattedDuration={formatDurationText(selectedPackageForModal.duration)}
        />
      )}
    </div>
  )
}
