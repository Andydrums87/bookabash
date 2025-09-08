// ConfirmedSupplierCard.js - Updated with subtle cancel request functionality
"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Clock, Phone, Mail, X, MoreHorizontal } from "lucide-react"
import { ConfirmationModal } from "@/components/ui/UniversalModal"

export default function ConfirmedSupplierCard({
  type,
  supplier,
  addons = [],
  isDeleting = false,
  showContactInfo = false, // Show contact details after payment
  handleCancelEnquiry, // New prop for cancel functionality
  allowCancellation = true, // New prop to control if cancellation is allowed

}) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
  const displayPrice = supplier.totalPrice || supplier.price || 0

  // Extract cake customization data
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization

  const handleConfirmCancel = () => {
    console.log("✅ User confirmed cancellation - proceeding")
    setShowCancelModal(false)
    setShowDropdown(false)
    if (handleCancelEnquiry) {
      handleCancelEnquiry(type)
    }
  }

  return (
    <div className="space-y-3">
      <Card
        className={`overflow-hidden rounded-2xl shadow-lg transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""} 
        border border-gray-200 bg-white`}
      >
        {/* Top right icons - status and subtle menu */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm animate-pulse">
            <Clock className="w-3 h-3 text-white" />
          </div>
          
          {/* Subtle dropdown menu for cancel option */}
          {allowCancellation && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-6 h-6 p-0 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-gray-200/50"
              >
                <MoreHorizontal className="w-3 h-3 text-gray-600" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-30">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCancelModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 justify-start"
                    disabled={isDeleting}
                  >
                    <X className="w-3 h-3 mr-2" />
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
        )}

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

          <div className="absolute top-4 left-4 right-20 flex items-start justify-start z-10">
            <Badge className="bg-primary-500 text-white shadow-lg backdrop-blur-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>

          {supplierAddons.length > 0 && (
            <div className="absolute top-4 left-4 mt-8 z-10">
              <Badge className="bg-emerald-600 text-white shadow-lg backdrop-blur-sm text-xs">
                <Gift className="w-3 h-3 mr-1" />
                {supplierAddons.length} Add-on{supplierAddons.length > 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          {/* Cake badge in bottom right */}
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
          <div className="px-5 pb-5 flex flex-col">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <Badge className="bg-primary-500 text-white text-xs animate-pulse">
                {showContactInfo ? "Booked & Paid" : "Awaiting Payment"}
              </Badge>
            </div>

            {showContactInfo ? (
              // After payment - show contact information
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex-1 flex flex-col justify-center">
                <h4 className="font-medium mb-3 text-center text-gray-800">Contact Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone || "Contact via platform"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{supplier.email || "Available after booking"}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Before payment - show payment reminder
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col justify-center text-center">
                <p className="text-base font-semibold text-gray-800 mb-2">Awaiting payment to secure booking</p>
                <p className="text-sm text-gray-600">Use the main payment button to pay for all confirmed suppliers</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Confirmation Modal using your existing ConfirmationModal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Enquiry Request?"
        message={
          `Are you sure you want to cancel your enquiry with ${supplier.name}?\n\n` +
          `This will remove them from your party and notify the supplier that you've withdrawn the request.\n\n`
        }
        confirmText="Yes, Cancel Request"
        cancelText="Keep Request"
        type="warning"
        isLoading={isDeleting}
      />
    </div>
  )
}