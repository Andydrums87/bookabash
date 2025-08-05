"use client"
import { X, Clock, Heart, Eye, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/app/(main)/favorites/hooks/useFavoritesHook"

const PendingEnquiryModal = ({
  isOpen,
  onClose,
  supplier = null,
  onViewDashboard = () => {},
  pendingCount = 0,
  estimatedResponseTime = "24 hours",
}) => {
  const { addToFavorites, isFavorite } = useFavorites()
  const supplierName = supplier?.name || "this supplier"
  const isSupplierFavorite = supplier ? isFavorite(supplier.id) : false

  const handleSaveToFavorites = () => {
    if (supplier && !isSupplierFavorite) {
      addToFavorites(supplier)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] rounded-2xl max-w-sm w-full shadow-2xl relative overflow-hidden border-2 border-[hsl(var(--primary-200))]">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-4 right-6 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40 animate-pulse" />
          <Heart
            className="absolute top-8 left-6 w-3 h-3 text-pink-300 opacity-50 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Enquiries Pending! ⏳</h2>
            <p className="text-white text-opacity-90 text-sm">We're waiting for suppliers to get back to you 🎉</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">
          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">Why wait? 🤔</h4>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    You've got{" "}
                    {pendingCount > 0 ? `${pendingCount} enquir${pendingCount === 1 ? "y" : "ies"}` : "enquiries"} in
                    progress! We'll wait for responses to avoid double-bookings.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm text-center">
              But you can still save <strong>{supplierName}</strong> for later! 😉
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSaveToFavorites}
              disabled={isSupplierFavorite}
              className={`w-full h-12 rounded-xl font-semibold transition-all duration-200 ${
                isSupplierFavorite
                  ? "bg-green-500 hover:bg-green-500 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSupplierFavorite ? "fill-white" : ""}`} />
              {isSupplierFavorite ? "Already Saved! 🎉" : "Save to Favorites 💖"}
            </Button>

            <Button
              onClick={onViewDashboard}
              variant="outline"
              className="w-full h-12 border-2 border-[hsl(var(--primary-300))] hover:border-[hsl(var(--primary-400))] hover:bg-[hsl(var(--primary-50))] rounded-xl font-semibold transition-all duration-200 bg-white group"
            >
              <Eye className="w-4 h-4 mr-2 text-[hsl(var(--primary-600))]" />
              Check Dashboard 📊
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--primary-500))]" />
            </Button>
          </div>

          {/* Expected timeline */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 text-sm">Expected Response: {estimatedResponseTime} ⏰</h4>
                <p className="text-xs text-green-800">We'll email you as soon as they confirm! 💌</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingEnquiryModal
