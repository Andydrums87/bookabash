"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  CheckCircle,
  ChefHat,
  Truck,
  Package,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react"

const ORDER_STATUS = {
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  READY_FOR_COLLECTION: 'ready_for_collection',
  COLLECTED: 'collected'
}

// Steps for delivery orders
const DELIVERY_STEPS = [
  {
    status: ORDER_STATUS.CONFIRMED,
    label: 'Confirm Order',
    shortLabel: 'Confirm',
    description: 'Accept this order and start preparing',
    icon: CheckCircle,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
  {
    status: ORDER_STATUS.PREPARING,
    label: 'Start Preparing',
    shortLabel: 'Preparing',
    description: 'Begin making the cake',
    icon: ChefHat,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
  {
    status: ORDER_STATUS.DISPATCHED,
    label: 'Mark Dispatched',
    shortLabel: 'Dispatched',
    description: 'Cake is on its way to customer',
    icon: Truck,
    activeColor: 'bg-primary-500 hover:bg-primary-600',
    needsTracking: true
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: 'Mark Delivered',
    shortLabel: 'Delivered',
    description: 'Customer has received the cake',
    icon: Package,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
]

// Steps for pickup/collection orders
const PICKUP_STEPS = [
  {
    status: ORDER_STATUS.CONFIRMED,
    label: 'Confirm Order',
    shortLabel: 'Confirm',
    description: 'Accept this order and start preparing',
    icon: CheckCircle,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
  {
    status: ORDER_STATUS.PREPARING,
    label: 'Start Preparing',
    shortLabel: 'Preparing',
    description: 'Begin making the cake',
    icon: ChefHat,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
  {
    status: ORDER_STATUS.READY_FOR_COLLECTION,
    label: 'Mark Ready',
    shortLabel: 'Ready',
    description: 'Cake is ready for customer to collect',
    icon: Package,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
  {
    status: ORDER_STATUS.COLLECTED,
    label: 'Mark Collected',
    shortLabel: 'Collected',
    description: 'Customer has picked up the cake',
    icon: CheckCircle,
    activeColor: 'bg-primary-500 hover:bg-primary-600'
  },
]

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

// Tracking Modal Component
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Tracking Info</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Courier</label>
            <div className="relative">
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                disabled={skipTracking}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                {COURIER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. IV804142085GB"
              disabled={skipTracking}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tracking URL</label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              disabled={skipTracking}
              className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 ${
                !urlIsValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={skipTracking}
              onChange={(e) => setSkipTracking(e.target.checked)}
              className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">No tracking needed</span>
              <p className="text-xs text-gray-500">Hand delivery or local delivery</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3.5 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!urlIsValid && !skipTracking)}
              className="flex-1 px-4 py-3.5 text-base font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Dispatch'}
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
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (token) fetchOrder()
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
        body: JSON.stringify({ status: newStatus, trackingUrl, trackingNumber, courierCode, courierName })
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
      setSuccessMessage('Status updated!')
      setTimeout(() => setSuccessMessage(null), 2000)
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

  // Determine if this is a pickup order
  const isPickupOrder = order?.cakeDetails?.fulfillment === 'pickup'
  const STEPS = isPickupOrder ? PICKUP_STEPS : DELIVERY_STEPS

  const getCurrentStepIndex = () => {
    if (!order?.status) return -1
    return STEPS.findIndex(s => s.status === order.status)
  }

  // Calculate delivery date (Friday before weekend event)
  const getDeliveryDate = (partyDateStr) => {
    if (!partyDateStr) return null
    const partyDate = new Date(partyDateStr)
    const dayOfWeek = partyDate.getDay() // 0 = Sunday, 6 = Saturday

    // Calculate the Friday before the event
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

  const getNextStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < STEPS.length - 1) {
      return STEPS[currentIndex + 1]
    }
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-500 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-white mx-auto mb-4" />
          <p className="text-primary-100">Loading order...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !order) {
    return (
      <div className="min-h-screen bg-primary-500 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Invalid Link</h1>
          <p className="text-primary-100">{error}</p>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const nextStep = getNextStep()
  const isComplete = order?.status === ORDER_STATUS.DELIVERED || order?.status === ORDER_STATUS.COLLECTED
  const partyDate = order?.party?.date ? new Date(order.party.date) : null
  const deliveryDate = getDeliveryDate(order?.party?.date)

  return (
    <div className="min-h-screen bg-primary-500 flex flex-col">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Order Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="max-w-lg mx-auto">
            <p className="text-primary-100 text-sm mb-1">{order?.party?.childName}'s Party</p>
            <h1 className="text-3xl font-bold text-white mb-2">{order?.supplierName || 'Cake Order'}</h1>

            {/* Delivery/Collection Date - Prominent */}
            {deliveryDate && (
              <div className="bg-white/20 rounded-xl px-4 py-3 mt-3">
                <p className="text-primary-100 text-xs uppercase tracking-wide mb-1">
                  {isPickupOrder ? 'Collection by' : 'Deliver by'}
                </p>
                <p className="text-white font-semibold text-lg">
                  {deliveryDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-primary-100 text-sm mt-1">
                  Party is {partyDate?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
                {isPickupOrder && order?.cakeDetails?.pickupLocation && (
                  <p className="text-white/80 text-sm mt-2">
                    📍 {order.cakeDetails.pickupLocation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              {STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex + 1
                const StepIcon = step.icon

                return (
                  <div key={step.status} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted ? 'bg-white' : isCurrent ? 'bg-white/30 ring-2 ring-white/50' : 'bg-primary-600/50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-primary-500" />
                      ) : (
                        <StepIcon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-primary-300'}`} />
                      )}
                    </div>
                    <span className={`text-xs font-medium text-center ${
                      isCompleted ? 'text-white' : isCurrent ? 'text-white' : 'text-primary-200'
                    }`}>
                      {step.shortLabel || step.label.split(' ')[0]}
                    </span>
                    {index < STEPS.length - 1 && (
                      <div className={`absolute h-0.5 w-full top-6 left-1/2 -z-10 ${
                        index < currentStepIndex ? 'bg-white' : 'bg-primary-600/50'
                      }`} style={{ width: 'calc(100% - 3rem)' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
          <div className="max-w-lg mx-auto">
            {isComplete ? (
              /* Completed State */
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Complete!</h2>
                <p className="text-gray-500">
                  {isPickupOrder
                    ? 'This cake has been collected successfully.'
                    : 'This cake has been delivered successfully.'}
                </p>
              </div>
            ) : nextStep ? (
              /* Next Action */
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Next step</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{nextStep.label}</h2>
                  <p className="text-gray-500">{nextStep.description}</p>
                </div>

                <button
                  onClick={() => {
                    if (nextStep.needsTracking) {
                      setShowTrackingModal(true)
                    } else {
                      updateStatus(nextStep.status)
                    }
                  }}
                  disabled={updating}
                  className={`w-full py-5 rounded-2xl text-white font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 ${nextStep.activeColor}`}
                >
                  {updating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <nextStep.icon className="w-6 h-6" />
                  )}
                  {updating ? 'Updating...' : nextStep.label}
                </button>
              </div>
            ) : (
              /* First step - Confirm */
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Action required</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirm Order</h2>
                  <p className="text-gray-500">Accept this order to begin</p>
                </div>

                <button
                  onClick={() => updateStatus(ORDER_STATUS.CONFIRMED)}
                  disabled={updating}
                  className="w-full py-5 rounded-2xl text-white font-semibold text-lg bg-primary-500 hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {updating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <CheckCircle className="w-6 h-6" />
                  )}
                  {updating ? 'Updating...' : 'Confirm Order'}
                </button>
              </div>
            )}

            {/* Order Details Accordion */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="font-semibold text-gray-900">Order Details</span>
                {showDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showDetails && (
                <div className="space-y-4 pb-4 animate-in slide-in-from-top-2">
                  {/* Delivery/Collection Date */}
                  {deliveryDate && (
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        {isPickupOrder ? (
                          <Package className="w-5 h-5 text-primary-500 mt-0.5" />
                        ) : (
                          <Truck className="w-5 h-5 text-primary-500 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs text-primary-600 uppercase tracking-wide font-medium mb-1">
                            {isPickupOrder ? 'Collection Required' : 'Delivery Required'}
                          </p>
                          <p className="text-gray-900 font-semibold">
                            {deliveryDate.toLocaleDateString('en-GB', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          {isPickupOrder && order?.cakeDetails?.pickupLocation && (
                            <p className="text-gray-600 text-sm mt-1">
                              📍 {order.cakeDetails.pickupLocation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Party Info */}
                  {order?.party && (
                    <div className="space-y-3">
                      {partyDate && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Party Date</p>
                            <p className="text-gray-900 font-medium">
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
                          <div className="text-gray-900">
                            {order.party.fullAddress ? (
                              <p className="whitespace-pre-line">{order.party.fullAddress}</p>
                            ) : order.party.addressLine1 ? (
                              <>
                                <p>{order.party.addressLine1}</p>
                                {order.party.addressLine2 && <p>{order.party.addressLine2}</p>}
                                {order.party.deliveryPostcode && <p>{order.party.deliveryPostcode}</p>}
                              </>
                            ) : (
                              <p>{order.party.location}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cake Details */}
                  {order?.cakeDetails && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {order.cakeDetails.size && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Size</span>
                          <span className="text-gray-900 font-medium">
                            {order.cakeDetails.size}
                            {order.cakeDetails.servings && ` (serves ${order.cakeDetails.servings})`}
                          </span>
                        </div>
                      )}
                      {order.cakeDetails.tiers && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tiers</span>
                          <span className="text-gray-900 font-medium">{order.cakeDetails.tiers}</span>
                        </div>
                      )}
                      {order.cakeDetails.flavor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Flavor</span>
                          <span className="text-gray-900 font-medium">{order.cakeDetails.flavor}</span>
                        </div>
                      )}
                      {order.cakeDetails.dietary && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Dietary</span>
                          <span className="text-gray-900 font-medium">{order.cakeDetails.dietary}</span>
                        </div>
                      )}
                      {order.cakeDetails.fulfillment && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Fulfillment</span>
                          <span className="text-gray-900 font-medium capitalize">{order.cakeDetails.fulfillment}</span>
                        </div>
                      )}
                      {order.cakeDetails.message && (
                        <div className="pt-2">
                          <p className="text-sm text-gray-500 mb-1">Message on cake:</p>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">"{order.cakeDetails.message}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {order?.price && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Total</span>
                        <span className="text-gray-900 font-bold text-lg">£{parseFloat(order.price).toFixed(2)}</span>
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
                        className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline"
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
              )}
            </div>
          </div>
        </div>
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
