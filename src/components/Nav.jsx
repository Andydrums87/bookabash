"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, Star, MapPin, User, LogOut, Settings, Calendar } from "lucide-react"
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
                alt="BookABash" 
                width={150} 
                height={32} 
                className="md:h-10 h-8 w-auto" 
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
            <Link href="/dashboard" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
              My Snapboard
            </Link>
            <Link href="/blog" className="text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium">
            Snapspiration
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
                    <Link href="/suppliers/onboarding">List with us</Link>
                  </Button>
                </>
              )}
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
                  className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 placeholder-text-xs"
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
//     <div className="relative z-50 dark:bg-[#2F2F2F]">
//       <nav className="container mx-auto px-4 py-6 flex items-center justify-between relative">
//       <div className="relative flex items-center " style={{ height: '16px' }}>
//   <Image
//     src="https://res.cloudinary.com/dghzq6xtd/image/upload/f_auto,q_auto/v1748440622/logo-darker_jhviti.png"
//     alt="BookABash Logo"
//     width={160} // Adjust as needed
//     height={160} // Maintain aspect ratio accordingly
//     priority
//     className="relative" // remove absolute, handled by next/image
//   />
// </div>

//         {/* Desktop Menu */}
        
//         <div className="hidden md:flex items-center space-x-6">
//         <Link href="/" className="text-[#707070] hover:text-[#FC6B57] transition-colors">Browse</Link>
//         <Link href="/how-it-works" className="text-[#707070] hover:text-[#FC6B57] transition-colors">How It Works</Link>
// <Link href="/blog" className="text-[#707070] hover:text-[#FC6B57] transition-colors">Blog</Link>
// <Link href="/login" className="text-[#707070] hover:text-[#FC6B57] transition-colors">Log In</Link>
// <Link href="/get-started" className="bg-[#FC6B57] text-white px-4 py-2 rounded-full hover:bg-[#e55c48] transition-colors">
//   Get Started
// </Link>

//         </div>

//         {/* Hamburger Button */}
//         <button onClick={toggleMenu} className="md:hidden text-[#3A3A3A] z-50 relative dark:text-white">
//           {menuOpen ? (
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           ) : (
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           )}
//         </button>
//       </nav>

//       {/* Mobile Dropdown Menu */}
//       <div
//         className={`fixed top-[72px] left-0 w-full bg-white shadow-lg rounded-b-lg z-40 py-4 px-6 md:hidden transition-all duration-300 ease-in-out transform ${
//           menuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-5 opacity-0 pointer-events-none'
//         }`}
//       >
//         <nav className="flex flex-col gap-10 py-2">

   
//          <Link href="/"  onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">Browse</Link>
//        <Link href="/how-it-works" onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">How It Works</Link>
// <Link href="/blog" onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">Blog</Link>
// <Link href="/login" onClick={closeMenu} className="text-[#707070] hover:text-[#FC6B57] transition-colors">Log In</Link>
// <Link href="/get-started" onClick={closeMenu} className="bg-[#FC6B57] text-white px-4 py-2 rounded-full hover:bg-[#e55c48] transition-colors">
//   Get Started
// </Link>
// </nav>
//       </div>
//     </div>

