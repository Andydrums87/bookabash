"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugBusinessSwitchEvents() {
  const [events, setEvents] = useState([])
  const [testBusinessId, setTestBusinessId] = useState('froggle-primary')

  useEffect(() => {
    // Listen for ALL possible business switch events
    const handleBusinessSwitch1 = (event) => {
      console.log('🔄 EVENT 1: businessSwitched detected:', event.detail)
      setEvents(prev => [...prev, {
        type: 'businessSwitched',
        detail: event.detail,
        timestamp: new Date().toLocaleTimeString()
      }])
    }

    const handleBusinessSwitch2 = (event) => {
      console.log('🔄 EVENT 2: supplierDataChanged detected:', event.detail)
      setEvents(prev => [...prev, {
        type: 'supplierDataChanged', 
        detail: event.detail,
        timestamp: new Date().toLocaleTimeString()
      }])
    }

    const handleBusinessSwitch3 = (event) => {
      console.log('🔄 EVENT 3: supplierUpdated detected:', event.detail)
      setEvents(prev => [...prev, {
        type: 'supplierUpdated',
        detail: event.detail,
        timestamp: new Date().toLocaleTimeString()
      }])
    }

    // Listen for all possible events
    window.addEventListener('businessSwitched', handleBusinessSwitch1)
    window.addEventListener('supplierDataChanged', handleBusinessSwitch2)
    window.addEventListener('supplierUpdated', handleBusinessSwitch3)

    return () => {
      window.removeEventListener('businessSwitched', handleBusinessSwitch1)
      window.removeEventListener('supplierDataChanged', handleBusinessSwitch2)
      window.removeEventListener('supplierUpdated', handleBusinessSwitch3)
    }
  }, [])

  const clearEvents = () => {
    setEvents([])
  }

  const triggerTestEvent = () => {
    // Fire a test business switch event
    window.dispatchEvent(new CustomEvent('businessSwitched', {
      detail: {
        businessId: 'test-business-id',
        business: {
          id: 'test-business-id',
          name: 'Test Business'
        }
      }
    }))
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔍 Business Switch Event Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={triggerTestEvent} size="sm">
              🧪 Fire Test Event
            </Button>
            <Button onClick={clearEvents} variant="outline" size="sm">
              🗑️ Clear Events
            </Button>
          </div>

          <div className="bg-white p-4 rounded border max-h-60 overflow-y-auto">
            <div className="text-sm font-medium mb-2">
              Events Detected: {events.length}
            </div>
            
            {events.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No events detected yet. Try switching businesses in the business switcher above.
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium text-blue-700">
                      {event.timestamp} - {event.type}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {JSON.stringify(event.detail, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-600">
            <strong>Instructions:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click "Fire Test Event" to test if event listening works</li>
              <li>Use the business switcher to switch to "Your Name - Princess Parties"</li>
              <li>Check if any events appear in the log above</li>
              <li>If no events appear, the business switcher isn't firing events correctly</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}