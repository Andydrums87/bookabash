"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown, Check, Plus } from "lucide-react"

const SmartStickyBottomBar = ({
  suppliers = {},
  totalCost = 0,
  onContinue,
  isVisible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const panelRef = useRef(null)

  // Get selected suppliers
  const selectedSuppliers = Object.entries(suppliers)
    .filter(([_, supplier]) => supplier !== null)
    .map(([type, supplier]) => ({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
      supplierName: supplier?.name,
      price: supplier?.price || 0
    }))

  const selectedCount = selectedSuppliers.length
  const totalSlots = Object.keys(suppliers).length

  // Get empty slots
  const emptySlots = Object.entries(suppliers)
    .filter(([_, supplier]) => supplier === null)
    .map(([type]) => ({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
    }))

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  // Format supplier names for inline display
  const getInlineSummary = () => {
    if (selectedCount === 0) return "No suppliers selected yet"

    const names = selectedSuppliers.map(s => s.name)
    if (names.length <= 3) {
      return names.join(" • ")
    }
    return `${names.slice(0, 2).join(" • ")} +${names.length - 2} more`
  }

  return (
    <div
      ref={panelRef}
      className={`hidden lg:block fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Expandable Summary Panel */}
      <div
        className={`bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-[400px]' : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-8">
              {/* Selected Suppliers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Your Party Plan ({selectedCount}/{totalSlots})
                </h4>
                <div className="space-y-2">
                  {selectedSuppliers.map(({ type, name, supplierName, price }) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">{name}</span>
                          {supplierName && (
                            <span className="text-sm text-gray-500 ml-2">— {supplierName}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-primary-700">£{price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empty Slots */}
              {emptySlots.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Still Available
                  </h4>
                  <div className="space-y-2">
                    {emptySlots.map(({ type, name }) => (
                      <div
                        key={type}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-gray-500">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Bar */}
      <div className="relative bg-white border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        {/* Subtle gradient fade at top for better separation */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-black/[0.06] to-transparent pointer-events-none" />
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left: Trust indicators */}
            <div className="flex items-center gap-6">
              {/* Expand toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 group"
              >
                <div className="flex -space-x-1">
                  {selectedSuppliers.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{selectedCount} selected</span>
                <div className="flex items-center gap-1 text-primary-500 group-hover:text-primary-600 transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Trust points */}
              <div className="hidden lg:flex items-center gap-4 text-sm text-gray-600">
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  Personally confirmed
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  100% money-back guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  Add extras anytime
                </span>
              </div>
            </div>

            {/* Right: Total + CTA */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-900">£{totalCost.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center">
                <button
                  onClick={onContinue}
                  className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 active:shadow-md"
                >
                  Secure My Party
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartStickyBottomBar
