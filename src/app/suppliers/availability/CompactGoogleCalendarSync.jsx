"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, RefreshCw, CheckCircle, X, Link2, Link2Off } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
]

// Props:
// - targetBusiness: Optional. If provided, shows connection for this specific business
// - isUnifiedView: If true, shows the shared/unified calendar connection for all businesses
const CompactCalendarSync = ({ onSyncToggle, currentSupplier, authUserId, targetBusiness, isUnifiedView = true }) => {
  const [connectedProviders, setConnectedProviders] = useState([])
  const [expandedProvider, setExpandedProvider] = useState(null)
  const [syncing, setSyncing] = useState(null)
  const [unlinking, setUnlinking] = useState(false)

  // Determine which supplier data to use
  const supplierData = targetBusiness?.data || currentSupplier

  // Check for BOTH direct and inherited connections
  useEffect(() => {
    const connected = []
    const data = supplierData

    // Check Google Calendar (direct OR inherited)
    if (data?.googleCalendarSync?.connected ||
        data?.googleCalendarSync?.inherited) {
      connected.push('google')
    }

    // Check Outlook Calendar (direct OR inherited)
    if (data?.outlookCalendarSync?.connected ||
        data?.outlookCalendarSync?.inherited) {
      connected.push('outlook')
    }

    setConnectedProviders(connected)
  }, [supplierData])

  // Check if connection is inherited from primary
  const isInherited = (providerId) => {
    const data = supplierData
    const syncData = providerId === 'google'
      ? data?.googleCalendarSync
      : data?.outlookCalendarSync
    return syncData?.inherited === true
  }

  // Check if this business has its own direct connection (not inherited)
  const hasOwnConnection = (providerId) => {
    const data = supplierData
    const syncData = providerId === 'google'
      ? data?.googleCalendarSync
      : data?.outlookCalendarSync
    return syncData?.connected === true && !syncData?.inherited
  }

  const handleProviderConnect = async (providerId) => {
    console.log(`Connecting to ${providerId}...`)

    const userId = authUserId || currentSupplier?.auth_user_id

    if (!userId) {
      console.error('No auth_user_id available')
      return
    }

    try {
      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No valid session')
        return
      }

      const endpoint = providerId === 'google'
        ? '/api/auth/google-calendar'
        : '/api/auth/outlook-calendar'

      // If connecting for a specific business, pass the supplierId
      const body = { userId }
      if (targetBusiness?.id && !isUnifiedView) {
        body.supplierId = targetBusiness.id
        body.perBusinessConnection = true
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) throw new Error('Connection failed')

      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error("Connect failed:", error)
    }
  }

  // Unlink this business from the shared calendar (use its own or none)
  const handleUnlinkFromShared = async (providerId) => {
    if (!targetBusiness?.id) return

    setUnlinking(true)
    try {
      const response = await fetch('/api/calendar/unlink-business', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: targetBusiness.id,
          provider: providerId
        })
      })

      if (response.ok) {
        setConnectedProviders(prev => prev.filter(id => id !== providerId))
        setExpandedProvider(null)
        window.location.reload()
      }
    } catch (error) {
      console.error("Unlink failed:", error)
    } finally {
      setUnlinking(false)
    }
  }

  // Re-link this business to the shared calendar
  const handleRelinkToShared = async (providerId) => {
    if (!targetBusiness?.id) return

    setUnlinking(true)
    try {
      const response = await fetch('/api/calendar/relink-business', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: targetBusiness.id,
          provider: providerId
        })
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Relink failed:", error)
    } finally {
      setUnlinking(false)
    }
  }

  const handleProviderDisconnect = async (providerId) => {
    if (!authUserId) return

    try {
      // Get the current session token for authentication
      let { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        alert('Session error. Please refresh the page and try again.')
        return
      }

      if (!session?.access_token) {
        console.error('No valid session - user may need to sign in again')
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError || !refreshedSession?.access_token) {
          alert('Your session has expired. Please sign in again.')
          window.location.href = '/signin'
          return
        }

        // Use the refreshed session
        session = refreshedSession
      }

      const endpoint = providerId === 'google'
        ? '/api/auth/google-calendar/disconnect'
        : '/api/auth/outlook-calendar/disconnect'

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId: authUserId })
      })

      if (response.ok) {
        setConnectedProviders(prev => prev.filter(id => id !== providerId))
        setExpandedProvider(null)
        window.location.reload()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Disconnect failed:', response.status, errorData)

        if (response.status === 401) {
          alert('Your session has expired. Please sign in again.')
          window.location.href = '/signin'
        } else {
          alert(`Failed to disconnect calendar: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error("Disconnect failed:", error)
      alert('Failed to disconnect calendar. Please try again.')
    }
  }

  const handleSync = async (providerId) => {
    setSyncing(providerId)
    try {
      const data = supplierData
      // Use primary supplier ID for inherited connections, otherwise use target business or current
      const supplierIdToSync = isInherited(providerId)
        ? data?.googleCalendarSync?.primarySupplierId || data?.outlookCalendarSync?.primarySupplierId
        : targetBusiness?.id || currentSupplier?.id

      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierIdToSync,
          provider: providerId
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        if (onSyncToggle) {
          onSyncToggle({
            type: "sync_completed",
            blockedDates: responseData.blockedDates,
            eventsFound: responseData.eventsFound,
            lastSync: responseData.lastSync,
            provider: providerId
          })
        }
        window.location.reload()
      }
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setSyncing(null)
    }
  }

  const getLastSync = (providerId) => {
    const data = supplierData
    const syncData = providerId === 'google'
      ? data?.googleCalendarSync
      : data?.outlookCalendarSync

    return syncData?.lastSync
      ? new Date(syncData.lastSync).toLocaleDateString()
      : 'Never'
  }

  // Check if we're showing for a specific non-primary business
  const isPerBusinessView = targetBusiness && !isUnifiedView
  const businessHasNoCalendar = isPerBusinessView && !connectedProviders.length

  return (
    <div className="space-y-2">
      {CALENDAR_PROVIDERS.map((provider) => {
        const Icon = provider.icon
        const isConnected = connectedProviders.includes(provider.id)
        const isExpanded = expandedProvider === provider.id
        const isSyncing = syncing === provider.id
        const inherited = isInherited(provider.id)
        const ownConnection = hasOwnConnection(provider.id)

        return (
          <div key={provider.id}>
            <button
              onClick={() => {
                if (isConnected) {
                  setExpandedProvider(isExpanded ? null : provider.id)
                } else {
                  handleProviderConnect(provider.id)
                }
              }}
              disabled={isSyncing || unlinking}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                isConnected
                  ? 'bg-green-50 hover:bg-green-100'
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${(isSyncing || unlinking) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                {isConnected ? (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {inherited ? (
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        Shared calendar
                      </span>
                    ) : ownConnection ? (
                      'Own calendar'
                    ) : (
                      'Connected'
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Click to connect</div>
                )}
              </div>
            </button>

            {isExpanded && isConnected && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-3">
                <div className="text-xs text-gray-600">
                  {provider.id === 'google'
                    ? supplierData?.googleCalendarSync?.userEmail
                    : supplierData?.outlookCalendarSync?.email}
                </div>
                <div className="text-xs text-gray-500">
                  Last synced: {getLastSync(provider.id)}
                </div>

                {/* Sync button */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSync(provider.id)
                    }}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync now'}
                  </Button>
                  {!inherited && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProviderDisconnect(provider.id)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Per-business calendar options */}
                {isPerBusinessView && inherited && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <p className="text-xs text-gray-500">
                      This business uses the shared calendar from your primary listing.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUnlinkFromShared(provider.id)
                      }}
                      disabled={unlinking}
                    >
                      <Link2Off className="w-3 h-3 mr-1" />
                      {unlinking ? 'Unlinking...' : 'Use separate calendar'}
                    </Button>
                  </div>
                )}

                {isPerBusinessView && ownConnection && (
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <p className="text-xs text-gray-500">
                      This business has its own calendar connection.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRelinkToShared(provider.id)
                      }}
                      disabled={unlinking}
                    >
                      <Link2 className="w-3 h-3 mr-1" />
                      {unlinking ? 'Linking...' : 'Use shared calendar instead'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <p className="text-xs text-gray-500 pt-2">
        Events marked as "busy" will block your availability.
      </p>
    </div>
  )
}

export default CompactCalendarSync