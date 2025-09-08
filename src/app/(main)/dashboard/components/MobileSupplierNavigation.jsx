// Updated MobileSupplierNavigation.jsx - Single supplier card view per tab

"use client"
import { useState, useEffect, useRef } from "react"
import { Building, Music, Utensils, Palette, Sparkles, Gift, Plus, Camera, Cake, Castle, Check } from "lucide-react"
import SupplierCard from "./SupplierCard/SupplierCard"
import Image from "next/image"
import AddonsSection from "./AddonsSection"
import RecommendedAddons from "@/components/recommended-addons"


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
  // NEW: Props for handling tab changes and scrolling
  onSupplierTabChange,
  activeSupplierType, // NEW: Externally controlled active tab
  showFirstTimeHelp = false,
  isTourActiveOnNavigation = false,
  getSupplierDisplayPricing, // ADD THIS
  partyDetails,              // ADD THIS

}) {
  

  // Individual supplier types with their own tabs
  const supplierTypes = [
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
      id: "catering",
      type: "catering",
      title: "Catering",
      name: "Catering", 
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1756385342/iStock-669850098_wnqysx.jpg",
      icon: <Utensils className="w-5 h-5" />,
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
    // {
    //   id: "addons",
    //   type: "addons",
    //   title: "Add-ons",
    //   name: "Add-ons", 
    //   image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
    //   icon: <Gift className="w-5 h-5" />,
    //   isAddonSection: true,
    // },
  ]

  // Use external activeSupplierType if provided, otherwise use internal state
  const [internalActiveTab, setInternalActiveTab] = useState(0)
  const activeTab = activeSupplierType !== undefined ? 
    supplierTypes.findIndex(st => st.type === activeSupplierType) : 
    internalActiveTab

    const tabsRef = useRef(null)
    const [isAutoScrolling, setIsAutoScrolling] = useState(false)
    const startAutoScrollDemo = () => {
      if (!tabsRef.current || isAutoScrolling) return
      
      setIsAutoScrolling(true)
      let scrollDirection = 1 // 1 for right, -1 for left
      let currentPosition = 0
      const maxScroll = tabsRef.current.scrollWidth - tabsRef.current.clientWidth
      const scrollStep = 150 // pixels to scroll each step
      
      autoScrollIntervalRef.current = setInterval(() => {
        if (!tabsRef.current) return
        
        currentPosition += scrollDirection * scrollStep
        
        // Reverse direction when reaching ends
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
      }, 1000) // Change direction every 1.5 seconds
      
      // Stop demo after 8 seconds
      setTimeout(() => {
        stopAutoScrollDemo()
      }, 6000)
    }
    
    // Function to stop the auto-scroll demonstration
    const stopAutoScrollDemo = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      setIsAutoScrolling(false)
      
      // Return to the active tab position
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
        }, 200) // Much shorter delay
        
        return () => clearTimeout(timeout)
      } else if (!isTourActiveOnNavigation && isAutoScrolling) {
        console.log('Tour no longer on navigation - stopping demo')
        stopAutoScrollDemo()
      }
    }, [isTourActiveOnNavigation, isAutoScrolling])
    const autoScrollIntervalRef = useRef(null)


  // Party tasks
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

  // Get addon count for tab indicator
  const getAddonCount = () => {
    const standaloneAddons = addons.length
    const supplierAddons = Object.values(suppliers).reduce((count, supplier) => {
      return count + (supplier?.selectedAddons?.length || 0)
    }, 0)
    return standaloneAddons + supplierAddons
  }

  // Auto-scroll tab navigation
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

  // Handle tab selection
  const handleTabSelect = (index, supplierType) => {
    if (activeSupplierType === undefined) {
      // Internal state management
      setInternalActiveTab(index)
    }
    
    // Notify parent component about tab change
    if (onSupplierTabChange) {
      onSupplierTabChange(supplierType.type)
    }

    // Scroll to the supplier card content area
    setTimeout(() => {
      const contentElement = document.getElementById('mobile-supplier-content')
      if (contentElement) {
        const offset = 140 // Account for sticky navigation
        const elementPosition = contentElement.getBoundingClientRect().top + window.pageYOffset
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        })
      }
    }, 100) // Small delay to ensure tab change has processed
  }

  // ✅ FIXED: Simple addon handling without context
  const handleAddAddon = async (addon) => {
    console.log('🎁 Adding addon:', addon.name)
    // For now, just log. You can implement actual logic here
    // or pass a handler function as prop
  }

  // ✅ FIXED: Render addons content without context wrappers
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
        {/* ✅ FIXED: Use direct AddonsSection component */}
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
            {/* ✅ FIXED: Use direct RecommendedAddons component */}
            <RecommendedAddons 
              context="mobile"
              maxItems={4}
              onAddToCart={handleAddAddon}
              onAddonClick={onAddonClick}
              className="grid grid-cols-1 gap-3"
            />
          </div>
        )}
      </div>
    )
  }

  // Get the currently active supplier type
  const activeSupplierTypeData = supplierTypes[activeTab]
  const currentSupplier = activeSupplierTypeData?.isAddonSection ? 
    null : 
    suppliers[activeSupplierTypeData?.type]


  return (
    <div className="w-full relative">

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b-2 border-[hsl(var(--primary-200))] mb-6" data-tour="mobile-navigation-tabs">
        <div className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
     
   

          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-8 w-1.5 h-1.5 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
            <div className="absolute top-4 right-12 w-1 h-1 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
            <div className="absolute bottom-2 left-16 w-1 h-1 bg-[hsl(var(--primary-300))] rounded-full opacity-70"></div>
            <Sparkles className="absolute top-3 right-20 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />
          </div>

          <div className="px-4 py-4 relative z-10">
            <div className="overflow-x-auto scrollbar-hide" ref={tabsRef}>
              <div className="flex space-x-2 min-w-max pr-8">
                {/* Individual Supplier Tabs */}
                {supplierTypes.map((supplierType, index) => {
                  const isActive = activeTab === index
                  const hasContent = supplierType.isAddonSection 
                    ? getAddonCount() > 0 
                    : !!suppliers[supplierType.type]

                  return (
                    <button
                      key={supplierType.id}
                      onClick={() => handleTabSelect(index, supplierType)}
                      className="flex-shrink-0 relative transition-all duration-200 hover:transform hover:scale-105"
                      style={{ minWidth: '90px' }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-200 overflow-visible relative shadow-md hover:shadow-lg bg-gray-100">
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
{/*                           
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6">
                              {supplierType.icon}
                            </div>
                          </div> */}
                          
                          {isActive && (
                            <div className="absolute inset-0 rounded-full border-4 border-teal-500 shadow-lg"></div> 
                          )}
                          
                          {hasContent && (
  <div className="absolute top-0 right-0 w-5 h-5 bg-white rounded-full border-2 border-gray-200 shadow-lg flex items-center justify-center">
    <Check className="w-3 h-3 text-green-600" />
  </div>
)}
                        </div>
                        
                        <div className="text-center">
                          <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-teal-700 font-bold' : 'text-gray-700'}`}>
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
                            // You can implement party task navigation here if needed
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
      </div>

      {/* ✅ NEW: Single Supplier Card Content */}
      <div className="px-4" id="mobile-supplier-content" data-tour="mobile-supplier-cards">
        {activeSupplierTypeData?.isAddonSection ? (
          // Show Add-ons Section
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
          // Show Single Supplier Card
          <div className="transition-all duration-300 ease-in-out"   data-tour={activeSupplierTypeData.type === 'venue' ? 'venue-card-mobile' : undefined}>
      
            <SupplierCard
              type={activeSupplierTypeData.type}
              supplier={currentSupplier}
              loadingCards={loadingCards}
              suppliersToDelete={suppliersToDelete}
              openSupplierModal={openSupplierModal}
              handleDeleteSupplier={handleDeleteSupplier}
              getSupplierDisplayName={getSupplierDisplayName}
              addons={addons}
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
            />
          </div>
        )}
      </div>

      <style jsx global>{`
  @media (max-width: 768px) {
    body {
      padding-bottom: 120px; /* Increased from 80px */
    }
  }
`}</style>
    </div>
  )
}