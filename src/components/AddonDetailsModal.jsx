"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Star, CheckCircle, Calendar, PoundSterling, Sparkles, Gift, Heart } from "lucide-react"
import Image from "next/image"

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] w-[95vw] sm:w-full flex flex-col p-0 gap-0 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border-0 shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-8 w-3 h-3 bg-[hsl(var(--primary-300))] rounded-full opacity-40 animate-pulse"></div>
          <div
            className="absolute top-20 right-12 w-2 h-2 bg-[hsl(var(--primary-400))] rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-16 left-16 w-2.5 h-2.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <Sparkles className="absolute top-12 right-20 w-4 h-4 text-[hsl(var(--primary-300))] opacity-30" />
          <Gift className="absolute bottom-12 left-8 w-3 h-3 text-[hsl(var(--primary-400))] opacity-40" />
        </div>

        {/* Enhanced Header */}
        <DialogHeader className="relative z-10 p-4 sm:p-6 pb-4 flex-shrink-0 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl sm:text-3xl font-black mb-1">Add-on Details</DialogTitle>
              <p className="text-primary-100 text-sm sm:text-base">Perfect for your celebration! ✨</p>
            </div>
          </div>

        
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 py-6">
            {/* Supplier Image */}
            <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl overflow-hidden shadow-lg">
              {addon.image ? (
                <Image src={addon.image || "/placeholder.svg"} alt={addon.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-[hsl(var(--primary-500))]" />
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[hsl(var(--primary-200))] shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant="outline"
                  className="text-xs bg-[hsl(var(--primary-50))] text-[hsl(var(--primary-700))] border-[hsl(var(--primary-300))]"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[hsl(var(--primary-200))] shadow-lg">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[hsl(var(--primary-500))]" />
                Key Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addon.location && (
                  <div className="flex items-center gap-3 p-3 bg-[hsl(var(--primary-50))] rounded-xl">
                    <div className="w-8 h-8 bg-[hsl(var(--primary-500))] rounded-lg flex items-center justify-center">
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
                  <div className="flex items-center gap-3 p-3 bg-[hsl(var(--primary-50))] rounded-xl">
                    <div className="w-8 h-8 bg-[hsl(var(--primary-500))] rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{addon.duration}</span>
                  </div>
                )}

                {addon.capacity && (
                  <div className="flex items-center gap-3 p-3 bg-[hsl(var(--primary-50))] rounded-xl">
                    <div className="w-8 h-8 bg-[hsl(var(--primary-500))] rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Up to {addon.capacity} guests</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 mb-2">Add-on Price</p>
                  <p className="text-3xl font-black">{formatPrice(addon.price)}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <PoundSterling className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Features/Highlights */}
            {addon.features && addon.features.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[hsl(var(--primary-200))] shadow-lg">
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
        </div>

        {/* Enhanced Footer */}
        <DialogFooter className="relative z-10 p-4 sm:p-6 border-t border-[hsl(var(--primary-200))] bg-white/90 backdrop-blur-sm flex-shrink-0">
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
              className={`w-full sm:w-auto font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                isAlreadyAdded
                  ? "bg-green-600 hover:bg-green-600 text-white"
                  : "bg-primary-400 hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}