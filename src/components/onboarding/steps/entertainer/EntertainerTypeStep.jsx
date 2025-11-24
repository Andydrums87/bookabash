"use client"

import { Sparkles, Music, Palette, Camera, Mic, Users, PartyPopper } from "lucide-react"

export default function EntertainerTypeStep({ selectedType, onSelect }) {
  const entertainerTypes = [
    {
      id: "magician",
      name: "Magician",
      icon: Sparkles,
      description: "Magic shows and illusions"
    },
    {
      id: "dj",
      name: "DJ",
      icon: Music,
      description: "Music and entertainment"
    },
    {
      id: "facepainter",
      name: "Face Painter",
      icon: Palette,
      description: "Face painting and body art"
    },
    {
      id: "photographer",
      name: "Photographer",
      icon: Camera,
      description: "Event photography"
    },
    {
      id: "singer",
      name: "Singer/Musician",
      icon: Mic,
      description: "Live music performance"
    },
    {
      id: "entertainer",
      name: "Children's Entertainer",
      icon: Users,
      description: "Games and activities"
    },
    {
      id: "clown",
      name: "Clown",
      icon: PartyPopper,
      description: "Comedy and entertainment"
    }
  ]

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          What type of entertainment do you provide?
        </h1>
        <p className="text-lg text-gray-600">
          Choose the category that best describes your services
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entertainerTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-primary-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center
                  ${isSelected ? 'bg-primary-500' : 'bg-gray-100'}
                `}>
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-900 mb-1">
                    {type.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {type.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
