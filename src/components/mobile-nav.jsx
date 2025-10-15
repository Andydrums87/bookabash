"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Calendar, User, Home, Search, Heart, BookOpen, Mail, Gift, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

// Cart Indicator Component for Mobile - FIXED to use prop
function MobileCartIndicator({ className = "", onCartClick, currentPartyId }) {
  const [cartData, setCartData] = useState({ suppliers: [], totalDeposit: 0 })
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const updateCartFromStorage = () => {
      try {
        const storedCart = sessionStorage.getItem("cartData")
        if (storedCart) {
          const parsed = JSON.parse(storedCart)
          if (Date.now() - parsed.timestamp < 30000) {
            setCartData(parsed)
          } else {
            setCartData({ suppliers: [], totalDeposit: 0 })
          }
        }
      } catch (error) {
        console.error("Error reading cart data:", error)
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

  const handleCartClick = () => {
    console.log('🛒 Mobile cart clicked, partyId:', currentPartyId)
    
    if (!currentPartyId) {
      console.warn('⚠️ No party ID available, redirecting to dashboard')
      router.push("/dashboard")
      onCartClick()
      return
    }
    
    console.log('✅ Navigating to payment with party ID:', currentPartyId)
    router.push(`/payment/secure-party?party_id=${currentPartyId}`)
    onCartClick()
  }

  return (
    <Button
      variant="outline"
      onClick={handleCartClick}
      className={`relative flex items-center gap-2 h-10 px-3 border-none transition-all hover:shadow-md ${className}`}
    >
      <div className="relative">
        <ShoppingCart className="w-4 h-4" />
        <Badge className="absolute -top-4 -right-4 h-5 min-w-5 text-xs bg-primary-500 text-white border-white px-1">
          {supplierCount}
        </Badge>
      </div>
    </Button>
  )
}

export default function MobileNav({ user, onSignOut, loading, currentPartyId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dashboardExpanded, setDashboardExpanded] = useState(false)
  const [activePartyId, setActivePartyId] = useState(null)
  const [loadingPartyData, setLoadingPartyData] = useState(false)
  const router = useRouter()

// Load party data when component mounts or user changes
useEffect(() => {
  const loadPartyData = async () => {
    if (user) {
      try {
        setLoadingPartyData(true)
        const result = await partyDatabaseBackend.getCurrentParty()
        if (result.success && result.party) {
          setActivePartyId(result.party.id)
        }
      } catch (error) {
        console.error("Error loading party data:", error)
      } finally {
        setLoadingPartyData(false)
      }
    } else {
      setActivePartyId(null)
    }
  }

  loadPartyData()
}, [user])


  // Add this function inside MobileNav component
  const hasLocalStorageParty = () => {
    try {
      const userPartyPlan = localStorage.getItem("user_party_plan")
      const partyDetails = localStorage.getItem("party_details")

      if (userPartyPlan) {
        const parsedPlan = JSON.parse(userPartyPlan)
        const hasValidPlan =
          parsedPlan &&
          Object.keys(parsedPlan).some(
            (key) => parsedPlan[key] && typeof parsedPlan[key] === "object" && parsedPlan[key].name,
          )
        if (hasValidPlan) return true
      }

      if (partyDetails) {
        const parsedDetails = JSON.parse(partyDetails)
        const hasValidDetails =
          parsedDetails &&
          (parsedDetails.theme ||
            parsedDetails.date ||
            (parsedDetails.childName && parsedDetails.childName !== "Emma") ||
            parsedDetails.guestCount ||
            parsedDetails.postcode)
        if (hasValidDetails) return true
      }

      return false
    } catch (error) {
      console.error("Error checking localStorage party data:", error)
      return false
    }
  }

  // Basic nav items
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Snap Suppliers", icon: Search },
    // Dashboard will be inserted here as expandable
    { href: "/blog", label: "Snapspiration", icon: BookOpen },
    { href: "/favorites", label: "My Favorites", icon: Heart },
  ]

  // Dashboard items with same logic as desktop
  const dashboardItems = [
    { href: "/dashboard", label: "Party Dashboard", icon: Calendar, description: "Overview & planning" },
    { href: "/e-invites", label: "E-Invites", icon: Mail, description: "Digital invitations" },
    {
      href: "/gift-registry",
      label: "Gift Registry",
      icon: Gift,
      description: "Manage gift wishlists",
      simpleNavigation: true, // Special flag for gift registry
    },
    {
      href: "/rsvps",
      label: "RSVP Management",
      icon: Users,
      description: "Track responses",
      requiresPartyId: true,
    },
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
    console.log("Mobile handleSignOut called")
    closeMenu()
    onSignOut()
  }

  // Handle dashboard item navigation with same logic as desktop
  const handleDashboardNavigation = async (item) => {
    closeMenu()

      // ✅ ALWAYS allow dashboard access - no auth required
  if (item.href === '/dashboard') {
    router.push(item.href)
    return
  }
  const hasLocalParty = hasLocalStorageParty()

  if (!user && !hasLocalParty) {
    router.push("/signin")
    return
  }
    // Special handling for gift registry (simple navigation)
    if (item.simpleNavigation) {
      router.push(item.href)
      return
    }

    if (item.requiresPartyId) {
      if (!activePartyId) {
        router.push("/dashboard?action=new-party")
        return
      }

      let targetRoute
      switch (item.href) {
        case "/rsvps":
          targetRoute = `/rsvps/${activePartyId}`
          break
        default:
          targetRoute = item.href
      }

      router.push(targetRoute)
    } else {
      router.push(item.href)
    }
  }

  return (
    <>
      {/* Mobile Header with Menu Button and Cart */}
      <div className="md:hidden flex items-center space-x-2">
        {/* Cart Indicator - now handles its own click with party ID */}
        <MobileCartIndicator 
          onCartClick={closeMenu} 
          currentPartyId={currentPartyId || activePartyId} 
        />

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative z-50 p-2 hover:bg-gray-100 transition-colors duration-200"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[250] md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-80 z-[300] md:hidden
          transform transition-all duration-300 ease-out flex flex-col
          bg-primary-500
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Profile Section */}
        <div className="flex-shrink-0 pt-8 pb-4 px-8 text-center">
          {!loading && user ? (
            <>
              {/* Profile Avatar - clickable for account settings */}
              <button
                onClick={() => {
                  closeMenu()
                  router.push("/profile")
                }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mx-auto mb-2 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              >
                <User className="w-5 h-5 text-white" />
              </button>

              {/* User Name - also clickable for account settings */}
              <button
                onClick={() => {
                  closeMenu()
                  router.push("/profile")
                }}
                className="block w-full hover:text-white/80 transition-colors duration-200"
              >
                <h2 className="text-lg font-bold text-white mb-1">{getUserDisplayName()}</h2>
                <p className="text-white/80 text-xs">Party Planner • Tap for settings</p>
              </button>
            </>
          ) : (
            <>
              {/* PartySnap Logo for non-authenticated users */}
              <div className="bg-white rounded-full p-2">
                {/* <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                  alt="PartySnap"
                  width={100}
                  height={100}
                  className="object-cover h-auto w-auto"
                /> */}
                <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png" alt="" />
              

              </div>

              {/* <h2 className="text-xl font-bold text-white mb-1">Welcome to PartySnap</h2> */}
              {/* <p className="text-white/80 text-xs">Start planning your perfect party</p> */}
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-8 space-y-5">
          <Link
            href="/"
            className="block py-2 text-white text-lg font-light transition-colors duration-200 hover:text-white/80"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            href="/browse"
            className="block py-2 text-white text-lg font-light transition-colors duration-200 hover:text-white/80"
            onClick={closeMenu}
          >
            Snap Suppliers
          </Link>

          <div className="space-y-3">
            <button
              onClick={() => setDashboardExpanded(!dashboardExpanded)}
              className="flex items-center justify-between w-full py-2 text-white text-lg font-light transition-colors duration-200 hover:text-white/80"
            >
              <span>My Snapboard</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dashboardExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dashboardExpanded && (
              <div className="pl-4 space-y-3">
                {dashboardItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleDashboardNavigation(item)}
                    className="block w-full text-left py-1 text-white/80 hover:text-white text-base font-light transition-colors duration-200"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className="block py-2 text-white text-lg font-light transition-colors duration-200 hover:text-white/80"
            onClick={closeMenu}
          >
            Snapspiration
          </Link>

          <Link
            href="/favorites"
            className="block py-2 text-white text-lg font-light transition-colors duration-200 hover:text-white/80"
            onClick={closeMenu}
          >
            My Favorites
          </Link>

          {!user && (
            <>
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    closeMenu()
                    router.push("/signin")
                  }}
                  className="w-full py-3 px-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-base font-medium transition-all duration-200 hover:bg-white/30 hover:scale-105"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    closeMenu()
                    router.push("/suppliers/onboarding")
                  }}
                  className="w-full py-3 px-4 bg-white text-primary-500 rounded-lg text-base font-medium transition-all duration-200 hover:bg-white/90 hover:scale-105"
                >
                  Business Sign Up
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 pb-4 px-8">
          {user && (
            <button
              onClick={handleSignOut}
              className="block w-full text-left py-2 text-white text-lg font-light transition-colors duration-200 hover:text-white/80 mb-4"
            >
              Sign Out
            </button>
          )}

          {/* Close Button */}
          <div className="flex justify-center">
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
