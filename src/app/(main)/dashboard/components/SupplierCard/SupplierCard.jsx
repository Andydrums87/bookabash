// SupplierCard.jsx - Fixed state logic for proper card flow
"use client"
import { useRouter } from 'next/navigation'
import EmptySupplierCard from './EmptySupplierCard'
import SelectedSupplierCard from './SelectedSupplierCard'
import AwaitingResponseSupplierCard from './AwaitingResponseSupplierCard'
import ConfirmedSupplierCard from './ConfirmedSupplierCard'
import PaymentConfirmedSupplierCard from './PaymentConfirmedSupplierCard'
import DeclinedSupplierCard from './DeclinedSupplierCard'
import DepositPaidSupplierCard from './DepositPaidSupplierCard'

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
  handleCancelEnquiry
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
  if (!supplier) return "empty"
  
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
  
  console.log(`🔍 Supplier ${supplier.name} (${type}) state check:`, {
    enquiryId: enquiry.id,
    enquiryStatus: enquiryStatus,
    paymentStatus: thisSupplierPaymentStatus,
    isAutoAccepted,
    supplierManuallyAccepted,
    supplierResponse: enquiry.supplier_response
  })

  // Handle declined enquiries first
  if (enquiryStatus === "declined") {
    console.log(`❌ ${supplier.name}: DECLINED`)
    return "declined"
  }
  
  // PAYMENT FLOW: Only check payment if enquiry is accepted
  if (enquiryStatus === "accepted") {
    
    // If paid + supplier manually confirmed = PAYMENT_CONFIRMED  
    if (thisSupplierPaymentStatus === "paid" && supplierManuallyAccepted) {
      console.log(`✅ ${supplier.name}: PAYMENT_CONFIRMED (paid + manually confirmed)`)
      return "payment_confirmed"
    }
    
    // If paid but no manual confirmation yet = DEPOSIT_PAID_CONFIRMED
    if (thisSupplierPaymentStatus === "paid" && !supplierManuallyAccepted) {
      console.log(`💳 ${supplier.name}: DEPOSIT_PAID_CONFIRMED (paid but awaiting confirmation)`)
      return "deposit_paid_confirmed"  
    }
    
    // If accepted but not paid = CONFIRMED
    if (thisSupplierPaymentStatus !== "paid") {
      console.log(`⏰ ${supplier.name}: CONFIRMED (accepted, awaiting payment)`)
      return "confirmed"
    }
  }
  
  // ENQUIRY FLOW: Handle pending enquiries
  if (enquiryStatus === "pending") {
    console.log(`⏳ ${supplier.name}: AWAITING_RESPONSE`)
    return "awaiting_response"
  }
  
  // DEFAULT: Supplier is selected but no enquiry sent yet
  console.log(`📝 ${supplier.name}: SELECTED`)
  return "selected"
}

  const supplierState = getSupplierState()

  // ✅ Enhanced addon collection that includes enquiry addons
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
        console.error(`❌ Error parsing addon_details for ${type}:`, error)
        
        // Fallback: try to get addon IDs and reconstruct
        if (enquiry.addon_ids) {
          try {
            const addonIds = JSON.parse(enquiry.addon_ids)
            // You might need to fetch addon details by IDs here
            // For now, we'll create basic addon objects
            enquiryAddons = addonIds.map(id => ({
              id,
              name: `Addon ${id}`,
              price: 0 // You'll need to fetch actual price
            }))
          } catch (idError) {
            console.error(`❌ Error parsing addon_ids for ${type}:`, idError)
          }
        }
      }
    }
    
    // Method 2: Get add-ons from global addons array (for standalone add-ons)
    const globalAddons = addons.filter((addon) => {
      // Match by supplier ID or supplier type
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

  const getTotalPrice = () => {
    if (!supplier) return 0
    
    let basePrice = supplier.price || 0
    
    // For party bags, multiply by guest count
    if (supplier.category === 'Party Bags' || type === 'partyBags') {
      const pricePerBag = supplier.packageData?.basePrice || supplier.pricePerBag || supplier.price || 5.00
      
      let guestCount = 10; // Default fallback
      
      // Try to get guest count from partyDetails first (works for both dashboards)
      if (partyDetails?.guestCount && partyDetails.guestCount > 0) {
        guestCount = parseInt(partyDetails.guestCount)
      }
      // Fallback: try localStorage (for localStorage dashboard)
      else if (typeof window !== 'undefined') {
        try {
          const storedPartyDetails = localStorage.getItem('party_details')
          if (storedPartyDetails) {
            const parsed = JSON.parse(storedPartyDetails)
            if (parsed.guestCount && parsed.guestCount > 0) {
              guestCount = parseInt(parsed.guestCount)
            }
          }
        } catch (error) {
          console.warn('Could not get guest count from localStorage:', error)
        }
      }
      
      basePrice = pricePerBag * guestCount
      
      console.log(`Party bag calculation for ${supplier.name}:`, {
        pricePerBag,
        guestCount,
        totalPrice: basePrice
      })
    }
    
    const addonsPrice = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
    
    return basePrice + addonsPrice
  }

  const totalPrice = getTotalPrice()
  
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)

  const commonProps = {
    type,
    supplier,
    addons: supplierAddons, // ← Fix: ConfirmedSupplierCard expects 'addons' not 'supplierAddons'
    isLoading,
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
    onClick: handleCardClick
  }

  // Enhanced debug logging
  const enquiry = enquiries.find(e => e.supplier_category === type)
  console.log(`🎯 Rendering ${supplierState} card for ${supplier?.name || type}`)

  // Render the appropriate card component based on state
  switch (supplierState) {
    case "empty":
      return <EmptySupplierCard {...commonProps} />
      
    case "selected":
      return <SelectedSupplierCard {...commonProps} />

    case "awaiting_response":
      return <AwaitingResponseSupplierCard {...commonProps} />

    case "confirmed":
      return <ConfirmedSupplierCard  {...commonProps}  />

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