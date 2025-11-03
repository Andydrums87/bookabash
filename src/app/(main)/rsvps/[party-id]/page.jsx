// app/(main)/dashboard/[party-id]/rsvps/page.jsx
"use client"

import { useParams, useRouter } from "next/navigation"
import RSVPManagementPage from "../components/RSVPManagementPage"

export default function RSVPPage() {
  const params = useParams()
  const router = useRouter()
  const partyId = params["party-id"]

  return (
    <RSVPManagementPage
      partyId={partyId}
      onBack={() => router.push('/dashboard')}
      skipDataLoading={true} // Pass this prop to disable loading
    />
  )
}