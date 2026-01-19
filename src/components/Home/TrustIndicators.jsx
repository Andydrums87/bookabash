"use client"
import { Star } from "lucide-react"

export default function TrustIndicators() {
  return (
    <section className="bg-white py-4 md:py-8 border-b border-[hsl(var(--primary-100))]">
      <div className="container mx-auto px-4">
        <div className="flex flex-row items-center justify-center gap-3 md:gap-8 text-center">
          {/* Trustpilot - compact on mobile */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 md:w-5 md:h-5 fill-green-500 text-green-500" />
              ))}
            </div>
            <span className="text-gray-600 text-xs md:text-base">
              <span className="font-bold text-gray-900 md:mr-1">Excellent</span>
              <span className="hidden md:inline">3,002 reviews on</span>
              <span className="font-bold text-green-600 ml-1">★ Trustpilot</span>
            </span>
          </div>

        </div>
      </div>
    </section>
  )
}
