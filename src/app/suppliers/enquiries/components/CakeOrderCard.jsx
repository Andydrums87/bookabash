"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  ChefHat,
  Truck,
  Cake,
} from "lucide-react"
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  supplierEnquiryBackend
} from "@/utils/supplierEnquiryBackend"
import TrackingUrlModal from "./TrackingUrlModal"
import CakeOrderDetailModal from "./CakeOrderDetailModal"

export default function CakeOrderCard({ enquiry, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [localOrderStatus, setLocalOrderStatus] = useState(enquiry.order_status)
  const [localTrackingUrl, setLocalTrackingUrl] = useState(enquiry.tracking_url)

  const party = enquiry.parties
  const supplier = enquiry.supplier

  // Cake name from supplier business name (each cake product is its own supplier record)
  const cakeName = supplier?.businessName || supplier?.business_name || 'Cake Order'

  // Cake image from supplier portfolio images
  const cakeImage = supplier?.portfolioImages?.[0]?.src || supplier?.portfolioImages?.[0] || null

  // Customer name for subtitle
  const customerName = party?.users?.first_name || enquiry.lead_name || party?.parent_name || 'Customer'
  const partyDate = new Date(party?.party_date)
  const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))

  // Status text like Airbnb
  const getStatusText = () => {
    if (daysUntilEvent < 0) return 'Completed'
    if (daysUntilEvent === 0) return 'Today'
    if (daysUntilEvent === 1) return 'Tomorrow'
    if (daysUntilEvent <= 7) return `In ${daysUntilEvent} days`
    return `In ${daysUntilEvent} days`
  }

  const handleStatusUpdate = async (newStatus, trackingUrl = null, courierCode = null, courierName = null) => {
    setIsUpdating(true)
    try {
      const result = await supplierEnquiryBackend.updateOrderStatus(
        enquiry.id,
        newStatus,
        trackingUrl,
        courierCode,
        courierName
      )

      if (result.success) {
        setLocalOrderStatus(newStatus)
        if (trackingUrl) {
          setLocalTrackingUrl(trackingUrl)
        }
        if (onStatusUpdate) {
          onStatusUpdate(enquiry.id, newStatus, trackingUrl)
        }
      } else {
        console.error('Failed to update status:', result.error)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDispatchWithTracking = ({ trackingUrl, courier, courierLabel }) => {
    handleStatusUpdate(ORDER_STATUS.DISPATCHED, trackingUrl, courier, courierLabel)
    setShowTrackingModal(false)
  }

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

  // Determine next action based on current status
  const getNextAction = () => {
    switch (localOrderStatus) {
      case null:
      case undefined:
        return { status: ORDER_STATUS.CONFIRMED, label: 'Confirm', icon: CheckCircle }
      case ORDER_STATUS.CONFIRMED:
        return { status: ORDER_STATUS.PREPARING, label: 'Preparing', icon: ChefHat }
      case ORDER_STATUS.PREPARING:
        return { status: ORDER_STATUS.DISPATCHED, label: 'Dispatch', icon: Truck, needsTracking: true }
      case ORDER_STATUS.DISPATCHED:
        return { status: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: CheckCircle }
      default:
        return null
    }
  }

  const nextAction = getNextAction()

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5">
          {/* Status text */}
          <p className={`text-sm font-medium mb-1 ${daysUntilEvent < 0 ? 'text-gray-500' : 'text-green-600'}`}>
            {getStatusText()}
          </p>

          {/* Customer and party info */}
          <p className="text-sm text-gray-500 mb-4">
            {customerName} · {party?.child_name}'s Party
          </p>

          {/* Cake name and date with image */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {cakeName}
              </h3>
              <p className="text-gray-600">
                {partyDate.toLocaleDateString('en-GB', {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Cake image */}
            {cakeImage ? (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={cakeImage}
                  alt={cakeName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                <Cake className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Minimal progress indicator */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full ${
                  step <= progressStep ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {localOrderStatus ? ORDER_STATUS_LABELS[localOrderStatus] : 'Order placed'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setShowDetailModal(true)}
            className="flex-1 py-3.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            View details
          </button>
          {nextAction && localOrderStatus !== ORDER_STATUS.DELIVERED ? (
            <button
              onClick={() => {
                if (nextAction.needsTracking) {
                  setShowTrackingModal(true)
                } else {
                  handleStatusUpdate(nextAction.status)
                }
              }}
              disabled={isUpdating}
              className="flex-1 py-3.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isUpdating ? 'Updating...' : nextAction.label}
            </button>
          ) : (
            <div className="flex-1 py-3.5 text-center text-sm font-medium text-green-600">
              Complete
            </div>
          )}
        </div>
      </div>

      {/* Tracking URL Modal */}
      <TrackingUrlModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        onSubmit={handleDispatchWithTracking}
        isSubmitting={isUpdating}
      />

      {/* Full Details Modal */}
      <CakeOrderDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        enquiry={enquiry}
        localOrderStatus={localOrderStatus}
        localTrackingUrl={localTrackingUrl}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={isUpdating}
        onOpenTrackingModal={() => {
          setShowDetailModal(false)
          setShowTrackingModal(true)
        }}
      />
    </>
  )
}
