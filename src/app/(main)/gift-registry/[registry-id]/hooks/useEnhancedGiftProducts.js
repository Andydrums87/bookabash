// Create this file: /hooks/useEnhancedGiftProducts.js

import { useState, useCallback } from 'react'

export const useEnhancedGiftProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  
  const loadProducts = useCallback(async (mode, options = {}) => {
    const { 
      searchTerm, 
      category, 
      theme, 
      age, 
      limit = 20, 
      page = 1, 
      append = false 
    } = options;
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/products/search', {  // CORRECTED ENDPOINT
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          searchTerm,
          category,
          theme,
          age,
          limit,
          page
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (append) {
          setProducts(prev => [...prev, ...data.products])
        } else {
          setProducts(data.products)
        }
        setHasMore(data.hasMore)
        setCurrentPage(data.currentPage)
        setTotalResults(data.totalResults)
      } else {
        throw new Error(data.error || 'Failed to load products')
      }
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  
  const loadMore = useCallback((mode, options) => {
    if (hasMore && !loading) {
      loadProducts(mode, { ...options, page: currentPage + 1, append: true })
    }
  }, [hasMore, loading, currentPage, loadProducts])
  
  const reset = useCallback(() => {
    setProducts([])
    setCurrentPage(1)
    setHasMore(true)
    setTotalResults(0)
    setError(null)
  }, [])
  
  return { 
    products, 
    loading, 
    error, 
    hasMore, 
    currentPage, 
    totalResults,
    loadProducts, 
    loadMore, 
    reset 
  }
}