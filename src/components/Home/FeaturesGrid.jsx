"use client"

import { Heart, Star } from "lucide-react"
import Image from "next/image"

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
            Lets party the smart way!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {
              "Snappy's got this! No more endless Googling or ghosted calls. Just fun, fast, party magic—all in one place."
            }
          </p>
        </div>

        <div className="space-y-32">
          {/* 1. Theme Selection - Text Left, Cards Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Pick a theme, unlock the magic!</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                From Dino Dig to Princess Palaces, we&apos;ve got kid-approved, parent-impressing themes that turn
                &apos;just a party&apos; into THE party. Browse trending 2025 themes or choose from our most popular
                options.
              </p>
            </div>

            <div className="relative">
              {/* Floating UI Card */}
              <div className="transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <Image
                    src="/themeselection.png"
                    alt="PartySnap theme selection interface"
                    width={800}
                    height={600}
                    className="w-full h-80 object-cover object-top"
                  />
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-200 rounded-full opacity-40 -z-10"></div>
              <div className="absolute -bottom-8 -left-4 w-16 h-16 bg-pink-200 rounded-full opacity-30 -z-10"></div>
            </div>
          </div>

          {/* 2. Dashboard - Cards Left, Text Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="lg:order-2">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Track everything in one place</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your personal party dashboard keeps everything organized. Track your budget, countdown to the big day,
                and manage all your suppliers from one beautiful interface.
              </p>
            </div>

            <div className="lg:order-1 relative">
              {/* Floating UI Card */}
              <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <Image
                    src="/userdashboard2.png"
                    alt="PartySnap user dashboard"
                    width={800}
                    height={600}
                    className="w-full h-80 object-cover object-top"
                  />
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute -top-4 -left-8 w-20 h-20 bg-blue-200 rounded-full opacity-30 -z-10"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-200 rounded-full opacity-20 -z-10"></div>
            </div>
          </div>

          {/* 3. Supplier Profile - Text Left, Cards Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <div className="w-8 h-8 bg-orange-600 rounded-sm transform rotate-45"></div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Only the best in Snappy&apos;s squad!</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                No randoms here—just handpicked, party-perfect pros who&apos;ve passed the vibe check. Verified
                suppliers, real reviews, and instant booking. Trusted. Vetted. Ready to wow.
              </p>
            </div>

            <div className="relative">
              {/* Floating UI Card */}
              <div className="transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <Image
                    src="/supplierpage.png"
                    alt="PartySnap supplier profile page"
                    width={800}
                    height={600}
                    className="w-full h-80 object-cover object-top"
                  />
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute -top-8 -right-4 w-28 h-28 bg-green-200 rounded-full opacity-25 -z-10"></div>
              <div className="absolute -bottom-4 -left-8 w-18 h-18 bg-purple-200 rounded-full opacity-35 -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}