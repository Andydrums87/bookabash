"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Crown,
  Zap,
  Rocket,
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

const partyThemes = [
  { id: "princess", name: "Princess", icon: <Crown className="w-4 h-4" />, color: "bg-pink-500", count: 31 },
  { id: "superhero", name: "Superhero", icon: <Zap className="w-4 h-4" />, color: "bg-red-500", count: 23 },
  { id: "unicorn", name: "Unicorn", icon: <Sparkles className="w-4 h-4" />, color: "bg-purple-500", count: 18 },
  { id: "pirate", name: "Pirate", icon: <div className="text-sm">🏴‍☠️</div>, color: "bg-amber-600", count: 15 },
  { id: "space", name: "Space", icon: <Rocket className="w-4 h-4" />, color: "bg-blue-600", count: 12 },
  { id: "dinosaur", name: "Dinosaur", icon: <div className="text-sm">🦕</div>, color: "bg-green-600", count: 19 },
  { id: "art", name: "Art & Craft", icon: <Palette className="w-4 h-4" />, color: "bg-indigo-500", count: 14 },
  { id: "music", name: "Music & Dance", icon: <Music className="w-4 h-4" />, color: "bg-purple-600", count: 16 },
  { id: "sports", name: "Sports", icon: <div className="text-sm">⚽</div>, color: "bg-orange-500", count: 11 },
  { id: "science", name: "Science", icon: <div className="text-sm">🔬</div>, color: "bg-cyan-500", count: 8 },
  { id: "fairy", name: "Fairy Tale", icon: <div className="text-sm">🧚</div>, color: "bg-pink-400", count: 13 },
  { id: "animals", name: "Animals", icon: <div className="text-sm">🐾</div>, color: "bg-yellow-600", count: 9 }
];


