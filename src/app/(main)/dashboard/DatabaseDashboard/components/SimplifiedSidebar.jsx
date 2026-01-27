"use client"

import SnappysPresentParty from "./SnappysPresentParty"
import BudgetControls from "@/components/budget-controls"
import ReferFriend from "@/components/ReferFriend"

export default function SimplifiedSidebar({
  partyData,
  suppliers,
  enquiries,
  onPaymentReady,
  totalOutstandingCost,
  outstandingSuppliers,
  isPaymentConfirmed,
  budgetControlProps,
}) {
  if (!partyData) return null

  const hasUnpaidAcceptedSuppliers = enquiries.some(e =>
    e.status === 'accepted' && e.payment_status === 'unpaid'
  )

  const actuallyPaymentComplete = !hasUnpaidAcceptedSuppliers
  const shouldShowPaymentCTA = hasUnpaidAcceptedSuppliers

  return (
    <div className="space-y-4 sticky top-4 mt-6">
      {/* Party Progress Widget */}
      <SnappysPresentParty
        suppliers={suppliers}
        enquiries={enquiries}
        timeRemaining={24}
        onPaymentReady={onPaymentReady}
        showPaymentCTA={shouldShowPaymentCTA}
        isPaymentComplete={actuallyPaymentComplete}
        totalOutstandingCost={totalOutstandingCost}
        outstandingSuppliers={outstandingSuppliers}
      />

      {/* Budget/Party Total - only show before payment is confirmed */}
      {!isPaymentConfirmed && budgetControlProps && (
        <BudgetControls {...budgetControlProps} />
      )}

      {/* Refer a Friend */}
      <ReferFriend />
    </div>
  )
}
