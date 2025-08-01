// components/SupplierGrid.jsx - Handles supplier display
import { useState } from 'react'
import SupplierCard from "./Cards/SupplierCard"
import AwaitingResponseSupplierCard from "../DatabaseDashboard/components/AwaitingRepsonseSupplierCard"
import MobileSingleScrollSuppliers from "./MobileSingleScrollSuppliers"
import { useSupplierManager } from '../hooks/useSupplierManager'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function SupplierGrid({
  suppliers,
  enquiries,
  addons,
  onRemoveAddon,
  hasEnquiriesPending,
  isPaymentConfirmed,
  onAddSupplier
}) {
  // Supplier management
  const removeSupplier = async (supplierType) => {
    const result = await partyDatabaseBackend.removeSupplierFromParty(partyId, supplierType)
    if (result.success) {
      // Handle success - you might want to pass this up to parent
      return { success: true }
    }
    return result
  }

  const {
    loadingCards,
    suppliersToDelete,
    openSupplierModal,
    handleDeleteSupplier,
    getSupplierDisplayName
  } = useSupplierManager(removeSupplier)

  // Get enquiry status functions from parent (you'll need to pass these down)
  const getEnquiryStatus = (type) => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.status || null
  }

  const getEnquiryTimestamp = (type) => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.created_at || null
  }

  return (
    <>
      {/* Header */}
      <div className="hidden md:flex justify-between mb-4">
        <div>
          {/* Title and description can go here */}
        </div>
        
        {/* Only show "Add Supplier" button when NOT in confirmation phase */}
        {!isPaymentConfirmed && !hasEnquiriesPending && (
          <button 
            onClick={onAddSupplier} 
            className="bg-primary-500 px-4 py-3 text-white hover:bg-[hsl(var(--primary-700))] rounded"
          >
            Add New Supplier
          </button>
        )}
      </div>

      {/* Desktop Supplier Grid */}
      <div className={`hidden md:grid gap-6 ${
        hasEnquiriesPending 
          ? 'md:grid-cols-2 md:h-[30%] lg:grid-cols-2 xl:grid-cols-3 max-w-4xl mx-auto' 
          : 'md:grid-cols-3'
      }`}>
        {Object.entries(suppliers).map(([type, supplier]) => (
          getEnquiryStatus(type) === 'pending' ? (
            <AwaitingResponseSupplierCard
              key={type}
              type={type}
              supplier={supplier}
              handleDeleteSupplier={handleDeleteSupplier}
              addons={addons}
              isDeleting={suppliersToDelete.includes(type)}
              enquirySentAt={getEnquiryTimestamp(type)}
            />
          ) : (
            <SupplierCard 
              key={type}
              type={type} 
              supplier={supplier}
              loadingCards={loadingCards}
              suppliersToDelete={suppliersToDelete}
              openSupplierModal={openSupplierModal}
              handleDeleteSupplier={handleDeleteSupplier}
              getSupplierDisplayName={getSupplierDisplayName}
              addons={addons}
              handleRemoveAddon={onRemoveAddon}
              enquiryStatus={getEnquiryStatus(type)}
              isSignedIn={true}
              isPaymentConfirmed={isPaymentConfirmed}
              enquiries={enquiries}
            />
          )
        ))}
      </div>

      {/* Mobile Supplier Tabs */}
      <div className="md:hidden">
        <MobileSingleScrollSuppliers
          suppliers={suppliers} 
          loadingCards={loadingCards}
          suppliersToDelete={suppliersToDelete}
          openSupplierModal={openSupplierModal}
          handleDeleteSupplier={handleDeleteSupplier}
          getSupplierDisplayName={getSupplierDisplayName}
          addons={addons}
          handleRemoveAddon={onRemoveAddon}
          getEnquiryStatus={getEnquiryStatus}
          isSignedIn={true}
          isPaymentConfirmed={isPaymentConfirmed}
          enquiries={enquiries}
          getEnquiryTimestamp={getEnquiryTimestamp} 
        />
      </div>
    </>
  )
}