"use client"

import { useState, useMemo } from "react"
import { Home, BarChart3, FileText, Clock, X, DollarSign, Sparkles, PoundSterling } from "lucide-react"
import { useRouter } from "next/navigation"
import { calculateFinalPrice } from '@/utils/unifiedPricing'


const SimpleMobileBottomTabBar = ({
  suppliers = {},
  partyDetails = {},
  addons = [], // Add addons prop
  // Budget props
  tempBudget = 0,
  budgetPercentage = 0,
  getBudgetCategory,
  CountdownWidget
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
    { id: "party", label: "Party", icon: Home },
    {
      id: "progress",
      label: "Progress",
      icon: BarChart3,
      badge: `${confirmedSuppliers}/${totalSlots}`,
    },
    { id: "budget", label: "Budget", icon: FileText },
    {
      id: "timer",
      label: "Timer",
      icon: Clock,
      urgent: timeRemaining < 7, // Show as urgent if less than a week
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

  const getModalContent = () => {
    switch (activeTab) {
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
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Budget Tracker</h3>
            </div>

            {/* Budget Display */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <PoundSterling className="w-6 h-6 text-teal-600 mb-1" />
                  <span className="text-3xl font-bold text-gray-900">{unifiedTotalCost}</span>
                  <span className="text-gray-600 font-medium">of £{tempBudget}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-teal-600'}`}>
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
                      className={`${isOverBudget ? 'bg-red-500' : 'bg-teal-500'} h-full rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${displayPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                    {budgetPercentage}% used
                  </span>
                  <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-semibold">
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
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Party Progress</h3>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${progressPercentage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{progressPercentage}%</span>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                {confirmedSuppliers} of {totalSlots} suppliers selected
              </p>
            </div>

            {/* Supplier breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Your Party Team:</h4>
              {supplierEntries.map(({ type, name, isBooked, supplierName, price }) => (
                <div key={type} className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                  isBooked 
                    ? 'bg-teal-50 border-teal-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      isBooked ? 'bg-teal-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <span className="font-medium text-gray-800">{name}</span>
                      {isBooked && supplierName && (
                        <div className="text-sm text-gray-600">{supplierName}</div>
                      )}
                    </div>
                  </div>
                  {isBooked && price ? (
                    <span className="font-bold text-teal-600">£{price}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Not selected</span>
                  )}
                </div>
              ))}
            </div>

            {/* Total cost using unified pricing */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">£{unifiedTotalCost.toLocaleString()}</div>
              <div className="text-sm text-teal-700">Total party cost</div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Party Countdown</h3>
              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className="text-primary-600">
                    {Math.floor(timeRemaining)}h {Math.round((timeRemaining - Math.floor(timeRemaining)) * 60)}m
                  </span>
                </div>
                <p className="text-sm text-primary-700">Time remaining to secure your party</p>
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-400  z-30 shadow-2xl">
        <div className="px-3 py-2 safe-area-pb">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-300 min-w-[80px] ${
                    isActive
                      ? "bg-white shadow-md scale-105 transform"
                      : "bg-transparent hover:bg-white/20 hover:backdrop-blur-sm"
                  }`}
                  data-tour={tab.id === "progress" ? "progress-tab" : undefined}
                >
                  <div className="relative mb-0.5">
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isActive ? "text-primary-600" : "text-white"
                      }`}
                    />

                    {tab.badge && (
                      <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg border-2 border-white text-[9px]">
                        {tab.badge.split("/")[0]}
                      </span>
                    )}

                    {tab.urgent && timeRemaining > 0 && timeRemaining < 3 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-sm"></div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-semibold transition-colors duration-200 text-center leading-tight ${
                      isActive ? "text-primary-700" : "text-white/90"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {activeTab === "timer" ? "Party Countdown" : activeTab}
              </h2>
              <button
                onClick={closeModal}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 pb-24">{getModalContent()}</div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 75px;
          }
        }
        
        .safe-area-pb {
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  )
}

export default SimpleMobileBottomTabBar