"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Gift, ExternalLink, Calendar, MapPin, ShoppingCart, Heart, CheckCircle, X, PartyPopper } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function CleanGiftRegistryPreview() {
  const params = useParams()
  const registryId = params["registry-id"]

  // State
  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState("")
  const [tempGuestName, setTempGuestName] = useState("") // For the welcome modal
  const [claimingItem, setClaimingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null) // Stores item user wants to claim before entering name
  const [userClaimedItem, setUserClaimedItem] = useState(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isOwner, setIsOwner] = useState(false) // Track if current user is the owner

  // Load registry data
  useEffect(() => {
    const loadRegistryData = async () => {
      try {
        console.log("Loading registry:", registryId)
        const result = await partyDatabaseBackend.getRegistryById(registryId)
        console.log("API Response:", result)

        if (result.success && result.registry) {
          console.log("Registry data:", result.registry)
          console.log("Registry items:", result.items)

          setRegistryData(result.registry)
          setRegistryItems(result.items || [])

          // Check if user is the owner by checking if they came from the create page
          // or if their user ID matches (you could add this check)
          const isOwnerView = window.location.search.includes('owner=true') ||
                             sessionStorage.getItem(`registry_${registryId}_owner`) === 'true'
          setIsOwner(isOwnerView)

          console.log("Registry loaded successfully")
        } else {
          console.error("Failed to load registry:", result.error)
          setRegistryData({ error: "Failed to load registry" })
        }
      } catch (error) {
        console.error("Error loading registry:", error)
        setRegistryData({ error: "Network error loading registry" })
      } finally {
        setLoading(false)
      }
    }

    if (registryId) {
      loadRegistryData()
    } else {
      console.error("No registry ID provided")
      setLoading(false)
    }
  }, [registryId])

  // Check if user has already claimed a gift when name changes
  useEffect(() => {
    if (guestName.trim()) {
      const claimedByUser = registryItems.find(item => 
        item.is_claimed && item.claimed_by?.toLowerCase() === guestName.trim().toLowerCase()
      )
      setUserClaimedItem(claimedByUser || null)
    } else {
      setUserClaimedItem(null)
    }
  }, [guestName, registryItems])

  // NEW: Handle welcome modal submission
  const handleWelcomeSubmit = async () => {
    if (tempGuestName.trim()) {
      const name = tempGuestName.trim()
      setGuestName(name)
      setShowWelcomeModal(false)

      // If they had selected an item before entering name, claim it now
      if (selectedItem) {
        setClaimingItem(selectedItem.id)
        try {
          const result = await partyDatabaseBackend.claimRegistryItem(selectedItem.id, name)
          if (result.success) {
            setRegistryItems(prev =>
              prev.map(regItem =>
                regItem.id === selectedItem.id
                  ? { ...regItem, is_claimed: true, claimed_by: name }
                  : regItem
              )
            )
            alert("🎉 Gift claimed successfully! They'll be so excited!")
          } else {
            console.error("Failed to claim item:", result.error)
            alert("Oops! Something went wrong. Please try again! 🎁")
          }
        } catch (error) {
          console.error("Error claiming item:", error)
          alert("Oops! Something went wrong. Please try again! 🎁")
        } finally {
          setClaimingItem(null)
          setSelectedItem(null)
        }
      }
    }
  }

  // NEW: Handle skip welcome (browse without name)
  const handleSkipWelcome = () => {
    setShowWelcomeModal(false)
    // Keep guestName empty so they can't claim items
  }

  // Handle claim
  const handleClaimItem = async (item) => {
    if (!guestName.trim()) {
      alert("Please enter your name first!")
      return
    }

    // Check if user already claimed a gift
    if (userClaimedItem) {
      alert(`You've already claimed "${userClaimedItem.gift_items?.name || 'a gift'}"! Each person can only claim one gift to keep things fair for everyone. 🎁`)
      return
    }

    setClaimingItem(item.id)
    try {
      const result = await partyDatabaseBackend.claimRegistryItem(item.id, guestName.trim())
      if (result.success) {
        setRegistryItems(prev =>
          prev.map(regItem =>
            regItem.id === item.id
              ? { ...regItem, is_claimed: true, claimed_by: guestName.trim() }
              : regItem
          )
        )
        setShowClaimModal(false)
        alert("🎉 Gift claimed successfully! Emma will be so excited!")
      } else {
        console.error("Failed to claim item:", result.error)
        alert("Oops! Something went wrong. Please try again! 🎁")
      }
    } catch (error) {
      console.error("Error claiming item:", error)
      alert("Oops! Something went wrong. Please try again! 🎁")
    } finally {
      setClaimingItem(null)
    }
  }

  const openClaimModal = (item) => {
    if (!guestName.trim()) {
      // Show name entry modal if no name is stored
      setShowWelcomeModal(true)
      setSelectedItem(item) // Store the item they wanted to claim
      return
    }
    // Directly claim the item - no modal needed
    handleClaimItem(item)
  }

  const openProductModal = (item) => {
    setSelectedProduct(item)
    setShowProductModal(true)
  }

  const closeProductModal = () => {
    setShowProductModal(false)
    setSelectedProduct(null)
  }

  // Calculate stats
  const totalItems = registryItems.length
  const claimedItems = registryItems.filter(item => item.is_claimed).length
  const availableItems = totalItems - claimedItems

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift registry...</p>
        </div>
      </div>
    )
  }

  const partyDetails = registryData?.parties
  const getChildDisplayName = () => {
    const fullName = registryData?.parties?.child_name ||
                         registryData?.name?.split("'s Gift Registry")[0] ||
                         "Birthday Child"
        
    const firstName = fullName.trim().split(' ')[0]
        
    // Handle names ending in 's' (like "Chris" → "Chris'")
    if (firstName.toLowerCase().endsWith('s')) {
      return firstName + "'"
    } else {
      return firstName + "'s"
    }
  }
    
  const childName = getChildDisplayName()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <ContextualBreadcrumb currentPage="Gift Registry Preview" id={registryId} />

      {/* Header - Magical Personal Style */}
      <div className="relative rounded-2xl shadow-lg overflow-hidden mb-6 mx-3 sm:mx-4">
        {/* Mobile: Full width with overlay */}
        <div className="md:hidden">
          {registryData?.header_image ? (
            <div className="relative h-[280px] bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
              <img
                src={registryData.header_image}
                alt={childName}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h1 className="text-2xl font-black mb-3 drop-shadow-lg">
                  ✨ {childName} Dream Gifts ✨
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  {partyDetails?.party_date && (
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white">
                      <Calendar className="w-3 h-3 text-[hsl(var(--primary-600))]" />
                      <span className="text-xs font-bold text-[hsl(var(--primary-600))]">
                        {new Date(partyDetails.party_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {partyDetails?.child_age && (
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white">
                      <PartyPopper className="w-3 h-3 text-[hsl(var(--primary-600))]" />
                      <span className="text-xs font-bold text-[hsl(var(--primary-600))]">
                        Turning {partyDetails.child_age}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-[280px] bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
              <div
                style={{
                  backgroundImage: `url('/party-pattern.svg')`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '100px',
                  opacity: 0.15
                }}
                className="absolute inset-0"
              ></div>

              <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
                <h1 className="text-2xl font-black mb-3 text-center drop-shadow-lg">
                  ✨ {childName} Dream Gifts ✨
                </h1>

                <div className="flex flex-wrap items-center gap-2 justify-center">
                  {partyDetails?.party_date && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
                      <Calendar className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white">
                        {new Date(partyDetails.party_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {partyDetails?.child_age && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
                      <PartyPopper className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white">
                        Turning {partyDetails.child_age}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Side by side split */}
        <div className="hidden md:grid md:grid-cols-5 gap-0 bg-white">
          {/* Left Side - Child's Photo */}
          <div className="md:col-span-2 relative bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] h-[220px]">
            {registryData?.header_image ? (
              <img
                src={registryData.header_image}
                alt={childName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                style={{
                  backgroundImage: `url('/party-pattern.svg')`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '100px',
                  opacity: 0.15
                }}
                className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] flex items-center justify-center"
              >
                <Gift className="w-20 h-20 text-white opacity-50" />
              </div>
            )}
          </div>

          {/* Right Side - Registry Info */}
          <div className="md:col-span-3 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] p-6 flex flex-col justify-center relative">
            <div
              style={{
                backgroundImage: `url('/party-pattern.svg')`,
                backgroundRepeat: 'repeat',
                backgroundSize: '100px',
                opacity: 0.1
              }}
              className="absolute inset-0"
            ></div>

            <div className="relative z-10 text-white">
              <h1 className="text-2xl lg:text-3xl font-black mb-3 drop-shadow-lg">
                ✨ {childName} Dream Gifts ✨
              </h1>

              <p className="text-sm mb-4 drop-shadow-lg font-medium opacity-90">
                Help make this birthday magical!
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {partyDetails?.party_date && (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-white">
                    <Calendar className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                    <span className="text-sm font-bold text-[hsl(var(--primary-600))]">
                      {new Date(partyDetails.party_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {partyDetails?.child_age && (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-white">
                    <PartyPopper className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                    <span className="text-sm font-bold text-[hsl(var(--primary-600))]">
                      Turning {partyDetails.child_age}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Show claimed item banner if user has one */}
        {userClaimedItem && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-semibold">You've claimed: </span>
                <span className="font-bold">{userClaimedItem.custom_name || 'A gift'}</span>
                <span className="block text-sm text-green-600 mt-1">Thanks for letting everyone know! Each person can only claim one gift.</span>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {registryItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onClaim={() => openClaimModal(item)}
              onImageClick={() => openProductModal(item)}
              guestName={guestName}
              isClaiming={claimingItem === item.id}
              userAlreadyClaimed={userClaimedItem !== null}
              isOwner={isOwner}
            />
          ))}
        </div>

        {registryItems.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No gifts yet</h3>
            <p className="text-gray-500">
              No gifts have been added to this registry yet.
            </p>
          </div>
        )}
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowWelcomeModal(false)
                setSelectedItem(null)
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="mb-4 pr-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Enter Your Child's Name
                </h3>
                <p className="text-sm text-gray-600">
                  So we can track who's bringing what
                </p>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <Input
                  value={tempGuestName}
                  onChange={(e) => setTempGuestName(e.target.value)}
                  placeholder="Child's name"
                  className="w-full text-base py-2.5 border-2 focus:border-primary-400 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tempGuestName.trim()) {
                      handleWelcomeSubmit()
                    }
                  }}
                  autoFocus
                />
              </div>

              {/* Action Button */}
              <Button
                onClick={handleWelcomeSubmit}
                disabled={!tempGuestName.trim()}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Claim Gift
              </Button>

              {/* Note */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                One gift per child
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedProduct.external_image_url ? (
                      <img
                        src={selectedProduct.external_image_url}
                        alt={selectedProduct.custom_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProduct.custom_name || "Unknown Item"}
                    </h3>

                    <div className="text-2xl font-bold text-primary-600 mb-4">
                      {selectedProduct.custom_price || "Price not available"}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProduct.custom_description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {selectedProduct.custom_description}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedProduct.notes && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Parent's Note</h4>
                      <p className="text-purple-800 text-sm">
                        {selectedProduct.notes}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  {selectedProduct.is_claimed ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          {selectedProduct.claimed_by} is bringing this gift
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">Available to claim</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    {!selectedProduct.is_claimed && (
                      <Button
                        onClick={() => {
                          closeProductModal()
                          openClaimModal(selectedProduct)
                        }}
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Claim This Gift
                      </Button>
                    )}

                    {selectedProduct.external_buy_url && selectedProduct.external_buy_url !== "#" && (
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={selectedProduct.external_buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View on {selectedProduct.external_source === "amazon" ? "Amazon" : "Store"}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Product Card Component - Matches Shop Page Design
function ProductCard({ item, onClaim, onImageClick, guestName, isClaiming, userAlreadyClaimed, isOwner }) {
  // Store isOwner in window for nested components
  if (typeof window !== 'undefined') {
    window.isOwnerView = isOwner
  }
  const getItemName = () => {
    const fullName = item.custom_name || "Unknown Item"

    // Intelligently shorten long product names
    // Remove common filler words and phrases
    let shortName = fullName
      .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
      .replace(/\s*,.*$/, '') // Remove everything after first comma
      .replace(/\s+for (ages?|kids|children|boys?|girls?).*$/i, '') // Remove age recommendations
      .replace(/\s+(toy|gift|set|pack|bundle|kit)(\s|$)/gi, ' ') // Remove generic descriptors at end
      .replace(/\s+with\s+.*$/i, '') // Remove "with..." details
      .trim()

    // If still too long (over 50 chars), take first significant words
    if (shortName.length > 50) {
      const words = shortName.split(' ')
      shortName = words.slice(0, 5).join(' ')
      if (words.length > 5) shortName += '...'
    }

    return shortName
  }

  const getItemPrice = () => {
    return item.custom_price || "Price not available"
  }

  const getItemImage = () => {
    return item.external_image_url || null
  }

  const getBuyUrl = () => {
    return item.external_buy_url || "#"
  }

  const getDescription = () => {
    return item.custom_description || item.notes || null
  }

  const getPriorityBadge = () => {
    const priority = item.priority?.toLowerCase()
    if (priority === "high") {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-1 shadow-lg border-0">High Priority</Badge>
    } else if (priority === "medium") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-1 shadow-lg border-0">Medium Priority</Badge>
    } else if (priority === "low") {
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 shadow-lg border-0">Low Priority</Badge>
    }
    return null
  }

  const getSource = () => {
    return item.external_source || null
  }

  return (
    <Card className="border border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-lg transition-all duration-200 bg-white group">
      <CardContent className="p-0">
        {/* Product Image */}
        <div
          className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden cursor-pointer"
          onClick={onImageClick}
        >
          {getItemImage() ? (
            <img
              src={getItemImage() || "/placeholder.svg"}
              alt={getItemName()}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {getPriorityBadge()}
            {item.is_claimed && (
              <Badge className="bg-green-100 text-green-800 text-xs border-green-200 px-1.5 py-0.5">✓</Badge>
            )}
          </div>

          {/* Claimed overlay */}
          {item.is_claimed && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <CheckCircle className="w-3 h-3" />
                Claimed
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-xs">
            {getItemName()}
          </h3>

          {/* Price */}
          <div className="mb-2">
            <span className="text-sm font-bold text-[hsl(var(--primary-600))]">
              {getItemPrice()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5">
            {item.is_claimed ? (
              <div className="text-center py-1.5 text-xs text-green-700 font-bold bg-green-50 rounded-lg border border-green-200">
                ✓ {item.claimed_by}
              </div>
            ) : isOwner ? (
              // Owner sees "Available" badge instead of claim button
              <div className="text-center py-1.5 text-xs text-gray-700 font-bold bg-gray-50 rounded-lg border border-gray-200">
                Available
              </div>
            ) : userAlreadyClaimed ? (
              <div className="text-center py-1.5 text-xs text-amber-700 font-bold bg-amber-50 rounded-lg border border-amber-200">
                Already claimed!
              </div>
            ) : !guestName.trim() ? (
              <Button
                onClick={onClaim}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg text-xs py-1.5 h-auto"
                size="sm"
              >
                Claim
              </Button>
            ) : (
              <Button
                onClick={onClaim}
                disabled={isClaiming}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white text-xs py-1.5 h-auto"
                size="sm"
              >
                {isClaiming ? (
                  <>
                    <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Claiming...</span>
                  </>
                ) : (
                  <span>Claim</span>
                )}
              </Button>
            )}

            {/* Buy button - always show */}
            {getBuyUrl() !== "#" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border border-gray-200 hover:bg-gray-50 rounded-lg py-1.5 h-auto"
                asChild
              >
                <a
                  href={getBuyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {getSource() === "amazon" ? "Amazon" : "Buy"}
                  <ExternalLink className="w-2.5 h-2.5 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
