"use client"

import Link from "next/link"
import { Users, Mail, Gift, Lock, ChevronRight } from "lucide-react"

export default function GuestsTabContent({
  partyToolsData,
  partyToolsKey,
  partyId,
  partyDetails,
  enquiries,
  visibleSuppliers,
}) {
  const venueEnquiry = enquiries.find(e => e.supplier_category === 'venue')
  const venueExists = !!visibleSuppliers.venue
  // QA bypass: set NEXT_PUBLIC_BYPASS_VENUE_LOCK=true to unlock e-invites without venue confirmation
  const bypassVenueLock = process.env.NEXT_PUBLIC_BYPASS_VENUE_LOCK === 'true'
  const isVenueConfirmed = bypassVenueLock || (venueEnquiry?.status === 'accepted' && venueEnquiry?.auto_accepted === false)
  const venueAwaitingConfirmation = !bypassVenueLock && venueEnquiry?.status === 'accepted' && venueEnquiry?.auto_accepted === true
  const hasPaidSuppliers = enquiries.some(e => ['paid', 'fully_paid', 'partial_paid'].includes(e.payment_status) || e.is_paid === true)

  const einvitesData = partyToolsData?.einvites
  // Check multiple possible fields that indicate an invite exists
  const einvitesCreated = !!einvitesData && (
    einvitesData.inviteId ||
    einvitesData.shareableLink ||
    einvitesData.friendlySlug ||
    einvitesData.templateId ||
    einvitesData.template ||
    einvitesData.guestList?.length > 0
  )
  const inviteId = einvitesData?.inviteId || einvitesData?.shareableLink?.split('/e-invites/')[1] || einvitesData?.friendlySlug
  const invitesSent = einvitesData?.guestList?.some(g => g.status === 'sent' || g.inviteSent === true) || false
  const sentCount = einvitesData?.guestList?.filter(g => g.status === 'sent' || g.inviteSent === true).length || 0

  // Get invite preview image - check multiple possible fields
  const invitePreviewImage = einvitesData?.image ||
    einvitesData?.generatedImage ||
    einvitesData?.aiOption?.imageUrl ||
    einvitesData?.inviteData?.image ||
    einvitesData?.previewImage ||
    einvitesData?.templateImage ||
    null

  const guestListData = partyToolsData?.guestList || []
  const giftRegistryData = partyToolsData?.giftRegistry
  const registryItemCountData = partyToolsData?.registryItemCount || 0

  const partyTools = [
    {
      id: 'guests',
      label: guestListData.length > 0 ? 'Manage Guest List' : 'Create Guest List',
      icon: Users,
      href: `/rsvps/${partyDetails?.id || ''}`,
      hasContent: guestListData.length > 0,
      count: guestListData.length,
      isLocked: false,
      status: guestListData.length > 0 ? `${guestListData.length} guest${guestListData.length !== 1 ? 's' : ''}` : 'Not created',
      description: guestListData.length > 0 ? 'View and manage your guest list' : 'Add guests for invites and RSVPs',
      image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361425/okpcftsuni04yokhex1l.jpg'
    },
    {
      id: 'einvites',
      label: einvitesCreated ? (invitesSent ? 'Manage Invites' : 'Send Invites') : 'Create E-Invites',
      icon: Mail,
      href: inviteId ? `/e-invites/${inviteId}/manage` : '/e-invites/create',
      hasContent: einvitesCreated,
      isLocked: !isVenueConfirmed,
      lockMessage: venueAwaitingConfirmation ? 'Waiting for venue to confirm your booking' : !venueExists ? 'Add a venue to your party first' : 'Venue must confirm your booking first',
      status: !isVenueConfirmed ? '🔒 Locked' : einvitesCreated ? invitesSent ? `${sentCount} sent` : '✓ Created' : 'Not created',
      description: !isVenueConfirmed ? (venueAwaitingConfirmation ? 'Waiting for venue confirmation' : 'Add and confirm venue first') : einvitesCreated ? (invitesSent ? 'Manage and track your invitations' : 'Share with guests') : 'Create beautiful digital invitations',
      image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1754388320/party-invites/seo3b2joo1omjdkdmjtw.png'
    },
    {
      id: 'registry',
      label: giftRegistryData ? 'Manage Registry' : 'Create Registry',
      icon: Gift,
      href: '/gift-registry',
      hasContent: !!giftRegistryData,
      count: registryItemCountData,
      isLocked: !hasPaidSuppliers,
      lockMessage: 'Secure at least one supplier to create registry',
      status: !hasPaidSuppliers ? '🔒 Locked' : giftRegistryData ? registryItemCountData > 0 ? `${registryItemCountData} item${registryItemCountData !== 1 ? 's' : ''}` : 'Registry created' : 'Not created',
      description: !hasPaidSuppliers ? 'Confirm suppliers first' : giftRegistryData ? registryItemCountData > 0 ? 'Manage your gift registry' : 'Add items to your registry' : 'Help guests know what to bring',
      image: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1753970180/iStock-2000435412-removebg_ewfzxs.png'
    }
  ]

  return (
    <div className="space-y-6 py-6 px-4">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 inline-block relative tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          Guests & Gifts
          <div className="absolute -bottom-1 left-0 w-full h-2 bg-primary-500 -skew-x-12 opacity-70"></div>
        </h2>
        <p className="text-sm text-gray-600 mt-3">Manage invitations, RSVPs, and gift registry</p>
      </div>

      {/* Party Tools - Stacked Widgets */}
      <div className="space-y-4">
        {partyTools.map((tool) => {
          const Icon = tool.icon
          const isLocked = tool.isLocked

          if (isLocked) {
            return (
              <div
                key={`${partyToolsKey}-${partyId}-${tool.id}`}
                className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-5 opacity-70 cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-400 text-lg">{tool.label}</h4>
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">Locked</span>
                    </div>
                    <p className="text-sm text-gray-400">{tool.lockMessage}</p>
                  </div>

                  {/* Disabled Button */}
                  <div className="flex-shrink-0">
                    <div className="px-5 py-2.5 bg-gray-200 text-gray-400 rounded-xl text-sm font-semibold">
                      Unlock
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={`${partyToolsKey}-${partyId}-${tool.id}`}
              href={tool.href}
              className="block bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Icon with colored background */}
                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-lg">{tool.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <div className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold group-hover:bg-primary-600 transition-colors">
                    {tool.hasContent ? 'Manage' : 'Create'}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Two Column Summary - Invite Preview & Guest Stats */}
      {(einvitesCreated || guestListData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Your Invite */}
          {einvitesCreated && (
            <Link
              href={inviteId ? `/e-invites/${inviteId}/manage` : '/e-invites/create'}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {invitePreviewImage ? (
                  <img
                    src={invitePreviewImage}
                    alt="Your invite"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Mail className="w-12 h-12 text-primary-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-lg">Your Invite</p>
                  <p className="text-white/80 text-sm">{invitesSent ? `${sentCount} sent` : 'Ready to send'}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Right Column - Guest Summary */}
          {guestListData.length > 0 && (
            <Link
              href={`/rsvps/${partyDetails?.id || ''}`}
              className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 text-lg">Guest List</h4>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>

              {/* Guest avatars/names preview */}
              <div className="space-y-3">
                {guestListData.slice(0, 4).map((guest, idx) => {
                  const guestName = guest.name || guest.childName || guest.guestName || 'Guest'
                  const isConfirmed = guest.attendance === 'yes' || guest.rsvpStatus === 'confirmed' || guest.rsvpStatus === 'attending' || guest.status === 'confirmed' || guest.status === 'yes'
                  return (
                    <div key={guest.id || idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                        {guestName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 text-sm flex-1 truncate">
                        {guestName}
                      </span>
                    </div>
                  )
                })}
                {guestListData.length > 4 && (
                  <p className="text-sm text-gray-500 pl-11">+{guestListData.length - 4} more guests</p>
                )}
              </div>

              {/* Stats at bottom */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">{guestListData.length} total</span>
                <span className="text-green-600 font-medium">
                  {guestListData.filter(g => g.attendance === 'yes' || g.rsvpStatus === 'confirmed' || g.rsvpStatus === 'attending' || g.status === 'confirmed' || g.status === 'yes').length} confirmed
                </span>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
