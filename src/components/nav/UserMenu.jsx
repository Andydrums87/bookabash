"use client"

import { useState, useEffect, useRef } from "react"
import { User, LogOut, Settings, Calendar, Briefcase, PartyPopper } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function UserMenu({ initialUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [isSupplier, setIsSupplier] = useState(false)
  const [hasDatabaseParties, setHasDatabaseParties] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const menuRef = useRef(null)

  // Check if user is a supplier and if they have database parties
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) return

      try {
        // Check if supplier
        const { data: supplier, error: supplierError } = await supabase
          .from('suppliers')
          .select('id')
          .eq('auth_user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle()

        if (!supplierError && supplier) {
          setIsSupplier(true)
        }

        // Check if user has any paid parties in database
        // First, get the public user ID from auth_user_id
        const { data: publicUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (publicUser) {
          const { data: parties, error: partiesError } = await supabase
            .from('parties')
            .select('id')
            .eq('user_id', publicUser.id)
            .eq('payment_status', 'fully_paid')
            .limit(1)

          if (!partiesError && parties && parties.length > 0) {
            setHasDatabaseParties(true)
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    checkUserStatus()
  }, [user?.id])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || null,
        } : null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsSupplier(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' })

      // Clear party-related storage
      localStorage.removeItem("party_details")
      localStorage.removeItem("user_party_plan")
      localStorage.removeItem("party_plan")
      localStorage.removeItem("selectedPartyId")
      localStorage.removeItem("currentPartyId")

      sessionStorage.removeItem('replacementContext')
      sessionStorage.removeItem('shouldRestoreReplacementModal')
      sessionStorage.removeItem('modalShowUpgrade')
      sessionStorage.removeItem('party_data_cache')
      sessionStorage.removeItem('party_plan_cache')

      // Clear Supabase auth storage
      const authKeys = Object.keys(localStorage).filter(key =>
        key.startsWith('sb-') || key.includes('supabase')
      )
      authKeys.forEach(key => localStorage.removeItem(key))

      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const getUserDisplayName = () => {
    return user?.fullName || user?.email?.split('@')[0] || 'User'
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative" ref={menuRef}>
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

      {isOpen && (
        <div className="absolute w-fit right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
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

          <div className="py-2">
            {isSupplier ? (
              <Link
                href="/suppliers/dashboard"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="w-4 h-4 mr-3" />
                Business Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  My Party Dashboard
                </Link>
                {hasDatabaseParties && (
                  <Link
                    href="/dashboard?view=parties"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <PartyPopper className="w-4 h-4 mr-3" />
                    My Planned Parties
                  </Link>
                )}
              </>
            )}

            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Account Settings
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setIsOpen(false)
                setShowSignOutDialog(true)
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        title="Sign out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleSignOut}
      />
    </div>
  )
}

export default UserMenu
