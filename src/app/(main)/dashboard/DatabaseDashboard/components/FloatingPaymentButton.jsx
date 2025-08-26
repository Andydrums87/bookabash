"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Lock, X, Clock, Zap } from "lucide-react"

export default function FloatingPaymentButton({
  outstandingSuppliers = [],
  totalDepositAmount = 0,
  timeLeftMinutes = 120,
  onPaymentReady,
  hasExistingPayments = false,
  isVisible = true,
  className = ""
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(timeLeftMinutes)

  const supplierCount = outstandingSuppliers.length

  // Don't show if no outstanding suppliers or dismissed
  if (!isVisible || supplierCount === 0 || isDismissed) return null

  // Escalate urgency over time
  useEffect(() => {
    const timer1 = setTimeout(() => setUrgencyLevel(2), 5 * 60 * 1000) // 5 minutes
    const timer2 = setTimeout(() => setUrgencyLevel(3), 10 * 60 * 1000) // 10 minutes
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

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

  const getButtonText = () => {
    if (supplierCount === 1) {
      return hasExistingPayments ? "Secure New Supplier" : "Secure Booking"
    }
    return `Secure All ${supplierCount}`
  }

  const getExpandedContent = () => {
    const message = hasExistingPayments 
      ? `${supplierCount} new supplier${supplierCount > 1 ? 's' : ''} need${supplierCount === 1 ? 's' : ''} deposit${supplierCount > 1 ? 's' : ''}`
      : `${supplierCount} supplier${supplierCount > 1 ? 's' : ''} ready for payment`

    return {
      message,
      suppliers: outstandingSuppliers.slice(0, 2), // Show max 2 supplier names
      showMore: supplierCount > 2
    }
  }

  const getStylesByUrgency = () => {
    switch (urgencyLevel) {
      case 3:
        return {
          button: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse",
          text: "text-white",
          icon: <Zap className="w-5 h-5" />,
          shadow: "shadow-xl shadow-red-500/30"
        }
      case 2:
        return {
          button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
          text: "text-white", 
          icon: <Clock className="w-5 h-5" />,
          shadow: "shadow-lg shadow-amber-500/20"
        }
      default:
        return {
          button: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
          text: "text-white",
          icon: <CreditCard className="w-5 h-5" />,
          shadow: "shadow-lg shadow-blue-500/20"
        }
    }
  }

  const styles = getStylesByUrgency()
  const expandedContent = getExpandedContent()

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Expanded state */}
      {isExpanded && (
        <div className="mb-3 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-800 text-sm">
              {expandedContent.message}
            </h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-1 mb-3">
            {expandedContent.suppliers.map((supplier, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center justify-between">
                <span className="truncate">{supplier.name}</span>
                <span className="font-semibold text-gray-800">£{supplier.depositAmount}</span>
              </div>
            ))}
            {expandedContent.showMore && (
              <div className="text-xs text-gray-500">
                +{supplierCount - 2} more supplier{supplierCount - 2 > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            <span>Time left:</span>
            <span className="font-semibold">{formatTimeLeft(timeLeft)}</span>
          </div>

          <Button
            onClick={onPaymentReady}
            className={`w-full h-10 ${styles.button} ${styles.text} font-semibold text-sm ${styles.shadow}`}
          >
            Pay £{totalDepositAmount}
          </Button>
        </div>
      )}

      {/* Collapsed floating button */}
      <div className="relative">
        <Button
          onClick={isExpanded ? onPaymentReady : () => setIsExpanded(true)}
          className={`h-14 px-4 ${styles.button} ${styles.text} font-bold rounded-full ${styles.shadow} transform hover:scale-105 transition-all duration-200`}
        >
          <div className="flex items-center gap-2">
            {styles.icon}
            {isExpanded ? (
              <span>Pay £{totalDepositAmount}</span>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-sm leading-none">{getButtonText()}</span>
                <span className="text-xs opacity-90 leading-none">£{totalDepositAmount}</span>
              </div>
            )}
          </div>
        </Button>

        {/* Notification badge */}
        {supplierCount > 1 && !isExpanded && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-700">{supplierCount}</span>
          </div>
        )}

        {/* Dismiss button when expanded */}
        {isExpanded && (
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute -top-2 -left-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  )
}