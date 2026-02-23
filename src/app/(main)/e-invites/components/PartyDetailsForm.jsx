// Updated PartyDetailsForm - simplified without venue helpers

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, MapPin, Palette } from 'lucide-react'
import { formatDateForDisplay } from '../utils/helperFunctions'
import { getThemeCategory } from '@/lib/inviteTemplates'

const PartyDetailsForm = ({ inviteData, handleInputChange, selectedTheme }) => {
  const date = formatDateForDisplay(inviteData.date)

  // Helper function to get first name only from childName
  const getFirstNameOnly = (fullName) => {
    if (!fullName) return ""
    return fullName.split(' ')[0]
  }
  
  const formatTimeForDisplay = (time24) => {
    if (!time24) return ""
    try {
      const [hours, minutes] = time24.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes || 0))
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: minutes && minutes !== '00' ? '2-digit' : undefined,
        hour12: true
      }).toLowerCase().replace(' ', '')
    } catch (error) {
      return time24 // Return original if parsing fails
    }
  }

  // Helper function to format time range from start_time and end_time
  const getTimeDisplayValue = () => {
    const startTime = inviteData.start_time || inviteData.startTime
    const endTime = inviteData.end_time || inviteData.endTime
    
    if (startTime && endTime) {
      const formattedStart = formatTimeForDisplay(startTime)
      const formattedEnd = formatTimeForDisplay(endTime)
      return `${formattedStart}-${formattedEnd}`
    } else if (startTime) {
      const formattedStart = formatTimeForDisplay(startTime)
      return `${formattedStart}-?`
    } else if (inviteData.time) {
      // Fallback to legacy time field if it exists
      return inviteData.time
    }
    return ""
  }

  // Helper function to parse time range input and update both start_time and end_time
  const handleTimeChange = (value) => {
    // Check if value contains a dash (start - end format)
    if (value.includes('-') || value.includes(' - ')) {
      // Split on either format: "2pm-4pm" or "2pm - 4pm"
      const splitChar = value.includes(' - ') ? ' - ' : '-'
      const [startTime, endTime] = value.split(splitChar).map(t => t.trim())
      
      // Convert to 24-hour format for database storage if needed
      const convertTo24Hour = (time12) => {
        try {
          if (time12.includes(':')) {
            // If already has colon, assume it's in proper format
            return time12
          }
          
          // Handle formats like "2pm", "2:30pm", etc.
          const time = time12.toLowerCase().replace(/\s/g, '')
          const isPM = time.includes('pm')
          const isAM = time.includes('am')
          
          let timeStr = time.replace(/[ap]m/g, '')
          
          if (!timeStr.includes(':')) {
            timeStr += ':00'
          }
          
          const [hours, minutes] = timeStr.split(':')
          let hour24 = parseInt(hours)
          
          if (isPM && hour24 !== 12) {
            hour24 += 12
          } else if (isAM && hour24 === 12) {
            hour24 = 0
          }
          
          return `${hour24.toString().padStart(2, '0')}:${minutes}`
        } catch (error) {
          return time12 // Return original if conversion fails
        }
      }
      
      // Update both start_time and end_time in 24-hour format
      handleInputChange("start_time", convertTo24Hour(startTime))
      handleInputChange("end_time", convertTo24Hour(endTime))
      
      // Also update legacy time field for backwards compatibility
      handleInputChange("time", value)
    } else {
      // If no dash, treat as start time only
      const convertTo24Hour = (time12) => {
        try {
          if (time12.includes(':')) {
            return time12
          }
          
          const time = time12.toLowerCase().replace(/\s/g, '')
          const isPM = time.includes('pm')
          const isAM = time.includes('am')
          
          let timeStr = time.replace(/[ap]m/g, '')
          
          if (!timeStr.includes(':')) {
            timeStr += ':00'
          }
          
          const [hours, minutes] = timeStr.split(':')
          let hour24 = parseInt(hours)
          
          if (isPM && hour24 !== 12) {
            hour24 += 12
          } else if (isAM && hour24 === 12) {
            hour24 = 0
          }
          
          return `${hour24.toString().padStart(2, '0')}:${minutes}`
        } catch (error) {
          return time12
        }
      }
      
      handleInputChange("start_time", convertTo24Hour(value))
      handleInputChange("time", value)
      
      // Clear end_time if it was previously set
      if (inviteData.end_time) {
        handleInputChange("end_time", "")
      }
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          Party Details
        </h2>

        {/* Essential Fields - Always visible */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Child's First Name *
              </label>
              <Input
                value={getFirstNameOnly(inviteData.childName)}
                onChange={(e) => {
                  // Only store the first name
                  const input = e.target.value
                  const firstName = input.split(' ')[0]
                  handleInputChange("childName", firstName)
                }}
                onPaste={(e) => {
                  // Handle paste events to also extract first name only
                  e.preventDefault()
                  const pastedText = e.clipboardData.getData('text')
                  const firstName = pastedText.split(' ')[0]
                  handleInputChange("childName", firstName)
                }}
                placeholder="Enter child's first name"
                className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Age *
              </label>
              <Input
                value={inviteData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Age"
                className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date *
              </label>
              <Input
                value={date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                placeholder="Party date (e.g., 27/08/2025)"
                className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Time *
              </label>
              <Input
                value={getTimeDisplayValue()}
                onChange={(e) => handleTimeChange(e.target.value)}
                placeholder="Party time (e.g., 2pm-4pm)"
                className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
              />
            </div>
          </div>

          {/* SIMPLIFIED: Just use the venue from inviteData */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue *
            </label>
            <Input
              value={inviteData.venue || ''}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="Party venue (name and address)"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
            />
          </div>

          {/* Theme Display - Read only */}
          {selectedTheme && (
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Party Theme
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg"
                style={{ borderColor: getThemeCategory(selectedTheme)?.color + '40' }}
              >
                <span className="text-2xl">{getThemeCategory(selectedTheme)?.icon}</span>
                <span className="font-medium text-gray-800">
                  {getThemeCategory(selectedTheme)?.name || selectedTheme}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  From your party plan
                </span>
              </div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}

export default PartyDetailsForm