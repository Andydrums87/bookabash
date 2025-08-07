import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Gift, Mail, Plus, Users, Send, Check, Clock, 
  MessageCircle, Copy, QrCode, Share2, X, 
  ExternalLink, Eye, Download, User, Phone,
  CalendarDays, MapPin, PartyPopper, Heart,  Link as LinkIcon
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
      // Generate fresh invite with friendly structure
      const timestamp = Date.now()
      const childName = partyDetails?.childName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'party'  // ✅ childName
      const theme = partyDetails?.theme?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'birthday'       // ✅ theme
      const shortId = Math.random().toString(36).substr(2, 8)
      
      // Create friendly URL structure
      const inviteId = `invite_${timestamp}_${shortId}`
      const friendlySlug = `${childName}-${theme}-${shortId}`
      const link = `${window.location.origin}/e-invites/${inviteId}`
      
      console.log('🔗 Creating shareable invite:', {
        inviteId,
        friendlySlug,
        link,
        partyDetails: {
          childName: partyDetails?.childName,     // ✅ childName
          theme: partyDetails?.theme,             // ✅ theme
          date: partyDetails?.date,               // ✅ date
          image: einvites?.image
        }
      })
      
      // Enhanced public invite data with CORRECTED properties
      const publicInviteData = {
        inviteId,
        partyId,
        theme: einvites?.theme || partyDetails?.theme,
        inviteData: {
          childName: partyDetails?.childName || '',           // ✅ childName
          age: partyDetails?.childAge || '',                  // ✅ childAge
          date: partyDetails?.date || '',                     // ✅ date
          time: partyDetails?.time || '',                     // ✅ time
          venue: partyDetails?.location || '',                // ✅ location
          theme: partyDetails?.theme || '',                   // ✅ theme
          // Add social sharing specific data
          socialTitle: `🎉 You're Invited to ${partyDetails?.childName}'s ${partyDetails?.theme} Party!`,
          socialDescription: `Join ${partyDetails?.childName} for an amazing ${partyDetails?.theme} birthday celebration${partyDetails?.date ? ` on ${partyDetails.date}` : ''}! RSVP and see all the party details.`,
          friendlySlug
        },
        generatedImage: einvites?.image,
        generationType: einvites?.generationType || 'ai-generated',
        shareableLink: link,
        // Add metadata for better sharing
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: 'parent',
          shareable: true,
          socialOptimized: true
        }
      }
  
      // Rest of the function remains the same...
      const publicInviteResult = await partyDatabaseBackend.createPublicInvite(publicInviteData)
  
      if (publicInviteResult.success) {
        const updatedEinvites = {
          ...einvites,
          shareableLink: link,
          inviteId,
          friendlySlug,
          updatedAt: new Date().toISOString(),
          socialOptimized: true
        }
        
        await partyDatabaseBackend.saveEInvites(partyId, updatedEinvites)
        await navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        
        setShareableLink(link)
        setEinvites(updatedEinvites)
        
        console.log('✅ Shareable link created and optimized for social sharing')
      } else {
        throw new Error(publicInviteResult.error || 'Failed to create public invite')
      }
    } catch (error) {
      console.error("❌ Failed to create shareable link:", error)
      alert("Failed to create shareable link. Please try again.")
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

  const shareViaWhatsApp = () => {
    if (!shareableLink) {
      alert("Please generate a shareable link first")
      return
    }
    
    // Add timestamp to force WhatsApp to refetch
    const cacheBuster = Date.now()
    const linkWithCacheBuster = `${shareableLink}?v=${cacheBuster}`
    
    const message = `🎉 You're invited to Theo Joseph's Princess Party!
  
  ${linkWithCacheBuster}
  
  Can't wait to celebrate! 🎈`
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }
  
  
  // ALSO UPDATE your sendViaWhatsApp function (the one for individual guests):
  const sendViaWhatsApp = async (guest) => {
    setSendingToGuest(guest.id)
    
    try {
      const link = shareableLink || await generateShareableLink()
      if (!link) {
        alert("Failed to generate invite link")
        return
      }
  
      // CORRECTED: Use actual partyDetails properties
      const childName = partyDetails?.childName || 'Birthday Child'
      const theme = partyDetails?.theme || 'Birthday'
      const age = partyDetails?.childAge || ''
      const rawDate = partyDetails?.date || 'Soon'
      const rawTime = partyDetails?.time || ''
      const venue = partyDetails?.location || 'Special Location'
      
      // Format date and time
      const formatDate = (dateString) => {
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        } catch {
          return dateString
        }
      }
      
      const formatTime = (timeString) => {
        try {
          if (!timeString) return ''
          const [hours, minutes] = timeString.split(':')
          const date = new Date()
          date.setHours(parseInt(hours), parseInt(minutes))
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        } catch {
          return timeString
        }
      }
      
      const formattedDate = formatDate(rawDate)
      const formattedTime = formatTime(rawTime)
  
      const messageParts = [
        `Hi ${guest.name}! 👋`,
        '',
        `🎉 You're invited to ${childName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Party!`,
        '',
        age ? `🎂 ${childName} is turning ${age}!` : `🎂 ${childName}'s special celebration!`,
        `📅 Date: ${formattedDate}`,
        formattedTime ? `🕐 Time: ${formattedTime}` : '',
        `📍 Location: ${venue}`,
        '',
        '✨ View your magical invitation and RSVP here:',
        link,
        '',
        `Can't wait to celebrate with you! 🎈🎊`,
        '',
        '*Powered by PartySnap*'
      ]
  
      const message = messageParts.filter(part => part !== '').join('\n')
      
      // Clean phone number and create WhatsApp URL
      const cleanPhone = guest.contact.replace(/\D/g, "")
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      
      window.open(whatsappUrl, "_blank")
  
      // Update guest status
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

  // Test your image URL directly:
const testImageUrl = async () => {
  const imageUrl = einvites?.image
  if (!imageUrl) {
    alert('No image URL found')
    return
  }
  
  console.log('🖼️ Testing image URL:', imageUrl)
  
  try {
    const response = await fetch(imageUrl)
    console.log('Image response:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      url: imageUrl
    })
    
    if (response.ok) {
      alert('✅ Image URL is accessible!')
      window.open(imageUrl, '_blank')
    } else {
      alert('❌ Image URL returned error: ' + response.status)
    }
  } catch (error) {
    alert('❌ Failed to fetch image: ' + error.message)
    console.error('Image fetch error:', error)
  }
}
  
const ShareOptionsPanel = ({ shareableLink, partyDetails, einvites, onClose }) => {
  const [qrCodeVisible, setQrCodeVisible] = useState(false)
  
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-gray-900">🚀 Share Your Invitation</h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>


      
      {/* Enhanced Share Link Section */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Shareable Invite Link</span>
          </div>
          <Button
            size="sm"
            onClick={copyShareableLink}
            className={`text-xs transition-all duration-200 ${
              copied 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy Link
              </>
            )}
          </Button>
          <Button onClick={testImageUrl} variant="outline" size="sm" className="mb-2">
  🖼️ Test Image URL
</Button>

        </div>
        
        <p className="text-xs text-blue-700 mb-3">
          ✨ This link shows a beautiful preview when shared on WhatsApp, Facebook, or other social platforms!
        </p>
        
        <div className="text-xs text-blue-800 bg-white/70 p-3 rounded-lg border border-blue-200 break-all font-mono">
          {shareableLink || 'Click "Copy Link" to generate...'}
        </div>
      </div>

      {/* Quick Share Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* WhatsApp Share */}
        <Button
          onClick={shareViaWhatsApp}
 
          className="bg-green-500 hover:bg-green-600 text-white text-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Share via WhatsApp
        </Button>
        
        {/* Preview Invite */}
        <Button
          onClick={() => window.open(shareableLink, '_blank')}
          variant="outline"
          disabled={!shareableLink}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 text-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Invite
        </Button>
      </div>

      {/* Advanced Options */}
      <div className="space-y-2">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <span>🔧 More Sharing Options</span>
            <span className="text-xs text-gray-500">(click to expand)</span>
          </summary>
          
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
            {/* QR Code */}
            <div>
              <Button
                onClick={() => setQrCodeVisible(!qrCodeVisible)}
                variant="outline"
                size="sm"
                disabled={!shareableLink}
                className="text-sm"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {qrCodeVisible ? 'Hide' : 'Show'} QR Code
              </Button>
              
              {qrCodeVisible && shareableLink && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 text-center">
                  <QRCode value={shareableLink} size={120} className="mx-auto" />
                  <p className="text-xs text-gray-600 mt-2">Scan to open invitation</p>
                </div>
              )}
            </div>

            {/* Download Image */}
            {einvites?.image && (
              <div>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(einvites.image)
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${partyDetails?.child_name?.replace(/\s+/g, '-') || 'party'}-invite.jpg`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (err) {
                      alert('Failed to download image')
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                <p className="text-xs text-gray-500 mt-1">Download the invite image to share manually</p>
              </div>
            )}

            {/* Social Media Share */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Share on Social Media:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    const text = `🎉 You're invited to ${partyDetails?.child_name}'s ${partyDetails?.theme} party!`
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(text)}`
                    window.open(url, '_blank')
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!shareableLink}
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  📘 Facebook
                </Button>
                <Button
                  onClick={() => {
                    const text = `🎉 You're invited to ${partyDetails?.child_name}'s ${partyDetails?.theme} party! ${shareableLink}`
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
                    window.open(url, '_blank')
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!shareableLink}
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  🐦 Twitter
                </Button>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Pro Tip */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600 text-sm">💡</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">Pro Tip:</p>
            <p className="text-xs text-yellow-700 leading-relaxed">
              When you share this link on WhatsApp or social media, it will automatically show a beautiful preview with your party image and details - no need to add extra text!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
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


{showShareOptions && (
  <ShareOptionsPanel 
    shareableLink={shareableLink}
    partyDetails={partyDetails}
    einvites={einvites}
    onClose={() => setShowShareOptions(false)}
  />
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
    <div className="mb-6 md:mt-35 mt-0">
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