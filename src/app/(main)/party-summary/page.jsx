"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePartyData } from "../dashboard/hooks/usePartyData"
import { usePartyPhase } from "../dashboard/hooks/usePartyPhase"
import { useRouter } from "next/navigation"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { ChevronDown, ChevronRight, Gift } from "lucide-react"
import { useState } from "react"

export default function PartyPlanSummary() {
  const router = useRouter()
  const [expandedRows, setExpandedRows] = useState(new Set())

  const {
    partyData,
    partyId,
    totalCost,
    addons,
    loading,
    user,
    suppliers,
    isSignedIn,
    partyDetails,
    handleDeleteSupplier: removeSupplier,
  } = usePartyData()

  const { enquiries, isPaymentConfirmed, currentPhase } = usePartyPhase(partyData, partyId)

  const toggleRowExpansion = (serviceId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId)
    } else {
      newExpanded.add(serviceId)
    }
    setExpandedRows(newExpanded)
  }

  const getTableData = () => {
    if (!suppliers) return []
  
    const supplierTypes = [
      "venue",
      "entertainment", 
      "catering",
      "facePainting",
      "activities",
      "partyBags",
      "decorations",
      "balloons",
      "cakes"
    ]
  
    return supplierTypes
      .filter((type) => suppliers[type]) // Only include suppliers that exist
      .map((type) => {
        const supplier = suppliers[type]
        const enquiry = enquiries.find((e) => e.supplier_category === type)
        
        // ✅ ENHANCED: Get addons from multiple sources including enquiry data
        let supplierAddons = []
        
        // Method 1: Get from enquiry addon_details (primary source for database)
        if (enquiry?.addon_details) {
          try {
            const enquiryAddons = JSON.parse(enquiry.addon_details)
            supplierAddons = Array.isArray(enquiryAddons) ? enquiryAddons : []
          } catch (error) {
            console.error(`Error parsing addon_details for ${type}:`, error)
          }
        }
        
        // Method 2: Fallback to global addons array
        if (supplierAddons.length === 0) {
          supplierAddons = addons.filter((addon) => 
            addon.supplierId === supplier?.id || 
            addon.supplierType === type ||
            addon.attachedToSupplier === type
          )
        }
        
        // Method 3: Fallback to supplier's selectedAddons (localStorage)
        if (supplierAddons.length === 0 && supplier?.selectedAddons) {
          supplierAddons = supplier.selectedAddons
        }

        const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
        const totalPrice = (supplier.price || 0) + addonsCost
  
        // ✅ FIX: Check both enquiry status AND payment status
        const isAccepted = enquiry?.status === "accepted"
        const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true
        
        // Only show as paid if BOTH accepted AND actually paid
        const amountPaid = (isAccepted && isPaid) ? totalPrice : 0
  
        return {
          id: supplier.id || `${type}-${Date.now()}`,
          type,
          serviceName: supplier.name,
          vendorName: supplier.originalSupplier?.owner?.name || supplier.owner?.name || "N/A",
          category: type.charAt(0).toUpperCase() + type.slice(1),
          price: totalPrice,
          basePrice: supplier.price || 0,
          addonsPrice: addonsCost,
          addons: supplierAddons, // ✅ Now includes enquiry addons
          amountPaid: amountPaid,
          status: getSupplierStatus(enquiry?.status, isPaid),
          enquiryId: enquiry?.id,
          enquiryStatus: enquiry?.status,
          paymentStatus: enquiry?.payment_status || enquiry?.is_paid,
          supplier: supplier,
        }
      })
  }

  const getSupplierStatus = (enquiryStatus, isPaid) => {
    switch (enquiryStatus) {
      case "accepted":
        return isPaid ? "paid" : "confirmed"
      case "pending":
        return "process"
      case "declined":
        return "declined"
      default:
        return "planned"
    }
  }

  const getBudgetData = () => {
    const totalPaid = tableData.reduce((sum, service) => sum + service.amountPaid, 0)
    const totalSpent = totalCost
    const remainingToPay = totalSpent - totalPaid

    const userBudget = partyDetails?.budget || 1000
    const remainingBudget = userBudget - totalSpent

    return {
      total: userBudget,
      amountPaid: totalPaid,
      remainingToPay: remainingToPay,
      remainingBudget: Math.max(0, remainingBudget),
      totalSpent: totalSpent,
    }
  }

  const handleAction = async (action, supplierData) => {
    if (action === "remove") {
      const confirmed = window.confirm(`Remove ${supplierData.serviceName} from your party?`)
      if (confirmed) {
        await removeSupplier(supplierData.type)
      }
    } else if (action === "edit") {
      console.log("Edit supplier:", supplierData)
    }
  }

  const handleSendBookingRequest = () => {
    router.push("/payment")
  }

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--primary-50))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[hsl(var(--primary-500))] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party summary...</p>
        </div>
      </div>
    )
  }

  const tableData = getTableData()
  const budgetData = getBudgetData()

  return (
    <div className="min-h-screen bg-[hsl(var(--primary-50))] px-2">
      <ContextualBreadcrumb currentPage="party-summary" />

      <div className="bg-[hsl(var(--primary-50))] px-3 pt-8 pb-5">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Party Summary</h1>
      </div>

      <div className="px-3 md:px-6 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[120px]">
                    Service name
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[80px]">
                    Status
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[100px]">
                    Vendor name
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[80px]">
                    Category
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[70px]">
                    Price
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[80px]">
                    Amount paid
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[90px]">
                    Remaining amount
                  </TableHead>
                  <TableHead className="text-xs md:text-sm font-medium text-gray-700 px-3 md:px-8 py-3 md:py-6 min-w-[100px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((service, index) => (
                  <>
                    <TableRow
                      key={service.id || index}
                      className="border-b border-gray-100 hover:bg-[hsl(var(--primary-50))] transition-colors"
                    >
                      <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                          {service.addons && service.addons.length > 0 && (
                            <button
                              onClick={() => toggleRowExpansion(service.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {expandedRows.has(service.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <span>{service.serviceName}</span>
                          {service.addons && service.addons.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Gift className="w-3 h-3 text-[hsl(var(--primary-500))]" />
                              <span className="text-xs text-[hsl(var(--primary-500))] font-medium">
                                +{service.addons.length}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6">
                        <Badge
                          className={`
                            text-xs font-medium px-2 md:px-3 py-1 rounded-full
                            ${
                              service.status === "paid"
                                ? "bg-teal-500 text-white hover:bg-teal-600"
                                : service.status === "confirmed"
                                  ? "bg-[hsl(var(--primary-500))] text-white hover:bg-[hsl(var(--primary-600))]"
                                  : service.status === "process"
                                    ? "bg-[hsl(var(--primary-200))] text-[hsl(var(--primary-800))] hover:bg-[hsl(var(--primary-300))]"
                                    : service.status === "declined"
                                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }
                          `}
                        >
                          {service.status === "paid" && "Paid"}
                          {service.status === "confirmed" && "Confirmed"}
                          {service.status === "planned" && "Planned"}
                          {service.status === "process" && "Pending"}
                          {service.status === "declined" && "Declined"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6 text-gray-600 text-xs md:text-sm">
                        {service.vendorName}
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6 text-gray-600 text-xs md:text-sm">
                        {service.category}
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
                        <div>
                          <div>£{service.price}</div>
                          {service.addons && service.addons.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Base: £{service.basePrice} + Add-ons: £{service.addonsPrice}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
                        £{service.amountPaid}
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
                        £{service.price - service.amountPaid}
                      </TableCell>
                      <TableCell className="px-3 md:px-8 py-3 md:py-6">
                        <div className="flex gap-1 md:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 md:px-3 py-1 h-7 md:h-8 border-gray-300 hover:bg-gray-50 bg-transparent"
                            onClick={() => handleAction("remove", service)}
                          >
                            Remove
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 md:px-3 py-1 h-7 md:h-8 text-[hsl(var(--primary-600))] border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] bg-transparent"
                            onClick={() => handleAction("edit", service)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* ✅ ADDON DETAILS EXPANSION ROW */}
                    {expandedRows.has(service.id) && service.addons && service.addons.length > 0 && (
                      <TableRow className="bg-[hsl(var(--primary-25))] border-b border-gray-100">
                        <TableCell colSpan={8} className="px-3 md:px-8 py-4">
                          <div className="ml-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <Gift className="w-4 h-4 text-[hsl(var(--primary-500))]" />
                              Add-ons for {service.serviceName}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {service.addons.map((addon, addonIndex) => (
                                <div
                                  key={addon.id || addonIndex}
                                  className="bg-white border border-gray-200 rounded-lg p-3"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {addon.name}
                                    </h5>
                                    <span className="text-sm font-bold text-[hsl(var(--primary-600))]">
                                      £{addon.price || 0}
                                    </span>
                                  </div>
                                  {addon.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {addon.description}
                                    </p>
                                  )}
                                  {addon.quantity && addon.quantity > 1 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Quantity: {addon.quantity}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <div className="bg-[hsl(var(--primary-500))] rounded-lg p-4 md:p-8 text-white">
            <h3 className="text-xs md:text-sm font-medium text-white/80 mb-2 md:mb-3">Total Cost</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.totalSpent}</p>
          </div>

          <div className="bg-[hsl(var(--primary-400))] rounded-lg p-4 md:p-8 text-white">
            <h3 className="text-xs md:text-sm font-medium text-white/80 mb-2 md:mb-3">Amount Paid</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.amountPaid}</p>
          </div>

          <div className="bg-[hsl(var(--primary-300))] rounded-lg p-4 md:p-8 text-[hsl(var(--primary-900))]">
            <h3 className="text-xs md:text-sm font-medium text-[hsl(var(--primary-800))] mb-2 md:mb-3">Remaining</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.remainingToPay}</p>
          </div>

          <div className="bg-[hsl(var(--primary-200))] rounded-lg p-4 md:p-8 text-[hsl(var(--primary-900))]">
            <h3 className="text-xs md:text-sm font-medium text-[hsl(var(--primary-800))] mb-2 md:mb-3">Budget Left</h3>
            <p className="text-2xl md:text-4xl font-bold">£{budgetData.remainingBudget}</p>
          </div>
        </div>
      </div>
    </div>
  )
}