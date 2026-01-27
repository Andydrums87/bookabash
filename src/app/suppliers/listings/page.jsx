"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Building2, Loader2, Trash2, X, Settings, Cake, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBusiness } from "@/contexts/BusinessContext"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Check if the primary business is a cake supplier
function isCakeSupplier(businesses) {
  const primaryBusiness = businesses?.find(b => b.is_primary || b.isPrimary)
  if (!primaryBusiness) return false
  const category = (primaryBusiness.serviceType || primaryBusiness.data?.serviceType || primaryBusiness.data?.category || '').toLowerCase()
  return category === 'cakes' || category === 'cake'
}

// Get the primary business (for cake suppliers, this is the business shell)
function getPrimaryBusiness(businesses) {
  return businesses?.find(b => b.is_primary || b.isPrimary)
}

// Get cake products (non-primary businesses for cake suppliers)
function getCakeProducts(businesses) {
  return businesses?.filter(b => !b.is_primary && !b.isPrimary) || []
}

// Get business image helper
function getBusinessImage(business) {
  const coverPhoto = business.data?.coverPhoto
  const portfolioImages = business.data?.portfolioImages || []
  const firstPortfolioImage = portfolioImages[0]?.url || portfolioImages[0]
  return coverPhoto || firstPortfolioImage || null
}

// Format category to be singular and capitalized
function formatCategory(serviceType) {
  if (!serviceType) return "Service type not set"

  // Normalize to lowercase for comparison
  const normalized = serviceType.toLowerCase().trim()

  // Map plural/lowercase to proper singular form
  const categoryMap = {
    'venues': 'Venue',
    'venue': 'Venue',
    'entertainment': 'Entertainment',
    'catering': 'Catering',
    'cakes': 'Cake',
    'cake': 'Cake',
    'decorations': 'Decoration',
    'decoration': 'Decoration',
    'photography': 'Photography',
    'activities': 'Activity',
    'activity': 'Activity',
    'party bags': 'Party Bags',
    'partybags': 'Party Bags',
    'balloons': 'Balloons',
    'balloon': 'Balloons',
  }

  return categoryMap[normalized] || serviceType.charAt(0).toUpperCase() + serviceType.slice(1)
}

