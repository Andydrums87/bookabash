import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X, RefreshCw, Star, ArrowUp, Bell } from 'lucide-react'

export default function RealTimeNotifications({ 
  notifications = [],
  onDismiss,
  onViewDetails 
}) {
  const [visibleNotifications, setVisibleNotifications] = useState([])

  useEffect(() => {
    // Show new notifications with animation
    const newNotifications = notifications.filter(
      notif => !visibleNotifications.some(visible => visible.id === notif.id)
    )
    
    newNotifications.forEach((notif, index) => {
      setTimeout(() => {
        setVisibleNotifications(prev => [...prev, notif])
      }, index * 300)
    })
  }, [notifications])

  const handleDismiss = (notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    )
    if (onDismiss) onDismiss(notificationId)
  }

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'confirmed':
        return {
          border: 'border-green-400',
          bg: 'bg-green-50',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          iconBg: 'bg-green-100'
        }
      case 'declined':
        return {
          border: 'border-orange-400', 
          bg: 'bg-orange-50',
          icon: <RefreshCw className="w-5 h-5 text-orange-600" />,
          iconBg: 'bg-orange-100'
        }
      case 'all_confirmed':
        return {
          border: 'border-green-500',
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          icon: <Star className="w-5 h-5 text-green-600" />,
          iconBg: 'bg-green-100'
        }
      case 'payment_ready':
        return {
          border: 'border-blue-500',
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          icon: <Bell className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100'
        }
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          icon: <Bell className="w-5 h-5 text-gray-600" />,
          iconBg: 'bg-gray-100'
        }
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {visibleNotifications.map((notification) => {
        const style = getNotificationStyle(notification.type)
        
        return (
          <Card
            key={notification.id}
            className={`${style.border} ${style.bg} border-2 shadow-lg animate-in slide-in-from-right-full duration-500`}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`${style.iconBg} p-2 rounded-full flex-shrink-0`}>
                  {style.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {notification.message}
                  </p>
                  
                  {/* Status badges or additional info */}
                  {notification.badge && (
                    <Badge 
                      className={`mb-3 ${
                        notification.type === 'confirmed' 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : notification.type === 'declined'
                          ? 'bg-orange-100 text-orange-800 border-orange-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {notification.badge}
                    </Badge>
                  )}
                  
                  {/* Action buttons */}
                  {notification.actions && (
                    <div className="flex space-x-2">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={action.variant || "outline"}
                          onClick={() => {
                            if (action.onClick) action.onClick()
                            if (action.dismissOnClick) handleDismiss(notification.id)
                          }}
                          className={`text-xs ${
                            action.variant === 'default'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : ''
                          }`}
                        >
                          {action.icon && <span className="mr-1">{action.icon}</span>}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress indicator for time-sensitive notifications */}
            {notification.showProgress && (
              <div className="h-1 bg-gray-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000"
                  style={{ width: `${notification.progress || 0}%` }}
                />
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// Example usage and notification data structure
export const createNotification = {
  confirmed: (supplierName, category) => ({
    id: `confirmed-${Date.now()}`,
    type: 'confirmed',
    title: '✅ Supplier Confirmed!',
    message: `${supplierName} has confirmed your ${category} booking.`,
    badge: 'Confirmed',
    actions: [
      {
        label: 'View Details',
        variant: 'outline',
        onClick: () => console.log('View supplier details'),
        dismissOnClick: true
      }
    ]
  }),

  autoReplaced: (oldSupplier, newSupplier, category, reason) => ({
    id: `replaced-${Date.now()}`,
    type: 'declined',
    title: '🔄 Supplier Auto-Replaced',
    message: `${oldSupplier} was unavailable. We've found ${newSupplier} instead - ${reason}!`,
    badge: 'Better Option',
    actions: [
      {
        label: 'See Replacement',
        variant: 'outline',
        onClick: () => console.log('View new supplier'),
        dismissOnClick: true
      }
    ]
  }),

  allConfirmed: (totalSuppliers, totalCost) => ({
    id: `all-confirmed-${Date.now()}`,
    type: 'all_confirmed',
    title: '🎉 All Suppliers Confirmed!',
    message: `Your party team is complete! ${totalSuppliers} suppliers ready to make your day amazing.`,
    badge: `£${totalCost} Total`,
    actions: [
      {
        label: 'Secure Booking',
        variant: 'default',
        icon: <ArrowUp className="w-3 h-3" />,
        onClick: () => console.log('Go to payment'),
        dismissOnClick: false
      }
    ]
  }),

  paymentReady: (totalCost) => ({
    id: `payment-ready-${Date.now()}`,
    type: 'payment_ready',
    title: '💳 Ready to Secure Booking',
    message: 'All suppliers confirmed! Complete your booking to guarantee your party date.',
    showProgress: true,
    progress: 100,
    actions: [
      {
        label: `Pay £${totalCost}`,
        variant: 'default',
        onClick: () => console.log('Process payment'),
        dismissOnClick: false
      }
    ]
  })
}