export default function BrowseSuppliersPage( { initialSuppliers = [] }) {
 
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [subcategory, setSubcategory] = useState("all")
  const [favorites, setFavorites] = useState([])

  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([])
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  // New modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [loading, setLoading] = useState(false)
  




  const categories = [
    { 
      id: "all", 
      name: "All", 
      icon: <Sparkles className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749848122/oml2ieudsno9szcjlngp.jpg" // Party essentials image
    },
    { 
      id: "entertainment", 
      name: "Entertainment", 
      icon: <Music className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png" // Activities image
    },
    { 
      id: "venues", 
      name: "Venues", 
      icon: <Building className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749848122/oml2ieudsno9szcjlngp.jpg" // Venue image
    },
    { 
      id: "catering", 
      name: "Catering", 
      icon: <Utensils className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749854566/lcjmipa6yfuspckl93nz.jpg" // Food image
    },
    { 
      id: "decorations", 
      name: "Decorations", 
      icon: <Palette className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png" // Decorations image
    },
    { 
      id: "bouncy-castles", 
      name: "Bouncy Castles", 
      icon: <div className="text-sm">🏰</div>,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594952/bouncy-castle_gaq0z4.png" // Bouncy castle image
    },
    { 
      id: "face-painting", 
      name: "Face Painting", 
      icon: <Palette className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1750170767/hlz6iinsgj7abeu0nndx.png" // Face painting image
    },
    { 
      id: "party-bags", 
      name: "Party Bags", 
      icon: <Gift className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749482131/daniel-alvasd-QJlg2KSl0fU-unsplash_vm4acf.jpg" // Party bags image
    },
    { 
      id: "photography", 
      name: "Photography", 
      icon: <Camera className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png" // Photography image
    },
    { 
      id: "magicians", 
      name: "Magicians", 
      icon: <div className="text-sm">🎩</div>,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753435484/zivotubsexikuudyl55r.jpg" // Magician image
    },
    { 
      id: "balloon-artists", 
      name: "Balloon Artists", 
      icon: <div className="text-sm">🎈</div>,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1750170776/i8mfc16v3vk4inj0esvv.jpg" // Balloon artist image
    },
    { 
      id: "character-visits", 
      name: "Character Visits", 
      icon: <div className="text-sm">🦸</div>,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749854552/kfhncxpa58uyrtrjpq2z.jpg" // Character visits image
    },
    { 
      id: "activities", 
      name: "Activities", 
      icon: <Gamepad2 className="w-5 h-5" />,
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png" // Activities image
    },
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

 
//   const { suppliers: backendSuppliers, loading: suppliersLoading, error } = useSuppliers();
const filteredSuppliers = suppliers.filter((supplier) => {
    // Category filter
    if (selectedCategory !== "all" && supplier.category.toLowerCase() !== selectedCategory) return false;
    
    // Subcategory filter
    if (subcategory !== "all" && supplier.subcategory !== subcategory) return false;
    
    // Location filter
    if (selectedLocation && selectedLocation !== "") {
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
    

    if (selectedThemes.length > 0) {
      const hasMatchingTheme = selectedThemes.some(selectedTheme => 
        supplier.themes && supplier.themes.includes(selectedTheme)
      );
      if (!hasMatchingTheme) return false;
    }
    
    return true;
  });
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
      if (supplier?.subcategory?.toLowerCase().includes(searchTerm)) return true;
      
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



  // // Simulate loading time
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 800);

  //   return () => clearTimeout(timer);
  // }, []);
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
    suppliers.forEach(supplier => {
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

  const toggleTheme = (themeId) => {
    setSelectedThemes(prev => 
      prev.includes(themeId) 
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  // Check if any filters are active
  const hasActiveFilters = subcategory !== "all" || 
                          selectedLocation !== "" || 
                          priceRange !== "all" ||
                          selectedThemes.length > 0;


                          const activeFilterCount = [
                            subcategory !== "all", 
                            selectedLocation !== "", 
                            priceRange !== "all",
                            selectedThemes.length > 0
                          ].filter(Boolean).length;
                        
                          // if (!showFiltersModal) return null;
  // Clear all filters
  const clearAllFilters = () => {
    setSubcategory("all");
    setSelectedLocation("");
    setPriceRange("all");
    setSelectedCategory("all");
    setSearchQuery("");
  };



  return (
<div className="min-h-screen bg-[#fef7f7]">


      {/* Hero Section - Mobile Optimized Heights */}
      <div 
        className="relative w-full h-[36vh] md:h-[50vh]  overflow-hidden"
      >      
     <div  style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(12 100% 68%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="w-full h-full absolute">
    {/* <Image
      src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1754515959/iStock-1716501930__1_-removebg_bn6x4d.png"
      alt="People celebrating at a party"
      fill
      className="object-contain object-right "
    /> */}


    {/* Optional overlay for text contrast */}
    {/* <div className="absolute inset-0 bg-black/10" /> */}
  </div>
        {/* Strong dark overlay */}
        <div className="absolute inset-0 bg-black/1"></div>

        {/* Hero Content Overlay */}
        <div className="relative h-full flex justify-center px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="mt-5 md:mt-10 md:text-6xl text-4xl font-extrabold mb-3 md:mb-6 drop-shadow-2xl text-shadow-lg">
              Find trusted
              <span className="text-white block drop-shadow-2xl"><span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">Party</span> Suppliers</span>
            </h1>
            <p className="md:text-xl py-5 mb-4 md:mb-8  md:w-[70%] mx-auto leading-relaxed drop-shadow-2xl font-semibold text-shadow-md">
              Create magical moments. Everything you need for the perfect party, all in one place.
            </p>
          </div>
        </div>

        {/* Bottom fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-6 md:h-12 bg-gradient-to-t from-white to-transparent" />

      </div>

      {/* Search & Filter Controls - Mobile Optimized */}
      <div className="bg-white border-b border-gray-100 px-3 md:px-4  md:py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-2 md:mb-2">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <h2 className="text-sm md:text-2xl font-semibold text-gray-900 truncate">
                {searchedSuppliers.length} Party Pro's Ready To Party!
              </h2>
              
              {/* Active Search Display - Mobile Responsive */}
              {searchQuery && (
                <div className="flex items-center space-x-1 md:space-x-2 bg-blue-50 px-2 md:px-3 py-1 rounded-full border border-blue-200 max-w-[150px] md:max-w-none">
                  <Search className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-blue-800 font-medium truncate">"{searchQuery}"</span>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Active Filters Display - Mobile */}
              {hasActiveFilters && (
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Filters</span>
                  </Badge>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs md:text-sm text-gray-500 hover:text-gray-700 underline hidden sm:block"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Search & Filter Buttons - Compact Mobile */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearchModal(true)}
                className="border-gray-200 hover:bg-gray-50 px-2 md:px-4"
              >
                <Search className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersModal(true)}
                className={`border-gray-200 px-2 md:px-4 ${hasActiveFilters ? 'bg-orange-50 border-orange-200 text-orange-700' : 'hover:bg-gray-50'}`}
              >
                <SlidersHorizontal className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Filters</span>
                {hasActiveFilters && (
                  <Badge className="ml-1 md:ml-2 bg-orange-600 text-white text-xs px-1">
                    {[subcategory !== "all", selectedLocation !== "", priceRange !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

{/* Category Tabs - Updated with Circular Images */}
<div className="bg-white border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
    {/* Navigation container with proper scrolling */}
    <div className="relative">
      <div className="flex gap-3 md:gap-10 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2" 
           style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex-shrink-0 cursor-pointer relative transition-all duration-200 ${
                isActive ? 'transform scale-105' : 'hover:transform hover:scale-105'
              }`}
              style={{ minWidth: '70px' }}
            >
              {/* Circular container */}
              <div className="flex flex-col items-center">
                {/* Main circle with image */}
                <div className={`w-16 cursor-pointer h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 transition-all duration-200 overflow-hidden relative ${
                  isActive 
                    ? 'shadow-lg ring-2 ring-[hsl(var(--primary-300))]' 
                    : 'shadow-sm hover:shadow-md border border-gray-200'
                }`}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={64}
                    height={64}
                    className={`w-full h-full object-cover rounded-full ${
                      isActive ? 'opacity-90' : ''
                    }`}
                  />
                  {/* Overlay for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-primary-600/30 rounded-full"></div>
                  )}

                </div>
                
                {/* Title */}
                <div className="text-center">
                  <p className={`text-xs md:text-sm font-semibold leading-tight ${
                    isActive ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {category.name.split(' ').map((word, i) => (
                      <span key={i} className="block">{word}</span>
                    ))}
                  </p>
                </div>
              </div>
              
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Optional: Add fade effect for scrollable area */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
    </div>
  </div>
</div>
    {/* ✅ ADD THIS SECTION HERE - SEO Links (Hidden) */}
    <div className="sr-only">
        <h2>Party Suppliers by Location and Service</h2>
        <ul>
          {searchedSuppliers.map(supplier => (
            <li key={supplier.id}>
              <a href={`/supplier/${supplier.id}`}>
                {supplier.name} - {supplier.category} in {supplier.location}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Results Section - Streamlined for Mobile */}
      <div className="max-w-screen mx-auto px-2 md:px-3 py-3 md:py-8">
     
<LoadMoreSuppliersSection
  allSuppliers={searchedSuppliers}
  isInitialLoading={false} // Use real loading state
  onSupplierClick={handleSupplierClick}
  favorites={favorites}
  toggleFavorite={toggleFavorite}
/>


      </div>

      {/* Search Modal - Mobile Optimized */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-4 md:pt-20 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] md:max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Search Suppliers</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 md:p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
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
                  className="pl-10 md:pl-12 pr-4 py-3 md:py-4 text-base md:text-lg border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  autoFocus
                />
              </div>

              {/* Search Results Summary */}
              {searchQuery && (
                <div className="mt-4 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 text-sm md:text-base">
                      <span className="font-semibold">{searchedSuppliers.length}</span> results for "{searchQuery}"
                    </span>
                    <Button size="sm" onClick={() => handleSearchSubmit(searchQuery)}>
                      Search
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Suggestions - Mobile Scrollable */}
            <div className="max-h-60 md:max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {!searchQuery && searchHistory.length > 0 && (
                <div className="px-4 md:px-6 pb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Searches
                  </h4>
                  <div className="space-y-2">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(term)}
                        className="flex items-center space-x-3 w-full text-left p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm md:text-base">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {!searchQuery && (
                <div className="px-4 md:px-6 pb-6">
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
                <div className="px-4 md:px-6 pb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Suggestions</h4>
                  <div className="space-y-2">
                    {getSearchSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center space-x-3 w-full text-left p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm md:text-base">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal - Mobile Optimized */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">Filter Suppliers</h3>
                {hasActiveFilters && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
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
    
            {/* Filter Content - Mobile Scrollable */}
            <div className="p-4 md:p-6 max-h-[60vh] md:max-h-96 overflow-y-auto">
              {/* Basic Filters Row - Mobile Stack */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
                    Location
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk-wide">All locations</SelectItem>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
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
    
              {/* Party Themes Section - Mobile Optimized */}
              <div className="border-t border-gray-200 pt-4 md:pt-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Party Themes
                  </label>
                  {selectedThemes.length > 0 && (
                    <button
                      onClick={() => setSelectedThemes([])}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear themes
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {partyThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => toggleTheme(theme.id)}
                      className={`relative p-2 md:p-3 rounded-lg border-2 transition-all text-left ${
                        selectedThemes.includes(theme.id)
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-6 h-6 md:w-8 md:h-8 ${theme.color} rounded-md md:rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                          <div className="scale-75 md:scale-100">
                            {theme.icon}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-xs md:text-sm">
                            {theme.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {theme.count} suppliers
                          </p>
                        </div>
                      </div>
                      
                      {selectedThemes.includes(theme.id) && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
    
                {/* Selected Themes Display - Mobile Compact */}
                {selectedThemes.length > 0 && (
                  <div className="mt-3 md:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Selected themes ({selectedThemes.length}):
                    </p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {selectedThemes.map((themeId) => {
                        const theme = partyThemes.find(t => t.id === themeId);
                        return (
                          <Badge 
                            key={themeId}
                            variant="outline" 
                            className="flex items-center gap-1 md:gap-2 pr-1 border-blue-300 bg-blue-100 text-blue-800 text-xs"
                          >
                            <div className={`w-2 h-2 md:w-3 md:h-3 ${theme.color} rounded-full flex items-center justify-center text-white text-xs`}>
                              <div className="scale-75">
                                {theme.icon}
                              </div>
                            </div>
                            <span className="truncate max-w-20 md:max-w-none">{theme.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTheme(themeId);
                              }}
                              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 text-blue-600"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
    
            {/* Modal Footer - Mobile Responsive */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-gray-50 border-t border-gray-100 gap-3 md:gap-0">
              <div className="text-sm text-gray-600 text-center md:text-left">
                {searchedSuppliers.length} suppliers match your criteria
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowFiltersModal(false)} className="flex-1 md:flex-none">
                  Cancel
                </Button>
                <Button onClick={() => setShowFiltersModal(false)} className="flex-1 md:flex-none">
                  <span className="hidden sm:inline">Apply Filters ({searchedSuppliers.length} results)</span>
                  <span className="sm:hidden">Apply ({searchedSuppliers.length})</span>
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

      {/* Quick Action Bar - Mobile Optimized */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20 safe-area-pb">
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1 border-gray-200" asChild>
            <Link href="/dashboard">
              <Calendar className="w-4 h-4 mr-2" />
              Dashboard
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
      <div className="md:hidden h-16"></div>
    </div>
  )
}