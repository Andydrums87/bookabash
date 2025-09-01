import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export const useSupplierMessages = (customerId, partyId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadMessages = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('supplier_responses')
        .select(`
          id,
          enquiry_id,
          party_id,
          supplier_id,
          customer_id,
          response_type,
          response_message,
          final_price,
          sent_at,
          read_by_customer_at,
          suppliers:supplier_id (
            id,
            business_name,
            email,
            phone,
            data
          ),
          enquiries:enquiry_id (
            id,
            quoted_price,
            package_id,
            status,
            supplier_category
          )
        `)
        .eq('customer_id', customerId)

      if (partyId) {
        query = query.eq('party_id', partyId)
      }

      const { data: responses, error } = await query
        .order('sent_at', { ascending: false })

      if (error) throw error

      setMessages(responses || [])
      setUnreadCount(responses?.filter(msg => !msg.read_by_customer_at).length || 0)

    } catch (err) {
      console.error('Error loading supplier messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerId) {
      loadMessages()
    }
  }, [customerId, partyId])

  return {
    messages,
    loading,
    unreadCount,
    refetch: loadMessages
  }
}