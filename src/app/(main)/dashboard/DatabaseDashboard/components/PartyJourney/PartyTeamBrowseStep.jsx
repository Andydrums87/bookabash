// components/PartyJourney/PartyTeamBrowseStep.jsx - NEW COMPONENT
"use client"

import { Plus, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SupplierCard from '../../../components/SupplierCard/SupplierCard'

export function PartyTeamBrowseStep({ 
  suppliers,
  enquiries,
  onAddSupplier,
  onRemoveSupplier,
  getSupplierDisplayName,
  loadingCards,
  partyDetails,
  addons,
  handleRemoveAddon,
  isPaymentConfirmed,
  currentPhase,
  onPaymentReady,
  handleCancelEnquiry,
  getSupplierDisplayPricing,
  totalPossibleSuppliers,
  addedCount
}) {

  const allSupplierTypes = [
    'venue', 
    'entertainment', 
    'cakes',
    'decorations', 
    'facePainting', 
    'activities', 
    'partyBags', 
    'balloons', 
    'catering'
  ]

  // Separate added and not added
  const addedSuppliers = allSupplierTypes.filter(type => suppliers[type])
  const notAddedSuppliers = allSupplierTypes.filter(type => !suppliers[type])

  return (
    <div className="space-y-6">

      {/* Added Suppliers */}
      {addedSuppliers.length > 0 && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Added to Your Party ({addedSuppliers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addedSuppliers.map((type) => {
              const supplier = suppliers[type]
              const supplierEnquiry = enquiries.find(e => e.supplier_category === type)
              const supplierAddons = addons.filter(addon => 
                addon.supplierId === supplier.id || 
                addon.supplierType === type ||
                addon.attachedToSupplier === type
              )
              
              const enhancedPricing = getSupplierDisplayPricing 
                ? getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
                : null

              return (
                <SupplierCard
                  key={type}
                  type={type}
                  supplier={supplier}
                  loadingCards={loadingCards}
                  suppliersToDelete={[]}
                  openSupplierModal={onAddSupplier}
                  handleDeleteSupplier={onRemoveSupplier}
                  getSupplierDisplayName={getSupplierDisplayName}
                  addons={supplierAddons}
                  handleRemoveAddon={handleRemoveAddon}
                  enquiryStatus={supplierEnquiry?.status}
                  enquirySentAt={supplierEnquiry?.created_at}
                  isPaymentConfirmed={isPaymentConfirmed}
                  enquiries={enquiries}
                  partyId={partyDetails?.id}
                  isSignedIn={true}
                  currentPhase={currentPhase}
                  onPaymentReady={onPaymentReady}
                  handleCancelEnquiry={handleCancelEnquiry}
                  partyDetails={partyDetails}
                  enhancedPricing={enhancedPricing}
                  selectedVenue={suppliers?.venue}
                />
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}