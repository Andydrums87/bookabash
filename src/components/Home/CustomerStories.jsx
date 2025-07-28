"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export default function CustomerStories() {
  const stories = [
    {
      name: "Emma's Superhero Adventure",
      theme: "Superhero",
      quote: "BookABash made planning so easy! All the suppliers worked perfectly together.",
      image: "/superhero.webp",
      gradient: "from-blue-400 to-purple-500",
    },
    {
      name: "Lucas's Jungle Safari",
      theme: "Jungle Safari",
      quote: "The themed coordination was amazing. Best party we've ever thrown!",
      image: "/bouncy-castle.png",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      name: "Sophia's Princess Palace",
      theme: "Princess",
      quote: "Everything matched our theme perfectly. The dashboard made planning stress-free.",
      image: "/princessbanner.webp",
      gradient: "from-pink-400 to-rose-500",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Real Parties Planned with{" "}
            <span className="relative">
              PartySnap
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary-300 -skew-x-12"></div>
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stories.map((story, index) => (
            <Card
              key={index}
              className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl transform hover:-translate-y-2"
            >
              <div className="relative h-56">
                <div className={`absolute inset-0 bg-gradient-to-br ${story.gradient} opacity-20`}></div>
                <Image src={story.image || "/placeholder.svg"} alt={story.name} fill className="object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold">{story.theme} Theme</Badge>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{story.name}</h3>
                <p className="text-gray-600 italic mb-6 leading-relaxed">"{story.quote}"</p>
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">Happy Parent</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
