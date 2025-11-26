"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

// Airbnb-style number stepper component
const NumberStepper = ({ value, onChange, min = 0, max = 999, step = 1, prefix = '', suffix = '' }) => {
  const currentValue = value || 0
  const canDecrement = currentValue > min
  const canIncrement = currentValue < max

  const handleIncrement = () => {
    onChange(Math.min(max, currentValue + step))
  }

  const handleDecrement = () => {
    onChange(Math.max(min, currentValue - step))
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
          canDecrement
            ? 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
            : 'border-gray-200 text-gray-300 cursor-not-allowed'
        }`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="min-w-[80px] text-center text-lg font-medium text-gray-900">
        {prefix}{currentValue}{suffix}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
          canIncrement
            ? 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
            : 'border-gray-200 text-gray-300 cursor-not-allowed'
        }`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function PricingPackagesStep({ pricing, onChange }) {
  const [localData, setLocalData] = useState(pricing || {
    basePrice: 0,
    pricingType: "per_hour",
    minimumDuration: 1,
    extraHourRate: 0,
    groupSizeMin: 1,
    groupSizeMax: 30,
    additionalEntertainerPrice: 150,
    packages: []
  })

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Pricing
        </h1>
        <p className="text-gray-600">
          Set your rates and capacity
        </p>
      </div>

      <div className="space-y-0">
        {/* Minimum Group Size */}
        <div className="border-b border-gray-200 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Minimum group size</h3>
              <p className="text-gray-500 text-sm">Smallest group you'll entertain</p>
            </div>
            <NumberStepper
              value={localData.groupSizeMin}
              onChange={(val) => handleChange("groupSizeMin", val)}
              min={1}
              max={localData.groupSizeMax || 100}
              step={1}
            />
          </div>
        </div>

        {/* Maximum Group Size */}
        <div className="border-b border-gray-200 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Maximum group size</h3>
              <p className="text-gray-500 text-sm">Largest group you can handle</p>
            </div>
            <NumberStepper
              value={localData.groupSizeMax}
              onChange={(val) => handleChange("groupSizeMax", val)}
              min={localData.groupSizeMin || 1}
              max={200}
              step={5}
            />
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="border-b border-gray-200 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Hourly rate</h3>
              <p className="text-gray-500 text-sm">Your standard rate per hour</p>
            </div>
            <NumberStepper
              value={localData.basePrice}
              onChange={(val) => handleChange("basePrice", val)}
              min={10}
              max={500}
              step={5}
              prefix="£"
            />
          </div>
        </div>

        {/* Extra Hour Rate */}
        <div className="border-b border-gray-200 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Extra hour rate</h3>
              <p className="text-gray-500 text-sm">Rate for additional time beyond standard booking</p>
            </div>
            <NumberStepper
              value={localData.extraHourRate}
              onChange={(val) => handleChange("extraHourRate", val)}
              min={10}
              max={300}
              step={5}
              prefix="£"
            />
          </div>
        </div>

        {/* Additional Entertainer */}
        <div className="border-b border-gray-200 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Additional entertainer</h3>
              <p className="text-gray-500 text-sm">Cost for a second entertainer for larger groups</p>
            </div>
            <NumberStepper
              value={localData.additionalEntertainerPrice}
              onChange={(val) => handleChange("additionalEntertainerPrice", val)}
              min={50}
              max={500}
              step={10}
              prefix="£"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
