"use client"

import { useState, useEffect } from "react"
import { usePartyJourney } from "@/hooks/usePartyJourney"
import { Button } from "@/components/ui/button"
import { Users, X, Plus } from "lucide-react"
import { ProgressHeader } from "../DatabaseDashboard/components/PartyJourney/ProgressHeader"
import { JourneyStep } from "../DatabaseDashboard/components/PartyJourney/JourneyStep"
import { useGiftRegistry } from "@/hooks/useGiftRegistry"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function PartyPhaseContent({
  phase,
  suppliers,
  enquiries,
  partyData,
  paymentDetails,
  partyDetails,
  hasCreatedInvites,
  onPaymentReady,
  onCreateInvites,
  onAddSupplier,
  onRemoveSupplier,
  loadingCards,
  getSupplierDisplayName,
  addons,
  handleRemoveAddon,
  isPaymentConfirmed,
  currentPhase,
  handleCancelEnquiry,
  getSupplierDisplayPricing,
  getRecommendedSupplierForType,
  onAddRecommendedSupplier,
  recommendationsLoaded,
  onDataUpdate,
}) {
  const [guestList, setGuestList] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [einvites, setEinvites] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPartyTeamModal, setShowPartyTeamModal] = useState(false)

  const { registry, itemCount, loading: registryLoading } = useGiftRegistry(partyDetails?.id)

  useEffect(() => {
    async function fetchPartyData() {
      if (!partyDetails?.id) return

      try {
        setLoading(true)

        const guestResult = await partyDatabaseBackend.getPartyGuests(partyDetails.id)
        const guests = guestResult.success ? guestResult.guests || [] : []
        setGuestList(guests)

        const rsvpResult = await partyDatabaseBackend.getPartyRSVPs(partyDetails.id)
        const rsvpData = rsvpResult.success ? rsvpResult.rsvps || [] : []
        setRsvps(rsvpData)

        const einvitesResult = await partyDatabaseBackend.getEInvites(partyDetails.id)
        const einvitesData = einvitesResult.success ? einvitesResult.einvites : null
        setEinvites(einvitesData)

        onDataUpdate?.({
          guestList: guests,
          rsvps: rsvpData,
          einvites: einvitesData,
          registry,
          registryItemCount: itemCount,
        })

        console.log("📊 Fetched Party Data:", {
          guestCount: guests.length,
          rsvpCount: rsvpData.length,
          hasRegistry: !!registry,
          registryItemCount: itemCount,
          hasEinvites: !!einvitesData,
          einvitesId: einvitesData?.inviteId,
        })
      } catch (error) {
        console.error("Error fetching party data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartyData()
  }, [partyDetails?.id, registry, itemCount, onDataUpdate])

  const { steps, currentStep, completedSteps, totalSteps, progress } = usePartyJourney({
    suppliers,
    enquiries,
    partyDetails,
    guestList,
    giftRegistry: registry,
    registryItemCount: itemCount,
    rsvps,
    einvites,
  })

  if (loading || registryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const allSuppliers = Object.entries(suppliers).filter(([key, supplier]) => supplier !== null && key !== "einvites")
  const totalPossibleSuppliers = 9
  const confirmedSuppliers = allSuppliers.length

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0
    Object.entries(suppliers).forEach(([type, supplier]) => {
      if (!supplier || type === "einvites") return
      
      const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
        addon.supplierId === supplier.id || 
        addon.supplierType === type ||
        addon.attachedToSupplier === type
      ) : []
      
      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
      total += (supplier.price || 0) + addonsCost
    })
    return total
  }

  const totalCost = calculateTotalCost()
  const progressPercentage = Math.round((confirmedSuppliers / totalPossibleSuppliers) * 100)

  return (
    <div className="space-y-6">
      <ProgressHeader
        partyDetails={partyDetails}
        progress={progress}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        suppliers={suppliers}
        onViewTeam={() => setShowPartyTeamModal(true)}
        supplierCount={allSuppliers.length}
      />

      {/* Party Team Modal - Same as Mobile Widget */}
      {showPartyTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Party Plan</h2>
              <button
                onClick={() => setShowPartyTeamModal(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content - Exact copy of mobile widget */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Progress Summary */}
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${progressPercentage}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{progressPercentage}%</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your Party Plan</h3>
                  <p className="text-gray-600">
                    {confirmedSuppliers} of {totalPossibleSuppliers} suppliers confirmed
                  </p>
                </div>

                {/* Total Cost Summary */}
                <div className="bg-primary-500 rounded-xl p-6 text-white text-center">
                  <div className="text-sm font-medium text-white/80 mb-2">Total Party Cost</div>
                  <div className="text-4xl font-bold">
                    £{typeof totalCost === 'number' ? totalCost.toFixed(2) : '0.00'}
                  </div>
                </div>

               {/* Party Team Section */}
<div className="bg-gray-50 rounded-xl p-4">
  <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
    <span className="flex items-center gap-2">
      <Users className="w-5 h-5 text-primary-500" />
      Your Party Team
    </span>
    <span className="text-sm text-gray-500">
      {confirmedSuppliers}/{totalPossibleSuppliers}
    </span>
  </h4>
  
  {confirmedSuppliers > 0 ? (
    <div className="space-y-3">
      {Object.entries(suppliers).map(([type, supplier]) => {
        if (!supplier || type === "einvites") return null
        
        // Get enquiry status for this supplier
        const enquiry = enquiries.find((e) => e.supplier_category === type)
        const isAccepted = enquiry?.status === "accepted"
        const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true
        const isPending = enquiry?.status === "pending"
        
        // Get supplier addons
        const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
          addon.supplierId === supplier.id || 
          addon.supplierType === type ||
          addon.attachedToSupplier === type
        ) : []
        
        // Calculate total price (base price + addons)
        const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
        const totalPrice = (supplier.price || 0) + addonsCost
        
        // Get supplier name
        const supplierName = supplier.name || 'Unknown Supplier'
        
        // Get category display name
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
        const categoryName = categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
        
       // Determine status badge
let statusBadge = null
if (isPaid) {
  statusBadge = (
    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
      ✓ Paid
    </span>
  )
} else if (isAccepted) {
  // If accepted but NOT paid, show payment pending
  statusBadge = (
    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
      💳 Payment Pending
    </span>
  )
} else if (isPending) {
  statusBadge = (
    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
      ⏳ Pending
    </span>
  )
} else {
  statusBadge = (
    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
      ⚡ Just Added
    </span>
  )
}
        return (
          <div
            key={type}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="flex gap-3 p-3">
              {/* Supplier Image */}
              {supplier.image && (
                <div className="flex-shrink-0">
                  <img
                    src={supplier.image}
                    alt={supplierName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              )}
              
              {/* Supplier Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                      {categoryName}
                    </p>
                    <h5 className="font-semibold text-gray-900 text-sm truncate">
                      {supplierName}
                    </h5>
                  </div>
                  {statusBadge}
                </div>
                
                {/* Price */}
                <div className="mt-1">
                  <p className="text-sm font-bold text-primary-600">
                    £{totalPrice.toFixed(2)}
                  </p>
                  {supplierAddons.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                    </p>
                  )}
                  
                  {/* Payment status */}
                  {!isPaid && (isAccepted || isPending) && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      Payment pending
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  ) : (
    <p className="text-sm text-gray-500 text-center py-4">
      No suppliers added yet
    </p>
  )}
</div>

                {/* Add More Suppliers Button */}
                {confirmedSuppliers < totalPossibleSuppliers && (
                  <Button
                    onClick={() => {
                      setShowPartyTeamModal(false)
                      // Scroll to add suppliers section or trigger add supplier action
                    }}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Suppliers ({totalPossibleSuppliers - confirmedSuppliers} available)
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => (
          <JourneyStep
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
            partyId={partyDetails?.id}
            partyDetails={partyDetails}
            suppliers={suppliers}
            enquiries={enquiries}
            onAddSupplier={onAddSupplier}
            onRemoveSupplier={onRemoveSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            loadingCards={loadingCards}
            addons={addons}
            handleRemoveAddon={handleRemoveAddon}
            isPaymentConfirmed={isPaymentConfirmed}
            currentPhase={currentPhase}
            onPaymentReady={onPaymentReady}
            handleCancelEnquiry={handleCancelEnquiry}
            getSupplierDisplayPricing={getSupplierDisplayPricing}
          />
        ))}
      </div>
    </div>
  )
}