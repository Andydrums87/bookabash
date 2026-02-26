"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "./ui/badge"
import { Star, User, LogOut, Settings, Calendar, ShoppingCart, ChevronDown, Mail, Gift, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import MobileNav from "./mobile-nav"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'



// User Menu Component
function UserMenu({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 bg-white text-primary-500 rounded-full flex items-center justify-center text-sm font-semibold">
          {getUserInitials()}
        </div>
        <span className="hidden md:block text-sm font-medium text-white">
          {getUserDisplayName()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-fit right-0 mt-2  bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                {getUserInitials()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link 
              href="/dashboard" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="w-4 h-4 mr-3" />
              My Party Dashboard
            </Link>
            
            <Link 
              href="/profile" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Account Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-2">
            <button 
              onClick={() => {
                setIsOpen(false)
                onSignOut()
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CartIndicator({ className = "", partyId }) {
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

  const handlePaymentClick = () => {
    // If only one supplier, pass add_supplier params for better receipt/success messaging
    if (supplierCount === 1 && cartData.suppliers?.[0]) {
      const supplier = cartData.suppliers[0]
      const params = new URLSearchParams({
        party_id: partyId,
        add_supplier: 'true',
        ...(supplier.name && { supplier_name: supplier.name }),
        ...(supplier.category && { supplier_category: supplier.category })
      })
      router.push(`/payment/secure-party?${params.toString()}`)
    } else {
      router.push(`/payment/secure-party?party_id=${partyId}`)
    }
  }

  return (
    <Button
    variant="outline"
    onClick={handlePaymentClick}
    className={`relative flex items-center gap-2 h-10 px-3 border-none  transition-all hover:shadow-md ${className}`}
  >
    <div className="relative">
      <ShoppingCart className="w-4 h-4" />
      <Badge className="absolute -top-4 -right-4 h-5 min-w-5 text-xs bg-primary-500 text-white border-white px-1">
        {supplierCount}
      </Badge>
    </div>
    
  
    
    <div className="sm:hidden">
      <span className="text-xs font-medium">£{cartData.totalDeposit.toFixed(2)}</span>
    </div>
  </Button>
  )
}

function DashboardDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [activePartyId, setActivePartyId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const dropdownRef = useRef(null)

  // Load user and party data when dropdown opens
  useEffect(() => {
    if (isOpen && !activePartyId) {
      loadPartyData()
    }
  }, [isOpen])

  const loadPartyData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const result = await partyDatabaseBackend.getCurrentParty()
        if (result.success && result.party) {
          setActivePartyId(result.party.id)
        }
      }
    } catch (error) {
      console.error('Error loading party data:', error)
    } finally {
      setLoading(false)
    }
  }

  const dashboardItems = [
    { href: "/dashboard", label: "Party Dashboard", icon: Calendar, description: "Overview & planning" },
    { href: "/e-invites", label: "E-Invites", icon: Mail, description: "Digital invitations" },
    { 
      href: "/rsvps", 
      label: "RSVP Management", 
      icon: Users, 
      description: "Track responses",
      requiresPartyId: true 
    },
  ]

// Replace the handleNavigation function in DashboardDropdown with this:
const handleNavigation = async (item) => {
  setIsOpen(false)

  // Helper function to check if user has localStorage party data
  const hasLocalStorageParty = () => {
    try {
      const userPartyPlan = localStorage.getItem('user_party_plan')
      const partyDetails = localStorage.getItem('party_details')
      
      if (userPartyPlan) {
        const parsedPlan = JSON.parse(userPartyPlan)
        const hasValidPlan = parsedPlan && Object.keys(parsedPlan).some(key => 
          parsedPlan[key] && 
          typeof parsedPlan[key] === 'object' && 
          parsedPlan[key].name
        )
        if (hasValidPlan) return true
      }
      
      if (partyDetails) {
        const parsedDetails = JSON.parse(partyDetails)
        const hasValidDetails = parsedDetails && (
          parsedDetails.theme || 
          parsedDetails.date || 
          (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
          parsedDetails.guestCount ||
          parsedDetails.postcode
        )
        if (hasValidDetails) return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking localStorage party data:', error)
      return false
    }
  }

  // ✅ ALWAYS allow dashboard access - no auth required
  if (item.href === '/dashboard') {
    router.push(item.href)
    return
  }

  // ✅ Check for localStorage party data
  const hasLocalParty = hasLocalStorageParty()

  // Handle items that require authentication (like E-Invites, RSVPs, Gift Registry)
  if (!user && !hasLocalParty) {
    // No user AND no localStorage party - redirect to sign in
    router.push('/signin')
    return
  }

  // Handle items that require a party ID (like RSVPs)
  if (item.requiresPartyId) {
    if (!activePartyId && !hasLocalParty) {
      router.push('/dashboard?action=new-party')
      return
    }

    let targetRoute
    switch (item.href) {
      case '/rsvps':
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
    <div className="relative" ref={dropdownRef}>
      {/* Dashboard Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center cursor-pointer space-x-1 text-white hover:text-white/80 px-3 py-2 text-md font-medium transition-colors"
      >
        <span>Party Hub</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Main Dashboard */}
          <button 
            onClick={() => handleNavigation({ href: "/dashboard" })}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
          >
            <Calendar className="w-4 h-4 mr-3 text-gray-500" />
            <div className="text-left">
              <div className="font-medium">Party Dashboard</div>
              <div className="text-xs text-gray-500">Overview & planning</div>
            </div>
          </button>

          {/* Party Tools Section */}
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Party Tools
            </div>
            
            {/* E-Invites */}
            {dashboardItems.slice(1, 2).map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item)}
                disabled={loading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <item.icon className="w-4 h-4 mr-3 text-gray-500" />
                <div className="text-left">
                  <div>{item.label}</div>
                </div>
              </button>
            ))}

            {/* Gift Registry - Simple Navigation */}
            <button
              onClick={() => {
                setIsOpen(false)
                if (!user) {
                  router.push('/signin')
                } else {
                  router.push('/gift-registry')
                }
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Gift className="w-4 h-4 mr-3 text-gray-500" />
              <div className="text-left">
                <div>Gift Registry</div>
                <div className="text-xs text-gray-500">Manage gift wishlists</div>
              </div>
            </button>

            {/* RSVP Management */}
            {dashboardItems.slice(2).map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item)}
                disabled={loading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <item.icon className="w-4 h-4 mr-3 text-gray-500" />
                <div className="text-left">
                  <div>{item.label}</div>
                  {item.requiresPartyId && !activePartyId && !loading && (
                    <div className="text-xs text-orange-500">Requires active party</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="border-t border-gray-100 py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quick Actions
            </div>
            
            <button 
              onClick={() => handleNavigation({ href: "/dashboard?action=new-party" })}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Star className="w-4 h-4 mr-3 text-gray-500" />
              <span>Start New Party</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Navbar Component
export function Nav() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [currentPartyId, setCurrentPartyId] = useState(null);
  
  useEffect(() => {
    const loadPartyId = async () => {
      if (user) {
        const result = await partyDatabaseBackend.getCurrentParty();
        if (result.success && result.party) {
          setCurrentPartyId(result.party.id);
        }
      }
    };
    loadPartyId();
  }, [user]);


  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!error && user) {
          setUser(user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('🔐 User signed in:', session?.user?.email)

        // Check if user is in the middle of booking flow
        const currentPath = window.location.pathname
        const isInBookingFlow = currentPath.includes('/review-book') ||
                                currentPath.includes('/payment') ||
                                currentPath.includes('/party-builder')

        if (isInBookingFlow) {
          console.log('🛡️ User is in booking flow - preserving party data')
          setUser(session?.user || null)
          // Don't clear anything, let the booking flow complete
          return
        }

        console.log('🧹 Clearing ALL cached party data...')

        // AGGRESSIVE: Clear ALL sessionStorage except Supabase auth
        const sessionKeys = Object.keys(sessionStorage)
        console.log('📦 SessionStorage keys before clear:', sessionKeys)
        sessionKeys.forEach(key => {
          if (!key.startsWith('sb-')) {
            sessionStorage.removeItem(key)
            console.log('🗑️ Removed sessionStorage key:', key)
          }
        })

        // Clear any cached party data from previous user (localStorage)
        const partyKeys = ['selectedPartyId', 'currentPartyId', 'party_details', 'user_party_plan', 'party_plan']
        partyKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            console.log('🗑️ Removing localStorage key:', key)
            localStorage.removeItem(key)
          }
        })

        // Store a flag to indicate fresh sign-in
        sessionStorage.setItem('justSignedIn', 'true')

        setUser(session?.user || null)

        // Only force reload if already on dashboard/party pages
        // This prevents interrupting the sign-in redirect flow
        if (currentPath.includes('/dashboard') ||
            currentPath.includes('/e-invites') ||
            currentPath.includes('/rsvps')) {
          console.log('🔄 On party page - forcing reload to clear cached state')
          setTimeout(() => {
            window.location.reload()
          }, 100)
        } else {
          console.log('✅ Not on party page - no reload needed, redirect will handle it')
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔓 User signed out')
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

// Handle sign out
const handleSignOut = async () => {
  try {
    // Sign out with scope: 'local' to clear only this browser tab
    await supabase.auth.signOut({ scope: 'local' })

    // Clear ALL party-related localStorage data
    localStorage.removeItem("party_details")
    localStorage.removeItem("user_party_plan")
    localStorage.removeItem("party_plan")
    localStorage.removeItem("selectedPartyId") // Critical: clear selected party
    localStorage.removeItem("currentPartyId")

    // Clear session storage
    sessionStorage.removeItem('replacementContext')
    sessionStorage.removeItem('shouldRestoreReplacementModal')
    sessionStorage.removeItem('modalShowUpgrade')
    sessionStorage.removeItem('party_data_cache')  // Clear party cache (correct key!)
    sessionStorage.removeItem('party_plan_cache') // Clear party plan cache

    // Clear all Supabase auth storage keys
    const authKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('sb-') || key.includes('supabase')
    )
    authKeys.forEach(key => localStorage.removeItem(key))

    setUser(null)

    // Force a hard reload to clear any cached state
    window.location.href = '/'
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

  return (
    <header className="bg-[hsl(var(--primary-500))] sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-27">
        <div className="flex justify-between items-center h-15 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image 
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png" 
                alt="PartySnap" 
                width={150} 
                height={32} 
                className="h-auto w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-white hover:text-white/80 px-3 py-2 text-md font-medium">
              Home
            </Link>
             {/* Replace dashboard link with dropdown */}
             <DashboardDropdown />
            <Link href="/blog" className="text-white hover:text-white/80 px-3 py-2 text-md font-medium">
              Blog
            </Link>
          </nav>

          {/* Right side - CTAs */}
          <div className="flex items-center space-x-4">
            {/* Desktop CTAs or User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {loading ? (
                // Loading state
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                // Signed in - show user menu
                <UserMenu user={user} onSignOut={handleSignOut} />
                
              ) : (
                // Not signed in - show sign in/up buttons
                <>
                  <Button variant="outline" size="sm" className="bg-white text-primary-500 border-white hover:bg-white/90" asChild>
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-white/20 text-white border border-white/30 hover:bg-white/30" asChild>
                    <Link href="/suppliers/onboarding">For Business</Link>
                  </Button>
                </>

              )}
               {/* ADD CART INDICATOR HERE */}
               <CartIndicator partyId={currentPartyId} />
            </div>

            {/* Mobile menu button */}
            <MobileNav user={user} onSignOut={handleSignOut} loading={loading} currentPartyId={currentPartyId}  />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Nav;


