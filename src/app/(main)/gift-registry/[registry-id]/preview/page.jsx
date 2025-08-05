"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Gift,
  Star,
  ExternalLink,
  Check,
  Calendar,
  MapPin,
  User,
  ShoppingCart,
  Heart,
  CheckCircle,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function CleanGiftRegistryPreview() {
  const params = useParams()
  const registryId = params["registry-id"]

  // State
  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true) // Set back to true for real data
  const [guestName, setGuestName] = useState("")
  const [claimingItem, setClaimingItem] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [userClaimedItem, setUserClaimedItem] = useState(null) // Track what user has claimed

  // Load registry data
  useEffect(() => {
    const loadRegistryData = async () => {
      try {
        console.log("Loading registry:", registryId)
        const result = await partyDatabaseBackend.getRegistryById(registryId)
        console.log("API Response:", result) // Debug log
        
        if (result.success && result.registry) {
          console.log("Registry data:", result.registry) // Debug log
          console.log("Registry items:", result.items) // Debug log
          
          setRegistryData(result.registry)
          setRegistryItems(result.items || [])
          setFilteredItems(result.items || [])
          console.log("Registry loaded successfully")
        } else {
          console.error("Failed to load registry:", result.error)
          // Show user-friendly error
          setRegistryData({ error: "Failed to load registry" })
        }
      } catch (error) {
        console.error("Error loading registry:", error)
        // Show user-friendly error
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
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎁 Snap Up {childName} Dream Gifts! 🎁
              </h1>
              <p className="text-lg text-gray-600 mb-3">
                Help create the perfect birthday surprise!
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(partyDetails?.party_date).toLocaleDateString()}
                </div>
                {partyDetails?.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {partyDetails.venue}
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{totalItems}</div>
                <div className="text-gray-500">Total Items</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{claimedItems}</div>
                <div className="text-gray-500">Claimed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary-600">{availableItems}</div>
                <div className="text-gray-500">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              
              {/* Guest Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name to claim a gift"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  One gift per person to keep it fair for everyone! 🎁
                </p>
                {userClaimedItem && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">You've claimed:</span>
                    </div>
                    <div className="text-green-600 mt-1">
                      {userClaimedItem.gift_items?.name || 'A gift'}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Items
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalItems > 0 ? (claimedItems / totalItems) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                🌟 {childName} Birthday Wishlist ({filteredItems.length} amazing gifts!)
              </h2>
              <p className="text-gray-600 mt-1">
                Each gift has been specially chosen - snap one up to make her day magical!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 mb-4">
                  {registryItems.length === 0 
                    ? "No gifts have been added to this registry yet."
                    : "Try adjusting your filter to see more items."
                  }
                </p>
                <div className="text-xs text-gray-400 bg-gray-100 rounded p-3 max-w-md mx-auto">
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

      {/* Claim Modal */}
      {showClaimModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Snap Up This Gift! 🎁
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClaimModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

                <div className="mb-4">
                  <img
                    src={selectedItem.external_image_url}
                    alt={selectedItem.custom_name}
                    className="w-full h-32 object-cover rounded-lg bg-gray-100"
                  />
                </div>

              <h4 className="font-medium text-gray-900 mb-2">
                {selectedItem.custom_name}
              </h4>
              <p className="text-2xl font-bold text-gray-900 mb-4">
                {selectedItem.custom_price}
              </p>

              {(selectedItem.custom_description || selectedItem.notes) && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {selectedItem.custom_description || selectedItem.notes}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {userClaimedItem ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You've already claimed a gift!</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      You've claimed "{userClaimedItem.gift_items?.name}". Each person can only claim one gift to keep things fair for everyone! 🎁
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleClaimItem(selectedItem)}
                    disabled={!guestName.trim() || claimingItem === selectedItem.id}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg py-3"
                  >
                    {claimingItem === selectedItem.id ? (
                      <>
                        <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Snapping This Up...
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-2" />
                        I'll Bring This Gift! 🎉
                      </>
                    )}
                  </Button>
                )}

                {selectedItem.external_buy_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a 
                      href={selectedItem.external_buy_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy on Amazon
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>

              {!guestName.trim() && !userClaimedItem && (
                <p className="text-sm text-red-600 mt-2">
                  Please enter your name above to claim this gift.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Product Card Component
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

  const getRating = () => {
    // No rating in your data structure
    return null
  }

  const getDescription = () => {
    return item.custom_description || item.notes || null
  }

  const getPriorityBadge = () => {
    const priority = item.priority?.toLowerCase()
    if (priority === "high") {
      return <Badge className="bg-red-100 text-red-800">High Priority</Badge>
    } else if (priority === "medium") {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
    } else if (priority === "low") {
      return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
    }
    return null
  }

  const getSource = () => {
    return item.external_source || null
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden">
          {getItemImage() ? (
            <img
              src={getItemImage()}
              alt={getItemName()}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Gift className="w-12 h-12" />
            </div>
          )}

          {item.is_claimed && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Claimed
              </div>
            </div>
          )}

          {getPriorityBadge() && (
            <div className="absolute top-2 left-2">
              {getPriorityBadge()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
            {getItemName()}
          </h3>

          {/* Rating - Remove since not in data */}
          {/* No rating available in current data structure */}

          {/* Price */}
          <div className="text-xl font-bold text-gray-900 mb-3">
            {getItemPrice()}
          </div>

          {/* Description/Notes */}
          {getDescription() && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {getDescription()}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {item.is_claimed ? (
              <div className="text-center py-3 text-sm text-green-600 font-medium bg-green-50 rounded-lg">
                ✓ Claimed by {item.claimed_by}
              </div>
            ) : userAlreadyClaimed ? (
              <div className="text-center py-3 text-sm text-amber-600 font-medium bg-amber-50 rounded-lg border border-amber-200">
                You've already claimed a gift! 🎁
              </div>
            ) : (
              <Button
                onClick={onClaim}
                disabled={!guestName.trim() || isClaiming}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium"
              >
                {isClaiming ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Snapping Up...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    I'll Bring This! 🎁
                  </>
                )}
              </Button>
            )}

            {getBuyUrl() !== "#" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-sm"
                asChild
              >
                <a 
                  href={getBuyUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {getSource() === "amazon" ? "Buy on Amazon" : "Buy Now"}
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