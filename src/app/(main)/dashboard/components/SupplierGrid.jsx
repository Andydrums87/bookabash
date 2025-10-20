// components/SupplierGrid.jsx - Updated with unified pricing system
import { useState, useMemo } from 'react'
import SupplierCard from "./SupplierCard/SupplierCard"
import MobileSupplierNavigation from "./MobileSupplierNavigation"
import { useSupplierManager } from '../hooks/useSupplierManager'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { Card } from '@/components/ui/card'

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
  onSupplierTabChange,
  // NEW: Unified pricing props
  partyDetails,
  getSupplierDisplayPricing,
  getRecommendedSupplierForType,
  onAddRecommendedSupplier,
  recommendationsLoaded,
  loadingCards: externalLoadingCards = []
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
    'cakes',
    'decorations', 
    'facePainting', 
    'activities', 
    'partyBags', 
    'balloons', 
    'catering', 
  ]

  // Create complete supplier object with all types AND enhanced pricing (NEW)
  const completeSuppliers = useMemo(() => {
    return allSupplierTypes.reduce((acc, type) => {
      const supplier = suppliers[type] || null
      
      if (supplier) {
        // Get addons for this specific supplier
        const supplierAddons = addons.filter(addon => 
          addon.supplierId === supplier.id || 
          addon.supplierType === type ||
          addon.attachedToSupplier === type
        );

        // Calculate enhanced pricing if function is available
        let enhancedPricing = null
        if (getSupplierDisplayPricing && partyDetails) {
          try {
            enhancedPricing = getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
            console.log(`📊 SupplierGrid: Enhanced pricing for ${type}:`, enhancedPricing)
          } catch (error) {
            console.warn(`📊 SupplierGrid: Pricing calculation failed for ${type}:`, error)
          }
        }

        acc[type] = {
          ...supplier,
          supplierAddons, // Store filtered addons
          enhancedPricing  // Store calculated pricing
        }
      } else {
        acc[type] = null // null will show EmptySupplierCard
      }
      
      return acc
    }, {})
  }, [suppliers, addons, getSupplierDisplayPricing, partyDetails, allSupplierTypes])

  // Simple grid classes based on total number of supplier types
  const getGridClasses = () => {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  }

  return (
    <div className="w-full">
   {/* Desktop Grid - Show ALL supplier types with enhanced pricing */}
<div 
  key={`desktop-grid-${renderKey}`}  
  className={`hidden md:${getGridClasses()}`}
>
  {!recommendationsLoaded ? (
    // Show skeleton cards while recommendations load
    <>
      {allSupplierTypes.map((type, i) => (
        <Card key={type} className="overflow-hidden rounded-2xl border-2 border-white shadow-xl h-80">
          <div className="relative h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          <div className="p-6 bg-white">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </Card>
      ))}
    </>
  ) : (
    // Show actual supplier cards once loaded
    <>
      {allSupplierTypes.map((type) => {
        const supplierData = completeSuppliers[type]
        const supplier = supplierData || null
        const supplierAddons = supplierData?.supplierAddons || []
        const enhancedPricing = supplierData?.enhancedPricing || null

        return (
          <SupplierCard
            key={type}
            type={type}
            supplier={supplier}
            loadingCards={[...loadingCards, ...externalLoadingCards]}
            suppliersToDelete={suppliersToDelete}
            openSupplierModal={openSupplierModal}
            handleDeleteSupplier={handleDeleteSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            addons={supplierAddons}
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
            partyDetails={partyDetails}
            enhancedPricing={enhancedPricing}
            recommendedSupplier={getRecommendedSupplierForType ? getRecommendedSupplierForType(type) : null}
            onAddSupplier={onAddRecommendedSupplier}
          />
        )
      })}
    </>
  )}
</div>

      {/* Mobile Navigation + Cards - Show ALL supplier types with enhanced pricing */}
      <div className="md:hidden">
        <MobileSupplierNavigation
          suppliers={completeSuppliers} // Pass complete suppliers object with enhanced pricing
          loadingCards={loadingCards}
          partyDetails={partyDetails} // ✅ Pass partyDetails for mobile pricing
          getSupplierDisplayPricing={getSupplierDisplayPricing} // ✅ Pass pricing function
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
          totalCost={0} // You may want to pass the enhanced total cost here
        />
      </div>
    </div>
  )
}