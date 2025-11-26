"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, LayoutGrid, Building2, Loader2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBusiness } from "@/contexts/BusinessContext"
import Image from "next/image"

// Get business image helper
function getBusinessImage(business) {
  const coverPhoto = business.data?.coverPhoto
  const portfolioImages = business.data?.portfolioImages || []
  const firstPortfolioImage = portfolioImages[0]?.url || portfolioImages[0]
  return coverPhoto || firstPortfolioImage || null
}

// Action Modal - Airbnb style
function ListingActionModal({ business, isOpen, onClose, onEdit, onRemove, removing }) {
  if (!business) return null

  const imageUrl = getBusinessImage(business)
  const hasCompletedOnboarding = business.data?.onboardingCompleted || business.data?.isComplete

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Content */}
        <div className="pt-14 pb-6 px-6">
          {/* Thumbnail */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={business.name || "Business"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="text-center mb-6">
            <h3 className="font-semibold text-gray-900">
              {business.name || "Untitled business"}
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">
              {business.serviceType || "Service type not set"}
              {business.theme && ` · ${business.theme}`}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onEdit}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium"
              disabled={removing}
            >
              {hasCompletedOnboarding ? "Edit listing" : "Continue setup"}
            </Button>

            <button
              onClick={onRemove}
              disabled={removing}
              className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 py-3 font-medium transition-colors disabled:opacity-50"
            >
              {removing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {removing ? "Removing..." : "Remove listing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Business card component - Airbnb style
function BusinessCard({ business, onSelect, onClick }) {
  const imageUrl = getBusinessImage(business)
  const hasImage = !!imageUrl

  // Determine status based on profile_status column from database
  const getStatus = () => {
    const profileStatus = business.profile_status
    const canGoLive = business.can_go_live
    const hasCompletedOnboarding = business.data?.onboardingCompleted || business.data?.isComplete

    // If onboarding not complete, show setup incomplete
    if (!hasCompletedOnboarding) {
      return { label: "Setup incomplete", color: "bg-amber-500" }
    }

    // Check profile_status from database - live when profile_status is 'live' AND can_go_live is true
    if (profileStatus === 'live' && canGoLive) {
      return { label: "Listed", color: "bg-green-500" }
    }

    if (profileStatus === 'under_review' || profileStatus === 'pending_review') {
      return { label: "Under review", color: "bg-yellow-500" }
    }

    // Draft or any other status
    return { label: "Draft", color: "bg-gray-400" }
  }

  const status = getStatus()

  return (
    <div
      onClick={() => onClick(business)}
      className="cursor-pointer group"
    >
      {/* Image - Fully rounded like Airbnb */}
      <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden relative mb-3">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={business.name || "Business"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Building2 className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium shadow-sm">
            <span className={`w-2 h-2 rounded-full ${status.color}`} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Business Info - Below image like Airbnb */}
      <div>
        <h3 className="font-semibold text-gray-900">
          {business.name || "Untitled business"}
        </h3>
        <p className="text-gray-500 mt-0.5">
          {business.serviceType || "Service type not set"}
          {business.theme && ` · ${business.theme}`}
        </p>
      </div>
    </div>
  )
}

// Empty state
function EmptyState({ onCreateClick }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-[hsl(var(--primary-50))] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-[hsl(var(--primary-200))]">
        <Building2 className="w-10 h-10 text-[hsl(var(--primary-300))]" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No businesses yet</h2>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Create your first business listing to start receiving bookings.
      </p>
      <Button onClick={onCreateClick} className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white rounded-full px-6">
        <Plus className="w-4 h-4 mr-2" />
        Create a listing
      </Button>
    </div>
  )
}

export default function ListingsPage() {
  const router = useRouter()
  const {
    businesses,
    currentBusiness,
    switchBusiness,
    createNewBusiness,
    deleteBusiness,
    loading,
  } = useBusiness()

  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [removing, setRemoving] = useState(false)

  // Navigate to onboarding wizard for creating new listing
  const handleCreateNewListing = () => {
    router.push('/suppliers/onboarding/new-supplier?newBusiness=true')
  }

  const handleCardClick = (business) => {
    setSelectedBusiness(business)
  }

  const handleCloseActionModal = () => {
    if (!removing) {
      setSelectedBusiness(null)
    }
  }

  const handleEditBusiness = async () => {
    if (!selectedBusiness) return

    // Check if onboarding is completed
    const hasCompletedOnboarding = selectedBusiness.data?.onboardingCompleted || selectedBusiness.data?.isComplete

    if (!hasCompletedOnboarding) {
      // Redirect to wizard to complete onboarding first
      router.push(`/suppliers/onboarding/new-supplier?businessId=${selectedBusiness.id}`)
    } else {
      // Navigate to the listing management page
      router.push(`/suppliers/listings/${selectedBusiness.id}`)
    }
  }

  const handleRemoveBusiness = async () => {
    if (!selectedBusiness || !deleteBusiness) return

    const confirmed = window.confirm(
      `Are you sure you want to remove "${selectedBusiness.name || "this listing"}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setRemoving(true)
    try {
      await deleteBusiness(selectedBusiness.id)
      setSelectedBusiness(null)
    } catch (error) {
      console.error("Failed to remove business:", error)
      alert("Failed to remove listing: " + error.message)
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-3" />
                  <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {businesses?.length === 1 ? "Your listing" : "Your listings"}
          </h1>

          <div className="flex items-center gap-2">
            {/* View toggle - future feature */}
            <button className="p-2.5 border border-[hsl(var(--primary-200))] rounded-xl hover:bg-[hsl(var(--primary-50))] hidden sm:flex transition-colors">
              <LayoutGrid className="w-5 h-5 text-gray-600" />
            </button>

            {/* Add button */}
            <button
              onClick={handleCreateNewListing}
              className="p-2.5 border border-[hsl(var(--primary-200))] rounded-xl hover:bg-[hsl(var(--primary-50))] transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!businesses || businesses.length === 0 ? (
          <EmptyState onCreateClick={handleCreateNewListing} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Action Modal */}
      <ListingActionModal
        business={selectedBusiness}
        isOpen={!!selectedBusiness}
        onClose={handleCloseActionModal}
        onEdit={handleEditBusiness}
        onRemove={handleRemoveBusiness}
        removing={removing}
      />
    </div>
  )
}
