"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus, Sparkles, Heart, Loader2, Eye, Share2, ShoppingCart, TrendingUp, Users, X } from "lucide-react"
import Link from "next/link"
import { useGiftRegistry } from "@/hooks/useGiftRegistry"

const GiftRegistryCard = ({ partyTheme, childAge, partyId, partyDetails, loading: externalLoading }) => {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  
  // Use the hook to get the actual registry state
  const { 
    registry, 
    registryItems, 
    loading: registryLoading, 
    hasRegistry,
    createRegistry,
    refreshRegistry 
  } = useGiftRegistry(partyId)
  
  console.log('🎯 [GiftRegistryCard] Current state:', {
    partyId,
    hasRegistry,
    registryId: registry?.id,
    itemCount: registryItems?.length || 0,
    loading: registryLoading
  })
  
  const hasItems = registryItems && registryItems.length > 0
  const claimedItems = registryItems?.filter((item) => item.is_claimed).length || 0
  const completionRate = hasItems ? Math.round((claimedItems / registryItems.length) * 100) : 0

  const handleCreateOrNavigate = async () => {
    if (hasRegistry && registry) {
      // Registry exists - navigate to it
      console.log('✅ [GiftRegistryCard] Navigating to existing registry:', registry.id)
      router.push(`/gift-registry/${registry.id}/create`)
      return
    }

    // No registry - create new one
    setIsCreating(true)
    try {
      console.log('🎯 [GiftRegistryCard] Creating registry for party:', partyId)
      
      const result = await createRegistry({
        title: `${partyDetails?.childName || partyDetails?.child_name || 'Birthday'} Party Gift Registry`,
        description: `Gift registry for ${partyDetails?.childName || partyDetails?.child_name}'s ${partyTheme || 'themed'} party`,
        theme: partyTheme?.toLowerCase(),
        child_age: childAge || 6
      })
      
      console.log('📝 [GiftRegistryCard] Create registry result:', result)
      
      if (result.success && result.registry) {
        console.log('✅ [GiftRegistryCard] Navigating to new registry:', result.registry.id)
        router.push(`/gift-registry/${result.registry.id}/create`)
      } else {
        console.error('❌ [GiftRegistryCard] Failed to create registry:', result.error)
        alert('Failed to create gift registry. Please try again.')
      }
    } catch (error) {
      console.error('💥 [GiftRegistryCard] Error:', error)
      alert('Failed to create gift registry. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  // Show loading state
  if (externalLoading || registryLoading) {
    return (
      <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))]">
        <img 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753970180/iStock-2000435412-removebg_ewfzxs.png"
          alt="Gift Registry"
          className="w-full h-full object-cover"
        />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-primary-500 text-white border-0">
            Gift Registry
          </Badge>
          {hasRegistry && hasItems && (
            <Badge className="bg-green-500 text-white border-0">
              ✓ Ready
            </Badge>
          )}
          {hasRegistry && !hasItems && (
            <Badge className="bg-yellow-500 text-white border-0">
              Empty
            </Badge>
          )}
          {!hasRegistry && (
            <Badge className="bg-orange-500 text-white border-0">
              Create
            </Badge>
          )}
        </div>

        {/* Completion Percentage (if has items) */}
        {hasItems && (
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white font-bold text-lg">{completionRate}%</div>
            <div className="text-white/80 text-xs">Complete</div>
          </div>
        )}

        {/* Item count */}
        {hasRegistry && (
          <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white font-bold text-sm">{registryItems?.length || 0} items</div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {!hasRegistry ? (
          // No registry exists - show create option
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Gift Registry</h3>
              <p className="text-gray-600">Help guests know what to bring!</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Gift className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-gray-900">Why create a registry?</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                While suppliers confirm, set up your gift registry. When you send invites, guests will know exactly what to bring!
              </p>
            </div>

            <Button
              onClick={handleCreateOrNavigate}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-400))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white rounded-xl"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Registry...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Create Gift Registry
                </>
              )}
            </Button>
          </>
        ) : !hasItems ? (
          // Registry exists but no items - show add items
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registry Created! 🎉</h3>
              <p className="text-gray-600">Now add some gift ideas to help your guests.</p>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
             
                <p className="text-blue-700 text-sm">Your registry is ready! Add some gift ideas to get started.</p>
              </div>
            </div>

            <Button
              onClick={handleCreateOrNavigate}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-400))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Gift Ideas
            </Button>
          </>
        ) : (
          // Registry with items - show management options
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Registry Ready! 🎉</h3>
              <p className="text-gray-600">
                {registryItems.length} gift{registryItems.length > 1 ? "s" : ""} added • {claimedItems} claimed
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{registryItems.length}</div>
                <div className="text-xs text-blue-700">Items</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{claimedItems}</div>
                <div className="text-xs text-green-700">Claimed</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600">{completionRate}%</div>
                <div className="text-xs text-purple-700">Complete</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button
       
                className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-400))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white rounded-xl"
                onClick={handleCreateOrNavigate}
              >
                <Eye className="w-4 h-4 mr-2" />
                Manage Registry
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl text-sm"
                asChild
              >
                <Link href={`/gift-registry/${registry.id}`}>
                  <Users className="w-4 h-4 mr-2" />
                  Guest View
                </Link>
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl text-sm"
              onClick={() => {
                const shareUrl = `${window.location.origin}/gift-registry/${registry.id}`
                if (navigator.share) {
                  navigator.share({
                    title: `${partyDetails?.child_name || 'Birthday'} Party Gift Registry`,
                    url: shareUrl,
                  })
                } else {
                  navigator.clipboard.writeText(shareUrl)
                  alert('Registry link copied to clipboard!')
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Registry Link
            </Button>
          </>
        )}

     
      </CardContent>
    </Card>
  )
}

export default GiftRegistryCard