
import { Suspense } from 'react'
import AnimatedRSVPPage from '../components/AnimatedRSVPPage'
import { Loader2 } from "lucide-react"

// In your page.jsx, replace the dynamic image generation with your static image:

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params
    const inviteId = resolvedParams['invite-id']

    const { partyDatabaseBackend } = await import('@/utils/partyDatabaseBackend')

    // Check if this looks like an RSVP code
    const looksLikeRSVPCode = inviteId &&
      inviteId.length === 8 &&
      /^[A-Z0-9]{8}$/.test(inviteId) &&
      !inviteId.includes('-')

    let childName = 'Birthday Child'
    let theme = 'birthday'
    let date = ''
    let venue = ''

    if (looksLikeRSVPCode) {
      // Try RSVP code lookup
      const rsvpResult = await partyDatabaseBackend.getInviteByRSVPCode(inviteId)

      if (rsvpResult.success && rsvpResult.inviteDetails) {
        childName = rsvpResult.inviteDetails.inviteData?.childName || 'Birthday Child'
        theme = rsvpResult.inviteDetails.theme || 'birthday'
        date = rsvpResult.inviteDetails.inviteData?.date || ''
        venue = rsvpResult.inviteDetails.inviteData?.venue || ''
      }
    } else {
      // Regular invite lookup
      const result = await partyDatabaseBackend.getPublicInvite(inviteId)

      if (result.success && result.invite) {
        const invite = result.invite

        childName = invite.parties?.child_name ||
                    invite.invite_data?.inviteData?.childName ||
                    'Birthday Child'
        theme = invite.parties?.theme ||
                invite.invite_data?.inviteData?.theme ||
                'birthday'
        date = invite.parties?.party_date ||
               invite.invite_data?.inviteData?.date || ''
        venue = invite.parties?.location ||
                invite.invite_data?.inviteData?.venue || ''
      }
    }

    const title = `You're Invited to ${childName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Party!`
    const description = `Join ${childName} for an amazing ${theme} birthday celebration${date ? ` on ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}${venue ? ` in ${venue}` : ''}! RSVP and see all the party details.`
    const currentUrl = `${process.env.NODE_ENV === 'production' ? 'https://partysnap.co.uk' : 'http://localhost:3000'}/e-invites/${inviteId}`

    // USE YOUR STATIC CLOUDINARY IMAGE
    const socialImage = "https://res.cloudinary.com/dghzq6xtd/image/upload/c_fit,w_1200,h_630,b_white/v1752578794/Transparent_With_Text_1_nfb1pi.png"

    console.log('🎨 Using static Cloudinary image:', socialImage)

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: currentUrl,
        siteName: 'PartySnap',
        images: [
          {
            url: socialImage,
            width: 1200,
            height: 630,
            alt: `PartySnap - ${childName}'s ${theme} party invitation`,
            type: 'image/png',
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [socialImage],
      },
      other: {
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/png',
        'og:site_name': 'PartySnap',
      }
    }
  } catch (error) {
    console.error('❌ Error generating metadata:', error)
    const fallbackImage = "https://res.cloudinary.com/dghzq6xtd/image/upload/c_fit,w_1200,h_630,b_white/v1752578794/Transparent_With_Text_1_nfb1pi.png"

    return {
      title: 'Party Invitation - PartySnap',
      description: 'Join us for a special celebration!',
      openGraph: {
        siteName: 'PartySnap',
        images: [{
          url: fallbackImage,
          width: 1200,
          height: 630,
          alt: 'PartySnap - Children\'s Party Planning Platform'
        }],
      }
    }
  }
}
// Loading component for Suspense fallback
function InvitePageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 overflow-hidden relative -mt-16 pt-16">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Loading your invitation...</h2>
          <p className="text-gray-600">Just a moment while we prepare everything!</p>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<InvitePageLoading />}>
      <AnimatedRSVPPage />
    </Suspense>
  )
}