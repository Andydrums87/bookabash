// app/(main)/dashboard/[party-id]/rsvps/page.jsx
"use client"

import { useParams, useRouter } from "next/navigation"
import RSVPManagementPage from "./RSVPManagementPage"

export default function RSVPMain() {
  const params = useParams()
  const router = useRouter()
  const partyId = params["party-id"]

  const handleBack = () => {
    router.push(`/dashboard`)  // Go back to dashboard, not /rsvps/
  }

  return (
    <RSVPManagementPage 
      partyId={partyId} 
      onBack={handleBack} 
    />
  )
}