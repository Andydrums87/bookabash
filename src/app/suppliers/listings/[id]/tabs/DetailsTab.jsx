"use client"

// Import the existing profile page content
// We're embedding the existing working page here
import dynamic from "next/dynamic"

// Dynamically import to avoid SSR issues
const ProfilePageContent = dynamic(
  () => import("@/app/suppliers/profile/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading...</div> }
)

export default function DetailsTab({ business }) {
  return (
    <div>
      <ProfilePageContent />
    </div>
  )
}
