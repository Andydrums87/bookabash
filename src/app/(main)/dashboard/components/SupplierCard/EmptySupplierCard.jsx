// EmptySupplierCard.jsx - WITH COMPACT MODE

"use client"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Sparkles, TrendingUp, Eye } from "lucide-react"
import { calculateFinalPrice } from '@/utils/unifiedPricing'
import SupplierQuickViewModal from "@/components/SupplierQuickViewModal"


export default function EmptySupplierCard({
  type,
  recommendedSupplier,
  partyDetails,
  openSupplierModal,
  onAddSupplier,
  getSupplierDisplayName,
  currentPhase = "planning",
  isSignedIn = false,
  isCompact = false, // ✅ NEW PROP
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const router = useRouter()


  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddToParty = async (e) => {
    e.stopPropagation()
    if (!recommendedSupplier || isAdding) return
    
    console.log('🎯 [EmptySupplierCard] Starting to add supplier...', recommendedSupplier.name)
    setIsAdding(true)
    
    try {
      console.log('📞 [EmptySupplierCard] Calling onAddSupplier...')
      await onAddSupplier(type, recommendedSupplier)
      
      console.log('✅ [EmptySupplierCard] onAddSupplier completed!')
      
    } catch (error) {
      console.error('❌ [EmptySupplierCard] Error adding supplier:', error)
      setIsAdding(false)
    }
  }

  const getDisplayName = (supplierType) => {
    if (getSupplierDisplayName) {
      return getSupplierDisplayName(supplierType)
    }
    const displayNames = {
      venue: "Venue",
      entertainment: "Entertainment", 
      catering: "Catering",
      facePainting: "Face Painting",
      activities: "Activities",
      decorations: "Decorations",
      balloons: "Balloons",
      cakes: "Cakes",
      partyBags: "Party Bags",
    }
    return displayNames[supplierType] || supplierType.charAt(0).toUpperCase() + supplierType.slice(1)
  }

  // Calculate pricing for the recommended supplier
  const pricing = useMemo(() => {
    if (!recommendedSupplier) return { finalPrice: 0 }
    return calculateFinalPrice(recommendedSupplier, partyDetails, [])
  }, [recommendedSupplier, partyDetails])

  const getPhaseContent = () => {
    switch (currentPhase) {
      case "planning":
        return {
          badgeText: "Recommended",
          badgeClass: "bg-amber-500 text-white",
          buttonText: `Snap Me Up!`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "Snappy's top pick for your party!"
        }
      
      case "awaiting_responses":
        return {
          badgeText: "Add to Party",
          badgeClass: "bg-blue-500 text-white",
          buttonText: `Add ${getDisplayName(type)}`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "One-click to add this great option!"
        }
      
      case "confirmed":
        return {
          badgeText: "Available",
          badgeClass: "bg-green-500 text-white", 
          buttonText: `Add ${getDisplayName(type)}`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "Expand your party with this supplier"
        }
      
      default:
        return {
          badgeText: "Recommended",
          badgeClass: "bg-amber-500 text-white",
          buttonText: `Add ${getDisplayName(type)}`,
          buttonIcon: <Plus className="w-5 h-5 mr-2" />,
          subtitle: "Click to add to your party!"
        }
    }
  }

  const phaseContent = getPhaseContent()

  // ✅ Compact skeleton
  if (!isMounted || !recommendedSupplier) {
    return (
      <Card className={`overflow-hidden rounded-2xl border-2 border-white shadow-xl ${
        isCompact ? 'h-48' : 'h-80'
      }`}>
        <div className={`relative w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${
          isCompact ? 'h-32' : 'h-64'
        }`} />
        <div className={`bg-white ${isCompact ? 'p-3' : 'p-6'}`}>
          <div className={`bg-gray-200 rounded animate-pulse ${
            isCompact ? 'h-8' : 'h-12'
          }`} />
        </div>
      </Card>
    )
  }

  // ✅ Compact mode - shorter card
  if (isCompact) {
    return (
      <>
        <Card 
          className="overflow-hidden bg-gray-300 rounded-xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-primary-400 opacity-75 hover:opacity-90 h-56"
        >
          <div className="relative h-36 w-full">
            {/* Supplier Image */}
            <div className="absolute inset-0">
              <Image
                src={recommendedSupplier.image || recommendedSupplier.imageUrl || `/placeholder.svg`}
                alt={recommendedSupplier.name}
                fill
                className="object-cover grayscale-[30%] opacity-70 group-hover:grayscale-[30%] group-hover:opacity-60 transition-all"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/80" />

            {/* Eye icon */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQuickView(true)
              }}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
              title="View details"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>

            {/* Category badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-gray-900 text-white text-xs shadow-lg">
                {getDisplayName(type)}
              </Badge>
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-sm font-bold text-white/90 truncate drop-shadow-lg">
                {recommendedSupplier.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-black text-white/90 drop-shadow-lg">
                  £{pricing.finalPrice}
                </span>
                {recommendedSupplier.rating && (
                  <span className="text-xs text-white/70">
                    ⭐ {recommendedSupplier.rating}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Compact button */}
          <div className="p-3">
            <Button
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white text-sm py-2 shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleAddToParty}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <div className="relative w-4 h-4 mr-2">
                    <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="animate-pulse text-xs">Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Add</span>
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Quick View Modal */}
        <SupplierQuickViewModal
          supplier={recommendedSupplier}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          onAddSupplier={onAddSupplier}
          partyDetails={partyDetails}
          type={type}
        />
      </>
    )
  }

  // ✅ Full size mode - taller image
  return (
    <>
      <Card 
        className="overflow-hidden bg-gray-300 rounded-2xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-primary-400 opacity-75 hover:opacity-90 max-w-md mx-auto"
      >
        <div className="relative h-80 w-full">
          {/* Supplier Image with grey overlay */}
          <div className="absolute inset-0">
            <Image
              src={recommendedSupplier.image || recommendedSupplier.imageUrl || `/placeholder.svg`}
              alt={recommendedSupplier.name}
              fill
              className="object-cover grayscale-[30%] opacity-70 group-hover:grayscale-[30%] group-hover:opacity-60 transition-all"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Much darker overlay for strong greyed effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/80" />

          {/* Eye icon in top-right to view details */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowQuickView(true)
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
            title="View supplier details"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>

          {/* Minimal badge - just category */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-gray-900 text-white shadow-lg backdrop-blur-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>

          {/* Supplier info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="text-white/90">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-lg text-white/80">
                {recommendedSupplier.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black drop-shadow-lg">
                      £{pricing.finalPrice}
                    </span>
                    {recommendedSupplier.rating && (
                      <span className="text-sm text-white/70">
                        ⭐ {recommendedSupplier.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with single CTA */}
        <div className="p-6">
          <Button
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
            onClick={handleAddToParty}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <div className="relative w-5 h-5 mr-2">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="animate-pulse">Adding to your party...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Click to Add
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Quick View Modal */}
      <SupplierQuickViewModal
        supplier={recommendedSupplier}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddSupplier={onAddSupplier}
        partyDetails={partyDetails}
        type={type}
      />
    </>
  )
}