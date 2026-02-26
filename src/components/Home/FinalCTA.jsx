"use client"
import Image from "next/image"
import Link from "next/link"

export default function FinalCTA() {
  return (
    // Hidden on mobile since there's already a floating CTA button
    <section className="hidden md:block py-16 md:py-20 bg-gradient-to-br from-[hsl(var(--primary-50))] to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header - matching other sections */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Ready to plan your next party?
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Let us handle the suppliers so you can focus on what matters — enjoying your child's special day.
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[hsl(var(--primary-100))]">
            <div className="flex">
              {/* Text Content */}
              <div className="w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Start booking now
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed">
                  Fill in a few details and we'll build your perfect party plan with trusted local suppliers.
                </p>
                <a
                  href="#hero"
                  className="inline-block bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-6 py-3 rounded-xl transition-all duration-300 text-center text-sm lg:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Plan My Party
                </a>
              </div>

              {/* Image */}
              <div className="w-1/2 relative min-h-[280px] bg-primary-200">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752827950/iStock-469207460__1_-removebg-preview_kzlham.png"
                  alt="Happy children celebrating at a birthday party"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-primary-50 px-6 py-4 text-center border-t border-primary-100">
              <p className="text-gray-700 font-medium text-sm">
                Have questions?{" "}
                <Link
                  href="mailto:hello@partysnap.co.uk"
                  className="text-primary-600 hover:text-[hsl(var(--primary-700))] font-bold hover:underline"
                >
                  Speak to Andrew directly
                </Link>{" "}
                — real human support, no bots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
