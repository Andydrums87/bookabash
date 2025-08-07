// components/HeroSection.js

import { Sparkles } from "lucide-react"

const HeroSection = () => {
  return (
    <div style={{
      backgroundImage: `url('/party-pattern.svg'), linear-gradient(to right, hsl(14, 100%, 64%), hsl(12, 100%, 68%))`,
      backgroundRepeat: 'repeat',
      backgroundSize: '100px, cover',
      backgroundPosition: 'center',
    }} className="relative md:h-[50vh] ] md:pt-0 pt-6 h-[50vh] shadow-2xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--primary-400))] via-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] ">
      <div className="absolute inset-0 bg-black/10"></div>

   

      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl leading-tight">
            Create Your Own
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
              Themed Invite
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-2xl font-semibold">
            Design beautiful birthday invitations and send to guests in seconds!
          </p>

          {/* Floating elements */}
          <div className="flex justify-center space-x-4 opacity-80">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              🎨 AI-Powered Design
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium hidden sm:block">
              📱 Instant Sharing
            </div>
          </div>
        </div>
      </div>

      {/* Smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}

export default HeroSection