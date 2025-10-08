// SupplierCard.jsx - FIXED to pass recommended supplier props
"use client"
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import EmptySupplierCard from './EmptySupplierCard'
import SelectedSupplierCard from './SelectedSupplierCard'
import AwaitingResponseSupplierCard from './AwaitingResponseSupplierCard'
import ConfirmedSupplierCard from './ConfirmedSupplierCard'
import PaymentConfirmedSupplierCard from './PaymentConfirmedSupplierCard'
import DeclinedSupplierCard from './DeclinedSupplierCard'
import DepositPaidSupplierCard from './DepositPaidSupplierCard'

// Import the helper functions
import { calculateFinalPrice } from '@/utils/unifiedPricing'

export default function SupplierCard({
  type,
  partyDetails,
  supplier,
  loadingCards = [],
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  enquiryStatus = null,
  isSignedIn = false,
  enquiries = [],
  isPaymentConfirmed = false,
  enquirySentAt = null,
  currentPhase,
  onPaymentReady,
  handleCancelEnquiry,
  enhancedPricing,
  pricingRefreshKey,
  // ✅ NEW PROPS for recommended suppliers
  recommendedSupplier,
  onAddSupplier
}) {
  const router = useRouter()



  // Skip e-invites entirely - they're handled separately
  if (type === "einvites") {
    return null
  }

  // Simple click handler - navigate to supplier profile
  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or if no supplier
    if (!supplier || e.target.closest('button') || e.target.closest('a')) {
      return
    }

    // Add visual feedback
    const card = e.currentTarget
    if (card) {
      // Add a quick scale animation
      card.style.transform = 'scale(0.95)'
      card.style.transition = 'transform 0.1s ease'
      
      // Reset after animation
      setTimeout(() => {
        card.style.transform = ''
        card.style.transition = 'transform 0.2s ease'
      }, 100)
    }

    // Navigate to supplier profile after a short delay for visual feedback
    setTimeout(() => {
      if (supplier.id) {
        router.push(`/supplier/${supplier.id}?from=dashboard`)
      }
    }, 150)
  }

  // FIXED getSupplierState function for SupplierCard.jsx
  const getSupplierState = () => {
    if (!supplier) {
      console.log(`🔴 SupplierCard [${type}]: No supplier, returning "empty"`)
      return "empty"
    }
    
    // Find the SPECIFIC enquiry for THIS supplier type
    const enquiry = enquiries.find(e => e.supplier_category === type)
    
    // If no enquiry exists for this supplier type, it's just selected
    if (!enquiry) {
      return isSignedIn ? "selected" : "selected"
    }
    
    // Get the specific payment status for THIS enquiry
    const thisSupplierPaymentStatus = enquiry.payment_status
    const enquiryStatus = enquiry.status // Use the enquiry's own status, not global
    const isAutoAccepted = enquiry.auto_accepted
    const supplierManuallyAccepted = enquiry.supplier_response_date && 
                                    enquiry.supplier_response &&
                                    !enquiry.supplier_response.includes('Auto-')
    
    // Handle declined enquiries first
    if (enquiryStatus === "declined") {
      return "declined"
    }
    
    // PAYMENT FLOW: Only check payment if enquiry is accepted
    if (enquiryStatus === "accepted") {
      
      // If paid + supplier manually confirmed = PAYMENT_CONFIRMED  
      if (thisSupplierPaymentStatus === "paid" && supplierManuallyAccepted) {
        return "payment_confirmed"
      }
      
      // If paid but no manual confirmation yet = DEPOSIT_PAID_CONFIRMED
      if (thisSupplierPaymentStatus === "paid" && !supplierManuallyAccepted) {
        return "deposit_paid_confirmed"  
      }
      
      // If accepted but not paid = CONFIRMED
      if (thisSupplierPaymentStatus !== "paid") {
        return "confirmed"
      }
    }
    
    // ENQUIRY FLOW: Handle pending enquiries
    if (enquiryStatus === "pending") {
      return "awaiting_response"
    }
    
    return "selected"
  }

  const supplierState = getSupplierState()
  console.log(`🔵 SupplierCard [${type}]: State determined as "${supplierState}"`)

  // Enhanced addon collection that includes enquiry addons
  const supplierAddons = (() => {
    // Find the enquiry for this supplier type
    const enquiry = enquiries.find(e => e.supplier_category === type)
    
    // Method 1: Get add-ons from enquiry data (PRIMARY source for database dashboard)
    let enquiryAddons = []
    if (enquiry?.addon_details) {
      try {
        // Parse the addon_details JSON string
        const parsedAddons = JSON.parse(enquiry.addon_details)
        enquiryAddons = Array.isArray(parsedAddons) ? parsedAddons : []
      } catch (error) {
        console.error(`Error parsing addon_details for ${type}:`, error)
        
        // Fallback: try to get addon IDs and reconstruct
        if (enquiry.addon_ids) {
          try {
            const addonIds = JSON.parse(enquiry.addon_ids)
            enquiryAddons = addonIds.map(id => ({
              id,
              name: `Addon ${id}`,
              price: 0
            }))
          } catch (idError) {
            console.error(`Error parsing addon_ids for ${type}:`, idError)
          }
        }
      }
    }
    
    // Method 2: Get add-ons from global addons array (for standalone add-ons)
    const globalAddons = addons.filter((addon) => {
      return addon.supplierId === supplier?.id || 
             addon.supplierType === type ||
             addon.attachedToSupplier === type
    })
    
    // Method 3: Get add-ons from supplier's selectedAddons property (for localStorage)
    const packageAddons = supplier?.selectedAddons || []
    
    // Combine all sources and remove duplicates
    const allAddons = [...enquiryAddons, ...globalAddons, ...packageAddons]
    const uniqueAddons = allAddons.filter((addon, index, arr) => 
      arr.findIndex(a => a.id === addon.id) === index
    )

    return uniqueAddons
  })()

  // FIXED: Always calculate fresh pricing - never use pre-enhanced prices
  const pricing = useMemo(() => {
    if (!supplier) {
      return { finalPrice: 0, breakdown: {}, details: {} }
    }

    // ALWAYS calculate fresh pricing - ignore any pre-enhanced values
    return calculateFinalPrice(supplier, partyDetails, supplierAddons)
  }, [supplier, partyDetails, supplierAddons, type, pricingRefreshKey])
  
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)

  const commonProps = {
    type,
    supplier,
    addons: supplierAddons,
    isLoading,
    partyDetails,
    isDeleting,
    openSupplierModal,
    handleDeleteSupplier,
    getSupplierDisplayName,
    handleRemoveAddon,
    enquirySentAt,
    currentPhase,
    isSignedIn,
    enquiries,
    onPaymentReady,
    handleCancelEnquiry,
    enhancedPricing,
    onClick: handleCardClick,
    totalPrice: pricing.finalPrice
  }

  // ✅ Props specific to EmptySupplierCard - NOW INCLUDING RECOMMENDED SUPPLIER
  const emptyCardProps = {
    type,
    openSupplierModal,
    getSupplierDisplayName,
    currentPhase,
    isSignedIn,
    partyDetails,
    // ✅ CRITICAL: Pass these props!
    recommendedSupplier: recommendedSupplier,
    onAddSupplier: onAddSupplier
  }



  // Enhanced debug logging
  const enquiry = enquiries.find(e => e.supplier_category === type)

  // Render the appropriate card component based on state
  switch (supplierState) {
    case "empty":
      console.log(`🎨 SupplierCard [${type}]: Rendering EmptySupplierCard with props:`, emptyCardProps)
      return <EmptySupplierCard {...emptyCardProps} />
      
    case "selected":
      return <SelectedSupplierCard {...commonProps} />

    case "awaiting_response":
      return <AwaitingResponseSupplierCard {...commonProps} />

    case "confirmed":
      return <ConfirmedSupplierCard {...commonProps} />

    case "deposit_paid_confirmed":
      return <DepositPaidSupplierCard {...commonProps} />

    case "payment_confirmed":
      return <PaymentConfirmedSupplierCard {...commonProps} />

    case "declined":
      return <DeclinedSupplierCard {...commonProps} />

    default:
      return <SelectedSupplierCard {...commonProps} />
  }
}