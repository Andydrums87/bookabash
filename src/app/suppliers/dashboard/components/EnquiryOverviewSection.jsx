"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Loader2, AlertTriangle, Info, Gift } from "lucide-react"
import Link from "next/link"
import { useSupplierEnquiries } from "@/utils/supplierEnquiryBackend"
import { useSupplier } from "@/hooks/useSupplier"
import { useRobustEnquiryData } from "@/utils/enquiryDataProcessor"

export default function EnquiryOverviewSection() {
  // Use the same pattern as portfolio page - useSupplier hook

  const parseAddonDetails = (addonDetailsString) => {
    if (!addonDetailsString) return []
    
    try {
      const parsed = typeof addonDetailsString === 'string' 
        ? JSON.parse(addonDetailsString) 
        : addonDetailsString
      
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing addon details:', error)
      return []
    }
  }
  const { supplier, supplierData, loading, error, currentBusiness } = useSupplier()


  
  // Force re-render when business changes
  const [forceRefresh, setForceRefresh] = useState(0)
  
  // Same pattern as portfolio page - reset state when business changes
  useEffect(() => {
    if (currentBusiness?.id && !loading) {
      console.log('🔄 Enquiry overview updating for business:', currentBusiness?.name);
      
      // Reset any form-specific state here (like portfolio page)
      setForceRefresh(prev => prev + 1);
    }
  }, [currentBusiness?.id, loading])
  
  // Use current business ID from useSupplier (like portfolio page)
  const businessIdToUse = currentBusiness?.id || supplier?.id
  const businessNameToUse = currentBusiness?.name || supplier?.business_name || 'Unknown'
  
  // Use the existing hook with current business ID
  const { enquiries, loading: enquiriesLoading, error: enquiriesError } = useSupplierEnquiries(null, businessIdToUse, forceRefresh)
  // ✅ ADD: Debug the raw enquiries from the hook

  const { leads, errors, summary } = useRobustEnquiryData(enquiries)



  if (loading || enquiriesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading enquiries...</p>
        </div>
      </div>
    )
  }

  if (error || enquiriesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-500" />
            Enquiry overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Error loading enquiries</p>
            <p className="text-sm text-gray-500 mt-1">{error || enquiriesError}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show business context info
  if (!businessIdToUse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-500" />
            Enquiry overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-yellow-600 font-medium">No business selected</p>
            <p className="text-sm text-gray-500 mt-1">Please select a business to view enquiries</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {/* Business Context Header - Same as portfolio page */}
      {currentBusiness && (
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Viewing Enquiries:</strong> {currentBusiness.name} • {currentBusiness.serviceType} • {currentBusiness.theme}
            {currentBusiness.isPrimary && <span className="ml-2 text-blue-600 font-medium">• Primary Business</span>}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              Enquiry overview
            </CardTitle>
            
            {/* Business Context Indicator */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {businessNameToUse}
              </Badge>
              
              {/* Data Quality Indicator */}
              {summary.total > 0 && (
                <div className="flex items-center gap-2">
                  {errors.length > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {errors.length} data issues
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Info className="w-3 h-3 mr-1" />
                    {summary.valid}/{summary.total} valid
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/20 border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Service & Add-ons</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Lead name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Action</th>
                  </tr>
                </thead>
         
<tbody>
  {leads.map((lead) => {

    // ✅ NEW: Check if this is an auto-accepted deposit-paid enquiry
    const isAutoAccepted = lead.auto_accepted || false
    const isDepositPaid = isAutoAccepted && lead.status === 'accepted'
    
    return (
      <tr 
        key={lead.id} 
        className={`border-b border-gray-100 hover:bg-gray-50 ${
          isDepositPaid ? 'bg-red-50 border-red-200' : ''
        }`}
      >
        <td className="p-4 font-medium">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {/* ✅ NEW: Show urgent indicator */}
              {isDepositPaid && (
                <span className="text-red-600 font-bold">🚨</span>
              )}
              {lead.service}
              {!lead.processed && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" title="Data quality issue" />
              )}
            </div>
            
            {/* ✅ NEW: Show deposit paid indicator */}
            {isDepositPaid && (
              <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded font-medium">
                🚨 DEPOSIT PAID - URGENT RESPONSE NEEDED
              </div>
            )}
            
            {/* Show package name if available */}
            {lead.package_id && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                📦 Package: {lead.package_name || lead.package_id}
              </div>
            )}
            
            {/* Existing addon logic */}
            {(() => {
              const addons = parseAddonDetails(lead.addon_details)
              return addons.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">
                      {addons.length} Add-on{addons.length !== 1 ? 's' : ''}:
                    </span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    {addons.slice(0, 2).map((addon, index) => (
                      <div key={addon.id || index} className="text-xs text-gray-600">
                        • {addon.name} (£{addon.price})
                        {addon.description && (
                          <span className="text-gray-400 ml-1">- {addon.description}</span>
                        )}
                      </div>
                    ))}
                    {addons.length > 2 && (
                      <div className="text-xs text-gray-500">
                        ... and {addons.length - 2} more
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-amber-600 font-medium">
                    Total: £{addons.reduce((sum, addon) => sum + (addon.price || 0), 0)}
                  </div>
                </div>
              )
            })()}
          </div>
        </td>
        <td className="p-4 text-muted-foreground">{lead.lead}</td>
        <td className="p-4 text-muted-foreground">{lead.date}</td>
        <td className="p-4">
          {/* ✅ NEW: Special status for deposit paid */}
          {isDepositPaid ? (
            <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
              <span className="mr-1">🚨</span>
              URGENT
            </Badge>
          ) : (
            <Badge
              variant={lead.status === "Replied" ? "default" : "secondary"}
              className={`${
                lead.status === "Replied"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-orange-50 text-orange-600 border-orange-100"
              }`}
            >
              {lead.status}
            </Badge>
          )}
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            {/* ✅ NEW: Different buttons for urgent enquiries */}
            {isDepositPaid ? (
              <Link href={`/suppliers/enquiries/${lead.id}`}>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
                >
                  🚨 RESPOND NOW
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Link href={`/suppliers/enquiries/${lead.id}`}>
                  <Button
                    size="sm"
                    className="bg-primary-500 hover:bg-[hsl(var(--primary-700))] rounded-full text-xs text-white"
                  >
                    View enquiry
                  </Button>
                </Link>
              </>
            )}
          </div>
        </td>
      </tr>
    )
  })}
</tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          // In EnquiryOverviewSection.jsx - UPDATE the mobile card view
<div className="lg:hidden">
  <div className="divide-y divide-gray-100">
    {leads.map((lead) => {
      // ✅ NEW: Check if this is an auto-accepted deposit-paid enquiry
      const isAutoAccepted = lead.auto_accepted || false
      const isDepositPaid = isAutoAccepted && lead.status === 'accepted'
      
      return (
        <div 
          key={lead.id} 
          className={`p-4 space-y-3 ${
            isDepositPaid ? 'bg-red-50 border-l-4 border-red-500' : ''
          }`}
        >
          {/* ✅ NEW: Urgent header for deposit paid */}
          {isDepositPaid && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-2 mb-3">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                <span className="animate-pulse">🚨</span>
                DEPOSIT PAID - URGENT RESPONSE NEEDED
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="space-y-1">
              <div className="space-y-1">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  {isDepositPaid && (
                    <span className="text-red-600 font-bold">🚨</span>
                  )}
                  {lead.service}
                  {!lead.processed && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" title="Data quality issue" />
                  )}
                </h3>
                {lead.addon_details && JSON.parse(lead.addon_details || '[]').length > 0 && (
                  <div className="flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">
                      +{JSON.parse(lead.addon_details).length} add-on{JSON.parse(lead.addon_details).length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                      (£{JSON.parse(lead.addon_details).reduce((sum, addon) => sum + (addon.price || 0), 0)})
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{lead.lead}</p>
              <p className="text-xs text-muted-foreground">{lead.date}</p>
            </div>
            
            {/* ✅ NEW: Special status badge for mobile */}
            {isDepositPaid ? (
              <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse w-fit">
                <span className="mr-1">🚨</span>
                URGENT
              </Badge>
            ) : (
              <Badge
                variant={lead.status === "Replied" ? "default" : "secondary"}
                className={`w-fit ${
                  lead.status === "Replied"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-orange-50 text-orange-600 border-orange-100"
                }`}
              >
                {lead.status}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* ✅ NEW: Different mobile buttons for urgent */}
            {isDepositPaid ? (
              <Link href={`/suppliers/enquiries/${lead.id}`} className="w-full">
                <Button
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white animate-pulse"
                >
                  🚨 RESPOND NOW
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Link href={`/suppliers/enquiries/${lead.id}`} className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-primary-500 hover:bg-[hsl(var(--primary-700))] rounded-full text-xs text-white"
                  >
                    View enquiry
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )
    })}
  </div>
</div>

          {/* Empty State */}
          {leads.length === 0 && summary.total === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No enquiries yet</h3>
              <p className="text-sm sm:text-base text-gray-500">
                New booking requests for <strong>{businessNameToUse}</strong> will appear here
              </p>
            </div>
          )}

          {/* All Data Invalid State */}
          {leads.length === 0 && summary.total > 0 && (
            <div className="p-8 sm:p-12 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Data Processing Issues</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                Found {summary.total} enquiries but unable to process them due to data quality issues
              </p>
            </div>
          )}

          {/* Data Quality Summary */}
          {summary.total > 0 && errors.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 w-4" />
                <span className="text-sm font-medium">Data Quality Report</span>
              </div>
              <div className="mt-2 text-xs text-yellow-700">
                <p>• {summary.valid} enquiries processed successfully</p>
                <p>• {errors.length} enquiries with data issues (shown with ⚠️)</p>
                <p>• Common issues: missing names, invalid dates, malformed data</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}