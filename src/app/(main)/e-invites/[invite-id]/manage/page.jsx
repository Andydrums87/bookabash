"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { Mail, Send } from 'lucide-react'
import Link from "next/link"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import SnappyLoader from "@/components/ui/SnappyLoader"

export default function EInvitesManagementPage() {
  const params = useParams()
  const inviteId = params["invite-id"]

  // State
  const [loading, setLoading] = useState(true)
  const [einvites, setEinvites] = useState(null)
  const [partyId, setPartyId] = useState(null)

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
      }
    } catch (error) {
      console.error('Error loading invite data:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="manage-invite" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Your Invitation is Ready!
          </h1>
          <p className="text-gray-600">
            Your beautiful invitation has been created and saved
          </p>
        </div>

        {/* Invitation Preview */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[3/4] rounded-lg overflow-hidden">
                {einvites.image ? (
                  <img
                    src={einvites.image || "/placeholder.png"}
                    alt="Party Invitation"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Mail className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Invites Button */}
        <div className="max-w-md mx-auto">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Link href={`/rsvps/${partyId}`}>
              <Send className="w-5 h-5 mr-2" />
              Send Invites
            </Link>
          </Button>
          <p className="text-sm text-gray-500 text-center mt-4">
            Manage your guest list and send personalized invitations
          </p>
        </div>
      </div>
    </div>
  )
}
