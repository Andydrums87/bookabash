import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, LogIn, Star, Users, TrendingUp } from "lucide-react"

export default function SuppliersLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary-50))] via-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] text-gray-900 dark:text-white">
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left">
            <h1 className="text-6xl w-full font-black text-gray-900 mb-4 leading-tight animate-fade-in">
                  Join <span className="text-primary-500 relative">
                    PartySnap <span className="text-gray-900">Business</span>
                  </span>
      
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with thousands of families and grow your party business. Join the UK's leading party planning platform.
              </p>

             

              {/* Stats */}
              <div className="md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <Users className="w-6 h-6 text-primary-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">10,000+</span>
                  </div>
                  <p className="text-gray-600">Happy Families</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <Star className="w-6 h-6 text-yellow-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">4.9/5</span>
                  </div>
                  <p className="text-gray-600">Average Rating</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">500+</span>
                  </div>
                  <p className="text-gray-600">Active Suppliers</p>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1750112354/evvqofjwxsxdhshwc7lt.jpg"
                  alt="Children enjoying a magical party with balloons and celebrations"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>
          </div>

          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* New Suppliers */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-[hsl(var(--primary-200))] hover:border-[hsl(var(--primary-300))]">
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-600))] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Building className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">New to PartySnap?</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
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
                  <p className="text-sm text-primary-600 mt-3 font-medium">✨ Free to get started</p>
                </div>
              </CardContent>
            </Card>

            {/* Existing Suppliers */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-[hsl(var(--primary-200))] hover:border-[hsl(var(--primary-300))]">
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded-full -translate-y-16 -translate-x-16 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--primary-300))] to-[hsl(var(--primary-500))] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <LogIn className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Already Listed?</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
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
                  <p className="text-sm text-primary-600 mt-3 font-medium">🚀 Access your dashboard</p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Trust Indicators */}
          <div className="mt-20 pt-16 border-t border-[hsl(var(--primary-200))]">
            <h4 className="text-lg font-semibold text-gray-700 mb-8 text-center">Trusted by amazing businesses across the UK</h4>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {/* Placeholder for client logos */}
              <div className="w-24 h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">Client Logo</span>
              </div>
              <div className="w-24 h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">Client Logo</span>
              </div>
              <div className="w-24 h-12 bg-gradient-to-r from-[hsl(var(--primary-100))] to-[hsl(var(--primary-200))] rounded flex items-center justify-center">
                <span className="text-xs text-primary-600 font-medium">Client Logo</span>
              </div>
            </div>
          </div>

          {/* Call to Action Banner */}
          <div className="mt-20 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to grow your party business?
              </h3>
              <p className="text-primary-100 mb-8 text-lg max-w-2xl mx-auto">
                Join thousands of suppliers already making magical moments happen for families across the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/suppliers/onboarding/new-supplier">
                    Start Your Journey
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-primary-900 hover:bg-white hover:text-primary-600 shadow-lg hover:shadow-xl transition-all duration-200"
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