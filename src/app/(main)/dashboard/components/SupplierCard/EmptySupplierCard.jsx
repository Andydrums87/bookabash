// EmptySupplierCard.jsx - UPDATE the component

"use client"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton" // ✅ Add this import
import { Plus, Sparkles, TrendingUp } from "lucide-react"
import { calculateFinalPrice } from '@/utils/unifiedPricing'


export default function EmptySupplierCard({
  type,
  recommendedSupplier,
  partyDetails,
  openSupplierModal,
  onAddSupplier,
  getSupplierDisplayName,
  currentPhase = "planning",
  isSignedIn = false,
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)


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

  // ✅ Show skeleton if not mounted OR no recommended supplier yet
  if (!isMounted || !recommendedSupplier) {
    return (
      <Card className="overflow-hidden rounded-2xl border-2 border-white shadow-xl h-80">
        <div className="relative h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        <div className="p-6 bg-white">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    )
  }

  // Show the recommended supplier (greyed out)
  return (
      <Card 
        className="overflow-hidden bg-gray-300 rounded-2xl border-2 border-gray-300 shadow-lg transition-all duration-300 relative group hover:shadow-xl hover:border-[hsl(var(--primary-400))] opacity-75 hover:opacity-90"
      >
        <div className="relative h-64 w-full">
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
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-800/50 to-gray-900/70" />

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
      <div className="p-6 ">
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
  )
}