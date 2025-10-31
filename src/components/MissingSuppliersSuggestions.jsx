// components/MissingSuppliersSuggestions.js
"use client"

import { useState, useEffect } from "react"
import { useSuppliers } from "@/utils/mockBackend"
import EmptySupplierCard from "@/app/(main)/dashboard/components/SupplierCard/EmptySupplierCard"
import confetti from 'canvas-confetti'
import { scoreSupplierWithTheme } from "@/utils/partyBuilderBackend"

export default function MissingSuppliersSuggestions({
  partyPlan,
  partyDetails = {}, // Add partyDetails to get theme info
  onAddSupplier,
  showTitle = true,
  currentStep = 4,
  navigateWithContext,
  onPlanUpdate,
  toast,
  addedSupplierIds = new Set(),
  preventNavigation = false,
  horizontalScroll = false, // NEW: Enable horizontal scroll mode
  disableConfetti = false, // NEW: Disable confetti animation
  onCustomize, // NEW: Callback to open customization modal
}) {
  const [clickedSuppliers, setClickedSuppliers] = useState(new Set())
  const [lastPlanHash, setLastPlanHash] = useState("")
  const [recentlyAddedTypes, setRecentlyAddedTypes] = useState(new Set())
  const [justAddedTypes, setJustAddedTypes] = useState(new Set())
  const [hiddenTypes, setHiddenTypes] = useState(new Set())
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

    // ✅ FIX: Exclude einvites and addons from current suppliers list
    const currentSuppliers = Object.keys(partyPlan || {}).filter(
      key => partyPlan[key] !== null && partyPlan[key] !== undefined && key !== 'addons' && key !== 'einvites'
    )

    // Include types that are missing (not in plan, not hidden, or just added to show green state)
    const missingTypes = Object.keys(ALL_SUPPLIER_TYPES).filter(
      type => {
        // Hide if it's been hidden after adding
        if (hiddenTypes.has(type)) return false

        // Show if just added (to display green state)
        if (justAddedTypes.has(type)) return true

        // Show if not in current suppliers
        return !currentSuppliers.includes(type)
      }
    )

    return missingTypes
      .sort((a, b) => ALL_SUPPLIER_TYPES[a].priority - ALL_SUPPLIER_TYPES[b].priority)
      .map(type => {
        const config = ALL_SUPPLIER_TYPES[type]
        const partyTheme = partyDetails?.theme || 'no-theme'

        // Find real suppliers that match this category
        const matchingSuppliers = suppliers.filter(supplier =>
          config.categories.includes(supplier.category)
        )

        // Sort by theme-based scoring (same as party builder)
        const sortedSuppliers = matchingSuppliers
          .map(supplier => ({
            supplier,
            themeScore: scoreSupplierWithTheme(supplier, partyTheme)
          }))
          .sort((a, b) => {
            // First, sort by theme score (higher is better)
            if (a.themeScore !== b.themeScore) {
              return b.themeScore - a.themeScore
            }

            // Then by "Highly Rated" badge
            const aPopular = a.supplier.badges?.includes("Highly Rated") ? 1 : 0
            const bPopular = b.supplier.badges?.includes("Highly Rated") ? 1 : 0
            if (aPopular !== bPopular) {
              return bPopular - aPopular
            }

            // Finally by rating × review count
            const aScore = (a.supplier.rating || 0) * (a.supplier.reviewCount || 0)
            const bScore = (b.supplier.rating || 0) * (b.supplier.reviewCount || 0)
            return bScore - aScore
          })
          .map(item => item.supplier) // Extract just the supplier
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

  // Handle adding supplier - simplified wrapper
  const handleAddSupplier = async (supplier, supplierType) => {
    try {
      if (onAddSupplier) {
        // Mark as just added BEFORE calling parent (prevents flicker)
        if (preventNavigation) {
          setJustAddedTypes(prev => new Set([...prev, supplierType]))
        }

        // Call parent handler to add the supplier
        const result = await onAddSupplier(supplier, supplierType)

        if (result && preventNavigation) {
          // Trigger confetti only if not disabled
          if (!disableConfetti) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            })
          }

          // After 2 seconds, start fade out, then hide after animation
          setTimeout(() => {
            setHiddenTypes(prev => new Set([...prev, supplierType]))
            setJustAddedTypes(prev => {
              const newSet = new Set(prev)
              newSet.delete(supplierType)
              return newSet
            })
          }, 2000)
        } else if (!result && preventNavigation) {
          // If failed, remove from justAddedTypes
          setJustAddedTypes(prev => {
            const newSet = new Set(prev)
            newSet.delete(supplierType)
            return newSet
          })
        }

        return result
      }

      return false
    } catch (error) {
      console.error("Error adding supplier:", error)
      // Remove from justAddedTypes on error
      if (preventNavigation) {
        setJustAddedTypes(prev => {
          const newSet = new Set(prev)
          newSet.delete(supplierType)
          return newSet
        })
      }
      throw error // Let EmptySupplierCard handle the error
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

        <div className="bg-gradient-to-r from-blue-50 to-[hsl(var(--primary-50))] border-2 border-[hsl(var(--primary-200))] rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-[hsl(var(--primary-500))] rounded-full flex items-center justify-center">
              <span className="text-2xl">🎊</span>
            </div>
          </div>
          <p className="text-[hsl(var(--primary-800))] font-semibold text-lg">
            Your party plan is complete!
          </p>
          <p className="text-[hsl(var(--primary-700))] mt-2">
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

      {/* Compact grid or horizontal scroll */}
      <div className={horizontalScroll
        ? "flex gap-4 overflow-x-auto pb-2 pl-4 pr-4 snap-x snap-mandatory scrollbar-hide"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      }>
        {missingSuppliers.map(({ type, config, suppliers }) => {
          const isAdded = addedSupplierIds.has(suppliers[0]?.id);
          const isJustAdded = !disableConfetti && justAddedTypes.has(type);

          return (
            <div
              key={type}
              className={horizontalScroll ? "flex-shrink-0 w-[180px] snap-start" : ""}
            >
              <EmptySupplierCard
                type={type}
                recommendedSupplier={suppliers[0]}
                partyDetails={partyPlan}
                onAddSupplier={(supplierType, supplier) => handleAddSupplier(supplier, supplierType)}
                isCompact={true}
                isAlreadyAdded={!disableConfetti && (isAdded || isJustAdded)}
                deliverooStyle={true}
                showJustAdded={!disableConfetti && isJustAdded}
                onCustomize={onCustomize}
                disableSuccessState={disableConfetti}
              />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}