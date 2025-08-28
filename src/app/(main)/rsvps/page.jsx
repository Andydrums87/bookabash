"use client"

import { useUserTypeDetection } from '@/hooks/useUserTypeDetection'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RSVPRedirectPage() {
  const router = useRouter()
  const { userType, userContext, loading } = useUserTypeDetection()

  useEffect(() => {
    if (loading) return

    switch (userType) {
      case 'ANONYMOUS':
      case 'ERROR_FALLBACK':
        router.push('/party-builder?message=create-party-first&feature=rsvp')
        return

      case 'MIGRATION_NEEDED':
        router.push('/party-builder?message=complete-party-setup&feature=rsvp')
        return

      case 'LOCALSTORAGE_USER':
        router.push('/dashboard-local?message=sign-in-for-rsvp')
        return

      case 'DATABASE_USER':
        if (userContext.currentPartyId) {
          // Redirect to the party-specific RSVP page
          router.push(`/dashboard/${userContext.currentPartyId}/rsvps`)
        } else {
          router.push('/party-builder?message=create-party-first&feature=rsvp')
        }
        return

      default:
        router.push('/party-builder')
        return
    }
  }, [userType, userContext, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}