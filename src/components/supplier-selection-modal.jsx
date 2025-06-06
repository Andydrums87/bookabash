"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Star, Heart, Plus, Filter, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


const mockSuppliers = [
  {
    id: "magic-moments",
    name: "Magic Moments Entertainment",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748522377/blog-hero_lhgb8b.png",
    rating: 4.9,
    reviewCount: 127,
    distance: "3.2 miles away",
    price: 150,
    duration: "1 hour show",
    description:
      "Professional superhero entertainment with magic, games, and photo opportunities. Perfect for ages 4-10.",
    available: true,
    dbsChecked: true,
    responseTime: "2hrs",
    badges: ["Superhero Show"],
  },
  {
    id: "amazing-heroes",
    name: "Amazing Heroes Party Co",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1747830613/evgeniy-alyoshin-YF80qEzcEW8-unsplash_odk5fv.jpg",
    rating: 4.7,
    reviewCount: 89,
    distance: "5.1 miles away",
    price: 180,
    duration: "90 minutes",
    description: "Interactive superhero training academy with obstacle courses and hero certificates for all children.",
    available: false,
    dbsChecked: true,
    responseTime: "4hrs",
    badges: ["Hero Party"],
  },
  {
    id: "super-fun",
    name: "Super Fun Entertainment",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595143/blog-post-6_jguagy.png",
    rating: 4.8,
    reviewCount: 203,
    distance: "7.8 miles away",
    price: 120,
    duration: "45 minutes",
    description: "High-energy superhero party entertainment with games, music, and interactive storytelling.",
    available: true,
    dbsChecked: true,
    responseTime: "1hr",
    badges: ["Super Fun"],
  },
  {
    id: "hero-academy",
    name: "Hero Academy Adventures",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595133/blog-post-3_ltyj0d.png",
    rating: 4.6,
    reviewCount: 156,
    distance: "4.5 miles away",
    price: 200,
    duration: "2 hours",
    description: "Complete superhero training experience with costumes, missions, and graduation ceremony.",
    available: true,
    dbsChecked: true,
    responseTime: "3hrs",
    badges: ["Hero Academy"],
  },
]

