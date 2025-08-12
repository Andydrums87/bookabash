"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
          amountPaid: isPaymentConfirmed ? totalPrice : 0,
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
    const totalSpent = totalCost
    const totalPaid = isPaymentConfirmed ? totalSpent : 0
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
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party summary...</p>
        </div>
      </div>
    )
  }

  const tableData = getTableData()
  const budgetData = getBudgetData()

  const summaryCards = [
    {
      title: "Total budget",
      amount: budgetData.total,
      bgColor: "bg-primary-500",
      textColor: "text-white",
      icon: "🎯",
    },
    {
      title: "Amount paid",
      amount: budgetData.amountPaid,
      bgColor: "bg-primary-100",
      textColor: "text-primary-800",
      icon: "💰",
    },
    {
      title: "Remaining to pay",
      amount: budgetData.remainingToPay,
      bgColor: "bg-primary-200",
      textColor: "text-primary-900",
      icon: "📊",
    },
    {
      title: "Remaining budget",
      amount: budgetData.remainingBudget,
      bgColor: "bg-primary-300",
      textColor: "text-primary-900",
      icon: "💳",
    },
  ]

  return (
    <div className="min-h-screen bg-primary-50">
      <ContextualBreadcrumb currentPage="party-summary" />

      <div className="bg-primary-50 px-10 py-6">
        <div className="flex items-center gap-3 ">
   
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900">Party Summary</h1>
       
          </div>
        </div>

  
      </div>

      {/* Main Content */}
      <div className="px-10 py-6">
        <div className="mb-6">
          {/* Mobile view - Card layout */}
          <div className="block md:hidden space-y-3">
            {tableData.map((service, index) => (
              <Card key={service.id || index} className="p-4">
                <div className="flex justify-between items-start ">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{service.serviceName}</h3>
                    <p className="text-xs text-gray-600 mt-1">{service.vendorName}</p>
                    <p className="text-xs text-gray-500">{service.category}</p>
                  </div>
                  <Badge
                    variant={service.status === "confirmed" ? "default" : "secondary"}
                    className={`
                      text-xs font-medium px-2 py-1 rounded-full ml-2
                      ${
                        service.status === "confirmed"
                          ? "text-white"
                          : service.status === "planned"
                            ? "bg-primary-100 text-primary-800 border-[hsl(var(--primary-200))]"
                            : "bg-primary-200 text-primary-900 border-[hsl(var(--primary-300))]"
                      }
                    `}
                    style={service.status === "confirmed" ? { backgroundColor: `hsl(${14} 100% 64%)` } : {}}
                  >
                    {service.status === "confirmed" && "✓"}
                    {service.status === "planned" && "📅"}
                    {service.status === "process" && "⚡"}
                    {service.status === "declined" && "❌"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-medium">£{service.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Paid</p>
                      <p className="font-medium text-green-600">£{service.amountPaid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className="font-medium text-orange-600">£{service.price - service.amountPaid}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2  border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1 h-7 flex-1 bg-transparent"
                    onClick={() => handleAction("edit", service)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1 h-7 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => handleAction("remove", service)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop view - Table layout */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Service name</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Vendor name</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Category</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Price</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Amount paid</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Remaining amount</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Status</TableHead>
                    <TableHead className="text-xs font-medium text-gray-600 px-4 py-3">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((service, index) => (
                    <TableRow key={service.id || index} className="border-b border-gray-100">
                      <TableCell className="px-4 py-4 font-medium text-sm text-gray-900">
                        {service.serviceName}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600">{service.vendorName}</TableCell>
                      <TableCell className="px-4 py-4 text-sm text-gray-600">{service.category}</TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-gray-900">£{service.price}</TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-gray-900">
                        £{service.amountPaid}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-medium text-gray-900">
                        £{service.price - service.amountPaid}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge
                          variant={service.status === "confirmed" ? "default" : "secondary"}
                          className={`
                            text-xs font-medium px-3 py-1 rounded-full
                            ${
                              service.status === "confirmed"
                                ? "text-white"
                                : service.status === "planned"
                                  ? "bg-primary-100 text-primary-800 border-[hsl(var(--primary-200))]"
                                  : "bg-primary-200 text-primary-900 border-[hsl(var(--primary-300))]"
                            }
                          `}
                          style={service.status === "confirmed" ? { backgroundColor: `hsl(${14} 100% 64%)` } : {}}
                        >
                          {service.status === "confirmed" && "✓ Confirmed"}
                          {service.status === "planned" && "📅 Planned"}
                          {service.status === "process" && "⚡ Process"}
                          {service.status === "declined" && "❌ Declined"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-3 py-1 h-7 bg-transparent"
                            onClick={() => handleAction("remove", service)}
                          >
                            Remove
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-3 py-1 h-7 text-primary-600 border-[hsl(var(--primary-300))] hover:bg-primary-50 bg-transparent"
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
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          {summaryCards.map((card, index) => (
            <Card key={index} className={`p-4 ${card.bgColor} ${card.textColor} border-0 relative overflow-hidden`}>
              <div className="relative z-10">
                <p className="text-xs font-medium opacity-90 mb-1">{card.title}</p>
                <p className="text-2xl font-bold">£{card.amount}</p>
              </div>
              {/* Decorative background pattern */}
              <div className="absolute bottom-0 right-0 opacity-20 text-4xl">{card.icon}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
