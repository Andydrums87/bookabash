"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, ArrowRight, Home, LogIn } from "lucide-react"

export default function NoBusinessAccountPage() {
  const searchParams = useSearchParams()
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Get email from stored error data
    const storedError = sessionStorage.getItem('supplier_auth_error')
    if (storedError) {
      const errorData = JSON.parse(storedError)
      setUserEmail(errorData.email || "")
      // Clear the stored error
      sessionStorage.removeItem('supplier_auth_error')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1750112354/evvqofjwxsxdhshwc7lt.jpg"
                  alt="Children enjoying a party - join our supplier network"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>

            {/* Right Side - Content */}
            <div className="text-center lg:text-left order-1 lg:order-2">
              
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                <Building className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Join Our Business Network?
              </h1>
              
              {userEmail && (
                <p className="text-gray-600 mb-4">
                  We couldn't find a business account for <span className="font-semibold text-primary-600">{userEmail}</span>
                </p>
              )}
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                It looks like you don't have a PartySnap Business account yet. Join hundreds of suppliers already making magical moments happen for families across the UK!
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600">10,000+</div>
                  <div className="text-sm text-gray-600">Happy Families</div>
                </div>
                <div className="bg-white/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-gray-600">Active Suppliers</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button 
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Link href="/suppliers/onboarding/new-supplier" className="flex items-center justify-center">
                    <Building className="w-5 h-5 mr-2" />
                    Get Listed Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <div className="text-center text-gray-500 text-sm">
                  or
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild
                    variant="outline"
                    className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    <Link href="/auth/signin" className="flex items-center justify-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      Customer Sign In
                    </Link>
                  </Button>

                  <Button 
                    asChild
                    variant="ghost"
                    className="flex-1 text-gray-600 hover:text-primary-600"
                  >
                    <Link href="/" className="flex items-center justify-center">
                      <Home className="w-4 h-4 mr-2" />
                      Back Home
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Trust indicator */}
              <div className="mt-8 pt-6 border-t border-primary-200">
                <p className="text-sm text-gray-500 flex items-center justify-center lg:justify-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  ✨ Free to get started • No setup fees • Quick approval
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-16">
            <Card className="border-2 border-primary-200 bg-gradient-to-r from-white to-primary-50 hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Choose PartySnap Business?
                </h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quality Leads</h4>
                    <p className="text-sm text-gray-600">Connect with motivated parents actively looking for your services.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Easy Management</h4>
                    <p className="text-sm text-gray-600">Streamlined dashboard to manage bookings and communications.</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-2xl">📈</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Grow Your Business</h4>
                    <p className="text-sm text-gray-600">Expand your reach and increase bookings with our platform.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}