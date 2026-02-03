"use client"

import SupportWidget from "./SupportWidget"
import BudgetControls from "@/components/budget-controls"
import ReferFriend from "@/components/ReferFriend"

export default function SimplifiedSidebar({
  partyData,
  isPaymentConfirmed,
  budgetControlProps,
}) {
  if (!partyData) return null

  return (
    <div className="space-y-4 sticky top-4 mt-6">
      {/* Budget/Party Total - only show before payment is confirmed */}
      {!isPaymentConfirmed && budgetControlProps && (
        <BudgetControls {...budgetControlProps} />
      )}

      {/* Refer a Friend */}
      <ReferFriend />

      {/* Support Widget */}
      <SupportWidget />
    </div>
  )
}
