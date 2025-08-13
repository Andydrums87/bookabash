// Enhanced AddonsSection to show both standalone addons AND supplier add-ons
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, CheckCircle, X, Sparkles, Package } from "lucide-react"

export default function AddonsSection({ 
  addons = [], 
  suppliers = {}, // NEW: Pass suppliers to extract their add-ons
  handleRemoveAddon 
}) {
  // NEW: Extract add-ons from suppliers
  const supplierAddons = []
  
  Object.entries(suppliers).forEach(([supplierType, supplier]) => {
    if (supplier?.selectedAddons && supplier.selectedAddons.length > 0) {
      supplier.selectedAddons.forEach(addon => {
        supplierAddons.push({
          ...addon,
          supplierName: supplier.name,
          supplierType: supplierType,
          attachedToSupplier: true,
          // Create unique ID for supplier add-ons
          displayId: `${supplier.id}-${addon.id}`
        })
      })
    }
  })
  
  // Combine standalone addons and supplier add-ons
  const allAddons = [...addons, ...supplierAddons]
  
  // Don't render if no addons at all
  if (allAddons.length === 0) {
    return null
  }

  const handleRemove = (addon) => {
    if (addon.attachedToSupplier) {
      // TODO: Handle removing add-ons from suppliers
      console.log('Cannot remove supplier add-ons yet - need to implement')
    } else {
      handleRemoveAddon(addon.id)
    }
  }

  return (
    <div className="mt-8 ">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-100))] via-[hsl(var(--primary-50))] to-white rounded-2xl border-2 border-[hsl(var(--primary-200))] p-6 mb-8 shadow-lg">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-3 left-8 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
          <div className="absolute top-8 right-12 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
          <div className="absolute bottom-4 left-16 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
          <Sparkles className="absolute top-4 right-20 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
          <Sparkles className="absolute bottom-3 left-12 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Add-ons & Extras</h2>
              <p className="text-gray-700 mt-1">
                {supplierAddons.length > 0 && addons.length > 0 
                  ? "Package add-ons and extra services for your party"
                  : supplierAddons.length > 0 
                  ? "Package add-ons from your selected suppliers"
                  : "Extra services to make your party even more special"
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {supplierAddons.length > 0 && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">
                <Package className="w-3 h-3 mr-1" />
                {supplierAddons.length} Package
              </Badge>
            )}
            {addons.length > 0 && (
              <Badge className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">
                <Gift className="w-3 h-3 mr-1" />
                {addons.length} Extra
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAddons.map((addon) => (
          <Card
            key={addon.displayId || addon.id}
            onClick={() => console.log("Addon clicked:", addon.name)}
            className={`group relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl hover:scale-[1.02] ${
              addon.attachedToSupplier 
                ? 'bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))]'
                : 'bg-gradient-to-br from-white to-[hsl(var(--primary-50))] border-[hsl(var(--primary-200))]'
            }`}
          >
            {/* Decorative elements */}
            <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
            <Sparkles className="absolute top-4 right-8 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />

            <CardContent className="p-0">
              {/* Enhanced Image Section */}
              <div className={`relative h-40 overflow-hidden ${
                addon.attachedToSupplier 
                  ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                  : 'bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))]'
              }`}>
                <Image
                  src={addon.image || "/placeholder.png"}
                  alt={addon.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Enhanced overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Enhanced Status badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  {addon.attachedToSupplier && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 shadow-lg border-0">
                      <Package className="w-3 h-3 mr-1" />
                      Package Add-on
                    </Badge>
                  )}
                  {addon.popular && (
                    <Badge className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white text-xs px-3 py-1 shadow-lg border-0">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                  {addon.limitedTime && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 shadow-lg border-0">
                      Limited Time
                    </Badge>
                  )}
                </div>

                {/* Enhanced Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(addon)
                  }}
                  className={`no-navigate absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group/remove hover:scale-110 z-10 ${
                    addon.attachedToSupplier ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={addon.attachedToSupplier ? "Package add-on cannot be removed separately" : "Remove add-on"}
                  disabled={addon.attachedToSupplier}
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
                    <div className="text-xl font-bold text-[hsl(var(--primary-600))]">£{addon.price}</div>
                    {addon.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">£{addon.originalPrice}</div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {addon.description}
                </p>

                {/* Enhanced Status and category */}
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--primary-100))]">
                  <Badge className={`text-xs font-semibold ${
                    addon.attachedToSupplier 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                      : 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {addon.attachedToSupplier ? 'Package Add-on' : 'Added to Party'}
                  </Badge>
                  <span className="text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full border border-gray-200 font-medium">
                    {addon.category || "Add-on"}
                  </span>
                </div>

                {/* Enhanced Supplier info */}
                {addon.supplierName && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--primary-100))]">
                    <div className={`p-2 rounded-lg border ${
                      addon.attachedToSupplier 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
                        : 'bg-gradient-to-r from-[hsl(var(--primary-50))] to-white border-[hsl(var(--primary-100))]'
                    }`}>
                      <p className="text-xs text-gray-600">
                        {addon.attachedToSupplier ? 'Included with:' : 'Added with:'}{" "}
                        <span className={`font-semibold ${
                          addon.attachedToSupplier ? 'text-blue-700' : 'text-[hsl(var(--primary-700))]'
                        }`}>
                          {addon.supplierName}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Enhanced Click hint */}
                <div className="mt-3 pt-3 border-t border-[hsl(var(--primary-100))]">
                  <p className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-[hsl(var(--primary-50))] to-transparent py-1 rounded">
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