"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CategoryGrid() {
  const themes = [
    {
      title: "Princess & Fairy Tale",
      badge: "MOST POPULAR 👑",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757708173/iStock-1071368448_ui59nx.jpg",
      gradient: "from-pink-400 to-purple-500",
    },
    {
      title: "Superhero Adventure",
      badge: "TRENDING 🔥",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757707855/iStock-804401550_s0oljx.jpg",
      gradient: "from-blue-400 to-red-500",
    },
    {
      title: "Dinosaur Discovery",
      badge: "SNAP CHOICE 🦕",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757707966/iStock-1313585311_ytfxgh.jpg",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Unicorn Magic",
      badge: "GIRL'S FAVORITE 🦄",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757707916/iStock-1369714109_s8tdtt.jpg",
      gradient: "from-purple-400 to-pink-500",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Our most popular{" "}
            <span className="relative">
              party themes
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary-300/40 -skew-x-12"></div>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the magical themes kids love most! From princesses to superheroes, these are the party themes that create unforgettable memories.
          </p>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {themes.map((theme, index) => (
            <Card
              key={index}
              className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white rounded-2xl transform hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20`}></div>
                <Image
                  src={theme.image || "/placeholder.svg"}
                  alt={theme.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 font-bold px-3 py-1 rounded-full shadow-lg">
                    {theme.badge}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  {theme.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:hidden">
          <div className="flex gap-6 overflow-x-auto pb-6 px-4 -mx-4 scrollbar-hide">
            {themes.map((theme, index) => (
              <Card
                key={index}
                className="flex-shrink-0 w-72 group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white rounded-2xl transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20`}></div>
                  <Image
                    src={theme.image || "/placeholder.svg"}
                    alt={theme.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="288px"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 font-bold px-3 py-1 rounded-full shadow-lg">
                      {theme.badge}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                    {theme.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {themes.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-primary-300"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}