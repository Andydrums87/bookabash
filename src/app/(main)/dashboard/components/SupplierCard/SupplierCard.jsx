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

  const getSupplierState = () => {
    if (!supplier) return "empty"
    
    // Find the enquiry for this supplier
    const enquiry = enquiries.find(e => e.supplier_category === type)
    const thisSupplierPaymentStatus = enquiry?.payment_status
    const isAutoAccepted = enquiry?.auto_accepted
    const supplierManuallyAccepted = enquiry?.supplier_response_date && enquiry?.supplier_response
    
    console.log(`🔍 Supplier ${supplier.name} state check:`, {
      enquiryStatus,
      thisSupplierPaymentStatus,
      isAutoAccepted,
      supplierManuallyAccepted,
      enquiryId: enquiry?.id,
      supplierResponseDate: enquiry?.supplier_response_date,
      supplierResponse: enquiry?.supplier_response
    })

    // ✅ CORRECTED LOGIC: The proper flow
    
    // Handle declined auto-accepted enquiries (hide them)
    if (isAutoAccepted && enquiryStatus === "declined") {
      console.log(`🚫 ${supplier.name}: Hiding declined auto-accepted enquiry`)
      return "deposit_paid_confirmed" // Show as confirmed while handling replacement
    }
    
    // 1. PAYMENT_CONFIRMED: Supplier manually accepted + paid
    //    This is when supplier has responded to a deposit-paid booking
    if (enquiryStatus === "accepted" && 
        thisSupplierPaymentStatus === "paid" && 
        supplierManuallyAccepted &&
        !enquiry?.supplier_response?.includes('Auto-')) {
      console.log(`✅ ${supplier.name}: PAYMENT_CONFIRMED (supplier manually confirmed + paid)`)
      return "payment_confirmed"
    }
    
    // 2. DEPOSIT_PAID_CONFIRMED: Auto-accepted + paid but supplier hasn't manually confirmed
    //    This means customer used instant booking, paid, but supplier hasn't responded yet
    if (enquiryStatus === "accepted" && 
        thisSupplierPaymentStatus === "paid" && 
        (!supplierManuallyAccepted || enquiry?.supplier_response?.includes('Auto-'))) {
      console.log(`💳 ${supplier.name}: DEPOSIT_PAID_CONFIRMED (deposit paid, awaiting supplier confirmation)`)
      return "deposit_paid_confirmed"
    }
    
    // 3. CONFIRMED: Accepted but not paid yet (either auto or manual)
    //    This is when enquiry is accepted but customer hasn't paid deposit
    if (enquiryStatus === "accepted" && 
        (thisSupplierPaymentStatus === "unpaid" || !thisSupplierPaymentStatus)) {
      console.log(`⏰ ${supplier.name}: CONFIRMED (accepted but not paid)`)
      return "confirmed"
    }
    
    // Handle other states
    if (!isSignedIn) return "selected"
    
    switch (enquiryStatus) {
      case "pending": 
        console.log(`⏳ ${supplier.name}: AWAITING_RESPONSE`)
        return "awaiting_response"
      case "declined": 
        console.log(`❌ ${supplier.name}: DECLINED`)
        return "declined"
      default: 
        console.log(`📝 ${supplier.name}: SELECTED (default)`)
        return "selected"
    }
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
      const pricePerBag = supplier.packageData?.basePrice || supplier.price || 5.00
      const guestCount = partyDetails?.guestCount || 10
      basePrice = pricePerBag * guestCount
    }
    
    const addonsPrice = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
    
    return basePrice + addonsPrice
  }

  const totalPrice = getTotalPrice()
  
  const isLoading = loadingCards.includes(type)
  const isDeleting = suppliersToDelete.includes(type)

  // Common props that all cards need
  const commonProps = {
    type,
    supplier,
    supplierAddons,
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