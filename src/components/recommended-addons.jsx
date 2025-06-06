"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Star, Heart, Info, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"


const allAddons = [
  {
    id: "face-painting",
    name: "Face Painting",
    price: 150,
    image:
      "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594938/face-painter_kdiqia.png",
    description: "Professional superhero face painting for all children",
    rating: 4.9,
    reviewCount: 127,
    popular: true,
    category: "Entertainment",
    duration: "2 hours",
  },
  {
    id: "balloon-artist",
    name: "Balloon Artist",
    price: 120,
    image:
      "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594997/balloons_r2wbfh.png",
    description: "Amazing balloon sculptures and superhero creations",
    rating: 4.8,
    reviewCount: 89,
    category: "Entertainment",
    duration: "1.5 hours",
  },
  {
    id: "photo-booth",
    name: "Photo Booth",
    price: 200,
    originalPrice: 250,
    image:
      "/placeholder.jpg",
    description: "Superhero-themed photo booth with props and instant prints",
    rating: 4.9,
    reviewCount: 156,
    limitedTime: true,
    category: "Photography",
    duration: "3 hours",
  },
  {
    id: "candy-cart",
    name: "Candy Cart",
    price: 180,
    image:
      "/placeholder.jpg",
    description: "Vintage candy cart with superhero-themed treats",
    rating: 4.7,
    reviewCount: 203,
    category: "Catering",
    duration: "Full event",
  },
  {
    id: "magic-show",
    name: "Magic Show",
    price: 175,
    image: "/placeholder.jpg",
    description: "Interactive superhero magic show with audience participation",
    rating: 4.9,
    reviewCount: 98,
    popular: true,
    category: "Entertainment",
    duration: "45 minutes",
  },
  {
    id: "dj-services",
    name: "DJ & Music",
    price: 160,
    image: "/placeholder.jpg",
    description: "Professional DJ with superhero soundtrack and party games",
    rating: 4.6,
    reviewCount: 134,
    category: "Entertainment",
    duration: "3 hours",
  },
  {
    id: "party-photographer",
    name: "Party Photographer",
    price: 220,
    originalPrice: 280,
    image: "/placeholder.jpg",
    description: "Professional photographer to capture all the superhero action",
    rating: 4.8,
    reviewCount: 76,
    limitedTime: true,
    category: "Photography",
    duration: "2 hours",
  },
  {
    id: "superhero-training",
    name: "Superhero Training Course",
    price: 140,
    image: "/placeholder.jpg",
    description: "Obstacle course and superhero training activities",
    rating: 4.7,
    reviewCount: 112,
    category: "Activities",
    duration: "1 hour",
  },
]

