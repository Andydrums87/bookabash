// components/PartyJourney/SupplierJourneyStep.jsx - TWO ROW DESIGN
"use client"

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import SupplierCard from '../../../components/SupplierCard/SupplierCard'

export function SupplierJourneyStep({ 
  suppliers, 
  enquiries,
  onAddSupplier,
  onRemoveSupplier,
  onViewSupplierDetails,
  getSupplierDisplayName,
  loadingCards,
  allConfirmed,
  partyDetails,
  addons,
  handleRemoveAddon,
  isPaymentConfirmed,
  currentPhase,
  onPaymentReady,
  handleCancelEnquiry,
  getSupplierDisplayPricing,
  // ✅ NEW: Recommendations props
  getRecommendedSupplierForType,
  onAddRecommendedSupplier,
  recommendationsLoaded
}) {
  const [isExpanded, setIsExpanded] = useState(!allConfirmed)

  // All supplier types
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

  // Get supplier data with enquiry status
  const supplierData = allSupplierTypes.map(type => {
    const supplier = suppliers[type]
    const enquiry = enquiries.find(e => e.supplier_category === type)
    
    return {
      type,
      supplier,
      enquiryStatus: enquiry?.status || null,
      enquirySentAt: enquiry?.created_at || null,
      isLoading: loadingCards?.includes(type) || false
    }
  })

  // ✅ ONLY GET EXISTING SUPPLIERS
  const existingSuppliers = allSupplierTypes
    .map(type => {
      const supplier = suppliers[type]
      if (!supplier) return null
      
      const enquiry = enquiries.find(e => e.supplier_category === type)
      return {
        type,
        supplier,
        enquiryStatus: enquiry?.status || null,
        enquirySentAt: enquiry?.created_at || null,
        isLoading: loadingCards?.includes(type) || false
      }
    })
    .filter(Boolean)

  const confirmedCount = existingSuppliers.filter(s => 
    s.enquiryStatus === 'accepted'
  ).length
  const totalCount = existingSuppliers.length

  // Get addons for a specific supplier type
  const getSupplierAddons = (type, supplier) => {
    if (!supplier) return []
    return addons.filter(addon => 
      addon.supplierId === supplier.id || 
      addon.supplierType === type ||
      addon.attachedToSupplier === type
    )
  }

  // Get enhanced pricing for supplier
  const getEnhancedPricing = (type, supplier) => {
    if (!supplier || !getSupplierDisplayPricing) return null
    const supplierAddons = getSupplierAddons(type, supplier)
    return getSupplierDisplayPricing(supplier, partyDetails, supplierAddons)
  }

    // ✅ Don't render if no suppliers
    if (existingSuppliers.length === 0) {
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">No suppliers added yet</p>
          </div>
        )
      }

  return (
    <div className="mt-4">
    {/* Summary Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {allConfirmed ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-primary-600 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600">
              {confirmedCount}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {allConfirmed 
              ? '✨ All suppliers confirmed!' 
              : `${confirmedCount} of ${totalCount} suppliers confirmed`
            }
          </p>
        </div>
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>

    {/* Progress Bar */}
    {!allConfirmed && (
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(confirmedCount / totalCount) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {totalCount - confirmedCount} pending confirmation
        </p>
      </div>
    )}

    {/* Expandable Suppliers */}
    {isExpanded && (
      <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
        <div className="flex gap-6 pb-4">
          {existingSuppliers.map(({ type, supplier, enquiryStatus, enquirySentAt, isLoading }) => {
            const supplierAddons = getSupplierAddons(type, supplier)
            const enhancedPricing = getEnhancedPricing(type, supplier)

            return (
              <div key={type} className="flex-shrink-0 w-[320px]">
                <SupplierCard
                  type={type}
                  supplier={supplier}
                  loadingCards={loadingCards}
                  suppliersToDelete={[]}
                  openSupplierModal={onAddSupplier}
                  handleDeleteSupplier={onRemoveSupplier}
                  getSupplierDisplayName={getSupplierDisplayName}
                  addons={supplierAddons}
                  handleRemoveAddon={handleRemoveAddon}
                  enquiryStatus={enquiryStatus}
                  enquirySentAt={enquirySentAt}
                  isPaymentConfirmed={isPaymentConfirmed}
                  enquiries={enquiries}
                  partyId={partyDetails?.id}
                  isSignedIn={true}
                  currentPhase={currentPhase}
                  onPaymentReady={onPaymentReady}
                  handleCancelEnquiry={handleCancelEnquiry}
                  partyDetails={partyDetails}
                  enhancedPricing={enhancedPricing}
                />
              </div>
            )
          })}
        </div>
      </div>
    )}

    {/* Collapsed View */}
    {!isExpanded && (
      <div className="grid grid-cols-4 gap-2 mt-2">
        {existingSuppliers.slice(0, 4).map(({ type, supplier, enquiryStatus }) => (
          <div 
            key={type}
            className="bg-gray-50 rounded-lg p-2 text-center hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            {enquiryStatus === 'accepted' ? (
              <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-orange-500 mx-auto mb-1" />
            )}
            <div className="text-xs font-medium text-gray-900 truncate">
              {supplier.name}
            </div>
          </div>
        ))}
        {totalCount > 4 && (
          <div className="bg-gray-50 rounded-lg p-2 text-center flex items-center justify-center">
            <div className="text-xs font-medium text-gray-600">
              +{totalCount - 4}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
  )
}