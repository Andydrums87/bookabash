"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Star, 
  Check, 
  Plus,
  Users,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"
import { Clock, AlertCircle, Heart } from "lucide-react"

export default function SupplierCustomizationModal({
  isOpen,
  onClose,
  supplier,
  onAddToPlan,
  isAdding = false,
  // NEW: Add these props
  currentPhase = "planning",
  partyData = {},
  enquiries = [],
  hasEnquiriesPending = false
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [canAddCheck, setCanAddCheck] = useState({ canAdd: true, reason: 'planning_empty_slot', showModal: false })

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
        popular: index === 1, // Middle package is popular
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
  
  // Calculate total price
  const totalPrice = (selectedPackage?.price || 0) + 
    selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)

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
  const handleAddToPlan = () => {
    const selectedAddonObjects = selectedAddons.map(addonId => 
      availableAddons.find(addon => addon.id === addonId)
    ).filter(Boolean)
  
    console.log('🔍 DEBUG: handleAddToPlan called with:')
    console.log('  - supplier:', supplier?.name)
    console.log('  - selectedPackage:', selectedPackage)
    console.log('  - selectedAddonObjects:', selectedAddonObjects)
    console.log('  - totalPrice:', totalPrice)
    console.log('  - onAddToPlan type:', typeof onAddToPlan)
    console.log('  - onAddToPlan function:', onAddToPlan)
  
    if (!onAddToPlan) {
      console.error('❌ onAddToPlan is not defined!')
      return
    }
  
    const dataToSend = {
      supplier,
      package: selectedPackage,
      addons: selectedAddonObjects,
      totalPrice,
      autoEnquiry: false
    }
  
    console.log('🚀 Calling onAddToPlan with:', dataToSend)
  
    try {
      const result = onAddToPlan(dataToSend)
      console.log('✅ onAddToPlan returned:', result)
    } catch (error) {
      console.error('❌ Error calling onAddToPlan:', error)
    }
  }


  const getButtonText = () => {
    if (isAdding) {
      return 'Adding...'
    }
    
    if (!canAddCheck.canAdd) {
      return currentPhase === 'awaiting_responses' ? 'Slot Occupied' : 'Enquiry Pending'
    }
  
    return `Quick Add (£${totalPrice})` // This will always show the confirmation modal
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
        title={supplier.name}
      
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
            
            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-1 gap-3">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedPackageId === pkg.id 
                      ? 'ring-2 ring-[hsl(var(--primary-500))] bg-primary-50' 
                      : 'hover:shadow-md hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPackageId(pkg.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          {pkg.popular && (
                            <Badge className="bg-primary-500 text-white text-xs px-2 py-0.5">
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
                        <div className="text-xl font-bold text-primary-600">£{pkg.price}</div>
                        {selectedPackageId === pkg.id && (
                          <Check className="w-5 h-5 text-primary-500 mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-4 px-3 py-1 scrollbar-hide snap-x snap-mandatory">
                {packages.map((pkg, index) => (
                  <Card 
                    key={pkg.id}
                    className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-200 snap-center ${
                      selectedPackageId === pkg.id 
                        ? 'ring-2 ring-[hsl(var(--primary-500))] bg-primary-50' 
                        : 'hover:shadow-md hover:bg-gray-50'
                    } ${index === 0 ? 'ml-1' : ''} ${index === packages.length - 1 ? 'mr-1' : ''}`}
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header with check icon */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                            {pkg.popular && (
                              <Badge className="bg-primary-500 text-white text-xs px-2 py-0.5">
                                Popular
                              </Badge>
                            )}
                          </div>
                          {selectedPackageId === pkg.id && (
                            <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        {/* Price - prominent on mobile */}
                        <div className="text-2xl font-bold text-primary-600">£{pkg.price}</div>
                        
                        {/* Description */}
                        {/* <p className="text-sm text-gray-600">{pkg.description}</p> */}
                        
                        {/* Features */}
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
              
              {/* Scroll indicator dots */}
              <div className="flex justify-center gap-1 mt-2">
                {packages.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      selectedPackageId === packages[index]?.id 
                        ? 'bg-primary-500' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Add-ons Section */}
          {availableAddons.length > 0 && (
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

          {/* Price Summary */}
          <div className="bg-primary-50 rounded-xl p-4 border border-[hsl(var(--primary-200))]">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary-500" />
              Price Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{selectedPackage?.name}</span>
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
              <div className="border-t border-primary-200 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">£{totalPrice}</span>
              </div>
            </div>
          </div>
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
            onClick={handleAddToPlan}
            className={`flex-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
              !canAddCheck.canAdd 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
            disabled={!selectedPackageId || isAdding || !canAddCheck.canAdd}
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
                <Plus className="w-4 h-4 mr-2" />
                {getButtonText()}
              </>
            )}
          </Button>
        </div>
      </ModalFooter>

      {/* Pending Enquiry Modal */}
      {showPendingModal && (
        <UniversalModal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} size="md">
          <ModalHeader 
            title="Category Already Filled"
            subtitle={`You already have a ${supplier?.category?.toLowerCase()} supplier selected`}
            icon={<Clock className="w-6 h-6 text-orange-500" />}
          />
          <ModalContent>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800 text-sm">Why can't I add this supplier?</h3>
                    <p className="text-orange-700 text-xs mt-1">
                      {currentPhase === 'awaiting_responses' 
                        ? `You already have a ${supplier?.category?.toLowerCase()} supplier and we're waiting for their response. You can add more suppliers to empty categories, but can't replace existing ones until they respond.`
                        : `You have a pending enquiry for a ${supplier?.category?.toLowerCase()} supplier. Wait for them to respond before making changes.`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-2">
                <p className="text-gray-700">
                  You can save <span className="font-semibold text-primary-600">{supplier?.name}</span> for later! 💫
                </p>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <div className="space-y-3 w-full">
              <Button
                onClick={() => {
                  // Add to favorites logic here
                  setShowPendingModal(false)
                }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save to Favorites
              </Button>
              <Button
                onClick={() => setShowPendingModal(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </ModalFooter>
        </UniversalModal>
      )}
    </UniversalModal>
  )
}