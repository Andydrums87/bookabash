"use client"

import React, { useState, useEffect } from "react"
import { Users, CheckCircle, XCircle, Clock3, Edit, Trash2, Mail, MessageSquare, MessageCircle, UtensilsCrossed, ChevronRight, ChevronDown, Plus, UserPlus, BarChart3, TrendingUp, UserCheck, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import SnappyLoader from "@/components/ui/SnappyLoader"
import { useRouter } from "next/navigation"
import { ShareGuestInviteModal } from "./ShareGuestInviteModal"

// Hero Header Component
const RSVPHeroSection = ({ stats }) => {
  return (
    <div
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dghzq6xtd/image/upload/v1762166371/iStock-1179556448_xbvoag.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="relative rounded-2xl shadow-lg overflow-hidden mb-8 mx-3 sm:mx-4 mt-6"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

      <div className="relative px-4 py-8 sm:px-6 sm:py-10 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-3 drop-shadow-2xl">
            Guest Management
          </h1>

          <p className="text-base sm:text-lg mb-5 max-w-2xl mx-auto drop-shadow-lg font-medium">
            Track invitations and manage RSVPs for your party
          </p>
        </div>
      </div>
    </div>
  )
}

// Add Guest Modal Component
const AddGuestModal = ({ isOpen, onClose, onAdd, partyId }) => {
  const [childName, setChildName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e = null) => {
    if (e) e.preventDefault()
    if (!childName.trim()) return
    
    setLoading(true)
    try {
      // Add guest to the party's invite list
      const result = await partyDatabaseBackend.addPartyGuest(partyId, {
        childName: childName.trim()
      })
      
      if (result.success) {
        onAdd(result.guest)
        setChildName('')
        onClose()
      } else {
        alert('Failed to add guest. Please try again.')
      }
    } catch (error) {
      console.error('Error adding guest:', error)
      alert('Failed to add guest. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add New Guest</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child's Name *
              </label>
              <Input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter the child's name"
                className="rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && childName.trim()) {
                    handleSubmit(e)
                  }
                }}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                This name will be used to match RSVPs when parents respond
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!childName.trim() || loading}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              >
                {loading ? 'Adding...' : 'Add Guest'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Guest List Item Component
const GuestListItem = ({ guest, rsvpStatus, onRemove, onSendInvite }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const getStatusInfo = () => {
    if (!rsvpStatus) {
      return {
        badge: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock3,
        label: "Pending",
        color: "text-gray-600"
      }
    }

    switch (rsvpStatus.attendance) {
      case "yes":
        return {
          badge: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Confirmed",
          color: "text-green-600"
        }
      case "no":
        return {
          badge: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "Declined",
          color: "text-red-600"
        }
      case "maybe":
        return {
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock3,
          label: "Maybe",
          color: "text-yellow-600"
        }
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Clock3,
          label: "Pending",
          color: "text-gray-600"
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className="border border-gray-200 hover:border-primary-300 transition-all bg-white">
      <CardContent className="p-3">
        {/* Collapsed view - super compact */}
        <div className="flex items-center gap-3">
          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-transform"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{guest.childName}</h3>
          </div>

          {/* Status icon - visual only */}
          <div className={`flex items-center justify-center w-7 h-7 rounded-full ${statusInfo.badge}`}>
            <StatusIcon className="w-4 h-4" />
          </div>

          {/* Send button */}
          <Button
            onClick={() => onSendInvite(guest)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-7 px-2.5 text-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </Button>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(guest)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {/* Invite status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Invite Status:</span>
              {guest.inviteSent ? (
                <span className="text-green-600 font-medium">
                  Sent {new Date(guest.sentAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-gray-400">Not sent yet</span>
              )}
            </div>

            {/* RSVP details */}
            {rsvpStatus && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">RSVP by:</span>
                  <span className="font-medium text-gray-900">{rsvpStatus.guest_name}</span>
                </div>
                {rsvpStatus.guest_email && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-600">{rsvpStatus.guest_email}</span>
                  </div>
                )}

                {/* Additional details for confirmed guests */}
                {rsvpStatus.attendance === 'yes' && (
                  <>
                    <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                      <span className="text-gray-500">Party size:</span>
                      <span className="text-gray-900">{rsvpStatus.adults_count || 1} adults, {rsvpStatus.children_count || 0} children</span>
                    </div>
                    {rsvpStatus.dietary_requirements && (
                      <div className="flex items-start justify-between text-xs">
                        <span className="text-gray-500">Dietary:</span>
                        <span className="text-gray-900 text-right max-w-[200px]">{rsvpStatus.dietary_requirements}</span>
                      </div>
                    )}
                    {rsvpStatus.message && (
                      <div className="flex items-start justify-between text-xs">
                        <span className="text-gray-500">Message:</span>
                        <span className="text-gray-900 text-right max-w-[200px] italic">"{rsvpStatus.message}"</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mobile RSVP Card Component (existing)
const RSVPCard = ({ rsvp, onEdit, onRemove }) => {
  const [expanded, setExpanded] = useState(false)
  
  const getStatusInfo = (status) => {
    switch (status) {
      case "yes":
        return {
          badge: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "✓ Confirmed",
          color: "text-green-600"
        }
      case "no":
        return {
          badge: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "✗ Declined",
          color: "text-red-600"
        }
      case "maybe":
        return {
          badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock3,
          label: "Maybe",
          color: "text-yellow-600"
        }
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Users,
          label: "Pending",
          color: "text-gray-600"
        }
    }
  }

  const statusInfo = getStatusInfo(rsvp.attendance)
  const StatusIcon = statusInfo.icon
  const totalGuests = (rsvp.adults_count || 1) + (rsvp.children_count || 0)

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-all bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">{rsvp.guest_name}</h3>
            {rsvp.child_name && (
              <p className="text-sm text-gray-600 mb-1">For: {rsvp.child_name}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</span>
              {rsvp.guest_email && (
                <>
                  <span>•</span>
                  <Mail className="w-4 h-4" />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.badge} font-medium px-3 py-1.5 rounded-lg border`}>
              {statusInfo.label}
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Adults:</span>
            <span className="font-medium">{rsvp.adults_count || 1}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Children:</span>
            <span className="font-medium">{rsvp.children_count || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {rsvp.dietary_requirements?.trim() && (
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Dietary needs</span>
            </div>
          )}
          {rsvp.message?.trim() && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <MessageSquare className="w-4 h-4" />
              <span>Has message</span>
            </div>
          )}
        </div>

        {expanded && (
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
            {rsvp.guest_email && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm text-gray-900 mt-1">{rsvp.guest_email}</p>
              </div>
            )}
            
            {rsvp.dietary_requirements?.trim() && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary Requirements</label>
                <p className="text-sm text-gray-900 mt-1">{rsvp.dietary_requirements}</p>
              </div>
            )}
            
            {rsvp.message?.trim() && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Message</label>
                <p className="text-sm text-gray-900 mt-1">{rsvp.message}</p>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(rsvp)}
                className="flex-1 border-gray-200 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(rsvp)}
                className="flex-1 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function RSVPManagementPage({ partyId, onBack }) {
  const router = useRouter()
  const [rsvps, setRsvps] = useState([])
  const [guests, setGuests] = useState([])
  const [partyData, setPartyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddGuestModal, setShowAddGuestModal] = useState(false)
  const [activeTab, setActiveTab] = useState('guests')
  const [showStats, setShowStats] = useState(false)

  // ✅ NEW: Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)

  // Load RSVP data, party details, and guest list
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading RSVPs, party data, and guests for party:", partyId)

        // Load RSVPs
        const rsvpResult = await partyDatabaseBackend.getPartyRSVPs(partyId)
        if (rsvpResult.success) {
          setRsvps(rsvpResult.rsvps || [])
        }

        // Load party details
        const partyResult = await partyDatabaseBackend.getPartyById(partyId)
        if (partyResult.success && partyResult.party) {
          setPartyData(partyResult.party)
        }

        // Load guest list
        const guestResult = await partyDatabaseBackend.getPartyGuests(partyId)
        if (guestResult.success) {
          setGuests(guestResult.guests || [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (partyId) {
      loadData()
    }
  }, [partyId])

  const handleAddGuest = (newGuest) => {
    setGuests(prev => [...prev, newGuest])
  }

  const handleRemoveGuest = async (guest) => {
    if (confirm(`Remove ${guest.childName} from the guest list?`)) {
      try {
        const result = await partyDatabaseBackend.removePartyGuest(partyId, guest.id)
        if (result.success) {
          setGuests(prev => prev.filter(g => g.id !== guest.id))
        } else {
          alert('Failed to remove guest. Please try again.')
        }
      } catch (error) {
        console.error('Error removing guest:', error)
        alert('Failed to remove guest. Please try again.')
      }
    }
  }

  const handleEdit = (rsvp) => {
    console.log("Edit RSVP:", rsvp)
    // TODO: Implement edit functionality
  }

  const handleRemove = (rsvp) => {
    console.log("Remove RSVP:", rsvp)
    // TODO: Implement remove functionality
  }

  // ✅ NEW: Handle send invite
  const handleSendInvite = (guest) => {
    setSelectedGuest(guest)
    setShowShareModal(true)
  }

  // ✅ NEW: Mark invite as sent
  const handleMarkAsSent = async (guestId, platform) => {
    try {
      const result = await partyDatabaseBackend.markGuestInviteSent(partyId, guestId, platform)
      if (result.success) {
        setGuests(prev => prev.map(g =>
          g.id === guestId
            ? { ...g, inviteSent: true, sentAt: new Date().toISOString(), sentVia: platform }
            : g
        ))
        setShowShareModal(false)
      }
    } catch (error) {
      console.error('Error marking invite as sent:', error)
    }
  }

  // Match guests with their RSVP responses
  const guestsWithRSVPs = guests.map(guest => {
    const matchingRsvp = rsvps.find(rsvp => 
      rsvp.child_name && guest.childName && 
      rsvp.child_name.toLowerCase().trim() === guest.childName.toLowerCase().trim()
    )
    return {
      ...guest,
      rsvpStatus: matchingRsvp
    }
  })

  // Calculate statistics
  const stats = {
    totalGuests: guests.length,
    totalRsvps: rsvps.length,
    confirmed: guestsWithRSVPs.filter(g => g.rsvpStatus?.attendance === 'yes').length,
    declined: guestsWithRSVPs.filter(g => g.rsvpStatus?.attendance === 'no').length,
    pending: guests.length - rsvps.length,
    totalAttendees: guestsWithRSVPs
      .filter(g => g.rsvpStatus?.attendance === 'yes')
      .reduce((sum, g) => sum + (g.rsvpStatus.adults_count || 1) + (g.rsvpStatus.children_count || 0), 0)
  }

  if (loading) {
    return (
       <div className="min-h-screen bg-white flex items-center justify-center">
            <SnappyLoader text="Loading your party dashboard..." />
          </div>
        )
    
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ContextualBreadcrumb currentPage="rsvps" />

      {/* Hero Header */}
      <RSVPHeroSection stats={stats} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Collapsible Stats Section */}
        <div className="mb-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Overview</h3>
                    <p className="text-sm text-gray-600">
                      {stats.confirmed} confirmed • {stats.pending} pending • {stats.totalAttendees} total attendees
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showStats ? 'rotate-180' : ''}`} />
              </button>

              {showStats && (
                <div className="border-t border-gray-100 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Total Guests */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Guests</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                    </div>

                    {/* Confirmed */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Confirmed</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
                    </div>

                    {/* Declined */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Declined</p>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{stats.declined}</p>
                    </div>

                    {/* Pending */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock3 className="w-4 h-4 text-amber-600" />
                        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Pending</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
                    </div>

                    {/* Total Attendees */}
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary-600" />
                        <p className="text-xs font-medium text-primary-700 uppercase tracking-wide">Attendees</p>
                      </div>
                      <p className="text-2xl font-bold text-primary-900">{stats.totalAttendees}</p>
                    </div>
                  </div>

                  {/* Response Rate Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Response Rate</span>
                      <span className="text-sm font-bold text-gray-900">
                        {stats.totalGuests > 0 ? Math.round((stats.totalRsvps / stats.totalGuests) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                        style={{ width: `${stats.totalGuests > 0 ? (stats.totalRsvps / stats.totalGuests) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Add Guest Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Card className="bg-white border border-gray-200 shadow-sm flex-1">
            <CardContent className="p-1">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('guests')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    activeTab === 'guests'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Guest List</span>
                    <Badge className={`${activeTab === 'guests' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'} border-0`}>
                      {stats.totalGuests}
                    </Badge>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('rsvps')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    activeTab === 'rsvps'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>All RSVPs</span>
                    <Badge className={`${activeTab === 'rsvps' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'} border-0`}>
                      {stats.totalRsvps}
                    </Badge>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Add Guest Button */}
          <Button
            onClick={() => setShowAddGuestModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg shadow-md h-auto whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'guests' && (
          <div>
            {guests.length > 0 ? (
              <div className="space-y-4">
                {guestsWithRSVPs.map((guest) => (
                  <GuestListItem
                    key={guest.id}
                    guest={guest}
                    rsvpStatus={guest.rsvpStatus}
                    onRemove={handleRemoveGuest}
                    onSendInvite={handleSendInvite}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests added yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start building your guest list to track invitations and RSVP responses.
                  </p>
                  <Button
                    onClick={() => setShowAddGuestModal(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Guest
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'rsvps' && (
          <div>
            {rsvps.length > 0 ? (
              <div className="space-y-4">
                {rsvps.map((rsvp) => (
                  <RSVPCard 
                    key={rsvp.id} 
                    rsvp={rsvp} 
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No RSVPs yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    RSVP responses will appear here as guests reply to your invitation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Save and Exit Button */}
        <div className="mt-8 flex justify-center pb-8">
          <Button
            onClick={() => {
              if (onBack) {
                onBack()
              } else {
                router.push('/dashboard')
              }
            }}
            variant="outline"
            className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Save & Return to Dashboard
          </Button>
        </div>
      </div>

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        onAdd={handleAddGuest}
        partyId={partyId}
      />

      {/* Share Invite Modal */}
      <ShareGuestInviteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        guest={selectedGuest}
        inviteData={partyData?.party_plan?.einvites}
        onMarkAsSent={handleMarkAsSent}
      />
    </div>
  )
}