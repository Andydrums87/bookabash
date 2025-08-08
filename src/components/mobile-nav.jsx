"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calendar, Settings, LogOut, Home, Search, Heart, BookOpen, Star, Mail, ChevronRight, Gift, Users } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

export default function MobileNav({ user, onSignOut, loading }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dashboardExpanded, setDashboardExpanded] = useState(false)

  // Updated nav items to match desktop
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Snap Suppliers", icon: Search },
    // { href: "/dashboard", label: "My Snapboard", icon: Calendar },
    { href: "/blog", label: "Snapspiration", icon: BookOpen },
    { href: "/favorites", label: "My Favorites", icon: Heart },
  ]

  const dashboardItems = [
    { href: "/dashboard", label: "Party Dashboard", icon: Calendar, description: "Overview & planning" },
    { href: "/e-invites", label: "E-Invites", icon: Mail, description: "Digital invitations" },
    { href: "/gift-registry", label: "Gift Registry", icon: Gift, description: "Gift wishlists" },
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

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden relative z-50 p-2 hover:bg-gray-100 transition-colors duration-200"
        onClick={toggleMenu}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>
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
          transform transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">

       
          {!loading && user ? (
            <div className="px-6 py-2">
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
                  className="h-8 w-auto object-contain"
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


      
          {loading && (
            <div className="px-6 py-8">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-6">
            <div className="space-y-2 mt-2">
              {/* Regular nav items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200 border-b border-gray-50"
                  onClick={closeMenu}
                >
                  <item.icon className="w-6 h-6 mr-4 text-gray-600 hover:text-[hsl(var(--primary-500))]" />
                  <span className="text-md">{item.label}</span>
                </Link>
              ))}

              {/* Dashboard - Expandable */}
              <div className="border-b border-gray-50">
                <button
                  onClick={() => setDashboardExpanded(!dashboardExpanded)}
                  className="flex items-center justify-between w-full py-4 text-gray-900 hover:text-[hsl(var(--primary-500))] transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 mr-4 text-gray-600" />
                    <span className="text-md">My Snapboard</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${dashboardExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Dashboard Sub-items */}
                {dashboardExpanded && (
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
                )}
              </div>

              {/* Featured Action */}
              <Link
                href="/dashboard"
                className="flex items-center py-4 text-red-500 hover:text-red-600 transition-colors duration-200 border-b border-gray-50"
                onClick={closeMenu}
              >
                <Star className="w-6 h-6 mr-4 text-red-500" />
                <span className="text-lg font-normal">Start Planning</span>
              </Link>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-gray-100">
            {!loading && user ? (
              <Button
                onClick={handleSignOut}
                className="w-full bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white  py-3 text-base rounded-full transition-all duration-200"
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
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>
              {/* <div className="text-gray-400 text-sm">Version 1.0.0</div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
