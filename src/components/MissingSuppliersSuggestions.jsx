// components/MissingSuppliersSuggestions.js
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Star, Sparkles, Gift } from 'lucide-react'
import Image from "next/image"
import { useSuppliers } from "@/utils/mockBackend"

export default function MissingSuppliersSuggestions({ 
  partyPlan, 
  onAddSupplier,
  showTitle = true,
  currentStep = 4,
  navigateWithContext,
  onPlanUpdate,
  toast
}) {
  const [addingItems, setAddingItems] = useState([])
  const [clickedSuppliers, setClickedSuppliers] = useState(new Set())
  const [lastPlanHash, setLastPlanHash] = useState("")
  const { suppliers, loading, error } = useSuppliers()

  // Monitor for plan changes
  useEffect(() => {
    const currentPlanHash = JSON.stringify(partyPlan)
    if (lastPlanHash && lastPlanHash !== currentPlanHash) {
      console.log('🔄 Party plan changed, updating missing suppliers')
      setClickedSuppliers(new Set())
      
      if (onPlanUpdate) {
        onPlanUpdate()
      }
    }
    setLastPlanHash(currentPlanHash)
  }, [partyPlan, lastPlanHash, onPlanUpdate])

  // Define supplier categories
  const ALL_SUPPLIER_TYPES = {
    partyBags: {
      name: "Party Bags",
      icon: "🎁",
      color: "bg-red-500",
      description: "Take-home treats - most popular addition!",
      priority: 1,
      categories: ["Party Bags"]
    },
    cakes: {
      name: "Birthday Cake",
      icon: "🎂",
      color: "bg-pink-500",
      description: "The perfect birthday cake",
      priority: 2,
      categories: ["Cakes"]
    },
    decorations: {
      name: "Decorations",
      icon: "🎈",
      color: "bg-indigo-500",
      description: "Transform your space",
      priority: 3,
      categories: ["Decorations"]
    },
    venue: {
      name: "Venue",
      icon: "🏛️",
      color: "bg-blue-500",
      description: "Perfect party location",
      priority: 4,
      categories: ["Venues"]
    },
    entertainment: {
      name: "Entertainment",
      icon: "🎭",
      color: "bg-purple-500",
      description: "Keep the kids engaged",
      priority: 5,
      categories: ["Entertainment"]
    },
    catering: {
      name: "Catering",
      icon: "🍽️",
      color: "bg-orange-500",
      description: "Delicious party food",
      priority: 6,
      categories: ["Catering"]
    },
    facePainting: {
      name: "Face Painting",
      icon: "🎨",
      color: "bg-green-500",
      description: "Creative fun for kids",
      priority: 7,
      categories: ["Face Painting"]
    },
    activities: {
      name: "Activities",
      icon: "🎪",
      color: "bg-yellow-500",
      description: "Extra fun activities",
      priority: 8,
      categories: ["Activities"]
    }
  }

  // Get missing suppliers with multiple options per category
  const getMissingSuppliers = () => {
    if (!suppliers || suppliers.length === 0) return []

    const currentSuppliers = Object.keys(partyPlan || {}).filter(
      key => partyPlan[key] !== null && partyPlan[key] !== undefined && key !== 'addons'
    )

    const missingTypes = Object.keys(ALL_SUPPLIER_TYPES).filter(
      type => !currentSuppliers.includes(type)
    )

    return missingTypes
      .sort((a, b) => ALL_SUPPLIER_TYPES[a].priority - ALL_SUPPLIER_TYPES[b].priority)
      .map(type => {
        const config = ALL_SUPPLIER_TYPES[type]
        
        // Find real suppliers that match this category
        const matchingSuppliers = suppliers.filter(supplier => 
          config.categories.includes(supplier.category)
        )

        // Sort by rating and take top 4 for variety
        const sortedSuppliers = matchingSuppliers
          .sort((a, b) => {
            const aPopular = a.badges?.includes("Highly Rated") ? 1 : 0
            const bPopular = b.badges?.includes("Highly Rated") ? 1 : 0
            if (aPopular !== bPopular) {
              return bPopular - aPopular
            }
            
            const aScore = (a.rating || 0) * (a.reviewCount || 0)
            const bScore = (b.rating || 0) * (b.reviewCount || 0)
            return bScore - aScore
          })
          .slice(0, 4) // Take top 4 suppliers

        if (sortedSuppliers.length > 0) {
          return {
            type,
            config,
            suppliers: sortedSuppliers
          }
        }

        return null
      })
      .filter(Boolean)
      .slice(0, 3) // Show max 3 categories
  }

  // Handle viewing supplier details
  const handleViewDetails = (supplier) => {
    if (clickedSuppliers.has(supplier.id)) {
      return
    }
    
    setClickedSuppliers(prev => new Set([...prev, supplier.id]))
    
    try {
      if (!supplier.id) {
        throw new Error('No supplier ID found')
      }
      
      const reviewContext = {
        page: 'review-book',
        step: currentStep,
        stepId: 'forgotten',
        scrollPosition: window.pageYOffset,
        selectedSupplierId: supplier.id,
        returnAction: 'view-details-from-missing',
        partyPlanSnapshot: partyPlan
      }
      
      if (navigateWithContext) {
        setTimeout(() => {
          navigateWithContext(`/supplier/${supplier.id}`, 'review-book-missing', reviewContext)
        }, 300)
      } else {
        sessionStorage.setItem('reviewBookContext', JSON.stringify(reviewContext))
        setTimeout(() => {
          window.location.href = `/supplier/${supplier.id}?from=review-book-missing&step=${currentStep}`
        }, 300)
      }
      
    } catch (error) {
      console.error('❌ Navigation error:', error)
      setClickedSuppliers(prev => {
        const newSet = new Set(prev)
        newSet.delete(supplier.id)
        return newSet
      })
      alert(`Failed to open supplier profile. Error: ${error.message}`)
    }
  }

  // Handle adding supplier
  const handleAddSupplier = async (supplier, supplierType) => {
    const supplierId = supplier.id
    
    if (addingItems.includes(supplierId)) {
      return
    }

    setAddingItems(prev => [...prev, supplierId])

    try {
      if (onAddSupplier) {
        await onAddSupplier(supplier, supplierType)
      }

      setTimeout(() => {
        setAddingItems(prev => prev.filter(id => id !== supplierId))
      }, 2000)
    } catch (error) {
      console.error("Error adding supplier:", error)
      setAddingItems(prev => prev.filter(id => id !== supplierId))
    }
  }

  const missingSuppliers = getMissingSuppliers()

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {showTitle && (
          <div className="text-center">
            <div className="text-3xl mb-2">🤔</div>
            <h3 className="text-lg font-semibold text-gray-800">Checking for missing items...</h3>
          </div>
        )}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="flex gap-4 overflow-hidden">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-64 h-48 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    console.error("Error loading suppliers for missing suggestions:", error)
    return null
  }

  // Don't render if no missing suppliers
  if (missingSuppliers.length === 0) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="text-center">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="text-lg font-semibold text-gray-800">All set!</h3>
            <p className="text-sm text-gray-600 mt-1">
              You've got everything you need for an amazing party
            </p>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 border-2 border-primary-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎊</span>
            </div>
          </div>
          <p className="text-primary-800 font-semibold text-lg">
            Your party plan is complete!
          </p>
          <p className="text-primary-700 mt-2">
            Ready to send those enquiries and make this party happen?
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <div className="text-3xl mb-2">🤔</div>
          <h3 className="text-lg font-semibold text-gray-800">Anything else missing?</h3>
          <p className="text-sm text-gray-600 mt-1">
            Here are some popular additions you might want to consider
          </p>
        </div>
      )}

      {/* Vertical sections for each category */}
      {missingSuppliers.map(({ type, config, suppliers }) => (
        <div key={type} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
              <span className="text-lg">{config.icon}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{config.name}</h3>
              {/* <p className="text-sm text-gray-600">{config.description}</p> */}
            </div>
          </div>

          {/* Horizontal scrollable cards */}
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {suppliers.map((supplier) => {
              const isAdding = addingItems.includes(supplier.id)
              const isClicked = clickedSuppliers.has(supplier.id)

              return (
                <Card 
                  key={supplier.id}
                  className="flex-shrink-0 w-64 md:w-72 overflow-hidden bg-gradient-to-br from-white to-[hsl(var(--primary-50))] border-2 border-[hsl(var(--primary-200))] shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-[1.02]"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Image section */}
                    <div className="relative h-32 md:h-36 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))]">
                      <Image
                        src={supplier.image || supplier.imageUrl || `/placeholder.svg?height=256&width=256&query=${supplier.name.replace(/\s+/g, "+")}`}
                        alt={supplier.name}
                        fill
                        className="object-cover group-hover:brightness-110 transition-all duration-300"
                        sizes="(max-width: 768px) 256px, 288px"
                      />

                      {/* Popular badge */}
                      {(supplier.badges?.includes("Highly Rated") || supplier.rating >= 4.8) && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white text-xs px-2 py-1 shadow-lg border-0">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Popular
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content section */}
                    <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-white to-[hsl(var(--primary-50))]">
                      {/* Title and price */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 pr-2">
                          <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                            {supplier.name}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {supplier.description}
                          </p>
                        </div>
                        <div className="text-lg font-bold text-[hsl(var(--primary-600))] flex-shrink-0">
                          £{supplier.priceFrom}
                        </div>
                      </div>

                      {/* Rating and price unit */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-amber-700">{supplier.rating}</span>
                          <span className="text-amber-600">({supplier.reviewCount})</span>
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {supplier.priceUnit}
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-auto">
                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(supplier)
                          }}
                          disabled={isClicked}
                          className={`
                            flex-1 text-xs py-2 transition-all duration-200 rounded-xl
                            ${isClicked 
                              ? 'opacity-75 cursor-wait bg-primary-100 text-primary-700' 
                              : 'hover:scale-105 border-[hsl(var(--primary-500))] text-gray-700 active:scale-95'
                            }
                          `}
                        >
                          {isClicked ? (
                            <div className="flex items-center gap-1 justify-center">
                              <div className="w-3 h-3 border-2 rounded-full border-[hsl(var(--primary-500))] border-t-transparent animate-spin"></div>
                              Opening...
                            </div>
                          ) : (
                            'View Details'
                          )}
                        </Button>

                        {/* Add to Party Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddSupplier(supplier, type)
                          }}
                          disabled={isAdding}
                          className={`
                            flex-1 text-xs py-2 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl
                            ${isAdding 
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                              : "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white"
                            }
                          `}
                        >
                          {isAdding ? (
                            <>
                              <div className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Scroll hint for mobile */}
          {suppliers.length > 1 && (
            <div className="text-center md:hidden">
              <p className="text-xs text-gray-500">← Swipe to see more {config.name.toLowerCase()} options →</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}