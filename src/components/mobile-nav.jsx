"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { NavbarSearch } from "./NavBarSearch"

export default function MobileNav() {
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
          {/* Header with Search */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/" onClick={closeMenu}>
              <div className="h-8 absolute top-[-55px] left-0 w-auto relative">
                <Image src="/logo-darker.png" alt="BookABash" width={150} height={10} className="object-contain" />
              </div>
            </Link>
            <div className="flex items-center space-x-2">
 
              <Button variant="ghost" size="sm" onClick={closeMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

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
            </div>
          </nav>

          <div className="border-t border-gray-200 p-6 space-y-3">
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
          </div>
        </div>
      </div>
    </>
  )
}