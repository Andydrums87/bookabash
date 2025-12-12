"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Truck, Link2, ExternalLink, ChevronDown } from "lucide-react"

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

export default function TrackingUrlModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [trackingUrl, setTrackingUrl] = useState("")
  const [courier, setCourier] = useState("")
  const [skipTracking, setSkipTracking] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const courierLabel = courier ? COURIER_OPTIONS.find(c => c.value === courier)?.label : null
    onSubmit({
      trackingUrl: skipTracking ? null : trackingUrl.trim() || null,
      courier: skipTracking ? null : courier || null,
      courierLabel: skipTracking ? null : courierLabel
    })
  }

  const isValidUrl = (url) => {
    if (!url) return true // Empty is valid (optional)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mark as Dispatched</h2>
              <p className="text-sm text-gray-500">Add tracking information (optional)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Link2 className="w-4 h-4 inline mr-2 text-gray-500" />
              Courier Tracking URL
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://tracking.royalmail.com/..."
              className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none transition-colors ${
                !urlIsValid
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-purple-500'
              }`}
              disabled={skipTracking}
            />
            {!urlIsValid && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid URL</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Paste the tracking link from your courier
            </p>
          </div>

          {/* Courier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Truck className="w-4 h-4 inline mr-2 text-gray-500" />
              Courier Service
            </label>
            <div className="relative">
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                disabled={skipTracking}
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
              Optional - helps the customer know who's delivering
            </p>
          </div>

          {/* Skip Tracking Option */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="skipTracking"
              checked={skipTracking}
              onChange={(e) => setSkipTracking(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="skipTracking" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">Skip tracking link</span>
              <br />
              <span className="text-xs text-gray-500">
                For local delivery or hand delivery without courier tracking
              </span>
            </label>
          </div>

          {/* Preview (if URL provided) */}
          {trackingUrl && urlIsValid && !skipTracking && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700 font-medium">Customer will see:</span>
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                >
                  Preview <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-purple-600 mt-1 truncate">{trackingUrl}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting || (!urlIsValid && !skipTracking)}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Mark as Dispatched
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
