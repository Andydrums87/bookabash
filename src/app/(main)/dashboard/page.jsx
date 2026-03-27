// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
// import LocalStorageDashboard from './LocalStorageDashboard/LocalStorageDashboard'
// import DatabaseDashboard from './DatabaseDashboard/DatabaseDashboard'
// import DashboardWelcome from "./components/DashboardWelcome"
// import SnappyLoader from "@/components/ui/SnappyLoader"
// import DashboardSkeleton from "./DatabaseDashboard/components/DashboardSkeleton"


// const getCachedUserType = () => {
//   if (typeof window === 'undefined') return null
  
//   try {
//     // Check for database cache
//     const dbCache = sessionStorage.getItem('party_data_cache')
//     if (dbCache) {
//       const { timestamp } = JSON.parse(dbCache)
//       if (Date.now() - timestamp < 5 * 60 * 1000) {
//         console.log('⚡ DashboardPage: Database cache found')
//         return 'database'
//       }
//     }
    
//     // Check for localStorage cache
//     const lsCache = sessionStorage.getItem('party_plan_cache')
//     if (lsCache) {
//       const { timestamp } = JSON.parse(lsCache)
//       if (Date.now() - timestamp < 5 * 60 * 1000) {
//         console.log('⚡ DashboardPage: LocalStorage cache found')
//         return 'localStorage'
//       }
//     }
    
//     return null
//   } catch {
//     return null
//   }
// }

// // ✅ NEW: Better localStorage validation
// const hasValidLocalStorageParty = () => {
//   if (typeof window === 'undefined') return false
  
//   try {
//     const localPlan = localStorage.getItem('user_party_plan') // ✅ Check both keys
//     const oldLocalPlan = localStorage.getItem('party_plan')
//     const localDetails = localStorage.getItem('party_details')
    
//     console.log('🔍 Checking localStorage:', {
//       hasUserPartyPlan: !!localPlan,
//       hasPartyPlan: !!oldLocalPlan,
//       hasPartyDetails: !!localDetails
//     })
    
//     // ✅ Check user_party_plan first (newer format)
//     if (localPlan) {
//       try {
//         const parsed = JSON.parse(localPlan)
//         // Any party plan object is valid
//         if (parsed && typeof parsed === 'object') {
//           console.log('✅ Found valid user_party_plan')
//           return true
//         }
//       } catch (e) {
//         console.error('Failed to parse user_party_plan:', e)
//       }
//     }
    
//     // ✅ Check old party_plan format
//     if (oldLocalPlan) {
//       try {
//         const parsed = JSON.parse(oldLocalPlan)
//         const hasSuppliers = Object.keys(parsed).some(key => 
//           parsed[key] && 
//           typeof parsed[key] === 'object' && 
//           parsed[key].name
//         )
//         if (hasSuppliers) {
//           console.log('✅ Found valid party_plan')
//           return true
//         }
//       } catch (e) {
//         console.error('Failed to parse party_plan:', e)
//       }
//     }
    
//     // ✅ Check party_details (looser validation)
//     if (localDetails) {
//       try {
//         const parsed = JSON.parse(localDetails)
//         const hasAnyData = parsed && (
//           parsed.theme || 
//           parsed.date || 
//           parsed.childName ||
//           parsed.guestCount ||
//           parsed.postcode ||
//           parsed.location
//         )
//         if (hasAnyData) {
//           console.log('✅ Found valid party_details')
//           return true
//         }
//       } catch (e) {
//         console.error('Failed to parse party_details:', e)
//       }
//     }
    
//     console.log('❌ No valid localStorage data found')
//     return false
    
//   } catch (error) {
//     console.error('Error checking localStorage:', error)
//     return false
//   }
// }

// export default function DashboardPage() {

//   console.log('🎯 DashboardPage component rendering!')
//   const router = useRouter()
  
//   const cachedUserType = getCachedUserType()
//   const hasCache = cachedUserType !== null
  
//   const [userType, setUserType] = useState(cachedUserType)
//   const [isLoading, setIsLoading] = useState(!hasCache)
//   const [refreshKey, setRefreshKey] = useState(0)

//   useEffect(() => {
//     const determineUserType = async () => {
//       // ✅ If we have cache, skip loading immediately
//       if (hasCache) {
//         console.log('⚡ DashboardPage: Using cached user type:', cachedUserType)
//         setUserType(cachedUserType)
//         setIsLoading(false)
//         return
//       }
      
