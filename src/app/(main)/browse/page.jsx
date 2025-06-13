"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from '@/components/ContextualBreadcrumb';
import { useContextualNavigation } from '@/hooks/useContextualNavigation';
import { Skeleton } from "@/components/ui/skeleton"
import LoadMoreSuppliersSection from "./pagination";
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MapPin,
  Star,
  Filter,
  Music,
  Building,
  Utensils,
  Palette,
  Gift,
  Camera,
  Gamepad2,
  Sparkles,
  User,
  Heart,
  ChevronDown,
  Calendar,
  Users,
  X,
  Clock,
  TrendingUp,
  ChevronUp,
  Settings,
  Grid3X3,
  SlidersHorizontal
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MobileNav from "@/components/mobile-nav"
import { useSuppliers } from '@/utils/mockBackend';

export default function BrowseSuppliersPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [subcategory, setSubcategory] = useState("all")
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // New modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const categories = [
    { id: "all", name: "All", icon: <Sparkles className="w-5 h-5" /> },
    { id: "entertainment", name: "Entertainment", icon: <Music className="w-5 h-5" /> },
    { id: "venues", name: "Venues", icon: <Building className="w-5 h-5" /> },
    { id: "catering", name: "Catering", icon: <Utensils className="w-5 h-5" /> },
    { id: "decorations", name: "Decorations", icon: <Palette className="w-5 h-5" /> },
    { id: "party-bags", name: "Party Bags", icon: <Gift className="w-5 h-5" /> },
    { id: "photography", name: "Photography", icon: <Camera className="w-5 h-5" /> },
    { id: "activities", name: "Activities", icon: <Gamepad2 className="w-5 h-5" /> },
  ]

  const subcategories = {
    entertainment: [
      "All Entertainment",
      "Magicians",
      "Character Visits",
      "Face Painters",
      "Balloon Artists",
      "Clowns",
      "Puppet Shows",
      "Music & DJs",
    ],
    venues: [
      "All Venues",
      "Community Halls",
      "Play Centers",
      "Outdoor Spaces",
      "Party Rooms",
      "Sports Centers",
      "Museums",
      "Home Setup",
    ],
    catering: [
      "All Catering",
      "Party Food Packages",
      "Birthday Cakes",
      "Themed Treats",
      "Healthy Options",
      "Dietary Specific",
      "Drinks & Beverages",
    ],
    decorations: [
      "All Decorations",
      "Balloon Displays",
      "Themed Decorations",
      "Table Settings",
      "Banners & Signs",
      "Centerpieces",
      "Backdrop & Props",
    ],
    "party-bags": [
      "All Party Bags",
      "Themed Bags",
      "Eco-Friendly",
      "Educational Toys",
      "Sweet Treats",
      "Craft Kits",
      "Age-Specific",
    ],
    photography: [
      "All Photography",
      "Party Photographers",
      "Photo Booths",
      "Video Services",
      "Instant Prints",
      "Digital Galleries",
    ],
    activities: [
      "All Activities",
      "Bouncy Castles",
      "Craft Activities",
      "Games & Competitions",
      "Science Shows",
      "Sports Activities",
      "Treasure Hunts",
    ],
  }

  // Popular search terms for suggestions
  const popularSearches = [
    "Magicians",
    "Bouncy castle", 
    "Face painting",
    "Birthday cake",
    "Photography",
    "DJ",
    "Character visit",
    "Balloon artist",
    "Princess party",
    "Superhero",
    "Unicorn",
    "Dinosaur",
    "Taylor Swift",
    "Science show"
  ];

  const { suppliers: backendSuppliers, loading: suppliersLoading, error } = useSuppliers();

  // Enhanced search function
  const searchSuppliers = (suppliers, query) => {
    if (!query.trim()) return suppliers;
    
    const searchTerm = query.toLowerCase().trim();
    
    return suppliers.filter((supplier) => {
      // Search in name
      if (supplier.name.toLowerCase().includes(searchTerm)) return true;
      
      // Search in description
      if (supplier.description.toLowerCase().includes(searchTerm)) return true;
      
      // Search in category
      if (supplier.category.toLowerCase().includes(searchTerm)) return true;
      
      // Search in subcategory
      if (supplier.subcategory.toLowerCase().includes(searchTerm)) return true;
      
      // Search in themes (if exists)
      if (supplier.themes && supplier.themes.some(theme => 
        theme.toLowerCase().includes(searchTerm)
      )) return true;
      
      // Search in badges
      if (supplier.badges && supplier.badges.some(badge => 
        badge.toLowerCase().includes(searchTerm)
      )) return true;
      
      // Search in location
      if (supplier.location.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });
  };

  // Enhanced filtering function
  const filteredSuppliers = backendSuppliers.filter((supplier) => {
    // Category filter
    if (selectedCategory !== "all" && supplier.category.toLowerCase() !== selectedCategory) return false;
    
    // Subcategory filter
    if (subcategory !== "all" && supplier.subcategory !== subcategory) return false;
    
    // Location filter
    if (selectedLocation && selectedLocation !== "all") {
      const locationMatch = supplier.location.toLowerCase().includes(selectedLocation.toLowerCase().replace('-', ' '));
      if (!locationMatch) return false;
    }
    
    // Price range filter
    if (priceRange !== "all") {
      const price = supplier.priceFrom;
      switch (priceRange) {
        case "0-50":
          if (price > 50) return false;
          break;
        case "50-100":
          if (price < 50 || price > 100) return false;
          break;
        case "100-200":
          if (price < 100 || price > 200) return false;
          break;
        case "200+":
          if (price < 200) return false;
          break;
      }
    }
    
    return true;
  });

  // Apply search to filtered suppliers
  const searchedSuppliers = searchSuppliers(filteredSuppliers, searchQuery);

  const toggleFavorite = supplierId => {
    setFavorites(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    )
  }
  
  const getAvailableSubcategories = () => {
    if (selectedCategory === "all") return ["All Categories"]
    return subcategories[selectedCategory] || ["All"]
  }
  
  const { navigateWithContext, navigationContext } = useContextualNavigation();

  // Simulate loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
  const handleSupplierClick = (supplierId) => {
    // Change this line to go to test page:
    navigateWithContext(`/supplier/${supplierId}`, navigationContext || 'browse');
    
    // Original line (comment out):
    // navigateWithContext(`/supplier/${supplierId}`, navigationContext || 'browse');
  };

  // Search handling functions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (query) => {
    if (query.trim()) {
      // Add to search history (keep last 5)
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
        return newHistory;
      });
    }
    setShowSearchSuggestions(false);
    setShowSearchModal(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchSuggestions(false);
  };

  const handlePopularSearchClick = (term) => {
    setSearchQuery(term);
    handleSearchSubmit(term);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearchSubmit(suggestion);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSubcategory("all");
  };

  // Get search suggestions based on current query
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = [];
    
    // Add matching popular searches
    popularSearches.forEach(term => {
      if (term.toLowerCase().includes(query) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });
    
    // Add matching supplier names
    backendSuppliers.forEach(supplier => {
      if (supplier.name.toLowerCase().includes(query) && !suggestions.includes(supplier.name)) {
        suggestions.push(supplier.name);
      }
    });
    
    // Add matching categories/subcategories
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(query) && !suggestions.includes(cat.name)) {
        suggestions.push(cat.name);
      }
    });
    
    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Check if any filters are active
  const hasActiveFilters = subcategory !== "all" || 
                          selectedLocation !== "" || 
                          priceRange !== "all";

  // Clear all filters
  const clearAllFilters = () => {
    setSubcategory("all");
    setSelectedLocation("");
    setPriceRange("all");
    setSelectedCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContextualBreadcrumb currentPage="browse"/>
 {/* Hero Section - Simpler Approach */}
<div 
  className="relative w-full h-[50vh] md:h-[50vh] lg:h-[60vh] overflow-hidden bg-cover md:bg-left bg-no-repeat bg-[url(https://media.istockphoto.com/id/1820228846/photo/photo-of-positive-attractive-guy-hand-hold-wired-microphone-singing-flying-confetti-christmas.jpg?s=612x612&w=0&k=20&c=7JN43WzSQJQkCN2kOnXkonLFVxDFF8wXHflsSCKsaUg=)] bg-bottom-left"
>
  {/* Strong dark overlay */}
  <div className="absolute inset-0 bg-black/10"></div>
  
  {/* Hero Content Overlay */}
  <div className="relative h-full flex items-center justify-center px-4">
    <div className="max-w-4xl mx-auto text-center text-white">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-2xl text-shadow-lg">
  Find trusted
  <span className="text-white block drop-shadow-2xl">Party Suppliers</span>
</h1>
      <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-2xl font-semibold text-shadow-md">
      Create magical moments. Everything you need for the perfect party, all in one place.
      </p>
    </div>
  </div>

  {/* Bottom fade for smooth transition */}
  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
</div>

      {/* Search & Filter Controls */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchedSuppliers.length} Suppliers Found
              </h2>
              
              {/* Active Search Display */}
              {searchQuery && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">"{searchQuery}"</span>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <Filter className="w-3 h-3 mr-1" />
                    Filters Active
                  </Badge>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Search & Filter Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSearchModal(true)}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowFiltersModal(true)}
                className={`border-gray-200 ${hasActiveFilters ? 'bg-orange-50 border-orange-200 text-orange-700' : 'hover:bg-gray-50'}`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-orange-600 text-white text-xs">
                    {[subcategory !== "all", selectedLocation !== "", priceRange !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs - Non-sticky */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex flex-col items-center space-y-2 px-4 py-3 rounded-xl min-w-[90px] transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary-100 text-primary-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                      selectedCategory === category.id ? "bg-primary-200" : "bg-gray-100"
                    }`}
                  >
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-screen mx-auto px-3 py-8">
        <LoadMoreSuppliersSection
          allSuppliers={searchedSuppliers}
          isInitialLoading={isLoading}
          onSupplierClick={handleSupplierClick}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Search Suppliers</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for suppliers, services, themes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                    }
                  }}
                  className="pl-12 pr-4 py-4 text-lg border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  autoFocus
                />
              </div>

              {/* Search Results Summary */}
              {searchQuery && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">
                      <span className="font-semibold">{searchedSuppliers.length}</span> results for "{searchQuery}"
                    </span>
                    <Button size="sm" onClick={() => handleSearchSubmit(searchQuery)}>
                      Search
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            <div className="max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {!searchQuery && searchHistory.length > 0 && (
                <div className="px-6 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Searches
                  </h4>
                  <div className="space-y-2">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(term)}
                        className="flex items-center space-x-3 w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {!searchQuery && (
                <div className="px-6 pb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handlePopularSearchClick(term)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Suggestions */}
              {searchQuery && getSearchSuggestions().length > 0 && (
                <div className="px-6 pb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Suggestions</h4>
                  <div className="space-y-2">
                    {getSearchSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center space-x-3 w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900">Filter Suppliers</h3>
                {hasActiveFilters && (
                  <Badge className="bg-orange-100 text-orange-800">
                    {[subcategory !== "all", selectedLocation !== "", priceRange !== "all"].filter(Boolean).length} active
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subcategory
                  </label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSubcategories().map((sub) => (
                        <SelectItem key={sub} value={sub === getAvailableSubcategories()[0] ? "all" : sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Location
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
                      <SelectItem value="central-london">Central London</SelectItem>
                      <SelectItem value="north-london">North London</SelectItem>
                      <SelectItem value="south-london">South London</SelectItem>
                      <SelectItem value="east-london">East London</SelectItem>
                      <SelectItem value="west-london">West London</SelectItem>
                      <SelectItem value="uk-wide">UK Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All prices</SelectItem>
                      <SelectItem value="0-50">£0 - £50</SelectItem>
                      <SelectItem value="50-100">£50 - £100</SelectItem>
                      <SelectItem value="100-200">£100 - £200</SelectItem>
                      <SelectItem value="200+">£200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {searchedSuppliers.length} suppliers match your criteria
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowFiltersModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowFiltersModal(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close modals */}
      {(showSearchModal || showFiltersModal) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSearchModal(false);
            setShowFiltersModal(false);
          }}
        />
      )}

      {/* Quick Action Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1 border-gray-200" asChild>
            <Link href="/dashboard">
              <Calendar className="w-4 h-4 mr-2" />
              My Dashboard
            </Link>
          </Button>
          <Button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white" asChild>
            <Link href="/dashboard">
              <Users className="w-4 h-4 mr-2" />
              Plan Party
            </Link>
          </Button>
        </div>
      </div>

      {/* Bottom Padding for Mobile Action Bar */}
      <div className="md:hidden h-20"></div>
    </div>
  )
}