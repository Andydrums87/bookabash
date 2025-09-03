import React from 'react'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const ChatNotificationIcon = ({ 
  unreadCount = 0, 
  hasNewMessages = false, 
  onClick,
  className = "",
  showBadge = true,
  iconColor = "text-white",
  badgeColor = "bg-red-500 text-white"
}) => {
  if (!hasNewMessages) return null

  return (
    <button
      onClick={onClick}
      className={`relative ${className}`}
      aria-label={`${unreadCount} unread messages`}
    >
      <MessageCircle className={`w-6 h-6 ${iconColor}`} />
      {showBadge && (
        <Badge className={`absolute -top-2 -right-2 ${badgeColor} h-5 min-w-5 text-xs px-1 border-2 border-white`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </button>
  )
}

export default ChatNotificationIcon