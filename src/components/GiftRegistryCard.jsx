"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus, Sparkles, Heart, Loader2, Eye, Share2, ShoppingCart, TrendingUp, Users, X } from "lucide-react"
import Link from "next/link"
import { useGiftSuggestions } from "@/hooks/useGiftRegistry"

const GiftRegistryCard = ({ registry, registryItems, partyTheme, childAge, onCreateRegistry, onAddItem, loading }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addingItem, setAddingItem] = useState(null)

  // Load theme-based suggestions
  const { suggestions, loading: suggestionsLoading } = useGiftSuggestions(partyTheme, childAge, null)

  const handleAddSuggestion = async (suggestion) => {
    setAddingItem(suggestion.id)
    try {
      await onAddItem(suggestion.id, {
        priority: "medium",
      })
    } finally {
      setAddingItem(null)
    }
  }

  const hasItems = registryItems && registryItems.length > 0
  const topSuggestions = suggestions.slice(0, 3)
  const claimedItems = registryItems?.filter((item) => item.is_claimed).length || 0
  const completionRate = hasItems ? Math.round((claimedItems / registryItems.length) * 100) : 0

  if (loading) {
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
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753218318/rom7mfgtgwoey4zu6xoj.jpg"
          alt="Gift Registry"
          className="w-full h-full object-cover"
        />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-purple-500 text-white border-0">
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

        {/* Close/X Button (matching your supplier cards) */}
        {registry && (
          <button className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <CardContent className="p-6">
        {!registry ? (
          // No registry created yet
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Registry</h3>
              <p className="text-gray-600">Help guests know what to bring!</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Gift className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-900">Perfect Timing!</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                While suppliers prepare quotes, create your gift registry. When you send invites, guests will know exactly what to bring! 🎁
              </p>
            </div>

            <Button
              onClick={onCreateRegistry}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
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
          // Registry created but no items
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Registry Created! 🎉</h3>
              <p className="text-gray-600">Now add some gift ideas to help your guests</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl" asChild>
                <Link href={`/gift-registry/${registry.id}/create`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Gift Ideas
                </Link>
              </Button>

              {topSuggestions.length > 0 && (
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  disabled={suggestionsLoading}
                >
                  {suggestionsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Quick Add
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Quick suggestions */}
            {showSuggestions && topSuggestions.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 text-sm">Perfect for {partyTheme}:</span>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {topSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{suggestion.name}</p>
                        <p className="text-purple-600 font-bold text-sm">
                          {suggestion.price ? `£${suggestion.price}` : suggestion.price_range}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddSuggestion(suggestion)}
                        disabled={addingItem === suggestion.id}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        {addingItem === suggestion.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Registry with items
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Registry Ready! 🎉</h3>
              <p className="text-gray-600">
                {registryItems.length} gift{registryItems.length > 1 ? "s" : ""} added • Ready to share with guests
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Guest Claims Progress</span>
                <span>{completionRate}% claimed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

           

            {/* Action buttons matching supplier card style */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                size="sm"
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs"
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