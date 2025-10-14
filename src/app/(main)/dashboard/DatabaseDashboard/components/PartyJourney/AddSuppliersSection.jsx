// components/PartyJourney/AddSuppliersSection.jsx - NEW COMPONENT
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
    <Card className="border-none bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Add More Suppliers
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h3>
              <p className="text-sm text-gray-600">
                {emptySlots.length} supplier{emptySlots.length !== 1 ? 's' : ''} available to complete your party
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll of Empty Slots */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 mb-4">
          <div className="flex gap-6 pb-4">
            {emptySlots.map(({ type, isLoading }) => {
              const recommendedSupplier = getRecommendedSupplierForType 
                ? getRecommendedSupplierForType(type) 
                : null

              return (
                <div key={type} className="flex-shrink-0 w-[320px]">
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
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Browse All Button */}
        {/* <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="bg-white border-primary-300 hover:bg-primary-50"
            asChild
          >
            <Link href="/browse">
              <Plus className="w-4 h-4 mr-2" />
              Browse All Suppliers
            </Link>
          </Button>
        </div> */}
      </CardContent>
    </Card>
  )
}