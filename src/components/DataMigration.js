// components/DataMigration.js
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DataMigration() {
  const [status, setStatus] = useState('')
  const [migrating, setMigrating] = useState(false)
  const [results, setResults] = useState(null)

  const migrateData = async () => {
    setMigrating(true)
    setStatus('Starting migration...')
    
    try {
      // Get localStorage data
      const allSuppliersData = localStorage.getItem('allSuppliers')
      
      if (!allSuppliersData) {
        setStatus('No suppliers found in localStorage')
        setMigrating(false)
        return
      }
      
      const suppliers = JSON.parse(allSuppliersData)
      setStatus(`Found ${suppliers.length} suppliers to migrate`)
      
      let successCount = 0
      let errorCount = 0
      let errors = [] // Track specific errors
      
      // Migrate each supplier
      for (let i = 0; i < suppliers.length; i++) {
        const supplier = suppliers[i]
        setStatus(`Migrating ${i + 1}/${suppliers.length}: ${supplier.name}`)
        
        try {
          const { error } = await supabase
            .from('suppliers')
            .insert({
              legacy_id: supplier.id,
              data: supplier
            })
          
          if (error) {
            console.error(`Error migrating ${supplier.name}:`, error)
            errors.push(`${supplier.name}: ${error.message}`)
            errorCount++
          } else {
            successCount++
          }
        } catch (error) {
          console.error(`Error migrating ${supplier.name}:`, error)
          errors.push(`${supplier.name}: ${error.message}`)
          errorCount++
        }
      }
      
      setResults({ successCount, errorCount, total: suppliers.length, errors })
      setStatus(`Migration complete! Success: ${successCount}, Errors: ${errorCount}`)
      
    } catch (error) {
      setStatus(`Migration failed: ${error.message}`)
      console.error('Migration error:', error)
    } finally {
      setMigrating(false)
    }
  }

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...')
      
      // Debug: Check if env vars are loaded
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Key (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10))
      
      // Test basic connection
      const { data, error } = await supabase
        .from('suppliers')
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        setStatus(`Connection error: ${error.message}`)
        console.error('Supabase error:', error)
        console.error('Full error object:', error)
        return
      }
      
      setStatus('✅ Supabase connection successful!')
      console.log('Connection test passed')
    } catch (error) {
      setStatus(`Connection failed: ${error.message}`)
      console.error('Connection error:', error)
    }
  }

  const checkMigrationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, legacy_id, data->name')
        .limit(10)
      
      if (error) {
        setStatus(`Error checking: ${error.message}`)
        return
      }
      
      setStatus(`Found ${data?.length || 0} suppliers in Supabase database`)
      console.log('Sample suppliers:', data)
    } catch (error) {
      setStatus(`Check failed: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Data Migration Tool</h2>
      
      <div className="space-y-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Supabase Connection
        </button>
        
        <button
          onClick={checkMigrationStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Current Data in Supabase
        </button>
        
        <button
          onClick={migrateData}
          disabled={migrating}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {migrating ? 'Migrating...' : 'Migrate LocalStorage to Supabase'}
        </button>
        
        {status && (
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="font-semibold">Status:</h3>
            <p>{status}</p>
          </div>
        )}
        
        {results && (
          <div className="p-4 border rounded bg-green-50">
            <h3 className="font-semibold">Migration Results:</h3>
            <ul>
              <li>Total suppliers: {results.total}</li>
              <li>Successfully migrated: {results.successCount}</li>
              <li>Errors: {results.errorCount}</li>
            </ul>
            
            {results.errors && results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600">Errors:</h4>
                <div className="max-h-40 overflow-y-auto text-sm">
                  {results.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-red-600">{error}</div>
                  ))}
                  {results.errors.length > 5 && (
                    <div className="text-gray-500">... and {results.errors.length - 5} more errors</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}