// components/SupplierGrid.jsx - Simplified to show all supplier types
import { useState } from 'react'
import SupplierCard from "./SupplierCard/SupplierCard"
import MobileSupplierNavigation from "./MobileSupplierNavigation"
import { useSupplierManager } from '../hooks/useSupplierManager'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function SupplierGrid({
  suppliers,
  enquiries,
  addons,
  onRemoveAddon,
  hasEnquiriesPending,
  isPaymentConfirmed,
  onPaymentReady,
  onAddSupplier,
  isSignedIn,
  currentPhase,
  partyId,
  openSupplierModal,
  renderKey,
  handleCancelEnquiry,
  activeSupplierType,
  onSupplierTabChange
}) {
  
  // Supplier management
  const removeSupplier = async (supplierType) => {
    const result = await partyDatabaseBackend.removeSupplierFromParty(partyId, supplierType)
    if (result.success) {
      return { success: true }
    }
    return result
  }

  const {
    loadingCards,
    suppliersToDelete,
    handleDeleteSupplier,
    getSupplierDisplayName
  } = useSupplierManager(removeSupplier)

  // Get enquiry status functions
  const getEnquiryStatus = (type) => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.status || null
  }

  const getEnquiryTimestamp = (type) => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.created_at || null
  }

  // Define all possible supplier types - always show all of them
  const allSupplierTypes = [
    'venue', 
    'entertainment', 
    'catering', 
    'decorations', 
    'facePainting', 
    'activities', 
    'partyBags', 
    'balloons', 
    'cakes'
  ]

  // Create complete supplier object with all types (filled or empty)
  const completeSuppliers = allSupplierTypes.reduce((acc, type) => {
    acc[type] = suppliers[type] || null // null will show EmptySupplierCard
    return acc
  }, {})

  // Simple grid classes based on total number of supplier types
  const getGridClasses = () => {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  }

  return (
    <div className="w-full">
      {/* Desktop Grid - Show ALL supplier types */}
      <div 
        key={`desktop-grid-${renderKey}`}  
        className={`hidden md:${getGridClasses()}`}
      >
        {allSupplierTypes.map((type) => (
          <SupplierCard
            key={type}
            type={type}
            supplier={suppliers[type] || null} // null triggers EmptySupplierCard
            loadingCards={loadingCards}
            suppliersToDelete={suppliersToDelete}
            openSupplierModal={openSupplierModal}
            handleDeleteSupplier={handleDeleteSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            addons={addons}
            handleRemoveAddon={onRemoveAddon}
            enquiryStatus={getEnquiryStatus(type)}
            enquirySentAt={getEnquiryTimestamp(type)}
            isPaymentConfirmed={isPaymentConfirmed}
            enquiries={enquiries}
            partyId={partyId}
            isSignedIn={isSignedIn}
            currentPhase={currentPhase}
            onPaymentReady={onPaymentReady}
            handleCancelEnquiry={handleCancelEnquiry}
          />
        ))}
      </div>

      {/* Mobile Navigation + Cards - Show ALL supplier types */}
      <div className="md:hidden">
        <MobileSupplierNavigation
          suppliers={completeSuppliers} // Pass complete suppliers object
          loadingCards={loadingCards}
          suppliersToDelete={suppliersToDelete}
          openSupplierModal={openSupplierModal}
          handleDeleteSupplier={handleDeleteSupplier}
          getSupplierDisplayName={getSupplierDisplayName}
          addons={addons}
          handleRemoveAddon={onRemoveAddon}
          getEnquiryStatus={getEnquiryStatus}
          getEnquiryTimestamp={getEnquiryTimestamp}
          isPaymentConfirmed={isPaymentConfirmed}
          enquiries={enquiries}
          showPartyTasks={currentPhase === 'awaiting_responses'}
          currentPhase={currentPhase}
          partyTasksStatus={{
            einvites: { completed: false, count: 0, hasActivity: false },
            rsvps: { completed: false, count: 0, hasActivity: false },
            gifts: { completed: false, count: 0, hasActivity: false }
          }}
          handleCancelEnquiry={handleCancelEnquiry}
          onPaymentReady={onPaymentReady}
          activeSupplierType={activeSupplierType}
          onSupplierTabChange={onSupplierTabChange}
        />
      </div>
    </div>
  )
}