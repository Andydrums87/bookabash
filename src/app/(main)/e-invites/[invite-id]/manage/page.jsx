"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { ArrowLeft, Share2, Users, Mail, MessageCircle, Plus, X, Eye, Edit, Check, Copy, Download, Settings, Send, ExternalLink, UserPlus, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import  SnappyLoader  from "@/components/ui/SnappyLoader"

export default function EInvitesManagementPage() {
  const params = useParams()
  const router = useRouter()
  const inviteId = params["invite-id"]

  // State
  const [loading, setLoading] = useState(true)
  const [einvites, setEinvites] = useState(null)
  const [partyDetails, setPartyDetails] = useState(null)
  const [partyId, setPartyId] = useState(null)
  const [shareableLink, setShareableLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [rsvps, setRsvps] = useState([])
  const [guestList, setGuestList] = useState([])
  const [sentInvites, setSentInvites] = useState(new Set())

  // Load data
  useEffect(() => {
    if (inviteId) {
      loadInviteData()
      loadSentInvitesFromStorage()
    }
  }, [inviteId])

  // Load sent invites from localStorage
  const loadSentInvitesFromStorage = () => {
    try {
      const stored = localStorage.getItem(`sent-invites-${inviteId}`)
      if (stored) {
        setSentInvites(new Set(JSON.parse(stored)))
      }
    } catch (error) {
      console.error('Error loading sent invites:', error)
    }
  }

  // Save sent invites to localStorage
  const saveSentInvitesToStorage = (sentSet) => {
    try {
      localStorage.setItem(`sent-invites-${inviteId}`, JSON.stringify([...sentSet]))
    } catch (error) {
      console.error('Error saving sent invites:', error)
    }
  }

  const loadInviteData = async () => {
    try {
      setLoading(true)
      // First, get the public invite to find the party ID
      const publicInviteResult = await partyDatabaseBackend.getPublicInvite(inviteId)
      if (!publicInviteResult.success) {
        throw new Error('Invite not found')
      }

      // Extract party ID from the public invite
      const foundPartyId = publicInviteResult.invite.party_id || 
                          publicInviteResult.invite.partyId ||
                          publicInviteResult.invite.invite_data?.partyId

      if (!foundPartyId) {
        throw new Error('Party ID not found in invite data')
      }

      setPartyId(foundPartyId)

      // Load e-invites data using the party ID
      const einvitesResult = await partyDatabaseBackend.getEInvites(foundPartyId)
      if (einvitesResult.success && einvitesResult.einvites) {
        setEinvites(einvitesResult.einvites)
        setShareableLink(einvitesResult.einvites.shareableLink || `${window.location.origin}/e-invites/${inviteId}`)
      }

      // Load party details
      const partyResult = await partyDatabaseBackend.getPartyById(foundPartyId)
      if (partyResult.success && partyResult.party) {
        setPartyDetails(partyResult.party)

        // Extract guest list from party plan
        const partyPlan = partyResult.party.party_plan || {}
        const einvitesData = partyPlan.einvites || {}
        const guests = einvitesData.guestList || []
        setGuestList(guests)
        console.log('✅ Loaded guest list:', guests.length, 'guests')
      }

      // Load RSVPs for this party to show who has responded
      const rsvpsResult = await partyDatabaseBackend.getPartyRSVPs(foundPartyId)
      if (rsvpsResult.success && rsvpsResult.rsvps) {
        setRsvps(rsvpsResult.rsvps)
        console.log('✅ Loaded RSVPs:', rsvpsResult.rsvps.length, 'responses')
      }
    } catch (error) {
      console.error('Error loading invite data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle sent status for a guest
  const toggleSentStatus = (guestId) => {
    setSentInvites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(guestId)) {
        newSet.delete(guestId)
      } else {
        newSet.add(guestId)
      }
      saveSentInvitesToStorage(newSet)
      return newSet
    })
  }


  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link')
    }
  }

  const shareViaWhatsApp = () => {
    if (!shareableLink) {
      alert("No shareable link available")
      return
    }

    const childName = partyDetails?.child_name || 'Birthday Child'
    const theme = partyDetails?.theme || 'Birthday'
    const message = `🎉 You're invited to ${childName}'s ${theme} Party!\n\n${shareableLink}\n\nCan't wait to celebrate! 🎈`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Loading state
  if (loading) {
    return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
           <SnappyLoader text="Loading your party..." />
         </div>
    )
  }

  // No invite found
  if (!einvites) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Invitation Found</h1>
          <p className="text-gray-600 mb-4">This invitation doesn't exist or hasn't been created yet.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="manage-invite" />

      {/* Back to Dashboard Button - Desktop */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Mobile Quick Actions Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          {/* Back to Dashboard - Mobile */}
          <div className="mb-3">
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 -ml-2">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
            </Button>
          </div>

          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-900">Share Invitation</h1>
          </div>
          
          {/* Quick Share Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={shareViaWhatsApp}
              className="text-white text-[0.7rem] py-2 flex items-center gap-1"
              size="sm"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>

            <Button
              onClick={() => {
                const subject = `🎉 You're invited to ${partyDetails?.child_name}'s party!`
                const body = `View the invitation: ${shareableLink}`
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                window.open(mailtoUrl)
              }}
              className="text-white text-[0.7rem] py-2 flex items-center gap-1"
              size="sm"
              style={{ background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))' }}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button
              onClick={() => {
                const text = `🎉 You're invited to ${partyDetails?.child_name}'s party! ${shareableLink}`
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(text)}`
                window.open(facebookUrl, "_blank")
              }}
              className="text-white text-[0.7rem] py-2 flex items-center gap-1"
              size="sm"
              style={{ backgroundColor: '#1877F2' }}
            >
              <Share2 className="w-4 h-4" />
              Facebook
            </Button>
            <Button
              onClick={copyShareableLink}
              size="sm"
              className={`text-[0.7rem] py-2 flex items-center gap-1 ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'text-white'}`}
              style={!copied ? { background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))' } : {}}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Share Your Invitation
              </h1>
              <p className="text-gray-600 mt-1">
                Your invitation is ready to share with guests
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column: Invitation Preview */}
          <div className="order-1">
            <Card className="">
           
              <CardContent className="bg-transparent p-0">
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4 shadow-inner">
                  {einvites.image ? (
                    <img 
                      src={einvites.image || "/placeholder.png"} 
                      alt="Party Invitation" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mail className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sharing + Guest Management */}
          <div className="order-2 space-y-6">
            {/* Desktop Quick Share Section */}
            <Card className="hidden lg:block shadow-xl border-0 bg-white overflow-hidden">
              <div className="p-6 text-white mb-5" style={{ background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Share Your Invitation</h3>
                    <p className="text-sm" style={{ color: 'hsl(var(--primary-100))' }}>Get your party started!</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="space-y-4">
                {/* Quick Share Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={shareViaWhatsApp}
                    className="text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#25D366',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#128C7E'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </Button>

                  <Button
                    onClick={() => {
                      const subject = `🎉 You're invited to ${partyDetails?.child_name}'s party!`
                      const body = `View the invitation: ${shareableLink}`
                      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                      window.open(mailtoUrl)
                    }}
                    className="text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))'
                    }}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                  </Button>

                  <Button
                    onClick={() => {
                      const text = `🎉 You're invited to ${partyDetails?.child_name}'s party! ${shareableLink}`
                      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(text)}`
                      window.open(facebookUrl, "_blank")
                    }}
                    className="text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#1877F2',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#166FE5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1877F2'}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Facebook</span>
                  </Button>

                  <Button
                    onClick={() => {
                      const text = `🎉 You're invited to ${partyDetails?.child_name}'s party! ${shareableLink}`
                      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
                      window.open(twitterUrl, "_blank")
                    }}
                    className="text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#000000',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Twitter</span>
                  </Button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500 font-medium">or copy link</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Share Link */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-5">
                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Direct Link
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareableLink}
                      readOnly
                      className="text-xs bg-white font-mono border-gray-200 flex-1"
                      style={{
                        '--tw-ring-color': 'hsl(var(--primary-400))'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'hsl(var(--primary-400))'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'hsl(var(--gray-200))'
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={copyShareableLink}
                      className="px-4 font-medium transition-all duration-300 flex-shrink-0 text-white"
                      style={{
                        background: copied
                          ? '#22C55E'
                          : 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))'
                      }}
                      onMouseEnter={(e) => {
                        if (!copied) {
                          e.currentTarget.style.background = 'hsl(var(--primary-600))'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!copied) {
                          e.currentTarget.style.background = 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))'
                        }
                      }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <div className="text-xs text-green-600 mt-2 flex items-center animate-fade-in">
                      <Check className="w-3 h-3 mr-1" />
                      Link copied! Share it anywhere you like.
                    </div>
                  )}
                </div>

                {/* Guest Count Summary */}
                {/* {totalGuests > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {totalGuests} guests • {sentInvites} sent • {pendingInvites} pending
                      </span>
                    </div>
                  </div>
                )} */}
              </CardContent>
            </Card>

            {/* Mobile Copy Link Section */}
            <Card className="lg:hidden shadow-lg border-0 bg-white p-4">
              <CardContent>
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Direct Link
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="text-xs bg-gray-50 font-mono border-gray-200 flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={copyShareableLink}
                    className="px-3 transition-all duration-300 text-white"
                    style={{
                      background: copied
                        ? '#22C55E'
                        : 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))'
                    }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guest List with Invite Tracker */}
            {guestList.length > 0 && (
              <Card className="shadow-xl border-0 bg-white overflow-hidden">
                <div className="p-4 sm:p-6 text-white" style={{ background: 'linear-gradient(to right, hsl(var(--primary-500)), hsl(var(--primary-600)))' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">Guest List</h3>
                        <p className="text-xs sm:text-sm" style={{ color: 'hsl(var(--primary-100))' }}>
                          {sentInvites.size} of {guestList.length} invited
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Tick the box as you send each invite
                    </p>
                  </div>

                  {/* Guest List */}
                  <div className="space-y-2">
                    {guestList.map((guest) => {
                      const isSent = sentInvites.has(guest.id)

                      // Find matching RSVP for this guest
                      const matchingRsvp = rsvps.find(r =>
                        r.child_name?.toLowerCase() === guest.childName?.toLowerCase() ||
                        r.guest_email?.toLowerCase() === guest.email?.toLowerCase()
                      )

                      const hasResponded = matchingRsvp && (matchingRsvp.attendance === 'yes' || matchingRsvp.attendance === 'no')

                      return (
                        <div
                          key={guest.id}
                          className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-[hsl(var(--primary-200))]"
                          style={{ borderColor: 'hsl(var(--gray-200))' }}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleSentStatus(guest.id)}
                            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                            style={{
                              backgroundColor: isSent ? 'hsl(var(--primary-500))' : 'white',
                              borderColor: isSent ? 'hsl(var(--primary-500))' : 'hsl(var(--gray-300))'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSent) e.currentTarget.style.borderColor = 'hsl(var(--primary-400))'
                            }}
                            onMouseLeave={(e) => {
                              if (!isSent) e.currentTarget.style.borderColor = 'hsl(var(--gray-300))'
                            }}
                          >
                            {isSent && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>

                          {/* Guest Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 truncate">
                                {guest.childName}
                              </p>
                              {hasResponded && (
                                <Badge
                                  className={`text-xs ${
                                    matchingRsvp.attendance === 'yes'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : 'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {matchingRsvp.attendance === 'yes' ? '✓ Coming' : 'Can\'t make it'}
                                </Badge>
                              )}
                            </div>
                            {guest.email && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">{guest.email}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {rsvps.filter(r => r.attendance === 'yes').length} confirmed attending
                      </span>
                      <span className="font-medium" style={{ color: 'hsl(var(--primary-600))' }}>
                        {sentInvites.size}/{guestList.length} sent
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
