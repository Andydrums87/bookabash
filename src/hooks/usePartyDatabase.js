// hooks/usePartyDatabase.js
// React hooks for database-backed party management (replaces localStorage)

import { useState, useEffect, useCallback } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { supabase } from '@/lib/supabase'

/**
 * Hook for managing current user's party
 * Replaces the localStorage-based party plan management
 */
export function usePartyDatabase() {
  const [currentParty, setCurrentParty] = useState(null)
  const [partyPlan, setPartyPlan] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load current party and plan
  const loadCurrentParty = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await partyDatabaseBackend.getCurrentParty()
      
      if (result.success && result.party) {
        setCurrentParty(result.party)
        setPartyPlan(result.party.party_plan || {})
        console.log('✅ Loaded current party:', result.party.id)
      } else {
        setCurrentParty(null)
        setPartyPlan({})
        console.log('ℹ️ No current party found')
      }

    } catch (err) {
      console.error('❌ Error loading current party:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new party
  const createParty = async (partyDetails, initialPartyPlan = {}) => {
    try {
      setSaving(true)
      setError(null)

      const result = await partyDatabaseBackend.createParty(partyDetails, initialPartyPlan)
      
      if (result.success) {
        setCurrentParty(result.party)
        setPartyPlan(result.party.party_plan || {})
        console.log('✅ Party created successfully:', result.party.id)
        return { success: true, party: result.party }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error creating party:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Add supplier to party
  const addSupplier = async (supplier, selectedPackage = null) => {
    if (!currentParty) {
      const error = 'No current party found. Please create a party first.'
      setError(error)
      return { success: false, error }
    }

    try {
      setSaving(true)
      setError(null)

      const result = await partyDatabaseBackend.addSupplierToParty(
        currentParty.id, 
        supplier, 
        selectedPackage
      )
      
      if (result.success) {
        setCurrentParty(result.party)
        setPartyPlan(result.party.party_plan || {})
        console.log('✅ Supplier added successfully:', result.supplierType)
        return { success: true, supplierType: result.supplierType }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error adding supplier:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Add addon to party
  const addAddon = async (addon) => {
    if (!currentParty) {
      const error = 'No current party found. Please create a party first.'
      setError(error)
      return { success: false, error }
    }

    try {
      setSaving(true)
      setError(null)

      const result = await partyDatabaseBackend.addAddonToParty(currentParty.id, addon)
      
      if (result.success) {
        setCurrentParty(result.party)
        setPartyPlan(result.party.party_plan || {})
        console.log('✅ Addon added successfully:', addon.name)
        return { success: true, addon: result.addon }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error adding addon:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Remove supplier from party
  const removeSupplier = async (supplierType) => {
    if (!currentParty) {
      const error = 'No current party found.'
      setError(error)
      return { success: false, error }
    }

    try {
      setSaving(true)
      setError(null)

      const result = await partyDatabaseBackend.removeSupplierFromParty(
        currentParty.id, 
        supplierType
      )
      
      if (result.success) {
        setCurrentParty(result.party)
        setPartyPlan(result.party.party_plan || {})
        console.log('✅ Supplier removed successfully:', supplierType)
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error removing supplier:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Remove addon from party
  const removeAddon = async (addonId) => {
    if (!currentParty) {
      const error = 'No current party found.'
      setError(error)
      return { success: false, error }
    }

    try {
      setSaving(true)
      setError(null)

      const result = await partyDatabaseBackend.removeAddonFromParty(currentParty.id, addonId)
      
      if (result.success) {
        setCurrentParty(result.party)
        setPartyPlan(result.party.party_plan || {})
        console.log('✅ Addon removed successfully:', addonId)
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error removing addon:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Send enquiries to suppliers
  const sendEnquiries = async (message = '', specialRequests = '') => {
    if (!currentParty) {
      const error = 'No current party found.'
      setError(error)
      return { success: false, error }
    }

    try {
      setSaving(true)
      setError(null)

      const result = await partyDatabaseBackend.sendEnquiriesToSuppliers(
        currentParty.id, 
        message, 
        specialRequests
      )
      
      if (result.success) {
        // Reload party to get updated status
        await loadCurrentParty()
        console.log(`✅ Sent ${result.count} enquiries successfully`)
        return { success: true, count: result.count, enquiries: result.enquiries }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error sending enquiries:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Get enquiries for current party
  const getEnquiries = async () => {
    if (!currentParty) {
      return { success: false, error: 'No current party found.' }
    }

    try {
      const result = await partyDatabaseBackend.getEnquiriesForParty(currentParty.id)
      return result
    } catch (err) {
      console.error('❌ Error getting enquiries:', err)
      return { success: false, error: err.message }
    }
  }

  // Calculate total cost
  const totalCost = partyDatabaseBackend.calculatePartyPlanCost(partyPlan)

  // Get addons from party plan
  const addons = partyPlan.addons || []

  // Helper functions
  const hasAddon = (addonId) => {
    return addons.some(addon => addon.id === addonId)
  }

  const hasSupplierType = (supplierType) => {
    return partyPlan[supplierType] !== null && partyPlan[supplierType] !== undefined
  }

  const getSupplierByType = (supplierType) => {
    return partyPlan[supplierType] || null
  }

  const getPartySummary = () => {
    const suppliers = Object.entries(partyPlan)
      .filter(([key]) => key !== 'addons')
      .filter(([key, supplier]) => supplier !== null)
      .map(([key, supplier]) => ({ ...supplier, type: key }))
    
    const addons = partyPlan.addons || []
    const totalCost = partyDatabaseBackend.calculatePartyPlanCost(partyPlan)
    
    return {
      suppliers,
      addons,
      totalCost,
      itemCount: suppliers.length + addons.length
    }
  }

  // Load party on mount
  useEffect(() => {
    loadCurrentParty()
  }, [loadCurrentParty])

  return {
    // State
    currentParty,
    partyPlan,
    addons,
    totalCost,
    loading,
    saving,
    error,

    // Actions
    createParty,
    addSupplier,
    addAddon,
    removeSupplier,
    removeAddon,
    sendEnquiries,
    getEnquiries,

    // Helpers
    hasAddon,
    hasSupplierType,
    getSupplierByType,
    getPartySummary,
    refetch: loadCurrentParty
  }
}

/**
 * Hook for managing user profile
 */
export function useUserProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await partyDatabaseBackend.getCurrentUser()
      
      if (result.success) {
        setUser(result.user)
      } else {
        setUser(null)
        setError(result.error)
      }

    } catch (err) {
      console.error('❌ Error loading user:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrUpdateUser = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await partyDatabaseBackend.createOrGetUser(userData)
      
      if (result.success) {
        setUser(result.user)
        return { success: true, user: result.user }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }

    } catch (err) {
      console.error('❌ Error creating/updating user:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return {
    user,
    loading,
    error,
    createOrUpdateUser,
    refetch: loadUser
  }
}

/**
 * Hook for managing user's party history
 */
export function usePartyHistory() {
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadParties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await partyDatabaseBackend.getUserParties()
      
      if (result.success) {
        setParties(result.parties)
      } else {
        setParties([])
        setError(result.error)
      }

    } catch (err) {
      console.error('❌ Error loading party history:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadParties()
  }, [loadParties])

  return {
    parties,
    loading,
    error,
    refetch: loadParties
  }
}

/**
 * Hook for real-time enquiry updates
 */
export function useEnquiryUpdates(partyId) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEnquiries = useCallback(async () => {
    if (!partyId) return

    try {
      setLoading(true)
      setError(null)

      const result = await partyDatabaseBackend.getEnquiriesForParty(partyId)
      
      if (result.success) {
        setEnquiries(result.enquiries)
      } else {
        setEnquiries([])
        setError(result.error)
      }

    } catch (err) {
      console.error('❌ Error loading enquiries:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [partyId])

  useEffect(() => {
    loadEnquiries()

    // Set up real-time subscription for enquiry updates
    if (partyId) {
      const subscription = supabase
        .channel('enquiry_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'enquiries',
          filter: `party_id=eq.${partyId}`
        }, (payload) => {
          console.log('🔄 Real-time enquiry update:', payload)
          loadEnquiries() // Reload enquiries when changes occur
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [partyId, loadEnquiries])

  return {
    enquiries,
    loading,
    error,
    refetch: loadEnquiries
  }
}