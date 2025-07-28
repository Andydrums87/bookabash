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
      venue: 'venue',
      entertainment: 'entertainment', 
      catering: 'catering',
      facePainting: 'face painting',
      activities: 'activities',
      partyBags: 'party bags',
      decorations: 'decorations',
      balloons: 'balloons',
      einvites: 'e-invites'
    }
    return displayNames[type] || type
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Remove Supplier</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove the <strong>{getSupplierDisplayName(supplierType)}</strong> supplier from your party? 
          This action cannot be undone.
        </p>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(supplierType)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}