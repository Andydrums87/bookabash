"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, Settings, LogOut, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function MobileNav({ user, onSignOut, loading }) {
  const [isOpen, setIsOpen] = useState(false)

  // Updated nav items to match desktop
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Snap Suppliers" },
    { href: "/dashboard", label: "My Snapboard" },
    { href: "/blog", label: "Snapspiration" },
    { href: "/favorites", label: "My Favorites" },
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

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || "U"
  }

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  }

 // In your mobile nav
const handleSignOut = () => {
  console.log("📱 Mobile handleSignOut called")
  closeMenu()
  onSignOut()
}

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden relative z-50 p-2 hover:bg-primary-50 transition-colors duration-200"
        onClick={toggleMenu}
      >
        {isOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden
          transform transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
            {/* Decorative elements */}
            <div className="absolute top-4 right-16 w-2 h-2 bg-primary-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-4 left-8 w-1 h-1 bg-primary-400 rounded-full opacity-80"></div>
            <Sparkles className="absolute top-6 left-6 w-4 h-4 text-primary-300 opacity-50" />

            <div className="flex items-center justify-between relative z-10">
              <Link href="/" onClick={closeMenu}>
                <div className="h-10 relative">
                  <Image
                    src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578876/Transparent_With_Text2_xtq8n5.png"
                    alt="BookABash"
                    width={150}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMenu}
                className="p-2 hover:bg-white/50 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Enhanced User Section */}
          {!loading && user && (
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    <img src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361706/xpqvbguxzwdbtxnez0ew.png" alt="" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-lg">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                      Party Planner
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Loading State */}
          {loading && (
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center px-4 py-4 text-lg font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                  onClick={closeMenu}
                >
                  <div className="w-2 h-2 bg-primary-400 rounded-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  {item.label}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                  </div>
                </Link>
              ))}

              {/* User-specific links (if signed in) */}
              {!loading && user && (
                <>
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="mb-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4">Your Account</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="group flex items-center px-4 py-4 text-lg font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                      onClick={closeMenu}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors duration-200">
                        <Calendar className="w-4 h-4 text-primary-600" />
                      </div>
                      My Party Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="group flex items-center px-4 py-4 text-lg font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                      onClick={closeMenu}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors duration-200">
                        <Settings className="w-4 h-4 text-primary-600" />
                      </div>
                      Account Settings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Enhanced Bottom Actions */}
          <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="space-y-3">
              {!loading && user ? (
                // Signed in user actions
                <>
                  <Button
                    className="w-full bg-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    asChild
                  >
                    <Link href="/dashboard" onClick={closeMenu}>
                      🎉 Start Planning
                    </Link>
                  </Button>

                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-105 bg-transparent"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : !loading ? (
                // Not signed in actions
                <>
                  <Button
                    className="w-full bg-primary-500 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    asChild
                  >
                    <Link href="/dashboard" onClick={closeMenu}>
                      🎉 Start Planning
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-105 bg-transparent"
                      asChild
                    >
                      <Link href="/signin" onClick={closeMenu}>
                        Sign In
                      </Link>
                    </Button>

                    <Button
                      className="bg-primary-400 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      asChild
                    >
                      <Link href="/suppliers/onboarding" onClick={closeMenu}>
                        For Business
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                // Loading state
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">🎈 Trusted by 10,000+ families</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
