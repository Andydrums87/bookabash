// components/SupplierQuickViewModal.jsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, MapPin, Star, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Import the swipeable carousel
import SwipeableSupplierCarousel from '@/components/supplier/SwipableSupplierCarousel'

// Import service display components
import ServiceDetailsDisplayRouter from '@/components/supplier/display/ServiceDetailsDisplayRouter'
import PersonalBioDisplay from '@/components/supplier/display/PersonalBioDisplay'

export default function SupplierQuickViewModal({
  supplier,
  isOpen,
  onClose,
  type // Keep type for the badge display
}) {
  const [fullSupplier, setFullSupplier] = useState(null)
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false)

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch full supplier data when modal opens
  useEffect(() => {
    const fetchFullSupplierData = async () => {
      if (!isOpen || !supplier?.id) {
        setFullSupplier(null)
        return
      }

      setIsLoadingSupplier(true)
      try {
        const { suppliersAPI } = await import('@/utils/mockBackend')
        const fullData = await suppliersAPI.getSupplierById(supplier.id)
        setFullSupplier(fullData)
      } catch (error) {
        console.error('❌ Error fetching full supplier data:', error)
        // Fallback to the supplier data we have
        setFullSupplier(supplier)
      } finally {
        setIsLoadingSupplier(false)
      }
    }

    fetchFullSupplierData()
  }, [isOpen, supplier?.id, supplier])

  if (!isOpen || !supplier) return null

  // Use fullSupplier when available, fallback to supplier
  const displaySupplier = fullSupplier || supplier

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-5xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ COMPACT HEADER WITH CAROUSEL - Smaller on mobile */}
        <div className="relative flex-shrink-0 h-48 sm:h-64 md:h-80">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-500"
          >
            <X className="w-4 h-4 text-gray-800" />
          </button>

          {/* Supplier Badge */}
          {/* <div className="absolute top-2 left-2 z-20">
            <Badge className="bg-primary-500 text-white shadow-lg text-xs">
              {type?.charAt(0).toUpperCase() + type?.slice(1)}
            </Badge>
          </div> */}

          {/* ✅ CAROUSEL INSTEAD OF STATIC IMAGE */}
          <div className="relative w-full h-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
            <SwipeableSupplierCarousel
              supplier={displaySupplier}
              className="h-full"
              aspectRatio="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Supplier name overlay on carousel */}
          <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-lg line-clamp-1">
              {displaySupplier.name}
            </h2>
            <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-white/90 mt-1">
              {displaySupplier.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{displaySupplier.location}</span>
                </div>
              )}
              {displaySupplier.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{displaySupplier.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ MAXIMUM HEIGHT: Scrollable Content Area - Less padding on mobile */}
        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4" style={{ minHeight: 0 }}>
          {/* Supplier Details - No tabs needed, just show content */}
          <div className="space-y-4">
            {isLoadingSupplier ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading full details...</p>
                </div>
              </div>
            ) : (
              <>
                {/* What's Included Section - FIRST */}
                {(() => {
                  // Try multiple sources for package data
                  const packageData = displaySupplier?.packageData ||
                                     displaySupplier?.selectedPackage ||
                                     displaySupplier?.packages?.[0]

                  // Try multiple sources for features
                  let packageFeatures = []

                  if (packageData?.features && Array.isArray(packageData.features)) {
                    packageFeatures = packageData.features
                  } else if (packageData?.description && typeof packageData.description === 'string') {
                    packageFeatures = packageData.description.split('\n').filter(f => f.trim())
                  } else if (packageData?.included && Array.isArray(packageData.included)) {
                    packageFeatures = packageData.included
                  }

                  // Only hide if we truly have no package data at all
                  if (packageFeatures.length === 0 && !packageData) return null

                  return (
                    <div className="mb-6">
                      <h3 className="text-base font-bold text-gray-900 mb-3">What's Included</h3>
                      {packageData?.name && (
                        <p className="text-xs text-gray-600 mb-3">{packageData.name}</p>
                      )}

                      {packageFeatures.length > 0 ? (
                        <ul className="space-y-1.5 pl-4">
                          {packageFeatures.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-600">
                          Package details will be shown after you customize this supplier.
                        </p>
                      )}
                    </div>
                  )
                })()}

                {/* Service Details Router */}
                <ServiceDetailsDisplayRouter
                  supplier={displaySupplier}
                  isPreview={false}
                />
              </>
            )}
          </div>
        </div>

        {/* ✅ COMPACT: Sticky Footer - Less padding on mobile */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2 sm:p-3 flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-semibold text-sm py-3"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}