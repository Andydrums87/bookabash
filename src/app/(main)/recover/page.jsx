"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { usePartyBuilder } from "@/utils/partyBuilderBackend"

export default function RecoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-[hsl(var(--primary-500))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Loading your party plan...</p>
        </div>
      </div>
    }>
      <RecoverContent />
    </Suspense>
  )
}

function RecoverContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { buildParty } = usePartyBuilder()
  const [status, setStatus] = useState("Building your party plan...")

  useEffect(() => {
    const recover = async () => {
      try {
        const partyDetails = {
          date: searchParams.get("date") || "",
          theme: searchParams.get("theme") || "general",
          guestCount: parseInt(searchParams.get("guests") || "15"),
          location: searchParams.get("postcode") || "",
          postcode: searchParams.get("postcode") || "",
          childName: searchParams.get("name") || "Your Child",
          childAge: parseInt(searchParams.get("age") || "6"),
          timeSlot: searchParams.get("timeslot") || "afternoon",
          duration: 2,
          time: searchParams.get("timeslot") === "morning" ? "11:00" : "14:00",
          startTime: searchParams.get("timeslot") === "morning" ? "11:00" : "14:00",
          hasOwnVenue: searchParams.get("ownvenue") === "true",
          source: "recovery_link",
          createdAt: new Date().toISOString(),
          timePreference: {
            type: "flexible",
            slot: searchParams.get("timeslot") || "afternoon",
            duration: 2,
            specificTime: null,
          },
        }

        // Save party details to localStorage
        localStorage.setItem("party_details", JSON.stringify(partyDetails))

        // Clear any stale plan
        localStorage.removeItem("user_party_plan")

        setStatus("Finding your suppliers...")

        // Build the party
        const result = await buildParty(partyDetails)

        if (result.success) {
          setStatus("Redirecting to your party plan...")

          // Small delay so user sees the success state
          setTimeout(() => {
            router.push("/dashboard")
          }, 500)
        } else {
          setStatus("Something went wrong — redirecting to dashboard...")
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        }
      } catch (error) {
        console.error("Recovery error:", error)
        setStatus("Something went wrong — redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    }

    recover()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(var(--primary-50))] to-white">
      <div className="text-center p-8">
        <div className="w-12 h-12 border-4 border-[hsl(var(--primary-500))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900">{status}</p>
        <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
      </div>
    </div>
  )
}
