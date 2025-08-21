// Enhanced MobileSupplierNavigation with Individual Supplier Tabs
"use client"
import { useState, useEffect, useRef } from "react"
import { Building, Music, Utensils, Palette, Sparkles, Gift, Plus, Camera, Cake, Castle } from "lucide-react"
import SupplierCard from "./SupplierCard/SupplierCard"
import Image from "next/image"
import { AddonsSectionWrapper, RecommendedAddonsWrapper } from "../components/AddonProviderWrapper"

export default function MobileSupplierNavigation({
  suppliers,
  loadingCards = [],
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
  onPaymentReady
}) {
  const [activeTab, setActiveTab] = useState(0)
  const tabsRef = useRef(null)
  const contentRef = useRef(null)

  // Individual supplier types with their own tabs
  const supplierTypes = [
    {
      id: "venue",
      type: "venue",
      title: "Venue",
      name: "Venue",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749848122/oml2ieudsno9szcjlngp.jpg",
      icon: <Building className="w-5 h-5" />,
    },
    {
      id: "entertainment", 
      type: "entertainment",
      title: "Entertainment",
      name: "Entertainment",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: "catering",
      type: "catering",
      title: "Catering",
      name: "Catering", 
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749854566/lcjmipa6yfuspckl93nz.jpg",
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      id: "cakes",
      type: "cakes",
      title: "Cakes",
      name: "Cakes",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749854566/lcjmipa6yfuspckl93nz.jpg",
      icon: <Cake className="w-5 h-5" />,
    },
    {
      id: "decorations",
      type: "decorations",
      title: "Decorations",
      name: "Decorations",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: "photography",
      type: "photography", 
      title: "Photography",
      name: "Photography",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
      icon: <Camera className="w-5 h-5" />,
    },
    {
      id: "facePainting",
      type: "facePainting",
      title: "Face Painting",
      name: "Face Painting",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: "activities",
      type: "activities",
      title: "Activities",
      name: "Activities",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: "partyBags",
      type: "partyBags", 
      title: "Party Bags",
      name: "Party Bags",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
      icon: <Gift className="w-5 h-5" />,
    },
    {
      id: "bouncyCastle",
      type: "bouncyCastle",
      title: "Bouncy Castle", 
      name: "Bouncy Castle",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png",
      icon: <Castle className="w-5 h-5" />,
    },
    {
      id: "addons",
      type: "addons",
      title: "Add-ons",
      name: "Add-ons", 
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
      icon: <Gift className="w-5 h-5" />,
      isAddonSection: true,
    },
  ]

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

  // Get all supplier types with their data for vertical listing
  const getAllSuppliers = () => {
    const allSuppliers = supplierTypes
      .filter(st => !st.isAddonSection) // Exclude addons from main list
      .map(supplierType => ({
        ...supplierType,
        supplier: suppliers[supplierType.type] || null,
        enquiryStatus: getEnquiryStatus(supplierType.type)
      }))

    // Sort: Selected/Awaiting suppliers first, empty suppliers last
    return allSuppliers.sort((a, b) => {
      const aHasSupplier = !!a.supplier
      const bHasSupplier = !!b.supplier
      
      // If A has supplier and B doesn't, A comes first
      if (aHasSupplier && !bHasSupplier) return -1
      // If B has supplier and A doesn't, B comes first  
      if (!aHasSupplier && bHasSupplier) return 1
      // If both have suppliers or both are empty, maintain original order
      return 0
    })
  }

  // Function to scroll to specific supplier type
  const scrollToSupplier = (supplierTypeId) => {
    const element = document.getElementById(`supplier-${supplierTypeId}`)
    if (element) {
      const offset = 120 // Account for sticky navigation
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  // Function to scroll to party task cards
  const scrollToPartyTask = (cardId) => {
    const element = document.getElementById(cardId)
    if (element) {
      const offset = 120
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
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

  // Handle tab selection and scrolling
  const handleTabSelect = (index, supplierType) => {
    setActiveTab(index)
    
    if (supplierType.isAddonSection) {
      scrollToSupplier('addons')
    } else {
      scrollToSupplier(supplierType.type)
    }
  }

  // Render addons content
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
        <AddonsSectionWrapper 
          suppliers={suppliers}
          className="bg-white rounded-xl border border-gray-200 p-4"
        />

        {showRecommendedAddons && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              More Add-ons
            </h3>
            <RecommendedAddonsWrapper 
              context="mobile"
              maxItems={4}
              onAddonClick={onAddonClick}
              className="grid grid-cols-1 gap-3"
            />
          </div>
        )}
      </div>
    )
  }

  const sortedSuppliers = getAllSuppliers()

  return (
    <div className="w-full relative">
      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b-2 border-[hsl(var(--primary-200))] mb-6">
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
                      style={{ minWidth: '90px' }} // Increased from 70px
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-200 overflow-hidden relative shadow-md hover:shadow-lg bg-gray-100"> {/* Increased from w-14 h-14 to w-20 h-20, mb-2 to mb-3 */}
                          <Image
                            src={supplierType.image}
                            alt={supplierType.name}
                            width={80} // Increased from 56
                            height={80} // Increased from 56
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6"> {/* Larger icon container */}
                              {supplierType.icon}
                            </div>
                          </div>
                          
                          {isActive && (
                            <div className="absolute inset-0 bg-opacity-20 rounded-full border-4 border-[hsl(var(--primary-500))]"></div> 
                          )}
                          
                          {hasContent && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-full border-2 border-white shadow-lg"> {/* Increased from w-4 h-4 to w-6 h-6 */}
                              {supplierType.isAddonSection && getAddonCount() > 0 && (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{getAddonCount()}</span> {/* Increased from text-[8px] to text-xs */}
                                </div>
                              )}
                              {!supplierType.isAddonSection && (
                                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-full animate-pulse"></div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-[hsl(var(--primary-700))]' : 'text-gray-700'}`}> {/* Increased from text-xs to text-sm */}
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
                          onClick={() => scrollToPartyTask(task.cardId)}
                          className="flex-shrink-0 relative transition-all duration-200 hover:transform hover:scale-105"
                          style={{ minWidth: '90px' }} // Increased from 70px
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-200 overflow-hidden relative shadow-md hover:shadow-lg bg-gray-100"> {/* Increased from w-14 h-14 to w-20 h-20, mb-2 to mb-3 */}
                              <Image
                                src={task.image}
                                alt={task.title}
                                width={80} // Increased from 56
                                height={80} // Increased from 56
                                className="w-full h-full object-cover rounded-full"
                              />
                              
                              {isCompleted && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"> {/* Increased from w-4 h-4 to w-6 h-6 */}
                                  <span className="text-white text-xs font-bold">✓</span> {/* Increased from text-[8px] to text-xs */}
                                </div>
                              )}
                              
                              {count > 0 && (
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"> {/* Increased from w-5 h-5 to w-7 h-7 */}
                                  <span className="text-white text-xs font-bold">{count}</span> {/* Increased from text-[10px] to text-xs */}
                                </div>
                              )}
                              
                              {hasActivity && (
                                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm font-semibold leading-tight text-gray-700"> {/* Increased from text-xs to text-sm */}
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

      {/* All Supplier Cards - Vertically Listed */}
      <div className="space-y-4 px-4" ref={contentRef}>
        {/* Regular Supplier Cards (sorted: selected first, empty last) */}
        {sortedSuppliers.map((supplierType) => (
          <div 
            key={supplierType.type} 
            id={`supplier-${supplierType.type}`} // ✅ CRITICAL: This ID enables scrolling
            className="scroll-mt-32" // Account for sticky navigation
          >
            <SupplierCard
              type={supplierType.type}
              supplier={supplierType.supplier}
              loadingCards={loadingCards}
              suppliersToDelete={suppliersToDelete}
              openSupplierModal={openSupplierModal}
              handleDeleteSupplier={handleDeleteSupplier}
              getSupplierDisplayName={getSupplierDisplayName}
              addons={addons}
              handleRemoveAddon={handleRemoveAddon}
              enquiryStatus={supplierType.enquiryStatus}
              enquirySentAt={getEnquiryTimestamp(supplierType.type)}
              isSignedIn={true}
              isPaymentConfirmed={isPaymentConfirmed}
              enquiries={enquiries}
              currentPhase={currentPhase}
              handleCancelEnquiry={handleCancelEnquiry}
              onPaymentReady={onPaymentReady}
            />
          </div>
        ))}

        {/* Add-ons Section */}
        <div 
          id="supplier-addons" // ✅ CRITICAL: This ID enables scrolling to addons
          className="scroll-mt-32"
        >
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
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}