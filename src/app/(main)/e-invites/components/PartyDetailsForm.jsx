import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, ChevronDown } from 'lucide-react'
import { useState } from "react"
import { formatDateForDisplay } from '../utils/helperFunctions'
import { getHeadlineOptions, getHeadlineStyles, getHeadlineText } from '../utils/headlineUtils'

const PartyDetailsForm = ({ inviteData, handleInputChange, selectedTheme, useAIGeneration }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

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

  // Helper function to format time for 12-hour display

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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Venue *
            </label>
            <Input
              value={inviteData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="Party venue"
              className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors mb-4"
        >
          <span className="font-medium text-gray-700">
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
            showAdvanced ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Advanced Fields - Collapsible */}
        {showAdvanced && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            {/* Headline Options - Only show for template mode */}
            {!useAIGeneration && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Invitation Headline
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    Choose how you want to announce the party
                  </span>
                </label>
                <div className="space-y-3">
                  <select
                    value={inviteData.headline}
                    onChange={(e) => handleInputChange("headline", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium text-base"
                  >
                    {getHeadlineOptions(selectedTheme, inviteData.childName, inviteData.age, selectedTheme).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}: "{option.text}"
                      </option>
                    ))}
                    <option value="custom">Custom headline</option>
                  </select>
                  
                  {inviteData.headline === "custom" && (
                    <Input
                      value={inviteData.customHeadline || ""}
                      onChange={(e) => handleInputChange("customHeadline", e.target.value)}
                      placeholder="Enter your custom headline"
                      className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base"
                    />
                  )}
                  
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="text-sm font-bold text-gray-600 mb-2">Preview:</div>
                    <div
                      style={{
                        ...getHeadlineStyles(inviteData.headline, selectedTheme),
                        position: "relative",
                        transform: "none",
                        color: "#333",
                        textShadow: "none",
                      }}
                    >
                      "{getHeadlineText(inviteData, selectedTheme)}"
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Style: {getHeadlineStyles(inviteData.headline, selectedTheme).fontSize} •{" "}
                      {getHeadlineStyles(inviteData.headline, selectedTheme).fontWeight} •{" "}
                      {getHeadlineStyles(inviteData.headline, selectedTheme).fontFamily || "Default Font"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Special Message
              </label>
              <Textarea
                value={inviteData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Add a special message for your guests"
                rows={3}
                className="border-2 border-gray-200 focus:border-primary-500 rounded-lg text-base resize-none"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PartyDetailsForm