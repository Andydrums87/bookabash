"use client"

import { useState } from "react"
import { PoundSterling, Clock, Package } from "lucide-react"

export default function PricingPackagesStep({ pricing, onChange }) {
  const [localData, setLocalData] = useState(pricing || {
    basePrice: 0,
    pricingType: "per_hour", // per_hour or per_event
    minimumDuration: 1,
    packages: []
  })

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  const durationOptions = [
    { value: 0.5, label: "30 minutes" },
    { value: 1, label: "1 hour" },
    { value: 1.5, label: "1.5 hours" },
    { value: 2, label: "2 hours" },
    { value: 3, label: "3 hours" }
  ]

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PoundSterling className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Set your pricing
        </h1>
        <p className="text-lg text-gray-600">
          Let customers know your rates
        </p>
      </div>

      <div className="space-y-8">
        {/* Pricing Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            How do you charge?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange('pricingType', 'per_hour')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${localData.pricingType === 'per_hour'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'
                }
              `}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${localData.pricingType === 'per_hour' ? 'text-primary-600' : 'text-gray-400'}`} />
              <div className="font-semibold text-sm">Per Hour</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange('pricingType', 'per_event')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${localData.pricingType === 'per_event'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'
                }
              `}
            >
              <Package className={`w-6 h-6 mx-auto mb-2 ${localData.pricingType === 'per_event' ? 'text-primary-600' : 'text-gray-400'}`} />
              <div className="font-semibold text-sm">Per Event</div>
            </button>
          </div>
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {localData.pricingType === 'per_hour' ? 'Hourly Rate' : 'Event Price'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
            <input
              type="number"
              value={localData.basePrice || ""}
              onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="10"
              className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {localData.pricingType === 'per_hour'
              ? 'Your standard hourly rate'
              : 'Your base price for a typical event'}
          </p>
        </div>

        {/* Minimum Duration (only for hourly) */}
        {localData.pricingType === 'per_hour' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Minimum Booking Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {durationOptions.map((option) => {
                const isSelected = localData.minimumDuration === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('minimumDuration', option.value)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-center
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-gray-300 hover:border-primary-300 text-gray-700'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            value={localData.additionalInfo || ""}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            placeholder="E.g., Discounts for multiple bookings, weekend rates, package deals..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Pricing Tip:</strong> Set competitive rates based on your experience and market. You can always create custom quotes for specific events.
          </p>
        </div>
      </div>
    </div>
  )
}
