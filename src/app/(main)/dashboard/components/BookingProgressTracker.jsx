import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, AlertCircle, Zap, ArrowRight } from 'lucide-react'

export default function BookingProgressTracker({ 
  suppliers = {},
  enquiries = [],
  timeRemaining = 24,
  onPaymentReady,
  showPaymentCTA = false
}) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining)

  // Calculate progress (exclude einvites)
  const supplierTypes = Object.keys(suppliers).filter(key => suppliers[key] && key !== 'einvites')
  const totalSuppliers = supplierTypes.length
  const confirmedCount = supplierTypes.filter(type => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.status === 'accepted'
  }).length
  const pendingCount = supplierTypes.filter(type => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.status === 'pending'
  }).length
  const declinedCount = supplierTypes.filter(type => {
    const enquiry = enquiries.find(e => e.supplier_category === type)
    return enquiry?.status === 'declined'
  }).length

  const progressPercentage = (confirmedCount / totalSuppliers) * 100
  const allConfirmed = confirmedCount === totalSuppliers

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || allConfirmed) return

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 0.1))
    }, 100)

    return () => clearInterval(timer)
  }, [timeLeft, allConfirmed])

  const formatTime = (hours) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getStatusColor = () => {
    if (allConfirmed) return 'bg-green-500'
    if (timeLeft < 6) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  const getStatusText = () => {
    if (allConfirmed) return 'All suppliers confirmed!'
    if (pendingCount > 0) return `Waiting for ${pendingCount} response${pendingCount > 1 ? 's' : ''}`
    return 'Processing...'
  }

  return (
    <Card className={`border-2 transition-all duration-500 ${
      allConfirmed 
        ? 'border-green-400 bg-green-50 shadow-lg' 
        : 'border-blue-200 bg-blue-50'
    }`}>
 
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Party Booking Progress
            </h3>
            <p className="text-sm text-gray-600">
              {getStatusText()}
            </p>
          </div>
          {!allConfirmed && (
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)} remaining</span>
              </div>
            </div>
          )}
        </div>
     
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {confirmedCount}/{totalSuppliers} suppliers confirmed
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor()}`}
              style={{ width: `${progressPercentage}%` }}
            >
              {allConfirmed && (
                <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-600 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">{confirmedCount}</div>
            <div className="text-xs text-gray-600">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-600">{pendingCount}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-orange-600">{declinedCount}</div>
            <div className="text-xs text-gray-600">Auto-replaced</div>
          </div>
        </div>

        {/* All Confirmed State */}
        {allConfirmed && showPaymentCTA && (
          <div className="border-t pt-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-green-800 mb-2">
                🎉 All Suppliers Confirmed!
              </h4>
              <p className="text-green-700 mb-4">
                Your party team is ready. Secure your booking now.
              </p>
            </div>
            
            <Button 
              onClick={onPaymentReady}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
            >
              Pay £180 to Secure Booking
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Still Waiting State */}
        {!allConfirmed && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>We'll notify you as responses come in</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {pendingCount > 0 ? `${pendingCount} pending` : 'Processing'}
              </Badge>
            </div>
          </div>
        )}


      </CardContent>
  
    </Card>
  )
}