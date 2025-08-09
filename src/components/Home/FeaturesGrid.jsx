"use client"

import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function FeaturesGrid() {

  return (
<section className="py-20 px-6 bg-gray-50">
<div className="max-w-7xl mx-auto">
  <div className="text-center mb-20">
    <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
      Lets party the smart way!
      <br />
      Magical themes. Trusted suppliers,
      <br />
      zero grown-up stress
    </h2>
    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
      {
        "Snappy's got this! No more endless Googling or ghosted calls. Just fun, fast, party magic—all in one place."
      }
    </p>
  </div>

  <div className="space-y-32">
    {/* 1. Theme Selection - Text Left, Image Right */}
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
          <Star className="w-8 h-8 text-white" fill="currentColor" />
        </div>
        <h3 className="text-4xl font-bold text-gray-900 mb-6">Pick a theme, unlock the magic!</h3>
        <p className="text-xl text-gray-600 leading-relaxed">
          From Dino Dig to Princess Palaces, we&apos;ve got kid-approved, parent-impressing themes that turn &apos;just a
          party&apos; into THE party. Browse trending 2025 themes or choose from our most popular options.
        </p>
      </div>

      <div>
        {/* Standardized Computer Mockup */}
        <div className="bg-gray-900 rounded-t-2xl p-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl overflow-hidden h-80">
          <Image
            src="/themeselection.png"
            alt="PartySnap theme selection interface"
            width={800}
            height={600}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>

    {/* 2. Dashboard - Image Left, Text Right */}
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

      <div className="lg:order-1">
        {/* Standardized Computer Mockup */}
        <div className="bg-gray-900 rounded-t-2xl p-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl overflow-hidden h-80">
          <Image
            src="/userdashboard2.png"
            alt="PartySnap user dashboard"
            width={800}
            height={600}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>

    {/* 3. Supplier Profile - Text Left, Image Right */}
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-orange-600 rounded-sm transform rotate-45"></div>
        </div>
        <h3 className="text-4xl font-bold text-gray-900 mb-6">Only the best in Snappy&apos;s squad!</h3>
        <p className="text-xl text-gray-600 leading-relaxed">
          No randoms here—just handpicked, party-perfect pros who&apos;ve passed the vibe check. Verified suppliers,
          real reviews, and instant booking. Trusted. Vetted. Ready to wow.
        </p>
      </div>

      <div>
        {/* Standardized Computer Mockup */}
        <div className="bg-gray-900 rounded-t-2xl p-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-b-2xl overflow-hidden h-80">
          <Image
            src="/supplierpage.png"
            alt="PartySnap supplier profile page"
            width={800}
            height={600}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  </div>
</div>
</section>
  )
}


