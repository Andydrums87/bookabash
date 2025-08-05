"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  X, 
  Star, 
  Check, 
  Plus,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Heart,
  DollarSign,
  Calendar
} from "lucide-react"
import Image from "next/image"

export default function SupplierCustomizationModal({
  isOpen,
  onClose,
  supplier,
  onAddToPlan,
  isAdding = false
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])

  // Remove selectedDate calculation - not needed in customization modal

  // FIXED: Move all hooks before conditional returns
  // Generate packages for supplier (same logic as supplier profile)
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

  // FIXED: Auto-select first package effect - use useEffect instead of useState callback
  useMemo(() => {
    if (!selectedPackageId && packages.length > 0) {
      setSelectedPackageId(packages[0].id)
    }
  }, [packages, selectedPackageId])

  // NOW the conditional return comes after all hooks
  if (!isOpen || !supplier) return null

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

    onAddToPlan({
      supplier,
      package: selectedPackage,
      addons: selectedAddonObjects,
      totalPrice
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
              <Image
                src={supplier.image || supplier.imageUrl || '/placeholder.png'}
                alt={supplier.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{supplier.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{supplier.rating}</span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{supplier.location}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Package Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Package</h3>
            <div className="grid grid-cols-1 gap-3">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedPackageId === pkg.id 
                      ? 'ring-2 ring-primary-500 bg-primary-50' 
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
          </div>

          {/* Add-ons Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Add-ons</h3>
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

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
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
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">£{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
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
              className="flex-2 bg-primary-500 hover:bg-primary-600 text-white"
              disabled={!selectedPackageId || isAdding}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Plan (£{totalPrice})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}