// Action Modal - Airbnb style
function ListingActionModal({ business, isOpen, onClose, onEdit, onRemove, removing, isCake }) {
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
                {isCake ? (
                  <Cake className="w-8 h-8 text-gray-300" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-300" />
                )}
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="text-center mb-6">
            <h3 className="font-semibold text-gray-900">
              {business.name || (isCake ? "Untitled cake" : "Untitled business")}
            </h3>
            {!isCake && (
              <p className="text-gray-500 text-sm mt-0.5">
                {formatCategory(business.serviceType)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onEdit}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium"
              disabled={removing}
            >
              {hasCompletedOnboarding
                ? (isCake ? "Edit cake" : "Edit listing")
                : "Continue setup"
              }
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
              {removing ? "Removing..." : (isCake ? "Remove cake" : "Remove listing")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Business card component - Airbnb style
function BusinessCard({ business, onSelect, onClick, isCake }) {
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

  // Get price range for cakes from packages
  const getPriceRange = () => {
    const packages = business.data?.packages || []
    if (packages.length === 0) return null
    const prices = packages.map(p => p.price).filter(p => p > 0)
    if (prices.length === 0) return null
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return `£${min}`
    return `£${min} - £${max}`
  }

  const priceRange = isCake ? getPriceRange() : null

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
            {isCake ? (
              <Cake className="w-16 h-16 text-gray-300" />
            ) : (
              <Building2 className="w-16 h-16 text-gray-300" />
            )}
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
          {business.name || (isCake ? "Untitled cake" : "Untitled business")}
        </h3>
        {isCake ? (
          // For cakes, show price range instead of category
          priceRange && (
            <p className="text-gray-500 mt-0.5">{priceRange}</p>
          )
        ) : (
          <p className="text-gray-500 mt-0.5">
            {formatCategory(business.serviceType)}
          </p>
        )}
      </div>
    </div>
  )
}

// Empty state
function EmptyState({ onCreateClick, isCake }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-[hsl(var(--primary-50))] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-[hsl(var(--primary-200))]">
        {isCake ? (
          <Cake className="w-10 h-10 text-[hsl(var(--primary-300))]" />
        ) : (
          <Building2 className="w-10 h-10 text-[hsl(var(--primary-300))]" />
        )}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {isCake ? "No cakes yet" : "No businesses yet"}
      </h2>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {isCake
          ? "Add your first cake to start receiving orders from customers."
          : "Create your first business listing to start receiving bookings."
        }
      </p>
      <Button onClick={onCreateClick} className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white rounded-full px-6">
        <Plus className="w-4 h-4 mr-2" />
        {isCake ? "Add Cake" : "Create a listing"}
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
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Check if this is a cake supplier
  const isCake = isCakeSupplier(businesses)
  const primaryBusiness = getPrimaryBusiness(businesses)

  // For cake suppliers, only show products (non-primary), not the business shell
  const baseBusinesses = isCake ? getCakeProducts(businesses) : businesses

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    if (!baseBusinesses || isCake) return []
    const categories = baseBusinesses
      .map(b => b.serviceType || b.data?.serviceType || b.data?.category)
      .filter(Boolean)
      .map(c => c.toLowerCase().trim())
    return [...new Set(categories)]
  }, [baseBusinesses, isCake])

  // Apply category filter
  const displayedBusinesses = useMemo(() => {
    if (!baseBusinesses) return []
    if (categoryFilter === "all" || isCake) return baseBusinesses
    return baseBusinesses.filter(b => {
      const category = (b.serviceType || b.data?.serviceType || b.data?.category || '').toLowerCase().trim()
      return category === categoryFilter
    })
  }, [baseBusinesses, categoryFilter, isCake])

  // Navigate to onboarding wizard for creating new listing
  const handleCreateNewListing = () => {
    if (isCake) {
      // For cake suppliers, add a new cake product
      router.push('/suppliers/onboarding/new-supplier?newBusiness=true&productType=cake')
    } else {
      router.push('/suppliers/onboarding/new-supplier?newBusiness=true')
    }
  }

  // Navigate to business settings for cake suppliers
  const handleOpenSettings = () => {
    if (primaryBusiness) {
      router.push(`/suppliers/listings/${primaryBusiness.id}?settings=true`)
    }
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
          <div>
            {isCake ? (
              <>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                  {primaryBusiness?.name || primaryBusiness?.data?.businessName || "Your cake business"}
                </h1>
                <p className="text-gray-500 mt-1">
                  {displayedBusinesses?.length || 0} {displayedBusinesses?.length === 1 ? "cake" : "cakes"}
                </p>
              </>
            ) : (
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {businesses?.length === 1 ? "Your listing" : "Your listings"}
                </h1>
                {categoryFilter !== "all" && (
                  <p className="text-gray-500 mt-1">
                    Showing {displayedBusinesses?.length || 0} of {baseBusinesses?.length || 0} listings
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Category filter - only show if not cake supplier and has multiple categories */}
            {!isCake && uniqueCategories.length > 1 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 w-auto min-w-[160px] border-[hsl(var(--primary-200))] rounded-xl px-4">
                  <Filter className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/* Settings button - only for cake suppliers */}
            {isCake && (
              <button
                onClick={handleOpenSettings}
                className="h-11 px-4 border border-[hsl(var(--primary-200))] rounded-xl hover:bg-[hsl(var(--primary-50))] transition-colors flex items-center justify-center"
                title="Business Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Add button */}
            {isCake ? (
              <button
                onClick={handleCreateNewListing}
                className="h-11 flex items-center gap-2 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Cake
              </button>
            ) : (
              <button
                onClick={handleCreateNewListing}
                className="h-11 flex items-center gap-2 px-4 border border-[hsl(var(--primary-200))] rounded-xl hover:bg-[hsl(var(--primary-50))] transition-colors font-medium text-gray-700"
              >
                <Plus className="w-4 h-4" />
                Create new listing
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {/* For cake suppliers, show empty state if no products (even if primary exists) */}
        {(isCake ? baseBusinesses.length === 0 : (!businesses || businesses.length === 0)) ? (
          <EmptyState onCreateClick={handleCreateNewListing} isCake={isCake} />
        ) : displayedBusinesses.length === 0 ? (
          // No results for current filter
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No {formatCategory(categoryFilter).toLowerCase()} listings
            </h2>
            <p className="text-gray-500 mb-6">
              Try selecting a different category filter.
            </p>
            <Button
              onClick={() => setCategoryFilter("all")}
              variant="outline"
              className="rounded-full px-6"
            >
              Show all listings
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onClick={handleCardClick}
                isCake={isCake}
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
        isCake={isCake}
      />
    </div>
  )
}
