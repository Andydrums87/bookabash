"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Gift, PlusCircle, CheckCircle, Sparkles, Heart, Star } from 'lucide-react'

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

  if (!isOpen || !selectedPackage) return null

  // Fun category definitions
  const categories = {
    enhancement: { emoji: "✨", label: "Extra Magic", color: "from-purple-400 to-pink-400" },
    time: { emoji: "⏰", label: "More Fun Time", color: "from-blue-400 to-cyan-400" },
    premium: { emoji: "🌟", label: "VIP Upgrade", color: "from-yellow-400 to-orange-400" },
    logistics: { emoji: "🚗", label: "Easy Peasy", color: "from-green-400 to-emerald-400" },
    seasonal: { emoji: "🎄", label: "Seasonal Special", color: "from-red-400 to-pink-400" },
  }

  // Fun messages based on number of selected add-ons
  const getFunMessage = () => {
    if (selectedAddons.length === 0) return "Your party is already going to be amazing! 🎉"
    if (selectedAddons.length === 1) return "Ooh, nice choice! One extra sprinkle of fun! ✨"
    if (selectedAddons.length === 2) return "Two extras? Now we're talking! This party is getting epic! 🚀"
    return `${selectedAddons.length} add-ons?! This is going to be the BEST party ever! 🎊`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] rounded-xl max-w-xl w-full max-h-[85vh] overflow-y-auto border-2 border-[hsl(var(--primary-200))] shadow-2xl">
        {/* Fun decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
          <div className="absolute top-4 left-4 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-40 animate-bounce"></div>
          <div
            className="absolute top-8 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <Sparkles className="absolute top-6 right-12 w-3 h-3 text-yellow-400 opacity-40 animate-pulse" />
          <Heart className="absolute bottom-20 left-6 w-2 h-2 text-pink-300 opacity-30 animate-bounce" style={{ animationDelay: "2s" }} />
        </div>

        {/* Fun Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-4 rounded-t-xl relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Let's Make It Even More Amazing!
              </h2>
              <p className="text-[hsl(var(--primary-100))] text-sm">
                {supplier?.name || "Your supplier"} has some extra goodies that might make you smile! 😊
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selected Package Summary */}
        <div className="p-4 border-b border-[hsl(var(--primary-200))] relative z-10">
          <Card className="bg-white/80 backdrop-blur-sm border-[hsl(var(--primary-300))] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-[hsl(var(--primary-500))] text-white px-2 py-0.5 text-xs">
                      🎯 Your Chosen Package
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{selectedPackage.name}</h3>
                  {selectedPackage.description && (
                    <p className="text-sm text-gray-600 mb-3">{selectedPackage.description}</p>
                  )}

                  {/* Package Features */}
                  {selectedPackage.features && selectedPackage.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Already included (you're sorted!):
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {selectedPackage.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                        {selectedPackage.features.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{selectedPackage.features.length - 3} more awesome things included! 🎉
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-[hsl(var(--primary-600))]">£{selectedPackage.price}</div>
                  {selectedPackage.duration && (
                    <div className="text-xs text-gray-500">({selectedPackage.duration})</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add-ons Section */}
        <div className="p-4 relative z-10">
          {availableAddons.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center animate-pulse">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-1">
                    Psst... Want to Add Some Extra Fun? 
                    <Star className="w-3 h-3 text-yellow-400" />
                  </h3>
                  <p className="text-xs text-gray-600">
                    These little extras could make your party absolutely legendary! 🚀
                  </p>
                </div>
              </div>

              {/* Fun status message */}
              <div className="mb-4 p-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <p className="text-sm text-center font-medium text-gray-700">
                  {getFunMessage()}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {availableAddons.map((addon) => {
                  const isSelected = isAddonSelected(addon)
                  const categoryInfo = categories[addon.category] || null

                  return (
                    <div
                      key={addon.id}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm transform hover:scale-[1.01] ${
                        isSelected
                          ? "border-[hsl(var(--primary-400))] bg-gradient-to-r from-[hsl(var(--primary-50))] to-pink-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-[hsl(var(--primary-200))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary-25))] hover:to-pink-25"
                      }`}
                      onClick={() => handleAddonToggle(addon)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onChange={() => handleAddonToggle(addon)} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-gray-900">{addon.name}</h4>
                              {categoryInfo && (
                                <span className={`text-xs px-2 py-0.5 bg-gradient-to-r ${categoryInfo.color} text-white rounded-full shadow-sm`}>
                                  {categoryInfo.emoji} {categoryInfo.label}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-[hsl(var(--primary-600))] flex items-center gap-1">
                              <span className="text-xs text-gray-500">just</span>
                              +£{addon.price}
                            </div>
                          </div>
                          {addon.description && (
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {addon.description} ✨
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-[hsl(var(--primary-500))]" />
              </div>
              <h3 className="text-base font-semibold text-gray-600 mb-1">You're All Set! 🎉</h3>
              <p className="text-sm text-gray-500">
                Your package already includes everything needed for an amazing party!
              </p>
            </div>
          )}
        </div>

        {/* Price Summary & Actions */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[hsl(var(--primary-200))] p-4 rounded-b-xl relative z-10">
          <div className="space-y-3">
            {/* Price Breakdown */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-pink-50 rounded-lg p-3 border border-[hsl(var(--primary-200))]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Your awesome package:
                </span>
                <span className="text-sm font-semibold">£{selectedPackage.price}</span>
              </div>

              {selectedAddons.length > 0 && (
                <>
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Sparkles className="w-2 h-2 text-yellow-400" />
                        + {addon.name}:
                      </span>
                      <span className="text-xs font-medium">£{addon.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-[hsl(var(--primary-200))] pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-400" />
                        Party total:
                      </span>
                      <span className="text-lg font-bold text-[hsl(var(--primary-600))]">£{totalPrice}</span>
                    </div>
                  </div>
                </>
              )}

              {selectedAddons.length === 0 && (
                <div className="border-t border-[hsl(var(--primary-200))] pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      Party total:
                    </span>
                    <span className="text-lg font-bold text-[hsl(var(--primary-600))]">£{selectedPackage.price}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10 text-sm bg-white border-gray-300 hover:bg-gray-50"
              >
                Maybe Later 😊
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-10 text-sm bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                {selectedAddons.length > 0 ? "Let's Do This! 🎉" : "Perfect As Is! ✨"} - £{totalPrice}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
