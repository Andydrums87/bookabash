// SupplierCard.jsx - PASS isCompact PROP TO EmptySupplierCard
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
  // Props for recommended suppliers
  recommendedSupplier,
  onAddSupplier,
  isCompact = false, // ✅ NEW PROP
  onCustomizationComplete, // ✅ NEW PROP - handler for customization
  // Props for venue browsing
  showBrowseVenues = false,
  onBrowseVenues
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
      card.style.transform = 'scale(0.95)'
      card.style.transition = 'transform 0.1s ease'
      
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
    if (!supplier) {
      console.log(`🔴 SupplierCard [${type}]: No supplier, returning "empty"`)
      return "empty"
    }
    
    // Find the SPECIFIC enquiry for THIS supplier type
    const enquiry = enquiries.find(e => e.supplier_category === type)
    
    console.log(`🔍 SupplierCard [${type}]: Enquiry check:`, {
      hasEnquiry: !!enquiry,
      status: enquiry?.status,
      paymentStatus: enquiry?.payment_status,
      supplierResponseDate: enquiry?.supplier_response_date,
      supplierResponse: enquiry?.supplier_response
    })
    
    // If no enquiry exists for this supplier type, it's just selected
    if (!enquiry) {
      console.log(`🟡 SupplierCard [${type}]: No enquiry found - returning "selected"`)
      return isSignedIn ? "selected" : "selected"
    }
    
    // Get the specific payment status for THIS enquiry
    const thisSupplierPaymentStatus = enquiry.payment_status
    const enquiryStatus = enquiry.status
    const isAutoAccepted = enquiry.auto_accepted
    const supplierManuallyAccepted = enquiry.supplier_response_date && 
                                    enquiry.supplier_response &&
                                    !enquiry.supplier_response.includes('Auto-')
    
    // Handle declined enquiries first
    if (enquiryStatus === "declined") {
      console.log(`🔴 SupplierCard [${type}]: Status = declined`)
      return "declined"
    }
    
    // PAYMENT FLOW: Only check payment if enquiry is accepted
    if (enquiryStatus === "accepted") {
      console.log(`🟢 SupplierCard [${type}]: Status = accepted, checking payment...`)
      
      // If paid + supplier manually confirmed = PAYMENT_CONFIRMED  
      if (thisSupplierPaymentStatus === "paid" && supplierManuallyAccepted) {
        console.log(`✅ SupplierCard [${type}]: PAYMENT_CONFIRMED (paid + manual confirm)`)
        return "payment_confirmed"
      }
      
      // If paid but no manual confirmation yet = DEPOSIT_PAID_CONFIRMED
      if (thisSupplierPaymentStatus === "paid" && !supplierManuallyAccepted) {
        console.log(`💰 SupplierCard [${type}]: DEPOSIT_PAID_CONFIRMED (paid, no manual confirm)`)
        return "deposit_paid_confirmed"  
      }
      
      // If accepted but not paid = CONFIRMED
      if (thisSupplierPaymentStatus !== "paid") {
        console.log(`🟡 SupplierCard [${type}]: CONFIRMED (accepted, not paid)`)
        return "confirmed"
      }
    }
    
    // ENQUIRY FLOW: Handle pending enquiries
    if (enquiryStatus === "pending") {
      console.log(`⏳ SupplierCard [${type}]: AWAITING_RESPONSE (pending)`)
      return "awaiting_response"
    }
    
    console.log(`🔵 SupplierCard [${type}]: Defaulting to "selected"`)
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
        const parsedAddons = JSON.parse(enquiry.addon_details)
        enquiryAddons = Array.isArray(parsedAddons) ? parsedAddons : []
      } catch (error) {
        console.error(`Error parsing addon_details for ${type}:`, error)
        
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
    totalPrice: pricing.finalPrice,
    onCustomize: (type, supplier) => {
      console.log('Customize clicked for:', type, supplier.name)
    },
    onAddSupplier: onAddSupplier,
    onCustomizationComplete: onCustomizationComplete,
    showBrowseVenues: showBrowseVenues,
    onBrowseVenues: onBrowseVenues
  }

  // Debug log to verify prop is received
  if (supplier) {
    console.log(`🔧 SupplierCard [${type}]: onCustomizationComplete prop`, {
      isDefined: !!onCustomizationComplete,
      supplierName: supplier.name
    })
  }

  // ✅ Props specific to EmptySupplierCard - INCLUDING isCompact
  const emptyCardProps = {
    type,
    openSupplierModal,
    getSupplierDisplayName,
    currentPhase,
    isSignedIn,
    partyDetails,
    recommendedSupplier: recommendedSupplier,
    onAddSupplier: onAddSupplier,
    isCompact: isCompact // ✅ PASS IT HERE
  }

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