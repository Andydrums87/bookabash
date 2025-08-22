// components/MobileAIOptionsSelection.js
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, Wand2, Eye, ZoomIn, X } from "lucide-react"
import { useState } from "react"

const MobileAIOptionsSelection = ({ 
  showAiOptions, 
  aiOptions, 
  selectedAiOption, 
  selectAiOption, 
  generateAIOptions,
  isGeneratingAI
}) => {
  const [previewOption, setPreviewOption] = useState(null)

  // Don't show if no options available
  if (!showAiOptions || aiOptions.length === 0) return null

  const handleOptionSelect = (option) => {
    // If clicking the already selected option, open preview
    if (selectedAiOption?.id === option.id) {
      setPreviewOption(option)
    } else {
      // Otherwise select the new option
      selectAiOption(option)
    }
  }

  const handlePreviewOpen = (option) => {
    setPreviewOption(option)
  }

  const handlePreviewClose = () => {
    setPreviewOption(null)
  }

  return (
    <>
      <Card className="shadow-xl border-0 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Wand2 className="w-5 h-5 text-[hsl(var(--primary-600))]" />
              Snappy's Magic Creations
            </h2>
            <p className="text-sm text-gray-600">
              Tap to select • Tap selected to view full size
            </p>
          </div>

          {/* Mobile: Horizontal scrollable options */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {aiOptions.map((option) => (
              <div key={option.id} className="flex-shrink-0">
                <button
                  onClick={() => handleOptionSelect(option)}
                  className={`relative w-32 h-40 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                    selectedAiOption?.id === option.id
                      ? "border-[hsl(var(--primary-500))] ring-2 ring-[hsl(var(--primary-200))] shadow-xl scale-105"
                      : "border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-lg active:scale-95"
                  }`}
                >
                  <img
                    src={option.imageUrl || "/placeholder.png"}
                    alt={`Creation ${option.index}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection indicator */}
                  {selectedAiOption?.id === option.id && (
                    <div className="absolute top-2 right-2 bg-[hsl(var(--primary-600))] text-white p-1.5 rounded-full shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  {/* Creation number */}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                    #{option.index}
                  </div>

                  {/* Zoom indicator for selected option */}
                  {selectedAiOption?.id === option.id && (
                    <div className="absolute bottom-2 right-2 bg-[hsl(var(--primary-600))] text-white p-1 rounded shadow-lg">
                      <ZoomIn className="w-3 h-3" />
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Selection feedback with preview hint */}
          {selectedAiOption && (
            <div className="text-center p-3 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-lg mb-4 border border-[hsl(var(--primary-200))]">
              <div className="text-sm font-bold text-[hsl(var(--primary-700))] mb-1">
                ✨ Perfect! Creation #{selectedAiOption.index} is ready!
              </div>
              <button
                onClick={() => handlePreviewOpen(selectedAiOption)}
                className="text-xs text-[hsl(var(--primary-600))] underline font-medium flex items-center justify-center gap-1 mx-auto mt-1"
              >
                <ZoomIn className="w-3 h-3" />
                Tap to view full size
              </button>
            </div>
          )}

          {/* Generate more button */}
          <Button
            onClick={generateAIOptions}
            disabled={isGeneratingAI}
            className="w-full py-3 text-base font-bold rounded-xl bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] hover:from-[hsl(var(--primary-500))] hover:to-[hsl(var(--primary-600))] text-white"
          >
            {isGeneratingAI ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating More Magic...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span>Get 5 More Creations!</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Full-screen preview modal */}
      {previewOption && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handlePreviewClose}
        >
          <div className="relative max-w-sm w-full">
            {/* Close button */}
            <button
              onClick={handlePreviewClose}
              className="absolute -top-12 right-0 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full shadow-lg z-10 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Preview image */}
            <div className="relative">
              <img
                src={previewOption.imageUrl}
                alt={`Preview Creation ${previewOption.index}`}
                className="w-full h-auto rounded-xl shadow-2xl"
              />
              
           
            </div>
            
            {/* Tap hint */}
            <div className="text-center mt-4 text-white/70 text-sm">
              Tap anywhere to close
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileAIOptionsSelection