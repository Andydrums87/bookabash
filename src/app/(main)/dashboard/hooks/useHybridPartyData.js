// Add this to your dashboard page or create a custom hook

import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export function useHybridPartyData() {
  const [partyData, setPartyData] = useState(null)
  const [partyId, setPartyId] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [dataSource, setDataSource] = useState('localStorage') // 'localStorage' or 'database'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializePartyData = async () => {
      setLoading(true)
      
      try {
        // Check if user is signed in
        const userResult = await partyDatabaseBackend.getCurrentUser()
        const signedIn = userResult.success
        setIsSignedIn(signedIn)

        if (signedIn) {
          // User is signed in - check for database party first
          console.log('👤 User is signed in, checking for database party...')
          
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          
          if (partyResult.success && partyResult.party) {
            // Found database party - use it
            console.log('🎉 Using database party:', partyResult.party.id)
            setPartyData(partyResult.party.party_plan || {})
            setPartyId(partyResult.party.id)
            setDataSource('database')
          } else {
            // No database party - fall back to localStorage
            console.log('📦 No database party found, using localStorage')
            const localPartyPlan = localStorage.getItem('party_plan')
            setPartyData(localPartyPlan ? JSON.parse(localPartyPlan) : {})
            setPartyId(null)
            setDataSource('localStorage')
          }
        } else {
          // User not signed in - use localStorage only
          console.log('👥 User not signed in, using localStorage')
          const localPartyPlan = localStorage.getItem('party_plan')
          setPartyData(localPartyPlan ? JSON.parse(localPartyPlan) : {})
          setPartyId(null)
          setDataSource('localStorage')
        }
      } catch (error) {
        console.error('❌ Error initializing party data:', error)
        // Fall back to localStorage on error
        const localPartyPlan = localStorage.getItem('party_plan')
        setPartyData(localPartyPlan ? JSON.parse(localPartyPlan) : {})
        setPartyId(null)
        setDataSource('localStorage')
        setIsSignedIn(false)
      } finally {
        setLoading(false)
      }
    }

    initializePartyData()
  }, [])

  return {
    partyData,
    partyId,
    isSignedIn,
    dataSource,
    loading,
    // Helper to determine if we should show enquiry states
    shouldShowEnquiryStates: dataSource === 'database' && isSignedIn
  }
}
