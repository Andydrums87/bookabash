"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CategoryGrid() {
  const experiences = [
    {
      title: "Garden Party Deluxe",
      badge: "EXTRAORDINARY ✨",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595139/blog-post-5_nvozyq.png",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      title: "Rooftop Celebration",
      badge: "POPTOP CHOICE 💖",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748595066/party_uam87x.png",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "Vintage Tea Party",
      badge: "POPTOP CHOICE 💖",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594997/balloons_r2wbfh.png",
      gradient: "from-rose-400 to-pink-500",
    },
    {
      title: "Beach Party Bash",
      badge: "TRENDING 🔥",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1748594938/face-painter_kdiqia.png",
      gradient: "from-blue-400 to-cyan-500",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Some of our favourite{" "}
            <span className="relative">
              party experiences
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary-300/40 -skew-x-12"></div>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Looking for something special? Explore our expert picks for parties that go above & beyond.
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experiences.map((experience, index) => (
            <Card
              key={index}
              className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white rounded-2xl transform hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${experience.gradient} opacity-20`}></div>
                <Image
                  src={experience.image || "/placeholder.svg"}
                  alt={experience.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 font-bold px-3 py-1 rounded-full shadow-lg">
                    {experience.badge}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  {experience.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:hidden">
          <div className="flex gap-6 overflow-x-auto pb-6 px-4 -mx-4 scrollbar-hide">
            {experiences.map((experience, index) => (
              <Card
                key={index}
                className="flex-shrink-0 w-72 group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white rounded-2xl transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${experience.gradient} opacity-20`}></div>
                  <Image
                    src={experience.image || "/placeholder.svg"}
                    alt={experience.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 font-bold px-3 py-1 rounded-full shadow-lg">
                      {experience.badge}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                    {experience.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {experiences.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-primary-300"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
