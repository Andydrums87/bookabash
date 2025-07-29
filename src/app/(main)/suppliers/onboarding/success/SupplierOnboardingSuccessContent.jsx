"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SupplierOnboardingSuccessContent() {
  const searchParams = useSearchParams()
  const needsVerification = searchParams.get('verify') === 'true'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <main className="flex-grow flex py-30 bg-gray-50 dark:bg-slate-850">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side: Text Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 font-semibold px-4 py-1 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span>Registration Complete</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome Aboard!
              </h1>
              
              {needsVerification ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Check Your Email</p>
                        <p className="text-sm text-blue-700">
                          We've sent a verification link to your email address. Please click it to activate your account.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Once you've verified your email, use the sign-in page to access your supplier dashboard.
                  </p>
                </div>
              ) : (
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Your account has been created successfully! You can now sign in to access your supplier dashboard.
                </p>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg" asChild>
                  <Link href="/signin">Sign In to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg" asChild>
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </div>
            </div>

            {/* Right Side: Image */}
            <div>
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1749462511/enis-yavuz-J5i9E-oAGgM-unsplash_r3n7wy.jpg"
                alt="A person celebrating a successful business launch or working efficiently"
                width={600}
                height={500}
                className="rounded-xl shadow-2xl mx-auto object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}