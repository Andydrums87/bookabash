
"use client"
import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmationModal } from "@/components/ui/UniversalModal.jsx"
import { XCircle, RefreshCw } from "lucide-react"

export default function DeclinedSupplierCard({
  type,
  supplier,
  openSupplierModal,
  isDeleting = false, 
  handleCancelEnquiry,
  getSupplierDisplayName,

}) {
  const [showCancelModal, setShowCancelModal] = useState(false)


  const handleConfirmCancel = () => {
    console.log('✅ User confirmed cancellation - proceeding ')
    setShowCancelModal(false)
    if (handleCancelEnquiry) {
      handleCancelEnquiry(type)
    }
  }

  const handleFindAlternative = () => {

    // ✅ Set replacement context in sessionStorage
    sessionStorage.setItem('replacementContext', JSON.stringify({
      isReplacementFlow: true,
      originalSupplierCategory: type,
      declinedSupplierName: supplier.name,
      timestamp: Date.now()
    }))
    
    // Use your existing openSupplierModal function - no changes needed!
    openSupplierModal(type)
  }

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
      photography: "Photography",
      bouncyCastle: "Bouncy Castle"
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  const displayPrice = supplier.totalPrice || supplier.price || 0

  return (
    <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative">
      {/* Large background image with overlay */}
      <div className="relative h-64 w-full">
        <div className="absolute inset-0">
          <Image
            src={supplier.image || supplier.imageUrl || `/placeholder.svg`}
            alt={supplier.name}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-red-900/80 via-red-800/70 to-red-900/80" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
            <Badge className="bg-red-500 text-white border-red-400 shadow-lg backdrop-blur-sm">
              Not Available
            </Badge>
          </div>
          <div className="w-10 h-10 bg-red-500/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
            <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
            <span className="text-3xl font-black text-white drop-shadow-lg opacity-75">£{displayPrice}</span>
          </div>
        </div>
      </div>

      {/* Declined status section */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-t-2 border-red-400">
        <div className="p-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-200 to-red-300 rounded-xl flex items-center justify-center shadow-sm">
              <XCircle className="w-5 h-5 text-red-700" />
            </div>
            <Badge className="bg-red-500 text-white">Not Available</Badge>
          </div>
{/* 
          <div className="text-center mb-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              Unfortunately, <span className="font-bold">{supplier.name}</span> isn't available for your party date.
            </p>
            <p className="text-xs text-red-700">
              Don't worry - let's find you another great option!
            </p>
          </div> */}

          <div className="space-y-3">
            <Button
          onClick={handleFindAlternative}
              className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Find Alternative {getDisplayName(type)}
            </Button>
            
            <Button
              onClick={() => setShowCancelModal(true)}
              variant="outline"
              className="w-full border-red-300 text-red-800 hover:bg-red-200"
            >
              Remove from Party
            </Button>
          </div>
        </div>
      </div>
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
    </Card>
  )
}