//       try {
//         console.log('🔍 Determining user type...')
        
//         // ✅ FIXED: Check authentication FIRST before localStorage
//         console.log('🔐 Step 1: Checking authentication...')
//         const userResult = await partyDatabaseBackend.getCurrentUser()
        
//         if (userResult.success) {
//           console.log('✅ User authenticated, checking for database party...')
//           const partyResult = await partyDatabaseBackend.getCurrentParty()
          
//           if (partyResult.success && partyResult.party) {
//             console.log('✅ Found database party - using Database mode')
//             setUserType('database')
            
//             // Cache it
//             sessionStorage.setItem('party_data_cache', JSON.stringify({
//               timestamp: Date.now()
//             }))
            
//             // ✅ OPTIONAL: Clean up any old localStorage data to prevent confusion
//             // Uncomment if you want to auto-cleanup localStorage on sign-in
//             // localStorage.removeItem('user_party_plan')
//             // localStorage.removeItem('party_plan')
//             // localStorage.removeItem('party_details')
//             // console.log('🧹 Cleaned up old localStorage data')
            
//             setIsLoading(false)
//             return // ✅ Exit early - authenticated user with party
//           } else {
//             console.log('⚠️ Authenticated but no database party - showing welcome')
//             setUserType('welcome')
//             setIsLoading(false)
//             return // ✅ Exit early - authenticated user without party
//           }
//         }
        
//         // ✅ ONLY check localStorage if user is NOT authenticated
//         console.log('🔍 Step 2: User not authenticated, checking localStorage...')
//         const hasLocalData = hasValidLocalStorageParty()
        
//         if (hasLocalData) {
//           console.log('✅ Found localStorage data - using LocalStorage mode')
//           setUserType('localStorage')
          
//           // Cache it
//           sessionStorage.setItem('party_plan_cache', JSON.stringify({
//             timestamp: Date.now()
//           }))
//         } else {
//           console.log('❌ No data found anywhere - showing welcome')
//           setUserType('welcome')
//         }
        
//       } catch (error) {
//         console.error('❌ Error determining user type:', error)
        
//         // ✅ ERROR FALLBACK: Only check localStorage if auth check failed
//         if (hasValidLocalStorageParty()) {
//           console.log('✅ Error occurred but found localStorage data')
//           setUserType('localStorage')
//         } else {
//           setUserType('welcome')
//         }
//       } finally {
//         setIsLoading(false)
//       }
//     }
   
//     determineUserType()
//   }, [refreshKey, hasCache, cachedUserType])

//   const handleRefresh = () => {
//     setIsLoading(true)
//     // Clear cache on refresh
//     sessionStorage.removeItem('party_data_cache')
//     sessionStorage.removeItem('party_plan_cache')
//     setRefreshKey(prev => prev + 1)
//   }

//   // ✅ Only show loader if loading AND no cache
//   if (isLoading && !hasCache) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <SnappyLoader text="Loading your party..." />
//       </div>
//     )
//   }

//   console.log('🎯 Rendering dashboard with userType:', userType)


//   switch (userType) {
//     case 'database':
//       return <DatabaseDashboard />
//     case 'localStorage':
//       return <LocalStorageDashboard onRefresh={handleRefresh} />
//     case 'welcome':
//       return <DashboardWelcome onRefresh={handleRefresh} />
//     default:
//       return <DashboardWelcome onRefresh={handleRefresh} />
//   }
// }

"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import LocalStorageDashboard from './LocalStorageDashboard/LocalStorageDashboard'
import DatabaseDashboard from './DatabaseDashboard/DatabaseDashboard'
import DashboardWelcome from "./components/DashboardWelcome"

// Wrapper component to handle Suspense for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}

