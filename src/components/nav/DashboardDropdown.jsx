"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Mail, Gift, Users, Star, ChevronDown, PartyPopper } from "lucide-react"
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
    { href: "/dashboard", label: "Party Dashboard", icon: Calendar, description: "Overview & planning" },
    { href: "/e-invites", label: "E-Invites", icon: Mail, description: "Digital invitations" },
    { href: "/rsvps", label: "RSVP Management", icon: Users, description: "Track responses", requiresPartyId: true },
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
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Main Dashboard */}
          <button
            onClick={() => handleNavigation({ href: "/dashboard" })}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
          >
            <Calendar className="w-4 h-4 mr-3 text-gray-500" />
            <div className="text-left">
              <div className="font-medium">Party Dashboard</div>
              <div className="text-xs text-gray-500">Overview & planning</div>
            </div>
          </button>

          {/* Party Tools Section */}
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Party Tools
            </div>

            {/* E-Invites */}
            <button
              onClick={() => handleNavigation(dashboardItems[1])}
              disabled={loading}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Mail className="w-4 h-4 mr-3 text-gray-500" />
              <div className="text-left">
                <div>E-Invites</div>
              </div>
            </button>

            {/* Gift Registry */}
            <button
              onClick={() => {
                setIsOpen(false)
                if (!user) {
                  router.push('/signin')
                } else {
                  router.push('/gift-registry')
                }
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Gift className="w-4 h-4 mr-3 text-gray-500" />
              <div className="text-left">
                <div>Gift Registry</div>
                <div className="text-xs text-gray-500">Manage gift wishlists</div>
              </div>
            </button>

            {/* RSVP Management */}
            <button
              onClick={() => handleNavigation(dashboardItems[2])}
              disabled={loading}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Users className="w-4 h-4 mr-3 text-gray-500" />
              <div className="text-left">
                <div>RSVP Management</div>
                {dashboardItems[2].requiresPartyId && !activePartyId && !loading && (
                  <div className="text-xs text-orange-500">Requires active party</div>
                )}
              </div>
            </button>
          </div>

          {/* Quick Actions Section */}
          <div className="border-t border-gray-100 py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Quick Actions
            </div>

            <button
              onClick={() => handleNavigation({ href: "/dashboard?action=new-party" })}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Star className="w-4 h-4 mr-3 text-gray-500" />
              <span>Start New Party</span>
            </button>

            {hasDatabaseParties && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/dashboard?view=parties')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <PartyPopper className="w-4 h-4 mr-3 text-gray-500" />
                <span>My Planned Parties</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardDropdown
