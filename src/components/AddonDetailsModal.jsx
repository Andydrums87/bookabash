import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  X,
  Calendar,
  PoundSterling,
  Sparkles
} from "lucide-react"
import Image from "next/image"

export default function AddonDetailsModal({ 
  isOpen, 
  onClose, 
  addon, 
  onAddToParty,
  isAlreadyAdded = false 
}) {
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
      console.error('Error adding addon:', error)
      setIsAdding(false)
    }
  }

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "Price on request"
    if (typeof price === 'number') return `£${price}`
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
      venue: "Venue"
    }
    return typeMap[type] || type
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-h-[90vh] h-[20vh] overflow-y-auto">
        {/* Header with close button */}
    

        <div className="space-y-6">
          {/* Supplier Image */}
          <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
            {addon.image ? (
              <Image
                src={addon.image}
                alt={addon.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <Sparkles className="w-12 h-12 text-primary-500" />
              </div>
            )}
            
            {/* Available badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {getSupplierTypeDisplay(addon.type || addon.category)}
                </Badge>
                {addon.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{addon.rating}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {addon.name}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {addon.description || "Perfect addition to make your party extra special!"}
              </p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4">
              {addon.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{addon.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Calendar className="w-4 h-4" />
                <span>Available on your date</span>
              </div>
              
              {addon.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{addon.duration}</span>
                </div>
              )}
              
              {addon.capacity && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Up to {addon.capacity} guests</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Add-on Price</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(addon.price)}
                  </p>
                </div>
                <PoundSterling className="w-8 h-8 text-primary-400" />
              </div>
            </div>

            {/* Features/Highlights */}
            {addon.features && addon.features.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                <div className="space-y-2">
                  {addon.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          
          <Button
            onClick={handleAddToParty}
            disabled={isAlreadyAdded || isAdding}
            className={`flex-1 ${
              isAlreadyAdded 
                ? 'bg-green-600 hover:bg-green-600' 
                : 'bg-primary hover:bg-primary-600'
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}