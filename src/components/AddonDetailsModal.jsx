"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Star, CheckCircle, Calendar, PoundSterling, Sparkles, Gift, Heart } from "lucide-react"
import Image from "next/image"
import { UniversalModal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/universalModal"

export default function AddonDetailsModal({ isOpen, onClose, addon, onAddToParty, isAlreadyAdded = false }) {
  const [isAdding, setIsAdding] = useState(false)

  if (!addon) return null

  const handleAddToParty = async () => {
    if (isAlreadyAdded) return

    try {
      setIsAdding(true)
      await onAddToParty(addon)
      // Don't close immediately - let user see the success state
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

  // Get supplier type display name
  const getSupplierTypeDisplay = (type) => {
    const typeMap = {
      entertainment: "Entertainment",
      catering: "Catering",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      partyBags: "Party Bags",
      venue: "Venue",
    }
    return typeMap[type] || type
  }

  return (
    <UniversalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      theme="fun"
      showCloseButton={true}
    >
      {/* Enhanced Header */}
      <ModalHeader 
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <div>
              <span>Add-on Details</span>
              <p className="text-primary-100 text-sm font-normal mt-1">Perfect for your celebration! ✨</p>
            </div>
          </div>
        }
        theme="fun"
        icon={
          <div className="flex flex-col items-center w-20">
        
            <div className="text-center">
            <p className="text-primary-100 text-lg">Price</p>
              <div className="text-2xl font-black text-white">{formatPrice(addon.price)}</div>
         
            </div>
          </div>
        }
      />

      {/* Scrollable Content */}
      <ModalContent className="overflow-y-auto max-h-[60vh]">
        <div className="space-y-6">
          {/* Supplier Image */}
          <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl overflow-hidden shadow-lg">
            {addon.image ? (
              <Image src={addon.image || "/placeholder.svg"} alt={addon.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-primary-500" />
              </div>
            )}

            {/* Available badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-100 text-green-800 border-green-200 shadow-lg">
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="text-xs bg-primary-50 text-primary-700 border-primary-300"
              >
                {getSupplierTypeDisplay(addon.type || addon.category)}
              </Badge>
              {addon.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{addon.rating}</span>
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">{addon.name}</h3>
            <p className="text-gray-600 leading-relaxed">
              {addon.description || "Perfect addition to make your party extra special!"}
            </p>
          </div>

          {/* Key Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary-200 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-500" />
              Key Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addon.location && (
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{addon.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-green-700">Available on your date</span>
              </div>

              {addon.duration && (
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{addon.duration}</span>
                </div>
              )}

              {addon.capacity && (
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Up to {addon.capacity} guests</span>
                </div>
              )}
            </div>
          </div>

          {/* Price - REMOVED - Now in header */}
          {/* Features/Highlights */}
          {addon.features && addon.features.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary-200 shadow-lg">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                What's Included
              </h4>

              <div className="space-y-3">
                {addon.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalContent>

      {/* Enhanced Footer */}
      <ModalFooter theme="fun">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold h-12 px-6 rounded-xl transition-all duration-200"
          >
            Maybe Later
          </Button>

          <Button
            onClick={handleAddToParty}
            disabled={isAlreadyAdded || isAdding}
            className={`w-full sm:w-auto font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
              isAlreadyAdded
                ? "bg-green-600 hover:bg-green-600 text-white"
                : "bg-primary-500 hover:bg-primary-600 text-white"
            }`}
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : isAlreadyAdded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Added to Party
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Add to Party
              </>
            )}
          </Button>
        </div>
      </ModalFooter>
    </UniversalModal>
  )
}