// MyPartyTabContent.jsx - Complete booking journey in My Party tab
"use client"

import React, { useState } from "react"
import { X, Eye, CheckCircle, Sparkles, Wand2, Info, Calendar, Clock, MapPin, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import MissingSuppliersSuggestions from "@/components/MissingSuppliersSuggestions"
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"

export default function MyPartyTabContent({
  suppliers = {},
  enquiries = [],
  addons = [],
  partyDetails = {},
  onRemoveSupplier,
  onViewDetails,
  onAddSupplier,
  recommendedSuppliers = {},
  getSupplierDisplayPricing,
  onImHappy,
  onCustomizationComplete, // ✅ NEW PROP
  onBrowseVenues, // ✅ NEW PROP for venue browsing
  onEditPartyDetails, // ✅ NEW PROP for editing party details
  onPhotoUpload, // ✅ NEW PROP for photo upload
  childPhoto, // ✅ NEW PROP for child photo
  uploadingPhoto, // ✅ NEW PROP for upload state
}) {
  const [showMissingSuggestions, setShowMissingSuggestions] = useState(true)
  const [selectedSupplierForQuickView, setSelectedSupplierForQuickView] = useState(null)
  const [selectedSupplierForCustomize, setSelectedSupplierForCustomize] = useState(null)
  const [showPlanInfo, setShowPlanInfo] = useState(false)

  // Photo upload handler
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !onPhotoUpload) return
    await onPhotoUpload(file)
  }

  const getTypeConfig = (supplierType) => {
    const configs = {
      venue: { color: "bg-blue-500", icon: "🏛️" },
      entertainment: { color: "bg-purple-500", icon: "🎭" },
      catering: { color: "bg-orange-500", icon: "🍽️" },
      cakes: { color: "bg-pink-500", icon: "🎂" },
      facePainting: { color: "bg-green-500", icon: "🎨" },
      activities: { color: "bg-yellow-500", icon: "🎪" },
      decorations: { color: "bg-indigo-500", icon: "🎈" },
      balloons: { color: "bg-cyan-500", icon: "🎈" },
      partyBags: { color: "bg-red-500", icon: "🎁" }
    }
    return configs[supplierType] || { color: "bg-gray-500", icon: "📦" }
  }

  const handleImHappy = () => {
    setShowMissingSuggestions(false)
    if (onImHappy) {
      onImHappy()
    }
  }

  // Fetch full supplier data for customization
  const fetchFullSupplierData = async (supplier) => {
    if (!supplier?.id) return

    try {
      const { suppliersAPI } = await import('@/utils/mockBackend')
      const fullSupplier = await suppliersAPI.getSupplierById(supplier.id)
      setSelectedSupplierForCustomize(fullSupplier)
    } catch (error) {
      console.error('❌ Error fetching supplier data:', error)
      setSelectedSupplierForCustomize(supplier)
    }
  }

  // Get all suppliers (both paid and unpaid)
  const allSuppliers = Object.entries(suppliers).filter(([type, supplier]) =>
    supplier && type !== "einvites"
  )

  const fullChildName = partyDetails?.childName || partyDetails?.child_name || 'your child'
  const childFirstName = fullChildName.split(' ')[0]

  // Group suppliers by category
  const getCategoryName = (type) => {
    const categoryNames = {
      venue: 'Venue',
      entertainment: 'Entertainment',
      catering: 'Catering',
      cakes: 'Cakes',
      facePainting: 'Face Painting',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'Decorations',
      balloons: 'Balloons'
    }
    return categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  const renderSupplierCard = ([type, supplier]) => {
    const supplierAddons = Array.isArray(addons) ? addons.filter(addon =>
      addon.supplierId === supplier.id ||
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    ) : []

    const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)

    // Calculate base price:
    // 1. For party bags, use total from metadata (per-bag price × quantity)
    //    - First try partyBagsMetadata.totalPrice
    //    - Then try packageData.totalPrice (for party bags)
    //    - Then calculate from packageData: price × partyBagsQuantity
    // 2. For packages, use packageData.price (the selected package price)
    // 3. Otherwise use supplier.price
    let basePrice = 0

    // Check if this is a party bags supplier
    const isPartyBags = supplier.category === 'Party Bags' ||
                        supplier.category?.toLowerCase().includes('party bag')

    if (isPartyBags) {
      // Try different party bags price sources
      basePrice = supplier.partyBagsMetadata?.totalPrice ||
                  supplier.packageData?.totalPrice ||
                  (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                    ? supplier.packageData.price * supplier.packageData.partyBagsQuantity
                    : null)

      // If no metadata exists, use price as-is (it's likely already the total)
      if (!basePrice) {
        basePrice = supplier.price || supplier.priceFrom || 0
      }
    } else {
      // For non-party-bags: use packageData.price if available, otherwise supplier.price
      basePrice = supplier.packageData?.price || (supplier.price || 0)
    }

    const totalPrice = basePrice + addonsCost
    const supplierName = supplier.name || 'Unknown Supplier'
    const typeConfig = getTypeConfig(type)

    const enquiry = enquiries.find((e) => e.supplier_category === type)
    const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true

    return (
      <Card
        key={type}
        className="overflow-hidden rounded-2xl border-2 shadow-2xl transition-all duration-300 relative ring-2 ring-offset-2 hover:scale-[1.02]"
        style={{
          borderColor: 'hsl(var(--primary-400))',
          '--tw-ring-color': 'hsl(var(--primary-300) / 0.5)',
          boxShadow: '0 25px 50px -12px hsl(var(--primary-200) / 0.3)'
        }}
      >
        {/* Image Section */}
        <div className="relative h-64 w-full">
          <Image
            src={supplier.coverPhoto || supplier.image || supplier.imageUrl || '/placeholder.png'}
            alt={supplierName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

          {/* Status Badge and Remove Button */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
            <div>
              {isPaid && (
                <Badge className="bg-green-500 text-white shadow-lg backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </Badge>
              )}
            </div>

            {/* Remove button - smaller */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveSupplier(type)
              }}
              className="w-7 h-7 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all duration-200 shadow-md z-30"
              aria-label="Remove supplier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Supplier info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {supplierName}
              </h3>

              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black drop-shadow-lg">£{totalPrice.toFixed(2)}</span>
                  </div>
                  {supplierAddons.length > 0 && (
                    <div className="text-sm text-white/90 mt-1">
                      Includes {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-0 bg-white flex flex-col sm:flex-row gap-3">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedSupplierForQuickView(supplier)
            }}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              fetchFullSupplierData(supplier)
            }}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </Card>
    )
  }

  // Calculate total cost
  const totalCost = allSuppliers.reduce((sum, [type, supplier]) => {
    const supplierAddons = Array.isArray(addons) ? addons.filter(addon =>
      addon.supplierId === supplier.id ||
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    ) : []
    const addonsCost = supplierAddons.reduce((addonSum, addon) => addonSum + (addon.price || 0), 0)

    // Calculate base price (same logic as renderSupplierCard)
    let basePrice = 0
    const isPartyBags = supplier.category === 'Party Bags' ||
                        supplier.category?.toLowerCase().includes('party bag')

    if (isPartyBags) {
      basePrice = supplier.partyBagsMetadata?.totalPrice ||
                  supplier.packageData?.totalPrice ||
                  (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                    ? supplier.packageData.price * supplier.packageData.partyBagsQuantity
                    : null)

      // If no metadata exists, use price as-is (it's likely already the total)
      if (!basePrice) {
        basePrice = supplier.price || supplier.priceFrom || 0
      }
    } else {
      basePrice = supplier.packageData?.price || (supplier.price || 0)
    }

    return sum + basePrice + addonsCost
  }, 0)

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    } catch (e) {
      return dateString
    }
  }

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '2pm - 4pm'

    // Handle timeSlot format
    if (partyDetails?.timeSlot) {
      return partyDetails.timeSlot === 'morning' ? '11am - 1pm' : '2pm - 4pm'
    }

    // Handle HH:MM format
    if (timeString.includes(':')) {
      try {
        const [hours] = timeString.split(':')
        const hour = parseInt(hours)
        const endHour = hour + 2
        const formatHour = (h) => h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`
        return `${formatHour(hour)} - ${formatHour(endHour)}`
      } catch (e) {
        return timeString
      }
    }

    return timeString
  }

  // Get full venue address
  const getVenueAddress = () => {
    const venue = suppliers?.venue

    // Get address from serviceDetails.venueAddress (database structure)
    if (venue?.serviceDetails?.venueAddress) {
      const address = venue.serviceDetails.venueAddress
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.postcode
      ].filter(Boolean) // Remove empty values

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    // Try to get full address from venue data.owner (alternative structure)
    if (venue?.data?.owner?.address) {
      const address = venue.data.owner.address
      const parts = [
        address.street,
        address.city,
        address.postcode
      ].filter(Boolean)

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    // Try to get full address from venue owner (direct structure)
    if (venue?.owner?.address) {
      const address = venue.owner.address
      const parts = [
        address.street,
        address.city,
        address.postcode
      ].filter(Boolean)

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    // Fallback to other location sources
    return venue?.location || partyDetails?.location || partyDetails?.postcode || 'Location TBD'
  }

  return (
    <div className="space-y-6">
      {/* Original Header Section */}
      <div className="mb-4">
        <div>
          {/* <div className="flex items-start gap-3 mb-4">
            <h2 className="text-3xl font-black text-gray-900 leading-tight animate-fade-in flex-1">
              Snappy's built the perfect party for {childFirstName}!
            </h2>
            <button
              onClick={() => setShowPlanInfo(!showPlanInfo)}
              className="flex-shrink-0 w-8 h-8 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center transition-colors"
              aria-label="Why this plan?"
            >
              <Info className="w-4 h-4 text-primary-600" />
            </button>
          </div> */}

          {showPlanInfo && (
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Why we chose these suppliers
              </h4>
              <div className="text-sm text-primary-800 space-y-2">
                <p>
                  Based on your party details ({partyDetails?.guestCount || 10} guests, {partyDetails?.theme || 'themed'} party),
                  Snappy has handpicked the best suppliers in your area.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Top-rated suppliers with verified reviews</li>
                  <li>Perfect match for your party size and theme</li>
                  <li>Competitive pricing with instant booking</li>
                  <li>Available on your party date</li>
                </ul>
                <p className="text-xs text-primary-600 mt-3">
                  You can customize or replace any supplier using the tabs above!
                </p>
              </div>
            </div>
          )}

          {/* <p className="text-sm text-gray-600">Here are the suppliers we've chosen for you</p> */}
        </div>
      </div>

      {/* Party Details - Mobile Only */}
      {allSuppliers.length > 0 && (
        <div className="md:hidden bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Party Details</h4>
            <button
              onClick={onEditPartyDetails}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Date:</span> {formatDate(partyDetails?.date)}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {formatTime(partyDetails?.startTime || partyDetails?.time)}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {getVenueAddress()}
            </p>
            <p>
              <span className="font-semibold">Theme:</span> <span className="capitalize">{partyDetails?.theme?.replace(/-/g, ' ') || 'Party'}</span>
            </p>
          </div>

          {/* Photo Upload Section - At Bottom */}
          {onPhotoUpload && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {childPhoto ? (
                  <div className="relative group">
                    <img
                      src={childPhoto}
                      alt={partyDetails?.childName || 'Child'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!uploadingPhoto && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-xs font-semibold">Change</span>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 border-2 border-primary-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                      {uploadingPhoto ? (
                        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="w-5 h-5 text-primary-700" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    {!uploadingPhoto && (
                      <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer">
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{partyDetails?.childName || 'Child'}'s Photo</p>
                  <p className="text-xs text-gray-500">
                    {childPhoto ? 'Click photo to change' : 'Add a photo'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Suppliers Section with Category Headings */}
      {allSuppliers.length > 0 ? (
        <div className="space-y-6">
          {allSuppliers.map(([type, supplier]) => {
            const categoryName = getCategoryName(type)
            const typeConfig = getTypeConfig(type)

            return (
              <div key={type} id={`supplier-card-${type}`}>
                {/* Category Heading */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">{typeConfig.icon}</span>
                    <span>{categoryName}</span>
                  </h3>
                </div>

                {/* Supplier Card */}
                {renderSupplierCard([type, supplier])}

                {/* Venue Change Option */}
                {type === 'venue' && onBrowseVenues && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={onBrowseVenues}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium underline decoration-dotted underline-offset-2 transition-colors"
                    >
                      Want to change venue? Browse other options
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">No suppliers added yet</p>
          <p className="text-sm text-gray-500">
            Start building your party by adding suppliers in the tabs above!
          </p>
        </div>
      )}

      {/* Total Cost Card */}
      {allSuppliers.length > 0 && (
        <Card className="bg-primary-500  shadow-lg">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Your Party Total</p>
              <p className="text-xs text-white/80 mt-0.5">{allSuppliers.length} supplier{allSuppliers.length > 1 ? 's' : ''} selected</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">£{totalCost.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Visual Separator */}
      {showMissingSuggestions && allSuppliers.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Optional Extras</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Anything Missing Section - Subtle styling */}
      {showMissingSuggestions && allSuppliers.length > 0 && (
        <>
          <div className="bg-gray-50/50 border border-gray-200/60 rounded-xl p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>Anything else you'd like to add?</span>
              </h3>
              <p className="text-sm text-gray-500">
                Here are some suggestions to make your party even better
              </p>
            </div>

            <MissingSuppliersSuggestions
              partyPlan={suppliers}
              partyDetails={partyDetails}
              suppliers={Object.values(recommendedSuppliers).filter(s => s)}
              onAddSupplier={async (supplier, supplierType) => {
                // Call the real add function to actually add the supplier
                // MobileSupplierNavigation.handleAddSupplier expects: (supplier, supplierType, shouldNavigate)
                if (onAddSupplier) {
                  await onAddSupplier(supplier, supplierType, false) // false = don't navigate
                }
                // Return true to trigger confetti
                return true
              }}
              addedSupplierIds={new Set()}
              showTitle={false}
              preventNavigation={true}
            />
          </div>

          {/* Happy with your plan button - Outside the suggestions box */}
          <div className="mt-6">
            <Button
              onClick={handleImHappy}
              className="w-full text-white py-6 text-base shadow-lg"
              style={{ background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))' }}
            >
              Happy with your plan?
            </Button>
          </div>
        </>
      )}

      {/* Quick View Modal */}
      {selectedSupplierForQuickView && (
        <SupplierQuickViewModal
          supplier={selectedSupplierForQuickView}
          isOpen={!!selectedSupplierForQuickView}
          onClose={() => setSelectedSupplierForQuickView(null)}
          isAlreadyAdded={true}
        />
      )}

      {/* Customization Modal */}
      {selectedSupplierForCustomize && (
        <SupplierCustomizationModal
          supplier={selectedSupplierForCustomize}
          partyDetails={partyDetails}
          isOpen={!!selectedSupplierForCustomize}
          onClose={() => setSelectedSupplierForCustomize(null)}
          onAddToPlan={async (data) => {
            console.log('🎨 MyPartyTab: Customization completed:', data)

            // Call the handler if provided
            if (onCustomizationComplete) {
              await onCustomizationComplete(data)
            }

            setSelectedSupplierForCustomize(null)
          }}
          isAdding={false}
          currentPhase="planning"
          selectedDate={partyDetails?.date}
          partyDate={partyDetails?.date}
        />
      )}
    </div>
  )
}
