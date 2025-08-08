import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Mail, Share2, Eye, Link as LinkIcon, Settings
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

function EInvitesCard({ 
  hasCreatedInvites, 
  onCreateInvites, 
  partyId, 

  partyDetails,
}) {
  const [einvites, setEinvites] = useState(null)
  const [guestList, setGuestList] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [inviteId, setInviteId] = useState(null) // ← Add this

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
        
        // ✅ GET THE INVITE ID from the einvites data
        const foundInviteId = result.einvites.inviteId || 
                             result.einvites.shareableLink?.split('/e-invites/')[1] ||
                             result.einvites.friendlySlug
        
        setInviteId(foundInviteId)
        console.log('📧 Found invite ID:', foundInviteId)
      }
      setDataLoaded(true)
    } catch (error) {
      console.error('Error loading e-invites:', error)
      setDataLoaded(true)
    }
  }

  // Calculate basic stats for display
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
                E-Invites
              </Badge>
              {hasCreatedInvites && totalGuests > 0 && (
                <div className="text-white text-sm font-medium">
                  {sentInvites}/{totalGuests} guests invited
                </div>
              )}
            </div>
            {hasCreatedInvites && (
              <Badge className="bg-green-500 text-white border-0">
                ✓ Ready
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {!hasCreatedInvites ? (
          // CREATE VIEW - Simple
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Digital Invites</h3>
              <p className="text-gray-600">Beautiful, shareable invitations for your party</p>
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
          // MANAGEMENT VIEW - Clean with direct link to management page
          <>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invitation Ready! 💌</h3>
              <p className="text-gray-600">Share with guests and track responses</p>
            </div>

            {/* Quick Stats */}
            {totalGuests > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalGuests}</div>
                  <div className="text-sm text-gray-600">Total Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sentInvites}</div>
                  <div className="text-sm text-gray-600">Invites Sent</div>
                </div>
              </div>
            )}

            {/* Management Actions */}
            <div className="space-y-3">
              {/* Primary Action: Manage & Share */}
              <Button 
            asChild 
            className="w-full bg-primary-400 hover:from-blue-600 hover:[hsl(var(--primary-600))] text-white rounded-xl"
          >
            <Link href={inviteId ? `/e-invites/${inviteId}/manage` : '#'}>
              <Settings className="w-4 h-4 mr-2" />
              {inviteId ? 'Manage & Share Invite' : 'Loading...'}
            </Link>
          </Button>

              {/* Secondary Action: Quick Preview */}
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-[hsl(var(--primary-100))] text-primary-500 hover:bg-[hsl(var(--primary-200))] hover:text-white rounded-xl"
              >
                <Link href={einvites?.shareableLink || '#'} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Invite
                </Link>
              </Button>
            </div>

            {/* Quick Share Hint */}
            {einvites?.shareableLink && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-[hsl(var(--primary-200))]">
                <div className="flex items-center text-gray-700 text-sm">
                  <Share2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Ready to share! Click "Manage & Share" to send to guests.</span>
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