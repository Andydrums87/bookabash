// components/ChatNotificationHeader.jsx - Fixed to match working SupplierChatTabs
"use client"

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const ChatNotificationHeader = ({ 
  suppliers = {},
  partyId,
  customerId,
  onNavigateToChat,
  className = ""
}) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [unreadByCategory, setUnreadByCategory] = useState({})
  const [loading, setLoading] = useState(false)

  // Get supplier categories that have been selected (same as SupplierChatTabs)
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
      // Use exact same query structure as SupplierChatTabs
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

      // Get related enquiry data (same as SupplierChatTabs)
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

      // Create enquiry map for quick lookup
      const enquiriesMap = new Map((enquiries || []).map(e => [e.id, e]))

      // Filter for unread messages and count by category
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

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchUnreadMessages()
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000)
    
    return () => clearInterval(interval)
  }, [partyId, supplierCategories.length])

  // Set up real-time subscription for new messages (same as SupplierChatTabs)
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
          console.log('New supplier response received:', payload.new)
          fetchUnreadMessages() // Refresh unread count
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
          // Update when messages are marked as read
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

  // Mark messages as read when user navigates to chat
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
        // Refresh unread count
        fetchUnreadMessages()
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
    }
  }

  const handleClick = () => {
    if (onNavigateToChat) {
      onNavigateToChat()
    } else {
      // Navigate to party summary and scroll to chat section
      const currentPath = window.location.pathname
      if (currentPath.includes('party-summary')) {
        // Already on party summary, just scroll
        const chatSection = document.getElementById('supplier-messages')
        if (chatSection) {
          chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else {
        // Navigate to party summary with hash
        window.location.href = '/party-summary#supplier-messages'
      }
    }

    // Mark all messages as read when user clicks
    markMessagesAsRead()
  }

  // Get category display name for debugging (same as SupplierChatTabs)
  const getCategoryDisplayName = (category) => {
    const names = {
      entertainment: 'Entertainment',
      catering: 'Catering', 
      venue: 'Venue',
      photography: 'Photography',
      decorations: 'Decorations',
      activities: 'Activities',
      facePainting: 'Face Painting',
      partyBags: 'Party Bags',
      balloons: 'Balloons',
      cakes: 'Cakes'
    }
    return names[category] || category
  }

  // Don't render if no unread messages or still loading initial data
  if (!hasNewMessages || loading) {
    return null
  }

  return (
    <div className={`flex items-center ${className}`}>
      {/* Desktop Version */}
      <div className="hidden md:flex">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="relative flex items-center gap-2 h-9 px-3 bg-white hover:bg-gray-50 border-gray-200 shadow-sm transition-all hover:shadow-md"
        >
          <MessageCircle className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            {unreadCount === 1 ? '1 new message' : `${unreadCount} new messages`}
          </span>
          <Badge className="bg-red-500 text-white h-5 min-w-5 text-xs px-1.5 ml-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        </Button>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="relative h-9 w-9 p-0 bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
        >
          <MessageCircle className="w-4 h-4 text-primary-600" />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 min-w-5 text-xs px-1 border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        </Button>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && Object.keys(unreadByCategory).length > 0 && (
        <div className="hidden lg:block ml-2 text-xs text-gray-500">
          {Object.entries(unreadByCategory).map(([category, count]) => 
            `${getCategoryDisplayName(category)}: ${count}`
          ).join(', ')}
        </div>
      )}
    </div>
  )
}

export default ChatNotificationHeader