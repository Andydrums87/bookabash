"use client"
import { Star } from "lucide-react"

export default function TrustIndicators() {
  return (
    <section className="bg-white py-6 md:py-8 border-b border-[hsl(var(--primary-100))]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-green-500 text-green-500" />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span className="font-bold text-gray-900 text-base md:text-lg">Excellent</span>
              <span className="text-gray-600 text-sm md:text-base">3,002 reviews on</span>
              <span className="font-bold text-green-600 text-base md:text-lg">★ Trustpilot</span>
            </div>
          </div>

          <div className="h-px w-16 md:h-8 md:w-px bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-gray-700 text-sm md:text-base">
              <span className="text-primary-600 font-bold">127</span> parties booked this week
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
