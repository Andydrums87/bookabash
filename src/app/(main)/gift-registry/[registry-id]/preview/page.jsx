"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Gift,
  Heart,
  Star,
  Package,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Calendar,
  MapPin,
  User,
  ShoppingCart,
  ArrowLeft,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import ProductDetailModal from "../components/ProductDetailModal"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

export default function GiftRegistryPreview() {
  const params = useParams()
  const registryId = params["registry-id"]

  // State
  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState("")
  const [claimingItem, setClaimingItem] = useState(null)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Load registry data
  useEffect(() => {
    const loadRegistryData = async () => {
      try {
        console.log("Loading registry:", registryId)
        const result = await partyDatabaseBackend.getRegistryById(registryId)
        if (result.success && result.registry) {
          setRegistryData(result.registry)
          setRegistryItems(result.items || [])
          setShareUrl(window.location.href)
          console.log("Registry loaded:", result.registry)
        } else {
          console.error("Failed to load registry:", result.error)
        }
      } catch (error) {
        console.error("Error loading registry:", error)
      } finally {
        setLoading(false)
      }
    }

    if (registryId) {
      loadRegistryData()
    }
  }, [registryId])

  // Modal handlers
  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
  }

  // Claim item
  const handleClaimItem = async (item) => {
    if (!guestName.trim()) {
      alert("Please enter your name first")
      return
    }

    setClaimingItem(item.id)
    try {
      const result = await partyDatabaseBackend.claimRegistryItem(item.id, guestName.trim())
      if (result.success) {
        // Update the item in our local state
        setRegistryItems(prev => 
          prev.map(regItem => 
            regItem.id === item.id 
              ? { ...regItem, is_claimed: true, claimed_by: guestName.trim() }
              : regItem
          )
        )
        handleCloseModal()
      } else {
        console.error("Failed to claim item:", result.error)
        alert("Failed to claim item. Please try again.")
      }
    } catch (error) {
      console.error("Error claiming item:", error)
      alert("Failed to claim item. Please try again.")
    } finally {
      setClaimingItem(null)
    }
  }

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${registryData?.parties?.child_name}'s Gift Registry`,
          text: `Check out the gift registry for ${registryData?.parties?.child_name}'s ${registryData?.parties?.theme} party!`,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Share failed:", error)
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Helper functions
  const getItemName = (item) => {
    return item.gift_items?.name || item.custom_name || 'Unknown Item'
  }

  const getItemPrice = (item) => {
    if (item.gift_items?.price) return `£${item.gift_items.price}`
    if (item.gift_items?.price_range) return item.gift_items.price_range
    return item.custom_price || 'Price varies'
  }

  const getItemImage = (item) => {
    return item.external_image_url || item.gift_items?.image_url || '/placeholder-gift.jpg'
  }

  const getBuyUrl = (item) => {
    return item.external_buy_url || '#'
  }

  // Calculate stats
  const totalItems = registryItems.length
  const claimedItems = registryItems.filter(item => item.is_claimed).length
  const availableItems = totalItems - claimedItems

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift registry...</p>
        </div>
      </div>
    )
  }

  if (!registryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registry Not Found</h1>
          <p className="text-gray-600 mb-4">The gift registry you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const partyDetails = registryData.parties

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <ContextualBreadcrumb id={registryId} currentPage="Gift Registry Preview" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 {partyDetails?.child_name}'s Gift Registry
              </h1>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(partyDetails?.party_date).toLocaleDateString()}</span>
                </div>
                {partyDetails?.venue && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{partyDetails.venue}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>{partyDetails?.theme} Theme</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Registry
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className={copied ? "border-green-300 text-green-600" : "border-gray-300 text-gray-600"}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Guest Info Card */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-purple-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Join the Celebration!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Your Name
                    </label>
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name..."
                      className="border-purple-200 focus:border-purple-400"
                    />
                    <p className="text-xs text-purple-600 mt-1">
                      Enter your name to claim gifts
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Registry Stats */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Registry Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                      <div className="text-sm text-blue-800">Total Items</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{claimedItems}</div>
                      <div className="text-sm text-green-800">Claimed</div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{availableItems}</div>
                    <div className="text-sm text-purple-800">Available to Claim</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${totalItems > 0 ? (claimedItems / totalItems) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">How it works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Enter your name above</li>
                        <li>Browse the gift ideas</li>
                        <li>Click "I'll bring this!" on items you'd like to give</li>
                        <li>Purchase the gift from the provided link</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Party Description */}
            {partyDetails?.description && (
              <Card className="mb-8 border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About the Party</h2>
                  <p className="text-gray-700 leading-relaxed">{partyDetails.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Gift Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Gift Ideas</h2>
                <div className="text-sm text-gray-600">
                  {availableItems} of {totalItems} items available
                </div>
              </div>

              {registryItems.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {registryItems.map((item) => (
                    <GiftCard
                      key={item.id}
                      item={item}
                      onViewDetails={() => handleViewDetails(item)}
                      onClaim={() => handleClaimItem(item)}
                      guestName={guestName}
                      isClaimingDisabled={!guestName.trim() || item.is_claimed}
                      isClaiming={claimingItem === item.id}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No gifts added yet</h3>
                    <p className="text-gray-600">
                      The host is still adding items to this registry. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={showModal}
        onClose={handleCloseModal}
        onClaim={handleClaimItem}
        isClaimingDisabled={!guestName.trim()}
        guestName={guestName}
      />
    </div>
  )
}

// Gift Card Component
function GiftCard({ item, onViewDetails, onClaim, guestName, isClaimingDisabled, isClaiming }) {
  const getItemName = () => {
    return item.gift_items?.name || item.custom_name || 'Unknown Item'
  }

  const getItemPrice = () => {
    if (item.gift_items?.price) return `£${item.gift_items.price}`
    if (item.gift_items?.price_range) return item.gift_items.price_range
    return item.custom_price || 'Price varies'
  }

  const getItemImage = () => {
    return item.external_image_url || item.gift_items?.image_url || '/placeholder-gift.jpg'
  }

  const getBuyUrl = () => {
    return item.external_buy_url || '#'
  }

  const getRating = () => {
    return item.gift_items?.rating || null
  }

  const getPriorityColor = () => {
    switch (item.priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={`border-2 transition-all duration-200 hover:shadow-lg ${
      item.is_claimed 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 hover:border-purple-300 bg-white'
    }`}>
      <CardContent className="p-0">
        {/* Image */}
        <div 
          className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden cursor-pointer group"
          onClick={onViewDetails}
        >
          <img
            src={getItemImage()}
            alt={getItemName()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.src = '/placeholder-gift.jpg'
            }}
          />
          
          {/* Status Overlay */}
          {item.is_claimed && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span className="font-medium">Claimed by {item.claimed_by}</span>
              </div>
            </div>
          )}

          {/* Priority Badge */}
          {item.priority && item.priority !== 'medium' && (
            <div className="absolute top-3 left-3">
              <Badge className={`text-xs ${getPriorityColor()}`}>
                {item.priority?.toUpperCase()} PRIORITY
              </Badge>
            </div>
          )}

          {/* Amazon Badge */}
          {item.external_source === 'amazon' && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                📦 Amazon
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 
            className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={onViewDetails}
          >
            {getItemName()}
          </h3>

          {/* Rating */}
          {getRating() && (
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(getRating()) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">({getRating()})</span>
            </div>
          )}

          {/* Price */}
          <div className="text-lg font-bold text-purple-600 mb-3">
            {getItemPrice()}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="bg-purple-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-purple-800">
                <span className="font-medium">💭 Note: </span>
                {item.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {item.is_claimed ? (
              <div className="flex items-center justify-center space-x-2 py-3 bg-green-100 rounded-lg">
                <Heart className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {item.claimed_by} is bringing this
                </span>
              </div>
            ) : (
              <Button
                onClick={onClaim}
                disabled={isClaimingDisabled || isClaiming}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="sm"
              >
                {isClaiming ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    I'll bring this!
                  </>
                )}
              </Button>
            )}

            {/* Buy Link */}
            {getBuyUrl() !== '#' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                asChild
              >
                <a
                  href={getBuyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy on Amazon
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}