// hooks/useSupplierManager.js - FIXED VERSION
"use client"

import { useState } from "react"

export function useSupplierManager(removeSupplier, partyId, currentPhase) {
  const [loadingCards, setLoadingCards] = useState([])
  const [suppliersToDelete, setSuppliersToDelete] = useState([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [selectedSupplierModal, setSelectedSupplierModal] = useState({
    isOpen: false,
    category: "",
  })

  // Get supplier display name
  const getSupplierDisplayName = (type) => {
    const displayNames = {
      venue: 'Venue',
      entertainment: 'Entertainment', 
      catering: 'Catering',
      facePainting: 'Face Painting & Activities',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'Decorations',
      balloons: 'Balloons',
      einvites: 'E-Invites'
    }
    return displayNames[type] || type
  }

  // Open supplier selection modal
  const openSupplierModal = (category) => {
    console.log('🔍 Opening supplier modal for category:', category)
    setSelectedSupplierModal({ isOpen: true, category })
  }
  
  // Close supplier selection modal
  const closeSupplierModal = () => {
    setSelectedSupplierModal({ isOpen: false, category: "" })
  }

  // REMOVED: handleSupplierSelection - moved to DatabaseDashboard
  // This hook should only handle UI state, not business logic

  // Start delete process
  const handleDeleteSupplier = (supplierType) => {
    setShowDeleteConfirm(supplierType)
  }

  // Confirm supplier deletion
  const confirmDeleteSupplier = async (supplierType) => {
    setSuppliersToDelete(prev => [...prev, supplierType])
    setShowDeleteConfirm(null)
    
    // Simulate removal animation
    setTimeout(async () => {
      // Special handling for e-invites - reset to default instead of removing
      if (supplierType === 'einvites') {
        const currentPlan = JSON.parse(localStorage.getItem('user_party_plan') || '{}');
        
        // Reset to default e-invites structure
        currentPlan.einvites = {
          id: "digital-invites",
          name: "Digital Superhero Invites",
          description: "Themed e-invitations with RSVP tracking",
          price: 25,
          status: "confirmed",
          image: "/placeholder.jpg",
          category: "Digital Services",
          priceUnit: "per set",
          addedAt: new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem('user_party_plan', JSON.stringify(currentPlan));
        
        // Remove detailed invite data
        localStorage.removeItem('party_einvites');
        
        // Trigger events for real-time updates
        const event = new CustomEvent('partyPlanUpdated', { detail: currentPlan });
        window.dispatchEvent(event);
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user_party_plan',
          newValue: JSON.stringify(currentPlan)
        }));
        
        console.log('✅ E-invite reset to default state');
      } else {
        // Regular supplier removal for other types
        if (removeSupplier) {
          const result = await removeSupplier(supplierType);
          if (result.success) {
            console.log(`Removed ${supplierType} supplier`);
          } else {
            console.error(`Failed to remove ${supplierType}:`, result.error);
          }
        }
      }
      
      // Remove from deletion animation list
      setTimeout(() => {
        setSuppliersToDelete(prev => prev.filter(type => type !== supplierType))
      }, 500)
    }, 300)
  }

  // Cancel supplier deletion
  const cancelDeleteSupplier = () => {
    setShowDeleteConfirm(null)
  }

   // NEW: Cancel enquiry (for awaiting responses phase)
   const handleCancelEnquiry = async (supplierType) => {
    if (isDeleting || !partyId) return
    
    console.log('🚫 Cancelling enquiry for:', supplierType)
    setIsDeleting(true)
    
    try {
      const result = await partyDatabaseBackend.cancelEnquiryAndRemoveSupplier(partyId, supplierType)
      
      if (result.success) {
        console.log('✅ Enquiry cancelled and supplier removed')
        return { success: true, message: result.message }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Error cancelling enquiry:', error)
      return { success: false, error: error.message }
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    loadingCards,
    setLoadingCards,
    suppliersToDelete,
    setSuppliersToDelete,
    showDeleteConfirm,
    setShowDeleteConfirm,
    selectedSupplierModal,
    setSelectedSupplierModal,
    getSupplierDisplayName,
    openSupplierModal,
    closeSupplierModal,
    // REMOVED: handleSupplierSelection - now handled in DatabaseDashboard
    handleDeleteSupplier,
    confirmDeleteSupplier,
    handleCancelEnquiry,
    cancelDeleteSupplier
  };
}