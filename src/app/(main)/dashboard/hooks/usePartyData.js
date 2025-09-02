// hooks/usePartyData.js - FIXED VERSION with consolidated loading
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { supabase } from '@/lib/supabase'
import { useConsolidatedLoading } from './useConsolidatedLoading'

export function usePartyData() {
  // Use consolidated loading
  const { isLoading, startLoading, finishLoading } = useConsolidatedLoading()
  
  // Core state - Initialize with proper defaults to prevent undefined transitions
  const [partyData, setPartyData] = useState({})
  const [partyId, setPartyId] = useState(null)
  const [totalCost, setTotalCost] = useState(0)
  const [addons, setAddons] = useState([])
  const [user, setUser] = useState(null) 
  const [currentParty, setCurrentParty] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dataSource, setDataSource] = useState('unknown')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [initialized, setInitialized] = useState(false) // Track initialization

  // Load initial party data - CONSOLIDATED APPROACH
  useEffect(() => {
    const loadPartyData = async () => {
      // Start loading for the main data fetch
      startLoading('party-data', 'Loading your party...')
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        // Set user state immediately (null or user object)
        setUser(user)
        
        if (user && !error) {
          setIsSignedIn(true)
          startLoading('database-party', 'Loading party details...')
          
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
          } else {
            setCurrentParty(null)
            setDataSource('localStorage')
            // Load localStorage data for authenticated users without database party
            const localPartyPlan = localStorage.getItem('party_plan')
            const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
            setPartyData(localPartyData)
            setTotalCost(calculateLocalStorageCost(localPartyData))
            setAddons(localPartyData.addons || [])
          }
          
          finishLoading('database-party')
        } else {
          setIsSignedIn(false)
          setCurrentParty(null)
          setDataSource('localStorage')
          
          // Load localStorage data for non-authenticated users
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
        finishLoading('party-data')
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

  // Use party details hook - ONLY after initialization
  const {
    partyDetails,
    partyTheme,
    themeLoaded,
    isLoading: partyDetailsLoading,
    handleNameSubmit,
    handlePartyDetailsUpdate: originalHandlePartyDetailsUpdate
  } = usePartyDetails(initialized ? user : undefined, initialized ? currentParty : undefined)

  // Register party details loading
  useEffect(() => {
    if (partyDetailsLoading && initialized) {
      startLoading('party-details', 'Loading party details...')
    } else {
      finishLoading('party-details')
    }
  }, [partyDetailsLoading, initialized])

  // Refresh party data
  const refreshPartyData = async () => {
    try {
      if (dataSource === 'database' && partyId) {
        const partyResult = await partyDatabaseBackend.getCurrentParty()
        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          setCurrentParty(party)
          setPartyData(party.party_plan || {})
          setTotalCost(party.estimated_cost || 0)
          setAddons(party.party_plan?.addons || [])
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

  // Create suppliers object
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
    loading: isLoading, // SINGLE loading state
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
    
    // Functions
    refreshPartyData,
    handlePartyDetailsUpdate,
    handleNameSubmit,
    handleAddAddon,
    handleRemoveAddon,
    hasAddon
  }
}