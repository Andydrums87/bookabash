"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  CheckCircle,
  ChefHat,
  Truck,
  Cake,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronDown,
  X
} from "lucide-react"

const ORDER_STATUS = {
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered'
}

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.DISPATCHED]: 'Dispatched',
  [ORDER_STATUS.DELIVERED]: 'Delivered'
}

const COURIER_OPTIONS = [
  { value: '', label: 'Select courier' },
  { value: 'royal_mail', label: 'Royal Mail' },
  { value: 'dpd', label: 'DPD' },
  { value: 'evri', label: 'Evri (Hermes)' },
  { value: 'yodel', label: 'Yodel' },
  { value: 'ups', label: 'UPS' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'parcelforce', label: 'Parcelforce' },
  { value: 'amazon', label: 'Amazon Logistics' },
  { value: 'other', label: 'Other' },
]

// Inline Tracking Modal Component
function TrackingModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [trackingUrl, setTrackingUrl] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [courier, setCourier] = useState("")
  const [skipTracking, setSkipTracking] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const courierLabel = courier ? COURIER_OPTIONS.find(c => c.value === courier)?.label : null
    onSubmit({
      trackingUrl: skipTracking ? null : trackingUrl.trim() || null,
      trackingNumber: skipTracking ? null : trackingNumber.trim() || null,
      courier: skipTracking ? null : courier || null,
      courierLabel: skipTracking ? null : courierLabel
    })
  }

  const isValidUrl = (url) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const urlIsValid = isValidUrl(trackingUrl)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mark as dispatched</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Courier
            </label>
            <div className="relative">
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                disabled={skipTracking}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                {COURIER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tracking number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. IV804142085GB"
              disabled={skipTracking}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tracking URL
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              disabled={skipTracking}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 ${
                !urlIsValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {!urlIsValid && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid URL</p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipTracking}
              onChange={(e) => setSkipTracking(e.target.checked)}
              className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <span className="text-sm text-gray-600">
              No tracking (hand delivery / local delivery)
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!urlIsValid && !skipTracking)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Mark as dispatched'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function QuickStatusUpdatePage() {
  const params = useParams()
  const token = params.token

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (token) {
      fetchOrder()
    }
  }, [token])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/order-status/${token}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to load order')
        return
      }

      setOrder(data.order)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus, trackingUrl = null, courierCode = null, courierName = null, trackingNumber = null) => {
    try {
      setUpdating(true)
      setSuccessMessage(null)

      const response = await fetch(`/api/order-status/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingUrl,
          trackingNumber,
          courierCode,
          courierName
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to update status')
        return
      }

      setOrder(prev => ({
        ...prev,
        status: data.order.status,
        trackingUrl: data.order.trackingUrl,
        trackingNumber: data.order.trackingNumber,
        courierCode: data.order.courierCode,
        courierName: data.order.courierName,
        dispatchedAt: data.order.dispatchedAt,
        deliveredAt: data.order.deliveredAt
      }))

      setSuccessMessage(`Order marked as ${ORDER_STATUS_LABELS[newStatus]}`)
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDispatchWithTracking = ({ trackingUrl, trackingNumber, courier, courierLabel }) => {
    updateStatus(ORDER_STATUS.DISPATCHED, trackingUrl, courier, courierLabel, trackingNumber)
    setShowTrackingModal(false)
  }

  const getProgressStep = () => {
    switch (order?.status) {
      case ORDER_STATUS.CONFIRMED: return 1
      case ORDER_STATUS.PREPARING: return 2
      case ORDER_STATUS.DISPATCHED: return 3
      case ORDER_STATUS.DELIVERED: return 4
      default: return 0
    }
  }

  const getNextAction = () => {
    switch (order?.status) {
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

  const getStatusText = () => {
    if (!order?.party?.date) return ''
    const partyDate = new Date(order.party.date)
    const daysUntilEvent = Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24))

    if (daysUntilEvent < 0) return 'Completed'
    if (daysUntilEvent === 0) return 'Today'
    if (daysUntilEvent === 1) return 'Tomorrow'
    return `In ${daysUntilEvent} days`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const progressStep = getProgressStep()
  const nextAction = getNextAction()
  const partyDate = order?.party?.date ? new Date(order.party.date) : null
  const daysUntilEvent = partyDate ? Math.ceil((partyDate - new Date()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <Cake className="w-5 h-5 text-pink-500" />
            <span className="font-semibold text-gray-900">PartySnap</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && order && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Order Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5">
            {/* Status text */}
            <p className={`text-sm font-medium mb-1 ${daysUntilEvent < 0 ? 'text-gray-500' : 'text-green-600'}`}>
              {getStatusText()}
            </p>

            {/* Party info */}
            <p className="text-sm text-gray-500 mb-4">
              {order?.party?.childName}'s Party
            </p>

            {/* Cake name and date with image */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {order?.supplierName || 'Cake Order'}
                </h3>
                {partyDate && (
                  <p className="text-gray-600">
                    {partyDate.toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>

              {/* Cake icon */}
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                <Cake className="w-6 h-6 text-pink-500" />
              </div>
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
              {order?.status ? ORDER_STATUS_LABELS[order.status] : 'Order placed'}
            </p>
          </div>

          {/* Action buttons */}
          {order?.status !== ORDER_STATUS.DELIVERED && nextAction && (
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => {
                  if (nextAction.needsTracking) {
                    setShowTrackingModal(true)
                  } else {
                    updateStatus(nextAction.status)
                  }
                }}
                disabled={updating}
                className="flex-1 py-3.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {updating ? 'Updating...' : nextAction.label}
              </button>
            </div>
          )}

          {/* Completed state */}
          {order?.status === ORDER_STATUS.DELIVERED && (
            <div className="flex border-t border-gray-200">
              <div className="flex-1 py-3.5 text-center text-sm font-medium text-green-600">
                Complete
              </div>
            </div>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-medium text-gray-500">Order Details</h2>

          {/* Party Info */}
          {order?.party && (
            <div className="space-y-3">
              {partyDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">
                      {partyDate.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {order.party.time && (
                      <p className="text-sm text-gray-500">{order.party.time}</p>
                    )}
                  </div>
                </div>
              )}

              {(order.party.fullAddress || order.party.addressLine1 || order.party.location) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    {order.party.fullAddress ? (
                      <p className="text-gray-900 whitespace-pre-line">{order.party.fullAddress}</p>
                    ) : order.party.addressLine1 ? (
                      <>
                        <p className="text-gray-900">{order.party.addressLine1}</p>
                        {order.party.addressLine2 && (
                          <p className="text-gray-900">{order.party.addressLine2}</p>
                        )}
                        {order.party.deliveryPostcode && (
                          <p className="text-gray-900">{order.party.deliveryPostcode}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{order.party.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cake Details */}
          {order?.cakeDetails && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {order.cakeDetails.flavor && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Flavor</span>
                  <span className="text-gray-900 font-medium">{order.cakeDetails.flavor}</span>
                </div>
              )}
              {order.cakeDetails.dietary && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dietary</span>
                  <span className="text-gray-900 font-medium">{order.cakeDetails.dietary}</span>
                </div>
              )}
              {order.cakeDetails.fulfillment && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Fulfillment</span>
                  <span className="text-gray-900 font-medium capitalize">{order.cakeDetails.fulfillment}</span>
                </div>
              )}
              {order.cakeDetails.message && (
                <div className="pt-2">
                  <span className="text-gray-500 text-sm">Message on cake:</span>
                  <p className="text-gray-900 font-medium mt-1 p-2 bg-gray-50 rounded-lg">
                    "{order.cakeDetails.message}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          {order?.price && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Total</span>
                <span className="text-gray-900 font-semibold">£{parseFloat(order.price).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {order?.trackingUrl && (
            <div className="pt-3 border-t border-gray-100">
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-900 font-medium hover:underline"
              >
                <Truck className="w-4 h-4" />
                Track Shipment
              </a>
              {order.trackingNumber && (
                <p className="text-xs text-gray-500 mt-1">
                  {order.courierName ? `${order.courierName}: ` : ''}{order.trackingNumber}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Completed Banner */}
        {order?.status === ORDER_STATUS.DELIVERED && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-5 text-center">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-green-900 mb-1">Order Complete!</h2>
            <p className="text-sm text-green-700">This order has been delivered successfully.</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pt-4">
          Powered by PartySnap
        </p>
      </div>

      {/* Tracking Modal */}
      <TrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        onSubmit={handleDispatchWithTracking}
        isSubmitting={updating}
      />
    </div>
  )
}
