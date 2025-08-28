"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Calendar, Settings, LogOut, Home, Search, Heart, BookOpen, Star, Mail, ChevronRight, Gift, Users, ShoppingCart } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Cart Indicator Component for Mobile
function MobileCartIndicator({ className = "", onCartClick }) {
  const [cartData, setCartData] = useState({ suppliers: [], totalDeposit: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updateCartFromStorage = () => {
      try {
        const storedCart = sessionStorage.getItem('cartData')
        if (storedCart) {
          const parsed = JSON.parse(storedCart)
          if (Date.now() - parsed.timestamp < 30000) {
            setCartData(parsed)
          } else {
            setCartData({ suppliers: [], totalDeposit: 0 })
          }
        }
      } catch (error) {
        console.error('Error reading cart data:', error)
      }
    }

    updateCartFromStorage()
    const interval = setInterval(updateCartFromStorage, 3000)
    return () => clearInterval(interval)
  }, [isClient])

  const supplierCount = cartData.suppliers?.length || 0
  
  if (supplierCount === 0) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={onCartClick}
      className={`relative flex items-center gap-2 h-10 px-3 border-none transition-all hover:shadow-md ${className}`}
    >
      <div className="relative">
        <ShoppingCart className="w-4 h-4" />
        <Badge className="absolute -top-4 -right-4 h-5 min-w-5 text-xs bg-primary-500 text-white border-white px-1">
          {supplierCount}
        </Badge>
      </div>
      <span className="text-xs font-medium">£{cartData.totalDeposit.toFixed(2)}</span>
    </Button>
  )
}

