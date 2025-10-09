"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, X, ChevronDown, ChevronUp, Info, Users, Eye } from "lucide-react"
import MicroConfettiWrapper from "@/components/animations/MicroConfettiWrapper"
import { useCheckIfNewlyAdded } from "@/hooks/useCheckIfNewlyAdded"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Import unified pricing system
import { calculateFinalPrice, requiresAdditionalEntertainers, getAdditionalEntertainerInfo } from '@/utils/unifiedPricing'

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
  onClick
}) {
  const router = useRouter()
  const [showAddons, setShowAddons] = useState(false)

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
  
  // Check if additional entertainers are required
  const guestCount = partyDetails?.guestCount || 10
  const needsAdditionalEntertainers = supplier && requiresAdditionalEntertainers(supplier, guestCount)
  const entertainerInfo = needsAdditionalEntertainers ? getAdditionalEntertainerInfo(supplier, guestCount) : null
  
  const hasAddons = addons && addons.length > 0
  const cakeCustomization = supplier?.packageData?.cakeCustomization
  const isCakeSupplier = !!cakeCustomization || type === 'cakes'

  // Show duration info if supplier has extra hour rates and duration > 2 hours
  const showDurationInfo = !!(
    (supplier?.extraHourRate || supplier?.serviceDetails?.extraHourRate) &&
    partyDetails?.duration && 
    partyDetails.duration > 2 &&
    pricing.breakdown.extraHours > 0
  )

  // Show weekend info if weekend premium was applied
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
          <div className="relative h-64 w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <div className="absolute inset-0">
                  <Image
                    src={supplier.image || supplier.imageUrl || `/placeholder.svg`}
                    alt={supplier.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

                <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${typeConfig.color} text-white shadow-lg backdrop-blur-sm`}>
                      {typeConfig.icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                    <Badge className="bg-primary-500 text-white  shadow-lg backdrop-blur-sm">
                      Selected
                    </Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSupplier(type)
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {(isCakeSupplier || type === 'cakes') && (
                  <div className="absolute bottom-4 right-4 z-10">
                    <Badge className="bg-[hsl(var(--primary-500))] text-white shadow-lg backdrop-blur-sm">
                      🎂 {supplier.packageData?.name || 'Custom Cake'} 
                      {cakeCustomization?.flavorName && ` • ${cakeCustomization.flavorName}`}
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
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
                                  className="cursor-help hover:scale-110 transition-transform"
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
                    <Gift className="w-4 h-4 text-[hsl(var(--primary-600))]" />
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

            <Button
              className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation()
                if (supplier?.id) {
                  router.push(`/supplier/${supplier.id}?from=dashboard`)
                }
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
      </MicroConfettiWrapper>
    </TooltipProvider>
  )
}