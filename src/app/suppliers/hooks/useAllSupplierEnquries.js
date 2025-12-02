// useAllSupplierEnquiries hook - Fetches enquiries across ALL businesses for supplier
// Based on actual database schema: enquiries table with party_id, supplier_id, status, auto_accepted, payment_status, etc.
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useBusiness } from "@/contexts/BusinessContext"

export function useAllSupplierEnquiries(refreshKey = 0) {
  const { businesses, loading: businessesLoading } = useBusiness()
  
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefreshKey, setLastRefreshKey] = useState(refreshKey)

  // Refs to prevent duplicate calls
  const isLoadingRef = useRef(false)
  const lastBusinessIdsRef = useRef(null)

  // Memoize business IDs to detect changes
  const businessIds = useMemo(() => {
    return businesses?.map(b => b.id).sort().join(',') || ''
  }, [businesses])

  // Manual join method - exactly matches existing supplierEnquiryBackend.js
  const manualJoinAllEnquiries = useCallback(async (supplierIds) => {
    try {
      console.log('🔍 Manual join for all enquiries, supplier IDs:', supplierIds)

      // Step 1: Get all enquiries for all suppliers - EXACT same query as existing backend
      const { data: enquiries, error: enquiriesError } = await supabase
        .from('enquiries')
        .select('*') // All fields: id, party_id, supplier_id, supplier_category, package_id, addon_details, status, auto_accepted, payment_status, etc.
        .in('supplier_id', supplierIds)
        .in('payment_status', ['paid', 'fully_paid', 'deposit_paid']) // Show all paid enquiries to suppliers
        .order('created_at', { ascending: false })

      if (enquiriesError) {
        throw new Error(`Failed to fetch enquiries: ${enquiriesError.message}`)
      }

      console.log('📋 Found', enquiries?.length || 0, 'paid enquiries across all businesses')

      if (!enquiries || enquiries.length === 0) {
        return { success: true, enquiries: [] }
      }

      // Step 2: Get suppliers data to get business names from data.name
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, data, business_name, business_type, is_primary')
        .in('id', supplierIds)

      if (suppliersError) {
        console.error('❌ Suppliers query error:', suppliersError)
      }

      const suppliersMap = new Map(suppliers?.map(s => [s.id, s]) || [])
      console.log('🏢 Loaded', suppliers?.length || 0, 'suppliers for business names')

      // Step 3: Get unique party IDs - EXACT same as existing backend
      const partyIds = [...new Set(enquiries.map(e => e.party_id).filter(Boolean))]
      console.log('🎉 Found', partyIds.length, 'unique parties')

      let parties = []
      if (partyIds.length > 0) {
        const { data: partiesData, error: partiesError } = await supabase
          .from('parties')
          .select('*')
          .in('id', partyIds)

        if (partiesError) {
          console.error('❌ Parties query error:', partiesError)
        } else {
          parties = partiesData || []
          console.log('🎉 Loaded', parties.length, 'parties')
        }
      }

      // Step 4: Get unique user IDs from parties - EXACT same as existing backend
      const userIds = [...new Set(parties.map(p => p.user_id).filter(Boolean))]
      console.log('👤 Found', userIds.length, 'unique users')

      let users = []
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds)

        if (usersError) {
          console.error('❌ Users query error:', usersError)
        } else {
          users = usersData || []
          console.log('👤 Loaded', users.length, 'users')
        }
      }

      // Step 5: Create lookup maps - EXACT same as existing backend
      const partiesMap = new Map(parties.map(p => [p.id, p]))
      const usersMap = new Map(users.map(u => [u.id, u]))

      // Step 6: Join the data manually - SAME structure as existing backend + business context
      const joinedEnquiries = enquiries.map(enquiry => {
        const party = partiesMap.get(enquiry.party_id)
        const user = party ? usersMap.get(party.user_id) : null
        const supplier = suppliersMap.get(enquiry.supplier_id)
        
        // Parse the supplier data JSON to get business name
        let supplierData = null
        let businessName = 'Unknown Business'
        let businessType = 'unknown'
        let businessTheme = 'general'
        
        if (supplier) {
          try {
            supplierData = typeof supplier.data === 'string' 
              ? JSON.parse(supplier.data) 
              : supplier.data
            
            businessName = supplierData?.name || supplier.business_name || 'Unknown Business'
            businessType = supplierData?.serviceType || supplier.business_type || 'unknown'
            businessTheme = supplierData?.themes?.[0] || supplierData?.theme || 'general'
          } catch (e) {
            console.error('❌ Error parsing supplier data:', e)
            businessName = supplier.business_name || 'Unknown Business'
          }
        }

        return {
          ...enquiry, // All actual enquiry fields: id, party_id, supplier_id, supplier_category, package_id, addon_details, status, auto_accepted, payment_status, quoted_price, final_price, etc.
          // EXACT same nested structure as existing backend
          parties: party ? {
            ...party,
            users: user || null
          } : null,
          // Business context from suppliers table data.name
          businessName,
          businessType,
          businessTheme,
          isPrimaryBusiness: supplier?.is_primary || false,
          // Full supplier data for contact info (email, phone)
          supplier: supplierData
        }
      })

      console.log('✅ Successfully joined', joinedEnquiries.length, 'enquiries with party/user/business data')
      console.log('🏢 First enquiry business name:', joinedEnquiries[0]?.businessName)

      return { success: true, enquiries: joinedEnquiries }

    } catch (error) {
      console.error('❌ Manual join error:', error)
      return { success: false, error: error.message }
    }
  }, [])

  const loadAllEnquiries = useCallback(async () => {
    // Prevent duplicate calls and ensure we have businesses
    if (isLoadingRef.current || businessesLoading || !businesses?.length) {
      return
    }

    // Skip if business IDs haven't changed and refresh key is the same
    if (lastBusinessIdsRef.current === businessIds && lastRefreshKey === refreshKey) {
      return
    }

    isLoadingRef.current = true
    lastBusinessIdsRef.current = businessIds
    setLastRefreshKey(refreshKey)
    setLoading(true)
    setError(null)

    try {
      console.log('📋 Loading ALL enquiries for', businesses.length, 'businesses')
      
      const { data: userResult, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      const userId = userResult?.user?.id
      if (!userId) throw new Error("No logged-in user")

      // Get all business IDs for this user
      const allBusinessIds = businesses.map(b => b.id)
      console.log('📋 Fetching enquiries for business IDs:', allBusinessIds)

      // Use the same manual join method as existing backend
      const result = await manualJoinAllEnquiries(allBusinessIds)

      if (result.success) {
        setEnquiries(result.enquiries)
        
        // Group enquiries by business for debugging
        const enquiriesByBusiness = result.enquiries.reduce((acc, enquiry) => {
          const businessName = enquiry.businessName
          acc[businessName] = (acc[businessName] || 0) + 1
          return acc
        }, {})
        
        console.log('📊 Enquiries by business:', enquiriesByBusiness)
      } else {
        throw new Error(result.error)
      }

    } catch (err) {
      console.error("❌ Error fetching all enquiries:", err)
      setError(err.message)
      setEnquiries([])
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [businesses, businessIds, businessesLoading, refreshKey, lastRefreshKey, manualJoinAllEnquiries])

  // Load when businesses are ready or refresh key changes
  useEffect(() => {
    if (!businessesLoading && businesses?.length > 0) {
      console.log('🔄 Loading all enquiries - businesses ready:', businesses.length)
      loadAllEnquiries()
    } else if (!businessesLoading && (!businesses || businesses.length === 0)) {
      console.log('📭 No businesses found, clearing enquiries')
      setEnquiries([])
      setLoading(false)
    }
  }, [businessesLoading, businesses?.length, refreshKey, loadAllEnquiries])

  // Listen for enquiry updates (same as existing useSupplierEnquiries hook)
  useEffect(() => {
    const handleEnquiryUpdate = () => {
      console.log('🔔 Enquiry updated, refreshing all enquiries')
      lastBusinessIdsRef.current = null
      loadAllEnquiries()
    }

    window.addEventListener('enquiryUpdated', handleEnquiryUpdate)
    window.addEventListener('supplierUpdated', handleEnquiryUpdate)
    
    return () => {
      window.removeEventListener('enquiryUpdated', handleEnquiryUpdate)
      window.removeEventListener('supplierUpdated', handleEnquiryUpdate)
    }
  }, [loadAllEnquiries])

  // Set up real-time subscription (same as existing useSupplierEnquiries hook)
  useEffect(() => {
    const subscription = supabase
      .channel('supplier_enquiries_all')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enquiries'
      }, (payload) => {
        console.log('🔄 Real-time enquiry update:', payload)
        loadAllEnquiries()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [loadAllEnquiries])

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh of all enquiries')
    lastBusinessIdsRef.current = null
    setLastRefreshKey(prev => prev + 1)
    loadAllEnquiries()
  }, [loadAllEnquiries])

  // Helper functions for filtering enquiries (using actual database field names)
  const getEnquiriesByBusiness = useCallback((businessId) => {
    return enquiries.filter(enquiry => enquiry.supplier_id === businessId)
  }, [enquiries])

  const getEnquiriesByStatus = useCallback((status) => {
    return enquiries.filter(enquiry => 
      enquiry.status?.toLowerCase() === status.toLowerCase()
    )
  }, [enquiries])

  const getUrgentEnquiries = useCallback(() => {
    return enquiries.filter(enquiry =>
      enquiry.auto_accepted === true && ['paid', 'fully_paid', 'partial_paid'].includes(enquiry.payment_status)
    )
  }, [enquiries])

  const getPendingEnquiries = useCallback(() => {
    return enquiries.filter(enquiry => 
      !enquiry.status || 
      enquiry.status.toLowerCase() === 'pending' || 
      enquiry.status.toLowerCase() === 'waiting'
    )
  }, [enquiries])

  // Summary statistics using actual database fields
  const summary = useMemo(() => {
    const total = enquiries.length
    const urgent = getUrgentEnquiries().length
    const pending = getPendingEnquiries().length
    const replied = getEnquiriesByStatus('replied').length
    const accepted = getEnquiriesByStatus('accepted').length
    
    const byBusiness = businesses?.map(business => ({
      businessId: business.id,
      businessName: business.name,
      count: getEnquiriesByBusiness(business.id).length,
      urgent: getEnquiriesByBusiness(business.id).filter(e =>
        e.auto_accepted === true && ['paid', 'fully_paid', 'partial_paid'].includes(e.payment_status)
      ).length
    })) || []

    return {
      total,
      urgent,
      pending,
      replied,
      accepted,
      byBusiness
    }
  }, [enquiries, businesses, getEnquiriesByBusiness, getEnquiriesByStatus, getUrgentEnquiries, getPendingEnquiries])

  // Return same interface as existing useSupplierEnquiries hook
  return {
    // Core data (same as existing hook)
    enquiries,
    loading: loading || businessesLoading,
    error,
    
    // Actions (same as existing hook)
    refetch: loadAllEnquiries,
    refresh,
    
    // Additional dashboard-specific data
    summary,
    hasMultipleBusinesses: (businesses?.length || 0) > 1,
    businessCount: businesses?.length || 0,
    
    // Filter helpers for dashboard use
    getEnquiriesByBusiness,
    getEnquiriesByStatus,
    getUrgentEnquiries,
    getPendingEnquiries
  }
}

// Specialized hook for dashboard - handles business switching events
export function useDashboardEnquiries() {
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Listen for business switches to trigger refresh
  useEffect(() => {
    const handleBusinessSwitch = () => {
      console.log('🔄 Business switched, refreshing dashboard enquiries')
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('businessSwitched', handleBusinessSwitch)
    return () => window.removeEventListener('businessSwitched', handleBusinessSwitch)
  }, [])

  return useAllSupplierEnquiries(refreshKey)
}