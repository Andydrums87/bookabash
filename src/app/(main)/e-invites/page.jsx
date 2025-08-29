// src/app/e-invites/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { SnappyLoader } from "@/components/ui/SnappyLoader"
import { 
  Mail, 
  Star, 
  ArrowRight, 
  Users,
  Sparkles,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function EInvitesOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeParty, setActiveParty] = useState(null)
  const [hasEinvites, setHasEinvites] = useState(false)
  const [einvitesLoading, setEinvitesLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUserAndParty()
  }, [])

  const loadUserAndParty = async () => {
    try {
      setLoading(true)
      
      // Get user
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Auth error:', error)
        return
      }
      
      setUser(user)
      
      if (!user) {
        setLoading(false)
        return
      }

      // Get current party
      const partyResult = await partyDatabaseBackend.getCurrentParty()
      if (partyResult.success && partyResult.party) {
        setActiveParty(partyResult.party)
        
        // Check if this party has e-invites
        await checkForEinvites(partyResult.party.id)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForEinvites = async (partyId) => {
    try {
      setEinvitesLoading(true)
      
      // Use your existing hasCreatedEInvites method
      const result = await partyDatabaseBackend.hasCreatedEInvites(partyId)
      
      if (result.success && result.hasCreated) {
        // Get the actual e-invites data to get the invite ID
        const einvitesResult = await partyDatabaseBackend.getEInvites(partyId)
        
        if (einvitesResult.success && einvitesResult.einvites && einvitesResult.einvites.inviteId) {
          // Redirect to management page with the actual invite ID
          console.log('E-invites exist, redirecting to management page:', einvitesResult.einvites.inviteId)
          router.replace(`/e-invites/${einvitesResult.einvites.inviteId}/manage`)
          return
        }
      }
      
      setHasEinvites(false)
    } catch (error) {
      console.error('Error checking for e-invites:', error)
      setHasEinvites(false)
    } finally {
      setEinvitesLoading(false)
    }
  }

  const handleCreateEInvites = () => {
    setCreating(true)
    router.push('/e-invites/create')
  }

  // Loading state
  if (loading || einvitesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SnappyLoader text="Loading your party..." />
    </div>
    )
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-[hsl(var(--primary-100))] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[hsl(var(--primary-500))]" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Digital Invites</h1>
            <p className="text-gray-600 mb-6">Sign in to create beautiful digital invitations for your parties.</p>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-[hsl(var(--primary-500))] hover:bg-[hsl(var(--primary-600))] text-white rounded-xl">
                <Link href="/signin">Sign In</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full border-[hsl(var(--primary-200))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))] rounded-xl">
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No party planned
  if (!activeParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <ContextualBreadcrumb currentPage="E-Invites" />
        
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-[hsl(var(--primary-600))]" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Create Invites?</h1>
            <p className="text-xl text-gray-600 mb-2">First, let's plan your party!</p>
            <p className="text-gray-500">You'll need to set up your party details before creating invitations.</p>
          </div>

          <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Let's Start Planning!</h2>
            </div>
            
            <p className="text-[hsl(var(--primary-100))] mb-6 max-w-2xl mx-auto">
              PartySnap makes it easy to plan amazing parties. Start by setting up your party details, 
              then we'll help you create stunning invitations and manage everything seamlessly.
            </p>
            
            <Button asChild className="bg-white text-[hsl(var(--primary-600))] hover:bg-gray-50 rounded-xl font-bold py-3">
              <Link href="/dashboard">
                <Star className="w-5 h-5 mr-2" />
                Start Planning Your Party
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Has party but no e-invites - show create option with new layout
  if (!hasEinvites) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <ContextualBreadcrumb currentPage="E-Invites" />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Hero Section with Image Left, Content Right */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
            {/* Image Section */}
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                <img 
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1754388320/party-invites/seo3b2joo1omjdkdmjtw.png"
                  alt="Digital Party Invitations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Create {activeParty.child_name}'s Digital Invites
              </h1>
              <p className="text-xl text-gray-600 mb-6">Beautiful, shareable invitations for your party</p>
              <p className="text-lg text-gray-500 mb-8 max-w-lg">
                Send stunning invitations that match your theme and make RSVPs effortless.
              </p>

              {/* Create Button */}
              <div className="mb-6">
                <Button
                  onClick={handleCreateEInvites}
                  disabled={creating}
                  className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-8 py-6 text-lg rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Setting up {activeParty.child_name?.split(' ')[0]}'s Invites...
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mr-3" />
                      Create {activeParty.child_name?.split(' ')[0]}'s Digital Invites
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 mt-3">
                  Get started in just a few clicks
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Mail className="w-8 h-8 text-[hsl(var(--primary-600))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Easy Sharing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share via email, WhatsApp, or social media with a simple link
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Users className="w-8 h-8 text-[hsl(var(--primary-600))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">RSVP Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track responses and manage your guest list automatically
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Sparkles className="w-8 h-8 text-[hsl(var(--primary-600))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Custom Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-generated designs matching your party theme
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If we get here, hasEinvites is true and the useEffect will redirect
  // Show a loading state while redirecting
  return (
     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <SnappyLoader text="Loading your party..." />
          </div>
  )
}