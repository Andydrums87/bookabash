"use client"

import { useState } from "react"
import { X, ChevronDown } from "lucide-react"

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

export default function TrackingUrlModal({ isOpen, onClose, onSubmit, isSubmitting }) {
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
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mark as dispatched</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Courier Selection */}
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

          {/* Tracking Number */}
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

          {/* Tracking URL */}
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

          {/* Skip Tracking Option */}
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

          {/* Actions */}
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
