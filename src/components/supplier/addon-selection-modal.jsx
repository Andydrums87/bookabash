"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, PlusCircle, CheckCircle, Sparkles, Heart, Star } from 'lucide-react'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/universalModal"

export default function AddonSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  supplier,
  selectedPackage,
  isEntertainer = true,
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
    setSelectedAddons((prev) => {
      const isSelected = prev.some((a) => a.id === addon.id)
      return isSelected ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    })
  }

  const isAddonSelected = (addon) => {
    return selectedAddons.some((a) => a.id === addon.id)
  }

  const handleConfirm = () => {
    onConfirm({
      package: selectedPackage,
      addons: selectedAddons,
      totalPrice: totalPrice,
    })
  }

  if (!selectedPackage) return null

  // Fun category definitions
  const categories = {
    enhancement: { emoji: "✨", label: "Extra Magic",},
    time: { emoji: "⏰", label: "More Fun Time", },
    premium: { emoji: "🌟", label: "VIP Upgrade", },
    logistics: { emoji: "🚗", label: "Easy Peasy", },
    seasonal: { emoji: "🎄", label: "Seasonal Special", },
  }

  // Fun messages based on number of selected add-ons
  const getFunMessage = () => {
    if (selectedAddons.length === 0) return "Your party is already going to be amazing! 🎉"
    if (selectedAddons.length === 1) return "Ooh, nice choice! One extra sprinkle of fun! ✨"
    if (selectedAddons.length === 2) return "Two extras? Now we're talking! This party is getting epic! 🚀"
    return `${selectedAddons.length} add-ons?! This is going to be the BEST party ever! 🎊`
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      theme="fun"
      showCloseButton={true}
      className="relative"
    >
      {/* Fun Header */}
      <ModalHeader 
        title="Let's Make It Even More Amazing!"
        theme="fun"
        icon={<Sparkles className="w-6 h-6 text-white" />}
      />

      {/* Content */}
      <ModalContent>
        <div className="space-y-4">
          {/* Compact Package Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg p-3 border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary-500 text-white px-2 py-0.5 text-xs">
                    🎯 Selected Package
                  </Badge>
                </div>
                <h4 className="font-bold text-gray-900">{selectedPackage.name}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedPackage.features?.length > 0 
                    ? `Includes ${selectedPackage.features.length} features` 
                    : selectedPackage.description
                  }
                </p>
              </div>
              <div className="text-right ml-3">
                <div className="text-lg font-bold text-primary-600">£{selectedPackage.price}</div>
                {selectedPackage.duration && (
                  <div className="text-xs text-gray-500">({selectedPackage.duration})</div>
                )}
              </div>
            </div>
          </div>

          {/* Add-ons Section */}
          {availableAddons.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div>
                  <h3 className=" text-xl font-bold text-gray-900 flex items-center gap-1">
                    Want to Add Some Extra Fun? 
                    <Star className="w-4 h-4 text-yellow-400" />
                  </h3>
                  {/* <p className="text-xs text-gray-600">
                    Swipe to see all the extras that could make your party legendary! 🚀
                  </p> */}
                </div>
              </div>

              {/* Fun status message */}
              {/* <div className="mb-3 p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <p className="text-xs text-center font-medium text-gray-700">
                  {getFunMessage()}
                </p>
              </div> */}

              {/* Horizontal scrolling add-ons */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
                {availableAddons.map((addon) => {
                  const isSelected = isAddonSelected(addon)
                  const categoryInfo = categories[addon.category] || null

                  return (
                    <div
                      key={addon.id}
                      className={`relative flex-shrink-0 w-64 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? "border-[hsl(var(--primary-400))] bg-gradient-to-r from-primary-50 to-pink-50 shadow-sm "
                          : "border-gray-200 bg-white hover:border-primary-200 hover:bg-gradient-to-r hover:from-primary-25 hover:to-pink-25"
                      }`}
                      onClick={() => handleAddonToggle(addon)}
                    >
                      {/* Selection indicator */}
                      <div className="flex items-start gap-3 mb-2">
                        <Checkbox checked={isSelected} onChange={() => handleAddonToggle(addon)} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate pr-1">{addon.name}</h4>
                          </div>
                          
                          {categoryInfo && (
                            <div className="mb-2">
                              <span className={`inline-block text-xs px-2 py-0.5 bg-primary-400 text-white rounded-full shadow-sm`}>
                                {categoryInfo.emoji} {categoryInfo.label}
                              </span>
                            </div>
                          )}

                          {addon.description && (
                            <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                              {addon.description} ✨
                            </p>
                          )}

                          <div className="text-right">
                            <div className="text-sm font-bold text-primary-600">
                              +£{addon.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Scroll hint */}
              <div className="text-center mt-2">
                <p className="text-xs text-gray-400">
                  ← Scroll to see more add-ons →
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-1">You're All Set! 🎉</h3>
              <p className="text-sm text-gray-500">
                Your package already includes everything needed for an amazing party!
              </p>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-pink-50 rounded-lg p-3 border border-[hsl(var(--primary-200))] sticky bottom-0 bg-opacity-95 backdrop-blur-sm">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary-600" />
              Price Summary
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center gap-1">
                  Package:
                </span>
                <span className="font-semibold">£{selectedPackage.price}</span>
              </div>

              {selectedAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1 truncate">
                    <Sparkles className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    <span className="truncate">{addon.name}:</span>
                  </span>
                  <span className="font-medium">£{addon.price}</span>
                </div>
              ))}

              <div className="border-t border-primary-200 pt-1 flex justify-between items-center font-bold">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-primary-600" />
                  Total:
                </span>
                <span className="text-primary-600 text-lg">£{totalPrice}</span>
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
            className="flex-1 h-12 bg-white border-gray-300 hover:bg-gray-50"
          >
            Maybe Later 😊
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-12 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {selectedAddons.length > 0 ? "Let's Do This! 🎉" : "Perfect As Is! ✨"} - £{totalPrice}
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}