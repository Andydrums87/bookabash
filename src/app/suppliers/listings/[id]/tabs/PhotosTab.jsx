"use client"

// Import the existing media page content
import dynamic from "next/dynamic"

const MediaPageContent = dynamic(
  () => import("@/app/suppliers/media/page"),
  { ssr: false, loading: () => <div className="p-6 text-gray-500">Loading...</div> }
)

export default function PhotosTab({ business }) {
  return (
    <div>
      <MediaPageContent />
    </div>
  )
}
