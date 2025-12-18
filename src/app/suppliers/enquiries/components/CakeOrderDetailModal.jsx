"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  ChefHat,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ORDER_STATUS,
} from "@/utils/supplierEnquiryBackend"

// Steps for delivery orders
const DELIVERY_STEPS = [
  { status: ORDER_STATUS.CONFIRMED, label: 'Confirmed', description: 'Order accepted', icon: CheckCircle },
  { status: ORDER_STATUS.PREPARING, label: 'Preparing', description: 'Making the cake', icon: ChefHat },
  { status: ORDER_STATUS.DISPATCHED, label: 'Dispatched', description: 'On the way', icon: Truck, needsTracking: true },
  { status: ORDER_STATUS.DELIVERED, label: 'Delivered', description: 'Customer received', icon: Package },
]

// Steps for pickup orders
const PICKUP_STEPS = [
  { status: ORDER_STATUS.CONFIRMED, label: 'Confirmed', description: 'Order accepted', icon: CheckCircle },
  { status: ORDER_STATUS.PREPARING, label: 'Preparing', description: 'Making the cake', icon: ChefHat },
  { status: ORDER_STATUS.READY_FOR_COLLECTION, label: 'Ready', description: 'Ready for collection', icon: Package },
  { status: ORDER_STATUS.COLLECTED, label: 'Collected', description: 'Customer picked up', icon: CheckCircle },
]

