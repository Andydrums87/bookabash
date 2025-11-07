"use client"

import React, { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import SnappyLoader from "@/components/ui/SnappyLoader"
import { useRouter } from "next/navigation"
import { ShareGuestInviteModal } from "./ShareGuestInviteModal"

// Simple Header Component
const RSVPHeader = ({ totalGuests, confirmedCount }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Guest List ({totalGuests})</h1>
        <p className="text-sm text-gray-600 mt-1">{confirmedCount} confirmed</p>
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
            <div>
              <h3 className="text-2xl font-bold text-gray-900">🎈 Add a Friend!</h3>
              <p className="text-sm text-gray-500 mt-1">Who else should we invite?</p>
            </div>
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
                placeholder="e.g., Emma, Oliver, Sophie..."
                className="rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && childName.trim()) {
                    handleSubmit(e)
                  }
                }}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 We'll use this to match them when their parents RSVP
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
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold"
              >
                {loading ? '✨ Adding...' : '🎉 Add to Party!'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple Guest List Item - inspired by iOS contacts style
const GuestListItem = ({ guest, rsvpStatus, onRemove, onSendInvite, hasInvite }) => {
  const [showTooltip, setShowTooltip] = React.useState(false)

  const getStatusIcon = () => {
    if (!rsvpStatus) {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
      )
    }

    if (rsvpStatus.attendance === 'yes') {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-primary-500 bg-primary-500 flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )
    }

    if (rsvpStatus.attendance === 'no') {
      return (
        <div className="w-6 h-6 rounded-full border-2 border-red-400 bg-red-50 flex items-center justify-center">
          <span className="text-red-600 text-xs">✕</span>
        </div>
      )
    }

    return (
      <div className="w-6 h-6 rounded-full border-2 border-yellow-400"></div>
    )
  }

  return (
    <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors gap-4">
      {/* Guest name */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-base truncate">{guest.childName}</span>
          {/* Show sent status */}
          {guest.inviteSent && !rsvpStatus && (
            <span className="text-xs text-gray-400 mt-0.5">
              Sent {new Date(guest.sentAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Send Invite button - only show if not RSVP'd yet and not already sent */}
        {!rsvpStatus && !guest.inviteSent && (
          <>
            <Button
              onClick={(e) => {
                console.log('Button clicked, hasInvite:', hasInvite)
                if (hasInvite) {
                  onSendInvite(guest)
                } else {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Setting tooltip to true')
                  setShowTooltip(true)
                  setTimeout(() => {
                    console.log('Hiding tooltip')
                    setShowTooltip(false)
                  }, 3000)
                }
              }}
              size="sm"
              className={`text-xs px-4 py-2 min-w-[70px] ${
                hasInvite
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Send
            </Button>

            {/* Tooltip - Fixed position overlay */}
            {showTooltip && (
              <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/30">
                <div className="bg-gray-800 text-white text-xs rounded-lg px-4 py-3 shadow-2xl max-w-[240px] mx-4">
                  <p className="font-semibold mb-1">Can't send invite yet</p>
                  <p className="text-gray-300">Create your e-invite first or wait for venue confirmation</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Resend button - show if invite was sent but no RSVP yet */}
        {!rsvpStatus && guest.inviteSent && (
          <Button
            onClick={() => onSendInvite(guest)}
            size="sm"
            variant="outline"
            className="text-primary-500 border-primary-300 hover:bg-primary-50 text-xs px-4 py-2 min-w-[80px]"
          >
            Resend
          </Button>
        )}

        {/* Delete button */}
        <button
          onClick={() => onRemove(guest)}
          className="text-gray-400 hover:text-red-600 p-1.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Status check */}
        {getStatusIcon()}
      </div>
    </div>
  )
}


export default function RSVPManagementPage({ partyId, onBack }) {
  const router = useRouter()
  const [rsvps, setRsvps] = useState([])
  const [guests, setGuests] = useState([])
  const [partyData, setPartyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddGuestModal, setShowAddGuestModal] = useState(false)
  const [activeTab] = useState('guests')
  const [searchQuery, setSearchQuery] = useState('')

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [hasInvite, setHasInvite] = useState(false)

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

          // Check if party has created an e-invite
          const einvites = partyResult.party.party_plan?.einvites
          console.log('📧 Party einvites data:', einvites)
          console.log('📧 Full einvites object:', JSON.stringify(einvites, null, 2))

          // Check multiple possible fields that indicate invite is created
          const inviteExists = einvites?.generatedImage ||
                               einvites?.image ||
                               einvites?.inviteId ||
                               einvites?.inviteSlug ||
                               einvites?.shareableLink

          console.log('✅ Has invite:', !!inviteExists, {
            generatedImage: !!einvites?.generatedImage,
            image: !!einvites?.image,
            inviteId: !!einvites?.inviteId,
            inviteSlug: !!einvites?.inviteSlug,
            shareableLink: !!einvites?.shareableLink
          })
          setHasInvite(!!inviteExists)
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

  // Handle send invite
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

  // Filter guests based on search query
  const filteredGuests = guestsWithRSVPs.filter(guest => {
    if (!searchQuery.trim()) return true
    return guest.childName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  })

  // Group guests by status: confirmed (RSVP'd), sent (invited but no RSVP), not sent
  const confirmedGuests = filteredGuests.filter(g => g.rsvpStatus)
  const sentGuests = filteredGuests.filter(g => !g.rsvpStatus && g.inviteSent)
  const notSentGuests = filteredGuests.filter(g => !g.rsvpStatus && !g.inviteSent)

  // Get guest limit from party data
  const guestLimit = partyData?.guest_count || partyData?.party_plan?.partyDetails?.guestCount || 10
  const isAtGuestLimit = guests.length >= guestLimit

  // Calculate statistics
  const stats = {
    totalGuests: guests.length,
    totalRsvps: rsvps.length,
    confirmed: guestsWithRSVPs.filter(g => g.rsvpStatus?.attendance === 'yes').length,
    declined: guestsWithRSVPs.filter(g => g.rsvpStatus?.attendance === 'no').length,
    pending: guests.length - rsvps.length,
    totalAttendees: guestsWithRSVPs
      .filter(g => g.rsvpStatus?.attendance === 'yes')
      .reduce((sum, g) => sum + (g.rsvpStatus.adults_count || 1) + (g.rsvpStatus.children_count || 0), 0),
    guestLimit
  }

  if (loading) {
    return (
       <div className="min-h-screen bg-white flex items-center justify-center">
            <SnappyLoader text="Loading your party dashboard..." />
          </div>
        )
    
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <ContextualBreadcrumb currentPage="rsvps" />

      {/* Simple Header */}
      <RSVPHeader totalGuests={stats.totalGuests} confirmedCount={stats.confirmed} />

      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="px-4 py-4">
          <Input
            type="text"
            placeholder="🔍 Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-gray-300"
          />
        </div>

        {/* Guest List */}
        {activeTab === 'guests' && (
          <div className="bg-white">
            {guests.length > 0 ? (
              <div>
                {filteredGuests.length > 0 ? (
                  <>
                    {/* Confirmed Guests */}
                    {confirmedGuests.map((guest) => (
                      <GuestListItem
                        key={guest.id}
                        guest={guest}
                        rsvpStatus={guest.rsvpStatus}
                        onRemove={handleRemoveGuest}
                        onSendInvite={handleSendInvite}
                        hasInvite={hasInvite}
                      />
                    ))}

                    {/* Sent (Awaiting Response) */}
                    {sentGuests.map((guest) => (
                      <GuestListItem
                        key={guest.id}
                        guest={guest}
                        rsvpStatus={guest.rsvpStatus}
                        onRemove={handleRemoveGuest}
                        onSendInvite={handleSendInvite}
                        hasInvite={hasInvite}
                      />
                    ))}

                    {/* Not Sent */}
                    {notSentGuests.map((guest) => (
                      <GuestListItem
                        key={guest.id}
                        guest={guest}
                        rsvpStatus={guest.rsvpStatus}
                        onRemove={handleRemoveGuest}
                        onSendInvite={handleSendInvite}
                        hasInvite={hasInvite}
                      />
                    ))}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No guests found matching "{searchQuery}"</p>
                  </div>
                )}

                {/* Guest Count Info */}
                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    {guests.length} of {guestLimit} guests invited
                  </p>
                  {isAtGuestLimit && (
                    <p className="text-xs text-amber-600 mt-1">
                      You've reached your guest limit
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-3xl">
                  👤
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests added yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start building your guest list (up to {guestLimit} guests)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Spacer for fixed button */}
        <div className="h-32"></div>
      </div>

      {/* Big Action Button at Bottom - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => !isAtGuestLimit && setShowAddGuestModal(true)}
            disabled={isAtGuestLimit}
            className={`w-full font-bold py-4 rounded-lg text-lg ${
              isAtGuestLimit
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {isAtGuestLimit ? `Guest Limit Reached (${guestLimit})` : 'Add Guest'}
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