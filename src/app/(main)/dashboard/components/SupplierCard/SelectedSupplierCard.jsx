
"use client"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, X } from "lucide-react"

export default function SelectedSupplierCard({
  type,
  supplier,
  supplierAddons,
  isLoading,
  isDeleting,
  openSupplierModal,
  handleDeleteSupplier,
  handleRemoveAddon,
  getSupplierDisplayName
}) {
  const getDisplayName = (supplierType) => {
    if (getSupplierDisplayName) {
      return getSupplierDisplayName(supplierType)
    }
    const displayNames = {
      venue: "Venue",
      entertainment: "Entertainment", 
      catering: "Catering",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      partyBags: "Party Bags",
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  return (
    <Card className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""}`}>
      {/* Large background image with overlay */}
      <div className="relative h-64 w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <div className="absolute inset-0">
              <Image
                src={supplier.image || supplier.imageUrl || `/placeholder.svg`}
                alt={supplier.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

            <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
              <div className="flex items-center gap-3">
                <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
                <Badge className="bg-blue-500 text-white border-blue-400 shadow-lg backdrop-blur-sm">
                  Selected
                </Badge>
              </div>
              <button
                onClick={() => handleDeleteSupplier(type)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
                <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-white drop-shadow-lg">£{supplier.price}</span>
                  {supplierAddons.length > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                        <span className="ml-2">+£{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="p-6 bg-white">
        {/* Add-ons section */}
        {supplierAddons.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
              Selected Add-ons ({supplierAddons.length})
            </h4>
            <div className="space-y-3">
              {supplierAddons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-[hsl(var(--primary-50))] to-white rounded-xl border border-[hsl(var(--primary-100))]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{addon.name}</p>
                    <p className="text-xs text-gray-600 truncate">{addon.description}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-sm font-bold text-[hsl(var(--primary-600))]">£{addon.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveAddon(addon.id)
                      }}
                      className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <Button
          className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg"
          onClick={() => openSupplierModal(type)}
          disabled={isDeleting}
          size="lg"
        >
          {isDeleting ? "Removing..." : `Change ${getDisplayName(type)}`}
        </Button>
      </div>
    </Card>
  )
}
