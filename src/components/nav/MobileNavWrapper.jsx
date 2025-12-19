"use client"

import { useState, useEffect } from "react"
import MobileNav from "@/components/mobile-nav"
import { supabase } from "@/lib/supabase"

export function MobileNavWrapper({ initialUser }) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [currentPartyId, setCurrentPartyId] = useState(null)

  useEffect(() => {
    // If we have initial user from server, no need to check again
    if (initialUser) {
      setLoading(false)
    } else {
      // Check auth on client if no server user (important for OAuth redirects)
      const checkAuth = async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (!error && user) {
            setUser({
              id: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || null,
            })
          }
        } catch (error) {
          console.error('Error checking auth:', error)
        } finally {
          setLoading(false)
        }
      }
      checkAuth()
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || null,
        } : null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [initialUser])

  // Get party ID from storage
  useEffect(() => {
    try {
      const partyId = localStorage.getItem('selectedPartyId') || localStorage.getItem('currentPartyId')
      if (partyId) {
        setCurrentPartyId(partyId)
      }
    } catch (error) {
      // localStorage not available
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' })

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

  // Convert user format for MobileNav
  const mobileNavUser = user ? {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.fullName
    }
  } : null

  return (
    <MobileNav
      user={mobileNavUser}
      onSignOut={handleSignOut}
      loading={loading}
      currentPartyId={currentPartyId}
    />
  )
}

export default MobileNavWrapper
