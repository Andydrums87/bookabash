import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Link, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from "react"
import InvitePreview from "./InvitePreview"

const PreviewAndActions = ({ 
  useAIGeneration,
  selectedAiOption,
  inviteData,
  selectedTheme,
  generatedImage,
  saveButtonState,
  saveInviteToPartyPlan,
  copyShareableLink,
  generateShareableLink,
  hasUnsavedChanges,
  themes,
  onLayoutSave
}) => {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  const renderPreview = () => {
    if (selectedAiOption) {
      return (
        <div className="flex justify-center">
          <div className="relative w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
            <img
              src={selectedAiOption.imageUrl || "/placeholder.svg"}
              alt="Selected AI Generated Invite"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
              AI Option {selectedAiOption.index}
            </div>
          </div>
        </div>
      )
    } else if (selectedTheme && inviteData?.childName) {
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4]">
            <InvitePreview
              themeKey={selectedTheme}
              inviteData={inviteData}
            />
          </div>
        </div>
      )
    } else if (selectedTheme) {
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-yellow-300 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="text-center text-yellow-700 p-4">
              <div className="text-3xl sm:text-4xl mb-4">⚠️</div>
              <div className="font-bold text-base sm:text-lg">Missing Party Details</div>
              <div className="text-xs sm:text-sm">Go back to Step 1 to fill in party information</div>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px] aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center text-gray-500 p-4">
              <div className="text-3xl sm:text-4xl mb-4">🎨</div>
              <div className="font-bold text-base sm:text-lg">Select a Theme</div>
              <div className="text-xs sm:text-sm">Choose a theme above to see your invite preview</div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Collapsible Preview */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          className="w-full mb-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
        >
          {isPreviewExpanded ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {isPreviewExpanded ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {/* Preview Card */}
      <Card className={`shadow-xl border-0 bg-white/80 backdrop-blur-sm ${
        !isPreviewExpanded ? 'hidden lg:block' : ''
      }`}>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Live Preview
          </h2>
          
          <div className="mb-4 sm:mb-6" data-invite-preview>
            {renderPreview()}
          </div>

          {/* Action Buttons - Stacked on mobile */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                saveInviteToPartyPlan()
                if (!generateShareableLink) generateShareableLink()
              }}
              className={`w-full font-bold py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base ${saveButtonState.className}`}
              disabled={saveButtonState.disabled}
            >
              {saveButtonState.icon}
              {saveButtonState.text}
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 bg-transparent text-sm sm:text-base"
              onClick={copyShareableLink}
              disabled={!generatedImage}
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Info Card - More compact on mobile */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3">
            {useAIGeneration
              ? "AI Generated Invite"
              : `Current Theme: ${themes[selectedTheme]?.name || selectedTheme}`}
          </h3>
          
          {useAIGeneration ? (
            <div className="relative w-full h-16 sm:h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))]">
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                🤖 AI Generated
              </div>
            </div>
          ) : (
            <div className="relative w-full h-16 sm:h-24 mb-4 rounded-lg overflow-hidden">
              <img
                src={themes[selectedTheme]?.backgroundUrl || "/placeholder.jpg"}
                alt={themes[selectedTheme]?.name || selectedTheme}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Your invite will be automatically saved and can be used on your dashboard.
          </div>
          
          {hasUnsavedChanges && (
            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-700">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-xs font-bold">You have unsaved changes. Don't forget to save!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PreviewAndActions
