// Enhanced SupplierCustomizationModal with complete cake customization info
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
  Cake
} from "lucide-react"
import Image from "next/image"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"

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
  hasEnquiriesPending = false
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [canAddCheck, setCanAddCheck] = useState({ canAdd: true, reason: 'planning_empty_slot', showModal: false })
  
  // 🎂 Enhanced cake customization state
  const [showCakeCustomization, setShowCakeCustomization] = useState(false)
  const [selectedFlavor, setSelectedFlavor] = useState('vanilla')
  const [customMessage, setCustomMessage] = useState('')

  // 🎂 Detect if this is a cake supplier
  const isCakeSupplier = useMemo(() => {
    if (!supplier) return false
    
    // Catering with cake specialization
    if (supplier?.category?.toLowerCase().includes('catering')) {
      const serviceDetails = supplier?.serviceDetails
      if (serviceDetails?.cateringType?.toLowerCase().includes('cake') ||
          serviceDetails?.cateringType?.toLowerCase().includes('baker') ||
          serviceDetails?.cakeFlavors?.length > 0 ||
          serviceDetails?.cakeSpecialist === true) {
        return true
      }
    }
    
    // Direct cake category
    if (supplier?.category?.toLowerCase().includes('cake')) return true
    
    // Name/description contains cake keywords
    const nameOrDesc = `${supplier?.name || ''} ${supplier?.description || ''}`.toLowerCase()
    return nameOrDesc.includes('cake') || nameOrDesc.includes('bakery') || nameOrDesc.includes('patisserie')
  }, [supplier])

  // 🎂 Get available cake flavors
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

  const packages = useMemo(() => {
    if (!supplier) return []
    
    if (supplier.packages && supplier.packages.length > 0) {
      return supplier.packages.slice(0, 3).map((pkg, index) => ({
        id: pkg.id || `real-${index}`,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        image: pkg.image,
        features: pkg.whatsIncluded || pkg.features || [],
        popular: index === 1,
        description: pkg.description,
      }))
    }
    
    const basePrice = supplier.priceFrom || 100
    const priceUnit = supplier.priceUnit || "per event"
    
    return [
      {
        id: "basic",
        name: "Basic Package",
        price: Math.round(basePrice * 1.0),
        duration: priceUnit,
        features: ["Standard service", "Up to 15 children", "Basic setup"],
        description: `Basic ${supplier.category?.toLowerCase()} package`,
        popular: false,
      },
      {
        id: "premium",
        name: "Premium Package", 
        price: Math.round(basePrice * 1.5),
        duration: priceUnit,
        features: ["Enhanced service", "Professional setup", "Up to 25 children"],
        description: `Enhanced ${supplier.category?.toLowerCase()} package`,
        popular: true,
      },
      {
        id: "deluxe",
        name: "Deluxe Package",
        price: Math.round(basePrice * 2.0),
        duration: priceUnit,
        features: ["Premium service", "Full setup & cleanup", "Up to 35 children"],
        description: `Complete ${supplier.category?.toLowerCase()} package`,
        popular: false,
      },
    ]
  }, [supplier])

  const availableAddons = supplier?.serviceDetails?.addOnServices || []
  const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId)
  const selectedFlavorObj = availableFlavors.find(f => f.id === selectedFlavor) || availableFlavors[0]
  
  // Calculate total price
  const totalPrice = (selectedPackage?.price || 0) + 
    selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)

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

  // Handle add to plan with enhanced cake data
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

    // Create enhanced package with cake customization
    let finalPackage = selectedPackage
    
    if (isCakeSupplier && showCakeCustomization) {
      finalPackage = {
        ...selectedPackage,
        
        // Payment and delivery info (from CakeCustomizationModal)
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
        supplierType: 'cake_specialist'
      }
    }

    const dataToSend = {
      supplier,
      package: finalPackage,
      addons: selectedAddonObjects,
      totalPrice,
      autoEnquiry: false
    }

    console.log('Enhanced cake order data:', dataToSend)

    try {
      const result = onAddToPlan(dataToSend)
      console.log('onAddToPlan returned:', result)
      onClose()
    } catch (error) {
      console.error('Error calling onAddToPlan:', error)
    }
  }

  const isCakeCustomizationComplete = () => {
    if (!isCakeSupplier || !showCakeCustomization) return true
    return selectedFlavorObj && availableFlavors.length > 0
  }

  const getButtonText = () => {
    if (isAdding) {
      return 'Adding...'
    }
    
    if (!canAddCheck.canAdd) {
      return currentPhase === 'awaiting_responses' ? 'Slot Occupied' : 'Enquiry Pending'
    }

    if (isCakeSupplier && !showCakeCustomization) {
      return `🎂 Customize Cake (£${totalPrice})`
    }
  
    return `Book ${isCakeSupplier ? 'Cake' : 'Service'} - £${totalPrice}`
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
            {isCakeSupplier && <span className="text-xl">🎂</span>}
            {supplier.name}
          </div>
        }
        subtitle={showCakeCustomization ? "Customize your cake order" : undefined}
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
            
            {/* Package Summary Card for Cake Suppliers */}
            {isCakeSupplier && showCakeCustomization && selectedPackage && (
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-200 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      🎂 {selectedPackage.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedPackage.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">£{selectedPackage.price}</div>
                    <div className="text-xs text-orange-700">Full Payment</div>
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
                          ? `ring-2 ${isCakeSupplier ? 'ring-orange-400 bg-orange-50' : 'ring-[hsl(var(--primary-500))] bg-primary-50'}` 
                          : 'hover:shadow-md hover:bg-gray-50'
                      } ${isCakeSupplier ? 'border-orange-200' : ''}`}
                      onClick={() => setSelectedPackageId(pkg.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {isCakeSupplier && '🎂 '}{pkg.name}
                              </h4>
                              {pkg.popular && (
                                <Badge className={`text-xs px-2 py-0.5 ${
                                  isCakeSupplier ? 'bg-orange-500 text-white' : 'bg-primary-500 text-white'
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
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-xl font-bold ${
                              isCakeSupplier ? 'text-orange-600' : 'text-primary-600'
                            }`}>£{pkg.price}</div>
                            {selectedPackageId === pkg.id && (
                              <Check className={`w-5 h-5 mt-1 ml-auto ${
                                isCakeSupplier ? 'text-orange-500' : 'text-primary-500'
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
                            ? `ring-2 ${isCakeSupplier ? 'ring-orange-400 bg-orange-50' : 'ring-[hsl(var(--primary-500))] bg-primary-50'}` 
                            : 'hover:shadow-md hover:bg-gray-50'
                        } ${isCakeSupplier ? 'border-orange-200' : ''} ${index === 0 ? 'ml-1' : ''} ${index === packages.length - 1 ? 'mr-1' : ''}`}
                        onClick={() => setSelectedPackageId(pkg.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {isCakeSupplier && '🎂 '}{pkg.name}
                                </h4>
                                {pkg.popular && (
                                  <Badge className={`text-xs px-2 py-0.5 ${
                                    isCakeSupplier ? 'bg-orange-500 text-white' : 'bg-primary-500 text-white'
                                  }`}>
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              {selectedPackageId === pkg.id && (
                                <Check className={`w-5 h-5 flex-shrink-0 ${
                                  isCakeSupplier ? 'text-orange-500' : 'text-primary-500'
                                }`} />
                              )}
                            </div>
                            
                            <div className={`text-2xl font-bold ${
                              isCakeSupplier ? 'text-orange-600' : 'text-primary-600'
                            }`}>£{pkg.price}</div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{pkg.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span>{pkg.features[1] || "Multiple children"}</span>
                              </div>
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
                            ? (isCakeSupplier ? 'bg-orange-500' : 'bg-primary-500')
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 🎂 Enhanced Cake Customization Section */}
          {isCakeSupplier && showCakeCustomization && (
            <>
              {/* Flavor Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">
                  Choose Cake Flavor
                </Label>
                
                {availableFlavors.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      This supplier hasn't specified their available flavors yet. Please discuss flavor options directly with them.
                    </p>
                  </div>
                ) : (
                  <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                    <SelectTrigger className="w-full h-12 bg-white border-2 border-orange-200 rounded-lg text-base">
                      <SelectValue placeholder="Select a flavor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFlavors.map((flavor) => (
                        <SelectItem key={flavor.id} value={flavor.id} className="text-base py-3">
                          <div className="flex items-center justify-between w-full">
                            <span>{flavor.name}</span>
                            {flavor.popular && (
                              <Badge className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-200">
                                Popular
                              </Badge>
                            )}
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
                  className="bg-white border-2 border-orange-200 rounded-lg text-base p-4 resize-none"
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
                        className="data-[state=checked]:bg-primary-500"
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

          {/* Price Summary - only show when not in detailed cake customization */}
          {!showCakeCustomization && (
            <div className={`${isCakeSupplier ? 'bg-orange-50 border-orange-200' : 'bg-primary-50 border-[hsl(var(--primary-200))]'} rounded-xl p-4 border`}>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className={`w-5 h-5 ${isCakeSupplier ? 'text-orange-500' : 'text-primary-500'}`} />
                Price Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {isCakeSupplier ? '🎂 ' : ''}{selectedPackage?.name}
                  </span>
                  <span className="font-medium">£{selectedPackage?.price}</span>
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
                  isCakeSupplier ? 'border-orange-200' : 'border-primary-200'
                }`}>
                  <span>Total</span>
                  <span className={isCakeSupplier ? 'text-orange-600' : 'text-primary-600'}>£{totalPrice}</span>
                </div>
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
            onClick={isCakeSupplier && !showCakeCustomization ? handleCakeCustomizeClick : handleAddToPlan}
            className={`flex-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
              !canAddCheck.canAdd 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isCakeSupplier 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
            disabled={!selectedPackageId || isAdding || !canAddCheck.canAdd || (isCakeSupplier && showCakeCustomization && !isCakeCustomizationComplete())}
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
                {isCakeSupplier && !showCakeCustomization ? (
                  <ChefHat className="w-4 h-4 mr-2" />
                ) : showCakeCustomization ? (
                  <Cake className="w-4 h-4 mr-2" />
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