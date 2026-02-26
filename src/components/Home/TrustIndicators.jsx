"use client"
import { ShieldCheck, Banknote, MapPin } from "lucide-react"

export default function TrustIndicators() {
  return (
    <section className="bg-white py-5 md:py-6 border-b border-[hsl(var(--primary-100))]">
      <div className="container mx-auto px-4">
        {/* Main headline */}
        <p className="text-center text-gray-800 text-lg md:text-xl font-semibold mb-4">
          See your full party plan before you pay.
        </p>

        {/* Trust badges - Inverted triangle on mobile, single row on desktop */}
        {/* Mobile: 2 on top, 1 below */}
        <div className="flex flex-col items-center gap-2 md:hidden">
          <div className="flex items-center gap-2">
            {/* Personally confirmed */}
            <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">Personally confirmed</span>
            </div>

            {/* Money back guarantee */}
            <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-200">
              <Banknote className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">100% money-back</span>
            </div>
          </div>

          {/* Founded in St Albans - centered below */}
          <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-200">
            <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700">Founded in St Albans</span>
          </div>
        </div>

        {/* Desktop: Single row */}
        <div className="hidden md:flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Personally confirmed</span>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <Banknote className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">100% money-back</span>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Founded in St Albans</span>
          </div>
        </div>
      </div>
    </section>
  )
}
