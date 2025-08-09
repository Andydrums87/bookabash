"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Tell us about your party",
      description: "Share your theme, date, guest count, and budget. Snappy will start working his magic instantly!",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753256633/efskkluawfqzjsryy1yh.png",
      alt: "Snappy the crocodile thinking with question marks",
    },
    {
      number: 2,
      title: "We create your personalized dashboard",
      description: "Get matched with perfect suppliers for your theme. Everything organized in one beautiful place.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361571/v4l1f7puqvhswqb6j9tz.png",
      alt: "Snappy the crocodile celebrating with party hat",
    },
    {
      number: 3,
      title: "Review, customize, and book everything",
      description: "Complete coordination in one place. Snappy handles the details while you focus on the fun!",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png",
      alt: "Snappy the crocodile giving thumbs up with confetti",
    },
  ]

  return (
    <section className="py-20 bg-primary-50 relative overflow-hidden">
      {/* Background decorations */}


      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From party vision to celebration reality with Snappy by your side!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 max-w-7xl mx-auto">
          {/* The PartySnap Way */}
          <div className="space-y-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center lg:text-left">
              The <span className="text-primary-500 text-5xl">Party</span><span className="text-primary-300 text-5xl">Snap</span> Way
            </h3>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-8 group">
                  {/* Snappy Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-2 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                        <Image
                          src={step.image || "/placeholder.svg"}
                          alt={step.alt}
                          width={80}
                          height={80}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traditional vs Our Way */}
          <div className="space-y-8">
            <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center lg:text-left">
              Traditional Way vs <span className="text-primary-500">Our Way</span>
            </h3>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <h4 className="font-bold text-gray-700 mb-8 text-xl flex items-center">😰 Traditional Way:</h4>
              <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-10">
                <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">Search endlessly</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">Compare prices</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">Book separately</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="bg-red-100 px-4 py-2 rounded-full text-sm font-medium text-red-700">
                  Repeat 6+ times
                </span>
              </div>

              <h4 className="font-bold text-orange-600 mb-8 text-xl flex items-center">🎉 PartySnap Way:</h4>
              <div className="flex flex-wrap items-center gap-3 text-orange-600 mb-8">
                <span className="bg-orange-100 px-4 py-2 rounded-full text-sm font-bold">Plan once</span>
                <ArrowRight className="w-4 h-4 text-orange-500" />
                <span className="bg-orange-100 px-4 py-2 rounded-full text-sm font-bold">Coordinate everything</span>
                <ArrowRight className="w-4 h-4 text-orange-500" />
                <span className="bg-green-100 px-4 py-2 rounded-full text-sm font-bold text-green-700">
                  Celebrate! 🎊
                </span>
              </div>
            </div>

            <div className="bg-primary-400 rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <div className="text-center">
                <p className="text-3xl font-black text-white mt-10 mb-8 leading-tight">
                  Why book 6 different suppliers when you can plan 1 complete party?
                </p>

                {/* Snappy mascot */}
                <div className="flex justify-center mb-8">
            
                  
                    
                    <img src="/Union.png" alt="" className="absolute  top-[-40px] right-0" />
                    <img src="/circles-top.png" alt="" className="absolute left-0 bottom-0 h-10" />
        
                </div>

              
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
