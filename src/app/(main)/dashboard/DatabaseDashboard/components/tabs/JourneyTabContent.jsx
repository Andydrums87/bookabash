"use client"

import PartyPhaseContent from '../../../components/PartyPhaseContent'
import AgeBasedRecommendationBanner from '@/components/AgeBasedRecommendationBanner'

export default function JourneyTabContent({
  partyPhase,
  visibleSuppliers,
  enquiries,
  partyData,
  paymentDetails,
  partyDetails,
  partyId,
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
  onEditSupplier,
  partyDate,
}) {
  return (
    <div className="space-y-8 py-6 px-1">
      {/* Age-based recommendation banner for ages 1-2 */}
      <AgeBasedRecommendationBanner
        childAge={partyDetails?.childAge}
        childName={partyDetails?.childName}
      />

      {/* Party Journey heading */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          Your Party Journey
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">Track your planning progress</p>
      </div>

      {/* Main Journey Content */}
      <PartyPhaseContent
        key={`party-phase-${partyId || 'default'}`}
        phase={partyPhase}
        suppliers={visibleSuppliers}
        enquiries={enquiries}
        partyData={partyData}
        paymentDetails={paymentDetails}
        partyDetails={partyDetails}
        hasCreatedInvites={hasCreatedInvites}
        onPaymentReady={onPaymentReady}
        onCreateInvites={onCreateInvites}
        onAddSupplier={onAddSupplier}
        onRemoveSupplier={onRemoveSupplier}
        loadingCards={loadingCards}
        getSupplierDisplayName={getSupplierDisplayName}
        addons={addons}
        handleRemoveAddon={handleRemoveAddon}
        isPaymentConfirmed={isPaymentConfirmed}
        currentPhase={currentPhase}
        handleCancelEnquiry={handleCancelEnquiry}
        getSupplierDisplayPricing={getSupplierDisplayPricing}
        getRecommendedSupplierForType={getRecommendedSupplierForType}
        onAddRecommendedSupplier={onAddRecommendedSupplier}
        recommendationsLoaded={recommendationsLoaded}
        onDataUpdate={onDataUpdate}
        onEditSupplier={onEditSupplier}
        partyDate={partyDate}
      />
    </div>
  )
}
