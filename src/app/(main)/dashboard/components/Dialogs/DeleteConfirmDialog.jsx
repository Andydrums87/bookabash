"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useDemo } from "@/hooks/useDemo"

export default function DeleteConfirmDialog({
  isOpen,
  supplierType,
  onConfirm,
  onCancel
}) {
  const { isDemo } = useDemo()
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState([])
  const buttonRef = useRef(null)

  const createRipple = (e) => {
    if (!isDemo || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = { id: Date.now(), x, y }
    setRipples((prev) => [...prev, ripple])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 500)
  }

  const handleRemoveClick = (e) => {
    if (isDemo) {
      createRipple(e)
      setIsPressed(true)
      setTimeout(() => setIsPressed(false), 100)
      // Delay the actual action so ripple is visible
      setTimeout(() => onConfirm(supplierType), 200)
    } else {
      onConfirm(supplierType)
    }
  }

  if (!isOpen) return null

  const getSupplierDisplayName = (type) => {
    const displayNames = {
      venue: 'Venue',
      entertainment: 'Entertainment',
      catering: 'Catering',
      facePainting: 'Face Painting',
      activities: 'Soft Play',
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
            ref={buttonRef}
            onClick={handleRemoveClick}
            className="flex-1 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white relative overflow-hidden"
            style={isDemo ? {
              transform: isPressed ? "scale(0.96)" : "scale(1)",
              transition: "transform 100ms ease-out",
            } : undefined}
          >
            {/* Demo mode ripples */}
            {isDemo && ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute pointer-events-none z-20"
                style={{ left: ripple.x, top: ripple.y, transform: "translate(-50%, -50%)" }}
              >
                <span
                  className="block rounded-full animate-demo-ripple"
                  style={{ width: "10px", height: "10px", backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                />
              </span>
            ))}
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}