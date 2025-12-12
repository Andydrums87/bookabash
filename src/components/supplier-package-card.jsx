"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2, Clock, CheckCircle, ImageIcon, MoreHorizontal, Users, Layers, Ruler, Truck } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export function SupplierPackageCard({ packageData, onEdit, onDelete, isCake = false }) {
  const [showMenu, setShowMenu] = useState(false)

  if (!packageData) {
    return null
  }

  const { name, description, price, priceType, duration, whatsIncluded, image, feeds, serves, tiers, sizeInches, deliveryFee } = packageData
  const feedsValue = feeds || serves

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Compact image - smaller height */}
      <div className="relative h-32 bg-gray-100">
        {image ? (
          <Image
            src={image.src || image}
            alt={name || "Package image"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {/* Menu button overlay */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden min-w-[120px]">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEdit()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content - more compact */}
      <div className="p-4">
        {/* Title and price on same line */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{name || "Unnamed Package"}</h3>
          <span className="font-semibold text-gray-900 whitespace-nowrap">£{price || "0"}</span>
        </div>

        {/* Duration or Cake Details */}
        <div className="text-sm text-gray-500 mb-2">
          {isCake ? (
            <div className="space-y-1">
              {/* Tiers and Size */}
              <div className="flex items-center gap-3 flex-wrap">
                {tiers && (
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {tiers} tier{tiers !== '1' ? 's' : ''}
                  </span>
                )}
                {sizeInches && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" />
                    {sizeInches}"
                  </span>
                )}
                {feedsValue && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Feeds {feedsValue}
                  </span>
                )}
              </div>
              {/* Delivery fee */}
              {deliveryFee > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Truck className="h-3 w-3" />
                  +£{parseFloat(deliveryFee).toFixed(2)} delivery
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{duration || "Duration TBC"}</span>
              {priceType && <span className="text-gray-400">• {priceType}</span>}
            </div>
          )}
        </div>

        {/* Description - truncated */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        )}

        {/* Features - inline chips style */}
        {whatsIncluded && whatsIncluded.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {whatsIncluded.slice(0, 3).map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="truncate max-w-[100px]">{item}</span>
              </span>
            ))}
            {whatsIncluded.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{whatsIncluded.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Add Package Card - cleaner style
export function AddPackageCard({ onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="w-full h-full min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <ImageIcon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="font-medium text-gray-900">Add New Package</p>
      <p className="text-sm text-gray-500 mt-1">Click to create a new service package.</p>
    </button>
  )
}
