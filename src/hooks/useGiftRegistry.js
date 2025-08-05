// hooks/useGiftRegistry.js - Updated with enhanced useGiftSearch
import { useState, useEffect, useCallback, useRef } from 'react';
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend';

export const useGiftRegistry = (partyId) => {
  const [registry, setRegistry] = useState(null);
  const [registryItems, setRegistryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRegistry = async () => {
    if (!partyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      partyDatabaseBackend.debugGiftItemsTable()
      const result = await partyDatabaseBackend.getPartyGiftRegistry(partyId);
      if (result.success) {
        setRegistry(result.registry);
        setRegistryItems(result.items);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading gift registry:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRegistry = async (registryData = {}) => {
    if (!partyId) return { success: false, error: 'No party ID' };
    console.log("hello")
    
    try {
      const result = await partyDatabaseBackend.createGiftRegistry(partyId, registryData);
      if (result.success) {
        setRegistry(result.registry);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('Error creating gift registry:', err);
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  };

  const addCuratedItem = async (giftItemId, itemData = {}) => {
    if (!registry) return { success: false, error: 'No registry found' };
    
    try {
      // Check if this is a real Amazon product vs curated item
      if (typeof giftItemId === 'object' || (typeof giftItemId === 'string' && giftItemId.startsWith('amazon_'))) {
        // This is a real product object, not a curated item ID
        const productData = typeof giftItemId === 'object' ? giftItemId : null;
        
        if (!productData) {
          throw new Error('Invalid product data for real Amazon product');
        }
        
        const result = await partyDatabaseBackend.addRealProductToRegistry(
          registry.id, 
          productData, 
          itemData
        );
        
        if (result.success) {
          setRegistryItems(prev => [...prev, result.registryItem]);
          return result;
        } else {
          setError(result.error);
          return result;
        }
      } else {
        // This is a curated item with a real UUID
        const result = await partyDatabaseBackend.addCuratedItemToRegistry(
          registry.id, 
          giftItemId, 
          itemData
        );
        
        if (result.success) {
          setRegistryItems(prev => [...prev, result.registryItem]);
          return result;
        } else {
          setError(result.error);
          return result;
        }
      }
    } catch (err) {
      console.error('Error adding item to registry:', err);
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  };

  const addCustomItem = async (itemData) => {
    if (!registry) return { success: false, error: 'No registry found' };
    
    try {
      const result = await partyDatabaseBackend.addCustomItemToRegistry(
        registry.id, 
        itemData
      );
      
      if (result.success) {
        setRegistryItems(prev => [...prev, result.registryItem]);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('Error adding custom item to registry:', err);
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  };

  const removeItem = async (registryItemId) => {
    try {
      const result = await partyDatabaseBackend.removeItemFromRegistry(registryItemId);
      if (result.success) {
        setRegistryItems(prev => prev.filter(item => item.id !== registryItemId));
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('Error removing item from registry:', err);
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  };

  const updateItem = async (registryItemId, updates) => {
    try {
      const result = await partyDatabaseBackend.updateRegistryItem(registryItemId, updates);
      if (result.success) {
        setRegistryItems(prev => 
          prev.map(item => 
            item.id === registryItemId ? result.registryItem : item
          )
        );
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      console.error('Error updating registry item:', err);
      const error = err.message;
      setError(error);
      return { success: false, error };
    }
  };

  // Load registry on mount and when partyId changes
  useEffect(() => {
    loadRegistry();
  }, [partyId]);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    registry,
    registryItems,
    loading,
    error,
    createRegistry,
    addCuratedItem,
    addCustomItem,
    removeItem,
    updateItem,
    refreshRegistry: loadRegistry,
    // Computed values
    hasRegistry: !!registry,
    hasItems: registryItems.length > 0,
    itemCount: registryItems.length
  };
};

// Update your useGiftSuggestions hook in hooks/useGiftRegistry.js

export const useGiftSuggestions = (theme, age, category = null) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      // Don't load if theme or age is null/undefined
      if (!theme || !age || theme === 'undefined') {
        console.log('🚫 Skipping suggestions load - missing theme or age:', { theme, age });
        setSuggestions([]);
        setLoading(false);
        return;
      }
      
      console.log('🎯 Loading suggestions for:', { theme, age, category });
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await partyDatabaseBackend.getGiftSuggestions(theme, age, category);
        if (result.success) {
          setSuggestions(result.suggestions);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error('Error loading gift suggestions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [theme, age, category]);

  return { suggestions, loading, error };
};
// Enhanced hook for gift search with debouncing and caching
export const useGiftSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // In-memory cache with timestamp
  const searchCacheRef = useRef(new Map());
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  const DEBOUNCE_DELAY = 800; // 800ms delay

  // Clear any pending search on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const performSearch = useCallback(async (searchTerm, age = null, category = null) => {
    const cacheKey = `${searchTerm}-${age}-${category}`.toLowerCase().trim();
    
    // Don't search empty queries
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Don't search if it's the same as last query
    if (searchTerm === lastQuery) {
      console.log('🔄 Skipping duplicate search for:', searchTerm);
      return;
    }

    // Check cache first
    const cached = searchCacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('💾 Using cached results for:', searchTerm);
      setSearchResults(cached.data);
      setLastQuery(searchTerm);
      setError(null);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    console.log('🔍 Making fresh search for:', searchTerm);

    try {
      // Search both curated and Amazon products
      const [curatedResult, amazonResponse] = await Promise.allSettled([
        partyDatabaseBackend.searchGifts(searchTerm, age, category, 10),
        fetch('/api/products/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            searchTerm, 
            age, 
            category, 
            limit: 10 
          }),
          signal: abortControllerRef.current.signal
        })
      ]);

      let curated = [];
      if (curatedResult.status === 'fulfilled' && curatedResult.value.success) {
        curated = curatedResult.value.gifts.map(gift => ({ ...gift, source: 'curated' }));
      }

      let amazon = [];
      if (amazonResponse.status === 'fulfilled') {
        const amazonData = await amazonResponse.value.json();
        if (amazonData.success) {
          amazon = amazonData.products.map(product => ({ ...product, source: 'amazon' }));
        }
      }

      // Interleave results for variety
      const combined = [];
      const maxLength = Math.max(curated.length, amazon.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (curated[i]) combined.push(curated[i]);
        if (amazon[i]) combined.push(amazon[i]);
      }

      console.log('🔍 Search results:', { 
        searchTerm, 
        curated: curated.length, 
        amazon: amazon.length, 
        total: combined.length 
      });

      // Cache the results
      searchCacheRef.current.set(cacheKey, {
        data: combined,
        timestamp: Date.now()
      });

      setSearchResults(combined);
      setLastQuery(searchTerm);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 Search aborted');
        return;
      }
      console.error('Error searching gifts:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [lastQuery]);

  const searchGifts = useCallback((searchTerm, age = null, category = null) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set loading state immediately for better UX
    if (searchTerm.trim() && searchTerm !== lastQuery) {
      setIsLoading(true);
    }

    // Debounce the actual search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchTerm, age, category);
    }, DEBOUNCE_DELAY);
  }, [performSearch, lastQuery]);

  const searchGiftsImmediate = useCallback((searchTerm, age = null, category = null) => {
    // For button clicks - no debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    performSearch(searchTerm, age, category);
  }, [performSearch]);

  const clearSearch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchResults([]);
    setLastQuery('');
    setIsLoading(false);
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    searchCacheRef.current.clear();
    console.log('🗑️ Search cache cleared');
  }, []);

  return {
    searchResults,
    searchGifts, // Debounced version for typing
    searchGiftsImmediate, // Immediate version for button clicks
    clearSearch,
    clearCache,
    isLoading,
    error,
    cacheSize: searchCacheRef.current.size
  };
};