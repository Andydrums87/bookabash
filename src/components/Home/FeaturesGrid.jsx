"use client"

import { Palette, LayoutDashboard, ShieldCheck } from "lucide-react"
import Image from "next/image"

export default function FeaturesGrid() {
  const features = [
    {
      icon: Palette,
      title: "Choose your theme",
      description: "Dinosaurs, princesses, superheroes—pick a theme and we'll match you with suppliers who nail it.",
      image: "/themeselection.png",
      alt: "PartySnap theme selection interface",
    },
    {
      icon: LayoutDashboard,
      title: "Everything in one place",
      description: "Budget, countdown, bookings, messages. Your personal dashboard keeps it all organised.",
      image: "/userdashboard2.png",
      alt: "PartySnap user dashboard",
    },
    {
      icon: ShieldCheck,
      title: "Vetted suppliers only",
      description: "Every supplier is verified with real reviews. Book instantly, no back-and-forth.",
      image: "/supplierpage.png",
      alt: "PartySnap supplier profile page",
    },
  ]

  return (
    <section className="hidden md:block py-16 md:py-20 px-4 md:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Party planning, simplified
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan the perfect party, all in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Screenshot */}
              <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}