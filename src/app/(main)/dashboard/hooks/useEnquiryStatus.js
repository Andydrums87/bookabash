// hooks/useEnquiryStatus.js
import { useState, useEffect, useCallback } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export function useEnquiryStatus(partyId, isSignedIn) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshEnquiries = useCallback(async () => {
    if (!partyId) return
    
    console.log('🔄 Manually refreshing enquiries...')
    try {
      const result = await partyDatabaseBackend.getEnquiriesForParty(partyId)
      if (result.success) {
        setEnquiries(result.enquiries)
        console.log('✅ Enquiries refreshed:', result.enquiries.length)
      }
    } catch (error) {
      console.error('❌ Error refreshing enquiries:', error)
    }
  }, [partyId])

  useEffect(() => {
    // Only fetch enquiries if user is signed in and has a party ID
    if (!isSignedIn || !partyId) {
      setEnquiries([])
      setLoading(false)
      setError(null)
      return
    }

    const fetchEnquiries = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await partyDatabaseBackend.getEnquiriesForParty(partyId)
        if (result.success) {
          setEnquiries(result.enquiries)
        } else {
          setError(result.error)
          setEnquiries([])
        }
      } catch (err) {
        setError(err.message)
        setEnquiries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEnquiries()
  }, [partyId, isSignedIn])

  // Helper function to get enquiry status for a specific supplier category
  const getEnquiryStatus = (supplierCategory) => {
    if (!isSignedIn) return null
    const enquiry = enquiries.find(e => e.supplier_category === supplierCategory)
    return enquiry?.status || null
  }
  const getEnquiryTimestamp = (supplierType) => {
    const enquiry = enquiries.find(e => e.supplier_category === supplierType) // 👈 Use supplier_category, not supplier_type
    return enquiry?.created_at || null // 👈 Use created_at field
  }


  return {
    enquiries,
    loading,
    error,
    getEnquiryStatus,
    getEnquiryTimestamp,
    refreshEnquiries,
    hasEnquiries: enquiries.length > 0
  }
}