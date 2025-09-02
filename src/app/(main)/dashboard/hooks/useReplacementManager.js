import { useState, useEffect, useRef } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { supabase } from "@/lib/supabase"
import { useEnquiryStatus } from "../hooks/useEnquiryStatus"
import { useContextualNavigation } from '@/hooks/useContextualNavigation'

export function useReplacementManager(partyId, partyDetails, refreshPartyData, setNotification, currentSupplier = null) {
  const { navigateWithContext } = useContextualNavigation()

  // State
  const [replacements, setReplacements] = useState([])
  const [isProcessingRejection, setIsProcessingRejection] = useState(false)
  
  // Refs for tracking
  const approvedReplacementsRef = useRef(new Set())
  const processingApprovalsRef = useRef(new Set())

  // Get enquiries
  const { enquiries, refreshEnquiries } = useEnquiryStatus(partyId, true)







  useEffect(() => {
    
    
    // ✅ STEP 1: Check restoration flags FIRST and with priority
    const shouldRestore = sessionStorage.getItem('shouldRestoreReplacementModal')
    const modalShowUpgrade = sessionStorage.getItem('modalShowUpgrade')
    const storedContext = sessionStorage.getItem('replacementContext')
 
    
    // ✅ STEP 2: Handle restoration case - THIS IS THE KEY FIX
    if (shouldRestore === 'true' && storedContext) {

      
      try {
        const context = JSON.parse(storedContext)
        console.log('📦 Parsed restoration context:', context)
        
        // ✅ CREATE: Restoration replacement that will trigger the modal
        const restorationReplacement = {
          id: context.replacementId || 'restoration-' + Date.now(),
          category: context.category || context.mobileApproval?.supplierCategory || 'Entertainment',
          status: 'pending_approval',
          reason: 'Package selection approved - ready for final booking',
          
          // ✅ OLD SUPPLIER DATA
          oldSupplier: {
            name: context.oldSupplierName || 'Previous Supplier',
            price: context.oldSupplierPrice || 100,
            image: context.oldSupplierImage || '/placeholder.jpg'
          },
          
          // ✅ NEW SUPPLIER DATA (from mobile approval)
          newSupplier: {
            id: context.selectedSupplierData?.id || context.newSupplierId || 'unknown',
            name: context.selectedSupplierData?.name || context.mobileApproval?.supplierName || 'Selected Supplier',
            price: context.selectedPackageData?.price || context.mobileApproval?.packagePrice || 150,
            description: context.selectedSupplierData?.description || 'Your selected replacement supplier',
            image: context.selectedSupplierData?.image || '/placeholder.jpg',
            rating: context.selectedSupplierData?.rating || 4.5,
            reviewCount: context.selectedSupplierData?.reviewCount || 20
          },
          
          // ✅ RESTORATION FLAGS
          isRestoration: true,
          fromMobileApproval: true,
          packageAlreadySelected: true,
          originalEnquiryId: context.originalEnquiryId,
          
          // ✅ MOBILE APPROVAL DATA
          mobileApprovalData: context.mobileApproval,
          selectedPackageData: context.selectedPackageData
        }
        
    
        
        // ✅ SET: The replacement immediately to trigger the modal
        setReplacements([restorationReplacement])
        
    
        
        return // ✅ EXIT EARLY - Don't process regular enquiries during restoration
        
      } catch (error) {
        console.error('❌ RESTORATION ERROR:', error)
        // Clear corrupted flags
        sessionStorage.removeItem('shouldRestoreReplacementModal')
        sessionStorage.removeItem('modalShowUpgrade')
        sessionStorage.removeItem('replacementContext')
      }
    }
    
    // ✅ STEP 3: Regular enquiry processing (only if not restoring)
    if (!partyId || enquiries.length === 0) {

      return
    }
    
    // ✅ STEP 4: Process regular declined enquiries (existing logic)
    if (enquiries.length > 0 && processingApprovalsRef.current.size === 0) {
      const declinedEnquiries = enquiries.filter(enquiry => 
        enquiry.status === 'declined' && enquiry.replacement_processed === false
      )
      
    
      
      if (declinedEnquiries.length === 0) {

        setReplacements([])
        return
      }
      
      // Process declined enquiries (existing logic)
      const processAllRejections = async () => {
        setIsProcessingRejection(true)
        const newReplacements = []
        
        for (const enquiry of declinedEnquiries) {
          try {
            const rejectedSupplier = {
              id: enquiry.supplier_id,
              name: enquiry.suppliers?.business_name || 'Unknown Supplier',
              price: enquiry.quoted_price || 0,
              rating: enquiry.suppliers?.data?.rating || 4.0,
              image: enquiry.suppliers?.data?.image || '/placeholder.jpg',
              category: enquiry.supplier_category,
              reviewCount: enquiry.suppliers?.data?.reviewCount || 0
            }
            
            const userPreferences = {
              budget: partyDetails.budget,
              date: partyDetails.date,
              location: partyDetails.location,
              theme: partyDetails.theme?.toLowerCase(),
              childAge: partyDetails.childAge,
              numberOfChildren: partyDetails.numberOfChildren
            }
            
            const result = await partyDatabaseBackend.handleSupplierRejection(
              partyId,
              enquiry.id,
              rejectedSupplier,
              userPreferences
            )
            
            if (result.success) {
              const replacementWithEnquiryId = {
                ...result.replacement,
                originalEnquiryId: enquiry.id
              }
              
              // Only add if not already approved
              if (!approvedReplacementsRef.current.has(replacementWithEnquiryId.id)) {
                newReplacements.push(replacementWithEnquiryId)
              }
            }
            
          } catch (error) {
            console.error(`💥 Error processing ${enquiry.supplier_category} rejection:`, error)
          }
        }
        
        if (newReplacements.length > 0) {
        
          setReplacements(prev => {
            const existingCategories = newReplacements.map(r => r.category)
            const filtered = prev.filter(r => 
              !existingCategories.includes(r.category) && !approvedReplacementsRef.current.has(r.id)
            )
            return [...filtered, ...newReplacements]
          })
        }
        
        setIsProcessingRejection(false)
      }
      
      processAllRejections()
    }
  }, [enquiries, partyId, partyDetails])

  // Save replacements to localStorage
  useEffect(() => {
    if (replacements.length > 0) {
      const unapprovedReplacements = replacements.filter(r => !approvedReplacementsRef.current.has(r.id))
      if (unapprovedReplacements.length > 0) {
        localStorage.setItem('pending_replacements', JSON.stringify(unapprovedReplacements))
      } else {
        localStorage.removeItem('pending_replacements')
      }
    } else {
      localStorage.removeItem('pending_replacements')
    }
  }, [replacements])

  // Process declined enquiries for replacements
  useEffect(() => {

    if (enquiries.length > 0 && processingApprovalsRef.current.size === 0) {
      const declinedEnquiries = enquiries.filter(enquiry => 
        enquiry.status === 'declined' && !enquiry.replacement_processed
      )
  
      if (declinedEnquiries.length === 0) {
        return
      }
      
      const processAllRejections = async () => {
        setIsProcessingRejection(true)
        const newReplacements = []
        
        for (const enquiry of declinedEnquiries) {
          try {
            const rejectedSupplier = {
              id: enquiry.supplier_id,
              name: enquiry.suppliers?.business_name || 'Unknown Supplier',
              price: enquiry.quoted_price || 0,
              rating: enquiry.suppliers?.data?.rating || 4.0,
              image: enquiry.suppliers?.data?.image || '/placeholder.jpg',
              category: enquiry.supplier_category,
              reviewCount: enquiry.suppliers?.data?.reviewCount || 0
            }
            
            const userPreferences = {
              budget: partyDetails.budget,
              date: partyDetails.date,
              location: partyDetails.location,
              theme: partyDetails.theme?.toLowerCase(),
              childAge: partyDetails.childAge,
              numberOfChildren: partyDetails.numberOfChildren
            }
            
            const result = await partyDatabaseBackend.handleSupplierRejection(
              partyId,
              enquiry.id,
              rejectedSupplier,
              userPreferences
            )
            
            if (result.success) {
              const replacementWithEnquiryId = {
                ...result.replacement,
                originalEnquiryId: enquiry.id
              }
              
              // Only add if not already approved
              if (!approvedReplacementsRef.current.has(replacementWithEnquiryId.id)) {
                newReplacements.push(replacementWithEnquiryId)
              }
            }
            
          } catch (error) {
            console.error(`💥 Error processing ${enquiry.supplier_category} rejection:`, error)
          }
        }
        
        if (newReplacements.length > 0) {
          setReplacements(prev => {
            const existingCategories = newReplacements.map(r => r.category)
            const filtered = prev.filter(r => 
              !existingCategories.includes(r.category) && !approvedReplacementsRef.current.has(r.id)
            )
            return [...filtered, ...newReplacements]
          })
        }
        
        setIsProcessingRejection(false)
      }
      
      processAllRejections()
    }
  }, [enquiries, partyId, partyDetails])

  // ✅ ENHANCED: Approval function with current supplier data
  const handleApproveReplacement = async (replacementId, selectedPackageData = null) => {

    const currentPartyId = partyId
    // ✅ VALIDATE: Required dependencies
    if (!partyId) {
      console.error('❌ No partyId provided to replacement manager')

      setNotification?.({
        type: 'error',
        message: 'Unable to process replacement. Party ID not found. Please refresh the page and try again.'
      })
      return
    }
    
    try {
      // Find the replacement
      const replacement = replacements.find(r => r.id === replacementId)
      if (!replacement) {
        console.error('❌ Replacement not found:', replacementId)
        return
      }
      

      // ✅ CATEGORY RESOLUTION: The category should come from the original enquiry/old supplier
      // because that's what we're replacing (same category, different supplier)
      const originalCategory = replacement.oldSupplier?.category || 
                              replacement.category ||
                              replacement.supplier_category ||
                              'Entertainment' // Final fallback
      

      
      // ✅ ENHANCED: Get category from multiple possible sources with original category priority
      const supplierCategory = originalCategory || 
                              replacement.newSupplier?.category ||
                              replacement.newSupplier?.supplier_category ||
                              'Entertainment'
      
    
      // ✅ GET: Enhanced package data from multiple sources
      let packageToUse = selectedPackageData
      
      if (!packageToUse) {
        // Try to get from session storage
        try {
          const storedContext = sessionStorage.getItem('replacementContext')
          if (storedContext) {
            const context = JSON.parse(storedContext)
            packageToUse = context.selectedPackageData
         
          }
        } catch (error) {
          console.error('❌ Error getting package from session storage:', error)
        }
      }
      
      // ✅ GET: Current supplier data from session storage (most reliable)
      let currentSupplierFromSession = null
      try {
        const storedContext = sessionStorage.getItem('replacementContext')
        if (storedContext) {
          const context = JSON.parse(storedContext)
          currentSupplierFromSession = context.currentSupplierData
        
        }
      } catch (error) {
        console.error('❌ Error getting current supplier from session storage:', error)
      }
      
      // ✅ DETERMINE: Category from the most reliable source
      let categoryToUse = 'Entertainment' // Default fallback
      
      if (currentSupplierFromSession && currentSupplierFromSession.category) {
        categoryToUse = currentSupplierFromSession.category

      } else if (currentSupplier && currentSupplier.category) {
        categoryToUse = currentSupplier.category

      } else if (replacement.category) {
        categoryToUse = replacement.category
       
      } else {

      }
      
      // ✅ BUILD: Final supplier object with guaranteed category
      const finalSupplier = {
        // Start with replacement.newSupplier as base (has the new supplier's data)
        ...replacement.newSupplier,
        // Add the category we determined above
        category: categoryToUse,
        // Override with current supplier data if available (for complete info)
        ...(currentSupplierFromSession || {}),
        // Ensure we keep the replacement supplier's identity
        id: replacement.newSupplier.id,
        name: replacement.newSupplier.name || currentSupplierFromSession?.name,
        // Force category again to make sure it doesn't get overwritten
        category: categoryToUse
      }
      
   
      
      // ✅ FALLBACK: Create default package if none found
      if (!packageToUse) {
       
        packageToUse = {
          id: 'basic',
          name: 'Basic Package', 
          price: finalSupplier.price || replacement.newSupplier.price,
          duration: '2 hours',
          features: ['Standard service'],
          description: `Basic package`
        }
      }
      
  
      
      // ✅ ENHANCED: Create comprehensive package data for database
      const enhancedPackageData = {
        // Core package info
        id: packageToUse.id,
        name: packageToUse.name,
        price: packageToUse.price,
        duration: packageToUse.duration || '2 hours',
        features: packageToUse.features || ['Standard service'],
        description: packageToUse.description || `${packageToUse.name} for ${replacement.category}`,
        
        // Pricing breakdown
        originalPrice: packageToUse.originalPrice || packageToUse.price,
        totalPrice: packageToUse.totalPrice || packageToUse.price,
        basePrice: packageToUse.basePrice || packageToUse.price,
        addonsPriceTotal: packageToUse.addonsPriceTotal || 0,
        
        // Add-ons (if any)
        addons: packageToUse.addons || [],
        selectedAddons: packageToUse.selectedAddons || [],
        
        // Replacement metadata
        isReplacementPackage: true,
        replacementId: replacementId,
        selectedAt: new Date().toISOString(),
        originalSupplierName: replacement.oldSupplier.name,
        
        // Additional metadata for tracking
        packageSelectionSource: selectedPackageData ? 'modal_approval' : 'session_storage',
        replacementReason: `Replacing ${replacement.oldSupplier.name} (declined)`
      }
      
 
      
      // ✅ VALIDATE: Category before proceeding
      if (!supplierCategory || supplierCategory === 'undefined' || supplierCategory === 'null') {
        console.error('❌ Invalid category for supplier:', {
          supplierCategory,
          replacementId,
          replacement: replacement
        })
        setNotification?.({
          type: 'error',
          message: 'Unable to determine supplier category. Please try again or contact support.'
        })
        return
      }
      
      const enhancedSupplier = {
        ...replacement.newSupplier,
        category: supplierCategory, // ✅ Ensure category is set and valid
        // Ensure other required fields are present
        id: replacement.newSupplier.id || replacement.newSupplier.supplier_id,
        name: replacement.newSupplier.name || replacement.newSupplier.business_name,
        description: replacement.newSupplier.description || `${supplierCategory} service provider`,
        price: replacement.newSupplier.price || packageToUse.price,
        priceFrom: replacement.newSupplier.priceFrom || replacement.newSupplier.price || packageToUse.price,
        image: replacement.newSupplier.image || replacement.newSupplier.imageUrl || '/placeholder.jpg'
      }
      
      // ✅ FINAL VALIDATION: Ensure all required fields are present
      const requiredFields = ['id', 'name', 'category']
      const missingFields = requiredFields.filter(field => !enhancedSupplier[field])
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required supplier fields:', {
          missingFields,
          enhancedSupplier,
          originalSupplier: replacement.newSupplier
        })
        setNotification?.({
          type: 'error',
          message: `Missing supplier information: ${missingFields.join(', ')}. Please try again.`
        })
        return
      }
      

      
      // ✅ ADD: Mark replacement as being processed
      approvedReplacementsRef.current.add(replacementId)
      processingApprovalsRef.current.add(replacementId)
      

      
      const addResult = await partyDatabaseBackend.addSupplierToParty(
        currentPartyId,
        enhancedSupplier,
        enhancedPackageData
      )
      
      if (addResult.success) {
        if (replacement.originalEnquiryId) {
          await supabase
            .from('enquiries')
            .update({ replacement_processed: true })
            .eq('id', replacement.originalEnquiryId)
        }
      
        
        // ✅ ENHANCED: Send enquiry with detailed package information
        const enquiryMessage = [
          `🔄 Replacement booking confirmed!`,
          ``,
          `📋 Package Details:`,
          `• ${enhancedPackageData.name} - £${enhancedPackageData.totalPrice}`,
          `• Duration: ${enhancedPackageData.duration}`,
          `• Features: ${enhancedPackageData.features.join(', ')}`,
          ``,
          `🏪 Replacing: ${replacement.oldSupplier.name} (unavailable)`,
          ``,
          `Party Date: ${partyDetails.date}`,
          `Location: ${partyDetails.location}`,
          `Children: ${partyDetails.numberOfChildren || 'Not specified'}`,
          ``,
          `Looking forward to making this party amazing! 🎉`
        ].join('\n')
 
        
        const enquiryResult = await partyDatabaseBackend.sendIndividualEnquiry(
          partyId,
          enhancedSupplier,  // ✅ Use same defensive copy with category
          enhancedPackageData,
          enquiryMessage
        )
        
        if (enquiryResult.success) {
   
          
          // ✅ CLEAR: Package data from session storage after successful booking
          try {
            sessionStorage.removeItem('replacementContext')
            sessionStorage.removeItem('shouldRestoreReplacementModal')
            sessionStorage.removeItem('modalShowUpgrade')

          } catch (error) {
            console.error('❌ Error clearing session data:', error)
          }
          
        } else {
          console.error('❌ Failed to send enquiry:', enquiryResult.error)
        }
        
        // ✅ REMOVE: Replacement from list
        setReplacements(prev => prev.filter(r => r.id !== replacementId))
        
        // ✅ REFRESH: Party data to show updated supplier
        if (refreshPartyData) {
          await refreshPartyData()
        }
        
        // ✅ SHOW: Enhanced success notification
        const packageInfo = enhancedPackageData.addons?.length > 0 
          ? ` (${enhancedPackageData.name} + ${enhancedPackageData.addons.length} add-ons)` 
          : ` (${enhancedPackageData.name})`
        
        setNotification?.({
          type: 'success',
          message: `🎉 ${finalSupplier.name} booked successfully${packageInfo}! Enquiry sent with package details.`,
          duration: 5000
        })
        
      } else {
        console.error('❌ Failed to add replacement:', addResult.error)
        setNotification?.({
          type: 'error',
          message: `Failed to book ${finalSupplier.name}. Please try again.`
        })
        
        // Remove from processing set on failure
        approvedReplacementsRef.current.delete(replacementId)
      }
      
    } catch (error) {
      console.error('❌ Error approving replacement:', error)
      setNotification?.({
        type: 'error',
        message: 'Failed to book replacement. Please try again.'
      })
      
      // Remove from processing set on error
      approvedReplacementsRef.current.delete(replacementId)
    } finally {
      // Always remove from processing set
      processingApprovalsRef.current.delete(replacementId)
    }
  }

  // ✅ ENHANCED: View supplier with proper context setting
  const handleViewSupplier = (supplierIdOrUrl) => {
  
    
    // Check if it's a full URL (from replacement modal)
    if (typeof supplierIdOrUrl === 'string' && supplierIdOrUrl.startsWith('/supplier/')) {

      navigateWithContext(supplierIdOrUrl, 'replacement')
    } else {
      // Regular supplier ID from dashboard context

      navigateWithContext(`/supplier/${supplierIdOrUrl}`, 'dashboard')
    }
  }

  // Handle dismissing replacement
  const handleDismissReplacement = async (replacementId) => {
    try {
      const replacement = replacements.find(r => r.id === replacementId)
      if (!replacement) return

      if (replacement?.originalEnquiryId) {
        // ✅ Mark as processed when dismissed
        await supabase
          .from('enquiries')
          .update({ replacement_processed: true })
          .eq('id', replacement.originalEnquiryId)
      }
  
      if (error) {
        console.error('❌ Error marking enquiry as processed:', error)
      }
      
      // Remove from UI state
      setReplacements(prev => prev.filter(r => r.id !== replacementId))
      
      // ✅ CLEAR: Session data when dismissing
      try {
        sessionStorage.removeItem('replacementContext')
        sessionStorage.removeItem('shouldRestoreReplacementModal')
        sessionStorage.removeItem('modalShowUpgrade')
      } catch (error) {
        console.error('❌ Error clearing session data on dismiss:', error)
      }
      
      console.log('✅ Replacement dismissed and enquiry marked as processed')
      
    } catch (error) {
      console.error('💥 Error dismissing replacement:', error)
    }
  }

  // Clear approved replacements (for debugging)
  const clearApprovedReplacements = () => {
    approvedReplacementsRef.current.clear()
    console.log('🧹 Cleared approved replacements tracking')
  }

  return {
    replacements,
    isProcessingRejection,
    handleApproveReplacement, // ✅ Now properly handles package data
    handleViewSupplier,
    handleDismissReplacement,
    clearApprovedReplacements
  }
}