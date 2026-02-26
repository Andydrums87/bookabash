"use client"

import { useState } from "react"
import { Compass, ClipboardList, PlusCircle, Users, Clock, MoreHorizontal } from "lucide-react"

// Tab configuration with Lucide icons
const TABS = [
  { id: "journey", label: "Progress", icon: Compass, mobileLabel: "Progress" },
  { id: "myplan", label: "Party Plan", icon: ClipboardList, mobileLabel: "Party Plan" },
  { id: "add", label: "Add Suppliers", icon: PlusCircle, mobileLabel: "Add Suppliers" },
  { id: "guests", label: "Invites", icon: Users, mobileLabel: "Invites" },
  { id: "timeline", label: "Timeline", icon: Clock, mobileLabel: "Timeline" },
  { id: "more", label: "More", icon: MoreHorizontal, mobileLabel: "More" },
]

// Modern Tab Navigation Component
function TabNavigation({ activeTab, onTabChange, notifications = {} }) {
  return (
    <>
      {/* Desktop Tabs - Inside the card */}
      <div className="hidden md:flex items-center justify-start gap-2 py-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const notificationCount = notifications[tab.id] || 0
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all cursor-pointer
                ${isActive
                  ? "bg-gray-700 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {/* Icon */}
              <Icon className="w-5 h-5" />

              {/* Label */}
              <span className="text-sm font-semibold">
                {tab.label}
              </span>

              {/* Notification badge */}
              {notificationCount > 0 && (
                <span className={`
                  w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                  ${isActive ? "bg-white text-gray-900" : "bg-primary-500 text-white"}
                `}>
                  {notificationCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

// Mobile Tab Navigation - Separate component to be rendered outside the card
function MobileTabNavigation({ activeTab, onTabChange, notifications = {} }) {
  return (
    <div className="md:hidden flex items-center gap-1.5 pl-1 pr-12 pt-1 pb-4 overflow-x-auto bg-transparent -mt-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        const notificationCount = notifications[tab.id] || 0
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full transition-all whitespace-nowrap flex-shrink-0 cursor-pointer
              ${isActive
                ? "bg-gray-700 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200"
              }
            `}
          >
            {/* Icon */}
            <Icon className="w-4 h-4" />

            {/* Label */}
            <span className="text-sm font-semibold">
              {tab.mobileLabel}
            </span>

            {/* Notification badge */}
            {notificationCount > 0 && (
              <span className={`
                w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center
                ${isActive ? "bg-white text-gray-900" : "bg-primary-500 text-white"}
              `}>
                {notificationCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Main DashboardTabs Component
export default function DashboardTabs({
  // Tab content - each is a React node
  journeyContent,
  myPlanContent,
  addContent,
  guestsContent,
  timelineContent,
  moreContent,

  // Notifications for tab badges (optional)
  notifications = {},

  // Default tab (optional)
  defaultTab = "journey",

  // Controlled tab state (optional) - allows parent to control active tab
  controlledActiveTab,
  onTabChange,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab)

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabChange = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
    setInternalActiveTab(tabId)
  }

  // Render the active tab's content
  const renderTabContent = () => {
    switch (activeTab) {
      case "journey":
        return journeyContent
      case "myplan":
        return myPlanContent
      case "add":
        return addContent
      case "guests":
        return guestsContent
      case "timeline":
        return timelineContent
      case "more":
        return moreContent
      default:
        return journeyContent
    }
  }

  return (
    <>
      {/* Mobile Tabs - Outside the card, in the gap */}
      <MobileTabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notifications={notifications}
      />

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl overflow-hidden md:mt-6">
        {/* Desktop Tab Navigation - Inside the card */}
        <div className="hidden md:block px-5 pt-5">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            notifications={notifications}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </>
  )
}

// Export individual components for flexibility
export { TabNavigation, MobileTabNavigation, TABS }
