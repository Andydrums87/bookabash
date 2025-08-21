// components/supplier/hooks/useSupplierEnquiries.js
"use client"

import { useState, useCallback, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export const useSupplierEnquiries = (initialPartyId = null) => {
  // Enquiry state
  const [enquiryStatus, setEnquiryStatus] = useState({
    isAwaiting: false,
    pendingCount: 0,
    enquiries: [],
    loading: false
  })
  
  const [currentPartyId, setCurrentPartyId] = useState(initialPartyId)

  // Get current party ID if not provided
  useEffect(() => {
    const getPartyId = async () => {
      if (!currentPartyId) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const partyIdResult = await partyDatabaseBackend.getCurrentPartyId()
            if (partyIdResult.success) {
              console.log('🎯 Enquiries hook got party ID:', partyIdResult.partyId)
              setCurrentPartyId(partyIdResult.partyId)
            }
          }
        } catch (error) {
          console.error('❌ Error getting party ID in enquiries hook:', error)
        }
      }
    }
    getPartyId()
  }, [currentPartyId])

  // Check enquiry status for current party
  const checkEnquiryStatus = useCallback(async () => {
    console.log('🔍 Checking enquiry status for party:', currentPartyId)

    try {
      setEnquiryStatus(prev => ({ ...prev, loading: true }))

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.log('❌ No authenticated user')
        setEnquiryStatus({
          isAwaiting: false,
          pendingCount: 0,
          enquiries: [],
          loading: false
        })
        return { canModifyPlan: true, reason: 'no_auth' }
      }

      if (!currentPartyId) {
        console.log('❌ No current party ID')
        setEnquiryStatus({
          isAwaiting: false,
          pendingCount: 0,
          enquiries: [],
          loading: false
        })
        return { canModifyPlan: true, reason: 'no_party_id' }
      }

      console.log('🔍 Checking if party is awaiting responses for party:', currentPartyId)

      // Check if party is awaiting responses
      const awaitingResult = await partyDatabaseBackend.isPartyAwaitingResponses(currentPartyId)

      if (awaitingResult.success) {
        console.log('✅ Enquiry status check successful:', {
          isAwaiting: awaitingResult.isAwaiting,
          pendingCount: awaitingResult.pendingCount,
          enquiriesCount: awaitingResult.enquiries?.length || 0
        })

        setEnquiryStatus({
          isAwaiting: awaitingResult.isAwaiting,
          pendingCount: awaitingResult.pendingCount || 0,
          enquiries: awaitingResult.enquiries || [],
          loading: false
        })

        return {
          canModifyPlan: !awaitingResult.isAwaiting,
          reason: awaitingResult.isAwaiting ? 'awaiting_responses' : 'can_modify',
          pendingCount: awaitingResult.pendingCount || 0
        }
      } else {
        console.error('❌ Error checking enquiry status:', awaitingResult.error)
        setEnquiryStatus({
          isAwaiting: false,
          pendingCount: 0,
          enquiries: [],
          loading: false
        })
        return { canModifyPlan: true, reason: 'error_default_allow' }
      }

    } catch (error) {
      console.error('❌ Exception checking enquiry status:', error)
      setEnquiryStatus({
        isAwaiting: false,
        pendingCount: 0,
        enquiries: [],
        loading: false
      })
      return { canModifyPlan: true, reason: 'exception_default_allow' }
    }
  }, [currentPartyId])

  // Auto-check enquiry status when party ID is available
  useEffect(() => {
    if (currentPartyId) {
      console.log('🔄 Auto-checking enquiry status for party:', currentPartyId)
      checkEnquiryStatus()
    }
  }, [currentPartyId, checkEnquiryStatus])

  // Helper functions
  const hasEnquiriesPending = useCallback(() => {
    return enquiryStatus.isAwaiting
  }, [enquiryStatus.isAwaiting])

  const getPendingEnquiriesCount = useCallback(() => {
    return enquiryStatus.pendingCount
  }, [enquiryStatus.pendingCount])

  const getPendingEnquiries = useCallback(() => {
    return enquiryStatus.enquiries
  }, [enquiryStatus.enquiries])

  // Check if user can modify plan (not awaiting responses)
  const canModifyPlan = useCallback(() => {
    return !enquiryStatus.isAwaiting
  }, [enquiryStatus.isAwaiting])

  // Get enquiry status summary
  const getEnquiryStatusSummary = useCallback(() => {
    if (enquiryStatus.loading) {
      return {
        status: 'loading',
        message: 'Checking enquiry status...',
        canAdd: false
      }
    }

    if (enquiryStatus.isAwaiting) {
      return {
        status: 'awaiting',
        message: `Awaiting ${enquiryStatus.pendingCount} supplier response${enquiryStatus.pendingCount > 1 ? 's' : ''}`,
        canAdd: false,
        pendingCount: enquiryStatus.pendingCount
      }
    }

    return {
      status: 'ready',
      message: 'Ready to add suppliers',
      canAdd: true
    }
  }, [enquiryStatus])

  // Refresh enquiry status manually
  const refreshEnquiryStatus = useCallback(async () => {
    console.log('🔄 Manually refreshing enquiry status')
    return await checkEnquiryStatus()
  }, [checkEnquiryStatus])

  // Send individual enquiry (helper function)
  const sendIndividualEnquiry = useCallback(async (supplier, packageData, customMessage = '') => {
    if (!currentPartyId) {
      console.error('❌ Cannot send enquiry: No party ID')
      return { success: false, error: 'No party ID available' }
    }

    try {
      console.log('📧 Sending individual enquiry:', {
        partyId: currentPartyId,
        supplierName: supplier?.name,
        packageName: packageData?.name
      })

      const result = await partyDatabaseBackend.sendIndividualEnquiry(
        currentPartyId,
        supplier,
        packageData,
        customMessage
      )

      if (result.success) {
        console.log('✅ Enquiry sent successfully')
        // Refresh enquiry status after sending
        await checkEnquiryStatus()
      }

      return result
    } catch (error) {
      console.error('❌ Error sending individual enquiry:', error)
      return { success: false, error: error.message }
    }
  }, [currentPartyId, checkEnquiryStatus])

  // Check if specific supplier has pending enquiry
  const hasSupplierEnquiry = useCallback((supplierId) => {
    return enquiryStatus.enquiries.some(enquiry => 
      enquiry.supplier_id === supplierId || enquiry.supplier?.id === supplierId
    )
  }, [enquiryStatus.enquiries])

  // Get enquiry details for specific supplier
  const getSupplierEnquiry = useCallback((supplierId) => {
    return enquiryStatus.enquiries.find(enquiry => 
      enquiry.supplier_id === supplierId || enquiry.supplier?.id === supplierId
    )
  }, [enquiryStatus.enquiries])

  // Get all enquiries grouped by status
  const getEnquiriesByStatus = useCallback(() => {
    const grouped = {
      pending: [],
      accepted: [],
      declined: [],
      expired: []
    }

    enquiryStatus.enquiries.forEach(enquiry => {
      const status = enquiry.status || 'pending'
      if (grouped[status]) {
        grouped[status].push(enquiry)
      }
    })

    return grouped
  }, [enquiryStatus.enquiries])

  return {
    // Main state
    enquiryStatus,
    currentPartyId,
    
    // Helper functions
    hasEnquiriesPending,
    getPendingEnquiriesCount,
    getPendingEnquiries,
    canModifyPlan,
    getEnquiryStatusSummary,
    
    // Enquiry management
    checkEnquiryStatus,
    refreshEnquiryStatus,
    sendIndividualEnquiry,
    
    // Supplier-specific enquiry functions
    hasSupplierEnquiry,
    getSupplierEnquiry,
    getEnquiriesByStatus,
    
    // Loading state
    isLoading: enquiryStatus.loading
  }
}