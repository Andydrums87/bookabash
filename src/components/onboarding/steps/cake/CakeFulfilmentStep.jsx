"use client"

import { useState, useEffect } from "react"
import { Package, Truck, MapPin, PoundSterling } from "lucide-react"

export default function CakeFulfilmentStep({ cakeFulfilment, onChange }) {
  const [localData, setLocalData] = useState(cakeFulfilment || {
    offersPickup: true,
    offersDelivery: false,
    deliveryRadius: 10,
    deliveryFee: 0
  })

  // Sync with props when they change (e.g., from localStorage restore)
  useEffect(() => {
    if (cakeFulfilment) {
      setLocalData(prev => ({
        ...prev,
        ...cakeFulfilment
      }))
    }
  }, [cakeFulfilment?.deliveryFee, cakeFulfilment?.offersDelivery, cakeFulfilment?.offersPickup, cakeFulfilment?.deliveryRadius])

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    onChange(updated)
  }

  const handleToggle = (field) => {
    const updated = { ...localData, [field]: !localData[field] }
    // Ensure at least one option is selected
    if (!updated.offersPickup && !updated.offersDelivery) {
      return // Don't allow both to be unchecked
    }
    setLocalData(updated)
    onChange(updated)
  }

  const radiusOptions = [
    { value: 5, label: "5 miles" },
    { value: 10, label: "10 miles" },
    { value: 15, label: "15 miles" },
    { value: 20, label: "20 miles" },
    { value: 30, label: "30 miles" },
    { value: 50, label: "50+ miles" }
  ]

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          How do customers get their cakes?
        </h1>
        <p className="text-lg text-gray-600">
          Select all the fulfilment options you offer
        </p>
      </div>

      <div className="space-y-6">
        {/* Pickup Option */}
        <button
          type="button"
          onClick={() => handleToggle('offersPickup')}
          className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
            localData.offersPickup
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              localData.offersPickup ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <Package className={`w-6 h-6 ${
                localData.offersPickup ? 'text-white' : 'text-gray-500'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Collection / Pickup</h3>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  localData.offersPickup
                    ? 'border-gray-900 bg-gray-900'
                    : 'border-gray-300'
                }`}>
                  {localData.offersPickup && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="mt-1 text-gray-600">
                Customers collect their order from your location
              </p>
            </div>
          </div>
        </button>

        {/* Delivery Option */}
        <button
          type="button"
          onClick={() => handleToggle('offersDelivery')}
          className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
            localData.offersDelivery
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              localData.offersDelivery ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <Truck className={`w-6 h-6 ${
                localData.offersDelivery ? 'text-white' : 'text-gray-500'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Delivery</h3>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  localData.offersDelivery
                    ? 'border-gray-900 bg-gray-900'
                    : 'border-gray-300'
                }`}>
                  {localData.offersDelivery && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="mt-1 text-gray-600">
                You deliver cakes to the customer's location
              </p>
            </div>
          </div>
        </button>

        {/* Delivery Details - shown when delivery is selected */}
        {localData.offersDelivery && (
          <div className="space-y-6 pt-4 pl-4 border-l-2 border-gray-200 ml-6">
            {/* Delivery Radius */}
            <div>
              <label className="flex items-center gap-2 text-base font-medium text-gray-900 mb-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                Delivery radius
              </label>
              <div className="grid grid-cols-3 gap-3">
                {radiusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('deliveryRadius', option.value)}
                    className={`p-3 rounded-xl border-2 text-center font-medium transition-all ${
                      localData.deliveryRadius === option.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Fee */}
            <div>
              <label className="flex items-center gap-2 text-base font-medium text-gray-900 mb-2">
                <PoundSterling className="w-5 h-5 text-gray-500" />
                Delivery fee
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Leave empty or set to 0 for free delivery (e.g. 5.50)
              </p>
              <div className="relative w-48">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={localData.deliveryFeeInput ?? (localData.deliveryFee === 0 ? '' : localData.deliveryFee)}
                  onChange={(e) => {
                    // Allow digits, one decimal point, and up to 2 decimal places
                    let value = e.target.value.replace(/[^0-9.]/g, '')
                    // Prevent multiple decimal points
                    const parts = value.split('.')
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('')
                    }
                    // Limit to 2 decimal places
                    if (parts.length === 2 && parts[1].length > 2) {
                      value = parts[0] + '.' + parts[1].slice(0, 2)
                    }
                    // Store both the display value and numeric value
                    const updated = {
                      ...localData,
                      deliveryFeeInput: value,
                      deliveryFee: value === '' ? 0 : parseFloat(value) || 0
                    }
                    setLocalData(updated)
                    onChange(updated)
                  }}
                  className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            💡 You must select at least one fulfilment option. You can change these settings later.
          </p>
        </div>
      </div>
    </div>
  )
}
