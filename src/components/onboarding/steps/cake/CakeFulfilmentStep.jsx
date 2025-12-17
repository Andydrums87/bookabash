"use client"

import { useState, useEffect } from "react"
import { Package, Truck } from "lucide-react"

export default function CakeFulfilmentStep({ cakeFulfilment, onChange }) {
  const [localData, setLocalData] = useState(cakeFulfilment || {
    offersPickup: true,
    offersDelivery: false,
    deliveryRadius: 10,
    deliveryFee: 0,
    collectionHours: {
      monday: { open: true, from: '09:00', to: '17:00' },
      tuesday: { open: true, from: '09:00', to: '17:00' },
      wednesday: { open: true, from: '09:00', to: '17:00' },
      thursday: { open: true, from: '09:00', to: '17:00' },
      friday: { open: true, from: '09:00', to: '17:00' },
      saturday: { open: true, from: '10:00', to: '16:00' },
      sunday: { open: false, from: '10:00', to: '16:00' }
    }
  })

  // Sync with props when they change
  useEffect(() => {
    if (cakeFulfilment) {
      setLocalData(prev => ({
        ...prev,
        ...cakeFulfilment
      }))
    }
  }, [cakeFulfilment?.offersDelivery, cakeFulfilment?.offersPickup])

  const handleToggle = (field) => {
    const updated = { ...localData, [field]: !localData[field] }
    // Ensure at least one option is selected
    if (!updated.offersPickup && !updated.offersDelivery) {
      return // Don't allow both to be unchecked
    }
    setLocalData(updated)
    onChange(updated)
  }

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

      <div className="space-y-4">
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

        {/* Help text */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            You must select at least one option. You can change these settings later.
          </p>
        </div>
      </div>
    </div>
  )
}
