"use client"
import { Check } from "lucide-react"
import Image from "next/image"

export default function TrustIndicators() {
  const trustPoints = [
    "Personally confirmed suppliers — no marketplaces, no guesswork",
    "100% money-back guarantee",
    "Transparent pricing upfront",
    "Real human support — speak directly to our team"
  ]

  return (
    <section className="bg-white pt-4 pb-8 md:pt-6 md:pb-12">
      <div className="container mx-auto px-4">
        {/* Main headline */}
        <p className="text-center text-gray-600 text-lg md:text-xl font-medium italic mb-6">
          See your full party plan before you pay.
        </p>

        {/* Split layout - Image left, Trust points right */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
            {/* Image - Left side */}
            <div className="md:w-1/2 relative rounded-2xl overflow-hidden min-h-[250px] md:min-h-[320px]">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1772104852/f13bc664-67c7-4257-b433-f45ca3cb95b5_2_zxttbt.jpg"
                alt="Happy family enjoying a children's birthday party"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Why parents trust PartySnap - Right side */}
            <div className="md:w-1/2 bg-[hsl(var(--primary-50))]/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[hsl(var(--primary-100))] flex flex-col justify-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">
                Why parents trust PartySnap
              </h3>

              {/* Trust points - stacked list */}
              <div className="space-y-4">
                {trustPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-sm md:text-base text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
