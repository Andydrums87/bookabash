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
  Clock,
  AlertCircle,
  Loader2,
  Link2,
  ExternalLink,
  PartyPopper,
  ChevronDown
} from "lucide-react"

const COURIER_OPTIONS = [
  { value: '', label: 'Select courier (optional)' },
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

export default function QuickStatusUpdatePage() {
  const params = useParams()
  const token = params.token

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [showTrackingInput, setShowTrackingInput] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState("")
  const [courier, setCourier] = useState("")
  const [skipTracking, setSkipTracking] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  // Fetch order on mount
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

  const updateStatus = async (newStatus, trackingUrlValue = null, courierCode = null, courierName = null) => {
    try {
      setUpdating(true)
      setSuccessMessage(null)

      const response = await fetch(`/api/order-status/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingUrl: trackingUrlValue,
          courierCode,
          courierName
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to update status')
        return
      }

      // Update local state
      setOrder(prev => ({
        ...prev,
        status: data.order.status,
        trackingUrl: data.order.trackingUrl,
        courierCode: data.order.courierCode,
        courierName: data.order.courierName,
        dispatchedAt: data.order.dispatchedAt,
        deliveredAt: data.order.deliveredAt
      }))

      setSuccessMessage(`Order marked as ${ORDER_STATUS_LABELS[newStatus]}`)
      setShowTrackingInput(false)
      setTrackingUrl("")
      setCourier("")
      setSkipTracking(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDispatch = () => {
    const courierLabel = courier ? COURIER_OPTIONS.find(c => c.value === courier)?.label : null
    if (skipTracking) {
      updateStatus(ORDER_STATUS.DISPATCHED, null, null, null)
    } else {
      updateStatus(
        ORDER_STATUS.DISPATCHED,
        trackingUrl.trim() || null,
        courier || null,
        courierLabel
      )
    }
  }

  // Progress bar step calculation
  const getProgressStep = () => {
    switch (order?.status) {
      case ORDER_STATUS.CONFIRMED: return 1
      case ORDER_STATUS.PREPARING: return 2
      case ORDER_STATUS.DISPATCHED: return 3
      case ORDER_STATUS.DELIVERED: return 4
      default: return 0
    }
  }

  // Get next action
  const getNextAction = () => {
    switch (order?.status) {
      case null:
      case undefined:
        return { status: ORDER_STATUS.CONFIRMED, label: 'Confirm Order', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-700' }
      case ORDER_STATUS.CONFIRMED:
        return { status: ORDER_STATUS.PREPARING, label: 'Start Preparing', icon: ChefHat, color: 'bg-amber-600 hover:bg-amber-700' }
      case ORDER_STATUS.PREPARING:
        return { status: ORDER_STATUS.DISPATCHED, label: 'Mark as Dispatched', icon: Truck, color: 'bg-purple-600 hover:bg-purple-700', needsTracking: true }
      case ORDER_STATUS.DISPATCHED:
        return { status: ORDER_STATUS.DELIVERED, label: 'Mark as Delivered', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' }
      default:
        return null
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <Cake className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Order Update</h1>
              <p className="text-sm text-gray-500">{order?.supplierName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
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

        {/* Progress Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Order Progress</h2>

          {/* Progress Bar */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= progressStep ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Status Labels */}
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span className={progressStep >= 1 ? 'text-gray-900 font-medium' : ''}>Confirmed</span>
            <span className={progressStep >= 2 ? 'text-gray-900 font-medium' : ''}>Preparing</span>
            <span className={progressStep >= 3 ? 'text-gray-900 font-medium' : ''}>Dispatched</span>
            <span className={progressStep >= 4 ? 'text-gray-900 font-medium' : ''}>Delivered</span>
          </div>

          {/* Current Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            {progressStep === 4 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {order?.status ? ORDER_STATUS_LABELS[order.status] : 'Awaiting Confirmation'}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-medium text-gray-500">Order Details</h2>

          {/* Party Info */}
          {order?.party && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <PartyPopper className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{order.party.childName}'s Party</p>
                </div>
              </div>

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

              {order.party.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p className="text-gray-900">{order.party.location}</p>
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

          {/* Tracking URL (if dispatched) */}
          {order?.trackingUrl && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link2 className="w-4 h-4" />
                Tracking Link
              </div>
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                View Tracking <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Action Section */}
        {nextAction && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Next Step</h2>

            {/* Tracking URL Input (for dispatch) */}
            {showTrackingInput ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <Link2 className="w-4 h-4 inline mr-2 text-gray-500" />
                    Courier Tracking URL (optional)
                  </label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://tracking.royalmail.com/..."
                    disabled={skipTracking || updating}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none transition-colors ${
                      !isValidUrl(trackingUrl)
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-purple-500'
                    } ${skipTracking ? 'bg-gray-100' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste the tracking link from your courier
                  </p>
                </div>

                {/* Courier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    <Truck className="w-4 h-4 inline mr-2 text-gray-500" />
                    Courier Service (optional)
                  </label>
                  <div className="relative">
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      disabled={skipTracking || updating}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none transition-colors appearance-none bg-white ${
                        skipTracking ? 'bg-gray-100 text-gray-400' : 'border-gray-300 focus:border-purple-500'
                      }`}
                    >
                      {COURIER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Helps the customer know who's delivering
                  </p>
                </div>

                {/* Skip Tracking Option */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="skipTracking"
                    checked={skipTracking}
                    onChange={(e) => setSkipTracking(e.target.checked)}
                    disabled={updating}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="skipTracking" className="text-sm text-gray-700 cursor-pointer">
                    <span className="font-medium">Skip tracking link</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      For local delivery or hand delivery
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTrackingInput(false)
                      setTrackingUrl("")
                      setCourier("")
                      setSkipTracking(false)
                    }}
                    disabled={updating}
                    className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatch}
                    disabled={updating || (!isValidUrl(trackingUrl) && !skipTracking)}
                    className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        Confirm Dispatch
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (nextAction.needsTracking) {
                    setShowTrackingInput(true)
                  } else {
                    updateStatus(nextAction.status)
                  }
                }}
                disabled={updating}
                className={`w-full py-4 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${nextAction.color}`}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <nextAction.icon className="w-5 h-5" />
                    {nextAction.label}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Completed State */}
        {order?.status === ORDER_STATUS.DELIVERED && (
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Order Complete!</h2>
            <p className="text-green-700">This order has been delivered successfully.</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          Powered by BookABash
        </p>
      </div>
    </div>
  )
}
