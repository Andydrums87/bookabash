"use client"

import { useState } from "react"
import { MapPin, Navigation } from "lucide-react"

export default function ServiceAreaStep({ serviceArea, onChange }) {
  const [localData, setLocalData] = useState(serviceArea || {
    baseLocation: "",
    postcode: "",
    travelRadius: 10,
    travelFee: 0
  })

  const radiusOptions = [
    { value: 5, label: "5 miles" },
    { value: 10, label: "10 miles" },
    { value: 20, label: "20 miles" },
    { value: 30, label: "30 miles" },
    { value: 50, label: "50 miles" },
    { value: 100, label: "100+ miles" }
  ]

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Where do you provide services?
        </h1>
        <p className="text-lg text-gray-600">
          Let customers know your service area
        </p>
      </div>

      <div className="space-y-6">
        {/* Base Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Base Location (City/Town)
          </label>
          <input
            type="text"
            value={localData.baseLocation || ""}
            onChange={(e) => handleChange('baseLocation', e.target.value)}
            placeholder="E.g., Manchester"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Postcode */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Postcode
          </label>
          <input
            type="text"
            value={localData.postcode || ""}
            onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
            placeholder="M1 1AA"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Travel Radius */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            How far will you travel?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {radiusOptions.map((option) => {
              const isSelected = localData.travelRadius === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('travelRadius', option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-center
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-gray-300 hover:border-primary-300 text-gray-700'
                    }
                  `}
                >
                  <div className="font-semibold">{option.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Travel Fee */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Travel Fee (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
            <input
              type="number"
              value={localData.travelFee || ""}
              onChange={(e) => handleChange('travelFee', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="5"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Additional fee for travel outside your immediate area (if applicable)
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Navigation className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Tip:</strong> A larger travel radius can increase your booking opportunities. You can adjust your travel fee for longer distances.
          </div>
        </div>
      </div>
    </div>
  )
}
