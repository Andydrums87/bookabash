"use client"
import Image from "next/image"

export default function FounderStory() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-orange-50/50 via-rose-50/30 to-amber-50/40 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-primary-200 rounded-full opacity-60" />
      <div className="absolute top-20 right-20 w-2 h-2 bg-rose-200 rounded-full opacity-50" />
      <div className="absolute bottom-16 left-1/4 w-4 h-4 bg-amber-200 rounded-full opacity-40" />
      <div className="absolute top-1/3 right-10 w-2 h-2 bg-primary-300 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-rose-100 rounded-full opacity-60" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header - matching other sections */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Meet the Founder
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The story behind PartySnap
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Photo Section - Shows first on mobile */}
            <div className="w-full lg:w-2/5 relative order-1 lg:order-1">
              <div className="aspect-square w-full max-w-[280px] md:max-w-[350px] mx-auto lg:max-w-none relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1772096949/74ba51c0-78ae-4230-a617-bf75240bda22_2_vy3g0i.jpg"
                  alt="Andrew with his child"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 40vw"
                  priority
                />
              </div>
            </div>

            {/* Story Content - Shows second on mobile */}
            <div className="w-full lg:w-3/5 text-center lg:text-left order-2 lg:order-2">
              {/* Greeting */}
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Hi, I'm Andrew <span className="inline-block">👋</span>
              </h3>

              {/* Subtitle */}
              <p className="text-sm md:text-base text-primary-600 font-medium mb-4 md:mb-6">
                A dad from St Albans
              </p>

              {/* Story */}
              <div className="space-y-3 md:space-y-4">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  I built PartySnap because I know how stressful planning a kids' party can be.
                  Juggling work, family, and trying to coordinate multiple suppliers felt overwhelming.
                </p>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  So I created the service I wished existed — one place to find trusted local suppliers,
                  build your perfect party, and take the stress away so you can focus on what matters:
                  <span className="font-semibold text-gray-800"> enjoying the day with your child.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
