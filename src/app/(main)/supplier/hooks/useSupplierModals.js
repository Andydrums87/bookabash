// components/supplier/hooks/useSupplierModals.js
"use client"

import { useState, useCallback } from 'react'

export const useSupplierModals = () => {
  // Modal states
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [showAlaCarteModal, setShowAlaCarteModal] = useState(false)
  const [showCakeModal, setShowCakeModal] = useState(false)
  const [showPendingEnquiryModal, setShowPendingEnquiryModal] = useState(false)
  const [showUnavailableModal, setShowUnavailableModal] = useState(false)
  const [selectedPackageForCake, setSelectedPackageForCake] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])

  // Cake modal handlers
  const openCakeModal = useCallback((packageData) => {

    setSelectedPackageForCake(packageData)
    setShowCakeModal(true)
  }, [])
  
  const closeCakeModal = useCallback(() => {

    setShowCakeModal(false)
    setSelectedPackageForCake(null)
  }, [])

  // Addon modal handlers
  const openAddonModal = useCallback(() => {

    setShowAddonModal(true)
  }, [])

  const closeAddonModal = useCallback(() => {

    setShowAddonModal(false)
    setSelectedAddons([])
  }, [])

  // À la carte modal handlers
  const openAlaCarteModal = useCallback(() => {

    setShowAlaCarteModal(true)
  }, [])

  const closeAlaCarteModal = useCallback(() => {

    setShowAlaCarteModal(false)
  }, [])

  // Pending enquiry modal handlers
  const openPendingEnquiryModal = useCallback(() => {

    setShowPendingEnquiryModal(true)
  }, [])

  const closePendingEnquiryModal = useCallback(() => {

    setShowPendingEnquiryModal(false)
  }, [])

  // Unavailable modal handlers
  const openUnavailableModal = useCallback(() => {

    setShowUnavailableModal(true)
  }, [])

  const closeUnavailableModal = useCallback(() => {

    setShowUnavailableModal(false)
  }, [])

  // Close all modals helper
  const closeAllModals = useCallback(() => {

    setShowAddonModal(false)
    setShowAlaCarteModal(false)
    setShowCakeModal(false)
    setShowPendingEnquiryModal(false)
    setShowUnavailableModal(false)
    setSelectedPackageForCake(null)
    setSelectedAddons([])
  }, [])

  // Check if any modal is open
  const isAnyModalOpen = useCallback(() => {
    return showAddonModal || 
           showAlaCarteModal || 
           showCakeModal || 
           showPendingEnquiryModal || 
           showUnavailableModal
  }, [showAddonModal, showAlaCarteModal, showCakeModal, showPendingEnquiryModal, showUnavailableModal])

  // Modal handlers for specific flows
  const handleModalFlow = useCallback((flowType, data = {}) => {

    
    switch (flowType) {
      case 'showDatePicker':
        // Scroll to calendar and highlight it
        const calendarElement = document.getElementById('availability-calendar')
        if (calendarElement) {
          calendarElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          })
          
          // Add highlight effect
          calendarElement.classList.add('ring-4', 'ring-orange-300', 'ring-opacity-75', 'transition-all', 'duration-500')
          setTimeout(() => {
            calendarElement?.classList.remove('ring-4', 'ring-orange-300', 'ring-opacity-75')
          }, 2500)
        }
        break

      case 'showPendingEnquiry':
        openPendingEnquiryModal()
        break

      case 'showUnavailableModal':
        // Set temporary date if provided for modal display
        if (data.unavailableDate) {
          try {
            const tempDate = new Date(data.unavailableDate + 'T12:00:00')
            // You might want to pass setters here if needed for temporary date setting
            console.log('Setting temporary date for unavailable modal:', tempDate)
          } catch (error) {
            console.log('❌ Error setting temporary date for modal:', error)
          }
        }
        openUnavailableModal()
        break

      case 'showAlaCarteModal':
        openAlaCarteModal()
        break

      case 'showAddonModal':
        openAddonModal()
        break

      case 'showCakeModal':
        if (data.packageData) {
          openCakeModal(data.packageData)
        }
        break

      default:
        console.warn('Unknown modal flow type:', flowType)
    }
  }, [openPendingEnquiryModal, openUnavailableModal, openAlaCarteModal, openAddonModal, openCakeModal])

  // Enhanced handlers for modal responses
  const handleAddonConfirm = useCallback((addonData, onConfirm) => {
    
    setSelectedAddons(addonData.addons || [])
    closeAddonModal()
    if (onConfirm) {
      onConfirm(addonData)
    }
  }, [closeAddonModal])

  const handleCakeConfirm = useCallback((enhancedPackageData, onConfirm) => {
  
    closeCakeModal()
    if (onConfirm) {
      onConfirm(enhancedPackageData)
    }
  }, [closeCakeModal])

  const handleAlaCarteConfirm = useCallback((partyDetails, onConfirm) => {

    closeAlaCarteModal()
    if (onConfirm) {
      onConfirm(partyDetails)
    }
  }, [closeAlaCarteModal])

  // Unavailable modal specific handlers
  const handleSelectNewDate = useCallback((onSelectNewDate) => {
    closeUnavailableModal()
    
    // Scroll to calendar
    const calendarElement = document.getElementById('availability-calendar')
    if (calendarElement) {
      calendarElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      })
      
      // Add highlight effect
      calendarElement.classList.add('ring-4', 'ring-blue-300', 'ring-opacity-75', 'transition-all', 'duration-500')
      setTimeout(() => {
        calendarElement?.classList.remove('ring-4', 'ring-blue-300', 'ring-opacity-75')
      }, 3000)
    }
    
    if (onSelectNewDate) {
      onSelectNewDate()
    }
  }, [closeUnavailableModal])

  const handleViewAlternatives = useCallback((supplier, getSelectedCalendarDate, router) => {
    closeUnavailableModal()
    
    // Navigate to supplier search with same category and date filters
    const searchParams = new URLSearchParams({
      category: supplier?.category || '',
      date: getSelectedCalendarDate?.() || '',
      available: 'true'
    })
    
    router?.push(`/suppliers?${searchParams.toString()}`)
  }, [closeUnavailableModal])

  return {
    // Modal states
    showAddonModal,
    setShowAddonModal,
    showAlaCarteModal, 
    setShowAlaCarteModal,
    showCakeModal,
    setShowCakeModal,
    showPendingEnquiryModal,
    setShowPendingEnquiryModal,
    showUnavailableModal,
    setShowUnavailableModal,
    selectedPackageForCake,
    setSelectedPackageForCake,
    selectedAddons,
    setSelectedAddons,

    // Open/Close handlers
    openCakeModal,
    closeCakeModal,
    openAddonModal,
    closeAddonModal,
    openAlaCarteModal,
    closeAlaCarteModal,
    openPendingEnquiryModal,
    closePendingEnquiryModal,
    openUnavailableModal,
    closeUnavailableModal,
    closeAllModals,

    // Utility functions
    isAnyModalOpen,
    handleModalFlow,

    // Enhanced confirmation handlers
    handleAddonConfirm,
    handleCakeConfirm,
    handleAlaCarteConfirm,
    handleSelectNewDate,
    handleViewAlternatives
  }
}