"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Users, Sparkles, Target } from "lucide-react"

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section style={{
        backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px, cover',
        backgroundPosition: 'center',
      }} className="md:py-20 pt-10 bg-gradient-to-b from-[hsl(var(--primary-50))] to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Meet the Team Behind the Magic
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              From stressed parent to party planning solution - here's how PartySnap came to life
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              {/* Founder Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Replace with your actual image */}
                    <Image
                      src="/andrew.jpg"
                      alt="Founder of PartySnap"
                      width={500}
                      height={600}
                      className="w-full h-80 object-cover object-center"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-300 rounded-full opacity-60"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-pink-300 rounded-full opacity-40"></div>
              </div>

              {/* Founder Story */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Hi, I'm Andrew 👋
                </h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    <strong className="text-gray-900">Three years ago, I was drowning in party planning stress.</strong> My daughter's 5th birthday was coming up, and I had spent weeks calling entertainers, comparing prices, and trying to coordinate everything myself.
                  </p>
                  <p>
                    After booking a magician who didn't show up and a bouncy castle that was the wrong size, I realized there had to be a better way. <strong className="text-primary-600">Why wasn't there a single platform where parents could plan everything in one place?</strong>
                  </p>
                  <p>
                    That frustrating experience became the spark for PartySnap. I wanted to create the solution I wished existed - a platform that takes the stress out of party planning and puts the joy back in.
                  </p>
                  <p className="text-primary-600 font-semibold">
                    Today, we've helped over [X] families throw unforgettable parties without the headaches I experienced. Every time a parent tells us we've saved their sanity, it reminds me why I started this journey.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission & Values */}
            {/* <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To transform party planning from a stressful chore into an exciting journey, giving parents more time to focus on what matters most - celebrating with their children.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                <p className="text-gray-600 leading-relaxed">
                  Simplicity, reliability, and genuine care for families. We believe every child deserves an amazing party, and every parent deserves peace of mind.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become the go-to platform for family celebrations worldwide, making magical moments accessible and stress-free for every family.
                </p>
              </div>
            </div> */}

         

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Experience the Difference?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join the families who've discovered a better way to plan unforgettable parties. Let's make your next celebration magical.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg px-8 py-4">
                  Start Planning Your Party
                </Button>
                <Button size="lg" variant="outline" className="border-[hsl(var(--primary-500))] text-primary-500 hover:bg-primary-50 font-bold text-lg px-8 py-4">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}