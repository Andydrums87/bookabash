"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import LocalStorageDashboard from './LocalStorageDashboard/LocalStorageDashboard'
import DatabaseDashboard from './DatabaseDashboard/DatabaseDashboard'
import DashboardWelcome from "./components/DashboardWelcome"
import SnappyLoader from "@/components/ui/SnappyLoader"

export default function DashboardPage() {
  const router = useRouter()
  
  const [userType, setUserType] = useState(null)
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
   
            setUserType('database')
          } else {
            // No planned party (drafts are ignored) - check localStorage
            const localPlan = localStorage.getItem('party_plan')
            const localDetails = localStorage.getItem('party_details')
          
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
         
              } catch (e) {
                console.log('Router: Failed to parse party_details for signed user')
              }
            }
            
            if (hasValidPartyPlan || hasValidPartyDetails) {
              // Has meaningful localStorage data - continue with localStorage dashboard
       
              setUserType('localStorage')
            } else {
              // Signed in but no meaningful data anywhere - show welcome
          
              setUserType('welcome')
            }
          }
        } else {
          // Not signed in - check for localStorage data only
          const localPlan = localStorage.getItem('party_plan')
          const localDetails = localStorage.getItem('party_details')
          
        
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
        
            } catch (e) {
              console.log('Router: Failed to parse party_details for unsigned user')
            }
          }
          
          if (hasValidPartyPlan || hasValidPartyDetails) {
            // Has meaningful localStorage data - use localStorage dashboard

            setUserType('localStorage')
          } else {
            // No data at all - show welcome page
 
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

    setIsLoading(true) // Show loading during refresh
    setRefreshKey(prev => prev + 1)
  }

  // Single loading screen for everything
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading your party dashboard..." />
      </div>
    )
  }

  // Render appropriate dashboard with preloaded data
  switch (userType) {
    case 'database':
      return <DatabaseDashboard  />
    case 'localStorage':
      return <LocalStorageDashboard onRefresh={handleRefresh} />
    case 'welcome':
      return <DashboardWelcome onRefresh={handleRefresh} />
    default:
      return <DashboardWelcome onRefresh={handleRefresh} />
  }
}