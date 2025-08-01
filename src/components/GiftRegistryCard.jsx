"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus, Sparkles, Heart, Loader2, Eye, Share2, ShoppingCart, TrendingUp, Users, X } from "lucide-react"
import Link from "next/link"
import { useGiftRegistry } from "@/hooks/useGiftRegistry"

const GiftRegistryCard = ({ registry, registryItems, partyTheme, childAge, partyId, partyDetails, loading: externalLoading }) => {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  
  // Get the createRegistry function from the hook
  const { createRegistry } = useGiftRegistry(partyId)
  
  const hasItems = registryItems && registryItems.length > 0
  const claimedItems = registryItems?.filter((item) => item.is_claimed).length || 0
  const completionRate = hasItems ? Math.round((claimedItems / registryItems.length) * 100) : 0

  const handleCreateRegistry = async () => {
    setIsCreating(true)
    try {
      console.log('🎯 Creating registry for party:', partyId)
      
      const result = await createRegistry({
        title: `${partyDetails?.childName || 'Birthday'} Party Gift Registry`,
        description: `Gift registry for ${partyDetails?.childName}'s ${partyTheme || 'themed'} party`,
        theme: partyTheme?.toLowerCase(),
        child_age: childAge || 6
      })
      
      console.log('📝 Create registry result:', result)
      
      if (result.success && result.registry) {
        console.log('✅ Navigating to:', `/gift-registry/${result.registry.id}/create`)
        router.push(`/gift-registry/${result.registry.id}/create`)
      } else {
        console.error('❌ Failed to create registry:', result.error)
        alert('Failed to create gift registry. Please try again.')
      }
    } catch (error) {
      console.error('💥 Error:', error)
      alert('Failed to create gift registry. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  if (externalLoading) {
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
          {hasItems && (
            <Badge className="bg-green-500 text-white border-0">
              ✓ Ready
            </Badge>
          )}
          {!registry && (
            <Badge className="bg-orange-500 text-white border-0">
              New
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
      </div>

      <CardContent className="p-6">
        {!registry || !hasItems ? (
          // No registry or no items - simple create/add flow
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {!registry ? "Create Gift Registry" : "Add Gift Ideas"}
              </h3>
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
              onClick={handleCreateRegistry}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-400))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white rounded-xl"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  {!registry ? "Create Gift Registry" : "Add Gift Ideas"}
                </>
              )}
            </Button>
          </>
        ) : (
          // Registry with items - simple management
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Registry Ready! 🎉</h3>
              <p className="text-gray-600">
                {registryItems.length} gift{registryItems.length > 1 ? "s" : ""} added • Ready to share
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-400))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white rounded-xl text-xs"
                asChild
              >
                <Link href={`/gift-registry/${registry.id}/create`}>
                  <Eye className="w-3 h-3 mr-1" />
                  View & Edit
                </Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-xs"
                asChild
              >
                <Link href={`/gift-registry/${registry.id}/preview`}>
                  <Users className="w-3 h-3 mr-1" />
                  Guest View
                </Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl text-xs"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Gift Registry",
                      url: `${window.location.origin}/gift-registry/${registry.id}/preview`,
                    })
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/gift-registry/${registry.id}/preview`)
                  }
                }}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default GiftRegistryCard