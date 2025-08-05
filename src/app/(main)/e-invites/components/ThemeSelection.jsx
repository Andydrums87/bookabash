// components/ThemeSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Palette } from "lucide-react"

const ThemeSelection = ({ selectedTheme, setSelectedTheme, themes, useAIGeneration }) => {
  // Don't show theme selection in AI mode
  if (useAIGeneration) return null

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-600" />
          Choose Your Theme
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setSelectedTheme(key)}
              className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                selectedTheme === key
                  ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg"
                  : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
              }`}
            >
              <div className="relative w-full h-20 mb-3 rounded-lg overflow-hidden">
                <img
                  src={theme.backgroundUrl || "/placeholder.svg"}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="font-bold text-xs text-center px-1 text-gray-900">{theme.name}</div>
              {selectedTheme === key && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ThemeSelection