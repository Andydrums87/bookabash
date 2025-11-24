"use client"

import { Calendar, Check, ChevronRight } from "lucide-react"
import Image from "next/image"

// Google Calendar Icon Component
const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12">
    <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
    <path fill="#fff" d="M19 20H5V9h14v11z"/>
    <path fill="#EA4335" d="M11.5 14.5l-1.5 1.5-1.5-1.5 1.5-1.5z"/>
    <path fill="#34A853" d="M15.5 14.5l1.5 1.5-1.5 1.5-1.5-1.5z"/>
    <path fill="#FBBC04" d="M13.5 12.5l1.5-1.5 1.5 1.5-1.5 1.5z"/>
    <path fill="#4285F4" d="M9.5 12.5l1.5-1.5 1.5 1.5-1.5 1.5z"/>
  </svg>
)

// Outlook Calendar Icon Component
const OutlookCalendarIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12">
    <path fill="#0078D4" d="M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20z"/>
    <path fill="#fff" d="M24 34c-5.52 0-10-4.48-10-10s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10zm0-17c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z"/>
    <path fill="#0078D4" d="M24 28c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
)

export default function CalendarConnectionStep({ connectedCalendar, onConnect, onSkip, eventsSynced = 0 }) {
  const calendars = [
    {
      id: "google",
      name: "Google Calendar",
      description: "Sync with Gmail calendar",
      icon: GoogleCalendarIcon,
      color: "bg-white hover:bg-blue-50",
      iconBg: "bg-white"
    },
    {
      id: "outlook",
      name: "Outlook Calendar",
      description: "Sync with Microsoft Outlook",
      icon: OutlookCalendarIcon,
      color: "bg-white hover:bg-blue-50",
      iconBg: "bg-white"
    }
  ]

  return (
    <div className="py-12 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Connect your calendar
        </h1>
        <p className="text-lg text-gray-600">
          Keep your availability up-to-date automatically by syncing your calendar
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {calendars.map((calendar) => {
          const isConnected = connectedCalendar === calendar.id

          return (
            <button
              key={calendar.id}
              onClick={() => onConnect(calendar.id)}
              disabled={isConnected}
              className={`
                w-full p-6 rounded-xl border-2 transition-all duration-200 text-left
                ${isConnected
                  ? 'border-green-500 bg-green-50 cursor-default'
                  : `border-gray-300 ${calendar.color} hover:shadow-md hover:border-gray-400`
                }
                disabled:cursor-not-allowed
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* Calendar Icon */}
                  <div className={`w-16 h-16 ${calendar.iconBg} rounded-xl flex items-center justify-center shadow-sm border border-gray-100`}>
                    <calendar.icon />
                  </div>

                  <div>
                    <div className="font-semibold text-xl text-gray-900 mb-1">
                      {calendar.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {calendar.description}
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <div className="flex flex-col items-end gap-1 text-green-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Connected</span>
                    </div>
                    {eventsSynced > 0 && (
                      <span className="text-xs text-green-700">
                        {eventsSynced} {eventsSynced === 1 ? 'event' : 'events'} synced
                      </span>
                    )}
                  </div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">Why connect your calendar?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Automatically block out dates when you're busy</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Prevent double bookings with real-time sync</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>New bookings automatically added to your calendar</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Keep everything organized in one place</span>
          </li>
        </ul>
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-900 text-sm underline"
        >
          Skip for now (you can connect later)
        </button>
      </div>
    </div>
  )
}
