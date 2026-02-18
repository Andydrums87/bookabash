"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Plus, Star, Heart, Check, Sparkles, Gift } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSuppliers } from "@/utils/mockBackend"
import { usePartyPlan } from "@/utils/partyPlanBackend"

// Helper to avoid floating point precision issues
const roundMoney = (value) => Math.round(value * 100) / 100

export default function RecommendedAddons({
  title = "Party Extras",
  subtitle = "Complete your party with these additional services",
  context = "dashboard",
  maxItems = 8,
  showPricing = true,
  onAddToCart,
  onAddonClick = null,
  partyDetails = null, // Add partyDetails prop
}) {
  const [favorites, setFavorites] = useState([])
  const [addingItems, setAddingItems] = useState([])
  const router = useRouter()

  // Get suppliers from your backend
  const { suppliers, loading, error } = useSuppliers()
  const { hasAddon, partyPlan } = usePartyPlan()

  // Get guest count from partyDetails prop or partyPlan
  const guestCount = partyDetails?.guestCount || partyPlan?.partyDetails?.guestCount || 10

  // Convert supplier to addon format helper function
  const convertSupplierToAddon = (supplier) => {
    const isPartyBags = supplier.category?.toLowerCase().includes('party bag')
    const addonPrice = isPartyBags ? roundMoney(supplier.priceFrom * guestCount) : supplier.priceFrom

    return {
      id: supplier.id,
      name: supplier.name,
      description: supplier.description,
      price: addonPrice,
      pricePerUnit: supplier.priceFrom, // Keep original per-bag price
      image: supplier.image || supplier.imageUrl,
      category: supplier.category,
      duration: supplier.priceUnit,
      rating: supplier.rating,
      reviewCount: supplier.reviewCount,
      location: supplier.location,
      popular: supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8,
      limitedTime: supplier.availability?.includes("Limited") || supplier.availability?.includes("today"),
      features: supplier.features || ["Professional service", "Includes setup", "Perfect for your party"],
      type: supplier.category, // Add type for modal display
      // Party bags metadata
      ...(isPartyBags && {
        partyBagsQuantity: guestCount,
        partyBagsMetadata: {
          pricePerBag: supplier.priceFrom,
          quantity: guestCount,
          totalPrice: addonPrice
        }
      })
    }
  }

  // Handle card click (for navigation only)
  const handleCardClick = (supplier, event) => {
    // Don't navigate if clicking on interactive elements
    if (event.target.closest("button") || event.target.closest('[role="button"]')) {
      console.log("❌ Blocked navigation - clicked on button")
      return
    }

    // Only navigate if NOT using modal approach
    if (!onAddonClick) {
      console.log("🚀 Navigating to supplier:", supplier.id)
      router.push(`/supplier/${supplier.id}`)
    }
  }

  // UPDATED: Handle button click - separated from card click
  const handleButtonClick = async (supplier, event) => {
    event.stopPropagation() // Prevent card navigation
    const addonData = convertSupplierToAddon(supplier)

    // If using modal approach, open the modal
    if (onAddonClick) {
      console.log("🎯 Opening addon modal for:", supplier.name)
      onAddonClick(addonData)
      return
    }

    // Legacy direct add behavior
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

  // Filter suppliers to show as add-ons
  const getContextualSuppliers = () => {
    if (!suppliers || suppliers.length === 0) return []

    let filtered = [...suppliers]
    const addOnCategories = [
      "Photography", // Party photographers
      "Decorations", // Balloon displays, themed decorations
    ]

    // Specific add-on suppliers that are clearly different from main services
    const specificAddOns = [
      "candy-cart", // Catering extra
      "superhero-training", // Activity extra
      "party-photographer", // Photography
      "superhero-decorations", // Decorations
      "balloon-magic", // Decorations
    ]

    // Filter based on context
    switch (context) {
      case "dashboard":
        filtered = filtered.filter((supplier) => {
          // Include if it's from an add-on category
          if (addOnCategories.includes(supplier.category)) {
            return true
          }
          // Include if it's a specific add-on
          if (specificAddOns.includes(supplier.id)) {
            return true
          }
          return false
        })
        break
      case "summary":
        filtered = filtered.filter(
          (supplier) => addOnCategories.includes(supplier.category) || specificAddOns.includes(supplier.id),
        )
        break
      case "review":
        filtered = filtered.filter(
          (supplier) =>
            (addOnCategories.includes(supplier.category) || specificAddOns.includes(supplier.id)) &&
            supplier.priceFrom < 200,
        )
        break
      case "einvites":
        filtered = filtered.filter(
          (supplier) => addOnCategories.includes(supplier.category) || specificAddOns.includes(supplier.id),
        )
        break
    }

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

  const getContextualCTA = () => {
    if (onAddonClick) {
      return "View Details" // Modal approach
    }

    // Direct add approach (legacy)
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

    if (onAddonClick) {
      if (isInParty) {
        return {
          disabled: true,
          className: "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-500 text-white",
          content: (
            <>
              <Check className="w-4 h-4 mr-2" />
              In Party
            </>
          ),
        }
      }
      return {
        disabled: false,
        className: "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white",
        content: (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            View Details
          </>
        ),
      }
    }

    // Legacy direct add behavior
    if (isInParty) {
      return {
        disabled: true,
        className: "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-500 text-white",
        content: (
          <>
            <Check className="w-4 h-4 mr-2" />
            In Party
          </>
        ),
      }
    }

    if (isAdding) {
      return {
        disabled: true,
        className: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-500 hover:to-indigo-500 text-white",
        content: (
          <>
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding...
          </>
        ),
      }
    }

    return {
      disabled: false,
      className: "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white",
      content: (
        <>
          <Plus className="w-4 h-4 mr-2" />
          {getContextualCTA()}
        </>
      ),
    }
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] shadow-xl rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[hsl(var(--primary-200))] rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-[hsl(var(--primary-100))] rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-[hsl(var(--primary-100))] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100 border-2 border-red-200 shadow-xl rounded-2xl p-6">
        <p className="text-red-600">Error loading recommendations: {error}</p>
      </div>
    )
  }

  // Don't render if no suppliers
  if (contextualSuppliers.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border-2 border-[hsl(var(--primary-200))] shadow-xl rounded-2xl">
      {/* Decorative background elements matching header */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-8 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
        <div className="absolute top-12 right-12 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
        <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
        <div className="absolute top-20 left-1/3 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-60"></div>
        <div className="absolute bottom-16 right-8 w-2 h-2 bg-[hsl(var(--primary-300))] rounded-full opacity-50"></div>
        {/* Sparkle elements */}
        <Sparkles className="absolute top-6 right-20 w-4 h-4 text-[hsl(var(--primary-300))] opacity-40" />
        <Sparkles className="absolute bottom-12 left-12 w-3 h-3 text-[hsl(var(--primary-400))] opacity-60" />
      </div>

      <div className="p-4 md:p-6 relative z-10">
        {/* Enhanced Header - FIXED ICON */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            {/* FIXED: Proper mobile/desktop icon sizing */}
            <div className="w-20 h-10 md:w-12 md:h-12 rounded-full md:rounded-2xl bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-700 mt-1 text-sm md:text-base">{getContextualSubtitle()}</p>
            </div>
          </div>
          {context === "dashboard" && (
            <Badge className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white border-0 px-3 md:px-4 py-1 md:py-2 font-semibold shadow-lg hidden sm:flex">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Most Popular
            </Badge>
          )}
        </div>

        {/* FIXED: Better carousel positioning */}
        <div className="relative">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {contextualSuppliers.map((supplier) => {
                const buttonState = getButtonState(supplier)
                const isPopular = supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8
                const isLimitedTime =
                  supplier.availability?.includes("Limited") || supplier.availability?.includes("today")

                return (
                  <CarouselItem key={supplier.id} className="pl-2 md:pl-4 basis-[85%] sm:basis-[70%] md:basis-1/3 lg:basis-1/4">
                    <div className="h-full">
                      <Card
                        className="group relative overflow-hidden bg-gradient-to-br from-white to-[hsl(var(--primary-50))] border-2 border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer p-0 rounded-2xl hover:scale-[1.02]"
                        onClick={(e) => handleCardClick(supplier, e)}
                      >
                        {/* Decorative elements */}
                        <div className="absolute top-2 left-2 w-1 h-1 bg-[hsl(var(--primary-300))] rounded-full opacity-60 z-10"></div>
                        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-[hsl(var(--primary-400))] rounded-full opacity-80 z-10"></div>
                        <Sparkles className="absolute top-3 right-8 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40 z-10" />

                        <CardContent className="p-0 flex flex-col h-full">
                          {/* Compact image section */}
                          <div className="relative h-32 md:h-40 lg:h-48 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))]">
                            <div
                              className="relative w-[100%] h-[100%] mask-image mx-auto"
                              style={{
                                WebkitMaskImage: 'url("/image.svg")',
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskSize: "contain",
                                WebkitMaskPosition: "center",
                                maskImage: 'url("/image.svg")',
                                maskRepeat: "no-repeat",
                                maskSize: "contain",
                                maskPosition: "center",
                              }}
                            >
                              <Image
                                src={
                                  supplier.image ||
                                  supplier.imageUrl ||
                                  `/placeholder.svg?height=256&width=256&query=${supplier.name.replace(/\s+/g, "+") || "/placeholder.svg"}+package`
                                }
                                alt={supplier.name}
                                fill
                                className="object-cover group-hover:brightness-110 transition-all duration-300"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>

                            {/* Enhanced badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                              {isPopular && (
                                <Badge className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white text-xs px-2 py-1 shadow-lg border-0">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  Popular
                                </Badge>
                              )}
                              {isLimitedTime && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 shadow-lg border-0">
                                  Limited
                                </Badge>
                              )}
                            </div>

                            {/* Enhanced heart button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(supplier.id)
                              }}
                              className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-20"
                            >
                              <Heart
                                className={`w-3 h-3 ${favorites.includes(supplier.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                              />
                            </button>
                          </div>

                          {/* Compact content section */}
                          <div className="p-3 md:p-4 flex-1 flex flex-col bg-gradient-to-b from-white to-[hsl(var(--primary-50))]">
                            {/* Title and price row */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 pr-2">
                                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight line-clamp-2 mb-1">
                                  {supplier.name}
                                </h3>
                                {showPricing && (() => {
                                  const isPartyBags = supplier.category?.toLowerCase().includes('party bag')

                                  if (isPartyBags) {
                                    return (
                                      <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block">
                                        for {guestCount} bags
                                      </div>
                                    )
                                  }

                                  return (
                                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block">
                                      {supplier.priceUnit}
                                    </div>
                                  )
                                })()}
                              </div>
                              {showPricing && (() => {
                                const isPartyBags = supplier.category?.toLowerCase().includes('party bag')
                                const displayPrice = isPartyBags ? (supplier.priceFrom * guestCount).toFixed(2) : (supplier.priceFrom || 0).toFixed(2)

                                return (
                                  <div className="text-lg md:text-xl font-bold text-[hsl(var(--primary-600))] flex-shrink-0">
                                    £{displayPrice}
                                  </div>
                                )
                              })()}
                            </div>

                            {/* Compact rating and location */}
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-medium text-amber-700">{supplier.rating}</span>
                                <span className="text-amber-600">({supplier.reviewCount})</span>
                              </div>
                              <span className="truncate text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-700 max-w-20">
                                {supplier.location}
                              </span>
                            </div>

                            {/* Enhanced button - NOW uses handleButtonClick */}
                            <Button
                              onClick={(e) => handleButtonClick(supplier, e)}
                              disabled={buttonState.disabled}
                              className={`w-full text-xs md:text-sm py-2 ${buttonState.className} transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl mt-auto`}
                            >
                              <span className="flex items-center justify-center">
                                {buttonState.content.props?.children?.[0] && (
                                  <span className="mr-2">
                                    {React.cloneElement(buttonState.content.props.children[0], {
                                      className: "w-3 h-3",
                                    })}
                                  </span>
                                )}
                                <span>{getContextualCTA()}</span>
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

            {/* FIXED: Better arrow positioning - outside content area on desktop, hidden on mobile */}
            <CarouselPrevious className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-xl bg-white/90 hover:bg-white shadow-lg border-2 border-[hsl(var(--primary-200))] text-[hsl(var(--primary-600))]" />
            <CarouselNext className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-xl bg-white/90 hover:bg-white shadow-lg border-2 border-[hsl(var(--primary-200))] text-[hsl(var(--primary-600))]" />
          </Carousel>

          {/* Mobile navigation hint */}
          <div className="md:hidden mt-4 text-center">
            <p className="text-xs text-gray-500">← Swipe to see more →</p>
          </div>
        </div>
      </div>
    </div>
  )
}
