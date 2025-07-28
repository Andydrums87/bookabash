"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, CheckCircle, X } from "lucide-react"

export default function AddonsSection({ 
  addons = [], 
  handleRemoveAddon 
}) {
  // Don't render if no addons
  if (!addons || addons.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Add-ons</h2>
          <p className="text-gray-600 mt-1">Extra services to make your party even more special</p>
        </div>
        <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200 px-3 py-1">
          {addons.length} {addons.length === 1 ? 'Add-on' : 'Add-ons'} Selected
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon) => (
          <Card 
            key={addon.id} 
            onClick={() => console.log("Addon clicked:", addon.name)} 
            className="group border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <CardContent className="p-0">
              {/* Image Section */}
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={addon.image || "/placeholder.svg"}
                  alt={addon.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {addon.popular && (
                    <Badge className="bg-primary-500 text-white text-xs px-2 py-1 shadow-sm">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {addon.limitedTime && (
                    <Badge className="bg-orange-500 text-white text-xs px-2 py-1 shadow-sm">
                      Limited Time
                    </Badge>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent card navigation
                    handleRemoveAddon(addon.id)
                  }}
                  className="no-navigate absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors group/remove"
                  title="Remove add-on"
                >
                  <X className="w-4 h-4 text-gray-600 group-hover/remove:text-red-600 transition-colors" />
                </button>
              </div>

              {/* Content Section */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{addon.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{addon.rating || "4.5"}</span>
                        <span className="text-gray-500">({addon.reviewCount || "12"})</span>
                      </div>
                      <span>•</span>
                      <span>{addon.duration || "2 hours"}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-xl font-bold text-primary-600">£{addon.price}</div>
                    {addon.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">£{addon.originalPrice}</div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{addon.description}</p>

                {/* Status and category */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Added to Party
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {addon.category || "Add-on"}
                  </span>
                </div>

                {/* Supplier info if linked */}
                {addon.supplierName && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Added with: <span className="font-medium text-gray-700">{addon.supplierName}</span>
                    </p>
                  </div>
                )}

                {/* Click hint */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view details →
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary card */}
      <Card className="mt-6 bg-primary-50 border-primary-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add-ons Total</h3>
                <p className="text-sm text-gray-600">
                  {addons.length} premium {addons.length === 1 ? 'service' : 'services'} selected
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-700">
                £{addons.reduce((sum, addon) => sum + addon.price, 0)}
              </div>
              <div className="text-sm text-gray-600">Total for add-ons</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}