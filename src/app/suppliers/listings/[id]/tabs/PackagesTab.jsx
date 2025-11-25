"use client"

// Import the existing packages page content
import dynamic from "next/dynamic"

const PackagesPageContent = dynamic(
  () => import("@/app/suppliers/packages/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading...</div> }
)

export default function PackagesTab({ business }) {
  return (
    <div>
      <PackagesPageContent />
    </div>
  )
}
