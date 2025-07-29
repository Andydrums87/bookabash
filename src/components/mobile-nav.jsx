"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function MobileNav({ user, onSignOut, loading }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse Suppliers" },
    { href: "/dashboard", label: "My Events" },
    { href: "/help", label: "Help" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/suppliers/onboarding", label: "List with us", highlight: true },
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

  const handleSignOut = () => {
    closeMenu()
    onSignOut()
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="md:hidden relative z-50" onClick={toggleMenu}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu} />}

      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/" onClick={closeMenu}>
              <div className="h-8 relative">
                <Image src="/logo-darker.png" alt="BookABash" width={150} height={32} className="h-8 w-auto object-contain" />
              </div>
            </Link>
            <Button variant="ghost" size="sm" onClick={closeMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Section (if signed in) */}
          {!loading && user && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 py-6">
            <div className="space-y-2 px-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 text-lg font-medium ${
                    item.highlight
                      ? "text-primary-500 bg-primary-50 rounded-lg"
                      : "text-gray-900 hover:bg-gray-100 rounded-lg"
                  } transition-colors`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}

              {/* User-specific links (if signed in) */}
              {!loading && user && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      My Party Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-3 text-lg font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Account Settings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-6 space-y-3">
            {!loading && user ? (
              // Signed in user actions
              <>
                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white" asChild>
                  <Link href="/dashboard" onClick={closeMenu}>
                    Start Planning
                  </Link>
                </Button>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : !loading ? (
              // Not signed in actions
              <>
                <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white" asChild>
                  <Link href="/dashboard" onClick={closeMenu}>
                    Start Planning
                  </Link>
                </Button>
                <Button variant="outline" className="w-full border-gray-200 text-gray-700" asChild>
                  <Link href="/signin" onClick={closeMenu}>
                    Sign In
                  </Link>
                </Button>
              </>
            ) : (
              // Loading state
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}