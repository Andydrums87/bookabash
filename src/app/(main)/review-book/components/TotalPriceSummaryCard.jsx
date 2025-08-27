// 1. Updated TotalPriceSummaryCard with party bag calculation
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calculator, DollarSign, TrendingUp, Info } from "lucide-react"

export default function TotalPriceSummaryCard({ 
  selectedSuppliers = [], 
  selectedAddons = [], 
  suppliers = {},
  partyDetails = null // ADD: Need partyDetails for guest count
}) {
  // Helper function to calculate supplier price including party bags
  const calculateSupplierPrice = (supplier) => {
    if (!supplier) return 0
    
    // Check if this is a party bag supplier
    if (supplier.category === 'Party Bags' || supplier.type === 'partyBags') {
      const pricePerBag = supplier.packageData?.basePrice || supplier.pricePerBag || supplier.price || 5.00
      
      let guestCount = 10; // Default fallback
      
      // Try to get guest count from partyDetails
      if (partyDetails?.guestCount && partyDetails.guestCount > 0) {
        guestCount = parseInt(partyDetails.guestCount)
      }
      // Fallback: try localStorage
      else if (typeof window !== 'undefined') {
        try {
          const storedPartyDetails = localStorage.getItem('party_details')
          if (storedPartyDetails) {
            const parsed = JSON.parse(storedPartyDetails)
            if (parsed.guestCount && parsed.guestCount > 0) {
              guestCount = parseInt(parsed.guestCount)
            }
          }
        } catch (error) {
          console.warn('Could not get guest count from localStorage:', error)
        }
      }
      
      return pricePerBag * guestCount
    }
    
    // For non-party bag suppliers, return regular price
    return supplier.price || 0
  }

  // Calculate supplier total using the enhanced function
  const supplierTotal = selectedSuppliers.reduce((total, supplier) => {
    return total + calculateSupplierPrice(supplier)
  }, 0)

  // Calculate standalone addons total
  const standaloneAddonsTotal = selectedAddons.reduce((total, addon) => {
    return total + (addon.price || 0)
  }, 0)

  // Calculate supplier package addons total - EXCLUDE einvites
  const supplierAddonsTotal = Object.entries(suppliers).reduce((total, [supplierType, supplier]) => {
    // Skip einvites if it somehow still exists
    if (supplierType === 'einvites') {
      return total
    }
    
    if (supplier?.selectedAddons && supplier.selectedAddons.length > 0) {
      return total + supplier.selectedAddons.reduce((subTotal, addon) => {
        return subTotal + (addon.price || 0)
      }, 0)
    }
    return total
  }, 0)

  // Calculate totals
  const totalAddons = standaloneAddonsTotal + supplierAddonsTotal
  const grandTotal = supplierTotal + totalAddons

  // Count items for display
  const supplierCount = selectedSuppliers.length
  const standaloneAddonCount = selectedAddons.length
  const supplierAddonCount = Object.values(suppliers).reduce((count, supplier) => {
    return count + (supplier?.selectedAddons?.length || 0)
  }, 0)
  const totalAddonCount = standaloneAddonCount + supplierAddonCount

  return (
    <Card className="border-2 border-teal-200 shadow-lg bg-gradient-to-br from-teal-50 to-teal-50 ">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Total Price Summary</h2>
              <p className="text-gray-600 text-sm">
                Complete cost breakdown for your party
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-600">£{grandTotal}</div>
            <p className="text-xs text-gray-500">Grand Total</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          {/* Suppliers Section */}
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700">
                  Suppliers ({supplierCount})
                </span>
              </div>
              <span className="font-bold text-gray-900">£{supplierTotal}</span>
            </div>
            
            {supplierCount > 0 && (
              <div className="space-y-2">
                {selectedSuppliers.map((supplier) => {
                  const calculatedPrice = calculateSupplierPrice(supplier)
                  const isPartyBag = supplier.category === 'Party Bags' || supplier.type === 'partyBags'
                  
                  return (
                    <div key={supplier.id} className="flex justify-between text-sm">
                      <div className="flex-1 pr-2">
                        <span className="text-gray-600 truncate block">{supplier.name}</span>
                        {isPartyBag && (
                          <span className="text-xs text-gray-500">
                            Party bags calculated for guests
                          </span>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">£{calculatedPrice}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add-ons Section */}
          {totalAddonCount > 0 && (
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    Add-ons & Extras ({totalAddonCount})
                  </span>
                </div>
                <span className="font-bold text-gray-900">£{totalAddons}</span>
              </div>

              <div className="space-y-2">
                {/* Standalone addons */}
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate pr-2">
                      {addon.name}
                      <span className="text-xs text-gray-400 ml-1">(standalone)</span>
                    </span>
                    <span className="text-gray-800 font-medium">£{addon.price || 0}</span>
                  </div>
                ))}

                {/* Supplier package addons */}
                {Object.entries(suppliers).map(([supplierType, supplier]) => {
                  if (!supplier?.selectedAddons || supplier.selectedAddons.length === 0) return null
                  
                  return supplier.selectedAddons.map((addon) => (
                    <div key={`${supplier.id}-${addon.id}`} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2">
                        {addon.name}
                        <span className="text-xs text-blue-500 ml-1">
                          (with {supplier.name})
                        </span>
                      </span>
                      <span className="text-gray-800 font-medium">£{addon.price || 0}</span>
                    </div>
                  ))
                })}
              </div>
            </div>
          )}

          {/* Total Section */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Total Party Cost</h3>
                <p className="text-green-100 text-sm">
                  {supplierCount} supplier{supplierCount !== 1 ? 's' : ''}
                  {totalAddonCount > 0 && ` + ${totalAddonCount} add-on${totalAddonCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">£{grandTotal}</div>
                <p className="text-green-100 text-xs">
                  {supplierTotal > 0 && totalAddons > 0 
                    ? `£${supplierTotal} + £${totalAddons}`
                    : "All inclusive"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Payment Information:</p>
                <ul className="space-y-1">
                  <li>• Suppliers will quote you directly</li>
                  <li>• Compare prices before booking</li>
                  <li>• No booking fees from PartySnap</li>
                  <li>• Pay suppliers directly when ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 2. Updated SelectedSuppliersCard with party bag calculation
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle } from "lucide-react"
import Image from "next/image"

// Helper function to get category-specific gradients
const getSupplierGradient = (category) => {
  const gradients = {
    'Entertainment': 'bg-gradient-to-br from-purple-400 to-pink-400',
    'Venue': 'bg-gradient-to-br from-blue-400 to-indigo-400', 
    'Catering': 'bg-gradient-to-br from-orange-400 to-red-400',
    'Decorations': 'bg-gradient-to-br from-green-400 to-emerald-400',
    'FacePainting': 'bg-gradient-to-br from-pink-400 to-rose-400',
    'Activities': 'bg-gradient-to-br from-cyan-400 to-blue-400',
    'PartyBags': 'bg-gradient-to-br from-yellow-400 to-orange-400',
    'Cakes' : 'bg-gradient-to-br from-purple-200 to-purple-400',
    'Balloons': 'bg-gradient-to-br from-teal-400 to-cyan-400',
  }
  return gradients[category] || 'bg-gradient-to-br from-gray-400 to-slate-400'
}

export default function SelectedSuppliersCard({ 
  selectedSuppliers = [],
  partyDetails = null // ADD: Need partyDetails for guest count
}) {
  // Helper function to calculate supplier price including party bags
  const calculateSupplierPrice = (supplier) => {
    if (!supplier) return 0
    
    // Check if this is a party bag supplier
    if (supplier.category === 'Party Bags' || supplier.type === 'partyBags') {
      const pricePerBag = supplier.packageData?.basePrice || supplier.pricePerBag || supplier.price || 5.00
      
      let guestCount = 10; // Default fallback
      
      // Try to get guest count from partyDetails
      if (partyDetails?.guestCount && partyDetails.guestCount > 0) {
        guestCount = parseInt(partyDetails.guestCount)
      }
      // Fallback: try localStorage
      else if (typeof window !== 'undefined') {
        try {
          const storedPartyDetails = localStorage.getItem('party_details')
          if (storedPartyDetails) {
            const parsed = JSON.parse(storedPartyDetails)
            if (parsed.guestCount && parsed.guestCount > 0) {
              guestCount = parseInt(parsed.guestCount)
            }
          }
        } catch (error) {
          console.warn('Could not get guest count from localStorage:', error)
        }
      }
      
      return {
        price: pricePerBag * guestCount,
        breakdown: `${guestCount} bags × £${pricePerBag.toFixed(2)}`,
        isPartyBag: true
      }
    }
    
    // For non-party bag suppliers, return regular price
    return {
      price: supplier.price || 0,
      breakdown: null,
      isPartyBag: false
    }
  }

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Selected Suppliers</h2>
              <p className="text-gray-600 text-sm">
                {selectedSuppliers.length} suppliers will receive your enquiry
              </p>
            </div>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {selectedSuppliers.length}
          </div>
        </div>

        {/* Content */}
        {selectedSuppliers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No suppliers selected yet</p>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
              className="border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: Mini supplier cards */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4">
              {selectedSuppliers.map((supplier) => {
                const pricingInfo = calculateSupplierPrice(supplier)
                
                return (
                  <div
                    key={supplier.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Image/Header Section */}
                    <div className="relative h-24 w-full overflow-hidden">
                      {supplier.image ? (
                        <Image
                          src={supplier.image}
                          alt={supplier.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={`w-full h-full ${getSupplierGradient(supplier.category)}`} />
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                      
                      {/* Category badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm">
                          {supplier.category}
                        </div>
                      </div>

                      {/* Checkmark */}
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      {/* Supplier name and price */}
                      <div className="absolute bottom-2 left-2 right-2 z-10">
                        <h3 className="font-bold text-white text-sm drop-shadow-sm truncate">
                          {supplier.name}
                        </h3>
                        <div>
                          <p className="text-white/90 text-xs font-semibold drop-shadow-sm">
                            £{pricingInfo.price}
                          </p>
                          {pricingInfo.breakdown && (
                            <p className="text-white/80 text-xs drop-shadow-sm">
                              {pricingInfo.breakdown}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer Section */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {supplier.icon}
                          </div>
                          <span className="text-xs text-gray-600">Selected</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">£{pricingInfo.price}</div>
                          <div className="text-xs font-semibold text-green-600">
                            ✓ Ready to send
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile: Compact cards */}
            <div className="sm:hidden">
              <div className="grid grid-cols-2 gap-3">
                {selectedSuppliers.map((supplier) => {
                  const pricingInfo = calculateSupplierPrice(supplier)
                  
                  return (
                    <div
                      key={supplier.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Mobile header */}
                      <div className="relative h-16 w-full overflow-hidden">
                        {supplier.image ? (
                          <Image
                            src={supplier.image}
                            alt={supplier.name}
                            fill
                            className="object-cover"
                            sizes="50vw"
                          />
                        ) : (
                          <div className={`w-full h-full ${getSupplierGradient(supplier.category)}`} />
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
                        
                        {/* Checkmark */}
                        <div className="absolute top-1 right-1 z-10">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        {/* Name and price */}
                        <div className="absolute bottom-1 left-1 right-1 z-10">
                          <h3 className="font-semibold text-white text-xs drop-shadow-sm truncate">
                            {supplier.name}
                          </h3>
                          <p className="text-white/90 text-xs font-medium drop-shadow-sm">
                            £{pricingInfo.price}
                          </p>
                        </div>
                      </div>
                      
                      {/* Mobile footer */}
                      <div className="p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              {supplier.icon}
                            </div>
                            <span className="text-xs text-gray-600 truncate">{supplier.category}</span>
                          </div>
                          <div className="text-xs font-semibold text-green-600">✓</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Summary for many suppliers */}
              {selectedSuppliers.length > 4 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      All {selectedSuppliers.length} suppliers ready to receive your enquiry
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}