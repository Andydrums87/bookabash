"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  BookOpen,
  User,
  DollarSign,
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"


export default function SupplierLayout({ children }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/suppliers/dashboard",
    },
    {
      icon: Inbox,
      label: "Lead Inbox",
      href: "/suppliers/leads",
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/suppliers/calendar",
    },
    {
      icon: BookOpen,
      label: "Bookings",
      href: "/suppliers/bookings",
    },
    {
      icon: User,
      label: "Profile",
      href: "/suppliers/profile",
    },
    {
      icon: DollarSign,
      label: "Earnings",
      href: "/suppliers/earnings",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <Link href="/suppliers/dashboard" className="flex items-center">
              <div className="h-8 w-auto relative">
                <Image src="/images/logo.png" alt="BookABash" width={120} height={32} className="object-contain" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>PH</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex items-center gap-1 text-sm font-medium">
                <span>Party Heroes</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Party Heroes</h2>
            <p className="text-sm text-gray-500">Entertainment</p>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      pathname === item.href ? "text-primary-600" : "text-gray-400",
                    )}
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex flex-col w-full max-w-xs bg-white h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Party Heroes</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="space-y-1 px-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        pathname === item.href
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          pathname === item.href ? "text-primary-600" : "text-gray-400",
                        )}
                      />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/suppliers/settings">
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start mt-2" asChild>
                  <Link href="/logout">
                    <LogOut className="h-5 w-5 mr-2" />
                    Log out
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
