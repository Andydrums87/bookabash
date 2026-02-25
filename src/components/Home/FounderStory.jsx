"use client"
import Image from "next/image"
import { MapPin, Heart } from "lucide-react"

export default function FounderStory() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-primary-50/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
              {/* Photo Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg bg-gradient-to-br from-primary-100 to-primary-200">
                    {/* Placeholder - replace with actual image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl md:text-5xl mb-1">👨‍👧</div>
                        <span className="text-xs text-primary-600 font-medium">Photo coming</span>
                      </div>
                    </div>
                    {/* Uncomment when real image is available:
                    <Image
                      src="/founder-andrew.jpg"
                      alt="Andrew, founder of PartySnap"
                      fill
                      className="object-cover"
                    />
                    */}
                  </div>
                  {/* Location badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md border border-gray-100 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary-500" />
                    <span className="text-xs font-semibold text-gray-700">St Albans</span>
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                    Meet the Founder
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Hi, I'm Andrew
                </h3>

                <p className="text-gray-600 leading-relaxed mb-4">
                  I'm a dad from St Albans who got tired of the stress that comes with planning kids' parties.
                  Juggling work, family, and trying to coordinate multiple suppliers for my daughter's birthdays
                  felt overwhelming.
                </p>

                <p className="text-gray-600 leading-relaxed mb-6">
                  So I built PartySnap — the service I wished existed. One place to find trusted local suppliers,
                  build your perfect party, and take the stress away so you can focus on what matters:
                  <span className="font-semibold text-gray-800"> being present for the celebration.</span>
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <span className="text-green-500">✓</span> Parent-built
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <span className="text-green-500">✓</span> Local to Herts
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                    <span className="text-green-500">✓</span> Real person, real support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
