"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle2, Mail, Phone, CheckCircle, RotateCcw, Contact, Pencil, Lock } from "lucide-react"
import { useState } from "react"
import { canEditBooking, formatEditDeadline } from "@/utils/editDeadline"

export default function PaymentConfirmedSupplierCard({
  type,
  supplier,
  addons = [],
  isDeleting = false,
  onEdit,
  partyDate,
  totalPrice // ✅ FIX: Use calculated totalPrice prop (includes add-ons, delivery)
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Check if editing is allowed (48 hours before party)
  const canEdit = partyDate ? canEditBooking(partyDate) : true

  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
  // ✅ FIX: Prefer calculated totalPrice prop, fallback to supplier data
  const displayPrice = totalPrice || supplier.totalPrice || supplier.price || 0

  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization

  const flipContainerStyle = {
    perspective: '1000px',
    width: '100%',
    height: 'auto'
  }

  const flipInnerStyle = {
    position: 'relative',
    width: '100%',
    minHeight: '500px',
    transition: 'transform 0.7s',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
  }

  const flipSideStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    minHeight: '500px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  const frontStyle = {
    ...flipSideStyle,
    zIndex: 2
  }

  const backStyle = {
    ...flipSideStyle,
    transform: 'rotateY(180deg)'
  }

  return (
    <div className="space-y-3">
      <div style={flipContainerStyle}>
        <div style={flipInnerStyle}>
          {/* Front of card */}
          <Card style={frontStyle} className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-white">
            <div className="absolute top-4 right-4 z-10">
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-white" />
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
                <Badge className="bg-teal-500 text-white shadow-lg backdrop-blur-sm">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              </div>

              {/* {supplierAddons.length > 0 && (
                <div className="absolute top-4 left-4 mt-8 z-10">
                  <Badge className="bg-emerald-600 text-white shadow-lg backdrop-blur-sm text-xs">
                    <Gift className="w-3 h-3 mr-1" />
                    {supplierAddons.length} Add-on{supplierAddons.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              )} */}

              {isCakeSupplier && (
                <div className="absolute bottom-4 right-4 z-10">
                  <Badge className="bg-gray-800 text-white shadow-lg backdrop-blur-sm">
                    🎂 {supplier.packageData?.name} • {cakeCustomization.flavorName}
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-5 left-0 right-0 p-6 z-10">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
                  <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
                  <span className="text-3xl font-black text-white drop-shadow-lg">£{displayPrice}</span>
                </div>
              </div>
            </div>

            <div className="bg-white flex flex-col">
              <div className="px-5 pb-4 flex flex-col">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <Badge className="bg-teal-500 text-white text-xs">Confirmed & Paid</Badge>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 text-center">
                  <p className="text-base font-semibold text-gray-800 mb-4">{supplier.name} is confirmed!</p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setIsFlipped(true)}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      <Contact className="w-4 h-4 inline mr-2" />
                      View Contact Details
                    </Button>

                    {onEdit && (
                      <Button
                        onClick={() => canEdit && onEdit(type, supplier)}
                        disabled={!canEdit}
                        variant="outline"
                        className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          canEdit
                            ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canEdit ? (
                          <>
                            <Pencil className="w-4 h-4 inline mr-2" />
                            Edit Booking
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 inline mr-2" />
                            Edits Locked
                          </>
                        )}
                      </Button>
                    )}

                    {onEdit && !canEdit && (
                      <p className="text-xs text-gray-500">
                        Edits locked 48 hours before party
                      </p>
                    )}
                  </div>
                </div>

            
              </div>
            </div>
          </Card>

          {/* Back of card */}
          <Card style={backStyle} className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-white">
            <div className="bg-gray-800 text-white p-6 h-64 flex flex-col justify-center items-center">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{supplier.name}</h3>
                <p className="text-gray-300">Contact Information</p>
              </div>

              <div className="space-y-3 w-full max-w-xs">
                <Button className="w-full bg-white text-gray-800 hover:bg-gray-100 px-4 py-3 rounded-lg font-medium transition-colors">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Supplier
                </Button>
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Call Supplier
                </Button>
              </div>
            </div>

            <div className="bg-white p-5 flex justify-center">
              <Button
                onClick={() => setIsFlipped(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Back to Details
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}