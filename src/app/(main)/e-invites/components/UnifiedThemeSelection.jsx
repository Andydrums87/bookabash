// components/UnifiedThemeSelection.js

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Sparkles, Wand2 } from "lucide-react"

const UnifiedThemeSelection = ({ 
  selectedTheme, 
  setSelectedTheme, 
  themes, 
  generateAIOptions,
  isGeneratingAI,
  generateInvite,
  selectedAiOption,
  clearAiSelection // Rename from setSelectedAiOption for clarity
}) => {
  const handleThemeSelect = (themeKey) => {
    setSelectedTheme(themeKey)
    // Clear AI selection when switching to template
    if (selectedAiOption && clearAiSelection) {
      clearAiSelection(null)
    }
    // Auto-generate template invite when theme is selected
    setTimeout(() => {
      generateInvite()
    }, 100)
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary-600" />
              Choose Your Design
            </h2>
            <p className="text-sm text-gray-600">
              Select a theme or let AI create something unique
            </p>
          </div>
          
          {/* AI Generate Button */}
          <Button
            onClick={generateAIOptions}
            disabled={isGeneratingAI}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isGeneratingAI ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(themes).map(([key, theme]) => {
            const isSelected = selectedTheme === key && !selectedAiOption
            
            return (
              <button
                key={key}
                onClick={() => handleThemeSelect(key)}
                className={`group relative p-3 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                  isSelected
                    ? "border-[hsl(var(--primary-500))] bg-gradient-to-br from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] shadow-lg ring-2 ring-[hsl(var(--primary-200))]"
                    : "border-gray-200 hover:border-[hsl(var(--primary-300))] hover:bg-[hsl(var(--primary-50))] shadow-md hover:shadow-lg"
                }`}
              >
                {/* Theme Preview */}
                <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden">
                  <img
                    src={theme.backgroundUrl || "/placeholder.svg"}
                    alt={theme.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  
                  {/* Quick Generate Button Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex items-center text-white text-xs font-bold">
                      <Wand2 className="w-3 h-3 mr-1" />
                      Quick Select
                    </div>
                  </div>
                </div>

                {/* Theme Name */}
                <div className="font-bold text-sm text-center px-1 text-gray-900 group-hover:text-[hsl(var(--primary-700))] transition-colors">
                  {theme.name}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[hsl(var(--primary-500))] rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* AI Selection Indicator */}
        {selectedAiOption && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-center text-purple-700">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="font-bold">AI Option {selectedAiOption.index} Selected</span>
              <span className="ml-2 text-sm text-purple-600">- Using AI generated design</span>
            </div>
          </div>
        )}
   

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Pro Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Themes:</strong> Quick and reliable - perfect for matching your party style</li>
                <li>• <strong>AI Generator:</strong> Creates unique designs tailored to your party details</li>
                <li>• <strong>Live Preview:</strong> See your invite update instantly with real party information</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UnifiedThemeSelection