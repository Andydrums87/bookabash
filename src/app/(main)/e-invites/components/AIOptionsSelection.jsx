// components/AIOptionsSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, Wand2 } from "lucide-react"

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
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[hsl(var(--primary-200))] to-transparent rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[hsl(var(--primary-300))] to-transparent rounded-full translate-y-10 -translate-x-10 opacity-40"></div>
      
      <CardContent className="p-6 relative z-10">
        <div className="text-center mb-6">
     
          <h2 className="text-2xl font-black text-gray-900 mb-3 flex items-center justify-center gap-2">
            <Wand2 className="w-6 h-6 text-[hsl(var(--primary-600))]" />
            Snappy's Magic Creations
          </h2>
          <p className="text-gray-600 font-medium">
            Wow! Look what Snappy cooked up for you! Pick your favorite magical design 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAiOptionSelect(option)}
              className={`relative p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 overflow-hidden group ${
                selectedAiOption?.id === option.id
                  ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] ring-2 ring-[hsl(var(--primary-200))] shadow-2xl scale-105"
                  : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
              }`}
            >
              <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                <img
                  src={option.imageUrl || "/placeholder.png"}
                  alt={`Snappy's Creation ${option.index}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                
                {/* Magic sparkle overlay */}
                <div className="absolute top-2 left-2 text-lg animate-pulse">✨</div>
                
                {selectedAiOption?.id === option.id && (
                  <div className="absolute top-2 right-2 bg-[hsl(var(--primary-600))] text-white p-2 rounded-full shadow-lg animate-pulse">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="font-bold text-sm text-gray-900 flex items-center justify-center gap-1">
                   Creation #{option.index}
                </div>
                {selectedAiOption?.id === option.id && (
                  <div className="text-xs text-[hsl(var(--primary-600))] font-bold">
                    ✨ Your Choice!
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedAiOption && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] border border-[hsl(var(--primary-200))] rounded-xl">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="flex items-center justify-center text-[hsl(var(--primary-700))] mb-1">
                <span className="text-sm font-bold">
                  Perfect! Snappy's Creation #{selectedAiOption.index} is ready to party!
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Your magical invitation is all set to save or share
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={generateAIOptions}
            disabled={isGeneratingAI}
            className={`w-full py-3 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 ${
              isGeneratingAI
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white shadow-lg hover:shadow-xl border-0'
            }`}
          >
            {isGeneratingAI ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Snappy's Creating More Magic...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
     
                <Wand2 className="w-5 h-5" />
                <span>Get 5 More Snappy Creations!</span>
                <span className="text-xl">🪄</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIOptionsSelection