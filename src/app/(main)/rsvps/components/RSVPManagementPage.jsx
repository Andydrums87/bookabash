"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, XCircle, Clock3, Edit, Trash2, Mail, MessageSquare, UtensilsCrossed, ChevronRight, Plus, UserPlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add New Guest</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
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
                className="rounded-xl border-2 border-gray-200 focus:border-[hsl(var(--primary-400))]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && childName.trim()) {
                    handleSubmit(e)
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                This name will be used to match RSVPs when parents respond
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!childName.trim() || loading}
                className="flex-1 bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white"
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
const GuestListItem = ({ guest, rsvpStatus, onRemove }) => {
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
    <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{guest.childName}</h3>
            {rsvpStatus && (
              <div className="text-sm text-gray-600 mt-1">
                RSVP by: {rsvpStatus.guest_name}
                {rsvpStatus.guest_email && (
                  <>
                    <br />
                    <Mail className="w-3 h-3 inline mr-1" />
                    {rsvpStatus.guest_email}
                  </>
                )}
              </div>
            )}
            {!rsvpStatus && (
              <div className="text-sm text-gray-500 mt-1">
                Waiting for RSVP response
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.badge} font-medium px-3 py-1 rounded-full border`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(guest)}
              className="border-gray-300 hover:border-red-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {rsvpStatus && rsvpStatus.attendance === 'yes' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Adults:</span>
                <span className="ml-2 font-medium">{rsvpStatus.adults_count || 1}</span>
              </div>
              <div>
                <span className="text-gray-500">Children:</span>
                <span className="ml-2 font-medium">{rsvpStatus.children_count || 0}</span>
              </div>
            </div>
            {rsvpStatus.dietary_requirements && (
              <div className="mt-2">
                <span className="text-gray-500 text-sm">Dietary needs:</span>
                <p className="text-sm text-gray-900 mt-1">{rsvpStatus.dietary_requirements}</p>
              </div>
            )}
            {rsvpStatus.message && (
              <div className="mt-2">
                <span className="text-gray-500 text-sm">Message:</span>
                <p className="text-sm text-gray-900 mt-1">"{rsvpStatus.message}"</p>
              </div>
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
    <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{rsvp.guest_name}</h3>
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
            <Badge className={`${statusInfo.badge} font-medium px-3 py-1 rounded-full border`}>
              {statusInfo.label}
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                className="flex-1 border-gray-300 hover:border-[hsl(var(--primary-500))] hover:text-[hsl(var(--primary-500))]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemove(rsvp)}
                className="flex-1 border-gray-300 hover:border-red-500 hover:text-red-500"
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
  const [rsvps, setRsvps] = useState([])
  const [guests, setGuests] = useState([])
  const [partyData, setPartyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddGuestModal, setShowAddGuestModal] = useState(false)
  const [activeTab, setActiveTab] = useState('guests')

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
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[hsl(var(--primary-500))] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[hsl(var(--primary-600))] font-medium">Loading party data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="rsvps" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Party Management</h1>
          <Button
            onClick={() => setShowAddGuestModal(true)}
            className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white font-medium px-6 py-3 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Guest
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatWidget title="Total Guests" value={stats.totalGuests} bgColor="bg-[hsl(var(--primary-500))]" />
          <StatWidget title="Confirmed" value={stats.confirmed} bgColor="bg-green-500" />
          <StatWidget title="Declined" value={stats.declined} bgColor="bg-red-500" />
          <StatWidget title="Pending" value={stats.pending} bgColor="bg-yellow-500" />
          <StatWidget title="Total Attendees" value={stats.totalAttendees} bgColor="bg-[hsl(var(--primary-600))]" />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('guests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guests'
                    ? 'border-[hsl(var(--primary-500))] text-[hsl(var(--primary-600))]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Guest List ({stats.totalGuests})
              </button>
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rsvps'
                    ? 'border-[hsl(var(--primary-500))] text-[hsl(var(--primary-600))]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All RSVPs ({stats.totalRsvps})
              </button>
            </nav>
          </div>
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
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-white shadow-lg border-0 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-[hsl(var(--primary-100))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-[hsl(var(--primary-500))]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--primary-900))] mb-2">No guests added yet</h3>
                  <p className="text-[hsl(var(--primary-600))] mb-6">
                    Add children to your guest list to track their RSVP responses.
                  </p>
                  <Button
                    onClick={() => setShowAddGuestModal(true)}
                    className="bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white px-8 py-3 rounded-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
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
              <Card className="bg-white shadow-lg border-0 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-[hsl(var(--primary-100))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[hsl(var(--primary-500))]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--primary-900))] mb-2">No RSVPs yet</h3>
                  <p className="text-[hsl(var(--primary-600))]">
                    RSVPs will appear here as guests respond to your invitation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        onAdd={handleAddGuest}
        partyId={partyId}
      />
    </div>
  )
}

function StatWidget({ title, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 sm:p-6 text-white shadow-lg`}>
      <h3 className="text-white/90 text-xs sm:text-sm font-medium mb-2">{title}</h3>
      <div className="text-2xl sm:text-3xl font-bold">{value}</div>
    </div>
  )
}