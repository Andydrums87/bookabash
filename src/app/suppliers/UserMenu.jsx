"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserCircle, Settings, HelpCircle, LogOut, Loader2, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupplier } from "@/hooks/useSupplier"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu({ secondaryNavItems = [] }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { supplierData } = useSupplier()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const ownerName = supplierData?.owner?.name ||
                   user?.user_metadata?.full_name ||
                   user?.user_metadata?.name ||
                   user?.email?.split('@')[0] ||
                   'User'

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })

      if (error) throw error

      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })

        localStorage.removeItem('supplier-data')
        localStorage.removeItem('user-data')
        localStorage.removeItem('auth-token')
        localStorage.removeItem('tourProgress')
        localStorage.removeItem('hasSeenProfileTour')
        localStorage.removeItem('tourCompleted')
        localStorage.removeItem('tourSkipped')
        localStorage.removeItem('justCompletedOnboarding')
      }

      if (typeof window !== 'undefined' && window.sessionStorage) {
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key)
          }
        })
      }

      window.location.href = '/suppliers/onboarding'

    } catch (error) {
      console.error('Logout error:', error)

      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/suppliers/onboarding'
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 md:h-12 px-3 gap-2 rounded-full border border-gray-200 hover:shadow-md transition-shadow bg-white"
        >
          <Menu className="h-4 w-4 text-gray-600" />
          <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        {/* User Info */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{ownerName || 'User'}</span>
              <span className="text-xs text-gray-500 font-normal">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Secondary Nav Items - Profile, Media, etc. */}
        {secondaryNavItems.length > 0 && (
          <>
            <div className="py-1">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Manage Listing</p>
              {secondaryNavItems.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="cursor-pointer py-2.5"
                >
                  <item.icon className="mr-3 h-4 w-4 text-gray-500" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Support */}
        <DropdownMenuItem
          onClick={() => router.push('/support')}
          className="cursor-pointer py-2.5"
        >
          <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
          Help & Support
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="cursor-pointer py-2.5 text-gray-700"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-3 h-4 w-4" />
              Log out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ConfirmDialog
      open={showLogoutDialog}
      onOpenChange={setShowLogoutDialog}
      title="Log out"
      description="Are you sure you want to log out of your account?"
      confirmText="Log out"
      cancelText="Cancel"
      variant="destructive"
      isLoading={isLoggingOut}
      onConfirm={handleLogout}
    />
    </>
  )
}

// Compact version for smaller spaces
export function CompactUserMenu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [ownerName, setOwnerName] = useState(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: supplierData } = await supabase
            .from('suppliers')
            .select('data')
            .eq('auth_user_id', user.id)
            .eq('is_primary', true)
            .maybeSingle()

          setOwnerName(
            supplierData?.data?.owner?.name || 
            user.user_metadata?.full_name || 
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'User'
          )
        }
      } catch (error) {
        console.error('Error getting user:', error)
        setOwnerName('User')
      }
    }

    getUser()
  }, [supabase])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/signin')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <UserCircle className="h-4 w-4" />
          <span className="text-sm">{ownerName || 'User'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{ownerName || 'User'}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/suppliers/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/support')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Support
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setShowLogoutDialog(true)}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ConfirmDialog
      open={showLogoutDialog}
      onOpenChange={setShowLogoutDialog}
      title="Log out"
      description="Are you sure you want to log out of your account?"
      confirmText="Log out"
      cancelText="Cancel"
      variant="destructive"
      isLoading={isLoggingOut}
      onConfirm={handleLogout}
    />
    </>
  )
}