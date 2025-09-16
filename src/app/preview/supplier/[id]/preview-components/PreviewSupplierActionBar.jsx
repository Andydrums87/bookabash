// app/preview/supplier/[id]/preview-components/PreviewSupplierActionBar.js
"use client"

import { Button } from "@/components/ui/button"
import { Phone, Plus } from "lucide-react"

export default function PreviewSupplierActionBar({ 
  supplierPhoneNumber, 
  getAddToPartyButtonState, 
  handleAddToPlan 
}) {
  const buttonState = getAddToPartyButtonState()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-30">
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 relative overflow-hidden"
          disabled={true} // Always disabled in preview
        >
          <div className="absolute inset-0 bg-gray-100 opacity-50" />
          <Phone className="w-5 h-5 mr-2" />
          Call Now
        </Button>
        
        <Button
          size="lg"
          className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white relative overflow-hidden"
          disabled={true} // Always disabled in preview
        >
          <div className="absolute inset-0 bg-gray-400 opacity-30" />
          <Plus className="w-5 h-5 mr-2" />
          {buttonState.text}
        </Button>
      </div>
      
      {/* Preview indicator */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Preview Mode - Buttons Disabled
        </span>
      </div>
    </div>
  )
}