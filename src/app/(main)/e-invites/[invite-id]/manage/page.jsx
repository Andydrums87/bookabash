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

export default function EInvitesManagementPage() {
  const params = useParams()
  const router = useRouter()
  const inviteId = params["invite-id"]

  // State
  const [loading, setLoading] = useState(true)
  const [einvites, setEinvites] = useState(null)
  const [partyDetails, setPartyDetails] = useState(null)
  const [partyId, setPartyId] = useState(null)
  const [guestList, setGuestList] = useState([])
  const [newGuest, setNewGuest] = useState({ name: "", contact: "", type: "email" })
  const [shareableLink, setShareableLink] = useState("")
  const [sendingToGuest, setSendingToGuest] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showAddGuest, setShowAddGuest] = useState(false)

  // Load data
  useEffect(() => {
    if (inviteId) {
      loadInviteData()
    }
  }, [inviteId])

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
        setGuestList(einvitesResult.einvites.guestList || [])
        setShareableLink(einvitesResult.einvites.shareableLink || `${window.location.origin}/e-invites/${inviteId}`)
      }

      // Load party details
      const partyResult = await partyDatabaseBackend.getPartyById(foundPartyId)
      if (partyResult.success && partyResult.party) {
        setPartyDetails(partyResult.party)
      }
    } catch (error) {
      console.error('Error loading invite data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Guest management functions
  const addGuest = async () => {
    if (newGuest.name.trim() && newGuest.contact.trim()) {
      const guest = {
        id: Date.now(),
        name: newGuest.name.trim(),
        contact: newGuest.contact.trim(),
        type: newGuest.type,
        status: "pending",
        addedAt: new Date().toISOString(),
      }

      const updatedGuestList = [...guestList, guest]
      setGuestList(updatedGuestList)
      setNewGuest({ name: "", contact: "", type: "email" })
      setShowAddGuest(false)

      try {
        const updatedEinvites = {
          ...einvites,
          guestList: updatedGuestList,
          updatedAt: new Date().toISOString(),
        }
        await partyDatabaseBackend.saveEInvites(partyId, updatedEinvites)
        setEinvites(updatedEinvites)
      } catch (error) {
        console.error('Error saving guest:', error)
      }
    }
  }

  const removeGuest = async (guestId) => {
    const updatedGuestList = guestList.filter(guest => guest.id !== guestId)
    setGuestList(updatedGuestList)

    try {
      const updatedEinvites = {
        ...einvites,
        guestList: updatedGuestList,
        updatedAt: new Date().toISOString(),
      }
      await partyDatabaseBackend.saveEInvites(partyId, updatedEinvites)
      setEinvites(updatedEinvites)
    } catch (error) {
      console.error('Error removing guest:', error)
    }
  }

  const sendViaWhatsApp = async (guest) => {
    setSendingToGuest(guest.id)
    try {
      if (!shareableLink) {
        alert("No shareable link available")
        return
      }

      const childName = partyDetails?.child_name || 'Birthday Child'
      const theme = partyDetails?.theme || 'Birthday'
      const age = partyDetails?.child_age || ''
      const venue = partyDetails?.location || 'Special Location'

      const message = `Hi ${guest.name}! 👋\n\n🎉 You're invited to ${childName}'s ${theme} Party!\n\n${age ? `🎂 ${childName} is turning ${age}!\n` : ''}📍 Location: ${venue}\n\n✨ View your invitation here:\n${shareableLink}\n\nCan't wait to celebrate! 🎈\n\n*Powered by PartySnap*`

      const cleanPhone = guest.contact.replace(/\D/g, "")
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      // Update guest status
      await partyDatabaseBackend.updateGuestSendStatus(partyId, guest.id, 'sent', 'whatsapp')
      setGuestList(prev => prev.map(g => 
        g.id === guest.id 
          ? { ...g, status: "sent", sentAt: new Date().toISOString(), sentMethod: 'whatsapp' }
          : g
      ))
    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      alert("Failed to send WhatsApp message")
    } finally {
      setSendingToGuest(null)
    }
  }

  const sendViaEmail = async (guest) => {
    setSendingToGuest(guest.id)
    try {
      if (!shareableLink) {
        alert("No shareable link available")
        return
      }

      const childName = partyDetails?.child_name || 'Birthday Child'
      const theme = partyDetails?.theme || 'Birthday'
      const venue = partyDetails?.location || 'Special Location'

      const subject = `🎉 You're invited to ${childName}'s Birthday Party!`
      const body = `Hi ${guest.name}!\n\nYou're invited to ${childName}'s magical ${theme} birthday party!\n\n📍 Location: ${venue}\n\nView your beautiful invitation and RSVP here: ${shareableLink}\n\nWe can't wait to celebrate with you! 🎈✨\n\nLove,\nThe Birthday Family`

      const mailtoUrl = `mailto:${guest.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoUrl)

      await partyDatabaseBackend.updateGuestSendStatus(partyId, guest.id, 'sent', 'email')
      setGuestList(prev => prev.map(g => 
        g.id === guest.id 
          ? { ...g, status: "sent", sentAt: new Date().toISOString(), sentMethod: 'email' }
          : g
      ))
    } catch (error) {
      console.error('Error sending email:', error)
      alert("Failed to send email")
    } finally {
      setSendingToGuest(null)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[hsl(var(--primary-500))] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invitation...</p>
        </div>
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

  const totalGuests = guestList.length
  const sentInvites = guestList.filter(g => g.status === 'sent').length
  const pendingInvites = guestList.filter(g => g.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="manage-invite" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Share Your Invitation
              </h1>
              <p className="text-gray-600 mt-1">
                Your invitation is ready to share with guests
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="order-2 sm:order-1">
                <Link href={`/e-invites/${inviteId}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button asChild className="order-1 sm:order-2">
                <Link href={`/e-invites/${inviteId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Design
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Invitation Preview */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[hsl(var(--primary-500))]" />
                  Your Invitation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-6 shadow-inner">
                  {einvites.image ? (
                    <img 
                      src={einvites.image || "/placeholder.svg"} 
                      alt="Party Invitation" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mail className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <Button asChild className="w-full" variant="outline" size="lg">
                  <Link href={`/e-invites/${inviteId}`} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Invitation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sharing + Guest Management */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Quick Share Section */}
            <Card className="shadow-xl border-0 bg-white overflow-hidden p-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Share Your Invitation</h3>
                    <p className="text-blue-100 text-sm">Get your party started!</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="space-y-4">
                {/* Quick Share Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={shareViaWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0"
                    size="lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      <span>Share on WhatsApp</span>
                      <div className="text-xs bg-green-400 px-2 py-1 rounded-full">Quick</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      const subject = `🎉 You're invited to ${partyDetails?.child_name}'s party!`
                      const body = `View the invitation: ${shareableLink}`
                      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                      window.open(mailtoUrl)
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0"
                    size="lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Mail className="w-5 h-5" />
                      <span>Share via Email</span>
                      <div className="text-xs bg-blue-400 px-2 py-1 rounded-full">Easy</div>
                    </div>
                  </Button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500 font-medium">or copy link</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Share Link */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Direct Link
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={shareableLink} 
                      readOnly 
                      className="text-xs bg-white font-mono border-gray-200 focus:border-blue-400 flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={copyShareableLink}
                      className={`px-4 font-medium transition-all duration-300 flex-shrink-0 ${
                        copied 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-gray-800 hover:bg-gray-900 text-white"
                      }`}
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
                {totalGuests > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {totalGuests} guests • {sentInvites} sent • {pendingInvites} pending
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guest Management Section */}
            <div className="space-y-6">
              {/* Add Guest */}
              <Card className="p-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[hsl(var(--primary-500))]" />
                      Guest Management
                    </CardTitle>
                    <Button 
                      onClick={() => setShowAddGuest(!showAddGuest)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guest
                    </Button>
                  </div>
                </CardHeader>
                
                {showAddGuest && (
                  <CardContent className="border-t">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          placeholder="Guest name"
                          value={newGuest.name}
                          onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                          className="text-base"
                        />
                        
                        <div className="flex gap-2">
                          <select
                            value={newGuest.type}
                            onChange={(e) => setNewGuest(prev => ({ ...prev, type: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-shrink-0 bg-white"
                          >
                            <option value="email">📧 Email</option>
                            <option value="phone">📱 WhatsApp</option>
                          </select>
                          
                          <Input
                            placeholder={newGuest.type === "email" ? "Email address" : "Phone number"}
                            value={newGuest.contact}
                            onChange={(e) => setNewGuest(prev => ({ ...prev, contact: e.target.value }))}
                            className="flex-1 text-base"
                            inputMode={newGuest.type === "phone" ? "tel" : "email"}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={addGuest}
                          className="flex-1 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white"
                          disabled={!newGuest.name.trim() || !newGuest.contact.trim()}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Guest
                        </Button>
                        
                        <Button
                          onClick={() => setShowAddGuest(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Guest List */}
              {guestList.length > 0 && (
                <Card className="p-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Guest List ({totalGuests})</CardTitle>
                      {pendingInvites > 0 && (
                        <Button
                          onClick={() => {
                            guestList
                              .filter(g => g.status === 'pending')
                              .forEach((guest, index) => {
                                setTimeout(() => {
                                  guest.type === 'phone' ? sendViaWhatsApp(guest) : sendViaEmail(guest)
                                }, index * 1000) // Stagger sends
                              })
                          }}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send All ({pendingInvites})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {guestList.map(guest => (
                        <div 
                          key={guest.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {guest.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {guest.contact}
                            </div>
                            {guest.sentAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                Sent via {guest.sentMethod} • {new Date(guest.sentAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${
                                guest.status === 'sent'
                                  ? 'bg-[hsl(var(--primary-50))] text-[hsl(var(--primary-700))] border-[hsl(var(--primary-200))]'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              {guest.status === 'sent' ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Sent
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                            
                            {guest.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => guest.type === 'phone' ? sendViaWhatsApp(guest) : sendViaEmail(guest)}
                                disabled={sendingToGuest === guest.id}
                                className="h-8 px-3"
                              >
                                {sendingToGuest === guest.id ? (
                                  <div className="w-3 h-3 animate-spin border border-gray-400 border-t-transparent rounded-full" />
                                ) : guest.type === 'phone' ? (
                                  <MessageCircle className="w-3 h-3" />
                                ) : (
                                  <Mail className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeGuest(guest.id)}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {guestList.length === 0 && (
                <Card className="p-6">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No guests added yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by adding guests to share your beautiful invitation with them.
                    </p>
                    <Button 
                      onClick={() => setShowAddGuest(true)}
                      className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Guest
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
