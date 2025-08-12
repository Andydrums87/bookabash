// hooks/usePartyData.js - FIXED VERSION
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useBudgetManager } from '../hooks/useBudgetManager'
import { supabase } from '@/lib/supabase'

export function usePartyData() {
  // Core state
  const [partyData, setPartyData] = useState({})
  const [partyId, setPartyId] = useState(null)
  const [totalCost, setTotalCost] = useState(0)
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [currentParty, setCurrentParty] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dataSource, setDataSource] = useState('unknown') // Track where data comes from
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Load initial party data
  useEffect(() => {
    const loadPartyData = async () => {
      setLoading(true)
  
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (user && !error) {
          
          setIsSignedIn(true)
          
    
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
            console.log('❌ getCurrentParty failed:', partyResult.error)
            setDataSource('localStorage') // At least set a dataSource
          }
        } else {
          console.log('👥 Not authenticated')
          setIsSignedIn(false)
          setDataSource('localStorage')
        }
      } catch (error) {
        console.error('❌ Error in loadPartyData:', error)
        setDataSource('localStorage')
      } finally {

        setLoading(false)
      }
    }
    
    const loadLocalStorageData = () => {
      const localPartyPlan = localStorage.getItem('party_plan')
      const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
      setPartyData(localPartyData)
      setDataSource('localStorage')
    }

    // Helper function to load localStorage party
    const loadLocalStorageParty = async () => {
      try {
        console.log('📦 Loading party data from localStorage...')
        
        const localPartyPlan = localStorage.getItem('party_plan')
        const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
        
        setPartyData(localPartyData)
        setPartyId(null) // No party ID for localStorage
        setTotalCost(calculateLocalStorageCost(localPartyData))
        setAddons(localPartyData.addons || [])
        setDataSource('localStorage')
        
        console.log('✅ localStorage party data loaded:', {
          suppliers: Object.keys(localPartyData).filter(key => key !== 'addons'),
          addons: localPartyData.addons?.length || 0,
          totalCost: calculateLocalStorageCost(localPartyData)
        })
      } catch (error) {
        console.error('❌ Error loading localStorage party:', error)
        // Set empty defaults
        setPartyData({})
        setPartyId(null)
        setTotalCost(0)
        setAddons([])
        setDataSource('localStorage')
      }
    }

    loadPartyData()
  }, [])

  // Helper to calculate localStorage cost
  const calculateLocalStorageCost = (partyPlan) => {
    let total = 0
    
    // Add supplier costs
    Object.entries(partyPlan).forEach(([key, supplier]) => {
      if (supplier && supplier.price && key !== 'addons') {
        total += supplier.price
      }
    })
    
    // Add addon costs
    if (partyPlan.addons) {
      partyPlan.addons.forEach(addon => {
        if (addon && addon.price) {
          total += addon.price
        }
      })
    }
    
    return total
  }

  // Refresh party data - ENHANCED to handle both sources
  const refreshPartyData = async () => {
    console.log('🔄 Refreshing party data...')
    
    try {
      if (dataSource === 'database' && partyId) {
        console.log('🎯 Refreshing database party:', partyId)
        
        const partyResult = await partyDatabaseBackend.getCurrentParty()
        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          console.log('✅ Database party refreshed')
          
          setCurrentParty(party)
          setPartyData(party.party_plan || {})
          setTotalCost(party.estimated_cost || 0)
          setAddons(party.party_plan?.addons || [])
        } else {
          console.error('❌ Failed to refresh database party')
        }
      } else {
        console.log('📦 Refreshing localStorage party')
        
        const localPartyPlan = localStorage.getItem('party_plan')
        const localPartyData = localPartyPlan ? JSON.parse(localPartyPlan) : {}
        
        setPartyData(localPartyData)
        setTotalCost(calculateLocalStorageCost(localPartyData))
        setAddons(localPartyData.addons || [])
      }
    } catch (error) {
      console.error('❌ Error refreshing party data:', error)
    }
  }

  // Use party details hook - FIXED to pass correct parameters
  const {
    partyDetails,
    partyTheme,
    themeLoaded,
    handleNameSubmit,
    handlePartyDetailsUpdate: originalHandlePartyDetailsUpdate
  } = usePartyDetails(user, currentParty)

  // Enhanced party details update
  const handlePartyDetailsUpdate = async (updatedDetails) => {
    await originalHandlePartyDetailsUpdate(updatedDetails)
    await refreshPartyData()
  }

  // Budget management - FIXED to handle both data sources
  const {
    tempBudget,
    setTempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    updateSuppliersForBudget
  } = useBudgetManager(totalCost, isUpdating, setIsUpdating)

  // Addon management - ENHANCED to handle both sources
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
        console.error('❌ Error adding addon to localStorage:', error)
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
        console.error('❌ Error removing addon from localStorage:', error)
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
        console.log("✅ Add-on added successfully!")
      } else {
        console.error("❌ Failed to add addon:", result.error)
      }
    } catch (error) {
      console.error("💥 Error adding addon:", error)
    }
  }

  const handleRemoveAddon = async (addonId) => {
    try {
      const result = await removeAddon(addonId)
      if (result.success) {
        console.log("✅ Add-on removed successfully!")
      } else {
        console.error("❌ Failed to remove addon:", result.error)
      }
    } catch (error) {
      console.error("💥 Error removing addon:", error)
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
  }



  return {
    // Data
    partyData,
    partyId, // ✅ This should now be correctly set
    totalCost,
    addons,
    loading,
    user,
    currentParty,
    suppliers,
    dataSource, // NEW: Track data source
    isSignedIn, // NEW: Track sign-in status
    
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