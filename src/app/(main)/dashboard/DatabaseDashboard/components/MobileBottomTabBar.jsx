"use client"

import { useState, useEffect } from "react"
import { Home, BarChart3, FileText, Clock, X, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { calculatePaymentAmounts } from '@/utils/supplierPricingHelpers'
import { Button } from "@/components/ui/button"

const MobileBottomTabBar = ({
  suppliers = {},
  enquiries = [],
  totalCost = 0,
  timeRemaining = 24,
  partyDetails = {},
  onPaymentReady,
  isPaymentConfirmed = false,
  // Payment-specific props
  outstandingSuppliers = [],
  totalDepositAmount = 0,
  hasOutstandingPayments = false,
  // Widget props
  ProgressWidget,
  CountdownWidget,
  isVisible = true 
}) => {
  const [activeTab, setActiveTab] = useState("party")
  const [showModal, setShowModal] = useState(false)
  const [paymentBreakdown, setPaymentBreakdown] = useState(null)
  const router = useRouter()

  // Calculate progress
  const confirmedSuppliers = Object.entries(suppliers || {}).filter(
    ([key, supplier]) => supplier !== null && key !== "einvites",
  ).length

  const totalSlots = 7
  const progressPercentage = Math.round((confirmedSuppliers / totalSlots) * 100)

  useEffect(() => {
    if (confirmedSuppliers.length > 0) {
      const breakdown = calculatePaymentAmounts(confirmedSuppliers, partyDetails)
      setPaymentBreakdown(breakdown)
      
      console.log('Mobile tab bar payment breakdown:', {
        totalPaymentToday: breakdown.totalPaymentToday,
        depositAmount: breakdown.depositAmount,
        fullPaymentAmount: breakdown.fullPaymentAmount,
        hasDeposits: breakdown.hasDeposits,
        hasFullPayments: breakdown.hasFullPayments
      })
    } else {
      setPaymentBreakdown(null)
    }
  }, [confirmedSuppliers, partyDetails])

  // Enhanced tab configuration with payment integration
  const getTabConfig = () => {
    const baseTabs = [
      { id: "party", label: "Party", icon: Home },
      {
        id: "progress",
        label: "Progress",
        icon: BarChart3,
        badge: `${confirmedSuppliers}/${totalSlots}`,
      },
      { id: "summary", label: "Summary", icon: FileText },
      {
        id: "timer",
        label: "Timer",
        icon: Clock,
        urgent: timeRemaining < 6,
      },
    ]

    // If there are outstanding payments, replace the timer tab with payment
    if (hasOutstandingPayments) {
      return [
        { id: "party", label: "Party", icon: Home },
        {
          id: "progress",
          label: "Progress",
          icon: BarChart3,
          badge: `${confirmedSuppliers}/${totalSlots}`,
        },
        { id: "summary", label: "Summary", icon: FileText },
        {
          id: "payment",
          label: outstandingSuppliers.length > 1 ? "Pay All" : "Pay Now",
          icon: CreditCard,
          isPayment: true,
          amount: `£${totalDepositAmount}`,
          count: outstandingSuppliers.length,
        },
      ]
    }

    return baseTabs
  }

  const tabs = getTabConfig()

  const handleTabPress = (tab) => {
    if (tab.id === "party") {
      setActiveTab(tab.id)
      setShowModal(false)
    } else if (tab.id === "summary") {
      router.push("/party-summary")
    } else if (tab.id === "payment") {
      // Direct payment action
      onPaymentReady()
    } else {
      setActiveTab(tab.id)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setActiveTab("party")
  }

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
      case "payment":
        return getPaymentModalContent()

      case "progress":
        return (
          <div className="space-y-6">
            {ProgressWidget ? (
              <div>{ProgressWidget}</div>
            ) : (
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
                <p className="text-gray-600">
                  {confirmedSuppliers} of {totalSlots} suppliers confirmed
                </p>
              </div>
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[200] shadow-lg">
        <div className="px-4 py-2 safe-area-pb">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isPaymentTab = tab.isPayment

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all duration-300 min-w-[60px] ${
                    isPaymentTab
                      ? "bg-teal-600 shadow-lg scale-105 animate-pulse"
                      : isActive
                        ? "bg-primary-50 shadow-md scale-105"
                        : "bg-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="relative mb-0.5">
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isPaymentTab ? "text-white" : isActive ? "text-primary-600" : "text-gray-500"
                      }`}
                    />

                    {tab.badge && !isPaymentTab && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm border-2 border-white">
                        {tab.badge.split("/")[0]}
                      </span>
                    )}

                    {isPaymentTab && tab.count > 1 && (
                      <span className="absolute -top-1 -right-1 bg-white text-teal-600 text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold border-2 border-teal-100 shadow-sm">
                        {tab.count}
                      </span>
                    )}

                    {tab.urgent && !isPaymentTab && timeRemaining < 2 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-sm"></div>
                    )}
                  </div>

                  <span
                    className={`text-xs font-medium transition-colors duration-200 text-center leading-tight ${
                      isPaymentTab ? "text-white" : isActive ? "text-primary-600" : "text-gray-600"
                    }`}
                  >
                    {tab.label}
                  </span>

                  {isPaymentTab && (
                    <span className="text-xs font-bold text-white mt-0.5 leading-tight opacity-90">{tab.amount}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[250] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {activeTab === "payment" ? "Secure Your Suppliers" : activeTab}
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

export default MobileBottomTabBar
