"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, RefreshCw, CheckCircle, AlertCircle, Clock, X, Settings, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const GoogleCalendarIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
      fill="#4285F4"
    />
    <path d="M7 10h5v5H7z" fill="#34A853" />
    <path d="M12 10h5v5h-5z" fill="#FBBC05" />
    <path d="M7 15h5v4H7z" fill="#EA4335" />
    <path d="M12 15h5v4h-5z" fill="#4285F4" />
  </svg>
)

const CompactCalendarSync = ({ onSyncToggle, currentSupplier }) => {
  const [syncSettings, setSyncSettings] = useState({
    enabled: false,
    connected: false,
    lastSync: null,
    syncFrequency: 'daily',
    filterMode: 'all-day-events',
    status: "disconnected",
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load existing connection state from database
  useEffect(() => {
    console.log('Loading calendar sync settings from currentSupplier:', currentSupplier)
    
    if (currentSupplier?.googleCalendarSync) {
      console.log('Found existing Google Calendar sync data:', currentSupplier.googleCalendarSync)
      const googleSync = currentSupplier.googleCalendarSync
      
      const newSyncSettings = {
        enabled: googleSync.enabled || false,
        connected: googleSync.connected || false,
        lastSync: googleSync.lastSync || null,
        syncFrequency: googleSync.syncFrequency || 'daily',
        filterMode: googleSync.filterMode || 'all-day-events',
        status: googleSync.connected ? 'connected' : 'disconnected'
      }
      
      console.log('Setting sync settings to:', newSyncSettings)
      setSyncSettings(newSyncSettings)
    } else {
      console.log('No Google Calendar sync data found in currentSupplier')
    }
  }, [currentSupplier])

  // Check for successful OAuth callback and refresh data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('calendar_connected') === 'true') {
      console.log('OAuth callback detected - forcing page refresh...')
      
      // Clear the URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Force a hard refresh to reload data
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      console.log('Calling /api/auth/google-calendar...')
      
      const response = await fetch("/api/auth/google-calendar", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Auth URL received:', data.authUrl)
      
      if (!data.authUrl) {
        throw new Error('No auth URL returned from API')
      }

      // Redirect to Google OAuth
      console.log('Redirecting to Google OAuth...')
      window.location.href = data.authUrl
    } catch (error) {
      console.error("OAuth failed:", error)
      setSyncSettings((prev) => ({ ...prev, status: "error" }))
      setIsConnecting(false)
    }
  }

  const handleManualSync = async () => {
    setSyncSettings((prev) => ({ ...prev, status: "syncing" }))

    try {
      console.log('Calling calendar sync API...')
      console.log('Current supplier data:', currentSupplier)
      console.log('Supplier ID:', currentSupplier?.id)
      
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          supplierId: currentSupplier?.id,
          syncFrequency: syncSettings.syncFrequency,
          filterMode: syncSettings.filterMode 
        }),
      })

      console.log('Sync response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Sync failed:', errorText)
        throw new Error("Sync failed")
      }

      const { blockedDates, eventsFound, lastSync, supplierName } = await response.json()
      
      console.log('Sync successful:', { blockedDates: blockedDates?.length, eventsFound, supplierName })

      setSyncSettings((prev) => ({
        ...prev,
        status: "connected",
        lastSync: lastSync,
      }))

      // Trigger global refresh event
      window.dispatchEvent(
        new CustomEvent("supplierDataUpdated", {
          detail: {
            type: "calendar_sync",
            supplierId: currentSupplier?.id,
            blockedDates: blockedDates?.length || 0,
          },
        }),
      )

      if (onSyncToggle) {
        onSyncToggle({
          type: "sync_completed",
          blockedDates,
          eventsFound,
          lastSync,
        })
      }
    } catch (error) {
      console.error("Manual sync failed:", error)
      setSyncSettings((prev) => ({ ...prev, status: "error" }))
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/auth/google-calendar/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId: currentSupplier?.id }),
      })

      if (!response.ok) {
        throw new Error("Disconnect failed")
      }

      setSyncSettings({
        enabled: false,
        connected: false,
        lastSync: null,
        syncFrequency: 'daily',
        filterMode: 'all-day-events',
        status: "disconnected",
      })

      if (onSyncToggle) {
        onSyncToggle({ type: "disconnected" })
      }
    } catch (error) {
      console.error("Disconnect failed:", error)
      setSyncSettings((prev) => ({ ...prev, status: "error" }))
    }
  }

  const handleSettingChange = (setting, value) => {
    setSyncSettings(prev => ({ ...prev, [setting]: value }))
    
    // You might want to save these settings to the backend immediately
    // or defer until the next sync operation
    console.log(`Updated ${setting} to ${value}`)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "connected":
        return "Connected"
      case "syncing":
        return "Syncing..."
      case "error":
        return "Error"
      default:
        return "Not Connected"
    }
  }

  return (
    <div className="space-y-3">
      {/* Main sync bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GoogleCalendarIcon className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-900">Google Calendar</span>
            <Badge variant="outline" className="text-xs">
              {getStatusText(syncSettings.status)}
            </Badge>
          </div>

          {syncSettings.lastSync && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(syncSettings.lastSync).toLocaleDateString()}</span>
              {currentSupplier?.googleCalendarSync?.lastAutomaticSync && (
                <span className="text-green-600 ml-1 font-medium">(auto)</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!syncSettings.connected ? (
            <Button onClick={handleConnect} disabled={isConnecting} size="sm" variant="outline">
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          ) : (
            <>
              <Button onClick={handleManualSync} disabled={syncSettings.status === "syncing"} size="sm" variant="outline">
                {syncSettings.status === "syncing" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              
              {/* Settings toggle button */}
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleDisconnect}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Advanced settings panel */}
      {syncSettings.connected && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              {/* Account type indicator */}
              {currentSupplier?.googleCalendarSync?.isWorkspaceAccount ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-green-900 mb-1">
                        Automatic Sync Enabled
                      </h5>
                      <p className="text-xs text-green-800 mb-2">
                        Google Workspace account detected. Your calendar automatically syncs when events change.
                      </p>
                      {currentSupplier?.googleCalendarSync?.workspaceDomain && (
                        <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                          Domain: {currentSupplier.googleCalendarSync.workspaceDomain}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-amber-900 mb-1">
                        Manual Sync Required
                      </h5>
                      <p className="text-xs text-amber-800">
                        Personal Gmail accounts require manual syncing. Consider upgrading to Google Workspace for automatic updates.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sync Frequency - only show for non-automatic accounts */}
                {!currentSupplier?.googleCalendarSync?.isWorkspaceAccount && (
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-2 block">
                      Sync Frequency
                    </Label>
                    <Select
                      value={syncSettings.syncFrequency}
                      onValueChange={(value) => handleSettingChange('syncFrequency', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Filter Mode */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">
                    What to Block
                  </Label>
                  <Select
                    value={syncSettings.filterMode}
                    onValueChange={(value) => handleSettingChange('filterMode', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-day-events">All-day events only</SelectItem>
                      <SelectItem value="busy-events">Events marked as 'Busy'</SelectItem>
                      <SelectItem value="all-events">All events</SelectItem>
                      <SelectItem value="keyword-filter">Events with keywords</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* How it works info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="space-y-1 text-xs text-blue-800">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <span>Events in your Google Calendar will automatically block those dates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <span>All-day events block the entire day (morning + afternoon)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <span>Timed events block the relevant time slot (morning/afternoon)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <span>Manual blocks you create here will always take priority</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export default CompactCalendarSync;