export default function RecommendedAddons({
    title = "Recommended Add-ons",
    subtitle = "Make your party even more special with these popular extras",
    context = "dashboard",
    maxItems = 8,
    showPricing = true,
    onAddToCart,
  }) {
    const [favorites, setFavorites] = useState([])
    const [addedItems, setAddedItems] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const carouselRef = useRef(null)
  
    const getContextualAddons = () => {
      let filtered = [...allAddons]
  
      switch (context) {
        case "dashboard":
          filtered = filtered.filter((addon) => addon.popular || addon.limitedTime)
          break
        case "summary":
          filtered = filtered.filter((addon) => addon.price > 150 || addon.category === "Photography")
          break
        case "review":
          filtered = filtered.filter((addon) => addon.price < 200)
          break
        case "einvites":
          filtered = filtered.filter((addon) => addon.category === "Entertainment" || addon.category === "Photography")
          break
      }
  
      filtered.sort((a, b) => {
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1
        return b.rating - a.rating
      })
  
      return filtered.slice(0, maxItems)
    }
  
    const contextualAddons = getContextualAddons()
  
    const getItemsPerPage = () => {
      if (typeof window === "undefined") return 4
      if (window.innerWidth < 640) return 3
      if (window.innerWidth < 1024) return 3
      return 4
    }
  
    const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage())
  
    useEffect(() => {
      const handleResize = () => {
        setItemsPerPage(getItemsPerPage())
        setCurrentPage(0)
      }
  
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }, [])
  
    const totalPages = Math.ceil(contextualAddons.length / itemsPerPage)
  
    const scrollToPage = (pageIndex) => {
      if (pageIndex >= 0 && pageIndex < totalPages) {
        setCurrentPage(pageIndex)
        if (carouselRef.current) {
          const scrollAmount = pageIndex * (carouselRef.current.scrollWidth / totalPages)
          carouselRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" })
        }
      }
    }
  
    const nextPage = () => scrollToPage(currentPage + 1)
    const prevPage = () => scrollToPage(currentPage - 1)
  
    const toggleFavorite = (addonId) => {
      setFavorites((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
    }
  
    const handleAddToCart = (addon) => {
      setAddedItems((prev) => [...prev, addon.id])
      if (onAddToCart) onAddToCart(addon)
      setTimeout(() => {
        setAddedItems((prev) => prev.filter((id) => id !== addon.id))
      }, 2000)
    }
  
    const getContextualCTA = () => {
      switch (context) {
        case "dashboard":
          return "Add to Party"
        case "summary":
          return "Add Now"
        case "review":
          return "Quick Add"
        case "einvites":
          return "Include"
        default:
          return "Add to Party"
      }
    }
  
    const getContextualSubtitle = () => {
      switch (context) {
        case "dashboard":
          return "Popular add-ons that pair perfectly with your superhero theme"
        case "summary":
          return "Last chance to add these amazing extras to your party"
        case "review":
          return "Quick add-ons you can still include before booking"
        case "einvites":
          return "Mention these exciting add-ons in your invitations"
        default:
          return subtitle
      }
    }
  
    if (contextualAddons.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">{getContextualSubtitle()}</p>
        </div>
        {context === "dashboard" && (
          <Badge className="bg-primary-100 text-primary-700 border-primary-200">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows - Always show if there are multiple pages */}
        {totalPages > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 p-0 rounded-full shadow-lg bg-white border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 p-0 rounded-full shadow-lg bg-white border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Carousel Content */}
        <div ref={carouselRef} className="overflow-hidden mx-8 md:mx-10">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-3 md:gap-6"
            style={{
              transform: `translateX(-${currentPage * 100}%)`,
              width: `${totalPages * 100}%`,
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div key={pageIndex} className="flex gap-3 md:gap-6" style={{ width: `${100 / totalPages}%` }}>
                {contextualAddons.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map((addon) => (
                  <div key={addon.id} className="flex-1 min-w-0">
                    <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Image - Smaller on mobile */}
                        <div className="relative h-24 sm:h-32 md:h-48 overflow-hidden">
                          <Image
                            src={addon.image || "/placeholder.svg"}
                            alt={addon.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Badges - Smaller on mobile */}
                          <div className="absolute top-1 sm:top-2 md:top-3 left-1 sm:left-2 md:left-3 flex flex-col gap-1">
                            {addon.popular && (
                              <Badge className="bg-primary-500 text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1">
                                <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Popular</span>
                                <span className="sm:hidden">★</span>
                              </Badge>
                            )}
                            {addon.limitedTime && (
                              <Badge className="bg-orange-500 text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1">
                                <span className="hidden sm:inline">Limited Time</span>
                                <span className="sm:hidden">⏰</span>
                              </Badge>
                            )}
                          </div>

                          {/* Favorite Button - Smaller on mobile */}
                          <button
                            onClick={() => toggleFavorite(addon.id)}
                            className="absolute top-1 sm:top-2 md:top-3 right-1 sm:right-2 md:right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Heart
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${
                                favorites.includes(addon.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Content - Compact on mobile */}
                        <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-1 sm:mb-2">
                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-lg leading-tight line-clamp-2">
                              {addon.name}
                            </h3>
                            {showPricing && (
                              <div className="text-right ml-1 sm:ml-2 flex-shrink-0">
                                <div className="text-sm sm:text-lg md:text-xl font-bold text-primary-500">
                                  £{addon.price}
                                </div>
                                {addon.originalPrice && (
                                  <div className="text-xs text-gray-500 line-through">£{addon.originalPrice}</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Description - Hidden on mobile, truncated on tablet */}
                          <p className="hidden sm:block text-xs md:text-sm text-gray-600 mb-2 md:mb-3 flex-1 line-clamp-2">
                            {addon.description}
                          </p>

                          {/* Rating and Duration - Compact on mobile */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 sm:mb-3 md:mb-4">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{addon.rating}</span>
                              <span className="hidden sm:inline">({addon.reviewCount})</span>
                            </div>
                            {addon.duration && (
                              <span className="text-xs hidden sm:inline truncate">{addon.duration}</span>
                            )}
                          </div>

                          {/* Action Button - Smaller on mobile */}
                          <Button
                            onClick={() => handleAddToCart(addon)}
                            disabled={addedItems.includes(addon.id)}
                            className={`w-full text-xs h-7 sm:h-8 md:h-9 ${
                              addedItems.includes(addon.id)
                                ? "bg-green-500 hover:bg-green-500"
                                : "bg-primary-500 hover:bg-primary-600"
                            } text-white transition-all`}
                          >
                            {addedItems.includes(addon.id) ? (
                              <>
                                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1 sm:mr-2 rotate-45" />
                                <span className="hidden sm:inline">Added!</span>
                                <span className="sm:hidden">✓</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">{getContextualCTA()}</span>
                                <span className="sm:hidden">Add</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots - Always show if there are multiple pages */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 md:mt-6 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentPage ? "bg-primary-500 scale-125" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Footer CTA */}
      {context === "dashboard" && (
        <div className="mt-6 text-center">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Info className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-primary-900">💡 Pro Tip</span>
            </div>
            <p className="text-sm text-primary-800">Add 2 or more extras and save 10% on your total add-ons cost!</p>
          </div>
        </div>
      )}

      {context === "summary" && (
        <div className="mt-6 text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-medium text-orange-900">⏰ Limited Time</span>
            </div>
            <p className="text-sm text-orange-800">Add any extra now and get free setup included (£25 value)</p>
          </div>
        </div>
      )}
    </div>
  )
}