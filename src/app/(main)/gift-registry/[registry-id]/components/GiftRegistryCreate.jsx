"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { useEnhancedGiftProducts } from "../hooks/useEnhancedGiftProducts"
import { Gift, Plus, Check, Search, ArrowLeft, Grid3X3, List, Star, ShoppingCart, Loader2, Sparkles, Filter, X, Upload, Image as ImageIcon } from 'lucide-react'
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [headerImage, setHeaderImage] = useState(null)

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [guestName, setGuestName] = useState("")

  // Personalization modal state
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false)
  const [personalizationData, setPersonalizationData] = useState({
    favoriteThing: '',  // Just one favorite thing
    childPhoto: null
  })
  const [uploadingChildPhoto, setUploadingChildPhoto] = useState(false)
  const [hasCompletedPersonalization, setHasCompletedPersonalization] = useState(false)
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false)

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

  useEffect(() => {
    console.log("Registry Items:", registryItems)
    console.log("Sample registry item structure:", registryItems[0])
    if (products.length > 0) {
      console.log("Sample product structure:", products[0])
    }
  }, [registryItems, products])

  const handleAddToRegistry = async (product) => {
    // Set loading state for this specific product
    setAddingItem(product.id)
    
    try {
      let result
      if (product.source === "amazon") {
        result = await partyDatabaseBackend.addRealProductToRegistry(registryId, product, { priority: "medium" })
      } else {
        result = await partyDatabaseBackend.addCuratedItemToRegistry(registryId, product.id, { priority: "medium" })
      }
      
      if (result.success) {
        // Add to local state immediately for instant feedback
        setRegistryItems((prev) => [...prev, result.registryItem])
        
        // Optional: Show a toast notification for success
        // showToast({ 
        //   type: 'success', 
        //   message: `${product.name} added to registry!` 
        // })
        
        console.log("Item successfully added to registry:", result.registryItem)
      } else {
        console.error("Failed to add item:", result.error)
        
        // Optional: Show error toast
        // showToast({ 
        //   type: 'error', 
        //   message: 'Failed to add item. Please try again.' 
        // })
      }
    } catch (error) {
      console.error("Error adding product:", error)
      
      // Optional: Show error toast
      // showToast({ 
      //   type: 'error', 
      //   message: 'Something went wrong. Please try again.' 
      // })
    } finally {
      // Always clear loading state
      setAddingItem(null)
    }
  }

  // Helper function to check if a product is already in the registry
