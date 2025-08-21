// Enhanced MobileSupplierNavigation with Scrollable List View
"use client"
import { useState, useEffect, useRef } from "react"
import { Building, Music, Utensils, Palette, Sparkles, Gift, Plus } from "lucide-react"
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

  // Enhanced supplier sections
  const supplierSections = [
    {
      id: "essentials",
      title: "Party Essentials",
      name: "Party Essentials",
      subtitle: "The must-haves for your party",
      emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753868085/ChatGPT_Image_Jul_30_2025_10_34_38_AM_ue973s.png",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749848122/oml2ieudsno9szcjlngp.jpg",
      icon: <Building className="w-5 h-5" />,
      types: ["venue", "entertainment"],
    },
    {
      id: "activities", 
      title: "Fun Activities",
      name: "Fun Activities",
      subtitle: "Keep the kids entertained",
      emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869132/ChatGPT_Image_Jul_30__2025__10_50_40_AM-removebg_orq8w2.png",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749828970/niq4bh4wemamqziw0tki.png",
      icon: <Music className="w-5 h-5" />,
      types: ["facePainting", "activities"],
    },
    {
      id: "treats",
      title: "Yummy Treats", 
      name: "Yummy Treats",
      subtitle: "Food and party bags",
      emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753870206/ChatGPT_Image_Jul_30_2025_11_09_59_AM_rx1pgs.png",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749854566/lcjmipa6yfuspckl93nz.jpg",
      icon: <Utensils className="w-5 h-5" />,
      types: ["catering", "cakes"],
    },
    {
      id: "finishing",
      title: "Finishing Touches",
      name: "Finishing Touches", 
      subtitle: "Make it picture perfect", 
      emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869447/ChatGPT_Image_Jul_30_2025_10_57_18_AM_xke5gz.png",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
      icon: <Palette className="w-5 h-5" />,
      types: ["decorations", "partyBags"],
    },
    {
      id: "addons",
      title: "Extras & Add-ons",
      name: "Extras", 
      subtitle: "Add-ons & special extras", 
      emoji: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869447/ChatGPT_Image_Jul_30_2025_10_57_18_AM_xke5gz.png",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1749829545/kcikhfzbtlwiwfixzsji.png",
      icon: <Gift className="w-5 h-5" />,
      types: ["addons"],
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

  // Function to scroll to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(`section-${sectionId}`)
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
      const tabWidth = 100
      const scrollPosition = activeTab * tabWidth - tabsRef.current.clientWidth / 2 + tabWidth / 2
      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }, [activeTab])

  // Handle tab selection and scrolling
  const handleTabSelect = (index, sectionId) => {
    setActiveTab(index)
    scrollToSection(sectionId)
  }

  // Render section content
  const renderSectionContent = (section) => {
    if (section.isAddonSection) {
      return renderAddonsContent()
    }

    // Show ALL supplier types, not just the ones with suppliers selected
    const sectionSuppliers = section.types.map(type => ({ 
      type, 
      supplier: suppliers[type] || null // Include null suppliers
    }))

    return (
      <div className="space-y-4">
        {sectionSuppliers.map(({ type, supplier }) => (
          <SupplierCard
            key={type}
            type={type}
            supplier={supplier} // This can be null for empty cards
            loadingCards={loadingCards}
            suppliersToDelete={suppliersToDelete}
            openSupplierModal={openSupplierModal}
            handleDeleteSupplier={handleDeleteSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            addons={addons}
            handleRemoveAddon={handleRemoveAddon}
            enquiryStatus={getEnquiryStatus(type)}
            enquirySentAt={getEnquiryTimestamp(type)}
            isSignedIn={true}
            isPaymentConfirmed={isPaymentConfirmed}
            enquiries={enquiries}
            currentPhase={currentPhase}
            handleCancelEnquiry={handleCancelEnquiry}
            onPaymentReady={onPaymentReady}
          />
        ))}
      </div>
    )
  }

  // Render addons content
  const renderAddonsContent = () => {
    const addonCount = getAddonCount()
    
    if (addonCount === 0) {
      return (
        <div className="space-y-6">
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
                {/* Supplier Section Tabs */}
                {supplierSections.map((section, index) => {
                  const isActive = activeTab === index
                  
                  // Updated content check - show indicator if ANY suppliers exist in section
                  const hasContent = section.isAddonSection 
                    ? getAddonCount() > 0 
                    : section.types.some((type) => suppliers[type])

                  // Count how many suppliers are selected in this section
                  const supplierCount = section.isAddonSection 
                    ? getAddonCount()
                    : section.types.filter(type => suppliers[type]).length

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleTabSelect(index, section.id)}
                      className="flex-shrink-0 relative transition-all duration-200 hover:transform hover:scale-105"
                      style={{ minWidth: '70px' }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 overflow-hidden relative shadow-sm hover:shadow-md bg-gray-100">
                          <Image
                            src={section.image}
                            alt={section.name || section.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              console.log(`Failed to load image for ${section.name}:`, section.emoji)
                              e.target.style.display = 'none'
                            }}
                          />
                          
                          <div className={`absolute inset-0 flex items-center justify-center ${section.emoji ? 'hidden' : 'block'}`}>
                            {section.icon}
                          </div>
                          
                          {isActive && (
                            <div className="absolute inset-0 bg-opacity-20 rounded-full border-2 border-[hsl(var(--primary-500))]"></div>
                          )}
                          
                          {hasContent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-full border-2 border-white shadow-lg">
                              {section.isAddonSection && getAddonCount() > 0 && (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">{getAddonCount()}</span>
                                </div>
                              )}
                              {!section.isAddonSection && supplierCount > 0 && (
                                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-full flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">{supplierCount}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-[hsl(var(--primary-700))]' : 'text-gray-700'}`}>
                            {section.name || section.title}
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
                          style={{ minWidth: '70px' }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-200 overflow-hidden relative shadow-sm hover:shadow-md bg-gray-100">
                              <Image
                                src={task.image}
                                alt={task.title}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover rounded-full"
                              />
                              
                              {isCompleted && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">✓</span>
                                </div>
                              )}
                              
                              {count > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-[10px] font-bold">{count}</span>
                                </div>
                              )}
                              
                              {hasActivity && (
                                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-30"></div>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs font-semibold leading-tight text-gray-700">
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

      {/* All Content Sections - Vertically Listed */}
      <div className="space-y-8 px-4" ref={contentRef}>
        {supplierSections.map((section) => {
          // Check if section has content to show
          const hasContent = section.isAddonSection 
            ? getAddonCount() > 0 
            : section.types.some((type) => suppliers[type])

          // Show all sections, even empty ones, for better UX
          return (
            <div 
              key={section.id} 
              id={`section-${section.id}`}
              className="scroll-mt-32" // Account for sticky navigation
            >
              {/* Section Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] flex items-center justify-center">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {renderSectionContent(section)}
            </div>
          )
        })}
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