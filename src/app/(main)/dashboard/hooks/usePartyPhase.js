// hooks/usePartyPhase.js - Determines party phase and visible suppliers
import { useMemo } from 'react'
import { useEnquiryStatus } from "../hooks/useEnquiryStatus"
import { usePaymentStatus } from '../hooks/usePaymentStatus'

export function usePartyPhase(partyData, partyId) {
  // Get enquiry and payment status
  const { enquiries, getEnquiryStatus, getEnquiryTimestamp } = useEnquiryStatus(partyId, true)
  const { paymentStatus, paymentDetails, isPaymentConfirmed } = usePaymentStatus(partyId, true)

  // Create suppliers object
  const suppliers = useMemo(() => ({
    venue: partyData.venue || null,
    entertainment: partyData.entertainment || null,
    catering: partyData.catering || null,
    facePainting: partyData.facePainting || null,
    activities: partyData.activities || null,
    partyBags: partyData.partyBags || null,
    decorations: partyData.decorations || null,
    balloons: partyData.balloons || null,
  }), [partyData])

  // Calculate party phase
  const partyPhase = useMemo(() => {
    if (isPaymentConfirmed) return 'payment_confirmed'
    
    const enquiriesSent = enquiries.length > 0
    if (!enquiriesSent) return 'planning'
    
    const allSupplierTypesWithEnquiries = Object.keys(suppliers).filter(key => suppliers[key])
    const allConfirmed = allSupplierTypesWithEnquiries.every(type => getEnquiryStatus(type) === 'accepted')
    
    if (allConfirmed) return 'ready_for_payment'
    
    return 'awaiting_responses'
  }, [enquiries, suppliers, getEnquiryStatus, isPaymentConfirmed])

  // Calculate enquiry states
  const enquiriesSent = enquiries.length > 0
  const allSupplierTypesWithEnquiries = Object.keys(suppliers).filter(key => suppliers[key])
  const allConfirmed = enquiriesSent && allSupplierTypesWithEnquiries.every(type => 
    getEnquiryStatus(type) === 'accepted'
  )
  const hasEnquiriesPending = enquiries.length > 0 && !allConfirmed && !isPaymentConfirmed
  const suppliersWithEnquiries = Object.keys(suppliers).filter(key => 
    suppliers[key] && getEnquiryStatus(key) === 'pending'
  )

  // Get visible suppliers based on phase
  const visibleSuppliers = useMemo(() => {
    if (hasEnquiriesPending) {
      // Only show suppliers with enquiries sent
      return Object.fromEntries(
        Object.entries(suppliers).filter(([type, supplier]) => 
          supplier && (getEnquiryStatus(type) !== null)
        )
      )
    }
    
    // Show all suppliers
    return suppliers
  }, [suppliers, hasEnquiriesPending, getEnquiryStatus])

  return {
    // Phase info
    partyPhase,
    hasEnquiriesPending,
    enquiriesSent,
    allConfirmed,
    suppliersWithEnquiries,
    
    // Data
    suppliers,
    visibleSuppliers,
    enquiries,
    isPaymentConfirmed,
    paymentDetails,
    paymentStatus,
    
    // Functions
    getEnquiryStatus,
    getEnquiryTimestamp
  }
}