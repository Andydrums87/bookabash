// Create this as a temporary component to test: components/DebugPartyData.jsx
"use client"

import { useState } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function DebugPartyData() {
  const [debugResults, setDebugResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    console.log('🚀 Starting debug flow...')
    
    try {
      // Add the debug methods to your partyDatabaseBackend first
      const results = await partyDatabaseBackend.debugEntireFlow()
      setDebugResults(results)
      console.log('✅ Debug complete:', results)
    } catch (error) {
      console.error('❌ Debug failed:', error)
      setDebugResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const debugAllParties = async () => {
    setLoading(true)
    console.log('📊 Checking all parties...')
    
    try {
      const results = await partyDatabaseBackend.debugAllParties()
      console.log('✅ All parties debug complete:', results)
      setDebugResults(results)
    } catch (error) {
      console.error('❌ Debug all parties failed:', error)
      setDebugResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testSpecificQueries = async () => {
    console.log('🔍 Testing specific queries...')
    
    // Test 1: Raw auth check
    const { data: authUser } = await supabase.auth.getUser()
    console.log('Auth user:', authUser?.user?.id)

    // Test 2: Raw user query
    if (authUser?.user?.id) {
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.user.id)
      console.log('User profiles:', users)

      if (users?.[0]) {
        // Test 3: Raw party query
        const { data: parties } = await supabase
          .from('parties')
          .select('*')
          .eq('user_id', users[0].id)
        console.log('All parties:', parties)

        // Test 4: Specific party
        const { data: specificParty } = await supabase
          .from('parties')
          .select('*')
          .eq('id', '67e41e9f-67bc-417f-a9f7-a3d2841835f1')
        console.log('Specific party:', specificParty)
      }
    }
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold mb-4">🔧 Party Data Debug Tool</h3>
      
      <div className="space-y-4">
        <button
          onClick={runDebug}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Full Debug'}
        </button>

        <button
          onClick={debugAllParties}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
        >
          {loading ? 'Loading...' : 'Debug All Parties'}
        </button>

        <button
          onClick={testSpecificQueries}
          className="bg-green-500 text-white px-4 py-2 rounded ml-2"
        >
          Test Raw Queries
        </button>

        {debugResults && (
          <div className="mt-4 p-3 bg-white border rounded">
            <h4 className="font-semibold mb-2">Debug Results:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Expected:</strong></p>
        <ul className="list-disc ml-5">
          <li>Auth User ID: 7eabf2ee-f422-4ed6-9725-2e708348ecf4</li>
          <li>Party ID: 67e41e9f-67bc-417f-a9f7-a3d2841835f1</li>
          <li>Child Name: N J</li>
          <li>Status: planned</li>
        </ul>
      </div>
    </div>
  )
}