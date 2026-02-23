"use client"

import { THEME_CATEGORIES, TEMPLATES_BY_THEME } from '@/lib/inviteTemplates'
import { Card, CardContent } from "@/components/ui/card"
import { Check } from 'lucide-react'

export default function ThemeSelector({
  selectedTheme,
  onSelectTheme,
  className = ""
}) {
  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choose Your Theme
        </h2>
        <p className="text-gray-600">
          Select a theme that matches your party
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {THEME_CATEGORIES.map((theme) => {
          const isSelected = selectedTheme === theme.id
          const templates = TEMPLATES_BY_THEME[theme.id] || []
          const thumbnail = templates[0]?.thumbnail

          return (
            <Card
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`
                relative cursor-pointer transition-all duration-200 overflow-hidden
                hover:shadow-lg hover:scale-[1.02]
                ${isSelected
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'hover:ring-1 hover:ring-gray-300'
                }
              `}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div
                  className="aspect-[3/4] relative overflow-hidden"
                  style={{ backgroundColor: theme.color + '20' }}
                >
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={theme.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-6xl"
                      style={{ backgroundColor: theme.color + '30' }}
                    >
                      {theme.icon}
                    </div>
                  )}

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                      <div className="bg-primary-500 rounded-full p-2">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme name */}
                <div
                  className="p-3 text-center border-t"
                  style={{ borderColor: theme.color + '30' }}
                >
                  <span className="text-xl mr-2">{theme.icon}</span>
                  <span className="font-semibold text-gray-800">{theme.name}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
