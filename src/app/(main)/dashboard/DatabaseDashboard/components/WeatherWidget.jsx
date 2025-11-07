"use client"

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, ThermometerSun } from 'lucide-react'

export default function WeatherWidget({ partyDate, venueLocation }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      console.log('Weather Widget received:', { partyDate, venueLocation })

      if (!partyDate || !venueLocation) {
        console.log('Weather: Missing party date or venue location')
        setLoading(false)
        return
      }

      // Parse date - handle both "YYYY-MM-DD" and formatted dates
      let dateString = partyDate
      if (typeof partyDate === 'string' && partyDate.includes('•')) {
        // Format like "Saturday, June 14, 2025 • 2:00 PM - 4:00 PM"
        const datePart = partyDate.split('•')[0].trim()
        const parsedDate = new Date(datePart)
        if (!isNaN(parsedDate)) {
          dateString = parsedDate.toISOString().split('T')[0]
        }
      } else if (partyDate instanceof Date) {
        dateString = partyDate.toISOString().split('T')[0]
      }

      try {
        console.log('Weather: Fetching weather for', { dateString, venueLocation })
        setLoading(true)
        setError(null)

        // Fetch weather data from our API endpoint
        const response = await fetch(`/api/weather?location=${encodeURIComponent(venueLocation)}&date=${dateString}`)

        if (!response.ok) {
          throw new Error('Failed to fetch weather data')
        }

        const data = await response.json()
        setWeather(data)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [partyDate, venueLocation])

  const getWeatherIcon = (condition) => {
    const iconProps = { className: "w-12 h-12", strokeWidth: 1.5 }

    if (!condition) return <Cloud {...iconProps} />

    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain {...iconProps} className="w-12 h-12 text-blue-500" />
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow {...iconProps} className="w-12 h-12 text-blue-300" />
    } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return <Sun {...iconProps} className="w-12 h-12 text-yellow-500" />
    } else if (conditionLower.includes('cloud')) {
      return <Cloud {...iconProps} className="w-12 h-12 text-gray-400" />
    }
    return <Cloud {...iconProps} />
  }

  if (!partyDate || !venueLocation) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <p className="text-sm text-gray-500">Weather forecast will appear once party date and venue are confirmed</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <p className="text-sm text-gray-500">Weather forecast unavailable</p>
      </div>
    )
  }

  // Format the party date for display
  const formatPartyDate = () => {
    if (typeof partyDate === 'string' && partyDate.includes('•')) {
      // Format like "Saturday, June 14, 2025 • 2:00 PM - 4:00 PM"
      return partyDate.split('•')[0].trim()
    } else if (partyDate instanceof Date) {
      return partyDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (typeof partyDate === 'string') {
      // Try to parse YYYY-MM-DD format
      const date = new Date(partyDate)
      if (!isNaN(date)) {
        return date.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    }
    return partyDate
  }

  return (
    <div className="bg-primary-400 rounded-2xl p-8 shadow-lg relative overflow-hidden">
      {/* Large Weather Illustration */}
      <div className="flex items-start justify-between mb-8">
        <div className="relative">
          {/* Weather icon with larger size */}
          <div className="scale-[2.5] origin-top-left">
            {getWeatherIcon(weather.condition)}
          </div>
        </div>

        {/* Temperature Display */}
        <div className="text-right">
          <p className="text-7xl font-light text-white mb-1">{Math.round(weather.temp)}°C</p>
          <div className="flex items-center gap-2 text-white/80 text-sm justify-end">
            <Droplets className="w-4 h-4" />
            <span>{weather.rainChance}%</span>
            <span className="mx-1">|</span>
            <span className="capitalize">{weather.condition}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <p className="text-white/90 text-lg">{weather.location}</p>
      </div>

      {/* See Full Forecast Button */}
      <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium transition-all">
        See Full Forecast
      </button>

      {/* Rain Warning - if needed */}
      {weather.rainChance > 50 && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-sm text-white/90">☂️ High chance of rain - consider having umbrellas ready!</p>
        </div>
      )}
    </div>
  )
}
