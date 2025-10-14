// SelectedSupplierCard.jsx - FIXED with carousel
"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, X, Clock, Users, Star, ChevronDown, ChevronUp, Info, Eye, MoreVertical, Trash2, Wand2 } from "lucide-react"
import { calculateFinalPrice, requiresAdditionalEntertainers, getAdditionalEntertainerInfo } from '@/utils/unifiedPricing'
import MicroConfettiWrapper from "@/components/animations/MicroConfettiWrapper"
import SupplierCustomizationModal from "@/components/SupplierCustomizationModal"
import { useCheckIfNewlyAdded } from "@/hooks/useCheckIfNewlyAdded"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ✅ Import carousel
import SwipeableSupplierCarousel from '@/components/supplier/SwipableSupplierCarousel'

// ✅ Import the modal
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"

export default function SelectedSupplierCard({
  type,
  supplier,
  addons = [],
  partyDetails,
  isLoading,
  isDeleting,
  openSupplierModal,
  handleDeleteSupplier,
  handleRemoveAddon,
  getSupplierDisplayName,
  onClick,
  onCustomize,
  onAddSupplier
}) {
  const [showAddons, setShowAddons] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showQuickViewModal, setShowQuickViewModal] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [fullSupplierData, setFullSupplierData] = useState(null)

  // ✅ Function to fetch full supplier data with packages
  const fetchFullSupplierData = async () => {
    if (!supplier?.id) return

    try {
      console.log('🔍 Fetching full supplier data for:', supplier.name)
      
      const { suppliersAPI } = await import('@/utils/mockBackend')
      const fullSupplier = await suppliersAPI.getSupplierById(supplier.id)
      
      console.log('📦 Full supplier data:', {
        name: fullSupplier.name,
        hasPackages: !!fullSupplier.packages,
        packageCount: fullSupplier.packages?.length || 0,
        packages: fullSupplier.packages
      })
      
      setFullSupplierData(fullSupplier)
      setShowCustomizationModal(true)
      
    } catch (error) {
      console.error('❌ Error fetching supplier data:', error)
      setFullSupplierData(supplier)
      setShowCustomizationModal(true)
    }
  }

  const isNewlyAdded = useCheckIfNewlyAdded(type, !!supplier)

  const handleAnimationComplete = () => {
    console.log(`Animation completed for ${supplier?.name || type}`)
  }

  const getDisplayName = (supplierType) => {
    if (getSupplierDisplayName) {
      return getSupplierDisplayName(supplierType)
    }
    const displayNames = {
      venue: "Venue",
      entertainment: "Entertainment", 
      catering: "Catering",
      cakes: "Cakes",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      partyBags: "Party Bags",
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  // Calculate fresh pricing
  const pricing = useMemo(() => {
    if (!supplier) {
      return { finalPrice: 0, breakdown: {}, details: {} }
    }
    return calculateFinalPrice(supplier, partyDetails, addons)
  }, [supplier, partyDetails, addons, type])
  
  const displayPrice = pricing.finalPrice
  
  const guestCount = partyDetails?.guestCount || 10
  const needsAdditionalEntertainers = supplier && requiresAdditionalEntertainers(supplier, guestCount)
  const entertainerInfo = needsAdditionalEntertainers ? getAdditionalEntertainerInfo(supplier, guestCount) : null
  
  const hasAddons = addons && addons.length > 0
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization || type === 'cakes'

  const showDurationInfo = !!(
    (supplier?.extraHourRate || supplier?.serviceDetails?.extraHourRate) &&
    partyDetails?.duration && 
    partyDetails.duration > 2 &&
    pricing.breakdown.extraHours > 0
  )

  const showWeekendInfo = pricing.details?.isWeekend && pricing.breakdown?.weekend > 0

  const getTypeConfig = (supplierType) => {
    const configs = {
      venue: { color: "bg-blue-500", icon: "🏛️" },
      entertainment: { color: "bg-purple-500", icon: "🎭" },
      catering: { color: "bg-orange-500", icon: "🍽️" },
      cakes: { color: "bg-pink-500", icon: "🎂" },
      facePainting: { color: "bg-green-500", icon: "🎨" },
      activities: { color: "bg-yellow-500", icon: "🎪" },
      decorations: { color: "bg-indigo-500", icon: "🎈" },
      balloons: { color: "bg-cyan-500", icon: "🎈" },
      partyBags: { color: "bg-red-500", icon: "🎁" }
    }
    return configs[supplierType] || { color: "bg-gray-500", icon: "📦" }
  }

  const typeConfig = getTypeConfig(type)

  return (
    <TooltipProvider>
      <MicroConfettiWrapper 
        isNewlyAdded={isNewlyAdded}
        onAnimationComplete={handleAnimationComplete}>
        <Card onClick={onClick} className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 relative ${isDeleting ? "opacity-50 scale-95" : ""}`}>
          
          {/* Image Section - Static Image Only */}
          <div className="relative h-64 w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                {/* Static Image */}
                <div className="absolute inset-0">
                  <Image
                    src={supplier.coverPhoto || supplier.image || supplier.imageUrl || '/placeholder.png'}
                    alt={supplier.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${typeConfig.color} text-white shadow-lg backdrop-blur-sm`}>
                      {typeConfig.icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                    <Badge className="bg-primary-500 text-white shadow-lg backdrop-blur-sm">
                      Selected
                    </Badge>
                  </div>
                  
                  {/* Three-dots menu */}
                  <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(!showMenu)
                        }}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg z-30"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-48 bg-white shadow-xl border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowQuickViewModal(true)
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          fetchFullSupplierData()
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Customize</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSupplier(type)
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Cake badge */}
                {(isCakeSupplier || type === 'cakes') && (
                  <div className="absolute bottom-4 right-4 z-20">
                    <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg backdrop-blur-sm">
                      🎂 {supplier.packageData?.name || 'Custom Cake'} 
                      {cakeCustomization?.flavorName && ` • ${cakeCustomization.flavorName}`}
                    </Badge>
                  </div>
                )}

                {/* Supplier info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                      {supplier.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black drop-shadow-lg">£{displayPrice}</span>
                          
                          {needsAdditionalEntertainers && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="cursor-help hover:scale-110 transition-transform z-30"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="max-w-xs p-4 bg-white text-gray-900 shadow-xl border border-gray-200 z-50"
                                sideOffset={5}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    <span className="font-semibold text-sm">Additional Entertainer Required</span>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>For {guestCount} guests, this entertainer requires {entertainerInfo.count} additional entertainer{entertainerInfo.count > 1 ? 's' : ''} to ensure quality entertainment.</div>
                                    <div className="border-t pt-2 mt-2">
                                      <div className="flex justify-between">
                                        <span>Base package:</span>
                                        <span>£{pricing.breakdown.base}</span>
                                      </div>
                                      <div className="flex justify-between text-orange-600 font-medium">
                                        <span>+{entertainerInfo.count} entertainer{entertainerInfo.count > 1 ? 's' : ''}:</span>
                                        <span>£{entertainerInfo.totalCost}</span>
                                      </div>
                                      {pricing.breakdown.addons > 0 && (
                                        <div className="flex justify-between">
                                          <span>Add-ons:</span>
                                          <span>£{pricing.breakdown.addons}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                                        <span>Total:</span>
                                        <span>£{displayPrice}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        
                        {(showDurationInfo || showWeekendInfo) && !needsAdditionalEntertainers && (
                          <div className="text-xs text-white/90 mt-1 drop-shadow">
                             £{pricing.breakdown.base}
                            {showWeekendInfo && ` + Weekend £${pricing.breakdown.weekend}`}
                            {showDurationInfo && ` + ${pricing.details.extraHours}h £${pricing.breakdown.extraHours}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom section with addons */}
          <div className="p-6 bg-white">
            {hasAddons && (
              <div className="mb-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAddons(!showAddons)
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[hsl(var(--primary-50))] to-white rounded-xl border border-[hsl(var(--primary-100))] hover:from-[hsl(var(--primary-100))] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                    <span className="font-bold text-gray-500 text-xs">
                      Selected Add-ons ({addons.length})
                    </span>
                  </div>
                  {showAddons ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {showAddons && (
                  <div className="mt-3 space-y-3 animate-in slide-in-from-top duration-200">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 ml-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{addon.name}</p>
                          <p className="text-xs text-gray-600 truncate">{addon.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-bold text-[hsl(var(--primary-600))]">£{addon.price}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveAddon(addon.id)
                            }}
                            className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View Details button */}
            <Button
              className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation()
                setShowQuickViewModal(true)
              }}
              disabled={isDeleting}
              size="lg"
              data-tour={`view-supplier-${type}`}
            >
              {isDeleting ? "Removing..." : (
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>View Details</span>
                </div>
              )}
            </Button>
          </div>
        </Card>

        {/* Quick View Modal */}
        <SupplierQuickViewModal
          supplier={supplier}
          isOpen={showQuickViewModal}
          onClose={() => setShowQuickViewModal(false)}
          onAddSupplier={onAddSupplier}
          partyDetails={partyDetails}
          type={type}
        />
        
        {/* Customization Modal */}
        <SupplierCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          supplier={supplier}
          onAddToPlan={(data) => {
            console.log('🎨 Customization completed:', data)
            setShowCustomizationModal(false)
          }}
          isAdding={false}
          currentPhase="planning"
          partyDetails={partyDetails}
          selectedDate={partyDetails?.date}
          partyDate={partyDetails?.date}
        />
      </MicroConfettiWrapper>
    </TooltipProvider>
  )
}