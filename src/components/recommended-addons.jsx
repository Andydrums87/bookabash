"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Plus, Star, Heart, Check } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSuppliers } from '@/utils/mockBackend'
import { usePartyPlan } from '@/utils/partyPlanBackend'

export default function RecommendedAddons({
  title = "Party Extras",
  subtitle = "Complete your party with these additional services",
  context = "dashboard",
  maxItems = 8,
  showPricing = true,
  onAddToCart,
}) {
  const [favorites, setFavorites] = useState([])
  const [addingItems, setAddingItems] = useState([])
  const router = useRouter()

  // Get suppliers from your backend
  const { suppliers, loading, error } = useSuppliers()
  const { hasAddon } = usePartyPlan()

  // Handle card clicks for navigation
  const handleCardClick = (supplier, event) => {
    // Don't navigate if clicking on interactive elements
    if (
      event.target.closest('button') || 
      event.target.closest('[role="button"]')
    ) {
      console.log('❌ Blocked navigation - clicked on button')
      return
    }
    
    console.log('🚀 Navigating to supplier:', supplier.id)
    router.push(`/supplier/${supplier.id}`)
  }

  // Filter suppliers to show as add-ons
  const getContextualSuppliers = () => {
    if (!suppliers || suppliers.length === 0) return []
    
    let filtered = [...suppliers]

    // CLEAN APPROACH: Only show truly different service categories as add-ons
    // Remove all Entertainment overlap - keep add-ons for different service types
    
    const addOnCategories = [
      'Photography',      // Party photographers
      'Decorations',      // Balloon displays, themed decorations
    ]

    // Specific add-on suppliers that are clearly different from main services
    const specificAddOns = [
      'candy-cart',           // Catering extra
      'superhero-training',   // Activity extra  
      'party-photographer',   // Photography
      'superhero-decorations', // Decorations
      'balloon-magic',        // Decorations
    ]

    console.log('🎯 Clean add-ons approach - only different service types')
    console.log('📂 Add-on categories:', addOnCategories)
    console.log('🎪 Specific add-ons:', specificAddOns)

    // Filter based on context
    switch (context) {
      case "dashboard":
        filtered = filtered.filter(supplier => {
          console.log(`🔍 Checking supplier: ${supplier.id} (${supplier.category})`)
          
          // Include if it's from an add-on category
          if (addOnCategories.includes(supplier.category)) {
            console.log(`✅ Including ${supplier.id} - add-on category (${supplier.category})`)
            return true
          }
          
          // Include if it's a specific add-on
          if (specificAddOns.includes(supplier.id)) {
            console.log(`✅ Including ${supplier.id} - specific add-on`)
            return true
          }
          
          console.log(`🚫 Excluding ${supplier.id} - not an add-on type`)
          return false
        })
        break
        
      case "summary":
        filtered = filtered.filter((supplier) => 
          addOnCategories.includes(supplier.category) || 
          specificAddOns.includes(supplier.id)
        )
        break
        
      case "review":
        filtered = filtered.filter((supplier) => 
          (addOnCategories.includes(supplier.category) || 
           specificAddOns.includes(supplier.id)) &&
          supplier.priceFrom < 200
        )
        break
        
      case "einvites":
        filtered = filtered.filter((supplier) => 
          addOnCategories.includes(supplier.category) || 
          specificAddOns.includes(supplier.id)
        )
        break
    }

    console.log('🎯 Final clean add-ons:', filtered.map(s => `${s.id} (${s.category})`))

    // Sort by popularity and rating
    filtered.sort((a, b) => {
      // Check for "Highly Rated" badge
      const aPopular = a.badges?.includes("Highly Rated") ? 1 : 0
      const bPopular = b.badges?.includes("Highly Rated") ? 1 : 0
      
      if (aPopular !== bPopular) {
        return bPopular - aPopular // Highly rated first
      }
      
      // Then sort by rating * review count for popularity score
      const aScore = a.rating * a.reviewCount
      const bScore = b.rating * b.reviewCount
      return bScore - aScore
    })

    return filtered.slice(0, maxItems)
  }

  const contextualSuppliers = getContextualSuppliers()

  const toggleFavorite = (supplierId) => {
    setFavorites((prev) => (prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId]))
  }

  const handleAddToCart = async (supplier, event) => {
    event.stopPropagation() // Prevent card navigation
    
    // Convert supplier to addon format for party plan
    const addonData = {
      id: supplier.id,
      name: supplier.name,
      description: supplier.description,
      price: supplier.priceFrom,
      image: supplier.image,
      category: supplier.category,
      duration: supplier.priceUnit,
      rating: supplier.rating,
      reviewCount: supplier.reviewCount,
      popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
      limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today")
    }
    
    // Check if already in party
    if (hasAddon(supplier.id)) {
      console.log("⚠️ Supplier already in party")
      return
    }

    setAddingItems((prev) => [...prev, supplier.id])
    
    try {
      if (onAddToCart) {
        await onAddToCart(addonData)
      }
      
      // Show success state for 2 seconds
      setTimeout(() => {
        setAddingItems((prev) => prev.filter((id) => id !== supplier.id))
      }, 2000)
    } catch (error) {
      console.error("Error adding supplier:", error)
      setAddingItems((prev) => prev.filter((id) => id !== supplier.id))
    }
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
        return "Professional photography, decorations, and special extras for your party"
      case "summary":
        return "Last chance to add these finishing touches to your party"
      case "review":
        return "Quick extras you can still include before booking"
      case "einvites":
        return "Special services to mention in your invitations"
      default:
        return subtitle
    }
  }

  const getButtonState = (supplier) => {
    const isAdding = addingItems.includes(supplier.id)
    const isInParty = hasAddon(supplier.id)
    
    if (isInParty) {
      return {
        disabled: true,
        className: "bg-green-500 hover:bg-green-500 text-white",
        content: (
          <>
            <Check className="w-4 h-4 mr-2" />
            In Party
          </>
        )
      }
    }
    
    if (isAdding) {
      return {
        disabled: true,
        className: "bg-blue-500 hover:bg-blue-500 text-white",
        content: (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding...
          </>
        )
      }
    }
    
    return {
      disabled: false,
      className: "bg-primary-500 hover:bg-primary-600 text-white",
      content: (
        <>
          <Plus className="w-4 h-4 mr-2" />
          {getContextualCTA()}
        </>
      )
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <p className="text-red-600">Error loading recommendations: {error}</p>
      </div>
    )
  }

  // Don't render if no suppliers
  if (contextualSuppliers.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">{getContextualSubtitle()}</p>
        </div>
        {context === "dashboard" && (
          <Badge className="bg-primary-100 text-primary-700 border-primary-200 hidden sm:flex">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        )}
      </div>

      <Carousel opts={{ align: "start" }} className="w-full relative">
        <CarouselContent className="-ml-4">
          {contextualSuppliers.map((supplier) => {
            const buttonState = getButtonState(supplier)
            const isPopular = supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8
            const isLimitedTime = supplier.availability?.includes("Limited") || supplier.availability?.includes("today")
            
            return (
              <CarouselItem key={supplier.id} className="pl-4 basis-[45%] sm:basis-1/3 md:basis-1/3 lg:basis-1/4">
              <div className="h-full">
                <Card 
                  className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col cursor-pointer p-0"
                  onClick={(e) => handleCardClick(supplier, e)}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Shorter image on mobile */}
                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                      <Image
                        src={supplier.image || "/placeholder.svg"}
                        alt={supplier.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isPopular && (
                          <Badge className="bg-primary-500 text-white text-xs px-1.5 py-0.5">
                            <Star className="w-2.5 h-2.5 mr-0.5" />
                            Popular
                          </Badge>
                        )}
                        {isLimitedTime && (
                          <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">Limited</Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(supplier.id)
                        }}
                        className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Heart
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            favorites.includes(supplier.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
            
                    {/* Compact content for mobile */}
                    <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
                      {/* Title and price - more compact on mobile */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg leading-tight line-clamp-1 sm:line-clamp-2">
                          {supplier.name}
                        </h3>
                        {showPricing && (
                          <div className="flex items-baseline justify-between mt-1">
                            <div className="text-lg sm:text-xl font-bold text-primary-500">£{supplier.priceFrom}</div>
                            <div className="text-xs text-gray-500">{supplier.priceUnit}</div>
                          </div>
                        )}
                      </div>
            
                      {/* Description - hidden on mobile, shown on larger screens */}
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 flex-1 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                        {supplier.description}
                      </p>
            
                      {/* Rating - more compact */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{supplier.rating}</span>
                          <span className="hidden sm:inline">({supplier.reviewCount})</span>
                        </div>
                        <span className="truncate text-xs hidden sm:block">{supplier.location}</span>
                      </div>
            
                      {/* Smaller button on mobile */}
                      <Button
                        onClick={(e) => handleAddToCart(supplier, e)}
                        disabled={buttonState.disabled}
                        className={`w-full text-xs sm:text-sm py-1.5 sm:py-2 ${buttonState.className} transition-all`}
                      >
                        <span className="flex items-center justify-center">
                          {/* Smaller icons on mobile */}
                          {buttonState.content.props?.children?.[0] && (
                            <span className="mr-1 sm:mr-2">
                              {React.cloneElement(buttonState.content.props.children[0], {
                                className: "w-3 h-3 sm:w-4 sm:h-4"
                              })}
                            </span>
                          )}
                          <span className="hidden sm:inline">{getContextualCTA()}</span>
                          <span className="sm:hidden">Add</span>
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute left-20 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-md hidden" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-md hidden " />
      </Carousel>
    </div>
  )
}