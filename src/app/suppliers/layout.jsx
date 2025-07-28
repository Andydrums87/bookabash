// Add to your supplier layout file

"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { LayoutDashboard, UserCircle, Settings, Package2, Menu, Search, Bell, Calendar, Camera, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { usePathname } from 'next/navigation'
import { UserMenu } from "./UserMenu"
import { BusinessProvider } from "../../contexts/BusinessContext"

// 👈 ADD THIS IMPORT
import CompactBusinessSwitcher from "./dashboard/components/MutliBusinessDashboard"

export default function SupplierLayout({ children }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  const navItems = [
    { href: "/suppliers/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/suppliers/profile", icon: UserCircle, label: "Profile" },
    { href: "/suppliers/availability", icon: Calendar, label: "Availability" },
    { href: "/suppliers/media", icon: Camera, label: "Media" },
    { href: "/suppliers/packages", icon: Package, label: "Packages" },
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
            className={`flex flex-col gap-2 ${isMobile ? 'mb-4' : 'mb-5'} rounded-2xl px-4 py-6 transition-all ${
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
    <BusinessProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid min-h-screen w-full md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] p-2 bg-primary-50">
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
              <div className="flex-1">
                <nav className="grid pt-5 items-start px-2 text-xs md:text-sm font-medium lg:px-4">
                  <NavItems />
                </nav>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 bg-muted/40 px-4 lg:h-[60px] lg:px-6">
  {/* Mobile Menu */}
  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
    <SheetTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className="shrink-0 md:hidden relative h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(-primary-600))] shadow-lg hover:shadow-xl transition-all duration-200 border-0"
      >
        <div className="flex flex-col gap-1">
          <div className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isSheetOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isSheetOpen ? 'opacity-0' : ''}`} />
          <div className={`h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${isSheetOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="flex flex-col bg-primary-50 border-r-0">
      {/* Mobile content stays the same */}
      <div className="flex items-center mb-6 pt-2">
        <Image 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png" 
          alt="PartySnap" 
          width={140} 
          height={30} 
          className="h-8 w-auto" 
        />
      </div>
      
      <nav className="flex-1 px-2">
    
        <NavItems isMobile onNavClick={handleNavClick} />
      </nav>

      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
          <div className="h-10 w-10 rounded-full bg-primary-400 flex items-center justify-center">
            <UserCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Andrew Joseph
            </p>
            <p className="text-xs text-gray-500 truncate">
              Supplier Account
            </p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>

  {/* Flex spacer to push content to center and right */}
  <div className="flex-1"></div>

  {/* Business Switcher - Centered with fixed width */}
  <div className="w-full">
  <CompactBusinessSwitcher />
</div>

  {/* Another flex spacer to balance */}
  <div className="flex-1"></div>

  {/* User Menu - Right aligned */}
  <div className="flex-shrink-0">
    <UserMenu />
  </div>
</header>

          

            {/* Main Content */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20  max-w-full overflow-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
              </div>
            </main>
          </div>
        </div>
      </Suspense>
    </BusinessProvider>
  )
}