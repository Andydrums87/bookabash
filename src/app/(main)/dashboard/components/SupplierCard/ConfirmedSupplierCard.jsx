// ConfirmedSupplierCard.js - Amber/Gold themed for "Confirmed but not paid" state
"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle, CreditCard, Clock } from "lucide-react"

export default function ConfirmedSupplierCard({
  type,
  supplier,
  addons = [],
  isDeleting = false,
  onPaymentReady
}) {
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
  const displayPrice = supplier.totalPrice || supplier.price || 0

  return (
    <Card className={`overflow-hidden rounded-2xl shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""} 
      border-4 border-sky-500 confirmed-glow`}>
      
      {/* Confirmed checkmark corner badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Large background image with overlay */}
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

        {/* Standard gradient overlay - consistent across all cards */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

        <div className="absolute top-4 left-4 right-16 flex items-start justify-start z-10">
          <Badge className="bg-sky-500 text-white shadow-lg backdrop-blur-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>

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

      {/* Confirmed status section - amber/gold themed */}
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-t-2 border-sky-500">
        <div className="p-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-200 to-sky-300 rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle className="w-5 h-5 text-sky-700" />
            </div>
            <Badge className="bg-sky-500 text-white">Confirmed - Ready to Pay</Badge>
          </div>

          {/* Confirmation message */}
     

          {/* Time pressure indicator */}
          <div className="bg-white/70 border border-sky-200 rounded-lg p-3 mb-5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-sky-800">Payment due within 24 hours</p>
              <p className="text-xs text-sky-600">Secure your spot before it's offered to someone else</p>
            </div>
          </div>

          {/* Add-ons if present */}
          {supplierAddons.length > 0 && (
            <div className="bg-white/70 rounded-lg p-4 mb-5">
              <h4 className="text-sm font-semibold text-sky-800 mb-3 text-center flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-sky-600" />
                Confirmed Add-ons ({supplierAddons.length}):
              </h4>
              <div className="space-y-2">
                {supplierAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{addon.name}</span>
                    <span className="font-medium text-sky-700">£{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment button */}
          <Button
            onClick={onPaymentReady}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Deposit Now
          </Button>
        </div>
      </div>

      <style jsx>{`
        .confirmed-glow {
          position: relative;
        }
        
        .confirmed-glow::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
          border-radius: 1rem;
          z-index: -1;
          animation: glow-pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow-pulse {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  )
}