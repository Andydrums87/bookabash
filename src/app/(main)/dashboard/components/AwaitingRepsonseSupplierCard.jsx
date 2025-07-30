// AwaitingResponseSupplierCard.js - Completely separate component
"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, X, Clock } from "lucide-react"

export default function AwaitingResponseSupplierCard({
  type,
  supplier,
  handleDeleteSupplier,
  addons = [],
  isDeleting = false,
}) {
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)

  return (
    <Card className={`gap-0 overflow-hidden rounded-2xl shadow-xl transition-all duration-300 relative min-h-[480px] ${isDeleting ? "opacity-50 scale-95" : ""}`}>
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


            {/* Gradient Overlay for better text contrast */}
            <div className={`absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70`} />

       

        {/* Bottom content overlay - supplier info */}
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
      </div>

      {/* Bottom Section: Awaiting Response Status */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100  border-amber-400 flex-1">
        <div className="p-5">
          {/* Status header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <Badge className="bg-amber-500 text-white">Awaiting Response</Badge>
          </div>

          {/* Status message */}
          <div className="text-center mb-5">
            <p className="text-sm text-amber-800 font-medium mb-3">
              Enquiry sent to <span className="font-bold">{supplier.name}</span>
            </p>
            <div className="flex items-center justify-center space-x-1 mb-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <p className="text-xs text-amber-700">Response within 24 hours</p>
          </div>

          {/* Add-ons if present */}
          {supplierAddons.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                Selected Add-ons ({supplierAddons.length}):
              </h4>
              <div className="space-y-2">
                {supplierAddons.slice(0, 3).map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{addon.name}</span>
                    <span className="font-medium text-gray-900">£{addon.price}</span>
                  </div>
                ))}
                {supplierAddons.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">+{supplierAddons.length - 3} more add-ons</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Add-ons Total:</span>
                  <span className="font-bold text-[hsl(var(--primary-600))]">
                    £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cancel button */}
          <Button
            variant="outline"
            onClick={() => handleDeleteSupplier(type)}
            className="w-full border-amber-300 text-amber-800 hover:bg-amber-200 bg-white/80"
          >
            Cancel Request
          </Button>
        </div>
      </div>
    </Card>
  )
}