// Main dashboard content
function DashboardContent() {

  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if user explicitly wants to view their database parties
  const forcePartiesView = searchParams.get('view') === 'parties'

  // Fast path: detect party_setup/show_welcome on first render to avoid blank frame
  const isFastPath = searchParams.get("source") === "party_setup" || searchParams.get("show_welcome") === "true"

  const [userType, setUserType] = useState(isFastPath ? 'localStorage' : null)
  const [isLoading, setIsLoading] = useState(!isFastPath)
  const [debugInfo, setDebugInfo] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const determineUserType = async () => {
      setIsLoading(true)

      // Fast path: if coming from party-setup or show_welcome, skip auth check
      // We know it's a localStorage user who just finished the setup flow
      const source = searchParams.get("source")
      if (searchParams.get("show_welcome") === "true" || source === "party_setup") {
        setUserType('localStorage')
        setIsLoading(false)
        return
      }

      // Small delay to ensure localStorage is available after navigation
      await new Promise(resolve => setTimeout(resolve, 100))

      const debug = {
        timestamp: new Date().toISOString(),
        steps: []
      }

      try {
        // ============================================
        // STEP 1: Check Authentication Status
        // ============================================
        debug.steps.push('🔐 STEP 1: Checking authentication...')
  
        
        const userResult = await partyDatabaseBackend.getCurrentUser()
        
        debug.authCheck = {
          success: userResult.success,
          hasUser: !!userResult.user,
          userId: userResult.user?.id,
          error: userResult.error
        }
        

        
        // ============================================
        // AUTHENTICATED USER PATH
        // ============================================
        if (userResult.success && userResult.user) {
          debug.steps.push('✅ User is authenticated')
    
          
          // Check for database party
          debug.steps.push('🔍 STEP 2: Checking for database party...')

          
          const partyResult = await partyDatabaseBackend.getCurrentParty()

          debug.partyCheck = {
            success: partyResult.success,
            hasParty: !!partyResult.party,
            partyId: partyResult.party?.id,
            error: partyResult.error
          }

          // ✅ If user explicitly requested parties view (from ?view=parties),
          // skip localStorage check and go straight to database dashboard
          if (forcePartiesView && partyResult.success && partyResult.party) {
            debug.steps.push('🎯 User requested parties view → DATABASE DASHBOARD (forced)')
            debug.finalDecision = 'database-forced'

            setDebugInfo(debug)
            setUserType('database')
            setIsLoading(false)
            return
          }

          // ✅ NEW: Check if localStorage party is newer than database party
          const localStorageCheck = checkLocalStorage()
          let isLocalStorageNewer = false

          if (localStorageCheck.hasValidData && partyResult.success && partyResult.party) {
            try {
              const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}')
              const localCreatedAt = partyDetails.createdAt ? new Date(partyDetails.createdAt).getTime() : 0
              const dbCreatedAt = partyResult.party.created_at ? new Date(partyResult.party.created_at).getTime() : 0

              isLocalStorageNewer = localCreatedAt > dbCreatedAt

              debug.partyTimestamps = {
                localCreatedAt: partyDetails.createdAt,
                dbCreatedAt: partyResult.party.created_at,
                isLocalStorageNewer,
                timeDiff: localCreatedAt - dbCreatedAt
              }
            } catch (e) {
              console.warn('Error comparing timestamps:', e)
            }
          }

          debug.newPartyCheck = {
            hasLocalStorage: localStorageCheck.hasValidData,
            hasDbParty: partyResult.success && !!partyResult.party,
            isLocalStorageNewer
          }

          
          // ✅ PRIORITY: If localStorage party is newer than DB party, show LocalStorageDashboard
          if (isLocalStorageNewer && localStorageCheck.hasValidData) {
            debug.steps.push('🎉 LocalStorage party is NEWER → LOCALSTORAGE DASHBOARD (will be saved as new party)')
            debug.finalDecision = 'localStorage'

      

            setDebugInfo(debug)
            setUserType('localStorage')
            setIsLoading(false)
            return
          }

          if (partyResult.success && partyResult.party) {
            // ✅ Authenticated + Has Database Party = DATABASE DASHBOARD
            debug.steps.push('✅ Database party found → DATABASE DASHBOARD')
            debug.finalDecision = 'database'


            setDebugInfo(debug)
            setUserType('database')
            setIsLoading(false)
            return
          } else {
            // ⚠️ Authenticated but no database party - CHECK LOCALSTORAGE!
            // This happens when user signs in during review-book flow
            // Party hasn't migrated to database yet (happens on payment)
            debug.steps.push('⚠️ No database party - checking localStorage...')
      

            const localStorageCheck = checkLocalStorage()
            debug.localStorageCheck = localStorageCheck
        

            if (localStorageCheck.hasValidData) {
              // ✅ Authenticated + No DB Party + Has localStorage = LOCALSTORAGE DASHBOARD
              debug.steps.push('✅ Valid localStorage found → LOCALSTORAGE DASHBOARD (authenticated mode)')
              debug.finalDecision = 'localStorage'
    

              setDebugInfo(debug)
              setUserType('localStorage')
              setIsLoading(false)
              return
            } else {
              // ❌ Authenticated + No DB Party + No localStorage = WELCOME
              debug.steps.push('❌ No localStorage either → WELCOME SCREEN')
              debug.finalDecision = 'welcome'
          

              setDebugInfo(debug)
              setUserType('welcome')
              setIsLoading(false)
              return
            }
          }
        }
        
        // ============================================
        // UNAUTHENTICATED USER PATH
        // ============================================
        debug.steps.push('❌ User NOT authenticated')
      
        
        // STEP 3: Check localStorage ONLY for unauthenticated users
        debug.steps.push('🔍 STEP 3: Checking localStorage...')
      
        
        const localStorageCheck = checkLocalStorage()
        debug.localStorageCheck = localStorageCheck

        
        if (localStorageCheck.hasValidData) {
          // ✅ Unauthenticated + Has localStorage = LOCALSTORAGE DASHBOARD
          debug.steps.push('✅ Valid localStorage found → LOCALSTORAGE DASHBOARD')
          debug.finalDecision = 'localStorage'


          setDebugInfo(debug)
          setUserType('localStorage')
          setIsLoading(false)
          return
        } else {
          // ❌ No data anywhere = REDIRECT TO SIGN IN
          debug.steps.push('❌ No valid data found → REDIRECT TO SIGN IN')
          debug.finalDecision = 'redirect-signin'


          setDebugInfo(debug)
          router.push('/signin')
          return
        }
        
      } catch (error) {
        console.error('💥 CRITICAL ERROR in determineUserType:', error)
        debug.steps.push(`💥 ERROR: ${error.message}`)
        debug.error = error.message
        debug.finalDecision = 'error-fallback-welcome'
        
        setDebugInfo(debug)
        setUserType('welcome')
        setIsLoading(false)
      }
    }
   
    determineUserType()
  }, [refreshKey, forcePartiesView])

  const handleRefresh = () => {

    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
  }

  // ============================================
  // SHOW DEBUG INFO IN DEV
  // ============================================
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
   
      // Store in window for easy access in console
      window.__dashboardDebug = debugInfo
    }
  }, [debugInfo])

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return null
  }



  // ============================================
  // RENDER APPROPRIATE DASHBOARD
  // ============================================
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

