"use client"

import { Building2, Church, School, Dumbbell, Home, Trees, Users, Hotel, UtensilsCrossed, TreePine, Building, MoreHorizontal } from "lucide-react"

const venueTypes = [
  {
    id: "Community Hall",
    label: "Community Hall",
    icon: Users
  },
  {
    id: "Church Hall",
    label: "Church Hall",
    icon: Church
  },
  {
    id: "School Hall",
    label: "School Hall",
    icon: School
  },
  {
    id: "Sports Centre",
    label: "Sports Centre",
    icon: Dumbbell
  },
  {
    id: "Private Function Room",
    label: "Private Function Room",
    icon: Home
  },
  {
    id: "Outdoor Space",
    label: "Outdoor Space",
    icon: Trees
  },
  {
    id: "Village Hall",
    label: "Village Hall",
    icon: Building2
  },
  {
    id: "Hotel Conference Room",
    label: "Hotel Conference Room",
    icon: Hotel
  },
  {
    id: "Restaurant Private Room",
    label: "Restaurant Private Room",
    icon: UtensilsCrossed
  },
  {
    id: "Village Green/Park",
    label: "Village Green/Park",
    icon: TreePine
  },
  {
    id: "Community Centre",
    label: "Community Centre",
    icon: Building
  },
  {
    id: "Other",
    label: "Other",
    icon: MoreHorizontal
  }
]

export default function VenueTypeStep({ selectedType, onSelect }) {
  return (
    <div className="py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
        Which best describes your venue?
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Choose the type that matches your space
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {venueTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 text-left
                flex flex-col items-start
                hover:border-gray-900 hover:shadow-md
                ${isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              <Icon className="w-8 h-8 mb-4 text-gray-900" />
              <div className="font-medium text-base text-gray-900 leading-snug">
                {type.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
