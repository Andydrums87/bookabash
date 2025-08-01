"use client"
import { Star } from "lucide-react"

export default function TrustIndicators() {
  return (
    <section className="bg-white py-8  border-b border-[hsl(var(--primary-100))]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
          <div className="flex items-center space-x-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-900 text-lg">Excellent</span>
              <span className="text-gray-600">3,002 reviews on</span>
              <span className="font-bold text-green-600 text-lg">★ Trustpilot</span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-700">
              <span className="text-primary-600 font-bold">127</span> parties booked this week
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}