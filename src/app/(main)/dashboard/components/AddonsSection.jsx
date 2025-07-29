"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, CheckCircle, X, Sparkles } from "lucide-react"

export default function AddonsSection({ addons = [], handleRemoveAddon }) {
  // Don't render if no addons
  if (!addons || addons.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
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
              <h2 className="text-2xl font-bold text-gray-900">Your Add-ons</h2>
              <p className="text-gray-700 mt-1">Extra services to make your party even more special</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            {addons.length} {addons.length === 1 ? "Add-on" : "Add-ons"} Selected
          </Badge>
        </div>
      </div>

      {/* Enhanced Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon) => (
          <Card
            key={addon.id}
            onClick={() => console.log("Addon clicked:", addon.name)}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-[hsl(var(--primary-50))] border-2 border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl hover:scale-[1.02]"
          >
            {/* Decorative elements */}
            <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
            <Sparkles className="absolute top-4 right-8 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />

            <CardContent className="p-0">
              {/* Enhanced Image Section */}
              <div className="relative h-40 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] overflow-hidden">
                <Image
                  src={addon.image || "/placeholder.svg"}
                  alt={addon.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Enhanced overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Enhanced Status badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
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
                    e.stopPropagation() // Prevent card navigation
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
                  <Badge className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Added to Party
                  </Badge>
                  <span className="text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full border border-gray-200 font-medium">
                    {addon.category || "Add-on"}
                  </span>
                </div>

                {/* Enhanced Supplier info if linked */}
                {addon.supplierName && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--primary-100))]">
                    <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-white p-2 rounded-lg border border-[hsl(var(--primary-100))]">
                      <p className="text-xs text-gray-600">
                        Added with:{" "}
                        <span className="font-semibold text-[hsl(var(--primary-700))]">{addon.supplierName}</span>
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

      {/* Enhanced Summary card */}
      <Card className="mt-8 relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-100))] via-[hsl(var(--primary-50))] to-white border-2 border-[hsl(var(--primary-200))] shadow-xl rounded-2xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-8 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
          <div className="absolute top-8 right-12 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
          <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
          <div className="absolute bottom-8 right-8 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-60"></div>
          <Sparkles className="absolute top-6 right-20 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
          <Sparkles className="absolute bottom-4 left-12 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
        </div>

        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center shadow-lg">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add-ons Total</h3>
                <p className="text-gray-700 font-medium">
                  {addons.length} premium {addons.length === 1 ? "service" : "services"} selected
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[hsl(var(--primary-700))] mb-1">
                £{addons.reduce((sum, addon) => sum + addon.price, 0)}
              </div>
              <div className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full border border-[hsl(var(--primary-200))]">
                Total for add-ons
              </div>
            </div>
          </div>

          {/* Enhanced progress indicator */}
          <div className="mt-6 pt-4 border-t border-[hsl(var(--primary-200))]">
            <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
              <span className="font-medium">Services Added</span>
              <span className="font-semibold">{addons.length} items</span>
            </div>
            <div className="w-full bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full h-2 shadow-inner border border-[hsl(var(--primary-200))]">
              <div
                className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${Math.min((addons.length / 5) * 100, 100)}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
