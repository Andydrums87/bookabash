"use client"
import Image from "next/image"
import Link from "next/link"

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-[hsl(var(--primary-50))] to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[hsl(var(--primary-100))]">
          <div className="md:flex">
            <div className="md:w-1/2 p-12 md:p-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
                Ready to plan your next{" "}
                <span className="relative">
                  Party?
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary-300 -skew-x-12"></div>
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join thousands of happy parents who've made party planning a breeze with PartySnap. Your perfect party
                is just a few clicks away.
              </p>
              <div className="space-y-4">
                <Link
                  href="/party-builder"
                  className="block w-full bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white px-8 py-5 rounded-2xl transition-all duration-300 text-center text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Booking Now
                </Link>
                <Link
                  href="#"
                  className="block w-full border-2 border-[hsl(var(--primary-500))] text-primary-600 px-8 py-5 rounded-2xl hover:bg-[hsl(var(--primary-600))] hover:text-white transition-all duration-300 text-center text-lg font-bold"
                >
                  Browse Top Categories
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative min-h-[400px] bg-primary-300">
              <Image
                src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752827950/iStock-469207460__1_-removebg-preview_kzlham.png"
                alt="Happy children celebrating at a birthday party"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="bg-primary-50 p-8 text-center border-t border-primary-100">
            <p className="text-gray-700 font-medium text-lg">
              Have questions?{" "}
              <Link href="#" className="text-primary-600 hover:text-[hsl(var(--primary-700))] font-bold hover:underline">
                Chat with our team
              </Link>{" "}
              or call us at <span className="text-primary-600 font-bold">0800 123 4567</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
