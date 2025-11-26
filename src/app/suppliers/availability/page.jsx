
"use client"

import { useEffect } from "react"
import { useSupplier } from "@/hooks/useSupplier"
import { useSupplierDashboard } from "@/utils/mockBackend"
import { useBusiness } from "@/contexts/BusinessContext"
import AvailabilityContent from "./AvailabilityContent" // or wherever this is

export default function AvailabilityPage() {
  const { supplier, supplierData, setSupplierData, loading, error, refresh, currentBusiness } = useSupplier()
  const { saving, updateProfile } = useSupplierDashboard()
  const { currentBusiness: businessFromContext, getPrimaryBusiness, businesses, refreshBusinesses } = useBusiness()

   // 🔧 Force fresh business data on mount
   useEffect(() => {
    refreshBusinesses()
  }, [])

  const rawPrimaryBusiness = getPrimaryBusiness()
  
  // 🔧 FIX: Extract the actual supplier data from the primary business
  const primaryBusiness = rawPrimaryBusiness ? {
    id: rawPrimaryBusiness.id,
    auth_user_id: rawPrimaryBusiness.auth_user_id,  // ← Add this
    isPrimary: true,
    data: rawPrimaryBusiness.data || rawPrimaryBusiness.supplierData?.data || {}
  } : null

  console.log('🔍 Primary business data for availability:', {
    id: primaryBusiness?.id,
    name: primaryBusiness?.data?.name,
    unavailableDatesCount: primaryBusiness?.data?.unavailableDates?.length || 0,
    googleCalendarConnected: primaryBusiness?.data?.googleCalendarSync?.connected
  })

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
      updateProfile={updateProfile}
      saving={saving}
    />
  )
}