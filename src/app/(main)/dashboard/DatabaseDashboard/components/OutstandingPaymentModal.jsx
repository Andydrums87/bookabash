"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Clock, X } from "lucide-react"

export default function OutstandingPaymentBanner({
  outstandingSuppliers = [],
  totalDepositAmount = 0,
  timeLeftMinutes = 120,
  onPaymentReady,
  hasExistingPayments = false,
  onDismiss
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(timeLeftMinutes)

  const supplierCount = outstandingSuppliers.length

  if (!isVisible || supplierCount === 0) return null

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 60000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTimeLeft = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  const getMessage = () => {
    if (supplierCount === 1) {
      return hasExistingPayments 
        ? "New supplier added - secure with deposit"
        : "Supplier confirmed - secure your booking"
    }
    return `${supplierCount} ${hasExistingPayments ? 'new' : ''} suppliers need deposits`
  }

  const getSupplierNames = () => {
    if (supplierCount === 1) {
      return outstandingSuppliers[0].name
    }
    if (supplierCount === 2) {
      return `${outstandingSuppliers[0].name} & ${outstandingSuppliers[1].name}`
    }
    return `${outstandingSuppliers[0].name} & ${supplierCount - 1} more`
  }

  return (
    <div className="bg-blue-500 text-white rounded-xl p-4 mb-6 relative">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-8">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="bg-white/20 p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">
              {getMessage()}
            </h3>
            {hasExistingPayments && (
              <Badge className="bg-white/20 text-white text-xs">
                Addition
              </Badge>
            )}
          </div>
          
          <p className="text-white/90 text-sm">
            {getSupplierNames()}
          </p>

          <div className="flex items-center gap-4 text-sm text-white/80 mt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeLeft(timeLeft)} to secure</span>
            </div>
            <span>Deposit: £{totalDepositAmount}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Button
            onClick={onPaymentReady}
            className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold px-4 py-2"
          >
            Secure All {supplierCount}
          </Button>
        </div>
      </div>
    </div>
  )
}