// hooks/usePartyData.js - Handles all party data management
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { usePartyDetails } from '../hooks/usePartyDetails'
import { useBudgetManager } from '../hooks/useBudgetManager'

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

  // Load initial party data
  useEffect(() => {
    const loadPartyData = async () => {
      setLoading(true)
      try {
        // Get current user
        const userResult = await partyDatabaseBackend.getCurrentUser()
        if (userResult.success) {
          setUser(userResult.user)
        }

        // Get party data
        const partyResult = await partyDatabaseBackend.getCurrentParty()
        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          setCurrentParty(party)
          setPartyData(party.party_plan || {})
          setPartyId(party.id)
          setTotalCost(party.estimated_cost || 0)
          setAddons(party.party_plan?.addons || [])
        }
      } catch (error) {
        console.error('Error loading party data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPartyData()
  }, [])

  // Refresh party data
  const refreshPartyData = async () => {
    try {
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      if (partyResult.success && partyResult.party) {
        const party = partyResult.party
        console.log('🔄 Refreshing party data:', party)
        
        setCurrentParty(party)
        setPartyData(party.party_plan || {})
        setPartyId(party.id)
        setTotalCost(party.estimated_cost || 0)
        setAddons(party.party_plan?.addons || [])
      }
    } catch (error) {
      console.error('Error refreshing party data:', error)
    }
  }

  // Use party details hook
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

  // Addon management
  const addAddon = async (addon) => {
    const result = await partyDatabaseBackend.addAddonToParty(partyId, addon)
    if (result.success) {
      setPartyData(result.party.party_plan || {})
      setTotalCost(result.party.estimated_cost || 0)
      setAddons(result.party.party_plan?.addons || [])
      return { success: true }
    }
    return result
  }

  const removeAddon = async (addonId) => {
    const result = await partyDatabaseBackend.removeAddonFromParty(partyId, addonId)
    if (result.success) {
      setPartyData(result.party.party_plan || {})
      setTotalCost(result.party.estimated_cost || 0)
      setAddons(result.party.party_plan?.addons || [])
      return { success: true }
    }
    return result
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
    partyId,
    totalCost,
    addons,
    loading,
    user,
    currentParty,
    suppliers,
    
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