// src/app/gift-registry/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { SnappyLoader } from "@/components/ui/SnappyLoader"
import { 
  Gift, 
  Star, 
  ArrowRight, 
  Plus,
  Sparkles,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { partyDatabaseBackend } from "@/utils/partyDatabaseBackend"
import { useGiftRegistry } from "@/hooks/useGiftRegistry"

export default function GiftRegistryOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeParty, setActiveParty] = useState(null)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  // Use the same hook as GiftRegistryCard
  const { 
    registry, 
    registryItems, 
    loading: registryLoading, 
    hasRegistry,
    createRegistry,
    refreshRegistry 
  } = useGiftRegistry(activeParty?.id)

  useEffect(() => {
    loadUserAndParty()
  }, [])

  // Auto-redirect if registry exists (same logic as GiftRegistryCard)
  useEffect(() => {
    if (!loading && !registryLoading && hasRegistry && registry) {
      console.log('Registry exists, redirecting to:', registry.id)
      router.replace(`/gift-registry/${registry.id}/create`)
    }
  }, [loading, registryLoading, hasRegistry, registry, router])

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
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRegistry = async () => {
    if (!activeParty) return
    
    try {
      setCreating(true)
      
      // Use the same createRegistry logic as GiftRegistryCard
      const result = await createRegistry({
        title: `${activeParty.child_name || 'Birthday'} Party Gift Registry`,
        description: `Gift registry for ${activeParty.child_name}'s ${activeParty.theme || 'themed'} party`,
        theme: activeParty.theme?.toLowerCase(),
        child_age: activeParty.child_age
      })
      
      console.log('Create registry result:', result)
      
      if (result.success && result.registry) {
        console.log('Navigating to new registry:', result.registry.id)
        router.push(`/gift-registry/${result.registry.id}/create`)
      } else {
        console.error('Failed to create registry:', result.error)
        alert('Failed to create gift registry. Please try again.')
      }
    } catch (error) {
      console.error('Error creating registry:', error)
      alert('Failed to create gift registry. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Loading state
  if (loading || registryLoading) {
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
              <Gift className="w-8 h-8 text-[hsl(var(--primary-500))]" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Gift Registry</h1>
            <p className="text-gray-600 mb-6">Sign in to create and manage gift registries for your parties.</p>
            
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
        <ContextualBreadcrumb currentPage="Gift Registry" />
        
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Gift className="w-12 h-12 text-[hsl(var(--primary-600))]" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Ready to Create a Gift Registry?</h1>
            <p className="text-xl text-gray-600 mb-2">First, let's plan your party!</p>
            <p className="text-gray-500">You'll need to set up your party details before creating a gift registry.</p>
          </div>

          <div className="bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-3xl p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Let's Start Planning!</h2>
            </div>
            
            <p className="text-[hsl(var(--primary-100))] mb-6 max-w-2xl mx-auto">
              Create your perfect party first, then we'll help you set up a beautiful gift registry 
              that makes it easy for guests to choose the perfect presents.
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

  // Has party but no registry - show create option with new layout
  if (!hasRegistry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <ContextualBreadcrumb currentPage="Gift Registry" />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Hero Section with Image Left, Content Right */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
            {/* Image Section */}
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                <img 
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753970180/iStock-2000435412-removebg_ewfzxs.png"
                  alt="Gift Registry"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Create {activeParty.child_name}'s Gift Registry
              </h1>
              <p className="text-xl text-gray-600 mb-6">Help your guests choose the perfect gifts!</p>
              <p className="text-lg text-gray-500 mb-8 max-w-lg">
                Set up a wishlist that makes gift-giving easy and fun for everyone.
              </p>

              {/* Create Button */}
              <div className="mb-6">
                <Button
                  onClick={handleCreateRegistry}
                  disabled={creating}
                  className=" bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-8  py-6 text-lg rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Creating {activeParty.child_name?.split(' ')[0]}'s Registry...
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mr-3" />
                      Create {activeParty.child_name?.split(' ')[0]}'s Gift Registry
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 mt-3">
                  Takes less than 2 minutes to set up
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Gift className="w-8 h-8 text-[hsl(var(--primary-600))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Easy Shopping</h3>
                <p className="text-gray-600 leading-relaxed">
                  Guests can browse and claim gifts with direct purchase links
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Star className="w-8 h-8 text-[hsl(var(--primary-600))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">No Duplicates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track claimed items to avoid duplicate gifts
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Sparkles className="w-8 h-8 text-[hsl(var(--primary-600))]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Smart Suggestions</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-powered gift recommendations based on age and theme
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If we get here, hasRegistry is true and the useEffect will redirect
  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary-500))] mx-auto mb-4" />
        <p className="text-gray-600">Loading your gift registry...</p>
      </div>
    </div>
  )
}