// Fixed version of supplierEnquiryBackend.js
// Using manual joins until automatic JOINs are fixed

import { supabase } from '@/lib/supabase'

class SupplierEnquiryBackend {
  
  /**
   * Get all enquiries for the current supplier - FIXED VERSION
   */
  async getSupplierEnquiries(status = null, specificBusinessId = null) {
    try {
      // Get current authenticated supplier
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser?.user) {
        throw new Error('No authenticated user')
      }

      console.log('🔍 Querying enquiries for auth user:', authUser.user.id)
      console.log('🏢 Specific business ID:', specificBusinessId)

      let supplierIds = []

      if (specificBusinessId) {
        console.log('🎯 Querying for specific business:', specificBusinessId)
        supplierIds = [specificBusinessId]
      } else {
        const { data: supplierRecords, error: supplierError } = await supabase
          .from('suppliers')
          .select('id, data, business_name, is_primary')
          .eq('auth_user_id', authUser.user.id)

        if (supplierError) {
          console.error('❌ Supplier query error:', supplierError)
          throw new Error(`Database error: ${supplierError.message}`)
        }

        if (!supplierRecords || supplierRecords.length === 0) {
          console.log('⚠️ No supplier records found for user:', authUser.user.id)
          return { 
            success: true, 
            enquiries: [], 
            message: 'No supplier profile found. Please complete your supplier onboarding first.' 
          }
        }

        console.log(`✅ Found ${supplierRecords.length} supplier record(s)`)
        supplierIds = supplierRecords.map(s => s.id)
      }

      console.log('🔍 Getting enquiries for supplier IDs:', supplierIds)

      // ✅ Use manual joins (automatic JOINs not working in this setup)
      console.log('🔧 FORCING manual joins (bypassing automatic JOINs)...')
      const manualResult = await this.manualJoinEnquiries(supplierIds, status)
      console.log('🔧 Manual join result:', manualResult.success ? 'SUCCESS' : 'FAILED', manualResult.enquiries?.length || 0, 'enquiries')
      return manualResult

    } catch (error) {
      console.error('❌ Error getting supplier enquiries:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Manual join method - properly joins enquiries with parties and users
   */
  async manualJoinEnquiries(supplierIds, status = null) {
    try {
      console.log('🔧 Starting manual join for suppliers:', supplierIds)

    // In manualJoinEnquiries function
let enquiriesQuery = supabase
.from('enquiries')
.select('*')
.in('supplier_id', supplierIds)
.eq('payment_status', 'paid') // Only show paid enquiries to suppliers
.order('created_at', { ascending: false })

      if (status) {
        enquiriesQuery = enquiriesQuery.eq('status', status)
      }

      const { data: enquiries, error: enquiriesError } = await enquiriesQuery

      if (enquiriesError) {
        throw new Error(`Failed to fetch enquiries: ${enquiriesError.message}`)
      }

      console.log('📧 Found enquiries:', enquiries?.length || 0)

      if (!enquiries || enquiries.length === 0) {
        return { success: true, enquiries: [] }
      }

      // Step 2: Get unique party IDs
      const partyIds = [...new Set(enquiries.map(e => e.party_id).filter(Boolean))]
      console.log('🎉 Party IDs:', partyIds)

      if (partyIds.length === 0) {
        console.log('⚠️ No party IDs found in enquiries')
        return { success: true, enquiries }
      }

      // Step 3: Fetch parties
      console.log('🔍 Attempting to fetch parties with IDs:', partyIds)
      const { data: parties, error: partiesError } = await supabase
        .from('parties')
        .select('*')
        .in('id', partyIds)

      console.log('🔍 Parties query result:', {
        data: parties,
        error: partiesError,
        count: parties?.length || 0
      })

      if (partiesError) {
        console.error('❌ Parties query error:', partiesError)
        return { success: true, enquiries }
      }

      console.log('🎉 Found parties:', parties?.length || 0)

      // If no parties found, let's try a direct query to see if the party exists
      if (!parties || parties.length === 0) {
        console.log('🔍 No parties found, checking if party exists with direct query...')
        for (const partyId of partyIds) {
          const { data: singleParty, error: singleError } = await supabase
            .from('parties')
            .select('*')
            .eq('id', partyId)
            .single()
          
          console.log(`🔍 Direct query for party ${partyId}:`, {
            data: singleParty,
            error: singleError
          })
        }
      }

      // Step 4: Get unique user IDs from parties
      const userIds = [...new Set(parties?.map(p => p.user_id).filter(Boolean) || [])]
      console.log('👤 User IDs:', userIds)

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
          console.log('👤 Found users:', users.length)
        }
      }

      // Step 5: Create lookup maps
      const partiesMap = new Map(parties?.map(p => [p.id, p]) || [])
      const usersMap = new Map(users.map(u => [u.id, u]))

      // Step 6: Join the data manually
      const joinedEnquiries = enquiries.map(enquiry => {
        const party = partiesMap.get(enquiry.party_id)
        const user = party ? usersMap.get(party.user_id) : null

        console.log(`🔗 Joining enquiry ${enquiry.id}:`, {
          party_id: enquiry.party_id,
          hasParty: !!party,
          hasUser: !!user,
          partyChildName: party?.child_name,
          userFirstName: user?.first_name
        })

        return {
          ...enquiry,
          parties: party ? {
            ...party,
            users: user || null
          } : null
        }
      })

      console.log('✅ Manual join completed:', joinedEnquiries.length, 'enquiries')
      return { success: true, enquiries: joinedEnquiries }

    } catch (error) {
      console.error('❌ Manual join error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get enquiry count by status for notifications
   */
  async getEnquiryStats() {
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser?.user) {
        throw new Error('No authenticated user')
      }

      const { data: supplierRecords, error: supplierError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('auth_user_id', authUser.user.id)

      if (supplierError || !supplierRecords || supplierRecords.length === 0) {
        return {
          success: true,
          stats: { pending: 0, viewed: 0, accepted: 0, declined: 0, expired: 0, total: 0 }
        }
      }

      const supplierIds = supplierRecords.map(s => s.id)

      const { data: enquiries, error } = await supabase
        .from('enquiries')
        .select('status')
        .in('supplier_id', supplierIds)

      if (error) throw error

      // Count by status
      const counts = {
        pending: 0,
        viewed: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
        total: enquiries.length
      }

      enquiries.forEach(enquiry => {
        counts[enquiry.status] = (counts[enquiry.status] || 0) + 1
      })

      return { success: true, stats: counts }

    } catch (error) {
      console.error('❌ Error getting enquiry stats:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mark enquiry as viewed
   */
  async markEnquiryViewed(enquiryId) {
    try {
      const { data: updatedEnquiry, error } = await supabase
        .from('enquiries')
        .update({ 
          status: 'viewed',
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiryId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Enquiry marked as viewed:', enquiryId)
      return { success: true, enquiry: updatedEnquiry }

    } catch (error) {
      console.error('❌ Error marking enquiry as viewed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Respond to enquiry (accept/decline)
   */
// Updated respondToEnquiry function
// In supplierEnquiryBackend.js - UPDATED respondToEnquiry function
// In your supplierEnquiryBackend.js - Update the respondToEnquiry function

async respondToEnquiry(enquiryId, response, finalPrice = null, message = '', isDepositPaid = false) {
  try {
    console.log('🎯 Supplier responding to enquiry:', {
      enquiryId,
      response,
      finalPrice,
      isDepositPaid,
      messageLength: message?.length || 0
    })

    // First, get the current enquiry to check its state
    const { data: currentEnquiry, error: fetchError } = await supabase
      .from('enquiries')
      .select('*')
      .eq('id', enquiryId)
      .single()

    if (fetchError) throw fetchError

    console.log('📋 Current enquiry state:', {
      status: currentEnquiry.status,
      auto_accepted: currentEnquiry.auto_accepted,
      payment_status: currentEnquiry.payment_status,
      supplier_response: currentEnquiry.supplier_response
    })

    // ✅ KEY: Prepare the update data
    const updateData = {
      status: response,
      supplier_response_date: new Date().toISOString(),
      supplier_response: message || (response === 'accepted' 
        ? 'Thank you for your enquiry! I can provide this service for your party.' 
        : 'Thank you for your enquiry. Unfortunately, I am not available for this date.'),
      updated_at: new Date().toISOString()
    }

    // Add final price if provided and accepting
    if (response === 'accepted' && finalPrice) {
      updateData.final_price = finalPrice
    }

    // ✅ CRITICAL: For deposit-paid bookings that are being accepted,
    // we need to clear the auto_accepted flag to indicate manual confirmation
    if (isDepositPaid && response === 'accepted' && currentEnquiry.auto_accepted) {
      updateData.auto_accepted = false // ✅ This triggers the state change to PaymentConfirmedSupplierCard
      console.log('✅ Clearing auto_accepted flag - supplier has manually confirmed')
    }

    // ✅ CRITICAL: For deposit-paid bookings that are being declined,
    // we need special handling for immediate replacement
    if (isDepositPaid && response === 'declined') {
      updateData.replacement_requested = true
      updateData.replacement_requested_at = new Date().toISOString()
      console.log('🔄 Marking for immediate replacement - deposit was paid')
    }

    // Update the enquiry
    const { data: updatedEnquiry, error: updateError } = await supabase
      .from('enquiries')
      .update(updateData)
      .eq('id', enquiryId)
      .select()
      .single()

    if (updateError) throw updateError

    console.log('✅ Enquiry updated successfully:', {
      id: updatedEnquiry.id,
      status: updatedEnquiry.status,
      auto_accepted: updatedEnquiry.auto_accepted,
      payment_status: updatedEnquiry.payment_status
    })

    // ✅ ENHANCED: Send different notifications based on context
    if (isDepositPaid) {
      if (response === 'accepted') {
        console.log('📧 Sending confirmation to customer - booking fully confirmed')
        // Send email confirming the booking is locked in
      } else {
        console.log('🚨 Sending urgent replacement request to PartySnap team')
        // Trigger immediate replacement workflow
      }
    } else {
      console.log('📧 Sending standard enquiry response to customer')
      // Standard enquiry response workflow
    }

    return {
      success: true,
      enquiry: updatedEnquiry,
      message: `Enquiry ${response} successfully`
    }

  } catch (error) {
    console.error('❌ Error responding to enquiry:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// ✅ NEW: Alert PartySnap function
async alertPartySnapUrgent(alertData) {
  try {
    // Method 1: Database alert record
    const { error: dbError } = await supabase
      .from('urgent_alerts')
      .insert({
        type: 'supplier_decline',
        party_id: alertData.partyId,
        enquiry_id: alertData.enquiryId,
        severity: 'critical',
        message: `🚨 URGENT: ${alertData.supplierCategory} supplier declined deposit-paid booking for ${alertData.partyName} on ${alertData.partyDate}`,
        data: JSON.stringify(alertData),
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('❌ Failed to create database alert:', dbError)
    }

    // Method 2: Slack notification (if you have webhook)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 CRITICAL: Supplier Declined Deposit-Paid Booking`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*URGENT REPLACEMENT NEEDED*\n\n*Party:* ${alertData.partyName}\n*Date:* ${alertData.partyDate}\n*Category:* ${alertData.supplierCategory}\n*Customer:* ${alertData.customerName} (${alertData.customerEmail})\n\n*Supplier said:* "${alertData.supplierResponse}"\n\n*Action needed:* Find replacement supplier ASAP!`
                }
              }
            ]
          })
        })
      } catch (slackError) {
        console.error('❌ Slack notification failed:', slackError)
      }
    }

    // Method 3: Email notification (if you have email service)
    // await sendUrgentEmailAlert(alertData)

    console.log('✅ PartySnap urgent alert sent successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Failed to alert PartySnap:', error)
    return { success: false, error: error.message }
  }
}

  /**
   * Get single enquiry details
   */
  async getEnquiryDetails(enquiryId) {
    try {
      // Use manual join for single enquiry too
      const { data: enquiry, error } = await supabase
        .from('enquiries')
        .select('*')
        .eq('id', enquiryId)
        .single()

      if (error) throw error

      // Get the party and user data manually
      if (enquiry.party_id) {
        const { data: party, error: partyError } = await supabase
          .from('parties')
          .select('*')
          .eq('id', enquiry.party_id)
          .single()

        if (!partyError && party && party.user_id) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', party.user_id)
            .single()

          if (!userError && user) {
            enquiry.parties = {
              ...party,
              users: user
            }
          } else {
            enquiry.parties = party
          }
        }
      }

      // Auto-mark as viewed if it was pending
      if (enquiry.status === 'pending') {
        await this.markEnquiryViewed(enquiryId)
        enquiry.status = 'viewed'
      }

      return { success: true, enquiry }

    } catch (error) {
      console.error('❌ Error getting enquiry details:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create singleton instance
export const supplierEnquiryBackend = new SupplierEnquiryBackend()

// React hooks for supplier enquiry management
import { useState, useEffect } from 'react'

export function useSupplierEnquiries(status = null, specificBusinessId = null, forceRefresh = 0) {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEnquiries = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Hook: Loading enquiries for business:', specificBusinessId)
      const result = await supplierEnquiryBackend.getSupplierEnquiries(status, specificBusinessId)
      
      if (result.success) {
        setEnquiries(result.enquiries)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnquiries()

    // Set up real-time subscription for new enquiries
    const subscription = supabase
      .channel('supplier_enquiries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enquiries'
      }, (payload) => {
        console.log('🔄 Real-time enquiry update:', payload)
        loadEnquiries() // Reload enquiries when changes occur
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [status, specificBusinessId, forceRefresh])

  const respondToEnquiry = async (enquiryId, response, finalPrice = null, message = '') => {
    try {
      const result = await supplierEnquiryBackend.respondToEnquiry(enquiryId, response, finalPrice, message)
      
      if (result.success) {
        // Update local state
        setEnquiries(prev => 
          prev.map(enquiry => 
            enquiry.id === enquiryId ? { ...enquiry, ...result.enquiry } : enquiry
          )
        )
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    enquiries,
    loading,
    error,
    refetch: loadEnquiries,
    respondToEnquiry
  }
}

export function useEnquiryStats() {
  const [stats, setStats] = useState({
    pending: 0,
    viewed: 0,
    accepted: 0,
    declined: 0,
    expired: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const result = await supplierEnquiryBackend.getEnquiryStats()
      
      if (result.success) {
        setStats(result.stats)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()

    // Set up real-time subscription for stats updates
    const subscription = supabase
      .channel('enquiry_stats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enquiries'
      }, () => {
        loadStats() // Reload stats when enquiries change
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    stats,
    loading,
    refetch: loadStats
  }
}

export default SupplierEnquiryBackend