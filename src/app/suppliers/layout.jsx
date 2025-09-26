"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Suspense, useState } from "react"
import { LayoutDashboard, UserCircle, Settings, Calendar, Camera, Package, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { UserMenu } from "./UserMenu"
import { BusinessProvider } from "../../contexts/BusinessContext"
import BusinessPageWrapper from "./dashboard/components/BusinessPageWrapper"
import { DashboardSkeleton } from "./dashboard/components/DashboardSkeletons"
import { ProfileCompletionBanner } from '@/components/ProfileCompletionBanner'
import { useSupplier } from '@/hooks/useSupplier'
import CompactBusinessSwitcher from "./dashboard/components/MutliBusinessDashboard"
import { supabase } from "@/lib/supabase"
import { useSupplierDashboard } from '@/utils/mockBackend' // Add this import
import { useBusiness } from '@/contexts/BusinessContext'
import { GoLiveTermsModal } from "./GoLiveTermsModal"

// CREATE THIS INNER COMPONENT THAT HAS ACCESS TO BUSINESS CONTEXT
function SupplierLayoutContent({ children }) {
  const { supplier, supplierData, currentBusiness } = useSupplier() // Now this has access to BusinessProvider
  const { currentSupplier } = useSupplierDashboard() // ADD THIS LINE
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showGoLiveModal, setShowGoLiveModal] = useState(false) // Add this line
  const { currentBusiness: businessContextBusiness } = useBusiness()



  // Replace the onGoLive function in your ProfileCompletionBanner with:
  const handleGoLiveClick = () => {
    setShowGoLiveModal(true)
  }

  const handleGoLiveSuccess = () => {
    alert('Congratulations! Your profile is now live!')
    window.location.reload()
  }

  const navItems = [
    { href: "/suppliers/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/suppliers/profile", icon: UserCircle, label: "Profile" },
    { href: "/suppliers/availability", icon: Calendar, label: "Availability" },
    { href: "/suppliers/media", icon: Camera, label: "Media" },
    { href: "/suppliers/packages", icon: Package, label: "Packages" },
    { href: "/suppliers/verification", icon: Shield, label: "Verification" },
    { href: "/suppliers/settings", icon: Settings, label: "Settings" },
  ]

  const pathname = usePathname()

  const handleNavClick = () => {
    setIsSheetOpen(false)
  }

  const NavItems = ({ isMobile = false, onNavClick }) => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavClick}
            className={`flex flex-col gap-2 ${isMobile ? "mb-4" : "mb-5"} rounded-2xl px-4 py-6 transition-all ${
              isActive
                ? "bg-primary-400 text-white"
                : "bg-[#fef7f7] text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <div className="rounded-lg">
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="grid min-h-screen md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:p-2 bg-primary-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
            <Image
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
              alt="PartySnap"
              width={150}
              height={32}
              className="md:h-10 h-8 w-auto"
            />
          </div>
          <div className="flex-1 max-w-screen overflow-x-hidden overflow-y-scroll">
            <nav className="grid pt-5 items-start px-2 text-xs md:text-sm min-h-screen font-medium lg:px-4 overflow-scroll">
              <NavItems />
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <header className="flex h-14 items-center bg-muted/40 lg:h-[60px] py-10 px-4 lg:px-6 gap-4">
          {/* Mobile Menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden relative h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(-primary-600))] shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                <div className="flex flex-col gap-1">
                  <div
                    className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isSheetOpen ? "rotate-45 translate-y-1.5" : ""}`}
                  />
                  <div
                    className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isSheetOpen ? "opacity-0" : ""}`}
                  />
                  <div
                    className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isSheetOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                  />
                </div>
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-primary-50 border-r-0">
              {/* Logo */}
              <div className="flex items-center mb-6 pt-2">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                  alt="PartySnap"
                  width={140}
                  height={30}
                  className="h-8 w-auto"
                />
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-2 max-w-screen overflow-scroll">
                <NavItems isMobile onNavClick={handleNavClick} />
              </nav>

              {/* User Info */}
              <div className="mt-auto p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-primary-400 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Andrew Joseph</p>
                    <p className="text-xs text-gray-500 truncate">Supplier Account</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex items-center justify-center md:justify-start min-w-0">
            <div className="w-[80%]">
              <CompactBusinessSwitcher />
            </div>
          </div>

          <div className="flex-shrink-0">
            <UserMenu />
          </div>
        </header>

        {/* Main Content - ADD PROFILE COMPLETION BANNER HERE */}
        <main className="flex flex-1 flex-col gap-4 lg:gap-6 lg:p-6 bg-muted/20 min-w-0 overflow-x-hidden">
          <div className="w-[95%] sm:w-full max-w-7xl mx-auto">
            
          {currentSupplier && currentBusiness && (
              <ProfileCompletionBanner
                supplierData={{
                  ...currentSupplier,
                  profile_status: currentSupplier.profile_status || currentSupplier.profileStatus,
                  can_go_live: currentSupplier.can_go_live || currentSupplier.canGoLive,
                  profile_completion_percentage: currentSupplier.profile_completion_percentage || currentSupplier.profileCompletionPercentage
                }}
                businessType={currentBusiness?.serviceType || currentBusiness?.business_type || currentSupplier?.serviceType}
                isPrimary={currentBusiness?.isPrimary || currentBusiness?.is_primary || false}
                businessName={currentBusiness?.name || currentSupplier?.name}
                onNavigate={(path) => window.location.href = path}
                onGoLive={handleGoLiveClick} // Updated to show modal instead
 
              />
            )}
            <BusinessPageWrapper requiresBusiness={true}>{children}</BusinessPageWrapper>
          </div>
        </main>

        {/* Add the Go Live Terms Modal */}
        <GoLiveTermsModal
          isOpen={showGoLiveModal}
          onClose={() => setShowGoLiveModal(false)}
          onSuccess={handleGoLiveSuccess}
          supplierData={currentSupplier}
          businessId={businessContextBusiness?.id}
        />
      </div>
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