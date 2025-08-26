// ConfirmedSupplierCard.js - Updated with cancel request functionality
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle, Clock, Phone, Mail, X } from "lucide-react"
import { ConfirmationModal } from "@/components/ui/UniversalModal"

export default function ConfirmedSupplierCard({
  type,
  supplier,
  addons = [],
  isDeleting = false,
  showContactInfo = false, // Show contact details after payment
  handleCancelEnquiry, // New prop for cancel functionality
  allowCancellation = true // New prop to control if cancellation is allowed
}) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
  const displayPrice = supplier.totalPrice || supplier.price || 0

  // Extract cake customization data
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization


  const handleConfirmCancel = () => {
    console.log('✅ User confirmed cancellation - proceeding')
    setShowCancelModal(false)
    if (handleCancelEnquiry) {
      handleCancelEnquiry(type)
    }
  }


  return (
    <>
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

          {/* Standard gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

          <div className="absolute top-4 left-4 right-16 flex items-start justify-start z-10">
            <Badge className="bg-sky-500 text-white shadow-lg backdrop-blur-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>

          {/* Cake badge in bottom right */}
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

        {/* Confirmed status section */}
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-t-2 border-sky-500">
          <div className="p-5">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-200 to-sky-300 rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-sky-700" />
              </div>
              <Badge className="bg-sky-500 text-white">
                {showContactInfo ? "Booked & Paid" : "Confirmed - Awaiting Payment"}
              </Badge>
            </div>

            {/* Show either payment reminder or contact info */}
            {showContactInfo ? (
              // After payment - show contact information
              <div className="bg-white/70 border border-sky-200 rounded-lg p-3 mb-5">
                <h4 className="font-medium text-sky-800 mb-2 text-center">Contact Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-sky-700">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone || "Contact via platform"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-sky-700">
                    <Mail className="w-4 h-4" />
                    <span>{supplier.email || "Available after booking"}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Before payment - show payment reminder
              <div className="bg-white/70 border border-sky-200 rounded-lg p-3 mb-5 flex items-center gap-3">
                <Clock className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium text-sky-800">Awaiting payment to secure booking</p>
                  <p className="text-xs text-sky-600">Use the main payment button to pay for all confirmed suppliers</p>
                </div>
              </div>
            )}

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

            {/* Cancel button - now opens modal */}
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-white/80 transition-all duration-200"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  <span>Cancelling Request...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <X className="w-4 h-4 mr-2" />
                  <span>Cancel Request</span>
                </div>
              )}
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
            background: linear-gradient(45deg, rgba(14, 165, 233, 0.3), rgba(3, 105, 161, 0.3));
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

     {/* Confirmation Modal using your existing ConfirmationModal */}
     <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Enquiry Request?"
        message={
          `Are you sure you want to cancel your enquiry with ${supplier.name}?\n\n` 
    +
          `This will remove them from your party and notify the supplier that you've withdrawn the request.\n\n` 
          
        }
        confirmText="Yes, Cancel Request"
        cancelText="Keep Request"
        type="warning"
        isLoading={isDeleting}
      />
    </>
  )
}