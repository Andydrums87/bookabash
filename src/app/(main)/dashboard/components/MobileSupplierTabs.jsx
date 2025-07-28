"use client"

import { useState, useEffect, useRef } from "react"
import { Building, Music, Utensils, Palette, Gift } from "lucide-react"
import MobileSupplierCard from "./MobileSupplierCard" // CHANGED: Import MobileSupplierCard instead of SupplierCard

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
  enquiries = []
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const tabsRef = useRef(null)

  const tabs = [
    {
      id: 'essentials',
      name: 'Party Essentials',
      icon: <Building className="w-5 h-5" />,
      types: ['venue', 'entertainment']
    },
    {
      id: 'activities', 
      name: 'Fun Activities',
      icon: <Music className="w-5 h-5" />,
      types: ['facePainting', 'activities']
    },
    {
      id: 'treats',
      name: 'Yummy Treats', 
      icon: <Utensils className="w-5 h-5" />,
      types: ['catering', 'partyBags']
    },
    {
      id: 'decorations',
      name: 'Pretty Decorations',
      icon: <Palette className="w-5 h-5" />,
      types: ['decorations', 'balloons']
    },
    {
      id: 'invites',
      name: 'Magic Invites',
      icon: <Gift className="w-5 h-5" />,
      types: ['einvites']
    }
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
      const scrollPosition = activeTab * tabWidth - (tabsRef.current.clientWidth / 2) + (tabWidth / 2)
      tabsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [activeTab])

  const handleTabSelect = (tabIndex) => {
    setActiveTab(tabIndex)
  }

  const currentTabTypes = tabs[activeTab]?.types || []
  const currentSuppliers = currentTabTypes
    .map(type => ({
      type,
      supplier: suppliers[type]
    }))
    // Filter out empty suppliers if payment is confirmed
    .filter(({supplier}) => {
      if (isPaymentConfirmed) {
        return supplier !== null && supplier !== undefined
      }
      return true // Show all suppliers (including empty slots) before payment
    })

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="px-4 py-4">
          <div className="overflow-x-auto scrollbar-hide" ref={tabsRef}>
            <div className="flex space-x-0 min-w-max pr-8">
              {tabs.map((tab, index) => {
                const isActive = activeTab === index
                // Check if tab has suppliers (considering payment confirmation state)
                const hasSuppliers = tab.types.some(type => suppliers[type])
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
                    className={`flex flex-col items-center space-y-2 px-2 py-3 rounded-xl min-w-[70px] transition-all ${
                      isActive
                        ? "bg-primary-100 text-primary-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-lg relative ${
                        isActive ? "bg-primary-200" : "bg-gray-100"
                      }`}
                    >
                      {tab.icon}
                      {/* Supplier indicator dot */}
                      {hasSuppliers && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary-500 rounded-full border border-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {tab.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - Show suppliers for active tab */}
      <div 
        className="space-y-6 px-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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

        {/* Only show progress indicator if there are suppliers to show */}
        {currentSuppliers.length > 0 && (
          <div className="mt-6 text-center px-4">
            <p className="text-xs text-gray-500">
              {currentSuppliers.filter(({supplier}) => supplier).length} of {currentSuppliers.length} {isPaymentConfirmed ? 'confirmed' : 'selected'} in {tabs[activeTab].name}
            </p>
            
            {/* Tab dots indicator - only show if there are multiple tabs with suppliers */}
            {tabs.filter(tab => isPaymentConfirmed ? tab.types.some(type => suppliers[type]) : true).length > 1 && (
              <div className="flex justify-center space-x-1 mt-2">
                {tabs.map((_, index) => {
                  const tabHasSuppliers = tabs[index].types.some(type => suppliers[type])
                  if (isPaymentConfirmed && !tabHasSuppliers) return null
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === activeTab ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}
    </div>
  )
}