const isProductInRegistry = (productId) => {
  return registryItems.some((item) => {
    // Check both gift_item_id and custom matching
    return item.gift_item_id === productId || 
           item.gift_items?.id === productId ||
           item.id === productId
  })
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

  // Personalization handlers
  const handlePersonalizationSubmit = async () => {
    // Validate that favorite thing is filled
    if (!personalizationData.favoriteThing.trim()) {
      alert('Please enter their favorite thing')
      return
    }

    try {
      // Save personalization data to registry
      const result = await partyDatabaseBackend.updateRegistryPersonalization(
        registryId,
        personalizationData
      )

      if (result.success) {
        // If child photo was uploaded, also set it as the header image
        if (personalizationData.childPhoto) {
          const headerResult = await partyDatabaseBackend.updateRegistryHeaderImage(
            registryId,
            personalizationData.childPhoto
          )
          if (headerResult.success) {
            setHeaderImage(personalizationData.childPhoto)
          }
        }

        setShowPersonalizationModal(false)
        setHasCompletedPersonalization(true)
        // Mark as completed in localStorage
        localStorage.setItem(`registry_${registryId}_personalized`, 'true')
        // Reload registry to get updated data
        loadRegistryData()
      }
    } catch (error) {
      console.error('Error saving personalization:', error)
    }
  }

  const handleChildPhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }

    setUploadingChildPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gift_registry_child_photos')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setPersonalizationData(prev => ({
          ...prev,
          childPhoto: data.url
        }))
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingChildPhoto(false)
    }
  }

  // Load registry and party details
  const loadRegistryData = async () => {
    try {
      console.log("Loading registry:", registryId)
      const result = await partyDatabaseBackend.getRegistryById(registryId)
      if (result.success && result.registry) {
        setRegistryData(result.registry)
        setRegistryItems(result.items || [])
        setHeaderImage(result.registry.header_image || null)

        // Load personalization data if exists
        if (result.registry.personalization_data) {
          setPersonalizationData(result.registry.personalization_data)
        }

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

  useEffect(() => {
    if (registryId) {
      loadRegistryData()
    }
  }, [registryId])

  // Check if personalization is needed on first load
  useEffect(() => {
    if (!loading && registryData) {
      const hasPersonalized = localStorage.getItem(`registry_${registryId}_personalized`)
      const hasPersonalizationData = registryData.personalization_data

      // If already personalized, mark as completed so products can load
      if (hasPersonalized || hasPersonalizationData) {
        setHasCompletedPersonalization(true)
      }

      // Show modal if never personalized OR if no personalization data exists
      if (!hasPersonalized && !hasPersonalizationData) {
        setShowPersonalizationModal(true)
      }
    }
  }, [loading, registryData, registryId])

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file")
      return
    }

    setUploadingImage(true)

    try {
      // Create FormData and upload to Cloudinary using API route
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gift_registry_headers')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.url

      // Update registry with new header image
      const updateResult = await partyDatabaseBackend.updateRegistryHeaderImage(registryId, imageUrl)

      if (updateResult.success) {
        setHeaderImage(imageUrl)
        alert('Header image updated successfully!')
      } else {
        throw new Error(updateResult.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Load products only when personalization is completed
  useEffect(() => {
    // Only load once after personalization
    if (hasLoadedProducts) {
      return
    }

    if (hasCompletedPersonalization && registryData?.personalization_data && registryData?.parties?.child_age) {
      const { favoriteThing } = registryData.personalization_data

      if (favoriteThing && favoriteThing.trim()) {
        console.log("🎯 Searching for personalized products:", favoriteThing)

        // Use search mode with the one favorite thing
        setActiveMode("search")
        setSearchTerm(favoriteThing)
        reset()

        loadProducts('search', {
          searchTerm: favoriteThing,
          age: registryData.parties.child_age,
          limit: 20
        })

        setHasLoadedProducts(true)
      }
    }
  }, [hasCompletedPersonalization, registryData, loadProducts, hasLoadedProducts, reset])

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

      // Add personalization keywords for trending mode
      if (activeMode === 'trending' && registryData?.personalization_data) {
        const { favoriteThings } = registryData.personalization_data
        const allPreferences = (favoriteThings || []).filter(item => item && item.trim() !== '')
        if (allPreferences.length > 0) {
          options.keywords = allPreferences.join(' ')
        }
      }

      switch (activeMode) {
        case 'search':
          options.searchTerm = searchTerm
          break
        case 'category':
          options.category = activeCategory
          break
        case 'trending':
        default:
          // Keywords already added above if personalization exists
          break
      }
      loadMore(activeMode, options)
    }
  }, [hasMore, productsLoading, activeMode, childAge, searchTerm, activeCategory, loadMore, registryData])

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

      {/* Personalization Modal */}
      {showPersonalizationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-[hsl(var(--primary-500))] rounded-t-3xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Make {partyDetails?.child_name?.split(' ')[0]}'s wish list extra special
              </h2>
              <p className="text-white/90">
                Tell us what they love so we can suggest the perfect gifts
              </p>
            </div>

            <div className="p-8">

              <div className="space-y-6">
                {/* Child Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Add their photo so guests see their smiling face
                  </label>
                  <div className="flex items-center gap-4">
                    {personalizationData.childPhoto ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={personalizationData.childPhoto}
                          alt="Child"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        <span className="text-3xl">📸</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="child-photo-upload"
                      accept="image/*"
                      onChange={handleChildPhotoUpload}
                      className="hidden"
                    />
                    <label htmlFor="child-photo-upload">
                      <Button
                        type="button"
                        disabled={uploadingChildPhoto}
                        className="cursor-pointer bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
                        onClick={() => document.getElementById('child-photo-upload').click()}
                      >
                        {uploadingChildPhoto ? (
                          'Uploading...'
                        ) : (
                          personalizationData.childPhoto ? 'Change photo' : 'Upload photo'
                        )}
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Favorite Thing */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    What's {partyDetails?.child_name?.split(' ')[0]}'s favorite thing?
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    TV show, book, character, hobby - anything they love!
                  </p>
                  <Input
                    placeholder="e.g., Bluey, LEGO, Harry Potter"
                    value={personalizationData.favoriteThing}
                    onChange={(e) => {
                      setPersonalizationData(prev => ({
                        ...prev,
                        favoriteThing: e.target.value
                      }))
                    }}
                    className="mb-3"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    You can search for more gifts after this
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <Button
                  onClick={handlePersonalizationSubmit}
                  className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
                >
                  Create wish list
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Magical Personal Style */}
      <div className="relative rounded-2xl shadow-lg overflow-hidden mb-4 mx-3 mt-6 sm:mx-4">
        {/* Mobile: Full width with overlay */}
        <div className="md:hidden">
          {headerImage ? (
            <div className="relative h-[280px] bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))]">
              <img
                src={headerImage}
                alt={partyDetails?.child_name || 'Child'}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h1 className="text-2xl font-black mb-3 drop-shadow-lg">
                  ✨ {partyDetails?.child_name ? `${partyDetails.child_name.split(' ')[0]}'s Dream Gifts` : 'Dream Gifts'} ✨
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white">
                    <ShoppingCart className="w-3 h-3 text-[hsl(var(--primary-600))]" />
                    <span className="text-xs font-bold text-[hsl(var(--primary-600))]">
                      {registryItems.length} gifts
                    </span>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="header-image-upload-mobile"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="header-image-upload-mobile">
                      <Button
                        type="button"
                        size="sm"
                        disabled={uploadingImage}
                        className="bg-white/90 hover:bg-white text-[hsl(var(--primary-600))] text-xs rounded-full h-auto px-3 py-1.5 cursor-pointer font-semibold"
                        onClick={() => document.getElementById('header-image-upload-mobile').click()}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-[hsl(var(--primary-600))] border-t-transparent" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 mr-1" />
                            Change
                          </>
                        )}
                      </Button>
                    </label>
                  </div>

                  <Button
                    size="sm"
                    className="bg-white/90 hover:bg-white text-[hsl(var(--primary-600))] text-xs rounded-full h-auto px-3 py-1.5 font-semibold"
                    asChild
                  >
                    <Link
                      href={`/gift-registry/${registryId}/preview`}
                      onClick={() => {
                        // Mark that owner is viewing
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem(`registry_${registryId}_owner`, 'true')
                        }
                      }}
                    >
                      View
                    </Link>
                  </Button>
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
                  ✨ {partyDetails?.child_name ? `${partyDetails.child_name.split(' ')[0]}'s Dream Gifts` : 'Dream Gifts'} ✨
                </h1>
                <p className="text-sm text-center opacity-90 mb-4">Add a magical photo!</p>

                <input
                  type="file"
                  id="header-image-upload-mobile-empty"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label htmlFor="header-image-upload-mobile-empty">
                  <Button
                    type="button"
                    size="lg"
                    disabled={uploadingImage}
                    className="bg-white hover:bg-white/90 text-[hsl(var(--primary-600))] rounded-full cursor-pointer font-bold shadow-lg"
                    onClick={() => document.getElementById('header-image-upload-mobile-empty').click()}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-[hsl(var(--primary-600))] border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Add Photo
                      </>
                    )}
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Side by side split */}
        <div className="hidden md:grid md:grid-cols-5 gap-0 bg-white">
          {/* Left Side - Child's Photo */}
          <div className="md:col-span-2 relative bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] h-[220px]">
            {headerImage ? (
              <img
                src={headerImage}
                alt={partyDetails?.child_name || 'Child'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-12 h-12 text-white" />
                </div>
                <p className="text-sm font-medium text-center">Upload your child's photo</p>
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
                ✨ {partyDetails?.child_name ? `${partyDetails.child_name.split(' ')[0]}'s Dream Gifts` : 'Dream Gifts'} ✨
              </h1>

              <p className="text-sm mb-4 drop-shadow-lg font-medium opacity-90">
                Build the perfect gift registry
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-white">
                  <ShoppingCart className="w-4 h-4 text-[hsl(var(--primary-600))]" />
                  <span className="text-sm font-bold text-[hsl(var(--primary-600))]">
                    {registryItems.length} items
                  </span>
                </div>

                <div>
                  <input
                    type="file"
                    id="header-image-upload-desktop"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="header-image-upload-desktop">
                    <Button
                      type="button"
                      size="sm"
                      disabled={uploadingImage}
                      className="bg-white/90 hover:bg-white text-[hsl(var(--primary-600))] rounded-full font-semibold cursor-pointer"
                      onClick={() => document.getElementById('header-image-upload-desktop').click()}
                    >
                      {uploadingImage ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-[hsl(var(--primary-600))] border-t-transparent" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {headerImage ? 'Change Photo' : 'Add Photo'}
                        </>
                      )}
                    </Button>
                  </label>
                </div>

                <Button
                  size="sm"
                  className="bg-white/90 hover:bg-white text-[hsl(var(--primary-600))] rounded-full font-semibold"
                  asChild
                >
                  <Link
                    href={`/gift-registry/${registryId}/preview`}
                    onClick={() => {
                      // Mark that owner is viewing
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem(`registry_${registryId}_owner`, 'true')
                      }
                    }}
                  >
                    View Registry
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Outside Header */}
      <div className="px-3 sm:px-4 mb-4">
        <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              placeholder="Search for perfect gifts..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 sm:pl-12 h-11 sm:h-12 border-2 border-gray-200 focus:border-[hsl(var(--primary-500))] bg-white text-gray-900 placeholder:text-gray-400 rounded-xl"
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
                  handleCategoryChange("all")
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>

          <Button
            onClick={handleSearchSubmit}
            disabled={productsLoading || !searchTerm.trim()}
            className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-4 sm:px-6 h-11 sm:h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Error Message */}
        {productsError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium text-sm">{productsError}</span>
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
                className="ml-auto text-red-700 hover:text-red-800 underline font-medium text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
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
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  {sortedProducts.length} products
                </span>

                {/* Mobile Filters Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden h-8 px-2.5 text-xs border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <span>Filters</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Sort - Mobile Optimized */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px] sm:w-[160px] h-8 text-[11px] border-gray-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance" className="text-xs">Most Relevant</SelectItem>
                    <SelectItem value="popularity" className="text-xs">Most Popular</SelectItem>
                    <SelectItem value="price-low" className="text-xs">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="text-xs">Price: High to Low</SelectItem>
                    <SelectItem value="rating" className="text-xs">Highest Rated</SelectItem>
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
                {sortedProducts.map((product) => {
  // Correct way to check if product is in registry
  const isInRegistry = registryItems.some((item) => {
    // For external products (Amazon), check external_product_id
    if (item.external_product_id && product.id) {
      return item.external_product_id === product.id
    }
    
    // For curated products, check gift_item_id
    if (item.gift_item_id && product.id) {
      return item.gift_item_id === product.id
    }
    
    // Fallback checks
    return item.gift_items?.id === product.id || item.id === product.id
  })
  
  return (
    <ProductCard
      key={product.id}
      product={product}
      viewMode="grid"
      onAddToRegistry={() => handleAddToRegistry(product)}
      onViewDetails={() => handleViewDetails(product)}
      isAdded={isInRegistry}
      isLoading={addingItem === product.id}
    />
  )
})}

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
        isCreateMode={true}
      />
    </div>
  )
}


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
            {/* Added to Registry Badge */}
            {isAdded && (
              <Badge className="bg-emerald-100 text-emerald-800 text-xs border-emerald-200 font-medium">
                <Check className="w-3 h-3 mr-1" />
                In Registry
              </Badge>
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
                ? "bg-emerald-500 text-white cursor-not-allowed shadow-sm"
                : isLoading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-[hsl(var(--primary-50))] border border-gray-200 shadow-sm"}
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

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <div className="w-6 h-6 animate-spin rounded-full border-3 border-[hsl(var(--primary-500))] border-t-transparent" />
              </div>
            </div>
          )}
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

          {/* Add to Registry Button - Enhanced with better visual feedback */}
          <Button
            onClick={onAddToRegistry}
            disabled={isAdded || isLoading}
            className={`w-full transition-all duration-300 ${
              isAdded
                ? "bg-emerald-500 hover:bg-emerald-500 text-white cursor-not-allowed shadow-sm ring-2 ring-emerald-200"
                : isLoading 
                ? "bg-gray-200 hover:bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white hover:shadow-md transform hover:scale-[1.02]"
            }`}
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                <span className="text-xs sm:text-sm">Adding...</span>
              </>
            ) : isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium">Added to Registry</span>
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
