// components/supplier/hooks/useReplacementMode.js
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from "next/navigation"

export const useReplacementMode = () => {
  const router = useRouter()
  const [replacementContext, setReplacementContext] = useState(null)

  // Initialize replacement context from URL and session storage
  useEffect(() => {
    console.log('🔄 Initializing replacement mode hook')
    
    // 1. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const fromParam = urlParams.get('from')
    
    console.log('🔍 URL from parameter:', fromParam)
    
    // 2. If coming from browse, clear everything and exit
    if (fromParam === 'browse') {
      console.log('🧹 Coming from browse - clearing replacement context')
      setReplacementContext(null)
      sessionStorage.removeItem('replacementContext')
      sessionStorage.removeItem('shouldRestoreReplacementModal')
      sessionStorage.removeItem('modalShowUpgrade')
      return
    }
    
    // 3. Check session storage for replacement context
    const storedContext = sessionStorage.getItem('replacementContext')
    console.log('🔍 Stored context exists:', !!storedContext)
    
    if (storedContext) {
      try {
        const parsedContext = JSON.parse(storedContext)
        console.log('✅ Setting replacement context:', parsedContext)
        setReplacementContext(parsedContext)
      } catch (error) {
        console.error('❌ Error parsing replacement context:', error)
        setReplacementContext(null)
        sessionStorage.removeItem('replacementContext')
      }
    } else {
      console.log('❌ No stored context, clearing replacement state')
      setReplacementContext(null)
    }
  }, []) // Empty dependency - run once on mount

  // Store current supplier data for replacement
  const storeCurrentSupplierData = useCallback((supplier) => {
    if (replacementContext?.isReplacement && supplier?.category) {
      console.log('🏪 Storing current supplier data for replacement:', supplier)
      
      try {
        const currentContext = sessionStorage.getItem('replacementContext')
        if (currentContext) {
          const parsedContext = JSON.parse(currentContext)
          
          const updatedContext = {
            ...parsedContext,
            currentSupplierData: {
              id: supplier.id,
              name: supplier.name,
              category: supplier.category, // This is the key field
              description: supplier.description,
              price: supplier.priceFrom,
              priceFrom: supplier.priceFrom,
              image: supplier.image,
              rating: supplier.rating,
              reviewCount: supplier.reviewCount
            },
            lastUpdatedAt: new Date().toISOString()
          }
          
          sessionStorage.setItem('replacementContext', JSON.stringify(updatedContext))
          console.log('💾 Stored current supplier data with category:', supplier.category)
          
          // Update local state
          setReplacementContext(updatedContext)
        }
      } catch (error) {
        console.error('❌ Error storing supplier data:', error)
      }
    }
  }, [replacementContext])

  // Handle return to replacement flow
  const handleReturnToReplacement = useCallback(() => {
    console.log('🔄 Returning to replacement flow from supplier profile')
    
    if (replacementContext?.returnUrl) {
      router.push(replacementContext.returnUrl)
    } else {
      router.push('/dashboard')
    }
  }, [replacementContext, router])

  // Check if currently in replacement mode
  const isReplacementMode = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isInReplacementMode = urlParams.get('from') === 'replacement' || !!replacementContext?.isReplacement
    return isInReplacementMode
  }, [replacementContext])

  // Get replacement supplier name for display
  const getReplacementSupplierName = useCallback(() => {
    return replacementContext?.supplierName || 
           replacementContext?.newSupplierName || 
           replacementContext?.currentSupplierData?.name || 
           'Supplier'
  }, [replacementContext])

  // Handle mobile approval for replacement mode
  const handleMobileApproval = useCallback((selectedPackage, supplier, packages) => {
    console.log('🐊 MOBILE APPROVE: Starting approval process')
    
    if (!selectedPackage) {
      console.error('❌ MOBILE APPROVE: No package selected')
      alert('Please select a package first!')
      return
    }
    
    if (!supplier?.category) {
      console.error('❌ MOBILE APPROVE: No supplier category')
      alert('Supplier category not found. Please refresh and try again.')
      return
    }
    
    try {
      // Get complete package data
      let completePackageData = selectedPackage
      if (packages && packages.length > 0 && selectedPackage.id) {
        const fullPackageData = packages.find(pkg => pkg.id === selectedPackage.id)
        if (fullPackageData) {
          completePackageData = fullPackageData
        }
      }
      
      // Create enhanced package data
      const enhancedPackageData = {
        id: completePackageData.id,
        name: completePackageData.name,
        price: completePackageData.price,
        duration: completePackageData.duration || '2 hours',
        features: completePackageData.features || completePackageData.whatsIncluded || [],
        description: completePackageData.description || `${completePackageData.name} package`,
        originalPrice: completePackageData.originalPrice || completePackageData.price,
        totalPrice: completePackageData.totalPrice || completePackageData.price,
        basePrice: completePackageData.basePrice || completePackageData.price,
        addonsPriceTotal: completePackageData.addonsPriceTotal || 0,
        addons: completePackageData.addons || [],
        selectedAddons: completePackageData.selectedAddons || [],
        selectedAt: new Date().toISOString(),
        selectionSource: 'mobile_booking_bar_approval',
        approvedFromMobile: true,
        replacementApproval: true
      }
      
      // Create enhanced supplier data
      const enhancedSupplierData = {
        id: supplier.id,
        name: supplier.name,
        category: supplier.category,
        description: supplier.description,
        price: completePackageData.price,
        priceFrom: supplier.priceFrom,
        image: supplier.image,
        rating: supplier.rating,
        reviewCount: supplier.reviewCount,
        location: supplier.location,
        phone: supplier.phone,
        email: supplier.email,
        verified: supplier.verified
      }
      
      // Update replacement context with all necessary data
      const currentContext = sessionStorage.getItem('replacementContext')
      let updatedContext = {}
      
      if (currentContext) {
        const parsedContext = JSON.parse(currentContext)
        updatedContext = {
          ...parsedContext,
          // Package selection data
          selectedPackageId: completePackageData.id,
          selectedPackageData: enhancedPackageData,
          selectedSupplierData: enhancedSupplierData,
          packageSelectedAt: new Date().toISOString(),
          packageApprovedAt: new Date().toISOString(),
          
          // Restoration flags - This is crucial!
          readyForBooking: true,
          shouldRestoreModal: true,
          modalShouldShowUpgrade: true,
          
          // Navigation data
          returnUrl: '/dashboard',
          lastViewedAt: new Date().toISOString(),
          approvalSource: 'mobile_booking_bar',
          
          // Replacement approval data
          mobileApproval: {
            timestamp: new Date().toISOString(),
            packageName: enhancedPackageData.name,
            packagePrice: enhancedPackageData.price,
            supplierName: enhancedSupplierData.name,
            supplierCategory: enhancedSupplierData.category,
            approved: true
          }
        }
      } else {
        // Create complete new context if none exists
        updatedContext = {
          isReplacement: true,
          selectedPackageId: completePackageData.id,
          selectedPackageData: enhancedPackageData,
          selectedSupplierData: enhancedSupplierData,
          packageSelectedAt: new Date().toISOString(),
          packageApprovedAt: new Date().toISOString(),
          
          // Restoration flags
          readyForBooking: true,
          shouldRestoreModal: true,
          modalShouldShowUpgrade: true,
          
          // Navigation data
          returnUrl: '/dashboard',
          createdAt: new Date().toISOString(),
          createdFrom: 'mobile_booking_bar',
          approvalSource: 'mobile_booking_bar',
          
          // Replacement approval data
          mobileApproval: {
            timestamp: new Date().toISOString(),
            packageName: enhancedPackageData.name,
            packagePrice: enhancedPackageData.price,
            supplierName: enhancedSupplierData.name,
            supplierCategory: enhancedSupplierData.category,
            approved: true
          }
        }
      }
      
      console.log('💾 MOBILE APPROVE: Setting comprehensive replacement context:', updatedContext)
      sessionStorage.setItem('replacementContext', JSON.stringify(updatedContext))
      setReplacementContext(updatedContext)
      
      // Set restoration flags that the dashboard will check
      sessionStorage.setItem('shouldRestoreReplacementModal', 'true')
      sessionStorage.setItem('modalShowUpgrade', 'true')
      
      console.log('🚀 MOBILE APPROVE: All flags set, navigating to dashboard')
      
      // Navigate back to dashboard with small delay to ensure session storage is saved
      setTimeout(() => {
        if (replacementContext?.returnUrl) {
          console.log('🚀 MOBILE APPROVE: Using returnUrl from context')
          router.push(replacementContext.returnUrl)
        } else {
          console.log('🚀 MOBILE APPROVE: Using window.location.href fallback')
          window.location.href = '/dashboard'
        }
      }, 200)
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ MOBILE APPROVE: Error during approval:', error)
      alert('Error saving package selection. Please try again.')
      return { success: false, error: error.message }
    }
  }, [replacementContext, router])

  // Clear replacement context
  const clearReplacementContext = useCallback(() => {
    console.log('🧹 Clearing replacement context')
    setReplacementContext(null)
    sessionStorage.removeItem('replacementContext')
    sessionStorage.removeItem('shouldRestoreReplacementModal')
    sessionStorage.removeItem('modalShowUpgrade')
  }, [])

  // Update replacement context with new data
  const updateReplacementContext = useCallback((updates) => {
    if (replacementContext) {
      const updatedContext = { ...replacementContext, ...updates }
      setReplacementContext(updatedContext)
      try {
        sessionStorage.setItem('replacementContext', JSON.stringify(updatedContext))
        console.log('💾 Updated replacement context:', updates)
      } catch (error) {
        console.error('❌ Error updating replacement context:', error)
      }
    }
  }, [replacementContext])

  return {
    // State
    replacementContext,
    
    // Computed values
    isReplacementMode: isReplacementMode(),
    replacementSupplierName: getReplacementSupplierName(),
    
    // Actions
    handleReturnToReplacement,
    handleMobileApproval,
    storeCurrentSupplierData,
    clearReplacementContext,
    updateReplacementContext,
    
    // Utilities
    isInReplacementMode: isReplacementMode,
    getReplacementSupplierName
  }
}