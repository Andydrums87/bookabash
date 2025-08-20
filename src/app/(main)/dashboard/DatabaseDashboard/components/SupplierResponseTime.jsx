"use client"

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

export default function SupplierResponseTimer({ 
  enquirySentAt, 
  responseTimeHours = 24, 
  supplierName,
  compact = false,
  supplier
}) {
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!enquirySentAt) return

    const updateTimer = () => {
      const now = new Date()
      const sentTime = new Date(enquirySentAt)
      const expiryTime = new Date(sentTime.getTime() + (responseTimeHours * 60 * 60 * 1000))
      const remaining = expiryTime.getTime() - now.getTime()

      if (remaining <= 0) {
        setIsExpired(true)
        setTimeRemaining(null)
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeRemaining({ hours, minutes })
      setIsExpired(false)
    }

    // Update immediately
    updateTimer()
    
    // Update every minute
    const interval = setInterval(updateTimer, 60000)
    
    return () => clearInterval(interval)
  }, [enquirySentAt, responseTimeHours])

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <AlertTriangle className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-red-600`} />
        <span className="text-red-700 font-medium">
          {compact ? 'Overdue' : 'Response overdue'}
        </span>
      </div>
    )
  }

  if (!timeRemaining) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Clock className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-amber-600 animate-pulse`} />
        <span className="text-amber-700">
          {compact ? 'Loading...' : 'Calculating time...'}
        </span>
      </div>
    )
  }

  const isUrgent = timeRemaining.hours < 2
  const urgencyColor = isUrgent ? 'text-red-600' : 'text-amber-800'
  const urgencyBg = isUrgent ? 'bg-red-50' : 'bg-primary-50'

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} ${urgencyBg} ${compact ? 'px-2 py-1' : 'px-3 py-2'} rounded-lg`}>
      <Clock className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${urgencyColor} ${isUrgent ? 'animate-pulse' : ''}`} />
      <div>
        <span className={`${urgencyColor} font-medium`}>
          {timeRemaining.hours}h {timeRemaining.minutes}m left
        </span>
        {!compact && (
          <p className={`text-xs ${isUrgent ? 'text-gray-900' : 'text-gray-600'} mt-1 `}>
            {isUrgent 
              ? `${supplierName} should respond soon` 
              : `${supplierName} has until tomorrow`
            }
          </p>
        )}
      </div>
    </div>
  )
}