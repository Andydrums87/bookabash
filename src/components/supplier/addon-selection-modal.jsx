"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Clock, 
  Users, 
  Star, 
  Gift, 
  PlusCircle,
  CheckCircle,
  Sparkles
} from "lucide-react"

export default function AddonSelectionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  supplier, 
  selectedPackage,
  isEntertainer = true 
}) {
  const [selectedAddons, setSelectedAddons] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)

  // Get available add-ons from supplier's service details (objects only)
  const availableAddons = supplier?.serviceDetails?.addOnServices || []

  useEffect(() => {
    if (!selectedPackage) return
    
    // Calculate total: base package price + selected add-ons
    const basePrice = selectedPackage.price || 0
    const addonsTotal = selectedAddons.reduce((total, addon) => {
      return total + (addon.price || 0)
    }, 0)
    
    setTotalPrice(basePrice + addonsTotal)
  }, [selectedPackage, selectedAddons])

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.some(a => a.id === addon.id)
      return isSelected 
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    })
  }

  const isAddonSelected = (addon) => {
    return selectedAddons.some(a => a.id === addon.id)
  }

  const handleConfirm = () => {
    onConfirm({
      package: selectedPackage,
      addons: selectedAddons,
      totalPrice: totalPrice
    })
  }

  if (!isOpen || !selectedPackage) return null

  // Category definitions
  const categories = {
    'enhancement': { emoji: '✨', label: 'Enhancement' },
    'time': { emoji: '⏰', label: 'Time Extension' },
    'premium': { emoji: '🌟', label: 'Premium Upgrade' },
    'logistics': { emoji: '🚗', label: 'Logistics' },
    'seasonal': { emoji: '🎄', label: 'Seasonal' }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Customize Your Package</h2>
              <p className="text-gray-600 mt-1">Add optional extras to make your party even more special</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Selected Package Summary */}
        <div className="p-6 border-b border-gray-100">
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary-500 text-white px-3 py-1">
                      Selected Package
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedPackage.name}</h3>
                  {selectedPackage.description && (
                    <p className="text-gray-600 mb-4">{selectedPackage.description}</p>
                  )}
                  
                  {/* Package Features */}
                  {selectedPackage.features && selectedPackage.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        What's Included:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedPackage.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-6">
                  <div className="text-3xl font-bold text-primary-600">£{selectedPackage.price}</div>
                  {selectedPackage.duration && (
                    <div className="text-sm text-gray-500">({selectedPackage.duration})</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add-ons Section */}
        <div className="p-6">
          {availableAddons.length > 0 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Optional Add-ons</h3>
                  <p className="text-gray-600">Make your party even more memorable</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {availableAddons.map((addon) => {
                  const isSelected = isAddonSelected(addon)
                  const categoryInfo = categories[addon.category] || null
                  
                  return (
                    <div
                      key={addon.id}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-50' 
                          : 'border-gray-200 bg-white hover:border-amber-200'
                      }`}
                      onClick={() => handleAddonToggle(addon)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => handleAddonToggle(addon)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                              {categoryInfo && (
                                <span className="text-xs px-6 py-1 bg-primary-400 text-white rounded-full">
                                  {categoryInfo.emoji} {categoryInfo.label}
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-bold text-amber-600">+£{addon.price}</div>
                          </div>
                          {addon.description && (
                            <p className="text-sm text-gray-600">
                              {addon.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Add-ons Available</h3>
              <p className="text-gray-500">This package includes everything you need for a great party!</p>
            </div>
          )}
        </div>

        {/* Price Summary & Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="space-y-4">
            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Base Package:</span>
                <span className="font-semibold">£{selectedPackage.price}</span>
              </div>
              
              {selectedAddons.length > 0 && (
                <>
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center mb-2 text-xs">
                      <span className="text-gray-600">+ {addon.name}:</span>
                      <span className="font-medium">£{addon.price}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">£{totalPrice}</span>
                    </div>
                  </div>
                </>
              )}
              
              {selectedAddons.length === 0 && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">£{selectedPackage.price}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 py-3 text-base bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                className="flex-1 py-3 text-base bg-primary-500 hover:bg-primary-600 text-white"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add to Plan - £{totalPrice}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}