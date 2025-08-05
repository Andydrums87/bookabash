import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Gift, Mail, Plus, Users, Send, Check, Clock, 
  MessageCircle, Copy, QrCode, Share2, X, 
  ExternalLink, Eye, Download, User, Phone,
  CalendarDays, MapPin, PartyPopper, Heart
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import GiftRegistryCard from '@/components/GiftRegistryCard'
import RSVPSummaryCard from "@/app/(main)/rsvps/components/RSVPSummaryCard"

import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

// Dynamic import for QR code to avoid SSR issues
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false })

// Add some debugging and better state handling

// Enhanced E-Invites Card Component - Simplified
function EInvitesCard({ 
  hasCreatedInvites, 
  onCreateInvites, 
  partyId, 
  partyDetails 
}) {
  const [einvites, setEinvites] = useState(null)
  const [guestList, setGuestList] = useState([])
  const [newGuest, setNewGuest] = useState({ name: "", contact: "", type: "email" })
  const [shareableLink, setShareableLink] = useState("")
  const [showGuestManager, setShowGuestManager] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingToGuest, setSendingToGuest] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load existing e-invites data
  useEffect(() => {
    if (partyId && hasCreatedInvites) {
      loadEInvitesData()
    }
  }, [partyId, hasCreatedInvites])

  const loadEInvitesData = async () => {
    try {
      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
      const result = await partyDatabaseBackend.getEInvites(partyId)
      
      if (result.success && result.einvites) {
        setEinvites(result.einvites)
        setGuestList(result.einvites.guestList || [])
        setShareableLink(result.einvites.shareableLink || "") // ← This should be the existing link
      } else {
        // Create default data if hasCreatedInvites is true
        const defaultEinvites = {
          id: `einvite_${Date.now()}`,
          partyId,
          guestList: [],
          shareableLink: "",
          createdAt: new Date().toISOString(),
          theme: partyDetails?.theme || 'default',
          inviteData: {
            childName: partyDetails?.child_name || '',
            age: partyDetails?.child_age || '',
            date: partyDetails?.party_date || '',
            time: partyDetails?.party_time || '',
            venue: partyDetails?.location || ''
          }
        }
        setEinvites(defaultEinvites)
      }
      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading e-invites:', error)
      setDataLoaded(true)
    }
  }

  const copyShareableLink = async () => {
    try {
      // Generate fresh invite
      const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const link = `${window.location.origin}/e-invites/${inviteId}`
      
      // 1. Save to public invites table (for RSVP page)
      const publicInviteResult = await partyDatabaseBackend.createPublicInvite({
        inviteId,
        partyId,
        theme: einvites?.theme || partyDetails?.theme,
        inviteData: einvites?.inviteData,
        generatedImage: einvites?.image, // Make sure this field matches
        generationType: einvites?.generationType || 'template',
        shareableLink: link,
      })
  
      if (publicInviteResult.success) {
        // 2. Update the einvites data with new link
        const updatedEinvites = {
          ...einvites,
          shareableLink: link,
          inviteId,
          updatedAt: new Date().toISOString(),
        }
        
        // 3. Save to party plan (for management)
        await partyDatabaseBackend.saveEInvites(partyId, updatedEinvites)
        
        // 4. Copy to clipboard
        await navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        
        setShareableLink(link)
        setEinvites(updatedEinvites)
      }
    } catch (error) {
      console.error("Failed to copy link:", error)
      alert("Failed to copy link to clipboard")
    }
  }

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

      try {
        const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
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
      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
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
      const link = shareableLink || await generateShareableLink()
      if (!link) {
        alert("Failed to generate invite link")
        return
      }

      const message = `🎉 You're invited to ${partyDetails?.child_name}'s Birthday Party!\n\n📅 ${partyDetails?.party_date}\n🕐 ${partyDetails?.party_time}\n📍 ${partyDetails?.location}\n\nView your magical invitation and RSVP: ${link}\n\nCan't wait to celebrate with you! 🎈`
      
      const whatsappUrl = `https://wa.me/${guest.contact.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
      await partyDatabaseBackend.updateGuestSendStatus(partyId, guest.id, 'sent', 'whatsapp')
      
      setGuestList(prev => 
        prev.map(g => 
          g.id === guest.id 
            ? { ...g, status: "sent", sentAt: new Date().toISOString(), sentMethod: 'whatsapp' }
            : g
        )
      )
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
      const link = shareableLink || await generateShareableLink()
      if (!link) {
        alert("Failed to generate invite link")
        return
      }

      const subject = `🎉 You're invited to ${partyDetails?.child_name}'s Birthday Party!`
      const body = `Hi ${guest.name}!\n\nYou're invited to ${partyDetails?.child_name}'s magical ${partyDetails?.theme} birthday party!\n\n📅 Date: ${partyDetails?.party_date}\n🕐 Time: ${partyDetails?.party_time}\n📍 Location: ${partyDetails?.location}\n\nView your beautiful invitation and RSVP here: ${link}\n\nWe can't wait to celebrate with you! 🎈✨\n\nLove,\n${partyDetails?.parent_name || 'The Birthday Family'}`
      
      const mailtoUrl = `mailto:${guest.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoUrl)

      const { partyDatabaseBackend } = await import("@/utils/partyDatabaseBackend")
      await partyDatabaseBackend.updateGuestSendStatus(partyId, guest.id, 'sent', 'email')
      
      setGuestList(prev => 
        prev.map(g => 
          g.id === guest.id 
            ? { ...g, status: "sent", sentAt: new Date().toISOString(), sentMethod: 'email' }
            : g
        )
      )
    } catch (error) {
      console.error('Error sending email:', error)
      alert("Failed to send email")
    } finally {
      setSendingToGuest(null)
    }
  }
 
  // Calculate basic stats  
  const totalGuests = guestList.length
  const sentInvites = guestList.filter(g => g.status === 'sent').length

  // Show loading state while data is loading
  if (hasCreatedInvites && !dataLoaded) {
    return (
      <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
          </div>
        </div>
        <CardContent className="p-6">
          <p className="text-gray-600">Loading your invites...</p>
        </CardContent>
      </Card>
    )
  }

  // Determine header image - use invite image if available, otherwise default
  const headerImage = (hasCreatedInvites && einvites?.image) 
    ? einvites.image 
    : "https://res.cloudinary.com/dghzq6xtd/image/upload/v1754388320/party-invites/seo3b2joo1omjdkdmjtw.png"

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200">
      {/* Header Image - Shows invite if created, otherwise default */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={headerImage}
          alt={hasCreatedInvites ? "Your Party Invitation" : "Party Invites"}
          className="w-full h-full object-cover"
        />
        
        {/* Status Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-end">
            <div>
              <Badge className="bg-primary-600 text-white border-0 mb-2">
                Party Invites
              </Badge>
              {hasCreatedInvites && (
                <div className="text-white text-sm font-medium">
                  {sentInvites}/{totalGuests} guests invited
                </div>
              )}
            </div>
            {hasCreatedInvites && (
              <Badge className="bg-green-500 text-white border-0">
                ✓ Created
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {!hasCreatedInvites ? (
          // CREATE VIEW
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Beautiful E-Invites</h3>
              <p className="text-gray-600">Get everyone excited about the party!</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-gray-900">Why create invites now?</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                While suppliers confirm, get your guest list sorted and build excitement! Digital invites are instant, trackable, and perfectly themed to your party.
              </p>
            </div>

            <Button
              onClick={onCreateInvites}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-400))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white rounded-xl"
            >
              <Mail className="w-5 h-5 mr-2" />
              Create E-Invites
            </Button>
          </>
        ) : (
          // MANAGEMENT VIEW - Simplified
          <>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invitation Ready! 💌</h3>
              <p className="text-gray-600">Manage your guest list and share your invite</p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => setShowGuestManager(!showGuestManager)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                {showGuestManager ? 'Hide' : 'Manage'} Guests ({totalGuests})
              </Button>

              <Button
                onClick={() => setShowShareOptions(!showShareOptions)}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl text-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Invite
              </Button>
            </div>

            {/* Guest Manager */}
            {showGuestManager && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-bold text-gray-900 mb-4">👥 Guest List</h4>
                
                {/* Add Guest Form */}
                <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Guest name"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder={newGuest.type === "email" ? "Email" : "Phone"}
                      value={newGuest.contact}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, contact: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newGuest.type}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-shrink-0"
                    >
                      <option value="email">📧 Email</option>
                      <option value="phone">📱 WhatsApp</option>
                    </select>
                    <Button
                      onClick={addGuest}
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Guest
                    </Button>
                  </div>
                </div>

                {/* Guest List */}
                {guestList.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {guestList.map(guest => (
                      <div key={guest.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{guest.name}</div>
                          <div className="text-xs text-gray-500 truncate">{guest.contact}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              guest.status === 'sent' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {guest.status === 'sent' ? '✓ Sent' : 'Pending'}
                          </Badge>
                          {guest.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => guest.type === 'phone' ? sendViaWhatsApp(guest) : sendViaEmail(guest)}
                              disabled={sendingToGuest === guest.id}
                              className="h-7 px-2 text-xs"
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
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Share Options */}
            {showShareOptions && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-bold text-gray-900 mb-4">🔗 Share Your Invitation</h4>
                
                <div className="space-y-3">
                  {/* Share Link */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">📎 Invite Link</span>
                      <Button
                        size="sm"
                        onClick={copyShareableLink}
                        className={`text-xs ${copied ? 'bg-green-500' : 'bg-blue-500'} hover:bg-blue-600 text-white`}
                      >
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700 mb-3">Share this link with anyone to view the invitation and RSVP</p>
                    <div className="text-xs text-blue-800 bg-white p-2 rounded border break-all">
                      {shareableLink || 'Generating link...'}
                    </div>
                  </div>

                  {/* Quick Action */}
                  <Button
                    onClick={() => window.open(shareableLink, '_blank')}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-sm"
                    disabled={!shareableLink}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Invitation
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
// Section Header Component
function SectionHeader({ section }) {
  return (
    <div className="mb-6 mt-[300px]">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
        <div className="w-20 h-20 flex-shrink-0">
          <Image
            src={section.image}
            alt={section.title}
            width={50}
            height={50}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <p>{section.title}</p>    
          <p className="text-gray-400 text-base mb-4">{section.subtitle}</p>
        </div>
      </h2>
    </div>
  );
}

// Main Whilst You Wait Section Component
function WhilstYouWaitSection({ 
  registry, 
  registryItems, 
  partyTheme, 
  childAge, 
  onCreateRegistry, 
  onAddItem, 
  registryLoading,
  partyId,
  partyDetails,
  hasCreatedInvites,
  onCreateInvites
}) {
  

  const section = {
    id: "whilst-you-wait",
    title: "Whilst You Wait",
    subtitle: "Perfect time to get these sorted!",
    image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753869777/ChatGPT_Image_Jul_30_2025_11_02_50_AM_vfmxd5.png"
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <SectionHeader section={section} />
      
      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
      <div id="gift-registry-card">
<GiftRegistryCard 
  partyId={partyId}
  partyDetails={partyDetails}
  partyTheme={partyTheme}
  childAge={childAge}


/>
</div>
<div id="rsvp-card">
        <RSVPSummaryCard 
          partyId={partyId}
        />
        </div>
        {/* Enhanced E-Invites Card */}
        <div id="einvites-card">
        <EInvitesCard 
          hasCreatedInvites={hasCreatedInvites}
          onCreateInvites={onCreateInvites}
          partyId={partyId}
          partyDetails={partyDetails}
        />
        </div>
      </div>
      
      {/* Optional: Help text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          ⏱️ While suppliers confirm availability, take care of these party essentials
        </p>
      </div>
    </div>
  )
}

export default WhilstYouWaitSection