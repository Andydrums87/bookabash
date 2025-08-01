// hooks/useReplacementManager.js - Handles all replacement logic
import { useState, useEffect, useRef } from 'react'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'
import { supabase } from "@/lib/supabase"
import { useEnquiryStatus } from "../hooks/useEnquiryStatus"
import { useContextualNavigation } from '@/hooks/useContextualNavigation'

export function useReplacementManager(partyId, partyDetails, refreshPartyData) {
  const { navigateWithContext } = useContextualNavigation()
  
  // State
  const [replacements, setReplacements] = useState([])
  const [isProcessingRejection, setIsProcessingRejection] = useState(false)
  
  // Refs for tracking
  const approvedReplacementsRef = useRef(new Set())
  const processingApprovalsRef = useRef(new Set())
  
  // Get enquiries
  const { enquiries, refreshEnquiries } = useEnquiryStatus(partyId, true)

  // Load saved replacements from localStorage
  useEffect(() => {
    const savedReplacements = localStorage.getItem('pending_replacements')
    if (savedReplacements) {
      try {
        const parsed = JSON.parse(savedReplacements)
        const filteredReplacements = parsed.filter(r => !approvedReplacementsRef.current.has(r.id))
        console.log('📥 Loading saved replacements from localStorage:', parsed.length, 'filtered to:', filteredReplacements.length)
        setReplacements(filteredReplacements)
      } catch (error) {
        console.error('❌ Error loading saved replacements:', error)
        localStorage.removeItem('pending_replacements')
      }
    }
  }, [])

  // Save replacements to localStorage
  useEffect(() => {
    if (replacements.length > 0) {
      const unapprovedReplacements = replacements.filter(r => !approvedReplacementsRef.current.has(r.id))
      if (unapprovedReplacements.length > 0) {
        localStorage.setItem('pending_replacements', JSON.stringify(unapprovedReplacements))
        console.log('💾 Saved replacements to localStorage:', unapprovedReplacements.length)
      } else {
        localStorage.removeItem('pending_replacements')
        console.log('🗑️ Cleared replacements from localStorage (all approved)')
      }
    } else {
      localStorage.removeItem('pending_replacements')
      console.log('🗑️ Cleared replacements from localStorage (empty array)')
    }
  }, [replacements])

  // Process declined enquiries for replacements
  useEffect(() => {
    if (enquiries.length > 0 && processingApprovalsRef.current.size === 0) {
      console.log('🔍 Checking enquiries for rejections:', enquiries.length)
      
      const declinedEnquiries = enquiries.filter(enquiry => 
        enquiry.status === 'declined' && !enquiry.replacement_processed
      )
      
      console.log(`🚫 Found ${declinedEnquiries.length} declined enquiries needing replacement`)
      
      if (declinedEnquiries.length === 0) {
        console.log('✅ No declined enquiries to process')
        return
      }
      
      const processAllRejections = async () => {
        console.log('🔄 Processing multiple rejections...')
        setIsProcessingRejection(true)
        
        const newReplacements = []
        
        for (const enquiry of declinedEnquiries) {
          console.log(`🔄 Processing rejection for: ${enquiry.supplier_category}`)
          
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
              console.log(`✅ Replacement created for ${enquiry.supplier_category}`)
              
              const replacementWithEnquiryId = {
                ...result.replacement,
                originalEnquiryId: enquiry.id
              }
              
              // Only add if not already approved
              if (!approvedReplacementsRef.current.has(replacementWithEnquiryId.id)) {
                newReplacements.push(replacementWithEnquiryId)
              } else {
                console.log(`⏭️ Skipping already approved replacement: ${replacementWithEnquiryId.id}`)
              }
            }
            
          } catch (error) {
            console.error(`💥 Error processing ${enquiry.supplier_category} rejection:`, error)
          }
        }
        
        if (newReplacements.length > 0) {
          console.log(`📊 Adding ${newReplacements.length} new replacements to state`)
          
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
      
    } else if (processingApprovalsRef.current.size > 0) {
      console.log('⏸️ Skipping rejection processing - currently processing approvals')
    }
  }, [enquiries, partyId, partyDetails])

  // Handle replacement approval
  const handleApproveReplacement = async (replacementId) => {
    console.log('🎯 APPROVE REPLACEMENT CALLED:', replacementId)
    
    // Track that we're processing this approval
    processingApprovalsRef.current.add(replacementId)
    approvedReplacementsRef.current.add(replacementId)
    console.log('✅ Marked as approved and processing:', replacementId)
    
    try {
      const replacement = replacements.find(r => r.id === replacementId)
      if (!replacement) {
        console.warn('❌ Replacement not found:', replacementId)
        return
      }

      console.log('✅ Found replacement to approve:', replacement.category)
      
      // Remove from UI immediately
      setReplacements(prev => {
        const newState = prev.filter(r => r.id !== replacementId)
        console.log(`📊 Removed replacement from UI. ${prev.length} -> ${newState.length}`)
        return newState
      })
      
      // Call backend
      console.log('🔄 Calling backend...')
      const result = await partyDatabaseBackend.applyReplacementToParty(
        partyId, 
        replacement, 
        replacement.originalEnquiryId
      )
      
      if (result.success) {
        console.log('✅ Backend approval successful')
        
        // Mark enquiry as processed
        const { error } = await supabase
          .from('enquiries')
          .update({ 
            replacement_processed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', replacement.originalEnquiryId)
        
        if (error) {
          console.error('❌ Error marking enquiry as processed:', error)
        }
        
        // Refresh party data
        await refreshPartyData()
        
        // Refresh enquiries after a delay
        setTimeout(() => {
          refreshEnquiries()
        }, 1000)
        
        console.log('✅ Replacement approval complete')
        
      } else {
        console.error('❌ Backend approval failed:', result.error)
      }
      
    } catch (error) {
      console.error('💥 Error in handleApproveReplacement:', error)
    } finally {
      // Remove from processing after a delay to prevent race conditions
      setTimeout(() => {
        processingApprovalsRef.current.delete(replacementId)
        console.log('✅ Finished processing approval for:', replacementId)
      }, 2000)
    }
  }

  // Handle viewing supplier
  const handleViewSupplier = (supplierId) => {
    console.log('👁️ Navigating to supplier profile with context:', supplierId)
    navigateWithContext(`/supplier/${supplierId}`, 'dashboard')
  }

  // Handle dismissing replacement
  const handleDismissReplacement = async (replacementId) => {
    try {
      const replacement = replacements.find(r => r.id === replacementId)
      if (!replacement) return

      console.log('❌ Dismissing replacement:', replacementId)
      
      // Mark original enquiry as processed (user chose not to replace)
      const { error } = await supabase
        .from('enquiries')
        .update({ 
          replacement_processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', replacement.originalEnquiryId)
      
      if (error) {
        console.error('❌ Error marking enquiry as processed:', error)
      }
      
      // Remove from UI state
      setReplacements(prev => prev.filter(r => r.id !== replacementId))
      
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
    handleApproveReplacement,
    handleViewSupplier,
    handleDismissReplacement,
    clearApprovedReplacements
  }
}