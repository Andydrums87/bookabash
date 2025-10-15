"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import LocalStorageDashboard from './LocalStorageDashboard/LocalStorageDashboard'
import DatabaseDashboard from './DatabaseDashboard/DatabaseDashboard'
import DashboardWelcome from "./components/DashboardWelcome"
import SnappyLoader from "@/components/ui/SnappyLoader"
import DashboardSkeleton from "./DatabaseDashboard/components/DashboardSkeleton"


const getCachedUserType = () => {
  if (typeof window === 'undefined') return null
  
  try {
    // Check for database cache
    const dbCache = sessionStorage.getItem('party_data_cache')
    if (dbCache) {
      const { timestamp } = JSON.parse(dbCache)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        console.log('⚡ DashboardPage: Database cache found')
        return 'database'
      }
    }
    
    // Check for localStorage cache
    const lsCache = sessionStorage.getItem('party_plan_cache')
    if (lsCache) {
      const { timestamp } = JSON.parse(lsCache)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        console.log('⚡ DashboardPage: LocalStorage cache found')
        return 'localStorage'
      }
    }
    
    return null
  } catch {
    return null
  }
}

// ✅ NEW: Better localStorage validation
const hasValidLocalStorageParty = () => {
  if (typeof window === 'undefined') return false
  
  try {
    const localPlan = localStorage.getItem('user_party_plan') // ✅ Check both keys
    const oldLocalPlan = localStorage.getItem('party_plan')
    const localDetails = localStorage.getItem('party_details')
    
    console.log('🔍 Checking localStorage:', {
      hasUserPartyPlan: !!localPlan,
      hasPartyPlan: !!oldLocalPlan,
      hasPartyDetails: !!localDetails
    })
    
    // ✅ Check user_party_plan first (newer format)
    if (localPlan) {
      try {
        const parsed = JSON.parse(localPlan)
        // Any party plan object is valid
        if (parsed && typeof parsed === 'object') {
          console.log('✅ Found valid user_party_plan')
          return true
        }
      } catch (e) {
        console.error('Failed to parse user_party_plan:', e)
      }
    }
    
    // ✅ Check old party_plan format
    if (oldLocalPlan) {
      try {
        const parsed = JSON.parse(oldLocalPlan)
        const hasSuppliers = Object.keys(parsed).some(key => 
          parsed[key] && 
          typeof parsed[key] === 'object' && 
          parsed[key].name
        )
        if (hasSuppliers) {
          console.log('✅ Found valid party_plan')
          return true
        }
      } catch (e) {
        console.error('Failed to parse party_plan:', e)
      }
    }
    
    // ✅ Check party_details (looser validation)
    if (localDetails) {
      try {
        const parsed = JSON.parse(localDetails)
        const hasAnyData = parsed && (
          parsed.theme || 
          parsed.date || 
          parsed.childName ||
          parsed.guestCount ||
          parsed.postcode ||
          parsed.location
        )
        if (hasAnyData) {
          console.log('✅ Found valid party_details')
          return true
        }
      } catch (e) {
        console.error('Failed to parse party_details:', e)
      }
    }
    
    console.log('❌ No valid localStorage data found')
    return false
    
  } catch (error) {
    console.error('Error checking localStorage:', error)
    return false
  }
}

export default function DashboardPage() {

  console.log('🎯 DashboardPage component rendering!')
  const router = useRouter()
  
  const cachedUserType = getCachedUserType()
  const hasCache = cachedUserType !== null
  
  const [userType, setUserType] = useState(cachedUserType)
  const [isLoading, setIsLoading] = useState(!hasCache)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const determineUserType = async () => {
      // ✅ If we have cache, skip loading immediately
      if (hasCache) {
        console.log('⚡ DashboardPage: Using cached user type:', cachedUserType)
        setUserType(cachedUserType)
        setIsLoading(false)
        return
      }
      
      try {
        console.log('🔍 Determining user type...')
        
        // ✅ SIMPLIFIED: Check localStorage FIRST before any auth checks
        const hasLocalData = hasValidLocalStorageParty()
        
        if (hasLocalData) {
          console.log('✅ Found localStorage data - using LocalStorage mode')
          setUserType('localStorage')
          
          // Cache it
          sessionStorage.setItem('party_plan_cache', JSON.stringify({
            timestamp: Date.now()
          }))
          setIsLoading(false)
          return
        }
        
        // ✅ Only check database if no localStorage data
        console.log('🔍 No localStorage data, checking database...')
        const userResult = await partyDatabaseBackend.getCurrentUser()
        
        if (userResult.success) {
          console.log('✅ User authenticated, checking for database party...')
          const partyResult = await partyDatabaseBackend.getCurrentParty()
          
          if (partyResult.success && partyResult.party) {
            console.log('✅ Found database party')
            setUserType('database')
            
            // Cache it
            sessionStorage.setItem('party_data_cache', JSON.stringify({
              timestamp: Date.now()
            }))
          } else {
            console.log('❌ No database party found, showing welcome')
            setUserType('welcome')
          }
        } else {
          console.log('❌ User not authenticated, no localStorage data - showing welcome')
          setUserType('welcome')
        }
        
      } catch (error) {
        console.error('❌ Error determining user type:', error)
        
        // ✅ ERROR FALLBACK: Check localStorage one more time
        if (hasValidLocalStorageParty()) {
          console.log('✅ Error occurred but found localStorage data')
          setUserType('localStorage')
        } else {
          setUserType('welcome')
        }
      } finally {
        setIsLoading(false)
      }
    }
   
    determineUserType()
  }, [refreshKey, hasCache, cachedUserType])

  const handleRefresh = () => {
    setIsLoading(true)
    // Clear cache on refresh
    sessionStorage.removeItem('party_data_cache')
    sessionStorage.removeItem('party_plan_cache')
    setRefreshKey(prev => prev + 1)
  }

  // ✅ Only show loader if loading AND no cache
  if (isLoading && !hasCache) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SnappyLoader text="Loading your party..." />
      </div>
    )
  }

  console.log('🎯 Rendering dashboard with userType:', userType)


  switch (userType) {
    case 'database':
      return <DatabaseDashboard />
    case 'localStorage':
      return <LocalStorageDashboard onRefresh={handleRefresh} />
    case 'welcome':
      return <DashboardWelcome onRefresh={handleRefresh} />
    default:
      return <DashboardWelcome onRefresh={handleRefresh} />
  }
}