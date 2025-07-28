// Debug version of useRobustEnquiryData
// This version adds extensive logging to see what's happening with data processing

import { useMemo } from 'react'

export function useRobustEnquiryData(rawEnquiries = []) {
  return useMemo(() => {
    console.log('🔍 DEBUG: Processing enquiries data...', {
      rawCount: rawEnquiries.length,
      sample: rawEnquiries[0] ? JSON.stringify(rawEnquiries[0], null, 2) : 'No enquiries'
    })

    const leads = []
    const errors = []

    if (!rawEnquiries || rawEnquiries.length === 0) {
      console.log('⚠️ DEBUG: No enquiries to process')
      return {
        leads: [],
        errors: [],
        summary: { total: 0, valid: 0, invalid: 0 }
      }
    }

    rawEnquiries.forEach((enquiry, index) => {
      console.log(`📧 DEBUG: Processing enquiry ${index + 1}/${rawEnquiries.length}:`, {
        id: enquiry.id,
        supplier_id: enquiry.supplier_id,
        party_id: enquiry.party_id,
        status: enquiry.status,
        hasParties: !!enquiry.parties,
        partiesData: enquiry.parties ? {
          id: enquiry.parties.id,
          child_name: enquiry.parties.child_name,
          child_age: enquiry.parties.child_age,
          party_date: enquiry.parties.party_date,
          user_id: enquiry.parties.user_id,
          hasUsers: !!enquiry.parties.users
        } : null,
        usersData: enquiry.parties?.users ? {
          id: enquiry.parties.users.id,
          first_name: enquiry.parties.users.first_name,
          last_name: enquiry.parties.users.last_name,
          email: enquiry.parties.users.email
        } : null
      })

      try {
        // Extract party information
        const party = enquiry.parties
        if (!party) {
          console.log(`❌ DEBUG: Enquiry ${enquiry.id} - No party data`)
          errors.push({
            enquiry_id: enquiry.id,
            error: 'Missing party data',
            details: 'No parties object found in enquiry'
          })
          return // Skip this enquiry
        }

        // Extract user information
        const user = party.users
        if (!user) {
          console.log(`❌ DEBUG: Enquiry ${enquiry.id} - No user data in party`)
          errors.push({
            enquiry_id: enquiry.id,
            error: 'Missing user data',
            details: 'No users object found in party'
          })
          return // Skip this enquiry
        }

        // Format the lead data
        const leadName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Parent'
        const serviceName = party.theme ? `${party.theme} Party` : 'Children\'s Party'
        const partyDate = party.party_date ? formatDate(party.party_date) : 'Date TBD'
        const status = mapEnquiryStatus(enquiry.status)

        const processedLead = {
          id: enquiry.id,
          service: serviceName,
          lead: leadName,
          date: partyDate,
          status: status,
          processed: true,
          
          // Raw data for debugging
          rawEnquiry: enquiry,
          rawParty: party,
          rawUser: user
        }

        console.log(`✅ DEBUG: Successfully processed enquiry ${enquiry.id}:`, {
          service: serviceName,
          lead: leadName,
          date: partyDate,
          status: status
        })

        leads.push(processedLead)

      } catch (error) {
        console.error(`❌ DEBUG: Error processing enquiry ${enquiry.id}:`, error)
        errors.push({
          enquiry_id: enquiry.id,
          error: error.message,
          details: error.stack
        })
      }
    })

    const summary = {
      total: rawEnquiries.length,
      valid: leads.length,
      invalid: errors.length
    }

    console.log('📊 DEBUG: Processing complete:', {
      summary,
      leads: leads.length,
      errors: errors.length,
      sampleLead: leads[0] || null,
      sampleError: errors[0] || null
    })

    return {
      leads,
      errors,
      summary
    }
  }, [rawEnquiries])
}

// Helper function to format dates
function formatDate(dateString) {
  try {
    if (!dateString) return 'Date TBD'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    console.error('❌ DEBUG: Date formatting error:', error)
    return 'Date Error'
  }
}

// Helper function to map enquiry status
function mapEnquiryStatus(status) {
  const statusMap = {
    'pending': 'New',
    'viewed': 'Viewed',
    'accepted': 'Replied',
    'declined': 'Declined',
    'expired': 'Expired'
  }
  
  return statusMap[status] || status || 'Unknown'
}