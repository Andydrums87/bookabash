"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PartyPopper, Gift } from "lucide-react"

export default function DepositPaidSupplierCard({ type, supplier, supplierAddons = [], isDeleting = false, onClick }) {
  const displayPrice = supplier.totalPrice || supplier.price || 0

  // Extract cake customization data
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization

  return (
    <div className="space-y-3">
      <Card
        className={`gap-0 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 relative ${
          isDeleting ? "opacity-50 scale-95" : ""
        } border border-gray-200 bg-white`}
        onClick={onClick}
      >
        <div className="absolute top-4 right-4 z-20">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <PartyPopper className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="relative h-64 w-full">
          <div className="absolute inset-0">
            <Image
              src={supplier.image || supplier.imageUrl || `/placeholder.png`}
              alt={supplier.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

          <div className="absolute top-4 left-4 right-16 flex items-start justify-start z-10">
            <Badge className="bg-green-500 text-white shadow-lg backdrop-blur-sm">
              {type?.charAt(0).toUpperCase() + type?.slice(1) || "Supplier"}
            </Badge>
          </div>

          {isCakeSupplier && (
            <div className="absolute bottom-4 right-4 z-10">
              <Badge className="bg-gray-800 text-white shadow-lg backdrop-blur-sm">
                🎂 {supplier.packageData?.name} • {cakeCustomization.flavorName}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
              <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
              <span className="text-3xl font-black text-white drop-shadow-lg">£{displayPrice}</span>
            </div>
          </div>
        </div>

        <div className="bg-white flex flex-col">
          <div className="p-5 flex flex-col">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <PartyPopper className="w-4 h-4 text-gray-600" />
              </div>
              <Badge className="bg-green-500 text-white text-xs">Confirmed</Badge>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-base font-semibold text-gray-800 mb-2">{supplier.name} is all yours!</p>
              <p className="text-sm text-gray-600">They'll be in touch within 24 hours with all the details.</p>
            </div>
          </div>
        </div>
      </Card>

      {supplierAddons.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 text-center flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-gray-600" />
            Add-ons Included ({supplierAddons.length}):
          </h4>
          <div className="space-y-2">
            {supplierAddons.slice(0, 3).map((addon) => (
              <div key={addon.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{addon.name}</span>
                <span className="font-medium text-gray-800">£{addon.price}</span>
              </div>
            ))}
            {supplierAddons.length > 3 && (
              <p className="text-xs text-gray-500 text-center">+{supplierAddons.length - 3} more add-ons</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700">Add-ons Total:</span>
              <span className="font-bold text-gray-800">
                £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
