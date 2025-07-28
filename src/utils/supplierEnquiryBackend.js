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

      // Step 1: Get enquiries
      let enquiriesQuery = supabase
        .from('enquiries')
        .select('*')
        .in('supplier_id', supplierIds)
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
  async respondToEnquiry(enquiryId, response, finalPrice = null, responseMessage = '') {
    try {
      const updateData = {
        status: response, // 'accepted' or 'declined'
        supplier_response: responseMessage,
        supplier_response_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (finalPrice !== null) {
        updateData.final_price = finalPrice
      }

      const { data: updatedEnquiry, error } = await supabase
        .from('enquiries')
        .update(updateData)
        .eq('id', enquiryId)
        .select()
        .single()

      if (error) throw error

      console.log(`✅ Enquiry ${response}:`, enquiryId)
      return { success: true, enquiry: updatedEnquiry }

    } catch (error) {
      console.error('❌ Error responding to enquiry:', error)
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