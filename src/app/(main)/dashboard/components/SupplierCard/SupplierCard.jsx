"use client"
import EmptySupplierCard from './EmptySupplierCard'
import SelectedSupplierCard from './SelectedSupplierCard'
import AwaitingResponseSupplierCard from './AwaitingResponseSupplierCard'
import ConfirmedSupplierCard from './ConfirmedSupplierCard'
import PaymentConfirmedSupplierCard from './PaymentConfirmedSupplierCard'
import DeclinedSupplierCard from './DeclinedSupplierCard'

export default function SupplierCard({
  type,
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

  // Enhanced debug logging
  const enquiry = enquiries.find(e => e.supplier_category === type)


  const supplierAddons = addons.filter((addon) => addon.supplierId === supplier?.id)
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
    onPaymentReady
  }

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