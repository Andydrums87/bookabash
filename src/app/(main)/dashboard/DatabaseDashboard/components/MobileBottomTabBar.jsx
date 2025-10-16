// components/DatabaseDashboard/components/MobileBottomTabBar.jsx - WITH PENDING SECTION

"use client"

import React, { useState } from "react"
import { ClipboardList, Plus, PartyPopper, Clock, X, CreditCard, Mail, Users, Gift, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import DeleteConfirmDialog from "../../components/Dialogs/DeleteConfirmDialog"

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
  totalCost = 0,
  addons = [],
  onRemoveSupplier
}) => {
  const [activeTab, setActiveTab] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false) // ✅ NEW
  const [supplierToDelete, setSupplierToDelete] = useState(null) // ✅ NEW
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

  // ✅ SMART: Check if venue is confirmed (paid)
  const venueEnquiry = enquiries.find(e => e.supplier_category === 'venue')
  const isVenueConfirmed = venueEnquiry?.payment_status === 'paid' || venueEnquiry?.is_paid === true

  // ✅ SMART: Check if suppliers are confirmed (at least one paid supplier)
  const hasPaidSuppliers = enquiries.some(e => 
    e.payment_status === 'paid' || e.is_paid === true
  )

  // ✅ SMART: Party Tools with lock logic
  const partyTools = [
    {
      id: 'guests',
      label: 'Guest List',
      icon: Users,
      href: `/rsvps/${partyDetails?.id || ''}`,
      hasContent: (guestList?.length || 0) > 0,
      count: guestList?.length || 0,
      isLocked: false,
      status: (guestList?.length || 0) > 0 
        ? `${guestList.length} guests` 
        : 'No guests yet',
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
      isLocked: !hasPaidSuppliers,
      lockMessage: 'Secure at least one supplier to create registry',
      status: !hasPaidSuppliers
        ? '🔒 Locked'
        : giftRegistry 
          ? registryItemCount > 0 ? `${registryItemCount} items` : 'Empty registry'
          : 'Not created',
      description: !hasPaidSuppliers
        ? 'Confirm suppliers first'
        : giftRegistry
          ? 'Manage your gift registry'
          : 'Set up registry'
    },
    {
      id: 'einvites',
      label: 'E-Invites',
      icon: Mail,
      href: einvites?.inviteId 
        ? `/e-invites/${einvites.inviteId}/manage`
        : '/e-invites/create',
      hasContent: !!einvites,
      isLocked: !isVenueConfirmed,
      lockMessage: 'Complete venue booking to unlock invites',
      status: !isVenueConfirmed 
        ? '🔒 Locked' 
        : einvites 
          ? '✓ Created' 
          : 'Not created',
      description: !isVenueConfirmed
        ? 'Confirm venue first'
        : einvites 
          ? 'Manage your digital invitations'
          : 'Create invitations'
    }
  ]

  const completedTools = partyTools.filter(tool => tool.hasContent && !tool.isLocked).length
  const availableTools = partyTools.filter(tool => !tool.isLocked).length

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
        color: "text-primary-500",
        activeColor: "text-primary-600",
        completedCount: completedTools,
        totalCount: availableTools
      }
    ]

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

  const handleRemoveClick = (type) => {
    setSupplierToDelete(type) // ✅ Store which supplier to delete
    setShowDeleteDialog(true) // ✅ Show the dialog
  }
  
  const confirmRemoveSupplier = (type) => {
    if (onRemoveSupplier) {
      onRemoveSupplier(type) // ✅ Call parent's remove function
    }
    setShowDeleteDialog(false)
    setSupplierToDelete(null)
  }
  
  const cancelRemoveSupplier = () => {
    setShowDeleteDialog(false)
    setSupplierToDelete(null)
  }
  

  const getModalContent = () => {
    switch (activeTab) {
      case "add":
        return AddSuppliersSection ? (
          React.cloneElement(AddSuppliersSection, {
            onSupplierAdded: closeModal
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
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Party Tools</h3>
              <p className="text-sm text-gray-600">
                Manage invitations, guests, and gifts
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {completedTools} of {availableTools} completed
              </div>
            </div>

            <div className="space-y-3">
              {partyTools.map((tool) => {
                const Icon = tool.icon
                const isLocked = tool.isLocked

                if (isLocked) {
                  return (
                    <div
                      key={tool.id}
                      className="block p-4 bg-gray-50 border-2 border-gray-200 rounded-xl opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-400" />
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-400">{tool.label}</h4>
                              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                🔒 Locked
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{tool.lockMessage}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={closeModal}
                    className="block p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all active:scale-[0.98]"
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
                          <p className="text-xs text-gray-600">{tool.description}</p>
                        </div>
                      </div>
                      {tool.count > 0 && (
                        <div className="bg-purple-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
                          {tool.count}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            {partyTools.some(t => t.isLocked) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Complete your venue booking to unlock all party tools
                </p>
              </div>
            )}
          </div>
        )

      case "progress":
        return (
          <div className="space-y-6">
            {/* Total Cost Summary */}
            <div className="bg-primary-500 rounded-xl p-6 text-white text-center">
              <div className="text-sm font-medium text-white/80 mb-2">Total Party Cost</div>
              <div className="text-4xl font-bold">
                £{typeof totalCost === 'number' ? totalCost.toFixed(2) : '0.00'}
              </div>
            </div>

            {/* ✅ NEW: Pending Payment Section */}
            {(() => {
              const pendingSuppliers = Object.entries(suppliers).filter(([type, supplier]) => {
                if (!supplier || type === "einvites") return false
                const enquiry = enquiries.find((e) => e.supplier_category === type)
                const isPaid = enquiry?.payment_status === "paid" || enquiry?.is_paid === true
                return !isPaid && supplier
              })

              if (pendingSuppliers.length === 0) return null

              return (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Pending Payment ({pendingSuppliers.length})
                  </h4>
                  <p className="text-xs text-orange-700 mb-3">
                    Review and remove suppliers before payment
                  </p>
                  
                  <div className="space-y-3">
                    {pendingSuppliers.map(([type, supplier]) => {
                      const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
                        addon.supplierId === supplier.id || 
                        addon.supplierType === type ||
                        addon.attachedToSupplier === type
                      ) : []
                      
                      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
                      const totalPrice = (supplier.price || 0) + addonsCost
                      const supplierName = supplier.name || 'Unknown Supplier'
                      
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
                      
                      return (
                        <div
                          key={type}
                          className="bg-white rounded-lg border-2 border-orange-300 overflow-hidden"
                        >
                          <div className="flex gap-3 p-3">
                            {supplier.image && (
                              <div className="flex-shrink-0">
                                <img
                                  src={supplier.image}
                                  alt={supplierName}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-orange-600 uppercase tracking-wide mb-0.5 font-semibold">
                                    {categoryName}
                                  </p>
                                  <h5 className="font-semibold text-gray-900 text-sm truncate">
                                    {supplierName}
                                  </h5>
                                </div>
                                
                                {/* Remove button */}
                                <button
                                  onClick={() => handleRemoveClick(type)}
                                  className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                                >
                                  <X className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                              
                              <div className="mt-1">
                                <p className="text-sm font-bold text-orange-600">
                                  £{totalPrice.toFixed(2)}
                                </p>
                                {supplierAddons.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Payment CTA */}
                  {hasOutstandingPayments && (
                    <Button
                      onClick={onPaymentReady}
                      className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay £{totalDepositAmount} to Secure
                    </Button>
                  )}
                </div>
              )
            })()}
      
            {/* Party Team Section - ONLY PAID SUPPLIERS */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  Confirmed Suppliers
                </span>
                <span className="text-sm text-gray-500">
                  {(() => {
                    const paidCount = Object.entries(suppliers).filter(([type, supplier]) => {
                      if (!supplier || type === "einvites") return false
                      const enquiry = enquiries.find((e) => e.supplier_category === type)
                      return enquiry?.payment_status === "paid" || enquiry?.is_paid === true
                    }).length
                    return `${paidCount}/${totalSlots}`
                  })()}
                </span>
              </h4>
              
              {(() => {
                const paidSuppliers = Object.entries(suppliers).filter(([type, supplier]) => {
                  if (!supplier || type === "einvites") return false
                  const enquiry = enquiries.find((e) => e.supplier_category === type)
                  return enquiry?.payment_status === "paid" || enquiry?.is_paid === true
                })

                if (paidSuppliers.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No confirmed suppliers yet
                    </p>
                  )
                }

                return (
                  <div className="space-y-3">
                    {paidSuppliers.map(([type, supplier]) => {
                      const supplierAddons = Array.isArray(addons) ? addons.filter(addon => 
                        addon.supplierId === supplier.id || 
                        addon.supplierType === type ||
                        addon.attachedToSupplier === type
                      ) : []
                      
                      const addonsCost = supplierAddons.reduce((sum, addon) => sum + (addon.price || 0), 0)
                      const totalPrice = (supplier.price || 0) + addonsCost
                      const supplierName = supplier.name || 'Unknown Supplier'
                      
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
                      
                      return (
                        <div
                          key={type}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <div className="flex gap-3 p-3">
                            {supplier.image && (
                              <div className="flex-shrink-0">
                                <img
                                  src={supplier.image}
                                  alt={supplierName}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              </div>
                            )}
                            
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
                                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                  ✓ Paid
                                </span>
                              </div>
                              
                              <div className="mt-1">
                                <p className="text-sm font-bold text-primary-600">
                                  £{totalPrice.toFixed(2)}
                                </p>
                                {supplierAddons.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Base: £{(supplier.price || 0).toFixed(2)} + {supplierAddons.length} add-on{supplierAddons.length > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
      
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
        <DeleteConfirmDialog
      isOpen={showDeleteDialog}
      supplierType={supplierToDelete}
      onConfirm={confirmRemoveSupplier}
      onCancel={cancelRemoveSupplier}
    />
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
                  <div className="relative mb-1">
                    <Icon
                      className={`w-6 h-6 transition-colors duration-200 ${
                        isPayment ? "text-white" :
                        isActive ? tab.activeColor : tab.color
                      }`}
                    />

                    {/* {tab.id === "progress" && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold border border-white">
                        {tab.badge}
                      </div>
                    )} */}

                    {/* {isHighlight && tab.count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-white">
                        {tab.count}
                      </div>
                    )} */}
{/* 
                    {tab.id === "tools" && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[8px] rounded-full px-1 py-0.5 flex items-center justify-center font-bold border border-white whitespace-nowrap">
                        {tab.completedCount}/{tab.totalCount}
                      </div>
                    )} */}

                    {isPayment && tab.count > 1 && (
                      <div className="absolute -top-1 -right-1 bg-white text-teal-600 text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold border border-teal-100">
                        {tab.count}
                      </div>
                    )}

                    {tab.urgent && timeRemaining > 0 && timeRemaining < 3 && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></div>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-semibold transition-colors duration-200 text-center leading-tight ${
                      isPayment ? "text-white" :
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {tab.label}
                  </span>
                  
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