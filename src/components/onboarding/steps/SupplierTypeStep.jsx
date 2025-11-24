"use client"

import Image from "next/image"
import { Building2, MoreHorizontal } from "lucide-react"

const supplierTypes = [
  {
    id: "venues",
    label: "Venues",
    iconType: "image",
    iconPath: "/journey-icons/location.png",
    description: "Party halls, event spaces, and venues"
  },
  {
    id: "entertainment",
    label: "Entertainment",
    iconType: "image",
    iconPath: "/category-icons/entertainment.png",
    description: "Performers, entertainers, and DJs"
  },
  {
    id: "catering",
    label: "Catering",
    iconType: "image",
    iconPath: "/category-icons/catering.png",
    description: "Food and beverage services"
  },
  {
    id: "photography",
    label: "Photography",
    iconType: "image",
    iconPath: "/category-icons/photography.png",
    description: "Photographers and videographers"
  },
  {
    id: "decorations",
    label: "Decorations",
    iconType: "image",
    iconPath: "/category-icons/decorations.png",
    description: "Party decorations and styling"
  },
  {
    id: "activities",
    label: "Activities & Games",
    iconType: "image",
    iconPath: "/category-icons/activities.png",
    description: "Games, activities, and entertainment"
  },
  {
    id: "face-painting",
    label: "Face Painting",
    iconType: "image",
    iconPath: "/category-icons/face-painting.png",
    description: "Face painting and body art"
  },
  {
    id: "bouncy-castle",
    label: "Bouncy Castle",
    iconType: "image",
    iconPath: "/category-icons/bouncy-castle.png",
    description: "Inflatable castles and play equipment"
  },
  {
    id: "cakes",
    label: "Cakes & Desserts",
    iconType: "image",
    iconPath: "/category-icons/cake.png",
    description: "Birthday cakes and sweet treats"
  },
  {
    id: "party-bags",
    label: "Party Bags",
    iconType: "image",
    iconPath: "/category-icons/party-bags.png",
    description: "Party favors and gift bags"
  },
  {
    id: "balloons",
    label: "Balloons",
    iconType: "image",
    iconPath: "/category-icons/balloons.png",
    description: "Balloon decorations and displays"
  },
  {
    id: "other",
    label: "Other",
    iconType: "lucide",
    icon: MoreHorizontal,
    description: "Other party services"
  }
]

export default function SupplierTypeStep({ selectedType, onSelect }) {
  return (
    <div className="py-12">
      <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3 text-center">
        What type of service do you provide?
      </h1>
      <p className="text-lg text-gray-600 mb-12 text-center">
        Choose the category that best describes your business
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {supplierTypes.map((type) => {
          const isSelected = selectedType === type.id

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 text-left flex flex-col
                hover:border-gray-900 hover:shadow-md
                ${isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              <div className="mb-4 w-16 h-16 flex items-center justify-center">
                {type.iconType === "image" ? (
                  <Image
                    src={type.iconPath}
                    alt={type.label}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                ) : (
                  <type.icon className="w-10 h-10 text-gray-900" />
                )}
              </div>
              <div className="font-semibold text-lg text-gray-900 mb-2">
                {type.label}
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {type.description}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
