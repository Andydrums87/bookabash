"use client"

import { useState } from "react"
import { Clock, AlertCircle } from "lucide-react"

export default function CakeLeadTimeStep({ cakeLeadTime, onChange }) {
  const [localData, setLocalData] = useState(cakeLeadTime || {
    minimum: 3,
    standard: 7
  })

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0
    const updated = { ...localData, [field]: numValue }

    // Ensure minimum is not greater than standard
    if (field === 'minimum' && numValue > localData.standard) {
      updated.standard = numValue
    }
    if (field === 'standard' && numValue < localData.minimum) {
      updated.minimum = numValue
    }

    setLocalData(updated)
    onChange(updated)
  }

  const minimumOptions = [
    { value: 1, label: "1 day" },
    { value: 2, label: "2 days" },
    { value: 3, label: "3 days" },
    { value: 5, label: "5 days" },
    { value: 7, label: "1 week" }
  ]

  const standardOptions = [
    { value: 3, label: "3 days" },
    { value: 5, label: "5 days" },
    { value: 7, label: "1 week" },
    { value: 14, label: "2 weeks" },
    { value: 21, label: "3 weeks" }
  ]

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          How much notice do you need?
        </h1>
        <p className="text-lg text-gray-600">
          Set your lead times so customers know when to order
        </p>
      </div>

      <div className="space-y-10">
        {/* Minimum Lead Time */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Minimum notice</h3>
              <p className="text-sm text-gray-500">The absolute minimum time you need</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {minimumOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('minimum', option.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  localData.minimum === option.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg font-semibold">{option.value}</span>
                <span className="block text-xs mt-1">
                  {option.value === 1 ? 'day' : option.value >= 7 ? 'week' : 'days'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Lead Time */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recommended notice</h3>
              <p className="text-sm text-gray-500">The ideal amount of time for best results</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {standardOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('standard', option.value)}
                disabled={option.value < localData.minimum}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  localData.standard === option.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : option.value < localData.minimum
                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg font-semibold">{option.value}</span>
                <span className="block text-xs mt-1">
                  {option.value === 7 ? 'week' : option.value === 14 ? 'weeks' : option.value === 21 ? 'weeks' : 'days'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-3">What customers will see:</h4>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Orders need at least <span className="font-semibold">{localData.minimum} {localData.minimum === 1 ? 'day' : 'days'}</span> notice
            </p>
            <p className="text-gray-600">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Best to order <span className="font-semibold">{localData.standard} {localData.standard === 1 ? 'day' : 'days'}</span> ahead
            </p>
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 Setting realistic lead times helps manage customer expectations and ensures you can deliver quality cakes.
          </p>
        </div>
      </div>
    </div>
  )
}
