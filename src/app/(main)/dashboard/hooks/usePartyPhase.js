// hooks/usePartyPhase.js - DEBUG VERSION to find the issue
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
  const [loading, setLoading] = useState(false)

  // Effect to determine the current phase
  useEffect(() => {
    const determinePhase = async () => {
    
      
      if (!partyId || !partyData) {

        setCurrentPhase('planning')
        setPartyPhase('planning')
        return
      }

      setLoading(true)
      
      try {
        // Get enquiries for this party FIRST
        const enquiriesResult = await partyDatabaseBackend.getEnquiriesForParty(partyId)
        if (enquiriesResult.success) {
          const fetchedEnquiries = enquiriesResult.enquiries || []
          setEnquiries(fetchedEnquiries)
       
          // Analyze enquiry statuses
          const pendingEnquiries = fetchedEnquiries.filter(e => e.status === 'pending')
          const acceptedEnquiries = fetchedEnquiries.filter(e => e.status === 'accepted')
          const declinedEnquiries = fetchedEnquiries.filter(e => e.status === 'declined')

 
          // Determine phase based on enquiry statuses
          const hasPending = pendingEnquiries.length > 0
          const hasAccepted = acceptedEnquiries.length > 0
          const hasPayment = partyData.payment_status === 'deposit_paid' || 
          partyData.payment_status === 'completed' || 
          partyData.payment_status === 'confirmed'

          setHasEnquiriesPending(hasPending)
          setIsPaymentConfirmed(hasPayment)

          if (hasPayment) {
            console.log('✅ Phase: CONFIRMED (payment completed)')
            setCurrentPhase('payment_confirmed')
            setPartyPhase('payment_confirmed')
          } else if (hasPending) {
            console.log('⏳ Phase: AWAITING RESPONSES (has pending enquiries)')
            setCurrentPhase('awaiting_responses')
            setPartyPhase('awaiting_responses')
          } else if (hasAccepted) {
            console.log('🎉 Phase: READY FOR PAYMENT (has accepted, no pending)')
            // This might be a new phase we need to handle
            setCurrentPhase('confirmed') // or create a new 'ready_for_payment' phase
            setPartyPhase('confirmed')
          } else {
            console.log('📝 Phase: PLANNING (no enquiries or all declined)')
            setCurrentPhase('planning')
            setPartyPhase('planning')
          }
        } else {
          console.log('⚠️ Could not fetch enquiries, defaulting to planning')
          setCurrentPhase('planning')
          setPartyPhase('planning')
        }

      } catch (error) {
        console.error('❌ Error determining party phase:', error)
        setCurrentPhase('planning')
        setPartyPhase('planning')
      } finally {
        setLoading(false)
      }
    }

    determinePhase()
  }, [partyId, partyData])

  // Effect to filter visible suppliers based on phase
  useEffect(() => {
    if (!partyData) {
      console.log('🚫 No party data for supplier filtering')
      return
    }

    const allSuppliers = {
      venue: partyData.venue || null,
      entertainment: partyData.entertainment || null,
      catering: partyData.catering || null,
      facePainting: partyData.facePainting || null,
      activities: partyData.activities || null,
      partyBags: partyData.partyBags || null,
      decorations: partyData.decorations || null,
      balloons: partyData.balloons || null,
      cakes: partyData.cakes || null
    }

    // console.log('🏗️ All suppliers from partyData:', Object.fromEntries(
    //   Object.entries(allSuppliers).map(([key, supplier]) => [
    //     key, 
    //     supplier ? { name: supplier.name, id: supplier.id } : null
    //   ])
    // ))

    // console.log('🔍 Current enquiries for filtering:', enquiries.map(e => ({
    //   category: e.supplier_category,
    //   status: e.status,
    //   supplierName: e.supplier_name
    // })))

    // ✅ CRITICAL FIX: DON'T FILTER SUPPLIERS BASED ON PHASE IN THIS HOOK
    // Let the SupplierGrid handle the filtering based on what it needs to show
    // This hook should just return ALL suppliers and let components decide what to show


    setVisibleSuppliers(allSuppliers)

    // OLD FILTERING LOGIC (COMMENTED OUT FOR DEBUGGING):
    /*
    let filtered = {}

    switch (currentPhase) {
      case 'awaiting_responses':
        console.log('👀 Filtering for awaiting responses phase')
        filtered = Object.fromEntries(
          Object.entries(allSuppliers).filter(([type, supplier]) => {
            const hasEnquiry = enquiries.some(e => 
              e.supplier_category === type && e.status === 'pending'
            )
            console.log(`  ${type}: supplier=${!!supplier}, hasEnquiry=${hasEnquiry}`)
            return supplier && hasEnquiry
          })
        )
        break

      case 'confirmed':
        console.log('👀 Filtering for confirmed phase')
        filtered = Object.fromEntries(
          Object.entries(allSuppliers).filter(([type, supplier]) => {
            console.log(`  ${type}: supplier=${!!supplier}`)
            return supplier !== null
          })
        )
        break

      case 'planning':
      default:
        console.log('👀 Showing all suppliers for planning phase')
        filtered = allSuppliers
        break
    }

    console.log('🎯 Filtered suppliers for phase', currentPhase, ':', Object.keys(filtered))
    setVisibleSuppliers(filtered)
    */
  }, [partyData, currentPhase, enquiries])



  return {
    // Phase information
    partyPhase,
    currentPhase,
    
    // Supplier filtering - NOW RETURNS ALL SUPPLIERS
    visibleSuppliers,
    
    // Status flags
    hasEnquiriesPending,
    isPaymentConfirmed,
    
    // Data
    enquiries,
    paymentDetails,
    loading
  }
}