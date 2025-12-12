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
  onOpenTrackingModal,
}) {
  const party = enquiry?.parties
  const customer = party?.users

  // Parse cake customization info from addon_details
  const addonDetails = typeof enquiry?.addon_details === 'string'
    ? JSON.parse(enquiry?.addon_details || '{}')
    : enquiry?.addon_details || {}

  const cakeCustomization = addonDetails?.cakeCustomization || {}

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

  // Determine next action based on current status
  const getNextAction = () => {
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

  const nextAction = getNextAction()

  // Get progress step (0-4)
  const getProgressStep = () => {
    switch (localOrderStatus) {
      case ORDER_STATUS.CONFIRMED: return 1
      case ORDER_STATUS.PREPARING: return 2
      case ORDER_STATUS.DISPATCHED: return 3
      case ORDER_STATUS.DELIVERED: return 4
      default: return 0
    }
  }

  const progressStep = getProgressStep()

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
              <span>Dispatched</span>
              <span>Delivered</span>
            </div>
          </div>

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
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{party?.location}</span>
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
          {nextAction && localOrderStatus !== ORDER_STATUS.DELIVERED ? (
            <Button
              onClick={() => {
                if (nextAction.needsTracking) {
                  onOpenTrackingModal()
                } else {
                  onStatusUpdate(nextAction.status)
                }
              }}
              disabled={isUpdating}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isUpdating ? 'Updating...' : nextAction.label}
            </Button>
          ) : localOrderStatus === ORDER_STATUS.DELIVERED ? (
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
