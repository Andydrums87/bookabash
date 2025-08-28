"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "./ui/badge"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, Star, MapPin, User, LogOut, Settings, Calendar,  ShoppingCart, CreditCard, ChevronDown, Mail, Gift, Users} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import MobileNav from "./mobile-nav"
import { useSuppliers } from '@/utils/mockBackend'
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
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {getUserInitials()}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
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

function CartIndicator({ className = "" }) {
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
    router.push('/payment/secure-party')
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

  const handleNavigation = async (item) => {
    setIsOpen(false)

    if (!user) {
      router.push('/signin')
      return
    }

    if (item.requiresPartyId) {
      if (!activePartyId) {
        router.push('/dashboard?action=new-party')
        return
      }

      let targetRoute
      switch (item.href) {
        case '/gift-registry':
          targetRoute = `/gift-registry/manage/${activePartyId}`
          break
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

  const dashboardItems = [
    { href: "/dashboard", label: "Party Dashboard", icon: Calendar, description: "Overview & planning" },
    { href: "/e-invites", label: "E-Invites", icon: Mail, description: "Digital invitations" },
    { 
      href: "/gift-registry", 
      label: "Gift Registry", 
      icon: Gift, 
      description: "Gift wishlists",
      requiresPartyId: true 
    },
    { 
      href: "/rsvps", 
      label: "RSVP Management", 
      icon: Users, 
      description: "Track responses",
      requiresPartyId: true 
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dashboard Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium transition-colors"
      >
        <span>My Snapboard</span>
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
            
            {dashboardItems.slice(1).map((item) => (
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const { suppliers } = useSuppliers()


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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

// Handle sign out
const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    
    // Clear party-related localStorage data
    localStorage.removeItem("party_details")
    localStorage.removeItem("user_party_plan")
    localStorage.removeItem("party_plan") // Add this one too
    sessionStorage.removeItem('replacementContext')
    sessionStorage.removeItem('shouldRestoreReplacementModal')
    sessionStorage.removeItem('modalShowUpgrade')
    
    setUser(null)
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const filtered = suppliers?.filter(supplier => 
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.location.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6) // Show 6 results
        
        setSearchResults(filtered || [])
        setIsSearching(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchQuery, suppliers])

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      // Focus the input when opening
      setTimeout(() => {
        document.getElementById('navbar-search-input')?.focus()
      }, 100)
    } else {
      // Clear search when closing
      setSearchQuery("")
      setSearchResults([])
    }
  }

  const handleSupplierClick = (supplierId) => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    router.push(`/supplier/${supplierId}`)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setSearchResults([])
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
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
            <Link href="/" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              Home
            </Link>
            <Link href="/browse" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              Snap Suppliers
            </Link>
             {/* Replace dashboard link with dropdown */}
             <DashboardDropdown />
            <Link href="/blog" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
            Snapspiration
            </Link>
            <Link href="/favorites" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
  My Favorites
</Link>
          </nav>

          {/* Right side - Search + CTA */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSearchToggle}
              className={`relative ${isSearchOpen ? 'bg-primary-100 text-primary-600' : ''}`}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              <span className="sr-only">
                {isSearchOpen ? 'Close search' : 'Open search'}
              </span>
            </Button>

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
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-primary-500 hover:bg-primary-600" asChild>
                    <Link href="/suppliers/onboarding">For Business</Link>
                    
                  </Button>
                  
                  
                </>
              )}
               {/* ADD CART INDICATOR HERE */}
  <CartIndicator />
            </div>

            {/* Mobile menu button */}
            <MobileNav user={user} onSignOut={handleSignOut} loading={loading} />
          </div>
        </div>
      </div>

      {/* Expanded Search Section */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isSearchOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 text-xs top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Search suppliers, categories, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 placeholder:text-sm"
                />
              </div>
            </form>

            {/* Search Results */}
            <div className="max-w-4xl mx-auto">
              {isSearching && (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  Searching suppliers...
                </div>
              )}

              {!isSearching && searchQuery.trim().length > 2 && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No suppliers found for "{searchQuery}"</p>
                  <p className="text-sm">Try searching for different keywords or browse all suppliers</p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Found {searchResults.length} suppliers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((supplier) => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSupplierClick(supplier.id)}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={supplier.image || "/placeholder.svg"}
                              alt={supplier.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate mb-1">
                              {supplier.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">{supplier.category}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{supplier.rating}</span>
                              </div>
                              <div className="text-sm font-medium text-primary-600">
                                £{supplier.priceFrom}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* View All Results */}
                  <div className="text-center mt-6">
                    <Button 
                      onClick={handleSearchSubmit}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      View all results for "{searchQuery}"
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Nav;


