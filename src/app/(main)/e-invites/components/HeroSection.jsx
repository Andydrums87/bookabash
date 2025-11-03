// components/HeroSection.js

import { Mail } from "lucide-react"

const HeroSection = () => {
  return (
    <div
      className="relative shadow-lg overflow-hidden mb-6 mt-6 rounded-2xl mx-4"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/dghzq6xtd/image/upload/v1753986373/jwq8wmgxqqfue2zsophq.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

      <div className="relative px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Compact header */}
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-2xl mb-3">
            Create Digital Invites
          </h1>

          <p className="text-center text-white text-base sm:text-lg max-w-2xl mx-auto drop-shadow-lg font-medium">
            Beautiful invitations your guests will love
          </p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection