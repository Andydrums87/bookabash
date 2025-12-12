"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  ExternalLink,
  Cake,
  Package,
} from "lucide-react"
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
} from "@/utils/supplierEnquiryBackend"

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
  const party = enquiry?.parties
  const customer = party?.users

  // Parse cake customization info from addon_details
  const addonDetails = typeof enquiry?.addon_details === 'string'
    ? JSON.parse(enquiry?.addon_details || '{}')
    : enquiry?.addon_details || {}

  const cakeCustomization = addonDetails?.cakeCustomization || {}

  // Calculate delivery date (Friday before weekend event)
  const getDeliveryDate = () => {
    if (!party?.party_date) return null
    const partyDate = new Date(party.party_date)
    const dayOfWeek = partyDate.getDay() // 0 = Sunday, 6 = Saturday
    let deliveryDate = new Date(partyDate)
    if (dayOfWeek === 0) {
      // Sunday - deliver Friday (2 days before)
      deliveryDate.setDate(partyDate.getDate() - 2)
    } else if (dayOfWeek === 6) {
      // Saturday - deliver Friday (1 day before)
      deliveryDate.setDate(partyDate.getDate() - 1)
    } else {
      // Weekday event - deliver day before
      deliveryDate.setDate(partyDate.getDate() - 1)
    }
    return deliveryDate
  }
  const deliveryDate = getDeliveryDate()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "Time TBD"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Determine next action based on current status and fulfillment method
  const getNextAction = () => {
    if (isPickupOrder) {
      // Pickup flow: Confirmed → Preparing → Ready for Collection → Collected
      switch (localOrderStatus) {
        case null:
        case undefined:
          return { status: ORDER_STATUS.CONFIRMED, label: 'Confirm Order', icon: CheckCircle }
        case ORDER_STATUS.CONFIRMED:
          return { status: ORDER_STATUS.PREPARING, label: 'Start Preparing', icon: ChefHat }
        case ORDER_STATUS.PREPARING:
          return { status: ORDER_STATUS.READY_FOR_COLLECTION, label: 'Mark Ready for Collection', icon: Package }
        case ORDER_STATUS.READY_FOR_COLLECTION:
          return { status: ORDER_STATUS.COLLECTED, label: 'Mark as Collected', icon: CheckCircle }
        default:
          return null
      }
    } else {
      // Delivery flow: Confirmed → Preparing → Dispatched → Delivered
      switch (localOrderStatus) {
        case null:
        case undefined:
          return { status: ORDER_STATUS.CONFIRMED, label: 'Confirm Order', icon: CheckCircle }
        case ORDER_STATUS.CONFIRMED:
          return { status: ORDER_STATUS.PREPARING, label: 'Start Preparing', icon: ChefHat }
        case ORDER_STATUS.PREPARING:
          return { status: ORDER_STATUS.DISPATCHED, label: 'Mark as Dispatched', icon: Truck, needsTracking: true }
        case ORDER_STATUS.DISPATCHED:
          return { status: ORDER_STATUS.DELIVERED, label: 'Mark as Delivered', icon: CheckCircle }
        default:
          return null
      }
    }
  }

  const nextAction = getNextAction()

  // Get progress step (0-4) - handles both delivery and pickup
  const getProgressStep = () => {
    if (isPickupOrder) {
      switch (localOrderStatus) {
        case ORDER_STATUS.CONFIRMED: return 1
        case ORDER_STATUS.PREPARING: return 2
        case ORDER_STATUS.READY_FOR_COLLECTION: return 3
        case ORDER_STATUS.COLLECTED: return 4
        default: return 0
      }
    } else {
      switch (localOrderStatus) {
        case ORDER_STATUS.CONFIRMED: return 1
        case ORDER_STATUS.PREPARING: return 2
        case ORDER_STATUS.DISPATCHED: return 3
        case ORDER_STATUS.DELIVERED: return 4
        default: return 0
      }
    }
  }

  const progressStep = getProgressStep()

  // Check if order is complete (handles both delivery and pickup)
  const isOrderComplete = localOrderStatus === ORDER_STATUS.DELIVERED || localOrderStatus === ORDER_STATUS.COLLECTED

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cake className="w-5 h-5" />
            Cake Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Progress indicator */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full ${
                    step <= progressStep ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Order</span>
              <span>Preparing</span>
              <span>{isPickupOrder ? 'Ready' : 'Dispatched'}</span>
              <span>{isPickupOrder ? 'Collected' : 'Delivered'}</span>
            </div>
          </div>

          {/* Delivery/Collection Date - Highlighted */}
          {deliveryDate && !isOrderComplete && (
            <div className="bg-primary-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                {isPickupOrder ? (
                  <Package className="w-4 h-4 text-primary-500" />
                ) : (
                  <Truck className="w-4 h-4 text-primary-500" />
                )}
                <div>
                  <p className="text-xs text-primary-600 font-medium">
                    {isPickupOrder ? 'Collection Required' : 'Delivery Required'}
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {deliveryDate.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  {isPickupOrder && cakeCustomization.pickupLocation && (
                    <p className="text-xs text-gray-600 mt-1">
                      Customer collecting from: {cakeCustomization.pickupLocation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Party Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Party Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(party?.party_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatTime(party?.party_time)}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  {party?.full_delivery_address ? (
                    <span className="whitespace-pre-line">{party.full_delivery_address}</span>
                  ) : party?.delivery_address_line_1 ? (
                    <>
                      <span>{party.delivery_address_line_1}</span>
                      {party.delivery_address_line_2 && (
                        <span className="block">{party.delivery_address_line_2}</span>
                      )}
                      <span className="block">{party.delivery_postcode || party.postcode}</span>
                    </>
                  ) : (
                    <span>{party?.location}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{party?.guest_count} guests</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Customer</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-900">{customer?.first_name} {customer?.last_name}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{customer?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer?.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          {/* Cake Order */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Order</h4>
              <span className="font-semibold text-gray-900">£{enquiry?.quoted_price}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              {cakeCustomization.size && (
                <p className="font-medium text-gray-900">
                  Size: {cakeCustomization.size}
                  {cakeCustomization.servings && ` (serves ${cakeCustomization.servings})`}
                  {cakeCustomization.tiers && ` - ${cakeCustomization.tiers} tier${cakeCustomization.tiers > 1 ? 's' : ''}`}
                </p>
              )}
              {cakeCustomization.flavorName && (
                <p>Flavour: {cakeCustomization.flavorName}</p>
              )}
              {cakeCustomization.dietaryName && cakeCustomization.dietaryName !== 'Standard' && (
                <p>Dietary: {cakeCustomization.dietaryName}</p>
              )}
              {cakeCustomization.fulfillmentMethod && (
                <p>
                  Fulfilment: {cakeCustomization.fulfillmentMethod === 'delivery'
                    ? `Delivery (+£${cakeCustomization.deliveryFee || 0})`
                    : 'Pickup'}
                </p>
              )}
              {cakeCustomization.customMessage && (
                <p className="italic">Message: "{cakeCustomization.customMessage}"</p>
              )}
            </div>
          </div>

          {/* Tracking URL if dispatched */}
          {localTrackingUrl && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Tracking</h4>
              <a
                href={localTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                View tracking <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Button */}
          {nextAction && !isOrderComplete ? (
            <Button
              onClick={() => {
                if (nextAction.needsTracking) {
                  onOpenTrackingModal()
                } else {
                  onStatusUpdate(nextAction.status)
                }
              }}
              disabled={isUpdating}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              {isUpdating ? 'Updating...' : nextAction.label}
            </Button>
          ) : isOrderComplete ? (
            <div className="text-center py-3 text-green-600 font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Order Complete
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
