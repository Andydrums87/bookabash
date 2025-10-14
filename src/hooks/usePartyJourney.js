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
    
    const invitesSent = einvites?.guestList?.some(g => g.status === 'sent') || false
    const sentCount = einvites?.guestList?.filter(g => g.status === 'sent').length || 0
    

    return [
      // STEP 1: Payment
      {
        id: 'payment_complete',
        number: 1,
        title: 'Payment Secured',
        description: 'Deposit paid and party locked in',
        status: 'completed',
        icon: '💳'
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
        icon: '🏛️',
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
        icon: '📋',
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
        icon: '🎁',
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
        icon: '💌',
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
      
      // STEP 6: Send Invites (formerly Step 7)
      {
        id: 'send_invites',
        number: 6,
        title: 'Send Invitations',
        description: invitesSent 
          ? `${sentCount} invite${sentCount !== 1 ? 's' : ''} sent`
          : 'Share your party with guests',
        status: !einvitesCreated ? 'locked' :
                invitesSent ? 'completed' : 'available',
        icon: '📬',
        unlockCondition: 'einvites_created',
        unlockMessage: 'Create your e-invites first before sending',
        metrics: {
          total: guestCount,
          sent: sentCount
        },
        action: {
          label: 'Manage Invites',
          href: inviteId
            ? `/e-invites/${inviteId}/manage`
            : '/e-invites/create'
        }
      },
      
      // STEP 7: Track RSVPs (formerly Step 8)
      {
        id: 'track_rsvps',
        number: 7,
        title: 'Track RSVPs',
        description: rsvpsReceived 
          ? `${rsvpCount} confirmed attending`
          : 'See who\'s coming to the party',
        status: guestListCreated ? 'available' : 'available',
        icon: '📊',
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
      
      // STEP 8: Final Details (formerly Step 9)
      {
        id: 'final_details',
        number: 8,
        title: 'Final Details',
        description: 'Confirm numbers and arrangements',
        status: 'upcoming',
        icon: '📝',
        unlockCondition: null,
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