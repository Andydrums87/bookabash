"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MobileNav from "@/components/mobile-nav"

export default function BrowseSuppliersPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [subcategory, setSubcategory] = useState("all")
  const [favorites, setFavorites] = useState([])
  const [showFilters, setShowFilters] = useState(false)

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

  const mockSuppliers = [
    {
      id: "magic-mike",
      name: "Magic Mike's Superhero Show",
      category: "Entertainment",
      subcategory: "Magicians",
      image:
        "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594938/face-painter_kdiqia.png",
      rating: 4.9,
      reviewCount: 127,
      bookingCount: 89,
      location: "London & Surrounding Areas",
      priceFrom: 150,
      priceUnit: "per show",
      description: "Professional superhero magic show with audience participation",
      badges: ["DBS Checked", "Highly Rated"],
      availability: "Available this weekend",
    },
    {
      id: "adventure-center",
      name: "Adventure Play Centre",
      category: "Venues",
      subcategory: "Play Centers",
      image: "/placeholder.jpg",
      rating: 4.7,
      reviewCount: 203,
      bookingCount: 156,
      location: "Central London",
      priceFrom: 120,
      priceUnit: "per 2 hours",
      description: "Indoor playground perfect for superhero themed parties",
      badges: ["Parking Available", "Wheelchair Accessible"],
      availability: "3 slots available today",
    },
    {
      id: "superhero-cakes",
      name: "Superhero Celebration Cakes",
      category: "Catering",
      subcategory: "Birthday Cakes",
      image: "/placeholder.jpg",
      rating: 4.8,
      reviewCount: 89,
      bookingCount: 67,
      location: "UK Wide Delivery",
      priceFrom: 45,
      priceUnit: "per cake",
      description: "Custom superhero themed birthday cakes",
      badges: ["Allergen Free Options", "Same Day Delivery"],
      availability: "Order by 2pm for next day",
    },
    {
      id: "balloon-magic",
      name: "Balloon Magic Decorations",
      category: "Decorations",
      subcategory: "Balloon Displays",
      image: "/placeholder.jpg",
      rating: 4.6,
      reviewCount: 145,
      bookingCount: 98,
      location: "South London",
      priceFrom: 85,
      priceUnit: "per setup",
      description: "Stunning superhero balloon arches and displays",
      badges: ["Setup Included", "Eco-Friendly"],
      availability: "Available next week",
    },
    {
      id: "hero-bags",
      name: "Hero Party Bags",
      category: "Party Bags",
      subcategory: "Themed Bags",
      image: "/placeholder.jpg",
      rating: 4.5,
      reviewCount: 76,
      bookingCount: 123,
      location: "UK Wide",
      priceFrom: 4.5,
      priceUnit: "per bag",
      description: "Superhero themed party bags with toys and treats",
      badges: ["Age Appropriate", "Bulk Discounts"],
      availability: "In stock - ships today",
    },
    {
      id: "party-photographer",
      name: "Little Heroes Photography",
      category: "Photography",
      subcategory: "Party Photographers",
      image: "/placeholder.jpg",
      rating: 4.9,
      reviewCount: 54,
      bookingCount: 43,
      location: "London & Home Counties",
      priceFrom: 180,
      priceUnit: "per 2 hours",
      description: "Professional party photography with instant prints",
      badges: ["Digital Gallery", "Same Day Edits"],
      availability: "2 bookings available this month",
    },
    {
      id: "bouncy-castle",
      name: "Super Bounce Castle Hire",
      category: "Activities",
      subcategory: "Bouncy Castles",
      image: "/placeholder.jpg",
      rating: 4.7,
      reviewCount: 198,
      bookingCount: 234,
      location: "Greater London",
      priceFrom: 95,
      priceUnit: "per day",
      description: "Superhero themed bouncy castle with safety mats",
      badges: ["Safety Certified", "Free Delivery"],
      availability: "Available weekends",
    },
    {
      id: "character-visit",
      name: "Amazing Superhero Characters",
      category: "Entertainment",
      subcategory: "Character Visits",
      image: "/placeholder.jpg",
      rating: 4.8,
      reviewCount: 167,
      bookingCount: 145,
      location: "London Wide",
      priceFrom: 180,
      priceUnit: "per hour",
      description: "Professional superhero character appearances and meet & greets",
      badges: ["Authentic Costumes", "Interactive Shows"],
      availability: "Book 2 weeks ahead",
    },
  ]

  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    if (selectedCategory !== "all" && supplier.category.toLowerCase() !== selectedCategory) return false
    if (subcategory !== "all" && supplier.subcategory !== subcategory) return false
    if (searchQuery && !supplier.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

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
  

  return (
    <div className="min-h-screen bg-gray-50 mx-5">
      {/* Header */}
    <div className="bg-gray-50 py-2"></div>
      {/* Category Tabs - Mobile Horizontal Scroll */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] md:top-[81px] z-20">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 px-4 py-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setSubcategory("all")
                }}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg min-w-[80px] transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                    selectedCategory === category.id ? "bg-primary-200" : "bg-gray-100"
                  }`}
                >
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between border-gray-200"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters & Sort</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Filter Controls */}
        <div
          className={`space-y-3 mt-3 md:mt-0 md:grid md:grid-cols-4 md:gap-4 md:space-y-0 ${
            showFilters ? "block" : "hidden md:grid"
          }`}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger className="bg-white w-full border-gray-200 py-5 px-3 focus:border-primary-500 h-10">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-white w-full border-gray-200 py-5 px-3 focus:border-primary-500 h-10">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="bg-white w-full border-gray-200 py-5 px-3 focus:border-primary-500 h-10">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <Select defaultValue="recommended">
              <SelectTrigger className="bg-white w-full border-gray-200 py-5 px-3 focus:border-primary-500 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="availability">Available Now</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">
          {filteredSuppliers.length} services available to book now
        </h2>
        {selectedCategory !== "all" && (
          <p className="text-sm text-gray-600 mt-1">
            Showing {categories.find((c) => c.id === selectedCategory)?.name} suppliers
            {subcategory !== "all" && ` in ${subcategory}`}
          </p>
        )}
      </div>

      {/* Supplier Cards - Responsive Grid */}
      <div className="px-4 py-4">
        {/* Mobile: Single column, Desktop: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Supplier Image */}
                <div className="relative h-48 md:h-40 lg:h-48">
                  <Image src={supplier.image || "/placeholder.svg"} alt={supplier.name} fill className="object-cover" />

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(supplier.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(supplier.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </button>

                  {/* Availability Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-500 text-white text-xs">{supplier.availability}</Badge>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
                      {supplier.category}
                    </Badge>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="p-4">
                  {/* Rating and Reviews */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{supplier.rating}</span>
                      <span className="text-sm text-gray-600">({supplier.reviewCount})</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{supplier.bookingCount} bookings</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-1 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">{supplier.location}</span>
                  </div>

                  {/* Supplier Name and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{supplier.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{supplier.description}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {supplier.badges.slice(0, 2).map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs text-blue-700 border-blue-300">
                        {badge}
                      </Badge>
                    ))}
                    {supplier.badges.length > 2 && (
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                        +{supplier.badges.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-900">from £{supplier.priceFrom}</div>
                      <div className="text-sm text-gray-600">{supplier.priceUnit}</div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" className="border-gray-200 text-xs" asChild>
                        <Link href={`/supplier/${supplier.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white text-xs">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className="px-4 py-8 text-center">
        <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
          Load More Suppliers
        </Button>
      </div>

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
