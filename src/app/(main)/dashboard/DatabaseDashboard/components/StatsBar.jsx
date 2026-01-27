"use client"

import { useState, useEffect } from "react"
import { Clock, PoundSterling, CheckCircle2, Cloud, Sun, CloudRain } from "lucide-react"

function calculateTimeUntil(partyDate) {
  if (!partyDate) return null

  const now = new Date()
  const party = new Date(partyDate)
  const diff = party - now

  if (diff <= 0) return { days: 0, hours: 0, isPast: true }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return { days, hours, isPast: false }
}

export default function StatsBar({
  partyDate,
  totalCost,
  suppliers,
  enquiries,
  weatherData
}) {
  const [timeUntil, setTimeUntil] = useState(null)

  useEffect(() => {
    setTimeUntil(calculateTimeUntil(partyDate))

    const interval = setInterval(() => {
      setTimeUntil(calculateTimeUntil(partyDate))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [partyDate])

  // Calculate progress
  const supplierTypes = ['venue', 'entertainment', 'cakes', 'decorations', 'facePainting', 'activities', 'partyBags', 'balloons', 'catering']
  const bookedCount = supplierTypes.filter(type => suppliers?.[type]).length
  const paidCount = enquiries?.filter(e =>
    ['paid', 'fully_paid', 'partial_paid'].includes(e.payment_status) || e.is_paid
  ).length || 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Countdown */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Countdown</p>
            {timeUntil && !timeUntil.isPast ? (
              <p className="text-lg font-bold text-gray-900">
                {timeUntil.days}<span className="text-sm font-normal text-gray-500">d</span>{' '}
                {timeUntil.hours}<span className="text-sm font-normal text-gray-500">h</span>
              </p>
            ) : (
              <p className="text-lg font-bold text-primary-600">Party time!</p>
            )}
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <PoundSterling className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Cost</p>
            <p className="text-lg font-bold text-gray-900">
              £{(totalCost || 0).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Suppliers</p>
            <p className="text-lg font-bold text-gray-900">
              {bookedCount} <span className="text-sm font-normal text-gray-500">booked</span>
              {paidCount > 0 && (
                <span className="text-green-600 text-sm ml-1">({paidCount} paid)</span>
              )}
            </p>
          </div>
        </div>

        {/* Weather Preview (if available and party is within 7 days) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {weatherData?.condition === 'rain' ? (
              <CloudRain className="w-5 h-5 text-orange-600" />
            ) : weatherData?.condition === 'cloudy' ? (
              <Cloud className="w-5 h-5 text-orange-600" />
            ) : (
              <Sun className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Party Day</p>
            {weatherData?.temp ? (
              <p className="text-lg font-bold text-gray-900">
                {weatherData.temp}°C
              </p>
            ) : timeUntil && timeUntil.days <= 7 ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : (
              <p className="text-sm text-gray-400">Check later</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
