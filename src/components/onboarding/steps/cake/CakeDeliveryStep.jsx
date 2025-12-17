"use client"

import { useState, useEffect } from "react"
import { Truck, Package } from "lucide-react"

const RADIUS_OPTIONS = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 15, label: "15 miles" },
  { value: 20, label: "20 miles" },
  { value: 30, label: "30 miles" },
  { value: 50, label: "50+ miles" }
]

export default function CakeDeliveryStep({ cakeFulfilment, onChange }) {
  const [offersDelivery, setOffersDelivery] = useState(cakeFulfilment?.offersDelivery ?? false)
  const [deliveryRadius, setDeliveryRadius] = useState(cakeFulfilment?.deliveryRadius ?? 10)
  const [deliveryFee, setDeliveryFee] = useState(cakeFulfilment?.deliveryFee ?? 0)
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(
    cakeFulfilment?.deliveryFee ? String(cakeFulfilment.deliveryFee) : ''
  )

  // Sync with props
  useEffect(() => {
    if (cakeFulfilment) {
      setOffersDelivery(cakeFulfilment.offersDelivery ?? false)
      setDeliveryRadius(cakeFulfilment.deliveryRadius ?? 10)
      setDeliveryFee(cakeFulfilment.deliveryFee ?? 0)
      if (cakeFulfilment.deliveryFee) {
        setDeliveryFeeInput(String(cakeFulfilment.deliveryFee))
      }
    }
  }, [cakeFulfilment])

  const handleToggleDelivery = (value) => {
    setOffersDelivery(value)
    onChange({
      ...cakeFulfilment,
      offersDelivery: value,
      deliveryRadius: value ? deliveryRadius : cakeFulfilment?.deliveryRadius,
      deliveryFee: value ? deliveryFee : cakeFulfilment?.deliveryFee
    })
  }

  const handleRadiusChange = (value) => {
    setDeliveryRadius(value)
    onChange({
      ...cakeFulfilment,
      offersDelivery: true,
      deliveryRadius: value,
      deliveryFee
    })
  }

  const handleFeeChange = (inputValue) => {
    let value = inputValue.replace(/[^0-9.]/g, '')
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].slice(0, 2)
    }

    setDeliveryFeeInput(value)
    const numericFee = value === '' ? 0 : parseFloat(value) || 0
    setDeliveryFee(numericFee)

    onChange({
      ...cakeFulfilment,
      offersDelivery: true,
      deliveryRadius,
      deliveryFee: numericFee
    })
  }

  return (
    <div className="py-12 max-w-xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Delivery
        </h1>
        <p className="text-lg text-gray-600">
          Do you deliver cakes to customers?
        </p>
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleToggleDelivery(true)}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
              offersDelivery
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <Truck className={`w-5 h-5 ${offersDelivery ? 'text-white' : 'text-gray-400'}`} />
            <span className="font-semibold">Yes, I deliver</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleDelivery(false)}
            className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
              !offersDelivery
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <Package className={`w-5 h-5 ${!offersDelivery ? 'text-white' : 'text-gray-400'}`} />
            <span className="font-semibold">No, collection only</span>
          </button>
        </div>

        {/* Warning if neither option selected */}
        {!offersDelivery && !cakeFulfilment?.offersPickup && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800">
              You must select at least one fulfilment option. Please enable delivery or go back and enable collection.
            </p>
          </div>
        )}

        {/* Delivery details - only show if delivery is enabled */}
        {offersDelivery && (
          <div className="space-y-6 pt-4">
            {/* Delivery Radius */}
            <div>
              <label className="font-medium text-gray-900 mb-3 block">
                How far will you deliver?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RADIUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRadiusChange(option.value)}
                    className={`p-3 rounded-xl border-2 text-center font-medium transition-all text-sm ${
                      deliveryRadius === option.value
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
              <label className="font-medium text-gray-900 mb-2 block">
                Delivery fee
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Leave empty or set to 0 for free delivery
              </p>
              <div className="relative w-full max-w-[180px]">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">£</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={deliveryFeeInput}
                  onChange={(e) => handleFeeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-gray-900 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
