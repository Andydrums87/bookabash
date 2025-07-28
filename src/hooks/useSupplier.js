// Updated useSupplier hook - OPTIMIZED VERSION
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"

let businessSwitchTimeout = null

export function useSupplier() {
  const [currentBusiness, setCurrentBusiness] = useState(null)
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

    isLoadingRef.current = true
    lastBusinessIdRef.current = businessId
    setLoading(true)
    setError(null)

    try {
      const { data: userResult, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      const userId = userResult?.user?.id
      if (!userId) throw new Error("No logged-in user")

      console.log("🔍 useSupplier loading for user:", userId)

      // If we have a specific business selected, load that one
      if (currentBusiness?.id) {
        console.log("🏢 Loading specific business:", currentBusiness.name, currentBusiness.id)
        
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
          .eq("id", currentBusiness.id)
          .eq("auth_user_id", userId)
          .single()

        if (businessErr) throw businessErr

        if (businessRow) {
          setSupplier(businessRow)
          const businessData = businessRow.data || {}
          setSupplierData(businessData)
          
          console.log("✅ Loaded specific business data:", businessRow.business_name)
          
          // ✅ Only dispatch event if data actually changed
          if (supplier?.id !== businessRow.id) {
            window.dispatchEvent(new CustomEvent('supplierDataChanged', { 
              detail: { 
                supplier: businessRow,
                supplierData: businessData,
                businessId: currentBusiness.id 
              } 
            }))
          }
        }
      } else {
        // Load user's primary business if no specific business selected
        console.log("🏢 Loading primary business for user")
        
        const { data: primaryBusiness, error: primaryErr } = await supabase
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
          .eq("auth_user_id", userId)
          .eq("is_primary", true)
          .maybeSingle()

        if (primaryErr) throw primaryErr

        if (primaryBusiness) {
          setSupplier(primaryBusiness)
          const businessData = primaryBusiness.data || {}
          setSupplierData(businessData)
          console.log("✅ Loaded primary business:", primaryBusiness.business_name)
          
          // ✅ Only dispatch if data changed
          if (supplier?.id !== primaryBusiness.id) {
            window.dispatchEvent(new CustomEvent('supplierDataChanged', { 
              detail: { 
                supplier: primaryBusiness,
                supplierData: businessData,
                businessId: primaryBusiness.id 
              } 
            }))
          }
        } else {
          console.log("❌ No primary business found")
          setSupplier(null)
          setSupplierData(null)
        }
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
  }, [currentBusiness?.id]) // ✅ Only depend on business ID, not the whole object

  // ✅ Debounced business switch handler
  const handleBusinessSwitch = useCallback((event) => {
    console.log("🏢 Business switch requested:", event.detail.business.name)
    
    if (businessSwitchTimeout) {
      clearTimeout(businessSwitchTimeout)
    }
    
    businessSwitchTimeout = setTimeout(() => {
      console.log("🏢 Applying business switch to:", event.detail.business.name)
      setCurrentBusiness(event.detail.business)
      lastBusinessIdRef.current = null // Reset to allow loading
    }, 100)
  }, [])

  // ✅ Memoized refresh function
  const refresh = useCallback(async () => {
    console.log("🔄 Refreshing supplier data...")
    lastBusinessIdRef.current = null // Reset to force reload
    await loadSupplier()
  }, [loadSupplier])

  // ✅ Business switch event listener - stable
  useEffect(() => {
    window.addEventListener('businessSwitched', handleBusinessSwitch)
    return () => {
      window.removeEventListener('businessSwitched', handleBusinessSwitch)
      if (businessSwitchTimeout) {
        clearTimeout(businessSwitchTimeout)
      }
    }
  }, [handleBusinessSwitch])

  // ✅ Load supplier when business changes - but only when it actually changes
  useEffect(() => {
    if (currentBusiness?.id !== lastBusinessIdRef.current) {
      loadSupplier()
    }
  }, [currentBusiness?.id, loadSupplier])

  // ✅ Supplier update event listener - stable
  useEffect(() => {
    const handleSupplierUpdate = () => {
      console.log("🔄 Supplier updated event received, refreshing...")
      refresh()
    }

    window.addEventListener('supplierUpdated', handleSupplierUpdate)
    return () => window.removeEventListener('supplierUpdated', handleSupplierUpdate)
  }, [refresh])

  // ✅ Reduce debug logging frequency
  const debugInfo = useMemo(() => ({
    currentBusinessId: currentBusiness?.id,
    currentBusinessName: currentBusiness?.name,
    supplierLoaded: !!supplier,
    supplierName: supplier?.business_name,
    loading
  }), [currentBusiness?.id, currentBusiness?.name, !!supplier, supplier?.business_name, loading])

  // ✅ Only log when debug info actually changes
  useEffect(() => {
    console.log("🔍 useSupplier state:", debugInfo)
  }, [debugInfo])

  // ✅ Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    supplier, 
    supplierData, 
    setSupplierData, 
    loading, 
    error,
    refresh,
    currentBusiness,
    
    // Helper methods
    isMultiBusiness: !!currentBusiness,
    businessName: supplier?.business_name || supplierData?.name,
    isPrimaryBusiness: supplier?.is_primary || false,
    businessType: supplier?.business_type || 'primary'
  }), [supplier, supplierData, loading, error, refresh, currentBusiness])
}