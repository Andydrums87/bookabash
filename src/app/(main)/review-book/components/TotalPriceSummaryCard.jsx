// Updated TotalPriceSummaryCard with correct helper function usage
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calculator, DollarSign, TrendingUp, Info, Package } from "lucide-react"
import { calculateSupplierPrice, isLeadTimeSupplier } from '@/utils/supplierPricingHelpers'

export default function TotalPriceSummaryCard({ 
  selectedSuppliers = [], 
  selectedAddons = [], 
  suppliers = {},
  partyDetails = null
}) {
  // FIXED: Calculate supplier total using the helper function that handles party bags correctly
  const supplierTotal = selectedSuppliers.reduce((total, supplier) => {
    const { price } = calculateSupplierPrice(supplier, partyDetails)
    return total + price
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

  // FIXED: Calculate lead-time vs deposit breakdown using helper functions
  const leadTimeTotal = selectedSuppliers.reduce((total, supplier) => {
    if (isLeadTimeSupplier(supplier)) {
      const { price } = calculateSupplierPrice(supplier, partyDetails)
      return total + price
    }
    return total
  }, 0)

  const depositTotal = selectedSuppliers.reduce((total, supplier) => {
    if (!isLeadTimeSupplier(supplier)) {
      const { price } = calculateSupplierPrice(supplier, partyDetails)
      return total + Math.max(50, price * 0.2) // Deposit calculation
    }
    return total
  }, 0)

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
            <div className="text-3xl font-bold text-teal-600">£{grandTotal.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Grand Total</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          {/* Suppliers Section - FIXED to show correct pricing */}
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
              <span className="font-bold text-gray-900">£{supplierTotal.toFixed(2)}</span>
            </div>
            
            {supplierCount > 0 && (
              <div className="space-y-2">
                {selectedSuppliers.map((supplier) => {
                  const pricingInfo = calculateSupplierPrice(supplier, partyDetails)
                  const isLeadTime = isLeadTimeSupplier(supplier)
                  
                  return (
                    <div key={supplier.id} className="flex justify-between text-sm">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 truncate block">{supplier.name}</span>
                          {isLeadTime && (
                            <Package className="w-3 h-3 text-orange-500" title="Full payment required" />
                          )}
                        </div>
                        {pricingInfo.breakdown && (
                          <span className="text-xs text-gray-500">
                            {pricingInfo.breakdown}
                          </span>
                        )}
                        {isLeadTime && (
                          <span className="text-xs text-orange-600">
                            Full payment required upfront
                          </span>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">£{pricingInfo.price.toFixed(2)}</span>
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
                <span className="font-bold text-gray-900">£{totalAddons.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                {/* Standalone addons */}
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate pr-2">
                      {addon.name}
                      <span className="text-xs text-gray-400 ml-1">(standalone)</span>
                    </span>
                    <span className="text-gray-800 font-medium">£{(addon.price || 0).toFixed(2)}</span>
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
                      <span className="text-gray-800 font-medium">£{(addon.price || 0).toFixed(2)}</span>
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
                <div className="text-3xl font-black">£{grandTotal.toFixed(2)}</div>
                <p className="text-green-100 text-xs">
                  {supplierTotal > 0 && totalAddons > 0 
                    ? `£${supplierTotal.toFixed(2)} + £${totalAddons.toFixed(2)}`
                    : "All inclusive"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information - FIXED to use correct totals */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-2">Payment Information:</p>
                
                {/* Mixed payment types */}
                {leadTimeTotal > 0 && depositTotal > 0 && (
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between">
                      <span>Product suppliers (full payment):</span>
                      <span className="font-medium">£{leadTimeTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service deposits (remainder on day):</span>
                      <span className="font-medium">£{depositTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {/* Standard info */}
                <ul className="space-y-1">
                  {leadTimeTotal > 0 && (
                    <li>• Product suppliers (cakes, party bags) require full payment</li>
                  )}
                  {depositTotal > 0 && (
                    <li>• Service suppliers require deposits, remainder on party day</li>
                  )}
                  <li>• No booking fees from PartySnap</li>
                  <li>• All bookings guaranteed once payment complete</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}