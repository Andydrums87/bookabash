// PaymentConfirmedSupplierCard.js - Updated to use primary colors
"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle2, Mail, Phone } from "lucide-react"

export default function PaymentConfirmedSupplierCard({
  type,
  supplier,
  addons = [],
  isDeleting = false,
}) {
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
  const displayPrice = supplier.totalPrice || supplier.price || 0

  // 🎂 NEW: Extract cake customization data
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization

  return (
    <Card className={`overflow-hidden rounded-2xl shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""} 
      border-4 border-[hsl(var(--primary-500))] paid-double-border`}>
      
      {/* Success checkmark corner badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-8 h-8 bg-[hsl(var(--primary-500))] rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-white" />
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
          <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg backdrop-blur-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>

        {/* 🎂 NEW: Cake badge in bottom right */}
        {isCakeSupplier && (
          <div className="absolute bottom-4 right-4 z-10">
            <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg backdrop-blur-sm">
              🎂 {supplier.packageData?.name} • {cakeCustomization.flavorName}
            </Badge>
          </div>
        )}

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

      {/* Payment confirmed status section - primary themed */}
      <div className="bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border-t-2 border-[hsl(var(--primary-500))]">
        <div className="p-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-200))] to-[hsl(var(--primary-300))] rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--primary-700))]" />
            </div>
            <Badge className="bg-[hsl(var(--primary-500))] text-white">Confirmed & Paid</Badge>
          </div>

          {/* Contact Buttons */}
          {(() => {
            const owner = supplier?.originalSupplier?.owner;
            const formatPhone = (phone) => {
              if (!phone) return null;
              return phone.replace(/\D/g, '');
            };

            if (owner && (owner.email || owner.phone)) {
              return (
                <div className="mb-5">
                  <div className="flex gap-3">
                    {owner.email && (
                      <a
                        href={`mailto:${owner.email}?subject=Party Booking Details - ${supplier.name}&body=Hi, I've just paid for your services through PartySnap. Could we please arrange the final details for my party?`}
                        className="flex-1 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    )}
                    {owner.phone && (
                      <a
                        href={`tel:${formatPhone(owner.phone)}`}
                        className="flex-1 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-[hsl(var(--primary-50))] border border-[hsl(var(--primary-200))] rounded-xl p-3 text-center mb-5">
                <p className="text-[hsl(var(--primary-800))] text-sm">
                  Contact details will be provided via email confirmation
                </p>
              </div>
            );
          })()}

          {/* Add-ons if present */}
          {supplierAddons.length > 0 && (
            <div className="bg-white/70 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-[hsl(var(--primary-800))] mb-3 text-center flex items-center justify-center gap-2">
                <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                Included Add-ons ({supplierAddons.length}):
              </h4>
              <div className="space-y-2">
                {supplierAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{addon.name}</span>
                    <span className="font-medium text-[hsl(var(--primary-700))]">£{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .paid-double-border {
          position: relative;
        }
        
        .paid-double-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: white;
          border-radius: 1rem;
          z-index: -1;
        }
      `}</style>
    </Card>
  )
}