"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, RefreshCw, CheckCircle, AlertCircle, Clock, X, ChevronDown, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Calendar Provider Icons
const GoogleCalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="#4285F4" />
    <path d="M7 10h5v5H7z" fill="#34A853" />
    <path d="M12 10h5v5h-5z" fill="#FBBC05" />
    <path d="M7 15h5v4H7z" fill="#EA4335" />
    <path d="M12 15h5v4h-5z" fill="#4285F4" />
  </svg>
)

const OutlookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#0078D4"/>
    <path d="M12 7C9.8 7 8 8.8 8 11C8 13.2 9.8 15 12 15C14.2 15 16 13.2 16 11C16 8.8 14.2 7 12 7ZM12 13.5C10.6 13.5 9.5 12.4 9.5 11C9.5 9.6 10.6 8.5 12 8.5C13.4 8.5 14.5 9.6 14.5 11C14.5 12.4 13.4 13.5 12 13.5Z" fill="white"/>
  </svg>
)

const AppleCalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="5" width="16" height="16" rx="3" fill="#FF3B30"/>
    <rect x="4" y="5" width="16" height="5" rx="3" fill="#FF9500"/>
    <text x="12" y="17" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">31</text>
  </svg>
)

const YahooCalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#6001D2"/>
    <path d="M12 6L13.5 10H10.5L12 6ZM8 10L10 15H14L16 10H8Z" fill="white"/>
  </svg>
)

const CalDavIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#6B7280"/>
    <path d="M8 7H16V9H8V7ZM8 11H14V13H8V11ZM8 15H12V17H8V15Z" fill="white"/>
  </svg>
)

const CALENDAR_PROVIDERS = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: GoogleCalendarIcon,
    connected: false,
    description: 'Gmail'
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: OutlookIcon,
    connected: false,
    description: 'Microsoft 365'
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: AppleCalendarIcon,
    connected: false,
    description: 'iCloud'
  },
  {
    id: 'yahoo',
    name: 'Yahoo Calendar',
    icon: YahooCalendarIcon,
    connected: false,
    description: 'Yahoo Mail'
  },
  {
    id: 'caldav',
    name: 'CalDAV',
    icon: CalDavIcon,
    connected: false,
    description: 'Generic CalDAV'
  }
]

const CompactCalendarSync = ({ onSyncToggle, currentSupplier, authUserId }) => {
  const [connectedProviders, setConnectedProviders] = useState([])
  const [expandedProvider, setExpandedProvider] = useState(null)

  // Load existing connections
  useEffect(() => {
    if (currentSupplier?.googleCalendarSync?.connected) {
      setConnectedProviders(['google'])
    }
  }, [currentSupplier])

  const handleProviderConnect = async (providerId) => {
    console.log(`Connecting to ${providerId}...`)
    
    if (providerId === 'google') {
      const userId = authUserId || currentSupplier?.auth_user_id
      
      if (!userId) {
        console.error('No auth_user_id available')
        return
      }

      try {
        const response = await fetch("/api/auth/google-calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        })

        if (!response.ok) throw new Error('Connection failed')
        
        const data = await response.json()
        if (data.authUrl) {
          window.location.href = data.authUrl
        }
      } catch (error) {
        console.error("Connect failed:", error)
      }
    } else {
      // Placeholder for other providers
      alert(`${providerId} calendar integration coming soon!`)
    }
  }

  const handleProviderDisconnect = async (providerId) => {
    if (providerId === 'google' && authUserId) {
      try {
        const response = await fetch("/api/auth/google-calendar/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: authUserId })
        })

        if (response.ok) {
          setConnectedProviders(prev => prev.filter(id => id !== providerId))
          setExpandedProvider(null)
          window.location.reload()
        }
      } catch (error) {
        console.error("Disconnect failed:", error)
      }
    }
  }

  const handleSync = async (providerId) => {
    if (providerId === 'google') {
      try {
        const response = await fetch("/api/calendar/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supplierId: currentSupplier?.id })
        })

        if (response.ok) {
          const data = await response.json()
          if (onSyncToggle) {
            onSyncToggle({
              type: "sync_completed",
              blockedDates: data.blockedDates,
              eventsFound: data.eventsFound,
              lastSync: data.lastSync
            })
          }
        }
      } catch (error) {
        console.error("Sync failed:", error)
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Calendar Integrations</h3>
        <Badge variant="outline" className="text-xs">
          {connectedProviders.length} connected
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CALENDAR_PROVIDERS.map((provider) => {
          const Icon = provider.icon
          const isConnected = connectedProviders.includes(provider.id)
          const isExpanded = expandedProvider === provider.id

          return (
            <div key={provider.id} className="relative">
              <button
                onClick={() => {
                  if (isConnected) {
                    setExpandedProvider(isExpanded ? null : provider.id)
                  } else {
                    handleProviderConnect(provider.id)
                  }
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isConnected
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Icon className="w-10 h-10" />
                    {isConnected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-900">{provider.name}</div>
                    <div className="text-xs text-gray-500">{provider.description}</div>
                  </div>
                  {isConnected && (
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                      Connected
                    </Badge>
                  )}
                </div>
              </button>

              {/* Expanded settings dropdown */}
              {isExpanded && isConnected && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-2">
                      Last synced: {currentSupplier?.googleCalendarSync?.lastSync 
                        ? new Date(currentSupplier.googleCalendarSync.lastSync).toLocaleDateString()
                        : 'Never'}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSync(provider.id)
                      }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProviderDisconnect(provider.id)
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          Connect your calendars to automatically block unavailable dates. Events marked as "busy" or "all-day" will sync to your availability.
        </p>
      </div>
    </div>
  )
}

export default CompactCalendarSync