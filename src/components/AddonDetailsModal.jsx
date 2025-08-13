"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Star, CheckCircle, Calendar, Sparkles, Gift } from "lucide-react"
import Image from "next/image"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/UniversalModal.jsx"

export default function AddonDetailsModal({ isOpen, onClose, addon, onAddToParty, isAlreadyAdded = false }) {
  const [isAdding, setIsAdding] = useState(false)

  if (!addon) return null

  const handleAddToParty = async () => {
    if (isAlreadyAdded) return

    try {
      setIsAdding(true)
      await onAddToParty(addon)
      setTimeout(() => {
        onClose()
        setIsAdding(false)
      }, 1000)
    } catch (error) {
      console.error("Error adding addon:", error)
      setIsAdding(false)
    }
  }

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "Price on request"
    if (typeof price === "number") return `£${price}`
    return price
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      theme="fun"
      showCloseButton={true}
    >
      {/* Simple Header */}
      <ModalHeader 
        title={addon.name}
        subtitle={formatPrice(addon.price)}
        theme="fun"
        icon={<Gift className="w-5 h-5 text-white" />}
      />

      {/* Compact Content */}
      <ModalContent>
        <div className="space-y-4">
          {/* Image */}
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            {addon.image ? (
              <Image src={addon.image} alt={addon.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {addon.description || "Perfect addition to make your party extra special!"}
            </p>
          </div>

          {/* Key info - only show what's available */}
          <div className="grid grid-cols-2 gap-3">
            {addon.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{addon.duration}</span>
              </div>
            )}
            
            {addon.capacity && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Up to {addon.capacity}</span>
              </div>
            )}
            
            {addon.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{addon.location}</span>
              </div>
            )}
            
            {addon.rating && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{addon.rating}</span>
              </div>
            )}
          </div>

          {/* Simple features list - only if available */}
          {addon.features && addon.features.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What's included:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {addon.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {addon.features.length > 3 && (
                  <li className="text-gray-400 text-xs">
                    +{addon.features.length - 3} more features...
                  </li>
                )}
              </ul>
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
            className="flex-1 h-11"
          >
            Cancel
          </Button>

          <Button
            onClick={handleAddToParty}
            disabled={isAlreadyAdded || isAdding}
            className={`flex-2 h-11 ${
              isAlreadyAdded
                ? "bg-green-500 hover:bg-green-500"
                : "bg-primary-500 hover:bg-primary-600"
            } text-white`}
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : isAlreadyAdded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Added
              </>
            ) : (
              <>
                Add - {formatPrice(addon.price)}
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}