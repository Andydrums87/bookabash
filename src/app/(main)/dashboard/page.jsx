"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import LocalStorageDashboard from './LocalStorageDashboard/LocalStorageDashboard'
import DatabaseDashboard from './DatabaseDashboard/DatabaseDashboard'
import DashboardWelcome from "./components/DashboardWelcome"

export default function DashboardPage() {
  const router = useRouter()
  
  const [userType, setUserType] = useState(null) // null | 'localStorage' | 'database' | 'welcome'
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const determineUserType = async () => {
      try {
        // Check if user is signed in
        const userResult = await partyDatabaseBackend.getCurrentUser()
        
        if (userResult.success) {
          // User is signed in - check for database party
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          
          if (partyResult.success && partyResult.party) {
            // Has database party - use database dashboard
            console.log('🎯 Router: User has database party, showing DatabaseDashboard')
            setUserType('database')
          } else {
            // Signed in but no database party - check localStorage
            const localPlan = localStorage.getItem('party_plan')
            const localDetails = localStorage.getItem('party_details')
            
            console.log('🔍 Router: Checking localStorage data for signed user:', { 
              localPlan: !!localPlan, 
              localDetails: !!localDetails 
            })
            
            // Parse and check localStorage data more thoroughly
            let hasValidPartyPlan = false
            let hasValidPartyDetails = false
            
            if (localPlan) {
              try {
                const parsedPlan = JSON.parse(localPlan)
                hasValidPartyPlan = parsedPlan && (
                  Object.keys(parsedPlan).some(key => 
                    parsedPlan[key] && 
                    typeof parsedPlan[key] === 'object' && 
                    parsedPlan[key].name
                  )
                )
                console.log('📦 Router: Party plan validity:', hasValidPartyPlan)
              } catch (e) {
                console.log('⚠️ Router: Failed to parse party_plan')
              }
            }
            
            if (localDetails) {
              try {
                const parsedDetails = JSON.parse(localDetails)
                hasValidPartyDetails = parsedDetails && (
                  parsedDetails.theme || 
                  parsedDetails.date || 
                  (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
                  parsedDetails.guestCount ||
                  parsedDetails.postcode
                )
                console.log('📋 Router: Party details validity:', hasValidPartyDetails)
              } catch (e) {
                console.log('⚠️ Router: Failed to parse party_details')
              }
            }
            
            if (hasValidPartyPlan || hasValidPartyDetails) {
              // Has meaningful party data - use localStorage dashboard with migration prompt
              console.log('🎯 Router: Found valid localStorage data for signed user, showing LocalStorageDashboard with migration option')
              setUserType('localStorage')
            } else {
              // Signed in but no meaningful data - show welcome with party creation options
              console.log('🎯 Router: Signed user with no data, showing welcome page')
              setUserType('welcome')
            }
          }
        } else {
          // Not signed in - check for localStorage data
          const localPlan = localStorage.getItem('party_plan')
          const localDetails = localStorage.getItem('party_details')
          
          console.log('🔍 Router: Checking localStorage data for unsigned user:', { 
            localPlan: !!localPlan, 
            localDetails: !!localDetails 
          })
          
          // Parse and check localStorage data more thoroughly
          let hasValidPartyPlan = false
          let hasValidPartyDetails = false
          
          if (localPlan) {
            try {
              const parsedPlan = JSON.parse(localPlan)
              hasValidPartyPlan = parsedPlan && (
                Object.keys(parsedPlan).some(key => 
                  parsedPlan[key] && 
                  typeof parsedPlan[key] === 'object' && 
                  parsedPlan[key].name
                )
              )
              console.log('📦 Router: Party plan validity (unsigned):', hasValidPartyPlan)
            } catch (e) {
              console.log('⚠️ Router: Failed to parse party_plan (unsigned)')
            }
          }
          
          if (localDetails) {
            try {
              const parsedDetails = JSON.parse(localDetails)
              hasValidPartyDetails = parsedDetails && (
                parsedDetails.theme || 
                parsedDetails.date || 
                (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
                parsedDetails.guestCount ||
                parsedDetails.postcode
              )
              console.log('📋 Router: Party details validity (unsigned):', hasValidPartyDetails)
            } catch (e) {
              console.log('⚠️ Router: Failed to parse party_details (unsigned)')
            }
          }
          
          if (hasValidPartyPlan || hasValidPartyDetails) {
            // Has meaningful party data - use localStorage dashboard
            console.log('🎯 Router: Found valid localStorage data for unsigned user, showing LocalStorageDashboard')
            setUserType('localStorage')
          } else {
            // No data at all - show welcome with auth and party creation options
            console.log('🎯 Router: No data found, showing welcome page')
            setUserType('welcome')
          }
        }
      } catch (error) {
        console.error('❌ Router: Error determining user type:', error)
        // On error, show welcome page to avoid blocking users
        setUserType('welcome')
      } finally {
        setIsLoading(false)
      }
    }

    determineUserType()
  }, [refreshKey])

  // Handle refresh after party creation or sign in
  const handleRefresh = () => {
    console.log("🔄 Refreshing dashboard router...")
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your party...</p>
        </div>
      </div>
    )
  }

  // Clean routing based on user type
  switch (userType) {
    case 'database':
      return <DatabaseDashboard />
    case 'localStorage':
      return <LocalStorageDashboard onRefresh={handleRefresh} />
    case 'welcome':
      return <DashboardWelcome onRefresh={handleRefresh} />
    default:
      return <DashboardWelcome onRefresh={handleRefresh} /> // Fallback
  }
}