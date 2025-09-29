import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, LogIn, Star, Users, TrendingUp } from "lucide-react"

export default function SuppliersLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] text-gray-900 dark:text-white overflow-hidden">
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-20">
            
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight animate-fade-in">
                Join <span className="text-primary-500 relative">
                  PartySnap <span className="text-gray-900">Business</span>
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Connect with thousands of families and grow your party business. Join the UK's leading party planning platform.
              </p>

              {/* Stats - Fixed mobile layout */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 mr-2" />
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">10,000+</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Happy Families</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2" />
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">4.9/5</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Average Rating</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2" />
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">500+</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Active Suppliers</p>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1750112354/evvqofjwxsxdhshwc7lt.jpg"
                  alt="Children enjoying a magical party with balloons and celebrations"
                  width={600}
                  height={400}
                  className="w-full h-[250px] sm:h-[300px] lg:h-[400px] object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating elements - Hidden on mobile to prevent overflow */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-16 lg:w-20 h-16 lg:h-20 bg-primary-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="hidden sm:block absolute -bottom-6 -left-6 w-12 lg:w-16 h-12 lg:h-16 bg-primary-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>
          </div>

          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            
            {/* New Suppliers */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-[hsl(var(--primary-200))] hover:border-[hsl(var(--primary-300))]">
              <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                {/* Background decoration - Smaller on mobile */}
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Building className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">New to PartySnap?</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    List your business and start connecting with customers looking for amazing party services.
                  </p>
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    size="lg"
                  >
                    <Link href="/suppliers/onboarding/new-supplier">
                      Get Listed Today
                    </Link>
                  </Button>
                  <p className="text-xs sm:text-sm text-primary-600 mt-2 sm:mt-3 font-medium">✨ Free to get started</p>
                </div>
              </CardContent>
            </Card>

            {/* Existing Suppliers */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-[hsl(var(--primary-200))] hover:border-[hsl(var(--primary-300))]">
              <CardContent className="p-6 sm:p-8 text-center relative overflow-hidden">
                {/* Background decoration - Smaller on mobile */}
                <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full -translate-y-12 sm:-translate-y-16 -translate-x-12 sm:-translate-x-16 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-500))] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <LogIn className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">Already Listed?</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    Sign in to manage your business account, update your services, and view your bookings.
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-2 border-[hsl(var(--primary-400))] text-primary-600 hover:bg-[hsl(var(--primary-500))] hover:text-white hover:border-[hsl(var(--primary-500))] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    size="lg"
                  >
                    <Link href="/suppliers/onboarding/auth/signin">
                      Business Sign In
                    </Link>
                  </Button>
                  <p className="text-xs sm:text-sm text-primary-600 mt-2 sm:mt-3 font-medium">🚀 Access your dashboard</p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Trust Indicators - Responsive layout */}
          <div className="mt-12 sm:mt-20 pt-8 sm:pt-16 border-t border-[hsl(var(--primary-200))]">
            <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-6 sm:mb-8 text-center px-4">
              Trusted by amazing businesses across the UK
            </h4>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-60 px-4">
              {/* Placeholder for client logos - Smaller on mobile */}
              <div className="w-20 sm:w-24 h-10 sm:h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">Client Logo</span>
              </div>
              <div className="w-20 sm:w-24 h-10 sm:h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">Client Logo</span>
              </div>
              <div className="w-20 sm:w-24 h-10 sm:h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">Client Logo</span>
              </div>
            </div>
          </div>

          {/* Call to Action Banner */}
          <div className="mt-12 sm:mt-20 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Background decoration - Smaller on mobile */}
            <div className="hidden sm:block absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-16 sm:-translate-y-20 translate-x-16 sm:translate-x-20"></div>
            <div className="hidden sm:block absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-12 sm:translate-y-16 -translate-x-12 sm:-translate-x-16"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Ready to grow your party business?
              </h3>
              <p className="text-primary-100 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                Join thousands of suppliers already making magical moments happen for families across the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-[hsl(var(--primary-50))] hover:text-[hsl(var(--primary-700))] shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/suppliers/onboarding/new-supplier">
                    Start Your Journey
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-primary-600 hover:bg-white hover:text-[hsl(var(--primary-600))] shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/suppliers/onboarding/auth/signin">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}