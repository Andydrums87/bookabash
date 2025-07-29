// hooks/usePaymentStatus.js
import { useState, useEffect } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export function usePaymentStatus(partyId, isSignedIn) {
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Only fetch payment status if user is signed in and has a party ID
    if (!isSignedIn || !partyId) {
      setPaymentStatus(null)
      setPaymentDetails(null)
      setLoading(false)
      setError(null)
      return
    }

    const fetchPaymentStatus = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const partyResult = await partyDatabaseBackend.getCurrentParty()
        if (partyResult.success && partyResult.party) {
          const party = partyResult.party
          setPaymentStatus(party.payment_status)
          
          // Extract payment details if available
          setPaymentDetails({
            depositAmount: party.deposit_amount || 50,
            totalCost: party.estimated_cost || 0,
            remainingBalance: (party.estimated_cost || 0) - (party.deposit_amount || 50),
            paymentDate: party.payment_date,
            paymentIntentId: party.payment_intent_id
          })
        } else {
          setPaymentStatus(null)
          setPaymentDetails(null)
        }
      } catch (err) {
        console.error('Error fetching payment status:', err)
        setError(err.message)
        setPaymentStatus(null)
        setPaymentDetails(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStatus()
  }, [partyId, isSignedIn])

  // Helper functions
  const isPaymentConfirmed = paymentStatus === 'deposit_paid' || paymentStatus === 'completed'
  const isPaymentPending = paymentStatus === 'pending'
  const isPaymentFailed = paymentStatus === 'failed'

  return {
    paymentStatus,
    paymentDetails,
    loading,
    error,
    isPaymentConfirmed,
    isPaymentPending,
    isPaymentFailed,
    hasPaymentInfo: !!paymentStatus
  }
}