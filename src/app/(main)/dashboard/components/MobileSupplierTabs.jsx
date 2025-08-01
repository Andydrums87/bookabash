"use client"

import { useState, useEffect, useRef } from "react"
import { Building, Music, Utensils, Palette, Gift, Sparkles } from "lucide-react"
import MobileSupplierCard from "../components/Cards/MobileSupplierCard"

export default function MobileSupplierTabs({
  suppliers,
  loadingCards = [],
  suppliersToDelete = [],
  openSupplierModal,
  handleDeleteSupplier,
  getSupplierDisplayName,
  addons = [],
  handleRemoveAddon,
  // ADD THESE MISSING PROPS:
  getEnquiryStatus,
  isSignedIn = false,
  isPaymentConfirmed = false,
  enquiries = [],
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const tabsRef = useRef(null)

  const tabs = [
    {
      id: "essentials",
      name: "Party Essentials",
      icon: <Building className="w-5 h-5" />,
      types: ["venue", "entertainment"],
    },
    {
      id: "activities",
      name: "Fun Activities",
      icon: <Music className="w-5 h-5" />,
      types: ["facePainting", "activities"],
    },
    {
      id: "treats",
      name: "Yummy Treats",
      icon: <Utensils className="w-5 h-5" />,
      types: ["catering", "partyBags"],
    },
    {
      id: "decorations",
      name: "Pretty Decorations",
      icon: <Palette className="w-5 h-5" />,
      types: ["decorations", "balloons"],
    },
    {
      id: "invites",
      name: "Magic Invites",
      icon: <Gift className="w-5 h-5" />,
      types: ["einvites"],
    },
  ]

  // Swipe detection
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1)
    }
    if (isRightSwipe && activeTab > 0) {
      setActiveTab(activeTab - 1)
    }
  }

  // Auto-scroll tab navigation
  useEffect(() => {
    if (tabsRef.current) {
      const tabWidth = 120 // Approximate width of each tab
      const scrollPosition = activeTab * tabWidth - tabsRef.current.clientWidth / 2 + tabWidth / 2
      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
    }
  }, [activeTab])

  const handleTabSelect = (tabIndex) => {
    setActiveTab(tabIndex)
  }

  const currentTabTypes = tabs[activeTab]?.types || []
  const currentSuppliers = currentTabTypes
    .map((type) => ({
      type,
      supplier: suppliers[type],
    }))
    // Filter out empty suppliers if payment is confirmed
    .filter(({ supplier }) => {
      if (isPaymentConfirmed) {
        return supplier !== null && supplier !== undefined
      }
      return true // Show all suppliers (including empty slots) before payment
    })

  return (
    <div className="w-full relative">
      {/* Enhanced Tab Navigation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] border-b-2 border-[hsl(var(--primary-200))] mb-6 shadow-lg">
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
              {tabs.map((tab, index) => {
                const isActive = activeTab === index
                // Check if tab has suppliers (considering payment confirmation state)
                const hasSuppliers = tab.types.some((type) => suppliers[type])
                // Hide tabs that have no suppliers after payment confirmation
                const shouldShowTab = isPaymentConfirmed ? hasSuppliers : true

                // Don't render tabs with no suppliers after payment
                if (isPaymentConfirmed && !hasSuppliers) {
                  return null
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(index)}
                    className={`flex flex-col items-center space-y-2 px-3 py-3 rounded-2xl min-w-[80px] transition-all duration-300 shadow-sm ${
                      isActive
                        ? "bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] text-[hsl(var(--primary-700))] shadow-lg border-2 border-[hsl(var(--primary-300))] scale-105"
                        : "text-gray-600 hover:bg-gradient-to-br hover:from-[hsl(var(--primary-50))] hover:to-white border-2 border-transparent hover:border-[hsl(var(--primary-200))] bg-white/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-xl relative transition-all duration-300 shadow-sm ${
                        isActive
                          ? "bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] text-white shadow-lg"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-[hsl(var(--primary-100))] hover:to-[hsl(var(--primary-200))] hover:text-[hsl(var(--primary-600))]"
                      }`}
                    >
                      {tab.icon}
                      {/* Enhanced supplier indicator dot */}
                      {hasSuppliers && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-full border-2 border-white shadow-lg">
                          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight">{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="space-y-6 px-4" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {currentSuppliers.map(({ type, supplier }) => (
          <MobileSupplierCard
            key={type}
            type={type}
            supplier={supplier}
            loadingCards={loadingCards}
            suppliersToDelete={suppliersToDelete}
            openSupplierModal={openSupplierModal}
            handleDeleteSupplier={handleDeleteSupplier}
            getSupplierDisplayName={getSupplierDisplayName}
            addons={addons}
            handleRemoveAddon={handleRemoveAddon}
            // ADD ALL THE ENQUIRY-RELATED PROPS:
            enquiryStatus={getEnquiryStatus ? getEnquiryStatus(type) : null}
            isSignedIn={isSignedIn}
            enquiries={enquiries}
            isPaymentConfirmed={isPaymentConfirmed}
          />
        ))}
      </div>

      {/* Enhanced Progress Section */}
      {currentSuppliers.length > 0 && (
        <div className="mt-8 text-center px-4">
          <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-white rounded-2xl p-4 border-2 border-[hsl(var(--primary-200))] shadow-lg relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-2 left-4 w-1 h-1 bg-[hsl(var(--primary-300))] rounded-full opacity-60"></div>
            <div className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-[hsl(var(--primary-400))] rounded-full opacity-80"></div>
            <Sparkles className="absolute top-2 right-6 w-3 h-3 text-[hsl(var(--primary-300))] opacity-40" />

            <p className="text-sm font-semibold text-gray-700 mb-3 relative z-10">
              {currentSuppliers.filter(({ supplier }) => supplier).length} of {currentSuppliers.length}{" "}
              {isPaymentConfirmed ? "confirmed" : "selected"} in {tabs[activeTab].name}
            </p>

            {/* Enhanced Tab dots indicator */}
            {tabs.filter((tab) => (isPaymentConfirmed ? tab.types.some((type) => suppliers[type]) : true)).length >
              1 && (
              <div className="flex justify-center space-x-2 relative z-10">
                {tabs.map((_, index) => {
                  const tabHasSuppliers = tabs[index].types.some((type) => suppliers[type])
                  if (isPaymentConfirmed && !tabHasSuppliers) return null

                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                        index === activeTab
                          ? "bg-gradient-to-br from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] shadow-lg scale-125"
                          : "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-[hsl(var(--primary-300))] hover:to-[hsl(var(--primary-400))] hover:scale-110"
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
