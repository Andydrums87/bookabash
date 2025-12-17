"use client"

import Link from "next/link"
import { Suspense } from "react"
import { Calendar, Building2, Inbox, Settings, FileText } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { UserMenu } from "./UserMenu"
import { BusinessProvider } from "../../contexts/BusinessContext"
import BusinessPageWrapper from "./dashboard/components/BusinessPageWrapper"
import { DashboardSkeleton } from "./dashboard/components/DashboardSkeletons"
import { useSupplier } from '@/hooks/useSupplier'

// Airbnb-style horizontal navigation layout
function SupplierLayoutContent({ children }) {
  const { supplier, supplierData, currentBusiness } = useSupplier()
  const pathname = usePathname()

  // Main navigation items (Airbnb-style - horizontal)
  const mainNavItems = [
    { href: "/suppliers/dashboard", label: "Bookings" },
    { href: "/suppliers/invoices", label: "Invoices" },
    { href: "/suppliers/availability", label: "Calendar" },
    { href: "/suppliers/listings", label: "Listings" },
  ]

  // Secondary items for user dropdown (account-level settings only)
  const secondaryNavItems = [
    { href: "/suppliers/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Airbnb-style Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/suppliers/dashboard" className="flex-shrink-0">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                alt="PartySnap"
                width={120}
                height={28}
                className="h-7 md:h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center gap-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href === "/suppliers/dashboard" && pathname === "/suppliers/dashboard")
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Right side - Mode switch and User Menu */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Switch to travelling (like Airbnb) - could be "View as customer" */}
              <Link
                href="/"
                className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Switch to browsing
              </Link>

              {/* User Menu - handles profile/settings on both desktop and mobile */}
              <UserMenu secondaryNavItems={secondaryNavItems} />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Like Airbnb app */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around h-16 px-2">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              const icons = {
                "Bookings": Inbox,
                "Invoices": FileText,
                "Calendar": Calendar,
                "Listings": Building2,
              }
              const Icon = icons[item.label] || Inbox
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-2 ${
                    isActive ? "text-primary-500" : "text-gray-500"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? "text-primary-500" : "text-gray-400"}`} />
                  <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto">
          <BusinessPageWrapper requiresBusiness={true}>{children}</BusinessPageWrapper>
        </div>
      </main>
    </div>
  )
}

// MAIN LAYOUT COMPONENT - ONLY PROVIDES BUSINESS CONTEXT
export default function SupplierLayout({ children }) {
  return (
    <BusinessProvider>
      <Suspense fallback={<DashboardSkeleton />}>
        <SupplierLayoutContent>{children}</SupplierLayoutContent>
      </Suspense>
    </BusinessProvider>
  )
}