export default function MobileNav({ user, onSignOut, loading }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dashboardExpanded, setDashboardExpanded] = useState(false)
  const router = useRouter()

  // Reordered nav items - dashboard after browse
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Snap Suppliers", icon: Search },
    // Dashboard will be inserted here as expandable
    { href: "/blog", label: "Snapspiration", icon: BookOpen },
    { href: "/favorites", label: "My Favorites", icon: Heart },
  ]

  const dashboardItems = [
    { href: "/dashboard", label: "Party Dashboard", icon: Calendar, description: "Overview & planning" },
    { href: "/e-invites", label: "E-Invites", icon: Mail, description: "Digital invitations" },
    { href: "/gift-registry/manage", label: "Gift Registry", icon: Gift, description: "Gift wishlists" },
    { href: "/rsvps", label: "RSVP Management", icon: Users, description: "Track responses" },
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      setDashboardExpanded(false) // Reset dashboard when closing
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setDashboardExpanded(false)
  }

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  }

  const handleSignOut = () => {
    console.log("📱 Mobile handleSignOut called")
    closeMenu()
    onSignOut()
  }

  const handleCartClick = () => {
    closeMenu()
    router.push('/payment/secure-party')
  }

  return (
    <>
      {/* Mobile Header with Menu Button and Cart */}
      <div className="md:hidden flex items-center space-x-2">
        {/* Cart Indicator */}
        <MobileCartIndicator onCartClick={handleCartClick} />
        
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative z-50 p-2 hover:bg-gray-100 transition-colors duration-200"
          onClick={toggleMenu}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-lg z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden
          transform transition-all duration-300 ease-out flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          {!loading && user ? (
            <div className="px-0 py-2">
              <h2 className="text-2xl font-normal text-gray-900">
                Hello, <span className="text-primary-500">{getUserDisplayName()}</span>
              </h2>
            </div>
          ) : (
            <div className="">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                alt="PartySnap"
                width={120}
                height={32}
                className="h-auto w-auto object-contain"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={closeMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5 text-primary-500 hover:text-[hsl(var(--primary-500))]" />
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-8 flex-shrink-0">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        )}

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="px-6">
            <div className="space-y-2 mt-2 pb-6">
              {/* Home */}
              {(() => {
                const HomeIcon = navItems[0].icon;
                return (
                  <Link
                    href={navItems[0].href}
                    className="flex items-center py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200 border-b border-gray-50"
                    onClick={closeMenu}
                  >
                    <HomeIcon className="w-6 h-6 mr-4 text-gray-600 hover:text-[hsl(var(--primary-500))]" />
                    <span className="text-md">{navItems[0].label}</span>
                  </Link>
                );
              })()}

              {/* Snap Suppliers */}
              {(() => {
                const SearchIcon = navItems[1].icon;
                return (
                  <Link
                    href={navItems[1].href}
                    className="flex items-center py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200 border-b border-gray-50"
                    onClick={closeMenu}
                  >
                    <SearchIcon className="w-6 h-6 mr-4 text-gray-600 hover:text-[hsl(var(--primary-500))]" />
                    <span className="text-md">{navItems[1].label}</span>
                  </Link>
                );
              })()}

              {/* Dashboard - Expandable (now positioned after Snap Suppliers) */}
              <div className="border-b border-gray-50">
                <button
                  onClick={() => setDashboardExpanded(!dashboardExpanded)}
                  className="flex items-center justify-between w-full py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 mr-4 text-gray-600" />
                    <span className="text-md">My Snapboard</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${dashboardExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Dashboard Sub-items with auto height */}
                <div className={`overflow-hidden transition-all duration-300 ease-out ${
                  dashboardExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pl-10 pb-2 space-y-1">
                    {dashboardItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center py-3 text-gray-700 hover:text-[hsl(var(--primary-500))] transition-colors duration-200"
                        onClick={closeMenu}
                      >
                        <item.icon className="w-4 h-4 mr-3 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Remaining nav items (Snapspiration and My Favorites) */}
              {(() => {
                const BookIcon = navItems[2].icon;
                return (
                  <Link
                    href={navItems[2].href}
                    className="flex items-center py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200 border-b border-gray-50"
                    onClick={closeMenu}
                  >
                    <BookIcon className="w-6 h-6 mr-4 text-gray-600 hover:text-[hsl(var(--primary-500))]" />
                    <span className="text-md">{navItems[2].label}</span>
                  </Link>
                );
              })()}

              {(() => {
                const HeartIcon = navItems[3].icon;
                return (
                  <Link
                    href={navItems[3].href}
                    className="flex items-center py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200 border-b border-gray-50"
                    onClick={closeMenu}
                  >
                    <HeartIcon className="w-6 h-6 mr-4 text-gray-600 hover:text-[hsl(var(--primary-500))]" />
                    <span className="text-md">{navItems[3].label}</span>
                  </Link>
                );
              })()}

              {/* Featured Action */}
              <Link
                href="/dashboard"
                className="flex items-center py-4 text-red-500 hover:text-red-600 transition-colors duration-200 border-b border-gray-50"
                onClick={closeMenu}
              >
                <Star className="w-6 h-6 mr-4 text-red-500" />
                <span className="text-lg font-normal">Start Planning</span>
              </Link>

              {/* Extra spacing to ensure scroll reaches bottom */}
              <div className="h-4"></div>
            </div>
          </nav>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-white">
          {!loading && user ? (
            <Button
              onClick={handleSignOut}
              className="w-full bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white py-3 text-base rounded-full transition-all duration-200"
            >
              LOG OUT
            </Button>
          ) : !loading ? (
            <div className="space-y-3">
              <Button
                className="w-full bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white font-normal py-3 text-base rounded-full transition-all duration-200"
                asChild
              >
                <Link href="/signin" onClick={closeMenu}>
                  Sign In
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full border-[hsl(var(--primary-500))] text-gray-900 hover:bg-gray-50 font-normal py-3 text-base rounded-full transition-all duration-200"
                asChild
              >
                <Link href="/suppliers/onboarding" onClick={closeMenu}>
                  Business Sign Up
                </Link>
              </Button>
            </div>
          ) : (
            <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
          )}

          {/* App Info */}
          <div className="mt-6 text-center w-full flex justify-center">
            <Link href="/" onClick={closeMenu}>
              <div className="h-8 relative">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                  alt="PartySnap"
                  width={120}
                  height={32}
                  className="h-auto w-auto object-contain"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}