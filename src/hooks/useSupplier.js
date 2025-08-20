// Updated useSupplier hook - FIXED TO USE BusinessContext
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useBusiness } from "@/contexts/BusinessContext" // 👈 CRUCIAL: Import BusinessContext

export function useSupplier() {
  // 🔧 FIX: Get currentBusiness from BusinessContext instead of local state
  const { currentBusiness, switching } = useBusiness()
  
  const [supplier, setSupplier] = useState(null)
  const [supplierData, setSupplierData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Add refs to prevent duplicate calls
  const isLoadingRef = useRef(false)
  const lastBusinessIdRef = useRef(null)

  // ✅ Memoize the loadSupplier function to prevent recreation
  const loadSupplier = useCallback(async () => {
    const businessId = currentBusiness?.id
    
    // ✅ Prevent duplicate calls
    if (isLoadingRef.current || lastBusinessIdRef.current === businessId) {
      console.log("🚫 Skipping duplicate loadSupplier call")
      return
    }

    // 🔧 FIX: Don't load if we don't have a business yet
    if (!businessId) {
      console.log("⏳ No business selected yet, waiting...")
      setLoading(false)
      return
    }

    isLoadingRef.current = true
    lastBusinessIdRef.current = businessId
    setLoading(true)
    setError(null)

    try {
      const { data: userResult, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      const userId = userResult?.user?.id
      if (!userId) throw new Error("No logged-in user")

      console.log("🔍 useSupplier loading for business:", currentBusiness.name, businessId)

      // Load the specific business from the context
      const { data: businessRow, error: businessErr } = await supabase
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
          auth_user_id
        `)
        .eq("id", businessId)
        .eq("auth_user_id", userId)
        .single()

      if (businessErr) throw businessErr

      if (businessRow) {
        setSupplier(businessRow)
        const businessData = businessRow.data || {}
        setSupplierData(businessData)
        
        console.log("✅ Loaded business data for:", businessRow.business_name)
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('supplierDataChanged', { 
          detail: { 
            supplier: businessRow,
            supplierData: businessData,
            businessId: businessId 
          } 
        }))
      }

    } catch (err) {
      console.error("❌ Error fetching supplier:", err)
      setError(err.message)
      setSupplier(null)
      setSupplierData(null)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [currentBusiness?.id, currentBusiness?.name]) // 🔧 FIX: Depend on business from context

  // ✅ Memoized refresh function
  const refresh = useCallback(async () => {
    console.log("🔄 Refreshing supplier data...")
    lastBusinessIdRef.current = null // Reset to force reload
    await loadSupplier()
  }, [loadSupplier])

  // 🔧 UPDATED: Load supplier when currentBusiness changes from BusinessContext
  useEffect(() => {
    if (currentBusiness?.id && currentBusiness.id !== lastBusinessIdRef.current) {
      console.log("🏢 Business changed in context, loading data for:", currentBusiness.name)
      loadSupplier()
    }
  }, [currentBusiness?.id, loadSupplier])

  // 🆕 ENHANCED: Listen for force refresh events
  useEffect(() => {
    const handleForceRefresh = (event) => {
      console.log("🔄 Force refresh triggered, reloading supplier data...")
      lastBusinessIdRef.current = null // Reset to force reload
      loadSupplier()
    }

    window.addEventListener('forceComponentRefresh', handleForceRefresh)
    return () => window.removeEventListener('forceComponentRefresh', handleForceRefresh)
  }, [loadSupplier])

  // 🔧 FIX: Remove the businessSwitched event listener since we're using context now
  // The BusinessContext will handle the switching

  // ✅ Supplier update event listener - stable
  useEffect(() => {
    const handleSupplierUpdate = () => {
      console.log("🔄 Supplier updated event received, refreshing...")
      refresh()
    }

    window.addEventListener('supplierUpdated', handleSupplierUpdate)
    return () => window.removeEventListener('supplierUpdated', handleSupplierUpdate)
  }, [refresh])

  // ✅ Debug info
  const debugInfo = useMemo(() => ({
    currentBusinessId: currentBusiness?.id,
    currentBusinessName: currentBusiness?.name,
    supplierLoaded: !!supplier,
    supplierName: supplier?.business_name,
    loading,
    switching
  }), [currentBusiness?.id, currentBusiness?.name, !!supplier, supplier?.business_name, loading, switching])

  // ✅ Only log when debug info actually changes
  useEffect(() => {
    console.log("🔍 useSupplier state:", debugInfo)
  }, [debugInfo])

  // ✅ Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    supplier, 
    supplierData, 
    setSupplierData, 
    loading: loading || switching, // 🔧 FIX: Include switching state
    error,
    refresh,
    currentBusiness,
    
    // Helper methods
    isMultiBusiness: !!currentBusiness,
    businessName: supplier?.business_name || supplierData?.name,
    isPrimaryBusiness: supplier?.is_primary || false,
    businessType: supplier?.business_type || 'primary'
  }), [supplier, supplierData, loading, switching, error, refresh, currentBusiness])
}