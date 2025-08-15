"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePartyData } from "../dashboard/hooks/usePartyData"
import { usePartyPhase } from "../dashboard/hooks/usePartyPhase"
import { useRouter } from "next/navigation"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

export default function PartyPlanSummary() {
  const router = useRouter()

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
    ]

    return supplierTypes
      .filter((type) => suppliers[type]) // Only include suppliers that exist
      .map((type) => {
        const supplier = suppliers[type]
        const enquiry = enquiries.find((e) => e.supplier_category === type)
        const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
        const addonsCost = supplierAddons.reduce((sum, addon) => sum + addon.price, 0)
        const totalPrice = supplier.price + addonsCost

        // ✅ OPTION 2: Show paid only when enquiry is accepted (confirmed)
        const amountPaid = enquiry?.status === "accepted" ? totalPrice : 0

        return {
          id: supplier.id,
          type,
          serviceName: supplier.name,
          vendorName: supplier.originalSupplier?.owner?.name || supplier.owner?.name || "N/A",
          category: type.charAt(0).toUpperCase() + type.slice(1),
          price: totalPrice,
          basePrice: supplier.price,
          addonsPrice: addonsCost,
          addons: supplierAddons,
          amountPaid: amountPaid, // ✅ Now only shows paid when enquiry is accepted
          status: getSupplierStatus(enquiry?.status),
          enquiryId: enquiry?.id,
          enquiryStatus: enquiry?.status,
          supplier: supplier,
        }
      })
  }

  const getSupplierStatus = (enquiryStatus) => {
    switch (enquiryStatus) {
      case "accepted":
        return "confirmed"
      case "pending":
        return "process"
      case "declined":
        return "declined"
      default:
        return "planned"
    }
  }

  const getBudgetData = () => {
    // ✅ Calculate total paid based on actual confirmed suppliers
    const totalPaid = tableData.reduce((sum, service) => sum + service.amountPaid, 0)
    const totalSpent = totalCost
    const remainingToPay = totalSpent - totalPaid

    const userBudget = partyDetails?.budget || 1000
    const remainingBudget = userBudget - totalSpent

    return {
      total: userBudget,
      amountPaid: totalPaid, // ✅ Now correctly reflects only confirmed suppliers
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
                  <TableRow
                    key={service.id || index}
                    className="border-b border-gray-100 hover:bg-[hsl(var(--primary-50))] transition-colors"
                  >
                    <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
                      {service.serviceName}
                    </TableCell>
                    <TableCell className="px-3 md:px-8 py-3 md:py-6">
                      <Badge
                        className={`
                          text-xs font-medium px-2 md:px-3 py-1 rounded-full
                          ${
                            service.status === "confirmed"
                              ? "bg-[hsl(var(--primary-500))] text-white hover:bg-[hsl(var(--primary-600))]"
                              : service.status === "process"
                                ? "bg-[hsl(var(--primary-200))] text-[hsl(var(--primary-800))] hover:bg-[hsl(var(--primary-300))]"
                                : service.status === "declined"
                                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }
                        `}
                      >
                        {service.status === "confirmed" && "✓ Confirmed"}
                        {service.status === "planned" && "📅 Planned"}
                        {service.status === "process" && "Process"}
                        {service.status === "declined" && "✗ Declined"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 md:px-8 py-3 md:py-6 text-gray-600 text-xs md:text-sm">
                      {service.vendorName}
                    </TableCell>
                    <TableCell className="px-3 md:px-8 py-3 md:py-6 text-gray-600 text-xs md:text-sm">
                      {service.category}
                    </TableCell>
                    <TableCell className="px-3 md:px-8 py-3 md:py-6 font-medium text-gray-900 text-xs md:text-sm">
                      £{service.price}
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
