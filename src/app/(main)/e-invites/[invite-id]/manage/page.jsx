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

  const totalGuests = guestList.length
  const sentInvites = guestList.filter(g => g.status === 'sent').length
  const pendingInvites = guestList.filter(g => g.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="manage-invite" />
      
      {/* Mobile Quick Actions Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Share Invitation</h1>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/e-invites/${inviteId}`} target="_blank">
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/e-invites/${inviteId}/edit`}>
                  <Edit className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Quick Share Buttons */}
          <div className="grid grid-cols-4 gap-2">


   
            <Button 
              onClick={shareViaWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white text-[0.7rem] py-2 flex items-center gap-1"
              size="sm"
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
              className="bg-blue-500 hover:bg-blue-600 text-white text-[0.7rem] py-2 flex  items-center gap-1"
              size="sm"
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
              className="bg-blue-600 hover:bg-blue-700 text-white text-[0.7rem] py-2 flex items-center gap-1"
              size="sm"
            >
              <Share2 className="w-4 h-4" />
              Facebook
            </Button>
            <Button 
              onClick={copyShareableLink}
              variant="outline"
              size="sm"
              className={`text-[0.7rem] py-2 flex items-center gap-1 ${copied ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          
          {totalGuests > 0 && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              {totalGuests} guests • {sentInvites} sent • {pendingInvites} pending
            </div>
          )}
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
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="order-2 sm:order-1">
                <Link href={`/e-invites/${inviteId}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button asChild className="order-1 sm:order-2">
                <Link href={`/e-invites/create`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Regenerate
                </Link>
              </Button>
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
                
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/e-invites/${inviteId}`} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Invitation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sharing + Guest Management */}
          <div className="order-2 space-y-6">
            {/* Desktop Quick Share Section */}
            <Card className="hidden lg:block shadow-xl border-0 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white mb-5">
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
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={shareViaWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
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
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
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
                    className="bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0 flex items-center justify-center gap-2"
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
                    className={`px-3 transition-all duration-300 ${
                      copied 
                        ? "bg-green-500 hover:bg-green-600 text-white" 
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

     
          </div>
        </div>
      </div>
    </div>
  )
}
