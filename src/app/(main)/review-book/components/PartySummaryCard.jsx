"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, Sparkles } from "lucide-react"

export default function PartySummaryCard({ partyDetails = {} }) {
  // Helper function to format time range from localStorage data
  const formatTimeDisplay = (partyDetails) => {
    // Check if we have the new startTime format
    if (partyDetails.rawStartTime || partyDetails.startTime) {
      const startTime = partyDetails.rawStartTime || partyDetails.startTime
      const duration = partyDetails.duration || 2
      
      try {
        // Format start time
        const [hours, minutes] = startTime.split(':')
        const startDate = new Date()
        startDate.setHours(parseInt(hours), parseInt(minutes || 0))
        
        const formattedStart = startDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: minutes && minutes !== '00' ? '2-digit' : undefined,
          hour12: true,
        })
        
        // Calculate end time
        const endDate = new Date(startDate.getTime() + (duration * 60 * 60 * 1000))
        const formattedEnd = endDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: endDate.getMinutes() > 0 ? '2-digit' : undefined,
          hour12: true,
        })
        
        return `${formattedStart} - ${formattedEnd}`
      } catch (error) {
        console.error('Error formatting time:', error)
        return partyDetails.time || "TBD"
      }
    }
    
    // Fallback to existing time display
    return partyDetails.time || "TBD"
  }

  // Helper function to get duration text
  const getDurationText = (partyDetails) => {
    const duration = partyDetails.duration
    if (!duration) return null
    
    if (duration === Math.floor(duration)) {
      return `${duration} hour${duration > 1 ? 's' : ''}`
    } else {
      const hours = Math.floor(duration)
      const minutes = (duration - hours) * 60
      
      if (minutes === 30) {
        return `${hours}½ hours`
      } else {
        return `${hours}h ${minutes}m`
      }
    }
  }

  const timeDisplay = formatTimeDisplay(partyDetails)
  const durationText = getDurationText(partyDetails)

  return (
    <Card className="border-2 border-[hsl(var(--primary-200))] shadow-lg bg-gradient-to-br from-primary-50 to-white overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-primary-400 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {partyDetails.childName}'s {partyDetails.theme} Party
                </h2>
                <p className="text-primary-100 text-sm">
                  Age {partyDetails.age} • {partyDetails.theme} Theme
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">🎉</div>
            </div>
          </div>
        </div>

        {/* Party Details */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-gray-900 font-semibold">{partyDetails.date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-gray-900 font-semibold">{timeDisplay}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-gray-900 font-semibold">{partyDetails.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Child's Age</p>
                <p className="text-gray-900 font-semibold">{partyDetails.age} years old</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}