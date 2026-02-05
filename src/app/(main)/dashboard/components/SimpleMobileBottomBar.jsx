"use client"

import { useState, useMemo } from "react"
import { Home, ClipboardList, Wallet, Clock, X, DollarSign, Sparkles, PoundSterling, Plus, ChevronRight, PartyPopper, Calendar, MapPin, Cake } from "lucide-react"
import { useRouter } from "next/navigation"
import { calculateFinalPrice } from '@/utils/unifiedPricing'


const SimpleMobileBottomTabBar = ({
  suppliers = {},
  partyDetails = {},
  addons = [],
  // Budget props
  tempBudget = 0,
  budgetPercentage = 0,
  getBudgetCategory,
  CountdownWidget,
  onSupplierTabChange, // ✅ Use existing navigation prop
  onPartyDetailsChange // ✅ NEW: For editing party details
}) => {
  const [activeTab, setActiveTab] = useState("party")
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  // Calculate unified total cost using the same logic as dashboard
  const unifiedTotalCost = useMemo(() => {
    let total = 0;

    // Calculate each supplier's cost using ALWAYS FRESH pricing
    Object.entries(suppliers).forEach(([type, supplier]) => {
      if (!supplier) return;

      // Get addons for this specific supplier
      const supplierAddons = addons.filter(addon => 
        addon.supplierId === supplier.id || 
        addon.supplierType === type ||
        addon.attachedToSupplier === type
      );

      // ALWAYS calculate fresh pricing - never use pre-enhanced values
      const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
      const supplierCost = pricing.finalPrice;

      total += supplierCost;
    });

    // Add standalone addons (not attached to any supplier)
    const standaloneAddons = addons.filter(addon => 
      !addon.supplierId && !addon.supplierType && !addon.attachedToSupplier
    );
    const standaloneAddonsTotal = standaloneAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    total += standaloneAddonsTotal;

    return total;
  }, [suppliers, addons, partyDetails]);

  // Calculate progress - only count non-null suppliers
  const confirmedSuppliers = Object.values(suppliers).filter(supplier => supplier !== null).length
  const totalSlots = Object.keys(suppliers).length
  const progressPercentage = Math.round((confirmedSuppliers / totalSlots) * 100)

  // Calculate time remaining until party
  const calculateTimeRemaining = () => {
    if (!partyDetails?.date) return 0
    
    const partyDate = new Date(partyDetails.date)
    const now = new Date()
    const diffInDays = Math.ceil((partyDate - now) / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffInDays)
  }

  const timeRemaining = calculateTimeRemaining()

  const tabs = [
    {
      id: "party",
      label: "Party",
      icon: Home,
      color: "text-coral-500"
    },
    {
      id: "progress",
      label: "Suppliers",
      icon: ClipboardList,
      badge: confirmedSuppliers,
      total: totalSlots,
      color: "text-teal-500",
      subtext: `${confirmedSuppliers}/${totalSlots}`
    },
    {
      id: "myparty",
      label: "Details",
      icon: PartyPopper,
      color: "text-primary-500",
      subtext: partyDetails?.theme || 'Info'
    },
    {
      id: "timer",
      label: "Timer",
      icon: Clock,
      color: "text-orange-500",
      urgent: timeRemaining < 7,
      subtext: timeRemaining > 0 ? `${timeRemaining}d` : "Today!"
    },
  ]

  const handleTabPress = (tab) => {
    if (tab.id === "party") {
      setActiveTab(tab.id)
      setShowModal(false)
    } else {
      setActiveTab(tab.id)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setActiveTab("party")
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    } catch (e) {
      return dateString
    }
  }

  // Format time for display - show Morning/Afternoon instead of exact times
  const formatTime = (timeString) => {
    // Handle timeSlot format
    if (partyDetails?.timeSlot) {
      return partyDetails.timeSlot === 'morning' ? 'Morning' : 'Afternoon'
    }

    // Handle HH:MM format - determine morning vs afternoon
    if (timeString && timeString.includes(':')) {
      try {
        const [hours] = timeString.split(':')
        const hour = parseInt(hours)
        return hour < 13 ? 'Morning' : 'Afternoon'
      } catch (e) {
        return 'Afternoon'
      }
    }

    return 'Afternoon'
  }

  // Get venue address
  const getVenueAddress = () => {
    const venue = suppliers?.venue

    if (venue?.serviceDetails?.venueAddress) {
      const address = venue.serviceDetails.venueAddress
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.postcode
      ].filter(Boolean)

      if (parts.length > 0) {
        return parts.join(', ')
      }
    }

    return venue?.location || partyDetails?.location || partyDetails?.postcode || 'Location TBD'
  }

  const getModalContent = () => {
    switch (activeTab) {
      case "myparty":
        const fullChildName = partyDetails?.childName || partyDetails?.child_name || 'Your child'

        return (
          <div className="space-y-6">
            {/* Party Details Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-primary-600" />
                {fullChildName}'s {partyDetails?.childAge || 6}th Birthday Party
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">Date</div>
                    <div className="text-gray-900">{formatDate(partyDetails?.date)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Clock className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">Time</div>
                    <div className="text-gray-900">{formatTime(partyDetails?.startTime || partyDetails?.time)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">Location</div>
                    <div className="text-gray-900">{getVenueAddress()}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Sparkles className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">Theme</div>
                    <div className="text-gray-900 capitalize">{partyDetails?.theme?.replace(/-/g, ' ') || 'Party'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Cake className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">Child's Age</div>
                    <div className="text-gray-900">{partyDetails?.childAge || 6} years old</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Cost Card */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl p-5 text-center shadow-lg">
              <div className="text-xs text-white/80 mb-1 font-medium uppercase tracking-wide">Total Party Cost</div>
              <div className="text-4xl font-black text-white mb-1">£{unifiedTotalCost.toLocaleString()}</div>
              <div className="text-xs text-white/70">{confirmedSuppliers} supplier{confirmedSuppliers !== 1 ? 's' : ''} selected</div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                💡 Tap on the party details in the header above to edit them
              </p>
            </div>
          </div>
        )

      case "budget":
        // Calculate budget info using unified total
        const isOverBudget = unifiedTotalCost > tempBudget
        const overBudgetAmount = Math.max(0, unifiedTotalCost - tempBudget)
        const remaining = isOverBudget ? -overBudgetAmount : Math.max(0, tempBudget - unifiedTotalCost)
        const displayPercentage = Math.min(100, budgetPercentage)
        const budgetCategory = getBudgetCategory ? getBudgetCategory(tempBudget) : "Complete"
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Budget Tracker</h3>
            </div>

            {/* Budget Display */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <PoundSterling className="w-6 h-6 text-purple-600 mb-1" />
                  <span className="text-3xl font-bold text-gray-900">{unifiedTotalCost}</span>
                  <span className="text-gray-600 font-medium">of £{tempBudget}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-purple-600'}`}>
                    {isOverBudget ? `-£${overBudgetAmount}` : `£${Math.abs(remaining)}`}
                  </div>
                  <div className={`text-sm ${isOverBudget ? 'text-red-500' : 'text-gray-600'}`}>
                    {isOverBudget ? 'over budget' : 'remaining'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div
                      className={`${isOverBudget ? 'bg-red-500' : 'bg-purple-500'} h-full rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${displayPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                    {budgetPercentage}% used
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    {budgetCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget breakdown by supplier */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Budget Breakdown:</h4>
              {Object.entries(suppliers).map(([type, supplier]) => {
                if (!supplier) return null
                
                // Calculate unified pricing for this supplier
                const supplierAddons = addons.filter(addon => 
                  addon.supplierId === supplier.id || 
                  addon.supplierType === type ||
                  addon.attachedToSupplier === type
                );
                const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
                const supplierCost = pricing.finalPrice;
                
                const name = type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
                const percentage = tempBudget > 0 ? Math.round((supplierCost / tempBudget) * 100) : 0
                
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-700">{name}</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">£{supplierCost}</div>
                      <div className="text-xs text-gray-500">{percentage}% of budget</div>
                    </div>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          </div>
        )

      case "progress":
        // Get list of suppliers with their status
        const supplierEntries = Object.entries(suppliers).map(([type, supplier]) => {
          // Calculate unified pricing for display
          let supplierCost = 0;
          if (supplier) {
            const supplierAddons = addons.filter(addon => 
              addon.supplierId === supplier.id || 
              addon.supplierType === type ||
              addon.attachedToSupplier === type
            );
            const pricing = calculateFinalPrice(supplier, partyDetails, supplierAddons);
            supplierCost = pricing.finalPrice;
          }

          return {
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
            isBooked: supplier !== null,
            supplierName: supplier?.name || null,
            price: supplierCost || null
          }
        })

        return (
          <div className="space-y-4">
          {/* Simple Header */}
          <div className="flex items-center justify-end">
            <p className="text-sm text-gray-600 font-medium">
              {confirmedSuppliers} of {totalSlots} selected
            </p>
          </div>

          {/* Supplier List */}
          <div className="space-y-2">
            {supplierEntries.map(({ type, name, isBooked, supplierName, price }) => (
              <button
                key={type}
                onClick={() => {
                  if (!isBooked) {
                    closeModal()
                    setTimeout(() => {
                      onSupplierTabChange?.(type)
                    }, 300)
                  }
                }}
                disabled={isBooked}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                  isBooked 
                    ? 'bg-primary-50 border-[hsl(var(--primary-200))]' 
                    : 'bg-gray-50 border-gray-200 border-dashed cursor-pointer hover:bg-gray-100 hover:border-[hsl(var(--primary-300))] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isBooked ? 'bg-[hsl(var(--primary-500))]' : 'bg-gray-300'
                  }`}>
                    {isBooked ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Plus className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className={`font-semibold block text-sm ${isBooked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {name}
                    </span>
                    {isBooked && supplierName && (
                      <div className="text-xs text-[hsl(var(--primary-700))] truncate">{supplierName}</div>
                    )}
                    {!isBooked && (
                      <div className="text-xs text-gray-400">Tap to add</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isBooked && price ? (
                    <span className="font-bold text-[hsl(var(--primary-700))] text-base flex-shrink-0">£{price}</span>
                  ) : (
                    <>
                      <span className="text-xs text-[hsl(var(--primary-500))] font-medium flex-shrink-0">Add</span>
                      <ChevronRight className="w-4 h-4 text-[hsl(var(--primary-500))]" />
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
    
          {/* Total Cost */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl p-4 text-center shadow-lg">
            <div className="text-xs text-white/80 mb-1 font-medium">Total Party Cost</div>
            <div className="text-3xl font-black text-white">£{unifiedTotalCost.toLocaleString()}</div>
          </div>
        </div>
        )

      case "timer":
        return (
          <div className="space-y-6">
          {CountdownWidget ? (
            <div>{CountdownWidget}</div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Party Countdown</h3>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className="text-orange-600">
                    {timeRemaining} days
                  </span>
                </div>
                <p className="text-sm text-orange-700">Until your party!</p>
              </div>
            </div>
          )}
        </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className="md:hidden fixed left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg" style={{ bottom: 0 }}>
        <div className="px-2 py-2 safe-area-pb" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-around items-center max-w-md mx-auto gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  className="relative flex flex-col items-center justify-center transition-all duration-300 flex-1"
                  data-tour={tab.id === "progress" ? "progress-tab" : undefined}
                >
                  {/* All tabs same style */}
                  <div className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive ? "bg-gray-100" : ""
                  }`}>
                    <div className="relative">
                      <Icon
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isActive ? tab.color : "text-gray-400"
                        }`}
                      />

                      {/* Badge for progress/suppliers tab */}
                      {tab.badge !== undefined && (
                        <div className="absolute -top-1 -right-1 bg-primary-500 rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">
                            {tab.badge}
                          </span>
                        </div>
                      )}

                      {tab.urgent && timeRemaining > 0 && timeRemaining < 3 && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold transition-colors duration-200 text-center leading-tight ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {tab.label}
                    </span>

                    {tab.subtext && (
                      <span className="text-[9px] text-gray-400 font-medium">
                        {tab.subtext}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl z-10">
              <h2 className="text-xl font-bold text-gray-900  capitalize">
                {activeTab === "progress" ? "Your Suppliers" :
                 activeTab === "myparty" ? "Party Details" :
                 activeTab === "timer" ? "Party Countdown" : activeTab}
              </h2>
              <button
                onClick={closeModal}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="px-6 py-6 pb-24">{getModalContent()}</div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: calc(65px + env(safe-area-inset-bottom, 0px));
          }
        }

        .safe-area-pb {
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }

        @supports (padding: max(0px)) {
          @media (max-width: 768px) {
            body {
              padding-bottom: max(65px, calc(65px + env(safe-area-inset-bottom, 0px)));
            }
          }
        }
      `}</style>
    </>
  )
}

export default SimpleMobileBottomTabBar