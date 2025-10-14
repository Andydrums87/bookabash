// components/DatabaseDashboard/components/MobileBottomTabBar.jsx - WITH PAYMENT LOGIC

"use client"

import React, { useState } from "react"
import { ClipboardList, Plus, PartyPopper, Clock, X, CreditCard, Mail, Users, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const MobileBottomTabBar = ({
  suppliers = {},
  enquiries = [],
  partyDetails = {},
  guestList = [],
  giftRegistry = null,
  registryItemCount = 0,
  einvites = null,
  // ✅ Payment props
  onPaymentReady,
  isPaymentConfirmed = false,
  outstandingSuppliers = [],
  totalDepositAmount = 0,
  hasOutstandingPayments = false,
  // Widget props
  AddSuppliersSection,
  ProgressWidget,
  CountdownWidget,
  getSupplierDisplayName,
  getSupplierDisplayPricing,
  totalCost = 0, // ✅ ADD THIS
  addons = [], // ✅ ADD THIS
}) => {
  const [activeTab, setActiveTab] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  // Calculate progress
  const confirmedSuppliers = Object.entries(suppliers || {}).filter(
    ([key, supplier]) => supplier !== null && key !== "einvites",
  ).length

  const totalSlots = 9
  const progressPercentage = Math.round((confirmedSuppliers / totalSlots) * 100)
  
  const allSupplierTypes = ['venue', 'entertainment', 'cakes', 'decorations', 'facePainting', 'activities', 'partyBags', 'balloons', 'catering']
  const emptySlots = allSupplierTypes.filter(type => !suppliers[type]).length

  const calculateTimeRemaining = () => {
    if (!partyDetails?.date) return 0
    const partyDate = new Date(partyDetails.date)
    const now = new Date()
    const diffInDays = Math.ceil((partyDate - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffInDays)
  }

  const timeRemaining = calculateTimeRemaining()

  // Party Tools data
  const partyTools = [
    {
      id: 'einvites',
      label: 'E-Invites',
      icon: Mail,
      href: einvites?.inviteId 
        ? `/e-invites/${einvites.inviteId}/manage`
        : '/e-invites/create',
      hasContent: !!einvites,
      status: einvites ? '✓ Created' : 'Not created',
      description: einvites 
        ? 'Manage your digital invitations'
        : 'Create invitations'
    },
    {
      id: 'guests',
      label: 'Guest List',
      icon: Users,
      href: `/rsvps/${partyDetails?.id || ''}`,
      hasContent: (guestList?.length || 0) > 0,
      count: guestList?.length || 0,
      status: (guestList?.length || 0) > 0 ? `${guestList.length} guests` : 'No guests yet',
      description: (guestList?.length || 0) > 0
        ? 'Manage your guest list'
        : 'Add guests'
    },
    {
      id: 'registry',
      label: 'Gift Registry',
      icon: Gift,
      href: '/gift-registry',
      hasContent: !!giftRegistry,
      count: registryItemCount,
      status: giftRegistry 
        ? registryItemCount > 0 ? `${registryItemCount} items` : 'Empty registry'
        : 'Not created',
      description: giftRegistry
        ? 'Manage your gift registry'
        : 'Set up registry'
    }
  ]

  const completedTools = partyTools.filter(tool => tool.hasContent).length

  // ✅ Dynamic tabs - payment replaces timer if there are outstanding payments
  const getTabConfig = () => {
    const baseTabs = [
      {
        id: "progress",
        label: "My Plan",
        icon: ClipboardList,
        badge: confirmedSuppliers,
        total: totalSlots,
        color: "text-primary-500",
        activeColor: "text-primary-600",
        subtext: `${confirmedSuppliers}/${totalSlots}`
      },
      {
        id: "add",
        label: "Add Suppliers",
        icon: Plus,
        color: "text-primary-500",
        activeColor: "text-primary-600",
        count: emptySlots,
        isHighlight: true
      },
      {
        id: "tools",
        label: "Party Tools",
        icon: PartyPopper,
        color: "text-purple-500",
        activeColor: "text-purple-600",
        completedCount: completedTools,
        totalCount: partyTools.length
      }
    ]

    // ✅ If there are outstanding payments, replace timer with payment
    if (hasOutstandingPayments) {
      baseTabs.push({
        id: "payment",
        label: outstandingSuppliers.length > 1 ? "Pay All" : "Pay Now",
        icon: CreditCard,
        color: "text-white",
        activeColor: "text-white",
        isPayment: true,
        amount: `£${totalDepositAmount}`,
        count: outstandingSuppliers.length
      })
    } else {
      // Otherwise show timer
      baseTabs.push({
        id: "timer",
        label: "Timer",
        icon: Clock,
        color: "text-orange-500",
        activeColor: "text-orange-600",
        urgent: timeRemaining < 7,
        subtext: timeRemaining > 0 ? `${timeRemaining}d` : "Today!"
      })
    }

    return baseTabs
  }

  const tabs = getTabConfig()

  const handleTabPress = (tab) => {
    // ✅ Handle payment directly without modal
    if (tab.id === "payment") {
      onPaymentReady()
      return
    }

    setActiveTab(tab.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setActiveTab(null)
  }

  // ✅ Payment modal content
  const getPaymentModalContent = () => {
    const isMultiple = outstandingSuppliers.length > 1

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-teal-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isMultiple ? "Multiple Deposits Due" : "Deposit Required"}
          </h3>

          <p className="text-gray-600 mb-4">
            {isMultiple
              ? `Secure ${outstandingSuppliers.length} suppliers with deposit payments`
              : "Secure your confirmed supplier with a deposit payment"}
          </p>
        </div>

        {/* Outstanding suppliers list */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">
            {isMultiple ? "Suppliers awaiting payment:" : "Ready to secure:"}
          </h4>
          <div className="space-y-2">
            {outstandingSuppliers.map((supplier, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200"
              >
                <span className="font-medium text-gray-700">{supplier.name}</span>
                <span className="font-bold text-teal-600">£{supplier.depositAmount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-teal-800">Total deposit:</span>
            <span className="text-2xl font-bold text-teal-600">£{totalDepositAmount}</span>
          </div>
          <p className="text-sm text-teal-700 text-center">
            {isMultiple ? "One payment secures all your suppliers" : "Quick and secure payment process"}
          </p>
        </div>

        {/* Action button */}
        <Button
          onClick={onPaymentReady}
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Pay £{totalDepositAmount} Now
        </Button>
      </div>
    )
  }

  const getModalContent = () => {
    switch (activeTab) {
      case "add":
        return AddSuppliersSection ? (
          React.cloneElement(AddSuppliersSection, {
            onSupplierAdded: closeModal // Pass the close function
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No suppliers available to add</p>
          </div>
        )

      case "tools":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Party Tools</h3>
              <p className="text-sm text-gray-600">
                Manage invitations, guests, and gifts
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {completedTools} of {partyTools.length} completed
              </div>
            </div>

            <div className="space-y-3">
              {partyTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={closeModal}
                    className="block p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          tool.hasContent ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            tool.hasContent ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{tool.label}</h4>
                            {tool.hasContent && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{tool.status}</p>
                        </div>
                      </div>
                      {tool.count > 0 && (
                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                          {tool.count}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )
        case "progress":
          return (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="text-center">
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
                      className="text-primary-500"
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Party Plan</h3>
                <p className="text-gray-600">
                  {confirmedSuppliers} of {totalSlots} suppliers confirmed
                </p>
              </div>
        
              {/* Total Cost Summary */}
              <div className="bg-primary-500 rounded-xl p-6 text-white text-center">
                <div className="text-sm font-medium text-white/80 mb-2">Total Party Cost</div>
                <div className="text-4xl font-bold">
                  £{typeof totalCost === 'number' ? totalCost.toFixed(2) : '0.00'}
                </div>
              </div>
        
              {/* Party Team Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    Your Party Team
                  </span>
                  <span className="text-sm text-gray-500">
                    {confirmedSuppliers}/{totalSlots}
                  </span>
                </h4>
                
                {confirmedSuppliers > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(suppliers).map(([type, supplier]) => {
                      if (!supplier || type === "einvites") return null
                      
                      // Get enquiry status for this supplier
                      const enquiry = enquiries.find((e) => e.supplier_category === type)
                      const isAccepted = enquiry?.status === "accepted"
                      const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true
                      const isPending = enquiry?.status === "pending"
                      
                      // Get supplier addons
                      const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
                        addon.supplierId === supplier.id || 
                        addon.supplierType === type ||
                        addon.attachedToSupplier === type
                      ) : []
                      
                      // Calculate total price (base price + addons)
                      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
                      const totalPrice = (supplier.price || 0) + addonsCost
                      
                      // Get supplier name
                      const supplierName = supplier.name || 'Unknown Supplier'
                      
                      // Get category display name
                      const categoryNames = {
                        venue: 'Venue',
                        entertainment: 'Entertainment',
                        catering: 'Catering',
                        cakes: 'Cakes',
                        facePainting: 'Face Painting',
                        activities: 'Activities',
                        partyBags: 'Party Bags',
                        decorations: 'Decorations',
                        balloons: 'Balloons'
                      }
                      const categoryName = categoryNames[type] || type.charAt(0).toUpperCase() + type.slice(1)
                      
                      // Determine status badge
                      let statusBadge = null
                      if (isPaid) {
                        statusBadge = (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                            ✓ Paid
                          </span>
                        )
                      } else if (isAccepted) {
                        // If accepted but NOT paid, show payment pending
                        statusBadge = (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                            💳 Payment Pending
                          </span>
                        )
                      } else if (isPending) {
                        statusBadge = (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                            ⏳ Pending
                          </span>
                        )
                      } else {
                        statusBadge = (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                            ⚡ Just Added
                          </span>
                        )
                      }
                      
                      return (
                        <div
                          key={type}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="flex gap-3 p-3">
                            {/* Supplier Image */}
                            {supplier.image && (
                              <div className="flex-shrink-0">
                                <img
                                  src={supplier.image}
                                  alt={supplierName}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Supplier Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                                    {categoryName}
                                  </p>
                                  <h5 className="font-semibold text-gray-900 text-sm truncate">
                                    {supplierName}
                                  </h5>
                                </div>
                                {statusBadge}
                              </div>
                              
                              {/* Price */}
                              <div className="mt-1">
                                <p className="text-sm font-bold text-primary-600">
                                  £{totalPrice.toFixed(2)}
                                </p>
                                {supplierAddons.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                                  </p>
                                )}
                                
                                {/* Payment status */}
                                {!isPaid && (isAccepted || isPending) && (
                                  <p className="text-xs text-orange-600 mt-1 font-medium">
                                    Payment pending
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No suppliers added yet
                  </p>
                )}
              </div>
        
              {/* Optional: Add link to add more suppliers */}
              {confirmedSuppliers < totalSlots && (
                <Button
                  onClick={() => {
                    setActiveTab("add")
                  }}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Suppliers ({totalSlots - confirmedSuppliers} available)
                </Button>
              )}
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        <div className="px-2 py-2 safe-area-pb">
          <div className="flex justify-around items-center max-w-md mx-auto gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isHighlight = tab.isHighlight
              const isPayment = tab.isPayment

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
                    isPayment 
                      ? "bg-teal-600 shadow-lg animate-pulse" 
                      : "hover:bg-gray-50 active:scale-95"
                  }`}
                >
                  {/* Icon with badge */}
                  <div className="relative mb-1">
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isPayment ? "text-white" :
                        isActive ? tab.activeColor : tab.color
                      }`}
                    />

                    {/* Badge for My Plan */}
                    {tab.id === "progress" && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold border border-white">
                        {tab.badge}
                      </div>
                    )}

                    {/* Badge for Add Suppliers */}
                    {isHighlight && tab.count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-white">
                        {tab.count}
                      </div>
                    )}

                    {/* Badge for Party Tools */}
                    {tab.id === "tools" && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[8px] rounded-full px-1 py-0.5 flex items-center justify-center font-bold border border-white whitespace-nowrap">
                        {tab.completedCount}/{tab.totalCount}
                      </div>
                    )}

                    {/* Badge for Payment */}
                    {isPayment && tab.count > 1 && (
                      <div className="absolute -top-1 -right-1 bg-white text-teal-600 text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold border border-teal-100">
                        {tab.count}
                      </div>
                    )}

                    {/* Urgent indicator for Timer */}
                    {tab.urgent && timeRemaining > 0 && timeRemaining < 3 && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold transition-colors duration-200 text-center leading-tight ${
                      isPayment ? "text-white" :
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {tab.label}
                  </span>
                  
                  {/* Subtext or Amount */}
                  {isPayment ? (
                    <span className="text-[9px] text-white font-bold mt-0.5 opacity-90">
                      {tab.amount}
                    </span>
                  ) : tab.subtext && (
                    <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                      {tab.subtext}
                    </span>
                  )}
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
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {activeTab === "add" ? "Add Suppliers" :
                 activeTab === "tools" ? "Party Tools" :
                 activeTab === "progress" ? "Your Party Plan" : 
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
            padding-bottom: 65px;
          }
        }
        
        .safe-area-pb {
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  )
}

export default MobileBottomTabBar