"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, Gift, X, Clock, Sparkles } from "lucide-react"
import SupplierCardPreview from "./SupplierCardPreview"

export default function MobileSupplierCard({
  type,
  supplier,
  loadingCards = [],
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  // New props for enquiry state (only used when user is signed in)
  enquiryStatus = null, // 'pending', 'accepted', 'declined'
  isSignedIn = false, // Whether user is signed in (determines if we use database or localStorage)
  enquiries = [],
  isPaymentConfirmed = false,
}) {
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)

  // Determine the actual state to show
  const getSupplierState = () => {
    if (!supplier) return "empty"
    // If user is not signed in, only show 'selected' state
    if (!isSignedIn) {
      return "selected"
    }
    // If user is signed in, check enquiry status from database FIRST
    switch (enquiryStatus) {
      case "pending":
        return "awaiting_response"
      case "accepted":
        // IMPORTANT: Check if payment is confirmed ONLY for accepted enquiries
        if (isPaymentConfirmed) {
          return "payment_confirmed"
        }
        return "confirmed" // Enquiry accepted but not paid yet
      case "declined":
        return "declined"
      default:
        return "selected" // No enquiry sent yet, or enquiry status unknown
    }
  }

  const supplierState = getSupplierState()
  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)

  // Get contact details from enquiries for payment confirmed state
  const getContactDetails = () => {
    if (!isPaymentConfirmed) return null
    console.log("🔍 Looking for contact details for type:", type)
    if (enquiries && enquiries.length > 0) {
      const enquiry = enquiries.find((e) => e.supplier_category === type)
      console.log("📧 Found enquiry for", type, ":", enquiry)
      if (enquiry && enquiry.suppliers && enquiry.suppliers.data && enquiry.suppliers.data.owner) {
        const owner = enquiry.suppliers.data.owner
        const contactDetails = {
          phone: owner.phone,
          email: owner.email,
          name: owner.name || `${owner.firstName} ${owner.lastName}`.trim(),
        }
        console.log("📞 Contact details found:", contactDetails)
        return contactDetails
      }
    }
    console.log("⚠️ No contact details found in enquiries")
    return null
  }

  const contactDetails = getContactDetails()

  // Handle empty supplier slot
  if (supplierState === "empty") {
    // Don't allow adding suppliers after payment
    if (isPaymentConfirmed) {
      return null // Don't render empty slots after payment
    }

    return (
      <Card className="relative border-2 border-dashed border-[hsl(var(--primary-300))] overflow-hidden rounded-2xl flex flex-col items-center text-center bg-gradient-to-br from-[hsl(var(--primary-50))] to-white hover:from-[hsl(var(--primary-100))] hover:to-[hsl(var(--primary-50))] transition-all duration-300 shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        <Sparkles className="absolute top-4 left-6 w-3 h-3 text-[hsl(var(--primary-300))] opacity-50" />

        {/* Snappy Image Section */}
        <div className="relative w-full h-48 bg-gradient-to-br from-white to-[hsl(var(--primary-50))] mt-8">
          <div
            className="absolute bg-[hsl(var(--primary-100))] inset-0 mask-image"
            style={{
              WebkitMaskImage: 'url("/image.svg")',
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
              maskImage: 'url("/image.svg")',
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "center",
            }}
          >
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753130478/pz1psr3xq7t1mu2fkz13.png"
              alt="Pick me!"
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* Card Content Section */}
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Add {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <p className="text-sm text-gray-600">Find the perfect {type} for your party</p>
            <Button
              variant="outline"
              onClick={() => openSupplierModal(type)}
              className="border-[hsl(var(--primary-300))] text-[hsl(var(--primary-700))] hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-400))] bg-white/50 rounded-xl"
            >
              🎁 Pick {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Special handling for einvites card
  if (type === "einvites") {
    const hasGeneratedInvite =
      supplier?.image && supplier.image !== "/placeholder.jpg" && supplier?.status === "created"

    return (
      <Card className="border-2 border-[hsl(var(--primary-200))] shadow-lg overflow-hidden relative rounded-2xl bg-gradient-to-br from-white to-[hsl(var(--primary-50))]">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))]"></div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <Sparkles className="absolute top-6 left-4 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />

        <CardContent className="p-0">
          <div className="p-4 border-b border-[hsl(var(--primary-100))] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
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
                  <span className="text-[hsl(var(--primary-700))] font-semibold text-lg">Digital Invites</span>
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

          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-2">{supplier?.name || "Digital Invites"}</h3>
            <p className="text-sm text-gray-600 mb-4">{supplier?.description || "Themed e-invitations"}</p>
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
            <div className="px-4 pb-4">
              <Button
                className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white rounded-xl"
                onClick={() => (window.location.href = "/e-invites")}
              >
                {hasGeneratedInvite ? "Edit & Send Invites" : "Create & Send Invites"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Get state-specific styling and content
  const getStateConfig = (state) => {
    switch (state) {
      case "payment_confirmed":
        return {
          borderClass: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white",
          overlayContent: null,
          badgeClass: "text-emerald-700 border-emerald-300 bg-emerald-50",
          badgeText: "✅ Confirmed & Paid",
          imageOpacity: "",
          canEdit: false,
          canRemoveAddons: false,
          showChangeButton: false,
        }
      case "selected":
        return {
          borderClass: "border-[hsl(var(--primary-300))] bg-gradient-to-br from-white to-[hsl(var(--primary-50))]",
          overlayContent: null,
          badgeClass: "text-blue-700 border-blue-300 bg-blue-50",
          badgeText: "Selected",
          imageOpacity: "",
          canEdit: true,
          canRemoveAddons: true,
          showChangeButton: true,
        }
      case "awaiting_response":
        return {
          borderClass: "border-amber-300 bg-gradient-to-br from-amber-50 to-white",
          overlayContent: (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 to-amber-100/90 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-amber-800 mb-2">Awaiting Response</h3>
                <p className="text-xs text-amber-700 mb-3">We've sent your enquiry to {supplier.name}</p>
                <div className="flex items-center justify-center space-x-1 text-xs text-amber-600 mb-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                    <div
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="font-medium">Response expected within 24 hours</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSupplier(type)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs px-3 py-1 rounded-xl"
                >
                  Cancel Request
                </Button>
              </div>
            </div>
          ),
          badgeClass: "text-amber-700 border-amber-300 bg-amber-50",
          badgeText: "Enquiry Sent",
          imageOpacity: "opacity-40 grayscale",
          canEdit: false,
          canRemoveAddons: false,
          showChangeButton: false,
        }
      case "confirmed":
        return {
          borderClass: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white",
          overlayContent: null,
          badgeClass: "text-emerald-700 border-emerald-300 bg-emerald-50",
          badgeText: "Confirmed",
          imageOpacity: "",
          canEdit: false,
          canRemoveAddons: true,
          showChangeButton: false,
        }
      case "declined":
        return {
          borderClass: "border-red-300 bg-gradient-to-br from-red-50 to-white",
          overlayContent: (
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/90 to-red-100/90 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-red-800 mb-2">Declined</h3>
                <p className="text-xs text-red-700 mb-3">{supplier.name} is not available for your date</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSupplierModal(type)}
                  className="border-red-300 text-red-700 hover:bg-red-100 text-xs px-3 py-1 rounded-xl"
                >
                  Find Alternative
                </Button>
              </div>
            </div>
          ),
          badgeClass: "text-red-700 border-red-300 bg-red-50",
          badgeText: "Declined",
          imageOpacity: "opacity-40 grayscale",
          canEdit: true,
          canRemoveAddons: false,
          showChangeButton: true,
        }
      default:
        return getStateConfig("selected")
    }
  }

  const stateConfig = getStateConfig(supplierState)

  // Wrap the card with preview functionality if awaiting response
  const isAwaitingResponse = supplierState === "awaiting_response"

  const CardWrapper = ({ children }) => {
    if (isAwaitingResponse) {
      return (
        <SupplierCardPreview supplier={supplier} type={type} isAwaitingResponse={isAwaitingResponse}>
          {children}
        </SupplierCardPreview>
      )
    }
    return children
  }

  // Regular supplier card with state-aware styling - optimized for mobile and made smaller
  return (
    <CardWrapper>
      <Card
        className={`overflow-hidden rounded-2xl border-2 shadow-lg transition-all duration-300 relative ${stateConfig.borderClass} ${isDeleting ? "opacity-50 scale-95" : ""}`}
      >
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute bottom-3 left-3 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        {supplierState === "selected" && (
          <Sparkles className="absolute top-3 left-3 w-2 h-2 text-[hsl(var(--primary-300))] opacity-50" />
        )}

        {/* State Overlay */}
        {stateConfig.overlayContent}

        {/* Smaller image section */}
        <div className="relative h-32 w-full">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <>
        
        <div className="relative w-full h-48 bg-gradient-to-br from-white to-[hsl(var(--primary-50))] mt-8">
          <div
            className="absolute bg-[hsl(var(--primary-100))] inset-0 mask-image"
            style={{
              WebkitMaskImage: 'url("/image.svg")',
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
              maskImage: 'url("/image.svg")',
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "center",
            }}
                >
                  <Image
                    src={
                      supplier.image ||
                      supplier.imageUrl ||
                      `/placeholder.svg?height=256&width=256&query=${supplier.name?.replace(/\s+/g, "+") || "/placeholder.svg"}+package`
                    }
                    alt={supplier.name}
                    fill
                    className="object-cover group-hover:brightness-110 transition-all duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Enhanced Category badge with state-aware color - smaller */}
              <div
                className={`absolute px-2 py-1 top-2 rounded-full left-2 flex items-center space-x-1 text-white text-xs font-semibold z-10 shadow-lg ${
                  supplierState === "payment_confirmed"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                    : supplierState === "awaiting_response"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : supplierState === "confirmed"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500"
                        : supplierState === "declined"
                          ? "bg-gradient-to-r from-red-500 to-rose-500"
                          : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]"
                }`}
              >
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>

              {/* Enhanced Change/Remove buttons - smaller */}
              {(stateConfig.canEdit || stateConfig.showChangeButton) && (
                <div className="absolute top-2 right-2 z-20 flex items-center space-x-1">
                  <button
                    onClick={() => handleDeleteSupplier(type)}
                    className="px-2 py-1 bg-white/90 hover:bg-white rounded-lg text-xs text-gray-600 hover:text-gray-800 font-medium border border-[hsl(var(--primary-200))] shadow-sm transition-colors"
                    title={`Remove ${type} supplier`}
                  >
                    Remove
                  </button>
                  <span
                    className={`inline-block w-2 h-2 rounded-full shadow-sm ${
                      supplierState === "payment_confirmed"
                        ? "bg-emerald-400"
                        : supplierState === "confirmed"
                          ? "bg-emerald-400"
                          : supplierState === "awaiting_response"
                            ? "bg-amber-400"
                            : supplierState === "declined"
                              ? "bg-red-400"
                              : "bg-blue-400"
                    }`}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Smaller content section */}
        <CardContent className="px-3 mt-20 pt-3 pb-4 bg-gradient-to-b from-white to-[hsl(var(--primary-50))]">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-3" />
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-gray-900 mb-1">{supplier.name}</h3>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{supplier.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">£{supplier.price}</span>
                <Badge variant="outline" className={`${stateConfig.badgeClass} font-semibold text-xs`}>
                  {stateConfig.badgeText}
                </Badge>
              </div>

              {/* Enhanced Add-ons Section - smaller */}
              {supplierAddons.length > 0 && (
                <div
                  className={`mt-3 pt-3 border-t border-[hsl(var(--primary-100))] ${
                    !stateConfig.canRemoveAddons ? "pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Add-ons
                    </h4>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {supplierAddons.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {supplierAddons.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-[hsl(var(--primary-50))] to-white rounded-lg border border-[hsl(var(--primary-100))]"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">{addon.name}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">{addon.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[hsl(var(--primary-600))]">£{addon.price}</span>
                          {stateConfig.canRemoveAddons && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveAddon(addon.id)
                              }}
                              className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove add-on"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Enhanced Total for this supplier's add-ons - smaller */}
                  {supplierAddons.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[hsl(var(--primary-200))]">
                      <div className="flex justify-between items-center text-xs bg-gradient-to-r from-[hsl(var(--primary-50))] to-white p-2 rounded-lg">
                        <span className="font-semibold text-gray-700">Add-ons Total:</span>
                        <span className="font-bold text-[hsl(var(--primary-600))]">
                          £{supplierAddons.reduce((sum, addon) => sum + addon.price, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Payment confirmed contact details - smaller */}
              {isPaymentConfirmed && (
                <div className="space-y-2 mt-3">
                  {contactDetails ? (
                    <>
                      {/* Show supplier name */}
                      {contactDetails.name && (
                        <p className="text-xs font-semibold text-emerald-800 text-center bg-emerald-50 py-1 rounded-lg">
                          Contact: {contactDetails.name}
                        </p>
                      )}
                      <div className="flex space-x-1">
                        {contactDetails.phone && (
                          <Button
                            asChild
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs py-1"
                          >
                            <a href={`tel:${contactDetails.phone}`}>📞 Call</a>
                          </Button>
                        )}
                        {contactDetails.email && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent rounded-xl text-xs py-1"
                          >
                            <a href={`mailto:${contactDetails.email}`}>📧 Email</a>
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-emerald-600 text-center">Contact directly for party arrangements</p>
                    </>
                  ) : (
                    <div className="mt-3 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-800 text-center">
                        Contact details will be available once payment is confirmed
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Change Supplier Button for Selected State - smaller */}
              {!isPaymentConfirmed && stateConfig.canEdit && (
                <div className="mt-3 pt-3 border-t border-[hsl(var(--primary-100))]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] border-none text-white hover:text-white hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] rounded-xl text-xs py-2"
                    onClick={() => openSupplierModal(type)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Removing..." : `Change ${getSupplierDisplayName(type)}`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
