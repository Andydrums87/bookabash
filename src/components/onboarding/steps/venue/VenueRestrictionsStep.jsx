"use client"

import { Ban } from "lucide-react"

const commonRestrictions = [
  "Bouncy castles",
  "Wet play activities",
  "Sand or sandpits",
  "Smoke machines",
  "Bubble machines",
  "Skateboards or scooters",
  "Items that may damage wooden floors",
  "Confetti or glitter",
  "Candles or open flames",
  "Pets or animals",
  "Loud music after specified times",
  "Glass containers",
]

export default function VenueRestrictionsStep({ restrictedItems, onChange }) {
  const toggleRestriction = (item) => {
    if (restrictedItems.includes(item)) {
      onChange(restrictedItems.filter(i => i !== item))
    } else {
      onChange([...restrictedItems, item])
    }
  }

  return (
    <div className="py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Are there any items not permitted at your venue?
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        This helps us match you with the right suppliers and avoid disappointment
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-12">
        <div className="flex gap-3">
          <Ban className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Important for matching</p>
            <p className="text-sm text-blue-700">
              If you select "Bouncy castles", we won't match bouncy castle suppliers to your venue
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {commonRestrictions.map((item) => {
          const isSelected = restrictedItems.includes(item)

          return (
            <button
              key={item}
              onClick={() => toggleRestriction(item)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left relative
                hover:border-red-400 hover:shadow-sm
                ${isSelected
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-base font-medium text-gray-900">{item}</span>
                {isSelected && (
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Ban className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          {restrictedItems.length === 0
            ? "All items permitted"
            : `${restrictedItems.length} ${restrictedItems.length === 1 ? 'item' : 'items'} restricted`
          }
        </p>
        <p className="text-xs text-gray-500 mt-2">
          You can add custom restrictions later
        </p>
      </div>
    </div>
  )
}
