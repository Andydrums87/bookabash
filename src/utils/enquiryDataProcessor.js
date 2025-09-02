import { useMemo } from "react"

// In enquiryDataProcessor.js - COMPLETE FIXED VERSION
export function useRobustEnquiryData(rawEnquiries = []) {
  return useMemo(() => {
  
    const leads = []
    const errors = []

    if (!rawEnquiries || rawEnquiries.length === 0) {

      return {
        leads: [],
        errors: [],
        summary: { total: 0, valid: 0, invalid: 0 }
      }
    }

    rawEnquiries.forEach((enquiry, index) => {
      try {
        // Extract party information
        const party = enquiry.parties
        if (!party) {
       
          errors.push({
            enquiry_id: enquiry.id,
            error: 'Missing party data',
            details: 'No parties object found in enquiry'
          })
          return
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
          return
        }

        // Format the lead data
        const leadName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Parent'
        const serviceName = party.theme ? `${party.theme} Party` : 'Children\'s Party'
        const partyDate = party.party_date ? formatDate(party.party_date) : 'Date TBD'
        const status = mapEnquiryStatus(enquiry)

        const processedLead = {
          id: enquiry.id,
          service: serviceName,
          lead: leadName,
          date: partyDate,
          status: status,
          processed: true,
          
          // ✅ CRITICAL FIX: Include the missing fields
          auto_accepted: enquiry.auto_accepted,
          payment_status: enquiry.payment_status,
          
          // ✅ OTHER USEFUL FIELDS:
          package_id: enquiry.package_id,
          addon_details: enquiry.addon_details,
          quoted_price: enquiry.quoted_price,
          supplier_category: enquiry.supplier_category,
          
          // Raw data for debugging
          rawEnquiry: enquiry,
          rawParty: party,
          rawUser: user
        }

        console.log(`✅ DEBUG: Successfully processed enquiry ${enquiry.id}:`, {
          service: serviceName,
          lead: leadName,
          auto_accepted: enquiry.auto_accepted,
          payment_status: enquiry.payment_status,
          isUrgent: enquiry.auto_accepted && enquiry.status === 'accepted'
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
      urgentCount: leads.filter(l => l.auto_accepted && l.status === 'Replied').length
    })

    return {
      leads,
      errors,
      summary
    }
  }, [rawEnquiries])
}

// Helper functions remain the same
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

function mapEnquiryStatus(enquiry) {
  // ✅ Handle urgent deposit-paid enquiries first
  if (enquiry.auto_accepted && enquiry.status === 'accepted' && enquiry.payment_status === 'paid') {
    return 'URGENT'
  }
  
  // ✅ Handle auto-accepted but unpaid
  if (enquiry.auto_accepted && enquiry.status === 'accepted' && enquiry.payment_status === 'unpaid') {
    return 'DEPOSIT DUE'
  }
  
  // Regular status mapping
  const statusMap = {
    'pending': 'New',
    'viewed': 'Viewed', 
    'accepted': 'Replied',
    'declined': 'Declined',
    'expired': 'Expired'
  }
  
  return statusMap[enquiry.status] || enquiry.status || 'Unknown'
}