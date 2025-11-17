"use client"

import { useState, useEffect } from "react"
import { usePartyJourney } from "@/hooks/usePartyJourney"
import { Button } from "@/components/ui/button"
import { Users, X, Plus, CreditCard } from "lucide-react"
import { ProgressHeader } from "../DatabaseDashboard/components/PartyJourney/ProgressHeader"
import { JourneyStep } from "../DatabaseDashboard/components/PartyJourney/JourneyStep"
import { useGiftRegistry } from "@/hooks/useGiftRegistry"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import PartyPhaseSkeleton from "./PartyPhaseSkeleton"
import DeleteConfirmDialog from "../components/Dialogs/DeleteConfirmDialog"

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)

  const { registry, itemCount, loading: registryLoading } = useGiftRegistry(partyDetails?.id)

  useEffect(() => {
    async function fetchPartyData() {
      if (!partyDetails?.id) {
        console.log('🚫 PartyPhaseContent: No party ID, skipping fetch')
        return
      }

      // ✅ Don't update if registry is still loading
      if (registryLoading) {
        console.log('⏳ PartyPhaseContent: Registry still loading, skipping update')
        return
      }

      console.log('🔄 PartyPhaseContent: Fetching party data for:', partyDetails.id)

      try {
        setLoading(true)

        const guestResult = await partyDatabaseBackend.getPartyGuests(partyDetails.id)
        const guests = guestResult.success ? guestResult.guests || [] : []
        console.log('👥 PartyPhaseContent: Guests fetched:', guests.length)
        setGuestList(guests)

        const rsvpResult = await partyDatabaseBackend.getPartyRSVPs(partyDetails.id)
        const rsvpData = rsvpResult.success ? rsvpResult.rsvps || [] : []
        console.log('✅ PartyPhaseContent: RSVPs fetched:', rsvpData.length)
        setRsvps(rsvpData)

        const einvitesResult = await partyDatabaseBackend.getEInvites(partyDetails.id)
        const einvitesData = einvitesResult.success ? einvitesResult.einvites : null
        console.log('💌 PartyPhaseContent: E-invites fetched:', einvitesData ? 'Found' : 'None')
        setEinvites(einvitesData)

        console.log('🎁 PartyPhaseContent: Registry from hook:', registry ? 'Found (ID: ' + registry.id + ')' : 'None', 'Items:', itemCount)

        const updateData = {
          guestList: guests,
          rsvps: rsvpData,
          einvites: einvitesData,
          giftRegistry: registry,
          registryItemCount: itemCount,
        }

        console.log('📤 PartyPhaseContent: Calling onDataUpdate with:', {
          guestCount: guests.length,
          rsvpCount: rsvpData.length,
          hasRegistry: !!registry,
          itemCount: itemCount,
          hasEinvites: !!einvitesData
        })

        // ✅ Only call the callback if it exists
        if (onDataUpdate) {
          onDataUpdate(updateData)
        }
      } catch (error) {
        console.error("❌ PartyPhaseContent: Error fetching party data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartyData()
  }, [partyDetails?.id, registry, itemCount, registryLoading, onDataUpdate])

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
    return <PartyPhaseSkeleton />
  }

  const allSuppliers = Object.entries(suppliers).filter(([key, supplier]) => supplier !== null && key !== "einvites")
  const totalPossibleSuppliers = 9
  const confirmedSuppliers = allSuppliers.length

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

  // ✅ Calculate outstanding payments
  const getOutstandingPayments = () => {
    const unpaidEnquiries = enquiries.filter(enquiry => {
      const isAccepted = enquiry.status === 'accepted'
      const isUnpaid = !['paid', 'fully_paid', 'partial_paid'].includes(enquiry.payment_status)
      return isAccepted && isUnpaid
    })
    
    const totalDeposit = unpaidEnquiries.reduce((sum, enquiry) => {
      const supplier = suppliers[enquiry.supplier_category]
      if (!supplier) return sum
      return sum + Math.max(50, Math.round(supplier.price * 0.3))
    }, 0)
    
    return {
      count: unpaidEnquiries.length,
      totalDeposit,
      hasOutstanding: unpaidEnquiries.length > 0
    }
  }

  const outstandingPayments = getOutstandingPayments()

  // ✅ Delete handlers
  const handleRemoveClick = (type) => {
    setSupplierToDelete(type)
    setShowDeleteDialog(true)
  }

  const confirmRemoveSupplier = (type) => {
    if (handleCancelEnquiry) {
      handleCancelEnquiry(type)
    }
    setShowDeleteDialog(false)
    setSupplierToDelete(null)
  }

  const cancelRemoveSupplier = () => {
    setShowDeleteDialog(false)
    setSupplierToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* ✅ Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        supplierType={supplierToDelete}
        onConfirm={confirmRemoveSupplier}
        onCancel={cancelRemoveSupplier}
      />

      <ProgressHeader
        partyDetails={partyDetails}
        progress={progress}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        suppliers={suppliers}
        onViewTeam={() => setShowPartyTeamModal(true)}
        supplierCount={allSuppliers.length}
      />

      {/* Party Team Modal */}
      {showPartyTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Party Plan</h2>
              <button
                onClick={() => setShowPartyTeamModal(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Total Cost Summary - No progress bar */}
                <div className="bg-primary-500 rounded-xl p-6 text-white text-center">
                  <div className="text-sm font-medium text-white/80 mb-2">Total Party Cost</div>
                  <div className="text-4xl font-bold">
                    £{typeof totalCost === 'number' ? totalCost.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-white/70 mt-2">
                    {confirmedSuppliers} of {totalPossibleSuppliers} suppliers confirmed
                  </p>
                </div>

                {/* ✅ NEW: Pending Payment Section */}
                {(() => {
                  const pendingSuppliers = Object.entries(suppliers).filter(([type, supplier]) => {
                    if (!supplier || type === "einvites") return false
                    const enquiry = enquiries.find((e) => e.supplier_category === type)
                    const isPaid = ['paid', 'fully_paid', 'partial_paid'].includes(enquiry?.payment_status) || enquiry?.is_paid === true
                    return !isPaid && supplier
                  })

                  if (pendingSuppliers.length === 0) return null

                  return (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                        Pending Payment ({pendingSuppliers.length})
                      </h4>
                      <p className="text-xs text-orange-700 mb-3">
                        Review and remove suppliers before payment
                      </p>
                      
                      <div className="space-y-3">
                        {pendingSuppliers.map(([type, supplier]) => {
                          const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
                            addon.supplierId === supplier.id || 
                            addon.supplierType === type ||
                            addon.attachedToSupplier === type
                          ) : []
                          
                          const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
                          const totalPrice = (supplier.price || 0) + addonsCost
                          const supplierName = supplier.name || 'Unknown Supplier'
                          
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
                          
                          return (
                            <div
                              key={type}
                              className="bg-white rounded-lg border-2 border-orange-300 overflow-hidden"
                            >
                              <div className="flex gap-3 p-3">
                                {supplier.image && (
                                  <div className="flex-shrink-0">
                                    <img
                                      src={supplier.image}
                                      alt={supplierName}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-orange-600 uppercase tracking-wide mb-0.5 font-semibold">
                                        {categoryName}
                                      </p>
                                      <h5 className="font-semibold text-gray-900 text-sm truncate">
                                        {supplierName}
                                      </h5>
                                    </div>
                                    
                                    {/* Remove button */}
                                    <button
                                      onClick={() => handleRemoveClick(type)}
                                      className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                                    >
                                      <X className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                  
                                  <div className="mt-1">
                                    <p className="text-sm font-bold text-orange-600">
                                      £{totalPrice.toFixed(2)}
                                    </p>
                                    {supplierAddons.length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Payment CTA */}
                      {outstandingPayments.hasOutstanding && (
                        <Button
                          onClick={() => {
                            setShowPartyTeamModal(false)
                            onPaymentReady()
                          }}
                          className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay £{outstandingPayments.totalDeposit} to Secure
                        </Button>
                      )}
                    </div>
                  )
                })()}

                {/* Party Team Section - ONLY PAID SUPPLIERS */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary-500" />
                      Confirmed Suppliers
                    </span>
                    <span className="text-sm text-gray-500">
                      {(() => {
                        const paidCount = Object.entries(suppliers).filter(([type, supplier]) => {
                          if (!supplier || type === "einvites") return false
                          const enquiry = enquiries.find((e) => e.supplier_category === type)
                          return ['paid', 'fully_paid', 'partial_paid'].includes(enquiry?.payment_status) || enquiry?.is_paid === true
                        }).length
                        return `${paidCount}/${totalPossibleSuppliers}`
                      })()}
                    </span>
                  </h4>
                  
                  {(() => {
                    const paidSuppliers = Object.entries(suppliers).filter(([type, supplier]) => {
                      if (!supplier || type === "einvites") return false
                      const enquiry = enquiries.find((e) => e.supplier_category === type)
                      return ['paid', 'fully_paid', 'partial_paid'].includes(enquiry?.payment_status) || enquiry?.is_paid === true
                    })

                    if (paidSuppliers.length === 0) {
                      return (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No confirmed suppliers yet
                        </p>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {paidSuppliers.map(([type, supplier]) => {
                          const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
                            addon.supplierId === supplier.id || 
                            addon.supplierType === type ||
                            addon.attachedToSupplier === type
                          ) : []
                          
                          const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
                          const totalPrice = (supplier.price || 0) + addonsCost
                          const supplierName = supplier.name || 'Unknown Supplier'
                          
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
                          
                          return (
                            <div
                              key={type}
                              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                            >
                              <div className="flex gap-3 p-3">
                                {supplier.image && (
                                  <div className="flex-shrink-0">
                                    <img
                                      src={supplier.image}
                                      alt={supplierName}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  </div>
                                )}
                                
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
                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                      ✓ Paid
                                    </span>
                                  </div>
                                  
                                  <div className="mt-1">
                                    <p className="text-sm font-bold text-primary-600">
                                      £{totalPrice.toFixed(2)}
                                    </p>
                                    {supplierAddons.length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>

                {/* {confirmedSuppliers < totalPossibleSuppliers && (
                  <Button
                    onClick={() => setShowPartyTeamModal(false)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More Suppliers ({totalPossibleSuppliers - confirmedSuppliers} available)
                  </Button>
                )} */}
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