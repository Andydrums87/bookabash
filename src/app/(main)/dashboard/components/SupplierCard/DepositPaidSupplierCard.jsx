// DepositPaidSupplierCard.js - Calm, confident styling similar to ConfirmedSupplierCard
"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Gift, Clock } from "lucide-react"

export default function DepositPaidSupplierCard({
  type,
  supplier,
  supplierAddons = [],
  isDeleting = false,
  onClick
}) {
  const displayPrice = supplier.totalPrice || supplier.price || 0

  // 🎂 Extract cake customization data
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization

  return (
    <Card 
      className={`gap-0 overflow-hidden rounded-2xl shadow-xl transition-all duration-300 relative min-h-[480px] ${
        isDeleting ? "opacity-50 scale-95" : ""
      } border-4 border-teal-500`}
      onClick={onClick}
    >
      
      {/* Success checkmark corner badge - like ConfirmedSupplierCard */}
      <div className="absolute top-4 right-4 z-20">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Top Section: Original supplier card with image background */}
      <div className="relative h-64 w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={supplier.image || supplier.imageUrl || `/placeholder.png`}
            alt={supplier.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Standard primary gradient overlay - consistent across all cards */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

        {/* Type badge in top left */}
        <div className="absolute top-4 left-4 right-16 flex items-start justify-start z-10">
          <Badge className="bg-teal-500 text-white shadow-lg backdrop-blur-sm">
            {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Supplier'}
          </Badge>
        </div>

        {/* 🎂 Cake badge in bottom right */}
        {isCakeSupplier && (
          <div className="absolute bottom-4 right-4 z-10">
            <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg backdrop-blur-sm">
              🎂 {supplier.packageData?.name} • {cakeCustomization.flavorName}
            </Badge>
          </div>
        )}

        {/* Bottom content overlay - supplier info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
            <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-white drop-shadow-lg">£{displayPrice}</span>
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
      </div>

      {/* Bottom Section: Calm emerald theme like confirmed cards */}
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-t-2 border-teal-500 flex-1">
        <div className="p-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-200 to-teal-300 rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle className="w-5 h-5 text-teal-700" />
            </div>
            <Badge className="bg-teal-500 text-white">Spot Reserved</Badge>
          </div>

          {/* Calm reassuring message */}
          <div className="bg-white/70 border border-teal-200 rounded-lg p-4 mb-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-800 mb-1">All set with {supplier.name}!</p>
              <p className="text-xs text-teal-700">
                Just getting their contact information ready for you - details arriving via email soon.
              </p>
            </div>
          </div>

          {/* Add-ons if present */}
          {supplierAddons.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-teal-800 mb-3 text-center flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-teal-600" />
                Reserved Add-ons ({supplierAddons.length}):
              </h4>
              <div className="space-y-2">
                {supplierAddons.slice(0, 3).map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{addon.name}</span>
                    <span className="font-medium text-teal-700">£{addon.price}</span>
                  </div>
                ))}
                {supplierAddons.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">+{supplierAddons.length - 3} more add-ons</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Add-ons Total:</span>
                  <span className="font-bold text-teal-600">
                    £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}