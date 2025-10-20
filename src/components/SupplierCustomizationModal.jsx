// Enhanced SupplierCustomizationModal with unified pricing system integration
"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Star, 
  Check, 
  Plus,
  Users,
  Sparkles,
  ChefHat,
  MessageSquare,
  Clock, 
  AlertCircle, 
  Heart,
  Truck,
  Cake,
  Package,
  Gift
} from "lucide-react"
import Image from "next/image"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"

// ✅ UPDATED: Import unified pricing system
import { 
  calculateFinalPrice, 
  isLeadBasedSupplier,
  isTimeBasedSupplier, 
  getPartyDuration, 
  formatDuration 
} from '@/utils/unifiedPricing'

// Default cake flavors
const DEFAULT_CAKE_FLAVORS = [
  { id: 'vanilla', name: 'Vanilla Sponge', popular: true },
  { id: 'chocolate', name: 'Chocolate Fudge', popular: true },
  { id: 'strawberry', name: 'Strawberry', popular: true },
  { id: 'red-velvet', name: 'Red Velvet' },
  { id: 'lemon', name: 'Lemon Drizzle' },
  { id: 'funfetti', name: 'Funfetti/Rainbow' }
]

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
  userType = null
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [canAddCheck, setCanAddCheck] = useState({ canAdd: true, reason: 'planning_empty_slot', showModal: false })

  // Cake customization state
  const [showCakeCustomization, setShowCakeCustomization] = useState(false)
  const [selectedFlavor, setSelectedFlavor] = useState('vanilla')
  const [customMessage, setCustomMessage] = useState('')

  // Party bags quantity state - ensure it's always a number
  const [partyBagsQuantity, setPartyBagsQuantity] = useState(Number(partyDetails?.guestCount) || 10)

  // Sync party bags quantity with guest count changes
  useEffect(() => {
    if (supplier && (supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag'))) {
      setPartyBagsQuantity(Number(partyDetails?.guestCount) || 10)
    }
  }, [partyDetails?.guestCount, supplier])

  // ✅ UPDATED: Detect supplier types using unified system
  const supplierTypeDetection = useMemo(() => {
    if (!supplier) return { isLeadBased: false, isTimeBased: false, isCake: false, isPartyBags: false }
    
    const isLeadBased = isLeadBasedSupplier(supplier)
    const isTimeBased = isTimeBasedSupplier(supplier)

    console.log('🔍 DEBUG: Modal version check - LEAD_BASED_FIX_v2')
    console.log('🔍 DEBUG: Supplier data:', supplier?.name, supplier?.category)
    
    // Detect if this is a cake supplier
    const isCakeSupplier = supplier?.category?.toLowerCase().includes('cake') ||
                          supplier?.type?.toLowerCase().includes('cake') ||
                          (supplier?.category?.toLowerCase().includes('catering') &&
                           (supplier?.serviceDetails?.cateringType?.toLowerCase().includes('cake') ||
                            supplier?.serviceDetails?.cateringType?.toLowerCase().includes('baker') ||
                            supplier?.serviceDetails?.cakeFlavors?.length > 0 ||
                            supplier?.serviceDetails?.cakeSpecialist === true)) ||
                          `${supplier?.name || ''} ${supplier?.description || ''}`.toLowerCase().includes('cake')

    // Detect if this is a party bags supplier
    const isPartyBagsSupplier = supplier?.category === 'Party Bags' ||
                               supplier?.category?.toLowerCase().includes('party bag') ||
                               supplier?.type?.toLowerCase().includes('party bag')

    console.log('🔍 Supplier Type Detection:', {
      supplierName: supplier.name,
      category: supplier.category,
      type: supplier.type,
      isLeadBased,
      isTimeBased,
      isCakeSupplier,
      isPartyBagsSupplier
    })

    return {
      isLeadBased,
      isTimeBased,
      isCake: isCakeSupplier,
      isPartyBags: isPartyBagsSupplier
    }
  }, [supplier])

  // ✅ UPDATED: Create comprehensive party details for pricing
  const effectivePartyDetails = useMemo(() => {
    // Priority 1: Use provided partyDetails prop
    if (partyDetails) {
      console.log('🎭 Modal: Using provided party details:', partyDetails)
      return partyDetails
    }

    // Priority 2: Build from various sources
    let date = partyDate || selectedDate
    let duration = 2 // Default
    let guestCount = null

    // Try to get from database party data
    if (userType === 'DATABASE_USER' && databasePartyData) {
      if (databasePartyData.date) date = databasePartyData.date
      if (databasePartyData.duration) duration = databasePartyData.duration
      if (databasePartyData.guestCount) guestCount = databasePartyData.guestCount
      console.log('🎭 Modal: Using database party data for pricing')
    }

    // Try to get from localStorage
    if (!date || !guestCount || duration === 2) {
      try {
        const partyDetailsStored = localStorage.getItem('party_details')
        if (partyDetailsStored) {
          const parsed = JSON.parse(partyDetailsStored)
          if (!date && parsed.date) date = parsed.date
          if (!guestCount && parsed.guestCount) guestCount = parsed.guestCount
          if (duration === 2 && parsed.duration) duration = parsed.duration
          
          // Try to calculate duration from times
          if (duration === 2 && parsed.startTime && parsed.endTime) {
            duration = getPartyDuration(parsed)
          }
          console.log('🎭 Modal: Enhanced with localStorage party details')
        }
      } catch (error) {
        console.warn('Could not get party details from localStorage:', error)
      }
    }

    // Build final party details object
    const finalDetails = {
      date: date ? new Date(date) : null,
      duration,
      guestCount
    }

    console.log('🎭 Modal: Final party details for pricing:', finalDetails)
    return finalDetails
  }, [partyDetails, partyDate, selectedDate, userType, databasePartyData])

  // Get available cake flavors
  const availableFlavors = useMemo(() => {
    if (!supplier) return DEFAULT_CAKE_FLAVORS

    if (supplier?.serviceDetails?.cakeFlavors?.length > 0) {
      return supplier.serviceDetails.cakeFlavors.map((flavor, index) => ({
        id: flavor.toLowerCase().replace(/\s+/g, '-'),
        name: flavor,
        popular: index < 3
      }))
    }
    
    return DEFAULT_CAKE_FLAVORS
  }, [supplier?.serviceDetails?.cakeFlavors])

  const calculatePackageEnhancedPrice = useMemo(() => {
    return (packagePrice) => {
      if (!supplier || !effectivePartyDetails) {
        console.log('🎭 Modal: No supplier or party details for pricing')
        return packagePrice
      }
      
      // ✅ REMOVED: Early return for lead-based suppliers
      // Let calculateFinalPrice handle all supplier types including lead-based
      
      const supplierForPricing = {
        ...supplier,
        price: packagePrice
      }
      
      console.log('🎭 Modal: Calculating package price:', {
        packagePrice,
        supplier: supplier.name,
        partyDetails: effectivePartyDetails,
        guestCount: effectivePartyDetails?.guestCount,
        isLeadBased: supplierTypeDetection.isLeadBased,
        isTimeBased: supplierTypeDetection.isTimeBased
      })
      
      const pricing = calculateFinalPrice(supplierForPricing, effectivePartyDetails, [])
      
      console.log('🎭 Modal: Package pricing result:', {
        originalPrice: packagePrice,
        finalPrice: pricing.finalPrice,
        breakdown: pricing.breakdown,
        isEnhanced: pricing.finalPrice !== packagePrice
      })
      
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
  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId)
  const selectedFlavorObj = availableFlavors.find(f => f.id === selectedFlavor) || availableFlavors[0]

  // ✅ UPDATED: Unified pricing calculation for modal totals
  const calculateModalPricing = useMemo(() => {
    if (!selectedPackage || !supplier) {
      return {
        packagePrice: 0,
        addonsTotalPrice: 0,
        totalPrice: 0,
        hasEnhancedPricing: false,
        pricingInfo: null
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
      console.log('🎒 Party Bags custom quantity pricing:', {
        originalPrice: selectedPackage.price,
        pricePerBag,
        customQuantity: partyBagsQuantity,
        newPackagePrice: packagePrice
      })
    }

    // Calculate addons price (addons typically don't have weekend/duration premiums for now)
    const addonsTotalPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)

    // Final totals
    const totalPrice = packagePrice + addonsTotalPrice

    console.log('🎭 Modal: Final pricing calculation:', {
      packageOriginalPrice: selectedPackage.price,
      packageEnhancedPrice: packagePrice,
      addonsTotalPrice,
      totalPrice,
      hasEnhancedPricing,
      supplierType: {
        isLeadBased: supplierTypeDetection.isLeadBased,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isCake: supplierTypeDetection.isCake
      }
    })

    return {
      packagePrice,
      addonsTotalPrice,
      totalPrice,
      hasEnhancedPricing,
      pricingInfo: hasEnhancedPricing ? {
        originalPrice: selectedPackage.price,
        finalPrice: packagePrice,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased,
        duration: effectivePartyDetails?.duration
      } : null
    }
  }, [selectedPackage, supplier, selectedAddons, availableAddons, supplierTypeDetection, effectivePartyDetails])

  // Use the calculated totals
  const totalPrice = calculateModalPricing.totalPrice

  // Initialize states when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set initial flavor
      if (availableFlavors.length > 0 && !selectedFlavor) {
        setSelectedFlavor(availableFlavors[0].id)
      }
      
      // Reset cake customization form
      if (showCakeCustomization) {
        setSelectedFlavor(availableFlavors[0]?.id || 'vanilla')
        setCustomMessage('')
      }
    }
  }, [isOpen, showCakeCustomization, availableFlavors])

  useEffect(() => {
    if (!selectedPackageId && packages.length > 0) {
      setSelectedPackageId(packages[0].id)
    }
  }, [packages, selectedPackageId])

  if (!supplier) return null

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  // ✅ UPDATED: Handle add to plan with unified pricing data
  const handleAddToPlan = () => {
    // Get selected addon objects
    const selectedAddonObjects = selectedAddons.map(addonId => {
      const addon = availableAddons.find(addon => addon.id === addonId)
      if (!addon) return null
      
      return {
        ...addon,
        supplierId: supplier.id,
        supplierName: supplier.name,
        attachedToSupplier: true,
        isSupplierAddon: true,
        supplierType: supplier.category,
        addedAt: new Date().toISOString(),
        displayId: `${supplier.id}-${addon.id}`
      }
    }).filter(Boolean)

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
        paymentType: 'full_payment',
        deliveryExpectation: 'pre_party_delivery',
        supplierContactRequired: true,
        
        // Enhanced cake customization data
        cakeCustomization: {
          flavor: selectedFlavor,
          flavorName: selectedFlavorObj?.name || 'Custom Flavor',
          customMessage: customMessage.trim(),
          customizationType: 'cake_specialist'
        },
        
        // Update package features
        features: [
          ...(selectedPackage.features || []),
          `${selectedFlavorObj?.name || 'Custom'} flavor`,
          'Professional cake decoration',
          'Pre-party delivery included'
        ],
        
        // Update description
        description: selectedPackage.description ? 
          `${selectedPackage.description} - ${selectedFlavorObj?.name || 'Custom'} flavor` :
          `${selectedFlavorObj?.name || 'Custom'} cake`,
        
        packageType: 'cake',
        supplierType: 'cake_specialist',
        
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased
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
        enhancedPricing: calculateModalPricing.pricingInfo,
        partyDuration: effectivePartyDetails?.duration,
        isTimeBased: supplierTypeDetection.isTimeBased,
        isLeadBased: supplierTypeDetection.isLeadBased
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
        isLeadBased: supplierTypeDetection.isLeadBased
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
          totalPrice: calculateModalPricing.packagePrice
        }
      })
      },
      package: finalPackage,
      addons: selectedAddonObjects,
      totalPrice: calculateModalPricing.totalPrice,
      autoEnquiry: false
    }

    console.log('🎭 Modal: Sending data with unified pricing:', {
      packagePrice: finalPackage.price,
      originalPrice: finalPackage.originalPrice,
      totalPrice: dataToSend.totalPrice,
      enhancedPricingApplied: calculateModalPricing.hasEnhancedPricing,
      duration: effectivePartyDetails?.duration,
      supplierType: supplierTypeDetection
    })

    try {
      const result = onAddToPlan(dataToSend)
      onClose()
    } catch (error) {
      console.error('Error calling onAddToPlan:', error)
    }
  }

  const isCakeCustomizationComplete = () => {
    if (!supplierTypeDetection.isCake || !showCakeCustomization) return true
    return selectedFlavorObj && availableFlavors.length > 0
  }

  const getButtonText = () => {
    if (isAdding) {
      return 'Adding...'
    }
    
    if (!canAddCheck.canAdd) {
      return currentPhase === 'awaiting_responses' ? 'Slot Occupied' : 'Enquiry Pending'
    }

    if (supplierTypeDetection.isCake && !showCakeCustomization) {
      return `🎂 Customize Cake (£${totalPrice})`
    }
  
    return `Book ${supplierTypeDetection.isCake ? 'Cake' : 'Service'} - £${totalPrice}`
  }

  const handleCakeCustomizeClick = () => {
    if (!showCakeCustomization) {
      setShowCakeCustomization(true)
    } else {
      handleAddToPlan()
    }
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      theme="fun"
      showCloseButton={true}
    >
      {/* Header with supplier info */}
      <ModalHeader 
        title={
          <div className="flex items-center gap-2">
            {supplierTypeDetection.isCake && <span className="text-xl">🎂</span>}
            {supplierTypeDetection.isLeadBased && !supplierTypeDetection.isCake && <Package className="w-5 h-5 text-amber-600" />}
            {supplierTypeDetection.isTimeBased && <Clock className="w-5 h-5 text-blue-600" />}
            {supplier.name}
          </div>
        }
        subtitle={
          showCakeCustomization ? "Customize your cake order" : 
          supplierTypeDetection.isLeadBased ? "Lead-time based supplier" :
          supplierTypeDetection.isTimeBased ? "Time-based pricing" : undefined
        }
        theme="fun"
        icon={
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md">
            <Image
              src={supplier.image || supplier.imageUrl || '/placeholder.png'}
              alt={supplier.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        }
      />

      {/* Content */}
      <ModalContent className="overflow-y-auto max-h-[60vh]">
        <div className="space-y-6">
          {/* Package Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Choose Your Package
            </h3>
            
            {/* ✅ UPDATED: Enhanced info for different supplier types */}
            {!showCakeCustomization && (
              <div className="mb-4 space-y-3">
            
                
              </div>
            )}
            
            {/* Package Summary Card for Cake Suppliers */}
            {supplierTypeDetection.isCake && showCakeCustomization && selectedPackage && (
              <div className="bg-white rounded-xl p-4 border border-[hsl(var(--primary-200))] mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      🎂 {selectedPackage.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedPackage.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      £{calculateModalPricing.packagePrice}
                    </div>
                    <div className="text-xs text-primary-700">Full Payment</div>
                  </div>
                </div>
                
                {/* Key Info Cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">Delivery</div>
                      <div className="text-xs text-gray-600">1-2 days before party</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                    <Truck className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-xs font-medium text-gray-700">Contact</div>
                      <div className="text-xs text-gray-600">Supplier will call you</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Package cards */}
            {!showCakeCustomization && (
              <>
                <div className="hidden md:grid md:grid-cols-1 gap-3">
                  {packages.map((pkg) => (
                    <Card 
                      key={pkg.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedPackageId === pkg.id 
                          ? `ring-2 ${supplierTypeDetection.isCake ? 'ring-orange-400 bg-orange-50' : 'ring-[hsl(var(--primary-500))] bg-primary-50'}` 
                          : 'hover:shadow-md hover:bg-gray-50'
                      } ${supplierTypeDetection.isCake ? 'border-orange-200' : ''}`}
                      onClick={() => setSelectedPackageId(pkg.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {supplierTypeDetection.isCake && '🎂 '}
                                {supplierTypeDetection.isLeadBased && !supplierTypeDetection.isCake && '📦 '}
                                {pkg.name}
                              </h4>
                              {pkg.popular && (
                                <Badge className={`text-xs px-2 py-0.5 ${
                                  supplierTypeDetection.isCake ? 'bg-orange-500 text-white' : 'bg-primary-500 text-white'
                                }`}>
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{pkg.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{pkg.features[1] || "Multiple children"}</span>
                              </div>
                              {supplierTypeDetection.isLeadBased && (
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  <span>Lead-time</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-xl font-bold ${
                              supplierTypeDetection.isCake ? 'text-orange-600' : 'text-primary-600'
                            }`}>
                              £{pkg.enhancedPrice}
                            </div>
                           
                            {selectedPackageId === pkg.id && (
                              <Check className={`w-5 h-5 mt-1 ml-auto ${
                                supplierTypeDetection.isCake ? 'text-orange-500' : 'text-primary-500'
                              }`} />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Mobile version */}
                <div className="md:hidden">
                  <div className="flex gap-3 overflow-x-auto pb-4 px-3 py-1 scrollbar-hide snap-x snap-mandatory">
                    {packages.map((pkg, index) => (
                      <Card 
                        key={pkg.id}
                        className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-200 snap-center ${
                          selectedPackageId === pkg.id 
                            ? `ring-2 ${supplierTypeDetection.isCake ? 'ring-orange-400 bg-orange-50' : 'ring-[hsl(var(--primary-500))] bg-primary-50'}` 
                            : 'hover:shadow-md hover:bg-gray-50'
                        } ${supplierTypeDetection.isCake ? 'border-orange-200' : ''} ${index === 0 ? 'ml-1' : ''} ${index === packages.length - 1 ? 'mr-1' : ''}`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {supplierTypeDetection.isCake && '🎂 '}
                                  {supplierTypeDetection.isLeadBased && !supplierTypeDetection.isCake && '📦 '}
                                  {pkg.name}
                                </h4>
                                {pkg.popular && (
                                  <Badge className={`text-xs px-2 py-0.5 ${
                                    supplierTypeDetection.isCake ? 'bg-orange-500 text-white' : 'bg-primary-500 text-white'
                                  }`}>
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              {selectedPackageId === pkg.id && (
                                <Check className={`w-5 h-5 flex-shrink-0 ${
                                  supplierTypeDetection.isCake ? 'text-orange-500' : 'text-primary-500'
                                }`} />
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                supplierTypeDetection.isCake ? 'text-orange-600' : 'text-primary-600'
                              }`}>
                                £{pkg.enhancedPrice}
                              </div>
                              {pkg.enhancedPrice !== pkg.price && (
                                <div className="text-xs text-gray-500 line-through">
                                  was £{pkg.price}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{pkg.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span>{pkg.features[1] || "Multiple children"}</span>
                              </div>
                              {supplierTypeDetection.isLeadBased && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Package className="w-3 h-3 flex-shrink-0" />
                                  <span>Lead-time service</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center gap-1 mt-2">
                    {packages.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedPackageId === packages[index]?.id 
                            ? (supplierTypeDetection.isCake ? 'bg-orange-500' : 'bg-primary-500')
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Enhanced Cake Customization Section */}
          {supplierTypeDetection.isCake && showCakeCustomization && (
            <>
              {/* Flavor Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">
                  Choose Cake Flavor
                </Label>
                
                {availableFlavors.length === 0 ? (
                  <div className="p-4 bg-primary-50 border border-[hsl(var(--primary-200))] rounded-lg">
                    <p className="text-primary-800 text-sm">
                      This supplier hasn't specified their available flavors yet. Please discuss flavor options directly with them.
                    </p>
                  </div>
                ) : (
                  <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                    <SelectTrigger className="w-full h-12 bg-white border-2 border-[hsl(var(--primary-200))] rounded-lg text-sm px-2">
                      <SelectValue placeholder="Select a flavor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFlavors.map((flavor) => (
                        <SelectItem key={flavor.id} value={flavor.id} className="text-base py-3">
                          <div className="flex items-center justify-between w-full">
                            <span>{flavor.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Custom Message */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Special Requests or Custom Message
                </Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Any special decorating requests, dietary requirements, or message for the cake maker..."
                  rows={4}
                  className="bg-white placeholder:text-sm border-2 border-[hsl(var(--primary-200))] rounded-lg text-base p-4 resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                  {customMessage.length}/500 characters
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-semibold mb-3 text-green-900 flex items-center gap-2">
                  <Cake className="w-5 h-5" />
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Package:</span>
                    <span className="font-medium text-gray-900">{selectedPackage?.name}</span>
                  </div>
                  {selectedFlavorObj && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Flavor:</span>
                      <span className="font-medium text-gray-900">{selectedFlavorObj.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payment:</span>
                    <span className="font-medium text-gray-900">Full payment upfront</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-900">Total Amount:</span>
                      <span className="font-bold text-xl text-green-900">£{totalPrice}</span>
                    </div>
                  </div>
                </div>
                
                {/* Important Note */}
                <div className="mt-4 p-3 bg-white/70 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-gray-700">
                    <strong>Next steps:</strong> After booking, {supplier?.name || 'the cake maker'} will contact you within 24 hours to confirm delivery details and finalize any custom decorating requests.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Party Bags Quantity Section */}
          {supplierTypeDetection.isPartyBags && selectedPackage && (
            <div className="space-y-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-xl p-6 border-2 border-[hsl(var(--primary-200))]">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-6 h-6 text-[hsl(var(--primary-600))]" />
                <h4 className="font-bold text-lg text-[hsl(var(--primary-900))]">Number of Party Bags</h4>
              </div>

              {/* Guest Count Info */}
              <div className="bg-white/80 rounded-lg p-4 border border-[hsl(var(--primary-200))]">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[hsl(var(--primary-600))] mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      Your party has <strong>{partyDetails?.guestCount || 10} guests</strong>, so we've pre-set the quantity to match.
                      You can adjust this if you need more or fewer party bags.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">
                  How many party bags do you need?
                </Label>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setPartyBagsQuantity(Math.max(1, Number(partyBagsQuantity) - 1))}
                    className="h-12 w-12 rounded-full border-2 border-[hsl(var(--primary-400))] hover:bg-[hsl(var(--primary-100))] transition-colors"
                    disabled={Number(partyBagsQuantity) <= 1}
                  >
                    <span className="text-xl font-bold">−</span>
                  </Button>

                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-[hsl(var(--primary-900))] mb-1">
                      {partyBagsQuantity}
                    </div>
                    <div className="text-sm text-gray-600">
                      party bags
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setPartyBagsQuantity(Number(partyBagsQuantity) + 1)}
                    className="h-12 w-12 rounded-full border-2 border-[hsl(var(--primary-400))] hover:bg-[hsl(var(--primary-100))] transition-colors"
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>

                {/* Quick Set Buttons */}
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyDetails?.guestCount) || 10)}
                    className="text-xs hover:bg-[hsl(var(--primary-100))] hover:text-[hsl(var(--primary-700))]"
                  >
                    Match guests ({partyDetails?.guestCount || 10})
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyDetails?.guestCount || 10) + 2)}
                    className="text-xs hover:bg-[hsl(var(--primary-100))] hover:text-[hsl(var(--primary-700))]"
                  >
                    +2 extras
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPartyBagsQuantity(Number(partyDetails?.guestCount || 10) + 5)}
                    className="text-xs hover:bg-[hsl(var(--primary-100))] hover:text-[hsl(var(--primary-700))]"
                  >
                    +5 extras
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-lg p-4 border border-[hsl(var(--primary-200))]">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Price per bag:</span>
                    <span className="font-medium text-gray-900">£{selectedPackage.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Quantity:</span>
                    <span className="font-medium text-gray-900">{partyBagsQuantity} bags</span>
                  </div>
                  <div className="border-t border-[hsl(var(--primary-200))] pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[hsl(var(--primary-900))]">Total:</span>
                      <span className="font-bold text-xl text-[hsl(var(--primary-900))]">
                        £{(selectedPackage.price * Number(partyBagsQuantity)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add-ons Section - only show when not in cake customization mode */}
          {availableAddons.length > 0 && !showCakeCustomization && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" />
                Popular Add-ons
              </h3>
              <div className="space-y-3">
                {availableAddons.map((addon) => (
                  <div 
                    key={addon.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={() => handleAddonToggle(addon.id)}
                        className="data-[state=checked]:bg-[hsl(var(--primary-500))] data-[state=checked]:border-[hsl(var(--primary-500))] data-[state=checked]:text-white border-2"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <label 
                            htmlFor={addon.id}
                            className="font-medium text-gray-900 cursor-pointer"
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
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-600">+£{addon.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Price Summary with unified pricing info - hide for party bags (has own breakdown) */}
          {!showCakeCustomization && !supplierTypeDetection.isPartyBags && (
            <div className={`${supplierTypeDetection.isCake ? 'bg-orange-50 border-orange-200' : 'bg-primary-50 border-[hsl(var(--primary-200))]'} rounded-xl p-4 border`}>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className={`w-5 h-5 ${supplierTypeDetection.isCake ? 'text-orange-500' : 'text-primary-500'}`} />
                Price Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {supplierTypeDetection.isCake ? '🎂 ' : ''}
                    {supplierTypeDetection.isLeadBased && !supplierTypeDetection.isCake ? '📦 ' : ''}
                    {selectedPackage?.name}
                    {calculateModalPricing.pricingInfo?.isTimeBased && (
                      <span className="text-blue-600 ml-1">
                        ({formatDuration(effectivePartyDetails?.duration || 2)})
                      </span>
                    )}
                    {supplierTypeDetection.isLeadBased && (
                      <span className="text-amber-600 ml-1">
                        (lead-time)
                      </span>
                    )}
                  </span>
                  <span className="font-medium">£{calculateModalPricing.packagePrice}</span>
                </div>
                
                
                {selectedAddons.map(addonId => {
                  const addon = availableAddons.find(a => a.id === addonId)
                  return addon ? (
                    <div key={addonId} className="flex justify-between">
                      <span className="text-gray-600">{addon.name}</span>
                      <span className="font-medium">£{addon.price}</span>
                    </div>
                  ) : null
                })}
                
                <div className={`border-t pt-2 flex justify-between font-bold text-lg ${
                  supplierTypeDetection.isCake ? 'border-orange-200' : 'border-primary-200'
                }`}>
                  <span>Total</span>
                  <span className={supplierTypeDetection.isCake ? 'text-orange-600' : 'text-primary-600'}>£{totalPrice}</span>
                </div>
                
                {calculateModalPricing.hasEnhancedPricing && (
                  <div className="text-xs text-gray-600 mt-2 p-2 bg-white/50 rounded">
                    ✨ Enhanced pricing applied based on your party details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalContent>

      {/* Footer */}
      <ModalFooter theme="fun">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={supplierTypeDetection.isCake && !showCakeCustomization ? handleCakeCustomizeClick : handleAddToPlan}
            className={`flex-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
              !canAddCheck.canAdd 
                ? 'bg-gray-400 cursor-not-allowed' 
                : supplierTypeDetection.isCake 
                  ? 'bg-primary-500  text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
            disabled={!selectedPackageId || isAdding || !canAddCheck.canAdd || (supplierTypeDetection.isCake && showCakeCustomization && !isCakeCustomizationComplete())}
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
      </ModalFooter>
    </UniversalModal>
  )
}