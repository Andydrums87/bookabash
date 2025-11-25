"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useBusiness } from "@/contexts/BusinessContext"

// Import the profile page content which has the sidebar with all sections
import DetailsTab from "./tabs/DetailsTab"

// Get business image helper
function getBusinessImage(business) {
  const coverPhoto = business?.data?.coverPhoto
  const portfolioImages = business?.data?.portfolioImages || []
  const firstPortfolioImage = portfolioImages[0]?.url || portfolioImages[0]
  return coverPhoto || firstPortfolioImage || null
}

export default function ListingManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { businesses, currentBusiness, switchBusiness, loading } = useBusiness()

  const [business, setBusiness] = useState(null)
  const [switching, setSwitching] = useState(false)

  // Find and switch to the business for this listing
  useEffect(() => {
    const loadBusiness = async () => {
      if (!params.id || loading) return

      const targetBusiness = businesses.find(b => b.id === params.id)

      if (!targetBusiness) {
        // Business not found, redirect to listings
        router.push("/suppliers/listings")
        return
      }

      setBusiness(targetBusiness)

      // Switch context to this business if needed
      if (currentBusiness?.id !== params.id) {
        setSwitching(true)
        try {
          await switchBusiness(params.id)
        } catch (error) {
          console.error("Failed to switch business:", error)
        } finally {
          setSwitching(false)
        }
      }
    }

    loadBusiness()
  }, [params.id, businesses, currentBusiness?.id, loading, router, switchBusiness])

  // Update local business state when currentBusiness changes
  useEffect(() => {
    if (currentBusiness?.id === params.id) {
      setBusiness(currentBusiness)
    }
  }, [currentBusiness, params.id])

  if (loading || !business) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
            <div className="flex gap-4 mb-8">
              <div className="h-16 w-16 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-96 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const imageUrl = getBusinessImage(business)

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 lg:px-8 py-4">
          {/* Back button and listing info row */}
          <div className="flex items-center gap-6">
            <Link
              href="/suppliers/listings"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to listings</span>
            </Link>

            <div className="h-6 w-px bg-gray-200" />

            {/* Listing info inline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={business.name || "Listing"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  {business.name || "Untitled listing"}
                </h1>
                <p className="text-xs text-gray-500">
                  {business.serviceType || "Service type not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Full profile page with sidebar */}
      <DetailsTab business={business} />
    </div>
  )
}
