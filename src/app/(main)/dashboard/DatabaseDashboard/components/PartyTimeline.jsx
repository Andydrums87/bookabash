"use client"

import { useState } from 'react'
import { Clock, Users, Music, Cake, Gift, Check, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react'

export default function PartyTimeline({ partyDetails, suppliers = {} }) {
  const [customTimeline, setCustomTimeline] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTimeline, setEditedTimeline] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate default timeline based on party details
  const generateDefaultTimeline = () => {
    if (!partyDetails?.time) return []

    const partyTime = partyDetails.time
    const duration = partyDetails.duration || 2 // Default 2 hours

    // Parse start time (format: "14:00" or "2:00 PM")
    let startHour, startMinute
    if (partyTime.includes(':')) {
      const [hours, minutes] = partyTime.split(':')
      startHour = parseInt(hours)
      startMinute = parseInt(minutes) || 0

      // Handle PM times
      if (partyTime.toLowerCase().includes('pm') && startHour < 12) {
        startHour += 12
      }
    }

    const formatTime = (hour, minute = 0) => {
      const h = hour % 12 || 12
      const m = minute.toString().padStart(2, '0')
      const period = hour >= 12 ? 'PM' : 'AM'
      return `${h}:${m} ${period}`
    }

    const timeline = []
    let currentHour = startHour
    let currentMinute = startMinute

    // Arrival
    timeline.push({
      id: 'arrival',
      time: formatTime(currentHour, currentMinute),
      title: 'Guests Arrive',
      description: 'Welcome guests and let them settle in',
      icon: Users,
      color: 'blue'
    })

    // Entertainment (if booked)
    if (suppliers.entertainment) {
      currentMinute += 15
      if (currentMinute >= 60) {
        currentHour++
        currentMinute -= 60
      }

      timeline.push({
        id: 'entertainment',
        time: formatTime(currentHour, currentMinute),
        title: suppliers.entertainment.name || 'Entertainment Begins',
        description: suppliers.entertainment.serviceType || 'Entertainment performance',
        icon: Music,
        color: 'purple'
      })
    }

    // Activities/Games
    currentMinute += 30
    if (currentMinute >= 60) {
      currentHour++
      currentMinute -= 60
    }

    timeline.push({
      id: 'activities',
      time: formatTime(currentHour, currentMinute),
      title: 'Party Games & Activities',
      description: 'Organized games and free play time',
      icon: Gift,
      color: 'green'
    })

    // Food time
    currentMinute += 30
    if (currentMinute >= 60) {
      currentHour++
      currentMinute -= 60
    }

    timeline.push({
      id: 'food',
      time: formatTime(currentHour, currentMinute),
      title: 'Party Food',
      description: suppliers.catering ? 'Catered meal service' : 'Food and refreshments',
      icon: Cake,
      color: 'orange'
    })

    // Cake time
    currentMinute += 20
    if (currentMinute >= 60) {
      currentHour++
      currentMinute -= 60
    }

    timeline.push({
      id: 'cake',
      time: formatTime(currentHour, currentMinute),
      title: 'Cake & Birthday Song',
      description: `${partyDetails.child_name}'s special moment!`,
      icon: Cake,
      color: 'pink'
    })

    // Wrap up
    currentMinute += 20
    if (currentMinute >= 60) {
      currentHour++
      currentMinute -= 60
    }

    timeline.push({
      id: 'departure',
      time: formatTime(currentHour, currentMinute),
      title: 'Party Bags & Goodbyes',
      description: 'Hand out party bags and thank guests',
      icon: Check,
      color: 'gray'
    })

    return timeline
  }

  const timeline = customTimeline || generateDefaultTimeline()

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-50',
      purple: 'text-purple-500 bg-purple-50',
      green: 'text-green-500 bg-green-50',
      orange: 'text-orange-500 bg-orange-50',
      pink: 'text-pink-500 bg-pink-50',
      gray: 'text-gray-500 bg-gray-50'
    }
    return colors[color] || colors.gray
  }

  const handleEditTimeline = (index, field, value) => {
    const newTimeline = [...(editedTimeline || timeline)]
    newTimeline[index] = { ...newTimeline[index], [field]: value }
    setEditedTimeline(newTimeline)
  }

  const saveTimeline = () => {
    setCustomTimeline(editedTimeline)
    setIsEditing(false)
    setEditedTimeline(null)
    // TODO: Save to database/localStorage
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedTimeline(null)
  }

  if (!partyDetails?.time) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <p className="text-sm text-gray-500">Timeline will appear once party time is set</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
      {!isExpanded ? (
        // Collapsed state - preview card
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 hover:bg-gray-50 transition-colors text-left block"
        >
          <div className="flex items-center gap-2 mb-4 overflow-hidden">
            <Clock className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-900 truncate">
              {timeline.length} Activities
            </span>
          </div>

          {/* Preview of first 3 items */}
          <div className="space-y-2 overflow-hidden">
            {timeline.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-start gap-3 text-sm w-full">
                <span className="text-xs font-semibold text-primary-600 w-[65px] flex-shrink-0">
                  {item.time}
                </span>
                <span className="text-gray-600 flex-shrink-0">→</span>
                <span className="text-gray-900 font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</span>
              </div>
            ))}
            {timeline.length > 3 && (
              <p className="text-xs text-gray-500 pl-[76px]">
                +{timeline.length - 3} more activities...
              </p>
            )}
          </div>

          <div className="mt-4 text-primary-600">
            <span className="text-xs font-medium">Tap to view full schedule →</span>
          </div>
        </button>
      ) : (
        // Expanded state
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ChevronUp className="w-5 h-5" />
              <span className="text-sm">Hide Timeline</span>
            </button>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setEditedTimeline([...timeline])
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Customize
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={saveTimeline}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {(editedTimeline || timeline).map((item, index) => {
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              {/* Time badge */}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleEditTimeline(index, 'time', e.target.value)}
                    className="text-xs font-bold text-primary-600 border border-gray-300 rounded px-2 py-1 w-20"
                  />
                ) : (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 min-w-[70px] text-center">
                    <p className="text-xs font-bold text-primary-600 leading-none">{item.time}</p>
                  </div>
                )}
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(item.color)}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleEditTimeline(index, 'title', e.target.value)}
                    className="font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm w-full mb-1"
                  />
                ) : (
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h4>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleEditTimeline(index, 'description', e.target.value)}
                    className="text-xs text-gray-600 mt-1 border border-gray-300 rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          )
        })}
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              💡 <strong>Tip:</strong> Print this timeline and keep it handy on party day!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
