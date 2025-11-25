"use client"

// Import the existing verification page content
import dynamic from "next/dynamic"

const VerificationPageContent = dynamic(
  () => import("@/app/suppliers/verification/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading...</div> }
)

export default function VerificationTab({ business }) {
  return (
    <div>
      <VerificationPageContent />
    </div>
  )
}
