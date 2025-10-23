// MobileSupplierNavigation.jsx - Complete update for venue carousel

"use client"
import { useState, useEffect, useRef } from "react"
import { Building, Music, Utensils, Palette, Sparkles, Gift, Plus, Camera, Cake, Castle, Check, Users } from "lucide-react"
import SupplierCard from "./SupplierCard/SupplierCard"
import Image from "next/image"
import AddonsSection from "./AddonsSection"
import RecommendedAddons from "@/components/recommended-addons"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MyPartyTabContent from "../DatabaseDashboard/components/MyPartyTabContent"
import { useToast } from "@/components/ui/toast"

export default function MobileSupplierNavigation({
  suppliers,
  loadingCards = [],
  totalCost,
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  getEnquiryStatus,
  getEnquiryTimestamp,
  isPaymentConfirmed = false,
  enquiries = [],
  showPartyTasks = false,
  partyTasksStatus = {},
  currentPhase = "planning",
  handleCancelEnquiry,
  onAddonClick = null,
  showRecommendedAddons = true,
  onPaymentReady,
  onSupplierTabChange,
  activeSupplierType,
  showFirstTimeHelp = false,
  isTourActiveOnNavigation = false,
  getSupplierDisplayPricing,
  partyDetails,
  getRecommendedSupplierForType,
  onAddSupplier,
  // ✅ NEW PROPS FOR VENUE CAROUSEL
  venueCarouselOptions = [],
  onSelectVenue,
  isSelectingVenue = false,
  onCustomizationComplete, // ✅ NEW PROP for customization
  showBrowseVenues = false,
  onBrowseVenues,
  onEditPartyDetails, // ✅ NEW PROP for editing party details
  onPhotoUpload, // ✅ NEW PROP for photo upload
  childPhoto, // ✅ NEW PROP for child photo
  uploadingPhoto, // ✅ NEW PROP for upload state
}) {
  const router = useRouter()
  const { toast } = useToast()

    // ... (keep all existing supplier types array - no changes needed)
    const supplierTypes = [
      {
        id: "myParty",
        type: "myParty",
        title: "My Party",
        name: "My Party",
        image: childPhoto || "https://res.cloudinary.com/dghzq6xtd/image/upload/v1755719830/bs2klexzuin8ygfndexc.png",
        icon: <Sparkles className="w-5 h-5" />,
        isMyPartySection: true,
      },
      {
        id: "venue",
        type: "venue",
        title: "Venue",
        name: "Venue",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386510/iStock-2194928280_1_j9rcey.jpg",
        icon: <Building className="w-5 h-5" />,
      },
      {
        id: "entertainment", 
        type: "entertainment",
        title: "Entertainment",
        name: "Entertainment",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386472/iStock-2067025996_p6x3k4.jpg",
        icon: <Music className="w-5 h-5" />,
      },
      {
        id: "cakes",
        type: "cakes",
        title: "Cakes",
        name: "Cakes",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756385304/iStock-1467525287_chvhqw.jpg",
        icon: <Cake className="w-5 h-5" />,
      },
      {
        id: "decorations",
        type: "decorations",
        title: "Decorations",
        name: "Decorations",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386306/iStock-1702395012_z3e8mp.jpg",
        icon: <Palette className="w-5 h-5" />,
      },
      {
        id: "photography",
        type: "photography", 
        title: "Photography",
        name: "Photography",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386547/iStock-1181011006_tf3w8n.jpg",
        icon: <Camera className="w-5 h-5" />,
      },
      {
        id: "facePainting",
        type: "facePainting",
        title: "Face Painting",
        name: "Face Painting",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756385783/iStock-484189669_epczo3.jpg",
        icon: <Palette className="w-5 h-5" />,
      },
      {
        id: "catering",
        type: "catering",
        title: "Catering",
        name: "Catering", 
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756385342/iStock-669850098_wnqysx.jpg",
        icon: <Utensils className="w-5 h-5" />,
      },
      {
        id: "activities",
        type: "activities",
        title: "Activities",
        name: "Activities",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756385838/iStock-2185368487_a68z9g.jpg",
        icon: <Music className="w-5 h-5" />,
      },
      {
        id: "partyBags",
        type: "partyBags", 
        title: "Party Bags",
        name: "Party Bags",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386272/iStock-2212524051_v1njlh.jpg",
        icon: <Gift className="w-5 h-5" />,
      },
      {
        id: "bouncyCastle",
        type: "bouncyCastle",
        title: "Bouncy Castle", 
        name: "Bouncy Castle",
        image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386872/iStock-120532646_bdk29o.jpg",
        icon: <Castle className="w-5 h-5" />,
      },
    ]
  
  // ... (keep all existing state and refs)
  const [internalActiveTab, setInternalActiveTab] = useState(0)
  const activeTab = activeSupplierType !== undefined ?
    supplierTypes.findIndex(st => st.type === activeSupplierType) :
    internalActiveTab

  const tabsRef = useRef(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const autoScrollIntervalRef = useRef(null)

  // Track if user clicked "I'm Happy" (to show CTA)
  const [showCompleteCTA, setShowCompleteCTA] = useState(false)
  const ctaRef = useRef(null)

  // Track if swipe hint has been shown
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSeenSwipeHint') !== 'true'
    }
    return true
  })

  // Auto-hide swipe hint after 8 seconds
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        handleDismissSwipeHint()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [showSwipeHint])

  const handleDismissSwipeHint = () => {
    setShowSwipeHint(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenSwipeHint', 'true')
    }
  }

  // ... (keep all existing party tasks)
  const partyTasks = [
    {
      id: "einvites",
      title: "E-Invites",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754405084/party-invites/m02effvlanaxupepzsza.png",
      cardId: "einvites-card"
    },
    {
      id: "rsvps", 
      title: "RSVPs",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753986373/jwq8wmgxqqfue2zsophq.jpg",
      cardId: "rsvp-card"
    },
    {
      id: "gifts",
      title: "Gifts",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg",
      cardId: "gift-registry-card"
    }
  ]

  // ... (keep all existing helper functions and effects)
  const getAddonCount = () => {
    const standaloneAddons = addons.length
    const supplierAddons = Object.values(suppliers).reduce((count, supplier) => {
      return count + (supplier?.selectedAddons?.length || 0)
    }, 0)
    return standaloneAddons + supplierAddons
  }

  const startAutoScrollDemo = () => {
    if (!tabsRef.current || isAutoScrolling) return
    
    setIsAutoScrolling(true)
    let scrollDirection = 1
    let currentPosition = 0
    const maxScroll = tabsRef.current.scrollWidth - tabsRef.current.clientWidth
    const scrollStep = 150
    
    autoScrollIntervalRef.current = setInterval(() => {
      if (!tabsRef.current) return
      
      currentPosition += scrollDirection * scrollStep
      
      if (currentPosition >= maxScroll) {
        scrollDirection = -1
        currentPosition = maxScroll
      } else if (currentPosition <= 0) {
        scrollDirection = 1
        currentPosition = 0
      }
      
      tabsRef.current.scrollTo({
        left: currentPosition,
        behavior: 'smooth'
      })
    }, 1000)
    
    setTimeout(() => {
      stopAutoScrollDemo()
    }, 6000)
  }
  
  const stopAutoScrollDemo = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
    setIsAutoScrolling(false)
    
    if (tabsRef.current) {
      const tabWidth = 80
      const scrollPosition = activeTab * tabWidth - tabsRef.current.clientWidth / 2 + tabWidth / 2
      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }
  
  useEffect(() => {
    if (isTourActiveOnNavigation && !isAutoScrolling) {
      console.log('Tour active on navigation - starting demo')
      const timeout = setTimeout(() => {
        startAutoScrollDemo()
      }, 200)
      
      return () => clearTimeout(timeout)
    } else if (!isTourActiveOnNavigation && isAutoScrolling) {
      console.log('Tour no longer on navigation - stopping demo')
      stopAutoScrollDemo()
    }
  }, [isTourActiveOnNavigation, isAutoScrolling])

  useEffect(() => {
    if (tabsRef.current) {
      const tabWidth = 80
      const scrollPosition = activeTab * tabWidth - tabsRef.current.clientWidth / 2 + tabWidth / 2
      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }, [activeTab])

  const handleTabSelect = (index, supplierType) => {
    if (activeSupplierType === undefined) {
      setInternalActiveTab(index)
    }

    if (onSupplierTabChange) {
      onSupplierTabChange(supplierType.type)
    }

    // Don't auto-scroll if prevent-auto-scroll is active (e.g., adding from Optional Extras)
    const shouldPreventScroll = document.body.classList.contains('prevent-auto-scroll')

    if (!shouldPreventScroll) {
      setTimeout(() => {
        const contentElement = document.getElementById('mobile-supplier-content')
        if (contentElement) {
          const offset = 140
          const elementPosition = contentElement.getBoundingClientRect().top + window.pageYOffset
          window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }

  const handleAddAddon = async (addon) => {
    console.log('🎁 Adding addon:', addon.name)
  }

  const renderAddonsContent = () => {
    const addonCount = getAddonCount()

    if (addonCount === 0) {
      return (
        <div className="bg-gradient-to-br from-white to-teal-50 border-2 border-dashed border-teal-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">No Add-ons Yet</h3>
          <p className="text-gray-600 text-sm mb-4">
            Enhance your party with amazing extras and add-ons!
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => console.log('Browse addons')}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Browse Add-ons
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <AddonsSection
          addons={addons}
          suppliers={suppliers}
          handleRemoveAddon={handleRemoveAddon}
          className="bg-white rounded-xl border border-gray-200 p-4"
        />

        {showRecommendedAddons && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              More Add-ons
            </h3>
            <RecommendedAddons
              context="mobile"
              maxItems={4}
              onAddToCart={handleAddAddon}
              onAddonClick={onAddonClick}
              className="grid grid-cols-1 gap-3"
              partyDetails={partyDetails}
            />
          </div>
        )}
      </div>
    )
  }

  const renderMyPartyContent = () => {
    // Calculate total deposit amount for outstanding payments
    const outstandingSuppliers = Object.entries(suppliers).filter(([type, supplier]) => {
      if (!supplier || type === "einvites") return false
      const enquiry = enquiries.find((e) => e.supplier_category === type)
      const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true
      return !isPaid && supplier
    })

    const totalDepositAmount = outstandingSuppliers.reduce((sum, [type, supplier]) => {
      return sum + (supplier.price || 0)
    }, 0)

    const hasOutstandingPayments = outstandingSuppliers.length > 0

    // Handle view details click
    const handleViewDetails = (type, supplier) => {
      if (supplier.id) {
        router.push(`/supplier/${supplier.id}?from=dashboard`)
      }
    }

    // Handle remove supplier
    const handleRemoveSupplier = (type) => {
      if (handleDeleteSupplier) {
        // Get supplier name before removing
        const supplierName = suppliers[type]?.name || type

        handleDeleteSupplier(type)

        // Show toast notification
        toast({
          title: "Supplier removed",
          description: `${supplierName} has been removed from your party plan`,
        })
      }
    }

    // Handle add supplier from missing suggestions
    const handleAddSupplier = async (supplier, supplierType, shouldNavigate = true) => {
      if (onAddSupplier) {
        return await onAddSupplier(supplierType, supplier, shouldNavigate)
      }
      return false
    }

    // Build recommended suppliers object for missing suggestions
    const recommendedSuppliers = {}
    if (getRecommendedSupplierForType) {
      const allTypes = ['venue', 'entertainment', 'cakes', 'decorations', 'facePainting', 'activities', 'partyBags', 'balloons', 'catering']
      allTypes.forEach(type => {
        const recommended = getRecommendedSupplierForType(type)
        if (recommended) {
          recommendedSuppliers[type] = recommended
        }
      })
    }

    return (
      <MyPartyTabContent
        suppliers={suppliers}
        enquiries={enquiries}
        addons={addons}
        partyDetails={partyDetails}
        onRemoveSupplier={handleRemoveSupplier}
        onViewDetails={handleViewDetails}
        onAddSupplier={handleAddSupplier}
        recommendedSuppliers={recommendedSuppliers}
        onCustomizationComplete={onCustomizationComplete}
        onBrowseVenues={onBrowseVenues}
        onEditPartyDetails={onEditPartyDetails}
        onPhotoUpload={onPhotoUpload}
        childPhoto={childPhoto}
        uploadingPhoto={uploadingPhoto}
        onImHappy={() => {
          setShowCompleteCTA(true)
          // Scroll to CTA after it renders
          setTimeout(() => {
            if (ctaRef.current) {
              ctaRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              })
            }
          }, 100)
        }}
      />
    )
  }

  // Keep old implementation as fallback (can be removed later)
  const renderMyPartyContentOld = () => {
    // Get all selected suppliers
    const selectedSuppliers = Object.entries(suppliers).filter(([_, supplier]) => supplier !== null)

    // Supplier selection reasons
    const selectionReasons = {
      venue: "Perfect location that matches your party size and style",
      entertainment: "Top-rated entertainer loved by kids in your area",
      cakes: "Custom cake designs that match your party theme",
      decorations: "Beautiful decorations to transform your space",
      photography: "Professional photos to capture every magical moment",
      facePainting: "Creative designs that kids absolutely love",
      catering: "Delicious food options that kids and adults enjoy",
      activities: "Fun activities to keep everyone entertained",
      partyBags: "Exciting party bags that kids will love taking home",
      bouncyCastle: "Safe and fun bouncy castle for hours of entertainment"
    }

    const getTypeConfig = (supplierType) => {
      const configs = {
        venue: { color: "bg-blue-500", icon: "🏛️" },
        entertainment: { color: "bg-purple-500", icon: "🎭" },
        catering: { color: "bg-orange-500", icon: "🍽️" },
        cakes: { color: "bg-pink-500", icon: "🎂" },
        facePainting: { color: "bg-green-500", icon: "🎨" },
        activities: { color: "bg-yellow-500", icon: "🎪" },
        decorations: { color: "bg-indigo-500", icon: "🎈" },
        balloons: { color: "bg-cyan-500", icon: "🎈" },
        partyBags: { color: "bg-red-500", icon: "🎁" },
        bouncyCastle: { color: "bg-teal-500", icon: "🏰" },
        photography: { color: "bg-violet-500", icon: "📸" }
      }
      return configs[supplierType] || { color: "bg-gray-500", icon: "📦" }
    }

    const fullChildName = partyDetails?.childName || partyDetails?.child_name || 'your child'
    const childFirstName = fullChildName.split(' ')[0]

    return (
      <div className="space-y-6">
        {/* Suppliers List */}
        {selectedSuppliers.length > 0 ? (
          <div className="space-y-4">
            {selectedSuppliers.map(([type, supplier]) => {
              // Skip if supplier is not valid
              if (!supplier || typeof supplier !== 'object') return null

              const supplierTypeData = supplierTypes.find(st => st.type === type)
              const typeConfig = getTypeConfig(type)

              // Get display name safely - ensure it's a string
              let displayName = 'Supplier'
              try {
                const nameResult = getSupplierDisplayName ? getSupplierDisplayName(supplier) : null
                if (typeof nameResult === 'string' && nameResult) {
                  displayName = nameResult
                } else if (typeof supplier.business_name === 'string' && supplier.business_name) {
                  displayName = supplier.business_name
                } else if (typeof supplier.name === 'string' && supplier.name) {
                  displayName = supplier.name
                }
              } catch (e) {
                console.error('Error getting display name:', e)
              }

              // Get image safely
              const supplierImage = supplier?.coverPhoto || supplier?.images?.[0] || supplier?.image || supplier?.imageUrl || supplierTypeData?.image

              // Get price as string - safely
              let priceDisplay = null
              try {
                const enhancedPricing = getSupplierDisplayPricing ? getSupplierDisplayPricing(supplier, partyDetails) : null
                if (enhancedPricing) {
                  if (typeof enhancedPricing.displayPrice === 'string') {
                    priceDisplay = enhancedPricing.displayPrice
                  } else if (typeof enhancedPricing.finalPrice === 'number') {
                    priceDisplay = enhancedPricing.finalPrice
                  }
                }
                if (!priceDisplay && typeof supplier.price === 'number') {
                  priceDisplay = supplier.price
                }
              } catch (e) {
                console.error('Error getting price:', e)
              }

              // Get location safely
              const location = typeof supplier.location === 'string' ? supplier.location : null

              // Get category name safely
              const categoryName = typeof supplierTypeData?.name === 'string' ? supplierTypeData.name : type

              return (
                <Card
                  key={type}
                  className="overflow-hidden rounded-2xl border-2 border-white shadow-xl transition-all duration-300 hover:shadow-2xl"
                  onClick={() => {
                    if (supplier.id) {
                      router.push(`/supplier/${supplier.id}?from=dashboard`)
                    }
                  }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 w-full">
                    {supplierImage && typeof supplierImage === 'string' && (
                      <Image
                        src={supplierImage}
                        alt={displayName}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-800/60 to-gray-900/70" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${typeConfig.color} text-white shadow-lg backdrop-blur-sm`}>
                          {typeConfig.icon} {String(categoryName)}
                        </Badge>
                      </div>
                    </div>

                    {/* Supplier info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-1 drop-shadow-lg truncate">
                          {String(displayName)}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            {priceDisplay && (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black drop-shadow-lg">£{String(priceDisplay)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {location && (
                          <p className="text-xs text-white/80 mt-1 drop-shadow">📍 {String(location)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Why We Picked This */}
                  <div className="p-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-white">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[hsl(var(--primary-500))] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[hsl(var(--primary-700))] mb-1">Why we picked this:</p>
                        <p className="text-sm text-gray-700">{String(selectionReasons[type] || 'Great choice for your party!')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">No suppliers selected yet</h3>
            <p className="text-gray-600 text-sm">
              Swipe through the tabs to add suppliers to your party
            </p>
          </div>
        )}
      </div>
    )
  }

  const activeSupplierTypeData = supplierTypes[activeTab]
  const currentSupplier = activeSupplierTypeData?.isAddonSection ? 
    null : 
    suppliers[activeSupplierTypeData?.type]

  return (
    <div className="w-full relative">
      {/* Sticky Tab Navigation - KEEP AS IS */}
      <div className="sticky top-0 z-30 bg-white  border-b-2 border-[hsl(var(--primary-200))] mb-6" data-tour="mobile-navigation-tabs">
        <div className="relative overflow-hidden ">
          {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-8 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
            <div className="absolute top-4 right-12 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
            <div className="absolute bottom-2 left-16 w-1 h-1 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
            <Sparkles className="absolute top-3 right-20 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />
          </div> */}

          <div className="px-4 py-4 relative z-10">
            <div className="overflow-x-auto scrollbar-hide" ref={tabsRef}>
              <div className="flex space-x-2 min-w-max pr-8">
                {supplierTypes.map((supplierType, index) => {
                  const isActive = activeTab === index
                  const hasContent = supplierType.isMyPartySection
                    ? Object.values(suppliers).some(s => s !== null)
                    : supplierType.isAddonSection
                      ? getAddonCount() > 0
                      : !!suppliers[supplierType.type]

                  return (
                    <button
                      key={supplierType.id}
                      onClick={() => handleTabSelect(index, supplierType)}
                      className="flex-shrink-0 relative transition-all duration-200 hover:transform hover:scale-105"
                      style={{ minWidth: '80px' }}
                    >
                      <div className="flex flex-col items-center">
                      <div className="w-18 h-18 rounded-full flex items-center justify-center mb-2 transition-all duration-200 overflow-visible relative shadow-md hover:shadow-lg bg-gray-100">
                          <Image
                            src={supplierType.image}
                            alt={supplierType.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          
                          {isActive && (
                            <div className="absolute inset-0 rounded-full border-5 border-[hsl(var(--primary-500))] shadow-lg"></div> 
                          )}
                          
                          {hasContent && (
                            <div className="absolute top-0 right-0 w-5 h-5 bg-white rounded-full border-2 border-gray-200 shadow-lg flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-primary-700 font-bold' : 'text-gray-700'}`}>
                            {supplierType.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {showPartyTasks && (
                  <>
                    <div className="flex-shrink-0 flex items-center justify-center w-8">
                      <div className="w-px h-12 bg-gray-300"></div>
                    </div>

                    {partyTasks.map((task) => {
                      const isCompleted = partyTasksStatus[task.id]?.completed
                      const count = partyTasksStatus[task.id]?.count || 0
                      const hasActivity = partyTasksStatus[task.id]?.hasActivity

                      return (
                        <button
                          key={task.id}
                          onClick={() => {
                            console.log('Party task clicked:', task.id)
                          }}
                          className="flex-shrink-0 relative transition-all duration-200 hover:transform hover:scale-105"
                          style={{ minWidth: '90px' }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-200 overflow-hidden relative shadow-md hover:shadow-lg bg-gray-100">
                              <Image
                                src={task.image}
                                alt={task.title}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover rounded-full"
                              />
                              
                              {isCompleted && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                              )}
                              
                              {count > 0 && (
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{count}</span>
                                </div>
                              )}
                              
                              {hasActivity && (
                                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-semibold leading-tight text-gray-700">
                                {task.title}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        {/* Swipe Hint Tooltip */}
        {showSwipeHint && (
          <div className="absolute top-full left-0 right-0 mt-2 px-4 z-40 animate-in slide-in-from-top duration-300">
            <div className="relative bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white px-4 py-3 rounded-xl shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👉</span>
                  <p className="text-sm font-medium">Swipe to add more suppliers to your party!</p>
                </div>
                <button
                  onClick={handleDismissSwipeHint}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Dismiss hint"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
              {/* Arrow pointing up to tabs */}
              <div className="absolute -top-2 left-8 w-4 h-4 bg-[hsl(var(--primary-500))] transform rotate-45"></div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ UPDATED: Supplier Card Content with Venue Carousel */}
      <div className="px-4" id="mobile-supplier-content" data-tour="mobile-supplier-cards">
        {activeSupplierTypeData?.isMyPartySection ? (
          <div>
            {renderMyPartyContent()}
          </div>
        ) : activeSupplierTypeData?.isAddonSection ? (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Add-ons & Extras
              </h2>
              <p className="text-sm text-gray-600">
                Enhance your party with special extras
              </p>
            </div>
            {renderAddonsContent()}
          </div>
        ) : (
          <div>
            <div className="transition-all duration-300 ease-in-out" data-tour={activeSupplierTypeData.type === 'venue' ? 'venue-card-mobile' : undefined}>
          {(() => {
            // Special handling for venue type
            if (activeSupplierTypeData.type === 'venue') {
              const userHasOwnVenue = partyDetails?.hasOwnVenue === true;
              const hasSelectedVenue = !!suppliers.venue;
              const hasCarouselOptions = venueCarouselOptions && venueCarouselOptions.length > 0;
              
              console.log('🏛️ Mobile Venue Decision:', {
                userHasOwnVenue,
                hasSelectedVenue,
                hasCarouselOptions
              });
              
              // If user has own venue AND hasn't selected one, show empty card
              if (userHasOwnVenue && !hasSelectedVenue) {
                console.log('✅ Showing empty venue card (user has own venue)');
                return (
                  <SupplierCard
                    type="venue"
                    supplier={null} // ✅ Pass null to show EmptySupplierCard
                    loadingCards={loadingCards}
                    suppliersToDelete={suppliersToDelete}
                    openSupplierModal={(category) => {
                      console.log('🎯 User wants to browse venues - clearing hasOwnVenue');
                      const updatedPartyDetails = {
                        ...partyDetails,
                        hasOwnVenue: false
                      };
                      localStorage.setItem('party_details', JSON.stringify(updatedPartyDetails));
                      window.location.reload();
                    }}
                    handleDeleteSupplier={handleDeleteSupplier}
                    getSupplierDisplayName={getSupplierDisplayName}
                    addons={[]}
                    handleRemoveAddon={handleRemoveAddon}
                    enquiryStatus={null}
                    enquirySentAt={null}
                    isSignedIn={true}
                    isPaymentConfirmed={false}
                    enquiries={[]}
                    currentPhase={currentPhase}
                    handleCancelEnquiry={handleCancelEnquiry}
                    onPaymentReady={onPaymentReady}
                    enhancedPricing={null}
                    partyDetails={partyDetails}
                    recommendedSupplier={getRecommendedSupplierForType ? getRecommendedSupplierForType('venue') : null}
                    onAddSupplier={onAddSupplier}
                    onCustomizationComplete={onCustomizationComplete}
                  />
                );
              }
              
              // Venue logic - falls through to SupplierCard with browse venues option
              if (activeSupplierTypeData.type === 'venue') {
                console.log('✅ Venue type - will render SupplierCard with browse option if venues available');
                // Falls through to default SupplierCard rendering below with showBrowseVenues prop
              }
            }
            
            // Default: Show regular supplier card for all other types
            // Filter addons for this specific supplier
            const supplierAddons = currentSupplier ? addons.filter(addon =>
              addon.supplierId === currentSupplier.id ||
              addon.supplierType === activeSupplierTypeData.type ||
              addon.attachedToSupplier === activeSupplierTypeData.type
            ) : []

            return (
              <SupplierCard
                type={activeSupplierTypeData.type}
                supplier={currentSupplier}
                loadingCards={loadingCards}
                suppliersToDelete={suppliersToDelete}
                openSupplierModal={openSupplierModal}
                handleDeleteSupplier={handleDeleteSupplier}
                getSupplierDisplayName={getSupplierDisplayName}
                addons={supplierAddons}
                handleRemoveAddon={handleRemoveAddon}
                enquiryStatus={getEnquiryStatus(activeSupplierTypeData.type)}
                enquirySentAt={getEnquiryTimestamp(activeSupplierTypeData.type)}
                isSignedIn={true}
                isPaymentConfirmed={isPaymentConfirmed}
                enquiries={enquiries}
                currentPhase={currentPhase}
                handleCancelEnquiry={handleCancelEnquiry}
                onPaymentReady={onPaymentReady}
                enhancedPricing={currentSupplier ? getSupplierDisplayPricing(currentSupplier, partyDetails) : null}
                partyDetails={partyDetails}
                recommendedSupplier={getRecommendedSupplierForType ? getRecommendedSupplierForType(activeSupplierTypeData.type) : null}
                onAddSupplier={onAddSupplier}
                onCustomizationComplete={onCustomizationComplete}
                showBrowseVenues={activeSupplierTypeData.type === 'venue' && showBrowseVenues}
                onBrowseVenues={onBrowseVenues}
              />
            );
          })()}
        </div>

            {/* Back to My Party Link - Only show when on individual supplier tab with content */}
            {currentSupplier && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => handleTabSelect(0, supplierTypes[0])}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to My Party
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ COMPLETE BOOKING CTA - SHOWN AFTER USER CLICKS "I'M HAPPY" */}
      {showCompleteCTA && (
        <div ref={ctaRef} className="px-4 mt-8 mb-6 space-y-4">
          {/* Party Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Your Party Plan</h3>

            {/* Party Info */}
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              {partyDetails?.childName && (
                <p>
                  <span className="font-semibold">Party for:</span> {partyDetails.childName}{partyDetails.age && `, turning ${partyDetails.age}`}
                </p>
              )}

              {partyDetails?.date && (
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(partyDetails.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  {partyDetails.time && ` at ${partyDetails.time}`}
                </p>
              )}

              {partyDetails?.guestCount && (
                <p>
                  <span className="font-semibold">Guests:</span> {partyDetails.guestCount} children
                </p>
              )}

              {suppliers?.venue && (
                <p>
                  <span className="font-semibold">Venue:</span> {suppliers.venue.name}
                </p>
              )}

              {partyDetails?.theme && (
                <p>
                  <span className="font-semibold">Theme:</span> <span className="capitalize">{partyDetails.theme.replace(/-/g, ' ')}</span>
                </p>
              )}
            </div>

            {/* Suppliers List */}
            {Object.keys(suppliers).filter(type => suppliers[type]).length > 0 && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Your Suppliers</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {Object.entries(suppliers).filter(([type, supplier]) => supplier).map(([type, supplier]) => {
                    // Calculate correct price for party bags
                    const isPartyBags = supplier.category === 'Party Bags' ||
                                       supplier.category?.toLowerCase().includes('party bag')

                    let displayPrice = supplier.packageData?.price || supplier.price || 0

                    if (isPartyBags) {
                      displayPrice = supplier.partyBagsMetadata?.totalPrice ||
                                    supplier.packageData?.totalPrice ||
                                    (supplier.packageData?.price && supplier.packageData?.partyBagsQuantity
                                      ? supplier.packageData.price * supplier.packageData.partyBagsQuantity
                                      : null)

                      // If no metadata exists, use price as-is (it's likely already the total)
                      if (!displayPrice) {
                        displayPrice = supplier.price || supplier.priceFrom || 0
                      }
                    }

                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span>{supplier.name}</span>
                        <span className="font-semibold text-gray-900">
                          £{displayPrice}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Addons List */}
            {addons && addons.length > 0 && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Add-ons</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between">
                      <span>{addon.name}</span>
                      <span className="font-semibold text-gray-900">
                        £{addon.price || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            {totalCost > 0 && (
              <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                <span className="font-bold text-base text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">£{totalCost.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-xl p-6 text-white shadow-lg">
            <button
              onClick={() => router.push('/review-book')}
              className="w-full cursor-pointer bg-white hover:bg-gray-100 text-[hsl(var(--primary-600))] font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2"
            >
              Complete Booking
            </button>
            <p className="text-sm text-white/90 text-center mt-3">
              You'll review your full party plan before any payment
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 120px;
          }
        }
      `}</style>
    </div>
  )
}