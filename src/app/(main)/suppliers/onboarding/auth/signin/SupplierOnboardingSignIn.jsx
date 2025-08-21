"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn, Loader2, Building } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getBaseUrl } from '@/utils/env'

export default function SupplierSignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)

  const prefilledEmail = searchParams.get('email')

  const generateBusinessSlug = (businessName) => {
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const timestamp = Date.now().toString().slice(-6)
    return `${baseSlug}-${timestamp}`
  }
  const getThemesFromServiceType = (serviceType) => {
    const themeMapping = {
      'magician': ['magic', 'superhero', 'general'],
      'clown': ['circus', 'comedy', 'general'],
      'entertainer': ['general', 'superhero', 'princess'],
      'Entertainment': ['general', 'superhero', 'princess'],
      'dj': ['music', 'dance', 'general'],
      'musician': ['music', 'taylor-swift', 'general'],
      'face-painting': ['general', 'superhero', 'princess'],
      'Face Painting': ['general', 'superhero', 'princess'],
      'decorations': ['general'],
      'Decorations': ['general'],
      'venue': ['general'],
      'Venues': ['general'],
      'catering': ['general'],
      'Catering': ['general'],
      'partybags': ['general', 'superhero', 'princess', 'unicorn', 'dinosaur', 'space', 'mermaid', 'pirate'],
      'Party Bags': ['general', 'superhero', 'princess', 'unicorn', 'dinosaur', 'space', 'mermaid', 'pirate'],
      'party bags': ['general', 'superhero', 'princess', 'unicorn', 'dinosaur', 'space', 'mermaid', 'pirate']
    }
    return themeMapping[serviceType] || ['general']
  }

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }
  }, [prefilledEmail])

  // Handle email/password sign in
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Sign in user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      
      const user = authData.user
      if (!user) throw new Error("No user returned")

      console.log("🏢 Supplier signed in:", user.id)

      // Check for primary supplier record
      const { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("auth_user_id", user.id)
        .eq("is_primary", true)
        .maybeSingle()

      if (supplierError && supplierError.code !== 'PGRST116') {
        console.error("❌ Error checking supplier:", supplierError)
        throw new Error("Database error occurred")
      }

      if (supplierData) {
        console.log("✅ Supplier profile exists, redirecting to dashboard")
        router.push("/suppliers/dashboard")
        return
      }

      // Check for onboarding draft
      const { data: draft, error: draftError } = await supabase
        .from("onboarding_drafts")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (draft) {
        console.log("📥 Found onboarding draft, creating supplier profile...")
        await createSupplierFromDraft(user, draft)
        router.push("/suppliers/dashboard")
        return
      }

      // No supplier record or draft - redirect to onboarding
      console.log("⚠️ No supplier record found, redirecting to onboarding")
      router.push("/suppliers/onboarding")

    } catch (err) {
      console.error("❌ Supplier sign-in error:", err)
      setError(err.message || "Sign-in failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider) => {
    setError("")
    setOauthLoading(provider)
  
    try {
      console.log(`🔐 Starting ${provider} OAuth supplier sign-in...`)
      
      // Direct to supplier callback
      const redirectUrl = `${getBaseUrl()}/auth/callback/supplier`
      
      console.log('🎯 Supplier OAuth redirect URL:', redirectUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline'
          }
        }
      })
      
      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error)
        setError(`Failed to sign in with ${provider}. Please try again.`)
        setOauthLoading(null)
      }
      
    } catch (err) {
      console.error(`❌ ${provider} OAuth error:`, err)
      setError(`Failed to sign in with ${provider}. Please try again.`)
      setOauthLoading(null)
    }
  }

  const getDefaultPackagesForServiceType = (serviceType, theme = 'general') => {
    console.log('🎯 Creating default packages for:', serviceType, 'theme:', theme)
    
    const packageTemplates = {
      'entertainment': {
        'superhero': [
          {
            id: "superhero-basic",
            name: "Superhero Training Academy",
            price: 180,
            duration: "1 hour",
            priceType: "flat",
            features: [
              "Superhero character visit",
              "Basic training activities", 
              "Hero certificate ceremony",
              "Photo opportunities"
            ],
            description: "Transform your party into a superhero training academy with exciting activities and character interaction."
          },
          {
            id: "superhero-premium",
            name: "Ultimate Hero Mission",
            price: 300,
            duration: "1.5 hours", 
            priceType: "flat",
            features: [
              "2 superhero characters",
              "Mission-based games",
              "Face painting",
              "Hero training obstacles",
              "Villain defeat ceremony",
              "Take-home hero badges"
            ],
            description: "The complete superhero experience with multiple characters, interactive missions, and memorable takeaways."
          }
        ],
        'princess': [
          {
            id: "princess-basic",
            name: "Royal Princess Visit",
            price: 170,
            duration: "1 hour",
            priceType: "flat", 
            features: [
              "Princess character visit",
              "Royal storytelling",
              "Simple princess games",
              "Crowning ceremony"
            ],
            description: "A magical princess visit filled with enchanting stories and royal activities."
          },
          {
            id: "princess-deluxe",
            name: "Enchanted Royal Ball",
            price: 290,
            duration: "1.5 hours",
            priceType: "flat",
            features: [
              "Princess character",
              "Royal dress-up activities", 
              "Princess makeovers",
              "Royal dancing lessons",
              "Magic wand ceremony",
              "Princess photo session"
            ],
            description: "Transform your party into a magical royal ball with dress-up, dancing, and princess makeovers."
          }
        ],
        'general': [
          {
            id: "entertainment-standard",
            name: "Fun Party Entertainment",
            price: 160,
            duration: "1 hour",
            priceType: "flat",
            features: [
              "Professional entertainer",
              "Interactive games",
              "Music and dancing",
              "Balloon modelling"
            ],
            description: "High-energy entertainment perfect for keeping children engaged and having fun."
          },
          {
            id: "entertainment-deluxe", 
            name: "Ultimate Party Experience",
            price: 280,
            duration: "2 hours",
            priceType: "flat",
            features: [
              "Lead entertainer + assistant",
              "Themed games and activities",
              "Face painting",
              "Balloon creations",
              "Music system included",
              "Party games coordination"
            ],
            description: "Complete entertainment package with multiple entertainers and varied activities for an unforgettable party."
          }
        ]
      },
  
      'venue': [
        {
          id: "venue-basic",
          name: "2-Hour Party Venue",
          price: 200,
          duration: "2 hours",
          priceType: "flat",
          features: [
            "Private party room",
            "Tables and chairs setup",
            "Basic decorations included",
            "Kitchen access"
          ],
          description: "Perfect party space with everything you need for a memorable celebration."
        },
        {
          id: "venue-premium",
          name: "All-Day Celebration",
          price: 400,
          duration: "4 hours",
          priceType: "flat",
          features: [
            "Extended venue hire",
            "Premium room decorations",
            "Sound system included",
            "Dedicated party coordinator",
            "Catering preparation area",
            "Photo backdrop setup"
          ],
          description: "Complete venue package with extended time and premium amenities for the ultimate party experience."
        }
      ],
  
      'catering': [
        {
          id: "catering-basic",
          name: "Party Essentials",
          price: 12,
          duration: "Per child",
          priceType: "per_child",
          features: [
            "Sandwiches & wraps",
            "Crisps and snacks",
            "Juice boxes",
            "Birthday cake",
            "Paper plates & napkins"
          ],
          description: "Everything you need for a delicious party meal that kids will love."
        },
        {
          id: "catering-deluxe",
          name: "Premium Party Feast",
          price: 18,
          duration: "Per child",
          priceType: "per_child",
          features: [
            "Hot food buffet",
            "Healthy snack options",
            "Premium drinks selection",
            "Custom themed birthday cake",
            "Fresh fruit platter",
            "Party bags included"
          ],
          description: "Delicious hot food and premium treats for an unforgettable party dining experience."
        }
      ],
  
      'facePainting': [
        {
          id: "facepainting-basic",
          name: "Fun Face Painting",
          price: 120,
          duration: "1 hour",
          priceType: "flat",
          features: [
            "Professional face painter",
            "Basic designs & characters",
            "Safe, washable paints",
            "Up to 15 children"
          ],
          description: "Transform children into their favorite characters with professional face painting."
        },
        {
          id: "facepainting-premium",
          name: "Ultimate Face Art Studio",
          price: 200,
          duration: "2 hours",
          priceType: "flat",
          features: [
            "Professional face painting artist",
            "Detailed character designs",
            "Glitter and gem additions",
            "Temporary tattoos",
            "Up to 25 children",
            "Take-home stickers"
          ],
          description: "Professional face art with detailed designs and special effects for an amazing transformation experience."
        }
      ],
  
      'activities': [
        {
          id: "activities-basic",
          name: "Fun Party Activities",
          price: 150,
          duration: "1.5 hours",
          priceType: "flat",
          features: [
            "Organized party games",
            "Craft activities",
            "Basic equipment included",
            "Activity coordinator"
          ],
          description: "Engaging activities and games to keep children entertained throughout the party."
        },
        {
          id: "activities-premium",
          name: "Adventure Activity Zone",
          price: 280,
          duration: "2.5 hours",
          priceType: "flat",
          features: [
            "Multiple activity stations",
            "Themed craft workshops",
            "Interactive team games",
            "Take-home creations",
            "Professional activity leaders",
            "All materials included"
          ],
          description: "Complete activity experience with multiple stations and professional coordination for maximum fun."
        }
      ],
  
     'partyBags': [
  {
    id: "partybags-basic",
    name: "Classic Party Bags",
    price: 5,
    duration: "Per bag",
    priceType: "per_bag",
    features: [
      "Themed party bag",
      "Small toys and treats",
      "Stickers and pencils",
      "Sweet treats"
    ],
    description: "Traditional party bags filled with fun treats and small toys for party guests."
  },
  {
    id: "partybags-premium",
    name: "Premium Party Bags",
    price: 8,
    duration: "Per bag",
    priceType: "per_bag",
    features: [
      "Premium themed bags",
      "Quality toys and games",
      "Sticker sheets and activities",
      "Healthy snack options",
      "Activity sheets"
    ],
    description: "Enhanced party bags with better quality items and more variety that guests will love."
  },
  {
    id: "partybags-luxury",
    name: "Deluxe Party Bags",
    price: 12,
    duration: "Per bag",
    priceType: "per_bag",
    features: [
      "Premium themed bags",
      "Quality toys and games",
      "Personalized items",
      "Healthy snack options",
      "Activity sheets",
      "Special keepsake item"
    ],
    description: "Premium party bags with high-quality items and personalized touches that guests will treasure."
  }
],

  
      'decorations': [
        {
          id: "decorations-basic",
          name: "Party Decoration Package",
          price: 80,
          duration: "Setup included",
          priceType: "flat",
          features: [
            "Themed banners and signs",
            "Table decorations",
            "Basic balloon arrangements",
            "Party streamers"
          ],
          description: "Beautiful themed decorations to transform your party space with color and excitement."
        },
        {
          id: "decorations-premium",
          name: "Complete Party Transformation",
          price: 180,
          duration: "Setup & takedown",
          priceType: "flat",
          features: [
            "Premium themed decorations",
            "Balloon arches and sculptures",
            "Photo backdrop setup",
            "Table centerpieces",
            "Lighting effects",
            "Setup and takedown service"
          ],
          description: "Complete venue transformation with premium decorations and professional setup for a stunning party atmosphere."
        }
      ],
  
      'balloons': [
        {
          id: "balloons-basic",
          name: "Balloon Decorations",
          price: 60,
          duration: "Delivery included",
          priceType: "flat",
          features: [
            "Themed balloon bunches",
            "Number balloons",
            "Basic balloon arrangements",
            "Delivery to venue"
          ],
          description: "Colorful balloon decorations to add fun and festivity to your party celebration."
        },
        {
          id: "balloons-premium",
          name: "Balloon Extravaganza",
          price: 150,
          duration: "Setup included",
          priceType: "flat",
          features: [
            "Custom balloon arches",
            "Balloon sculptures",
            "Themed balloon arrangements",
            "Giant number balloons",
            "Professional setup service",
            "Helium balloons for guests"
          ],
          description: "Spectacular balloon displays with custom designs and professional installation for maximum visual impact."
        }
      ],
  
      'photography': [
        {
          id: "photography-basic",
          name: "Party Photography",
          price: 250,
          duration: "2 hours",
          priceType: "flat",
          features: [
            "Professional photographer",
            "Candid party moments",
            "50+ edited photos",
            "Digital gallery delivery"
          ],
          description: "Capture all the special moments of your party with professional photography."
        },
        {
          id: "photography-premium",
          name: "Complete Photo Experience",
          price: 400,
          duration: "3 hours",
          priceType: "flat",
          features: [
            "Professional photographer",
            "Posed and candid shots",
            "100+ edited photos",
            "Print package included",
            "Photo booth setup",
            "Same-day preview gallery"
          ],
          description: "Comprehensive photography package with photo booth and professional editing for lasting memories."
        }
      ]
    }
  
    // Handle entertainment with themes
    if (serviceType === 'entertainment' && packageTemplates.entertainment[theme]) {
      return packageTemplates.entertainment[theme]
    }
    
    // Handle entertainment with general theme
    if (serviceType === 'entertainment') {
      return packageTemplates.entertainment.general
    }
    
    // Handle other service types
    if (packageTemplates[serviceType]) {
      return packageTemplates[serviceType]
    }
    

    const serviceTypeKey = Object.keys(packageTemplates).find(key => {
      const lowerKey = key.toLowerCase();
      const lowerServiceType = serviceType.toLowerCase();
      
      return lowerKey === lowerServiceType ||
             lowerKey === lowerServiceType.replace(/\s+/g, '') ||
             lowerKey === lowerServiceType.replace(/\s+/g, '_') ||
             // 🎉 ADD PARTY BAGS MATCHING
             (lowerKey === 'partybags' && (
               lowerServiceType === 'party bags' ||
               lowerServiceType === 'party_bags' ||
               lowerServiceType === 'partybags'
             ));
    });
    if (serviceTypeKey && packageTemplates[serviceTypeKey]) {
      return packageTemplates[serviceTypeKey];
    }  
    // Fallback generic packages
    return [
      {
        id: "basic",
        name: "Standard Service",
        price: 150,
        duration: "1-2 hours",
        priceType: "flat",
        features: [
          "Professional service",
          "All equipment included",
          "Setup and coordination"
        ],
        description: `Quality ${serviceType} service for your party celebration.`
      },
      {
        id: "premium",
        name: "Premium Service",
        price: 250,
        duration: "2-3 hours", 
        priceType: "flat",
        features: [
          "Enhanced professional service",
          "Premium equipment",
          "Extended time",
          "Additional coordination"
        ],
        description: `Enhanced ${serviceType} service with premium features for an exceptional party experience.`
      }
    ]
  }
  

  // Helper function to create supplier from draft
  const createSupplierFromDraft = async (user, draft) => {
    try {
      console.log('🏗️ Creating supplier from draft with smart packages...')
      
      // ✅ NEW: Import and use the smart packages function
      // (You'll need to make sure getDefaultPackagesForServiceType is accessible here)
      
      // ✅ NEW: Generate smart default packages
      const serviceType = draft.supplier_type
      const defaultPackages = getDefaultPackagesForServiceType(serviceType, 'general')
      
      console.log('📦 Generated packages for', serviceType, ':', defaultPackages.length, 'packages')
      
      // ✅ NEW: Calculate pricing from packages
      const hasPackages = defaultPackages.length > 0
      const priceFrom = hasPackages ? Math.min(...defaultPackages.map(p => p.price)) : 0
      const priceUnit = hasPackages ? (defaultPackages[0].priceType === 'per_child' ? 'per child' : 
                                      defaultPackages[0].priceType === 'per_bag' ? 'per bag' : 'per event') : 'per event'
  
      const supplierData = {
        name: draft.business_name,
        businessName: draft.business_name,
        serviceType: draft.supplier_type,
        category: draft.supplier_type,
        subcategory: draft.supplier_type,
        location: draft.postcode,
        
        // ✅ NEW: Add smart pricing
        priceFrom: priceFrom,
        priceUnit: priceUnit,
        
        owner: {
          name: draft.your_name || user.user_metadata?.full_name,
          email: user.email,
          phone: draft.phone || user.user_metadata?.phone || ""
        },
        contactInfo: {
          email: user.email,
          phone: draft.phone || user.user_metadata?.phone || "",
          postcode: draft.postcode
        },
        
        // ✅ NEW: Better description based on packages
        description: hasPackages ? 
          `Professional ${serviceType.toLowerCase()} services with ${defaultPackages.length} package option${defaultPackages.length > 1 ? 's' : ''} available.` :
          "New supplier - profile setup in progress",
        businessDescription: "New supplier - profile setup in progress",
        
        // ✅ NEW: Add smart default packages
        packages: defaultPackages,
        
        // ✅ NEW: Add proper badges
        badges: hasPackages ? ["New Provider", "Packages Available"] : ["New Provider"],
        
        // ✅ NEW: Set complete status based on packages
        isComplete: hasPackages,
        
        // ✅ NEW: Add missing fields that packages need
        image: "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(draft.business_name),
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        availability: "Contact for availability",
        themes: getThemesFromServiceType(draft.supplier_type),
        portfolioImages: [],
        portfolioVideos: [],
        
        // ✅ NEW: Add working hours and availability
        workingHours: {
          Monday: { active: true, start: "09:00", end: "17:00" },
          Tuesday: { active: true, start: "09:00", end: "17:00" },
          Wednesday: { active: true, start: "09:00", end: "17:00" },
          Thursday: { active: true, start: "09:00", end: "17:00" },
          Friday: { active: true, start: "09:00", end: "17:00" },
          Saturday: { active: true, start: "10:00", end: "16:00" },
          Sunday: { active: false, start: "10:00", end: "16:00" },
        },
        unavailableDates: [],
        busyDates: [],
        availabilityNotes: "",
        advanceBookingDays: 7,
        maxBookingDays: 365,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: true,
        createdFrom: "supplier_signin"
      }
  
      // ✅ NEW: Enhanced supplier record with proper structure
      const supplierRecord = {
        auth_user_id: user.id,
        business_name: draft.business_name,
        business_type: 'primary',
        is_primary: true,
        parent_business_id: null,
        business_slug: generateBusinessSlug(draft.business_name), // You'll need this helper
        data: supplierData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
  
      console.log('💾 Inserting supplier with packages:', {
        businessName: supplierData.name,
        serviceType: supplierData.serviceType,
        packagesCount: supplierData.packages.length,
        priceFrom: supplierData.priceFrom,
        isComplete: supplierData.isComplete
      })
  
      const { error: insertError } = await supabase
        .from("suppliers")
        .insert(supplierRecord)
  
      if (insertError) {
        console.error("❌ Failed to create supplier:", insertError)
        throw new Error("Failed to create supplier profile. Please contact support.")
      }
  
      // Clean up draft
      await supabase
        .from("onboarding_drafts")
        .delete()
        .eq("email", user.email)
  
      console.log("✅ Supplier profile created from draft with", defaultPackages.length, "packages!")
      
    } catch (error) {
      console.error('💥 Error in createSupplierFromDraft:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))]">
      <div className="flex flex-col items-center justify-start pt-12 sm:pt-16 pb-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-gray-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-600))] to-[hsl(var(--primary-600))] rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Welcome Back!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your PartySnap Business account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Business Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="business@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || oauthLoading}
                  className="focus:ring-[hsl(var(--primary-500))] placeholder:text-xs text-xs focus:border-[hsl(var(--primary-500))]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className={`text-sm text-primary-600 hover:text-[hsl(var((primary-700)))] hover:underline ${isLoading || oauthLoading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || oauthLoading}
                    className="focus:ring-[hsl(var(--primary-500))] focus:border-[hsl(var(--primary-500))]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || oauthLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-br from-[hsl(var(--primary-500))] via-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] text-white py-3 text-base font-semibold"
                disabled={isLoading || oauthLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In to Business
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4 pt-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50" 
                disabled={isLoading || oauthLoading}
                onClick={() => handleOAuthSignIn("google")}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50" 
                disabled={isLoading || oauthLoading}
                onClick={() => handleOAuthSignIn("facebook")}
              >
                {oauthLoading === "facebook" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/>
                  </svg>
                )}
                Facebook
              </Button>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600 pb-10">
              Don&apos;t have a business account?{" "}
              <Link
                href="/suppliers/onboarding"
                className={`font-medium text-primary-600 hover:text-[hsl(var((--primary-700)))] hover:underline ${isLoading || oauthLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                Get Listed
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}