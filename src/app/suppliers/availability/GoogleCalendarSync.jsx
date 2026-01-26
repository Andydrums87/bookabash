import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react'

const GoogleCalendarSync = ({ onSyncToggle, currentSupplier }) => {
  const [syncSettings, setSyncSettings] = useState({
    enabled: false,
    connected: false,
    lastSync: null,
    syncFrequency: 'daily',
    filterMode: 'all-day-events',
    status: 'disconnected'
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

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
      console.log('currentSupplier keys:', Object.keys(currentSupplier || {}))
    }
  }, [currentSupplier])

  // Debug: Log current sync settings state
  useEffect(() => {
    console.log('Current syncSettings state:', syncSettings)
  }, [syncSettings])

  // Check for successful OAuth callback and refresh data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const calendarError = urlParams.get('calendar_error')

    // Handle calendar connection error
    if (calendarError) {
      console.error('Calendar connection error:', calendarError)

      let errorMessage = `Calendar connection failed: ${calendarError}`
      if (calendarError === 'missing_calendar_scope') {
        errorMessage = 'Calendar permission not granted.\n\nPlease reconnect and make sure to allow access to your Google Calendar when prompted. You may have unchecked the calendar permission on the consent screen.'
      }

      alert(errorMessage)

      // Clear URL parameters
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

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
      
      const response = await fetch('/api/auth/google-calendar', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('OAuth failed:', error)
      setSyncSettings(prev => ({ ...prev, status: 'error' }))
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setSyncSettings(prev => ({
      ...prev,
      enabled: false,
      connected: false,
      status: 'disconnected'
    }))
    onSyncToggle?.(false)
  }

  const handleSyncToggle = (enabled) => {
    if (enabled && !syncSettings.connected) {
      // Need to connect first
      handleConnect()
    } else {
      setSyncSettings(prev => ({ ...prev, enabled }))
      onSyncToggle?.(enabled)
    }
  }

  const handleManualSync = async () => {
    setSyncSettings(prev => ({ ...prev, status: 'syncing' }))
    
    try {
      console.log('Calling calendar sync API...')
      console.log('Current URL:', window.location.href)
      console.log('Fetch URL:', '/api/calendar/sync')
      console.log('Current supplier data:', currentSupplier)
      console.log('Supplier ID:', currentSupplier?.id)
      
      // Call your sync endpoint
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: currentSupplier?.id
        })
      })
      
      console.log('Sync response status:', response.status)
      console.log('Response URL:', response.url)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Sync failed:', errorText)
        throw new Error('Sync failed')
      }
      
      const { blockedDates, eventsFound, lastSync, supplierName } = await response.json()
      
      console.log('Sync successful:', { blockedDates: blockedDates?.length, eventsFound, supplierName })
      
      // Update sync settings
      setSyncSettings(prev => ({
        ...prev,
        status: 'connected',
        lastSync: lastSync
      }))
      
      // Trigger a global refresh event to reload supplier data
      window.dispatchEvent(new CustomEvent('supplierDataUpdated', {
        detail: { 
          type: 'calendar_sync',
          supplierId: currentSupplier?.id,
          blockedDates: blockedDates?.length || 0
        }
      }))
      
      // Also trigger the parent callback if provided
      if (onSyncToggle) {
        onSyncToggle({ 
          type: 'sync_completed', 
          blockedDates, 
          eventsFound,
          lastSync 
        })
      }
      
    } catch (error) {
      console.error('Manual sync failed:', error)
      setSyncSettings(prev => ({ ...prev, status: 'error' }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-300'
      case 'syncing': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'error': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <div className="border-t pt-6">
      <div className="mb-6">
        <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Google Calendar Integration
        </h4>
        <p className="text-sm text-gray-600">
          Automatically block dates when you have events in your Google Calendar
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Connection Status & Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="calendar-sync" className="text-base font-semibold text-gray-900">
                    Google Calendar Sync
                  </Label>
                  <Badge className={`text-xs ${getStatusColor(syncSettings.status)}`}>
                    {getStatusIcon(syncSettings.status)}
                    {syncSettings.status === 'connected' ? 'Connected' :
                     syncSettings.status === 'syncing' ? 'Syncing...' :
                     syncSettings.status === 'error' ? 'Error' : 'Not Connected'}
                  </Badge>
                </div>
              </div>
              <Switch
                id="calendar-sync"
                checked={syncSettings.enabled && syncSettings.connected}
                onCheckedChange={handleSyncToggle}
                disabled={isConnecting}
              />
            </div>

            {/* Connection Actions */}
            {!syncSettings.connected && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Connect your Google Calendar to automatically block dates when you have events scheduled.
                  <div className="mt-3">
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Connect Google Calendar
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Connected Settings */}
            {syncSettings.connected && (
              <div className="space-y-6">
                {/* Account Type Indicator */}
                {currentSupplier?.googleCalendarSync?.isWorkspaceAccount ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-green-900 mb-1">
                          Automatic Sync Enabled
                        </h5>
                        <p className="text-sm text-green-800 mb-2">
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
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-amber-900 mb-1">
                          Manual Sync Required
                        </h5>
                        <p className="text-sm text-amber-800">
                          Personal Gmail accounts require manual syncing. Consider upgrading to Google Workspace for automatic updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sync Frequency - only show for non-automatic accounts */}
                  {!currentSupplier?.googleCalendarSync?.isWorkspaceAccount && (
                    <div>
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">
                        Sync Frequency
                      </Label>
                      <Select
                        value={syncSettings.syncFrequency}
                        onValueChange={(value) => 
                          setSyncSettings(prev => ({ ...prev, syncFrequency: value }))
                        }
                      >
                        <SelectTrigger className="h-10">
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
                      onValueChange={(value) => 
                        setSyncSettings(prev => ({ ...prev, filterMode: value }))
                      }
                    >
                      <SelectTrigger className="h-10">
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

                {/* Last Sync & Manual Sync */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {syncSettings.lastSync ? (
                      <span>
                        Last synced: {new Date(syncSettings.lastSync).toLocaleString()}
                        {currentSupplier?.googleCalendarSync?.lastAutomaticSync && (
                          <span className="text-green-600 ml-1 font-medium">(automatic)</span>
                        )}
                      </span>
                    ) : (
                      <span>Never synced</span>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSync}
                    disabled={syncSettings.status === 'syncing'}
                    className="ml-4"
                  >
                    {syncSettings.status === 'syncing' ? (
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
                </div>

                {/* Expandable Help Section */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">How it works</span>
                    </div>
                    <div className={`transition-transform duration-200 ${showHelp ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {showHelp && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Events in your Google Calendar will automatically block those dates</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>All-day events block the entire day (morning + afternoon)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Timed events block the relevant time slot (morning/afternoon)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Manual blocks you create here will always take priority</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>You can disconnect anytime without losing your manual settings</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Disconnect Option */}
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Disconnect Google Calendar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GoogleCalendarSync