"use client"

import { useState, useEffect } from "react"

export function useBudgetManager(totalCost = 0, isUpdating, setIsUpdating) {
  const [tempBudget, setTempBudget] = useState(600)
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [lastProcessedBudget, setLastProcessedBudget] = useState(null)

  // Helper function to get budget from party details
  const getBudgetFromPartyDetails = () => {
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}')
      return partyDetails.budget || 600
    } catch {
      return 600
    }
  }

  // Initialize budget from localStorage
  useEffect(() => {
    if (hasInitialized) return

    const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}')
    const storedBudget = partyDetails.budget || 600
    
    setTempBudget(storedBudget)
    setLastProcessedBudget(storedBudget) // Mark initial budget as processed
    setHasInitialized(true)
    

  }, [hasInitialized])

  // Handle budget slider changes with debouncing
  useEffect(() => {
    if (!hasInitialized || isUpdating) return
    
    // Don't update if this budget was already processed
    if (tempBudget === lastProcessedBudget) {
      return
    }
    
    console.log('🎚️ Budget slider changed to:', tempBudget)
    
    const timeoutId = setTimeout(() => {
      console.log('🚀 Updating suppliers for budget:', tempBudget)
      setLastProcessedBudget(tempBudget) // Mark as processed
      updateSuppliersForBudget(tempBudget)
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [tempBudget, hasInitialized, isUpdating, lastProcessedBudget])

  // Update suppliers for budget function
  const updateSuppliersForBudget = async (newBudget) => {
    console.log('🎯 updateSuppliersForBudget called with:', newBudget)
    
    setIsUpdating(true)
    
    // Set loading state for supplier cards
    const loadingSuppliers = ["venue", "entertainment", "catering", "facePainting", "partyBags"]
    // You'll need to pass setLoadingCards from parent component or manage it here
    
    try {
      const partyDetails = {
        date: '2025-08-16',
        theme: 'superhero', 
        guestCount: 15,
        location: 'London',
        childName: 'Test Party',
        childAge: 6,
        budget: newBudget
      }
      
      localStorage.setItem('party_details', JSON.stringify(partyDetails))
      
      const { partyBuilderBackend } = await import('@/utils/partyBuilderBackend')
      const result = await partyBuilderBackend.buildParty(partyDetails)
      
      if (result.success) {
        console.log('✅ Party updated successfully!')
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (error) {
      console.error('❌ Error updating suppliers:', error)
    }
    
    // Reset loading state
    setTimeout(() => {
      setIsUpdating(false)
    }, 1500)
  }

  // Calculate budget percentage
  const budgetPercentage = tempBudget > 0 ? Math.round((totalCost / tempBudget) * 100) : 0

  // Budget category helper
  const getBudgetCategory = (budget) => {
    if (budget < 500) return "Essential"
    if (budget < 700) return "Complete"
    return "Premium"
  }

  // Save budget to localStorage when it changes
  const saveBudgetToStorage = (budget) => {
    try {
      const partyDetails = JSON.parse(localStorage.getItem('party_details') || '{}')
      partyDetails.budget = budget
      localStorage.setItem('party_details', JSON.stringify(partyDetails))
    } catch (error) {
      console.error('Error saving budget:', error)
    }
  }

  // Enhanced setTempBudget that also saves to storage
  const updateTempBudget = (newBudget) => {
    setTempBudget(newBudget)
    saveBudgetToStorage(newBudget)
  }

  return {
    tempBudget,
    setTempBudget: updateTempBudget,
    budgetPercentage,
    getBudgetCategory,
    showAdvancedControls,
    setShowAdvancedControls,
    updateSuppliersForBudget,
    getBudgetFromPartyDetails,
    hasInitialized
  }
}