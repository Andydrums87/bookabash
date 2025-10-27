"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function DeleteConfirmDialog({
  isOpen,
  supplierType,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null

  const getSupplierDisplayName = (type) => {
    const displayNames = {
      venue: 'Venue',
      entertainment: 'Entertainment',
      catering: 'Catering',
      facePainting: 'Face Painting',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'Decorations',
      balloons: 'Balloons',
      einvites: 'E-Invites',
      cakes: 'Cake'
    }
    return displayNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Remove from party?</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors -mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Are you sure you want to remove <strong className="text-gray-900">{getSupplierDisplayName(supplierType)}</strong> from your party plan? You can always add them back later.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Keep It
          </Button>
          <Button
            onClick={() => onConfirm(supplierType)}
            className="flex-1 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}