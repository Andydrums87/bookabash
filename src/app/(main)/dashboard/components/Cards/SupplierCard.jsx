// Updated SupplierCard component with response timer integration

"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, X, Sparkles, Clock, Plus, CheckCircle2, Mail, Phone } from "lucide-react"


export default function SupplierCard({
  type,
  supplier,
  loadingCards = [],
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  enquiryStatus = null,
  isSignedIn = false,
  enquiries = [],
  isPaymentConfirmed = false,
  enquirySentAt = null, // Add this prop to pass the enquiry timestamp
}) {
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)

  // Skip e-invites entirely - return null to hide them
  if (type === "einvites") {
    return null
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
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  const getSupplierState = () => {
    if (!supplier) return "empty"
    if (isPaymentConfirmed) {
      return "payment_confirmed"
    }
    if (!isSignedIn) {
      return "selected"
    }
    switch (enquiryStatus) {
      case "pending":
        return "awaiting_response"
      case "accepted":
        return "confirmed"
      case "declined":
        return "declined"
      default:
        return "selected"
    }
  }

  const supplierState = getSupplierState()
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
// PAYMENT CONFIRMED state with contact info
if (supplierState === "payment_confirmed") {
  return (
    <Card className={`overflow-hidden gap-0 rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""}`}>
      {/* Large background image with overlay */}
      <div className="relative h-64 w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={supplier.image || supplier.imageUrl || `/placeholder.svg`}
            alt={supplier.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
        </div>


        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
         
          </div>
     
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
            <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
            
            {/* Price and add-ons row */}
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

      {/* Payment Confirmed Details Section */}
      <div className=" border-t-2 border-emerald-400">
        <div className="p-4">
          {/* Status header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <Badge className="bg-emerald-500 text-white text-sm">Confirmed & Paid</Badge>
            </div>
            
            <p className="text-sm text-emerald-800 font-medium">
              <span className="font-bold">{supplier.name}</span> is booked and ready for your party! 🎉
            </p>
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
                <div className="mb-4">
                  <p className="text-center text-sm text-emerald-800 font-medium mb-3">
                    📞 Contact {supplier.name} to arrange final details:
                  </p>
                  <div className="flex gap-3">
                    {owner.email && (
                      <a
                        href={`mailto:${owner.email}?subject=Party Booking Details - ${supplier.name}&body=Hi, I've just paid for your services through PartySnap. Could we please arrange the final details for my party?`}
                        className="flex-1 bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    )}
                    {owner.phone && (
                      <a
                        href={`tel:${formatPhone(owner.phone)}`}
                        className="flex-1 bg-primary-500 hover:bg-[hsl(var(--primary-600))] text-white px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center mb-4">
                <p className="text-yellow-800 text-sm">
                  Contact details will be provided via email confirmation
                </p>
              </div>
            );
          })()}

          {/* Add-ons if present */}
          {supplierAddons.length > 0 && (
            <div className="bg-white/60 rounded-lg p-3 mb-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 text-center">Included Add-ons ({supplierAddons.length}):</h4>
              <div className="space-y-1">
                {supplierAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{addon.name}</span>
                    <span className="font-medium text-emerald-700">£{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking confirmed message */}
          <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-3 text-center">
            <p className="text-sm text-emerald-800 font-medium">
              ✨ Deposit paid • Booking secured • Party guaranteed! ✨
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
  // Handle empty supplier slot
  if (supplierState === "empty") {
    if (isPaymentConfirmed) {
      return null
    }

    return (
      <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative cursor-pointer group hover:shadow-2xl"
        onClick={() => openSupplierModal(type)}
      >
        <div className="relative h-64 w-full bg-gradient-to-br from-[hsl(var(--primary-200))] via-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-16 right-12 w-8 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute bottom-12 left-16 w-12 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: "2s" }}></div>
            <div className="absolute bottom-20 right-8 w-6 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-800/50 to-gray-900/70" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-40 h-40 group-hover:scale-110 transition-transform duration-300 ">
              <div className="absolute inset-10 h-30 w-20 mx-auto bg-white rounded-full z-0" />
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753875890/ChatGPT_Image_Jul_30_2025_12_44_41_PM_n9xltj.png"
                alt="Pick me!"
                fill
                className="object-contain drop-shadow-lg z-10"
              />
            </div>
          </div>

          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
            <div className="flex items-center gap-3">
              <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
              <Badge className="bg-gray-500 text-white shadow-lg backdrop-blur-sm">
                Available
              </Badge>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white">
          <Button
            className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
           Snap Me Up! {type.charAt(0).toUpperCase() + type.slice(1)}  🎉
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Snappy is excited to help you pick the perfect option!
          </p>
        </div>
      </Card>
    )
  }

  // AWAITING RESPONSE state with timer
  if (supplierState === "awaiting_response") {
    return (
      <Card className={`overflow-hidden gap-0 rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""}`}>
        {/* Original card structure - Large background image with overlay */}
        <div className="relative h-64 w-full">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <>
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={supplier.image || supplier.imageUrl || `/placeholder.svg`}
                  alt={supplier.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Gradient Overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/80 via-amber-800/70 to-amber-900/80" />

              {/* Top badges and controls */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                <div className="flex items-center gap-3">
                  <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                  <Badge className="bg-amber-500 text-white border-amber-400 shadow-lg backdrop-blur-sm">
                    Awaiting Response
                  </Badge>
                </div>
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                {/* Main content */}
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{supplier.name}</h3>
                  <p className="text-sm text-white/90 mb-4 line-clamp-2 drop-shadow">{supplier.description}</p>
                  
                  {/* Price and add-ons row */}
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
            </>
          )}
        </div>

        {/* Awaiting Response Section Below with Timer */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-t-2 border-amber-400">
          <div className="p-4">
            {/* Status header with timer */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
                <Badge className="bg-amber-500 text-white text-sm">Awaiting Response</Badge>
              </div>
              
              {/* Supplier Response Timer */}
              {enquirySentAt && (
                <div className="mb-3">
                  <SupplierResponseTimer 
                    enquirySentAt={enquirySentAt}
                    supplierName={supplier.name}
                    responseTimeHours={24}
                  />
                </div>
              )}
              
              <p className="text-sm text-amber-800 font-medium">
                Enquiry sent to <span className="font-bold">{supplier.name}</span>
              </p>
            </div>

            {/* Add-ons if present */}
            {supplierAddons.length > 0 && (
              <div className="bg-white/60 rounded-lg p-3 mb-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 text-center">Add-ons ({supplierAddons.length}):</h4>
                <div className="space-y-1">
                  {supplierAddons.slice(0, 2).map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate">{addon.name}</span>
                      <span className="font-medium text-gray-900">£{addon.price}</span>
                    </div>
                  ))}
                  {supplierAddons.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">+{supplierAddons.length - 2} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Cancel button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteSupplier(type)}
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-200 bg-white/80 text-sm"
            >
              Cancel Request
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Regular card states (selected, confirmed, etc.) - rest of the component unchanged
  const getStateConfig = (state) => {
    switch (state) {
      case "payment_confirmed":
        return {
          overlayColor: "from-emerald-900/80 via-emerald-800/70 to-emerald-900/80",
          badgeClass: "bg-emerald-500 text-white border-emerald-400",
          badgeText: "✅ Confirmed & Paid",
          canEdit: false,
          canRemoveAddons: false,
        }
      case "selected":
        return {
          overlayColor: "from-gray-900/70 via-gray-800/60 to-gray-900/70",
          badgeClass: "bg-blue-500 text-white border-blue-400",
          badgeText: "Selected",
          canEdit: true,
          canRemoveAddons: true,
        }
      case "confirmed":
        return {
          overlayColor: "from-emerald-900/80 via-emerald-800/70 to-emerald-900/80",
          badgeClass: "bg-emerald-500 text-white border-emerald-400",
          badgeText: "Confirmed",
          canEdit: false,
          canRemoveAddons: true,
        }
      case "declined":
        return {
          overlayColor: "from-red-900/80 via-red-800/70 to-red-900/80",
          badgeClass: "bg-red-500 text-white border-red-400",
          badgeText: "Declined",
          canEdit: true,
          canRemoveAddons: false,
        }
      default:
        return getStateConfig("selected")
    }
  }

  const stateConfig = getStateConfig(supplierState)

  // Regular card for all other states (rest unchanged)
  return (
    <Card className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""}`}>
      {/* Large background image with overlay */}
      <div className="relative h-64 w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <div className="absolute inset-0">
              <Image
                src={supplier.image || supplier.imageUrl || `/placeholder.svg`}
                alt={supplier.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <div className={`absolute inset-0 bg-gradient-to-b ${stateConfig.overlayColor}`} />

            <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
              <div className="flex items-center gap-3">
                <Badge className="bg-[hsl(var(--primary-600))] text-white shadow-lg backdrop-blur-sm">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
                <Badge className={`${stateConfig.badgeClass} shadow-lg backdrop-blur-sm`}>
                  {stateConfig.badgeText}
                </Badge>
              </div>
              {stateConfig.canEdit && (
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

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
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="p-6 bg-white">
        {/* Add-ons section */}
        {supplierAddons.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
              Selected Add-ons ({supplierAddons.length})
            </h4>
            <div className="space-y-3">
              {supplierAddons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-[hsl(var(--primary-50))] to-white rounded-xl border border-[hsl(var(--primary-100))]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{addon.name}</p>
                    <p className="text-xs text-gray-600 truncate">{addon.description}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-sm font-bold text-[hsl(var(--primary-600))]">£{addon.price}</span>
                    {stateConfig.canRemoveAddons && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAddon(addon.id)
                        }}
                        className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        {!isPaymentConfirmed && stateConfig.canEdit && (
          <Button
            className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg"
            onClick={() => openSupplierModal(type)}
            disabled={isDeleting}
            size="lg"
          >
            {isDeleting ? "Removing..." : `Change ${getDisplayName(type)}`}
          </Button>
        )}
      </div>
    </Card>
  )
}