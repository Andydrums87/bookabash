"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserCircle, Settings, HelpCircle, LogOut, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupplier } from "@/hooks/useSupplier"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState(null)
  const { supplierData } = useSupplier() // Use your existing hook
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Get just the auth user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  // Get owner name from supplier data
  const ownerName = supplierData?.owner?.name || 
                   user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'User'

  

                   const handleLogout = async () => {
                    setIsLoggingOut(true)
                    
                    try {
                      console.log("🚪 Starting complete logout process...")
                      
                      // 1. Sign out from Supabase completely
                      const { error } = await supabase.auth.signOut({ scope: 'global' })
                      
                      if (error) {
                        console.error('❌ Supabase logout error:', error)
                        throw error
                      }
                  
                      console.log("✅ Supabase session cleared")
                  
                      // 2. Clear any local storage items
                      if (typeof window !== 'undefined') {
                        // Clear Supabase session from localStorage
                        const keys = Object.keys(localStorage)
                        keys.forEach(key => {
                          if (key.startsWith('sb-') || key.includes('supabase')) {
                            localStorage.removeItem(key)
                          }
                        })
                        
                        // Clear any app-specific data
                        localStorage.removeItem('supplier-data')
                        localStorage.removeItem('user-data')
                        localStorage.removeItem('auth-token')
                        
                        console.log("🧹 Local storage cleared")
                      }
                  
                      // 3. Clear session storage too
                      if (typeof window !== 'undefined' && window.sessionStorage) {
                        const sessionKeys = Object.keys(sessionStorage)
                        sessionKeys.forEach(key => {
                          if (key.startsWith('sb-') || key.includes('supabase')) {
                            sessionStorage.removeItem(key)
                          }
                        })
                        console.log("🧹 Session storage cleared")
                      }
                  
                      // 4. Force reload the page to ensure all state is cleared
                      console.log("🔄 Forcing page reload to clear all state...")
                      window.location.href = '/suppliers/onboarding'
                      
                    } catch (error) {
                      console.error('❌ Complete logout error:', error)
                      
                      // If there's an error, still try to clear everything and redirect
                      if (typeof window !== 'undefined') {
                        // Force clear everything
                        localStorage.clear()
                        sessionStorage.clear()
                        
                        // Force redirect
                        window.location.href = '/suppliers/onboarding'
                      }
                    } finally {
                      setIsLoggingOut(false)
                    }
                  }

  const handleLogoutClick = () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (confirmed) {
      handleLogout()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-2 gap-2 rounded-full hover:bg-gray-100 focus:bg-gray-100"
        >
          <div className="flex items-center gap-0">
            {/* User Avatar */}
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-white" />
            </div>
            
            {/* User Name - Hidden on mobile */}
            <div className="hidden sm:flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {ownerName || 'Loading...'}
              </span>
              <span className="text-xs text-gray-500">Supplier</span>
            </div>
            
            {/* Dropdown Arrow */}
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{ownerName || 'User'}</span>
            <span className="text-xs text-gray-500 font-normal">
              {user?.email}
            </span>
          </div>
        </DropdownMenuLabel>
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
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for smaller spaces
export function CompactUserMenu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [ownerName, setOwnerName] = useState(null)
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
    }
  }

  return (
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
          onClick={handleLogout}
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
  )
}