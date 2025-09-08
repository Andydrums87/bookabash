
"use client"

import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { useBusiness } from "@/contexts/BusinessContext"
import AvailabilityContent from "./AvailabilityContent" // or wherever this is

export default function AvailabilityPage() {
  // Use the same hooks as your profile page
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()
  const { currentBusiness: businessFromContext, getPrimaryBusiness, businesses } = useBusiness()

  const primaryBusiness = getPrimaryBusiness()

  return (
    <AvailabilityContent 
      supplier={supplier}
      supplierData={supplierData}
      setSupplierData={setSupplierData}
      loading={loading}
      error={error}
      refresh={refresh}
      currentBusiness={currentBusiness || businessFromContext}
      primaryBusiness={primaryBusiness}
      businesses={businesses}
    />
  )
}