// DepositPaidSupplierCard.js - Using exact AwaitingResponseSupplierCard styling with new messaging
"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Calendar, Gift } from "lucide-react"

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
      } border-4 border-[hsl(var(--primary-400))] animate-pulse-border`}
      onClick={onClick}
    >
      
      {/* Pulsing status badge - positioned outside the card */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20">
        <Badge className="bg-primary-600 text-white px-4 py-1 text-sm font-medium animate-pulse shadow-lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          Booking Secured
        </Badge>
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

      {/* Bottom Section: Standard neutral background */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex-1">
        <div className="p-5">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] rounded-lg p-4 w-full text-center">
            
              
              <div className="text-sm text-primary-800 mb-3">
                <span className="font-medium">Payment received</span> • <span className="font-medium">Spot reserved</span>
              </div>
              
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-primary-700">
                  <Mail className="w-4 h-4" />
                  <span>
                  Just sorting out the final details with <strong>{supplier.name}</strong> - you'll get their contact info shortly
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons if present */}
          {supplierAddons.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                Secured Add-ons ({supplierAddons.length}):
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
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Add-ons Total:</span>
                  <span className="font-bold text-[hsl(var(--primary-600))]">
                    £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

        
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: hsl(var(--primary-400));
          }
          50% {
            border-color: hsl(var(--primary-600));
          }
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}