"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Calendar, User, BookOpen, Mail, Gift, Users, ShoppingCart, Briefcase, PartyPopper, Settings } from "lucide-react"
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
    // If only one supplier, pass add_supplier params for better receipt/success messaging
    if (supplierCount === 1 && cartData.suppliers?.[0]) {
      const supplier = cartData.suppliers[0]
      const params = new URLSearchParams({
        party_id: currentPartyId,
        add_supplier: 'true',
        ...(supplier.name && { supplier_name: supplier.name }),
        ...(supplier.category && { supplier_category: supplier.category })
      })
      router.push(`/payment/secure-party?${params.toString()}`)
    } else {
      router.push(`/payment/secure-party?party_id=${currentPartyId}`)
    }
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
  const [activePartyId, setActivePartyId] = useState(null)
  const [loadingPartyData, setLoadingPartyData] = useState(false)
  const [isSupplier, setIsSupplier] = useState(false)
  const [hasDatabaseParties, setHasDatabaseParties] = useState(false)
  const router = useRouter()

// Check if user is a supplier
useEffect(() => {
  const checkSupplierStatus = async () => {
    if (!user) {
      setIsSupplier(false)
      return
    }

    // Get user ID - handle both formats (from prop or from user object)
    const userId = user.id || user.user_metadata?.sub
    if (!userId) return

    try {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('id')
        .eq('auth_user_id', userId)
        .eq('is_primary', true)
        .maybeSingle()

      if (!error && supplier) {
        setIsSupplier(true)
      } else {
        setIsSupplier(false)
      }
    } catch (error) {
      console.error('Error checking supplier status:', error)
    }
  }

  checkSupplierStatus()
}, [user])

// Check if user has any paid parties in database
useEffect(() => {
  const checkDatabaseParties = async () => {
    if (!user) {
      setHasDatabaseParties(false)
      return
    }

    const authUserId = user.id || user.user_metadata?.sub
    if (!authUserId) return

    try {
      // First, get the public user ID from auth_user_id
      const { data: publicUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle()

      if (publicUser) {
        const { data: parties, error } = await supabase
          .from('parties')
          .select('id')
          .eq('user_id', publicUser.id)
          .eq('payment_status', 'fully_paid')
          .limit(1)

        if (!error && parties && parties.length > 0) {
          setHasDatabaseParties(true)
        } else {
          setHasDatabaseParties(false)
        }
      } else {
        setHasDatabaseParties(false)
      }
    } catch (error) {
      console.error('Error checking database parties:', error)
    }
  }

  checkDatabaseParties()
}, [user])

// Load party data when component mounts or user changes
useEffect(() => {
  const loadPartyData = async () => {
    if (user && !isSupplier) {
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
}, [user, isSupplier])


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
      <div className="lg:hidden flex items-center space-x-2">
        {/* Cart Indicator - now handles its own click with party ID */}
        <MobileCartIndicator 
          onCartClick={closeMenu} 
          currentPartyId={currentPartyId || activePartyId} 
        />

        {/* Menu Button */}
        <button
          className="relative z-50 p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[250] lg:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-80 z-[300] lg:hidden
          transform transition-all duration-300 ease-out flex flex-col
          bg-[hsl(var(--primary-500))] shadow-xl
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Profile Section - lighter coral/peach for logo visibility */}
        <div className="flex-shrink-0 py-4 px-6 bg-[#fef7f7]">
          {!loading && user ? (
            <button
              onClick={() => {
                closeMenu()
                router.push("/profile")
              }}
              className="flex items-center gap-3 w-full hover:opacity-80 transition-colors duration-200"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-500 border-2 border-primary-400 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              {/* Name and role */}
              <div className="flex-1 text-left">
                <h2 className="text-base font-bold text-gray-900">{getUserDisplayName()}</h2>
                <p className="text-gray-600 text-xs flex items-center gap-1">
                  {isSupplier ? "Business Owner" : "Party Planner"}
                  <Settings className="w-3 h-3 ml-1" />
                </p>
              </div>
            </button>
          ) : (
            <div className="flex justify-center py-2">
              <img
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                alt="PartySnap"
                className="h-10 w-auto"
              />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-8 space-y-1 pt-6">
          <Link
            href="/"
            className="block py-3 text-white text-lg font-medium transition-colors duration-200 hover:text-white/80"
            onClick={closeMenu}
          >
            Home
          </Link>

          {isSupplier ? (
            /* Supplier: Direct link to Business Dashboard */
            <button
              onClick={() => {
                closeMenu()
                router.push("/suppliers/dashboard")
              }}
              className="flex items-center py-3 text-white text-lg font-medium transition-colors duration-200 hover:text-white/80 w-full"
            >
              <Briefcase className="w-5 h-5 mr-3" />
              Business Dashboard
            </button>
          ) : (
            /* Customer: Party Hub links */
            <>
              <Link
                href="/dashboard"
                className="block py-3 text-white text-lg font-medium transition-colors duration-200 hover:text-white/80"
                onClick={closeMenu}
              >
                Party Dashboard
              </Link>
              {hasDatabaseParties && (
                <button
                  onClick={() => {
                    closeMenu()
                    router.push("/dashboard?view=parties")
                  }}
                  className="block w-full text-left py-3 text-white text-lg font-medium transition-colors duration-200 hover:text-white/80"
                >
                  My Parties
                </button>
              )}
            </>
          )}

          <Link
            href="/blog"
            className="block py-3 text-white text-lg font-medium transition-colors duration-200 hover:text-white/80"
            onClick={closeMenu}
          >
            Blog
          </Link>

          {!user && (
            <div className="space-y-3 pt-6 border-t border-white/20 mt-4">
              <button
                onClick={() => {
                  closeMenu()
                  router.push("/signin")
                }}
                className="w-full py-3 px-4 bg-white rounded-lg text-primary-500 text-base font-semibold transition-all duration-200 hover:bg-white/90"
              >
                Sign In
              </button>

              <button
                onClick={() => {
                  closeMenu()
                  router.push("/suppliers/onboarding")
                }}
                className="w-full py-3 px-4 bg-white/20 border-2 border-white/30 text-white rounded-lg text-base font-semibold transition-all duration-200 hover:bg-white/30"
              >
                List Your Business
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 pb-6 px-8 border-t border-white/20">
          {user && (
            <button
              onClick={handleSignOut}
              className="block w-full text-left py-3 text-white/70 text-base font-medium transition-colors duration-200 hover:text-white mt-4"
            >
              Sign Out
            </button>
          )}

          {/* Close Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
