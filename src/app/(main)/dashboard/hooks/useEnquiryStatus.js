// hooks/useEnquiryStatus.js
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export function useEnquiryStatus(partyId, isSignedIn) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return {
    enquiries,
    loading,
    error,
    getEnquiryStatus,
    hasEnquiries: enquiries.length > 0
  }
}