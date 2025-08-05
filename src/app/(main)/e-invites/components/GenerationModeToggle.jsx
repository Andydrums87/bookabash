// components/GenerationModeToggle.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wand2, Sparkles } from "lucide-react"

const GenerationModeToggle = ({ 
  useAIGeneration, 
  setUseAIGeneration, 
  generateInvite, 
  generateAIOptions,
  isGeneratingAI 
}) => {
  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          Create Your Invite
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => {
              setUseAIGeneration(false)
              generateInvite()
            }}
            className={`flex-1 min-w-0 p-4 sm:p-6 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
              !useAIGeneration
                ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg"
                : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
            }`}
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎨</div>
            <div className="font-bold text-base sm:text-lg text-gray-900">Use Templates</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Choose from pre-made themes</div>
          </button>
          <button
            onClick={() => setUseAIGeneration(true)}
            className={`flex-1 min-w-0 p-4 sm:p-6 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 ${
              useAIGeneration
                ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg"
                : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
            }`}
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🤖</div>
            <div className="font-bold text-base sm:text-lg text-gray-900">AI Generator</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Create custom designs with AI</div>
          </button>
        </div>

        {useAIGeneration && (
          <div className="bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] p-4 sm:p-6 rounded-xl border border-[hsl(var(--primary-200))]">
            <h3 className="font-bold text-base sm:text-lg text-[hsl(var(--primary-900))] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              AI Invite Generator
            </h3>
            <p className="text-xs sm:text-sm text-[hsl(var(--primary-700))] mb-4">
              Fill in your party details below, then click generate to create a custom invite with AI!
            </p>
            <Button
              onClick={generateAIOptions}
              disabled={isGeneratingAI}
              className="w-full bg-gradient-to-r from-[hsl(var(--primary-600))] to-[hsl(var(--primary-700))] hover:from-[hsl(var(--primary-700))] hover:to-[hsl(var(--primary-800))] text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
            >
              {isGeneratingAI ? (
                <>
                  <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating 5 AI Options...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Generate 5 AI Options
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GenerationModeToggle