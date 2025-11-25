"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { Calendar, Building2, Inbox, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const pathname = usePathname()

  // Main navigation items (Airbnb-style - horizontal)
  const mainNavItems = [
    { href: "/suppliers/dashboard", label: "Bookings" },
    { href: "/suppliers/availability", label: "Calendar" },
    { href: "/suppliers/listings", label: "Listings" },
  ]

  // Secondary items for user dropdown (account-level settings only)
  const secondaryNavItems = [
    { href: "/suppliers/settings", icon: Settings, label: "Settings" },
  ]

  const handleNavClick = () => {
    setIsSheetOpen(false)
  }

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

              {/* User Menu */}
              <UserMenu secondaryNavItems={secondaryNavItems} />

              {/* Mobile Menu Button */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-10 w-10 rounded-full border border-gray-200"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 bg-white p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Nav Header */}
                    <div className="p-4 border-b">
                      <Image
                        src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                        alt="PartySnap"
                        width={100}
                        height={24}
                        className="h-6 w-auto"
                      />
                    </div>

                    {/* Main Navigation */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Main</p>
                        {mainNavItems.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={handleNavClick}
                              className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                                isActive
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>

                      <div className="p-4 space-y-1 border-t">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Manage</p>
                        {secondaryNavItems.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={handleNavClick}
                              className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                                isActive
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <item.icon className="h-5 w-5 text-gray-500" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>

                    {/* Mobile Nav Footer */}
                    <div className="p-4 border-t bg-gray-50">
                      <Link
                        href="/"
                        onClick={handleNavClick}
                        className="block w-full text-center py-3 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Switch to browsing
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
      <Suspense fallback={
        <div className="min-h-screen bg-primary-50">
          <div className="grid min-h-screen md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:p-2 bg-primary-50">
            <div className="hidden md:block bg-muted/40">
              {/* Sidebar skeleton */}
            </div>
            <div className="flex flex-col">
              {/* Header skeleton */}
              <DashboardSkeleton />
            </div>
          </div>
        </div>
      }>
        <SupplierLayoutContent>{children}</SupplierLayoutContent>
      </Suspense>
    </BusinessProvider>
  )
}