"use client"

import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

// Create Business Context
const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false); // 🆕 Add switching state
  
  const router = useRouter();
  const pathname = usePathname();

  // 🆕 Helper function to get stored business ID
  const getStoredBusinessId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedBusinessId');
    }
    return null;
  };

  // 🆕 Helper function to store business ID
  const storeBusinessId = (businessId) => {
    if (typeof window !== 'undefined') {
      if (businessId) {
        localStorage.setItem('selectedBusinessId', businessId);
        console.log("💾 Stored business ID:", businessId);
      } else {
        localStorage.removeItem('selectedBusinessId');
        console.log("🗑️ Removed stored business ID");
      }
    }
  };

  // Load all businesses for the current owner
  const loadBusinesses = async () => {
    try {
      console.log('🏢 Loading businesses for owner...');
      setLoading(true); // 🆕 Set loading state
      
      // Get current authenticated user
      const { data: userResult, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const userId = userResult?.user?.id;
      if (!userId) throw new Error("No logged-in user");

      console.log('👤 Loading businesses for user:', userId);

      // Load ALL businesses for this owner (both primary and themed)
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
        .order('is_primary', { ascending: false }) // Primary business first
        .order('created_at', { ascending: true });

      if (businessErr) throw businessErr;

      console.log('📋 Raw business data:', businessRows?.length || 0, 'businesses found');

      if (!businessRows || businessRows.length === 0) {
        console.log('❌ No businesses found for user');
        setBusinesses([]);
        setCurrentBusiness(null);
        setOwnerInfo(null);
        storeBusinessId(null); // 🆕 Clear stored ID
        setLoading(false);
        return;
      }

      // Extract owner info from primary business
      const primaryBusiness = businessRows.find(b => b.is_primary) || businessRows[0];
      const ownerData = primaryBusiness.data.owner;
      setOwnerInfo(ownerData);

      // Transform businesses to consistent format
      const businessList = businessRows.map((business) => {
        const businessData = business.data || {};
        
        return {
          id: business.id,
          name: business.business_name || businessData.name || 'Unnamed Business',
          serviceType: businessData.serviceType || 'entertainer',
          theme: business.created_from_theme || businessData.themes?.[0] || 'general',
          description: businessData.description || '',
          location: businessData.location || '',
          priceFrom: businessData.priceFrom || 0,
          status: businessData.isComplete ? 'active' : 'draft',
          
          // Business relationship info
          isPrimary: business.is_primary,
          businessType: business.business_type,
          parentBusinessId: business.parent_business_id,
          businessSlug: business.business_slug,
          
          // Full data access
          data: businessData,
          supplierData: business,
          
          // Owner info (consistent across all businesses)
          owner: businessData.owner || {}
        };
      });

      console.log('🏢 Processed businesses:', businessList.map(b => ({
        id: b.id,
        name: b.name,
        type: b.businessType,
        isPrimary: b.isPrimary,
        theme: b.theme
      })));

      setBusinesses(businessList);
      
      // 🆕 Enhanced current business selection
      let selectedBusiness = null;
      const storedId = getStoredBusinessId();
      
      if (storedId) {
        selectedBusiness = businessList.find(b => b.id === storedId);
        console.log("🎯 Found stored business:", selectedBusiness?.name);
      }
      
      if (!selectedBusiness) {
        selectedBusiness = businessList.find(b => b.isPrimary) || businessList[0];
        console.log("🏆 Using fallback business:", selectedBusiness?.name);
      }

      if (selectedBusiness) {
        setCurrentBusiness(selectedBusiness);
        storeBusinessId(selectedBusiness.id);
        console.log('🏢 Set current business to:', selectedBusiness.name);
      }
      
    } catch (error) {
      console.error('❌ Failed to load businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new themed business
  const createNewBusiness = async (businessData) => {
    try {
      console.log('🎭 Creating new themed business:', businessData);

      // Get current user
      const { data: userResult, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const userId = userResult?.user?.id;
      if (!userId) throw new Error("No logged-in user");

      // Find the primary business (parent for themed businesses)
      const primaryBusiness = businesses.find(b => b.isPrimary);
      if (!primaryBusiness) {
        throw new Error("No primary business found");
      }

      // Generate business slug
      const businessSlug = generateBusinessSlug(businessData.name);

      // Create themed business data (inherits from primary)
      const themedBusinessData = {
        ...primaryBusiness.data, // Inherit everything from primary
        
        // Override with themed-specific data
        name: businessData.name,
        description: `Professional ${businessData.serviceType} services specializing in ${businessData.theme} themes.`,
        serviceType: businessData.serviceType,
        themes: [businessData.theme],
        
        // Reset business-specific metrics
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        packages: [],
        portfolioImages: [],
        portfolioVideos: [],
        
        // Mark as incomplete for setup
        isComplete: false,
        
        // Update timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Insert new themed business
      const { data: newBusiness, error: insertErr } = await supabase
        .from('suppliers')
        .insert({
          auth_user_id: userId,
          business_name: businessData.name,
          business_type: 'themed',
          is_primary: false,
          parent_business_id: primaryBusiness.id,
          created_from_theme: businessData.theme,
          business_slug: businessSlug,
          data: themedBusinessData
        })
        .select()
        .single();

      if (insertErr) {
        console.error('❌ Insert error:', insertErr);
        throw insertErr;
      }

      console.log('✅ New themed business created:', newBusiness.id);

      // Reload businesses to include the new one
      await loadBusinesses();

      // Switch to the new business
      await switchBusiness(newBusiness.id);

      return { success: true, business: newBusiness };

    } catch (error) {
      console.error('❌ Error creating themed business:', error);
      throw error;
    }
  };

  // 🆕 Enhanced switch between businesses with loading state
  const switchBusiness = async (businessId) => {
    try {
      console.log('🔄 Switching to business:', businessId);
      setSwitching(true); // 🆕 Set switching state

      const business = businesses.find(b => b.id === businessId);
      if (!business) {
        throw new Error("Business not found");
      }

      // 🆕 Simulate loading time for UX (optional)
      await new Promise(resolve => setTimeout(resolve, 300));

      setCurrentBusiness(business);
      storeBusinessId(businessId); // 🆕 Store the selection
      
      // Trigger refresh of supplier data for this business
      window.dispatchEvent(new CustomEvent('businessSwitched', { 
        detail: { businessId, business } 
      }));
      
      console.log('✅ Switched to:', business.name);

      // 🆕 Force page refresh to ensure all components get new data
      router.refresh();

    } catch (error) {
      console.error('❌ Error switching business:', error);
      throw error;
    } finally {
      setSwitching(false); // 🆕 Clear switching state
    }
  };

  // Helper function to generate URL-safe business slug
  const generateBusinessSlug = (businessName) => {
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  };

  // Get business hierarchy (primary + its themed businesses)
  const getBusinessHierarchy = () => {
    const primaryBusiness = businesses.find(b => b.isPrimary);
    const themedBusinesses = businesses.filter(b => !b.isPrimary);
    
    return {
      primary: primaryBusiness,
      themed: themedBusinesses,
      all: businesses
    };
  };

  // 🆕 Load businesses on mount and when pathname changes
  useEffect(() => {
    loadBusinesses();
  }, []);

  // 🆕 Reload businesses when pathname changes (navigation)
  useEffect(() => {
    if (!loading && currentBusiness) {
      console.log("📍 Path changed, refreshing business data...");
      // Small delay to ensure page transition is complete
      const timer = setTimeout(() => {
        loadBusinesses();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // 🆕 Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setBusinesses([]);
        setCurrentBusiness(null);
        setOwnerInfo(null);
        setLoading(false);
        setSwitching(false);
        storeBusinessId(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        loadBusinesses();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    // Core state
    currentBusiness,
    businesses,
    ownerInfo,
    loading,
    switching, // 🆕 Add switching state
    
    // Actions
    switchBusiness,
    createNewBusiness,
    refreshBusinesses: loadBusinesses,
    
    // Utilities
    getBusinessHierarchy,
    
    // Business queries
    getPrimaryBusiness: () => businesses.find(b => b.isPrimary),
    getThemedBusinesses: () => businesses.filter(b => !b.isPrimary),
    getBusinessBySlug: (slug) => businesses.find(b => b.businessSlug === slug)
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

// Hook to use business context
export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within BusinessProvider');
  }
  return context;
};

// Specialized hooks for common use cases
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