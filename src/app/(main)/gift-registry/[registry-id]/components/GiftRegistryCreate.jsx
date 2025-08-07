"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { useEnhancedGiftProducts } from "../hooks/useEnhancedGiftProducts"
import { Gift, Plus, Check, Search, ArrowLeft, Grid3X3, List, Star, ShoppingCart, SlidersHorizontal, Loader2, Sparkles, Filter, X } from 'lucide-react'
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
import ProductDetailModal from "./ProductDetailModal"
import Image from "next/image"

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
  const [activeMode, setActiveMode] = useState("trending")
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

  const {
    products,
    loading: productsLoading,
    error: productsError,
    hasMore,
    currentPage,
    totalResults,
    loadProducts,
    loadMore,
    reset  
  } = useEnhancedGiftProducts()

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

  useEffect(() => {
    if (registryData?.parties?.child_age && activeMode === "trending") {
      console.log("Loading trending products for age:", registryData.parties.child_age)
      loadProducts('trending', {
        age: registryData.parties.child_age,
        limit: 20
      })
    }
  }, [registryData, activeMode, loadProducts])

  // Get theme-based suggestions
  const partyDetails = registryData?.parties
  const partyTheme = partyDetails?.theme?.toLowerCase()
  const childAge = partyDetails?.child_age
  const { suggestions, loading: suggestionsLoading } = useGiftSuggestions(partyTheme, childAge)

  // Search handlers (defined after childAge is available)
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value)
  }, [])

  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim() && childAge) {
      setActiveMode("search")
      reset()
      loadProducts('search', {
        searchTerm: searchTerm.trim(),
        age: childAge,
        limit: 20
      })
    }
  }, [searchTerm, childAge, reset, loadProducts])

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId)
    if (categoryId === "all") {
      setActiveMode("trending")
      reset()
      if (childAge) {
        loadProducts('trending', {
          age: childAge,
          limit: 20
        })
      }
    } else {
      setActiveMode("category")
      reset()
      if (childAge) {
        loadProducts('category', {
          category: categoryId,
          age: childAge,
          limit: 20
        })
      }
    }
  }, [childAge, reset, loadProducts])

  // 7. ADD this new function for loading more products
  const handleLoadMore = useCallback(() => {
    if (hasMore && !productsLoading) {
      const options = { age: childAge, limit: 20 }
      switch (activeMode) {
        case 'search':
          options.searchTerm = searchTerm
          break
        case 'category':
          options.category = activeCategory
          break
        case 'trending':
        default:
          // Just age is enough for trending
          break
      }
      loadMore(activeMode, options)
    }
  }, [hasMore, productsLoading, activeMode, childAge, searchTerm, activeCategory, loadMore])

  // Categories for filtering
  const categories = [
    { id: "all", name: "Trending Now", count: totalResults, icon: "🔥" },
    { id: "toys", name: "Toys & Games", icon: "🧸" },
    { id: "books", name: "Books", icon: "📚" },
    { id: "clothes", name: "Clothing", icon: "👕" },
    { id: "art", name: "Art & Crafts", icon: "🎨" },
    { id: "sports", name: "Sports & Active", icon: "⚽" },
    { id: "games", name: "Board Games", icon: "🎲" },
  ]

  // Combine and filter products
  const allProducts = [...suggestions, ...searchResults]
  const filteredProducts = products.filter((product) => {
    const matchesPrice = !product.price || (product.price >= priceRange[0] && product.price <= priceRange[1])
    return matchesPrice
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
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <ContextualBreadcrumb currentPage="Browse Gifts" />

      {/* Header with Your Pattern */}
      <div 
        style={{
          backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px, cover',
          backgroundPosition: 'center',
        }} 
        className="relative md:h-auto h-auto rounded-2xl shadow-2xl overflow-hidden mb-2 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] mx-3 mt-6 sm:mx-4"
      >
        <div className="relative z-10 p-6 sm:p-8 text-white">
          {/* Header Content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left Side - Title and Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
              
                <div>
                  <h1 className="text-6xl  font-black leading-tight">
                    Gift Shop 
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base mt-1">
                    {activeMode === 'trending' 
                      ? `Perfect gifts for ${childAge ? `age ${childAge}` : 'kids'}! ✨`
                      : activeMode === 'search'
                      ? `Search results for "${searchTerm}"`
                      : `${categories.find(c => c.id === activeCategory)?.name || 'Products'} for ${partyDetails?.child_name}`}
                  </p>
                </div>
              </div>

              {/* Registry Stats */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    {registryItems.length} items in registry
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link href={`/gift-registry/${registryId}/preview`}>
                    View Registry
                  </Link>
                </Button>
              </div>

              {/* Search Bar */}
              <div className="flex gap-3 max-w-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                  <Input
                    placeholder="Search for perfect gifts..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 h-12 border-2 border-white/30 focus:border-white bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSearching && searchTerm.trim()) {
                        handleSearchSubmit()
                      }
                    }}
                  />
                  
                  {/* Search indicator */}
                  {isSearching && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    </div>
                  )}
                  
                  {/* Clear search button */}
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        handleCategoryChange("all")
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                      type="button"
                    >
                      <X className="w-4 h-4 text-white/70 hover:text-white" />
                    </button>
                  )}
                </div>
                
                <Button
                  onClick={handleSearchSubmit}
                  disabled={productsLoading || !searchTerm.trim()}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                  {productsLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Search</span>
                      <Search className="w-4 h-4 sm:hidden" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Side - Decorative Elements */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-white/80" />
                </div>
                {/* Floating decorative elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 -left-4 w-3 h-3 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {productsError && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-300/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium">{productsError}</span>
                <button
                  onClick={() => {
                    reset()
                    if (activeMode === 'search') {
                      handleSearchSubmit()
                    } else if (activeMode === 'category') {
                      handleCategoryChange(activeCategory)
                    } else {
                      loadProducts('trending', { age: childAge, limit: 20 })
                    }
                  }}
                  className="ml-auto text-white hover:text-white/80 underline font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-6">
          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            handleCategoryChange(category.id)
                            setShowFilters(false)
                          }}
                          disabled={productsLoading}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                            (activeCategory === category.id) ||
                            (activeMode === "trending" && category.id === "all")
                              ? "bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.name}
                            </span>
                            {totalResults > 0 && category.id === "all" && (
                              <span className="text-xs text-gray-400">({totalResults}+)</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                    <div className="px-2">
                      <Slider 
                        value={priceRange} 
                        onValueChange={setPriceRange} 
                        max={100} 
                        step={5} 
                        className="mb-3" 
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>£{priceRange[0]}</span>
                        <span>£{priceRange[1]}+</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Custom Item */}
                  <div className="border-t border-gray-200 pt-6">
                    <Button
                      onClick={() => {
                        setShowCustomForm(true)
                        setShowFilters(false)
                      }}
                      variant="outline"
                      className="w-full border-dashed border-[hsl(var(--primary-300))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Custom Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      disabled={productsLoading}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                        (activeCategory === category.id) ||
                        (activeMode === "trending" && category.id === "all")
                          ? "bg-[hsl(var(--primary-100))] text-[hsl(var(--primary-700))] font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                        {totalResults > 0 && category.id === "all" && (
                          <span className="text-xs text-gray-400">({totalResults}+)</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider 
                    value={priceRange} 
                    onValueChange={setPriceRange} 
                    max={100} 
                    step={5} 
                    className="mb-3" 
                  />
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
          <div className="flex-1">
            {/* Toolbar - Mobile Optimized */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-xs sm:text-sm text-gray-600">
                  {sortedProducts.length} products
                </span>
                
                {/* Mobile Filters Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)} 
                  className="lg:hidden border border-gray-200 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Sort - Mobile Optimized */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 sm:w-48 text-xs sm:text-sm">
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

                {/* View Mode - Hidden on mobile since we force grid */}
                <div className="hidden sm:flex border border-gray-200 rounded-lg">
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

            {/* Products Grid - Mobile Optimized */}
            {productsLoading && products.length === 0 ? (
              <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProductCardSkeleton key={i} viewMode="grid" />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <>
                <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode="grid" // Force grid on mobile
                      onAddToRegistry={() => handleAddToRegistry(product)}
                      onViewDetails={() => handleViewDetails(product)}
                      isAdded={registryItems.some((item) => item.gift_item_id === product.id)}
                      isLoading={addingItem === product.id}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      className="border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 min-w-[220px] flex items-center justify-center space-x-2 mx-auto py-8"
                      onClick={handleLoadMore}
                      disabled={productsLoading}
                    >
                      {productsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Snappy's on it...</span>
                        </>
                      ) : (
                        <>
                          <Image
                            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753217700/h4j3wqioc81ybvri0wgy.png"
                            alt="Snappy icon"
                            width={60}
                            height={60}
                            className="inline-block"
                          />
                          <span className="text-black">Load More Fun!</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {productsError ? 'Unable to load products' : 'No products found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {productsError 
                    ? 'There was an issue loading products. Please try again.'
                    : activeMode === 'search'
                    ? 'Try different search terms or browse categories'
                    : 'Try adjusting your filters or check back later'}
                </p>
                <div className="space-x-3">
                  <Button
                    onClick={() => {
                      reset()
                      handleCategoryChange("all")
                      setPriceRange([0, 100])
                      setSearchTerm("")
                    }}
                    variant="outline"
                  >
                    {productsError ? 'Try Again' : 'Show Trending Products'}
                  </Button>
                  {activeMode === 'search' && (
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        handleCategoryChange("all")
                      }}
                      className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white"
                    >
                      Browse All Products
                    </Button>
                  )}
                </div>
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

// Product Card Component - Mobile Optimized
function ProductCard({ product, viewMode, onAddToRegistry, onViewDetails, isAdded, isLoading }) {
  return (
    <Card className="border border-gray-200 hover:border-[hsl(var(--primary-300))] hover:shadow-lg transition-all duration-200 bg-white group">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden cursor-pointer"
             onClick={onViewDetails}>
          {product.image_url ? (
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.popularity > 80 && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs border-yellow-200">⭐ Popular</Badge>
            )}
            {product.discount && (
              <Badge className="bg-red-100 text-red-800 text-xs border-red-200">-{product.discount}%</Badge>
            )}
          </div>

          {/* Quick Add Button - Hidden on mobile for better UX */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering the modal
                onAddToRegistry()
              }}
              disabled={isAdded || isLoading}
              className={isAdded
                ? "bg-emerald-500 text-white cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-[hsl(var(--primary-50))] border border-gray-200"}
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

        {/* Product Info - Mobile Optimized */}
        <div className="p-2 sm:p-4">
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm cursor-pointer hover:text-[hsl(var(--primary-600))] transition-colors"
              onClick={onViewDetails}>
            {product.name}
          </h3>

          {/* Rating - Smaller on mobile */}
          {product.rating && (
            <div className="flex items-center mb-1 sm:mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2 h-2 sm:w-3 sm:h-3 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <span className="text-sm sm:text-lg font-bold text-[hsl(var(--primary-600))]">
                {product.price ? `£${product.price}` : product.price_range}
              </span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through ml-2">
                  £{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add to Registry Button - Mobile Optimized */}
          <Button
            onClick={onAddToRegistry}
            disabled={isAdded || isLoading}
            className={`w-full ${isAdded
              ? "bg-emerald-100 text-emerald-800 cursor-not-allowed hover:bg-emerald-100"
              : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"}`}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-xs sm:text-sm">Adding...</span>
              </>
            ) : isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Add to Registry</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Product Card Skeleton - Mobile Optimized
function ProductCardSkeleton({ viewMode }) {
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-0">
        <div className="aspect-square bg-gray-200 rounded-t-lg animate-pulse"></div>
        <div className="p-2 sm:p-4">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-1 sm:mb-2 animate-pulse"></div>
          <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2 mb-2 sm:mb-3 animate-pulse"></div>
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-20 mb-2 sm:mb-3 animate-pulse"></div>
          <div className="h-7 sm:h-9 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}
