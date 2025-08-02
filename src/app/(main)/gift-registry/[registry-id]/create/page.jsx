"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import {
  Gift,
  Plus,
  Check,
  Search,
  ArrowLeft,
  Grid3X3,
  List,
  Star,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { useGiftSuggestions, useGiftSearch } from "@/hooks/useGiftRegistry"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import ProductDetailModal from "../components/ProductDetailModal"

export default function GiftRegistryShop() {
  const router = useRouter()
  const params = useParams()
  const registryId = params["registry-id"]

  // State
  const [activeCategory, setActiveCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [sortBy, setSortBy] = useState("relevance")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [customItem, setCustomItem] = useState({ name: "", price: "", description: "", notes: "" })
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [registryData, setRegistryData] = useState(null)
  const [registryItems, setRegistryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingItem, setAddingItem] = useState(null)

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [guestName, setGuestName] = useState("")

  // Hooks for search with enhanced debouncing
  const { 
    searchResults, 
    searchGifts,           // Debounced search for typing
    searchGiftsImmediate,  // Immediate search for button clicks
    clearSearch, 
    isLoading: isSearching,
    error: searchError
  } = useGiftSearch()

  const handleAddToRegistry = async (product) => {
    setAddingItem(product.id)
    try {
      let result
      if (product.source === "amazon") {
        result = await partyDatabaseBackend.addRealProductToRegistry(registryId, product, { priority: "medium" })
      } else {
        result = await partyDatabaseBackend.addCuratedItemToRegistry(registryId, product.id, { priority: "medium" })
      }
      if (result.success) {
        setRegistryItems((prev) => [...prev, result.registryItem])
      } else {
        console.error("Failed to add item:", result.error)
      }
    } catch (error) {
      console.error("Error adding product:", error)
    } finally {
      setAddingItem(null)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const result = await partyDatabaseBackend.removeItemFromRegistry(itemId)
      if (result.success) {
        setRegistryItems((prev) => prev.filter((item) => item.id !== itemId))
      } else {
        console.error("Failed to remove item:", result.error)
      }
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  // Modal handlers
  const handleViewDetails = (product) => {
    // Convert product to registry item format for the modal
    const modalItem = {
      id: product.id,
      gift_items: product,
      custom_name: product.name,
      custom_price: product.price ? `£${product.price}` : product.price_range,
      custom_description: product.description,
      external_image_url: product.image_url,
      external_buy_url: product.buy_url || product.amazon_url,
      external_source: product.source,
      is_claimed: false,
      claimed_by: null,
      priority: "medium",
      quantity: 1,
      notes: null
    }
    setSelectedItem(modalItem)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
  }

  const handleClaimItem = (item) => {
    // This would typically update the database
    // For now, just close the modal since this is the shop view
    console.log("Claiming item:", item)
    handleCloseModal()
  }

  // Load registry and party details
  useEffect(() => {
    const loadRegistryData = async () => {
      try {
        console.log("Loading registry:", registryId)
        const result = await partyDatabaseBackend.getRegistryById(registryId)
        if (result.success && result.registry) {
          setRegistryData(result.registry)
          setRegistryItems(result.items || [])
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

  // Get theme-based suggestions
  const partyDetails = registryData?.parties
  const partyTheme = partyDetails?.theme?.toLowerCase()
  const childAge = partyDetails?.child_age
  const { suggestions, loading: suggestionsLoading } = useGiftSuggestions(partyTheme, childAge)

  // Search handlers (defined after childAge is available)
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value)
    if (value.trim()) {
      searchGifts(value, childAge) // This is debounced
    } else {
      clearSearch()
    }
  }, [searchGifts, clearSearch, childAge])

  // Immediate search for button clicks
  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim()) {
      searchGiftsImmediate(searchTerm, childAge) // No debounce
    }
  }, [searchGiftsImmediate, searchTerm, childAge])

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Products", count: suggestions.length + searchResults.length },
    { id: "toys", name: "Toys & Games", icon: "🧸", count: 24 },
    { id: "books", name: "Books", icon: "📚", count: 18 },
    { id: "clothes", name: "Clothing", icon: "👕", count: 12 },
    { id: "art", name: "Art & Crafts", icon: "🎨", count: 15 },
    { id: "sports", name: "Sports & Active", icon: "⚽", count: 9 },
    { id: "games", name: "Board Games", icon: "🎲", count: 21 },
  ]

  // Combine and filter products
  const allProducts = [...suggestions, ...searchResults]
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesPrice && matchesSearch
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0)
      case "price-high":
        return (b.price || 0) - (a.price || 0)
      case "popularity":
        return (b.popularity || 0) - (a.popularity || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen  bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[hsl(var(--primary-500))] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gift shop...</p>
        </div>
      </div>
    )
  }

  if (!registryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registry Not Found</h1>
          <p className="text-gray-600 mb-4">The gift registry you're looking for doesn't exist.</p>
          <Button
            asChild
            className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"
          >
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50]">
        <ContextualBreadcrumb currentPage="Browse Gifts" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
             
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gift Shop</h1>
                <p className="text-sm text-gray-600">
                  Perfect gifts for {partyDetails?.child_name}'s {partyTheme} party
                </p>
              </div>
            </div>

            {/* Registry Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-[hsl(var(--primary-50))] rounded-xl px-4 py-2 border border-[hsl(var(--primary-200))]">
                <ShoppingCart className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                <span className="text-sm font-medium text-[hsl(var(--primary-700))]">
                  {registryItems.length} items in registry
                </span>
              </div>
              <Button
                variant="outline"
                className="border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))] bg-transparent"
                asChild
              >
                <Link href={`/gift-registry/${registryId}/preview`}>View Registry</Link>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex space-x-4 ">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for gifts..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 focus:border-[hsl(var(--primary-400))] rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSearching && searchTerm.trim()) {
                    handleSearchSubmit()
                  }
                }}
              />
              {/* Search indicator */}
              {isSearching && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-[hsl(var(--primary-500))]" />
                </div>
              )}
              
              {/* Clear search button */}
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    clearSearch()
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Button
              onClick={handleSearchSubmit}
              disabled={isSearching || !searchTerm.trim()}
              className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-8 h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Search Error Display */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-800">{searchError}</span>
                <button
                  onClick={() => handleSearchSubmit()}
                  className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 ]">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0 hidden lg:block ">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === category.id
                          ? "bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider value={priceRange} onValueChange={setPriceRange} max={100} step={5} className="mb-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>£{priceRange[0]}</span>
                    <span>£{priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Add Custom Item */}
              <div className="border-t border-gray-200 pt-6">
                <Button
                  onClick={() => setShowCustomForm(true)}
                  variant="outline"
                  className="w-full border-dashed border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Item
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-screen">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{sortedProducts.length} products found</span>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="md:flex items-center space-x-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border border-gray-200 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-gray-100" : ""}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-gray-100" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {suggestionsLoading ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2"}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProductCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2"}`}
              >
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onAddToRegistry={() => handleAddToRegistry(product)}
                    onViewDetails={() => handleViewDetails(product)}
                    isAdded={registryItems.some((item) => item.gift_item_id === product.id)}
                    isLoading={addingItem === product.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => {
                    setActiveCategory("all")
                    setPriceRange([0, 100])
                    setSearchTerm("")
                    clearSearch()
                  }}
                  variant="outline"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Item Modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Custom Gift</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gift Name *</label>
                  <Input
                    value={customItem.name}
                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                    placeholder="e.g., Pokemon cards"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <Input
                    value={customItem.price}
                    onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                    placeholder="e.g., £10-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={customItem.description}
                    onChange={(e) => setCustomItem({ ...customItem, description: e.target.value })}
                    placeholder="Any specific details..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={async () => {
                      if (!customItem.name.trim()) return
                      setAddingItem("custom")
                      try {
                        const result = await partyDatabaseBackend.addCustomItemToRegistry(registryId, customItem)
                        if (result.success) {
                          setRegistryItems((prev) => [...prev, result.registryItem])
                          setCustomItem({ name: "", price: "", description: "", notes: "" })
                          setShowCustomForm(false)
                        }
                      } catch (error) {
                        console.error("Error adding custom item:", error)
                      } finally {
                        setAddingItem(null)
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"
                    disabled={!customItem.name.trim() || addingItem === "custom"}
                  >
                    {addingItem === "custom" ? "Adding..." : "Add to Registry"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustomForm(false)
                      setCustomItem({ name: "", price: "", description: "", notes: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

// Product Card Component
function ProductCard({ product, viewMode, onAddToRegistry, onViewDetails, isAdded, isLoading }) {
  if (viewMode === "list") {
    return (
      <Card className="border border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-lg transition-all duration-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div 
              className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onViewDetails}
            >
              {product.image_url ? (
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Gift className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[hsl(var(--primary-600))] transition-colors"
                onClick={onViewDetails}
              >
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center space-x-2 mb-2">
                {product.rating && (
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
                  </div>
                )}
                {product.popularity > 80 && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Popular</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[hsl(var(--primary-600))]">
                  {product.price ? `£${product.price}` : product.price_range}
                </span>
                <Button
                  onClick={onAddToRegistry}
                  disabled={isAdded || isLoading}
                  className={
                    isAdded
                      ? "bg-emerald-100 text-emerald-800 cursor-not-allowed"
                      : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"
                  }
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Adding...
                    </>
                  ) : isAdded ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Registry
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-lg transition-all duration-200 bg-white group">
      <CardContent className="p-0">
        {/* Product Image */}
        <div 
          className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden cursor-pointer"
          onClick={onViewDetails}
        >
          {product.image_url ? (
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.popularity > 80 && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs border-yellow-200">⭐ Popular</Badge>
            )}
            {product.discount && (
              <Badge className="bg-red-100 text-red-800 text-xs border-red-200">-{product.discount}%</Badge>
            )}
          </div>

          {/* Quick Add Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering the modal
                onAddToRegistry()
              }}
              disabled={isAdded || isLoading}
              className={
                isAdded
                  ? "bg-emerald-500 text-white cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-[hsl(var(--primary-50))] border border-gray-200"
              }
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : isAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 
            className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm cursor-pointer hover:text-[hsl(var(--primary-600))] transition-colors"
            onClick={onViewDetails}
          >
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-[hsl(var(--primary-600))]">
                {product.price ? `£${product.price}` : product.price_range}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">£{product.originalPrice}</span>
              )}
            </div>
          </div>

          {/* Add to Registry Button */}
          <Button
            onClick={onAddToRegistry}
            disabled={isAdded || isLoading}
            className={`w-full ${
              isAdded
                ? "bg-emerald-100 text-emerald-800 cursor-not-allowed hover:bg-emerald-100"
                : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"
            }`}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Adding...
              </>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Registry
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Registry
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Product Card Skeleton
function ProductCardSkeleton({ viewMode }) {
  if (viewMode === "list") {
    return (
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-0">
        <div className="aspect-square bg-gray-200 rounded-t-lg animate-pulse"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-20 mb-3 animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}