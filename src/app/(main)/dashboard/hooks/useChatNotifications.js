// hooks/useChatNotifications.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useChatNotifications = ({ suppliers = {}, partyId, customerId }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [unreadByCategory, setUnreadByCategory] = useState({})
  const [loading, setLoading] = useState(false)

  // Get supplier categories that have been selected
  const supplierCategories = Object.keys(suppliers).filter(key => 
    suppliers[key] && key !== 'einvites'
  )

  // Fetch unread messages using the exact same logic as SupplierChatTabs
  const fetchUnreadMessages = async () => {
    if (!partyId || supplierCategories.length === 0) {
      setUnreadCount(0)
      setHasNewMessages(false)
      setUnreadByCategory({})
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from('supplier_responses')
        .select('*')
        
      if (partyId) {
        query = query.eq('party_id', partyId)
      }

      const { data: responses, error: responsesError } = await query
        .order('sent_at', { ascending: false })

      if (responsesError) {
        console.error('Error fetching messages:', responsesError)
        return
      }

      if (!responses || responses.length === 0) {
        setUnreadCount(0)
        setHasNewMessages(false)
        setUnreadByCategory({})
        return
      }

      const enquiryIds = [...new Set(responses.map(r => r.enquiry_id).filter(Boolean))]
      
      if (enquiryIds.length === 0) {
        setUnreadCount(0)
        setHasNewMessages(false)
        setUnreadByCategory({})
        return
      }

      const { data: enquiries, error: enquiriesError } = await supabase
        .from('enquiries')
        .select('id, supplier_category')
        .in('id', enquiryIds)

      if (enquiriesError) {
        console.error('Error fetching enquiries:', enquiriesError)
        return
      }

      const enquiriesMap = new Map((enquiries || []).map(e => [e.id, e]))
      const unreadMessages = responses.filter(response => !response.read_by_customer_at)
      
      const categoryUnreadCount = {}
      let totalUnread = 0

      unreadMessages.forEach(response => {
        const enquiry = enquiriesMap.get(response.enquiry_id)
        if (enquiry && enquiry.supplier_category) {
          const category = enquiry.supplier_category
          if (supplierCategories.includes(category)) {
            categoryUnreadCount[category] = (categoryUnreadCount[category] || 0) + 1
            totalUnread += 1
          }
        }
      })

      setUnreadCount(totalUnread)
      setHasNewMessages(totalUnread > 0)
      setUnreadByCategory(categoryUnreadCount)

    } catch (error) {
      console.error('Error in fetchUnreadMessages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!partyId) return

    try {
      const { error } = await supabase
        .from('supplier_responses')
        .update({ read_by_customer_at: new Date().toISOString() })
        .eq('party_id', partyId)
        .is('read_by_customer_at', null)

      if (error) {
        console.error('Error marking messages as read:', error)
      } else {
        fetchUnreadMessages()
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
    }
  }

  // Effects for fetching and real-time updates
  useEffect(() => {
    fetchUnreadMessages()
    
    const interval = setInterval(fetchUnreadMessages, 30000)
    return () => clearInterval(interval)
  }, [partyId, supplierCategories.length])

  useEffect(() => {
    if (!partyId) return

    const channel = supabase
      .channel(`supplier-responses-${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'supplier_responses',
          filter: `party_id=eq.${partyId}`
        },
        (payload) => {
          fetchUnreadMessages()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'supplier_responses',
          filter: `party_id=eq.${partyId}`
        },
        (payload) => {
          if (payload.new.read_by_customer_at !== payload.old.read_by_customer_at) {
            fetchUnreadMessages()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyId])

  return {
    unreadCount,
    hasNewMessages,
    unreadByCategory,
    loading,
    markMessagesAsRead,
    fetchUnreadMessages
  }
}

