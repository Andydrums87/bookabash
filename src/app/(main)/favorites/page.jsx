"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Star, 
  MapPin, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  Clock,
  Filter,
  Grid3X3,
  List,
  Search,
  X,
  Crown,
  Zap,
  Sparkles,
  Rocket,
  Palette,
  Music
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useContextualNavigation } from '@/hooks/useContextualNavigation'
import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb'

// Theme configuration
const themeConfig = {
  princess: { name: "Princess", icon: <Crown className="w-3 h-3" />, color: "bg-pink-500" },
  superhero: { name: "Superhero", icon: <Zap className="w-3 h-3" />, color: "bg-red-500" },
  unicorn: { name: "Unicorn", icon: <Sparkles className="w-3 h-3" />, color: "bg-purple-500" },
  pirate: { name: "Pirate", icon: "🏴‍☠️", color: "bg-amber-600" },
  space: { name: "Space", icon: <Rocket className="w-3 h-3" />, color: "bg-blue-600" },
  dinosaur: { name: "Dinosaur", icon: "🦕", color: "bg-green-600" },
  art: { name: "Art & Craft", icon: <Palette className="w-3 h-3" />, color: "bg-indigo-500" },
  music: { name: "Music & Dance", icon: <Music className="w-3 h-3" />, color: "bg-purple-600" },
  sports: { name: "Sports", icon: "⚽", color: "bg-orange-500" },
  science: { name: "Science", icon: "🔬", color: "bg-cyan-500" },
  fairy: { name: "Fairy Tale", icon: "🧚", color: "bg-pink-400" },
  animals: { name: "Animals", icon: "🐾", color: "bg-yellow-600" }
};

const FavoritesPage = () => {
  const router = useRouter()
  const { navigateWithContext } = useContextualNavigation()
  const [favorites, setFavorites] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date_added') // 'date_added', 'name', 'price', 'rating'
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorite_suppliers')
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites)
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save favorites to localStorage
  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('favorite_suppliers', JSON.stringify(newFavorites))
      setFavorites(newFavorites)
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }

  // Remove from favorites
  const removeFromFavorites = (supplierId) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== supplierId)
    saveFavorites(updatedFavorites)
  }

  // Clear all favorites
  const clearAllFavorites = () => {
    saveFavorites([])
  }

  // Get unique categories from favorites
  const getCategories = () => {
    const categories = [...new Set(favorites.map(fav => fav.category))]
    return ['all', ...categories]
  }

  // Filter and sort favorites
  const getFilteredAndSortedFavorites = () => {
    let filtered = [...favorites]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(fav => 
        fav.name.toLowerCase().includes(query) ||
        fav.category.toLowerCase().includes(query) ||
        fav.location?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(fav => fav.category === filterCategory)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return (a.priceFrom || 0) - (b.priceFrom || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'date_added':
        default:
          return new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
      }
    })

    return filtered
  }

  const filteredFavorites = getFilteredAndSortedFavorites()

  // Handle supplier click
  const handleSupplierClick = (supplierId) => {
    router.push(`/supplier/${supplierId}`)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-pink-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">No favorites yet</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Start building your dream party by saving suppliers you love. 
            Click the ❤️ icon on any supplier to add them here!
          </p>
          <Button asChild className="bg-primary-500 hover:bg-primary-600">
            <Link href="/browse">
              <Search className="w-4 h-4 mr-2" />
              Browse Suppliers
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Contextual Breadcrumb */}
      <ContextualBreadcrumb currentPage="favorites" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                My Favorites
              </h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} saved supplier{favorites.length !== 1 ? 's' : ''} ready for your party
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllFavorites}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <Button asChild className="bg-primary-500 hover:bg-primary-600">
                <Link href="/browse">
                  <Search className="w-4 h-4 mr-2" />
                  Find More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_added">Recently Added</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price">Price Low-High</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(searchQuery || filterCategory !== 'all') && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {filterCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filterCategory}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => setFilterCategory('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites match your filters</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredFavorites.length} of {favorites.length} favorites
              </p>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFavorites.map((supplier) => (
                  <Card key={supplier.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div 
                          className="w-full h-48 bg-primary-50 flex items-center justify-center overflow-hidden rounded-t-lg"
                          onClick={() => handleSupplierClick(supplier.id)}
                        >
                          <img
                            src={supplier.image || "/placeholder.png"}
                            alt={supplier.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        
                        {/* Remove from favorites button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromFavorites(supplier.id)
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm group/heart"
                        >
                          <Heart className="w-4 h-4 fill-pink-500 text-pink-500 group-hover/heart:scale-110 transition-transform" />
                        </button>

                        {/* Category badge */}
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
                            {supplier.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4">
                        {/* Rating and saved date */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{supplier.rating || 'N/A'}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(supplier.savedAt)}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-1 mb-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{supplier.location}</span>
                        </div>

                        {/* Name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {supplier.name}
                        </h3>

                        {/* Price and action */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              from £{supplier.priceFrom || 'TBC'}
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleSupplierClick(supplier.id)}
                            className="bg-primary-500 hover:bg-primary-600 text-white"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredFavorites.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Image */}
                        <div 
                          className="w-24 h-24 bg-primary-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                          onClick={() => handleSupplierClick(supplier.id)}
                        >
                          <img
                            src={supplier.image || "/placeholder.png"}
                            alt={supplier.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {supplier.name}
                              </h3>
                              
                              <div className="flex items-center gap-4 mb-3">
                                <Badge variant="outline">{supplier.category}</Badge>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold text-gray-900">{supplier.rating || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{supplier.location}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-gray-900">
                                  from £{supplier.priceFrom || 'TBC'}
                                </div>
                                <span className="text-sm text-gray-500">
                                  Saved {formatDate(supplier.savedAt)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-4">
                              <Button 
                                size="sm"
                                onClick={() => handleSupplierClick(supplier.id)}
                                className="bg-primary-500 hover:bg-primary-600 text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromFavorites(supplier.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage