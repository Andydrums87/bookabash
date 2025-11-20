// hooks/usePartyPhase.js - Updated to avoid separate loading
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export function usePartyPhase(partyData, partyId) {
  const [partyPhase, setPartyPhase] = useState('planning')
  const [currentPhase, setCurrentPhase] = useState('planning')
  const [visibleSuppliers, setVisibleSuppliers] = useState({})
  const [hasEnquiriesPending, setHasEnquiriesPending] = useState(false)
  const [enquiries, setEnquiries] = useState([])
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState(null)
  // REMOVED: separate loading state - parent handles all loading

  // Effect to determine the current phase
  useEffect(() => {
    const determinePhase = async () => {
      if (!partyId || !partyData) {
        setCurrentPhase('planning')
        setPartyPhase('planning')
        return
      }
      
      try {
        // Get enquiries for this party
        const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyId)
        if (enquiriesResult.success) {
          const fetchedEnquiries = enquiriesResult.enquiries || []
          setEnquiries(fetchedEnquiries)
       
          // Analyze enquiry statuses
          const pendingEnquiries = fetchedEnquiries.filter(e => e.status === 'pending')
          const acceptedEnquiries = fetchedEnquiries.filter(e => e.status === 'accepted')

          // Determine phase based on enquiry statuses
          const hasPending = pendingEnquiries.length > 0
          const hasAccepted = acceptedEnquiries.length > 0
          const hasPayment = partyData.payment_status === 'deposit_paid' || 
            partyData.payment_status === 'completed' || 
            partyData.payment_status === 'confirmed'

          setHasEnquiriesPending(hasPending)
          setIsPaymentConfirmed(hasPayment)

          if (hasPayment) {
            setCurrentPhase('payment_confirmed')
            setPartyPhase('payment_confirmed')
          } else if (hasPending) {
            setCurrentPhase('awaiting_responses')
            setPartyPhase('awaiting_responses')
          } else if (hasAccepted) {
            setCurrentPhase('confirmed')
            setPartyPhase('confirmed')
          } else {
            setCurrentPhase('planning')
            setPartyPhase('planning')
          }
        } else {
          setCurrentPhase('planning')
          setPartyPhase('planning')
        }

      } catch (error) {
        console.error('Error determining party phase:', error)
        setCurrentPhase('planning')
        setPartyPhase('planning')
      }
    }

    determinePhase()
  }, [partyId, partyData])

  // Effect to set visible suppliers from party_plan JSONB field
  useEffect(() => {
    if (!partyData) {
      return
    }

    // ✅ FIX: Filter out non-supplier fields (payment_status, estimated_cost, etc.)
    // These fields are added by usePartyData but aren't actual suppliers
    const nonSupplierFields = ['payment_status', 'estimated_cost', 'deposit_amount', 'addons', 'einvites', 'venueCarouselOptions']

    const filteredSuppliers = Object.keys(partyData)
      .filter(key => !nonSupplierFields.includes(key))
      .reduce((acc, key) => {
        acc[key] = partyData[key]
        return acc
      }, {})

    setVisibleSuppliers(filteredSuppliers)
  }, [partyData, currentPhase, enquiries])

  return {
    // Phase information
    partyPhase,
    currentPhase,
    
    // Supplier filtering
    visibleSuppliers,
    
    // Status flags
    hasEnquiriesPending,
    isPaymentConfirmed,
    
    // Data
    enquiries,
    paymentDetails,
    loading: false // Always false - parent handles loading
  }
}