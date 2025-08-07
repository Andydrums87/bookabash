
import { Suspense } from 'react'
import AnimatedRSVPPage from '../components/AnimatedRSVPPage'
import { Loader2 } from "lucide-react"

export async function generateMetadata({ params }) {
  try {
    const inviteId = params['invite-id']
    
    // Fetch the actual invite data to get the image and party details
    const { partyDatabaseBackend } = require('@/utils/partyDatabaseBackend')
    const result = await partyDatabaseBackend.getPublicInvite(inviteId)
    
    if (result.success && result.invite) {
      const invite = result.invite
      
      // Extract party data
      const childName = invite.parties?.child_name || 
                       invite.invite_data?.inviteData?.childName || 
                       'Birthday Child'
      const theme = invite.parties?.theme || 
                   invite.invite_data?.inviteData?.theme || 
                   'birthday'
      const date = invite.parties?.party_date || 
                  invite.invite_data?.inviteData?.date || ''
      const venue = invite.parties?.location || 
                   invite.invite_data?.inviteData?.venue || ''
      
      // Create rich social sharing content
      const title = `🎉 You're Invited to ${childName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Party!`
      const description = `Join ${childName} for an amazing ${theme} birthday celebration${date ? ` on ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}${venue ? ` in ${venue}` : ''}! RSVP and see all the party details.`
      const currentUrl = `${process.env.NODE_ENV === 'production' ? 'https://partysnap.com' : 'http://localhost:3000'}/e-invites/${inviteId}`
      
      // Use the AI-generated image for social sharing
      const socialImage = invite.generated_image || '/api/og-default'
      
      console.log('📱 Social metadata:', {
        title,
        description,
        socialImage,
        currentUrl
      })
      
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
              alt: `${childName}'s ${theme} party invitation`,
              type: 'image/jpeg',
            }
          ]
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [socialImage],
        },
        // Additional meta tags for better WhatsApp support
        other: {
          'og:image:width': '1200',
          'og:image:height': '630',
          'og:image:type': 'image/jpeg',
          'og:site_name': 'PartySnap',
          'og:type': 'website',
          // WhatsApp specific
          'whatsapp:image': socialImage,
        }
      }
    }
    
    // Fallback metadata
    return {
      title: '🎉 You\'re Invited to a Birthday Party!',
      description: 'Join us for a magical birthday celebration! RSVP and see all the party details.',
      openGraph: {
        title: '🎉 You\'re Invited to a Birthday Party!',
        description: 'Join us for a magical birthday celebration!',
        images: ['/api/og-default'],
      }
    }
    
  } catch (error) {
    console.error('Error generating social metadata:', error)
    return {
      title: 'Party Invitation - PartySnap',
      description: 'Join us for a special celebration!'
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