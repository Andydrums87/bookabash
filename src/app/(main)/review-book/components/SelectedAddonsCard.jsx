"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, X, Package } from "lucide-react"

export default function SelectedAddonsCard({ selectedAddons = [], suppliers = {}, onRemoveAddon }) {
  // FIXED: Actually extract add-ons from suppliers
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
  const allAddons = [...selectedAddons, ...supplierAddons]
  const totalAddonsPrice = allAddons.reduce((total, addon) => total + (addon.price || 0), 0).toFixed(2)

  // Don't render if no addons at all
  if (!allAddons || allAddons.length === 0) {
    return null
  }

  const handleRemove = (addon) => {
    if (addon.attachedToSupplier) {
      // Package add-ons cannot be removed separately
      console.log('Cannot remove supplier add-ons separately - they are part of the package')
      return
    }
    
    if (onRemoveAddon) {
      onRemoveAddon(addon.id)
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selected Add-ons & Extras</h2>
              <p className="text-gray-600 text-sm">
                {allAddons.length} extras for your party
                {supplierAddons.length > 0 && selectedAddons.length > 0 && (
                  <span className="text-xs text-gray-500 block">
                    ({supplierAddons.length} package + {selectedAddons.length} standalone)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
              £{totalAddonsPrice}
            </div>
            {supplierAddons.length > 0 && selectedAddons.length > 0 && (
              <div className="flex gap-1 mt-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                  <Package className="w-3 h-3 mr-1" />
                  {supplierAddons.length}
                </Badge>
                <Badge className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5">
                  <Gift className="w-3 h-3 mr-1" />
                  {selectedAddons.length}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {allAddons.map((addon) => (
            <div
              key={addon.displayId || addon.id}
              className={`relative flex items-center space-x-3 p-4 rounded-lg border shadow-sm group hover:shadow-md transition-shadow ${
                addon.attachedToSupplier 
                  ? 'bg-blue-50 border-blue-100' 
                  : 'bg-white border-amber-100'
              }`}
            >
              {/* Enhanced Remove button */}
              <button
                onClick={() => handleRemove(addon)}
                className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20 shadow-lg ${
                  addon.attachedToSupplier 
                    ? 'bg-gray-300 cursor-not-allowed opacity-50' 
                    : 'bg-gray-400 cursor-pointer hover:bg-red-400'
                }`}
                title={addon.attachedToSupplier ? "Package add-on cannot be removed separately" : "Remove add-on"}
                disabled={addon.attachedToSupplier}
              >
                <X className="w-3 h-3 text-white font-bold" />
              </button>

              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                addon.attachedToSupplier ? 'bg-blue-100' : 'bg-amber-100'
              }`}>
                {addon.attachedToSupplier ? (
                  <Package className="w-5 h-5 text-blue-600" />
                ) : (
                  <Gift className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{addon.name}</h3>
                  {addon.attachedToSupplier && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                      Package
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{addon.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-lg font-bold ${
                    addon.attachedToSupplier ? 'text-blue-600' : 'text-amber-600'
                  }`}>
                    £{(addon.price || 0).toFixed(2)}
                  </span>
                  {addon.supplierName && (
                    <span className="text-xs text-gray-500">
                      {addon.attachedToSupplier ? 'included with' : 'via'} {addon.supplierName}
                    </span>
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {supplierAddons.length > 0 && selectedAddons.length > 0 
                ? `${supplierAddons.length} package add-ons + ${selectedAddons.length} standalone services`
                : supplierAddons.length > 0 
                ? `${supplierAddons.length} package add-ons included with suppliers`
                : selectedAddons.length > 0 
                ? `${selectedAddons.length} standalone services selected`
                : "No add-ons selected"
              }
            </p>
            <p className="text-xs text-gray-500">
              {supplierAddons.length > 0 
                ? "× removes standalone add-ons only"
                : "Click × to remove add-ons"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}