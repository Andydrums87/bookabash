// MyPartyTabContent.jsx - Complete booking journey in My Party tab
"use client"

import React, { useState } from "react"
import { X, Eye, CheckCircle, Sparkles, Wand2, Info } from "lucide-react"
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
  onCustomizationComplete // ✅ NEW PROP
}) {
  const [showMissingSuggestions, setShowMissingSuggestions] = useState(true)
  const [selectedSupplierForQuickView, setSelectedSupplierForQuickView] = useState(null)
  const [selectedSupplierForCustomize, setSelectedSupplierForCustomize] = useState(null)
  const [showPlanInfo, setShowPlanInfo] = useState(false)

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
                    : (supplier.price || 0))
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
        <div className="p-4 bg-white flex flex-col sm:flex-row gap-3">
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
                    : (supplier.price || 0))
    } else {
      basePrice = supplier.packageData?.price || (supplier.price || 0)
    }

    return sum + basePrice + addonsCost
  }, 0)

  return (
    <div className="space-y-6">
      {/* Original Header Section */}
      <div className="mb-4">
        <div>
          <div className="flex items-start gap-3 mb-4">
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
          </div>

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

          <p className="text-sm text-gray-600">Here are the suppliers we've chosen for you</p>
        </div>
      </div>

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
