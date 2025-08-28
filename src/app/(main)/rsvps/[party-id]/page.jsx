// app/(main)/dashboard/[party-id]/rsvps/page.jsx
"use client"

import { useParams } from "next/navigation"
import RSVPManagementPage from "../components/RSVPManagementPage"

export default function RSVPPage() {
  const params = useParams()
  const partyId = params["party-id"]

  return (
    <RSVPManagementPage 
      partyId={partyId} 
      onBack={() => {}}
      skipDataLoading={true} // Pass this prop to disable loading
    />
  )
}