export default function CakeOrderDetailModal({
  isOpen,
  onClose,
  enquiry,
  localOrderStatus,
  localTrackingUrl,
  onStatusUpdate,
  isUpdating,
  isPickupOrder,
  onOpenTrackingModal,
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [pendingStep, setPendingStep] = useState(null) // Step awaiting confirmation
  const [invoice, setInvoice] = useState(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  const party = enquiry?.parties
  const customer = party?.users

  // Parse cake customization info
  const addonDetails = typeof enquiry?.addon_details === 'string'
    ? JSON.parse(enquiry?.addon_details || '{}')
    : enquiry?.addon_details || {}
  const cakeCustomization = addonDetails?.cakeCustomization || {}

  // Calculate delivery date
  const getDeliveryDate = () => {
    if (!party?.party_date) return null
    const partyDate = new Date(party.party_date)
    const dayOfWeek = partyDate.getDay()
    let deliveryDate = new Date(partyDate)
    if (dayOfWeek === 0) {
      deliveryDate.setDate(partyDate.getDate() - 2)
    } else if (dayOfWeek === 6) {
      deliveryDate.setDate(partyDate.getDate() - 1)
    } else {
      deliveryDate.setDate(partyDate.getDate() - 1)
    }
    return deliveryDate
  }
  const deliveryDate = getDeliveryDate()

  const STEPS = isPickupOrder ? PICKUP_STEPS : DELIVERY_STEPS

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!localOrderStatus) return -1
    return STEPS.findIndex(s => s.status === localOrderStatus)
  }
  const currentStepIndex = getCurrentStepIndex()

  const isComplete = localOrderStatus === ORDER_STATUS.DELIVERED || localOrderStatus === ORDER_STATUS.COLLECTED

  // Fetch invoice when modal opens for completed orders
  useEffect(() => {
    if (isOpen && isComplete && enquiry?.id) {
      setInvoiceLoading(true)
      fetch(`/api/invoices?enquiry_id=${enquiry.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.invoices && data.invoices.length > 0) {
            setInvoice(data.invoices[0])
          }
        })
        .catch(err => console.error('Error fetching invoice:', err))
        .finally(() => setInvoiceLoading(false))
    }
  }, [isOpen, isComplete, enquiry?.id])

  const handleStepClick = (step, index) => {
    const isCompleted = index <= currentStepIndex
    const isNext = index === currentStepIndex + 1

    if (isCompleted || !isNext || isUpdating) return

    // For dispatch, go straight to tracking modal (no extra confirmation needed)
    if (step.needsTracking) {
      onOpenTrackingModal()
      return
    }

    // Show confirmation dialog for other steps
    setPendingStep(step)
  }

  const handleConfirmStep = () => {
    if (!pendingStep) return
    onStatusUpdate(pendingStep.status)
    setPendingStep(null)
  }

  const handleCancelStep = () => {
    setPendingStep(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100 text-sm">{party?.child_name}'s Party</p>
              <h2 className="text-xl font-bold mt-1">
                {cakeCustomization.productName || enquiry?.suppliers?.name || 'Cake Order'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Date */}
          {deliveryDate && (
            <div className="mt-4 bg-white/20 rounded-xl px-4 py-3">
              <p className="text-primary-100 text-xs uppercase tracking-wide">
                {isPickupOrder ? 'Collection by' : 'Deliver by'}
              </p>
              <p className="font-semibold text-lg">
                {deliveryDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Order Summary - Always visible */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">
                {cakeCustomization.size || 'Cake'}
                {cakeCustomization.flavorName && ` · ${cakeCustomization.flavorName}`}
              </p>
              <p className="text-sm text-gray-500">
                {cakeCustomization.fulfillmentMethod === 'delivery' ? 'Delivery' : 'Collection'}
              </p>
            </div>
            <p className="text-xl font-bold text-gray-900">£{enquiry?.quoted_price}</p>
          </div>

          {/* Expandable Details */}
          <div className="border-b border-gray-100 pb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <span className="text-sm font-medium text-gray-700">View full details</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showDetails && (
              <div className="space-y-4 pt-3 text-sm">
                {/* Customer */}
                <div>
                  <p className="font-medium text-gray-900 mb-2">Customer</p>
                  <p className="text-gray-600">{customer?.first_name} {customer?.last_name}</p>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{customer?.email}</span>
                  </div>
                  {customer?.phone && (
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{customer?.phone}</span>
                    </div>
                  )}
                </div>

                {/* Party */}
                <div>
                  <p className="font-medium text-gray-900 mb-2">Party</p>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(party?.party_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{party?.party_time || 'TBC'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{party?.guest_count} guests</span>
                    </div>
                  </div>
                  {party?.delivery_address_line_1 && (
                    <div className="flex items-start gap-2 text-gray-600 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                      <span>{party?.delivery_address_line_1}, {party?.delivery_postcode}</span>
                    </div>
                  )}
                </div>

                {/* Cake Details */}
                <div>
                  <p className="font-medium text-gray-900 mb-2">Cake Details</p>
                  <div className="space-y-1 text-gray-600">
                    {cakeCustomization.size && <p><span className="font-medium">Size:</span> {cakeCustomization.size}</p>}
                    {cakeCustomization.servings && <p><span className="font-medium">Serves:</span> {cakeCustomization.servings}</p>}
                    {cakeCustomization.tiers && <p><span className="font-medium">Tiers:</span> {cakeCustomization.tiers}</p>}
                    {cakeCustomization.flavorName && <p><span className="font-medium">Flavour:</span> {cakeCustomization.flavorName}</p>}
                    {cakeCustomization.dietaryName && cakeCustomization.dietaryName !== 'Standard' && (
                      <p><span className="font-medium">Dietary:</span> {cakeCustomization.dietaryName}</p>
                    )}
                    {cakeCustomization.customMessage && (
                      <p><span className="font-medium">Message:</span> <span className="italic">"{cakeCustomization.customMessage}"</span></p>
                    )}
                    {/* Fallback if no customization data */}
                    {!cakeCustomization.size && !cakeCustomization.flavorName && !cakeCustomization.servings && (
                      <p className="text-gray-400 italic">No cake details available - customer may need to update their booking</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step Cards */}
          {isComplete ? (
            <div className="space-y-4">
              {/* Completion badge */}
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Order Complete</p>
                <p className="text-sm text-gray-500">
                  {isPickupOrder ? 'Cake collected' : 'Cake delivered'}
                </p>
              </div>

              {/* Invoice section */}
              {invoiceLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : invoice ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Invoice</span>
                    <span className="text-sm text-gray-500">{invoice.invoice_number}</span>
                  </div>

                  {/* Amount breakdown */}
                  <div className="space-y-1.5 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking amount</span>
                      <span className="text-gray-900">£{parseFloat(invoice.gross_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform fee (15%)</span>
                      <span className="text-gray-500">-£{parseFloat(invoice.platform_fee).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-1.5 mt-1.5">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Your earnings</span>
                        <span className="font-bold text-green-600">£{parseFloat(invoice.net_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      invoice.status === 'approved' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      invoice.status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>

                  {/* PDF Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = `/api/invoices/${invoice.id}/pdf`
                        link.download = `${invoice.invoice_number}.pdf`
                        link.click()
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Invoice not yet generated
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center mb-3">
                Tap the next step when complete
              </p>

              {STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isNext = index === currentStepIndex + 1
                const isFuture = index > currentStepIndex + 1
                const StepIcon = step.icon

                return (
                  <button
                    key={step.status}
                    onClick={() => handleStepClick(step, index)}
                    disabled={isCompleted || isFuture || isUpdating}
                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                      isCompleted
                        ? 'bg-green-50 cursor-default'
                        : isNext
                          ? 'bg-white hover:shadow-md cursor-pointer'
                          : 'bg-gray-50 cursor-not-allowed opacity-50'
                    }`}
                    style={{
                      borderColor: isCompleted
                        ? 'hsl(142, 76%, 80%)'
                        : isNext
                          ? 'hsl(24, 100%, 70%)'
                          : 'hsl(220, 13%, 90%)'
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isNext
                          ? 'bg-primary-500'
                          : 'bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : isUpdating && isNext ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <StepIcon className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          isCompleted ? 'text-green-700'
                          : isNext ? 'text-gray-900'
                          : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                            Done
                          </span>
                        )}
                        {isNext && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                            Next
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${
                        isCompleted ? 'text-green-600'
                        : isNext ? 'text-gray-500'
                        : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {isNext && !isUpdating && (
                      <span className="text-xs font-medium text-primary-500">Tap</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Confirmation Dialog */}
          {pendingStep && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm: {pendingStep.label}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {pendingStep.status === ORDER_STATUS.CONFIRMED && "Are you sure you want to confirm this order?"}
                  {pendingStep.status === ORDER_STATUS.PREPARING && "Mark this order as now being prepared?"}
                  {pendingStep.status === ORDER_STATUS.DELIVERED && "Confirm the cake has been delivered?"}
                  {pendingStep.status === ORDER_STATUS.READY_FOR_COLLECTION && "Mark this cake as ready for collection?"}
                  {pendingStep.status === ORDER_STATUS.COLLECTED && "Confirm the customer has collected the cake?"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelStep}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStep}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
