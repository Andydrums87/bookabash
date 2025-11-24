"use client"

import { Check } from "lucide-react"

const amenities = [
  "Kitchen Facilities",
  "Accessible Access",
  "Parking Available",
  "Public Transport Links",
  "Toilets/Changing Facilities",
  "Sound System",
  "Projector/Screen",
  "Stage/Performance Area",
  "Outdoor Space",
  "Bar Facilities",
  "Air Conditioning",
  "WiFi Internet",
  "Storage Space",
  "Coat/Bag Storage",
  "Changing Rooms",
  "First Aid Kit",
  "Fire Safety Equipment",
]

export default function VenueAmenitiesStep({ selectedAmenities, onChange }) {
  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter(a => a !== amenity))
    } else {
      onChange([...selectedAmenities, amenity])
    }
  }

  return (
    <div className="py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        What amenities does your venue offer?
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Select all that apply. You can add more later.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {amenities.map((amenity) => {
          const isSelected = selectedAmenities.includes(amenity)

          return (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-left relative
                hover:border-gray-900 hover:shadow-sm
                ${isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-base font-medium text-gray-900">{amenity}</span>
                {isSelected && (
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        {selectedAmenities.length} amenities selected
      </div>
    </div>
  )
}
