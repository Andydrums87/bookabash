// components/AIOptionsSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check } from "lucide-react"

const AIOptionsSelection = ({ 
  showAiOptions, 
  aiOptions, 
  selectedAiOption, 
  selectAiOption, 
  generateAIOptions,
  isGeneratingAI,
  selectedTheme,
  setSelectedTheme
}) => {
  // Don't show if no options available
  if (!showAiOptions || aiOptions.length === 0) return null

  const handleAiOptionSelect = (option) => {
    selectAiOption(option)
    // Optionally clear theme selection when AI is chosen (visual feedback)
    // We keep the theme for reference but the preview will show AI
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[hsl(var(--primary-600))]" />
          Choose Your Favorite AI Design
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Click on your favorite design below. The selected option will be used for your invitation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAiOptionSelect(option)}
              className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                selectedAiOption?.id === option.id
                  ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] ring-2 ring-[hsl(var(--primary-200))] shadow-lg"
                  : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
              }`}
            >
              <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                <img
                  src={option.imageUrl || "/placeholder.svg"}
                  alt={`AI Option ${option.index}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                {selectedAiOption?.id === option.id && (
                  <div className="absolute top-2 left-2 bg-[hsl(var(--primary-600))] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="font-bold text-sm text-gray-900">Option {option.index}</div>
              {selectedAiOption?.id === option.id && (
                <div className="text-xs text-[hsl(var(--primary-600))] font-bold mt-1">
                  ✨ Selected & Ready
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedAiOption && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border border-[hsl(var(--primary-200))] rounded-xl">
            <div className="flex items-center text-[hsl(var(--primary-700))]">
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-bold">
                Option {selectedAiOption.index} selected! Your invitation is ready to save.
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={generateAIOptions}
            disabled={isGeneratingAI}
            variant="outline"
            className="w-full border-2 border-[hsl(var(--primary-300))] text-[hsl(var(--primary-700))] hover:bg-[hsl(var(--primary-50))] font-medium py-3 bg-transparent"
          >
            🔄 Generate 5 New Options
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIOptionsSelection