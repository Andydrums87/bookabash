// hooks/usePartyData.js - FIXED VERSION with consolidated loading
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { supabase } from '@/lib/supabase'
import { useConsolidatedLoading } from './useConsolidatedLoading'


const CACHE_KEY = 'party_data_cache'
const CACHE_DURATION = 5 * 60 * 1000

const getCachedData = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp, partyDetails, partyTheme } = JSON.parse(cached) // ✅ Add partyDetails and theme
    
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log('✅ Cache hit with party details')
      return { data, partyDetails, partyTheme } // ✅ Return all
    }
    
    sessionStorage.removeItem(CACHE_KEY)
    return null
  } catch (error) {
    return null
  }
}

const setCachedData = (data, partyDetails, partyTheme) => { // ✅ Add params
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      partyDetails, // ✅ Cache party details
      partyTheme,   // ✅ Cache theme
      timestamp: Date.now()
    }))
    console.log('💾 Cached with party details')
  } catch (error) {
    console.error('Cache error:', error)
  }
}


export function usePartyData() {

  const cachedData = getCachedData()
  const hasCache = cachedData !== null

  const [simpleLoading, setSimpleLoading] = useState(!hasCache)

   // Still use consolidated loading for compatibility, but ignore its state if we have cache
   const consolidatedLoading = useConsolidatedLoading({
    minimumDuration: 2000,
    defaultText: "Loading your party...",
    preventFlashing: !hasCache
  })

  const isLoading = hasCache ? simpleLoading : consolidatedLoading.isLoading

  console.log('🎯 Loading state:', { hasCache, simpleLoading, consolidatedLoading: consolidatedLoading.isLoading, finalIsLoading: isLoading })
    
  
  // Core state - Initialize with cache
  const [partyData, setPartyData] = useState(cachedData?.partyData || {})
  const [partyId, setPartyId] = useState(cachedData?.partyId || null)
  const [totalCost, setTotalCost] = useState(cachedData?.totalCost || 0)
  const [addons, setAddons] = useState(cachedData?.addons || [])
  const [user, setUser] = useState(cachedData?.user || null)
  const [currentParty, setCurrentParty] = useState(cachedData?.currentParty || null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dataSource, setDataSource] = useState(cachedData?.dataSource || 'unknown')
  const [isSignedIn, setIsSignedIn] = useState(cachedData?.isSignedIn || false)
  const [initialized, setInitialized] = useState(hasCache)

// Load initial party data
useEffect(() => {
  const loadPartyData = async () => {
    if (!hasCache) {
      consolidatedLoading.startLoading('party-data', 'Loading your party...')
    } else {
      setSimpleLoading(false) // ✅ Immediately turn off loading
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      setUser(user)
      
      if (user && !error) {
        setIsSignedIn(true)
        
        if (!hasCache) {
          consolidatedLoading.startLoading('database-party', 'Loading party details...')
        }
        
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
          setPartyId(party.id)
          setTotalCost(party.estimated_cost || 0)
          setDataSource('database')
          setAddons(party.party_plan?.addons || [])
          
          // Cache it
          setCachedData({
            user,
            currentParty: party,
            partyData: partyDataWithPayment,
            partyId: party.id,
            totalCost: party.estimated_cost || 0,
            addons: party.party_plan?.addons || [],
            dataSource: 'database',
            isSignedIn: true
          })
        } else {
          setCurrentParty(null)
          setDataSource('localStorage')
          const localPartyPlan = localStorage.getItem('party_plan')
          const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
          setPartyData(localPartyData)
          setTotalCost(calculateLocalStorageCost(localPartyData))
          setAddons(localPartyData.addons || [])
        }
        
        if (!hasCache) {
          consolidatedLoading.finishLoading('database-party')
        }
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
      if (!hasCache) {
        consolidatedLoading.finishLoading('party-data')
      }
    }
  }

  loadPartyData()
}, [])


  // Helper to calculate localStorage cost
  const calculateLocalStorageCost = (partyPlan) => {
    let total = 0
    
    Object.entries(partyPlan).forEach(([key, supplier]) => {
      if (supplier && supplier.price && key !== 'addons') {
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
    cachedData?.partyDetails, // ✅ Pass cached details
    cachedData?.partyTheme     // ✅ Pass cached theme
  )
  

  // Register party details loading
  useEffect(() => {
    if (partyDetailsLoading && initialized && !hasCache) {
      consolidatedLoading.startLoading('party-details', 'Loading party details...')
    } else if (!partyDetailsLoading && !hasCache) {
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
          partyTheme    // ✅ Include theme
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
    loading: isLoading, // ✅ Return our custom loading state
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