"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Clock, Heart, Eye, ArrowRight, Sparkles, CheckCircle } from "lucide-react"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-6 pb-4 px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Enquiries in Progress! ⏳
          </h2>
          <p className="text-gray-600">We're waiting for suppliers to respond</p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-4">
          
          {/* Status Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[hsl(var(--primary-100))] rounded-full p-2">
                <Clock className="w-5 h-5 text-[hsl(var(--primary-600))]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-sm">Why the wait?</h3>
                <p className="text-gray-600 text-xs mt-1">
                  You have {pendingCount > 0 ? `${pendingCount} enquir${pendingCount === 1 ? 'y' : 'ies'}` : 'enquiries'} pending. 
                  We avoid double-bookings by waiting for responses first.
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="text-center py-2">
            <p className="text-gray-700">
              But you can still save <span className="font-semibold text-[hsl(var(--primary-600))]">{supplierName}</span> for later! 💫
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSaveToFavorites}
              disabled={isSupplierFavorite}
              className={`w-full h-11 rounded-lg font-semibold transition-all duration-200 ${
                isSupplierFavorite
                  ? "bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-500))] text-white cursor-default"
                  : "bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
              }`}
            >
              {isSupplierFavorite ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved to Favorites! ✨
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Save to Favorites
                </>
              )}
            </Button>

            <Button
              onClick={onViewDashboard}
              variant="outline"
              className="w-full h-11  border-2 border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] rounded-lg font-semibold transition-all duration-200 group"
            >
              <Eye className="w-4 h-4 mr-2" />
              Check My Dashboard
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>

          {/* Expected Response */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-[hsl(var(--primary-100))] rounded-full p-2">
                <Clock className="w-5 h-5 text-[hsl(var(--primary-600))]" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">Expected Response</h4>
                <p className="text-gray-600 text-xs mt-1">
                  Usually within {estimatedResponseTime} - we'll email you as soon as they respond! 📧
                </p>
              </div>
            </div>
          </div>

          {/* Bottom tip */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              💡 Tip: Check your dashboard regularly for updates on your enquiries
            </p>
          </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingEnquiryModal