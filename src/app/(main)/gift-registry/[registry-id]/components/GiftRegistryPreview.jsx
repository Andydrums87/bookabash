"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Gift, Star, ExternalLink, Check, Calendar, MapPin, User, ShoppingCart, Heart, CheckCircle, X, PartyPopper, Sparkles, Users, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import ProductDetailModal from "./ProductDetailModal"

export default function CleanGiftRegistryPreview() {
  const params = useParams()
  const registryId = params["registry-id"]

  // State
  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [guestName, setGuestName] = useState("")
  const [tempGuestName, setTempGuestName] = useState("") // For the welcome modal
  const [claimingItem, setClaimingItem] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [userClaimedItem, setUserClaimedItem] = useState(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false) // NEW: Welcome modal state

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
          setFilteredItems(result.items || [])
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

  useEffect(() => {
    let filtered = [...registryItems]

    if (statusFilter === "available") {
      filtered = filtered.filter((item) => !item.is_claimed)
    } else if (statusFilter === "claimed") {
      filtered = filtered.filter((item) => item.is_claimed)
    }

    setFilteredItems(filtered)
  }, [registryItems, statusFilter])

  // NEW: Handle welcome modal submission
  const handleWelcomeSubmit = () => {
    if (tempGuestName.trim()) {
      setGuestName(tempGuestName.trim())
      setShowWelcomeModal(false)
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
      return
    }
    setSelectedItem(item)
    setShowClaimModal(true)
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
      
      {/* Header with Your Pattern - FULL WIDTH */}
      <div 
        style={{
          backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px, cover',
          backgroundPosition: 'center',
        }} 
        className="relative rounded-2xl shadow-2xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] mx-3 sm:mx-4"
      >
        <div className="relative z-10 p-8 sm:p-12 text-white">
          {/* Header Content */}
          <div className="max-w-9xl mx-auto">
            <div className="flex flex-col gap-8">
              {/* Left Side - Title and Description */}
              <div>
                <div className="flex items-center gap-4 mb-6">
        
                  <div>
                    <h1 className="text-5xl font-black leading-tight">
                      Snap Up <span className="text-gray-900"> {childName} </span>Dream Gifts!
                    </h1>
                    <p className="text-white/90 text-base sm:text-lg mt-2">
                      Help create the perfect birthday surprise!
                      {guestName && <span className="text-white font-medium"> Welcome, {guestName}!</span>}
                    </p>
                  </div>
                </div>

                {/* Party Details */}
                <div className="flex flex-wrap items-center gap-4">
                  {partyDetails?.party_date && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
                      <Calendar className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">
                        {new Date(partyDetails.party_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {partyDetails?.venue && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
                      <MapPin className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">
                        {partyDetails.venue}
                      </span>
                    </div>
                  )}
                  {partyDetails?.child_age && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
                      <PartyPopper className="w-5 h-5 text-white" />
                      <span className="text-sm font-medium text-white">
                        Turning {partyDetails.child_age}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-screen px-5 mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              
              {/* Show claimed item if user has one */}
              {userClaimedItem && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">You've claimed:</span>
                  </div>
                  <div className="text-green-600 font-medium">
                    {userClaimedItem.gift_items?.name || 'A gift'}
                  </div>
                </div>
              )}

              {/* Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Items
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-2 w-full p-2 border-gray-200 focus:border-primary-400 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items ({totalItems})</SelectItem>
                    <SelectItem value="available">Available ({availableItems})</SelectItem>
                    <SelectItem value="claimed">Claimed ({claimedItems})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Registry Progress</span>
                  <span>{totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${totalItems > 0 ? (claimedItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-500" />
                {childName} Birthday Wishlist
                <span className="text-primary-600">({filteredItems.length} amazing gifts!)</span>
              </h2>
              <p className="text-gray-600 mt-2">
                Each gift has been specially chosen - snap one up to make her day magical!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onClaim={() => openClaimModal(item)}
                  guestName={guestName}
                  isClaiming={claimingItem === item.id}
                  userAlreadyClaimed={userClaimedItem !== null}
                />
              ))}
            </div>

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 mb-6">
                  {registryItems.length === 0
                    ? "No gifts have been added to this registry yet."
                    : "Try adjusting your filter to see more items."
                  }
                </p>
                <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-4 max-w-md mx-auto border border-gray-200">
                  <strong>Debug Info:</strong><br/>
                  Registry ID: {registryId}<br/>
                  Total Items: {registryItems.length}<br/>
                  Filtered Items: {filteredItems.length}<br/>
                  Filter: {statusFilter}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW: Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-100 transition-all duration-200">
            <div className="p-8 text-center">
              {/* Fun Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Enter Your Name to Claim Gift 🎁
                </h3>
                <p className="text-gray-600">
                  We need your name to keep track of who's bringing what gift!
                </p>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  What's your name?
                </label>
                <Input
                  value={tempGuestName}
                  onChange={(e) => setTempGuestName(e.target.value)}
                  placeholder="Enter your name here"
                  className="w-full text-center text-lg py-3 border-2 focus:border-primary-400 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tempGuestName.trim()) {
                      handleWelcomeSubmit()
                    }
                  }}
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  This helps us keep track of who's bringing what gift! 🎁
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleWelcomeSubmit}
                  disabled={!tempGuestName.trim()}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-lg py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Let's Pick a Gift! 🎁
                </Button>
                
              </div>

              {/* Fun Footer */}
              <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <p className="text-sm text-primary-700">
                  <strong>One gift per person</strong> to keep things fair for everyone! 
                  Once you claim a gift, you're all set! 🌟
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onClaim={handleClaimItem}
        isClaimingDisabled={!guestName.trim()}
        guestName={guestName}
        userClaimedItem={userClaimedItem}
        claimingItem={claimingItem}
      />
    </div>
  )
}

// Product Card Component - Matches Shop Page Design
function ProductCard({ item, onClaim, guestName, isClaiming, userAlreadyClaimed }) {
  const getItemName = () => {
    return item.custom_name || "Unknown Item"
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
        <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden">
          {getItemImage() ? (
            <img
              src={getItemImage() || "/placeholder.svg"}
              alt={getItemName()}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {getPriorityBadge()}
            {item.is_claimed && (
              <Badge className="bg-green-100 text-green-800 text-xs border-green-200">✓ Claimed</Badge>
            )}
          </div>

          {/* Heart button - matches shop page */}
          <button
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-20"
          >
            <Heart className="w-3 h-3 text-gray-400" />
          </button>

          {/* Claimed overlay */}
          {item.is_claimed && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                <CheckCircle className="w-4 h-4" />
                Claimed
              </div>
            </div>
          )}
        </div>

        {/* Product Info - Matches shop page layout */}
        <div className="p-2 sm:p-4">
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm">
            {getItemName()}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <span className="text-sm sm:text-lg font-bold text-[hsl(var(--primary-600))]">
                {getItemPrice()}
              </span>
            </div>
          </div>

     
          {/* Action Buttons - Different from shop page */}
          <div className="space-y-2">
            {item.is_claimed ? (
              <div className="text-center py-2 text-xs sm:text-sm text-green-700 font-bold bg-green-50 rounded-xl border border-green-200">
                ✓ Claimed by {item.claimed_by}
              </div>
            ) : userAlreadyClaimed ? (
              <div className="text-center py-2 text-xs sm:text-sm text-amber-700 font-bold bg-amber-50 rounded-xl border border-amber-200">
                You've already claimed a gift! 🎁
              </div>
            ) : !guestName.trim() ? (
              <Button
                onClick={onClaim}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-xl text-xs sm:text-sm py-2"
                size="sm"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Enter Name to Claim 👆
              </Button>
            ) : (
              <Button
                onClick={onClaim}
                disabled={isClaiming}
                className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white text-xs sm:text-sm py-2"
                size="sm"
              >
                {isClaiming ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Snapping Up...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span>I'll Bring This! 🎁</span>
                  </>
                )}
              </Button>
            )}

            {/* Buy button - matches shop page */}
            {getBuyUrl() !== "#" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-2 border-gray-200 hover:bg-gray-50 rounded-xl"
                asChild
              >
                <a
                  href={getBuyUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {getSource() === "amazon" ? "Buy on Amazon" : "Buy Now"}
                  <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
