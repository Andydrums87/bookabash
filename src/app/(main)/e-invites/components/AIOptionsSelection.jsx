// components/MobileAIOptionsSelection.js
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, Wand2, Eye, ZoomIn, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const MobileAIOptionsSelection = ({ 
  showAiOptions, 
  aiOptions, 
  selectedAiOption, 
  selectAiOption, 
  generateAIOptions,
  isGeneratingAI
}) => {
  const [previewOption, setPreviewOption] = useState(null)
  const optionsRef = useRef(null)

  // Auto-scroll to options when they become available
  useEffect(() => {
    if (showAiOptions && aiOptions.length > 0 && !isGeneratingAI && optionsRef.current) {
      setTimeout(() => {
        optionsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 300) // Small delay to ensure content is rendered
    }
  }, [showAiOptions, aiOptions.length, isGeneratingAI])

  // Don't show if no options available
  if (!showAiOptions || aiOptions.length === 0) return null

  const handleImageClick = (option) => {
    setPreviewOption(option)
  }

  const handleSelectOption = (option) => {
    selectAiOption(option)
  }

  const handlePreviewClose = () => {
    setPreviewOption(null)
  }

  return (
    <>
      <Card ref={optionsRef} className="shadow-xl border-0 bg-gradient-to-br from-[hsl(var(--primary-50))] via-white to-[hsl(var(--primary-100))]">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Wand2 className="w-5 h-5 text-[hsl(var(--primary-600))]" />
              Snappy's Magic Creations
            </h2>
            <p className="text-sm text-gray-600">
              Tap image to preview • Use select button to choose
            </p>
          </div>

          {/* Column layout - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 mb-4">
            {aiOptions.map((option) => (
              <div key={option.id}>
                <div className="w-full">
                  {/* Image - click to preview */}
                  <button
                    onClick={() => handleImageClick(option)}
                    className="relative w-full aspect-[3/4] rounded-xl border-2 border-gray-200 hover:border-[hsl(var(--primary-300))] shadow-lg active:scale-95 transition-all duration-300 overflow-hidden mb-2"
                  >
                    <img
                      src={option.imageUrl || "/placeholder.png"}
                      alt={`Creation ${option.index}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Creation number */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                      #{option.index}
                    </div>

                    {/* Preview hint */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1 rounded shadow-lg">
                      <Eye className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Select button */}
                  <Button
                    onClick={() => handleSelectOption(option)}
                    className={`w-full py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                      selectedAiOption?.id === option.id
                        ? "bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] text-white shadow-lg"
                        : "bg-white border-2 border-[hsl(var(--primary-200))] text-[hsl(var(--primary-700))] hover:bg-[hsl(var(--primary-50))] hover:border-[hsl(var(--primary-300))]"
                    }`}
                  >
                    {selectedAiOption?.id === option.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" />
                        Selected
                      </div>
                    ) : (
                      "Select"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Selection feedback */}
          {selectedAiOption && (
            <div className="text-center p-3 bg-gradient-to-r from-[hsl(var(--primary-50))] to-[hsl(var(--primary-100))] rounded-lg mb-4 border border-[hsl(var(--primary-200))]">
              <div className="text-sm font-bold text-[hsl(var(--primary-700))]">
                ✨ Perfect! Creation #{selectedAiOption.index} is ready!
              </div>
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