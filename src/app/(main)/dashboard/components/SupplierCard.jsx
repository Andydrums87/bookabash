// SupplierCard.js - Fixed Awaiting Response Overlay
"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Gift, X, Sparkles, Clock, Plus } from "lucide-react"

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
}) {
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)

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

  const getContactDetails = () => {
    if (!isPaymentConfirmed) return null
    if (enquiries && enquiries.length > 0) {
      const enquiry = enquiries.find((e) => e.supplier_category === type)
      if (enquiry && enquiry.suppliers && enquiry.suppliers.data && enquiry.suppliers.data.owner) {
        const owner = enquiry.suppliers.data.owner
        const contactDetails = {
          phone: owner.phone,
          email: owner.email,
          name: owner.name || `${owner.firstName} ${owner.lastName}`.trim(),
        }
        return contactDetails
      }
    }
    return null
  }

  const contactDetails = getContactDetails()

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

  // Special handling for einvites card
  if (type === "einvites") {
    const hasGeneratedInvite =
      supplier?.image && supplier.image !== "/placeholder.jpg" && supplier?.status === "created"

    return (
      <Card className="border-2 border-[hsl(var(--primary-200))] shadow-lg overflow-hidden relative rounded-2xl bg-gradient-to-br from-white to-[hsl(var(--primary-50))]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))]"></div>

        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <Sparkles className="absolute top-6 left-4 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />

        <CardContent className="p-0">
          <div className="p-6 border-b border-[hsl(var(--primary-100))] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">E-Invites</span>
            </div>
            <div className="flex items-center space-x-2">
              {hasGeneratedInvite && !isPaymentConfirmed && (
                <button
                  onClick={() => handleDeleteSupplier(type)}
                  className="px-3 py-1 bg-white hover:bg-[hsl(var(--primary-50))] rounded-lg text-xs text-gray-600 hover:text-gray-800 font-medium border border-[hsl(var(--primary-200))] shadow-sm transition-colors"
                  title="Remove custom invite"
                >
                  Remove
                </button>
              )}
              <div className="w-3 h-3 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-full"></div>
            </div>
          </div>

          <div className="relative w-full h-[160px] overflow-hidden">
            {hasGeneratedInvite ? (
              <img
                src={supplier.image || "/placeholder.svg"}
                alt={supplier?.name || "Digital Invites"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-[hsl(var(--primary-600))] mx-auto mb-2" />
                  <span className="text-[hsl(var(--primary-700))] font-semibold text-lg">
                    Digital Invites
                  </span>
                </div>
              </div>
            )}
            {hasGeneratedInvite && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg border-0">
                  ✨ Created
                </Badge>
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="font-bold text-gray-900 mb-2">{supplier?.name || "Digital Invites"}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {supplier?.description || "Themed e-invitations"}
            </p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-gray-900">£{supplier?.price || 25}</span>
              <Badge
                className={
                  hasGeneratedInvite
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-[hsl(var(--primary-50))] text-[hsl(var(--primary-700))] border-[hsl(var(--primary-200))]"
                }
              >
                {hasGeneratedInvite ? "Ready to Send" : "Create Invites"}
              </Badge>
            </div>
          </div>

          {!isPaymentConfirmed && (
            <div className="px-6 pb-6">
              <Button
                className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white rounded-xl"
                asChild
              >
                <Link href="/e-invites">{hasGeneratedInvite ? "Edit & Send Invites" : "Create & Send Invites"}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Get state-specific styling
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
      case "awaiting_response":
        return {
          overlayColor: "from-amber-900/80 via-amber-800/70 to-amber-900/80",
          badgeClass: "bg-amber-500 text-white border-amber-400",
          badgeText: "Awaiting Response",
          canEdit: false,
          canRemoveAddons: false,
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

  // DESKTOP INSTAGRAM STORY STYLE CARD - Big background image with overlay text
  return (
    <Card className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""}`}>
      {/* Large background image with overlay - Desktop sized */}
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
            <div className={`absolute inset-0 bg-gradient-to-b ${stateConfig.overlayColor}`} />

            {/* Top badges and controls */}
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

      {/* Bottom section with detailed info and actions */}
      <div className="p-6 bg-white">
        {/* Add-ons detailed section */}
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
            {/* Total for add-ons */}
            <div className="mt-3 pt-3 border-t border-[hsl(var(--primary-200))]">
              <div className="flex justify-between items-center text-sm bg-gradient-to-r from-[hsl(var(--primary-50))] to-white p-3 rounded-lg">
                <span className="font-semibold text-gray-700">Add-ons Total:</span>
                <span className="font-bold text-[hsl(var(--primary-600))]">
                  £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Contact details for payment confirmed */}
        {isPaymentConfirmed && contactDetails && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            {contactDetails.name && (
              <p className="text-sm font-semibold text-emerald-800 mb-3 text-center">
                📞 Contact: {contactDetails.name}
              </p>
            )}
            <div className="flex space-x-3">
              {contactDetails.phone && (
                <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <a href={`tel:${contactDetails.phone}`}>Call Now</a>
                </Button>
              )}
              {contactDetails.email && (
                <Button asChild variant="outline" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                  <a href={`mailto:${contactDetails.email}`}>Send Email</a>
                </Button>
              )}
            </div>
            <p className="text-xs text-emerald-600 text-center mt-3">Contact directly for party arrangements</p>
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

      {/* IMPROVED Awaiting Response Overlay */}
      {supplierState === "awaiting_response" && (
        <div className="absolute inset-0 z-30">
          {/* Semi-transparent background showing the card underneath */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/95 via-amber-100/90 to-amber-200/95 backdrop-blur-[2px] rounded-2xl"></div>
          
          {/* Centered content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 py-8 max-w-xs">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl flex items-center justify-center shadow-lg border border-amber-300">
                <Clock className="w-8 h-8 text-amber-700" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-amber-900 mb-2">Awaiting Response</h3>
              
              {/* Supplier name */}
              <p className="text-sm text-amber-800 mb-4 font-medium">
                We've sent your enquiry to<br />
                <span className="font-bold">{supplier.name}</span>
              </p>
              
              {/* Loading dots and status */}
              <div className="flex items-center justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
              
              <p className="text-xs text-amber-700 mb-6 font-medium">
                Response expected within 24 hours
              </p>
              
              {/* Cancel button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteSupplier(type)}
                className="border-amber-400 text-amber-800 hover:bg-amber-200 bg-white/80 font-medium"
              >
                Cancel Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}