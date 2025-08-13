"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, PlusCircle, CheckCircle, Sparkles, Heart, Star, Plus } from 'lucide-react'
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal"

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

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      theme="fun"
      showCloseButton={true}
      className="relative"
    >
      {/* Simplified Header */}
      <ModalHeader 
        title="Add Some Extras?"
        subtitle={`${selectedPackage.name} • £${selectedPackage.price}`}
        theme="fun"
        icon={<Plus className="w-5 h-5 text-white" />}
      />

      {/* Content */}
      <ModalContent>
        <div className="space-y-6">
          {/* Add-ons Grid */}
          {availableAddons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAddons.map((addon) => {
                const isSelected = isAddonSelected(addon)

                return (
                  <div
                    key={addon.id}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "border-[hsl(var(--primary-400))] bg-primary-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-[hsl(var(--primary-200))]"
                    }`}
                    onClick={() => handleAddonToggle(addon)}
                  >
                    {/* Selection indicator */}
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={isSelected} 
                        onChange={() => handleAddonToggle(addon)} 
                        className="mt-1 flex-shrink-0" 
                      />
                      
                      <div className="flex-1 min-w-0">
                        {/* Addon name and price */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-base">
                            {addon.name}
                          </h4>
                          <span className="text-lg font-bold text-primary-600 ml-2">
                            +£{addon.price}
                          </span>
                        </div>
                        
                        {/* Simple description if available */}
                        {addon.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {addon.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            // Empty state
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-600 mb-2">Perfect as is!</h3>
              <p className="text-sm text-gray-500">
                Your package includes everything needed.
              </p>
            </div>
          )}

          {/* Simple price summary */}
          {selectedAddons.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-gray-700">
                  Package + {selectedAddons.length} extra{selectedAddons.length > 1 ? 's' : ''}
                </span>
                <span className="font-bold text-primary-600">
                  £{totalPrice}
                </span>
              </div>
            </div>
          )}
        </div>
      </ModalContent>

      {/* Simple Footer */}
      <ModalFooter theme="fun">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12"
          >
            Skip
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-2 h-12 bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white"
          >
            {selectedAddons.length > 0 
              ? `Add ${selectedAddons.length} Extra${selectedAddons.length > 1 ? 's' : ''} - £${totalPrice}`
              : `Continue - £${totalPrice}`
            }
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}