"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Gift, X } from "lucide-react"

export default function SelectedAddonsCard({ selectedAddons = [], onRemoveAddon }) {
  const totalAddonsPrice = selectedAddons.reduce((total, addon) => total + (addon.price || 0), 0)

  if (!selectedAddons || selectedAddons.length === 0) {
    return null
  }

  const handleRemove = (addonId) => {
    if (onRemoveAddon) {
      onRemoveAddon(addonId)
    }
  }

  return (
    <Card className="border border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selected Add-ons</h2>
              <p className="text-gray-600 text-sm">{selectedAddons.length} extras for your party</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
              £{totalAddonsPrice}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {selectedAddons.map((addon) => (
            <div
              key={addon.id}
              className="relative flex items-center space-x-3 p-4 bg-white rounded-lg border border-amber-100 shadow-sm group hover:shadow-md transition-shadow"
            >
              {/* Remove button - very visible */}
              <button
                onClick={() => handleRemove(addon.id)}
                className="absolute top-3 right-3 w-5 h-5 bg-gray-400 cursor-pointer rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20 shadow-lg"
                title="Remove add-on"
              >
                <X className="w-3 h-3 text-white font-bold" />
              </button>

              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{addon.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{addon.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-amber-600">£{addon.price}</span>
                  {addon.supplierName && (
                    <span className="text-xs text-gray-500">via {addon.supplierName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-amber-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Add-ons Cost:</span>
            <span className="text-2xl font-bold text-amber-600">£{totalAddonsPrice}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Click the × button on any add-on to remove it</p>
        </div>
      </CardContent>
    </Card>
  )
}