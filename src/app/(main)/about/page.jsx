"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-rose-50/30 to-amber-50/40">
      {/* Founders Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-10 md:mb-14">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Meet the Founders
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                The story behind PartySnap
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
              {/* Photo Section - Two founders side by side */}
              <div className="w-full lg:w-2/5 relative">
                <div className="flex gap-4 justify-center">
                  {/* Andrew's photo */}
                  <div className="aspect-square w-[150px] md:w-[180px] lg:w-[190px] relative rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1772096949/74ba51c0-78ae-4230-a617-bf75240bda22_2_vy3g0i.jpg"
                      alt="Andrew with his child"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 150px, (max-width: 1024px) 180px, 190px"
                      priority
                    />
                  </div>
                  {/* Neil's photo */}
                  <div className="aspect-square w-[150px] md:w-[180px] lg:w-[190px] relative rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1772193071/146c1cd7-5bfc-47ad-a91b-083ba5c66cfe_cjdlqz.jpg"
                      alt="Neil with his child"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 150px, (max-width: 1024px) 180px, 190px"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="w-full lg:w-3/5 text-center lg:text-left">
                {/* Greeting */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Hi, we're Andrew & Neil <span className="inline-block">👋</span>
                </h2>

                {/* Subtitle */}
                <p className="text-base md:text-lg text-primary-600 font-medium mb-5">
                  Two local dads from St Albans who get it
                </p>

                {/* Story */}
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    We built PartySnap because we know how stressful planning a kids' party can be.
                    Juggling work, family, and trying to coordinate multiple suppliers felt overwhelming.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    So we created the service we wished existed — one place to find trusted local suppliers,
                    build your perfect party, and take the stress away so you can focus on what matters:
                    <span className="font-semibold text-gray-800"> enjoying the day with your child.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8">
              Join the families who've discovered a better way to plan unforgettable parties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8">
                  Start Planning Your Party
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