// ============================================
// HELPER: Check localStorage
// ============================================
function checkLocalStorage() {
  if (typeof window === 'undefined') {
    return { hasValidData: false, reason: 'SSR' }
  }
  
  try {
    const checks = {
      user_party_plan: localStorage.getItem('user_party_plan'),
      party_plan: localStorage.getItem('party_plan'),
      party_details: localStorage.getItem('party_details')
    }
    

    
    // Check user_party_plan (newest format)
    if (checks.user_party_plan) {
      try {
        const parsed = JSON.parse(checks.user_party_plan)
        if (parsed && typeof parsed === 'object') {

          return { 
            hasValidData: true, 
            source: 'user_party_plan',
            data: parsed
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse user_party_plan:', e)
      }
    }
    
    // Check party_plan (old format)
    if (checks.party_plan) {
      try {
        const parsed = JSON.parse(checks.party_plan)
        const hasSuppliers = Object.keys(parsed).some(key => 
          parsed[key] && 
          typeof parsed[key] === 'object' && 
          parsed[key].name
        )
        if (hasSuppliers) {
          console.log('✅ Valid party_plan found')
          return { 
            hasValidData: true, 
            source: 'party_plan',
            data: parsed
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse party_plan:', e)
      }
    }
    
    // Check party_details
    if (checks.party_details) {
      try {
        const parsed = JSON.parse(checks.party_details)
        const hasAnyData = parsed && (
          parsed.theme || 
          parsed.date || 
          parsed.childName ||
          parsed.guestCount ||
          parsed.postcode ||
          parsed.location
        )
        if (hasAnyData) {
          console.log('✅ Valid party_details found')
          return { 
            hasValidData: true, 
            source: 'party_details',
            data: parsed
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse party_details:', e)
      }
    }
    
    console.log('❌ No valid localStorage data found')
    return { 
      hasValidData: false, 
      reason: 'no_valid_data',
      checkedKeys: Object.keys(checks).filter(k => checks[k])
    }
    
  } catch (error) {
    console.error('💥 Error checking localStorage:', error)
    return { 
      hasValidData: false, 
      reason: 'error',
      error: error.message
    }
  }
}