// components/SupplierQuickViewModal.jsx
"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { X, MapPin, Clock, Users, Star, Phone, Mail, Calendar, CheckCircle, ChevronLeft, ChevronRight, Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculateFinalPrice } from '@/utils/unifiedPricing'

// Import the swipeable carousel
import SwipeableSupplierCarousel from '@/components/supplier/SwipableSupplierCarousel'

// Import service display components
import ServiceDetailsDisplayRouter from '@/components/supplier/display/ServiceDetailsDisplayRouter'
import PersonalBioDisplay from '@/components/supplier/display/PersonalBioDisplay'

export default function SupplierQuickViewModal({ 
  supplier, 
  isOpen, 
  onClose, 
  onAddSupplier,
  partyDetails,
  type 
}) {
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  const packages = useMemo(() => {
    if (!supplier) return []
    const pkgs = supplier.packages || []
    return Array.isArray(pkgs) ? pkgs : []
  }, [supplier])

  const effectivePackageId = useMemo(() => {
    return selectedPackageId || packages[0]?.id || null
  }, [selectedPackageId, packages])

  const selectedPackage = useMemo(() => {
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return null
    }
    return packages.find(pkg => pkg.id === effectivePackageId) || null
  }, [packages, effectivePackageId])
  
  const pricing = useMemo(() => {
    if (!selectedPackage || !supplier) {
      return { finalPrice: 0, breakdown: { weekend: 0 }, details: {} }
    }
    return calculateFinalPrice(
      { ...supplier, price: selectedPackage.price }, 
      partyDetails, 
      []
    )
  }, [supplier, selectedPackage, partyDetails])

  if (!isOpen || !supplier) return null

  const handleAddSupplier = async () => {
    if (!selectedPackage || isAdding) return
    
    setIsAdding(true)
    try {
      const supplierWithPackage = {
        ...supplier,
        packageData: selectedPackage,
        selectedPackageId: selectedPackage.id
      }
      
      await onAddSupplier(type, supplierWithPackage)
      onClose()
    } catch (error) {
      console.error('Error adding supplier:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ COMPACT HEADER WITH CAROUSEL */}
        <div className="relative flex-shrink-0 h-80">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-500"
          >
            <X className="w-4 h-4 text-gray-800" />
          </button>

          {/* Supplier Badge */}
          <div className="absolute top-2 left-2 z-20">
            <Badge className="bg-primary-500 text-white shadow-lg text-xs">
              {type?.charAt(0).toUpperCase() + type?.slice(1)}
            </Badge>
          </div>

          {/* ✅ CAROUSEL INSTEAD OF STATIC IMAGE */}
          <div className="relative w-full h-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
            <SwipeableSupplierCarousel 
              supplier={supplier}
              className="h-full"
              aspectRatio="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Supplier name overlay on carousel */}
          <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
            <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg line-clamp-1">
              {supplier.name}
            </h2>
            <div className="flex flex-wrap gap-2 text-xs text-white/90 mt-1">
              {supplier.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{supplier.location}</span>
                </div>
              )}
              {supplier.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{supplier.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ COMPACT: Tabs Navigation */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex">
            {/* <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Overview
            </button> */}
            {packages.length > 0 && (
              <button
                onClick={() => setActiveTab('packages')}
                className={`flex-1 px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'packages'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Packages ({packages.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Details
            </button>
          </div>
        </div>

        {/* ✅ MAXIMUM HEIGHT: Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ minHeight: 0 }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {supplier.description && (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {supplier.description}
                  </p>
                </div>
              )}

              {/* About Us Section */}
              {supplier.serviceDetails?.aboutUs && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-orange-600" />
                    About Us
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {supplier.serviceDetails.aboutUs}
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {packages.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{packages.length}</div>
                    <div className="text-xs text-blue-800">Package{packages.length !== 1 ? 's' : ''}</div>
                  </div>
                )}
                
                {supplier.serviceDetails?.experienceLevel && (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-green-600">Experience</div>
                    <div className="text-xs text-green-800 line-clamp-1">{supplier.serviceDetails.experienceLevel}</div>
                  </div>
                )}

                {supplier.serviceDetails?.ageGroups?.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-purple-600">Age Groups</div>
                    <div className="text-xs text-purple-800">{supplier.serviceDetails.ageGroups.length} ranges</div>
                  </div>
                )}

                {supplier.serviceDetails?.themes?.length > 0 && (
                  <div className="bg-pink-50 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-pink-600">Themes</div>
                    <div className="text-xs text-pink-800">{supplier.serviceDetails.themes.length} available</div>
                  </div>
                )}
              </div>

              {/* Key Highlights */}
              {(supplier.highlights || supplier.serviceDetails?.highlights)?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Key Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {(supplier.highlights || supplier.serviceDetails?.highlights || []).slice(0, 6).map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary-100 text-primary-700 text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Choose a Package
              </h3>
              
              {packages.length > 0 ? (
                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === effectivePackageId
                    const pkgPricing = calculateFinalPrice(
                      { ...supplier, price: pkg.price }, 
                      partyDetails || {}, 
                      []
                    )
                    
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`w-full relative p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                          </div>
                        )}
                        
                        <div className="pr-8">
                          <h4 className="font-bold text-gray-900 text-base mb-2">
                            {pkg.name}
                          </h4>
                          
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold text-primary-600">
                              £{pkg.price}
                            </span>
                            {pkg.duration && (
                              <span className="text-xs text-gray-500">
                                {pkg.duration}
                              </span>
                            )}
                          </div>

                          {pkg.features && pkg.features.length > 0 && (
                            <div className="space-y-1 mt-3">
                              {pkg.features.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                              {pkg.features.length > 3 && (
                                <p className="text-xs text-gray-500 italic ml-5">
                                  +{pkg.features.length - 3} more
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-600">No packages available for this supplier.</p>
                </div>
              )}
            </div>
          )}

          {/* Full Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Service Details Router */}
              <ServiceDetailsDisplayRouter 
                supplier={supplier}
                isPreview={false}
                hideAboutUs={true}
              />

              {/* Personal Bio */}
              {supplier.serviceDetails?.personalBio && (
                <PersonalBioDisplay 
                  personalBio={supplier.serviceDetails.personalBio}
                  supplierName={supplier.name}
                />
              )}
            </div>
          )}
        </div>

        {/* ✅ COMPACT: Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-sm py-2"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleAddSupplier}
            disabled={isAdding || !selectedPackage || packages.length === 0}
            className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2"
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                Add to Party
                {selectedPackage && (
                  <span className="ml-2">
                    • £{pricing.finalPrice}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}