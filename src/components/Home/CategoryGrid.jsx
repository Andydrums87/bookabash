"use client"
import Image from "next/image"

export default function CategoryGrid() {
  const themes = [
    {
      title: "Princess & Fairy Tale",
      subtitle: "Magical & elegant",
      badge: "MOST POPULAR 👑",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757708173/iStock-1071368448_ui59nx.jpg",
    },
    {
      title: "Superhero Adventure",
      subtitle: "Action-packed fun",
      badge: "TRENDING 🔥",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757707855/iStock-804401550_s0oljx.jpg",
    },
    {
      title: "Dinosaur Discovery",
      subtitle: "Prehistoric excitement",
      badge: "SNAP CHOICE 🦕",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757707966/iStock-1313585311_ytfxgh.jpg",
    },
    {
      title: "Unicorn Magic",
      subtitle: "Dreamy & colourful",
      badge: "GIRL'S FAVORITE 🦄",
      image: "https://res.cloudinary.com/dghzq6xtd/image/upload/v1757707916/iStock-1369714109_s8tdtt.jpg",
    },
  ]

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-primary-50">
      <div className="container mx-auto px-4">
        {/* Header - matching other sections */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Our most popular party themes
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the magical themes kids love most — from princesses to superheroes.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme, index) => (
            <div
              key={index}
              className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 aspect-[3/4]"
            >
              {/* Full image background */}
              <Image
                src={theme.image || "/placeholder.svg"}
                alt={theme.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                  {theme.badge}
                </span>
              </div>

              {/* Text overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-bold text-xl text-white mb-1">
                  {theme.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {theme.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1 scrollbar-hide">
            {themes.map((theme, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 group cursor-pointer relative rounded-2xl overflow-hidden shadow-lg aspect-[3/4]"
              >
                {/* Full image background */}
                <Image
                  src={theme.image || "/placeholder.svg"}
                  alt={theme.title}
                  fill
                  className="object-cover"
                  sizes="256px"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold text-xs px-2.5 py-1 rounded-full shadow-lg">
                    {theme.badge}
                  </span>
                </div>

                {/* Text overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-lg text-white mb-0.5">
                    {theme.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {theme.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll indicators */}
          <div className="flex justify-center mt-3">
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
