"use client"

import { Trash2, Pencil, Lock } from "lucide-react"
import { canEditBooking } from "@/utils/editDeadline"

export default function MyPlanTabContent({
  visibleSuppliers,
  enquiries,
  addons,
  partyDetails,
  handleCancelEnquiry,
  handleEditSupplier,
}) {
  // Category name mapping
  const categoryNames = {
    venue: 'Venue',
    entertainment: 'Entertainment',
    catering: 'Catering',
    cakes: 'Cakes',
    facePainting: 'Face Painting',
    activities: 'Activities',
    partyBags: 'Party Bags',
    decorations: 'Decorations',
    balloons: 'Balloons',
    photography: 'Photography',
    bouncyCastle: 'Bouncy Castle'
  }

  // Get ALL suppliers (both paid and unpaid)
  const allPlanSuppliers = Object.entries(visibleSuppliers).filter(([type, supplier]) => {
    return supplier && type !== "einvites"
  })

  // Sort suppliers: pending first, then paid
  const sortedSuppliers = allPlanSuppliers.sort(([typeA, supplierA], [typeB, supplierB]) => {
    const enquiryA = enquiries.find((e) => e.supplier_category === typeA)
    const enquiryB = enquiries.find((e) => e.supplier_category === typeB)
    const isPaidA = ['paid', 'fully_paid', 'partial_paid'].includes(enquiryA?.payment_status) || enquiryA?.is_paid === true
    const isPaidB = ['paid', 'fully_paid', 'partial_paid'].includes(enquiryB?.payment_status) || enquiryB?.is_paid === true

    // Pending (not paid) comes first
    if (!isPaidA && isPaidB) return -1
    if (isPaidA && !isPaidB) return 1
    return 0
  })

  return (
    <div className="space-y-6 py-6 px-4">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          My Party Plan
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">All suppliers in your plan</p>
      </div>

      {/* Supplier Grid */}
      {sortedSuppliers.length === 0 ? (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-bold text-gray-900 mb-2">No suppliers in your plan yet</h3>
          <p className="text-sm text-gray-600">Start building your party by adding suppliers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedSuppliers.map(([type, supplier]) => {
            const supplierAddons = Array.isArray(addons) ? addons.filter(addon =>
              addon.supplierId === supplier.id ||
              addon.supplierType === type ||
              addon.attachedToSupplier === type
            ) : []

            const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)

            // Calculate base price - handle party bags differently
            const isPartyBags = supplier.category === 'Party Bags' || supplier.category?.toLowerCase().includes('party bag')
            let basePrice = 0

            if (isPartyBags) {
              const quantity = supplier.partyBagsQuantity ||
                supplier.partyBagsMetadata?.quantity ||
                supplier.packageData?.partyBagsQuantity ||
                10

              const pricePerBag = supplier.partyBagsMetadata?.pricePerBag ||
                supplier.packageData?.pricePerBag ||
                supplier.packageData?.price ||
                supplier.price ||
                supplier.priceFrom ||
                0

              basePrice = pricePerBag * quantity
            } else {
              basePrice = supplier.packageData?.price || supplier.price || 0
            }

            // Use supplier.totalPrice first (includes add-ons, delivery)
            let totalPrice
            if (supplier.totalPrice) {
              totalPrice = supplier.totalPrice
            } else {
              const selectedAddonsCost = (supplier.selectedAddons || []).reduce(
                (sum, addon) => sum + (addon.price || 0), 0
              )
              const cakeDeliveryFee = supplier.packageData?.cakeCustomization?.deliveryFee || 0
              totalPrice = basePrice + addonsCost + selectedAddonsCost + cakeDeliveryFee
            }

            const supplierName = supplier.name || supplier.data?.name || 'Unknown Supplier'
            const categoryName = categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)

            // Check if supplier is paid
            const enquiry = enquiries.find((e) => e.supplier_category === type)
            const isPaid = ['paid', 'fully_paid', 'partial_paid'].includes(enquiry?.payment_status) || enquiry?.is_paid === true
            const canRemove = !isPaid

            return (
              <div
                key={type}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all"
              >
                {/* Supplier Image */}
                {supplier.image && (
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={supplier.image}
                      alt={supplierName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3">
                      {isPaid ? (
                        <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Supplier Details */}
                <div className="p-4">
                  <p className="text-xs text-primary-600 uppercase tracking-wide mb-1 font-semibold">
                    {categoryName}
                  </p>
                  <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
                    {supplierName}
                  </h4>

                  <div className="mt-2">
                    <p className="text-lg font-bold text-primary-600">
                      £{totalPrice.toFixed(2)}
                    </p>
                    {supplierAddons.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Remove Button for Unpaid Suppliers */}
                  {canRemove && (
                    <button
                      onClick={async () => {
                        if (window.confirm(`Remove ${supplierName} from your plan?`)) {
                          await handleCancelEnquiry(type)
                        }
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-semibold border border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove from Plan
                    </button>
                  )}

                  {/* Edit Button for Paid Suppliers */}
                  {isPaid && (
                    <button
                      onClick={() => {
                        const canEdit = canEditBooking(partyDetails?.date)
                        if (canEdit) {
                          handleEditSupplier(type, supplier)
                        }
                      }}
                      disabled={!canEditBooking(partyDetails?.date)}
                      className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-semibold border ${
                        canEditBooking(partyDetails?.date)
                          ? "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {canEditBooking(partyDetails?.date) ? (
                        <>
                          <Pencil className="w-4 h-4" />
                          Edit Booking
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Edits Locked
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
