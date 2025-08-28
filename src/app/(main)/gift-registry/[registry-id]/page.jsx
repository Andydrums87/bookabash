// src/app/gift-registry/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { 
  Gift, 
  Star, 
  ArrowRight, 
  Calendar, 
  MapPin,
  Users,
  Heart,
  Sparkles,
  Plus,
  Eye,
  Share2,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"

export default function GiftRegistryOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeParty, setActiveParty] = useState(null)
  const [hasRegistry, setHasRegistry] = useState(false)
  const [checkingRegistry, setCheckingRegistry] = useState(false)
  const [registryData, setRegistryData] = useState(null)
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
      console.log('User wants to create - redirecting to create page')
      router.replace('/gift-registry/create')
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
    // Check for registry when we have an active party
    if (activeParty) {
      console.log('Active party changed, checking for registry...')
      checkForRegistry()
    }
  }, [activeParty])

  useEffect(() => {
    // Only redirect if we should and have valid data
    if (shouldRedirect && hasRegistry && registryData && registryData.id) {
      console.log('Redirecting to management page:', registryData.id)
      router.replace(`/gift-registry/${registryData.id}/manage`)
    }
  }, [hasRegistry, registryData, shouldRedirect, router])

  const checkAuthAndParties = async () => {
    try {
      setLoading(true)
      console.log('Starting auth and parties check...')
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth error:', error)
        setUser(null)
        return
      }
      
      console.log('Current user:', user?.id)
      setUser(user)
      
      if (user) {
        // Use getCurrentParty method
        console.log('Using getCurrentParty method...')
        const currentPartyResult = await partyDatabaseBackend.getCurrentParty()
        
        console.log('getCurrentParty result:', currentPartyResult)
        
        if (currentPartyResult.success && currentPartyResult.party) {
          console.log('Found current party:', currentPartyResult.party.id)
          setActiveParty(currentPartyResult.party)
        }
      }
    } catch (error) {
      console.error('Exception in checkAuthAndParties:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForRegistry = async () => {
    try {
      setCheckingRegistry(true)
      console.log('Checking if party has registry for party ID:', activeParty.id)
      
      // Check if party has a gift registry
      const result = await partyDatabaseBackend.getGiftRegistry(activeParty.id)
      
      console.log('getGiftRegistry result:', result)
      
      if (result.success && result.registry) {
        setHasRegistry(true)
        setRegistryData(result.registry)
        console.log('Registry data:', result.registry)
      } else {
        setHasRegistry(false)
        setRegistryData(null)
      }
    } catch (error) {
      console.error('Exception checking registry:', error)
      setHasRegistry(false)
      setRegistryData(null)
    } finally {
      setCheckingRegistry(false)
    }
  }

  // Loading state
  if (loading || checkingRegistry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading your parties...' : 'Checking your gift registry...'}
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

  // If user came to create or we don't have registry, show create flow
  if (!hasRegistry || !shouldRedirect) {
    return <GiftRegistryWithPartyPage activeParty={activeParty} hasRegistry={hasRegistry} registryData={registryData} />
  }

  // If we get here, we have registry but no ID to redirect to
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registry Found</h1>
          <p className="text-gray-600 mb-6">
            We found your gift registry but need to complete the setup.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
              <Link href="/gift-registry/create">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-purple-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Gift Registry</h1>
          <p className="text-gray-600 mb-6">Sign in to create and manage gift registries for your parties.</p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
              <Link href="/signin">
                Sign In
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <ContextualBreadcrumb currentPage="Gift Registry" />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-purple-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Create a Gift Registry?</h1>
          <p className="text-xl text-gray-600 mb-2">First, let's plan your party!</p>
          <p className="text-gray-500">You'll need to set up your party details before creating a gift registry.</p>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Let's Start Planning!</h2>
          </div>
          
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Create your perfect party first, then we'll help you set up a beautiful gift registry 
            that makes it easy for guests to choose the perfect presents.
          </p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <Button asChild className="w-full bg-white text-purple-600 hover:bg-gray-50 rounded-xl font-bold py-3">
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
function GiftRegistryWithPartyPage({ activeParty, hasRegistry, registryData }) {
  const [registryItems, setRegistryItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    if (hasRegistry && registryData) {
      fetchRegistryItems()
    } else {
      setLoadingItems(false)
    }
  }, [hasRegistry, registryData])

  const fetchRegistryItems = async () => {
    try {
      setLoadingItems(true)
      const result = await partyDatabaseBackend.getGiftRegistryItems(registryData.id)
      
      if (result.success) {
        setRegistryItems(result.items || [])
      }
    } catch (error) {
      console.error('Error fetching registry items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'shared': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const claimedItems = registryItems.filter(item => item.is_claimed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <ContextualBreadcrumb currentPage="Gift Registry" />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gift Registry</h1>
            <p className="text-gray-600">Create and manage gift wishlists for your party</p>
          </div>
          
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Active Party Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{activeParty.child_name}'s {activeParty.theme} Party</h2>
                <div className="flex items-center space-x-4 text-purple-100">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(activeParty.party_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {activeParty.location}
                  </span>
                  {hasRegistry && (
                    <span className="flex items-center">
                      <Gift className="w-4 h-4 mr-2" />
                      Gift registry created
                    </span>
                  )}
                </div>
              </div>
              
              <Button asChild className="bg-white text-purple-600 hover:bg-gray-50">
                <Link href={hasRegistry ? `/gift-registry/${registryData.id}/create` : "/gift-registry/create"}>
                  <Gift className="w-4 h-4 mr-2" />
                  {hasRegistry ? 'Manage Registry' : 'Create Registry'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registry Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Gift Registry</h3>
            {hasRegistry && registryData && (
              <span className="text-sm text-gray-500">
                Last updated {new Date(registryData.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingItems ? (
              // Loading state
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ) : hasRegistry ? (
              // Show existing registry
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {registryData.title || `${activeParty.child_name}'s Gift Registry`}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registryData.status)}`}>
                      {registryData.status || 'Active'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center">
                      <Gift className="w-4 h-4 mr-2" />
                      {registryItems.length} gift ideas
                    </p>
                    <p className="flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      {claimedItems} claimed
                    </p>
                    <p className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {activeParty.theme} theme
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/gift-registry/${registryData.id}/manage`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                    
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/gift-registry/${registryData.id}`} target="_blank">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // No registry placeholder
              <Card className="border-dashed border-2 border-gray-300 col-span-full">
                <CardContent className="p-8 text-center">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">No gift registry created yet</h4>
                  <p className="text-gray-600 mb-6">
                    Create a beautiful gift registry for {activeParty.child_name}'s {activeParty.theme} party
                  </p>
                  <Button asChild>
                    <Link href="/gift-registry/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Gift Registry
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Gift Registry Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <ShoppingCart className="w-6 h-6 text-purple-500 mr-3" />
                  <h4 className="font-semibold">Easy Shopping</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Guests can browse and claim gifts with direct purchase links
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Heart className="w-6 h-6 text-pink-500 mr-3" />
                  <h4 className="font-semibold">No Duplicates</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Track claimed items to avoid duplicate gifts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-6 h-6 text-blue-500 mr-3" />
                  <h4 className="font-semibold">Smart Suggestions</h4>
                </div>
                <p className="text-sm text-gray-600">
                  AI-powered gift recommendations based on age and theme
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats for existing registry */}
        {hasRegistry && registryItems.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{registryItems.length}</div>
                <div className="text-sm text-gray-600">Gift Ideas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{claimedItems}</div>
                <div className="text-sm text-gray-600">Claimed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {registryItems.length - claimedItems}
                </div>
                <div className="text-sm text-gray-600">Available</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {registryItems.length > 0 ? Math.round((claimedItems / registryItems.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}