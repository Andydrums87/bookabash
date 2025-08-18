"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sparkles, 
  Plus, 
  LogIn, 
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  PartyPopper,
  Gift,
  Cake
} from "lucide-react"
import { ContextualBreadcrumb } from "@/components/ContextualBreadcrumb"
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export default function DashboardWelcome({ onRefresh }) {
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLocalData, setHasLocalData] = useState(false)

  useEffect(() => {
    const checkAuthAndLocalData = async () => {
      try {
        // Check authentication status
        const userResult = await partyDatabaseBackend.getCurrentUser()
        setIsSignedIn(userResult.success)

        // Check for local storage data
        const localPlan = localStorage.getItem('party_plan')
        const localDetails = localStorage.getItem('party_details')
        
        let hasValidLocalData = false
        
        if (localPlan || localDetails) {
          try {
            const parsedPlan = localPlan ? JSON.parse(localPlan) : null
            const parsedDetails = localDetails ? JSON.parse(localDetails) : null
            
            // Check if there's any meaningful data
            hasValidLocalData = (
              (parsedPlan && Object.keys(parsedPlan).some(key => 
                parsedPlan[key] && typeof parsedPlan[key] === 'object' && parsedPlan[key].name
              )) ||
              (parsedDetails && (
                parsedDetails.theme || 
                parsedDetails.date || 
                (parsedDetails.childName && parsedDetails.childName !== 'Emma') ||
                parsedDetails.guestCount ||
                parsedDetails.postcode
              ))
            )
          } catch (e) {
            console.log('Failed to parse local data')
          }
        }
        
        setHasLocalData(hasValidLocalData)
      } catch (error) {
        console.error('Error checking auth and local data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLocalData()
  }, [])

  const handleCreateParty = () => {
    router.push('/party-builder')
  }

  const handleSignIn = () => {
    router.push('/signin')
  }

  const handleViewLocalParty = () => {
    // Force refresh to re-detect local data
    onRefresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
      <ContextualBreadcrumb currentPage="dashboard" />

      {/* Hero Section */}
      <div 
        style={{
          backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px, cover',
          backgroundPosition: 'center',
        }} 
        className="relative w-full h-[30vh] md:h-[50vh] overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-16 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-16 left-20 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-700"></div>
          <PartyPopper className="absolute top-16 right-10 w-6 h-6 text-white/30 animate-pulse delay-500" />
          <Gift className="absolute bottom-20 right-20 w-5 h-5 text-white/25 animate-pulse delay-1000" />
          <Cake className="absolute top-32 left-32 w-4 h-4 text-white/30 animate-pulse delay-200" />
        </div>

        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                Party Central!
              </span>
            </h1>
       
          </div>
        </div>

        {/* Smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Create New Party Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Create Your First Party
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Start from scratch and build the perfect celebration. We'll guide you through every step!
                  </p>
                </div>

                <Button 
                  onClick={handleCreateParty}
                  className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold py-4 rounded-xl transition-all duration-300 group-hover:shadow-lg"
                  size="lg"
                >
                  Start Building Your Party
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {isSignedIn ? "Access Your Account" : "Sign In"}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {isSignedIn 
                      ? "You're signed in! Create a new party or check for existing ones."
                      : "Already have an account? Sign in to access your saved parties and preferences."
                    }
                  </p>
                </div>

                {isSignedIn ? (
                  <Button 
                    onClick={handleCreateParty}
                    variant="outline"
                    className="w-full border-2 border-[hsl(var(--primary-500))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))] font-bold py-4 rounded-xl transition-all duration-300"
                    size="lg"
                  >
                    Create New Party
                    <Plus className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSignIn}
                    variant="outline"
                    className="w-full border-2 border-[hsl(var(--primary-500))] text-[hsl(var(--primary-600))] hover:bg-[hsl(var(--primary-50))] font-bold py-4 rounded-xl transition-all duration-300"
                    size="lg"
                  >
                    Sign In to Your Account
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Local Data Recovery Section */}
        {hasLocalData && (
          <Card className="mt-8 border-2 border-[hsl(var(--primary-200))] bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))]">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-[hsl(var(--primary-100))] rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[hsl(var(--primary-600))]" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-[hsl(var(--primary-800))] mb-2">
                    Found Previous Party Data!
                  </h3>
                  <p className="text-[hsl(var(--primary-700))] text-sm">
                    We found some party information saved on this device. Would you like to continue with it?
                  </p>
                </div>

                <Button 
                  onClick={handleViewLocalParty}
                  variant="outline"
                  className="border-[hsl(var(--primary-600))] text-[hsl(var(--primary-700))] hover:bg-[hsl(var(--primary-100))] font-medium"
                >
                  View My Saved Party
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="text-center mt-12 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Need help getting started?
          </h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Our party planning wizard will guide you through every step, from choosing the perfect theme 
            to finding amazing suppliers in your area. It takes just a few minutes!
          </p>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="ghost" className="text-gray-600">
              How it works
            </Button>
            <Button variant="ghost" className="text-gray-600">
              Contact support
            </Button>
          </div>
        </div>

        {/* Snappy Mascot Section */}
    

        {/* Fixed Snappy in Bottom Left */}
        <div className="fixed bottom-0 left-0 z-20 pointer-events-none">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary-300))] to-[hsl(var(--primary-400))] rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            
            {/* Snappy Image */}
            <img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1753217385/fbdtz1trvat4dhgwxx8y.png"
              alt="Snappy the Party Mascot"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
            />
          
            
            {/* Optional: Click to scroll to top */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="absolute inset-0 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"
              title="Scroll to top"
              aria-label="Scroll to top"
            />
          </div>
        </div>
      </div>
    </div>
  )
}