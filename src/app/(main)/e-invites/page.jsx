"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { 
  Mail, 
  Star, 
  ArrowRight, 
  Calendar, 
  MapPin,
  Users,
  Gift,
  Sparkles,
  Plus
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function EInvitesOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userParties, setUserParties] = useState([])
  const [activeParty, setActiveParty] = useState(null)
  const [hasEinvites, setHasEinvites] = useState(false)
  const [checkingEinvites, setCheckingEinvites] = useState(false)
  const [einvitesData, setEinvitesData] = useState(null)
  const [shouldRedirect, setShouldRedirect] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user came here with intent to create/manage
    const urlParams = new URLSearchParams(window.location.search)
    const fromDashboard = urlParams.get('from') === 'dashboard'
    const createMode = urlParams.get('action') === 'create'
    const manageMode = urlParams.get('action') === 'manage'
    
    // If user explicitly wants to create, redirect to create page immediately
    if (createMode) {
      console.log('🚀 User wants to create - redirecting to create page')
      router.replace('/e-invites/create')
      return
    }
    
    // Don't redirect to management if user explicitly came to create
    if (fromDashboard) {
      setShouldRedirect(false)
    } else if (manageMode) {
      setShouldRedirect(true)
    }
    
    checkAuthAndParties()
  }, [])

  useEffect(() => {
    // Check for einvites when we have an active party
    if (activeParty) {
      console.log('🎯 Active party changed, checking for einvites...')
      checkForEinvites()
    }
  }, [activeParty])

  useEffect(() => {
    // Only redirect if we should and have valid data
    if (shouldRedirect && hasEinvites && einvitesData && einvitesData.inviteId) {
      console.log('🚀 Redirecting to management page:', einvitesData.inviteId)
      router.replace(`/e-invites/${einvitesData.inviteId}/manage`)
    }
  }, [hasEinvites, einvitesData, shouldRedirect, router])

  const checkAuthAndParties = async () => {
    try {
      setLoading(true)
      console.log('🔍 Starting auth and parties check...')
      
      // Check if user is signed in using Supabase directly
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth error:', error)
        setUser(null)
        return
      }
      
      console.log('✅ Current user:', user?.id)
      setUser(user)
      
      if (user) {
        // Use getCurrentParty method
        console.log('🔍 Using getCurrentParty method...')
        const currentPartyResult = await partyDatabaseBackend.getCurrentParty()
        
        console.log('📊 getCurrentParty result:', currentPartyResult)
        
        if (currentPartyResult.success && currentPartyResult.party) {
          console.log('✅ Found current party:', currentPartyResult.party.id)
          
          setUserParties([currentPartyResult.party])
          setActiveParty(currentPartyResult.party)
        }
      }
    } catch (error) {
      console.error('❌ Exception in checkAuthAndParties:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForEinvites = async () => {
    try {
      setCheckingEinvites(true)
      console.log('🔍 Checking if party has einvites for party ID:', activeParty.id)
      
      // Use your existing hasCreatedEInvites method
      const result = await partyDatabaseBackend.hasCreatedEInvites(activeParty.id)
      
      console.log('✅ hasCreatedEInvites result:', result)
      
      if (result.success && result.hasCreated) {
        // Get the actual einvites data
        const einvitesResult = await partyDatabaseBackend.getEInvites(activeParty.id)
        console.log('📧 getEInvites result:', einvitesResult)
        
        if (einvitesResult.success && einvitesResult.einvites) {
          setHasEinvites(true)
          setEinvitesData(einvitesResult.einvites)
          console.log('📧 Einvites data:', einvitesResult.einvites)
        }
      } else {
        setHasEinvites(false)
        setEinvitesData(null)
      }
    } catch (error) {
      console.error('❌ Exception checking einvites:', error)
      setHasEinvites(false)
      setEinvitesData(null)
    } finally {
      setCheckingEinvites(false)
    }
  }

  // Loading state
  if (loading || checkingEinvites) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading your parties...' : 'Checking your invitations...'}
          </p>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!user) {
    return <SignInPrompt />
  }

  // No parties planned
  if (!activeParty) {
    return <NoPartyPlannedPage />
  }

  // If user came to create or we don't have einvites, show create flow
  if (!hasEinvites || !shouldRedirect) {
    return <NoPartyPlannedPage />
  }

  // If we get here, we have einvites but no inviteId to redirect to
  // This could happen if the einvites data is incomplete
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Invitation Found</h1>
          <p className="text-gray-600 mb-6">
            We found your invitation but need to complete the setup.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
              <Link href="/e-invites/create">
                Complete Setup
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// Component for users not signed in
function SignInPrompt() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Digital Invites</h1>
          <p className="text-gray-600 mb-6">Sign in to create beautiful digital invitations for your parties.</p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-primary-500 hover:bg-[hsl(var(--primary-700))] text-white rounded-xl">
              <Link href="/signin">
                Sign In
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-[hsl(var(--primary-200))] text-primary-600 hover:bg-[hsl(var(--primary-50))] rounded-xl">
              <Link href="/sign-up">
                Create Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Component for users with no party planned
function NoPartyPlannedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ContextualBreadcrumb currentPage="E-Invites" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Create Invites?</h1>
          <p className="text-xl text-gray-600 mb-2">First, let's plan your party!</p>
          <p className="text-gray-500">You'll need to set up your party details before creating invitations.</p>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Let's Start Planning!</h2>
          </div>
          
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            PartySnap makes it easy to plan amazing parties. Start by setting up your party details, 
            then we'll help you create stunning invitations and manage everything seamlessly.
          </p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <Button asChild className="w-full bg-white text-blue-600 hover:bg-gray-50 rounded-xl font-bold py-3">
              <Link href="/dashboard">
                <Star className="w-5 h-5 mr-2" />
                Start Planning Your Party
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for users with existing parties
function EInvitesWithPartyPage({ activeParty, allParties }) {
  const [einvites, setEinvites] = useState(null)
  const [loadingEinvites, setLoadingEinvites] = useState(true)

  useEffect(() => {
    fetchPartyEinvites()
  }, [activeParty])

  const fetchPartyEinvites = async () => {
    try {
      setLoadingEinvites(true)
      // Use your existing getEInvites method
      const result = await partyDatabaseBackend.getEInvites(activeParty.id)
      
      if (result.success) {
        setEinvites(result.einvites)
      }
    } catch (error) {
      console.error('Error fetching e-invites:', error)
    } finally {
      setLoadingEinvites(false)
    }
  }

  const getInvitationStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getInvitationStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'sent': return 'Sent'
      case 'completed': return 'Active'
      default: return status || 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ContextualBreadcrumb currentPage="E-Invites" />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Digital Invitations</h1>
            <p className="text-gray-600">Create and manage beautiful party invitations</p>
          </div>
          
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Active Party Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{activeParty.child_name}'s {activeParty.theme} Party</h2>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(activeParty.party_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {activeParty.location}
                  </span>
                  {einvites && (
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Digital invites created
                    </span>
                  )}
                </div>
              </div>
              
              <Button asChild className="bg-white text-blue-600 hover:bg-gray-50">
                <Link href="/e-invites/create">
                  <Mail className="w-4 h-4 mr-2" />
                  {einvites ? 'Create New Invitation' : 'Create Invitation'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* E-Invites Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Digital Invitations</h3>
            {einvites && (
              <span className="text-sm text-gray-500">
                Last updated {new Date(einvites.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingEinvites ? (
              // Loading state
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ) : einvites ? (
              // Show existing e-invite
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {einvites.name || `${activeParty.child_name}'s Digital Invites`}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvitationStatusColor(einvites.status)}`}>
                      {getInvitationStatusText(einvites.status)}
                    </span>
                  </div>
                  
                  {/* Preview Image */}
                  {einvites.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={einvites.image} 
                        alt="Invitation preview"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {einvites.guestList?.length || 0} guests invited
                    </p>
                    <p className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {einvites.theme} theme
                    </p>
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created {new Date(einvites.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {einvites.inviteId ? (
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/e-invites/${einvites.inviteId}/manage`}>
                          Manage Invite
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="flex-1">
                        <Link href="/e-invites/create">
                          Complete Setup
                        </Link>
                      </Button>
                    )}
                    
                    {einvites.shareableLink && (
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={einvites.shareableLink} target="_blank">
                          View Live
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // No e-invites placeholder
              <Card className="border-dashed border-2 border-gray-300 col-span-full">
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">No digital invitations created yet</h4>
                  <p className="text-gray-600 mb-6">
                    Create stunning digital invitations for {activeParty.child_name}'s {activeParty.theme} party
                  </p>
                  <Button asChild>
                    <Link href="/e-invites/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Digital Invites
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* E-Invites Features Overview */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Digital Invites Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Mail className="w-6 h-6 text-blue-500 mr-3" />
                  <h4 className="font-semibold">Easy Sharing</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Share via email, WhatsApp, or social media with a simple link
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Users className="w-6 h-6 text-green-500 mr-3" />
                  <h4 className="font-semibold">RSVP Tracking</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Track responses and manage your guest list automatically
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-6 h-6 text-purple-500 mr-3" />
                  <h4 className="font-semibold">Custom Design</h4>
                </div>
                <p className="text-sm text-gray-600">
                  AI-generated or template-based designs matching your party theme
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats for existing e-invites */}
        {einvites && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Digital Invite</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {einvites.status === 'completed' ? 1 : 0}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {einvites.guestList?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Guests Invited</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  £{einvites.price || 25}
                </div>
                <div className="text-sm text-gray-600">Value</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}