"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import LocalStorageDashboard from './LocalStorageDashboard/LocalStorageDashboard'
import DatabaseDashboard from './DatabaseDashboard/DatabaseDashboard'
import DashboardWelcome from "./components/DashboardWelcome"
import { SnappyLoader } from "@/components/ui/SnappyLoader"

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
          // User is signed in - check for PLANNED party only (ignores drafts)
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          
          if (partyResult.success && partyResult.party) {
            // Has planned party - use database dashboard
            console.log('Router: User has planned party, showing DatabaseDashboard')
            setUserType('database')
          } else {
            // No planned party (drafts are ignored) - check localStorage
            const localPlan = localStorage.getItem('party_plan')
            const localDetails = localStorage.getItem('party_details')
            
            console.log('Router: Signed user has no planned party, checking localStorage:', { 
              localPlan: !!localPlan, 
              localDetails: !!localDetails 
            })
            
            // Validate localStorage data
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
                console.log('Router: Party plan validity for signed user:', hasValidPartyPlan)
              } catch (e) {
                console.log('Router: Failed to parse party_plan for signed user')
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
                console.log('Router: Party details validity for signed user:', hasValidPartyDetails)
              } catch (e) {
                console.log('Router: Failed to parse party_details for signed user')
              }
            }
            
            if (hasValidPartyPlan || hasValidPartyDetails) {
              // Has meaningful localStorage data - continue with localStorage dashboard
              console.log('Router: Signed user with valid localStorage data, showing LocalStorageDashboard')
              setUserType('localStorage')
            } else {
              // Signed in but no meaningful data anywhere - show welcome
              console.log('Router: Signed user with no data, showing welcome page')
              setUserType('welcome')
            }
          }
        } else {
          // Not signed in - check for localStorage data only
          const localPlan = localStorage.getItem('party_plan')
          const localDetails = localStorage.getItem('party_details')
          
          console.log('Router: Unsigned user, checking localStorage:', { 
            localPlan: !!localPlan, 
            localDetails: !!localDetails 
          })
          
          // Validate localStorage data for unsigned users
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
              console.log('Router: Party plan validity for unsigned user:', hasValidPartyPlan)
            } catch (e) {
              console.log('Router: Failed to parse party_plan for unsigned user')
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
              console.log('Router: Party details validity for unsigned user:', hasValidPartyDetails)
            } catch (e) {
              console.log('Router: Failed to parse party_details for unsigned user')
            }
          }
          
          if (hasValidPartyPlan || hasValidPartyDetails) {
            // Has meaningful localStorage data - use localStorage dashboard
            console.log('Router: Unsigned user with valid localStorage data, showing LocalStorageDashboard')
            setUserType('localStorage')
          } else {
            // No data at all - show welcome page
            console.log('Router: No data found anywhere, showing welcome page')
            setUserType('welcome')
          }
        }
      } catch (error) {
        console.error('Router: Error determining user type:', error)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading your party dashboard..." />
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