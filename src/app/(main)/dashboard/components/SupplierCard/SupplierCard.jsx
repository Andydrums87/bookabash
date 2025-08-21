"use client"
import EmptySupplierCard from './EmptySupplierCard'
import SelectedSupplierCard from './SelectedSupplierCard'
import AwaitingResponseSupplierCard from './AwaitingResponseSupplierCard'
import ConfirmedSupplierCard from './ConfirmedSupplierCard'
import PaymentConfirmedSupplierCard from './PaymentConfirmedSupplierCard'
import DeclinedSupplierCard from './DeclinedSupplierCard'


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
  // Skip e-invites entirely - they're handled separately
  if (type === "einvites") {
    return null
  }

  // Determine supplier state
  const getSupplierState = () => {
    if (!supplier) return "empty"
    
    // Find the enquiry for this specific supplier
    const enquiry = enquiries.find(e => e.supplier_category === type)
    const thisSupplierPaymentStatus = enquiry?.payment_status
    
    // FIXED: Only show payment_confirmed if THIS supplier was actually paid
    if (enquiryStatus === "accepted" && thisSupplierPaymentStatus === "paid") {
      return "payment_confirmed"
    }
    
    if (!isSignedIn) return "selected"
    
    switch (enquiryStatus) {
      case "pending": return "awaiting_response"
      case "accepted": return "confirmed"  // Accepted but not paid yet
      case "declined": return "declined"
      default: return "selected"
    }
  }

  const supplierState = getSupplierState()

  // ✅ FIXED: Enhanced addon collection that includes enquiry addons
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
    supplier: {
      ...supplier,
      totalPrice // Add calculated total price
    },
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
    handleCancelEnquiry
  }

  // Enhanced debug logging
  const enquiry = enquiries.find(e => e.supplier_category === type)


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

    case "payment_confirmed":
      return <PaymentConfirmedSupplierCard {...commonProps} />

    case "declined":
      return <DeclinedSupplierCard {...commonProps} />

    default:
      return <SelectedSupplierCard {...commonProps} />
  }
}