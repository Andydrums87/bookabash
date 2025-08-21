// components/supplier/hooks/useSupplierNotifications.js
"use client"

import { useState, useCallback } from 'react'

export const useSupplierNotifications = () => {
  const [notification, setNotification] = useState(null)

  // Show notification with auto-dismiss
  const showNotification = useCallback((notificationData) => {
    console.log('📢 Showing notification:', notificationData)
    
    // Ensure notification has required properties
    const notification = {
      type: notificationData.type || 'info',
      message: notificationData.message || 'Notification',
      duration: notificationData.duration || 3000,
      id: Date.now(), // Unique ID for React keys
      ...notificationData
    }
    
    setNotification(notification)
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setNotification(null)
    }, notification.duration)
  }, [])

  // Hide notification immediately
  const hideNotification = useCallback(() => {
    console.log('🔇 Hiding notification')
    setNotification(null)
  }, [])

  // Show success notification
  const showSuccess = useCallback((message, duration = 3000) => {
    showNotification({
      type: 'success',
      message,
      duration
    })
  }, [showNotification])

  // Show error notification
  const showError = useCallback((message, duration = 5000) => {
    showNotification({
      type: 'error',
      message,
      duration
    })
  }, [showNotification])

  // Show info notification
  const showInfo = useCallback((message, duration = 4000) => {
    showNotification({
      type: 'info',
      message,
      duration
    })
  }, [showNotification])

  // Show warning notification
  const showWarning = useCallback((message, duration = 4000) => {
    showNotification({
      type: 'warning',
      message,
      duration
    })
  }, [showNotification])

  // Show notification for booking success
  const showBookingSuccess = useCallback((supplierName, packageName, extras = '') => {
    const message = `🎉 ${supplierName} added to your party plan${packageName ? ` (${packageName})` : ''}${extras}!`
    showSuccess(message)
  }, [showSuccess])

  // Show notification for booking error
  const showBookingError = useCallback((error) => {
    const message = `Failed to add supplier: ${error}. Please try again.`
    showError(message)
  }, [showError])

  // Show notification for cake customization
  const showCakeSuccess = useCallback((supplierName, packageName, flavor) => {
    const message = `🎂 ${packageName} with ${flavor} flavor added to your plan!`
    showSuccess(message)
  }, [showSuccess])

  // Show notification for addon selection
  const showAddonSuccess = useCallback((supplierName, addonCount) => {
    const message = `${supplierName} added with ${addonCount} add-on${addonCount > 1 ? 's' : ''}!`
    showSuccess(message)
  }, [showSuccess])

  // Show notification for availability issues
  const showAvailabilityWarning = useCallback((message) => {
    showWarning(`📅 ${message}`)
  }, [showWarning])

  // Show notification for enquiry status
  const showEnquiryInfo = useCallback((pendingCount) => {
    const message = `📧 You have ${pendingCount} pending enquir${pendingCount > 1 ? 'ies' : 'y'}. Wait for responses before adding more suppliers.`
    showInfo(message, 5000)
  }, [showInfo])

  // Show save for later notification
  const showSaveForLater = useCallback((supplierName) => {
    const message = `💝 ${supplierName} saved to your favorites!`
    showSuccess(message)
  }, [showSuccess])

  // Check if notification is currently showing
  const isNotificationVisible = useCallback(() => {
    return !!notification
  }, [notification])

  // Get current notification type
  const getCurrentNotificationType = useCallback(() => {
    return notification?.type || null
  }, [notification])

  return {
    // State
    notification,
    
    // Basic actions
    showNotification,
    hideNotification,
    
    // Type-specific actions
    showSuccess,
    showError,
    showInfo,
    showWarning,
    
    // Context-specific actions
    showBookingSuccess,
    showBookingError,
    showCakeSuccess,
    showAddonSuccess,
    showAvailabilityWarning,
    showEnquiryInfo,
    showSaveForLater,
    
    // Utilities
    isNotificationVisible,
    getCurrentNotificationType
  }
}