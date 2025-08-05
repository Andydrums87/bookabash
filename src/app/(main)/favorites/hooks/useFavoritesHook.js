// hooks/useFavorites.js
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/toast'

// Global flag to prevent duplicate toasts across hook instances
let lastToastTime = 0
let lastToastAction = ''
let lastSupplierId = ''

export const useFavorites = (showToasts = true) => {
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Helper function to show toast only if not recently shown
  const showToastIfNotRecent = useCallback((toastFn, supplierId, action) => {
    const now = Date.now()
    const actionKey = `${action}-${supplierId}`
    
    // Prevent duplicate toasts within 1 second for same supplier/action
    if (now - lastToastTime < 1000 && lastToastAction === actionKey) {
      return
    }
    
    lastToastTime = now
    lastToastAction = actionKey
    lastSupplierId = supplierId
    
    setTimeout(() => {
      toastFn()
    }, 0)
  }, [])

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorite_suppliers')
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites)
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add supplier to favorites
  const addToFavorites = useCallback((supplier) => {
    const favoriteData = {
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      image: supplier.image,
      rating: supplier.rating,
      priceFrom: supplier.priceFrom,
      location: supplier.location,
      themes: supplier.themes || [],
      savedAt: new Date().toISOString()
    }

    setFavorites(prev => {
      // Check if already in favorites
      if (prev.some(fav => fav.id === supplier.id)) {
        return prev // Already exists, don't add again
      }
      
      const newFavorites = [...prev, favoriteData]
      
      // Save to localStorage
      try {
        localStorage.setItem('favorite_suppliers', JSON.stringify(newFavorites))
        
        // Show success toast after state update (deferred to avoid render issues)
        if (showToasts) {
          showToastIfNotRecent(() => {
            toast.success(`${supplier.name} saved to favorites!`, {
              title: "Added to Favorites",
              duration: 3000
            })
          }, supplier.id, 'add')
        }
        
      } catch (error) {
        console.error('Error saving to localStorage:', error)
        if (showToasts) {
          showToastIfNotRecent(() => {
            toast.error('Failed to save to favorites. Please try again.', {
              title: "Save Failed"
            })
          }, supplier.id, 'error')
        }
        return prev // Return previous state on error
      }
      
      return newFavorites
    })
  }, [toast, showToasts, showToastIfNotRecent])

  // Remove supplier from favorites
  const removeFromFavorites = useCallback((supplierId) => {
    setFavorites(prev => {
      const supplierToRemove = prev.find(fav => fav.id === supplierId)
      const newFavorites = prev.filter(fav => fav.id !== supplierId)
      
      // Save to localStorage
      try {
        localStorage.setItem('favorite_suppliers', JSON.stringify(newFavorites))
        
        // Show removal toast (optional - shorter duration)
        if (showToasts && supplierToRemove) {
          showToastIfNotRecent(() => {
            toast.info(`${supplierToRemove.name} removed from favorites`, {
              duration: 2000
            })
          }, supplierId, 'remove')
        }
        
      } catch (error) {
        console.error('Error saving to localStorage:', error)
        return prev // Return previous state on error
      }
      
      return newFavorites
    })
  }, [toast, showToasts])

  // Toggle favorite status
  const toggleFavorite = useCallback((supplier) => {
    const isCurrentlyFavorite = favorites.some(fav => fav.id === supplier.id)
    
    if (isCurrentlyFavorite) {
      removeFromFavorites(supplier.id)
    } else {
      addToFavorites(supplier)
    }
  }, [favorites, addToFavorites, removeFromFavorites])

  // Check if supplier is in favorites
  const isFavorite = useCallback((supplierId) => {
    return favorites.some(fav => fav.id === supplierId)
  }, [favorites])

  // Clear all favorites
  const clearAllFavorites = useCallback(() => {
    const count = favorites.length
    
    setFavorites([])
    
    try {
      localStorage.removeItem('favorite_suppliers')
      
      if (showToasts && count > 0) {
        showToastIfNotRecent(() => {
          toast.success(`Cleared ${count} favorite${count === 1 ? '' : 's'}`, {
            title: "Favorites Cleared",
            duration: 3000
          })
        }, 'all', 'clear')
      }
      
    } catch (error) {
      console.error('Error clearing favorites:', error)
      if (showToasts) {
        showToastIfNotRecent(() => {
          toast.error('Failed to clear favorites. Please try again.', {
            title: "Clear Failed"
          })
        }, 'all', 'clear-error')
      }
    }
  }, [favorites.length, toast, showToasts, showToastIfNotRecent])

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    return favorites.length
  }, [favorites])

  // Get favorites by category
  const getFavoritesByCategory = useCallback((category) => {
    return favorites.filter(fav => fav.category.toLowerCase() === category.toLowerCase())
  }, [favorites])

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    getFavoritesCount,
    getFavoritesByCategory
  }
}