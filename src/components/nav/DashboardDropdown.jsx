"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export function DashboardDropdown({ initialUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activePartyId, setActivePartyId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [hasDatabaseParties, setHasDatabaseParties] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef(null)

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
        } : null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setActivePartyId(null)
        setHasDatabaseParties(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check if user has any fully paid parties in database
  useEffect(() => {
    const checkDatabaseParties = async () => {
      if (!user?.id) {
        setHasDatabaseParties(false)
        return
      }

      try {
        // First, get the public user ID from auth_user_id
        const { data: publicUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (publicUser) {
          const { data: parties, error } = await supabase
            .from('parties')
            .select('id')
            .eq('user_id', publicUser.id)
            .eq('payment_status', 'fully_paid')
            .limit(1)

          if (!error && parties && parties.length > 0) {
            setHasDatabaseParties(true)
          } else {
            setHasDatabaseParties(false)
          }
        } else {
          setHasDatabaseParties(false)
        }
      } catch (error) {
        console.error('Error checking database parties:', error)
      }
    }

    checkDatabaseParties()
  }, [user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load party data when dropdown opens
  useEffect(() => {
    if (isOpen && !activePartyId && user) {
      loadPartyData()
    }
  }, [isOpen, user])

  const loadPartyData = async () => {
    try {
      setLoading(true)
      const result = await partyDatabaseBackend.getCurrentParty()
      if (result.success && result.party) {
        setActivePartyId(result.party.id)
      }
    } catch (error) {
      console.error('Error loading party data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasLocalStorageParty = () => {
    try {
      const userPartyPlan = localStorage.getItem('user_party_plan')
      const partyDetails = localStorage.getItem('party_details')

      if (userPartyPlan) {
        const parsedPlan = JSON.parse(userPartyPlan)
        const hasValidPlan = parsedPlan && Object.keys(parsedPlan).some(key =>
          parsedPlan[key] &&
          typeof parsedPlan[key] === 'object' &&
          parsedPlan[key].name
        )
        if (hasValidPlan) return true
      }

      if (partyDetails) {
        const parsedDetails = JSON.parse(partyDetails)
        const hasValidDetails = parsedDetails && (
          parsedDetails.theme ||
          parsedDetails.date ||
          (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
          parsedDetails.guestCount ||
          parsedDetails.postcode
        )
        if (hasValidDetails) return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  const handleNavigation = (item) => {
    setIsOpen(false)

    // Always allow dashboard access
    if (item.href === '/dashboard') {
      router.push(item.href)
      return
    }

    const hasLocalParty = hasLocalStorageParty()

    // Handle items that require authentication
    if (!user && !hasLocalParty) {
      router.push('/signin')
      return
    }

    // Handle items that require a party ID
    if (item.requiresPartyId) {
      if (!activePartyId && !hasLocalParty) {
        router.push('/dashboard?action=new-party')
        return
      }

      let targetRoute
      switch (item.href) {
        case '/rsvps':
          targetRoute = `/rsvps/${activePartyId}`
          break
        default:
          targetRoute = item.href
      }

      router.push(targetRoute)
    } else {
      router.push(item.href)
    }
  }

  const dashboardItems = [
    { href: "/dashboard", label: "Party Dashboard" },
    { href: "/e-invites", label: "E-Invites" },
    { href: "/rsvps", label: "RSVPs", requiresPartyId: true },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center cursor-pointer space-x-1 text-gray-900 hover:text-[hsl(var(--primary-500))] px-3 py-2 text-md font-medium transition-colors"
      >
        <span>My Snapboard</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
          {/* Main Dashboard */}
          <button
            onClick={() => handleNavigation({ href: "/dashboard" })}
            className="w-full px-4 py-2.5 text-left text-[15px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Party Dashboard
          </button>

          <div className="h-px bg-gray-100 my-1.5" />

          {/* Start New Party */}
          <button
            onClick={() => handleNavigation({ href: "/dashboard?action=new-party" })}
            className="w-full px-4 py-2.5 text-left text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Start New Party
          </button>

          {hasDatabaseParties && (
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard?view=parties')
              }}
              className="w-full px-4 py-2.5 text-left text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              My Parties
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardDropdown
