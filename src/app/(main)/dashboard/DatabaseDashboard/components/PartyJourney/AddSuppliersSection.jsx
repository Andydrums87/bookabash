// components/PartyJourney/AddSuppliersSection.jsx - 2-COLUMN GRID
"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import SupplierCard from '../../../components/SupplierCard/SupplierCard'

export function AddSuppliersSection({
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
  getRecommendedSupplierForType,
  onAddRecommendedSupplier,
  recommendationsLoaded,
  onSupplierAdded // ✅ Add this new prop
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

  // Get empty slots
  const emptySlots = allSupplierTypes
    .filter(type => !suppliers[type])
    .map(type => ({
      type,
      isLoading: loadingCards?.includes(type) || false
    }))

  // Don't show if no empty slots
  if (emptySlots.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        {/* <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-primary-600" />
        </div> */}
        {/* <h3 className="text-xl font-bold text-gray-900 mb-2">
          Add More Suppliers
        </h3>
        <p className="text-sm text-gray-600">
          {emptySlots.length} supplier{emptySlots.length !== 1 ? 's' : ''} available to complete your party
        </p> */}
      </div>

      {/* Single Column Grid on Mobile, 2 Columns on Larger Screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {emptySlots.map(({ type, isLoading }) => {
          const recommendedSupplier = getRecommendedSupplierForType 
            ? getRecommendedSupplierForType(type) 
            : null

          return (
            <div key={type} className="col-span-1 md:px-0 px-4">
              <SupplierCard
                type={type}
                supplier={null}
                loadingCards={loadingCards}
                suppliersToDelete={[]}
                openSupplierModal={onAddSupplier}
                handleDeleteSupplier={onRemoveSupplier}
                getSupplierDisplayName={getSupplierDisplayName}
                addons={[]}
                handleRemoveAddon={handleRemoveAddon}
                enquiryStatus={null}
                enquirySentAt={null}
                isPaymentConfirmed={isPaymentConfirmed}
                enquiries={enquiries}
                partyId={partyDetails?.id}
                isSignedIn={true}
                currentPhase={currentPhase}
                onPaymentReady={onPaymentReady}
                handleCancelEnquiry={handleCancelEnquiry}
                partyDetails={partyDetails}
                enhancedPricing={null}
                recommendedSupplier={recommendedSupplier}
                onAddSupplier={(categoryType, supplier) => {
                  onSupplierAdded?.() // ✅ Close the modal first
                  onAddRecommendedSupplier?.(categoryType, supplier) // Then add supplier
                }}
                isCompact={true} // ✅ Pass compact prop
                selectedVenue={suppliers?.venue}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}