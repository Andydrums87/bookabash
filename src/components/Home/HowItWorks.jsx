"use client"

import { ArrowRight, CheckCircle } from "lucide-react"
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
      color: "from-primary-400 to-primary-500",
      bgColor: "bg-primary-50",
    },
    {
      number: 2,
      title: "We create your personalized dashboard",
      description: "Get matched with perfect suppliers for your theme. Everything organized in one beautiful place.",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753361571/v4l1f7puqvhswqb6j9tz.png",
      alt: "Snappy the crocodile celebrating with party hat",
      color: "from-primary-300 to-primary-400",
      bgColor: "bg-primary-200",
    },
    {
      number: 3,
      title: "Review, customize, and book everything",
      description: "Complete coordination in one place. Snappy handles the details while you focus on the fun!",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753291661/qjdvo5qnbylnzwhlawhf.png",
      alt: "Snappy the crocodile giving thumbs up with confetti",
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-500",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From party vision to celebration reality with Snappy by your side!
          </p>
        </div>

        {/* Timeline Container */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            {/* Timeline Path */}
            <div className="absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 rounded-full"></div>
            
            {/* Timeline Steps */}
            <div className="grid grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className={`${step.bgColor} rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative`}>
                    {/* Snappy Avatar on Timeline */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-full p-2 shadow-xl`}>
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                          <Image
                            src={step.image}
                            alt={step.alt}
                            width={80}
                            height={80}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                      </div>
                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-gray-900 text-gray-900 rounded-full flex items-center justify-center font-black text-sm shadow-lg">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-16 text-center">
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>

                    {/* Arrow to next step */}
                    {index < steps.length - 1 && (
                      <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                        <ArrowRight className="w-12 h-12 text-gray-400 bg-white rounded-full p-3 shadow-lg" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`${step.bgColor} rounded-3xl p-6 shadow-xl border border-gray-100`}>
                  <div className="flex items-start space-x-6">
                    {/* Snappy Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full p-2 shadow-xl`}>
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                          <Image
                            src={step.image}
                            alt={step.alt}
                            width={64}
                            height={64}
                            className="w-14 h-14 object-contain"
                          />
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-3 border-gray-900 text-gray-900 rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4">
                    <ArrowRight className="w-8 h-8 text-gray-400 bg-white rounded-full p-2 shadow-md rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Traditional vs Our Way Comparison */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl border border-gray-100">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 text-center">
              Traditional Way vs <span className="text-primary-500">PartySnap Way</span>
            </h3>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Traditional Way */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-700 text-xl flex items-center mb-6">
                  😰 Traditional Way:
                </h4>
                <div className="space-y-4">
                  {['Search endlessly for each supplier', 'Compare prices across multiple sites', 'Book everything separately', 'Coordinate timing yourself', 'Hope nothing goes wrong', 'Repeat 6+ times'].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
                  <p className="text-red-700 font-medium">Result: Stress, overwhelm, and scattered bookings</p>
                </div>
              </div>

              {/* PartySnap Way */}
              <div className="space-y-6">
                <h4 className="font-bold text-primary-600 text-xl flex items-center mb-6">
                  🎉 PartySnap Way:
                </h4>
                <div className="space-y-4">
                  {['Tell us your party vision once', 'Get matched with perfect suppliers', 'Everything organized in one dashboard', 'Coordinate all timing for you', 'Quality guarantee on all bookings', 'Enjoy your stress-free party!'].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-primary-50 border-l-4 border-primary-400 p-4 mt-6">
                  <p className="text-primary-700 font-medium">Result: One organized plan, unforgettable party! 🎊</p>
                </div>
              </div>
            </div>
          </div>
        </div>

   
      </div>
    </section>
  )
}