export default function SupplierSelectionModal({
  isOpen,
  onClose,
  category,
  theme,
  date,
  currentSupplier,
  onSelectSupplier,
}) {
    const [priceRange, setPriceRange] = useState("all")
    const [rating, setRating] = useState("all")
    const [ratingFilter, setRatingFilter] = useState("all") 
    const [distance, setDistance] = useState("10")
    const [availableOnly, setAvailableOnly] = useState(false)
    const [compareList, setCompareList] = useState([])
    const [favorites, setFavorites] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [showCompare, setShowCompare] = useState(false)
  

  if (!isOpen) return null

  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    if (availableOnly && !supplier.available) return false
    if (distance !== "all") {
      const supplierDistance = Number.parseFloat(supplier.distance)
      const maxDistance = Number.parseFloat(distance)
      if (supplierDistance > maxDistance) return false
    }
    return true
  })

  const addToCompare = (supplier) => {
    if (compareList.length < 3 && !compareList.find((s) => s.id === supplier.id)) {
      setCompareList([...compareList, supplier])
    }
  }

  const removeFromCompare = (supplierId) => {
    setCompareList(compareList.filter((s) => s.id !== supplierId))
  }

  const toggleFavorite = (supplierId) => {
    setFavorites((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId]
    )
  }
    

  return (
    <div>
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{category} Providers</h2>
            <p className="text-gray-600 capitalize">
              {theme} Theme • {date}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 flex flex-wrap items-center gap-4 p-4 md:p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Price:</span>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-auto md:w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0-100">£0-100</SelectItem>
                <SelectItem value="100-150">£100-150</SelectItem>
                <SelectItem value="150-200">£150-200</SelectItem>
                <SelectItem value="200+">£200+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Rating:</span>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-auto md:w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="4.5+">4.5+</SelectItem>
                <SelectItem value="4.0+">4.0+</SelectItem>
                <SelectItem value="3.5+">3.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Distance:</span>
            <Select value={distance} onValueChange={setDistance}>
              <SelectTrigger className="w-auto md:w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Up to 5 mi</SelectItem>
                <SelectItem value="10">Up to 10 mi</SelectItem>
                <SelectItem value="15">Up to 15 mi</SelectItem>
                <SelectItem value="all">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available-only"
              checked={availableOnly}
              onCheckedChange={(checked) => setAvailableOnly(!!checked)}
            />
            <label htmlFor="available-only" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Available on date
            </label>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Supplier List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="border border-gray-200 shadow-sm overflow-hidden rounded-lg">
                  <div className="relative w-full h-40 md:h-48 bg-gray-200">
                    {" "}
                    {/* Banner Image Container */}
                    <Image
                      src={supplier.image || "https://placehold.co/600x200?text=Event+Banner"}
                      alt={`${supplier.name} banner`}
                      fill
                      className="object-cover"
                    />
                    {/* Optional: Overlay badge on image if needed, like in original screenshot */}
                    {supplier.badges && supplier.badges[0] && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 shadow-md">
                        {supplier.badges[0]}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">{supplier.name}</h3>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-xl font-bold text-gray-900">£{supplier.price}</div>
                        <div className="text-xs text-gray-600">{supplier.duration}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-700 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{supplier.rating}</span>
                        <span className="text-gray-500">({supplier.reviewCount} reviews)</span>
                      </div>
                      <span>•</span>
                      <span className="text-gray-600">{supplier.distance}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      <Badge
                        variant={supplier.available ? "default" : "secondary"}
                        className={supplier.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}
                      >
                        {supplier.available
                          ? `Available ${date.split(",")[0]}` // Assuming date format like "Saturday, June 15"
                          : `Unavailable`}
                      </Badge>
                      {supplier.dbsChecked && (
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          DBS Checked
                        </Badge>
                      )}
                      <span className="text-gray-500">Responds in {supplier.responseTime}</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{supplier.description}</p>

                    <div className="flex flex-wrap items-center gap-2">
                      {supplier.available ? (
                        <Button
                          size="sm"
                          className="bg-gray-800 hover:bg-gray-900 text-white"
                          onClick={() => onSelectSupplier(supplier)}
                        >
                          Add to Plan
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled>
                          Unavailable
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/supplier/${supplier.id}`}>View Details</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-500 w-8 h-8"
                        onClick={() => toggleFavorite(supplier.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(supplier.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                          }`}
                        />
                        <span className="sr-only">Favorite</span>
                      </Button>
                      {supplier.available && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addToCompare(supplier)}
                          disabled={
                            compareList.length >= 3 || compareList.find((s) => s.id === supplier.id) !== undefined
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Compare
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSuppliers.length === 0 && (
                <div className="md:col-span-2 text-center py-10 text-gray-500">
                  <p className="text-lg mb-2">No suppliers match your current filters.</p>
                  <p>Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Compare Sidebar */}
          <div className="w-full md:w-80 border-l border-gray-200 bg-gray-50 p-4 md:p-6 flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Compare</h3>
              {compareList.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCompareList([])} className="text-gray-600">
                  Clear All
                </Button>
              )}
            </div>
            <div className="space-y-3 mb-6">
              {compareList.map((supplier) => (
                <Card key={`compare-${supplier.id}`} className="border-gray-200 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">{supplier.name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 -mr-2 -mt-1"
                        onClick={() => removeFromCompare(supplier.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>Rating: {supplier.rating}/5</div>
                      <div>Price: £{supplier.price}</div>
                      <div>Distance: {supplier.distance}</div>
                      <div className={supplier.available ? "text-green-600" : "text-red-600"}>
                        {supplier.available ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {[...Array(Math.max(0, 3 - compareList.length))].map((_, i) => (
                <Card key={`placeholder-${i}`} className="border-2 border-dashed border-gray-300 bg-white">
                  <CardContent className="p-3 text-center h-24 flex flex-col items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">Add supplier to compare</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {compareList.length >= 2 && (
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">Compare Selected</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>

  )
}
