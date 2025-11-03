// hooks/usePartyJourney.js - WITHOUT PARTY TEAM STEP

import { useMemo } from 'react'

export function usePartyJourney({ 
  suppliers, 
  enquiries, 
  partyDetails,
  guestList = [],
  giftRegistry = null,
  registryItemCount = 0,
  rsvps = [],
  einvites = null
}) {
  
  const steps = useMemo(() => {
    // Venue confirmation logic
    const venueEnquiry = enquiries.find(e => e.supplier_category === 'venue')
    const venueExists = !!suppliers.venue
    const venueConfirmed = venueEnquiry?.status === 'accepted' && 
                          venueEnquiry?.auto_accepted === false
    const venueAwaitingConfirmation = venueEnquiry?.status === 'accepted' && 
                                      venueEnquiry?.auto_accepted === true
    
    // Guest list status
    const guestListCreated = (guestList?.length || 0) > 0
    const guestCount = guestList?.length || 0
    
    // Gift registry status
    const giftRegistrySetup = !!giftRegistry
    
    // RSVPs status
    const rsvpsReceived = (rsvps?.length || 0) > 0
    const rsvpCount = rsvps?.filter(r => r.attending).length || 0
    
    // E-invites status
    const einvitesCreated = !!einvites && (
      einvites.inviteId || 
      einvites.shareableLink || 
      einvites.friendlySlug
    )
    
    const inviteId = einvites?.inviteId ||
                    einvites?.shareableLink?.split('/e-invites/')[1] ||
                    einvites?.friendlySlug

    return [
      // STEP 1: Payment
      {
        id: 'payment_complete',
        number: 1,
        title: 'Payment Secured',
        description: 'Deposit paid and party locked in',
        status: 'completed',
        icon: '/journey-icons/payment.png'
      },

      // STEP 2: Venue Confirmation (formerly Step 3)
      {
        id: 'venue_confirmation',
        number: 2,
        title: 'Venue Confirmation',
        description: venueAwaitingConfirmation
          ? 'Waiting for venue to confirm availability'
          : venueConfirmed
          ? 'Venue has confirmed your booking'
          : 'Add a venue to proceed',
        status: !venueExists ? 'locked' :
                venueConfirmed ? 'completed' : 'current',
        icon: '/journey-icons/location.png',
        component: 'VenueConfirmationStep',
        venueSupplier: suppliers.venue,
        venueEnquiry: venueEnquiry,
        venueAwaitingConfirmation: venueAwaitingConfirmation,
        unlockCondition: 'venue_added',
        unlockMessage: venueExists
          ? 'Waiting for venue to confirm your booking'
          : 'Add a venue to your party first'
      },

      // STEP 3: Guest List (formerly Step 4)
      {
        id: 'guest_list',
        number: 3,
        title: 'Build Guest List',
        description: guestListCreated
          ? `${guestCount} guest${guestCount !== 1 ? 's' : ''} added`
          : 'Create your list for invites and RSVPs',
        status: guestListCreated ? 'completed' : 'available',
        icon: '/journey-icons/guestlist.png',
        unlockCondition: null,
        unlockMessage: null,
        hasContent: guestListCreated,
        action: {
          label: guestListCreated ? 'Manage Guest List' : 'Create Guest List',
          href: `/rsvps/${partyDetails?.id || ''}`
        }
      },

      // STEP 4: Gift Registry (formerly Step 5)
      {
        id: 'gift_registry',
        number: 4,
        title: 'Set Up Gift Registry',
        description: giftRegistrySetup
          ? registryItemCount > 0
            ? `${registryItemCount} item${registryItemCount !== 1 ? 's' : ''} in registry`
            : 'Registry created - add items'
          : 'Help guests know what to bring',
        status: giftRegistrySetup ? 'completed' : 'available',
        icon: '/journey-icons/gift.png',
        unlockCondition: null,
        unlockMessage: null,
        hasContent: giftRegistrySetup,
        action: {
          label: giftRegistrySetup ? 'Manage Registry' : 'Create Registry',
          href: '/gift-registry'
        }
      },
      
      // STEP 5: E-Invites (formerly Step 6)
      {
        id: 'create_einvites',
        number: 5,
        title: 'Design E-Invites',
        description: einvitesCreated
          ? 'Invitation created and ready'
          : 'Create beautiful digital invitations',
        status: !venueConfirmed ? 'locked' :
                einvitesCreated ? 'completed' : 'available',
        icon: '/journey-icons/einvites.png',
        unlockCondition: 'venue_confirmed',
        unlockMessage: 'Venue must be confirmed before creating invites',
        hasContent: einvitesCreated,
        action: {
          label: einvitesCreated ? 'Manage Invites' : 'Create E-Invites',
          href: einvitesCreated && inviteId
            ? `/e-invites/${inviteId}/manage`
            : '/e-invites/create'
        }
      },

      // STEP 6: Track RSVPs
      {
        id: 'track_rsvps',
        number: 6,
        title: 'Track RSVPs',
        description: rsvpsReceived
          ? `${rsvpCount} confirmed attending`
          : 'See who\'s coming to the party',
        status: rsvpsReceived ? 'completed' : 'available',
        icon: '/journey-icons/rsvps.png',
        unlockCondition: null,
        unlockMessage: null,
        metrics: {
          total: guestCount,
          confirmed: rsvpCount
        },
        action: {
          label: 'View RSVPs',
          href: `/rsvps/${partyDetails?.id || ''}`
        }
      },

      // STEP 7: Final Details
      {
        id: 'final_details',
        number: 7,
        title: 'Final Details',
        description: 'Confirm numbers and arrangements',
        status: !partyDetails?.final_details_sent ? 'locked' : 'completed',
        icon: 'https://res.cloudinary.com/dghzq6xtd/image/upload/v1756386472/iStock-2067025996_p6x3k4.jpg', // Entertainment image (for final party details)
        unlockCondition: 'final_details_sent',
        unlockMessage: 'Final party details will be sent 7 days before your party',
        daysBeforeParty: 7
      }
    ]
  }, [suppliers, enquiries, partyDetails, guestList, giftRegistry, registryItemCount, rsvps, einvites])
  
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const currentStep = steps.find(s => s.status === 'current') || steps.find(s => s.status === 'available')
  
  return {
    steps,
    currentStep,
    completedSteps,
    totalSteps: steps.length,
    progress: (completedSteps / steps.length) * 100
  }
}