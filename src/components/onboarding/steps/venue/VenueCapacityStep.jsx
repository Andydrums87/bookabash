"use client"

import { Minus, Plus } from "lucide-react"

export default function VenueCapacityStep({ capacity, onChange }) {
  const updateCapacity = (field, value) => {
    onChange({
      ...capacity,
      [field]: Math.max(1, value)
    })
  }

  return (
    <div className="py-12 max-w-2xl">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        How many guests can you accommodate?
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Help families find the right size space for their party
      </p>

      <div className="space-y-8">
        {/* Maximum Capacity */}
        <div className="flex items-center justify-between py-6 border-b border-gray-200">
          <div>
            <div className="text-lg font-medium text-gray-900">Maximum Guests</div>
            <div className="text-sm text-gray-600">Total capacity of your venue</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCapacity('max', (capacity.max || 50) - 10)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={(capacity.max || 50) <= 10}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-16 text-center text-xl font-medium">{capacity.max || 50}</div>
            <button
              onClick={() => updateCapacity('max', (capacity.max || 50) + 10)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Seated Capacity */}
        <div className="flex items-center justify-between py-6 border-b border-gray-200">
          <div>
            <div className="text-lg font-medium text-gray-900">Seated Capacity</div>
            <div className="text-sm text-gray-600">Maximum guests when seated</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCapacity('seated', (capacity.seated || 30) - 5)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={(capacity.seated || 30) <= 5}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-16 text-center text-xl font-medium">{capacity.seated || 30}</div>
            <button
              onClick={() => updateCapacity('seated', (capacity.seated || 30) + 5)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Standing Capacity */}
        <div className="flex items-center justify-between py-6 border-b border-gray-200">
          <div>
            <div className="text-lg font-medium text-gray-900">Standing Capacity</div>
            <div className="text-sm text-gray-600">Maximum guests when standing</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCapacity('standing', (capacity.standing || 60) - 10)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={(capacity.standing || 60) <= 10}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-16 text-center text-xl font-medium">{capacity.standing || 60}</div>
            <button
              onClick={() => updateCapacity('standing', (capacity.standing || 60) + 10)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
