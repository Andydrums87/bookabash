// hooks/usePartyData.js - FIXED VERSION with consolidated loading
import { useState, useEffect, useRef } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { supabase } from '@/lib/supabase'
import { useConsolidatedLoading } from './useConsolidatedLoading'
import { useSearchParams } from 'next/navigation'


const CACHE_KEY = 'party_data_cache'
const CACHE_DURATION = 5 * 60 * 1000

const getCachedData = (partyId) => {
  if (typeof window === 'undefined') return null

  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp, partyDetails, partyTheme, cachedPartyId } = JSON.parse(cached) // ✅ Add partyId

    // ✅ FIX: Only invalidate cache if we have BOTH IDs and they don't match
    // If partyId is null/undefined (no URL param), allow cache to be used
    if (partyId && cachedPartyId && cachedPartyId !== partyId) {
      console.log('🔄 Party ID changed - invalidating cache', { cachedPartyId, newPartyId: partyId })
      sessionStorage.removeItem(CACHE_KEY)
      // Also clear any other cached data to force fresh load
      sessionStorage.removeItem('party_plan_cache')
      return null
    }

    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log('✅ Cache hit with party details, cachedPartyId:', cachedPartyId, 'urlPartyId:', partyId)
      return { data, partyDetails, partyTheme } // ✅ Return all
    }

    sessionStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    return null
  }
}

const setCachedData = (data, partyDetails, partyTheme, partyId) => { // ✅ Add partyId param
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      partyDetails, // ✅ Cache party details
      partyTheme,   // ✅ Cache theme
      cachedPartyId: partyId, // ✅ Cache party ID
      timestamp: Date.now()
    }))
    console.log('💾 Cached with party details and party ID:', partyId)
  } catch (error) {
    console.error('Cache error:', error)
  }
}


export function usePartyData() {
  const searchParams = useSearchParams()
  const urlPartyId = searchParams.get('party_id')

  // ✅ FIX: Track previous partyId to detect changes
  const prevPartyIdRef = useRef(null)

  const [simpleLoading, setSimpleLoading] = useState(true)

   // Still use consolidated loading for compatibility
   const consolidatedLoading = useConsolidatedLoading({
    minimumDuration: 2000,
    defaultText: "Loading your party...",
    preventFlashing: true
  })

  const isLoading = simpleLoading || consolidatedLoading.isLoading

  console.log('🎯 Loading state:', { simpleLoading, consolidatedLoading: consolidatedLoading.isLoading, finalIsLoading: isLoading })


  // Core state - Don't initialize from cache here, let useEffect handle it
  const [partyData, setPartyData] = useState({})
  const [partyId, setPartyId] = useState(null)
  const [totalCost, setTotalCost] = useState(0)
  const [addons, setAddons] = useState([])
  const [user, setUser] = useState(null)
  const [currentParty, setCurrentParty] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dataSource, setDataSource] = useState('unknown')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [initialized, setInitialized] = useState(false)

// ✅ FIX: Clear cache when URL party ID changes
useEffect(() => {
  // Check if partyId actually changed
  if (prevPartyIdRef.current !== null && prevPartyIdRef.current !== urlPartyId) {
    console.log('🔄 URL Party ID changed from', prevPartyIdRef.current, 'to', urlPartyId, '- clearing cache to force fresh load')

    // Clear cache to force fresh data fetch
    sessionStorage.removeItem(CACHE_KEY)
    sessionStorage.removeItem('party_plan_cache')

    // Set loading state
    setSimpleLoading(true)
    setInitialized(false)
  }

  // Update ref
  prevPartyIdRef.current = urlPartyId
}, [urlPartyId])

// Load initial party data
useEffect(() => {
  const loadPartyData = async () => {
    console.log('🔄 loadPartyData triggered for urlPartyId:', urlPartyId)

    // Check for cache INSIDE the effect
    const cachedData = getCachedData(urlPartyId)
    const hasCache = cachedData !== null

    if (hasCache) {
      console.log('✅ Using cached data for party:', urlPartyId)
      // Immediately set state from cache
      setUser(cachedData.data.user)
      setCurrentParty(cachedData.data.currentParty)
      setPartyData(cachedData.data.partyData)
      setPartyId(cachedData.data.partyId)
      setTotalCost(cachedData.data.totalCost)
      setAddons(cachedData.data.addons)
      setDataSource(cachedData.data.dataSource)
      setIsSignedIn(cachedData.data.isSignedIn)
      setInitialized(true)
      setSimpleLoading(false)
      return // Exit early, don't fetch
    }

    consolidatedLoading.startLoading('party-data', 'Loading your party...')

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      setUser(user)
      
      if (user && !error) {
        setIsSignedIn(true)

        consolidatedLoading.startLoading('database-party', 'Loading party details...')

        // ✅ FIX: Check if we have a specific party_id in URL, otherwise get current party
        let partyResult
        if (urlPartyId) {
          console.log('🔍 Loading specific party from URL:', urlPartyId)
          partyResult = await partyDatabaseBackend.getPartyById(urlPartyId)
        } else {
          console.log('🔍 Loading current party')
          partyResult = await partyDatabaseBackend.getCurrentParty()
        }

        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          const partyDataWithPayment = {
            ...(party.party_plan || {}),
            payment_status: party.payment_status,
            estimated_cost: party.estimated_cost,
            deposit_amount: party.deposit_amount
          }

          setCurrentParty(party)
          setPartyData(partyDataWithPayment)
          setPartyId(party.id)
          setTotalCost(party.estimated_cost || 0)
          setDataSource('database')
          setAddons(party.party_plan?.addons || [])

          // Cache it
          setCachedData(
            {
              user,
              currentParty: party,
              partyData: partyDataWithPayment,
              partyId: party.id,
              totalCost: party.estimated_cost || 0,
              addons: party.party_plan?.addons || [],
              dataSource: 'database',
              isSignedIn: true
            },
            party, // partyDetails
            party.theme || 'superhero', // partyTheme
            party.id // partyId
          )
        } else {
          setCurrentParty(null)
          setDataSource('localStorage')
          const localPartyPlan = localStorage.getItem('party_plan')
          const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
          setPartyData(localPartyData)
          setTotalCost(calculateLocalStorageCost(localPartyData))
          setAddons(localPartyData.addons || [])
        }

        consolidatedLoading.finishLoading('database-party')
      } else {
        setIsSignedIn(false)
        setCurrentParty(null)
        setDataSource('localStorage')
        
        const localPartyPlan = localStorage.getItem('party_plan')
        const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
        setPartyData(localPartyData)
        setTotalCost(calculateLocalStorageCost(localPartyData))
        setAddons(localPartyData.addons || [])
      }
      
      setInitialized(true)
    } catch (error) {
      console.error('Error in loadPartyData:', error)
      setUser(null)
      setCurrentParty(null)
      setDataSource('localStorage')
      setInitialized(true)
    } finally {
      consolidatedLoading.finishLoading('party-data')
      setSimpleLoading(false)
    }
  }

  loadPartyData()
}, [urlPartyId]) // ✅ FIX: Re-run when URL party_id changes


  // Helper to calculate localStorage cost
  const calculateLocalStorageCost = (partyPlan) => {
    let total = 0

    Object.entries(partyPlan).forEach(([key, supplier]) => {
      // ✅ FIX: Exclude einvites and addons from cost calculation
      if (supplier && supplier.price && key !== 'addons' && key !== 'einvites') {
        total += supplier.price
      }
    })
    
    if (partyPlan.addons) {
      partyPlan.addons.forEach(addon => {
        if (addon && addon.price) {
          total += addon.price
        }
      })
    }
    
    return total
  }

  const {
    partyDetails,
    partyTheme,
    themeLoaded,
    isLoading: partyDetailsLoading,
    handleNameSubmit,
    handlePartyDetailsUpdate: originalHandlePartyDetailsUpdate
  } = usePartyDetails(
    initialized ? user : undefined,
    initialized ? currentParty : undefined,
    undefined, // Party details will be loaded from currentParty
    undefined  // Theme will be loaded from currentParty
  )
  

  // Register party details loading
  useEffect(() => {
    if (partyDetailsLoading && initialized) {
      consolidatedLoading.startLoading('party-details', 'Loading party details...')
    } else if (!partyDetailsLoading) {
      consolidatedLoading.finishLoading('party-details')
    }
  }, [partyDetailsLoading, initialized])

// ✅ UPDATE: Cache party details when saving
const refreshPartyData = async () => {
  try {
    if (dataSource === 'database' && partyId) {
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      if (partyResult.success && partyResult.party) {
        const party = partyResult.party
        const partyDataWithPayment = {
          ...(party.party_plan || {}),
          payment_status: party.payment_status,
          estimated_cost: party.estimated_cost,
          deposit_amount: party.deposit_amount
        }

        setCurrentParty(party)
        setPartyData(partyDataWithPayment)
        setTotalCost(party.estimated_cost || 0)
        setAddons(party.party_plan?.addons || [])

        // ✅ Update cache with party details
        setCachedData(
          {
            user,
            currentParty: party,
            partyData: partyDataWithPayment,
            partyId: party.id,
            totalCost: party.estimated_cost || 0,
            addons: party.party_plan?.addons || [],
            dataSource: 'database',
            isSignedIn
          },
          partyDetails, // ✅ Include party details
          partyTheme,   // ✅ Include theme
          party.id      // ✅ Include party ID
        )
      }
    } else {
      const localPartyPlan = localStorage.getItem('party_plan')
      const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
      setPartyData(localPartyData)
      setTotalCost(calculateLocalStorageCost(localPartyData))
      setAddons(localPartyData.addons || [])
    }
  } catch (error) {
    console.error('Error refreshing party data:', error)
  }
}


  // Enhanced party details update
  const handlePartyDetailsUpdate = async (updatedDetails) => {
    await originalHandlePartyDetailsUpdate(updatedDetails)
    await refreshPartyData()
  }
  // Budget management
  const {
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    updateSuppliersForBudget
  } = useBudgetManager(totalCost, isUpdating, setIsUpdating)

  // Addon management functions
  const addAddon = async (addon) => {
    if (dataSource === 'database' && partyId) {
      // Database mode
      const result = await partyDatabaseBackend.addAddonToParty(partyId, addon)
      if (result.success) {
        setPartyData(result.party.party_plan || {})
        setTotalCost(result.party.estimated_cost || 0)
        setAddons(result.party.party_plan?.addons || [])
        return { success: true }
      }
      return result
    } else {
      // localStorage mode
      try {
        const currentPartyPlan = JSON.parse(localStorage.getItem('party_plan') || '{}')
        
        if (!currentPartyPlan.addons) {
          currentPartyPlan.addons = []
        }
        
        // Check if addon already exists
        const existingIndex = currentPartyPlan.addons.findIndex(existing => existing.id === addon.id)
        
        if (existingIndex === -1) {
          currentPartyPlan.addons.push({
            ...addon,
            addedAt: new Date().toISOString()
          })
          
          localStorage.setItem('party_plan', JSON.stringify(currentPartyPlan))
          
          // Update local state
          setPartyData(currentPartyPlan)
          setAddons(currentPartyPlan.addons)
          setTotalCost(calculateLocalStorageCost(currentPartyPlan))
          
          return { success: true }
        } else {
          return { success: false, error: 'Addon already exists' }
        }
      } catch (error) {
        console.error('Error adding addon to localStorage:', error)
        return { success: false, error: error.message }
      }
    }
  }

  const removeAddon = async (addonId) => {
    if (dataSource === 'database' && partyId) {
      // Database mode
      const result = await partyDatabaseBackend.removeAddonFromParty(partyId, addonId)
      if (result.success) {
        setPartyData(result.party.party_plan || {})
        setTotalCost(result.party.estimated_cost || 0)
        setAddons(result.party.party_plan?.addons || [])
        return { success: true }
      }
      return result
    } else {
      // localStorage mode
      try {
        const currentPartyPlan = JSON.parse(localStorage.getItem('party_plan') || '{}')
        
        if (currentPartyPlan.addons) {
          const addonIndex = currentPartyPlan.addons.findIndex(addon => addon.id === addonId)
          
          if (addonIndex !== -1) {
            currentPartyPlan.addons.splice(addonIndex, 1)
            localStorage.setItem('party_plan', JSON.stringify(currentPartyPlan))
            
            // Update local state
            setPartyData(currentPartyPlan)
            setAddons(currentPartyPlan.addons)
            setTotalCost(calculateLocalStorageCost(currentPartyPlan))
            
            return { success: true }
          }
        }
        
        return { success: false, error: 'Addon not found' }
      } catch (error) {
        console.error('Error removing addon from localStorage:', error)
        return { success: false, error: error.message }
      }
    }
  }

  const hasAddon = (addonId) => {
    return addons?.some(addon => addon.id === addonId) || false
  }

  const handleAddAddon = async (addon, supplierId = null) => {
    if (hasAddon(addon.id)) return
    
    try {
      const addonWithSupplier = {
        ...addon,
        supplierId: supplierId,
        supplierName: supplierId ? suppliers[supplierId]?.name : 'General',
        addedAt: new Date().toISOString()
      }
      
      const result = await addAddon(addonWithSupplier)
      
      if (result.success) {
        console.log("Add-on added successfully!")
      } else {
        console.error("Failed to add addon:", result.error)
      }
    } catch (error) {
      console.error("Error adding addon:", error)
    }
  }

  const handleRemoveAddon = async (addonId) => {
    try {
      const result = await removeAddon(addonId)
      if (result.success) {
        console.log("Add-on removed successfully!")
      } else {
        console.error("Failed to remove addon:", result.error)
      }
    } catch (error) {
      console.error("Error removing addon:", error)
    }
  }

  const suppliers = {
    venue: partyData.venue || null,
    entertainment: partyData.entertainment || null,
    catering: partyData.catering || null,
    facePainting: partyData.facePainting || null,
    activities: partyData.activities || null,
    partyBags: partyData.partyBags || null,
    decorations: partyData.decorations || null,
    balloons: partyData.balloons || null,
    cakes: partyData.cakes || null
  }

  return {
    // Data
    partyData,
    partyId,
    totalCost,
    addons,
    loading: isLoading || partyDetailsLoading, // ✅ Include partyDetails loading
    user,
    currentParty,
    suppliers,
    dataSource,
    isSignedIn,

    // Party details
    partyDetails,
    partyTheme,
    themeLoaded,
    
    // Budget
    tempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    isUpdating,
    
    refreshPartyData,
    handlePartyDetailsUpdate,
    handleNameSubmit,
    handleAddAddon: async () => {}, // Add your functions back
    handleRemoveAddon: async () => {},
    hasAddon: () => false
  }
}