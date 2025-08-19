// Updated AddonsSection to show ONLY standalone "Extra Services"
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, CheckCircle, X, Sparkles } from "lucide-react"

export default function AddonsSection({ 
  addons = [], 
  suppliers = {}, // Keep for potential future use, but don't extract supplier add-ons
  handleRemoveAddon 
}) {
  // ✅ UPDATED: Only show standalone addons (NOT attached to suppliers)
  const standaloneAddons = addons.filter(addon => 
    !addon.supplierId && 
    !addon.attachedToSupplier && 
    !addon.isSupplierAddon
  )
 
  
  // Don't render if no standalone addons
  if (standaloneAddons.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      {/* Updated Header - Focus on Extra Services */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-100 via-orange-50 to-white rounded-2xl border-2 border-orange-200 p-6 mb-8 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-3 left-8 w-2 h-2 bg-orange-300 rounded-full opacity-60"></div>
          <div className="absolute top-8 right-12 w-1 h-1 bg-orange-400 rounded-full opacity-80"></div>
          <div className="absolute bottom-4 left-16 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-70"></div>
          <Sparkles className="absolute top-4 right-20 w-4 h-4 text-orange-300 opacity-40" />
          <Sparkles className="absolute bottom-3 left-12 w-3 h-3 text-orange-400 opacity-60" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Extra Services & Add-ons</h2>
              <p className="text-gray-700 mt-1">
                Special extras to make your party even more amazing
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">
              <Gift className="w-3 h-3 mr-1" />
              {standaloneAddons.length} Extra Service{standaloneAddons.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Add-ons Grid - Only Standalone */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {standaloneAddons.map((addon) => (
          <Card
            key={addon.id}
            onClick={() => console.log("Addon clicked:", addon.name)}
            className="group relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50 border-orange-200"
          >
            {/* Decorative elements */}
            <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-1 h-1 bg-orange-400 rounded-full opacity-80"></div>
            <Sparkles className="absolute top-4 right-8 w-3 h-3 text-orange-300 opacity-40" />

            <CardContent className="p-0">
              {/* Enhanced Image Section */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
                {addon.image ? (
                  <Image
                    src={addon.image}
                    alt={addon.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  // Fallback for no image
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                      <div className="bg-white/90 px-4 py-2 rounded-lg">
                        <p className="text-gray-700 font-medium text-sm">Extra Service</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Enhanced Status badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 shadow-lg border-0">
                    <Gift className="w-3 h-3 mr-1" />
                    Extra Service
                  </Badge>
                  
                  {addon.popular && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 shadow-lg border-0">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Enhanced Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveAddon(addon.id)
                  }}
                  className="no-navigate absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group/remove hover:scale-110 z-10"
                  title="Remove add-on"
                >
                  <X className="w-4 h-4 text-gray-600 group-hover/remove:text-red-600 transition-colors" />
                </button>
              </div>

              {/* Enhanced Content Section */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">{addon.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-amber-700">{addon.rating || "4.5"}</span>
                        <span className="text-amber-600">({addon.reviewCount || "12"})</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="bg-blue-50 px-2 py-1 rounded-full text-blue-700 text-xs font-medium">
                        {addon.duration || "2 hours"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-xl font-bold text-orange-600">£{addon.price}</div>
                    {addon.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">£{addon.originalPrice}</div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {addon.description}
                </p>

                {/* Enhanced Status and category */}
                <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                  <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Added to Party
                  </Badge>
                  <span className="text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full border border-gray-200 font-medium">
                    {addon.category || "Extra Service"}
                  </span>
                </div>

                {/* Enhanced Click hint */}
                <div className="mt-3 pt-3 border-t border-orange-100">
                  <p className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-orange-50 to-transparent py-1 rounded">
                    Click to view details →
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}