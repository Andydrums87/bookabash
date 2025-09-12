"use client"

import { useState, useEffect, useContext, createContext, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { suppliersAPI } from '@/utils/mockBackend'

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [initialized, setInitialized] = useState(false); // ADD: Track if initially loaded
  
  const router = useRouter();
  const pathname = usePathname();

  // Memoize helper functions to prevent re-renders
  const getStoredBusinessId = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBusinessId');
    }
    return null;
  }, []);

  const storeBusinessId = useCallback((businessId) => {
    if (typeof window !== 'undefined') {
      if (businessId) {
        localStorage.setItem('selectedBusinessId', businessId);
        console.log("💾 Stored business ID:", businessId);
      } else {
        localStorage.removeItem('selectedBusinessId');
        console.log("🗑️ Removed stored business ID");
      }
    }
  }, []);

// Updated loadBusinesses - make it properly async and return businesses
const loadBusinesses = useCallback(async (isInitialLoad = false) => {
  try {
    console.log('🏢 Loading businesses for owner...');
    
    if (isInitialLoad) {
      setLoading(true);
    }
    
    const { data: userResult, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const userId = userResult?.user?.id;
    if (!userId) throw new Error("No logged-in user");

    const { data: businessRows, error: businessErr } = await supabase
      .from("suppliers")
      .select(`
        id,
        business_name,
        business_type,
        is_primary,
        parent_business_id,
        created_from_theme,
        business_slug,
        data,
        created_at,
        updated_at
      `)
      .eq("auth_user_id", userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (businessErr) throw businessErr;

    if (!businessRows || businessRows.length === 0) {
      console.log('❌ No businesses found for user');
      setBusinesses([]);
      setCurrentBusiness(null);
      setOwnerInfo(null);
      storeBusinessId(null);
      return [];
    }

    const primaryBusiness = businessRows.find(b => b.is_primary) || businessRows[0];
    const ownerData = primaryBusiness.data.owner;
    setOwnerInfo(ownerData);

    const businessList = businessRows.map((business) => {
      const businessData = business.data || {};
      
      return {
        id: business.id,
        name: business.business_name || businessData.name || 'Unnamed Business',
        supplierData: business,
        serviceType: businessData.serviceType || 'entertainer',
        theme: business.created_from_theme || businessData.themes?.[0] || 'general',
        description: businessData.description || '',
        location: businessData.location || '',
        priceFrom: businessData.priceFrom || 0,
        status: businessData.isComplete ? 'active' : 'draft',
        
        isPrimary: business.is_primary,
        businessType: business.business_type,
        parentBusinessId: business.parent_business_id,
        businessSlug: business.business_slug,
        
        data: businessData,
        owner: businessData.owner || {}
      };
    });

    setBusinesses(businessList);
    
    // OPTIMIZED: Better business selection logic
    if (isInitialLoad || !currentBusiness) {
      let selectedBusiness = null;
      const storedId = getStoredBusinessId();
      
      if (storedId) {
        selectedBusiness = businessList.find(b => b.id === storedId);
      }
      
      if (!selectedBusiness) {
        selectedBusiness = businessList.find(b => b.isPrimary) || businessList[0];
      }

      if (selectedBusiness) {
        setCurrentBusiness(selectedBusiness);
        storeBusinessId(selectedBusiness.id);
        console.log('🏢 Set current business to:', selectedBusiness.name);
      }
    }
    
    return businessList; // Return the businesses for waiting
    
  } catch (error) {
    console.error('❌ Failed to load businesses:', error);
    return [];
  } finally {
    if (isInitialLoad) {
      setLoading(false);
      setInitialized(true);
    }
  }
}, [getStoredBusinessId, storeBusinessId, currentBusiness]);

const switchBusiness = useCallback(async (businessId) => {
  try {
    console.log('🔄 Switching to business:', businessId);
    setSwitching(true);

    // FIXED: Wait for businesses to be available and include the target business
    let business = businesses.find(b => b.id === businessId);
    let retries = 0;
    
    while (!business && retries < 5) {
      console.log(`⏳ Business not found in state, waiting... (attempt ${retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 200));
      business = businesses.find(b => b.id === businessId);
      retries++;
    }

    if (!business) {
      // Last resort: fetch directly from database
      console.log('📡 Fetching business directly from database...');
      const { data: directBusiness, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', businessId)
        .single();
        
      if (error || !directBusiness) {
        throw new Error(`Business ${businessId} not found in database`);
      }
      
      // Create business object in expected format
      business = {
        id: directBusiness.id,
        name: directBusiness.business_name,
        supplierData: directBusiness,
        serviceType: directBusiness.data?.serviceType || 'entertainer',
        isPrimary: directBusiness.is_primary,
        businessType: directBusiness.business_type,
        data: directBusiness.data || {},
        owner: directBusiness.data?.owner || {}
      };
    }

    // Simulate loading for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setCurrentBusiness(business);
    storeBusinessId(businessId);
    
    window.dispatchEvent(new CustomEvent('businessSwitched', { 
      detail: { businessId, business } 
    }));
    
    console.log('✅ Switched to:', business.name);

  } catch (error) {
    console.error('❌ Error switching business:', error);
    throw error;
  } finally {
    setSwitching(false);
  }
}, [businesses, storeBusinessId]);

// Updated createNewBusiness - wait for businesses to actually load
const createNewBusiness = useCallback(async (businessData) => {
  try {
    console.log('🎭 Creating new themed business:', businessData);

    const { data: userResult, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    const userId = userResult?.user?.id;
    if (!userId) throw new Error("No logged-in user");

    const primaryBusiness = businesses.find(b => b.isPrimary);
    if (!primaryBusiness) {
      throw new Error("No primary business found");
    }

    // Create the themed business using the API
    const result = await suppliersAPI.createThemedBusiness(primaryBusiness.id, {
      name: businessData.name,
      serviceType: businessData.serviceType,
      theme: businessData.theme || '',
      description: businessData.description || ''
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('✅ New themed business created:', result.business.id);

    // FIXED: Wait for businesses to reload and get the updated list
    const updatedBusinesses = await loadBusinesses(false);
    
    // Check if the new business exists in the updated list
    const newBusiness = updatedBusinesses.find(b => b.id === result.business.id);
    if (!newBusiness) {
      // If not found, wait a bit more and try again
      await new Promise(resolve => setTimeout(resolve, 500));
      const retryBusinesses = await loadBusinesses(false);
      const retryBusiness = retryBusinesses.find(b => b.id === result.business.id);
      
      if (!retryBusiness) {
        throw new Error("Created business not found after reload");
      }
    }
    
    // Now switch to the new business
    await switchBusiness(result.business.id);

    return result;

  } catch (error) {
    console.error('❌ Error creating themed business:', error);
    throw error;
  }
}, [businesses, loadBusinesses, switchBusiness]);







  const generateBusinessSlug = useCallback((businessName) => {
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  }, []);

  // OPTIMIZED: Memoize business hierarchy
  const businessHierarchy = useMemo(() => {
    const primaryBusiness = businesses.find(b => b.isPrimary);
    const themedBusinesses = businesses.filter(b => !b.isPrimary);
    
    return {
      primary: primaryBusiness,
      themed: themedBusinesses,
      all: businesses
    };
  }, [businesses]);

  // OPTIMIZED: Single useEffect for initial load
  useEffect(() => {
    if (!initialized) {
      loadBusinesses(true); // Initial load
    }
  }, [initialized, loadBusinesses]);

  // REMOVED: Pathname effect that was causing re-loads on navigation
  // REMOVED: Auth state effect that was overlapping with initial load

  // OPTIMIZED: Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Core state
    currentBusiness,
    businesses,
    ownerInfo,
    loading,
    switching,
    initialized, // ADD: Expose initialized state
    
    // Actions
    switchBusiness,
    createNewBusiness,
    refreshBusinesses: () => loadBusinesses(false),
    
    // Utilities
    getBusinessHierarchy: () => businessHierarchy,
    
    // Business queries
    getPrimaryBusiness: () => businesses.find(b => b.isPrimary),
    getThemedBusinesses: () => businesses.filter(b => !b.isPrimary),
    getBusinessBySlug: (slug) => businesses.find(b => b.businessSlug === slug)
  }), [
    currentBusiness,
    businesses,
    ownerInfo,
    loading,
    switching,
    initialized,
    switchBusiness,
    createNewBusiness,
    loadBusinesses,
    businessHierarchy
  ]);

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

// Hooks remain the same
export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within BusinessProvider');
  }
  return context;
};

export const useCurrentBusiness = () => {
  const { currentBusiness } = useBusiness();
  return currentBusiness;
};

export const usePrimaryBusiness = () => {
  const { getPrimaryBusiness } = useBusiness();
  return getPrimaryBusiness();
};

export const useThemedBusinesses = () => {
  const { getThemedBusinesses } = useBusiness();
  return getThemedBusinesses();
};