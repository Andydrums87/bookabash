// hooks/useSupplierManager.js - Updated with cakes category
"use client"

import { useState } from "react"

export function useSupplierManager(removeSupplier, partyId, currentPhase) {
  const [loadingCards, setLoadingCards] = useState([])
  const [suppliersToDelete, setSuppliersToDelete] = useState([])
  const [recentlyDeleted, setRecentlyDeleted] = useState([]) // Track recently deleted to prevent flash
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
      entertainment: 'Entertainer',
      cakes: 'Cakes',
      facePainting: 'Face Painting',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'Decorations',
      balloons: 'Balloons',
      catering: 'Catering',
      photography: 'Photography',
      bouncyCastle: 'Bouncy Castle'
    }
    return displayNames[type] || type
  }

  // Open supplier selection modal
  const openSupplierModal = (category) => {

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
  // ✅ Clear URL params immediately when delete is initiated
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.delete('scrollTo')
  currentUrl.searchParams.delete('action')
  window.history.replaceState({}, '', currentUrl)
  
  setShowDeleteConfirm(supplierType)
}

  // Confirm supplier deletion
  const confirmDeleteSupplier = async (supplierType) => {
    setSuppliersToDelete(prev => [...prev, supplierType])
    setShowDeleteConfirm(null)

    // Simulate removal animation
    setTimeout(async () => {
      // ✅ Add to recently deleted BEFORE removing to prevent any gap
      setRecentlyDeleted(prev => [...prev, supplierType])

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


      } else {
        // Regular supplier removal for other types (including cakes)
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

        // Clear from recently deleted after state settles (keep for longer to ensure smooth transition)
        setTimeout(() => {
          setRecentlyDeleted(prev => prev.filter(type => type !== supplierType))
        }, 500)
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
    

    setIsDeleting(true)
    
    try {
      const result = await partyDatabaseBackend.cancelEnquiryAndRemoveSupplier(partyId, supplierType)
      
      if (result.success) {

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
    recentlyDeleted, // Export recently deleted to prevent flash
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