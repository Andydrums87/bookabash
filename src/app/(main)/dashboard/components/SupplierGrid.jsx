// components/SupplierGrid.jsx - FIXED to properly handle confirmed suppliers
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
  handleCancelEnquiry
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

 // In your SupplierGrid.jsx - update the getAllSupplierSlots function

const getAllSupplierSlots = () => {

  const allSlots = {
    venue: suppliers.venue || null,
    entertainment: suppliers.entertainment || null,
    catering: suppliers.catering || null,
    facePainting: suppliers.facePainting || null,
    activities: suppliers.activities || null,
    partyBags: suppliers.partyBags || null,
    decorations: suppliers.decorations || null,
    cakes: suppliers.cakes || null,
    balloons: suppliers.balloons || null,
  }
 

  
  // Helper function to sort suppliers (filled first, empty last)
  const sortSuppliers = (filteredSlots) => {
    const entries = Object.entries(filteredSlots)
    
    // Separate filled and empty slots
    const filledSlots = entries.filter(([type, supplier]) => supplier !== null)
    const emptySlots = entries.filter(([type, supplier]) => supplier === null)
    
    // Return filled slots first, then empty slots
    return Object.fromEntries([...filledSlots, ...emptySlots])
  }
  
  // Filter based on current phase
  switch (currentPhase) {
    case 'awaiting_responses':
      // Show everything - suppliers with enquiries, without enquiries, and empty slots
      const sortedAwaiting = sortSuppliers(allSlots)
      console.log('📋 Awaiting responses - showing all slots (sorted):', Object.keys(sortedAwaiting))
      return sortedAwaiting
    case 'confirmed':
      // Only show confirmed suppliers (no empty slots)
      const activeSuppliers = Object.fromEntries(
        Object.entries(allSlots).filter(([type, supplier]) => {
          if (!supplier) return false
          
          const enquiry = enquiries.find(e => e.supplier_category === type)
          const hasActiveEnquiry = enquiry && ['pending', 'accepted'].includes(enquiry.status)
          
          console.log(`  ${type}: supplier=${!!supplier}, enquiry=${enquiry?.status}, isPaymentConfirmed=${isPaymentConfirmed}`)
          
          // Show if: has active enquiry OR payment is confirmed (all suppliers visible after payment)
          return hasActiveEnquiry || isPaymentConfirmed
        })
      )
      console.log('✅ Confirmed - showing:', Object.keys(activeSuppliers))
      return activeSuppliers

    case 'planning':
    default:
      // ✅ NEW: Sort planning phase too (filled first, empty last)
      const sortedPlanning = sortSuppliers(allSlots)

      return sortedPlanning
  }
}
  const visibleSuppliers = getAllSupplierSlots()

  // ✅ ENHANCED: Better phase detection based on actual supplier states
  const getActualPhase = () => {
    // Check if we have any pending enquiries
    const hasPending = enquiries.some(e => e.status === 'pending')
    
    // Check if we have any confirmed suppliers
    const hasConfirmed = enquiries.some(e => e.status === 'accepted')
    
    // Check if payment is completed
    if (isPaymentConfirmed) {
      return 'payment_confirmed'
    }
    
    // If we have confirmed suppliers but still have pending, we're in a mixed state
    if (hasConfirmed && hasPending) {
      return 'mixed' // Both confirmed and pending
    }
    
    // If we have confirmed suppliers and no pending, we're ready for payment
    if (hasConfirmed && !hasPending) {
      return 'ready_for_payment'
    }
    
    // If we have pending enquiries
    if (hasPending) {
      return 'awaiting_responses'
    }
    
    // Default to planning
    return 'planning'
  }

  const actualPhase = getActualPhase()


  const getGridClasses = () => {
    const supplierCount = Object.keys(visibleSuppliers).length
    
    if (supplierCount === 1) {
      return 'grid grid-cols-1 md:grid-cols-2 gap-6'
    }
    
    // Your existing grid logic for multiple cards
    if (supplierCount === 2) {
      return 'grid grid-cols-1 md:grid-cols-2 gap-6'
    }
    
    if (supplierCount === 3) {
      return 'grid grid-cols-1 md:grid-cols-3 gap-6'
    }
    
    // Default for 4+ cards
    return 'grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6'
  }

  // ✅ ENHANCED: Better header text based on actual state
  const getHeaderText = () => {
    const pendingCount = enquiries.filter(e => e.status === 'pending').length
    const confirmedCount = enquiries.filter(e => e.status === 'accepted').length
    
    if (isPaymentConfirmed) {
      return {
        title: 'Your Confirmed Party Team',
        subtitle: 'All suppliers are booked and ready for your party!'
      }
    }
    
    if (confirmedCount > 0 && pendingCount === 0) {
      return {
        title: 'Ready for Payment!',
        subtitle: `${confirmedCount} supplier${confirmedCount > 1 ? 's' : ''} confirmed and waiting for payment`
      }
    }
    
    if (confirmedCount > 0 && pendingCount > 0) {
      return {
        title: 'Party Team Building',
        subtitle: `${confirmedCount} confirmed, ${pendingCount} pending responses`
      }
    }
    
    if (pendingCount > 0) {
      return {
        title: 'Awaiting Supplier Responses',
        subtitle: `Waiting for ${pendingCount} supplier${pendingCount > 1 ? 's' : ''} to respond`
      }
    }
    
    return {
      title: 'Build Your Party Team',
      subtitle: 'Choose the perfect suppliers for your celebration'
    }
  }

  const headerText = getHeaderText()

  return (
    <div className="w-full">
      {/* Header - only show on desktop */}


      {/* Desktop Grid */}
      <div key={`desktop-grid-${renderKey}`}  className={`hidden md:grid ${getGridClasses().replace('grid ', '')}`}>
        {Object.entries(visibleSuppliers).map(([type, supplier]) => {
          // ✅ ENHANCED: Better debugging for each card
          const enquiry = enquiries.find(e => e.supplier_category === type)
          // console.log(`🎴 Rendering card for ${type}:`, {
          //   hasSupplier: !!supplier,
          //   supplierName: supplier?.name,
          //   enquiryStatus: enquiry?.status,
          //   enquiryId: enquiry?.id,
          //   cardState: supplier ? 
          //     (isPaymentConfirmed ? 'payment_confirmed' : 
          //      (enquiry?.status === 'accepted' ? 'confirmed' : 
          //       (enquiry?.status === 'pending' ? 'awaiting_response' : 'selected'))) 
          //     : 'empty'
          // })

          return (
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
              enquirySentAt={getEnquiryTimestamp(type)}
              isPaymentConfirmed={isPaymentConfirmed}
              enquiries={enquiries}
              partyId={partyId}
              isSignedIn={isSignedIn}
              currentPhase={currentPhase}
              onPaymentReady={onPaymentReady}
              handleCancelEnquiry={handleCancelEnquiry}   // For enquiry cancellation
            />
          )
        })}
      </div>

      {/* Mobile Navigation + Cards */}
      <div className="md:hidden">
        <MobileSupplierNavigation
          suppliers={visibleSuppliers}
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
        />
      </div>

      {/* Empty state for when no suppliers are visible */}
      {Object.keys(visibleSuppliers).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎪</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {headerText.title}
          </h3>
          <p className="text-gray-500 mb-6">
            {currentPhase === 'awaiting_responses' && 'All your enquiries have been responded to'}
            {currentPhase === 'confirmed' && 'Your supplier list is empty'}
            {currentPhase === 'planning' && 'Start building your perfect party team'}
          </p>
          
          {currentPhase === 'planning' && (
            <button 
              onClick={onAddSupplier}
              className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] px-6 py-3 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              Add Your First Supplier
            </button>
          )}
        </div>
      )}

    </div>
  )
}